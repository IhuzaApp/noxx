import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Noxx docs" },
      { name: "description", content: "Store, tag, import and export the people you talk to — your CRM in one place." },
    ],
  }),
  component: () => (
    <DocPage
      slug="contacts"
      icon={Users}
      title="Contacts"
      intro="Everyone you reach lives here. Each contact has an email, phone, optional WhatsApp, tags and notes. Tags drive segmentation for surveys and campaigns."
      cta={{ label: "Open Contacts", to: "/contacts" }}
    >
      <Step n={1} title="Add contacts manually">
        <p>Click <strong>New contact</strong>, fill in name, email, phone, WhatsApp, company and any tags. Save.</p>
      </Step>
      <Step n={2} title="Import a CSV">
        <p>Click <strong>Import CSV</strong>. The expected columns are:</p>
        <pre className="rounded-md bg-muted px-3 py-2 text-xs font-mono overflow-x-auto">name, email, phone, whatsapp, company, tags, notes</pre>
        <p>Tags can be comma-separated within the field, e.g. <code>vip,trial</code>.</p>
      </Step>
      <Step n={3} title="Export anytime">
        <p>Click <strong>Export CSV</strong> to download every contact (or the current filtered view). Your data is yours.</p>
        <Callout>Use tags like <code>vip</code>, <code>trial</code>, <code>newsletter</code> to target surveys, campaigns and automations.</Callout>
      </Step>
    </DocPage>
  ),
});
