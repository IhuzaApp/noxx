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
  Check,
  Loader2,
  Ticket,
  Globe,
  FileText,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { FlowNode, type FlowNodeData, type ChannelKind } from "@/components/flow/FlowNode";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { userFlowStore } from "@/lib/user-flows";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { flowTemplates, defaultTemplate, makeEdge } from "@/lib/flow-templates";

export const Route = createFileRoute("/flows")({
  validateSearch: (search: Record<string, unknown>): { id?: string } => {
    return {
      id: typeof search.id === "string" ? search.id : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Flow Builder — Noxx" },
      { name: "description", content: "Visually design omnichannel flows with channel fallback, retries and behavior-based branching." },
    ],
  }),
  component: FlowsPage,
});

const nodeTypes = { flow: FlowNode };

const palette: Array<{ kind: FlowNodeData["kind"]; label: string; icon: typeof Webhook; group: string }> = [
  { kind: "trigger", label: "API trigger", icon: Webhook, group: "Triggers" },
  { kind: "whatsapp", label: "Send WhatsApp", icon: MessageSquare, group: "Channels" },
  { kind: "instagram", label: "Send Instagram", icon: Instagram, group: "Channels" },
  { kind: "sms", label: "Send SMS", icon: Phone, group: "Channels" },
  { kind: "email", label: "Send Email", icon: Mail, group: "Channels" },
  { kind: "agent", label: "AI Agent", icon: Bot, group: "AI" },
  { kind: "ai", label: "AI response", icon: Sparkles, group: "AI" },
  { kind: "ticket", label: "Create Ticket", icon: Ticket, group: "Actions" },
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
  voice: ""
};

import { API_BASE } from "@/lib/api-config";

function FlowsPage() {
  const search = Route.useSearch();
  const storeFlows = useStore(userFlowStore);
  const [dbFlows, setDbFlows] = useState<any[]>([]);
  const navigate = useNavigate();

  // Load all flows list from Hasura DB
  useEffect(() => {
    let activeSignal = true;
    fetch(`${API_BASE}/flows`)
      .then((res) => res.json())
      .then((data) => {
        if (activeSignal && data.flows && Array.isArray(data.flows)) {
          setDbFlows(data.flows);
        }
      })
      .catch((err) => console.error("Error loading flows from DB:", err));
    return () => {
      activeSignal = false;
    };
  }, []);

  const flows = dbFlows.length > 0 ? dbFlows : storeFlows;
  const targetId = search.id || flows[0]?.id || "ot1";
  const flow = flows.find((f: any) => f.id === targetId) || {
    id: targetId,
    name: targetId === "ot1" ? "OTP with SMS fallback" : targetId,
    description: "",
    channels: ["whatsapp", "sms"],
    trigger: "Webhook",
    status: "active",
    resources: [],
    createdAt: "Just now",
  };
  const template = flowTemplates[flow?.id || ""] || defaultTemplate;

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>(template.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(template.edges);
  const [selectedId, setSelectedId] = useState<string | null>("2");
  const [active, setActive] = useState(flow ? flow.status === "active" : true);
  const [simulating, setSimulating] = useState(false);
  const [logs, setLogs] = useState<Array<{ t: string; msg: string; kind: "info" | "ok" | "warn" }>>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Load flow graph directly from Hasura DB when search.id changes or when flow changes
  useEffect(() => {
    let isCancelled = false;
    const loadFlowFromDb = async () => {
      if (!targetId) return;

      try {
        const res = await fetch(`${API_BASE}/flows/${targetId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.flow && !isCancelled) {
            const f = json.flow;
            if (f.nodes && Array.isArray(f.nodes) && f.nodes.length > 0) {
              setNodes(f.nodes);
            } else {
              const builtIn = flowTemplates[targetId];
              if (builtIn && builtIn.nodes && builtIn.nodes.length > 0) {
                setNodes(builtIn.nodes);
              } else {
                setNodes([
                  {
                    id: "1",
                    type: "flow",
                    position: { x: 320, y: 20 },
                    data: { kind: "trigger", label: `${f.name || "Flow"} Event`, detail: `Trigger: ${f.trigger || "Webhook"}` },
                  },
                ]);
              }
            }
            if (f.edges && Array.isArray(f.edges)) {
              setEdges(f.edges);
            } else {
              const builtIn = flowTemplates[targetId];
              if (builtIn && builtIn.edges) {
                setEdges(builtIn.edges);
              } else {
                setEdges([]);
              }
            }
            if (f.status) setActive(f.status === "active");
            return;
          }
        }
      } catch (e) {
        console.error("Failed to fetch flow from database:", e);
      }

      // Fallback for custom or missing flows
      if (!isCancelled) {
        const builtIn = flowTemplates[targetId];
        if (builtIn && builtIn.nodes && builtIn.nodes.length > 0) {
          setNodes(builtIn.nodes);
          setEdges(builtIn.edges);
        } else {
          setNodes([
            {
              id: "1",
              type: "flow",
              position: { x: 320, y: 20 },
              data: { kind: "trigger", label: `${flow?.name || "Flow"} Event`, detail: "POST /v1/events/trigger" },
            },
          ]);
          setEdges([]);
        }
        setActive(flow ? flow.status === "active" : true);
      }
    };

    setLogs([]);
    setShowLogs(false);
    loadFlowFromDb();

    return () => {
      isCancelled = true;
    };
  }, [search.id, targetId]);

  const handleSaveFlow = async () => {
    if (saving || !flow) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        id: targetId,
        name: flow.name,
        description: flow.description || "",
        channels: flow.channels || ["whatsapp"],
        trigger: flow.trigger || "Webhook",
        status: active ? "active" : "paused",
        nodes,
        edges,
        simulation: template.simulation || {},
      };

      const res = await fetch(`${API_BASE}/flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save flow to database:", e);
    } finally {
      setSaving(false);
    }
  };

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

  // Dynamic simulation engine: walks nodes & edges, evaluates conditions, and emits live trace logs
  const simulate = () => {
    if (simulating) return;
    setSimulating(true);
    setShowLogs(true);
    setLogs([]);

    const startNode = nodes.find((n) => n.data.kind === "trigger") || nodes[0];
    if (!startNode) {
      setLogs([{ t: new Date().toLocaleTimeString(), msg: "No nodes in flow to simulate", kind: "warn" }]);
      setSimulating(false);
      return;
    }

    const executionSteps: Array<{
      nodeId: string;
      edgeId?: string;
      log: { msg: string; kind: "info" | "ok" | "warn" };
    }> = [];

    const visited = new Set<string>();
    let current: Node<FlowNodeData> | undefined = startNode;

    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      const data = current.data;

      if (data.kind === "trigger") {
        executionSteps.push({
          nodeId: current.id,
          log: { msg: `Trigger received: ${data.label}`, kind: "info" },
        });
      } else if (data.kind === "condition") {
        const conditionRule = data.conditionType || data.detail || "If condition = True";
        const yesLabel = data.yesLabel || "Yes / If";
        const noLabel = data.noLabel || "No / Else";

        executionSteps.push({
          nodeId: current.id,
          log: { msg: `Evaluating condition: "${conditionRule}"`, kind: "info" },
        });

        // Simulate condition evaluation
        const conditionPassed = Math.random() >= 0.3;
        if (conditionPassed) {
          executionSteps.push({
            nodeId: current.id,
            log: { msg: `Condition evaluated to TRUE → Following [${yesLabel}] branch`, kind: "ok" },
          });
        } else {
          executionSteps.push({
            nodeId: current.id,
            log: { msg: `Condition evaluated to FALSE → Following [${noLabel}] branch`, kind: "warn" },
          });
        }
      } else if (data.kind === "delay") {
        executionSteps.push({
          nodeId: current.id,
          log: { msg: `Delay step: Waiting 5 minutes...`, kind: "info" },
        });
      } else {
        executionSteps.push({
          nodeId: current.id,
          log: { msg: `Executed action [${data.label}]: Sent message via ${data.kind}`, kind: "ok" },
        });
        if (data.fallback) {
          executionSteps.push({
            nodeId: current.id,
            log: { msg: `Omnichannel fallback configured: ${data.fallback} (after ${data.retryMinutes || 5}m)`, kind: "info" },
          });
        }
      }

      // Find next outgoing edge
      const outgoingEdge = edges.find((e) => e.source === current!.id);
      if (outgoingEdge) {
        const nextNode = nodes.find((n) => n.id === outgoingEdge.target);
        if (nextNode) {
          executionSteps[executionSteps.length - 1].edgeId = outgoingEdge.id;
          current = nextNode;
          continue;
        }
      }
      break;
    }

    let stepIndex = 0;
    const runTick = () => {
      if (stepIndex < executionSteps.length) {
        const step = executionSteps[stepIndex];
        const activeNodeIds = executionSteps.slice(0, stepIndex + 1).map((s) => s.nodeId);
        const activeEdgeIds = executionSteps
          .slice(0, stepIndex + 1)
          .map((s) => s.edgeId)
          .filter(Boolean) as string[];

        setNodes((ns) =>
          ns.map((n) => ({ ...n, data: { ...n.data, active: activeNodeIds.includes(n.id) } })),
        );
        setEdges((es) =>
          es.map((e) => ({ ...e, animated: activeEdgeIds.includes(e.id) })),
        );
        setLogs((l) => [...l, { t: new Date().toLocaleTimeString(), ...step.log }]);

        stepIndex++;
        setTimeout(runTick, 700);
      } else {
        setTimeout(() => {
          setLogs((l) => [
            ...l,
            { t: new Date().toLocaleTimeString(), msg: `Simulation complete · ${visited.size} steps executed · 0 errors`, kind: "ok" },
          ]);
          setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, active: false } })));
          setEdges((es) => es.map((e) => ({ ...e, animated: false })));
          setSimulating(false);
        }, 800);
      }
    };

    runTick();
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
        title={
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 hover:opacity-80 transition outline-none">
              <span className="truncate max-w-[200px] sm:max-w-xs">{flow ? flow.name : "Select a flow"}</span>
              <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {flows.map((f: any) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => navigate({ to: "/flows", search: { id: f.id } })}
                  className="flex flex-col items-start gap-1 p-2 cursor-pointer"
                >
                  <span className="text-sm font-medium">{f.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{f.trigger}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
        subtitle={flow ? `Omnichannel · Last edited ${flow.createdAt || "Recently"} · ${(flow.status || "active").charAt(0).toUpperCase() + (flow.status || "active").slice(1)}` : "Omnichannel · Last edited 4 minutes ago · Draft"}
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
            <button
              onClick={handleSaveFlow}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : saveSuccess ? "Saved!" : "Save"}
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
                        p.kind === "ticket" && "bg-emerald-500/15 text-emerald-600",
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
              <LegendRow color="var(--success)" label="If Delivered / Yes" />
              <LegendRow color="var(--destructive)" label="If Not Delivered / Else" />
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

                {/* Trigger / Inbound Email Configuration */}
                {selected.data.kind === "trigger" && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Inbound Email & Webhook Trigger</span>
                      <span className="text-[10px] text-primary font-mono font-normal">Active Inbound</span>
                    </div>
                    <Field
                      label="Target Inbound Email Address"
                      hint="Specify which incoming email triggers this flow (e.g. sales@agatike.com, support@agatike.com)."
                    >
                      <input
                        value={selected.data.targetEmail || ""}
                        onChange={(e) =>
                          updateSelected({
                            targetEmail: e.target.value,
                            detail: e.target.value ? `Inbound: ${e.target.value}` : "All Inbound Emails",
                          })
                        }
                        placeholder="e.g. sales@agatike.com or support@agatike.com"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </Field>
                    <Field
                      label="Subject / Keyword Filter (Optional)"
                      hint="Only trigger this flow if subject contains this keyword (e.g. URGENT, Refund, Demo)."
                    >
                      <input
                        value={selected.data.subjectFilter || ""}
                        onChange={(e) => updateSelected({ subjectFilter: e.target.value })}
                        placeholder="e.g. URGENT, Billing, Demo"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </Field>
                  </div>
                )}

                {/* AI Agent / AI Response Configuration */}
                {(selected.data.kind === "agent" || selected.data.kind === "ai") && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="text-xs font-semibold text-foreground">AI Handling & Execution Policy</div>
                    <Field label="AI Mode & Routing Policy">
                      <select
                        value={selected.data.aiMode || "auto_reply"}
                        onChange={(e) =>
                          updateSelected({
                            aiMode: e.target.value as any,
                            detail:
                              e.target.value === "skip_ai_ticket"
                                ? "⚡ Skip AI → Direct Ticket"
                                : e.target.value === "draft_only"
                                ? "📝 Draft Reply Only"
                                : "🤖 AI Auto-Reply",
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                      >
                        <option value="auto_reply">🤖 AI Receptionist Auto-Reply (Full Auto)</option>
                        <option value="skip_ai_ticket">⚡ Skip AI & Create Ticket Directly (Human Handling)</option>
                        <option value="draft_only">📝 AI Drafts Reply for Human Approval</option>
                      </select>
                    </Field>

                    <Field
                      label="AI Response Language"
                      hint="Select which language the AI agent must output replies in."
                    >
                      <select
                        value={selected.data.aiLanguage || "auto"}
                        onChange={(e) => updateSelected({ aiLanguage: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                      >
                        <option value="auto">🌐 Auto-detect customer language</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="fr">🇫🇷 French (Français)</option>
                        <option value="sw">🇰🇪 Swahili (Kiswahili)</option>
                        <option value="rw">🇷🇼 Kinyarwanda</option>
                        <option value="es">🇪🇸 Spanish (Español)</option>
                        <option value="de">🇩🇪 German (Deutsch)</option>
                        <option value="ar">🇸🇦 Arabic (العربية)</option>
                      </select>
                    </Field>

                    {selected.data.aiMode !== "skip_ai_ticket" && (
                      <>
                        <Field
                          label="AI Focus Area & Custom Instructions"
                          hint="Guide how AI treats emails for this flow (e.g. focus on Enterprise sales, pricing, or tech specs)."
                        >
                          <textarea
                            rows={3}
                            value={selected.data.aiFocusArea || ""}
                            onChange={(e) => updateSelected({ aiFocusArea: e.target.value })}
                            placeholder="e.g. Focus on Enterprise pricing specs, demo bookings, and feature comparison."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                          />
                        </Field>
                        <Field
                          label="Knowledge Base / Documentation Link"
                          hint="URL to FAQ or documentation for AI reference."
                        >
                          <input
                            value={selected.data.knowledgeLink || ""}
                            onChange={(e) => updateSelected({ knowledgeLink: e.target.value })}
                            placeholder="https://domain.com/docs/pricing"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                          />
                        </Field>
                      </>
                    )}
                  </div>
                )}

                {/* Create Ticket Block Configuration */}
                {selected.data.kind === "ticket" && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="text-xs font-semibold text-foreground">Create Support Ticket Settings</div>
                    <Field label="Assign Department">
                      <select
                        value={selected.data.ticketDepartment || "Support"}
                        onChange={(e) =>
                          updateSelected({
                            ticketDepartment: e.target.value,
                            detail: `Create ${e.target.value} Ticket (${selected.data.ticketPriority || "normal"})`,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="Support">Customer Support</option>
                        <option value="Sales">Sales & Inquiries</option>
                        <option value="Billing">Billing & Refunds</option>
                        <option value="Engineering">Engineering / Escalation</option>
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Ticket Priority">
                        <select
                          value={selected.data.ticketPriority || "normal"}
                          onChange={(e) =>
                            updateSelected({
                              ticketPriority: e.target.value as any,
                              detail: `Create ${selected.data.ticketDepartment || "Support"} Ticket (${e.target.value})`,
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">🚩 Urgent</option>
                        </select>
                      </Field>
                      <Field label="Initial Status">
                        <select
                          value={selected.data.ticketStatus || "open"}
                          onChange={(e) => updateSelected({ ticketStatus: e.target.value as any })}
                          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="open">Open (Unassigned)</option>
                          <option value="pending">Pending Review</option>
                          <option value="resolved">Auto-Resolved</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* Channel Actions (SMS, Email, WhatsApp, etc) */}
                {(["sms", "email", "whatsapp"] as const).includes(selected.data.kind as never) && (
                  <>
                    <Field label="Recipient">
                      <input
                        placeholder="{{user.phone}} or {{contact_email}}"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </Field>
                    <Field label="Message Template">
                      <textarea
                        rows={3}
                        defaultValue="Hi {{name}}, thanks for contacting {{org}}! We received your request."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                      <Field label="Assign Department">
                        <select
                          value={selected.data.ticketDepartment || "Support"}
                          onChange={(e) => updateSelected({ ticketDepartment: e.target.value })}
                          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="Support">Customer Support</option>
                          <option value="Sales">Sales & Inquiries</option>
                          <option value="Billing">Billing & Refunds</option>
                          <option value="Engineering">Engineering / Escalation</option>
                        </select>
                      </Field>
                      <Field label="Ticket Priority">
                        <select
                          value={selected.data.ticketPriority || "normal"}
                          onChange={(e) => updateSelected({ ticketPriority: e.target.value as any })}
                          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">🚩 Urgent</option>
                        </select>
                      </Field>
                    </div>

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
                  <div className="space-y-4 pt-2 border-t border-border/60">
                    <Field
                      label="Behavior / Rule Condition"
                      hint="Evaluation rule to split execution path."
                    >
                      <select
                        value={selected.data.conditionType || "If message delivered"}
                        onChange={(e) =>
                          updateSelected({
                            conditionType: e.target.value,
                            detail: `Condition: ${e.target.value}`,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="If target email matches (e.g. sales@domain.com)">If target email matches (e.g. sales@domain.com)</option>
                        <option value="If subject contains keyword (e.g. URGENT)">If subject contains keyword (e.g. URGENT)</option>
                        <option value="If email body contains 'refund' or 'cancel'">If email body contains 'refund' or 'cancel'</option>
                        <option value="If message delivered">If message delivered</option>
                        <option value="If user replied">If user replied</option>
                        <option value="If AI confidence is low → Skip AI">If AI confidence is low → Skip AI</option>
                      </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                      <Field label="If / Yes branch label">
                        <input
                          value={selected.data.yesLabel || "Yes / True"}
                          onChange={(e) => updateSelected({ yesLabel: e.target.value })}
                          placeholder="Yes / True"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-success outline-none focus:ring-2 focus:ring-success/30"
                        />
                      </Field>
                      <Field label="Else / No branch label">
                        <input
                          value={selected.data.noLabel || "No / Else"}
                          onChange={(e) => updateSelected({ noLabel: e.target.value })}
                          placeholder="No / Else"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-destructive outline-none focus:ring-2 focus:ring-destructive/30"
                        />
                      </Field>
                    </div>
                  </div>
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
