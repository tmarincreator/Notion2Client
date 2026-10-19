/*
  Tipos compartidos entre servidor y navegador.
  Lo que llega al navegador del cliente (DatosPortal) ya está filtrado:
  solo contiene las propiedades marcadas como visibles.
*/

export type EstadoPortal = "borrador" | "publicado" | "archivado";

/** Color de una etiqueta de estado (ver components/ui/Badge). */
export type TonoBadge = "exito" | "aviso" | "peligro" | "marca" | "borrador" | "archivado" | "neutro";

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

/** Lo que hace falta para publicar un portal, en el orden en que se muestra. */
export const REQUISITOS_PUBLICAR = [
  "Elegir una base de datos de Notion",
  "Marcar al menos un campo como visible",
  "Definir una contraseña",
] as const;

/** Requisitos que aún le faltan a un portal (vacío = listo para publicar). */
export function pendientesDe(portal: Pick<Portal, "fuente_notion_id" | "propiedades_visibles">, tieneContrasena: boolean) {
  const [base, campos, contrasena] = REQUISITOS_PUBLICAR;
  return [
    ...(portal.fuente_notion_id ? [] : [base]),
    ...(portal.propiedades_visibles.length ? [] : [campos]),
    ...(tieneContrasena ? [] : [contrasena]),
  ];
}
