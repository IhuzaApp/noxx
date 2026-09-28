import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MessageSquare,
  Mail,
  Phone,
  Sparkles,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Topbar } from "@/components/Topbar";
import { Card, StatCard } from "@/components/Card";
import {
  channelMeta,
  messageLogs,
  overviewStats,
  statusMeta,
  trendData,
  usageByChannel,
} from "@/lib/mock-data";
import { omnichannelStats } from "@/lib/conversations";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Noxx" },
      {
        name: "description",
        content:
          "Send SMS, Email, WhatsApp and AI messages and build automation flows from one unified API.",
      },
    ],
  }),
  component: Dashboard,
});

const channelIcons = {
  sms: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  ai: Sparkles,
  voice: Phone,
};

function Dashboard() {
  const recent = messageLogs.slice(0, 6);

  return (
    <AppLayout>
      <Topbar title="Dashboard" subtitle="An overview of your communication activity" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Messages sent"
            value={overviewStats[0].value}
            delta={overviewStats[0].delta}
            icon={Activity}
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            label="Delivery rate"
            value={overviewStats[1].value}
            suffix="%"
            delta={overviewStats[1].delta}
            icon={CheckCircle2}
            accent="bg-success/10 text-success"
          />
          <StatCard
            label="Active flows"
            value={overviewStats[2].value}
            delta={overviewStats[2].delta}
            icon={Sparkles}
            accent="bg-channel-ai/10 text-channel-ai"
          />
          <StatCard
            label="Avg. latency"
            value={overviewStats[3].value}
            suffix="ms"
            delta={overviewStats[3].delta}
            icon={Clock}
            accent="bg-info/10 text-info"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-medium text-foreground">Message volume</div>
                <div className="text-xs text-muted-foreground">Last 14 days, by channel</div>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                {(["sms", "email", "whatsapp", "ai", "voice"] as const).map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", `bg-channel-${c}`)} />
                    {channelMeta[c].label}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {(["sms", "email", "whatsapp", "ai", "voice"] as const).map((c) => (
                      <linearGradient key={c} id={`g-${c}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={`var(--channel-${c})`} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={`var(--channel-${c})`} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  {(["sms", "email", "whatsapp", "ai", "voice"] as const).map((c) => (
                    <Area
                      key={c}
                      type="monotone"
                      dataKey={c}
                      stroke={`var(--channel-${c})`}
                      strokeWidth={2}
                      fill={`url(#g-${c})`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-medium text-foreground">Channel usage</div>
            <div className="text-xs text-muted-foreground mb-4">Sent vs delivered</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={usageByChannel}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="channel"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="sent" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="delivered" fill="var(--primary-glow)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <OmnichannelInsights />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="text-sm font-medium text-foreground">Recent activity</div>
                <div className="text-xs text-muted-foreground">
                  Latest messages across all channels
                </div>
              </div>
              <Link to="/messages" className="text-xs font-medium text-primary hover:underline">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recent.map((m) => {
                const Icon = channelIcons[m.channel];
                const meta = channelMeta[m.channel];
                const status = statusMeta[m.status];
                return (
                  <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center",
                        meta.bg,
                        meta.color,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {m.preview}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">to {m.recipient}</div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-md border",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                    <div className="text-xs text-muted-foreground w-20 text-right shrink-0">
                      {formatDistanceToNow(m.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-medium text-foreground mb-4">Delivery breakdown</div>
            <div className="space-y-3">
              {[
                { label: "Delivered", value: 14625, color: "bg-success", icon: CheckCircle2 },
                { label: "Pending", value: 120, color: "bg-warning", icon: Clock },
                { label: "Failed", value: 705, color: "bg-destructive", icon: XCircle },
              ].map((row) => {
                const total = 14625 + 120 + 705;
                const pct = (row.value / total) * 100;
                const Icon = row.icon;
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        {row.label}
                      </div>
                      <div className="text-muted-foreground">
                        {row.value.toLocaleString()} ({pct.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", row.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-lg bg-gradient-subtle border border-border p-4">
              <div className="text-xs font-medium text-foreground">Quick send</div>
              <p className="text-xs text-muted-foreground mt-1">
                Trigger a one-off message from any channel.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["sms", "email", "whatsapp", "ai", "voice"] as const).map((c) => {
                  const Icon = channelIcons[c];
                  return (
                    <button
                      key={c}
                      className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                    >
                      <Icon className={cn("h-3.5 w-3.5", channelMeta[c].color)} />
                      {channelMeta[c].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}

function OmnichannelInsights() {
  const top = omnichannelStats.bestChannelByDelivery;
  const topMeta = channelMeta[top.channel];
  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            Omnichannel
          </div>
          <div className="mt-0.5 text-sm font-medium text-foreground">
            Cross-channel performance
          </div>
        </div>
        <Link to="/messages" className="text-xs font-medium text-primary hover:underline">
          Open conversations →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <InsightTile
          icon={GitBranch}
          accent="bg-warning/15 text-warning-foreground"
          label="Fallback rate"
          value={`${omnichannelStats.fallbackRate}%`}
          hint={`+${omnichannelStats.fallbackTrend}% this week`}
        />
        <InsightTile
          icon={CheckCircle2}
          accent={cn(topMeta.bg, topMeta.color)}
          label="Best channel (delivery)"
          value={topMeta.label}
          hint={`${top.rate}% delivered`}
        />
        <InsightTile
          icon={TrendingUp}
          accent="bg-info/10 text-info"
          label="Engagement rate"
          value={`${omnichannelStats.engagementRate}%`}
          hint="Opens + replies / sent"
        />
        <InsightTile
          icon={Zap}
          accent="bg-channel-ai/10 text-channel-ai"
          label="Active omnichannel flows"
          value="14"
          hint="of 24 total flows"
        />
      </div>

      <div className="p-5 border-t border-border">
        <div className="text-xs font-medium text-foreground mb-3">Channel comparison</div>
        <div className="space-y-3">
          {omnichannelStats.channelComparison.map((c) => (
            <div
              key={c.channel}
              className="grid grid-cols-[80px_1fr_60px_60px] items-center gap-3 text-xs"
            >
              <div className="font-medium text-foreground">{c.channel}</div>
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${c.delivery}%` }}
                  />
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-info"
                    style={{ width: `${c.engagement}%` }}
                  />
                </div>
              </div>
              <div className="text-right text-success font-medium">{c.delivery}%</div>
              <div className="text-right text-info font-medium">{c.engagement}%</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-success" /> Delivery
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-info" /> Engagement
          </span>
        </div>
      </div>
    </Card>
  );
}

function InsightTile({
  icon: Icon,
  accent,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", accent)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
