import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/getting-started")({
  head: () => ({
    meta: [
      { title: "Getting started — Noxx docs" },
      { name: "description", content: "Sign up, open the dashboard, and send your first message with Noxx in under 5 minutes." },
    ],
  }),
  component: () => (
    <DocPage
      slug="getting-started"
      icon={Sparkles}
      title="Getting started"
      intro="Go from zero to a working Noxx account in five minutes. By the end of this guide you'll have an account, a project, an API key and a test message sent."
      cta={{ label: "Create your account", to: "/signup" }}
    >
      <Step n={1} title="Create your free account">
        <p>Head to the signup page and create a free account with your work email. No credit card required.</p>
        <p>You'll land on the dashboard with a sandbox project pre-loaded with sample data so you can explore everything before you connect anything real.</p>
      </Step>
      <Step n={2} title="Find your way around">
        <p>The left sidebar is your map: <strong>Dashboard</strong>, <strong>Conversations</strong>, <strong>Flows</strong>, <strong>Contacts</strong>, <strong>Surveys</strong>, <strong>Automations</strong>, <strong>Templates</strong>, <strong>Payments</strong>, <strong>Domains</strong>, <strong>Tickets</strong>, <strong>Voice</strong>.</p>
        <p>The top-right project switcher lets you create or jump between projects.</p>
      </Step>
      <Step n={3} title="Generate your first API key">
        <p>Open <strong>API Keys</strong> from the sidebar, click <strong>New key</strong>, give it a name (e.g. "Local dev") and pick an environment.</p>
        <Callout>Your API key is shown once. Copy it somewhere safe — you can rotate it any time.</Callout>
      </Step>
      <Step n={4} title="Send a test message">
        <p>Open the <strong>API Playground</strong>, paste your key, pick the <code>POST /v1/send</code> endpoint and hit Send. You'll see the response inline.</p>
        <p>That's it — you're live.</p>
      </Step>
    </DocPage>
  ),
});
