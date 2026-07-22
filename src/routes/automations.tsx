import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Zap, Search, Play, Pause, MoreHorizontal, ArrowRight, Info, Trash2, Eye, X, GripVertical, FilePlus2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { Modal, Field, inputCls } from "@/components/Modal";
import { cn } from "@/lib/utils";
import { automations, automationTemplates, type Automation } from "@/lib/automations";
import { userAutomationStore, type UserAutomation } from "@/lib/user-content";
import { useStore } from "@/lib/store";
import { makeId } from "@/lib/user-flows";

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations — Noxx" },
      { name: "description", content: "Set up automations that simplify support, sales, marketing and ops workflows." },
    ],
  }),
  component: AutomationsPage,
});

const categoryTint: Record<Automation["category"], string> = {
  support: "bg-info/15 text-info border-info/20",
  sales: "bg-success/15 text-success border-success/20",
  marketing: "bg-channel-ai/15 text-channel-ai border-channel-ai/20",
  ops: "bg-warning/15 text-warning-foreground border-warning/30",
};

function AutomationsPage() {
  const [list, setList] = useState(automations);
  const userList = useStore(userAutomationStore);
  const [cat, setCat] = useState<"all" | Automation["category"]>("all");
  const [openNew, setOpenNew] = useState(false);
  const [seed, setSeed] = useState<{ name: string; description: string; trigger: string; category: UserAutomation["category"]; actions: string[] } | null>(null);
  const [viewing, setViewing] = useState<Automation | UserAutomation | null>(null);

  const openBlank = () => { setSeed(null); setOpenNew(true); };
  const openFromTemplate = (t: typeof automationTemplates[number]) => {
    const catMap: Record<string, UserAutomation["category"]> = { Support: "support", Sales: "sales", Marketing: "marketing", Ops: "ops" };
    setSeed({
      name: t.name,
      description: t.description,
      trigger: "New ticket created",
      category: catMap[t.uses] ?? "support",
      actions: ["AI classify intent", "Apply tags", "Notify on Slack"],
    });
    setOpenNew(true);
  };

  const filtered = list.filter((a) => cat === "all" || a.category === cat);
  const filteredUser = userList.filter((a) => cat === "all" || a.category === cat);

  const toggle = (id: string) => setList((l) => l.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  const toggleUser = (id: string) => {
    const a = userList.find((x) => x.id === id);
    if (a) userAutomationStore.update((x) => x.id === id, { enabled: !a.enabled });
  };

  const activeCount = list.filter((a) => a.enabled).length + userList.filter((a) => a.enabled).length;

  return (
    <AppLayout>
      <Topbar
        title="Automations"
        subtitle={`${activeCount} active · ${list.length + userList.length} total`}
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/my-flows"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              Manage flows
            </Link>
            <button
              onClick={openBlank}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Build from scratch
            </button>
          </div>
        }
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <Card className="p-4 flex items-start gap-3 bg-channel-ai/5 border-channel-ai/20">
          <div className="h-8 w-8 rounded-md bg-channel-ai/15 text-channel-ai flex items-center justify-center shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Design automations your way</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Build any automation from scratch — pick a trigger, chain the actions you want, in any order. Templates below are optional starting points you can fully customize.
            </p>
          </div>
          <button onClick={openBlank} className="inline-flex items-center gap-1.5 rounded-md border border-channel-ai/40 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-channel-ai/10 transition shrink-0">
            <FilePlus2 className="h-3.5 w-3.5" /> Blank automation
          </button>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">Start from a template</h3>
              <p className="text-xs text-muted-foreground">Pre-fills the builder — change anything before you save.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {automationTemplates.map((t) => {
              const I = t.icon;
              return (
                <Card key={t.id} className="p-4 hover:border-primary/40 cursor-pointer group transition" onClick={() => openFromTemplate(t)}>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                      <I className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide">{t.uses}</div>
                      <p className="text-xs text-muted-foreground mt-1.5">{t.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-md border border-input bg-card px-2.5 py-1.5 flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search automations…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1">
            {(["all", "support", "sales", "marketing", "ops"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition border capitalize",
                  cat === c ? "bg-foreground text-background border-transparent" : "bg-card text-muted-foreground border-border hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filteredUser.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Your automations</div>
            <div className="space-y-3">
              {filteredUser.map((a) => (
                <Card key={a.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                      a.enabled ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold text-foreground">{a.name}</div>
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", categoryTint[a.category])}>{a.category}</span>
                        {!a.enabled && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border">Paused</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                      <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="inline-flex items-center gap-1 rounded bg-accent text-accent-foreground px-1.5 py-0.5 font-medium">
                          <Zap className="h-2.5 w-2.5" /> Trigger: {a.trigger}
                        </span>
                        {a.actions.map((act, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-muted-foreground">
                            <ArrowRight className="h-2.5 w-2.5" />
                            <span className="rounded border border-border bg-card px-1.5 py-0.5">{act}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setViewing(a)} className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-foreground transition" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleUser(a.id)} className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-foreground transition" title={a.enabled ? "Pause" : "Activate"}>
                        {a.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => userAutomationStore.remove((x) => x.id === a.id)} className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-destructive transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((a) => {
            const I = a.icon;
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                    a.enabled ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <I className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-semibold text-foreground">{a.name}</div>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", categoryTint[a.category])}>{a.category}</span>
                      {!a.enabled && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border">Paused</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded bg-accent text-accent-foreground px-1.5 py-0.5 font-medium">
                        <Zap className="h-2.5 w-2.5" /> Trigger: {a.trigger}
                      </span>
                      {a.actions.map((act, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-muted-foreground">
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span className="rounded border border-border bg-card px-1.5 py-0.5">{act}</span>
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span><span className="font-semibold text-foreground">{a.runs30d.toLocaleString()}</span> runs · 30d</span>
                      <span><span className="font-semibold text-foreground">{a.successRate}%</span> success</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setViewing(a)} className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-foreground transition" title="View">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggle(a.id)} className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition",
                      a.enabled ? "border-input bg-card text-foreground hover:bg-accent" : "border-transparent bg-foreground text-background hover:opacity-90")}>
                      {a.enabled ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Activate</>}
                    </button>
                    <button className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-foreground transition">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <NewAutomationModal open={openNew} onClose={() => { setOpenNew(false); setSeed(null); }} seed={seed} />
      {viewing && <ViewAutomationModal automation={viewing} onClose={() => setViewing(null)} />}
    </AppLayout>
  );
}

const TRIGGER_OPTIONS = [
  "New ticket created",
  "Customer reply contains keyword",
  "Cart abandoned > 1h",
  "New contact via any channel",
  "Payment webhook: failed",
  "Payment webhook: succeeded",
  "Inbound SMS received",
  "Inbound WhatsApp message",
  "Inbound Email received",
  "Instagram DM received",
  "Voice call ended",
  "Survey response submitted",
  "Contact tag added",
  "Contact inactive 30d",
  "Scheduled (cron)",
  "Webhook received",
];

const ACTION_LIBRARY: { group: string; items: string[] }[] = [
  { group: "Send", items: ["Send SMS", "Send Email", "Send WhatsApp", "Send Instagram DM", "Place voice call", "Send payment link"] },
  { group: "AI", items: ["AI classify intent", "AI draft reply", "AI summarize conversation", "AI route to team", "AI translate"] },
  { group: "Logic", items: ["Wait 5 minutes", "Wait 1 hour", "Wait 24 hours", "If/else branch", "Stop if condition met"] },
  { group: "CRM", items: ["Add tag to contact", "Remove tag from contact", "Add to segment", "Update contact field", "Create contact"] },
  { group: "Tickets", items: ["Create ticket", "Set priority: urgent", "Assign to team", "Assign senior agent", "Close ticket"] },
  { group: "Integrations", items: ["Notify on Slack", "Send to webhook (HTTP)", "Push to HubSpot", "Push to Shopify order", "Trigger another flow"] },
];

function NewAutomationModal({ open, onClose, seed }: { open: boolean; onClose: () => void; seed: { name: string; description: string; trigger: string; category: UserAutomation["category"]; actions: string[] } | null }) {
  const empty = { name: "", description: "", trigger: "New ticket created", category: "support" as UserAutomation["category"], actions: [] as string[], custom: "" };
  const [form, setForm] = useState(seed ? { ...empty, ...seed } : empty);
  const [activeGroup, setActiveGroup] = useState(ACTION_LIBRARY[0].group);

  // Re-seed when seed prop changes (template clicked)
  if (open && seed && form.name === "" && form.actions.length === 0) {
    setForm({ ...empty, ...seed });
  }

  const addAction = (a: string) => setForm((f) => ({ ...f, actions: [...f.actions, a] }));
  const removeAction = (i: number) => setForm((f) => ({ ...f, actions: f.actions.filter((_, idx) => idx !== i) }));
  const moveAction = (i: number, dir: -1 | 1) => setForm((f) => {
    const next = [...f.actions];
    const j = i + dir;
    if (j < 0 || j >= next.length) return f;
    [next[i], next[j]] = [next[j], next[i]];
    return { ...f, actions: next };
  });
  const addCustom = () => {
    const v = form.custom.trim();
    if (!v) return;
    setForm((f) => ({ ...f, actions: [...f.actions, v], custom: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.actions.length === 0) return;
    userAutomationStore.add({
      id: makeId("ua"),
      name: form.name.trim(),
      description: form.description.trim() || "No description.",
      trigger: form.trigger,
      category: form.category,
      actions: form.actions,
      enabled: true,
      createdAt: new Date().toISOString(),
    });
    setForm(empty);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={seed ? "Customize this automation" : "Build a new automation"} description="Pick a trigger, then add and reorder the actions you want — there are no fixed paths." size="lg">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Auto-respond after hours" />
        </Field>
        <Field label="Description">
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Trigger" hint="When should this run?">
            <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className={inputCls}>
              {TRIGGER_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as UserAutomation["category"] })} className={inputCls}>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="ops">Ops</option>
            </select>
          </Field>
        </div>

        <div>
          <div className="text-xs font-semibold text-foreground mb-1.5">Actions <span className="font-normal text-muted-foreground">— in order</span></div>
          {form.actions.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
              No actions yet. Pick from the library below or write your own.
            </div>
          ) : (
            <ol className="space-y-1.5">
              {form.actions.map((a, i) => (
                <li key={i} className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground w-5">{i + 1}.</span>
                  <span className="flex-1 text-sm text-foreground truncate">{a}</span>
                  <button type="button" onClick={() => moveAction(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs px-1">↑</button>
                  <button type="button" onClick={() => moveAction(i, 1)} disabled={i === form.actions.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs px-1">↓</button>
                  <button type="button" onClick={() => removeAction(i)} className="text-muted-foreground hover:text-destructive p-0.5"><X className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <div className="text-xs font-semibold text-foreground">Action library</div>
          <div className="flex flex-wrap gap-1">
            {ACTION_LIBRARY.map((g) => (
              <button key={g.group} type="button" onClick={() => setActiveGroup(g.group)} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium transition border", activeGroup === g.group ? "bg-foreground text-background border-transparent" : "bg-card text-muted-foreground border-border hover:text-foreground")}>{g.group}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ACTION_LIBRARY.find((g) => g.group === activeGroup)?.items.map((a) => (
              <button key={a} type="button" onClick={() => addAction(a)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground hover:border-primary/40 hover:bg-primary/5 transition">
                <Plus className="h-3 w-3 text-muted-foreground" /> {a}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input value={form.custom} onChange={(e) => setForm({ ...form, custom: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Or write your own action…" className={cn(inputCls, "flex-1")} />
            <button type="button" onClick={addCustom} className="rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition">Add</button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition">Cancel</button>
          <button type="submit" disabled={!form.name.trim() || form.actions.length === 0} className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">Create automation</button>
        </div>
      </form>
    </Modal>
  );
}

function ViewAutomationModal({ automation, onClose }: { automation: Automation | UserAutomation; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={automation.name} description={automation.description} size="lg">
      <div className="space-y-4 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Trigger</div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-foreground">{automation.trigger}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Actions</div>
          <ol className="space-y-1.5">
            {automation.actions.map((a, i) => (
              <li key={i} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-foreground">
                <span className="text-[11px] font-semibold text-muted-foreground w-5">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="text-muted-foreground">Category</div>
            <div className="mt-1 font-semibold text-foreground capitalize">{automation.category}</div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="text-muted-foreground">Status</div>
            <div className="mt-1 font-semibold text-foreground">{automation.enabled ? "Active" : "Paused"}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
