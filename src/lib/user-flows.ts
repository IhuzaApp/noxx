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
export const userFlowStore = createStore<UserFlow>([]);

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
