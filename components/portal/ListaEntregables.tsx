"use client";

import { useRef, useState } from "react";
import type { EntregablePortal } from "@/lib/portales/tipos";
import { BadgeEntregable, DetalleEntregable } from "./DetalleEntregable";

/*
  Lista de entregables y panel con el detalle del seleccionado. Al abrir, se
  selecciona el primero pendiente de revisión (lo que más le interesa al cliente).
*/
export function ListaEntregables({ entregables, etiquetaFecha }: { entregables: EntregablePortal[]; etiquetaFecha: string | null }) {
  const [seleccionado, setSeleccionado] = useState((entregables.find((e) => e.estado?.enRevision) ?? entregables[0]).id);
  const detalle = useRef<HTMLElement>(null);
  const sel = entregables.find((e) => e.id === seleccionado) ?? entregables[0];

  function elegir(id: string) {
    setSeleccionado(id);
    // En móvil el detalle queda debajo de la lista: lo acercamos a la vista.
    if (window.innerWidth < 860) {
      const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detalle.current?.scrollIntoView({ behavior: sinMovimiento ? "auto" : "smooth", block: "start" });
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-6">
      <section className="n2c-card min-w-0 flex-[999_1_480px] overflow-hidden" aria-labelledby="h-entregables">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-[18px]">
          <h2 className="n2c-h3" id="h-entregables">Entregables</h2>
          <span className="n2c-caption n2c-muted">{entregables.length} elementos</span>
        </div>
        <ul>
          {entregables.map((e) => (
            <li key={e.id} className="border-b border-[var(--border)] last:border-b-0">
              <button
                type="button"
                className="row-btn flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                style={e.id === sel.id ? { background: "var(--surface-sunken)" } : undefined}
                aria-pressed={e.id === sel.id}
                onClick={() => elegir(e.id)}
              >
                <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{e.titulo}</span>
                  {e.fecha && <span className="n2c-small n2c-muted">{etiquetaFecha ?? "Fecha"}: {e.fecha}</span>}
                </span>
                <BadgeEntregable estado={e.estado} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <DetalleEntregable ref={detalle} entregable={sel} etiquetaFecha={etiquetaFecha} />
    </div>
  );
}
