"use server";

import { createClient } from "@/lib/supabase/server";
import { concederAcceso, retirarAcceso } from "@/lib/portales/acceso";
import { buscarPortalCliente, CONTRASENA_DEMO } from "@/lib/sample-data";

export type EstadoEntrada = { error?: string; ok?: boolean };

type Intento = { resultado: "ok" | "incorrecta" | "bloqueado"; segundos_restantes: number; acceso_version: number };

/*
  El cliente escribe la contraseña: Supabase la compara con el hash y lleva la
  cuenta de fallos (5 seguidos bloquean el portal 5 minutos). Si es correcta,
  se da la cookie de acceso.
*/
export async function entrarPortal(slug: string, _previo: EstadoEntrada, contrasena: string): Promise<EstadoEntrada> {
  if (!contrasena) return { error: "Escribe la contraseña del portal." };

  const supabase = await createClient();
  const { data } = await supabase.rpc("intentar_acceso_portal", { p_slug: slug, p_contrasena: contrasena });
  const intento = (data as Intento[] | null)?.[0];

  if (intento?.resultado === "bloqueado") {
    const minutos = Math.max(1, Math.ceil(intento.segundos_restantes / 60));
    return {
      error: `Demasiados intentos fallidos. Por seguridad, el acceso está bloqueado. Vuelve a intentarlo en ${minutos} ${minutos === 1 ? "minuto" : "minutos"}.`,
    };
  }

  if (intento?.resultado === "ok") {
    await concederAcceso(slug, "portal", intento.acceso_version);
    return { ok: true };
  }

  // Portales de demostración de la landing (no están en Supabase). Su cookie
  // es de tipo "demo": no abre ningún portal real aunque comparta enlace.
  if (buscarPortalCliente(slug) && contrasena === CONTRASENA_DEMO) {
    await concederAcceso(slug, "demo", 0);
    return { ok: true };
  }

  // Pequeña espera para frenar a quien pruebe contraseñas en bucle.
  await new Promise((r) => setTimeout(r, 600));
  return { error: "La contraseña no es correcta. Compruébala e inténtalo de nuevo." };
}

export async function salirPortal(slug: string) {
  await retirarAcceso(slug);
}
