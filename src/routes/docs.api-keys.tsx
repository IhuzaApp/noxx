import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/api-keys")({
  head: () => ({
    meta: [
      { title: "API keys & environment variables — Noxx docs" },
      { name: "description", content: "Per-project API keys, rotation and secrets management with environment variables." },
    ],
  }),
  component: () => (
    <DocPage
      slug="api-keys"
      icon={KeyRound}
      title="API keys & env vars"
      intro="Each project has its own API keys. Use environment variables for everything else you don't want hardcoded."
      cta={{ label: "Open API Keys", to: "/api-keys" }}
    >
      <Step n={1} title="Create a key">
        <p>Open <strong>API Keys</strong>, click <strong>New key</strong>, name it (e.g. "Production server"), pick scopes and an environment label.</p>
        <Callout tone="warn">The full key is shown once. Copy it immediately and store it in a password manager or secrets vault.</Callout>
      </Step>
      <Step n={2} title="Rotate when needed">
        <p>Click <strong>Rotate</strong> on any key. The old key keeps working for 24 hours so you can swap callers safely.</p>
      </Step>
      <Step n={3} title="Use environment variables">
        <p>Open <strong>Env Variables</strong> to store secrets (Stripe keys, webhook secrets, partner tokens). Reference them in flows as <code>{`{{env.STRIPE_KEY}}`}</code>.</p>
      </Step>
    </DocPage>
  ),
});
