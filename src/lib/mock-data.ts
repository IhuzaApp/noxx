export type Channel = "sms" | "email" | "whatsapp" | "ai" | "voice";
export type Status = "delivered" | "sent" | "failed" | "pending";

export const channelMeta: Record<Channel, { label: string; color: string; bg: string }> = {
  sms: { label: "SMS", color: "text-channel-sms", bg: "bg-channel-sms/10" },
  email: { label: "Email", color: "text-channel-email", bg: "bg-channel-email/10" },
  whatsapp: { label: "WhatsApp", color: "text-channel-whatsapp", bg: "bg-channel-whatsapp/10" },
  ai: { label: "AI", color: "text-channel-ai", bg: "bg-channel-ai/10" },
  voice: { label: "Voice", color: "text-channel-sms", bg: "bg-channel-sms/10" },
};

export const statusMeta: Record<Status, { label: string; className: string }> = {
  delivered: { label: "Delivered", className: "bg-success/15 text-success border-success/20" },
  sent: { label: "Sent", className: "bg-info/15 text-info border-info/20" },
  failed: {
    label: "Failed",
    className: "bg-destructive/15 text-destructive border-destructive/20",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
};

export const overviewStats = [
  { label: "Messages sent", value: 15_450, delta: 18.2, channel: "all" as const },
  { label: "Delivery rate", value: 94.6, delta: -1.2, channel: "all" as const, suffix: "%" },
  { label: "Active flows", value: 6, delta: 2, channel: "all" as const },
  { label: "Avg. latency", value: 242, delta: -12.1, channel: "all" as const, suffix: "ms" },
];

export const usageByChannel = [
  { channel: "SMS", sent: 4120, delivered: 4050 },
  { channel: "Email", sent: 7430, delivered: 7315 },
  { channel: "WhatsApp", sent: 2150, delivered: 2120 },
  { channel: "AI", sent: 1120, delivered: 1115 },
  { channel: "Voice", sent: 630, delivered: 25 },
];

export const trendData = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    sms: 200 + Math.round(Math.sin(i / 2) * 60 + Math.random() * 80),
    email: 350 + Math.round(Math.cos(i / 3) * 80 + Math.random() * 120),
    whatsapp: 100 + Math.round(Math.sin(i / 1.5) * 30 + Math.random() * 40),
    ai: 40 + Math.round(Math.cos(i / 2) * 20 + Math.random() * 30),
    voice: 20 + Math.round(Math.sin(i) * 5 + Math.random() * 10),
  };
});

const recipients = [
  "+250 788 123 456",
  "amanda.uwase@officeats.co",
  "+250 722 987 654",
  "support@candidigital.com",
  "+250 733 456 789",
  "billing@kddesign.studio",
  "+250 788 555 111",
  "noreply@rwandair.com",
];
const previews = [
  "Your verification code is 482910",
  "Order #A2391 has shipped — track it here",
  "Reminder: appointment tomorrow at 10am",
  "Welcome to Candi Digital! Let's get started.",
  "Payment of RWF 42,000 received. Thank you.",
  "Your AI summary is ready to review",
  "Password reset requested for your account",
  "We tried to reach you about your booking",
];

export const messageLogs = Array.from({ length: 42 }).map((_, i) => {
  const channels: Channel[] = ["sms", "email", "whatsapp", "ai", "voice"];
  const statuses: Status[] = ["delivered", "delivered", "delivered", "sent", "pending", "failed"];
  const channel = channels[i % channels.length];
  let status = statuses[i % statuses.length];

  if (channel === "voice") {
    status = "failed";
  }

  const d = new Date();
  d.setMinutes(d.getMinutes() - i * 17);
  return {
    id: `msg_${(1000 + i).toString(36)}`,
    channel,
    recipient: recipients[i % recipients.length],
    preview: previews[i % previews.length],
    status,
    timestamp: d,
  };
});

export const apiKeys = [
  {
    id: "key_live_1",
    name: "Production",
    key: "sk_live_8fA2b9Xq3KpL7vNcM2yR4wT6",
    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 32),
    lastUsed: new Date(Date.now() - 1000 * 60 * 14),
    requests: 184_213,
    env: "live" as const,
  },
  {
    id: "key_test_1",
    name: "Staging",
    key: "sk_test_3hN5d8Kq1ZpY9vBcW6rE2sU4",
    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 3),
    requests: 12_804,
    env: "test" as const,
  },
  {
    id: "key_test_2",
    name: "Local dev",
    key: "sk_test_9pQ2r7Lm4XzC8vNbT1wY6sH3",
    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 27),
    requests: 482,
    env: "test" as const,
  },
];

export const templates = [
  {
    id: "t1",
    name: "OTP verification",
    channel: "sms" as Channel,
    body: "Your code is {{code}}. It expires in 10 minutes.",
    uses: 18402,
  },
  {
    id: "t2",
    name: "Order shipped",
    channel: "email" as Channel,
    body: "Hi {{name}}, your order {{order_id}} has shipped.",
    uses: 9201,
  },
  {
    id: "t3",
    name: "Appointment reminder",
    channel: "whatsapp" as Channel,
    body: "Reminder: your appointment is at {{time}}.",
    uses: 6541,
  },
  {
    id: "t4",
    name: "AI summary",
    channel: "ai" as Channel,
    body: "Summarize the following conversation: {{transcript}}",
    uses: 2103,
  },
  {
    id: "t5",
    name: "Welcome email",
    channel: "email" as Channel,
    body: "Welcome to {{org}}! Here's how to get started.",
    uses: 4820,
  },
  {
    id: "t6",
    name: "Payment receipt",
    channel: "email" as Channel,
    body: "Thanks {{name}} — we received your payment of {{amount}}.",
    uses: 7311,
  },
];
