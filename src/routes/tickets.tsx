import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Phone, Mail, MessageSquare, Instagram, Sparkles, Bot, Send,
  Search, MoreHorizontal, ChevronRight, ArrowUpRight, Tag, Wand2,
  Ticket as TicketIcon, Plus, UserCircle2, CheckCircle2, Clock,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { tickets, suggestReplies, statusBadge, priorityBadge, type TicketStatus } from "@/lib/tickets";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Support Tickets — Noxx" },
      { name: "description", content: "Ticketing system across WhatsApp, Instagram, Email and SMS with AI triage and human handoff." },
    ],
  }),
  component: TicketsPage,
});

const channelIcon = {
  sms: Phone, email: Mail, whatsapp: MessageSquare, instagram: Instagram, ai: Sparkles,
} as const;

const channelTint: Record<string, string> = {
  sms: "bg-channel-sms/10 text-channel-sms",
  email: "bg-channel-email/10 text-channel-email",
  whatsapp: "bg-channel-whatsapp/10 text-channel-whatsapp",
  instagram: "bg-channel-ai/10 text-channel-ai",
  ai: "bg-channel-ai/10 text-channel-ai",
};

function timeAgo(d: Date) {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

type View = "list" | "detail";

function TicketsPage() {
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState(tickets[0].id);
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");
  const [draft, setDraft] = useState("");

  const filtered = tickets.filter((t) => filter === "all" || t.status === filter);
  const selected = tickets.find((t) => t.id === selectedId)!;
  const suggestions = suggestReplies(selected);
  const Icon = channelIcon[selected.channel as keyof typeof channelIcon];

  const counts = {
    all: tickets.length,
    new: tickets.filter((t) => t.status === "new").length,
    open: tickets.filter((t) => t.status === "open").length,
    "ai-handling": tickets.filter((t) => t.status === "ai-handling").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <AppLayout>
      <Topbar
        title="Support Tickets"
        subtitle={`${counts.open + counts["ai-handling"]} active · ${counts.open} need human · ${counts["ai-handling"]} with AI`}
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/automations"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
            >
              <Bot className="h-3.5 w-3.5 text-channel-ai" /> Automations
            </Link>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition">
              <Plus className="h-3.5 w-3.5" /> New ticket
            </button>
          </div>
        }
      />

      {view === "list" ? (
        <main className="flex-1 p-6 space-y-5 overflow-auto">
          {/* Stat chips */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {([
              ["All tickets", counts.all, TicketIcon, "bg-muted text-foreground"],
              ["Open", counts.open, ArrowUpRight, "bg-warning/15 text-warning-foreground"],
              ["AI handling", counts["ai-handling"], Bot, "bg-channel-ai/15 text-channel-ai"],
              ["Pending", counts.pending, Clock, "bg-info/15 text-info"],
              ["Resolved (7d)", counts.resolved + 12, CheckCircle2, "bg-success/15 text-success"],
            ] as const).map(([label, val, I, tint]) => (
              <Card key={label} className="p-4">
                <div className="flex items-center gap-2">
                  <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", tint)}>
                    <I className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{val}</div>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-md border border-input bg-card px-2.5 py-1.5 flex-1 min-w-[220px]">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Search tickets by ID, subject, customer…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {(["all", "open", "ai-handling", "pending", "resolved", "closed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition border",
                    filter === f ? "bg-foreground text-background border-transparent" : "bg-card text-muted-foreground border-border hover:text-foreground")}
                >
                  {f === "all" ? "All" : statusBadge[f].label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket table */}
          <Card className="overflow-hidden">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border bg-card/40">
                    <th className="px-5 py-2.5 font-medium">Ticket</th>
                    <th className="px-3 py-2.5 font-medium">Customer</th>
                    <th className="px-3 py-2.5 font-medium">Channel</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Priority</th>
                    <th className="px-3 py-2.5 font-medium">Assignee</th>
                    <th className="px-5 py-2.5 font-medium text-right">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const TIcon = channelIcon[t.channel as keyof typeof channelIcon];
                    return (
                      <tr
                        key={t.id}
                        onClick={() => { setSelectedId(t.id); setView("detail"); }}
                        className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          <div className="font-mono text-[11px] text-muted-foreground">{t.id}</div>
                          <div className="font-medium text-foreground truncate max-w-xs">{t.subject}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-foreground">{t.contactName}</div>
                          <div className="text-[11px] text-muted-foreground">{t.contactHandle}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] capitalize", channelTint[t.channel])}>
                            <TIcon className="h-2.5 w-2.5" /> {t.channel}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", statusBadge[t.status].cls)}>
                            {statusBadge[t.status].label}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", priorityBadge[t.priority])}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground text-xs">{t.assignee ?? "—"}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground text-xs">{timeAgo(t.lastActivity)} ago</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      ) : (
        <main className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left — ticket info */}
          <aside className="col-span-12 lg:col-span-3 border-r border-border bg-card/40 flex flex-col h-[calc(100vh-4rem)] overflow-auto">
            <div className="p-4 border-b border-border">
              <button onClick={() => setView("list")} className="text-xs text-muted-foreground hover:text-foreground transition">
                ← Back to tickets
              </button>
              <div className="mt-3 font-mono text-[11px] text-muted-foreground">{selected.id}</div>
              <div className="font-semibold text-foreground leading-snug">{selected.subject}</div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", statusBadge[selected.status].cls)}>
                  {statusBadge[selected.status].label}
                </span>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", priorityBadge[selected.priority])}>
                  {selected.priority}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Customer</div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {selected.contactName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{selected.contactName}</div>
                    <div className="text-xs text-muted-foreground truncate">{selected.contactHandle}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md bg-accent text-accent-foreground px-2 py-0.5 text-[11px] font-medium">
                      <Tag className="h-2.5 w-2.5" /> {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Assignee</div>
                <button className="w-full flex items-center gap-2 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs text-foreground hover:bg-accent/40 transition">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  {selected.assignee ?? "Unassigned"}
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                </button>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Quick actions</div>
                <div className="space-y-1">
                  <button className="w-full text-left flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs hover:bg-accent/40 transition">
                    <span className="flex items-center gap-2 text-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Mark resolved</span>
                  </button>
                  <button className="w-full text-left flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs hover:bg-accent/40 transition">
                    <span className="flex items-center gap-2 text-foreground"><ArrowUpRight className="h-3.5 w-3.5" /> Escalate</span>
                  </button>
                  <button className="w-full text-left flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs hover:bg-accent/40 transition">
                    <span className="flex items-center gap-2 text-foreground"><Sparkles className="h-3.5 w-3.5 text-channel-ai" /> AI summarize</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Conversation */}
          <section className="col-span-12 lg:col-span-9 flex flex-col h-[calc(100vh-4rem)] bg-background">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
              <span className={cn("h-7 w-7 rounded-md flex items-center justify-center", channelTint[selected.channel])}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Conversation with {selected.contactName}</div>
                <div className="text-xs text-muted-foreground capitalize">{selected.channel} · {selected.contactHandle}</div>
              </div>
              <button className="rounded-md border border-input bg-card p-1.5 text-muted-foreground hover:text-foreground transition">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-6 space-y-4">
              {selected.messages.map((msg) => {
                const isOut = msg.from !== "customer";
                return (
                  <div key={msg.id} className={cn("flex", isOut ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
                      msg.from === "customer" && "bg-card border border-border text-foreground rounded-bl-sm",
                      msg.from === "ai" && "bg-channel-ai/10 border border-channel-ai/20 text-foreground rounded-br-sm",
                      msg.from === "agent" && "bg-foreground text-background rounded-br-sm")}>
                      {msg.from === "ai" && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-channel-ai mb-1">
                          <Bot className="h-2.5 w-2.5" /> AI Agent
                        </div>
                      )}
                      {msg.text}
                      <div className={cn("mt-1 text-[10px]",
                        msg.from === "agent" ? "text-background/60" : "text-muted-foreground")}>
                        {timeAgo(msg.timestamp)} ago
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggestions */}
            <div className="border-t border-border bg-card/40 px-5 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Wand2 className="h-3.5 w-3.5 text-channel-ai" />
                <span className="text-[11px] font-semibold text-foreground">AI suggested replies</span>
                <span className="text-[10px] text-muted-foreground">· tap to insert</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setDraft(s)}
                    className="shrink-0 max-w-xs text-left rounded-lg border border-channel-ai/30 bg-channel-ai/5 px-3 py-2 text-xs text-foreground hover:bg-channel-ai/10 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-border bg-background p-4">
              <div className="rounded-xl border border-input bg-card p-2 shadow-soft">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder={`Reply on ${selected.channel}…`}
                  className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-channel-ai" />
                    Variables: <code className="text-[10px] font-mono bg-muted px-1 rounded ml-0.5">{`{{name}}`}</code>
                  </div>
                  <button
                    disabled={!draft.trim()}
                    onClick={() => setDraft("")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" /> Send reply
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </AppLayout>
  );
}
