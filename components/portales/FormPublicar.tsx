"use client";

import { startTransition, useActionState, useState, useTransition } from "react";
import { Icono } from "@/components/ui/Icono";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import type { EstadoFormulario } from "@/app/(agencia)/portales/actions";
import { REQUISITOS_PUBLICAR, type EstadoPortal } from "@/lib/portales/tipos";
import { AvisoFormulario } from "@/components/ui/AvisoFormulario";

/* Paso 5: contraseña, comprobación final y publicar / despublicar. */
export function FormPublicar({
  id,
  slug,
  estadoPortal,
  tieneContrasena,
  pendientes,
  accionContrasena,
  accionPublicar,
  accionDespublicar,
}: {
  id: string;
  slug: string;
  estadoPortal: EstadoPortal;
  tieneContrasena: boolean;
  pendientes: string[];
  accionContrasena: (previo: EstadoFormulario, contrasena: string) => Promise<EstadoFormulario>;
  accionPublicar: (previo: EstadoFormulario) => Promise<EstadoFormulario>;
  accionDespublicar: () => Promise<EstadoFormulario>;
}) {
  const [contrasena, setContrasena] = useState("");
  // El campo solo se vacía si la contraseña se guardó: si hay un error, no hay que volver a escribirla.
  const [estadoPass, enviarPass, guardandoPass] = useActionState(async (previo: EstadoFormulario, valor: string) => {
    const resultado = await accionContrasena(previo, valor);
    if (resultado.ok) setContrasena("");
    return resultado;
  }, {});
  const [estadoPub, enviarPub, publicando] = useActionState(accionPublicar, {});
  const [estadoDespub, setEstadoDespub] = useState<EstadoFormulario>({});
  const [despublicando, iniciar] = useTransition();
  const [copiado, setCopiado] = useState(false);
  const publicado = estadoPortal === "publicado";
  const errorPass = guardandoPass ? null : (estadoPass.errores?.contrasena ?? null);

  function guardarContrasena(e: React.FormEvent) {
    e.preventDefault();
    if (guardandoPass) return;
    startTransition(() => enviarPass(contrasena));
  }

  function despublicar() {
    if (!window.confirm("¿Despublicar el portal? Tu cliente dejará de poder abrirlo hasta que lo vuelvas a publicar.")) return;
    iniciar(async () => setEstadoDespub(await accionDespublicar()));
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador no deja copiar, el enlace sigue visible en pantalla.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-4" onSubmit={guardarContrasena} noValidate>
        <AvisoFormulario error={guardandoPass ? undefined : estadoPass.error} ok={guardandoPass ? undefined : estadoPass.ok} />
        <Campo
          id="pt-pass"
          etiqueta={tieneContrasena ? "Cambiar contraseña del portal" : "Contraseña del portal"}
          error={errorPass}
          pista={tieneContrasena ? "Ya hay una contraseña guardada. Escribe otra solo si quieres cambiarla." : "Mínimo 8 caracteres."}
        >
          <CampoContrasena
            id="pt-pass"
            valor={contrasena}
            onCambio={setContrasena}
            autoComplete="new-password"
            conError={!!errorPass}
            describedBy={errorPass ? "pt-pass-err" : "pt-pass-hint"}
          />
        </Campo>
        <div className="flex justify-end">
          <Boton type="submit" variante="secundario" disabled={!contrasena} aria-busy={guardandoPass}>
            {guardandoPass ? "Guardando…" : "Guardar contraseña"}
          </Boton>
        </div>
      </form>

      <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-sunken)] p-4">
        <span className="n2c-label">Antes de publicar</span>
        <ul className="flex flex-col gap-1.5">
          {REQUISITOS_PUBLICAR.map((t) => {
            const falta = pendientes.includes(t);
            return (
              <li key={t} className="n2c-small flex items-center gap-2">
                <Icono nombre={falta ? "cruz" : "check"} style={{ color: falta ? "var(--danger-ink)" : "var(--brand-ink)" }} />
                {t}
                <span className="sr-only">{falta ? "(pendiente)" : "(hecho)"}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {publicado ? (
        <div className="flex flex-col gap-3">
          <AvisoFormulario error={despublicando ? undefined : estadoDespub.error} />
          <div className="n2c-banner" role="status">
            <Icono nombre="check" />
            <div className="n2c-banner__body">
              <strong>Portal publicado</strong>
              <span className="n2c-mono break-all">/p/{slug}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Boton variante="fantasma" disabled={despublicando} onClick={despublicar}>
              {despublicando ? "Despublicando…" : "Despublicar"}
            </Boton>
            <Boton variante="secundario" onClick={copiar}>
              <Icono nombre="copiar" />
              {copiado ? "Enlace copiado" : "Copiar enlace"}
            </Boton>
            <BotonEnlace href={`/p/${slug}`} target="_blank">
              <Icono nombre="abrir" />
              Abrir portal
            </BotonEnlace>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AvisoFormulario
            error={publicando || despublicando ? undefined : estadoPub.error}
            ok={publicando || despublicando ? undefined : estadoDespub.ok}
          />
          <div className="flex flex-wrap justify-end gap-3">
            <BotonEnlace variante="fantasma" href={`/portales/${id}?paso=4`}>Atrás</BotonEnlace>
            <BotonEnlace variante="secundario" href="/dashboard">Guardar como borrador</BotonEnlace>
            <Boton
              disabled={pendientes.length > 0 || publicando}
              aria-busy={publicando}
              onClick={() => startTransition(() => enviarPub())}
            >
              {publicando ? "Publicando…" : "Publicar portal"}
            </Boton>
          </div>
        </div>
      )}
    </div>
  );
}
