/*
  Color de marca de la agencia aplicado a una zona (variables CSS --accent…).
  El texto encima (--on-accent) es blanco u oscuro según cuál contraste más
  (fórmula de contraste de WCAG 2), para que un color claro no deje los
  botones ilegibles.
*/

const TINTA = "#11161b";
const BLANCO = "#ffffff";

function luminancia(hex: string) {
  const canal = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

export function contraste(a: string, b: string) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Blanco u oscuro: el que más contraste tenga sobre `fondo` (#rrggbb). */
export function textoSobre(fondo: string) {
  return contraste(fondo, BLANCO) >= contraste(fondo, TINTA) ? BLANCO : TINTA;
}

/** Estilo para un contenedor que usa el color de la agencia. */
export function estiloAcento(color: string) {
  return { "--accent": color, "--accent-hover": color, "--on-accent": textoSobre(color) } as React.CSSProperties;
}
