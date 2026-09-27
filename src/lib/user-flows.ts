import { createStore } from "./store";

export type FlowResource = {
  id: string;
  kind: "phone" | "link" | "folder";
  label: string;
  value: string;
  notes?: string;
};

export type UserFlow = {
  id: string;
  name: string;
  description: string;
  channels: Array<"sms" | "email" | "whatsapp" | "ai" | "voice">;
  trigger: string;
  status: "draft" | "active" | "paused";
  resources: FlowResource[];
  createdAt: string;
  projectId?: string;
};

export type UserProject = {
  id: string;
  name: string;
  slug: string;
  description: string;
  env: "development" | "staging" | "production";
  createdAt: string;
};

export const userProjectStore = createStore<UserProject>([]);

export const userFlowStore = createStore<UserFlow>([
  {
    id: "fl_1a2b3c",
    name: "API Downtime Alert",
    description: "Notifies the engineering team via SMS and Voice when Pingdom detects an API outage.",
    channels: ["sms", "voice"],
    trigger: "Webhook",
    status: "active",
    resources: [
      { id: "rs_1a", kind: "phone", label: "On-call Pager", value: "+1 415 555 9111" },
      { id: "rs_1b", kind: "link", label: "Status Page", value: "https://status.acmetech.io" },
    ],
    createdAt: "1 month ago",
  },
  {
    id: "fl_4d5e6f",
    name: "New Enterprise Lead",
    description: "AI qualifies new enterprise leads from the website form and emails the sales team a summary.",
    channels: ["ai", "email"],
    trigger: "Form submission",
    status: "active",
    resources: [
      { id: "rs_2a", kind: "folder", label: "Lead enrichment data", value: "https://s3.aws.com/acme-leads" },
    ],
    createdAt: "2 months ago",
  },
  {
    id: "fl_7g8h9i",
    name: "Failed Payment Dunning",
    description: "Sends a WhatsApp reminder to customers when their SaaS subscription payment fails.",
    channels: ["whatsapp", "email"],
    trigger: "Payment event",
    status: "active",
    resources: [
      { id: "rs_3a", kind: "link", label: "Update billing link", value: "https://app.acmetech.io/billing" },
    ],
    createdAt: "3 weeks ago",
  },
  {
    id: "fl_0j1k2l",
    name: "Daily Standup Summary",
    description: "Compiles Slack standup notes using AI and sends a daily digest email to the engineering managers.",
    channels: ["ai", "email"],
    trigger: "Scheduled (cron)",
    status: "paused",
    resources: [],
    createdAt: "4 months ago",
  },
  {
    id: "fl_3m4n5o",
    name: "Security Vulnerability Patch",
    description: "Emergency broadcast to all users via email if a critical security vulnerability requires a client update.",
    channels: ["email"],
    trigger: "API request",
    status: "draft",
    resources: [
      { id: "rs_5a", kind: "link", label: "Patch notes", value: "https://acmetech.io/security/patch-v2" },
    ],
    createdAt: "1 week ago",
  },
  {
    id: "fl_6p7q8r",
    name: "Beta Feature Feedback",
    description: "Triggers a WhatsApp conversational AI flow to collect user feedback 3 days after they use a new beta feature.",
    channels: ["whatsapp", "ai"],
    trigger: "API request",
    status: "active",
    resources: [],
    createdAt: "5 days ago",
  },
]);

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
