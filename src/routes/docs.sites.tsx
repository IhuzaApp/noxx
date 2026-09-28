import { createFileRoute } from "@tanstack/react-router";
import { LayoutTemplate } from "lucide-react";
import { DocPage, Step, Callout } from "@/components/docs/DocPage";

export const Route = createFileRoute("/docs/sites")({
  head: () => ({
    meta: [
      { title: "Sites — Noxx docs" },
      {
        name: "description",
        content: "Build a simple branded website — shop, services, support portal — and share it.",
      },
    ],
  }),
  component: () => (
    <DocPage
      slug="sites"
      icon={LayoutTemplate}
      title="Sites"
      intro="Spin up a simple website without leaving Noxx. Pick a template (shop, services, support portal, blank), drag in blocks, and share the link. Connect a custom domain when you're ready."
      cta={{ label: "Open Sites", to: "/sites" }}
    >
      <Step n={1} title="Pick a template">
        <p>
          Click <strong>New site</strong>. Choose Online shop, Agency / services, Support portal, or
          Blank canvas. Templates are starting points — every block is editable.
        </p>
      </Step>
      <Step n={2} title="Build with blocks">
        <p>
          Add and reorder blocks: Hero, About, Products, Services, Contact, Ticket form, Call to
          action. Each block has inline fields — no code needed.
        </p>
        <Callout>
          Tip: pick a brand color in the editor sidebar. Buttons, gradients and accents update
          everywhere instantly.
        </Callout>
      </Step>
      <Step n={3} title="Publish & share">
        <p>
          Toggle <strong>Published</strong> and copy the public URL <code>/site/your-slug</code>.
          Share it anywhere.
        </p>
      </Step>
      <Step n={4} title="Use your own domain">
        <p>
          Point an A record from your domain to our edge. Buy a domain in <strong>Domains</strong>{" "}
          or connect one you already own — we handle SSL.
        </p>
      </Step>
      <Step n={5} title="Submissions feed back into Noxx">
        <p>
          Contact and ticket form submissions are captured and surface in your dashboard so you can
          reply through any channel.
        </p>
      </Step>
    </DocPage>
  ),
});
