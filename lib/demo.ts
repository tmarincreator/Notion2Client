import type { DatosPortal, EntregablePortal, EstadoEntregable } from "@/lib/portales/tipos";

/*
  Portales de demostración de la landing ("Ver demo", /demo/[slug]).
  Datos fijos con el mismo formato que los portales reales; no tocan
  Supabase ni Notion, y su ruta y su cookie están separadas de /p/[slug].
*/

export const CONTRASENA_DEMO = "demo1234";

const agencia = { nombre: "Estudio Norte", iniciales: "EN", logo: null };

const estados = {
  entregado: { texto: "Entregado", tono: "exito", completado: true, enRevision: false },
  revision: { texto: "En revisión", tono: "aviso", completado: false, enRevision: true },
  curso: { texto: "En curso", tono: "marca", completado: false, enRevision: false },
  pendiente: { texto: "Pendiente", tono: "borrador", completado: false, enRevision: false },
} satisfies Record<string, EstadoEntregable>;

const entregable = (
  id: number,
  titulo: string,
  estado: EstadoEntregable,
  fecha: string,
  fase: string,
  descripcion: string,
): EntregablePortal => ({
  id: String(id),
  titulo,
  estado,
  fecha,
  campos: [
    { nombre: "Fase", valor: fase },
    { nombre: "Descripción", valor: descripcion },
  ],
  enlaces: [],
});

/*
  Solo hay campos "visibles": los ocultos (Coste interno, Notas internas…) no
  existen aquí, igual que en un portal real nunca llegan al navegador del cliente.
*/
const PORTALES: DatosPortal[] = [
  {
    slug: "lumen-cafe",
    nombre: "Rebrand web",
    cliente: "Lumen Café",
    color: "#c2410c",
    agencia,
    actualizado: "hace 2 h",
    etiquetaFecha: "Fecha de entrega",
    entregables: [
      entregable(1, "Identidad visual y manual de marca", estados.entregado, "30 sep", "Identidad", "Logotipo, paleta, tipografías y normas de uso para aplicaciones digitales e impresas."),
      entregable(2, "Diseño de la home v2", estados.revision, "18 oct", "Diseño web", "Segunda propuesta de la página de inicio con los cambios de la última reunión. Necesitamos tu visto bueno para pasar a maquetación."),
      entregable(3, "Maquetación de la carta digital", estados.curso, "24 oct", "Desarrollo", "Carta adaptada a móvil, con filtros por alérgenos y precios actualizables."),
      entregable(4, "Fotografía de producto", estados.pendiente, "6 nov", "Contenido", "Sesión de fotos de la carta de otoño en el local."),
      entregable(5, "Lanzamiento de la web", estados.pendiente, "20 nov", "Lanzamiento", "Publicación de la web y revisión final contigo."),
    ],
  },
  {
    // Portal sin entregables, para ver el estado vacío.
    slug: "marea-ropa",
    nombre: "Campaña de otoño",
    cliente: "Marea Ropa",
    color: "#1d4ed8",
    agencia,
    actualizado: "ayer",
    etiquetaFecha: "Fecha de entrega",
    entregables: [],
  },
];

export function portalDemo(slug: string): DatosPortal | null {
  return PORTALES.find((p) => p.slug === slug) ?? null;
}
