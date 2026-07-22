export type Channel = "sms" | "email" | "whatsapp" | "ai";
export type Status = "delivered" | "sent" | "failed" | "pending";

export const channelMeta: Record<
  Channel,
  { label: string; color: string; bg: string }
> = {
  sms: { label: "SMS", color: "text-channel-sms", bg: "bg-channel-sms/10" },
  email: { label: "Email", color: "text-channel-email", bg: "bg-channel-email/10" },
  whatsapp: { label: "WhatsApp", color: "text-channel-whatsapp", bg: "bg-channel-whatsapp/10" },
  ai: { label: "AI", color: "text-channel-ai", bg: "bg-channel-ai/10" },
};

export const statusMeta: Record<Status, { label: string; className: string }> = {
  delivered: { label: "Delivered", className: "bg-success/15 text-success border-success/20" },
  sent: { label: "Sent", className: "bg-info/15 text-info border-info/20" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/20" },
  pending: { label: "Pending", className: "bg-warning/15 text-warning-foreground border-warning/30" },
};

export const overviewStats = [
  { label: "Messages sent", value: 248_932, delta: 12.4, channel: "all" as const },
  { label: "Delivery rate", value: 98.7, delta: 0.3, channel: "all" as const, suffix: "%" },
  { label: "Active flows", value: 24, delta: 4, channel: "all" as const },
  { label: "Avg. latency", value: 142, delta: -8.1, channel: "all" as const, suffix: "ms" },
];

export const usageByChannel = [
  { channel: "SMS", sent: 84210, delivered: 83120 },
  { channel: "Email", sent: 102430, delivered: 101005 },
  { channel: "WhatsApp", sent: 41280, delivered: 40890 },
  { channel: "AI", sent: 21012, delivered: 20987 },
];

export const trendData = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    sms: 4000 + Math.round(Math.sin(i / 2) * 1200 + Math.random() * 1500),
    email: 6500 + Math.round(Math.cos(i / 3) * 1500 + Math.random() * 1800),
    whatsapp: 2200 + Math.round(Math.sin(i / 1.5) * 800 + Math.random() * 900),
    ai: 900 + Math.round(Math.cos(i / 2) * 400 + Math.random() * 500),
  };
});

const recipients = [
  "+1 (415) 555-0143",
  "alice@northwind.io",
  "+44 7700 900812",
  "support@acme.co",
  "+33 6 12 34 56 78",
  "billing@vercel.com",
  "+1 (628) 555-0199",
  "noreply@stripe.dev",
];
const previews = [
  "Your verification code is 482910",
  "Order #A2391 has shipped — track it here",
  "Reminder: appointment tomorrow at 10am",
  "Welcome to Northwind! Let's get started.",
  "Payment of $42.00 received. Thank you.",
  "Your AI summary is ready to review",
  "Password reset requested for your account",
  "We tried to reach you about your booking",
];

export const messageLogs = Array.from({ length: 42 }).map((_, i) => {
  const channels: Channel[] = ["sms", "email", "whatsapp", "ai"];
  const statuses: Status[] = ["delivered", "delivered", "delivered", "sent", "pending", "failed"];
  const channel = channels[i % channels.length];
  const status = statuses[i % statuses.length];
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
  { id: "t1", name: "OTP verification", channel: "sms" as Channel, body: "Your code is {{code}}. It expires in 10 minutes.", uses: 18402 },
  { id: "t2", name: "Order shipped", channel: "email" as Channel, body: "Hi {{name}}, your order {{order_id}} has shipped.", uses: 9201 },
  { id: "t3", name: "Appointment reminder", channel: "whatsapp" as Channel, body: "Reminder: your appointment is at {{time}}.", uses: 6541 },
  { id: "t4", name: "AI summary", channel: "ai" as Channel, body: "Summarize the following conversation: {{transcript}}", uses: 2103 },
  { id: "t5", name: "Welcome email", channel: "email" as Channel, body: "Welcome to {{org}}! Here's how to get started.", uses: 4820 },
  { id: "t6", name: "Payment receipt", channel: "email" as Channel, body: "Thanks {{name}} — we received your payment of {{amount}}.", uses: 7311 },
];
