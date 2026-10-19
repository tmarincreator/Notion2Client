import "server-only";
import { createClient } from "@supabase/supabase-js";

/*
  Cliente de Supabase con la clave secreta (service_role), solo para el servidor.
  Se salta RLS, así que úsalo únicamente para llamar a las funciones que la
  clave pública no puede ejecutar (comprobar la contraseña de un portal y leer
  su token de Notion). Nunca para consultar tablas.
*/
export function createAdminClient() {
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SECRET_KEY en .env.local");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
