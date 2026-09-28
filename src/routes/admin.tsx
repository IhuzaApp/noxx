import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Shield,
  Users,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
  ScrollText,
  Server,
  Search,
  MoreHorizontal,
  TrendingUp,
  Database,
  FolderKanban,
  Workflow,
  Building2,
  Globe,
  FlaskConical,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, StatCard } from "@/components/Card";
import { cn } from "@/lib/utils";
import {
  adminUsers,
  adminProjects,
  systemServices,
  featureFlags as initialFlags,
  auditEvents,
  platformStats,
  revenueTrend,
} from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Noxx" },
      { name: "description", content: "Platform admin dashboard for Noxx." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "users" | "projects" | "system" | "billing" | "flags" | "audit";

const tabs: Array<{ id: Tab; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users & Orgs", icon: Users },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "system", label: "System Health", icon: Server },
  { id: "billing", label: "Billing", icon: DollarSign },
  { id: "flags", label: "Feature Flags", icon: Flag },
  { id: "audit", label: "Audit Log", icon: ScrollText },
];

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [flags, setFlags] = useState(initialFlags);
  const [query, setQuery] = useState("");

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.company.toLowerCase().includes(query.toLowerCase()),
  );

  const currentLabel = tabs.find((t) => t.id === tab)?.label ?? "Overview";

  return (
    <AdminLayout activeTab={tab} onTabChange={(id) => setTab(id as Tab)}>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur px-6 shadow-sm">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-destructive/10 border border-destructive/20">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
            Admin · {currentLabel}
          </h1>
          <p className="text-xs text-muted-foreground truncate mt-0.5 ml-9">
            Platform-wide controls · restricted access
          </p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive shadow-soft">
          <AlertTriangle className="h-3 w-3" />
          Super-admin
        </span>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center justify-center shadow-soft">
          SA
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="px-6 py-6 w-full max-w-full">
          {tab === "overview" && <OverviewTab />}
          {tab === "users" && <UsersTab query={query} setQuery={setQuery} users={filteredUsers} />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "system" && <SystemTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "flags" && <FlagsTab flags={flags} setFlags={setFlags} />}
          {tab === "audit" && <AuditTab />}
        </div>
      </main>
    </AdminLayout>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={platformStats.totalUsers.toLocaleString()}
          icon={Users}
          delta={3.1}
        />
        <StatCard
          label="Active users (30d)"
          value={platformStats.activeUsers.toLocaleString()}
          icon={Activity}
          delta={2.4}
        />
        <StatCard
          label="Platform MRR"
          value={`$${platformStats.mrr.toLocaleString()}`}
          icon={DollarSign}
          delta={100}
        />
        <StatCard
          label="Error rate (24h)"
          value={`${platformStats.errorRate}%`}
          icon={AlertTriangle}
          delta={-0.2}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue (MRR)</h3>
              <p className="text-xs text-muted-foreground">
                Monthly recurring revenue across all plans
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-channel-ai">
              <TrendingUp className="h-3.5 w-3.5" /> +64% YoY
            </span>
          </div>
          <div className="h-[260px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: "var(--shadow-elevated)",
                  }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, "MRR"]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--primary)"
                  fill="url(#mrrGrad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today's volume</h3>
          <div className="space-y-3">
            <VolumeRow
              label="Messages sent"
              value={platformStats.messagesToday.toLocaleString()}
              icon={Activity}
            />
            <VolumeRow
              label="API calls"
              value={platformStats.apiCallsToday.toLocaleString()}
              icon={Server}
            />
            <VolumeRow
              label="Organizations"
              value={platformStats.totalOrgs.toLocaleString()}
              icon={Shield}
            />
            <VolumeRow
              label="Storage used"
              value={`${platformStats.storageGb} GB`}
              icon={Database}
            />
          </div>
        </Card>
      </div>

      <Card className="p-5 border-border/60 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Service status</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live health across the platform</p>
          </div>
          <span className="text-xs text-muted-foreground">Last check: 30s ago</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {systemServices.slice(0, 8).map((s) => (
            <ServicePill key={s.id} service={s} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function VolumeRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border last:border-0 last:pb-0">
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
        <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
          <Icon className="h-3.5 w-3.5" />
        </div>
        {label}
      </div>
      <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

function ServicePill({ service }: { service: (typeof systemServices)[number] }) {
  const dotColor =
    service.status === "operational"
      ? "bg-success"
      : service.status === "degraded"
        ? "bg-warning"
        : "bg-destructive";
  const statusColor =
    service.status === "operational"
      ? "text-success"
      : service.status === "degraded"
        ? "text-warning"
        : "text-destructive";
  const StatusIcon =
    service.status === "operational"
      ? CheckCircle2
      : service.status === "degraded"
        ? AlertTriangle
        : XCircle;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/30 hover:shadow-soft transition">
      <div className="min-w-0 flex items-center gap-2.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full shrink-0",
            dotColor,
            service.status !== "down" && "animate-pulse",
          )}
        />
        <div className="min-w-0">
          <div className="text-xs font-medium text-foreground truncate">{service.name}</div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {service.uptime}% · {service.latency}ms
          </div>
        </div>
      </div>
      <StatusIcon className={cn("h-4 w-4 shrink-0", statusColor)} />
    </div>
  );
}

function UsersTab({
  query,
  setQuery,
  users,
}: {
  query: string;
  setQuery: (s: string) => void;
  users: typeof adminUsers;
}) {
  const planColor: Record<string, string> = {
    free: "bg-muted text-muted-foreground border-border",
    starter: "bg-primary/10 text-primary border-primary/20",
    growth: "bg-channel-whatsapp/10 text-channel-whatsapp border-channel-whatsapp/20",
    enterprise: "bg-channel-ai/10 text-channel-ai border-channel-ai/20",
  };
  const statusDot: Record<string, string> = {
    active: "bg-success",
    suspended: "bg-destructive",
    invited: "bg-warning",
  };
  const statusText: Record<string, string> = {
    active: "text-success",
    suspended: "text-destructive",
    invited: "text-warning",
  };

  // Group users by company
  const companyMap = new Map<string, typeof adminUsers>();
  users.forEach((u) => {
    const list = companyMap.get(u.company) ?? [];
    list.push(u);
    companyMap.set(u.company, list);
  });
  const companies = Array.from(companyMap.entries()).map(([name, members]) => ({
    name,
    members,
    plan: members.find((m) => m.role === "owner")?.plan ?? members[0].plan,
    mrr: members.reduce((s, m) => s + m.mrr, 0),
    joinedAt: members[0].joinedAt,
    status: members.some((m) => m.status === "active")
      ? ("active" as const)
      : members.some((m) => m.status === "invited")
        ? ("invited" as const)
        : ("suspended" as const),
    projectCount: adminProjects.filter((p) => p.company === name).length,
    flowCount: adminProjects
      .filter((p) => p.company === name)
      .reduce((s, p) => s + p.flowsCount, 0),
  }));

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Organizations"
          value={companies.length.toString()}
          icon={Building2}
          delta={0}
        />
        <StatCard label="Total users" value={users.length.toString()} icon={Users} delta={0} />
        <StatCard
          label="Paying orgs"
          value={companies.filter((c) => c.mrr > 0).length.toString()}
          icon={DollarSign}
          delta={0}
        />
        <StatCard
          label="Combined MRR"
          value={`$${companies.reduce((s, c) => s + c.mrr, 0).toLocaleString()}`}
          icon={TrendingUp}
          delta={0}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap p-5 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">All organizations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {companies.length} compan{companies.length === 1 ? "y" : "ies"} · {users.length} users
              total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies…"
                className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-input bg-background w-56 focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 shadow-soft transition">
              Invite org
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold py-2.5 px-5">Company</th>
                <th className="text-center font-semibold py-2.5 px-3">Members</th>
                <th className="text-center font-semibold py-2.5 px-3">Projects</th>
                <th className="text-center font-semibold py-2.5 px-3">Flows</th>
                <th className="text-left font-semibold py-2.5 px-3">Plan</th>
                <th className="text-left font-semibold py-2.5 px-3">Status</th>
                <th className="text-right font-semibold py-2.5 px-3">MRR</th>
                <th className="text-left font-semibold py-2.5 px-3">Joined</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {companies.map((c) => (
                <tr key={c.name} className="hover:bg-accent/30 transition-colors group">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground text-[11px] font-bold shadow-soft shrink-0">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-xs">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {c.members.find((m) => m.role === "owner")?.email ?? c.members[0].email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {c.members.length}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                      <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                      {c.projectCount}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
                      {c.flowCount}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize",
                        planColor[c.plan],
                      )}
                    >
                      {c.plan}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-medium capitalize",
                        statusText[c.status],
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[c.status])} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs tabular-nums text-foreground text-right font-medium">
                    ${c.mrr.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                    {c.joinedAt}
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-muted-foreground hover:text-foreground rounded p-1 hover:bg-muted transition">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Members breakdown below the table */}
        <div className="border-t border-border">
          {companies.map((c) => (
            <details key={c.name} className="group/details border-b border-border last:border-0">
              <summary className="flex items-center gap-2.5 px-5 py-3 cursor-pointer hover:bg-accent/20 transition-colors text-xs font-medium text-foreground select-none">
                <span className="text-[10px] text-muted-foreground group-open/details:rotate-90 transition-transform">
                  ▶
                </span>
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {c.name}
                <span className="text-muted-foreground font-normal">
                  · {c.members.length} member{c.members.length !== 1 ? "s" : ""}
                </span>
              </summary>
              <div className="px-5 pb-3 pl-12">
                <div className="space-y-2">
                  {c.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 py-1.5">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-foreground shrink-0">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-foreground">{m.name}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">{m.email}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground capitalize">{m.role}</span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-medium capitalize",
                          statusText[m.status],
                        )}
                      >
                        <span className={cn("h-1 w-1 rounded-full", statusDot[m.status])} />
                        {m.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{m.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SystemTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {systemServices.map((s) => {
          const dot =
            s.status === "operational"
              ? "bg-success"
              : s.status === "degraded"
                ? "bg-warning"
                : "bg-destructive";
          const tone =
            s.status === "operational"
              ? "text-success"
              : s.status === "degraded"
                ? "text-warning"
                : "text-destructive";
          return (
            <Card key={s.id} className="p-5 hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0",
                      dot,
                      s.status !== "down" && "animate-pulse",
                    )}
                  />
                  <div className="font-semibold text-foreground text-sm truncate">{s.name}</div>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium capitalize px-2 py-0.5 rounded-md border",
                    tone,
                    "border-current/20 bg-current/5",
                  )}
                >
                  {s.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-border">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Uptime 30d
                  </div>
                  <div className="text-base font-semibold text-foreground tabular-nums mt-0.5">
                    {s.uptime}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    p95 Latency
                  </div>
                  <div className="text-base font-semibold text-foreground tabular-nums mt-0.5">
                    {s.latency}ms
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Region
                  </div>
                  <div className="text-base font-semibold text-foreground mt-0.5">global</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BillingTab() {
  const plans = [
    { name: "Free", users: 12, mrr: 0, color: "bg-muted-foreground/40" },
    { name: "Starter", users: 2, mrr: 198, color: "bg-primary" },
    { name: "Growth", users: 0, mrr: 0, color: "bg-channel-whatsapp" },
    { name: "Enterprise", users: 0, mrr: 0, color: "bg-channel-ai" },
  ];
  const total = plans.reduce((a, p) => a + p.mrr, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="MRR" value={`$${total.toLocaleString()}`} icon={DollarSign} delta={100} />
        <StatCard
          label="ARR (est.)"
          value={`$${(total * 12).toLocaleString()}`}
          icon={TrendingUp}
          delta={100}
        />
        <StatCard
          label="Paying accounts"
          value={(plans[1].users + plans[2].users + plans[3].users).toLocaleString()}
          icon={Users}
          delta={100}
        />
        <StatCard label="Churn (30d)" value="0%" icon={AlertTriangle} delta={0} />
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Revenue by plan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribution across {plans.length} tiers
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Total{" "}
            <span className="font-semibold text-foreground tabular-nums">
              ${total.toLocaleString()}
            </span>
            /mo
          </div>
        </div>
        <div className="space-y-4">
          {plans.map((p) => {
            const pct = total === 0 ? 0 : (p.mrr / total) * 100;
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span className={cn("h-2 w-2 rounded-full", p.color)} />
                    {p.name}
                    <span className="text-muted-foreground font-normal">
                      · {p.users.toLocaleString()} users
                    </span>
                  </span>
                  <span className="text-foreground font-semibold tabular-nums">
                    ${p.mrr.toLocaleString()}
                    <span className="text-muted-foreground font-normal"> · {pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", p.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function FlagsTab({
  flags,
  setFlags,
}: {
  flags: typeof initialFlags;
  setFlags: (f: typeof initialFlags) => void;
}) {
  const typeColor: Record<string, string> = {
    release: "bg-success/10 text-success border-success/20",
    experiment: "bg-channel-whatsapp/10 text-channel-whatsapp border-channel-whatsapp/20",
    "kill-switch": "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Feature flags</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gradually roll out features to a percentage of users
          </p>
        </div>
        <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 shadow-soft transition">
          New flag
        </button>
      </div>
      <div className="divide-y divide-border">
        {flags.map((f) => (
          <div
            key={f.id}
            className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-accent/20 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <code className="text-xs font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {f.key}
                </code>
                <span
                  className={cn(
                    "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                    typeColor[f.type],
                  )}
                >
                  {f.type}
                </span>
                {f.enabled ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-success/20 bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    OFF
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">{f.description}</div>
              <div className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1.5">
                Updated {f.lastUpdated} by{" "}
                <span className="font-medium text-foreground">{f.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-64 mt-3 md:mt-0">
              <input
                type="range"
                min={0}
                max={100}
                value={f.rollout}
                onChange={(e) =>
                  setFlags(
                    flags.map((x) =>
                      x.id === f.id ? { ...x, rollout: Number(e.target.value) } : x,
                    ),
                  )
                }
                className="flex-1 accent-primary disabled:opacity-40"
                disabled={!f.enabled}
              />
              <span className="text-xs tabular-nums font-semibold text-foreground w-10 text-right">
                {f.rollout}%
              </span>
            </div>
            <button
              onClick={() =>
                setFlags(flags.map((x) => (x.id === f.id ? { ...x, enabled: !x.enabled } : x)))
              }
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors shrink-0",
                f.enabled ? "bg-primary" : "bg-muted border border-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                  f.enabled ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AuditTab() {
  const sevColor: Record<string, string> = {
    info: "bg-muted text-muted-foreground border-border",
    warning: "bg-warning/10 text-warning border-warning/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Audit log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every security-relevant action across the platform
          </p>
        </div>
        <button className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition shadow-soft">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-semibold py-2.5 px-5">When</th>
              <th className="text-left font-semibold py-2.5 px-3">Actor</th>
              <th className="text-left font-semibold py-2.5 px-3">Action</th>
              <th className="text-left font-semibold py-2.5 px-3">Target</th>
              <th className="text-left font-semibold py-2.5 px-3">IP</th>
              <th className="text-left font-semibold py-2.5 px-3">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditEvents.map((e) => (
              <tr key={e.id} className="hover:bg-accent/30 transition-colors">
                <td className="py-3 px-5 text-xs text-muted-foreground whitespace-nowrap">
                  {e.at}
                </td>
                <td className="py-3 px-3 text-xs font-medium text-foreground">{e.actor}</td>
                <td className="py-3 px-3 text-xs">
                  <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {e.action}
                  </code>
                </td>
                <td className="py-3 px-3 text-xs text-muted-foreground">{e.target}</td>
                <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {e.ip}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize",
                      sevColor[e.severity],
                    )}
                  >
                    {e.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ProjectsTab() {
  const [query, setQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<(typeof adminProjects)[number] | null>(
    null,
  );

  const filtered = adminProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.company.toLowerCase().includes(query.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(query.toLowerCase()),
  );

  const envColor = {
    production: "bg-success/10 text-success border-success/20",
    sandbox: "bg-channel-whatsapp/10 text-channel-whatsapp border-channel-whatsapp/20",
    staging: "bg-warning/10 text-warning-foreground border-warning/20",
  };

  const statusDot = {
    active: "bg-success",
    archived: "bg-muted-foreground",
  };

  const statusText = {
    active: "text-success",
    archived: "text-muted-foreground",
  };

  // Mock flows per project
  const projectFlows: Record<
    string,
    Array<{
      name: string;
      status: "active" | "draft" | "paused";
      triggers: string;
      lastRun: string;
    }>
  > = {
    // Officeats — Customer Support (p_support) — 8 flows
    p_support: [
      {
        name: "AI Triage & Route",
        status: "active",
        triggers: "message.received",
        lastRun: "2m ago",
      },
      {
        name: "Ticket Auto-Assign",
        status: "active",
        triggers: "ticket.created",
        lastRun: "5m ago",
      },
      {
        name: "SLA Breach Alert",
        status: "active",
        triggers: "ticket.sla_warning",
        lastRun: "1h ago",
      },
      {
        name: "Support Escalation to Human",
        status: "active",
        triggers: "ai.low_confidence",
        lastRun: "15m ago",
      },
      { name: "CSAT Survey", status: "active", triggers: "ticket.closed", lastRun: "2h ago" },
      {
        name: "Off-Hours Auto-Reply",
        status: "active",
        triggers: "message.received.off_hours",
        lastRun: "9h ago",
      },
      {
        name: "Repeat Customer VIP Flow",
        status: "paused",
        triggers: "customer.flagged_vip",
        lastRun: "3d ago",
      },
      { name: "Refund Request Handler", status: "draft", triggers: "—", lastRun: "—" },
    ],
    // Officeats — Order Lifecycle (p_orders) — 12 flows
    p_orders: [
      {
        name: "Order Confirmed (WhatsApp)",
        status: "active",
        triggers: "order.confirmed",
        lastRun: "2m ago",
      },
      {
        name: "Order Confirmed (Email)",
        status: "active",
        triggers: "order.confirmed",
        lastRun: "2m ago",
      },
      {
        name: "Rider Assigned Notification",
        status: "active",
        triggers: "order.rider_assigned",
        lastRun: "4m ago",
      },
      { name: "ETA Update", status: "active", triggers: "order.eta_updated", lastRun: "8m ago" },
      {
        name: "Out for Delivery Alert",
        status: "active",
        triggers: "order.out_for_delivery",
        lastRun: "12m ago",
      },
      {
        name: "Order Delivered",
        status: "active",
        triggers: "order.delivered",
        lastRun: "15m ago",
      },
      {
        name: "Post-Delivery Review Request",
        status: "active",
        triggers: "order.delivered +30min",
        lastRun: "45m ago",
      },
      {
        name: "Order Delay Apology",
        status: "active",
        triggers: "order.delayed",
        lastRun: "1h ago",
      },
      {
        name: "Cancelled Order Refund",
        status: "active",
        triggers: "order.cancelled",
        lastRun: "3h ago",
      },
      { name: "Re-order Reminder", status: "active", triggers: "cron.weekly", lastRun: "6h ago" },
      {
        name: "Failed Payment Retry",
        status: "paused",
        triggers: "payment.failed",
        lastRun: "2d ago",
      },
      { name: "Loyalty Points Update", status: "draft", triggers: "—", lastRun: "—" },
    ],
    // Officeats — Onboarding Bot (p_onboarding) — 4 flows
    p_onboarding: [
      {
        name: "New User Welcome Message",
        status: "active",
        triggers: "user.signup",
        lastRun: "3h ago",
      },
      {
        name: "First Order Nudge",
        status: "active",
        triggers: "user.signup +24h",
        lastRun: "1d ago",
      },
      {
        name: "App Tutorial Sequence",
        status: "active",
        triggers: "user.signup",
        lastRun: "3h ago",
      },
      { name: "Inactive User Win-Back", status: "draft", triggers: "—", lastRun: "—" },
    ],
    // Candi Digital — Client CRM Notifications (p_candi_crm) — 2 flows
    p_candi_crm: [
      {
        name: "Project Status Update to Client",
        status: "active",
        triggers: "crm.project_status_changed",
        lastRun: "just now",
      },
      {
        name: "Invoice Sent Notification",
        status: "active",
        triggers: "billing.invoice_created",
        lastRun: "2h ago",
      },
    ],
    // KD Design — Sandbox (p_kd_test) — 0 flows
    p_kd_test: [],
  };

  const flowStatusColor = {
    active: "text-success bg-success/10 border-success/20",
    paused: "text-warning bg-warning/10 border-warning/20",
    draft: "text-muted-foreground bg-muted border-border",
  };

  if (selectedProject) {
    const flows = projectFlows[selectedProject.id] ?? [];
    return (
      <div className="space-y-5">
        {/* Back + header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedProject(null)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition rounded-md border border-border bg-card px-2.5 py-1.5 shadow-soft"
          >
            ← Back to projects
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Project details card */}
          <Card className="p-5 lg:col-span-1 h-fit">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-soft shrink-0">
                {selectedProject.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground text-sm leading-tight">
                  {selectedProject.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Project ID: {selectedProject.id}
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-3 border-t border-border">
              <InfoRow icon={Building2} label="Company" value={selectedProject.company} />
              <InfoRow icon={Users} label="Owner" value={selectedProject.ownerName} />
              <InfoRow
                icon={Workflow}
                label="Flows"
                value={`${selectedProject.flowsCount} flows`}
              />
              <InfoRow
                icon={Globe}
                label="Environment"
                value={
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                      envColor[selectedProject.environment],
                    )}
                  >
                    {selectedProject.environment}
                  </span>
                }
              />
              <InfoRow
                icon={Activity}
                label="Status"
                value={
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium capitalize",
                      statusText[selectedProject.status],
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", statusDot[selectedProject.status])}
                    />
                    {selectedProject.status}
                  </span>
                }
              />
              <InfoRow icon={FolderKanban} label="Created" value={selectedProject.createdAt} />
            </div>
            <div className="mt-4 pt-4 border-t border-border flex gap-2">
              <button className="flex-1 rounded-md border border-destructive/30 bg-destructive/5 text-destructive text-xs font-medium px-3 py-1.5 hover:bg-destructive/10 transition">
                Archive project
              </button>
            </div>
          </Card>

          {/* Flows list */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Flows</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {flows.length === 0
                    ? "No flows yet in this project"
                    : `${flows.length} flow${flows.length !== 1 ? "s" : ""} in this project`}
                </p>
              </div>
            </div>
            {flows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <Workflow className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No flows yet</p>
                <p className="text-xs text-muted-foreground">
                  This project hasn't created any flows.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-semibold py-2.5 px-5">Flow name</th>
                      <th className="text-left font-semibold py-2.5 px-3">Status</th>
                      <th className="text-left font-semibold py-2.5 px-3">Trigger</th>
                      <th className="text-left font-semibold py-2.5 px-3">Last run</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {flows.map((f, i) => (
                      <tr key={i} className="hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <span className="text-xs font-medium text-foreground">{f.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                              flowStatusColor[f.status],
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                f.status === "active"
                                  ? "bg-success animate-pulse"
                                  : f.status === "paused"
                                    ? "bg-warning"
                                    : "bg-muted-foreground",
                              )}
                            />
                            {f.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <code className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {f.triggers}
                          </code>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                          {f.lastRun}
                        </td>
                        <td className="py-3 px-3">
                          <button className="text-muted-foreground hover:text-foreground rounded p-1 hover:bg-muted transition">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total projects"
          value={adminProjects.length.toString()}
          icon={FolderKanban}
          delta={0}
        />
        <StatCard
          label="Active"
          value={adminProjects.filter((p) => p.status === "active").length.toString()}
          icon={Activity}
          delta={0}
        />
        <StatCard
          label="Total flows"
          value={adminProjects.reduce((s, p) => s + p.flowsCount, 0).toString()}
          icon={Workflow}
          delta={0}
        />
        <StatCard
          label="Organizations"
          value={[...new Set(adminProjects.map((p) => p.company))].length.toString()}
          icon={Building2}
          delta={0}
        />
      </div>

      {/* Project list */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap p-5 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">All projects</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""} across all organizations
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company or owner…"
              className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-input bg-background w-72 focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold py-2.5 px-5">Project</th>
                <th className="text-left font-semibold py-2.5 px-3">Company</th>
                <th className="text-left font-semibold py-2.5 px-3">Owner</th>
                <th className="text-left font-semibold py-2.5 px-3">Env</th>
                <th className="text-center font-semibold py-2.5 px-3">Flows</th>
                <th className="text-left font-semibold py-2.5 px-3">Status</th>
                <th className="text-left font-semibold py-2.5 px-3">Created</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-accent/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedProject(p)}
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shadow-soft shrink-0">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {p.company}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-foreground shrink-0">
                        {p.ownerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-xs text-foreground">{p.ownerName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                        envColor[p.environment],
                      )}
                    >
                      {p.environment === "production" ? "Prod" : "Sandbox"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.flowsCount}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-medium capitalize",
                        statusText[p.status],
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[p.status])} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                    {p.createdAt}
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-muted-foreground hover:text-foreground rounded p-1 hover:bg-muted transition">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="text-xs font-medium text-foreground text-right">{value}</div>
    </div>
  );
}
