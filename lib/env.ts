/*
  Comprobación de las variables de entorno al arrancar el servidor
  (instrumentation.ts). Mejor un error claro al desplegar que un 500 en la
  primera visita. La lista completa, con ejemplos, está en .env.example.
*/

type Regla = { nombre: string; valida: (valor: string) => boolean; ayuda: string; soloProduccion?: boolean };

const esUrl = (valor: string) => {
  try {
    return ["http:", "https:"].includes(new URL(valor).protocol);
  } catch {
    return false;
  }
};

const REGLAS: Regla[] = [
  { nombre: "NEXT_PUBLIC_SUPABASE_URL", valida: esUrl, ayuda: "URL del proyecto de Supabase" },
  { nombre: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", valida: Boolean, ayuda: "clave pública de Supabase" },
  { nombre: "SUPABASE_SECRET_KEY", valida: Boolean, ayuda: "clave secreta de Supabase (solo servidor)" },
  { nombre: "PORTAL_SECRET", valida: (v) => v.length >= 32, ayuda: "al menos 32 caracteres aleatorios" },
  {
    nombre: "NOTION_TOKEN_KEY",
    valida: (v) => Buffer.from(v, "base64").length === 32,
    ayuda: "32 bytes en base64 (cifra los tokens de Notion)",
  },
  { nombre: "NEXT_PUBLIC_SITE_URL", valida: esUrl, ayuda: "dirección pública de la web", soloProduccion: true },
];

/** Variables que faltan o no tienen el formato esperado, con una pista para cada una. */
export function problemasDeEntorno(entorno: Record<string, string | undefined> = process.env) {
  const produccion = entorno.NODE_ENV === "production";
  return REGLAS.filter((r) => produccion || !r.soloProduccion)
    .filter((r) => {
      const valor = entorno[r.nombre];
      return !valor || !r.valida(valor);
    })
    .map((r) => `${r.nombre} (${r.ayuda})`);
}
