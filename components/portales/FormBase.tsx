"use client";

import { startTransition, useActionState, useState } from "react";
import { Icono } from "@/components/ui/Icono";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { BotonActualizar } from "@/components/agencia/BotonActualizar";
import type { EstadoFormulario } from "@/app/(agencia)/portales/actions";
import type { BaseResumen } from "@/lib/notion/bases";
import { AvisoFormulario } from "@/components/ui/AvisoFormulario";

/* Paso 2: elegir la base de datos de Notion de la que sale el portal. */
export function FormBase({
  id,
  accion,
  bases,
  actual,
  publicado = false,
}: {
  id: string;
  accion: (previo: EstadoFormulario, fuente: string) => Promise<EstadoFormulario>;
  bases: BaseResumen[];
  actual: string | null;
  /** El portal está publicado: cambiar de base cambia al momento lo que ve el cliente. */
  publicado?: boolean;
}) {
  const [estado, enviarAccion, enviando] = useActionState(accion, {});
  const [elegida, setElegida] = useState(actual ?? "");
  const cambiaBase = !!actual && !!elegida && actual !== elegida;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (
      publicado &&
      cambiaBase &&
      !window.confirm(
        "Este portal está publicado. Al cambiar de base, tu cliente dejará de ver los campos que tenía visibles hasta que vuelvas a elegirlos en el paso 3. ¿Cambiar de base?",
      )
    ) {
      return;
    }
    startTransition(() => enviarAccion(elegida));
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={enviar}>
      <AvisoFormulario error={enviando ? undefined : estado.error} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="n2c-small n2c-muted">Solo aparecen las bases compartidas con tu integración de Notion.</p>
        <BotonActualizar texto="Actualizar lista" />
      </div>

      {bases.length === 0 ? (
        <div className="n2c-empty rounded-[12px] bg-[var(--surface-sunken)]">
          <span className="n2c-empty__icon"><Icono nombre="capas" /></span>
          <h3 className="n2c-h3">No encontramos ninguna base de datos</h3>
          <p>En Notion, abre la base que quieras usar, pulsa ••• → Conexiones y añade tu integración. Después pulsa «Actualizar lista».</p>
        </div>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Base de datos</legend>
          {bases.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3"
              style={{
                borderColor: elegida === b.id ? "var(--brand)" : "var(--border)",
                background: elegida === b.id ? "var(--brand-soft)" : undefined,
              }}
            >
              <input type="radio" name="base" value={b.id} checked={elegida === b.id} onChange={() => setElegida(b.id)} />
              <Icono nombre="capas" style={{ color: "var(--ink-muted)" }} />
              <span className="min-w-0 flex-1 truncate font-semibold">{b.nombre}</span>
              {actual === b.id && <span className="n2c-caption n2c-muted">Elegida</span>}
            </label>
          ))}
        </fieldset>
      )}

      {cambiaBase &&
        (publicado ? (
          <div className="n2c-banner n2c-banner--warning" role="status">
            <Icono nombre="aviso" />
            <div className="n2c-banner__body">
              <strong>Este portal está publicado</strong>
              <span>Si cambias de base, tu cliente verá al momento solo el nombre de cada entregable, hasta que vuelvas a elegir los campos visibles en el paso 3.</span>
            </div>
          </div>
        ) : (
          <p className="n2c-small n2c-muted">Al cambiar de base tendrás que volver a elegir los campos visibles.</p>
        ))}

      <div className="flex flex-wrap justify-end gap-3">
        <BotonEnlace variante="fantasma" href={`/portales/${id}?paso=1`}>Atrás</BotonEnlace>
        <Boton type="submit" disabled={!elegida} aria-busy={enviando}>
          {enviando ? "Comprobando acceso…" : "Guardar y continuar"}
        </Boton>
      </div>
    </form>
  );
}
