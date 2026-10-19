"use client";

import { startTransition, useActionState, useState } from "react";
import { fijarNuevaContrasena } from "@/app/auth/actions";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import { AvisoFormulario } from "@/components/ui/AvisoFormulario";
import { MarcoAcceso } from "./MarcoAcceso";

/* Último paso de la recuperación: el enlace del correo ya abrió la sesión. */
export function FormNuevaContrasena() {
  const [estado, enviar, enviando] = useActionState(fijarNuevaContrasena, {});
  const [nueva, setNueva] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  return (
    <MarcoAcceso>
      <div className="flex flex-col gap-1.5">
        <h1 className="n2c-h2">Elige una contraseña nueva</h1>
        <p className="n2c-small n2c-muted">Después entrarás directamente a tus portales.</p>
      </div>

      <AvisoFormulario error={enviando ? undefined : estado.error} />

      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (enviando) return;
          if (nueva.length < 8) {
            setErrorLocal("La contraseña necesita al menos 8 caracteres.");
            document.getElementById("nueva-pass")?.focus();
            return;
          }
          setErrorLocal(null);
          startTransition(() => enviar(nueva));
        }}
      >
        <Campo id="nueva-pass" etiqueta="Contraseña nueva" error={errorLocal} pista="Mínimo 8 caracteres.">
          <CampoContrasena
            id="nueva-pass"
            valor={nueva}
            onCambio={setNueva}
            autoComplete="new-password"
            conError={!!errorLocal}
            describedBy={errorLocal ? "nueva-pass-err" : "nueva-pass-hint"}
          />
        </Campo>
        <Boton type="submit" tamano="lg" bloque aria-busy={enviando}>
          {enviando ? "Guardando…" : "Guardar y entrar"}
        </Boton>
      </form>
    </MarcoAcceso>
  );
}
