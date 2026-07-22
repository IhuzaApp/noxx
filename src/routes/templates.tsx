import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Mail, MessageSquare, Sparkles, Plus, Copy, Workflow, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { channelMeta, templates, type Channel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — Noxx" },
      { name: "description", content: "Reusable single-channel templates and prebuilt omnichannel flow templates." },
    ],
  }),
  component: TemplatesPage,
});

const channelIcons = { sms: Phone, email: Mail, whatsapp: MessageSquare, ai: Sparkles };

type OmnichannelTemplate = {
  id: string;
  name: string;
  description: string;
  steps: Array<{ channel: Channel; label: string; kind?: "primary" | "fallback" | "wait" | "branch" }>;
  uses: number;
};

const omnichannelTemplates: OmnichannelTemplate[] = [
  {
    id: "ot1",
    name: "OTP with SMS fallback",
    description: "Send a one-time code over WhatsApp, fall back to SMS if not delivered in 30 seconds.",
    steps: [
      { channel: "whatsapp", label: "Send OTP via WhatsApp", kind: "primary" },
      { channel: "sms", label: "Fallback: Send via SMS", kind: "fallback" },
    ],
    uses: 18402,
  },
  {
    id: "ot2",
    name: "Order notification (WhatsApp + Email backup)",
    description: "Notify shipping over WhatsApp; if not delivered in 5 minutes, send a richer Email backup.",
    steps: [
      { channel: "whatsapp", label: "Send shipping update", kind: "primary" },
      { channel: "email", label: "Fallback: Email with tracking link", kind: "fallback" },
    ],
    uses: 9201,
  },
  {
    id: "ot3",
    name: "Appointment reminder with follow-ups",
    description: "Email reminder, then WhatsApp 1h before, SMS 15 min before if still no response.",
    steps: [
      { channel: "email", label: "Send Email reminder (24h before)", kind: "primary" },
      { channel: "whatsapp", label: "WhatsApp nudge (1h before)", kind: "primary" },
      { channel: "sms", label: "SMS reminder if no reply (15m before)", kind: "fallback" },
    ],
    uses: 6541,
  },
  {
    id: "ot4",
    name: "AI support with human handoff",
    description: "AI replies first; if user is unsatisfied, escalate to support over WhatsApp.",
    steps: [
      { channel: "ai", label: "AI auto-respond", kind: "primary" },
      { channel: "whatsapp", label: "Escalate to support agent", kind: "branch" },
    ],
    uses: 2103,
  },
];

function TemplatesPage() {
  return (
    <AppLayout>
      <Topbar
        title="Templates"
        subtitle="Prebuilt omnichannel flows and reusable single-channel messages"
        action={
          <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft">
            <Plus className="h-4 w-4" />
            New template
          </button>
        }
      />
      <main className="flex-1 p-6 space-y-8">
        {/* Omnichannel flow templates */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Omnichannel flows</div>
              <h2 className="mt-1 text-base font-semibold text-foreground">Prebuilt flow templates</h2>
              <p className="text-xs text-muted-foreground">One-click recipes that combine multiple channels with smart fallback.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {omnichannelTemplates.map((t) => (
              <Card key={t.id} className="p-5 hover:shadow-elevated transition group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <Workflow className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {t.steps.map((s, i) => {
                    const Icon = channelIcons[s.channel];
                    const meta = channelMeta[s.channel];
                    return (
                      <span key={i} className="inline-flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium",
                            meta.bg,
                            meta.color,
                            s.kind === "fallback" ? "border-warning/40 border-dashed" : "border-border",
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                          {s.kind === "fallback" && (
                            <span className="text-[9px] uppercase tracking-wider text-warning-foreground/80 font-semibold">
                              fallback
                            </span>
                          )}
                        </span>
                        {i < t.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.uses.toLocaleString()} uses</span>
                  <Link
                    to="/flows"
                    className="inline-flex items-center gap-1 rounded-md bg-foreground text-background px-3 py-1.5 font-medium hover:opacity-90 transition shadow-soft"
                  >
                    Use template
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Single-channel templates */}
        <section>
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Single-channel</div>
            <h2 className="mt-1 text-base font-semibold text-foreground">Message templates</h2>
            <p className="text-xs text-muted-foreground">Reusable, variable-driven messages for individual channels.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => {
              const Icon = channelIcons[t.channel];
              const meta = channelMeta[t.channel];
              return (
                <Card key={t.id} className="p-5 hover:shadow-elevated transition cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", meta.bg, meta.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wide", meta.bg, meta.color)}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-4 text-sm font-semibold text-foreground">{t.name}</div>
                  <pre className="mt-2 text-xs text-muted-foreground font-mono whitespace-pre-wrap line-clamp-3 bg-muted/40 rounded-md p-2 border border-border">
                    {t.body}
                  </pre>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.uses.toLocaleString()} uses</span>
                    <button className="inline-flex items-center gap-1 text-foreground opacity-0 group-hover:opacity-100 transition">
                      <Copy className="h-3 w-3" />
                      Duplicate
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
