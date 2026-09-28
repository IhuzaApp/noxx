import type { Node, Edge } from "reactflow";
import type { FlowNodeData } from "@/components/flow/FlowNode";
import { MarkerType } from "reactflow";

type EdgeKind =
  "default" | "fallback" | "delivered" | "not-delivered" | "no-response" | "yes" | "no";

const edgeStyles: Record<EdgeKind, { stroke: string; label?: string; bg?: string }> = {
  default: { stroke: "var(--border)" },
  fallback: { stroke: "var(--warning)", label: "Fallback", bg: "var(--warning)" },
  delivered: { stroke: "var(--success)", label: "If Delivered", bg: "var(--success)" },
  "not-delivered": {
    stroke: "var(--destructive)",
    label: "If Not Delivered",
    bg: "var(--destructive)",
  },
  "no-response": { stroke: "var(--info)", label: "If No Response", bg: "var(--info)" },
  yes: { stroke: "var(--success)", label: "Yes", bg: "var(--success)" },
  no: { stroke: "var(--destructive)", label: "No", bg: "var(--destructive)" },
};

export function makeEdge(
  id: string,
  source: string,
  target: string,
  kind: EdgeKind,
  animated = false,
): Edge {
  const s = edgeStyles[kind];
  return {
    id,
    source,
    target,
    animated,
    type: "smoothstep",
    label: s.label,
    labelStyle: { fontSize: 10, fontWeight: 600, fill: "var(--foreground)" },
    labelBgStyle: { fill: "var(--card)", stroke: s.bg ?? s.stroke, strokeWidth: 1 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 6,
    style: { stroke: s.stroke, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: s.stroke },
    data: { kind },
  };
}

export type FlowTemplate = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  simulation: {
    path: string[];
    edgePath: string[];
    messages: Array<{ msg: string; kind: "info" | "ok" | "warn" }>;
  };
};

export const defaultTemplate: FlowTemplate = {
  nodes: [
    {
      id: "1",
      type: "flow",
      position: { x: 320, y: 20 },
      data: { kind: "trigger", label: "Order placed", detail: "POST /v1/events/order_placed" },
    },
    {
      id: "2",
      type: "flow",
      position: { x: 320, y: 180 },
      data: {
        kind: "whatsapp",
        label: "Send WhatsApp",
        detail: "Template: order_shipped",
        fallback: "sms",
        retryMinutes: 5,
      },
    },
    {
      id: "3",
      type: "flow",
      position: { x: 320, y: 400 },
      data: {
        kind: "condition",
        label: "Did customer reply?",
        detail: "Wait up to 1 hour for inbound",
      },
    },
    {
      id: "4",
      type: "flow",
      position: { x: 60, y: 580 },
      data: { kind: "ai", label: "AI auto-respond", detail: "Answer using order context" },
    },
    {
      id: "5",
      type: "flow",
      position: { x: 580, y: 580 },
      data: { kind: "delay", label: "Wait 1 hour", detail: "60 minutes" },
    },
    {
      id: "6",
      type: "flow",
      position: { x: 580, y: 740 },
      data: { kind: "email", label: "Send reminder email", detail: "Template: gentle_reminder" },
    },
  ],
  edges: [
    makeEdge("e1-2", "1", "2", "default"),
    makeEdge("e2-3", "2", "3", "delivered"),
    makeEdge("e3-4", "3", "4", "yes"),
    makeEdge("e3-5", "3", "5", "no-response"),
    makeEdge("e5-6", "5", "6", "default"),
  ],
  simulation: {
    path: ["1", "2", "3", "5", "6"],
    edgePath: ["e1-2", "e2-3", "e3-5", "e5-6"],
    messages: [
      { msg: "Trigger received: POST /v1/events/order_placed", kind: "info" },
      { msg: "WhatsApp 'order_shipped' sent → delivered (412ms)", kind: "ok" },
      { msg: "Behavior branch: waiting for inbound reply (60m)", kind: "info" },
      { msg: "No reply within window → fallback path", kind: "warn" },
      { msg: "Reminder email queued via Resend", kind: "ok" },
    ],
  },
};

export const flowTemplates: Record<string, FlowTemplate> = {
  fl_1a2b3c: {
    // API Downtime Alert
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "Webhook Received", detail: "Datadog Alert" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "sms",
          label: "Send SMS Alert",
          detail: "To: On-call Pager",
          fallback: "voice",
          retryMinutes: 2,
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 400 },
        data: { kind: "condition", label: "Delivered?", detail: "Within 2 minutes" },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 60, y: 580 },
        data: {
          kind: "voice",
          label: "Automated Voice Call",
          detail: "Read alert via Text-to-Speech",
        },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 580, y: 580 },
        data: { kind: "delay", label: "End Flow", detail: "Success" },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "not-delivered"),
      makeEdge("e3-5", "3", "5", "delivered"),
    ],
    simulation: {
      path: ["1", "2", "3", "4"],
      edgePath: ["e1-2", "e2-3", "e3-4"],
      messages: [
        { msg: "Trigger received: Datadog Alert", kind: "info" },
        { msg: "SMS Alert queued", kind: "ok" },
        { msg: "Condition: SMS not delivered in 2 mins", kind: "warn" },
        { msg: "Fallback triggered: Initiating Voice Call to Pager", kind: "ok" },
        { msg: "Voice call connected and acknowledged", kind: "ok" },
      ],
    },
  },
  fl_4d5e6f: {
    // New Enterprise Lead
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "Form Submission", detail: "Enterprise Contact Form" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: { kind: "ai", label: "AI Lead Scoring", detail: "Analyze domain and message" },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 400 },
        data: { kind: "condition", label: "High Intent?", detail: "Score > 80" },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 60, y: 580 },
        data: { kind: "email", label: "Email Sales Team", detail: "High priority lead alert" },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 580, y: 580 },
        data: { kind: "email", label: "Add to Nurture", detail: "Standard onboarding flow" },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "yes"),
      makeEdge("e3-5", "3", "5", "no"),
    ],
    simulation: {
      path: ["1", "2", "3", "4"],
      edgePath: ["e1-2", "e2-3", "e3-4"],
      messages: [
        { msg: "Form Submission: acme.com / 500+ employees", kind: "info" },
        { msg: "AI Scoring: Processed domain and enriched data", kind: "ok" },
        { msg: "Lead Score: 92 (High Intent)", kind: "ok" },
        { msg: "Sales Team email dispatched", kind: "ok" },
      ],
    },
  },
  fl_7g8h9i: {
    // Failed Payment Dunning
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "Stripe Webhook", detail: "invoice.payment_failed" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "whatsapp",
          label: "WhatsApp Reminder",
          detail: "Template: payment_failed_dunning",
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 400 },
        data: {
          kind: "condition",
          label: "No action after 3 days?",
          detail: "Check invoice status",
        },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 320, y: 580 },
        data: {
          kind: "email",
          label: "Final Email Warning",
          detail: "Subscription suspension notice",
        },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "yes"),
    ],
    simulation: {
      path: ["1", "2", "3", "4"],
      edgePath: ["e1-2", "e2-3", "e3-4"],
      messages: [
        { msg: "Stripe event: invoice.payment_failed", kind: "info" },
        { msg: "WhatsApp reminder sent (delivered)", kind: "ok" },
        { msg: "Timer started: wait 3 days", kind: "info" },
        { msg: "Invoice still unpaid", kind: "warn" },
        { msg: "Final Email Warning dispatched", kind: "ok" },
      ],
    },
  },
  fl_0j1k2l: {
    // Daily Standup Summary
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "Cron Job", detail: "Daily at 5:00 PM" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: { kind: "trigger", label: "Fetch Slack Data", detail: "Read #eng-standup" },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 340 },
        data: { kind: "ai", label: "AI Summarization", detail: "Extract blockers & updates" },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 320, y: 500 },
        data: { kind: "email", label: "Email Managers", detail: "Subject: Daily Eng Digest" },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "default"),
    ],
    simulation: {
      path: ["1", "2", "3", "4"],
      edgePath: ["e1-2", "e2-3", "e3-4"],
      messages: [
        { msg: "Cron triggered at 17:00", kind: "info" },
        { msg: "Fetched 45 messages from #eng-standup", kind: "ok" },
        { msg: "AI synthesized summary (2 blockers identified)", kind: "ok" },
        { msg: "Email digest sent to engineering managers", kind: "ok" },
      ],
    },
  },
  fl_3m4n5o: {
    // Security Vulnerability Patch
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "Manual API Trigger", detail: "Admin Broadcast" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: { kind: "email", label: "Broadcast Email", detail: "List: All active users" },
      },
    ],
    edges: [makeEdge("e1-2", "1", "2", "default")],
    simulation: {
      path: ["1", "2"],
      edgePath: ["e1-2"],
      messages: [
        { msg: "Manual trigger activated by admin", kind: "info" },
        { msg: "Broadcast dispatched to 14,200 recipients", kind: "ok" },
      ],
    },
  },
  fl_6p7q8r: {
    // Beta Feature Feedback
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "Feature Used", detail: "Beta event logged" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: { kind: "delay", label: "Wait 3 Days", detail: "Cooldown period" },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 340 },
        data: {
          kind: "whatsapp",
          label: "Send Feedback Request",
          detail: "Template: beta_feedback",
        },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 320, y: 500 },
        data: { kind: "condition", label: "User Replied?", detail: "Wait up to 24 hours" },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 60, y: 660 },
        data: { kind: "ai", label: "AI Conversation", detail: "Gather detailed feedback" },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "delivered"),
      makeEdge("e4-5", "4", "5", "yes"),
    ],
    simulation: {
      path: ["1", "2", "3", "4", "5"],
      edgePath: ["e1-2", "e2-3", "e3-4", "e4-5"],
      messages: [
        { msg: "Event logged: User accessed beta feature", kind: "info" },
        { msg: "Waiting 3 days", kind: "info" },
        { msg: "WhatsApp feedback request sent", kind: "ok" },
        { msg: "User replied: 'It was pretty good'", kind: "ok" },
        { msg: "AI agent engaged to ask follow-up questions", kind: "ok" },
      ],
    },
  },
  ot1: {
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "OTP Requested", detail: "POST /v1/auth/send_otp" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "whatsapp",
          label: "Send OTP via WhatsApp",
          detail: "Template: whatsapp_otp",
          fallback: "sms",
          retryMinutes: 1,
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 360 },
        data: {
          kind: "condition",
          label: "Delivered in 30s?",
          detail: "Check WhatsApp delivery status",
        },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 60, y: 540 },
        data: { kind: "delay", label: "Done", detail: "WhatsApp Delivered" },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 580, y: 540 },
        data: { kind: "sms", label: "Fallback: Send via SMS", detail: "SMS OTP Backup" },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "delivered"),
      makeEdge("e3-5", "3", "5", "fallback"),
    ],
    simulation: {
      path: ["1", "2", "3", "5"],
      edgePath: ["e1-2", "e2-3", "e3-5"],
      messages: [
        { msg: "Trigger: OTP requested by customer", kind: "info" },
        { msg: "Sent OTP via WhatsApp (Wait 30s)", kind: "info" },
        { msg: "WhatsApp status: Not delivered in 30s", kind: "warn" },
        { msg: "Fallback triggered: Sent OTP via SMS", kind: "ok" },
      ],
    },
  },
  ot2: {
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: "Order Shipped Event", detail: "Webhook: order_shipped" },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "whatsapp",
          label: "Send Shipping Update",
          detail: "WhatsApp tracking template",
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 360 },
        data: {
          kind: "condition",
          label: "Delivered in 5 mins?",
          detail: "Check delivery receipt",
        },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 60, y: 540 },
        data: { kind: "delay", label: "End Flow", detail: "Delivered successfully" },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 580, y: 540 },
        data: {
          kind: "email",
          label: "Fallback: Send Rich Email",
          detail: "Full order details & tracking link",
        },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "delivered"),
      makeEdge("e3-5", "3", "5", "fallback"),
    ],
    simulation: {
      path: ["1", "2", "3", "4"],
      edgePath: ["e1-2", "e2-3", "e3-4"],
      messages: [
        { msg: "Event: Order #78291 shipped", kind: "info" },
        { msg: "WhatsApp shipping notification dispatched", kind: "ok" },
        { msg: "WhatsApp status: Delivered in 1.2s", kind: "ok" },
        { msg: "Flow completed successfully", kind: "ok" },
      ],
    },
  },
  ot3: {
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: {
          kind: "trigger",
          label: "Appointment Created",
          detail: "Calendar Event (24h before)",
        },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "email",
          label: "Send Email Reminder",
          detail: "24 hours before appointment",
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 340 },
        data: { kind: "delay", label: "Wait until 1h before", detail: "Timer countdown" },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 320, y: 500 },
        data: { kind: "whatsapp", label: "WhatsApp Nudge", detail: "1 hour before appointment" },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 320, y: 660 },
        data: { kind: "condition", label: "Customer Replied?", detail: "Check confirmation" },
      },
      {
        id: "6",
        type: "flow",
        position: { x: 580, y: 820 },
        data: { kind: "sms", label: "SMS Final Reminder", detail: "15 minutes before" },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "default"),
      makeEdge("e4-5", "4", "5", "default"),
      makeEdge("e5-6", "5", "6", "no-response"),
    ],
    simulation: {
      path: ["1", "2", "3", "4", "5", "6"],
      edgePath: ["e1-2", "e2-3", "e3-4", "e4-5", "e5-6"],
      messages: [
        { msg: "Appointment reminder scheduled", kind: "info" },
        { msg: "Email reminder sent (24h before)", kind: "ok" },
        { msg: "WhatsApp nudge sent (1h before)", kind: "ok" },
        { msg: "No response confirmed → Sending SMS reminder (15m before)", kind: "warn" },
      ],
    },
  },
  ot4: {
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: {
          kind: "trigger",
          label: "Customer Message Received",
          detail: "Target: support@agatike.com",
          targetEmail: "support@agatike.com",
        },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "agent",
          label: "AI Support Agent",
          detail: "Technical Support FAQs",
          aiMode: "auto_reply",
          aiFocusArea:
            "Answer technical support FAQs concisely. If customer requests human help or is frustrated, escalate immediately.",
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 360 },
        data: {
          kind: "condition",
          label: "Escalation requested?",
          detail: "Check customer sentiment / request",
          conditionType: "If user requested human agent",
          yesLabel: "Escalate to Human Agent",
          noLabel: "AI Self-Service Resolved",
        },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 60, y: 540 },
        data: { kind: "delay", label: "Resolved by AI", detail: "No human action needed" },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 580, y: 540 },
        data: {
          kind: "whatsapp",
          label: "Escalate to Agent",
          detail: "Notify live support team",
          ticketDepartment: "Support",
          ticketPriority: "high",
        },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "no"),
      makeEdge("e3-5", "3", "5", "yes"),
    ],
    simulation: {
      path: ["1", "2", "3", "5"],
      edgePath: ["e1-2", "e2-3", "e3-5"],
      messages: [
        { msg: "Inbound message: I need to speak to a human manager", kind: "info" },
        { msg: "AI Agent analyzed intent: Human Handover required", kind: "warn" },
        { msg: "Escalated ticket to live agent via WhatsApp", kind: "ok" },
      ],
    },
  },
  ot5: {
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: {
          kind: "trigger",
          label: "Inbound Sales Email",
          detail: "Target: sales@agatike.com",
          targetEmail: "sales@agatike.com",
        },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "agent",
          label: "AI Sales Representative",
          detail: "Focus on Enterprise Pricing & Demos",
          aiMode: "auto_reply",
          aiFocusArea:
            "Focus on sales inquiries, Enterprise pricing tiers, demo scheduling, and feature comparisons.",
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 360 },
        data: {
          kind: "condition",
          label: "Demo requested?",
          detail: "Check if customer wants demo",
          conditionType: "If user requested demo",
          yesLabel: "Schedule Calendar Demo",
          noLabel: "Send Product One-Pager",
        },
      },
      {
        id: "4",
        type: "flow",
        position: { x: 60, y: 540 },
        data: {
          kind: "email",
          label: "Send Demo Scheduling Link",
          detail: "Calendar invite",
          ticketDepartment: "Sales",
          ticketPriority: "high",
        },
      },
      {
        id: "5",
        type: "flow",
        position: { x: 580, y: 540 },
        data: {
          kind: "email",
          label: "Send Product Specs PDF",
          detail: "Enterprise Overview",
          ticketDepartment: "Sales",
          ticketPriority: "normal",
        },
      },
    ],
    edges: [
      makeEdge("e1-2", "1", "2", "default"),
      makeEdge("e2-3", "2", "3", "default"),
      makeEdge("e3-4", "3", "4", "yes"),
      makeEdge("e3-5", "3", "5", "no"),
    ],
    simulation: {
      path: ["1", "2", "3", "4"],
      edgePath: ["e1-2", "e2-3", "e3-4"],
      messages: [
        { msg: "Inbound email received for sales@agatike.com", kind: "info" },
        {
          msg: "AI Sales Representative processed email with Sales focus instructions",
          kind: "ok",
        },
        { msg: "Condition: Demo request detected", kind: "ok" },
        { msg: "Demo scheduling link sent to prospect", kind: "ok" },
      ],
    },
  },
  ot6: {
    nodes: [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: {
          kind: "trigger",
          label: "Urgent Support Inbound",
          detail: "Subject filter: URGENT",
          targetEmail: "support@agatike.com",
          subjectFilter: "URGENT",
        },
      },
      {
        id: "2",
        type: "flow",
        position: { x: 320, y: 180 },
        data: {
          kind: "agent",
          label: "Bypass AI & Create Open Ticket",
          detail: "⚡ Skip AI → Human Agent directly",
          aiMode: "skip_ai_ticket",
          ticketDepartment: "Engineering",
          ticketPriority: "urgent",
        },
      },
      {
        id: "3",
        type: "flow",
        position: { x: 320, y: 360 },
        data: {
          kind: "email",
          label: "Notify On-Call Support Agent",
          detail: "Urgent ticket created",
          ticketDepartment: "Support",
          ticketPriority: "urgent",
        },
      },
    ],
    edges: [makeEdge("e1-2", "1", "2", "default"), makeEdge("e2-3", "2", "3", "default")],
    simulation: {
      path: ["1", "2", "3"],
      edgePath: ["e1-2", "e2-3"],
      messages: [
        { msg: "Inbound email received: 'URGENT: Server outage'", kind: "info" },
        { msg: "Flow Rule Matched: Skip AI auto-reply activated", kind: "warn" },
        { msg: "Created Open Ticket #8912 directly for Human Handling", kind: "ok" },
        { msg: "Dispatched alert to On-Call Support Agent", kind: "ok" },
      ],
    },
  },
};
