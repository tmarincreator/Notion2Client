import type { Instrumentation } from "next";

/*
  Se ejecuta una vez al arrancar el servidor: comprueba las variables de entorno.
  En producción, si falta alguna, el servidor no arranca (mejor que fallar en
  la primera visita); en desarrollo solo avisa.
*/
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;

  const { problemasDeEntorno } = await import("./lib/env");
  const problemas = problemasDeEntorno();
  if (!problemas.length) return;

  const mensaje = `Faltan variables de entorno o no son válidas:\n  - ${problemas.join("\n  - ")}\nMira .env.example.`;
  if (process.env.NODE_ENV === "production") throw new Error(mensaje);
  console.warn(`[entorno] ${mensaje}`);
}

/*
  Errores del servidor (páginas, acciones, rutas y proxy) en una sola línea JSON,
  fácil de buscar en los logs del hosting. El `digest` es el código que ve el
  usuario en la pantalla de error. Para alertas, aquí se conectaría un servicio
  como Sentry.
*/
export const onRequestError: Instrumentation.onRequestError = (error, peticion, contexto) => {
  const datos = {
    nivel: "error",
    mensaje: error instanceof Error ? error.message : String(error),
    digest: typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined,
    pila: error instanceof Error ? error.stack : undefined,
    metodo: peticion.method,
    // Sin la query: puede llevar códigos de un solo uso (?code=…).
    ruta: peticion.path.split("?")[0],
    tipo: contexto.routeType,
    archivo: contexto.routePath,
  };
  console.error(JSON.stringify(datos));
};
