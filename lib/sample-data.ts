/*
  Datos de prueba (sample data).
  Todavía no hay base de datos ni conexión con Notion: todo lo que muestran
  las pantallas sale de este archivo. Cuando conectemos Supabase y Notion,
  se sustituirán estas constantes por consultas reales sin rehacer las pantallas.
*/

/* ---------- Tipos ---------- */

export type EstadoPortal = "publicado" | "borrador" | "archivado";

export type PortalResumen = {
  slug: string;
  nombre: string;
  cliente: string;
  estado: EstadoPortal;
  actualizado: string;
  pasoPendiente?: string;
};

export type EstadoEntregable = "Entregado" | "En revisión" | "En curso" | "Pendiente";

export type Archivo = { nombre: string; tipo: string; url: string };

export type Entregable = {
  id: number;
  titulo: string;
  estado: EstadoEntregable;
  fecha: string;
  fase: string;
  descripcion: string;
  archivos: Archivo[];
};

export type PortalCliente = {
  slug: string;
  nombre: string;
  cliente: string;
  colorAgencia: string;
  actualizado: string;
  entregables: Entregable[];
};

export type EstadoConexionNotion = "conectado" | "caducado" | "desconectado";

export type ConexionNotion = {
  estado: EstadoConexionNotion;
  espacio: string;
  validado: string;
  /** Solo los últimos caracteres: el token completo nunca se muestra. */
  tokenVisible: string;
};

export type TipoPropiedadNotion =
  | "Título" | "Estado" | "Fecha" | "Selección" | "Texto" | "Archivos" | "Persona" | "Número";

export type PropiedadNotion = {
  id: string;
  nombre: string;
  tipo: TipoPropiedadNotion;
  /** El nombre sugiere información interna (coste, margen, notas…). */
  sensible: boolean;
};

export type BaseNotion = {
  id: string;
  nombre: string;
  elementos: number;
  propiedades: PropiedadNotion[];
  /** Número de portales que usan esta base. */
  usadaEn: number;
};

/* ---------- Agencia ---------- */

export const agencia = {
  nombre: "Estudio Norte",
  iniciales: "EN",
  correo: "ana@estudionorte.com",
  colorPrincipal: "#c2410c",
};

/* ---------- Conexión y bases de datos de Notion (simuladas) ---------- */

export const conexionNotion: ConexionNotion = {
  estado: "conectado",
  espacio: "Estudio Norte",
  validado: "hace 5 min",
  tokenVisible: "secret_••••••••3f9a",
};

const propiedadesProyectos: PropiedadNotion[] = [
  { id: "title", nombre: "Entregable", tipo: "Título", sensible: false },
  { id: "status", nombre: "Estado", tipo: "Estado", sensible: false },
  { id: "date", nombre: "Fecha de entrega", tipo: "Fecha", sensible: false },
  { id: "phase", nombre: "Fase", tipo: "Selección", sensible: false },
  { id: "desc", nombre: "Descripción", tipo: "Texto", sensible: false },
  { id: "files", nombre: "Archivos", tipo: "Archivos", sensible: false },
  { id: "owner", nombre: "Responsable", tipo: "Persona", sensible: false },
  { id: "cost", nombre: "Coste interno", tipo: "Número", sensible: true },
  { id: "notes", nombre: "Notas internas", tipo: "Texto", sensible: true },
];

export const basesNotion: BaseNotion[] = [
  { id: "proyectos", nombre: "Proyectos de clientes", elementos: 24, propiedades: propiedadesProyectos, usadaEn: 2 },
  {
    id: "entregables",
    nombre: "Entregables 2026",
    elementos: 58,
    usadaEn: 0,
    propiedades: [
      { id: "title", nombre: "Nombre", tipo: "Título", sensible: false },
      { id: "status", nombre: "Estado", tipo: "Estado", sensible: false },
      { id: "date", nombre: "Fecha", tipo: "Fecha", sensible: false },
      { id: "client", nombre: "Cliente", tipo: "Selección", sensible: false },
      { id: "files", nombre: "Archivos", tipo: "Archivos", sensible: false },
      { id: "rate", nombre: "Tarifa", tipo: "Número", sensible: true },
      { id: "margin", nombre: "Margen", tipo: "Número", sensible: true },
    ],
  },
  {
    id: "tareas",
    nombre: "Tareas internas",
    elementos: 112,
    usadaEn: 0,
    propiedades: [
      { id: "title", nombre: "Tarea", tipo: "Título", sensible: false },
      { id: "status", nombre: "Estado", tipo: "Estado", sensible: false },
      { id: "owner", nombre: "Responsable", tipo: "Persona", sensible: false },
      { id: "notes", nombre: "Notas internas", tipo: "Texto", sensible: true },
    ],
  },
];

/* ---------- Portales de la agencia (dashboard) ---------- */

export const portales: PortalResumen[] = [
  { slug: "lumen-cafe", nombre: "Rebrand web", cliente: "Lumen Café", estado: "publicado", actualizado: "hace 2 h" },
  { slug: "marea-ropa", nombre: "Campaña de otoño", cliente: "Marea Ropa", estado: "publicado", actualizado: "ayer" },
  { slug: "taller-vega", nombre: "Onboarding SEO", cliente: "Taller Vega", estado: "borrador", actualizado: "hace 3 días", pasoPendiente: "Paso 3 de 5 · Campos visibles" },
  { slug: "hotel-alba", nombre: "Auditoría UX", cliente: "Hotel Alba", estado: "archivado", actualizado: "12 sep" },
];

/* ---------- Contenido que ve cada cliente ----------
  Solo incluye campos "visibles": los ocultos (Coste interno, Notas internas…)
  no existen aquí, igual que en el producto real nunca llegarán al navegador
  del cliente.
*/
export const portalesCliente: PortalCliente[] = [
  {
    slug: "lumen-cafe",
    nombre: "Rebrand web",
    cliente: "Lumen Café",
    colorAgencia: "#c2410c",
    actualizado: "hace 2 h",
    entregables: [
      { id: 1, titulo: "Identidad visual y manual de marca", estado: "Entregado", fecha: "30 sep", fase: "Identidad", descripcion: "Logotipo, paleta, tipografías y normas de uso para aplicaciones digitales e impresas.", archivos: [{ nombre: "Manual de marca.pdf", tipo: "PDF", url: "#" }, { nombre: "Logotipos.zip", tipo: "ZIP", url: "#" }] },
      { id: 2, titulo: "Diseño de la home v2", estado: "En revisión", fecha: "18 oct", fase: "Diseño web", descripcion: "Segunda propuesta de la página de inicio con los cambios de la última reunión. Necesitamos tu visto bueno para pasar a maquetación.", archivos: [{ nombre: "Prototipo de la home", tipo: "Enlace", url: "#" }] },
      { id: 3, titulo: "Maquetación de la carta digital", estado: "En curso", fecha: "24 oct", fase: "Desarrollo", descripcion: "Carta adaptada a móvil, con filtros por alérgenos y precios actualizables.", archivos: [] },
      { id: 4, titulo: "Fotografía de producto", estado: "Pendiente", fecha: "6 nov", fase: "Contenido", descripcion: "Sesión de fotos de la carta de otoño en el local.", archivos: [] },
      { id: 5, titulo: "Lanzamiento de la web", estado: "Pendiente", fecha: "20 nov", fase: "Lanzamiento", descripcion: "Publicación de la web y revisión final contigo.", archivos: [] },
    ],
  },
  {
    // Portal sin entregables, para ver el estado vacío.
    slug: "marea-ropa",
    nombre: "Campaña de otoño",
    cliente: "Marea Ropa",
    colorAgencia: "#1d4ed8",
    actualizado: "ayer",
    entregables: [],
  },
];

/* Contraseña de prueba para entrar a cualquier portal de demostración. */
export const CONTRASENA_DEMO = "demo1234";

export function buscarPortalCliente(slug: string) {
  return portalesCliente.find((p) => p.slug === slug);
}

/* Enlaces de la demo: ninguna agencia puede usarlos (también lo impide Supabase, migración 0004). */
export function esSlugDemo(slug: string) {
  return portalesCliente.some((p) => p.slug === slug);
}
