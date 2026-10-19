import "server-only";
import { formatearFecha } from "@/lib/formato";
import type { BaseDetalle, Registro } from "@/lib/notion/bases";
import type { PropiedadLeida, ValorLeido } from "@/lib/notion/propiedades";
import type { EntregablePortal, EstadoEntregable, TonoBadge } from "./tipos";

/*
  Convierte las filas de Notion en entregables del portal.
  No hay un formato fijo: se busca cada papel por el tipo de la propiedad.
  - Título  → nombre del entregable (siempre visible).
  - Estado  → la propiedad de estado o selección que se llame "Estado"/"Status"
              (si no, la primera de tipo Estado).
  - Fecha   → la primera propiedad de fecha visible.
  - Enlaces → archivos y propiedades URL.
  - El resto se muestra como "etiqueta: valor" en el detalle.
*/

const TONOS: [RegExp, TonoBadge, "completado" | "revision" | null][] = [
  [/complet|entregad|hecho|terminad|finaliz|done|aprobad/i, "exito", "completado"],
  [/revisi|review|validaci/i, "aviso", "revision"],
  [/bloque|blocked|cancel|retras/i, "peligro", null],
  [/curso|progres|doing|haciendo|desarroll/i, "marca", null],
];

function estadoDe(texto: string): EstadoEntregable {
  const fila = TONOS.find(([patron]) => patron.test(texto));
  return {
    texto,
    tono: fila?.[1] ?? "borrador",
    completado: fila?.[2] === "completado",
    enRevision: fila?.[2] === "revision",
  };
}

function textoDe(v: ValorLeido, prop: PropiedadLeida): string | null {
  switch (v.tipo) {
    case "texto":
      return v.valor;
    case "numero":
      return /progres|avance|%/i.test(prop.nombre) ? `${v.valor}%` : v.valor.toLocaleString("es-ES");
    case "fecha":
      return v.fin ? `${formatearFecha(v.inicio)} – ${formatearFecha(v.fin)}` : formatearFecha(v.inicio);
    case "lista":
      return v.valor.join(", ");
    default:
      return null;
  }
}

export function elegirPapeles(base: BaseDetalle, visibles: string[]) {
  const props = base.propiedades.filter((p) => p.tipo !== null && (p.tipoNotion === "title" || visibles.includes(p.id)));
  const titulo = props.find((p) => p.tipoNotion === "title") ?? null;
  const candidatasEstado = props.filter((p) => p.tipoNotion === "status" || p.tipoNotion === "select");
  const estado =
    candidatasEstado.find((p) => /^(estado|status)$/i.test(p.nombre.trim())) ??
    candidatasEstado.find((p) => p.tipoNotion === "status") ??
    null;
  const fecha = props.find((p) => p.tipoNotion === "date") ?? null;
  return { props, titulo, estado, fecha };
}

export function construirEntregables(base: BaseDetalle, registros: Registro[], visibles: string[]) {
  const { props, titulo, estado, fecha } = elegirPapeles(base, visibles);

  const entregables = registros.map((r): EntregablePortal & { orden: string } => {
    const valor = (p: PropiedadLeida | null) => (p ? r.valores[p.id] : undefined);
    const vTitulo = valor(titulo);
    const vEstado = valor(estado);
    const vFecha = valor(fecha);

    const campos: EntregablePortal["campos"] = [];
    const enlaces: EntregablePortal["enlaces"] = [];
    for (const p of props) {
      if (p === titulo || p === estado || p === fecha) continue;
      const v = r.valores[p.id];
      if (!v || v.tipo === "vacio") continue;
      if (v.tipo === "archivos") {
        enlaces.push(...v.valor);
      } else if (p.tipoNotion === "url" && v.tipo === "texto") {
        enlaces.push({ nombre: p.nombre, url: v.valor });
      } else {
        const texto = textoDe(v, p);
        if (texto) campos.push({ nombre: p.nombre, valor: texto });
      }
    }

    return {
      id: r.id,
      titulo: vTitulo?.tipo === "texto" ? vTitulo.valor : "Sin título",
      estado: vEstado?.tipo === "texto" ? estadoDe(vEstado.valor) : null,
      fecha: vFecha?.tipo === "fecha" ? formatearFecha(vFecha.inicio) : null,
      campos,
      enlaces: enlaces.filter((e) => /^https?:\/\//i.test(e.url)),
      orden: vFecha?.tipo === "fecha" ? vFecha.inicio : "9999",
    };
  });

  // Por fecha, como una línea de tiempo del proyecto. Sin fecha, al final.
  entregables.sort((a, b) => a.orden.localeCompare(b.orden));
  return {
    entregables: entregables.map(({ orden, ...e }) => (void orden, e)),
    etiquetaFecha: fecha?.nombre ?? null,
  };
}
