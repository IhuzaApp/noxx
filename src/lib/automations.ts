import { Zap, Tag, UserPlus, AlertTriangle, Repeat, Clock, Bot, Ticket, CreditCard, Megaphone } from "lucide-react";

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
    id: "auto-1",
    name: "Auto-tag & route tickets",
    description: "Classify every new ticket with AI and route to the right team based on intent.",
    trigger: "New ticket created",
    actions: ["AI classify intent", "Apply tags", "Assign to team", "Notify on Slack"],
    category: "support",
    enabled: true,
    runs30d: 1284,
    successRate: 97,
    icon: Tag,
  },
  {
    id: "auto-2",
    name: "Escalate urgent tickets",
    description: "If a customer mentions refund or says 'human' twice, auto-escalate to a senior agent.",
    trigger: "Customer reply contains keyword",
    actions: ["Set priority: urgent", "Assign senior agent", "Send SMS alert"],
    category: "support",
    enabled: true,
    runs30d: 84,
    successRate: 100,
    icon: AlertTriangle,
  },
  {
    id: "auto-3",
    name: "Abandoned cart recovery",
    description: "Remind shoppers across WhatsApp → Email → SMS if they didn't finish checkout.",
    trigger: "Cart abandoned > 1h",
    actions: ["WhatsApp reminder", "Wait 6h", "Email 10% coupon", "Wait 24h", "SMS last call"],
    category: "sales",
    enabled: true,
    runs30d: 621,
    successRate: 23,
    icon: Repeat,
  },
  {
    id: "auto-4",
    name: "Welcome new customers",
    description: "Send a warm intro, tag as 'new', and trigger the onboarding flow after signup.",
    trigger: "New contact via any channel",
    actions: ["Add to segment", "Send welcome Email", "Start onboarding flow"],
    category: "marketing",
    enabled: true,
    runs30d: 312,
    successRate: 99,
    icon: UserPlus,
  },
  {
    id: "auto-5",
    name: "Payment failed recovery",
    description: "Retry failed charges on an alternate method and notify the customer.",
    trigger: "Payment webhook: failed",
    actions: ["Retry on Apple Pay", "Send WhatsApp retry link", "Escalate if still failing"],
    category: "ops",
    enabled: false,
    runs30d: 28,
    successRate: 71,
    icon: CreditCard,
  },
  {
    id: "auto-6",
    name: "After-hours AI handler",
    description: "Outside business hours, let the AI agent fully handle tickets until 9 AM.",
    trigger: "Between 20:00 – 09:00 local",
    actions: ["AI Agent auto-reply", "Create ticket", "Hand off to human at 09:00"],
    category: "support",
    enabled: true,
    runs30d: 498,
    successRate: 92,
    icon: Clock,
  },
  {
    id: "auto-7",
    name: "Instagram DM → Ticket",
    description: "Turn every new Instagram DM into a ticket with AI-suggested first reply.",
    trigger: "Instagram message received",
    actions: ["Create ticket", "AI draft reply", "Notify agent"],
    category: "support",
    enabled: true,
    runs30d: 174,
    successRate: 100,
    icon: Ticket,
  },
  {
    id: "auto-8",
    name: "Re-engage inactive customers",
    description: "Send a targeted campaign to contacts inactive for 30+ days.",
    trigger: "Contact inactive 30d",
    actions: ["Add to segment", "Send Email campaign", "Track opens"],
    category: "marketing",
    enabled: false,
    runs30d: 0,
    successRate: 0,
    icon: Megaphone,
  },
];

export const automationTemplates = [
  { id: "tpl-1", name: "AI triage for support", icon: Bot, uses: "Support", description: "Classify, tag, route, and auto-reply to simple questions." },
  { id: "tpl-2", name: "Abandoned checkout (3-step)", icon: Repeat, uses: "Sales", description: "WhatsApp → Email → SMS with escalating incentives." },
  { id: "tpl-3", name: "Appointment reminder", icon: Clock, uses: "Ops", description: "Send 24h + 1h reminders with reschedule link." },
  { id: "tpl-4", name: "NPS + follow-up", icon: Megaphone, uses: "Marketing", description: "Send NPS 7 days post-order, escalate detractors." },
  { id: "tpl-5", name: "Fraud alert routing", icon: AlertTriangle, uses: "Ops", description: "Flag suspicious payments and notify finance." },
  { id: "tpl-6", name: "New lead welcome", icon: UserPlus, uses: "Sales", description: "Instant welcome + schedule intro call." },
];
