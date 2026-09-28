import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/automations")({
  head: () => ({
    meta: [
      { title: "Automations — Noxx docs" },
      {
        name: "description",
        content:
          "Build custom automations from scratch or start from a template — pick a trigger, chain actions, and turn it on.",
      },
    ],
  }),
  component: () => (
    <DocPage
      slug="automations"
      icon={Zap}
      title="Automations"
      intro="Automations are background workflows: when X happens, do Y. Build your own from scratch — every trigger, every action is up to you. Templates are just a head start, never a cage."
      cta={{ label: "Open Automations", to: "/automations" }}
    >
      <Step n={1} title="Two ways to start">
        <p>
          <strong>From scratch</strong>: click <strong>New automation</strong>. You pick the
          trigger, you pick the actions, you pick the order.
        </p>
        <p>
          <strong>From a template</strong>: click any template card to pre-fill the form with
          sensible defaults. Then change anything you want before saving.
        </p>
        <Callout>
          Templates are reference, not rules. You can rename, reorder, add or remove every step.
        </Callout>
      </Step>
      <Step n={2} title="Pick a trigger">
        <p>
          Triggers tell Noxx <em>when</em> to run the automation. Examples:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>New ticket created</li>
          <li>Customer reply contains keyword</li>
          <li>Cart abandoned &gt; 1h</li>
          <li>New contact via any channel</li>
          <li>Payment webhook: failed</li>
          <li>Scheduled (cron)</li>
        </ul>
      </Step>
      <Step n={3} title="Chain your actions">
        <p>
          Add as many actions as you need, in the order they should run. Mix channels, AI, waits,
          conditions and integrations freely.
        </p>
        <p>
          Common building blocks: <em>Send SMS / Email / WhatsApp</em>,{" "}
          <em>AI classify / reply / summarize</em>, <em>Wait N minutes</em>, <em>If/else branch</em>
          , <em>Assign agent</em>, <em>Tag contact</em>, <em>Notify Slack</em>,{" "}
          <em>HTTP webhook</em>.
        </p>
      </Step>
      <Step n={4} title="Run, pause, edit anytime">
        <p>
          Toggle each automation Active or Paused from the list. Every run is logged with input,
          output and success rate so you can iterate.
        </p>
      </Step>
    </DocPage>
  ),
});
