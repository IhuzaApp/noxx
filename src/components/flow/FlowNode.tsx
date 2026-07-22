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
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ChannelKind = "sms" | "email" | "whatsapp" | "ai" | "instagram";
export type FlowNodeKind = "trigger" | ChannelKind | "delay" | "condition" | "agent" | "payment";

export type FlowNodeData = {
  kind: FlowNodeKind;
  label: string;
  detail?: string;
  /** Optional fallback channel inside the same node (omnichannel) */
  fallback?: ChannelKind;
  /** Retry after X minutes before falling back */
  retryMinutes?: number;
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
  ai: { icon: Sparkles, accent: "bg-channel-ai/10 text-channel-ai", ring: "ring-channel-ai/40", tag: "Action", label: "AI" },
  agent: { icon: Bot, accent: "bg-channel-ai/15 text-channel-ai", ring: "ring-channel-ai/50", tag: "AI Agent", label: "AI Agent" },
  payment: { icon: CreditCard, accent: "bg-success/15 text-success", ring: "ring-success/40", tag: "Action", label: "Payment" },
  delay: { icon: Clock, accent: "bg-warning/15 text-warning-foreground", ring: "ring-warning/40", tag: "Logic", label: "Delay" },
  condition: { icon: GitBranch, accent: "bg-info/10 text-info", ring: "ring-info/40", tag: "Logic", label: "Condition" },
};

export const FlowNode = memo(({ data, selected }: NodeProps<FlowNodeData>) => {
  const c = config[data.kind];
  const Icon = c.icon;
  const isTrigger = data.kind === "trigger";
  const fallbackCfg = data.fallback ? config[data.fallback] : null;
  const FallbackIcon = fallbackCfg?.icon;

  return (
    <div
      className={cn(
        "w-64 rounded-xl border bg-card shadow-card transition-all",
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
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
FlowNode.displayName = "FlowNode";
