import "server-only";
import { createClient } from "@/lib/supabase/server";
import { urlLogo } from "@/lib/agencia";
import { obtenerBase, leerRegistros } from "@/lib/notion/bases";
import type { ResultadoNotion } from "@/lib/notion/errores";
import { construirEntregables } from "./contenido";
import type { DatosPortal, Portal } from "./tipos";

/*
  Lectura de portales en Supabase. Las consultas de la agencia pasan por RLS:
  cada agencia solo recibe sus propios portales.
*/

const COLUMNAS = "id, slug, cliente, nombre, estado, color, fuente_notion_id, propiedades_visibles, creado, actualizado";

export async function listarPortales(): Promise<Portal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("portales").select(COLUMNAS).order("actualizado", { ascending: false });
  if (error) throw new Error(`No se pudieron leer los portales: ${error.message}`);
  return data as Portal[];
}

export async function obtenerPortal(id: string): Promise<Portal | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("portales").select(COLUMNAS).eq("id", id).maybeSingle();
  return (data as Portal | null) ?? null;
}

export async function portalTieneContrasena(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("portal_tiene_contrasena", { p_portal: id });
  return data === true;
}

export type PortalPublico = {
  slug: string;
  cliente: string;
  nombre: string;
  color: string;
  agencia: string;
  logo_path: string | null;
  fuente_notion_id: string | null;
  propiedades_visibles: string[];
  actualizado: string;
};

/** Portal publicado por su enlace (para el cliente, sin sesión). */
export async function portalPublico(slug: string): Promise<PortalPublico | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("portal_publico", { p_slug: slug });
  return (data as PortalPublico[] | null)?.[0] ?? null;
}

export const inicialesDe = (texto: string) =>
  texto
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]!.toUpperCase())
    .join("") || "A";

/**
  Lee de Notion el contenido del portal aplicando las reglas de visibilidad.
  Lo que devuelve es exactamente lo que se envía al navegador.
*/
export async function cargarContenido(config: {
  slug: string;
  nombre: string;
  cliente: string;
  color: string;
  agencia: string;
  logo_path: string | null;
  fuente_notion_id: string;
  propiedades_visibles: string[];
  /** Token de Notion de la agencia dueña del portal. */
  token: string | null;
}): Promise<ResultadoNotion<DatosPortal>> {
  const base = await obtenerBase(config.token, config.fuente_notion_id);
  if (!base.ok) return base;

  // Solo propiedades que existen hoy en la base y están marcadas como visibles.
  const titulo = base.datos.propiedades.find((p) => p.tipoNotion === "title");
  const visibles = base.datos.propiedades.filter((p) => config.propiedades_visibles.includes(p.id)).map((p) => p.id);
  const pedir = titulo ? [...new Set([titulo.id, ...visibles])] : visibles;

  const registros = await leerRegistros(config.token, config.fuente_notion_id, { propiedadesVisibles: pedir, limite: 200 });
  if (!registros.ok) return registros;

  const { entregables, etiquetaFecha } = construirEntregables(base.datos, registros.datos, visibles);
  return {
    ok: true,
    datos: {
      slug: config.slug,
      nombre: config.nombre,
      cliente: config.cliente,
      color: config.color,
      agencia: { nombre: config.agencia, iniciales: inicialesDe(config.agencia), logo: urlLogo(config.logo_path) },
      actualizado: "ahora mismo",
      etiquetaFecha,
      entregables,
    },
  };
}
