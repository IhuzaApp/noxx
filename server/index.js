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

// Raw body for webhook; JSON for /send-reply, /templates, /flows
app.use((req, res, next) => {
  if (req.path === "/send-reply" || req.path.startsWith("/templates") || req.path.startsWith("/flows")) return express.json()(req, res, next);
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

function getSystemInstruction(recipientEmail, aiFocusArea = "", aiLanguage = "auto", knowledgeLink = "") {
  const companyName = getCompanyName(recipientEmail);
  let focusRule = "";
  if (aiFocusArea && aiFocusArea.trim()) {
    focusRule = `\n- Flow Instructions & Focus: ${aiFocusArea.trim()}`;
  }
  let langRule = "";
  if (aiLanguage && aiLanguage !== "auto") {
    const langNames = {
      en: "English",
      fr: "French (Français)",
      sw: "Swahili (Kiswahili)",
      rw: "Kinyarwanda",
      es: "Spanish (Español)",
      de: "German (Deutsch)",
      ar: "Arabic (العربية)",
    };
    const targetLang = langNames[aiLanguage] || aiLanguage;
    langRule = `\n- Language Policy: You MUST respond in ${targetLang}.`;
  }
  let kbRule = "";
  if (knowledgeLink && knowledgeLink.trim()) {
    kbRule = `\n- Knowledge Base / Documentation Link: Refer to documentation at ${knowledgeLink.trim()} when providing guidance.`;
  }
  return `You are the AI assistant for ${companyName}.
Your job is to respond to customer emails professionally, clearly, and warmly.
Rules:
- Represent ${companyName} — do NOT mention any internal platform names under any circumstances.${focusRule}${langRule}${kbRule}
- Answer the customer's question directly and helpfully.
- Be friendly, professional, and concise (2-4 sentences).
- If the customer asks to speak with a human or live agent, let them know that an agent will follow up with them shortly.
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

async function callGroq(userMessage, recipientEmail = "", aiFocusArea = "", aiLanguage = "auto", knowledgeLink = "") {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: getSystemInstruction(recipientEmail, aiFocusArea, aiLanguage, knowledgeLink) },
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

    // 5. Query active flows from Hasura DB to match dynamic rules (target email, skip AI, subject filters, prompt instructions)
    let matchedRule = null;
    try {
      const flowsRes = await hasuraQuery(`
        query GetActiveFlows {
          flows(where: { status: { _eq: "active" } }) {
            id
            name
            trigger
            nodes
            simulation
          }
        }
      `);
      const activeFlows = flowsRes?.data?.flows || [];
      const recip = (recipientEmail || "").trim().toLowerCase();
      const currentSubj = (cleanSubj || "").toLowerCase();

      for (const f of activeFlows) {
        if (!f.nodes || !Array.isArray(f.nodes)) continue;

        let flowTargetEmail = "";
        let flowSubjectFilter = "";
        let flowAiMode = "";
        let flowAiFocusArea = "";
        let flowAiLanguage = "auto";
        let flowKnowledgeLink = "";

        // Aggregate settings across all nodes in this flow
        for (const node of f.nodes) {
          const d = node.data || {};
          if (d.targetEmail) flowTargetEmail = d.targetEmail;
          if (!flowTargetEmail && d.detail && typeof d.detail === "string" && d.detail.toLowerCase().includes("@")) {
            const match = d.detail.match(/[\w.-]+@[\w.-]+/);
            if (match) flowTargetEmail = match[0];
          }
          if (d.subjectFilter) flowSubjectFilter = d.subjectFilter;
          if (d.aiMode) flowAiMode = d.aiMode;
          if (d.aiFocusArea) flowAiFocusArea = d.aiFocusArea;
          if (d.aiLanguage) flowAiLanguage = d.aiLanguage;
          if (d.knowledgeLink) flowKnowledgeLink = d.knowledgeLink;
        }

        // Check resources associated with this flow
        const flowResources = f.simulation?.resources || f.resources || [];
        let resourceMatch = false;
        if (Array.isArray(flowResources)) {
          resourceMatch = flowResources.some((r) => {
            const val = (r?.value || "").trim().toLowerCase();
            return val && (recip.includes(val) || val.includes(recip));
          });
        }

        const target = (flowTargetEmail || "").trim().toLowerCase();
        const subjFilter = (flowSubjectFilter || "").trim().toLowerCase();

        const emailMatches = (target && (target === recip || target === "*" || recip.includes(target) || target.includes(recip))) || resourceMatch;
        const subjectMatches = subjFilter && currentSubj.includes(subjFilter);

        if (emailMatches || subjectMatches) {
          matchedRule = {
            flowName: f.name,
            nodeData: {
              targetEmail: flowTargetEmail || recip,
              subjectFilter: flowSubjectFilter,
              aiMode: flowAiMode,
              aiFocusArea: flowAiFocusArea,
              aiLanguage: flowAiLanguage,
              knowledgeLink: flowKnowledgeLink,
            },
          };
          break; // Exact target match found!
        }

        // Keep as fallback if flow has general AI rules
        if (!matchedRule && (flowAiFocusArea || flowAiLanguage !== "auto" || flowKnowledgeLink || flowAiMode)) {
          matchedRule = {
            flowName: f.name,
            nodeData: {
              targetEmail: flowTargetEmail,
              subjectFilter: flowSubjectFilter,
              aiMode: flowAiMode,
              aiFocusArea: flowAiFocusArea,
              aiLanguage: flowAiLanguage,
              knowledgeLink: flowKnowledgeLink,
            },
          };
        }
      }
    } catch (err) {
      console.error("Error querying active flow rules:", err);
    }

    if (matchedRule) {
      console.log(`🎯 Matched active flow rule "${matchedRule.flowName}" for recipient ${recipientEmail}`);
      const ruleData = matchedRule.nodeData;

      if (ruleData.aiMode === "skip_ai_ticket") {
        console.log(`⚡ Flow rule [Skip AI & Create Ticket Directly] matched for ${recipientEmail}. Re-routing to human agent.`);
        await updateTicketStatus(ticketId, "open");
        await updateEmailStatus(emailId, "human-handling", { message: textBody });
        return;
      }
    }

    // 6. Build prompt context including previous thread history
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

    // 7. Generate AI response via Groq (passing custom aiFocusArea, aiLanguage, and knowledgeLink if configured in flow)
    const customFocusArea = matchedRule?.nodeData?.aiFocusArea || "";
    const customAiLanguage = matchedRule?.nodeData?.aiLanguage || "auto";
    const customKnowledgeLink = matchedRule?.nodeData?.knowledgeLink || "";
    let aiResponseText = "";
    try {
      aiResponseText = await callGroq(contextPrompt, recipientEmail, customFocusArea, customAiLanguage, customKnowledgeLink);
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

// ─── Templates API (Hasura Postgres DB) ───────────────────────────────────────

app.get("/templates", async (_req, res) => {
  try {
    const query = `
      query GetTemplates {
        templates(order_by: { created_at: desc }) {
          id
          name
          channel
          body
          description
          steps
          uses
          type
          created_at
        }
      }
    `;
    const result = await hasuraQuery(query);
    const all = result?.data?.templates ?? [];
    const single = all.filter((t) => t.type !== "omnichannel");
    const omni = all.filter((t) => t.type === "omnichannel");
    res.json({ templates: single, omnichannelTemplates: omni });
  } catch (err) {
    console.error("GET /templates error:", err);
    res.status(500).json({ error: "Failed to fetch templates from database" });
  }
});

app.post("/templates", async (req, res) => {
  const { name, channel, body, description, steps, type } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ error: "Template name is required" });
  }

  const id = `t_${Date.now()}`;
  const isOmni = type === "omnichannel" || (steps && Array.isArray(steps) && steps.length > 0);

  const object = {
    id,
    name: name.trim(),
    channel: channel || "email",
    body: body?.trim() || "",
    description: description?.trim() || "",
    steps: isOmni ? steps || [{ channel: channel || "whatsapp", label: "Primary Step", kind: "primary" }] : [],
    uses: 0,
    type: isOmni ? "omnichannel" : "single",
  };

  try {
    const mutation = `
      mutation InsertTemplate($object: templates_insert_input!) {
        insert_templates_one(object: $object) {
          id
          name
          channel
          body
          description
          steps
          uses
          type
          created_at
        }
      }
    `;
    const result = await hasuraQuery(mutation, { object });
    const createdItem = result?.data?.insert_templates_one;
    console.log(`✅ Saved template "${name}" to Hasura Postgres database`);
    return res.json({ success: true, item: createdItem, type: object.type });
  } catch (err) {
    console.error("POST /templates error:", err);
    return res.status(500).json({ error: "Failed to save template to database" });
  }
});

app.delete("/templates/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const mutation = `
      mutation DeleteTemplate($id: String!) {
        delete_templates_by_pk(id: $id) {
          id
        }
      }
    `;
    await hasuraQuery(mutation, { id });
    console.log(`🗑️ Deleted template ${id} from Hasura Postgres database`);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /templates error:", err);
    res.status(500).json({ error: "Failed to delete template from database" });
  }
});

// ─── Flows API (Hasura Postgres DB) ───────────────────────────────────────────

let hasSeededInitialFlows = false;

const DEFAULT_SEED_FLOWS = [
  {
    id: "ot4",
    name: "AI support with human handoff",
    description: "AI replies first; if user is unsatisfied, escalate to support over WhatsApp.",
    channels: ["ai", "whatsapp"],
    trigger: "Webhook Event",
    status: "active",
    nodes: [
      { id: "1", type: "flow", position: { x: 320, y: 20 }, data: { kind: "trigger", label: "Customer Message Received", detail: "Target: support@agatike.com", targetEmail: "support@agatike.com" } },
      { id: "2", type: "flow", position: { x: 320, y: 180 }, data: { kind: "agent", label: "AI Support Agent", detail: "Technical Support FAQs", aiMode: "auto_reply", aiFocusArea: "Answer technical support FAQs concisely. If customer requests human help or is frustrated, escalate immediately." } },
      { id: "3", type: "flow", position: { x: 320, y: 360 }, data: { kind: "condition", label: "Escalation requested?", detail: "Check customer sentiment / request", conditionType: "If user requested human agent", yesLabel: "Escalate to Human Agent", noLabel: "AI Self-Service Resolved" } },
      { id: "4", type: "flow", position: { x: 60, y: 540 }, data: { kind: "delay", label: "Resolved by AI", detail: "No human action needed" } },
      { id: "5", type: "flow", position: { x: 580, y: 540 }, data: { kind: "whatsapp", label: "Escalate to Agent", detail: "Notify live support team", ticketDepartment: "Support", ticketPriority: "high" } },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 2 } },
      { id: "e2-3", source: "2", target: "3", type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 2 } },
      { id: "e3-4", source: "3", target: "4", type: "smoothstep", label: "No", style: { stroke: "var(--destructive)", strokeWidth: 2 } },
      { id: "e3-5", source: "3", target: "5", type: "smoothstep", label: "Yes", style: { stroke: "var(--success)", strokeWidth: 2 } },
    ],
    simulation: {
      resources: [
        { id: "rs_ot4_1", kind: "email", label: "Support Inbox", value: "support@agatike.com", notes: "Primary inbound support address" },
        { id: "rs_ot4_2", kind: "phone", label: "WhatsApp Hotline", value: "+1 415 555 0199", notes: "Agent handover mobile line" }
      ]
    }
  },
  {
    id: "fl_1a2b3c",
    name: "API Downtime Alert",
    description: "Notifies the engineering team via SMS and Voice when Datadog detects an API outage.",
    channels: ["sms", "voice"],
    trigger: "Webhook",
    status: "active",
    nodes: [],
    edges: [],
    simulation: {
      resources: [
        { id: "rs_1a", kind: "phone", label: "On-call Pager", value: "+1 415 555 9111" },
        { id: "rs_1b", kind: "link", label: "Status Page", value: "https://status.acmetech.io" },
      ]
    }
  },
  {
    id: "fl_4d5e6f",
    name: "New Enterprise Lead",
    description: "AI qualifies new enterprise leads from website form and emails sales team.",
    channels: ["ai", "email"],
    trigger: "Form submission",
    status: "active",
    nodes: [],
    edges: [],
    simulation: {
      resources: [
        { id: "rs_2a", kind: "folder", label: "Lead enrichment data", value: "https://s3.aws.com/acme-leads" },
      ]
    }
  },
];

app.get("/flows", async (_req, res) => {
  try {
    const query = `
      query GetFlows {
        flows(order_by: { updated_at: desc }) {
          id
          name
          description
          channels
          trigger
          status
          nodes
          edges
          simulation
          created_at
          updated_at
        }
      }
    `;
    let result = await hasuraQuery(query);
    let rawFlows = result?.data?.flows ?? [];

    if (rawFlows.length === 0 && !hasSeededInitialFlows) {
      hasSeededInitialFlows = true;
      console.log("🌱 Database flows empty. Seeding initial starter flows into Hasura...");
      for (const f of DEFAULT_SEED_FLOWS) {
        await hasuraQuery(`
          mutation SeedFlow($object: flows_insert_input!) {
            insert_flows_one(object: $object, on_conflict: { constraint: flows_pkey, update_columns: [name, description, simulation] }) { id }
          }
        `, { object: f });
      }
      result = await hasuraQuery(query);
      rawFlows = result?.data?.flows ?? [];
    }

    const flows = rawFlows.map((f) => ({
      ...f,
      resources: f.simulation?.resources || f.resources || [],
    }));

    res.json({ flows });
  } catch (err) {
    console.error("GET /flows error:", err);
    res.status(500).json({ error: "Failed to fetch flows from database" });
  }
});

app.get("/flows/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      query GetFlow($id: String!) {
        flows_by_pk(id: $id) {
          id
          name
          description
          channels
          trigger
          status
          nodes
          edges
          simulation
          created_at
          updated_at
        }
      }
    `;
    const result = await hasuraQuery(query, { id });
    const rawFlow = result?.data?.flows_by_pk;
    if (!rawFlow) return res.status(404).json({ error: "Flow not found" });

    const flow = {
      ...rawFlow,
      resources: rawFlow.simulation?.resources || rawFlow.resources || [],
    };
    res.json({ flow });
  } catch (err) {
    console.error("GET /flows/:id error:", err);
    res.status(500).json({ error: "Failed to fetch flow from database" });
  }
});

app.post("/flows", async (req, res) => {
  const { id, name, description, channels, trigger, status, nodes, edges, resources, simulation } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ error: "Flow name is required" });
  }

  const flowId = id || `fl_${Date.now()}`;
  const sim = { ...(simulation || {}), resources: resources || [] };

  const object = {
    id: flowId,
    name: name.trim(),
    description: description?.trim() || "",
    channels: channels || ["whatsapp"],
    trigger: trigger || "Webhook",
    status: status || "active",
    nodes: nodes || [],
    edges: edges || [],
    simulation: sim,
  };

  try {
    const mutation = `
      mutation UpsertFlow($object: flows_insert_input!) {
        insert_flows_one(
          object: $object,
          on_conflict: { constraint: flows_pkey, update_columns: [name, description, channels, trigger, status, nodes, edges, simulation, updated_at] }
        ) {
          id
          name
          description
          channels
          trigger
          status
          nodes
          edges
          simulation
          updated_at
        }
      }
    `;
    const result = await hasuraQuery(mutation, { object });
    const upsertedFlow = result?.data?.insert_flows_one;
    if (upsertedFlow) {
      upsertedFlow.resources = upsertedFlow.simulation?.resources || [];
    }
    console.log(`✅ Flow "${object.name}" (${flowId}) saved to Hasura Postgres DB`);
    return res.json({ success: true, flow: upsertedFlow });
  } catch (err) {
    console.error("POST /flows error:", err);
    return res.status(500).json({ error: "Failed to save flow to database" });
  }
});

app.delete("/flows/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const mutation = `
      mutation DeleteFlow($id: String!) {
        delete_flows_by_pk(id: $id) {
          id
        }
      }
    `;
    await hasuraQuery(mutation, { id });
    console.log(`🗑️ Deleted flow ${id} from Hasura Postgres database`);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /flows error:", err);
    res.status(500).json({ error: "Failed to delete flow from database" });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Noxx webhook server running on port ${PORT}`);
  console.log(`   Health  : http://localhost:${PORT}/health`);
  console.log(`   Webhook : http://localhost:${PORT}/webhook`);
  console.log(`   Smee    : https://smee.io/NStgB6a1LP1Bz7x\n`);
});
