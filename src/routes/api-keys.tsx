import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw, Trash2, Plus, KeyRound, Eye, EyeOff, Check } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { apiKeys } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const Route = createFileRoute("/api-keys")({
  head: () => ({
    meta: [
      { title: "API Keys — Noxx" },
      { name: "description", content: "Generate, copy and rotate API keys for your Noxx workspace." },
    ],
  }),
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string, key: string) => {
    navigator.clipboard?.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AppLayout>
      <Topbar
        title="API Keys"
        subtitle="Authenticate requests to the Noxx API"
        action={
          <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft">
            <Plus className="h-4 w-4" />
            Create key
          </button>
        }
      />
      <main className="flex-1 p-6 space-y-6">
        <Card className="p-5 bg-gradient-subtle">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Keep your secret keys safe</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                Treat live keys like passwords. Don't paste them in client-side code or share in
                public repos. Rotate immediately if you suspect a leak.
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground bg-muted/50">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Key</th>
                  <th className="px-5 py-3 font-medium">Requests</th>
                  <th className="px-5 py-3 font-medium">Last used</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apiKeys.map((k) => {
                  const isRevealed = reveal[k.id];
                  const masked = `${k.key.slice(0, 11)}${"•".repeat(18)}${k.key.slice(-4)}`;
                  return (
                    <tr key={k.id} className="hover:bg-muted/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{k.name}</span>
                          <span
                            className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded-md uppercase tracking-wide",
                              k.env === "live"
                                ? "bg-success/15 text-success"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {k.env}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">
                            {isRevealed ? k.key : masked}
                          </code>
                          <button
                            onClick={() => setReveal((r) => ({ ...r, [k.id]: !r[k.id] }))}
                            className="text-muted-foreground hover:text-foreground transition"
                            aria-label="Toggle reveal"
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => copy(k.id, k.key)}
                            className="text-muted-foreground hover:text-foreground transition"
                            aria-label="Copy key"
                          >
                            {copied === k.id ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-foreground">{k.requests.toLocaleString()}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {format(k.lastUsed, "MMM d, HH:mm")}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {format(k.created, "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition" aria-label="Rotate">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition" aria-label="Revoke">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </AppLayout>
  );
}
