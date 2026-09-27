import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  MailOpen,
  User,
  ArrowRight,
  RefreshCw,
  Inbox,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/ai-receptionist")({
  component: EmailsPage,
});

type EmailInteraction = {
  id: string;
  resendEmailId: string;
  from: string;
  to: string;
  subject: string;
  message: string;
  aiResponse: string;
  status: "processing" | "replied" | "failed";
  createdAt: any;
};

function formatDate(ts: any) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(email: string | undefined) {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function avatarColor(email: string | undefined) {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  if (!email) return colors[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const STATUS_CONFIG: Record<string, { icon: any; label: string; className: string; dot: string }> = {
  replied: {
    icon: CheckCircle2,
    label: "AI Replied",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  "human-handling": {
    icon: User,
    label: "Human Agent",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  processing: {
    icon: Clock,
    label: "Processing",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500 animate-pulse",
  },
};

type EmailThread = {
  threadKey: string;
  subject: string;
  from: string;
  to: string;
  latestCreatedAt: any;
  status: string;
  items: EmailInteraction[];
};

function groupEmailsIntoThreads(emails: EmailInteraction[]): EmailThread[] {
  const map = new Map<string, EmailInteraction[]>();

  for (const e of emails) {
    const cleanSubj = (e.subject || "No Subject").replace(/^(re|fwd|fw):\s*/i, "").trim().toLowerCase();
    const key = `${(e.from || "").toLowerCase()}::${cleanSubj}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  const threads: EmailThread[] = [];
  for (const [key, items] of map.entries()) {
    items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const latest = items[items.length - 1];
    const displaySubject = (latest.subject || items[0].subject || "No Subject").replace(/^(re|fwd|fw):\s*/i, "").trim();

    const isHuman = items.some((i) => i.status === "human-handling");
    const status = isHuman ? "human-handling" : latest.status;

    threads.push({
      threadKey: key,
      subject: displaySubject,
      from: latest.from,
      to: latest.to,
      latestCreatedAt: latest.createdAt,
      status,
      items,
    });
  }

  threads.sort((a, b) => new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime());
  return threads;
}

function ThreadRow({ thread, index }: { thread: EmailThread; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[thread.status] ?? STATUS_CONFIG.processing;
  const StatusIcon = status.icon;
  const latestItem = thread.items[thread.items.length - 1];

  return (
    <div
      className={cn(
        "group border border-border rounded-2xl bg-card overflow-hidden transition-all duration-300",
        "hover:border-primary/30 hover:shadow-card",
        expanded && "border-primary/20 shadow-card"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Row header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/30 focus:outline-none"
      >
        {/* Avatar */}
        <div
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-soft",
            avatarColor(thread.from)
          )}
        >
          {getInitials(thread.from)}
        </div>

        {/* Sender + subject */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground truncate">{thread.from}</span>
            {thread.items.length > 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border shrink-0">
                {thread.items.length} emails
              </span>
            )}
            {thread.status === "replied" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-channel-ai/10 text-channel-ai border border-channel-ai/20 shrink-0">
                <Bot className="h-2.5 w-2.5" />
                AI
              </span>
            )}
            {thread.status === "human-handling" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                <User className="h-2.5 w-2.5" />
                Agent
              </span>
            )}
          </div>
          <div className="text-sm text-foreground font-medium truncate">
            {thread.subject}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {latestItem?.message?.slice(0, 100)}…
          </div>
        </div>

        {/* Right side meta */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
              status.className
            )}
          >
            <StatusIcon className={cn("h-3.5 w-3.5", thread.status === "processing" && "animate-spin")} />
            {status.label}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(thread.latestCreatedAt)}
          </span>
          <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-accent transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Expanded content — shows full conversation thread */}
      {expanded && (
        <div className="border-t border-border bg-muted/10 divide-y divide-border/60">
          {/* Customer info bar */}
          <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{thread.from}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>{thread.to}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Thread ({thread.items.length})</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                  status.className
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
            </div>
          </div>

          {/* List of thread messages */}
          <div className="p-5 space-y-6">
            {thread.items.map((email, idx) => (
              <div key={email.id} className="space-y-3 p-4 rounded-2xl border border-border bg-card shadow-soft">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
                  <span className="font-semibold text-foreground">Message #{idx + 1} · {email.subject}</span>
                  <span>{formatDate(email.createdAt)}</span>
                </div>

                {/* Customer Message */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <MailOpen className="h-3.5 w-3.5 text-channel-email" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Customer Message
                    </span>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5 text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono">
                    {email.message}
                  </div>
                </div>

                {/* Response / Status */}
                {email.aiResponse ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-4 w-4 rounded bg-channel-ai/20 flex items-center justify-center">
                        <Sparkles className="h-2.5 w-2.5 text-channel-ai" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-channel-ai">
                        AI Response
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Sent via Resend
                      </span>
                    </div>
                    <div className="rounded-xl border border-channel-ai/20 bg-channel-ai/5 p-3.5 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {email.aiResponse}
                    </div>
                  </div>
                ) : email.status === "human-handling" ? (
                  <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-600 dark:text-blue-400">
                    <User className="h-4 w-4 shrink-0" />
                    <span>Transferred to Human Support Agent (AI auto-response skipped).</span>
                  </div>
                ) : email.status === "processing" ? (
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4 animate-spin shrink-0" />
                    <span>Processing response…</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailsPage() {
  const [emails, setEmails] = useState<EmailInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "replied" | "human-handling" | "processing" | "failed">("all");

  useEffect(() => {
    let isMounted = true;

    async function fetchFromHasura() {
      try {
        const endpoint = import.meta.env.HASURA_GRAPHQL_ENDPOINT || "";
        const secret = import.meta.env.HASURA_ADMIN_SECRET || "";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": secret,
          },
          body: JSON.stringify({
            query: `{
              emails(order_by: {created_at: desc}, limit: 50) {
                id
                resend_email_id
                from
                to
                subject
                message
                ai_response
                status
                created_at
              }
            }`,
          }),
        });
        const json = await res.json();
        if (json?.data?.emails && isMounted) {
          const mapped: EmailInteraction[] = json.data.emails.map((row: any) => ({
            id: row.id,
            resendEmailId: row.resend_email_id,
            from: row.from || "Customer",
            to: row.to || "support@agatike.rw",
            subject: row.subject || "No Subject",
            message: row.message,
            aiResponse: row.ai_response,
            status: row.status as any,
            createdAt: row.created_at,
          }));
          setEmails(mapped);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Hasura fetch error:", err);
      }
    }

    fetchFromHasura();
    const interval = setInterval(fetchFromHasura, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const threads = groupEmailsIntoThreads(emails);

  const counts = {
    all: threads.length,
    replied: threads.filter((t) => t.status === "replied").length,
    "human-handling": threads.filter((t) => t.status === "human-handling").length,
    processing: threads.filter((t) => t.status === "processing").length,
    failed: threads.filter((t) => t.status === "failed").length,
  };

  const filteredThreads = filter === "all" ? threads : threads.filter((t) => t.status === filter);

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All Threads" },
    { key: "replied", label: "AI Replied" },
    { key: "human-handling", label: "Human Agent" },
    { key: "processing", label: "Processing" },
    { key: "failed", label: "Failed" },
  ];

  return (
    <AppLayout>
      <Topbar
        title="Emails"
        subtitle="Inbound emails & threads handled by AI Receptionist and Support Agents"
      />
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="w-full space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Threads", value: counts.all, color: "text-foreground", bg: "bg-card" },
              { label: "AI Replied", value: counts.replied, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5" },
              { label: "Human Agent", value: counts["human-handling"], color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/5" },
              { label: "Processing", value: counts.processing, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5" },
              { label: "Failed", value: counts.failed, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/5" },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-2xl border border-border p-4 shadow-soft flex flex-col gap-1",
                  s.bg
                )}
              >
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <span className={cn("text-2xl font-bold tabular-nums", s.color)}>
                  {loading ? "—" : s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border w-fit flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  filter === f.key
                    ? "bg-card text-foreground shadow-soft border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                {counts[f.key] > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold",
                      filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {counts[f.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Thread list */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl border border-border bg-card animate-pulse"
                  style={{ opacity: 1 - i * 0.2 }}
                />
              ))}
              <div className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading email threads…
              </div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">No threads found</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  {filter === "all"
                    ? "Send an email to your Resend address to trigger the AI Receptionist."
                    : `No threads with status "${filter}".`}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredThreads.map((thread, i) => (
                <ThreadRow key={thread.threadKey} thread={thread} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
