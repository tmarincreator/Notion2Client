import type { TonoBadge } from "@/components/ui/Badge";

/*
  Tipos compartidos entre servidor y navegador.
  Lo que llega al navegador del cliente (DatosPortal) ya está filtrado:
  solo contiene las propiedades marcadas como visibles.
*/

export type EstadoPortal = "borrador" | "publicado" | "archivado";

/** Fila de la tabla `portales` (sin el hash de la contraseña). */
export type Portal = {
  id: string;
  slug: string;
  cliente: string;
  nombre: string;
  estado: EstadoPortal;
  color: string;
  fuente_notion_id: string | null;
  propiedades_visibles: string[];
  creado: string;
  actualizado: string;
};

export type EstadoEntregable = {
  texto: string;
  tono: TonoBadge;
  completado: boolean;
  enRevision: boolean;
};

export type EntregablePortal = {
  id: string;
  titulo: string;
  estado: EstadoEntregable | null;
  /** Fecha ya formateada para mostrar ("22 oct"). */
  fecha: string | null;
  /** Resto de propiedades visibles, listas para mostrar. */
  campos: { nombre: string; valor: string }[];
  enlaces: { nombre: string; url: string }[];
};

export type DatosPortal = {
  slug: string;
  nombre: string;
  cliente: string;
  color: string;
  agencia: { nombre: string; iniciales: string; logo: string | null };
  /** "hace 5 min", "18 oct"… */
  actualizado: string;
  /** Nombre de la propiedad de fecha visible ("Fecha de entrega"), si hay. */
  etiquetaFecha: string | null;
  entregables: EntregablePortal[];
};

export const COLOR_POR_DEFECTO = "#c2410c";
