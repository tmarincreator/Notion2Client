import "server-only";
import { createClient } from "@/lib/supabase/server";
import { descifrarToken } from "./cifrado";

/*
  Conexión con Notion de cada agencia (tabla `conexiones_notion`).
  El token cifrado solo se lee con funciones de Supabase y se descifra aquí,
  en el servidor. null = la agencia todavía no ha conectado Notion.
*/

export type ConexionGuardada = { espacio: string; integracion: string; tokenVisible: string };

/** Datos de la conexión guardada, sin llamar a Notion (para mostrar el estado). */
export async function conexionAgencia(): Promise<ConexionGuardada | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("conexiones_notion").select("espacio, integracion, token_visible").maybeSingle();
  return data ? { espacio: data.espacio, integracion: data.integracion, tokenVisible: data.token_visible } : null;
}

/** Token de la agencia con sesión. */
export async function tokenAgencia() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("token_notion_agencia");
  return typeof data === "string" ? descifrarToken(data) : null;
}

/** Token de la agencia dueña de un portal publicado (para el cliente, sin sesión). */
export async function tokenPortal(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("token_notion_portal", { p_slug: slug });
  return typeof data === "string" ? descifrarToken(data) : null;
}
