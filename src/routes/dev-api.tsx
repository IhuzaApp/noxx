import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Code2, Copy, Webhook, Check, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dev-api")({
  head: () => ({
    meta: [
      { title: "Developer API — Noxx" },
      {
        name: "description",
        content:
          "REST API reference, webhook subscriptions and SDK snippets for the Noxx platform.",
      },
    ],
  }),
  component: DevApiPage,
});

const endpoints = [
  { method: "POST", path: "/v1/messages", desc: "Send a message on any channel" },
  { method: "POST", path: "/v1/flows/{id}/run", desc: "Trigger a flow with custom data" },
  { method: "GET", path: "/v1/messages", desc: "List messages with filters" },
  { method: "GET", path: "/v1/messages/{id}", desc: "Get delivery status" },
  { method: "POST", path: "/v1/contacts", desc: "Create or upsert a contact" },
  { method: "POST", path: "/v1/payments/request", desc: "Create a payment request" },
];

const methodCls: Record<string, string> = {
  GET: "bg-info/15 text-info border-info/20",
  POST: "bg-success/15 text-success border-success/20",
  PUT: "bg-warning/15 text-warning-foreground border-warning/30",
  DELETE: "bg-destructive/15 text-destructive border-destructive/20",
};

const webhooks = [
  { event: "message.delivered", url: "https://acme.shop/hooks/noxx/delivered", active: true },
  { event: "message.failed", url: "https://acme.shop/hooks/noxx/failed", active: true },
  { event: "message.received", url: "https://acme.shop/hooks/noxx/inbound", active: true },
  { event: "payment.succeeded", url: "https://acme.shop/hooks/noxx/pay-ok", active: false },
];

const sample = `curl https://api.noxx.dev/v1/messages \\
  -H "Authorization: Bearer sk_live_•••••2yR4wT6" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "whatsapp",
    "to": "+14155550143",
    "template": "order_shipped",
    "variables": {
      "name": "Alice",
      "order_id": "A2391"
    }
  }'`;

function DevApiPage() {
  const [copied, setCopied] = useState(false);

  return (
    <AppLayout>
      <Topbar
        title="Developer API"
        subtitle="REST endpoints, webhooks and SDKs to build on top of Noxx"
        action={
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
          >
            <BookOpen className="h-4 w-4" /> Full reference
          </a>
        }
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Code2 className="h-3.5 w-3.5" /> Quickstart · Send WhatsApp
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(sample);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
              >
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-5 text-[12px] leading-relaxed font-mono text-foreground overflow-x-auto">
              {sample}
            </pre>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-foreground">Authentication</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Pass your API key in the{" "}
              <code className="text-[10px] bg-muted px-1 py-0.5 rounded">Authorization</code>{" "}
              header.
            </p>
            <div className="mt-3 rounded-md bg-foreground text-background text-[11px] p-3 font-mono">
              Authorization: Bearer sk_live_•••••
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Test keys start with{" "}
              <code className="text-[10px] bg-muted px-1 py-0.5 rounded">sk_test_</code> and run in
              sandbox mode (no real messages sent).
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Endpoints</h3>
          </div>
          <ul className="divide-y divide-border">
            {endpoints.map((e) => (
              <li
                key={e.path}
                className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition"
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded border w-12 text-center",
                    methodCls[e.method],
                  )}
                >
                  {e.method}
                </span>
                <code className="text-sm font-mono text-foreground">{e.path}</code>
                <span className="text-xs text-muted-foreground ml-auto">{e.desc}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Webhook className="h-4 w-4" /> Webhooks
              </h3>
              <p className="text-xs text-muted-foreground">
                Receive real-time events about messages, flows and payments.
              </p>
            </div>
            <button className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition">
              Add endpoint
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="px-5 py-2.5 font-medium">Event</th>
                <th className="px-3 py-2.5 font-medium">URL</th>
                <th className="px-5 py-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((w) => (
                <tr key={w.event} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <code className="text-xs font-mono text-foreground">{w.event}</code>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground truncate">
                    {w.url}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                        w.active
                          ? "bg-success/15 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {w.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </AppLayout>
  );
}
