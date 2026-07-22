import { Headphones, ShoppingCart, Bot, type LucideIcon } from "lucide-react";

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  color: string;
  flows: number;
  messages: number;
  env: "development" | "staging" | "production";
};

export const projects: Project[] = [
  {
    id: "p_support",
    name: "Customer Support",
    slug: "support",
    description: "AI-first support: chat, fallback to SMS, escalate via voice call.",
    icon: Headphones,
    color: "bg-channel-ai/10 text-channel-ai",
    flows: 8,
    messages: 42810,
    env: "production",
  },
  {
    id: "p_orders",
    name: "Order Lifecycle",
    slug: "orders",
    description: "Notify customers from checkout to delivery across WhatsApp & Email.",
    icon: ShoppingCart,
    color: "bg-channel-whatsapp/10 text-channel-whatsapp",
    flows: 12,
    messages: 168_402,
    env: "production",
  },
  {
    id: "p_onboarding",
    name: "Onboarding Bot",
    slug: "onboarding",
    description: "AI assistant that guides new users with contextual nudges.",
    icon: Bot,
    color: "bg-primary/10 text-primary",
    flows: 4,
    messages: 9_120,
    env: "staging",
  },
];

export const envVars: Record<string, Array<{ key: string; value: string; secret: boolean; env: "development" | "staging" | "production" }>> = {
  p_support: [
    { key: "OPENAI_API_KEY", value: "sk-proj-••••••••••••••••f3A2", secret: true, env: "production" },
    { key: "SUPPORT_PHONE", value: "+1 (415) 555-0100", secret: false, env: "production" },
    { key: "ESCALATION_EMAIL", value: "ops@acme.co", secret: false, env: "production" },
    { key: "MAX_RETRIES", value: "3", secret: false, env: "development" },
  ],
  p_orders: [
    { key: "WHATSAPP_TOKEN", value: "EAAB••••••••••••••••wZ91", secret: true, env: "production" },
    { key: "STORE_URL", value: "https://acme.shop", secret: false, env: "production" },
    { key: "FROM_EMAIL", value: "orders@acme.shop", secret: false, env: "production" },
  ],
  p_onboarding: [
    { key: "OPENAI_API_KEY", value: "sk-proj-••••••••••••••••a7B1", secret: true, env: "staging" },
    { key: "WELCOME_TEMPLATE", value: "tpl_welcome_v3", secret: false, env: "staging" },
  ],
};

export const savedRequests = [
  { id: "r1", name: "Send WhatsApp", method: "POST" as const, path: "/v1/send/whatsapp" },
  { id: "r2", name: "Send SMS", method: "POST" as const, path: "/v1/send/sms" },
  { id: "r3", name: "AI completion", method: "POST" as const, path: "/v1/ai/chat" },
  { id: "r4", name: "List messages", method: "GET" as const, path: "/v1/messages" },
  { id: "r5", name: "Trigger flow", method: "POST" as const, path: "/v1/flows/{id}/run" },
  { id: "r6", name: "Get delivery status", method: "GET" as const, path: "/v1/messages/{id}" },
];
