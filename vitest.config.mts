import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/*
  Tests unitarios de la lógica de lib/ (entorno Node, sin navegador).
  "server-only" se sustituye por un módulo vacío: fuera de Next.js lanzaría un error.
*/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
