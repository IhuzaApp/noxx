import {
  Sparkles,
  Workflow,
  Zap,
  Users,
  ClipboardList,
  FileText,
  CreditCard,
  Globe,
  LayoutTemplate,
  Ticket,
  PhoneCall,
  KeyRound,
  Code2,
  type LucideIcon,
} from "lucide-react";

export type DocItem = {
  slug: string;
  path: string;
  title: string;
  summary: string;
  icon: LucideIcon;
};

export const docsNav: DocItem[] = [
  { slug: "getting-started", path: "/docs/getting-started", title: "Getting started", summary: "Sign up, find the dashboard, send your first test message.", icon: Sparkles },
  { slug: "projects", path: "/docs/projects", title: "Projects", summary: "Isolate flows, keys and env vars per project & environment.", icon: Sparkles },
  { slug: "flows", path: "/docs/flows", title: "Flows & visual builder", summary: "Drag triggers, channels, AI and conditions on a canvas.", icon: Workflow },
  { slug: "automations", path: "/docs/automations", title: "Automations", summary: "Build automations from scratch — or start from a template.", icon: Zap },
  { slug: "templates", path: "/docs/templates", title: "Message templates", summary: "Reusable, variable-driven messages for SMS, Email, WhatsApp, AI.", icon: FileText },
  { slug: "contacts", path: "/docs/contacts", title: "Contacts", summary: "Store, tag, import and export everyone you talk to.", icon: Users },
  { slug: "surveys", path: "/docs/surveys", title: "Surveys", summary: "Build a survey, share a public link, see responses live.", icon: ClipboardList },
  { slug: "sites", path: "/docs/sites", title: "Sites", summary: "Build a simple branded website — shop, services, support portal — and share it.", icon: LayoutTemplate },

  { slug: "tickets", path: "/docs/tickets", title: "Support tickets", summary: "Turn inbound messages into tracked tickets with AI replies.", icon: Ticket },
  { slug: "voice", path: "/docs/voice", title: "Voice support", summary: "Inbound & outbound calls with live transcription.", icon: PhoneCall },
  { slug: "api-keys", path: "/docs/api-keys", title: "API keys & env vars", summary: "Per-project keys, rotation and secrets management.", icon: KeyRound },
  { slug: "developer-api", path: "/docs/developer-api", title: "Developer API", summary: "REST endpoints, webhooks, and the request playground.", icon: Code2 },
];
