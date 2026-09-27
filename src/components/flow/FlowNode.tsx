import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import {
  Webhook,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Clock,
  GitBranch,
  Settings2,
  ArrowDownRight,
  RotateCw,
  Bot,
  CreditCard,
  Instagram,
  Ticket,
  FileText,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ChannelKind = "sms" | "email" | "whatsapp" | "ai" | "instagram" | "voice";
export type FlowNodeKind = "trigger" | ChannelKind | "delay" | "condition" | "agent" | "payment" | "ticket";

export type FlowNodeData = {
  kind: FlowNodeKind;
  label: string;
  detail?: string;
  /** Optional fallback channel inside the same node (omnichannel) */
  fallback?: ChannelKind;
  /** Retry after X minutes before falling back */
  retryMinutes?: number;
  /** Condition / behavior branch rules */
  conditionType?: string;
  conditionKeyword?: string;
  yesLabel?: string;
  noLabel?: string;
  /** Inbound email target address (e.g. sales@agatike.com, support@agatike.com) */
  targetEmail?: string;
  /** Email subject / keyword filter */
  subjectFilter?: string;
  /** AI Handling Policy: auto_reply | skip_ai_ticket | draft_only */
  aiMode?: "auto_reply" | "skip_ai_ticket" | "draft_only";
  /** AI Focus area & prompt instructions */
  aiFocusArea?: string;
  /** AI Language preference */
  aiLanguage?: string;
  /** Knowledge link / folder context for AI */
  knowledgeLink?: string;
  /** Ticket department assignment */
  ticketDepartment?: string;
  /** Ticket priority level */
  ticketPriority?: "normal" | "high" | "urgent";
  /** Initial ticket status when created */
  ticketStatus?: "open" | "pending" | "resolved";
  /** Used by simulation to highlight the active path */
  active?: boolean;
};

const config: Record<
  FlowNodeKind,
  { icon: typeof Webhook; accent: string; ring: string; tag: string; label: string }
> = {
  trigger: { icon: Webhook, accent: "bg-primary/10 text-primary", ring: "ring-primary/40", tag: "Trigger", label: "Trigger" },
  sms: { icon: Phone, accent: "bg-channel-sms/10 text-channel-sms", ring: "ring-channel-sms/40", tag: "Action", label: "SMS" },
  email: { icon: Mail, accent: "bg-channel-email/10 text-channel-email", ring: "ring-channel-email/40", tag: "Action", label: "Email" },
  whatsapp: { icon: MessageSquare, accent: "bg-channel-whatsapp/10 text-channel-whatsapp", ring: "ring-channel-whatsapp/40", tag: "Action", label: "WhatsApp" },
  instagram: { icon: Instagram, accent: "bg-channel-ai/10 text-channel-ai", ring: "ring-channel-ai/40", tag: "Action", label: "Instagram" },
  voice: { icon: Phone, accent: "bg-channel-sms/10 text-channel-sms", ring: "ring-channel-sms/40", tag: "Action", label: "Voice" },
  ai: { icon: Sparkles, accent: "bg-channel-ai/10 text-channel-ai", ring: "ring-channel-ai/40", tag: "Action", label: "AI" },
  agent: { icon: Bot, accent: "bg-channel-ai/15 text-channel-ai", ring: "ring-channel-ai/50", tag: "AI Agent", label: "AI Agent" },
  payment: { icon: CreditCard, accent: "bg-success/15 text-success", ring: "ring-success/40", tag: "Action", label: "Payment" },
  ticket: { icon: Ticket, accent: "bg-emerald-500/15 text-emerald-600", ring: "ring-emerald-500/40", tag: "Action", label: "Create Ticket" },
  delay: { icon: Clock, accent: "bg-warning/15 text-warning-foreground", ring: "ring-warning/40", tag: "Logic", label: "Delay" },
  condition: { icon: GitBranch, accent: "bg-info/10 text-info", ring: "ring-info/40", tag: "Logic", label: "Condition" },
};

export const FlowNode = memo(({ data, selected }: NodeProps<FlowNodeData>) => {
  const c = config[data.kind] || config.trigger;
  const Icon = c.icon;
  const isTrigger = data.kind === "trigger";
  const isCondition = data.kind === "condition";
  const fallbackCfg = data.fallback ? config[data.fallback] : null;
  const FallbackIcon = fallbackCfg?.icon;

  return (
    <div
      className={cn(
        "w-64 rounded-xl border bg-card shadow-card transition-all relative",
        data.active
          ? `border-transparent ring-2 ${c.ring} shadow-elevated`
          : "border-border",
        selected && !data.active && `ring-2 ${c.ring}`,
      )}
    >
      {!isTrigger && <Handle type="target" position={Position.Top} />}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {c.tag}
          </span>
          <div className="flex items-center gap-1">
            {data.active && (
              <span className="text-[10px] font-medium text-success flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                running
              </span>
            )}
            <button className="text-muted-foreground hover:text-foreground transition">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-start gap-3">
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", c.accent)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{data.label}</div>
            {data.detail && (
              <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{data.detail}</div>
            )}
          </div>
        </div>

        {/* AI Language & Knowledge Badges */}
        {(data.kind === "agent" || data.kind === "ai") && (data.aiLanguage || data.knowledgeLink) && (
          <div className="mt-2.5 flex flex-wrap gap-1 pt-2 border-t border-border/60">
            {data.aiLanguage && (
              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <Globe className="h-3 w-3" />
                {data.aiLanguage === "auto" ? "Auto Lang" : data.aiLanguage.toUpperCase()}
              </span>
            )}
            {data.knowledgeLink && (
              <span className="inline-flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground max-w-[170px] truncate" title={data.knowledgeLink}>
                <FileText className="h-3 w-3" />
                Docs Attached
              </span>
            )}
          </div>
        )}

        {/* Ticket Metadata Badges */}
        {data.kind === "ticket" && (
          <div className="mt-2.5 flex flex-wrap gap-1 pt-2 border-t border-border/60">
            {data.ticketDepartment && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                {data.ticketDepartment}
              </span>
            )}
            {data.ticketPriority && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                data.ticketPriority === "urgent" && "bg-destructive/10 text-destructive font-bold",
                data.ticketPriority === "high" && "bg-warning/15 text-warning-foreground",
                data.ticketPriority === "normal" && "bg-muted text-muted-foreground",
              )}>
                {data.ticketPriority}
              </span>
            )}
          </div>
        )}

        {/* Condition Branch Indicators */}
        {isCondition && (
          <div className="mt-3 grid grid-cols-2 gap-1.5 pt-2 border-t border-border/60">
            <div className="rounded bg-success/10 border border-success/20 px-2 py-1 text-[10px] font-medium text-success flex items-center justify-between">
              <span>✓ {data.yesLabel || "Yes / True"}</span>
            </div>
            <div className="rounded bg-destructive/10 border border-destructive/20 px-2 py-1 text-[10px] font-medium text-destructive flex items-center justify-between">
              <span>✕ {data.noLabel || "No / Else"}</span>
            </div>
          </div>
        )}

        {/* Inline fallback (omnichannel) */}
        {fallbackCfg && FallbackIcon && (
          <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/40 p-2 flex items-center gap-2">
            <ArrowDownRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <div className={cn("h-6 w-6 rounded-md flex items-center justify-center shrink-0", fallbackCfg.accent)}>
              <FallbackIcon className="h-3 w-3" />
            </div>
            <div className="text-[11px] text-foreground flex-1 min-w-0">
              <span className="font-medium">Fallback to {fallbackCfg.label}</span>
              {data.retryMinutes !== undefined && (
                <span className="text-muted-foreground ml-1 inline-flex items-center gap-0.5">
                  <RotateCw className="h-2.5 w-2.5" /> after {data.retryMinutes}m
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {isCondition ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: "25%", background: "var(--success)", width: 10, height: 10, borderWidth: 2 }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ left: "75%", background: "var(--destructive)", width: 10, height: 10, borderWidth: 2 }}
          />
        </>
      ) : (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
});
FlowNode.displayName = "FlowNode";
