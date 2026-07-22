import { createStore } from "./store";
import { makeId } from "./user-flows";

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  tags: string[];
  company?: string;
  notes?: string;
  createdAt: string;
};

const sample: Contact[] = [
  {
    id: makeId("c"),
    name: "Amelia Stone",
    email: "amelia@northwind.io",
    phone: "+1 415 555 0142",
    whatsapp: "+1 415 555 0142",
    tags: ["vip", "newsletter"],
    company: "Northwind",
    notes: "Prefers WhatsApp for shipping updates.",
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId("c"),
    name: "Jonas Berg",
    email: "jonas@acme.co",
    phone: "+46 70 555 0199",
    tags: ["trial"],
    company: "Acme",
    createdAt: new Date().toISOString(),
  },
  {
    id: makeId("c"),
    name: "Priya Raman",
    email: "priya@example.com",
    phone: "+91 98765 43210",
    tags: ["newsletter"],
    createdAt: new Date().toISOString(),
  },
];

export const contactStore = createStore<Contact>(sample);

export function contactsToCSV(rows: Contact[]) {
  const header = ["name", "email", "phone", "whatsapp", "company", "tags", "notes", "createdAt"];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = [header.join(",")];
  for (const c of rows) {
    lines.push(
      [
        escape(c.name),
        escape(c.email),
        escape(c.phone),
        escape(c.whatsapp ?? ""),
        escape(c.company ?? ""),
        escape(c.tags.join("|")),
        escape(c.notes ?? ""),
        escape(c.createdAt),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
