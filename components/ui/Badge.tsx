/* Etiqueta de estado (Publicado, Borrador, En revisión, Sensible…). */

import type { TonoBadge } from "@/lib/portales/tipos";

export type { TonoBadge };

const claseTono: Record<TonoBadge, string> = {
  exito: "n2c-badge--success",
  aviso: "n2c-badge--warning",
  peligro: "n2c-badge--danger",
  marca: "n2c-badge--brand",
  borrador: "n2c-badge--draft",
  archivado: "n2c-badge--archived",
  neutro: "",
};

export function Badge({
  tono = "neutro",
  sinPunto = false,
  children,
}: {
  tono?: TonoBadge;
  /** Oculta el punto de color de la izquierda. */
  sinPunto?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={`n2c-badge ${claseTono[tono]} ${sinPunto ? "n2c-badge--plain" : ""}`.trim()}>{children}</span>
  );
}
