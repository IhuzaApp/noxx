import { Search, Bell, Plus, Shield, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function Topbar({ title, subtitle, action }: { title: React.ReactNode; subtitle?: string; action?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur px-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="hidden md:flex items-center gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-sm text-muted-foreground w-72 shadow-soft">
        <Search className="h-4 w-4" />
        <input
          placeholder="Search messages, flows, keys…"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <kbd className="text-[10px] rounded bg-muted px-1.5 py-0.5">⌘K</kbd>
      </div>
      <ThemeToggle />
      <button className="relative rounded-md border border-input bg-card p-2 text-foreground hover:bg-muted transition shadow-soft">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
      </button>
      {action ?? (
        <button className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition shadow-soft">
          <Plus className="h-4 w-4" />
          New message
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-soft hover:opacity-90 transition-opacity outline-none">
            {user?.name?.split(" ").map(n => n[0]).join("") || "AM"}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground">{user?.name || "Admin User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || "admin@noxxdesk.com"}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Admin Portal
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
