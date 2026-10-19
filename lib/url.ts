import "server-only";

/*
  Dirección pública de la web (NEXT_PUBLIC_SITE_URL), para los enlaces de los
  correos de Supabase. No se saca de las cabeceras Origin/Host de la petición:
  las puede manipular quien la envía.
*/
export function urlSitio() {
  const valor = process.env.NEXT_PUBLIC_SITE_URL;
  if (!valor) {
    if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
    throw new Error("Falta NEXT_PUBLIC_SITE_URL (p. ej. https://notion2client.com)");
  }
  return new URL(valor).origin;
}
