import {
  Zap,
  Tag,
  UserPlus,
  AlertTriangle,
  Repeat,
  Clock,
  Bot,
  Ticket,
  CreditCard,
  Megaphone,
} from "lucide-react";

export type Automation = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  category: "support" | "sales" | "marketing" | "ops";
  enabled: boolean;
  runs30d: number;
  successRate: number;
  icon: typeof Zap;
};

export const automations: Automation[] = [
  {
    id: "fl_1a2b3c",
    name: "API Downtime Alert",
    description: "Ping on-call engineers via SMS/Voice immediately if Datadog triggers a P0 alert.",
    trigger: "Datadog P0 Webhook",
    actions: ["Send SMS", "Wait 2m", "Voice Call Fallback"],
    category: "ops",
    enabled: true,
    runs30d: 4,
    successRate: 100,
    icon: AlertTriangle,
  },
  {
    id: "fl_4d5e6f",
    name: "New Enterprise Lead",
    description: "Qualify form submissions with AI and route high-value leads directly to Sales.",
    trigger: "Typeform Submission",
    actions: ["AI Lead Score", "If Score > 80", "Email Sales Team"],
    category: "sales",
    enabled: true,
    runs30d: 42,
    successRate: 98,
    icon: UserPlus,
  },
  {
    id: "fl_7g8h9i",
    name: "Failed Payment Dunning",
    description: "Recover failed subscriptions with a WhatsApp reminder and a scheduled follow-up.",
    trigger: "Stripe Payment Failed",
    actions: ["WhatsApp Reminder", "Wait 3 Days", "Final Email Warning"],
    category: "ops",
    enabled: true,
    runs30d: 18,
    successRate: 45,
    icon: CreditCard,
  },
  {
    id: "fl_0j1k2l",
    name: "Daily Standup Summary",
    description: "Summarize engineering blockers from Slack automatically every evening.",
    trigger: "Cron: Daily 5:00 PM",
    actions: ["Fetch Slack Messages", "AI Summarize", "Email Managers"],
    category: "ops",
    enabled: true,
    runs30d: 22,
    successRate: 100,
    icon: Clock,
  },
  {
    id: "fl_3m4n5o",
    name: "Security Vulnerability Patch",
    description: "Broadcast an urgent security update to all active users simultaneously.",
    trigger: "Manual Admin Trigger",
    actions: ["Fetch Active Users", "Email Broadcast"],
    category: "ops",
    enabled: false,
    runs30d: 0,
    successRate: 0,
    icon: Zap,
  },
  {
    id: "fl_6p7q8r",
    name: "Beta Feature Feedback",
    description: "Check in with users 3 days after they try a beta feature and converse via AI.",
    trigger: "Segment Event: Beta Used",
    actions: ["Wait 3 Days", "WhatsApp Feedback Req", "AI Conversation"],
    category: "marketing",
    enabled: true,
    runs30d: 156,
    successRate: 82,
    icon: Bot,
  },
];

export const automationTemplates = [
  {
    id: "tpl-1",
    name: "AI triage for support",
    icon: Bot,
    uses: "Support",
    description: "Classify, tag, route, and auto-reply to simple questions.",
  },
  {
    id: "tpl-2",
    name: "Abandoned checkout (3-step)",
    icon: Repeat,
    uses: "Sales",
    description: "WhatsApp → Email → SMS with escalating incentives.",
  },
  {
    id: "tpl-3",
    name: "Appointment reminder",
    icon: Clock,
    uses: "Ops",
    description: "Send 24h + 1h reminders with reschedule link.",
  },
  {
    id: "tpl-4",
    name: "NPS + follow-up",
    icon: Megaphone,
    uses: "Marketing",
    description: "Send NPS 7 days post-order, escalate detractors.",
  },
  {
    id: "tpl-5",
    name: "Fraud alert routing",
    icon: AlertTriangle,
    uses: "Ops",
    description: "Flag suspicious payments and notify finance.",
  },
  {
    id: "tpl-6",
    name: "New lead welcome",
    icon: UserPlus,
    uses: "Sales",
    description: "Instant welcome + schedule intro call.",
  },
];
