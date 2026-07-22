import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { DocPage, Step } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/developer-api")({
  head: () => ({
    meta: [
      { title: "Developer API — Noxx docs" },
      { name: "description", content: "REST endpoints, webhooks, and the request playground." },
    ],
  }),
  component: () => (
    <DocPage
      slug="developer-api"
      icon={Code2}
      title="Developer API"
      intro="A REST API with copy-paste cURL snippets, plus webhooks for delivery, AI decisions, payments and ticket events."
      cta={{ label: "Open Developer API", to: "/dev-api" }}
    >
      <Step n={1} title="Browse endpoints">
        <p>Open the <strong>Developer API</strong> page to see every endpoint with parameters, responses and a one-click cURL snippet.</p>
      </Step>
      <Step n={2} title="Try in the Playground">
        <p>The <strong>API Playground</strong> sends real requests against your sandbox or live environment — no client code needed.</p>
      </Step>
      <Step n={3} title="Subscribe to webhooks">
        <p>Add webhook URLs and pick the events you care about: <code>message.delivered</code>, <code>message.failed</code>, <code>ai.decided</code>, <code>payment.succeeded</code>, <code>ticket.created</code>, and more.</p>
      </Step>
    </DocPage>
  ),
});
