import Link from "next/link";
import { Icono } from "@/components/ui/Icono";

export const PASOS = [
  "Datos del cliente",
  "Base de Notion",
  "Campos visibles",
  "Marca y vista previa",
  "Contraseña y publicación",
] as const;

/*
  Indicador de pasos del asistente. Con `id` (portal ya creado) cada paso es un
  enlace; en "Nuevo portal" solo existe el paso 1.
*/
export function Pasos({ actual, id, completos = [] }: { actual: number; id?: string; completos?: number[] }) {
  return (
    <nav aria-label="Pasos para crear el portal">
      <ol className="flex flex-wrap gap-2">
        {PASOS.map((texto, i) => {
          const n = i + 1;
          const activo = n === actual;
          const hecho = completos.includes(n);
          const contenido = (
            <>
              <span
                className="grid size-6 flex-none place-items-center rounded-full text-xs font-bold"
                style={{
                  background: activo ? "var(--brand)" : hecho ? "var(--brand-soft)" : "var(--surface-sunken)",
                  color: activo ? "var(--on-brand)" : hecho ? "var(--brand-ink)" : "var(--ink-muted)",
                }}
              >
                {hecho && !activo ? <Icono nombre="check" /> : n}
              </span>
              <span className={activo ? "font-semibold" : "n2c-muted"}>{texto}</span>
            </>
          );
          const clases = "n2c-small flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pr-3 pl-1";
          return (
            <li key={texto}>
              {id && !activo ? (
                <Link href={`/portales/${id}?paso=${n}`} className={`${clases} hover:bg-[var(--surface-sunken)]`}>
                  {contenido}
                </Link>
              ) : (
                <span className={clases} aria-current={activo ? "step" : undefined}>{contenido}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
