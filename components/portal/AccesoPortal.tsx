"use client";

import { startTransition, useActionState, useEffect, useState, useRef } from "react";
import { useEnfocarError } from "@/components/ui/useEnfocarError";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/ui/Icono";
import { LogoAgencia } from "@/components/ui/Logo";
import { estiloAcento } from "@/lib/color";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import type { EstadoEntrada } from "@/app/p/[slug]/actions";

export type CabeceraPortal = {
  nombre: string;
  cliente: string;
  color: string;
  agencia: { nombre: string; iniciales: string; logo: string | null };
};

/*
  Pantalla de contraseña que ve el cliente antes de entrar a su portal.
  La comprobación la hace el servidor (`accion`, del portal real o de la
  demo); hasta entonces el navegador no recibe ningún dato del proyecto.
*/
export function AccesoPortal({
  cabecera,
  accion,
  pistaDemo,
}: {
  cabecera: CabeceraPortal;
  accion: (previo: EstadoEntrada, contrasena: string) => Promise<EstadoEntrada>;
  /** Solo en la demo: la contraseña que hay que escribir. */
  pistaDemo?: string;
}) {
  const router = useRouter();
  const [estado, enviarAccion, enviando] = useActionState(accion, {});
  const formulario = useRef<HTMLFormElement>(null);
  useEnfocarError(formulario, estado);
  const [contrasena, setContrasena] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const error = errorLocal ?? (enviando ? null : (estado.error ?? null));

  // Contraseña correcta: el servidor ya puso la cookie, pedimos la página con los datos.
  useEffect(() => {
    if (estado.ok) router.refresh();
  }, [estado, router]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (!contrasena) {
      setErrorLocal("Escribe la contraseña del portal.");
      return;
    }
    setErrorLocal(null);
    startTransition(() => enviarAccion(contrasena));
  }

  const estilo = estiloAcento(cabecera.color);

  return (
    <div style={estilo} className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-[72px]">
      <div className="n2c-card flex w-full max-w-[400px] flex-col gap-6 p-6 shadow-[var(--shadow-md)] sm:p-8">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <LogoAgencia iniciales={cabecera.agencia.iniciales} logoUrl={cabecera.agencia.logo} grande />
          <div className="flex flex-col gap-1">
            <span className="n2c-label n2c-muted">{cabecera.agencia.nombre}</span>
            <h1 className="n2c-h2">{cabecera.nombre} · {cabecera.cliente}</h1>
          </div>
          <p className="n2c-small n2c-muted">Este portal es privado. Introduce la contraseña que te ha enviado tu contacto.</p>
        </div>

        <form ref={formulario} className="flex flex-col gap-4" onSubmit={enviar} noValidate>
          <Campo id="cp-pass" etiqueta="Contraseña" error={error}>
            <CampoContrasena
              id="cp-pass"
              valor={contrasena}
              onCambio={(v) => {
                setContrasena(v);
                setErrorLocal(null);
              }}
              autoComplete="current-password"
              conError={!!error}
              describedBy={error ? "cp-pass-err" : undefined}
            />
          </Campo>
          <Boton type="submit" tamano="lg" bloque aria-busy={enviando || !!estado.ok}>
            {enviando || estado.ok ? "Entrando…" : "Entrar al portal"}
          </Boton>
        </form>
      </div>

      <p className="n2c-small n2c-muted flex items-center gap-2 text-center">
        <Icono nombre="candado" />
        ¿No tienes la contraseña? Pídesela a tu contacto en {cabecera.agencia.nombre}.
      </p>

      {pistaDemo && (
        <p className="n2c-caption n2c-muted rounded-[10px] border border-dashed border-[var(--border-control)] px-3 py-2 text-center">
          Modo demostración: la contraseña es <span className="n2c-mono">{pistaDemo}</span>
        </p>
      )}
    </div>
  );
}
