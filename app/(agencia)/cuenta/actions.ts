"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuario } from "@/lib/auth";
import { urlSitio } from "@/lib/url";
import { CORREO_VALIDO } from "@/lib/formato";

/*
  Cambios en la cuenta de la agencia (Supabase Auth). Tras cada cambio se
  renueva la sesión para que el menú y los portales muestren ya el dato nuevo.
*/

export type EstadoCuenta = { error?: string; errores?: Record<string, string>; ok?: string };

function refrescar() {
  revalidatePath("/", "layout");
}

export async function cambiarNombre(_previo: EstadoCuenta, nombre: string): Promise<EstadoCuenta> {
  const agencia = nombre.trim();
  if (!agencia) return { errores: { nombre: "Escribe el nombre de tu agencia." } };
  if (agencia.length > 120) return { errores: { nombre: "Máximo 120 caracteres." } };
  await obtenerUsuario();

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { agencia } });
  if (error) return { error: "No hemos podido guardar el nombre. Inténtalo de nuevo." };
  await supabase.auth.refreshSession();
  refrescar();
  return { ok: "Nombre guardado. Tus portales ya muestran el nombre nuevo." };
}

export async function cambiarCorreo(_previo: EstadoCuenta, correo: string): Promise<EstadoCuenta> {
  const nuevo = correo.trim().toLowerCase();
  if (!CORREO_VALIDO.test(nuevo)) return { errores: { correo: "Este correo no parece válido. Revisa que tenga @ y dominio." } };
  const usuario = await obtenerUsuario();
  if (nuevo === usuario.correo.toLowerCase()) return { errores: { correo: "Es el mismo correo que ya tienes." } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser(
    { email: nuevo },
    { emailRedirectTo: `${urlSitio()}/auth/confirm` },
  );
  if (error) {
    if (error.code === "email_exists") return { errores: { correo: "Ya existe una cuenta con este correo." } };
    return { error: "No hemos podido cambiar el correo. Inténtalo de nuevo." };
  }

  // Si Supabase pide confirmación, el correo no cambia hasta abrir el enlace.
  if (data.user?.email?.toLowerCase() !== nuevo) {
    return { ok: `Te hemos enviado un enlace a ${nuevo}. El cambio se aplicará cuando lo abras.` };
  }
  await supabase.auth.refreshSession();
  refrescar();
  return { ok: "Correo actualizado." };
}

export async function cambiarContrasena(
  _previo: EstadoCuenta,
  datos: { actual: string; nueva: string },
): Promise<EstadoCuenta> {
  const errores: Record<string, string> = {};
  if (!datos.actual) errores.actual = "Escribe tu contraseña actual.";
  if (datos.nueva.length < 8) errores.nueva = "La contraseña nueva necesita al menos 8 caracteres.";
  else if (datos.nueva === datos.actual) errores.nueva = "La contraseña nueva debe ser distinta de la actual.";
  if (Object.keys(errores).length) return { errores };

  const usuario = await obtenerUsuario();
  const supabase = await createClient();
  // Comprobamos la contraseña actual antes de cambiarla.
  const { error: errorActual } = await supabase.auth.signInWithPassword({ email: usuario.correo, password: datos.actual });
  if (errorActual) return { errores: { actual: "La contraseña actual no es correcta." } };

  const { error } = await supabase.auth.updateUser({ password: datos.nueva });
  if (error) {
    if (error.code === "weak_password") return { errores: { nueva: "Esta contraseña es demasiado débil. Prueba con otra más larga." } };
    return { error: "No hemos podido cambiar la contraseña. Inténtalo de nuevo." };
  }
  return { ok: "Contraseña cambiada." };
}
