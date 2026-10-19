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
import { pendientesDe, type EstadoPortal, type Portal } from "@/lib/portales/tipos";

/*
  Acciones del asistente y del dashboard de portales. Todas comprueban la
  sesión; Supabase (RLS) impide además tocar portales de otra agencia. Si un
  cambio no afecta a ninguna fila (portal borrado o ajeno) se avisa en vez de
  darlo por hecho.
*/

export type EstadoFormulario = { error?: string; errores?: Record<string, string>; ok?: string };

const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NO_ENCONTRADO = "No encontramos este portal. Puede que se haya borrado.";

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

type CambiosPortal = Partial<Pick<Portal, "cliente" | "nombre" | "slug" | "estado" | "color" | "fuente_notion_id" | "propiedades_visibles">>;

/**
  Actualiza un portal de la agencia con sesión.
  "no-encontrado" si no existe o no es suyo (RLS no da error: simplemente no cambia nada).
  "duplicado" si el enlace (slug) ya lo usa otro portal.
*/
async function actualizarPortal(id: string, cambios: CambiosPortal): Promise<"ok" | "no-encontrado" | "duplicado" | "error"> {
  await obtenerUsuario();
  const supabase = await createClient();
  const { data, error } = await supabase.from("portales").update(cambios).eq("id", id).select("id");
  if (error) {
    if (error.code === "23505") return "duplicado";
    console.error("[portales] No se pudo actualizar el portal:", error);
    return "error";
  }
  return data.length ? "ok" : "no-encontrado";
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
    console.error("[portales] No se pudo crear el portal:", error);
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

  const resultado = await actualizarPortal(id, d);
  if (resultado === "duplicado") return { errores: { slug: "Este enlace ya está en uso. Prueba con otro." } };
  if (resultado === "no-encontrado") return { error: NO_ENCONTRADO };
  if (resultado === "error") return { error: "No hemos podido guardar los cambios. Inténtalo de nuevo." };
  refrescar(id);
  irAPaso(id, 2);
  return {};
}

export async function elegirBase(id: string, _previo: EstadoFormulario, fuente: string): Promise<EstadoFormulario> {
  if (!fuente) return { error: "Elige una base de datos." };
  const portal = await obtenerPortal(id);
  if (!portal) return { error: NO_ENCONTRADO };

  // Comprobamos que la integración de esta agencia puede leer la base antes de guardarla.
  const base = await obtenerBase(await tokenAgencia(), fuente);
  if (!base.ok) return { error: base.error.mensaje };

  const cambio = portal.fuente_notion_id !== fuente;
  const resultado = await actualizarPortal(
    id,
    cambio ? { fuente_notion_id: fuente, propiedades_visibles: [] } : { fuente_notion_id: fuente },
  );
  if (resultado === "no-encontrado") return { error: NO_ENCONTRADO };
  if (resultado === "error") return { error: "No hemos podido guardar la base elegida." };
  refrescar(id);
  irAPaso(id, 3);
  return {};
}

export async function guardarCampos(id: string, _previo: EstadoFormulario, visibles: string[]): Promise<EstadoFormulario> {
  const portal = await obtenerPortal(id);
  if (!portal) return { error: NO_ENCONTRADO };
  if (!portal.fuente_notion_id) return { error: "Primero elige una base de datos." };
  const base = await obtenerBase(await tokenAgencia(), portal.fuente_notion_id);
  if (!base.ok) return { error: base.error.mensaje };

  // Solo se guardan ids que existen de verdad en la base.
  const existentes = new Set(base.datos.propiedades.filter((p) => p.tipo !== null).map((p) => p.id));
  const limpios = [...new Set(visibles)].filter((v) => existentes.has(v));

  const resultado = await actualizarPortal(id, { propiedades_visibles: limpios });
  if (resultado === "no-encontrado") return { error: NO_ENCONTRADO };
  if (resultado === "error") return { error: "No hemos podido guardar los campos visibles." };
  refrescar(id);
  irAPaso(id, 4);
  return {};
}

export async function guardarMarca(id: string, _previo: EstadoFormulario, color: string): Promise<EstadoFormulario> {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Elige un color válido." };
  const resultado = await actualizarPortal(id, { color: color.toLowerCase() });
  if (resultado === "no-encontrado") return { error: NO_ENCONTRADO };
  if (resultado === "error") return { error: "No hemos podido guardar el color." };
  refrescar(id);
  irAPaso(id, 5);
  return {};
}

export async function fijarContrasena(id: string, _previo: EstadoFormulario, contrasena: string): Promise<EstadoFormulario> {
  if (contrasena.length < 8) return { errores: { contrasena: "La contraseña necesita al menos 8 caracteres." } };
  await obtenerUsuario();
  const supabase = await createClient();
  // La función solo cambia portales propios y da error si no encuentra el portal.
  const { error } = await supabase.rpc("fijar_contrasena_portal", { p_portal: id, p_contrasena: contrasena });
  if (error) {
    console.error("[portales] No se pudo guardar la contraseña:", error);
    return { error: "No hemos podido guardar la contraseña." };
  }
  refrescar(id);
  return {
    ok: "Contraseña guardada. Compártela con tu cliente por un canal privado. Quien ya hubiera entrado tendrá que escribir la nueva.",
  };
}

async function cambiarEstado(id: string, estado: EstadoPortal, ok: string): Promise<EstadoFormulario> {
  const resultado = await actualizarPortal(id, { estado });
  if (resultado === "no-encontrado") return { error: NO_ENCONTRADO };
  if (resultado === "error") return { error: "No hemos podido cambiar el estado del portal. Inténtalo de nuevo." };
  refrescar(id);
  return { ok };
}

export async function publicarPortal(id: string): Promise<EstadoFormulario> {
  const portal = await obtenerPortal(id);
  if (!portal) return { error: NO_ENCONTRADO };
  const faltan = pendientesDe(portal, await portalTieneContrasena(id));
  if (faltan.length) return { error: `Antes de publicar falta: ${faltan.join(", ").toLowerCase()}.` };
  return cambiarEstado(id, "publicado", "Portal publicado.");
}

export async function despublicarPortal(id: string) {
  return cambiarEstado(id, "borrador", "Portal despublicado. Tu cliente ya no puede abrirlo.");
}

export async function archivarPortal(id: string) {
  return cambiarEstado(id, "archivado", "Portal archivado.");
}

export async function restaurarPortal(id: string) {
  return cambiarEstado(id, "borrador", "Portal restaurado como borrador.");
}

/** Borra el portal para siempre. Solo se ofrece para portales archivados. */
export async function borrarPortal(id: string): Promise<EstadoFormulario> {
  await obtenerUsuario();
  const supabase = await createClient();
  const { data, error } = await supabase.from("portales").delete().eq("id", id).eq("estado", "archivado").select("id");
  if (error) {
    console.error("[portales] No se pudo borrar el portal:", error);
    return { error: "No hemos podido borrar el portal. Inténtalo de nuevo." };
  }
  if (!data.length) return { error: "Solo se pueden borrar portales archivados." };
  refrescar();
  return { ok: "Portal borrado." };
}
