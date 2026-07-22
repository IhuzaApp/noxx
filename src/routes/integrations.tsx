import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, Search, X, ExternalLink, Shield } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { integrations, type Integration } from "@/lib/integrations";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Noxx" },
      { name: "description", content: "Connect WhatsApp, Instagram, Email, SMS, AI and payment providers in one click." },
    ],
  }),
  component: IntegrationsPage,
});

const cats = ["All", "Messaging", "Email", "Social", "AI", "Payments", "Webhooks"] as const;
type Cat = (typeof cats)[number];

const statusMeta = {
  connected: { label: "Connected", cls: "bg-success/15 text-success border-success/20" },
  available: { label: "Available", cls: "bg-muted text-muted-foreground border-border" },
  "needs-attention": { label: "Action needed", cls: "bg-warning/20 text-warning-foreground border-warning/30" },
} as const;

function IntegrationsPage() {
  const [cat, setCat] = useState<Cat>("All");
  const [q, setQ] = useState("");
  const [connecting, setConnecting] = useState<Integration | null>(null);

  const list = useMemo(
    () =>
      integrations.filter(
        (i) =>
          (cat === "All" || i.category === cat) &&
          (q === "" || i.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [cat, q],
  );

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <AppLayout>
      <Topbar
        title="Integrations"
        subtitle={`${connectedCount} of ${integrations.length} services connected`}
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">Connected</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{connectedCount}</div>
            <div className="mt-1 text-xs text-success">All healthy</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">Action needed</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {integrations.filter((i) => i.status === "needs-attention").length}
            </div>
            <div className="mt-1 text-xs text-warning-foreground">Resend domain DKIM pending</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">Available to connect</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {integrations.filter((i) => i.status === "available").length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Add more channels & providers</div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm w-full md:w-72 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search integrations…"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition border",
                  cat === c
                    ? "bg-foreground text-background border-transparent"
                    : "bg-card text-muted-foreground border-border hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((i) => {
            const Icon = i.icon;
            const sm = statusMeta[i.status];
            return (
              <Card key={i.id} className="p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center shrink-0", i.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{i.name}</h3>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap", sm.cls)}>
                        {sm.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{i.category} · {i.authType}</div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{i.description}</p>
                {i.connectedAccount && (
                  <div className="mt-3 rounded-md bg-muted px-2.5 py-1.5 text-[11px] text-foreground font-mono truncate">
                    {i.connectedAccount}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <a className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1" href="#">
                    Docs <ExternalLink className="h-3 w-3" />
                  </a>
                  {i.status === "connected" ? (
                    <button className="text-xs font-medium text-muted-foreground hover:text-destructive transition">
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => setConnecting(i)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition"
                    >
                      <Plus className="h-3 w-3" /> Connect
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Connect modal (mock) */}
      {connecting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full p-6 shadow-elevated">
            <div className="flex items-start gap-3">
              <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center shrink-0", connecting.color)}>
                <connecting.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">Connect {connecting.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{connecting.authType} · {connecting.category}</p>
              </div>
              <button onClick={() => setConnecting(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {connecting.authType === "API key" ? (
              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-foreground">API Key</span>
                  <input
                    placeholder={`Paste your ${connecting.name} key…`}
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Shield className="h-3 w-3" /> Stored encrypted, only used server-side.
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
                <p className="text-sm text-foreground">You'll be redirected to <span className="font-semibold">{connecting.name}</span> to authorize Noxx.</p>
                <p className="text-xs text-muted-foreground mt-1">We only request the scopes needed to send and receive messages.</p>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2">
              <button onClick={() => setConnecting(null)} className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition">
                Cancel
              </button>
              <button
                onClick={() => setConnecting(null)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition"
              >
                <Check className="h-3.5 w-3.5" />
                {connecting.authType === "OAuth" ? "Continue" : "Connect"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
