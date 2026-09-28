import {
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  Sparkles,
  CreditCard,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export type IntegrationStatus = "connected" | "available" | "needs-attention";

export type Integration = {
  id: string;
  name: string;
  category: "Messaging" | "Email" | "Social" | "AI" | "Payments" | "Webhooks";
  description: string;
  icon: LucideIcon;
  color: string;
  status: IntegrationStatus;
  connectedAccount?: string;
  authType: "OAuth" | "API key" | "Webhook";
};

export const integrations: Integration[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "Messaging",
    description: "Send and receive WhatsApp messages, templates and inbound replies.",
    icon: MessageSquare,
    color: "bg-channel-whatsapp/10 text-channel-whatsapp",
    status: "connected",
    connectedAccount: "+1 (415) 555-0143 · Acme Co.",
    authType: "OAuth",
  },
  {
    id: "instagram",
    name: "Instagram Messaging",
    category: "Social",
    description: "Automate DMs, story replies and comments from your IG business account.",
    icon: Instagram,
    color: "bg-channel-ai/10 text-channel-ai",
    status: "connected",
    connectedAccount: "@acme.shop",
    authType: "OAuth",
  },
  {
    id: "twilio",
    name: "Twilio SMS",
    category: "Messaging",
    description: "Programmable SMS in 180+ countries. Two-way messaging with delivery receipts.",
    icon: Phone,
    color: "bg-channel-sms/10 text-channel-sms",
    status: "connected",
    connectedAccount: "Account AC•••2f3",
    authType: "API key",
  },
  {
    id: "resend",
    name: "Resend",
    category: "Email",
    description: "Transactional and marketing email with high deliverability.",
    icon: Mail,
    color: "bg-channel-email/10 text-channel-email",
    status: "needs-attention",
    connectedAccount: "Domain DKIM pending",
    authType: "API key",
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "AI",
    description: "Bring your own GPT models for AI Agent nodes and reply suggestions.",
    icon: Sparkles,
    color: "bg-channel-ai/10 text-channel-ai",
    status: "available",
    authType: "API key",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    description: "Trigger payment requests inside flows. Cards, Apple Pay, Google Pay.",
    icon: CreditCard,
    color: "bg-success/15 text-success",
    status: "available",
    authType: "OAuth",
  },
  {
    id: "mtn-momo",
    name: "MTN Mobile Money",
    category: "Payments",
    description: "Accept mobile money payments across West & Central Africa.",
    icon: CreditCard,
    color: "bg-warning/15 text-warning-foreground",
    status: "available",
    authType: "API key",
  },
  {
    id: "webhook",
    name: "Custom Webhook",
    category: "Webhooks",
    description: "Receive any HTTP event and use it as a flow trigger.",
    icon: Webhook,
    color: "bg-primary/10 text-primary",
    status: "connected",
    connectedAccount: "https://noxx.dev/hooks/wh_92Hx",
    authType: "Webhook",
  },
];
