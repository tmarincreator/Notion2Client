import { createBrowserClient } from "@supabase/ssr";

/*
  Cliente de Supabase para componentes de cliente ("use client").
  La sesión vive en cookies, así que el servidor ve la misma sesión.
*/
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
