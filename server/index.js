const express = require("express");
const { Webhook } = require("svix");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Raw body for webhook; JSON for /send-reply and /templates
app.use((req, res, next) => {
  if (req.path === "/send-reply" || req.path.startsWith("/templates")) return express.json()(req, res, next);
  express.raw({ type: "*/*" })(req, res, next);
});

const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

function getCompanyName(recipientEmail) {
  if (recipientEmail) {
    const domain = recipientEmail.split("@")[1] || "";
    const name = domain.split(".")[0];
    if (name && !["gmail", "yahoo", "hotmail", "outlook", "icloud"].includes(name.toLowerCase())) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "";
  if (fromEmail.includes("<")) {
    const displayName = fromEmail.split("<")[0].replace(/support/i, "").trim();
    if (displayName) return displayName;
  }
  if (fromEmail.includes("@")) {
    const domain = fromEmail.split("@")[1]?.replace(">", "") || "";
    const name = domain.split(".")[0];
    if (name && !["gmail", "yahoo", "hotmail", "outlook", "icloud"].includes(name.toLowerCase())) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  return "Support";
}

function getSystemInstruction(recipientEmail) {
  const companyName = getCompanyName(recipientEmail);
  return `You are the AI customer support assistant for ${companyName}.
Your job is to respond to customer emails professionally, clearly, and warmly.
Rules:
- Represent ${companyName} — do NOT mention any internal platform names under any circumstances.
- Answer the customer's question directly and helpfully.
- Be friendly, professional, and concise (2-4 sentences).
- If the customer asks to speak with a human or live agent, let them know that a support agent will follow up with them shortly.
- Do not invent information you do not have.
- Do NOT include a subject line in your output.`;
}

// ─── Hasura helpers ───────────────────────────────────────────────────────────

async function hasuraQuery(query, variables = {}) {
  const res = await fetch(HASURA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) console.error("Hasura error:", JSON.stringify(json.errors));
  return json;
}

async function saveEmail(object) {
  const mutation = `
    mutation UpsertEmail($object: emails_insert_input!) {
      insert_emails_one(
        object: $object,
        on_conflict: { constraint: emails_pkey, update_columns: [from, to, subject, message, ai_response, status, processed_at] }
      ) { id status }
    }
  `;
  const result = await hasuraQuery(mutation, { object });
  console.log("Email upsert:", JSON.stringify(result?.data));
}

async function updateEmailStatus(id, status, extraFields = {}) {
  const setObj = { status, processed_at: new Date().toISOString(), ...extraFields };
  const mutation = `
    mutation UpdateEmailStatus($id: String!, $_set: emails_set_input!) {
      update_emails_by_pk(pk_columns: { id: $id }, _set: $_set) { id status }
    }
  `;
  await hasuraQuery(mutation, { id, _set: setObj });
}

async function upsertTicket(ticket) {
  const mutation = `
    mutation UpsertTicket($object: tickets_insert_input!) {
      insert_tickets_one(
        object: $object,
        on_conflict: { constraint: tickets_pkey, update_columns: [subject, contact_name, contact_email, status, updated_at] }
      ) { id status }
    }
  `;
  const result = await hasuraQuery(mutation, { object: ticket });
  console.log("Ticket upsert:", JSON.stringify(result?.data));
  return result?.data?.insert_tickets_one;
}

async function addConversationMessage(ticket_id, sender, message) {
  const mutation = `
    mutation AddConversation($object: conversations_insert_input!) {
      insert_conversations_one(object: $object) { id }
    }
  `;
  await hasuraQuery(mutation, { object: { ticket_id, sender, message } });
}

async function updateTicketStatus(ticketId, status) {
  const mutation = `
    mutation UpdateTicketStatus($id: String!, $status: String!) {
      update_tickets_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: "now()" }) { id status }
    }
  `;
  await hasuraQuery(mutation, { id: ticketId, status });
}

function normalizeSubject(subject) {
  if (!subject) return "";
  return subject.replace(/^(re|fwd|fw):\s*/i, "").trim().toLowerCase();
}

async function findExistingTicket(senderEmail, subject) {
  const cleanSubject = normalizeSubject(subject);
  if (!cleanSubject || !senderEmail) return null;

  const query = `
    query FindTicketsByCustomer($email: String!) {
      tickets(
        where: { contact_email: { _eq: $email } },
        order_by: { updated_at: desc },
        limit: 10
      ) {
        id
        subject
        status
        contact_name
        contact_email
        conversations(order_by: { created_at: asc }) {
          id
          sender
          message
          created_at
        }
      }
    }
  `;
  const res = await hasuraQuery(query, { email: senderEmail });
  const tickets = res?.data?.tickets ?? [];
  return tickets.find((t) => normalizeSubject(t.subject) === cleanSubject) || null;
}

// ─── Groq helper ─────────────────────────────────────────────────────────────

async function callGroq(userMessage, recipientEmail = "") {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: getSystemInstruction(recipientEmail) },
        { role: "user", content: userMessage },
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  const json = await response.json();
  console.log("Groq status:", response.status);
  if (!response.ok) throw new Error(`Groq error ${response.status}: ${JSON.stringify(json?.error)}`);

  const text = json?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Groq returned empty content");
  return text;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.post("/webhook", async (req, res) => {
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).send("Missing Svix Headers");
  }

  let payload;
  try {
    const wh = new Webhook(RESEND_WEBHOOK_SECRET);
    payload = wh.verify(req.body.toString("utf8"), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  if (payload.type !== "email.received") {
    return res.status(200).send("Ignored");
  }

  // Respond to Resend immediately so it doesn't retry
  res.status(200).send("OK");

  // Process asynchronously
  (async () => {
    const emailId = payload.data.email_id;
    const senderEmail = payload.data.from;
    const recipientEmail = payload.data.to?.[0];
    const subject = payload.data.subject || "No Subject";
    // Derive a display name from the email address
    const contactName = senderEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    console.log(`\n📧 Received email ${emailId} from ${senderEmail} — "${subject}"`);

    // 1. Save initial email record
    await saveEmail({
      id: emailId,
      resend_email_id: emailId,
      from: senderEmail,
      to: recipientEmail,
      subject,
      status: "processing",
    });

    // 2. Check for existing ticket for this sender + subject thread
    const cleanSubj = subject.replace(/^(re|fwd|fw):\s*/i, "").trim() || subject;
    const existingTicket = await findExistingTicket(senderEmail, subject);

    // Check if the ticket is already being handled by a human agent
    const isHumanHandled = existingTicket && (
      existingTicket.status === "open" ||
      existingTicket.status === "pending" ||
      existingTicket.status === "closed" ||
      (existingTicket.conversations && existingTicket.conversations.some((m) => m.sender === "agent"))
    );

    let ticketId;
    let threadHistory = [];

    if (existingTicket && isHumanHandled) {
      ticketId = existingTicket.id;
      console.log(`👤 Ticket ${ticketId} ("${cleanSubj}") is handled by a human agent. Skipping AI auto-reply.`);

      // Fetch full email body from Resend
      let textBody = "No body";
      try {
        const emailRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        });
        const emailData = await emailRes.json();
        textBody = emailData.text || emailData.html || "No body";
      } catch (e) {
        console.error("Failed to fetch email body:", e);
      }

      // Log customer message to existing ticket and mark ticket open for human review
      await addConversationMessage(ticketId, "customer", textBody);
      await updateEmailStatus(emailId, "human-handling", { message: textBody });
      await updateTicketStatus(ticketId, "open");
      return;
    }

    if (existingTicket) {
      ticketId = existingTicket.id;
      threadHistory = existingTicket.conversations || [];
      console.log(`📌 Reusing existing ticket ${ticketId} for thread "${cleanSubj}" from ${senderEmail}`);
      await updateTicketStatus(ticketId, "ai-handling");
    } else {
      ticketId = emailId;
      await upsertTicket({
        id: ticketId,
        email_id: emailId,
        subject: cleanSubj,
        contact_name: contactName,
        contact_email: senderEmail,
        channel: "email",
        status: "ai-handling",
        tags: ["ai-created", "email"],
      });
    }

    // 3. Fetch full email body from Resend
    let textBody = "No body";
    try {
      const emailRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      const emailData = await emailRes.json();
      console.log("Email body fetch status:", emailRes.status);
      textBody = emailData.text || emailData.html || "No body";
    } catch (e) {
      console.error("Failed to fetch email body:", e);
    }

    // 4. Log customer message as conversation entry for the ticket
    await addConversationMessage(ticketId, "customer", textBody);
    await updateEmailStatus(emailId, "processing", { message: textBody });

    // 5. Build prompt context including previous thread history
    let contextPrompt = `Subject: ${cleanSubj}\n\n`;
    if (threadHistory.length > 0) {
      contextPrompt += "Previous Conversation Thread:\n";
      threadHistory.forEach((msg) => {
        const role = msg.sender === "customer" ? "Customer" : msg.sender === "ai" ? "AI Assistant" : "Support Agent";
        contextPrompt += `[${role}]: ${msg.message}\n\n`;
      });
      contextPrompt += `New Customer Message:\n${textBody}\n\nPlease respond to the customer's latest message, taking into account the previous conversation thread.`;
    } else {
      contextPrompt += `Message:\n${textBody}`;
    }

    // 6. Generate AI response via Groq
    let aiResponseText = "";
    try {
      aiResponseText = await callGroq(contextPrompt, recipientEmail);
      console.log("AI response preview:", aiResponseText.slice(0, 120));
    } catch (error) {
      console.error("AI Generation error:", error.message);
      await updateEmailStatus(emailId, "failed");
      await updateTicketStatus(ticketId, "open");
      return;
    }

    // 7. Log AI reply as conversation entry
    await addConversationMessage(ticketId, "ai", aiResponseText);

    // 8. Send AI reply via Resend
    const { error: sendError } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [senderEmail],
      subject: `Re: ${cleanSubj}`,
      text: aiResponseText,
    });

    if (sendError) {
      console.error("Resend send error:", sendError);
      await updateEmailStatus(emailId, "failed");
      return;
    }

    // 9. Mark email + ticket as replied/active
    await updateEmailStatus(emailId, "replied", {
      message: textBody,
      ai_response: aiResponseText,
    });

    await updateTicketStatus(ticketId, "ai-handling");

    console.log(`✅ Email ${emailId} processed — ticket ${ticketId} set to ai-handling`);
  })();
});

// ─── Manual reply endpoint ───────────────────────────────────────────────────

app.post("/send-reply", async (req, res) => {
  const { ticket_id, message } = req.body || {};
  if (!ticket_id || !message?.trim()) {
    return res.status(400).json({ error: "ticket_id and message are required" });
  }

  try {
    // Fetch ticket from Hasura
    const ticketRes = await hasuraQuery(`
      query GetTicket($id: String!) {
        tickets_by_pk(id: $id) {
          id subject contact_email contact_name channel
        }
      }
    `, { id: ticket_id });

    const ticket = ticketRes?.data?.tickets_by_pk;
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    let recipient = ticket.contact_email;
    if (!recipient) {
      const emailRes = await hasuraQuery(`
        query GetEmailSender($id: String!) {
          emails_by_pk(id: $id) { from }
        }
      `, { id: ticket_id });
      recipient = emailRes?.data?.emails_by_pk?.from;
    }

    if (!recipient) {
      return res.status(400).json({ error: "No recipient email address associated with this ticket" });
    }
    const subject = ticket.subject ? `Re: ${ticket.subject}` : "Re: Support Request";

    // Send email via Resend
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [recipient],
      subject: subject,
      text: message,
    });

    if (sendError) {
      console.error("Resend error on manual reply:", sendError);
      return res.status(500).json({ error: "Failed to send email", detail: sendError });
    }

    // Log agent reply in conversations
    await addConversationMessage(ticket_id, "agent", message);

    // Update ticket status → open (human replied, may need follow-up)
    await hasuraQuery(`
      mutation UpdateTicket($id: String!) {
        update_tickets_by_pk(pk_columns: { id: $id }, _set: { status: "open", updated_at: "now()" }) { id }
      }
    `, { id: ticket_id });

    console.log(`📤 Agent replied to ticket ${ticket_id} → ${ticket.contact_email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("send-reply error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Templates API & Persistence ──────────────────────────────────────────────

const TEMPLATES_FILE = path.join(__dirname, "data", "templates.json");

const DEFAULT_TEMPLATES = {
  templates: [
    { id: "t1", name: "OTP verification", channel: "sms", body: "Your code is {{code}}. It expires in 10 minutes.", uses: 18402, type: "single" },
    { id: "t2", name: "Order shipped", channel: "email", body: "Hi {{name}}, your order {{order_id}} has shipped.", uses: 9201, type: "single" },
    { id: "t3", name: "Appointment reminder", channel: "whatsapp", body: "Reminder: your appointment is at {{time}}.", uses: 6541, type: "single" },
    { id: "t4", name: "AI summary", channel: "ai", body: "Summarize the following conversation: {{transcript}}", uses: 2103, type: "single" },
    { id: "t5", name: "Welcome email", channel: "email", body: "Welcome to {{org}}! Here's how to get started.", uses: 4820, type: "single" },
    { id: "t6", name: "Payment receipt", channel: "email", body: "Thanks {{name}} — we received your payment of {{amount}}.", uses: 7311, type: "single" },
  ],
  omnichannelTemplates: [
    {
      id: "ot1",
      name: "OTP with SMS fallback",
      description: "Send a one-time code over WhatsApp, fall back to SMS if not delivered in 30 seconds.",
      steps: [
        { channel: "whatsapp", label: "Send OTP via WhatsApp", kind: "primary" },
        { channel: "sms", label: "Fallback: Send via SMS", kind: "fallback" },
      ],
      uses: 18402,
      type: "omnichannel",
    },
    {
      id: "ot2",
      name: "Order notification (WhatsApp + Email backup)",
      description: "Notify shipping over WhatsApp; if not delivered in 5 minutes, send a richer Email backup.",
      steps: [
        { channel: "whatsapp", label: "Send shipping update", kind: "primary" },
        { channel: "email", label: "Fallback: Email with tracking link", kind: "fallback" },
      ],
      uses: 9201,
      type: "omnichannel",
    },
    {
      id: "ot3",
      name: "Appointment reminder with follow-ups",
      description: "Email reminder, then WhatsApp 1h before, SMS 15 min before if still no response.",
      steps: [
        { channel: "email", label: "Send Email reminder (24h before)", kind: "primary" },
        { channel: "whatsapp", label: "WhatsApp nudge (1h before)", kind: "primary" },
        { channel: "sms", label: "SMS reminder if no reply (15m before)", kind: "fallback" },
      ],
      uses: 6541,
      type: "omnichannel",
    },
    {
      id: "ot4",
      name: "AI support with human handoff",
      description: "AI replies first; if user is unsatisfied, escalate to support over WhatsApp.",
      steps: [
        { channel: "ai", label: "AI auto-respond", kind: "primary" },
        { channel: "whatsapp", label: "Escalate to support agent", kind: "branch" },
      ],
      uses: 2103,
      type: "omnichannel",
    },
  ],
};

function readTemplatesFromDisk() {
  try {
    const dir = path.dirname(TEMPLATES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(TEMPLATES_FILE)) {
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(DEFAULT_TEMPLATES, null, 2));
      return DEFAULT_TEMPLATES;
    }
    const raw = fs.readFileSync(TEMPLATES_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading templates from disk:", err);
    return DEFAULT_TEMPLATES;
  }
}

function writeTemplatesToDisk(data) {
  try {
    const dir = path.dirname(TEMPLATES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing templates to disk:", err);
  }
}

app.get("/templates", (_req, res) => {
  const data = readTemplatesFromDisk();
  res.json(data);
});

app.post("/templates", (req, res) => {
  const { name, channel, body, description, steps, type } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ error: "Template name is required" });
  }

  const data = readTemplatesFromDisk();
  const id = `t_${Date.now()}`;

  if (type === "omnichannel" || (steps && Array.isArray(steps) && steps.length > 0)) {
    const newOmni = {
      id,
      name: name.trim(),
      description: description?.trim() || "Custom omnichannel flow template",
      steps: steps || [{ channel: channel || "whatsapp", label: "Primary Step", kind: "primary" }],
      uses: 0,
      type: "omnichannel",
      created_at: new Date().toISOString(),
    };
    data.omnichannelTemplates.unshift(newOmni);
    writeTemplatesToDisk(data);
    console.log(`✅ Saved new omnichannel template "${newOmni.name}" to database`);
    return res.json({ success: true, item: newOmni, type: "omnichannel" });
  } else {
    const newSingle = {
      id,
      name: name.trim(),
      channel: channel || "email",
      body: body?.trim() || "",
      uses: 0,
      type: "single",
      created_at: new Date().toISOString(),
    };
    data.templates.unshift(newSingle);
    writeTemplatesToDisk(data);
    console.log(`✅ Saved new message template "${newSingle.name}" to database`);
    return res.json({ success: true, item: newSingle, type: "single" });
  }
});

app.delete("/templates/:id", (req, res) => {
  const { id } = req.params;
  const data = readTemplatesFromDisk();
  data.templates = (data.templates || []).filter((t) => t.id !== id);
  data.omnichannelTemplates = (data.omnichannelTemplates || []).filter((t) => t.id !== id);
  writeTemplatesToDisk(data);
  console.log(`🗑️ Deleted template ${id} from database`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Agatike webhook server running on port ${PORT}`);
  console.log(`   Health  : http://localhost:${PORT}/health`);
  console.log(`   Webhook : http://localhost:${PORT}/webhook`);
  console.log(`   Smee    : https://smee.io/NStgB6a1LP1Bz7x\n`);
});
