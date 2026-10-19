"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerMarca } from "@/lib/agencia";

/*
  Marca de la agencia. El archivo del logotipo lo sube el navegador directamente
  a Supabase Storage (las políticas solo le dejan escribir en su carpeta y el
  bucket solo acepta PNG, JPG o WebP de hasta 1 MB). Aquí se guarda qué archivo
  es el logotipo y se borra el anterior.
*/

export type EstadoMarca = { error?: string; ok?: string };

function refrescar() {
  revalidatePath("/", "layout");
}

export async function guardarColorAgencia(_previo: EstadoMarca, color: string): Promise<EstadoMarca> {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Elige un color válido." };
  await obtenerUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("agencias").upsert({ color: color.toLowerCase() }, { onConflict: "id" });
  if (error) return { error: "No hemos podido guardar el color. Inténtalo de nuevo." };
  refrescar();
  return { ok: "Color guardado. Lo usarán los portales que crees a partir de ahora." };
}

export async function guardarLogo(path: string): Promise<EstadoMarca> {
  const usuario = await obtenerUsuario();
  if (!path.startsWith(`${usuario.id}/`)) return { error: "Archivo no válido." };

  const anterior = (await obtenerMarca()).logoPath;
  const supabase = await createClient();
  const { error } = await supabase.from("agencias").upsert({ logo_path: path }, { onConflict: "id" });
  if (error) return { error: "No hemos podido guardar el logotipo. Inténtalo de nuevo." };

  if (anterior && anterior !== path) await supabase.storage.from("logos").remove([anterior]);
  refrescar();
  return { ok: "Logotipo guardado. Ya aparece en tus portales." };
}

export async function quitarLogo(): Promise<EstadoMarca> {
  await obtenerUsuario();
  const anterior = (await obtenerMarca()).logoPath;
  const supabase = await createClient();
  const { error } = await supabase.from("agencias").upsert({ logo_path: null }, { onConflict: "id" });
  if (error) return { error: "No hemos podido quitar el logotipo. Inténtalo de nuevo." };
  if (anterior) await supabase.storage.from("logos").remove([anterior]);
  refrescar();
  return { ok: "Logotipo quitado. Tus portales mostrarán tus iniciales." };
}
