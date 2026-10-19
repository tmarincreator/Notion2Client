import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inicialesDe } from "@/lib/formato";

export type Usuario = { id: string; nombre: string; correo: string; iniciales: string };

/*
  Usuario de la sesión actual. Úsalo siempre desde el servidor: valida el
  token (getClaims) y, si no hay sesión, manda al login.
  Lee cookies, así que quien lo use debe estar dentro de un <Suspense>.
*/
export const obtenerUsuario = cache(async (): Promise<Usuario> => {
  // getClaims usa Date.now() para ver si el token caducó: solo en tiempo de petición.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");

  const correo = claims.email ?? "";
  const nombre = (claims.user_metadata?.agencia as string | undefined)?.trim() || correo;

  return { id: claims.sub, nombre, correo, iniciales: inicialesDe(nombre) };
});
