import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall } from "lucide-react";
import { DocPage, Step } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/voice")({
  head: () => ({
    meta: [
      { title: "Voice support — Noxx docs" },
      {
        name: "description",
        content: "Inbound and outbound calls with live transcription and AI summaries.",
      },
    ],
  }),
  component: () => (
    <DocPage
      slug="voice"
      icon={PhoneCall}
      title="Voice support"
      intro="Make and receive calls inside Noxx. Every call gets live transcription and an AI summary attached to the contact."
      cta={{ label: "Open Voice", to: "/voice" }}
    >
      <Step n={1} title="Buy a number">
        <p>
          Open Voice and pick a number from any country you operate in. Numbers can be SMS-capable
          too.
        </p>
      </Step>
      <Step n={2} title="Inbound flows">
        <p>
          Route inbound calls through a flow — IVR, business-hours check, AI agent or hand-off to a
          human.
        </p>
      </Step>
      <Step n={3} title="Outbound dial">
        <p>
          Click any contact to dial them. Transcription streams as the call runs; the AI summary
          lands in the contact's timeline when it ends.
        </p>
      </Step>
    </DocPage>
  ),
});
