import { createStore } from "./store";
import { makeId } from "./user-flows";

export type SurveyQuestionType = "short" | "long" | "single" | "multi" | "rating" | "email";

export type SurveyQuestion = {
  id: string;
  type: SurveyQuestionType;
  prompt: string;
  required: boolean;
  options?: string[]; // for single/multi
};

export type Survey = {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string;
  status: "draft" | "live";
};

export type SurveyResponse = {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Record<string, string | string[] | number>;
};

const demo: Survey = {
  id: "srv_demo",
  title: "Post-purchase feedback",
  description: "Help us improve — takes under a minute.",
  status: "live",
  createdAt: new Date().toISOString(),
  questions: [
    { id: "q1", type: "rating", prompt: "How happy are you with your order?", required: true },
    { id: "q2", type: "single", prompt: "Which channel do you prefer?", required: true, options: ["Email", "SMS", "WhatsApp", "Voice"] },
    { id: "q3", type: "long", prompt: "Anything we could do better?", required: false },
  ],
};

export const surveyStore = createStore<Survey>([demo]);
export const surveyResponseStore = createStore<SurveyResponse>([]);

export { makeId };
