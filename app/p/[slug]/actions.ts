"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { concederAcceso, origenCliente, retirarAcceso } from "@/lib/portales/acceso";

export type EstadoEntrada = { error?: string; ok?: boolean };

type Intento = { resultado: "ok" | "incorrecta" | "bloqueado"; segundos_restantes: number; acceso_version: number };

/*
  El cliente escribe la contraseña: Supabase la compara con el hash y lleva la
  cuenta de fallos (5 seguidos desde una IP bloquean esa IP 5 minutos; 100 en
  una hora bloquean el portal 15). Si es correcta, se da la cookie de acceso.
  La función solo la puede llamar el servidor: así nadie se inventa su IP.
*/
export async function entrarPortal(slug: string, _previo: EstadoEntrada, contrasena: string): Promise<EstadoEntrada> {
  if (!contrasena) return { error: "Escribe la contraseña del portal." };

  const { data, error } = await createAdminClient().rpc("intentar_acceso_portal", {
    p_slug: slug,
    p_contrasena: contrasena,
    p_origen: await origenCliente(),
  });
  if (error) console.error("[portal] No se pudo comprobar la contraseña:", error);
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

  // Pequeña espera para frenar a quien pruebe contraseñas en bucle.
  await new Promise((r) => setTimeout(r, 600));
  return { error: "La contraseña no es correcta. Compruébala e inténtalo de nuevo." };
}

export async function salirPortal(slug: string) {
  await retirarAcceso(slug, "portal");
}
