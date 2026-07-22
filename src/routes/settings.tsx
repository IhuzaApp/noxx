import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Noxx" },
      { name: "description", content: "Manage integrations, profile and organization settings." },
    ],
  }),
  component: SettingsPage,
});

const integrations = [
  { name: "Twilio (SMS)", icon: Phone, channel: "sms", connected: true, account: "AC•••3914" },
  { name: "SendGrid (Email)", icon: Mail, channel: "email", connected: true, account: "noreply@noxx.dev" },
  { name: "WhatsApp Business", icon: MessageSquare, channel: "whatsapp", connected: false, account: "Not connected" },
  { name: "OpenAI", icon: Sparkles, channel: "ai", connected: true, account: "org-•••721" },
] as const;

function SettingsPage() {
  return (
    <AppLayout>
      <Topbar title="Settings" subtitle="Profile, organization and integrations" />
      <main className="flex-1 p-6 space-y-6 max-w-4xl">
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">Profile</h2>
          <Card className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full name" defaultValue="Alex Morgan" />
            <Field label="Email" defaultValue="alex@noxx.dev" type="email" />
            <Field label="Organization" defaultValue="Noxx Labs" />
            <Field label="Timezone" defaultValue="UTC−05:00 (New York)" />
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">Integrations</h2>
          <Card className="divide-y divide-border">
            {integrations.map((i) => {
              const Icon = i.icon;
              return (
                <div key={i.name} className="flex items-center gap-4 p-4">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    `bg-channel-${i.channel}/10 text-channel-${i.channel}`,
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{i.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{i.account}</div>
                  </div>
                  {i.connected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Connected
                    </span>
                  ) : null}
                  <button className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition",
                    i.connected
                      ? "border border-input bg-card text-foreground hover:bg-muted"
                      : "bg-foreground text-background hover:opacity-90",
                  )}>
                    {i.connected ? "Manage" : "Connect"}
                  </button>
                </div>
              );
            })}
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">Webhooks</h2>
          <Card className="p-5">
            <Field label="Endpoint URL" defaultValue="https://api.noxx.dev/webhooks/delivery" />
            <p className="mt-2 text-xs text-muted-foreground">
              Receive real-time delivery status updates for every outbound message.
            </p>
          </Card>
        </section>
      </main>
    </AppLayout>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-foreground mb-1.5">{label}</div>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
