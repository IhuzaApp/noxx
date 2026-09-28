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
    subject: "WhatsApp AI flow not parsing location for food delivery",
    contactName: "Mugisha Patrick",
    contactHandle: "@mugisha.officeats",
    channel: "whatsapp",
    status: "ai-handling",
    priority: "high",
    unread: 2,
    createdAt: m(14),
    lastActivity: m(2),
    tags: ["officeats", "integration-bug", "ai"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "Muraho! The WhatsApp bot is failing to parse delivery locations in Kigali.",
        timestamp: m(14),
      },
      {
        id: "m2",
        from: "ai",
        text: "Muraho Patrick 👋 I'm analyzing the logs. It seems the Google Maps API key restriction might be blocking local requests. Would you like me to check the Noxx integration config?",
        timestamp: m(13),
      },
      {
        id: "m3",
        from: "customer",
        text: "Yes please. It stopped working after we added the Remera branch.",
        timestamp: m(3),
      },
      { id: "m4", from: "customer", text: "We're losing orders because of this.", timestamp: m(2) },
    ],
  },
  {
    id: "TKT-1041",
    subject: "Webhook failing on Candi Digital ERP sync",
    contactName: "Uwase Chantal",
    contactHandle: "+250 788 123 456",
    channel: "sms",
    status: "open",
    priority: "urgent",
    unread: 1,
    createdAt: m(120),
    lastActivity: m(11),
    assignee: "Kagabo Jean",
    tags: ["candidigital", "api", "escalated"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "The ERP sync webhook just returned a 500 error. Production is halted.",
        timestamp: m(120),
      },
      {
        id: "m2",
        from: "ai",
        text: "I see the 500 errors in the Noxx logs. It looks like the payload size from Candi Digital exceeds the 5MB limit. Shall I escalate to an engineer?",
        timestamp: m(118),
      },
      {
        id: "m3",
        from: "customer",
        text: "Yes, I need to talk to a human immediately. Our construction teams are stuck.",
        timestamp: m(11),
      },
    ],
  },
  {
    id: "TKT-1040",
    subject: "Update monthly retainer invoice for Q3",
    contactName: "Kwizera Eric",
    contactHandle: "eric@kddesign.rw",
    channel: "email",
    status: "pending",
    priority: "normal",
    unread: 0,
    createdAt: m(180),
    lastActivity: m(63),
    assignee: "You",
    tags: ["kddesign", "billing"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "Could you send the updated Q3 invoice for the Noxx integration retainer? We added 2 more workflows.",
        timestamp: m(180),
      },
      {
        id: "m2",
        from: "agent",
        text: "Hi Eric — attached is the updated invoice including the new interior design automated flows. Let me know if everything looks correct.",
        timestamp: m(63),
      },
    ],
  },
  {
    id: "TKT-1039",
    subject: "Setup multi-channel support inbox",
    contactName: "Kamikazi Diane",
    contactHandle: "+250 733 987 654",
    channel: "sms",
    status: "ai-handling",
    priority: "low",
    unread: 0,
    createdAt: m(160),
    lastActivity: m(140),
    tags: ["onboarding", "new-client"],
    messages: [
      {
        id: "m1",
        from: "ai",
        text: "Welcome to our integration services, Diane! Ready to set up your unified inbox for Instagram and WhatsApp?",
        timestamp: m(160),
      },
      { id: "m2", from: "customer", text: "Yego, let's start with Instagram.", timestamp: m(140) },
    ],
  },
  {
    id: "TKT-1038",
    subject: "API Dashboard access works now",
    contactName: "Gatera Yves",
    contactHandle: "@yves.dev",
    channel: "instagram",
    status: "resolved",
    priority: "low",
    unread: 0,
    createdAt: m(900),
    lastActivity: m(720),
    tags: ["resolved"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "I can access the Noxx dashboard now. Murakoze cyane!",
        timestamp: m(720),
      },
    ],
  },
  {
    id: "TKT-1037",
    subject: "Custom AI personality for customer service",
    contactName: "Niyonsaba Grace",
    contactHandle: "grace@rwandaclothing.rw",
    channel: "email",
    status: "new",
    priority: "normal",
    unread: 1,
    createdAt: m(300),
    lastActivity: m(300),
    tags: ["feature-request", "ai"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "Muraho team, can we train our Noxx AI agent to use more polite Kinyarwanda phrasing? Like saying 'Murakoze' instead of 'Thanks'?",
        timestamp: m(300),
      },
    ],
  },
  {
    id: "TKT-1036",
    subject: "Bulk SMS campaign delivery failure",
    contactName: "Rutayisire Kevin",
    contactHandle: "+250 788 999 888",
    channel: "sms",
    status: "open",
    priority: "high",
    unread: 1,
    createdAt: m(420),
    lastActivity: m(360),
    assignee: "Kagabo Jean",
    tags: ["sms", "campaign", "bug"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "Our Friday promotional campaign didn't go out to the MTN network numbers. Airtel numbers received it fine.",
        timestamp: m(420),
      },
      {
        id: "m2",
        from: "agent",
        text: "Hi Kevin, we noticed this too. The MTN aggregator is experiencing delays. We have paused the queue and will resume once it clears.",
        timestamp: m(380),
      },
      {
        id: "m3",
        from: "customer",
        text: "Okay, please let me know when it's back up so I can update marketing.",
        timestamp: m(360),
      },
    ],
  },
  {
    id: "TKT-1035",
    subject: "WhatsApp API number approval pending",
    contactName: "Mutoni Sarah",
    contactHandle: "@sarah.mutoni",
    channel: "instagram",
    status: "pending",
    priority: "normal",
    unread: 0,
    createdAt: m(1440),
    lastActivity: m(1200),
    assignee: "You",
    tags: ["whatsapp", "onboarding"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "How long does Meta usually take to approve the WhatsApp Business number? It's been 2 days.",
        timestamp: m(1440),
      },
      {
        id: "m2",
        from: "agent",
        text: "Hi Sarah! For Rwandan businesses, it usually takes 2-3 business days. I'll check our partner portal to see if they need additional business registration docs from RDB.",
        timestamp: m(1200),
      },
    ],
  },
  {
    id: "TKT-1034",
    subject: "Help connecting HubSpot integration",
    contactName: "Habimana Claude",
    contactHandle: "claude@techsol.rw",
    channel: "email",
    status: "ai-handling",
    priority: "low",
    unread: 1,
    createdAt: m(2880),
    lastActivity: m(2870),
    tags: ["integration", "hubspot"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "I'm trying to connect HubSpot but the OAuth screen keeps redirecting to an error page.",
        timestamp: m(2880),
      },
      {
        id: "m2",
        from: "ai",
        text: "Muraho Claude! This usually happens if the redirect URI isn't added to your HubSpot private app settings. Would you like a link to our step-by-step guide?",
        timestamp: m(2875),
      },
      { id: "m3", from: "customer", text: "Yes, that would be helpful.", timestamp: m(2870) },
    ],
  },
  {
    id: "TKT-1033",
    subject: "Update credit card details",
    contactName: "Ineza Bella",
    contactHandle: "+250 722 111 222",
    channel: "whatsapp",
    status: "closed",
    priority: "low",
    unread: 0,
    createdAt: m(4320),
    lastActivity: m(4300),
    tags: ["billing", "resolved"],
    messages: [
      {
        id: "m1",
        from: "customer",
        text: "Hi, I need to update my BK card on file.",
        timestamp: m(4320),
      },
      {
        id: "m2",
        from: "agent",
        text: "Hi Bella, I've sent a secure Stripe link to your email to update your payment methods. Let me know once it's done!",
        timestamp: m(4310),
      },
      { id: "m3", from: "customer", text: "Done, thanks!", timestamp: m(4300) },
    ],
  },
];

export function suggestReplies(ticket: Ticket): string[] {
  const last = ticket.messages[ticket.messages.length - 1];
  const text = last.text.toLowerCase();

  if (text.includes("error") || text.includes("human") || text.includes("500")) {
    return [
      "I'm escalating this to our integration engineers right now. Someone will reply within 10 minutes.",
      "I can see the webhook payload limit was exceeded. Let me increase the buffer for you manually.",
      "Our engineering team is looking into the ERP sync issue now. We'll deploy a hotfix shortly.",
    ];
  }
  if (text.includes("location") || text.includes("remera") || text.includes("food")) {
    return [
      "I found the issue: the new Remera branch isn't whitelisted in the Google Maps API key settings. Fixing it now.",
      "The WhatsApp flow is failing at the location node. I'll bypass it temporarily so you can still receive text addresses.",
      "Let me redeploy the location parsing model for the Kigali area. Give me two minutes.",
    ];
  }
  if (text.includes("invoice") || text.includes("billing") || text.includes("retainer")) {
    return [
      "Sent! Let me know if you need it in RWF instead of USD.",
      "Attached. We've applied the 10% discount for the additional workflows.",
    ];
  }
  return [
    "Murakoze cyane! Let me look into that for you right now.",
    "Got it — give me one moment to check the integration logs.",
    "Happy to help! Could you share a screenshot of the error you're seeing?",
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
  "ai-handling": {
    label: "AI handling",
    cls: "bg-channel-ai/15 text-channel-ai border-channel-ai/20",
  },
  resolved: { label: "Resolved", cls: "bg-success/15 text-success border-success/20" },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
};
