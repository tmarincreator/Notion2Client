import { describe, expect, it } from "vitest";
import { contraste, textoSobre } from "@/lib/color";
import { problemasDeEntorno } from "@/lib/env";
import { formatearFecha, haceTiempo, inicialesDe } from "@/lib/formato";
import { estadoAsistente } from "@/lib/portales/asistente";
import { REQUISITOS_PUBLICAR, pendientesDe } from "@/lib/portales/tipos";

describe("formato", () => {
  it("muestra el día de las fechas de Notion sin moverlo de zona", () => {
    expect(formatearFecha("2025-10-22")).toBe("22 oct");
    expect(formatearFecha("2025-10-22T23:30:00.000+02:00")).toBe("22 oct");
    expect(formatearFecha("2025-10-22T00:15:00.000-05:00")).toBe("22 oct");
  });

  it("dice hace cuánto se editó algo", () => {
    const ahora = Date.parse("2025-10-19T12:00:00Z");
    expect(haceTiempo("2025-10-19T11:59:40Z", ahora)).toBe("hace un momento");
    expect(haceTiempo("2025-10-19T11:55:00Z", ahora)).toBe("hace 5 min");
    expect(haceTiempo("2025-10-19T09:00:00Z", ahora)).toBe("hace 3 h");
    expect(haceTiempo("2025-10-18T11:00:00Z", ahora)).toBe("hace 1 día");
    // 23:30 UTC ya es el día 2 en España.
    expect(haceTiempo("2025-10-01T23:30:00Z", ahora)).toBe("el 2 oct 2025");
  });

  it("saca las iniciales", () => {
    expect(inicialesDe("Estudio Norte Diseño")).toBe("EN");
    expect(inicialesDe("   ")).toBe("A");
  });
});

describe("contraste del color de marca", () => {
  it.each(["#c2410c", "#0f766e", "#1d4ed8", "#111827", "#ffff00", "#fde68a", "#22c55e", "#ffffff"])(
    "elige el texto que más contrasta sobre %s",
    (color) => {
      const elegido = textoSobre(color);
      const otro = elegido === "#ffffff" ? "#11161b" : "#ffffff";
      expect(contraste(color, elegido)).toBeGreaterThanOrEqual(contraste(color, otro));
    },
  );

  it("usa texto oscuro sobre colores claros", () => {
    expect(textoSobre("#ffff00")).toBe("#11161b");
    expect(textoSobre("#c2410c")).toBe("#ffffff");
  });
});

describe("asistente de portales", () => {
  const vacio = { fuente_notion_id: null, propiedades_visibles: [] };
  const listo = { fuente_notion_id: "base", propiedades_visibles: ["p1"] };

  it("lista lo que falta para publicar", () => {
    expect(pendientesDe(vacio, false)).toEqual([...REQUISITOS_PUBLICAR]);
    expect(pendientesDe(listo, true)).toEqual([]);
  });

  it("abre el primer paso pendiente si no se pide uno válido", () => {
    expect(estadoAsistente(vacio, false, undefined).paso).toBe(2);
    expect(estadoAsistente({ ...listo, propiedades_visibles: [] }, false, "abc").paso).toBe(3);
    expect(estadoAsistente(listo, false, "9").paso).toBe(5);
    expect(estadoAsistente(listo, true, "2.5").paso).toBe(5);
  });

  it("respeta el paso pedido", () => {
    expect(estadoAsistente(vacio, false, "1").paso).toBe(1);
    expect(estadoAsistente(listo, true, "4")).toMatchObject({ paso: 4, completos: [1, 2, 3, 4, 5] });
  });
});

describe("variables de entorno", () => {
  const completas = {
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
    SUPABASE_SECRET_KEY: "sb_secret_x",
    PORTAL_SECRET: "p".repeat(32),
    NOTION_TOKEN_KEY: Buffer.alloc(32, 1).toString("base64"),
    NEXT_PUBLIC_SITE_URL: "https://notion2client.com",
  };

  it("no se queja si están todas", () => {
    expect(problemasDeEntorno({ ...completas, NODE_ENV: "production" })).toEqual([]);
  });

  it("detecta las que faltan o están mal", () => {
    const problemas = problemasDeEntorno({ ...completas, PORTAL_SECRET: "corto", NOTION_TOKEN_KEY: undefined, NODE_ENV: "production" });
    expect(problemas.map((p) => p.split(" ")[0])).toEqual(["PORTAL_SECRET", "NOTION_TOKEN_KEY"]);
  });

  it("NEXT_PUBLIC_SITE_URL solo es obligatoria en producción", () => {
    const sinUrl = { ...completas, NEXT_PUBLIC_SITE_URL: undefined };
    expect(problemasDeEntorno({ ...sinUrl, NODE_ENV: "development" })).toEqual([]);
    expect(problemasDeEntorno({ ...sinUrl, NODE_ENV: "production" })).toHaveLength(1);
  });
});
