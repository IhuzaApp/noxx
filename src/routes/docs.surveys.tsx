import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/surveys")({
  head: () => ({
    meta: [
      { title: "Surveys — Noxx docs" },
      { name: "description", content: "Build a survey, share a public link, see responses live." },
    ],
  }),
  component: () => (
    <DocPage
      slug="surveys"
      icon={ClipboardList}
      title="Surveys"
      intro="Collect feedback, NPS, lead info or qualifying questions. Build a form, get a share link, and watch responses come in."
      cta={{ label: "Open Surveys", to: "/surveys" }}
    >
      <Step n={1} title="Build the survey">
        <p>
          Click <strong>New survey</strong>. Add questions of any type:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Short text · Long text · Email</li>
          <li>Single choice · Multiple choice</li>
          <li>Rating (1–5 or 1–10)</li>
        </ul>
      </Step>
      <Step n={2} title="Publish & share">
        <p>
          Hit publish — Noxx generates a public URL like <code>/s/abc123</code>. Share it via Email,
          SMS, WhatsApp, or paste it anywhere.
        </p>
        <Callout>The public page is mobile-friendly and respects your brand colors.</Callout>
      </Step>
      <Step n={3} title="See responses live">
        <p>The Surveys page shows every response in real time, with filters and CSV export.</p>
      </Step>
    </DocPage>
  ),
});
