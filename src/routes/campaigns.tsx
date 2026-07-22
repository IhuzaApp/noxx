import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Mail, MessageSquare, Phone, Calendar, Users, MousePointerClick, Send, Eye, X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card, StatCard } from "@/components/Card";
import { cn } from "@/lib/utils";
import { campaigns, segments, type Campaign } from "@/lib/campaigns";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — Noxx" },
      { name: "description", content: "Bulk email, SMS and WhatsApp campaigns with segmentation, scheduling and tracking." },
    ],
  }),
  component: CampaignsPage,
});

const channelIcon = { email: Mail, sms: Phone, whatsapp: MessageSquare } as const;
const channelColor: Record<string, string> = {
  email: "bg-channel-email/10 text-channel-email",
  sms: "bg-channel-sms/10 text-channel-sms",
  whatsapp: "bg-channel-whatsapp/10 text-channel-whatsapp",
};
const statusCls: Record<Campaign["status"], string> = {
  draft: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-info/15 text-info border-info/20",
  sending: "bg-warning/15 text-warning-foreground border-warning/30",
  sent: "bg-success/15 text-success border-success/20",
};

function CampaignsPage() {
  const [open, setOpen] = useState(false);

  return (
    <AppLayout>
      <Topbar
        title="Campaigns"
        subtitle={`${campaigns.length} campaigns · ${campaigns.filter(c => c.status === "scheduled").length} scheduled`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
          >
            <Plus className="h-4 w-4" /> New campaign
          </button>
        }
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total recipients" value={33_546} delta={8.2} icon={Users} accent="bg-primary/10 text-primary" />
          <StatCard label="Avg open rate" value="42.6" suffix="%" delta={3.1} icon={Eye} accent="bg-channel-email/10 text-channel-email" />
          <StatCard label="Avg click rate" value="11.4" suffix="%" delta={-0.6} icon={MousePointerClick} accent="bg-info/10 text-info" />
          <StatCard label="Sent this month" value={28_920} delta={14.3} icon={Send} accent="bg-success/15 text-success" />
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">All campaigns</h3>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Campaign</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Segment</th>
                  <th className="px-3 py-2.5 font-medium text-right">Audience</th>
                  <th className="px-3 py-2.5 font-medium text-right">Delivered</th>
                  <th className="px-3 py-2.5 font-medium text-right">Open</th>
                  <th className="px-3 py-2.5 font-medium text-right">Click</th>
                  <th className="px-5 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const Icon = channelIcon[c.channel];
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", channelColor[c.channel])}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-medium text-foreground">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", statusCls[c.status])}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{c.segment}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{c.audience.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{c.deliveryRate ? `${c.deliveryRate}%` : "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{c.openRate ? `${c.openRate}%` : "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{c.clickRate ? `${c.clickRate}%` : "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {c.sentAt && `Sent ${c.sentAt.toLocaleDateString()}`}
                        {c.scheduledFor && (
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {c.scheduledFor.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                        )}
                        {!c.sentAt && !c.scheduledFor && "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold text-foreground">Audience segments</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Filter customers by behavior, tags or purchase history.</p>
            <div className="mt-4 space-y-2">
              {segments.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{s.criteria}</div>
                  </div>
                  <div className="text-sm font-semibold text-foreground tabular-nums">{s.count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-foreground">Tracking & deliverability</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Combined performance across all email campaigns this month.</p>
            <div className="mt-5 space-y-4">
              {[
                { label: "Delivered", value: 99.1, color: "var(--success)" },
                { label: "Opened", value: 42.6, color: "var(--channel-email)" },
                { label: "Clicked", value: 11.4, color: "var(--info)" },
                { label: "Unsubscribed", value: 0.4, color: "var(--destructive)" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold text-foreground tabular-nums">{m.value}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, m.value)}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {open && <NewCampaignModal onClose={() => setOpen(false)} />}
    </AppLayout>
  );
}

function NewCampaignModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [segment, setSegment] = useState(segments[0].id);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
      <Card className="max-w-lg w-full p-6 shadow-elevated">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">New campaign</h3>
            <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {step === 1 && (
            <>
              <label className="block">
                <span className="text-xs font-medium text-foreground">Campaign name</span>
                <input className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="Untitled campaign" />
              </label>
              <div>
                <span className="text-xs font-medium text-foreground">Channel</span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["email", "sms", "whatsapp"] as const).map((c) => {
                    const Icon = channelIcon[c];
                    return (
                      <button
                        key={c}
                        onClick={() => setChannel(c)}
                        className={cn("rounded-md border p-3 flex flex-col items-center gap-1.5 text-xs font-medium transition capitalize",
                          channel === c ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}
                      >
                        <Icon className="h-4 w-4" />
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <div>
              <span className="text-xs font-medium text-foreground">Audience segment</span>
              <div className="mt-1.5 space-y-1.5">
                {segments.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSegment(s.id)}
                    className={cn("w-full rounded-md border px-3 py-2 text-left transition",
                      segment === s.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent/30")}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-foreground font-semibold tabular-nums">{s.count.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">{s.criteria}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <>
              <label className="block">
                <span className="text-xs font-medium text-foreground">Subject / Preview</span>
                <input className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="✨ Early access starts now" />
              </label>
              <div>
                <span className="text-xs font-medium text-foreground">Schedule</span>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button className="rounded-md border border-primary bg-primary/5 px-3 py-2 text-xs font-medium">Send now</button>
                  <button className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition">Schedule…</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={() => (step === 3 ? onClose() : setStep(step + 1))}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition"
          >
            {step === 3 ? "Create campaign" : "Continue"}
          </button>
        </div>
      </Card>
    </div>
  );
}
