import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  Mail,
  Phone,
  MessageSquare,
  Tag,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import { contactStore, contactsToCSV, downloadCSV, type Contact } from "@/lib/contacts";
import { useStore } from "@/lib/store";
import { makeId } from "@/lib/user-flows";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Noxx" },
      { name: "description", content: "Store, organize and export your customer contacts. Import via CSV, segment with tags." },
      { property: "og:title", content: "Contacts — Noxx" },
      { property: "og:description", content: "One source of truth for customer contacts. Import, tag and export to CSV." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const contacts = useStore(contactStore);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.phone.toLowerCase().includes(needle) ||
        c.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [contacts, q]);

  const exportAll = () => downloadCSV(`contacts-${Date.now()}.csv`, contactsToCSV(contacts));

  const importCSV = async (file: File) => {
    const text = await file.text();
    const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
    const cols = header.split(",").map((c) => c.replace(/^"|"$/g, "").trim().toLowerCase());
    const idx = (k: string) => cols.indexOf(k);
    for (const line of lines) {
      // very small CSV parser, good enough for the demo
      const fields: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQ) {
          if (ch === '"' && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else if (ch === '"') inQ = false;
          else cur += ch;
        } else {
          if (ch === ",") {
            fields.push(cur);
            cur = "";
          } else if (ch === '"') inQ = true;
          else cur += ch;
        }
      }
      fields.push(cur);
      const get = (k: string) => (idx(k) >= 0 ? fields[idx(k)] ?? "" : "");
      const name = get("name");
      if (!name) continue;
      contactStore.add({
        id: makeId("c"),
        name,
        email: get("email"),
        phone: get("phone"),
        whatsapp: get("whatsapp") || undefined,
        company: get("company") || undefined,
        tags: get("tags").split("|").filter(Boolean),
        notes: get("notes") || undefined,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <AppLayout>
      <Topbar
        title="Contacts"
        subtitle={`${contacts.length} contacts · export anytime`}
        action={
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition shadow-soft cursor-pointer">
              <Upload className="h-4 w-4" />
              Import CSV
              <input
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importCSV(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={exportAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition shadow-soft"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
            >
              <Plus className="h-4 w-4" />
              New contact
            </button>
          </div>
        }
      />
      <main className="flex-1 p-6 space-y-4">
        <Card className="p-4 flex items-start gap-3 bg-channel-ai/5 border-channel-ai/20">
          <div className="h-8 w-8 rounded-md bg-channel-ai/15 text-channel-ai flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Your customer database</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Store every contact in one place. Send surveys, run campaigns, and export to CSV
              whenever you need.
            </p>
          </div>
        </Card>

        <div className="flex items-center gap-2 rounded-md border border-input bg-card px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone or tag…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Tags</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.name}</div>
                      {c.company && <div className="text-[11px] text-muted-foreground">{c.company}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {c.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="inline-flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                      {c.whatsapp && (
                        <div className="inline-flex items-center gap-1.5 text-[11px]">
                          <MessageSquare className="h-3 w-3" /> {c.whatsapp}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded bg-accent text-accent-foreground px-1.5 py-0.5 text-[10px] font-medium"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => contactStore.remove((x) => x.id === c.id)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive transition"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No contacts match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <NewContactModal open={open} onClose={() => setOpen(false)} />
    </AppLayout>
  );
}

function NewContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Contact, "id" | "createdAt" | "tags">>({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    company: "",
    notes: "",
  });
  const [tags, setTags] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    contactStore.add({
      id: makeId("c"),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp?.trim() || undefined,
      company: form.company?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    });
    setForm({ name: "", email: "", phone: "", whatsapp: "", company: "", notes: "" });
    setTags("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add new contact" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input
              required
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Company">
            <input
              value={form.company ?? ""}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={cn(inputCls)}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              value={form.whatsapp ?? ""}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Tags" hint="Comma-separated, e.g. vip, newsletter">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputCls}
          />
        </Field>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
          >
            Add contact
          </button>
        </div>
      </form>
    </Modal>
  );
}
