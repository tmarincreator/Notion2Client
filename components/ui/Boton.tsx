import Link from "next/link";

/*
  Botón del sistema de diseño.
  - <Boton> es un <button> (acciones: enviar, copiar, restaurar…).
  - <BotonEnlace> es un enlace con aspecto de botón (navegar a otra pantalla).
*/

type Variante = "primario" | "secundario" | "fantasma";
type Tamano = "sm" | "md" | "lg" | "icono";

type Estilo = {
  variante?: Variante;
  tamano?: Tamano;
  bloque?: boolean;
  className?: string;
};

const claseVariante: Record<Variante, string> = {
  primario: "n2c-btn--primary",
  secundario: "n2c-btn--secondary",
  fantasma: "n2c-btn--ghost",
};

const claseTamano: Record<Tamano, string> = {
  sm: "n2c-btn--sm",
  md: "",
  lg: "n2c-btn--lg",
  icono: "icon-btn",
};

export function clasesBoton({ variante = "primario", tamano = "md", bloque = false, className = "" }: Estilo) {
  return ["n2c-btn", claseVariante[variante], claseTamano[tamano], bloque ? "n2c-btn--block" : "", className]
    .filter(Boolean)
    .join(" ");
}

export function Boton({
  variante,
  tamano,
  bloque,
  className,
  type = "button",
  ...resto
}: Estilo & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  // suppressHydrationWarning: algunas extensiones del navegador (autorrelleno) añaden
  // atributos como fdprocessedid a los botones antes de que cargue React.
  return <button type={type} className={clasesBoton({ variante, tamano, bloque, className })} suppressHydrationWarning {...resto} />;
}

export function BotonEnlace({
  variante,
  tamano,
  bloque,
  className,
  ...resto
}: Estilo & React.ComponentProps<typeof Link>) {
  return <Link className={clasesBoton({ variante, tamano, bloque, className })} {...resto} />;
}
