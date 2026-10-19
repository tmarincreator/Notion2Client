"use client";

import { startTransition, useActionState, useState } from "react";
import { Icono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import type { EstadoFormulario } from "@/app/(agencia)/portales/actions";
import type { PropiedadLeida } from "@/lib/notion/propiedades";
import { AvisoFormulario } from "@/components/ui/AvisoFormulario";

/*
  Paso 3: qué propiedades verá el cliente. Todo empieza oculto; las que
  parecen internas llevan aviso. El título siempre se muestra (es el nombre
  de cada entregable).
*/
export function FormCampos({
  id,
  accion,
  propiedades,
  visiblesIniciales,
}: {
  id: string;
  accion: (previo: EstadoFormulario, visibles: string[]) => Promise<EstadoFormulario>;
  propiedades: PropiedadLeida[];
  visiblesIniciales: string[];
}) {
  const [estado, enviarAccion, enviando] = useActionState(accion, {});
  const [visibles, setVisibles] = useState(() => new Set(visiblesIniciales));

  const titulo = propiedades.find((p) => p.tipoNotion === "title");
  const configurables = propiedades.filter((p) => p.tipoNotion !== "title" && p.tipo !== null);
  const noCompatibles = propiedades.filter((p) => p.tipo === null);
  const visiblesSensibles = configurables.filter((p) => p.sensible && visibles.has(p.id));

  function alternar(pid: string, si: boolean) {
    setVisibles((v) => {
      const nuevo = new Set(v);
      if (si) nuevo.add(pid);
      else nuevo.delete(pid);
      return nuevo;
    });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    startTransition(() => enviarAccion([...visibles]));
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={enviar}>
      <AvisoFormulario error={enviando ? undefined : estado.error} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="n2c-small n2c-muted">Los campos ocultos nunca salen del servidor: tu cliente no puede verlos de ninguna forma.</p>
        <div className="flex gap-2">
          <Boton variante="secundario" tamano="sm" onClick={() => setVisibles(new Set(configurables.map((p) => p.id)))}>
            Mostrar todos
          </Boton>
          <Boton variante="secundario" tamano="sm" onClick={() => setVisibles(new Set())}>
            Ocultar todos
          </Boton>
        </div>
      </div>

      <div className="n2c-card overflow-hidden">
        {titulo && (
          <Fila nombre={titulo.nombre} tipo={titulo.tipo}>
            <span className="n2c-small n2c-muted">Siempre visible (nombre del entregable)</span>
          </Fila>
        )}
        {configurables.map((p) => (
          <Fila key={p.id} nombre={p.nombre} tipo={p.tipo} sensible={p.sensible}>
            <label className="n2c-switch">
              <input
                type="checkbox"
                checked={visibles.has(p.id)}
                onChange={(e) => alternar(p.id, e.target.checked)}
                aria-label={`${p.nombre} visible para el cliente`}
              />
              <span className="track" />
              <span className="word on">Visible</span>
              <span className="word off">Oculto</span>
            </label>
          </Fila>
        ))}
        {noCompatibles.map((p) => (
          <Fila key={p.id} nombre={p.nombre} tipo={null}>
            <span className="n2c-small n2c-muted">Todavía no se puede mostrar ({p.tipoNotion})</span>
          </Fila>
        ))}
      </div>

      {visiblesSensibles.length > 0 && (
        <div className="n2c-banner n2c-banner--warning" role="status">
          <Icono nombre="aviso" />
          <div className="n2c-banner__body">
            <strong>Vas a mostrar campos que parecen internos</strong>
            <span>{visiblesSensibles.map((p) => p.nombre).join(", ")}. Compruébalo antes de publicar.</span>
          </div>
        </div>
      )}

      <div className="n2c-small rounded-[12px] bg-[var(--surface-sunken)] p-4">
        <strong>Tu cliente verá:</strong>{" "}
        {[titulo?.nombre, ...configurables.filter((p) => visibles.has(p.id)).map((p) => p.nombre)].filter(Boolean).join(", ")}
        {visibles.size === 0 && <span className="n2c-muted"> (solo el nombre de cada entregable)</span>}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <BotonEnlace variante="fantasma" href={`/portales/${id}?paso=2`}>Atrás</BotonEnlace>
        <Boton type="submit" aria-busy={enviando}>{enviando ? "Guardando…" : "Guardar y continuar"}</Boton>
      </div>
    </form>
  );
}

function Fila({
  nombre,
  tipo,
  sensible = false,
  children,
}: {
  nombre: string;
  tipo: string | null;
  sensible?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3 last:border-b-0">
      <span className="flex min-w-0 flex-[1_1_220px] flex-wrap items-center gap-2">
        <span className="font-semibold">{nombre}</span>
        <span className="n2c-caption n2c-muted">{tipo ?? "No compatible"}</span>
        {sensible && <Badge tono="aviso" sinPunto>Sensible</Badge>}
      </span>
      {children}
    </div>
  );
}
