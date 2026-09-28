import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/templates")({
  head: () => ({
    meta: [
      { title: "Message templates — Noxx docs" },
      {
        name: "description",
        content:
          "Reusable, variable-driven message templates for SMS, Email, WhatsApp and AI replies.",
      },
    ],
  }),
  component: () => (
    <DocPage
      slug="templates"
      icon={FileText}
      title="Message templates"
      intro="Templates are reusable messages with placeholders. Write them once, send them anywhere — across SMS, Email, WhatsApp or AI replies."
      cta={{ label: "Open Templates", to: "/templates" }}
    >
      <Step n={1} title="Create a template">
        <p>
          Open <strong>Templates</strong> and click <strong>New template</strong>. Pick a channel
          (SMS, Email, WhatsApp, AI), give it a name and write the body.
        </p>
      </Step>
      <Step n={2} title="Use variables">
        <p>
          Wrap variables in double braces:{" "}
          <code>{`Hi {{name}}, your order {{order_id}} just shipped.`}</code>
        </p>
        <p>
          List the variable names in the Variables field so the rest of Noxx knows what to fill in.
        </p>
        <Callout>
          Variables can be filled from contacts, flow context, or the API call that triggered the
          send.
        </Callout>
      </Step>
      <Step n={3} title="Reference templates from flows or the API">
        <p>
          In any flow's Send node, pick the template by name. Or in the API:{" "}
          <code>{`{ "template": "order_shipped", "vars": { "name": "Sara" } }`}</code>.
        </p>
      </Step>
    </DocPage>
  ),
});
