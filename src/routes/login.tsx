import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Github, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in: Noxx" },
      { name: "description", content: "Sign in to your Noxx dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";

    setTimeout(() => {
      if (email !== "admin@noxxdesk.com") {
        setLoading(false);
        setError("Invalid credentials.");
        return;
      }

      login(email);
      // __root.tsx will auto-redirect, but we can do it here too just in case
      navigate({ to: "/dashboard" });
    }, 600);
  };

  return <AuthShell mode="login" loading={loading} error={error} onSubmit={onSubmit} />;
}

export function AuthShell({
  mode,
  loading,
  error,
  onSubmit,
}: {
  mode: "login" | "signup";
  loading: boolean;
  error?: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const isLogin = mode === "login";
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary/30">
      <div className="flex flex-col justify-between p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-border/60">
        <Link to="/" className="flex items-center gap-3 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-medium text-foreground tracking-tight">Noxx</span>
        </Link>

        <div className="max-w-md mx-auto w-full py-16">
          <h1 className="text-4xl font-medium tracking-tight text-foreground">
            {isLogin ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-4 text-base text-muted-foreground font-light">
            Sign in to your founding partner account.
          </p>

          <div className="mt-10" />

          {error && (
            <div className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-medium text-destructive flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive text-xs">
                !
              </span>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground">Full name</label>
                <input
                  required
                  className="mt-2 w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                  placeholder="Ada Lovelace"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Work email</label>
              <div className="mt-2 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-xl border border-border/80 bg-background pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot?
                  </a>
                )}
              </div>
              <input
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center gap-3 rounded-xl bg-foreground px-5 py-3.5 text-base font-medium text-background hover:opacity-90 transition shadow-elevated disabled:opacity-60"
            >
              {loading ? "Just a moment…" : isLogin ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground font-light">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <p className="text-xs text-muted-foreground font-light">
          By continuing, you agree to Noxx's Terms and Privacy Policy.
        </p>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-gradient-subtle">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 30%, color-mix(in oklab, var(--primary) 15%, transparent), transparent 70%)",
          }}
        />
        <div className="relative m-auto max-w-md p-10 w-full">
          <div className="rounded-[2.5rem] border border-border/60 glass-panel p-10 shadow-elevated">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">
              What you get
            </div>
            <ul className="mt-8 space-y-5 text-base text-foreground font-light">
              {[
                "24/7 AI Receptionist across all channels",
                "Custom workflows that follow your business rules",
                "Lead qualification and smart routing",
                "Seamless handoff to your human team",
              ].map((f) => (
                <li key={f} className="flex items-start gap-4">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-10 text-base text-muted-foreground text-center font-light italic">
            "Noxx captures 40% more leads than our previous contact form. It never sleeps."
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
