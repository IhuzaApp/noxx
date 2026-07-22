export type Campaign = {
  id: string;
  name: string;
  channel: "email" | "sms" | "whatsapp";
  status: "draft" | "scheduled" | "sending" | "sent";
  segment: string;
  audience: number;
  scheduledFor?: Date;
  sentAt?: Date;
  openRate?: number;
  clickRate?: number;
  deliveryRate?: number;
};

const d = (h: number) => new Date(Date.now() - h * 3_600_000);
const future = (h: number) => new Date(Date.now() + h * 3_600_000);

export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Black Friday — Early access",
    channel: "email",
    status: "sent",
    segment: "VIP customers",
    audience: 4_812,
    sentAt: d(36),
    openRate: 64.2,
    clickRate: 18.7,
    deliveryRate: 99.1,
  },
  {
    id: "c2",
    name: "Cart abandonment reminder",
    channel: "email",
    status: "sent",
    segment: "Abandoned cart 24h",
    audience: 1_204,
    sentAt: d(8),
    openRate: 41.5,
    clickRate: 9.2,
    deliveryRate: 98.6,
  },
  {
    id: "c3",
    name: "Holiday shipping cutoff",
    channel: "whatsapp",
    status: "scheduled",
    segment: "All purchasers (last 90d)",
    audience: 12_408,
    scheduledFor: future(18),
    deliveryRate: 0,
  },
  {
    id: "c4",
    name: "App update launch",
    channel: "sms",
    status: "draft",
    segment: "Mobile users (US/CA)",
    audience: 6_220,
  },
  {
    id: "c5",
    name: "Re-engagement win-back",
    channel: "email",
    status: "sending",
    segment: "Inactive 60+ days",
    audience: 8_902,
    deliveryRate: 87.3,
    openRate: 22.1,
    clickRate: 4.8,
  },
];

export const segments = [
  { id: "s1", name: "VIP customers", count: 4_812, criteria: "LTV > $500" },
  { id: "s2", name: "Abandoned cart 24h", count: 1_204, criteria: "added to cart, no purchase" },
  { id: "s3", name: "All purchasers (last 90d)", count: 12_408, criteria: "any order in 90 days" },
  { id: "s4", name: "Mobile users (US/CA)", count: 6_220, criteria: "device = mobile, country IN (US, CA)" },
  { id: "s5", name: "Inactive 60+ days", count: 8_902, criteria: "last_seen > 60 days ago" },
];
