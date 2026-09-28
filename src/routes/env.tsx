import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Eye, EyeOff, Copy, Check, Trash2, Lock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { useProject } from "@/lib/project-context";
import { envVars as initialEnvVars } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/env")({
  head: () => ({
    meta: [
      { title: "Environment Variables — Noxx" },
      { name: "description", content: "Manage per-project environment variables and secrets." },
    ],
  }),
  component: EnvPage,
});

type Env = "development" | "staging" | "production";

function EnvPage() {
  const { current } = useProject();
  const [env, setEnv] = useState<Env>(current.env);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const all = initialEnvVars[current.id] ?? [];

  const filtered = useMemo(() => all.filter((v) => v.env === env), [all, env]);

  const copy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  return (
    <AppLayout>
      <Topbar
        title="Environment Variables"
        subtitle={`${current.name} · Stored encrypted, available in flows and the playground`}
        action={
          <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft">
            <Plus className="h-4 w-4" />
            Add variable
          </button>
        }
      />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center gap-1 rounded-md border border-input bg-card p-1 w-fit shadow-soft">
          {(["development", "staging", "production"] as Env[]).map((e) => (
            <button
              key={e}
              onClick={() => setEnv(e)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded capitalize transition",
                env === e
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {e}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_120px_80px] text-[11px] font-medium text-muted-foreground bg-muted/40 px-5 py-2.5 border-b border-border uppercase tracking-wider">
            <div>Key</div>
            <div>Value</div>
            <div>Type</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-medium text-foreground">No variables yet</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a variable for the <span className="font-medium text-foreground">{env}</span>{" "}
                environment.
              </p>
            </div>
          ) : (
            filtered.map((v) => {
              const shown = revealed[v.key] || !v.secret;
              return (
                <div
                  key={v.key}
                  className="grid grid-cols-[1fr_2fr_120px_80px] items-center px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition"
                >
                  <div className="font-mono text-xs font-medium text-foreground truncate">
                    {v.key}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate flex items-center gap-2">
                    <span className="truncate">
                      {shown ? v.value : "•".repeat(Math.min(v.value.length, 24))}
                    </span>
                    {v.secret && (
                      <button
                        onClick={() => setRevealed((r) => ({ ...r, [v.key]: !r[v.key] }))}
                        className="text-muted-foreground hover:text-foreground transition shrink-0"
                      >
                        {shown ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-md border",
                        v.secret
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {v.secret ? "Secret" : "Plain"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => copy(v.key, v.value)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    >
                      {copiedKey === v.key ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <div className="rounded-xl border border-border bg-gradient-subtle p-5 text-xs text-muted-foreground">
          <div className="text-sm font-medium text-foreground mb-1">
            Reference variables anywhere
          </div>
          Use{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono">
            {"{{KEY_NAME}}"}
          </code>{" "}
          inside flow blocks, templates, and the API Playground. Secrets are never exposed in client
          logs.
        </div>
      </main>
    </AppLayout>
  );
}
