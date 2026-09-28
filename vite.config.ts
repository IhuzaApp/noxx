import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  envPrefix: ["VITE_", "API_", "HASURA_", "GROQ_", "RESEND_", "FIREBASE_"],
  plugins: [
    tanstackStart(),
    nitro(),
    viteReact(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
