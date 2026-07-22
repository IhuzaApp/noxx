import type { Channel, Status } from "./mock-data";

export type ConversationEvent = {
  id: string;
  channel: Channel;
  direction: "outbound" | "inbound";
  preview: string;
  status: Status | "opened" | "replied" | "fallback";
  timestamp: Date;
  fallbackFor?: string; // id of message this is a fallback for
};

export type Conversation = {
  id: string;
  recipient: string;
  contactName: string;
  flow: string;
  events: ConversationEvent[];
};

const now = Date.now();
const m = (mins: number) => new Date(now - mins * 60_000);

export const conversations: Conversation[] = [
  {
    id: "c1",
    recipient: "+1 (415) 555-0143",
    contactName: "Alice Chen",
    flow: "Order shipped notification",
    events: [
      { id: "e1", channel: "whatsapp", direction: "outbound", preview: "Hi Alice, your order #A2391 has shipped 🚚", status: "delivered", timestamp: m(122) },
      { id: "e2", channel: "whatsapp", direction: "outbound", preview: "Track your package here: noxx.dev/t/A2391", status: "failed", timestamp: m(118) },
      { id: "e3", channel: "sms", direction: "outbound", preview: "Order #A2391 shipped — track: noxx.dev/t/A2391", status: "fallback", timestamp: m(117), fallbackFor: "e2" },
      { id: "e4", channel: "sms", direction: "inbound", preview: "Thanks! When will it arrive?", status: "replied", timestamp: m(98) },
      { id: "e5", channel: "ai", direction: "outbound", preview: "Estimated delivery is Thursday between 9am–12pm.", status: "delivered", timestamp: m(97) },
    ],
  },
  {
    id: "c2",
    recipient: "alice@northwind.io",
    contactName: "Alice Chen",
    flow: "Payment receipt",
    events: [
      { id: "e1", channel: "email", direction: "outbound", preview: "Your receipt for $42.00 from Northwind", status: "delivered", timestamp: m(280) },
      { id: "e2", channel: "email", direction: "outbound", preview: "(open tracker)", status: "opened", timestamp: m(265) },
    ],
  },
  {
    id: "c3",
    recipient: "+44 7700 900812",
    contactName: "James Patel",
    flow: "Appointment reminder",
    events: [
      { id: "e1", channel: "email", direction: "outbound", preview: "Reminder: appointment tomorrow at 10am", status: "delivered", timestamp: m(720) },
      { id: "e2", channel: "whatsapp", direction: "outbound", preview: "Quick reminder — see you at 10am tomorrow!", status: "delivered", timestamp: m(180) },
      { id: "e3", channel: "sms", direction: "outbound", preview: "Reminder: 10am appointment in 1 hour.", status: "fallback", timestamp: m(60), fallbackFor: "e2" },
      { id: "e4", channel: "sms", direction: "inbound", preview: "On my way!", status: "replied", timestamp: m(35) },
    ],
  },
  {
    id: "c4",
    recipient: "+33 6 12 34 56 78",
    contactName: "Léa Dubois",
    flow: "OTP verification",
    events: [
      { id: "e1", channel: "whatsapp", direction: "outbound", preview: "Your verification code is 482910", status: "failed", timestamp: m(8) },
      { id: "e2", channel: "sms", direction: "outbound", preview: "Your verification code is 482910", status: "fallback", timestamp: m(7), fallbackFor: "e1" },
      { id: "e3", channel: "sms", direction: "outbound", preview: "(delivery confirmed)", status: "delivered", timestamp: m(7) },
    ],
  },
];

export const omnichannelStats = {
  fallbackRate: 12.4,
  fallbackTrend: 1.8,
  bestChannelByDelivery: { channel: "whatsapp" as Channel, rate: 99.1 },
  engagementRate: 38.6, // opens + replies / sent
  channelComparison: [
    { channel: "WhatsApp", delivery: 99.1, engagement: 52, sent: 41280 },
    { channel: "Email", delivery: 98.6, engagement: 41, sent: 102430 },
    { channel: "SMS", delivery: 98.7, engagement: 28, sent: 84210 },
    { channel: "AI", delivery: 99.8, engagement: 64, sent: 21012 },
  ],
};
