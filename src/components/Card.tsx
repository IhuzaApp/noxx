import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function StatCard({
  label,
  value,
  delta,
  suffix,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  delta?: number;
  suffix?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        {Icon && (
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center",
              accent ?? "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <div className="text-2xl font-semibold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 font-medium",
              positive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </Card>
  );
}
