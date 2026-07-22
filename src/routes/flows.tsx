import { useCallback, useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
} from "reactflow";
import {
  Webhook,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Clock,
  GitBranch,
  Play,
  Save,
  PowerOff,
  Power,
  Plus,
  Info,
  Bot,
  CreditCard,
  Instagram,
  Square,
  TerminalSquare,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { FlowNode, type FlowNodeData, type ChannelKind } from "@/components/flow/FlowNode";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/flows")({
  head: () => ({
    meta: [
      { title: "Flow Builder — Noxx" },
      { name: "description", content: "Visually design omnichannel flows with channel fallback, retries and behavior-based branching." },
    ],
  }),
  component: FlowsPage,
});

const nodeTypes = { flow: FlowNode };

type EdgeKind = "default" | "fallback" | "delivered" | "not-delivered" | "no-response" | "yes" | "no";

const edgeStyles: Record<EdgeKind, { stroke: string; label?: string; bg?: string }> = {
  default: { stroke: "var(--border)" },
  fallback: { stroke: "var(--warning)", label: "Fallback", bg: "var(--warning)" },
  delivered: { stroke: "var(--success)", label: "If Delivered", bg: "var(--success)" },
  "not-delivered": { stroke: "var(--destructive)", label: "If Not Delivered", bg: "var(--destructive)" },
  "no-response": { stroke: "var(--info)", label: "If No Response", bg: "var(--info)" },
  yes: { stroke: "var(--success)", label: "Yes", bg: "var(--success)" },
  no: { stroke: "var(--destructive)", label: "No", bg: "var(--destructive)" },
};

function makeEdge(id: string, source: string, target: string, kind: EdgeKind, animated = false): Edge {
  const s = edgeStyles[kind];
  return {
    id,
    source,
    target,
    animated,
    type: "smoothstep",
    label: s.label,
    labelStyle: { fontSize: 10, fontWeight: 600, fill: "var(--foreground)" },
    labelBgStyle: { fill: "var(--card)", stroke: s.bg ?? s.stroke, strokeWidth: 1 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 6,
    style: { stroke: s.stroke, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: s.stroke },
    data: { kind },
  };
}

const initialNodes: Node<FlowNodeData>[] = [
  {
    id: "1",
    type: "flow",
    position: { x: 320, y: 20 },
    data: { kind: "trigger", label: "Order placed", detail: "POST /v1/events/order_placed" },
  },
  {
    id: "2",
    type: "flow",
    position: { x: 320, y: 180 },
    data: {
      kind: "whatsapp",
      label: "Send WhatsApp",
      detail: "Template: order_shipped",
      fallback: "sms",
      retryMinutes: 5,
    },
  },
  {
    id: "3",
    type: "flow",
    position: { x: 320, y: 400 },
    data: { kind: "condition", label: "Did customer reply?", detail: "Wait up to 1 hour for inbound" },
  },
  {
    id: "4",
    type: "flow",
    position: { x: 60, y: 580 },
    data: { kind: "ai", label: "AI auto-respond", detail: "Answer using order context" },
  },
  {
    id: "5",
    type: "flow",
    position: { x: 580, y: 580 },
    data: { kind: "delay", label: "Wait 1 hour", detail: "60 minutes" },
  },
  {
    id: "6",
    type: "flow",
    position: { x: 580, y: 740 },
    data: { kind: "email", label: "Send reminder email", detail: "Template: gentle_reminder" },
  },
];

const initialEdges: Edge[] = [
  makeEdge("e1-2", "1", "2", "default"),
  makeEdge("e2-3", "2", "3", "delivered"),
  makeEdge("e3-4", "3", "4", "yes"),
  makeEdge("e3-5", "3", "5", "no-response"),
  makeEdge("e5-6", "5", "6", "default"),
];

const palette: Array<{ kind: FlowNodeData["kind"]; label: string; icon: typeof Webhook; group: string }> = [
  { kind: "trigger", label: "API trigger", icon: Webhook, group: "Triggers" },
  { kind: "whatsapp", label: "Send WhatsApp", icon: MessageSquare, group: "Channels" },
  { kind: "instagram", label: "Send Instagram", icon: Instagram, group: "Channels" },
  { kind: "sms", label: "Send SMS", icon: Phone, group: "Channels" },
  { kind: "email", label: "Send Email", icon: Mail, group: "Channels" },
  { kind: "agent", label: "AI Agent", icon: Bot, group: "AI" },
  { kind: "ai", label: "AI response", icon: Sparkles, group: "AI" },
  { kind: "payment", label: "Request payment", icon: CreditCard, group: "Actions" },
  { kind: "delay", label: "Delay", icon: Clock, group: "Logic" },
  { kind: "condition", label: "Behavior branch", icon: GitBranch, group: "Logic" },
];

const channelKindAccent: Record<ChannelKind, string> = {
  sms: "bg-channel-sms/10 text-channel-sms",
  email: "bg-channel-email/10 text-channel-email",
  whatsapp: "bg-channel-whatsapp/10 text-channel-whatsapp",
  instagram: "bg-channel-ai/10 text-channel-ai",
  ai: "bg-channel-ai/10 text-channel-ai",
};

function FlowsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("2");
  const [active, setActive] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [logs, setLogs] = useState<Array<{ t: string; msg: string; kind: "info" | "ok" | "warn" }>>([]);
  const [showLogs, setShowLogs] = useState(false);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge(makeEdge(`e_${Date.now()}`, params.source!, params.target!, "default"), eds)),
    [setEdges],
  );

  const addNode = (kind: FlowNodeData["kind"], label: string) => {
    const id = `n_${Date.now()}`;
    setNodes((ns) => [
      ...ns,
      {
        id,
        type: "flow",
        position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
        data: { kind, label, detail: "Click to configure" },
      },
    ]);
  };

  const selected = useMemo(() => nodes.find((n) => n.id === selectedId), [nodes, selectedId]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof palette> = {};
    palette.forEach((p) => {
      g[p.group] = g[p.group] || [];
      g[p.group].push(p);
    });
    return g;
  }, []);

  // Simulation: highlight nodes & edges + emit live test logs
  const simulate = () => {
    setSimulating(true);
    setShowLogs(true);
    setLogs([]);
    const path = ["1", "2", "3", "5", "6"];
    const edgePath = ["e1-2", "e2-3", "e3-5", "e5-6"];
    const messages: Array<{ msg: string; kind: "info" | "ok" | "warn" }> = [
      { msg: "Trigger received: POST /v1/events/order_placed", kind: "info" },
      { msg: "WhatsApp 'order_shipped' sent → delivered (412ms)", kind: "ok" },
      { msg: "Behavior branch: waiting for inbound reply (60m)", kind: "info" },
      { msg: "No reply within window → fallback path", kind: "warn" },
      { msg: "Reminder email queued via Resend", kind: "ok" },
    ];
    let i = 0;
    const tick = () => {
      const activeNodes = path.slice(0, i + 1);
      const activeEdges = edgePath.slice(0, i);
      setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, active: activeNodes.includes(n.id) } })));
      setEdges((es) => es.map((e) => ({ ...e, animated: activeEdges.includes(e.id) })));
      if (i < messages.length) {
        const m = messages[i];
        setLogs((l) => [...l, { t: new Date().toLocaleTimeString(), ...m }]);
      }
      i++;
      if (i <= path.length) {
        setTimeout(tick, 700);
      } else {
        setTimeout(() => {
          setLogs((l) => [...l, { t: new Date().toLocaleTimeString(), msg: "Run complete · 5 steps · 0 errors", kind: "ok" }]);
          setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, active: false } })));
          setEdges((es) => es.map((e) => ({ ...e, animated: false })));
          setSimulating(false);
        }, 900);
      }
    };
    tick();
  };

  // Update inspector edits back into the node
  const updateSelected = (patch: Partial<FlowNodeData>) => {
    if (!selectedId) return;
    setNodes((ns) =>
      ns.map((n) => (n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n)),
    );
  };

  return (
    <AppLayout>
      <Topbar
        title="Order shipped notification"
        subtitle="Omnichannel · Last edited 4 minutes ago · Draft"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={simulate}
              disabled={simulating}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition shadow-soft disabled:opacity-60"
            >
              <Play className="h-4 w-4" />
              {simulating ? "Simulating…" : "Simulate"}
            </button>
            <button
              onClick={() => setActive((a) => !a)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition shadow-soft",
                active
                  ? "bg-success/15 text-success border border-success/30"
                  : "bg-muted text-muted-foreground border border-border",
              )}
            >
              {active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
              {active ? "Active" : "Inactive"}
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft">
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        }
      />
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Palette */}
        <aside className="col-span-12 lg:col-span-2 border-r border-border bg-card/50 p-4 overflow-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Add block
          </div>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-5">
              <div className="text-[11px] font-medium text-muted-foreground mb-2">{group}</div>
              <div className="space-y-1.5">
                {items.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.kind}
                      onClick={() => addNode(p.kind, p.label)}
                      className="group w-full flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-accent/40 transition"
                    >
                      <span className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center",
                        p.kind === "trigger" && "bg-primary/10 text-primary",
                        p.kind === "sms" && "bg-channel-sms/10 text-channel-sms",
                        p.kind === "email" && "bg-channel-email/10 text-channel-email",
                        p.kind === "whatsapp" && "bg-channel-whatsapp/10 text-channel-whatsapp",
                        p.kind === "instagram" && "bg-channel-ai/10 text-channel-ai",
                        p.kind === "ai" && "bg-channel-ai/10 text-channel-ai",
                        p.kind === "agent" && "bg-channel-ai/15 text-channel-ai",
                        p.kind === "payment" && "bg-success/15 text-success",
                        p.kind === "delay" && "bg-warning/15 text-warning-foreground",
                        p.kind === "condition" && "bg-info/10 text-info",
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 text-left">{p.label}</span>
                      <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Edge legend */}
          <div className="mt-6 rounded-lg border border-border bg-background p-3">
            <div className="text-[11px] font-semibold text-foreground mb-2">Connection types</div>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <LegendRow color="var(--success)" label="If Delivered" />
              <LegendRow color="var(--destructive)" label="If Not Delivered" />
              <LegendRow color="var(--info)" label="If No Response" />
              <LegendRow color="var(--warning)" label="Fallback" />
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div className="col-span-12 lg:col-span-7 relative h-[calc(100vh-4rem)]">
          {simulating && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-foreground text-background px-4 py-1.5 text-xs font-medium shadow-elevated flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Simulating active path…
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, n) => setSelectedId(n.id)}
            onPaneClick={() => setSelectedId(null)}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} color="var(--border)" />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(n) => {
                const kind = (n.data as FlowNodeData).kind;
                if (kind === "sms") return "var(--channel-sms)";
                if (kind === "email") return "var(--channel-email)";
                if (kind === "whatsapp") return "var(--channel-whatsapp)";
                if (kind === "ai") return "var(--channel-ai)";
                if (kind === "delay") return "var(--warning)";
                if (kind === "condition") return "var(--info)";
                return "var(--primary)";
              }}
              maskColor="oklch(0.97 0.005 264 / 0.7)"
              pannable
              zoomable
            />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <aside className="col-span-12 lg:col-span-3 border-l border-border bg-card/50 p-5 overflow-auto h-[calc(100vh-4rem)]">
          {selected ? (
            <>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Configure block
              </div>
              <div className="mt-3 text-base font-semibold text-foreground">
                {selected.data.label}
              </div>
              <div className="text-xs text-muted-foreground">{selected.data.detail}</div>

              <div className="mt-5 space-y-4">
                <Field label="Block name">
                  <input
                    value={selected.data.label}
                    onChange={(e) => updateSelected({ label: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </Field>

                {(["sms", "email", "whatsapp", "ai"] as const).includes(selected.data.kind as never) && (
                  <>
                    <Field label="Recipient">
                      <input
                        placeholder="{{user.phone}} or you@example.com"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </Field>
                    <Field label="Message">
                      <textarea
                        rows={4}
                        defaultValue="Hi {{name}}, your order {{order_id}} has shipped 🚚"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      />
                    </Field>

                    {/* Omnichannel: fallback */}
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">Fallback channel</span>
                        <Tooltip text="If the primary channel fails or isn't delivered in time, automatically retry on this channel." />
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["sms", "email", "whatsapp", "ai"] as ChannelKind[])
                          .filter((c) => c !== selected.data.kind)
                          .map((c) => {
                            const isSelected = selected.data.fallback === c;
                            return (
                              <button
                                key={c}
                                onClick={() => updateSelected({ fallback: isSelected ? undefined : c })}
                                className={cn(
                                  "rounded-md border p-2 text-[10px] font-medium capitalize transition flex flex-col items-center gap-1",
                                  isSelected
                                    ? `border-transparent ring-2 ring-offset-1 ring-offset-card ${channelKindAccent[c]} ring-foreground/20`
                                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                                )}
                              >
                                <span className={cn("h-5 w-5 rounded flex items-center justify-center", channelKindAccent[c])}>
                                  {c === "sms" && <Phone className="h-3 w-3" />}
                                  {c === "email" && <Mail className="h-3 w-3" />}
                                  {c === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                                  {c === "ai" && <Sparkles className="h-3 w-3" />}
                                </span>
                                {c}
                              </button>
                            );
                          })}
                      </div>
                      {selected.data.fallback && (
                        <Field label="Retry after (minutes)">
                          <input
                            type="number"
                            min={1}
                            value={selected.data.retryMinutes ?? 5}
                            onChange={(e) => updateSelected({ retryMinutes: Number(e.target.value) })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </Field>
                      )}
                    </div>
                  </>
                )}

                {selected.data.kind === "delay" && (
                  <Field label="Wait for">
                    <div className="flex gap-2">
                      <input defaultValue={60} className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      <select className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>minutes</option>
                        <option>hours</option>
                        <option>days</option>
                      </select>
                    </div>
                  </Field>
                )}

                {selected.data.kind === "condition" && (
                  <Field
                    label="Branch on behavior"
                    hint="Routes the flow based on what the user does after the previous message."
                  >
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>If message delivered</option>
                      <option>If message not delivered</option>
                      <option>If email opened</option>
                      <option>If user replied</option>
                      <option>If no response within window</option>
                    </select>
                  </Field>
                )}

                {selected.data.kind === "trigger" && (
                  <>
                    <Field label="HTTP method">
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>POST</option>
                        <option>GET</option>
                      </select>
                    </Field>
                    <Field label="Path">
                      <input defaultValue="/v1/send" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" />
                    </Field>
                  </>
                )}
              </div>
            </>
          ) : (
            <Card className="p-6 text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-medium text-foreground">Select a block</div>
              <p className="text-xs text-muted-foreground mt-1">
                Click any block in the canvas to configure messages, fallback channels and behavior branches.
              </p>
            </Card>
          )}
        </aside>
      </main>
    </AppLayout>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {hint && <Tooltip text={hint} />}
      </div>
      {children}
    </label>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 z-30 hidden group-hover:block w-56 rounded-md bg-foreground text-background text-[11px] font-normal p-2 shadow-elevated leading-snug">
        {text}
      </span>
    </span>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-0.5 w-5 rounded" style={{ background: color }} />
      {label}
    </div>
  );
}
