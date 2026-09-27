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

const STATUS_CONFIG = {
  replied: {
    icon: CheckCircle2,
    label: "AI Replied",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
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

function EmailRow({ email, index }: { email: EmailInteraction; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[email.status] ?? STATUS_CONFIG.processing;
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        "group border border-border rounded-2xl bg-card overflow-hidden transition-all duration-300",
        "hover:border-primary/30 hover:shadow-card",
        expanded && "border-primary/20 shadow-card"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Row header — always visible */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/30 focus:outline-none"
      >
        {/* Avatar */}
        <div
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-soft",
            avatarColor(email.from)
          )}
        >
          {getInitials(email.from)}
        </div>

        {/* Sender + subject */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground truncate">{email.from}</span>
            {email.status === "replied" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-channel-ai/10 text-channel-ai border border-channel-ai/20 shrink-0">
                <Bot className="h-2.5 w-2.5" />
                AI
              </span>
            )}
          </div>
          <div className="text-sm text-foreground font-medium truncate">
            {email.subject || "No Subject"}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {email.message?.slice(0, 100)}…
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
            <StatusIcon className={cn("h-3.5 w-3.5", email.status === "processing" && "animate-spin")} />
            {status.label}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(email.createdAt)}
          </span>
          <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-accent transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Customer info bar */}
          <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-muted/30 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{email.from}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>{email.to}</span>
            </div>
            <div className="ml-auto">
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

          {/* Incoming message */}
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MailOpen className="h-4 w-4 text-channel-email" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Customer Message
                </span>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono">
                {email.message}
              </div>
            </div>

            {/* AI Response */}
            {email.aiResponse && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-md bg-channel-ai/20 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-channel-ai" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-channel-ai">
                    AI Response
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Sent via Resend
                  </span>
                </div>
                <div className="rounded-xl border border-channel-ai/20 bg-channel-ai/5 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {email.aiResponse}
                </div>
              </div>
            )}

            {email.status === "processing" && !email.aiResponse && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Clock className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Gemini is generating a response…
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailsPage() {
  const [emails, setEmails] = useState<EmailInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "replied" | "processing" | "failed">("all");

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
            status: row.status as "processing" | "replied" | "failed",
            createdAt: row.created_at,
          }));
          setEmails(mapped);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Hasura fetch error:", err);
      }
    }

    // Initial fetch then poll every 3 seconds for live updates
    fetchFromHasura();
    const interval = setInterval(fetchFromHasura, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const counts = {
    all: emails.length,
    replied: emails.filter((e) => e.status === "replied").length,
    processing: emails.filter((e) => e.status === "processing").length,
    failed: emails.filter((e) => e.status === "failed").length,
  };

  const filtered = filter === "all" ? emails : emails.filter((e) => e.status === filter);

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "replied", label: "AI Replied" },
    { key: "processing", label: "Processing" },
    { key: "failed", label: "Failed" },
  ];

  return (
    <AppLayout>
      <Topbar
        title="Emails"
        subtitle="Inbound emails handled by the AI Receptionist"
      />
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="w-full space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: counts.all, color: "text-foreground", bg: "bg-card" },
              { label: "AI Replied", value: counts.replied, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5" },
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
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border w-fit">
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

          {/* Email list */}
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
                Loading emails…
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">No emails yet</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  {filter === "all"
                    ? "Send an email to your Resend address to trigger the AI Receptionist."
                    : `No emails with status "${filter}".`}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((email, i) => (
                <EmailRow key={email.id} email={email} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
