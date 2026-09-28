import { createFileRoute } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import { DocPage, Step } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/tickets")({
  head: () => ({
    meta: [
      { title: "Support tickets — Noxx docs" },
      {
        name: "description",
        content: "Turn inbound messages into trackable tickets with AI-suggested replies.",
      },
    ],
  }),
  component: () => (
    <DocPage
      slug="tickets"
      icon={Ticket}
      title="Support tickets"
      intro="Every inbound message can become a ticket. Tickets carry a TKT-ID, priority, owner and AI-suggested first reply."
      cta={{ label: "Open Tickets", to: "/tickets" }}
    >
      <Step n={1} title="Create or auto-create">
        <p>
          Tickets can be created manually from any conversation, or automatically by an automation
          (e.g. "Instagram DM → Ticket").
        </p>
      </Step>
      <Step n={2} title="Triage with AI">
        <p>
          The AI suggests a first reply, sets priority, and tags the ticket. You stay in control —
          accept, edit or override.
        </p>
      </Step>
      <Step n={3} title="Resolve & report">
        <p>
          Tickets close when the conversation ends. Reports show median time-to-first-reply,
          time-to-resolve, CSAT and AI deflection rate.
        </p>
      </Step>
    </DocPage>
  ),
});
