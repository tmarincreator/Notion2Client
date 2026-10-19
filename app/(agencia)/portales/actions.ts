"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerBase } from "@/lib/notion/bases";
import { tokenAgencia } from "@/lib/notion/conexion";
import { obtenerPortal, portalTieneContrasena } from "@/lib/portales/datos";
import { obtenerMarca } from "@/lib/agencia";
import { esSlugDemo } from "@/lib/sample-data";
import type { EstadoPortal } from "@/lib/portales/tipos";

/*
  Acciones del asistente de portales. Todas se ejecutan en el servidor con la
  sesión de la agencia; Supabase (RLS) impide tocar portales de otra agencia.
*/

export type EstadoFormulario = { error?: string; errores?: Record<string, string>; ok?: string };

const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type DatosBasicos = { cliente: string; nombre: string; slug: string };

function validarDatos(d: DatosBasicos) {
  const errores: Record<string, string> = {};
  if (!d.cliente.trim()) errores.cliente = "Escribe el nombre del cliente.";
  else if (d.cliente.trim().length > 120) errores.cliente = "Máximo 120 caracteres.";
  if (!d.nombre.trim()) errores.nombre = "Escribe el nombre visible del portal.";
  else if (d.nombre.trim().length > 120) errores.nombre = "Máximo 120 caracteres.";
  if (d.slug.length < 3 || d.slug.length > 60) errores.slug = "El enlace debe tener entre 3 y 60 caracteres.";
  else if (!SLUG_VALIDO.test(d.slug)) errores.slug = "Usa solo minúsculas, números y guiones (sin guion al principio ni al final).";
  else if (esSlugDemo(d.slug)) errores.slug = "Este enlace está reservado. Prueba con otro.";
  return errores;
}

async function slugLibre(slug: string, excepto?: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("slug_disponible", { p_slug: slug, p_excepto: excepto ?? null });
  return data === true;
}

const irAPaso = (id: string, paso: number) => redirect(`/portales/${id}?paso=${paso}`);

function refrescar(id?: string) {
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/portales/${id}`);
}

export async function crearPortal(_previo: EstadoFormulario, datos: DatosBasicos): Promise<EstadoFormulario> {
  await obtenerUsuario();
  const d = { cliente: datos.cliente.trim(), nombre: datos.nombre.trim(), slug: datos.slug.trim() };
  const errores = validarDatos(d);
  if (Object.keys(errores).length) return { errores };
  if (!(await slugLibre(d.slug))) return { errores: { slug: "Este enlace ya está en uso. Prueba con otro." } };

  // El portal nace con el color de la agencia; luego se puede cambiar en el paso 4.
  const { color } = await obtenerMarca();
  const supabase = await createClient();
  const { data, error } = await supabase.from("portales").insert({ ...d, color }).select("id").single();
  if (error) {
    if (error.code === "23505") return { errores: { slug: "Este enlace ya está en uso. Prueba con otro." } };
    return { error: "No hemos podido guardar el portal. Inténtalo de nuevo." };
  }
  refrescar();
  irAPaso(data.id, 2);
  return {};
}

export async function guardarDatos(id: string, _previo: EstadoFormulario, datos: DatosBasicos): Promise<EstadoFormulario> {
  const d = { cliente: datos.cliente.trim(), nombre: datos.nombre.trim(), slug: datos.slug.trim() };
  const errores = validarDatos(d);
  if (Object.keys(errores).length) return { errores };
  if (!(await slugLibre(d.slug, id))) return { errores: { slug: "Este enlace ya está en uso. Prueba con otro." } };

  const supabase = await createClient();
  const { error } = await supabase.from("portales").update(d).eq("id", id);
  if (error) return { error: "No hemos podido guardar los cambios. Inténtalo de nuevo." };
  refrescar(id);
  irAPaso(id, 2);
  return {};
}

export async function elegirBase(id: string, _previo: EstadoFormulario, fuente: string): Promise<EstadoFormulario> {
  if (!fuente) return { error: "Elige una base de datos." };
  const portal = await obtenerPortal(id);
  if (!portal) return { error: "Portal no encontrado." };

  // Comprobamos que la integración de esta agencia puede leer la base antes de guardarla.
  const base = await obtenerBase(await tokenAgencia(), fuente);
  if (!base.ok) return { error: base.error.mensaje };

  const cambio = portal.fuente_notion_id !== fuente;
  const supabase = await createClient();
  const { error } = await supabase
    .from("portales")
    .update(cambio ? { fuente_notion_id: fuente, propiedades_visibles: [] } : { fuente_notion_id: fuente })
    .eq("id", id);
  if (error) return { error: "No hemos podido guardar la base elegida." };
  refrescar(id);
  irAPaso(id, 3);
  return {};
}

export async function guardarCampos(id: string, _previo: EstadoFormulario, visibles: string[]): Promise<EstadoFormulario> {
  const portal = await obtenerPortal(id);
  if (!portal?.fuente_notion_id) return { error: "Primero elige una base de datos." };
  const base = await obtenerBase(await tokenAgencia(), portal.fuente_notion_id);
  if (!base.ok) return { error: base.error.mensaje };

  // Solo se guardan ids que existen de verdad en la base.
  const existentes = new Set(base.datos.propiedades.filter((p) => p.tipo !== null).map((p) => p.id));
  const limpios = [...new Set(visibles)].filter((v) => existentes.has(v));

  const supabase = await createClient();
  const { error } = await supabase.from("portales").update({ propiedades_visibles: limpios }).eq("id", id);
  if (error) return { error: "No hemos podido guardar los campos visibles." };
  refrescar(id);
  irAPaso(id, 4);
  return {};
}

export async function guardarMarca(id: string, _previo: EstadoFormulario, color: string): Promise<EstadoFormulario> {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Elige un color válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("portales").update({ color: color.toLowerCase() }).eq("id", id);
  if (error) return { error: "No hemos podido guardar el color." };
  refrescar(id);
  irAPaso(id, 5);
  return {};
}

export async function fijarContrasena(id: string, _previo: EstadoFormulario, contrasena: string): Promise<EstadoFormulario> {
  if (contrasena.length < 8) return { errores: { contrasena: "La contraseña necesita al menos 8 caracteres." } };
  const supabase = await createClient();
  const { error } = await supabase.rpc("fijar_contrasena_portal", { p_portal: id, p_contrasena: contrasena });
  if (error) return { error: "No hemos podido guardar la contraseña." };
  refrescar(id);
  return {
    ok: "Contraseña guardada. Compártela con tu cliente por un canal privado. Quien ya hubiera entrado tendrá que escribir la nueva.",
  };
}

/** Lo que falta para poder publicar (vacío = listo). */
export async function pendientesParaPublicar(id: string) {
  const portal = await obtenerPortal(id);
  if (!portal) return ["Portal no encontrado"];
  const faltan: string[] = [];
  if (!portal.fuente_notion_id) faltan.push("Elegir una base de datos de Notion");
  if (portal.propiedades_visibles.length === 0) faltan.push("Marcar al menos un campo como visible");
  if (!(await portalTieneContrasena(id))) faltan.push("Definir una contraseña");
  return faltan;
}

async function cambiarEstado(id: string, estado: EstadoPortal) {
  const supabase = await createClient();
  const { error } = await supabase.from("portales").update({ estado }).eq("id", id);
  if (error) throw new Error("No se pudo cambiar el estado del portal");
  refrescar(id);
}

export async function publicarPortal(id: string): Promise<EstadoFormulario> {
  const faltan = await pendientesParaPublicar(id);
  if (faltan.length) return { error: `Antes de publicar falta: ${faltan.join(", ").toLowerCase()}.` };
  await cambiarEstado(id, "publicado");
  return { ok: "Portal publicado." };
}

export async function despublicarPortal(id: string) {
  await cambiarEstado(id, "borrador");
}

export async function archivarPortal(id: string) {
  await cambiarEstado(id, "archivado");
}

export async function restaurarPortal(id: string) {
  await cambiarEstado(id, "borrador");
}
