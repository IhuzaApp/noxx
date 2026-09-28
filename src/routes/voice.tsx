import { createFileRoute } from "@tanstack/react-router";
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Mic, Voicemail } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card, StatCard } from "@/components/Card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice Support — Noxx" },
      {
        name: "description",
        content:
          "Inbound and outbound voice calls handled directly from the dashboard, with AI transcription and call logs.",
      },
    ],
  }),
  component: VoicePage,
});

const calls = [
  {
    id: "v1",
    direction: "in",
    caller: "Alice Chen",
    number: "+1 (415) 555-0143",
    duration: "4:12",
    agent: "AI Agent → Maya R.",
    status: "Resolved",
    at: "2m ago",
  },
  {
    id: "v2",
    direction: "out",
    caller: "James Patel",
    number: "+44 7700 900812",
    duration: "1:48",
    agent: "Maya R.",
    status: "Voicemail",
    at: "22m ago",
  },
  {
    id: "v3",
    direction: "in",
    caller: "Léa Dubois",
    number: "+33 6 12 34 56 78",
    duration: "8:03",
    agent: "AI Agent",
    status: "AI handled",
    at: "1h ago",
  },
  {
    id: "v4",
    direction: "in",
    caller: "Marcus Kim",
    number: "+1 (628) 555-0199",
    duration: "0:42",
    agent: "—",
    status: "Missed",
    at: "3h ago",
  },
];

function VoicePage() {
  return (
    <AppLayout>
      <Topbar
        title="Voice Support"
        subtitle="Handle phone calls alongside chat — with transcripts and AI assist"
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Calls today"
            value={48}
            delta={6.4}
            icon={Phone}
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            label="Avg. duration"
            value="3:24"
            icon={PhoneCall}
            accent="bg-info/10 text-info"
          />
          <StatCard
            label="AI handled"
            value="62"
            suffix="%"
            delta={4.1}
            icon={Mic}
            accent="bg-channel-ai/10 text-channel-ai"
          />
          <StatCard
            label="Voicemails"
            value={7}
            delta={-2.0}
            icon={Voicemail}
            accent="bg-warning/15 text-warning-foreground"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent calls</h3>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition">
              <PhoneOutgoing className="h-3 w-3" /> New call
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="px-5 py-2.5 font-medium">Caller</th>
                <th className="px-3 py-2.5 font-medium">Direction</th>
                <th className="px-3 py-2.5 font-medium">Duration</th>
                <th className="px-3 py-2.5 font-medium">Handled by</th>
                <th className="px-3 py-2.5 font-medium">Outcome</th>
                <th className="px-5 py-2.5 font-medium text-right">When</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/20">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{c.caller}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{c.number}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs",
                        c.direction === "in" ? "text-success" : "text-info",
                      )}
                    >
                      {c.direction === "in" ? (
                        <PhoneIncoming className="h-3 w-3" />
                      ) : (
                        <PhoneOutgoing className="h-3 w-3" />
                      )}
                      {c.direction === "in" ? "Inbound" : "Outbound"}
                    </span>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-foreground">{c.duration}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.agent}</td>
                  <td className="px-3 py-3 text-foreground">{c.status}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground text-xs">{c.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground">AI call assist</h3>
          <p className="text-xs text-muted-foreground mt-1">
            During live calls, the AI agent suggests next-best replies, looks up customer context
            and can transfer to a human at any time.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" /> Real-time
              transcription with speaker labels
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-info shrink-0" /> Auto-generated
              call summaries pinned to the contact
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-channel-ai shrink-0" /> One-click
              handoff from AI Agent to human
            </li>
          </ul>
        </Card>
      </main>
    </AppLayout>
  );
}
