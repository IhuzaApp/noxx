import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Mail, MessageSquare, Instagram, Phone, Sparkles, Bot, Send,
  Search, MoreHorizontal, ChevronRight, ArrowUpRight, Tag, Wand2,
  Ticket as TicketIcon, Plus, UserCircle2, CheckCircle2, Clock,
  RefreshCw, Inbox, XCircle, Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Support Tickets — Noxx" },
      { name: "description", content: "AI-handled support tickets from all channels, monitored in real time." },
    ],
  }),
  component: TicketsPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type ConversationMsg = {
  id: string;
  sender: "customer" | "ai" | "agent";
  message: string;
  created_at: string;
};

type Ticket = {
  id: string;
  email_id: string | null;
  subject: string;
  contact_name: string;
  contact_email: string;
  channel: string;
  status: "ai-handling" | "open" | "pending" | "resolved" | "closed" | "new";
  priority: string;
  assignee: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  conversations: ConversationMsg[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const HASURA_ENDPOINT = import.meta.env.HASURA_GRAPHQL_ENDPOINT || "";
const HASURA_SECRET = import.meta.env.HASURA_ADMIN_SECRET || "";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = import.meta.env.GROQ_API_KEY || "";

// ─── Groq suggestion hook ────────────────────────────────────────────────────

function useSuggestions(ticketId: string | null, conversations: ConversationMsg[]) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!ticketId || conversations.length === 0) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const context = conversations
        .map((m) => `${m.sender === "customer" ? "Customer" : "Agent/AI"}: ${m.message}`)
        .join("\n");
      const prompt = `You are a support agent assistant. Based on this conversation, suggest exactly 3 short, helpful reply options an agent could send. Each suggestion should be on its own line, starting with a dash (-). Be concise (max 2 sentences each). Do not number them.\n\nConversation:\n${context}`;
      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 256,
          temperature: 0.8,
        }),
      });
      const json = await res.json();
      const raw = json?.choices?.[0]?.message?.content ?? "";
      const parsed = raw
        .split("\n")
        .map((l: string) => l.replace(/^[-•*]\s*/, "").trim())
        .filter((l: string) => l.length > 10)
        .slice(0, 3);
      setSuggestions(parsed);
    } catch (e) {
      console.error("Groq suggestion error:", e);
    } finally {
      setLoading(false);
    }
  }, [ticketId, conversations]);

  // Auto-generate when ticket changes
  useEffect(() => {
    setSuggestions([]);
    generate();
  }, [ticketId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { suggestions, loading, refresh: generate };
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string; icon: any }> = {
  "ai-handling": { label: "AI Handling", cls: "bg-channel-ai/10 text-channel-ai border-channel-ai/20", dot: "bg-channel-ai animate-pulse", icon: Bot },
  open: { label: "Open", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", dot: "bg-amber-500", icon: ArrowUpRight },
  new: { label: "New", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", dot: "bg-blue-500", icon: TicketIcon },
  pending: { label: "Pending", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20", dot: "bg-sky-500", icon: Clock },
  resolved: { label: "Resolved", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500", icon: CheckCircle2 },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", icon: XCircle },
};

const CHANNEL_ICON: Record<string, any> = {
  email: Mail, sms: Phone, whatsapp: MessageSquare, instagram: Instagram, ai: Sparkles,
};

const CHANNEL_TINT: Record<string, string> = {
  email: "bg-channel-email/10 text-channel-email",
  sms: "bg-channel-sms/10 text-channel-sms",
  whatsapp: "bg-channel-whatsapp/10 text-channel-whatsapp",
  instagram: "bg-channel-ai/10 text-channel-ai",
  ai: "bg-channel-ai/10 text-channel-ai",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: string) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function avatarInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function avatarColor(email: string) {
  const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];
  let h = 0;
  for (let i = 0; i < (email || "").length; i++) h = (email.charCodeAt(i) + ((h << 5) - h));
  return colors[Math.abs(h) % colors.length];
}

// ─── Hasura fetch ─────────────────────────────────────────────────────────────

async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(HASURA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": HASURA_SECRET },
    body: JSON.stringify({
      query: `{
        tickets(order_by: { updated_at: desc }, limit: 100) {
          id email_id subject contact_name contact_email
          channel status priority assignee tags created_at updated_at
          conversations(order_by: { created_at: asc }) {
            id sender message created_at
          }
        }
      }`,
    }),
  });
  const json = await res.json();
  const rawTickets: Ticket[] = json?.data?.tickets ?? [];
  return rawTickets.map((t) => {
    const email = t.contact_email;
    const name = t.contact_name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const subject = t.subject || "Support Request";
    return {
      ...t,
      contact_email: email,
      contact_name: name,
      subject: subject,
      channel: t.channel || "email",
    };
  });
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold border", cfg.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function ConversationThread({ messages }: { messages: ConversationMsg[] }) {
  if (!messages.length)
    return <p className="text-xs text-muted-foreground italic p-4">No messages yet.</p>;
  return (
    <div className="flex flex-col gap-3 px-5 py-4 overflow-auto flex-1">
      {messages.map((msg) => {
        const isCustomer = msg.sender === "customer";
        const isAI = msg.sender === "ai";
        return (
          <div key={msg.id} className={cn("flex", isCustomer ? "justify-start" : "justify-end")}>
            <div className={cn(
              "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-soft",
              isCustomer && "bg-card border border-border text-foreground rounded-bl-sm",
              isAI && "bg-channel-ai/10 border border-channel-ai/20 text-foreground rounded-br-sm",
              !isCustomer && !isAI && "bg-foreground text-background rounded-br-sm",
            )}>
              {isAI && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-channel-ai mb-1">
                  <Bot className="h-2.5 w-2.5" /> AI Agent
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              <div className={cn("mt-1 text-[10px]", isCustomer ? "text-muted-foreground" : isAI ? "text-channel-ai/70" : "text-background/60")}>
                {timeAgo(msg.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type FilterKey = "all" | "ai-handling" | "open" | "pending" | "resolved" | "closed";

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const { suggestions, loading: sugLoading, refresh: refreshSuggestions } = useSuggestions(
    selected?.id ?? null,
    selected?.conversations ?? []
  );

  const handleSend = async () => {
    if (!draft.trim() || !selected || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("http://localhost:4000/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: selected.id, message: draft.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Server error ${res.status}`);
      }
      setDraft("");
      // Reload tickets so the new conversation entry appears
      await load();
    } catch (e: any) {
      setSendError(e.message ?? "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const load = useCallback(async () => {
    try {
      const data = await fetchTickets();
      setTickets(data);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load tickets:", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = tickets
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.subject?.toLowerCase().includes(q) ||
        t.contact_name?.toLowerCase().includes(q) ||
        t.contact_email?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q)
      );
    });

  const counts = {
    all: tickets.length,
    "ai-handling": tickets.filter((t) => t.status === "ai-handling").length,
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const ChanIcon = selected ? (CHANNEL_ICON[selected.channel] ?? Mail) : Mail;

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ai-handling", label: "AI Handling" },
    { key: "open", label: "Open" },
    { key: "pending", label: "Pending" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
  ];

  // ── Detail view ──────────────────────────────────────────────────────────────
  if (selected) {
    const cfgSel = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.open;
    return (
      <AppLayout>
        <Topbar
          title={selected.subject || "Ticket"}
          subtitle={`${selected.contact_name} · ${selected.channel}`}
          action={
            <button
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
            >
              ← All Tickets
            </button>
          }
        />
        <main className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left sidebar — ticket info */}
          <aside className="col-span-12 lg:col-span-3 border-r border-border bg-card/40 flex flex-col overflow-auto">
            <div className="p-5 border-b border-border space-y-3">
              <div className="font-mono text-[10px] text-muted-foreground">{selected.id.slice(0, 8).toUpperCase()}</div>
              <div className="font-semibold text-foreground leading-snug">{selected.subject}</div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="p-5 space-y-5">
              {/* Customer */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Customer</div>
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl text-white text-xs font-bold flex items-center justify-center shrink-0", avatarColor(selected.contact_email))}>
                    {avatarInitials(selected.contact_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{selected.contact_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{selected.contact_email}</div>
                  </div>
                </div>
              </div>

              {/* Channel */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Channel</div>
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs capitalize border", CHANNEL_TINT[selected.channel] || "bg-muted text-muted-foreground border-border")}>
                  <ChanIcon className="h-3.5 w-3.5" /> {selected.channel}
                </span>
              </div>

              {/* Tags */}
              {selected.tags?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-accent text-accent-foreground px-2 py-0.5 text-[11px] font-medium">
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignee */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Assignee</div>
                <button className="w-full flex items-center gap-2 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs text-foreground hover:bg-accent/40 transition">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  {selected.assignee ?? "Unassigned"}
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                </button>
              </div>

              {/* Quick actions */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Actions</div>
                <div className="space-y-1">
                  <button className="w-full text-left flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-accent/40 transition text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Mark resolved
                  </button>
                  <button className="w-full text-left flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-accent/40 transition text-foreground">
                    <ArrowUpRight className="h-3.5 w-3.5" /> Escalate
                  </button>
                  <button className="w-full text-left flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-accent/40 transition text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-channel-ai" /> AI summarize
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground pt-2">
                Created {timeAgo(selected.created_at)} · Updated {timeAgo(selected.updated_at)}
              </div>
            </div>
          </aside>

          {/* Conversation */}
          <section className="col-span-12 lg:col-span-9 flex flex-col h-[calc(100vh-4rem)] bg-background">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
              <span className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", CHANNEL_TINT[selected.channel] || "bg-muted text-muted-foreground")}>
                <ChanIcon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Conversation with {selected.contact_name}</div>
                <div className="text-xs text-muted-foreground capitalize">{selected.channel} · {selected.contact_email}</div>
              </div>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", cfgSel.cls)}>
                {cfgSel.label}
              </span>
              <button className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-foreground transition">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <ConversationThread messages={selected.conversations ?? []} />

            {/* AI Suggestions panel */}
            <div className="border-t border-border bg-card/40 px-5 py-3 shrink-0">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-5 w-5 rounded-md bg-channel-ai/20 flex items-center justify-center shrink-0">
                  <Wand2 className="h-3 w-3 text-channel-ai" />
                </div>
                <span className="text-[11px] font-semibold text-foreground">AI reply suggestions</span>
                <span className="text-[10px] text-muted-foreground">· tap to insert</span>
                <button
                  onClick={refreshSuggestions}
                  disabled={sugLoading}
                  className="ml-auto h-6 w-6 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition disabled:opacity-40"
                  title="Regenerate suggestions"
                >
                  <RefreshCw className={cn("h-3 w-3", sugLoading && "animate-spin")} />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {sugLoading && !suggestions.length && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating suggestions…
                  </div>
                )}
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setDraft(s)}
                    className="shrink-0 max-w-[280px] text-left rounded-xl border border-channel-ai/25 bg-channel-ai/5 px-3.5 py-2.5 text-xs text-foreground hover:bg-channel-ai/10 hover:border-channel-ai/40 transition-all leading-relaxed"
                  >
                    <span className="text-channel-ai font-semibold text-[9px] uppercase tracking-widest block mb-1">
                      Option {i + 1}
                    </span>
                    {s}
                  </button>
                ))}
                {!sugLoading && suggestions.length === 0 && (
                  <p className="text-xs text-muted-foreground italic px-1">
                    No suggestions yet —
                    <button onClick={refreshSuggestions} className="underline ml-1 hover:text-foreground transition">generate now</button>
                  </p>
                )}
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-border bg-background p-4 shrink-0">
              {sendError && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  {sendError}
                  <button onClick={() => setSendError(null)} className="ml-auto underline hover:no-underline">Dismiss</button>
                </div>
              )}
              <div className="rounded-xl border border-input bg-card p-2 shadow-soft">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
                  rows={2}
                  placeholder={`Reply to ${selected.contact_email}… (⌘↵ to send)`}
                  disabled={sending}
                  className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-channel-ai" />
                    Replying as agent · {selected.contact_email}
                  </div>
                  <button
                    disabled={!draft.trim() || sending}
                    onClick={handleSend}
                    className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition disabled:opacity-40"
                  >
                    {sending ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="h-3 w-3" /> Send reply</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </AppLayout>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <Topbar
        title="Support Tickets"
        subtitle={`${counts["ai-handling"]} AI handling · ${counts.open} open · ${counts.resolved} resolved`}
        action={
          <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition">
            <Plus className="h-3.5 w-3.5" /> New ticket
          </button>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total", value: counts.all, bg: "bg-card", icon: TicketIcon, color: "text-foreground" },
            { label: "AI Handling", value: counts["ai-handling"], bg: "bg-channel-ai/5", icon: Bot, color: "text-channel-ai" },
            { label: "Open", value: counts.open, bg: "bg-amber-500/5", icon: ArrowUpRight, color: "text-amber-600 dark:text-amber-400" },
            { label: "Pending", value: counts.pending, bg: "bg-sky-500/5", icon: Clock, color: "text-sky-600 dark:text-sky-400" },
            { label: "Resolved", value: counts.resolved, bg: "bg-emerald-500/5", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Closed", value: counts.closed, bg: "bg-muted/50", icon: XCircle, color: "text-muted-foreground" },
          ].map(({ label, value, bg, icon: Icon, color }) => (
            <Card key={label} className={cn("p-4", bg)}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("h-3.5 w-3.5", color)} />
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
              </div>
              <div className={cn("text-2xl font-bold tabular-nums", color)}>
                {loading ? "—" : value}
              </div>
            </Card>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, customer, ID…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  filter === f.key
                    ? "bg-card text-foreground shadow-soft border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                {counts[f.key] > 0 && (
                  <span className={cn("ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold",
                    filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {counts[f.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl border border-border bg-card animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
            <div className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading tickets…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No tickets yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                {filter === "all" ? "Tickets are created automatically when emails arrive." : `No tickets with status "${filter}".`}
              </p>
            </div>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/30">
                    <th className="px-5 py-3 font-medium">Ticket</th>
                    <th className="px-3 py-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">Channel</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Msgs</th>
                    <th className="px-5 py-3 font-medium text-right">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const TIcon = CHANNEL_ICON[t.channel] ?? Mail;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono text-[10px] text-muted-foreground">{t.id.slice(0, 8).toUpperCase()}</span>
                            {t.tags?.includes("ai-created") && (
                              <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold bg-channel-ai/15 text-channel-ai border border-channel-ai/20">
                                <Sparkles className="h-2 w-2" /> AI
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-foreground truncate max-w-xs">{t.subject}</div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("h-7 w-7 rounded-lg text-white text-[10px] font-bold flex items-center justify-center shrink-0", avatarColor(t.contact_email))}>
                              {avatarInitials(t.contact_name)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{t.contact_name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{t.contact_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] capitalize border", CHANNEL_TINT[t.channel] || "bg-muted text-muted-foreground border-border")}>
                            <TIcon className="h-3 w-3" /> {t.channel}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                            {t.conversations?.length ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo(t.updated_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </AppLayout>
  );
}
