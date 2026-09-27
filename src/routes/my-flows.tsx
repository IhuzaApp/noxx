import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Workflow as WorkflowIcon,
  Phone,
  Link as LinkIcon,
  Folder,
  Mail,
  Key,
  FileText,
  Trash2,
  Play,
  Pause,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import {
  userFlowStore,
  makeId,
  type FlowResource,
  type UserFlow,
} from "@/lib/user-flows";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-flows")({
  head: () => ({
    meta: [
      { title: "My Flows — Noxx" },
      { name: "description", content: "Create flows, configure triggers and connect resources like phone numbers, links and shared folders." },
    ],
  }),
  component: MyFlowsPage,
});

const channelOptions: Array<{ id: UserFlow["channels"][number]; label: string }> = [
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "voice", label: "Voice" },
  { id: "ai", label: "AI" },
];

const resourceMeta: Record<FlowResource["kind"], { label: string; icon: typeof Phone; placeholder: string; hint: string }> = {
  phone: { label: "Phone number", icon: Phone, placeholder: "+1 415 555 0142", hint: "Numbers Noxx can call or text from this flow." },
  link: { label: "Link / Webhook URL", icon: LinkIcon, placeholder: "https://acme.com/webhook", hint: "Links sent inside messages, or target webhook endpoints." },
  folder: { label: "Shared folder / Storage", icon: Folder, placeholder: "https://drive.google.com/drive/folders/…", hint: "Cloud storage folder Noxx can read or write to (Drive, S3, Dropbox)." },
  email: { label: "Dedicated Email", icon: Mail, placeholder: "support@domain.com", hint: "Inbound email box or target escalation inbox for this flow." },
  credential: { label: "API Credential / Secret", icon: Key, placeholder: "sk_live_98127391...", hint: "Third-party API key, token, or webhook signing secret." },
  knowledge: { label: "Knowledge Base / Docs", icon: FileText, placeholder: "https://docs.acme.com/faq", hint: "Documentation URL or FAQ dataset for AI agent context." },
};

import { API_BASE } from "@/lib/api-config";

function MyFlowsPage() {
  const storeFlows = useStore(userFlowStore);
  const [dbFlows, setDbFlows] = useState<UserFlow[]>([]);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<UserFlow | null>(null);

  const loadDbFlows = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/flows`);
      if (res.ok) {
        const json = await res.json();
        if (json.flows && Array.isArray(json.flows)) {
          setDbFlows(json.flows);
          setDbLoaded(true);
        }
      }
    } catch (e) {
      console.error("Failed to load flows from database:", e);
    }
  }, []);

  useEffect(() => {
    loadDbFlows();
  }, [loadDbFlows]);

  const flowNames: Record<string, string> = useMemo(
    () => ({
      ot1: "OTP with SMS fallback",
      ot2: "Order notification (WhatsApp + Email backup)",
      ot3: "Appointment reminder with follow-ups",
      ot4: "AI support with human handoff",
      ot5: "Inbound sales assistant",
      ot6: "Urgent support direct escalation",
      fl_1a2b3c: "API Downtime Alert",
      fl_4d5e6f: "New Enterprise Lead",
      fl_7g8h9i: "Failed Payment Dunning",
      fl_0j1k2l: "Daily Standup Summary",
      fl_3m4n5o: "Security Vulnerability Patch",
      fl_6p7q8r: "Beta Feature Feedback",
    }),
    [],
  );

  const flows = useMemo(() => {
    return dbFlows.map((f: UserFlow) => {
      const properName = f.name && f.name !== f.id ? f.name : (flowNames[f.id] || f.name || f.id);
      return { ...f, name: properName };
    });
  }, [dbFlows, flowNames]);

  const handleToggleStatus = async (f: UserFlow) => {
    const newStatus = f.status === "active" ? "paused" : "active";
    userFlowStore.update((x) => x.id === f.id, { status: newStatus });
    setDbFlows((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: newStatus } : x)));

    try {
      // Fetch full details first to ensure nodes/edges/resources are preserved
      let fullFlow = f;
      const detailRes = await fetch(`${API_BASE}/flows/${f.id}`);
      if (detailRes.ok) {
        const json = await detailRes.json();
        if (json.flow) fullFlow = json.flow;
      }

      await fetch(`${API_BASE}/flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fullFlow, status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update flow status in database:", e);
    }
  };

  const handleDelete = async (id: string) => {
    // Instantly remove from store & local state
    userFlowStore.remove((x) => x.id === id);
    setDbFlows((prev) => prev.filter((x) => x.id !== id));

    try {
      const res = await fetch(`${API_BASE}/flows/${id}`, { method: "DELETE" });
      if (res.ok) {
        console.log(`✅ Permanently deleted flow ${id} from database`);
      }
    } catch (e) {
      console.error("Failed to delete flow from database:", e);
    }
  };

  return (
    <AppLayout>
      <Topbar
        title="Flows & Automations"
        subtitle={`${flows.filter((f: UserFlow) => f.status === "active").length} active · ${flows.length} total`}
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/flows"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition shadow-soft"
            >
              <WorkflowIcon className="h-4 w-4" />
              Open visual builder
            </Link>
            <button
              onClick={() => setOpenNew(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
            >
              <Plus className="h-4 w-4" />
              New flow
            </button>
          </div>
        }
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {flows.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Create your first flow</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
              A flow describes what happens when a trigger fires — which channels to use, which numbers
              to call, which links to send, and where to store any uploads.
            </p>
            <button
              onClick={() => setOpenNew(true)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft"
            >
              <Plus className="h-4 w-4" /> New flow
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {flows.map((f: UserFlow) => (
              <Card key={f.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground truncate">{f.name}</h3>
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize",
                          f.status === "active" && "bg-success/10 text-success border-success/20",
                          f.status === "paused" && "bg-warning/15 text-warning-foreground border-warning/30",
                          f.status === "draft" && "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {f.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(f)}
                      className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-foreground transition"
                      title={f.status === "active" ? "Pause" : "Activate"}
                    >
                      {f.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-destructive transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded bg-accent text-accent-foreground px-1.5 py-0.5 font-medium">
                    Trigger: {f.trigger || "Webhook"}
                  </span>
                  {(f.channels || []).map((c: string) => (
                    <span key={c} className="rounded border border-border bg-card px-1.5 py-0.5 text-muted-foreground capitalize">
                      {c}
                    </span>
                  ))}
                </div>

                {f.resources && Array.isArray(f.resources) && f.resources.length > 0 && (
                  <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Connected resources
                    </div>
                    {f.resources.map((r: FlowResource) => {
                      const meta = resourceMeta[r?.kind || "link"] || resourceMeta.link;
                      const Icon = meta.icon;
                      return (
                        <div key={r.id || Math.random()} className="flex items-center gap-2 text-xs">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">{r.label || "Resource"}:</span>
                          <span className="text-muted-foreground truncate">{r.value || "Not set"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditing(f)}
                    className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
                  >
                    Edit resources
                  </button>
                  <Link
                    to="/flows"
                    search={{ id: f.id }}
                    className="inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition"
                  >
                    Open in builder <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <NewFlowModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onSave={(created) => {
          if (created) {
            setDbFlows((prev) => [created, ...prev]);
          }
          loadDbFlows();
        }}
      />
      {editing && (
        <EditResourcesModal flow={editing} onClose={() => setEditing(null)} onSave={loadDbFlows} />
      )}
    </AppLayout>
  );
}

function NewFlowModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (newFlow?: UserFlow) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("API request");
  const [channels, setChannels] = useState<UserFlow["channels"]>(["whatsapp"]);
  const [resources, setResources] = useState<FlowResource[]>([]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setTrigger("API request");
    setChannels(["whatsapp"]);
    setResources([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);

    const safeResources = (resources || []).filter((r) => r.label || r.value);
    const newId = makeId("fl");
    const initialNodes = [
      {
        id: "1",
        type: "flow",
        position: { x: 320, y: 20 },
        data: { kind: "trigger", label: `${name.trim()} Event`, detail: `Trigger: ${trigger}` },
      },
    ];

    const newFlow: UserFlow = {
      id: newId,
      name: name.trim(),
      description: description.trim() || "No description.",
      trigger,
      channels,
      resources: safeResources,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    userFlowStore.add(newFlow);

    try {
      await fetch(`${API_BASE}/flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          name: name.trim(),
          description: description.trim() || "No description.",
          trigger,
          channels,
          resources: safeResources,
          status: "draft",
          nodes: initialNodes,
          edges: [],
          simulation: {
            resources: safeResources,
            path: ["1"],
            edgePath: [],
            messages: [{ msg: `Triggered: ${name.trim()}`, kind: "info" }],
          },
        }),
      });
    } catch (e) {
      console.error("Failed to save new flow to database:", e);
    } finally {
      setSaving(false);
      reset();
      if (onSave) onSave(newFlow);
      onClose();
    }
  };

  const toggleChannel = (c: UserFlow["channels"][number]) =>
    setChannels((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const addResource = (kind: FlowResource["kind"]) => {
    setResources((r) => [
      ...r,
      { id: makeId("rs"), kind, label: resourceMeta[kind].label, value: "" },
    ]);
  };

  const updateResource = (id: string, patch: Partial<FlowResource>) =>
    setResources((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const removeResource = (id: string) => setResources((r) => r.filter((x) => x.id !== id));

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create a new flow"
      description="Add channels, then connect any phone numbers, links or shared folders this flow needs."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Flow name">
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Order shipped notification"
            />
          </Field>
          <Field label="Trigger">
            <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className={inputCls}>
              <option>API request</option>
              <option>Inbound message</option>
              <option>Webhook</option>
              <option>Scheduled (cron)</option>
              <option>Form submission</option>
              <option>Payment event</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
            placeholder="What does this flow do?"
          />
        </Field>

        <div>
          <div className="mb-1.5 text-xs font-medium text-foreground">Channels</div>
          <div className="flex flex-wrap gap-1.5">
            {channelOptions.map((c) => {
              const on = channels.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleChannel(c.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    on
                      ? "bg-foreground text-background border-transparent"
                      : "bg-card text-muted-foreground border-border hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div>
            <div className="text-xs font-semibold text-foreground">Connected resources</div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Add phone numbers Noxx should call or text from, links it should send,
              and any shared folder (Drive, S3, Dropbox) it should read or write to.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["phone", "link", "folder", "email", "credential", "knowledge"] as const).map((k) => {
              const Icon = resourceMeta[k].icon;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => addResource(k)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
                >
                  <Icon className="h-3.5 w-3.5" />
                  Add {resourceMeta[k].label.toLowerCase()}
                </button>
              );
            })}
          </div>

          {resources.length > 0 && (
            <div className="space-y-2">
              {resources.map((r) => {
                const meta = resourceMeta[r?.kind || "link"] || resourceMeta.link;
                const Icon = meta.icon;
                return (
                  <div key={r.id} className="rounded-md border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <input
                        value={r.label || ""}
                        onChange={(e) => updateResource(r.id, { label: e.target.value })}
                        className="flex-1 bg-transparent text-xs font-semibold text-foreground outline-none border-b border-transparent focus:border-border"
                        placeholder="Resource Name / Label"
                      />
                      <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {r.kind}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeResource(r.id)}
                        className="text-muted-foreground hover:text-destructive transition ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      value={r.value || ""}
                      onChange={(e) => updateResource(r.id, { value: e.target.value })}
                      placeholder={meta.placeholder}
                      className={inputCls}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <input
                        value={r.notes || ""}
                        onChange={(e) => updateResource(r.id, { notes: e.target.value })}
                        placeholder="Usage notes / environment (Optional)"
                        className="text-xs bg-transparent border border-input rounded-md px-2 py-1 outline-none text-muted-foreground focus:text-foreground"
                      />
                      <div className="text-[10px] text-muted-foreground flex items-center">{meta.hint}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create flow"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditResourcesModal({ flow, onClose, onSave }: { flow: UserFlow; onClose: () => void; onSave?: () => void }) {
  const [resources, setResources] = useState<FlowResource[]>(flow?.resources || []);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const safeResources = (resources || []).filter((r) => r.label || r.value);
    userFlowStore.update((x) => x.id === flow.id, { resources: safeResources });

    try {
      let fullFlow = flow;
      const detailRes = await fetch(`${API_BASE}/flows/${flow.id}`);
      if (detailRes.ok) {
        const json = await detailRes.json();
        if (json.flow) fullFlow = json.flow;
      }

      await fetch(`${API_BASE}/flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fullFlow,
          resources: safeResources,
          simulation: {
            ...(fullFlow.simulation || {}),
            resources: safeResources,
          },
        }),
      });
    } catch (e) {
      console.error("Failed to save resources to database:", e);
    } finally {
      setSaving(false);
      if (onSave) onSave();
      onClose();
    }
  };

  const addResource = (kind: FlowResource["kind"]) =>
    setResources((r) => [...(r || []), { id: makeId("rs"), kind, label: resourceMeta[kind].label, value: "" }]);
  const updateResource = (id: string, patch: Partial<FlowResource>) =>
    setResources((r) => (r || []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeResource = (id: string) => setResources((r) => (r || []).filter((x) => x.id !== id));

  const safeResources = resources || [];

  return (
    <Modal open onClose={onClose} title={`Resources for "${flow?.name || "Flow"}"`} size="lg">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {(["phone", "link", "folder", "email", "credential", "knowledge"] as const).map((k) => {
            const Icon = resourceMeta[k].icon;
            return (
              <button
                type="button"
                key={k}
                onClick={() => addResource(k)}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
              >
                <Icon className="h-3.5 w-3.5" />
                Add {resourceMeta[k].label.toLowerCase()}
              </button>
            );
          })}
        </div>

        {safeResources.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No resources yet. Add a phone number, a link, an email, an API key, or a documentation link.
          </div>
        ) : (
          safeResources.map((r) => {
            const meta = resourceMeta[r?.kind || "link"] || resourceMeta.link;
            const Icon = meta.icon;
            return (
              <div key={r.id} className="rounded-md border border-border bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <input
                    value={r.label || ""}
                    onChange={(e) => updateResource(r.id, { label: e.target.value })}
                    className="flex-1 bg-transparent text-xs font-semibold text-foreground outline-none border-b border-transparent focus:border-border"
                    placeholder="Resource Name / Label"
                  />
                  <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {r.kind}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeResource(r.id)}
                    className="text-muted-foreground hover:text-destructive transition ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  value={r.value || ""}
                  onChange={(e) => updateResource(r.id, { value: e.target.value })}
                  placeholder={meta.placeholder}
                  className={inputCls}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <input
                    value={r.notes || ""}
                    onChange={(e) => updateResource(r.id, { notes: e.target.value })}
                    placeholder="Usage notes / environment (Optional)"
                    className="text-xs bg-transparent border border-input rounded-md px-2 py-1 outline-none text-muted-foreground focus:text-foreground"
                  />
                  <div className="text-[10px] text-muted-foreground flex items-center">{meta.hint}</div>
                </div>
              </div>
            );
          })
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            onClick={onClose}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
