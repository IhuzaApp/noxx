import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Workflow,
  MessageSquare,
  KeyRound,
  FileText,
  Settings,
  Sparkles,
  FolderKanban,
  TerminalSquare,
  Lock,
  ChevronsUpDown,
  Check,
  Ticket,
  Plug,
  Megaphone,
  CreditCard,
  PhoneCall,
  Code2,
  Zap,
  Globe,
  LayoutTemplate,
  Shield,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/project-context";

const nav: Array<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  section?: string;
}> = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/flows", label: "Flows", icon: Workflow, section: "Build" },
  { to: "/my-flows", label: "My Flows", icon: Workflow },
  { to: "/automations", label: "Automations", icon: Zap },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/contacts", label: "Contacts", icon: FolderKanban },
  { to: "/surveys", label: "Surveys", icon: FileText },
  { to: "/sites", label: "Sites", icon: LayoutTemplate },
  { to: "/playground", label: "API Playground", icon: TerminalSquare },
  { to: "/tickets", label: "Support Tickets", icon: Ticket, section: "Engage" },
  { to: "/voice", label: "Voice Support", icon: PhoneCall },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/ai-receptionist", label: "Emails", icon: Mail },

  { to: "/integrations", label: "Integrations", icon: Plug, section: "Configure" },
  { to: "/api-keys", label: "API Keys", icon: KeyRound },
  { to: "/dev-api", label: "Developer API", icon: Code2 },
  { to: "/env", label: "Env Variables", icon: Lock },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { current, all, setCurrentId } = useProject();
  const [open, setOpen] = useState(false);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sidebar-foreground">Noxx</span>
            <span className="text-[11px] text-muted-foreground">Unified Comms API</span>
          </div>
        </Link>
      </div>

      {/* Project switcher */}
      <div className="relative px-3 pt-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-2 rounded-md border border-sidebar-border bg-card px-2.5 py-2 text-left hover:bg-accent/40 transition shadow-soft"
        >
          <div
            className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
              current.color,
            )}
          >
            <current.icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Project
            </div>
            <div className="text-xs font-semibold text-foreground truncate">{current.name}</div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {open && (
          <div className="absolute left-3 right-3 top-full mt-1.5 z-20 rounded-md border border-border bg-popover p-1 shadow-elevated">
            {all.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setCurrentId(p.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent/50 transition"
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded flex items-center justify-center shrink-0",
                    p.color,
                  )}
                >
                  <p.icon className="h-3 w-3" />
                </div>
                <span className="flex-1 text-xs font-medium text-foreground truncate">
                  {p.name}
                </span>
                {p.id === current.id && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
            <Link
              to="/projects"
              onClick={() => setOpen(false)}
              className="block mt-1 border-t border-border pt-1.5 px-2 py-1.5 text-xs font-medium text-primary hover:bg-accent/50 rounded transition"
            >
              Manage all projects →
            </Link>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <div key={item.to}>
              {item.section && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.section}
                </div>
              )}
              <Link
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-channel-ai animate-pulse" />
          <div className="text-xs font-medium text-foreground">Sandbox active</div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Test key — no real messages or charges
        </div>
        <button className="mt-3 w-full rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition">
          Switch to live
        </button>
      </div>
    </aside>
  );
}
