import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COLOR_POR_DEFECTO } from "@/lib/portales/tipos";

/*
  Marca de la agencia (tabla `agencias` + bucket "logos" de Supabase Storage).
  Si la agencia aún no la ha configurado, se usan el color por defecto y sus iniciales.
*/

export type MarcaAgencia = { color: string; logoPath: string | null; logoUrl: string | null };

/** URL pública del logotipo (el bucket es público para que lo vean los clientes). */
export function urlLogo(path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${path}`;
}

export async function obtenerMarca(): Promise<MarcaAgencia> {
  // Supabase usa la hora actual (caducidad de la sesión): solo en tiempo de petición.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.from("agencias").select("color, logo_path").maybeSingle();
  return {
    color: data?.color ?? COLOR_POR_DEFECTO,
    logoPath: data?.logo_path ?? null,
    logoUrl: urlLogo(data?.logo_path ?? null),
  };
}
