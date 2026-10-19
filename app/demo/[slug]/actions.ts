"use server";

import { concederAcceso, retirarAcceso } from "@/lib/portales/acceso";
import { CONTRASENA_DEMO, portalDemo } from "@/lib/demo";
import type { EstadoEntrada } from "@/app/p/[slug]/actions";

/*
  Acceso a los portales de demostración: misma pantalla de contraseña que un
  portal real, pero con la contraseña fija de la demo y una cookie de tipo
  "demo" que solo vale en /demo/[slug].
*/
export async function entrarDemo(slug: string, _previo: EstadoEntrada, contrasena: string): Promise<EstadoEntrada> {
  if (!contrasena) return { error: "Escribe la contraseña del portal." };
  if (!portalDemo(slug) || contrasena !== CONTRASENA_DEMO) {
    return { error: "La contraseña no es correcta. Compruébala e inténtalo de nuevo." };
  }
  await concederAcceso(slug, "demo", 0);
  return { ok: true };
}

export async function salirDemo(slug: string) {
  await retirarAcceso(slug, "demo");
}
