"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendEmailWebhook = void 0;
const functions = require("firebase-functions");
const resend_1 = require("resend");
const svix_1 = require("svix");
// Environment variables/secrets handling
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const resend = new resend_1.Resend(RESEND_API_KEY);
const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
async function saveToHasura(object) {
  if (!HASURA_ENDPOINT || !HASURA_ADMIN_SECRET) {
    console.warn("Hasura endpoint or admin secret missing, skipping Hasura sync");
    return;
  }
  try {
    const mutation = `
      mutation UpsertEmail($object: emails_insert_input!) {
        insert_emails_one(
          object: $object,
          on_conflict: { constraint: emails_pkey, update_columns: [from, to, subject, message, ai_response, status, processed_at] }
        ) {
          id
          status
        }
      }
    `;
    const res = await fetch(HASURA_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query: mutation, variables: { object } }),
    });
    const json = await res.json();
    console.log("Hasura upsert result:", JSON.stringify(json));
  } catch (err) {
    console.error("Hasura save error:", err);
  }
}
const systemInstruction = `You are the AI customer support assistant for Agatike.
Your job is to respond to customer emails professionally, clearly, and concisely.
Rules:
- Answer the customer's question directly and helpfully — do NOT just acknowledge receipt.
- Be friendly and professional.
- Do not invent information you don't have.
- If the customer wants to talk to a human agent, let them know that a support agent will follow up with them.
- If the information is unavailable, clearly say that you don't have that information.
- Do not claim that you performed an action unless you actually did.
- Keep the response reasonably short (2-4 sentences is ideal).
- Do NOT just say "we received your email" — actually respond to the content of the message.
- Do not include a subject line because the application will handle the email subject.`;
// Call Groq API - ultra-fast, reliable, free tier
async function callGroq(userMessage) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userMessage },
    ],
    max_tokens: 512,
    temperature: 0.7,
  };
  console.log("Calling Groq API...");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  console.log("Groq API response status:", response.status);
  if (!response.ok) {
    throw new Error(`Groq API error ${response.status}: ${JSON.stringify(json?.error)}`);
  }
  const text = json?.choices?.[0]?.message?.content ?? "";
  if (!text) {
    throw new Error(
      `Groq returned no content. Status: ${response.status}, body: ${JSON.stringify(json)}`,
    );
  }
  return text;
}
exports.resendEmailWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  try {
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];
    if (!svix_id || !svix_timestamp || !svix_signature) {
      res.status(400).send("Missing Svix Headers");
      return;
    }
    const webhook = new svix_1.Webhook(RESEND_WEBHOOK_SECRET);
    let payload;
    try {
      payload = webhook.verify(req.rawBody.toString("utf8"), {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook signature verification failed", err);
      res.status(400).send("Invalid signature");
      return;
    }
    if (payload.type !== "email.received") {
      res.status(200).send("Ignored event type");
      return;
    }
    const emailId = payload.data.email_id;
    const senderEmail = payload.data.from;
    const recipientEmail = payload.data.to[0];
    const subject = payload.data.subject || "No Subject";
    // Write initial processing record to Hasura
    await saveToHasura({
      id: emailId,
      resend_email_id: emailId,
      from: senderEmail,
      to: recipientEmail,
      subject: subject,
      status: "processing",
    });
    // 1. Fetch the full email body from Resend's inbound API
    let textBody = "No body";
    try {
      console.log("Fetching email body for:", emailId);
      const emailRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      const emailData = await emailRes.json();
      console.log("Resend inbound fetch status:", emailRes.status);
      textBody = emailData.text || emailData.html || "No body";
    } catch (e) {
      console.error("Failed to fetch email body:", e);
    }
    // Update with full message body in Hasura
    await saveToHasura({ id: emailId, message: textBody });
    // 2. Generate AI response via Groq
    let aiResponseText = "";
    try {
      aiResponseText = await callGroq(`Subject: ${subject}\n\nMessage:\n${textBody}`);
      console.log("Groq AI response received, length:", aiResponseText.length);
    } catch (error) {
      console.error("AI Generation error:", error);
      await saveToHasura({ id: emailId, status: "failed" });
      res.status(500).send("AI failed");
      return;
    }
    // 3. Send AI reply via Resend
    const { error: sendError } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: senderEmail,
      subject: `Re: ${subject}`,
      text: aiResponseText,
    });
    if (sendError) {
      console.error("Resend send error:", sendError);
      await saveToHasura({ id: emailId, status: "failed" });
      res.status(500).send("Failed to send reply");
      return;
    }
    // 4. Mark as replied in Hasura
    await saveToHasura({
      id: emailId,
      message: textBody,
      ai_response: aiResponseText,
      status: "replied",
      processed_at: new Date().toISOString(),
    });
    res.status(200).send("OK");
  } catch (error) {
    console.error("Unhandled error:", error);
    res.status(500).send("Internal Server Error");
  }
});
//# sourceMappingURL=index.js.map
