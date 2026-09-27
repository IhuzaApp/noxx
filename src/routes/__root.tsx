import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ProjectProvider } from "@/lib/project-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Noxx — Unified Communication API" },
      { name: "description", content: "Send SMS, Email, WhatsApp and AI messages and design automation flows from one unified API platform." },
      { name: "author", content: "Noxx" },
      { property: "og:title", content: "Noxx — Unified Communication API" },
      { property: "og:description", content: "Send SMS, Email, WhatsApp and AI messages and design automation flows from one unified API platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Noxx" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  );
}

function AuthRouter() {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const publicPaths = ['/', '/login', '/signup'];
    const isPublicPath = publicPaths.includes(routerState.location.pathname);

    if (!user && !isPublicPath) {
      navigate({ to: '/login', replace: true });
    } else if (user && (routerState.location.pathname === '/login' || routerState.location.pathname === '/signup')) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [routerState.location.pathname, navigate, user]);

  return (
    <ThemeProvider>
      <ProjectProvider>
        <Outlet />
      </ProjectProvider>
    </ThemeProvider>
  );
}
