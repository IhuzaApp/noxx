import { createStore } from "./store";
import { makeId } from "./user-flows";

export type UserAutomation = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  category: "support" | "sales" | "marketing" | "ops";
  enabled: boolean;
  createdAt: string;
};

export const userAutomationStore = createStore<UserAutomation>([]);

export type UserTemplate = {
  id: string;
  name: string;
  channel: "sms" | "email" | "whatsapp" | "ai";
  subject?: string;
  body: string;
  variables: string[];
  createdAt: string;
};

export const userTemplateStore = createStore<UserTemplate>([]);

export { makeId };
