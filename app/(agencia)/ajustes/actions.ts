"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerMarca } from "@/lib/agencia";
import { COLOR_VALIDO } from "@/lib/formato";
import { comprobarConexion } from "@/lib/notion/bases";
import { cifrarToken } from "@/lib/notion/cifrado";
import { tokenVisible } from "@/lib/notion/cliente";

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
  if (!COLOR_VALIDO.test(color)) return { error: "Elige un color válido." };
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

/*
  Conexión con Notion: se comprueba el token contra Notion y se guarda cifrado.
  El token en claro solo pasa por aquí; nunca vuelve al navegador.
*/
export async function conectarNotion(_previo: EstadoMarca, token: string): Promise<EstadoMarca> {
  const limpio = token.trim();
  if (!/^(ntn_|secret_)[A-Za-z0-9]{20,}$/.test(limpio)) {
    return { error: "Este token no parece de Notion. Empieza por «ntn_» (o «secret_» en integraciones antiguas)." };
  }
  await obtenerUsuario();

  const conexion = await comprobarConexion(limpio);
  if (!conexion.ok) return { error: conexion.error.mensaje };

  const supabase = await createClient();
  // Función de Supabase (migración 0006): un upsert necesitaría poder leer token_cifrado.
  const { error } = await supabase.rpc("guardar_conexion_notion", {
    p_token_cifrado: cifrarToken(limpio),
    p_token_visible: tokenVisible(limpio),
    p_espacio: conexion.datos.espacio,
    p_integracion: conexion.datos.integracion,
  });
  if (error) {
    console.error("[notion] No se pudo guardar la conexión:", error);
    return { error: "No hemos podido guardar la conexión. Inténtalo de nuevo." };
  }
  refrescar();
  return { ok: `Conectado con el espacio «${conexion.datos.espacio}».` };
}

export async function desconectarNotion(): Promise<EstadoMarca> {
  const usuario = await obtenerUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("conexiones_notion").delete().eq("agencia_id", usuario.id);
  if (error) {
    console.error("[notion] No se pudo borrar la conexión:", error);
    return { error: "No hemos podido desconectar Notion. Inténtalo de nuevo." };
  }
  refrescar();
  return { ok: "Notion desconectado. Tus portales publicados dejarán de mostrar contenido hasta que lo vuelvas a conectar." };
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
