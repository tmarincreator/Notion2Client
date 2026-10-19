"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { pedirRecuperacion } from "@/app/auth/actions";
import { Boton } from "@/components/ui/Boton";
import { Campo, Input } from "@/components/ui/Campo";
import { AvisoFormulario } from "@/components/ui/AvisoFormulario";
import { CORREO_VALIDO } from "@/lib/formato";
import { MarcoAcceso } from "./MarcoAcceso";

/* "¿Olvidaste tu contraseña?": pide el correo y Supabase envía el enlace. */
export function FormRecuperar() {
  const [estado, enviar, enviando] = useActionState(pedirRecuperacion, {});
  const [correo, setCorreo] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  return (
    <MarcoAcceso>
      <div className="flex flex-col gap-1.5">
        <h1 className="n2c-h2">Recupera tu contraseña</h1>
        <p className="n2c-small n2c-muted">Te enviaremos un enlace para elegir una nueva.</p>
      </div>

      {!enviando && (estado.aviso ? <AvisoFormulario ok={estado.aviso} /> : <AvisoFormulario error={estado.error} />)}

      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (enviando) return;
          if (!CORREO_VALIDO.test(correo.trim())) {
            setErrorLocal("Este correo no parece válido. Revisa que tenga @ y dominio.");
            document.getElementById("rec-email")?.focus();
            return;
          }
          setErrorLocal(null);
          startTransition(() => enviar(correo));
        }}
      >
        <Campo id="rec-email" etiqueta="Correo electrónico" error={errorLocal}>
          <Input
            id="rec-email"
            type="email"
            placeholder="tu@agencia.com"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            conError={!!errorLocal}
            aria-describedby={errorLocal ? "rec-email-err" : undefined}
          />
        </Campo>
        <Boton type="submit" tamano="lg" bloque aria-busy={enviando}>
          {enviando ? "Enviando…" : "Enviar enlace"}
        </Boton>
      </form>

      <p className="n2c-small n2c-muted text-center">
        ¿Ya la recuerdas? <Link className="n2c-link" href="/login">Iniciar sesión</Link>
      </p>
    </MarcoAcceso>
  );
}
