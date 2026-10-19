import { agencia, buscarPortalCliente } from "@/lib/sample-data";
import type { DatosPortal, EntregablePortal } from "./tipos";

/*
  Portales de demostración de la landing ("Ver demo"): usan los datos de
  sample-data con el mismo formato que los portales reales.
*/

const tonos = {
  Entregado: { tono: "exito", completado: true, enRevision: false },
  "En revisión": { tono: "aviso", completado: false, enRevision: true },
  "En curso": { tono: "marca", completado: false, enRevision: false },
  Pendiente: { tono: "borrador", completado: false, enRevision: false },
} as const;

export function portalDemo(slug: string): DatosPortal | null {
  const p = buscarPortalCliente(slug);
  if (!p) return null;
  return {
    slug: p.slug,
    nombre: p.nombre,
    cliente: p.cliente,
    color: p.colorAgencia,
    agencia: { nombre: agencia.nombre, iniciales: agencia.iniciales, logo: null },
    actualizado: p.actualizado,
    etiquetaFecha: "Fecha de entrega",
    entregables: p.entregables.map(
      (e): EntregablePortal => ({
        id: String(e.id),
        titulo: e.titulo,
        estado: { texto: e.estado, ...tonos[e.estado] },
        fecha: e.fecha,
        campos: [
          { nombre: "Fase", valor: e.fase },
          { nombre: "Descripción", valor: e.descripcion },
        ],
        enlaces: [],
      }),
    ),
  };
}
