"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { urlSitio } from "@/lib/url";
import { CORREO_VALIDO } from "@/lib/formato";
import { borrarRecuperacion, recuperacionValida } from "@/lib/recuperacion";

export type DatosAcceso = { correo: string; contrasena: string; agencia?: string };
/** `aviso`: mensaje positivo (p. ej. "revisa tu correo") en lugar de un error. */
export type EstadoAcceso = { error?: string; aviso?: string };

// Mensajes en español para los códigos de error de Supabase Auth.
const MENSAJES: Record<string, string> = {
  invalid_credentials: "El correo o la contraseña no son correctos. Compruébalos e inténtalo de nuevo.",
  email_not_confirmed: "Todavía no has confirmado tu correo. Abre el enlace que te enviamos al crear la cuenta.",
  user_already_exists: "Ya existe una cuenta con este correo. Inicia sesión.",
  email_exists: "Ya existe una cuenta con este correo. Inicia sesión.",
  weak_password: "Esta contraseña es demasiado débil. Prueba con otra más larga.",
  email_address_invalid: "Este correo no parece válido. Revisa que tenga @ y dominio.",
  signup_disabled: "El registro de cuentas nuevas está cerrado ahora mismo.",
  over_request_rate_limit: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  over_email_send_rate_limit: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  same_password: "La contraseña nueva debe ser distinta de la anterior.",
};

const mensajeDe = (error: AuthError) =>
  (error.code && MENSAJES[error.code]) || "No hemos podido completar la operación. Inténtalo de nuevo.";

// Validación mínima en el servidor: nunca confiamos solo en la del navegador.
function datosValidos({ correo, contrasena }: DatosAcceso) {
  return CORREO_VALIDO.test(correo) && contrasena.length > 0;
}

export async function iniciarSesion(_previo: EstadoAcceso, datos: DatosAcceso): Promise<EstadoAcceso> {
  if (!datosValidos(datos)) return { error: MENSAJES.invalid_credentials };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: datos.correo.trim(),
    password: datos.contrasena,
  });
  if (error) return { error: mensajeDe(error) };

  redirect("/dashboard");
}

export async function registrarse(_previo: EstadoAcceso, datos: DatosAcceso): Promise<EstadoAcceso> {
  const agencia = datos.agencia?.trim() ?? "";
  if (!datosValidos(datos) || !agencia || datos.contrasena.length < 8) {
    return { error: "Revisa los datos del formulario e inténtalo de nuevo." };
  }

  // El enlace del correo de confirmación vuelve a /auth/confirm de esta misma web.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: datos.correo.trim(),
    password: datos.contrasena,
    options: { data: { agencia }, emailRedirectTo: `${urlSitio()}/auth/confirm` },
  });
  // Al volver a pulsar "Crear cuenta", Supabase no reenvía el correo tan seguido:
  // la cuenta ya existe y el correo ya está enviado.
  if (error?.code === "over_email_send_rate_limit") {
    return {
      aviso: `Ya te hemos enviado un correo de confirmación a ${datos.correo.trim()}. Revisa tu bandeja de entrada y la carpeta de spam.`,
    };
  }
  if (error) return { error: mensajeDe(error) };

  // Con la confirmación por correo activada en Supabase no hay sesión hasta confirmar.
  // Supabase tampoco avisa si el correo ya existe: el mensaje vale para ambos casos.
  if (!data.session) {
    return { aviso: `Te hemos enviado un correo a ${datos.correo.trim()}. Abre el enlace para confirmar tu cuenta y entrar.` };
  }

  redirect("/dashboard");
}

/*
  Recuperar la contraseña: Supabase envía un enlace que pasa por /auth/confirm
  y abre /nueva-contrasena con una sesión temporal.
  La respuesta es la misma exista o no la cuenta, para no revelar qué correos están registrados.
*/
export async function pedirRecuperacion(_previo: EstadoAcceso, correo: string): Promise<EstadoAcceso> {
  const limpio = correo.trim();
  if (!CORREO_VALIDO.test(limpio)) return { error: "Este correo no parece válido. Revisa que tenga @ y dominio." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(limpio, {
    redirectTo: `${urlSitio()}/auth/confirm?siguiente=/nueva-contrasena`,
  });
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { error: mensajeDe(error) };
  }
  if (error) console.error("[auth] No se pudo enviar el correo de recuperación:", error);
  return {
    aviso: `Si hay una cuenta con ${limpio}, te hemos enviado un enlace para elegir una contraseña nueva. Revisa también la carpeta de spam.`,
  };
}

const ENLACE_CADUCADO = "El enlace ha caducado. Pide otro desde «¿Olvidaste tu contraseña?».";

/*
  Solo con una sesión abierta desde un enlace de recuperación del correo
  (lib/recuperacion.ts): una sesión cualquiera no basta para cambiar la
  contraseña sin la actual. Para eso está Cuenta, que pide la actual.
*/
export async function fijarNuevaContrasena(_previo: EstadoAcceso, nueva: string): Promise<EstadoAcceso> {
  if (nueva.length < 8) return { error: "La contraseña necesita al menos 8 caracteres." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims || !(await recuperacionValida(data.claims.sub))) return { error: ENLACE_CADUCADO };

  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) return { error: mensajeDe(error) };
  await borrarRecuperacion();
  redirect("/dashboard");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
