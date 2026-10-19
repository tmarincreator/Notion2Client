import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { marcarRecuperacion } from "@/lib/recuperacion";

/*
  Destino del enlace del correo de confirmación de Supabase.
  Acepta los dos formatos que puede enviar Supabase:
  - ?code=…               (plantilla por defecto, mismo navegador del registro)
  - ?token_hash=…&type=…  (plantilla personalizada, funciona en cualquier navegador)
  Si es válido, abre la sesión y entra al dashboard (o a `siguiente`, p. ej.
  /nueva-contrasena al recuperar la contraseña).
*/

// Solo destinos conocidos: un ?siguiente= libre serviría para redirigir a cualquier sitio.
const DESTINOS = ["/dashboard", "/nueva-contrasena"];
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const siguiente = searchParams.get("siguiente");

  const supabase = await createClient();
  let usuarioId: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) usuarioId = data.user?.id ?? null;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) usuarioId = data.user?.id ?? null;
  }
  const correcto = usuarioId !== null;

  // Enlace de recuperación válido: deja elegir contraseña nueva sin la actual (solo 15 minutos).
  const esRecuperacion = type === "recovery" || siguiente === "/nueva-contrasena";
  if (usuarioId && esRecuperacion) await marcarRecuperacion(usuarioId);

  const destino = request.nextUrl.clone();
  destino.search = "";
  destino.pathname = !correcto
    ? "/auth/enlace-no-valido"
    : siguiente && DESTINOS.includes(siguiente)
      ? siguiente
      : type === "recovery"
        ? "/nueva-contrasena"
        : "/dashboard";
  return NextResponse.redirect(destino);
}
