import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Noxx docs" },
      { name: "description", content: "Use projects to isolate flows, keys and env vars for each app or environment." },
    ],
  }),
  component: () => (
    <DocPage
      slug="projects"
      icon={Sparkles}
      title="Projects"
      intro="A Project is a workspace. It owns its own flows, contacts, API keys and environment variables. Use one per product, or one per environment (dev / staging / prod) — whatever fits your team."
      cta={{ label: "Open Projects", to: "/projects" }}
    >
      <Step n={1} title="Create a new project">
        <p>Open <strong>Projects</strong> from the sidebar and click <strong>New project</strong>. Give it a name, a short description, and pick an environment label.</p>
      </Step>
      <Step n={2} title="Switch between projects">
        <p>The project switcher at the top of the sidebar lists every project you have access to. Switching changes the entire dashboard scope — flows, conversations, keys, everything.</p>
      </Step>
      <Step n={3} title="API requests are scoped">
        <p>Every API key belongs to one project. When a request comes in, Noxx routes logs, billing and rate limits to that project automatically.</p>
        <Callout>Tip: use the <strong>environment</strong> field to label runs in logs — it makes filtering between dev and prod traffic painless.</Callout>
      </Step>
    </DocPage>
  ),
});
