export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "suspended" | "invited";
  plan: "free" | "starter" | "growth" | "enterprise";
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

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Sarah Chen", email: "sarah@acme.co", role: "owner", status: "active", plan: "enterprise", lastActive: "2m ago", mrr: 2400 },
  { id: "u2", name: "Marcus Webb", email: "marcus@northwind.io", role: "admin", status: "active", plan: "growth", lastActive: "15m ago", mrr: 499 },
  { id: "u3", name: "Priya Raman", email: "priya@lumen.dev", role: "admin", status: "active", plan: "growth", lastActive: "1h ago", mrr: 499 },
  { id: "u4", name: "Diego Alvarez", email: "diego@kite.app", role: "member", status: "active", plan: "starter", lastActive: "3h ago", mrr: 99 },
  { id: "u5", name: "Aiko Tanaka", email: "aiko@mori.jp", role: "member", status: "invited", plan: "starter", lastActive: "—", mrr: 99 },
  { id: "u6", name: "Jonas Weber", email: "jonas@spoke.de", role: "viewer", status: "suspended", plan: "free", lastActive: "12d ago", mrr: 0 },
  { id: "u7", name: "Ruth Okafor", email: "ruth@brightly.ng", role: "admin", status: "active", plan: "enterprise", lastActive: "just now", mrr: 2400 },
  { id: "u8", name: "Theo Laurent", email: "theo@pivot.fr", role: "member", status: "active", plan: "growth", lastActive: "4h ago", mrr: 499 },
];

export const systemServices: SystemService[] = [
  { id: "s1", name: "API Gateway", status: "operational", uptime: 99.99, latency: 84 },
  { id: "s2", name: "SMS Delivery", status: "operational", uptime: 99.97, latency: 210 },
  { id: "s3", name: "Email Delivery", status: "operational", uptime: 99.98, latency: 145 },
  { id: "s4", name: "WhatsApp Bridge", status: "degraded", uptime: 98.12, latency: 612 },
  { id: "s5", name: "AI Inference", status: "operational", uptime: 99.95, latency: 320 },
  { id: "s6", name: "Payments Processor", status: "operational", uptime: 99.99, latency: 98 },
  { id: "s7", name: "Voice PSTN", status: "operational", uptime: 99.91, latency: 180 },
  { id: "s8", name: "Webhook Dispatcher", status: "down", uptime: 92.40, latency: 0 },
];

export const featureFlags: FeatureFlag[] = [
  { id: "f1", key: "ai_agent_v2", description: "New AI agent reasoning engine", enabled: true, rollout: 100 },
  { id: "f2", key: "voice_realtime", description: "Realtime voice transcription beta", enabled: true, rollout: 35 },
  { id: "f3", key: "domains_registrar", description: "Domain registration via Noxx", enabled: true, rollout: 100 },
  { id: "f4", key: "instagram_dms", description: "Instagram DM channel", enabled: false, rollout: 0 },
  { id: "f5", key: "payments_subs", description: "Subscription billing on payment links", enabled: true, rollout: 60 },
  { id: "f6", key: "bulk_import_v3", description: "Contacts bulk import v3", enabled: false, rollout: 0 },
];

export const auditEvents: AuditEvent[] = [
  { id: "a1", actor: "sarah@acme.co", action: "updated_billing_plan", target: "org_acme", ip: "73.12.8.41", at: "2m ago", severity: "info" },
  { id: "a2", actor: "system", action: "feature_flag_rollout", target: "voice_realtime", ip: "—", at: "18m ago", severity: "info" },
  { id: "a3", actor: "ruth@brightly.ng", action: "deleted_api_key", target: "key_9f2b", ip: "102.89.44.12", at: "34m ago", severity: "warning" },
  { id: "a4", actor: "marcus@northwind.io", action: "login_failed", target: "auth", ip: "45.14.89.3", at: "1h ago", severity: "warning" },
  { id: "a5", actor: "system", action: "webhook_delivery_dropped", target: "svc_webhook", ip: "—", at: "2h ago", severity: "critical" },
  { id: "a6", actor: "priya@lumen.dev", action: "invited_member", target: "aiko@mori.jp", ip: "188.22.1.9", at: "3h ago", severity: "info" },
  { id: "a7", actor: "jonas@spoke.de", action: "account_suspended", target: "u_jonas", ip: "91.12.6.4", at: "12d ago", severity: "critical" },
];

export const platformStats = {
  totalUsers: 4218,
  activeUsers: 2910,
  totalOrgs: 642,
  mrr: 184_230,
  messagesToday: 1_284_310,
  apiCallsToday: 8_421_090,
  errorRate: 0.42,
  storageGb: 2140,
};

export const revenueTrend = [
  { month: "Oct", mrr: 112000 },
  { month: "Nov", mrr: 128000 },
  { month: "Dec", mrr: 141000 },
  { month: "Jan", mrr: 152000 },
  { month: "Feb", mrr: 166000 },
  { month: "Mar", mrr: 184230 },
];
