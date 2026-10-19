import { describe, expect, it } from "vitest";
import type { BaseDetalle, Registro } from "@/lib/notion/bases";
import type { PropiedadLeida, ValorLeido } from "@/lib/notion/propiedades";
import { construirEntregables, elegirPapeles } from "@/lib/portales/contenido";

const prop = (id: string, nombre: string, tipoNotion: string, tipo: PropiedadLeida["tipo"] = "Texto"): PropiedadLeida => ({
  id,
  nombre,
  tipoNotion,
  tipo,
  sensible: false,
});

const base: BaseDetalle = {
  id: "base",
  nombre: "Proyectos",
  url: "https://notion.so/base",
  editada: "2025-10-01T00:00:00.000Z",
  propiedades: [
    prop("tit", "Nombre", "title", "Título"),
    prop("est", "Estado", "status", "Estado"),
    prop("fec", "Fecha de entrega", "date", "Fecha"),
    prop("fase", "Fase", "select", "Selección"),
    prop("url", "Prototipo", "url"),
    prop("coste", "Coste interno", "number", "Número"),
    prop("rollup", "Resumen", "rollup", null),
  ],
};

const registro = (id: string, valores: Record<string, ValorLeido>): Registro => ({
  id,
  editado: "2025-10-10T10:00:00.000Z",
  valores,
});

const filas = [
  registro("b", {
    tit: { tipo: "texto", valor: "Diseño de la home" },
    est: { tipo: "texto", valor: "En revisión" },
    fec: { tipo: "fecha", inicio: "2025-10-18", fin: null },
    fase: { tipo: "texto", valor: "Diseño web" },
    url: { tipo: "texto", valor: "https://figma.com/x" },
    coste: { tipo: "numero", valor: 1200 },
  }),
  registro("a", {
    tit: { tipo: "texto", valor: "Manual de marca" },
    est: { tipo: "texto", valor: "Entregado" },
    fec: { tipo: "fecha", inicio: "2025-09-30T23:30:00.000+02:00", fin: null },
    url: { tipo: "texto", valor: "javascript:alert(1)" },
  }),
  registro("c", { tit: { tipo: "texto", valor: "Sin fecha" } }),
];

describe("qué ve el cliente", () => {
  it("nunca incluye propiedades que no estén marcadas como visibles", () => {
    const { entregables } = construirEntregables(base, filas, ["est", "fec", "fase"]);
    const texto = JSON.stringify(entregables);
    expect(texto).not.toContain("1200");
    expect(texto).not.toContain("Coste interno");
    expect(texto).not.toContain("figma");
  });

  it("el título siempre se muestra aunque no esté en la lista de visibles", () => {
    const { entregables } = construirEntregables(base, filas, []);
    expect(entregables.map((e) => e.titulo)).toContain("Manual de marca");
  });

  it("ignora las propiedades que el portal no sabe mostrar", () => {
    const { props } = elegirPapeles(base, ["rollup", "fase"]);
    expect(props.map((p) => p.id)).toEqual(["tit", "fase"]);
  });

  it("solo deja enlaces http(s)", () => {
    const { entregables } = construirEntregables(base, filas, ["url"]);
    const enlaces = entregables.flatMap((e) => e.enlaces.map((l) => l.url));
    expect(enlaces).toEqual(["https://figma.com/x"]);
  });
});

describe("papeles y orden de los entregables", () => {
  const { entregables, etiquetaFecha } = construirEntregables(base, filas, ["est", "fec", "fase"]);

  it("ordena por fecha y deja al final los que no tienen", () => {
    expect(entregables.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("usa el día de la fecha tal como lo dio Notion (sin pasarlo a UTC)", () => {
    expect(entregables[0].fecha).toBe("30 sept");
    expect(etiquetaFecha).toBe("Fecha de entrega");
  });

  it("traduce el texto del estado a su tono", () => {
    expect(entregables[0].estado).toMatchObject({ tono: "exito", completado: true });
    expect(entregables[1].estado).toMatchObject({ tono: "aviso", enRevision: true });
    expect(entregables[2].estado).toBeNull();
  });

  it("el resto de propiedades visibles van como campos", () => {
    expect(entregables[1].campos).toEqual([{ nombre: "Fase", valor: "Diseño web" }]);
  });
});
