import type { Channel } from "./mock-data";

export type TicketMessage = {
  id: string;
  from: "customer" | "agent" | "ai";
  text: string;
  timestamp: Date;
};

export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus = "new" | "open" | "pending" | "ai-handling" | "resolved" | "closed";

export type Ticket = {
  id: string; // e.g. TKT-1042
  subject: string;
  contactName: string;
  contactHandle: string;
  channel: Channel | "instagram";
  status: TicketStatus;
  priority: TicketPriority;
  unread: number;
  createdAt: Date;
  lastActivity: Date;
  assignee?: string;
  tags: string[];
  messages: TicketMessage[];
};

const now = Date.now();
const m = (mins: number) => new Date(now - mins * 60_000);

export const tickets: Ticket[] = [
  {
    id: "TKT-1042",
    subject: "Shipping to Berlin — Aurora hoodie",
    contactName: "Alice Chen",
    contactHandle: "@alice.chen",
    channel: "instagram",
    status: "ai-handling",
    priority: "normal",
    unread: 2,
    createdAt: m(14),
    lastActivity: m(2),
    tags: ["pre-sale", "vip"],
    messages: [
      { id: "m1", from: "customer", text: "Hey! Do you ship the Aurora hoodie to Berlin?", timestamp: m(14) },
      { id: "m2", from: "ai", text: "Hi Alice 👋 Yes — we ship to Germany, usually 3–4 business days via DHL. Want me to share sizing?", timestamp: m(13) },
      { id: "m3", from: "customer", text: "Yes please, I'm usually a M in zip hoodies.", timestamp: m(3) },
      { id: "m4", from: "customer", text: "Also is it warm enough for early winter?", timestamp: m(2) },
    ],
  },
  {
    id: "TKT-1041",
    subject: "Order #A2391 not delivered — refund request",
    contactName: "James Patel",
    contactHandle: "+44 7700 900812",
    channel: "whatsapp",
    status: "open",
    priority: "urgent",
    unread: 1,
    createdAt: m(120),
    lastActivity: m(11),
    assignee: "Maya R.",
    tags: ["refund", "escalated"],
    messages: [
      { id: "m1", from: "customer", text: "My order #A2391 hasn't arrived and tracking hasn't moved in 5 days.", timestamp: m(120) },
      { id: "m2", from: "ai", text: "I'm sorry to hear that, James. I've pulled up your order — would you like a refund or a reshipment?", timestamp: m(118) },
      { id: "m3", from: "customer", text: "I want to talk to a human, this is the second time.", timestamp: m(11) },
    ],
  },
  {
    id: "TKT-1040",
    subject: "Resend invoice INV-204",
    contactName: "Léa Dubois",
    contactHandle: "lea@northwind.io",
    channel: "email",
    status: "pending",
    priority: "normal",
    unread: 0,
    createdAt: m(180),
    lastActivity: m(63),
    assignee: "You",
    tags: ["billing"],
    messages: [
      { id: "m1", from: "customer", text: "Could you resend the invoice for INV-204? My accountant lost it.", timestamp: m(180) },
      { id: "m2", from: "agent", text: "Hi Léa — attached. Let me know if you need a different format.", timestamp: m(63) },
    ],
  },
  {
    id: "TKT-1039",
    subject: "Onboarding tour request",
    contactName: "Marcus Kim",
    contactHandle: "+1 (628) 555-0199",
    channel: "sms",
    status: "ai-handling",
    priority: "low",
    unread: 0,
    createdAt: m(160),
    lastActivity: m(140),
    tags: ["onboarding"],
    messages: [
      { id: "m1", from: "ai", text: "Welcome to Noxx, Marcus! Want a 2-min tour of flows?", timestamp: m(160) },
      { id: "m2", from: "customer", text: "yes", timestamp: m(140) },
    ],
  },
  {
    id: "TKT-1038",
    subject: "Package received — thank you",
    contactName: "Priya Shah",
    contactHandle: "@priya.s",
    channel: "instagram",
    status: "resolved",
    priority: "low",
    unread: 0,
    createdAt: m(900),
    lastActivity: m(720),
    tags: ["resolved"],
    messages: [
      { id: "m1", from: "customer", text: "Got my package, thanks!", timestamp: m(720) },
    ],
  },
];

export function suggestReplies(ticket: Ticket): string[] {
  const last = ticket.messages[ticket.messages.length - 1];
  const text = last.text.toLowerCase();

  if (text.includes("refund") || text.includes("human")) {
    return [
      "I completely understand. I'm escalating to our team now — someone will reply within 10 minutes.",
      "I've issued a full refund for your order. You'll see it in 3–5 business days. Anything else?",
      "Let me get a senior agent on this. While you wait, would a 20% credit on your next order help?",
    ];
  }
  if (text.includes("ship") || text.includes("size") || text.includes("warm")) {
    return [
      "M is the right call — runs true to size. Rated for ~5°C, perfect for Berlin autumn.",
      "Yes, ships to Berlin in 3–4 days. M fits true to size and is rated for cool weather.",
      "Great pick! It's 80% cotton / 20% recycled poly — warm but breathable.",
    ];
  }
  if (text.includes("invoice") || text.includes("billing")) {
    return [
      "Sent! Let me know if you need it as a PDF instead of HTML.",
      "Attached. Want me to set up auto-receipts to your accountant directly?",
    ];
  }
  return [
    "Thanks for reaching out! Let me look into that for you.",
    "Got it — give me one moment to pull up your account.",
    "Happy to help! Could you share a bit more detail?",
  ];
}

export const priorityBadge: Record<TicketPriority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-info/15 text-info border-info/20",
  high: "bg-warning/20 text-warning-foreground border-warning/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/20",
};

export const statusBadge: Record<TicketStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-info/15 text-info border-info/20" },
  open: { label: "Open", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground border-border" },
  "ai-handling": { label: "AI handling", cls: "bg-channel-ai/15 text-channel-ai border-channel-ai/20" },
  resolved: { label: "Resolved", cls: "bg-success/15 text-success border-success/20" },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
};
