import { Link, useRouterState } from "@tanstack/react-router";
import {
  Shield,
  Activity,
  Users,
  Server,
  DollarSign,
  Flag,
  ScrollText,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { to: "/admin", label: "Overview", icon: Activity, exact: true },
  { to: "/admin/users", label: "Users & Orgs", icon: Users },
  { to: "/admin/system", label: "System Health", icon: Server },
  { to: "/admin/billing", label: "Billing", icon: DollarSign },
  { to: "/admin/flags", label: "Feature Flags", icon: Flag },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

export function AdminLayout({
  children,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Admin sidebar — visually distinct from app sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15 border border-destructive/30">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sidebar-foreground">Admin</span>
            <span className="text-[11px] text-muted-foreground">Platform controls</span>
          </div>
        </div>

        <div className="px-3 pt-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md border border-sidebar-border bg-card px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition shadow-soft"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to app
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
          <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Super-admin
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const id = item.to.replace("/admin/", "").replace("/admin", "overview") || "overview";
            const active = onTabChange
              ? activeTab === id
              : item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
            return (
              <button
                key={item.to}
                onClick={() => onTabChange?.(id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <div className="text-xs font-medium text-foreground">Restricted area</div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Actions affect every tenant on the platform.
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
