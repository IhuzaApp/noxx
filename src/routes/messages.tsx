import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  List,
  MessageCircle,
  ArrowDownRight,
  CornerDownRight,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/Card";
import { channelMeta, messageLogs, statusMeta, type Channel, type Status } from "@/lib/mock-data";
import { conversations, type ConversationEvent } from "@/lib/conversations";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Noxx" },
      { name: "description", content: "Browse messages with filters or view full conversations across channels per recipient." },
    ],
  }),
  component: MessagesPage,
});

const channelIcons = { sms: Phone, email: Mail, whatsapp: MessageSquare, ai: Sparkles };

function MessagesPage() {
  const [view, setView] = useState<"table" | "conversations">("conversations");

  return (
    <AppLayout>
      <Topbar
        title="Messages"
        subtitle={
          view === "conversations"
            ? `${conversations.length} unified conversations across all channels`
            : `${messageLogs.length} messages`
        }
        action={
          <div className="flex items-center gap-1 rounded-md border border-input bg-card p-1 shadow-soft">
            <button
              onClick={() => setView("conversations")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition",
                view === "conversations"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" /> Conversations
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition",
                view === "table"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-3.5 w-3.5" /> Table
            </button>
          </div>
        }
      />
      <main className="flex-1 p-6 space-y-4">
        {view === "table" ? <TableView /> : <ConversationsView />}
      </main>
    </AppLayout>
  );
}

/* ---------------- Table view (existing) ---------------- */

function TableView() {
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return messageLogs.filter((m) => {
      if (channel !== "all" && m.channel !== channel) return false;
      if (status !== "all" && m.status !== status) return false;
      if (q && !`${m.recipient} ${m.preview}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [channel, status, q]);

  return (
    <>
      <Card className="p-3 flex flex-col md:flex-row gap-2 md:items-center">
        <div className="flex items-center gap-2 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipient or message…"
            className="flex-1 bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={channel} onChange={setChannel as (v: string) => void}>
            <option value="all">All channels</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="ai">AI</option>
          </Select>
          <Select value={status} onChange={setStatus as (v: string) => void}>
            <option value="all">All statuses</option>
            <option value="delivered">Delivered</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground bg-muted/50">
                <th className="px-5 py-3 font-medium">Channel</th>
                <th className="px-5 py-3 font-medium">Recipient</th>
                <th className="px-5 py-3 font-medium">Message</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Sent at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => {
                const Icon = channelIcons[m.channel];
                const meta = channelMeta[m.channel];
                const st = statusMeta[m.status];
                return (
                  <tr key={m.id} className="hover:bg-muted/40 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-7 w-7 rounded-md flex items-center justify-center", meta.bg, meta.color)}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-medium text-foreground">{meta.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground font-mono text-xs">{m.recipient}</td>
                    <td className="px-5 py-3 text-muted-foreground max-w-md truncate">{m.preview}</td>
                    <td className="px-5 py-3">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md border", st.className)}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground text-xs">
                      {format(m.timestamp, "MMM d, HH:mm:ss")}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    No messages match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ---------------- Conversation timeline view ---------------- */

function ConversationsView() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId)!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[calc(100vh-10rem)]">
      {/* Conversation list */}
      <Card className="overflow-hidden flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search conversations…" className="flex-1 bg-transparent outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-auto divide-y divide-border">
          {conversations.map((c) => {
            const last = c.events[c.events.length - 1];
            const channelsUsed = Array.from(new Set(c.events.map((e) => e.channel)));
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/40 transition flex flex-col gap-1.5",
                  activeId === c.id && "bg-accent/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-foreground text-sm truncate">{c.contactName}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(last.timestamp, { addSuffix: true })}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{last.preview}</div>
                <div className="flex items-center gap-1 mt-1">
                  {channelsUsed.map((ch) => {
                    const Icon = channelIcons[ch];
                    const meta = channelMeta[ch];
                    return (
                      <span key={ch} className={cn("h-4 w-4 rounded flex items-center justify-center", meta.bg, meta.color)}>
                        <Icon className="h-2.5 w-2.5" />
                      </span>
                    );
                  })}
                  <span className="ml-auto text-[10px] text-muted-foreground truncate">{c.flow}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-foreground">{active.contactName}</div>
            <div className="text-xs text-muted-foreground font-mono">{active.recipient}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              From flow:{" "}
              <span className="font-medium text-foreground">{active.flow}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            {Array.from(new Set(active.events.map((e) => e.channel))).map((ch) => {
              const Icon = channelIcons[ch];
              const meta = channelMeta[ch];
              return (
                <span
                  key={ch}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border border-border",
                    meta.bg,
                    meta.color,
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-muted/20">
          <ol className="relative space-y-5">
            <span aria-hidden className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
            {active.events.map((ev) => (
              <TimelineItem key={ev.id} event={ev} />
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}

function TimelineItem({ event }: { event: ConversationEvent }) {
  const Icon = channelIcons[event.channel];
  const meta = channelMeta[event.channel];
  const inbound = event.direction === "inbound";

  const statusBadge = (() => {
    if (event.status === "delivered") return { label: "Delivered", cls: "bg-success/15 text-success border-success/20" };
    if (event.status === "failed") return { label: "Failed", cls: "bg-destructive/15 text-destructive border-destructive/20" };
    if (event.status === "fallback") return { label: "Fallback triggered", cls: "bg-warning/15 text-warning-foreground border-warning/30" };
    if (event.status === "opened") return { label: "Opened", cls: "bg-info/15 text-info border-info/20" };
    if (event.status === "replied") return { label: "Replied", cls: "bg-primary/10 text-primary border-primary/20" };
    if (event.status === "sent") return { label: "Sent", cls: "bg-info/15 text-info border-info/20" };
    if (event.status === "pending") return { label: "Pending", cls: "bg-warning/15 text-warning-foreground border-warning/30" };
    return { label: "Sent", cls: "bg-muted text-muted-foreground border-border" };
  })();

  return (
    <li className="relative pl-10">
      <span className={cn("absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-muted/20", meta.bg, meta.color)}>
        <Icon className="h-4 w-4" />
      </span>
      <div
        className={cn(
          "rounded-xl border p-3 max-w-xl shadow-soft",
          inbound
            ? "bg-card border-border"
            : event.status === "fallback"
              ? "bg-warning/5 border-warning/30"
              : "bg-card border-border",
        )}
      >
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
          <span className="font-medium text-foreground">
            {inbound ? "Inbound" : "Outbound"} · {meta.label}
          </span>
          <span>·</span>
          <span>{format(event.timestamp, "MMM d, HH:mm")}</span>
          {event.fallbackFor && (
            <span className="inline-flex items-center gap-1 text-warning-foreground">
              <ArrowDownRight className="h-3 w-3" />
              fallback after failure
            </span>
          )}
        </div>
        <div className="text-sm text-foreground">
          {inbound && <CornerDownRight className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />}
          {event.preview}
        </div>
        <div className="mt-2">
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md border", statusBadge.cls)}>
            {statusBadge.label}
          </span>
        </div>
      </div>
    </li>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    >
      {children}
    </select>
  );
}
