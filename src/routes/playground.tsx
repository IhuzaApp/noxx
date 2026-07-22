import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Send,
  Save,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { useProject } from "@/lib/project-context";
import { savedRequests } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "API Playground — Noxx" },
      { name: "description", content: "Test endpoints, save requests and switch environments." },
    ],
  }),
  component: PlaygroundPage,
});

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type KV = { id: string; key: string; value: string; on: boolean };

const methodColors: Record<Method, string> = {
  GET: "text-success",
  POST: "text-primary",
  PUT: "text-warning-foreground",
  PATCH: "text-info",
  DELETE: "text-destructive",
};

function PlaygroundPage() {
  const { current } = useProject();
  const [method, setMethod] = useState<Method>("POST");
  const [url, setUrl] = useState("https://api.noxx.dev/v1/send");
  const [tab, setTab] = useState<"params" | "headers" | "body" | "auth">("body");
  const [params, setParams] = useState<KV[]>([{ id: "1", key: "limit", value: "10", on: true }]);
  const [headers, setHeaders] = useState<KV[]>([
    { id: "1", key: "Content-Type", value: "application/json", on: true },
    { id: "2", key: "Authorization", value: "Bearer {{API_KEY}}", on: true },
  ]);
  const [body, setBody] = useState(
    `{
  "channel": "whatsapp",
  "to": "+14155550143",
  "template": "order_shipped",
  "vars": { "order_id": "A2391" }
}`,
  );
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<null | {
    status: number;
    time: number;
    size: string;
    body: string;
  }>({
    status: 200,
    time: 184,
    size: "412 B",
    body: `{
  "id": "msg_2k8af1",
  "channel": "whatsapp",
  "to": "+14155550143",
  "status": "queued",
  "created_at": "${new Date().toISOString()}"
}`,
  });
  const [copied, setCopied] = useState(false);

  const send = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setResponse({
        status: 200,
        time: Math.round(120 + Math.random() * 180),
        size: `${300 + Math.round(Math.random() * 200)} B`,
        body: `{
  "id": "msg_${Math.random().toString(36).slice(2, 8)}",
  "channel": "whatsapp",
  "to": "+14155550143",
  "status": "queued",
  "created_at": "${new Date().toISOString()}"
}`,
      });
    }, 700);
  };

  const copy = () => {
    if (response) {
      navigator.clipboard?.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <AppLayout>
      <Topbar
        title="API Playground"
        subtitle={`${current.name} · Test endpoints and save requests`}
        action={
          <button className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition shadow-soft">
            <Save className="h-4 w-4" />
            Save
          </button>
        }
      />
      <main className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Saved requests */}
        <aside className="col-span-12 lg:col-span-2 border-r border-border bg-card/50 p-3 overflow-auto">
          <div className="px-2 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Collection
            </span>
            <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {savedRequests.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setMethod(r.method);
                  setUrl(`https://api.noxx.dev${r.path}`);
                }}
                className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent/40 transition"
              >
                <span className={cn("text-[10px] font-bold w-9 shrink-0", methodColors[r.method])}>
                  {r.method}
                </span>
                <span className="text-xs text-foreground truncate">{r.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Request + Response */}
        <div className="col-span-12 lg:col-span-10 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          {/* URL bar */}
          <div className="border-b border-border bg-background p-4">
            <div className="flex items-center gap-2 rounded-md border border-input bg-card shadow-soft overflow-hidden">
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as Method)}
                  className={cn(
                    "appearance-none bg-transparent pl-3 pr-7 py-2.5 text-sm font-bold outline-none cursor-pointer",
                    methodColors[method],
                  )}
                >
                  {(["GET", "POST", "PUT", "PATCH", "DELETE"] as Method[]).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="h-6 w-px bg-border" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-transparent px-2 py-2.5 text-sm font-mono text-foreground outline-none"
                placeholder="https://api.noxx.dev/v1/..."
              />
              <button
                onClick={send}
                disabled={sending}
                className="m-1 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex items-center gap-1 border-b border-border">
              {(["params", "headers", "body", "auth"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium capitalize border-b-2 transition -mb-px",
                    tab === t
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-3">
              {tab === "params" && <KVEditor rows={params} setRows={setParams} keyLabel="Param" />}
              {tab === "headers" && <KVEditor rows={headers} setRows={setHeaders} keyLabel="Header" />}
              {tab === "body" && (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30"
                  spellCheck={false}
                />
              )}
              {tab === "auth" && (
                <div className="rounded-md border border-input bg-card p-4 text-xs">
                  <div className="text-foreground font-medium mb-2">Bearer token</div>
                  <input
                    defaultValue="{{API_KEY}}"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="mt-2 text-muted-foreground">
                    Use <code className="text-foreground">{"{{VAR}}"}</code> to reference env variables from this project.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          <div className="flex-1 overflow-auto bg-muted/20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Response</span>
                  {response && (
                    <>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md font-medium border",
                        response.status < 300
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20",
                      )}>
                        {response.status} OK
                      </span>
                      <span className="text-muted-foreground">{response.time} ms</span>
                      <span className="text-muted-foreground">{response.size}</span>
                    </>
                  )}
                </div>
                {response && (
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              {response ? (
                <pre className="rounded-lg border border-border bg-card p-4 text-xs font-mono text-foreground overflow-auto shadow-soft">
                  {response.body}
                </pre>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Send a request to see the response
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

function KVEditor({
  rows,
  setRows,
  keyLabel,
}: {
  rows: KV[];
  setRows: (rows: KV[]) => void;
  keyLabel: string;
}) {
  const update = (id: string, patch: Partial<KV>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows(rows.filter((r) => r.id !== id));
  const add = () =>
    setRows([...rows, { id: Math.random().toString(36).slice(2), key: "", value: "", on: true }]);

  return (
    <div className="rounded-md border border-input bg-card overflow-hidden">
      <div className="grid grid-cols-[28px_1fr_1fr_28px] text-[11px] font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 border-b border-border">
        <div></div>
        <div>{keyLabel}</div>
        <div>Value</div>
        <div></div>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="grid grid-cols-[28px_1fr_1fr_28px] items-center px-3 py-1 border-b border-border last:border-b-0">
          <input
            type="checkbox"
            checked={r.on}
            onChange={(e) => update(r.id, { on: e.target.checked })}
            className="h-3.5 w-3.5 accent-[oklch(0.52_0.21_277)]"
          />
          <input
            value={r.key}
            onChange={(e) => update(r.id, { key: e.target.value })}
            placeholder="key"
            className="bg-transparent text-xs font-mono outline-none px-1 py-1.5"
          />
          <input
            value={r.value}
            onChange={(e) => update(r.id, { value: e.target.value })}
            placeholder="value"
            className="bg-transparent text-xs font-mono outline-none px-1 py-1.5"
          />
          <button
            onClick={() => remove(r.id)}
            className="text-muted-foreground hover:text-destructive transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}
