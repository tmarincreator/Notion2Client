import { forwardRef } from "react";
import { Icono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";
import type { EntregablePortal, EstadoEntregable } from "@/lib/portales/tipos";

export function BadgeEntregable({ estado }: { estado: EstadoEntregable | null }) {
  if (!estado) return null;
  return <Badge tono={estado.tono}>{estado.texto}</Badge>;
}

/* Panel lateral con el detalle del entregable seleccionado y sus enlaces. */
export const DetalleEntregable = forwardRef<HTMLElement, { entregable: EntregablePortal; etiquetaFecha: string | null }>(
  function DetalleEntregable({ entregable: e, etiquetaFecha }, ref) {
    // Los textos largos (descripciones) van como párrafo; los cortos, en la cuadrícula.
    const cortos = e.campos.filter((c) => c.valor.length <= 40);
    const largos = e.campos.filter((c) => c.valor.length > 40);

    return (
      <aside
        ref={ref}
        className="n2c-card flex min-w-0 flex-[1_1_320px] scroll-mt-4 flex-col gap-5 p-6"
        aria-label="Detalle del entregable"
      >
        <div className="flex flex-col items-start gap-2.5">
          <BadgeEntregable estado={e.estado} />
          <h2 className="n2c-h2">{e.titulo}</h2>
        </div>

        {(e.fecha || cortos.length > 0) && (
          <dl className="grid grid-cols-2 gap-3">
            {e.fecha && (
              <div>
                <dt className="n2c-caption n2c-muted">{etiquetaFecha ?? "Fecha"}</dt>
                <dd className="font-semibold">{e.fecha}</dd>
              </div>
            )}
            {cortos.map((c) => (
              <div key={c.nombre}>
                <dt className="n2c-caption n2c-muted">{c.nombre}</dt>
                <dd className="font-semibold break-words">{c.valor}</dd>
              </div>
            ))}
          </dl>
        )}

        {largos.map((c) => (
          <div key={c.nombre} className="flex flex-col gap-1">
            <span className="n2c-caption n2c-muted">{c.nombre}</span>
            <p className="text-[var(--ink-muted)]">{c.valor}</p>
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <span className="n2c-label">Archivos y enlaces</span>
          {e.enlaces.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {e.enlaces.map((f) => (
                <li key={f.url}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-[10px] border border-[var(--border)] px-3 py-2.5 text-sm font-semibold hover:bg-[var(--surface-sunken)]"
                  >
                    <Icono nombre="archivo" style={{ color: "var(--ink-muted)" }} />
                    <span className="min-w-0 flex-1 truncate">{f.nombre}</span>
                    <Icono nombre="abrir" style={{ color: "var(--ink-muted)" }} />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="n2c-small n2c-muted rounded-[10px] bg-[var(--surface-sunken)] p-3">
              Todavía no hay archivos. Aparecerán aquí cuando estén listos.
            </p>
          )}
        </div>
      </aside>
    );
  },
);
