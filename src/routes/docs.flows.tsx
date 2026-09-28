import { createFileRoute } from "@tanstack/react-router";
import { Workflow } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/flows")({
  head: () => ({
    meta: [
      { title: "Flows & the visual builder — Noxx docs" },
      {
        name: "description",
        content:
          "Build omnichannel flows visually: triggers, channels, AI nodes, conditions and fallbacks.",
      },
    ],
  }),
  component: () => (
    <DocPage
      slug="flows"
      icon={Workflow}
      title="Flows & visual builder"
      intro="A flow is a sequence of steps that runs when a trigger fires. Build them visually by dragging blocks onto a canvas — no orchestration code required."
      cta={{ label: "Open the builder", to: "/flows" }}
    >
      <Step n={1} title="Create a new flow">
        <p>
          Open <strong>Flows & Automations</strong> and click <strong>New flow</strong>. Give it a
          name and pick a trigger.
        </p>
        <p>
          Common triggers: API request, inbound message, webhook, schedule (cron), form submission,
          payment event.
        </p>
      </Step>
      <Step n={2} title="Attach resources to your flow">
        <p>
          If your flow needs phone numbers, links, or access to a shared folder (Drive, S3,
          Dropbox), attach them directly from the New Flow form. They'll be available to every step
          in the flow.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Phone numbers</strong> — outgoing SMS / WhatsApp sender numbers
          </li>
          <li>
            <strong>Links</strong> — webhooks, redirect URLs, embedded forms
          </li>
          <li>
            <strong>Shared folder</strong> — Google Drive, S3, or Dropbox path for files
          </li>
        </ul>
      </Step>
      <Step n={3} title="Build the steps">
        <p>
          Drag channels (SMS, Email, WhatsApp), AI agents, conditions, payments, and waits onto the
          canvas. Connect them with arrows.
        </p>
        <Callout>
          Add fallbacks so messages always get through. A typical chain: WhatsApp → wait 5 min → SMS
          → wait 5 min → Voice.
        </Callout>
      </Step>
      <Step n={4} title="Test, then publish">
        <p>
          Use sandbox mode to dry-run the flow without sending real messages. Once it looks good,
          publish it — your trigger is now live.
        </p>
      </Step>
    </DocPage>
  ),
});
