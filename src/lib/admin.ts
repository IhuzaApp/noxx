export type AdminUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "suspended" | "invited";
  plan: "free" | "starter" | "growth" | "enterprise";
  joinedAt: string;
  lastActive: string;
  mrr: number;
};

export type SystemService = {
  id: string;
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number;
  latency: number;
};

export type FeatureFlag = {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  rollout: number;
  lastUpdated: string;
  author: string;
  type: "release" | "experiment" | "kill-switch";
};

export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  at: string;
  severity: "info" | "warning" | "critical";
};

export type AdminProject = {
  id: string;
  name: string;
  ownerName: string;
  company: string;
  flowsCount: number;
  status: "active" | "archived";
  createdAt: string;
  environment: "production" | "sandbox" | "staging";
};

// ── Users ──────────────────────────────────────────────────────────────────
export const adminUsers: AdminUser[] = [
  // Officeats — food delivery, paying (Starter)
  {
    id: "u1",
    name: "Amara Osei",
    email: "amara@officeats.co",
    company: "Officeats",
    role: "owner",
    status: "active",
    plan: "starter",
    joinedAt: "4 months ago",
    lastActive: "2m ago",
    mrr: 99,
  },
  {
    id: "u2",
    name: "Lena Mbeki",
    email: "lena@officeats.co",
    company: "Officeats",
    role: "admin",
    status: "active",
    plan: "starter",
    joinedAt: "4 months ago",
    lastActive: "1h ago",
    mrr: 0,
  },
  // Candi Digital — construction & software, paying (Starter)
  {
    id: "u3",
    name: "James Candi",
    email: "james@candidigital.com",
    company: "Candi Digital",
    role: "owner",
    status: "active",
    plan: "starter",
    joinedAt: "1 month ago",
    lastActive: "3h ago",
    mrr: 99,
  },
  {
    id: "u4",
    name: "Sofia Reyes",
    email: "sofia@candidigital.com",
    company: "Candi Digital",
    role: "admin",
    status: "active",
    plan: "starter",
    joinedAt: "1 month ago",
    lastActive: "just now",
    mrr: 0,
  },
  // KD Design — interior design, new free user
  {
    id: "u5",
    name: "Kwame Darko",
    email: "kwame@kddesign.studio",
    company: "KD Design",
    role: "owner",
    status: "active",
    plan: "free",
    joinedAt: "2 weeks ago",
    lastActive: "4h ago",
    mrr: 0,
  },
  {
    id: "u6",
    name: "Nia Darko",
    email: "nia@kddesign.studio",
    company: "KD Design",
    role: "member",
    status: "invited",
    plan: "free",
    joinedAt: "1 week ago",
    lastActive: "—",
    mrr: 0,
  },
];

// ── System services ────────────────────────────────────────────────────────
export const systemServices: SystemService[] = [
  { id: "s1", name: "API Gateway", status: "operational", uptime: 99.99, latency: 84 },
  { id: "s2", name: "SMS Delivery", status: "operational", uptime: 99.97, latency: 210 },
  { id: "s3", name: "Email Delivery", status: "operational", uptime: 99.98, latency: 145 },
  { id: "s4", name: "WhatsApp Bridge", status: "degraded", uptime: 98.12, latency: 612 },
  { id: "s5", name: "AI Inference", status: "operational", uptime: 99.95, latency: 320 },
  { id: "s6", name: "Payments Processor", status: "operational", uptime: 99.99, latency: 98 },
  { id: "s7", name: "Voice PSTN", status: "operational", uptime: 99.91, latency: 180 },
  { id: "s8", name: "Webhook Dispatcher", status: "down", uptime: 92.4, latency: 0 },
];

// ── Feature flags — authored by Noxx admin ─────────────────────────────────
export const featureFlags: FeatureFlag[] = [
  {
    id: "f1",
    key: "pkg.ai_agent.v2",
    description: "Enables the new LLM-based reasoning engine for support tickets.",
    enabled: true,
    rollout: 100,
    lastUpdated: "2d ago",
    author: "admin@noxxdesk.com",
    type: "release",
  },
  {
    id: "f2",
    key: "voice.realtime.transcription",
    description: "Realtime webSocket voice transcription beta (early access).",
    enabled: true,
    rollout: 35,
    lastUpdated: "5h ago",
    author: "admin@noxxdesk.com",
    type: "experiment",
  },
  {
    id: "f3",
    key: "core.domains_registrar.enabled",
    description: "Allows customers to register custom domains natively via Noxx.",
    enabled: true,
    rollout: 100,
    lastUpdated: "12d ago",
    author: "system",
    type: "release",
  },
  {
    id: "f4",
    key: "channels.whatsapp.cloud_api_v2",
    description: "Next-gen WhatsApp Cloud API connector with template caching.",
    enabled: true,
    rollout: 100,
    lastUpdated: "3d ago",
    author: "admin@noxxdesk.com",
    type: "release",
  },
  {
    id: "f5",
    key: "billing.payments.subscriptions",
    description: "Enables recurring subscription billing on generated payment links.",
    enabled: true,
    rollout: 60,
    lastUpdated: "1h ago",
    author: "admin@noxxdesk.com",
    type: "release",
  },
  {
    id: "f6",
    key: "killswitch.webhooks.outbound",
    description: "EMERGENCY: Stops all outbound webhook delivery platform-wide.",
    enabled: false,
    rollout: 0,
    lastUpdated: "3mo ago",
    author: "system",
    type: "kill-switch",
  },
];

// ── Audit log — real activity from all companies + Noxx ───────────────────
export const auditEvents: AuditEvent[] = [
  {
    id: "a1",
    actor: "amara@officeats.co",
    action: "flow.activated",
    target: "Order Lifecycle / Order Confirmed (WhatsApp)",
    ip: "102.22.41.8",
    at: "2m ago",
    severity: "info",
  },
  {
    id: "a2",
    actor: "sofia@candidigital.com",
    action: "project.created",
    target: "Client CRM Notifications",
    ip: "196.10.5.44",
    at: "15m ago",
    severity: "info",
  },
  {
    id: "a3",
    actor: "system",
    action: "webhook.delivery_failed",
    target: "svc_webhook / p_orders (Officeats)",
    ip: "—",
    at: "42m ago",
    severity: "critical",
  },
  {
    id: "a4",
    actor: "amara@officeats.co",
    action: "api_key.created",
    target: "key_7c3a (Customer Support)",
    ip: "102.22.41.8",
    at: "1h ago",
    severity: "info",
  },
  {
    id: "a5",
    actor: "kwame@kddesign.studio",
    action: "user.signup",
    target: "KD Design (org)",
    ip: "154.0.12.9",
    at: "4h ago",
    severity: "info",
  },
  {
    id: "a6",
    actor: "admin@noxxdesk.com",
    action: "feature_flag.rollout_updated",
    target: "billing.payments.subscriptions → 60%",
    ip: "192.168.1.1",
    at: "1h ago",
    severity: "info",
  },
  {
    id: "a7",
    actor: "admin@noxxdesk.com",
    action: "member.invited",
    target: "nia@kddesign.studio",
    ip: "192.168.1.1",
    at: "1 week ago",
    severity: "info",
  },
  {
    id: "a8",
    actor: "james@candidigital.com",
    action: "billing.plan_upgraded",
    target: "Candi Digital → Starter",
    ip: "196.10.5.44",
    at: "1 month ago",
    severity: "info",
  },
];

// ── Platform overview stats ────────────────────────────────────────────────
export const platformStats = {
  totalUsers: 6,
  activeUsers: 5,
  totalOrgs: 3, // Officeats, Candi Digital, KD Design
  mrr: 198, // Officeats $99 + Candi Digital $99
  messagesToday: 342,
  apiCallsToday: 4120,
  errorRate: 0.12,
  storageGb: 4,
};

// ── Revenue trend — Noxx MRR growth ───────────────────────────────────────
// Officeats joined Feb (first $99), Candi Digital joined Mar (second $99)
export const revenueTrend = [
  { month: "Oct", mrr: 0 },
  { month: "Nov", mrr: 0 },
  { month: "Dec", mrr: 0 },
  { month: "Jan", mrr: 0 },
  { month: "Feb", mrr: 99 }, // Officeats signed up
  { month: "Mar", mrr: 198 }, // Candi Digital signed up
];

// ── Projects ───────────────────────────────────────────────────────────────
export const adminProjects: AdminProject[] = [
  // Officeats — food delivery, 3 projects (matching projects.ts)
  {
    id: "p_support",
    name: "Customer Support",
    ownerName: "Amara Osei",
    company: "Officeats",
    flowsCount: 8,
    status: "active",
    createdAt: "4 months ago",
    environment: "production",
  },
  {
    id: "p_orders",
    name: "Order Lifecycle",
    ownerName: "Amara Osei",
    company: "Officeats",
    flowsCount: 12,
    status: "active",
    createdAt: "4 months ago",
    environment: "production",
  },
  {
    id: "p_onboarding",
    name: "Onboarding Bot",
    ownerName: "Lena Mbeki",
    company: "Officeats",
    flowsCount: 4,
    status: "active",
    createdAt: "3 months ago",
    environment: "staging",
  },
  // Candi Digital — construction & software dev
  {
    id: "p_candi_crm",
    name: "Client CRM Notifications",
    ownerName: "James Candi",
    company: "Candi Digital",
    flowsCount: 2,
    status: "active",
    createdAt: "1 month ago",
    environment: "production",
  },
  // KD Design — interior design, still exploring
  {
    id: "p_kd_test",
    name: "KD Design Sandbox",
    ownerName: "Kwame Darko",
    company: "KD Design",
    flowsCount: 0,
    status: "active",
    createdAt: "2 weeks ago",
    environment: "sandbox",
  },
];
