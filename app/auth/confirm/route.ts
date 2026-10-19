import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
  Destino del enlace del correo de confirmación de Supabase.
  Acepta los dos formatos que puede enviar Supabase:
  - ?code=…               (plantilla por defecto, mismo navegador del registro)
  - ?token_hash=…&type=…  (plantilla personalizada, funciona en cualquier navegador)
  Si es válido, abre la sesión y entra al dashboard.
*/
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let correcto = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    correcto = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    correcto = !error;
  }

  const destino = request.nextUrl.clone();
  destino.search = "";
  destino.pathname = correcto ? "/dashboard" : "/auth/enlace-no-valido";
  return NextResponse.redirect(destino);
}
