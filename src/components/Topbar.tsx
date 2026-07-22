import { Search, Bell, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Topbar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
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
      <div className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-soft">
        AM
      </div>
    </header>
  );
}
