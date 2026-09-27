import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Phone, Mail, MessageSquare, Sparkles, Plus, Copy, Workflow, ArrowRight,
  Search, Trash2, X, Check, Loader2, Code, Layers, FileText, RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { channelMeta, type Channel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — Noxx" },
      { name: "description", content: "Reusable single-channel templates and prebuilt omnichannel flow templates." },
    ],
  }),
  component: TemplatesPage,
});

const channelIcons = { sms: Phone, email: Mail, whatsapp: MessageSquare, ai: Sparkles, voice: Phone };

type OmnichannelTemplate = {
  id: string;
  name: string;
  description: string;
  steps: Array<{ channel: Channel; label: string; kind?: "primary" | "fallback" | "wait" | "branch" }>;
  uses: number;
  type?: string;
  created_at?: string;
};

type SingleTemplate = {
  id: string;
  name: string;
  channel: Channel;
  body: string;
  uses: number;
  type?: string;
  created_at?: string;
};

const INITIAL_SINGLE_TEMPLATES: SingleTemplate[] = [
  { id: "t1", name: "OTP verification", channel: "sms", body: "Your code is {{code}}. It expires in 10 minutes.", uses: 18402 },
  { id: "t2", name: "Order shipped", channel: "email", body: "Hi {{name}}, your order {{order_id}} has shipped.", uses: 9201 },
  { id: "t3", name: "Appointment reminder", channel: "whatsapp", body: "Reminder: your appointment is at {{time}}.", uses: 6541 },
  { id: "t4", name: "AI summary", channel: "ai", body: "Summarize the following conversation: {{transcript}}", uses: 2103 },
  { id: "t5", name: "Welcome email", channel: "email", body: "Welcome to {{org}}! Here's how to get started.", uses: 4820 },
  { id: "t6", name: "Payment receipt", channel: "email", body: "Thanks {{name}} — we received your payment of {{amount}}.", uses: 7311 },
];

const INITIAL_OMNI_TEMPLATES: OmnichannelTemplate[] = [
  {
    id: "ot1",
    name: "OTP with SMS fallback",
    description: "Send a one-time code over WhatsApp, fall back to SMS if not delivered in 30 seconds.",
    steps: [
      { channel: "whatsapp", label: "Send OTP via WhatsApp", kind: "primary" },
      { channel: "sms", label: "Fallback: Send via SMS", kind: "fallback" },
    ],
    uses: 18402,
  },
  {
    id: "ot2",
    name: "Order notification (WhatsApp + Email backup)",
    description: "Notify shipping over WhatsApp; if not delivered in 5 minutes, send a richer Email backup.",
    steps: [
      { channel: "whatsapp", label: "Send shipping update", kind: "primary" },
      { channel: "email", label: "Fallback: Email with tracking link", kind: "fallback" },
    ],
    uses: 9201,
  },
  {
    id: "ot3",
    name: "Appointment reminder with follow-ups",
    description: "Email reminder, then WhatsApp 1h before, SMS 15 min before if still no response.",
    steps: [
      { channel: "email", label: "Send Email reminder (24h before)", kind: "primary" },
      { channel: "whatsapp", label: "WhatsApp nudge (1h before)", kind: "primary" },
      { channel: "sms", label: "SMS reminder if no reply (15m before)", kind: "fallback" },
    ],
    uses: 6541,
  },
  {
    id: "ot4",
    name: "AI support with human handoff",
    description: "AI replies first; if user is unsatisfied, escalate to support over WhatsApp.",
    steps: [
      { channel: "ai", label: "AI auto-respond", kind: "primary" },
      { channel: "whatsapp", label: "Escalate to support agent", kind: "branch" },
    ],
    uses: 2103,
  },
];

const PRESET_VARIABLES = ["{{name}}", "{{code}}", "{{order_id}}", "{{time}}", "{{amount}}", "{{org}}", "{{transcript}}"];

function TemplatesPage() {
  const [singleTemplates, setSingleTemplates] = useState<SingleTemplate[]>(INITIAL_SINGLE_TEMPLATES);
  const [omniTemplates, setOmniTemplates] = useState<OmnichannelTemplate[]>(INITIAL_OMNI_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  // New template modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"single" | "omnichannel">("single");
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("sms");
  const [body, setBody] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<Array<{ channel: Channel; label: string; kind?: "primary" | "fallback" | "wait" | "branch" }>>([
    { channel: "whatsapp", label: "Primary Step", kind: "primary" },
    { channel: "sms", label: "Fallback Step", kind: "fallback" },
  ]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/templates");
      if (res.ok) {
        const json = await res.json();
        if (json.templates) setSingleTemplates(json.templates);
        if (json.omnichannelTemplates) setOmniTemplates(json.omnichannelTemplates);
      }
    } catch (e) {
      console.error("Failed to load templates from database server:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: name.trim(),
        channel,
        body: body.trim(),
        description: description.trim(),
        steps: modalType === "omnichannel" ? steps : undefined,
        type: modalType,
      };

      const res = await fetch("http://localhost:4000/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Server error ${res.status}`);
      }

      await loadTemplates();
      setIsModalOpen(false);
      // Reset form
      setName("");
      setBody("");
      setDescription("");
    } catch (err: any) {
      setSaveError(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (t: SingleTemplate | OmnichannelTemplate, isOmni: boolean) => {
    try {
      const payload = isOmni
        ? { name: `${t.name} (Copy)`, description: (t as OmnichannelTemplate).description, steps: (t as OmnichannelTemplate).steps, type: "omnichannel" }
        : { name: `${t.name} (Copy)`, channel: (t as SingleTemplate).channel, body: (t as SingleTemplate).body, type: "single" };

      const res = await fetch("http://localhost:4000/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await loadTemplates();
      }
    } catch (e) {
      console.error("Failed to duplicate template:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadTemplates();
      }
    } catch (e) {
      console.error("Failed to delete template:", e);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addVariableToBody = (v: string) => {
    setBody((prev) => `${prev} ${v}`.trim());
  };

  // Filter templates
  const filteredSingle = singleTemplates.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === "all" || t.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const filteredOmni = omniTemplates.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === "all" || channelFilter === "omnichannel" || t.steps.some((s) => s.channel === channelFilter);
    return matchesSearch && matchesChannel;
  });

  return (
    <AppLayout>
      <Topbar
        title="Templates"
        subtitle="Prebuilt omnichannel flows and reusable single-channel messages"
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition shadow-soft cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New template
          </button>
        }
      />

      <main className="flex-1 p-6 space-y-8 overflow-auto">
        {/* Controls: Search & Channel Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2 flex-1 max-w-md w-full shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by name, channel, text…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border overflow-x-auto max-w-full">
            {["all", "sms", "email", "whatsapp", "ai", "omnichannel"].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer",
                  channelFilter === ch
                    ? "bg-card text-foreground shadow-soft border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Omnichannel flow templates section */}
        {(channelFilter === "all" || channelFilter === "omnichannel" || filteredOmni.length > 0) && (
          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Omnichannel flows</div>
                <h2 className="mt-1 text-base font-bold text-foreground">Prebuilt flow templates</h2>
                <p className="text-xs text-muted-foreground">Recipes that combine multiple messaging channels with fallback triggers.</p>
              </div>
            </div>

            {filteredOmni.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4">No flow templates matching your filter.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOmni.map((t) => (
                  <Card key={t.id} className="p-5 hover:shadow-elevated transition group relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{t.name}</div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                          title="Delete template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="h-9 w-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                          <Workflow className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {t.steps.map((s, i) => {
                        const Icon = channelIcons[s.channel] || Phone;
                        const meta = channelMeta[s.channel] || { bg: "bg-muted", color: "text-foreground", label: s.channel };
                        return (
                          <span key={i} className="inline-flex items-center gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium",
                                meta.bg,
                                meta.color,
                                s.kind === "fallback" ? "border-amber-500/40 border-dashed" : "border-border",
                              )}
                            >
                              <Icon className="h-3 w-3" />
                              {s.label || meta.label}
                              {s.kind === "fallback" && (
                                <span className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                                  fallback
                                </span>
                              )}
                            </span>
                            {i < t.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                          </span>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs pt-3 border-t border-border">
                      <span className="text-muted-foreground">{t.uses.toLocaleString()} uses</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDuplicate(t, true)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 font-medium text-foreground hover:bg-accent transition cursor-pointer"
                        >
                          <Copy className="h-3 w-3" /> Duplicate
                        </button>
                        <Link
                          to="/flows"
                          className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1.5 font-medium hover:opacity-90 transition shadow-soft"
                        >
                          Use flow
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Single-channel templates section */}
        <section>
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Single-channel</div>
            <h2 className="mt-1 text-base font-bold text-foreground">Message templates</h2>
            <p className="text-xs text-muted-foreground">Reusable, variable-driven message templates saved in your database.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredSingle.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground">No message templates found</h3>
              <p className="text-xs text-muted-foreground mt-1">Create your first template using the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSingle.map((t) => {
                const Icon = channelIcons[t.channel] || Mail;
                const meta = channelMeta[t.channel] || { bg: "bg-muted", color: "text-foreground", label: t.channel };
                const isCopied = copiedId === t.id;
                return (
                  <Card key={t.id} className="p-5 hover:shadow-elevated transition group relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", meta.bg, meta.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border", meta.bg, meta.color, "border-border/40")}>
                            {meta.label}
                          </span>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                            title="Delete template"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-sm font-bold text-foreground">{t.name}</div>
                      <pre className="mt-2 text-xs text-muted-foreground font-mono whitespace-pre-wrap line-clamp-4 bg-muted/40 rounded-xl p-3 border border-border leading-relaxed">
                        {t.body}
                      </pre>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <span>{t.uses.toLocaleString()} uses</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(t.id, t.body)}
                          className="inline-flex items-center gap-1 text-xs text-foreground font-medium hover:text-primary transition cursor-pointer"
                        >
                          {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          {isCopied ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleDuplicate(t, false)}
                          className="inline-flex items-center gap-1 text-xs text-foreground font-medium hover:text-primary transition cursor-pointer"
                        >
                          Duplicate
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ─── NEW TEMPLATE MODAL ──────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-auto animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Create New Template</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Templates are saved permanently to your database.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Template Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60 border border-border">
                  <button
                    type="button"
                    onClick={() => setModalType("single")}
                    className={cn(
                      "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer",
                      modalType === "single" ? "bg-card text-foreground shadow-soft border border-border" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" /> Single Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType("omnichannel")}
                    className={cn(
                      "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer",
                      modalType === "omnichannel" ? "bg-card text-foreground shadow-soft border border-border" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Workflow className="h-3.5 w-3.5" /> Omnichannel Flow
                  </button>
                </div>
              </div>

              {/* Template Name */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Template Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Order Confirmation, OTP Code, Follow-up Flow"
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>

              {modalType === "single" ? (
                <>
                  {/* Channel Select */}
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Channel</label>
                    <div className="grid grid-cols-5 gap-2">
                      {(["sms", "email", "whatsapp", "ai", "voice"] as Channel[]).map((ch) => {
                        const Icon = channelIcons[ch];
                        const meta = channelMeta[ch];
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setChannel(ch)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer",
                              channel === ch
                                ? `${meta.bg} ${meta.color} border-primary font-bold shadow-soft`
                                : "bg-card border-border text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="capitalize text-[11px]">{ch}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Body & Variables */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-foreground">Message Content</label>
                      <span className="text-[10px] text-muted-foreground">Tap tag to insert variable</span>
                    </div>

                    {/* Variable Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {PRESET_VARIABLES.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => addVariableToBody(v)}
                          className="inline-flex items-center gap-1 rounded-md bg-accent hover:bg-accent/80 text-accent-foreground px-2 py-0.5 text-[10px] font-mono font-semibold transition cursor-pointer"
                        >
                          + {v}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Enter template message text… e.g. Hello {{name}}, your code is {{code}}."
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary font-mono transition leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Omnichannel Description */}
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Flow Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this flow recipe does e.g. Sends WhatsApp OTP first, falls back to SMS after 30s."
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm outline-none focus:border-primary transition"
                    />
                  </div>

                  {/* Steps Builder */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground">Flow Steps</label>
                      <button
                        type="button"
                        onClick={() => setSteps([...steps, { channel: "sms", label: "New Step", kind: "fallback" }])}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add Step
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-auto pr-1">
                      {steps.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30">
                          <select
                            value={s.channel}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[idx].channel = e.target.value as Channel;
                              setSteps(newSteps);
                            }}
                            className="rounded-lg border border-input bg-card px-2 py-1 text-xs font-semibold text-foreground outline-none"
                          >
                            <option value="whatsapp">WhatsApp</option>
                            <option value="sms">SMS</option>
                            <option value="email">Email</option>
                            <option value="ai">AI</option>
                            <option value="voice">Voice</option>
                          </select>

                          <input
                            type="text"
                            value={s.label}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[idx].label = e.target.value;
                              setSteps(newSteps);
                            }}
                            placeholder="Step label"
                            className="flex-1 rounded-lg border border-input bg-card px-2.5 py-1 text-xs outline-none"
                          />

                          <select
                            value={s.kind || "primary"}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[idx].kind = e.target.value as any;
                              setSteps(newSteps);
                            }}
                            className="rounded-lg border border-input bg-card px-2 py-1 text-[11px] font-medium text-foreground outline-none capitalize"
                          >
                            <option value="primary">Primary</option>
                            <option value="fallback">Fallback</option>
                            <option value="branch">Branch</option>
                          </select>

                          {steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-red-500 p-1"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2 text-xs font-semibold text-background hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-soft"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? "Saving to Database…" : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
