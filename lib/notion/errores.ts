import "server-only";
import { APIErrorCode, ClientErrorCode, isNotionClientError } from "@notionhq/client";
import { NotionSinTokenError } from "./cliente";

/*
  Traduce cualquier fallo de Notion a un mensaje comprensible para la agencia.
  "reintentable" indica si tiene sentido mostrar el botón "Volver a intentar".
*/

export type ErrorNotion = {
  tipo: "sin-token" | "token-invalido" | "sin-acceso" | "no-encontrado" | "temporal" | "desconocido";
  mensaje: string;
  reintentable: boolean;
};

export function traducirErrorNotion(error: unknown): ErrorNotion {
  if (error instanceof NotionSinTokenError) {
    return { tipo: "sin-token", mensaje: "Notion todavía no está conectado.", reintentable: false };
  }

  if (isNotionClientError(error)) {
    switch (error.code) {
      case APIErrorCode.Unauthorized:
        return { tipo: "token-invalido", mensaje: "La credencial de Notion no es válida o ha caducado.", reintentable: false };
      case APIErrorCode.RestrictedResource:
        return { tipo: "sin-acceso", mensaje: "La integración no tiene permiso para leer este contenido. Compártelo con ella desde Notion (••• → Conexiones).", reintentable: false };
      case APIErrorCode.ObjectNotFound:
        return { tipo: "no-encontrado", mensaje: "No encontramos esta base de datos. Puede que se haya borrado o que ya no esté compartida con la integración.", reintentable: false };
      case APIErrorCode.RateLimited:
      case APIErrorCode.InternalServerError:
      case APIErrorCode.ServiceOverload:
      case APIErrorCode.ServiceUnavailable:
      case APIErrorCode.GatewayTimeout:
      case ClientErrorCode.RequestTimeout:
        return { tipo: "temporal", mensaje: "Notion no responde ahora mismo. Inténtalo de nuevo en unos segundos.", reintentable: true };
    }
  }

  console.error("[notion] Error no controlado:", error);
  return { tipo: "desconocido", mensaje: "No hemos podido comunicarnos con Notion.", reintentable: true };
}

export type ResultadoNotion<T> = { ok: true; datos: T } | { ok: false; error: ErrorNotion };

/** Ejecuta una llamada a Notion y devuelve el resultado o el error ya traducido. */
export async function conNotion<T>(fn: () => Promise<T>): Promise<ResultadoNotion<T>> {
  try {
    return { ok: true, datos: await fn() };
  } catch (error) {
    return { ok: false, error: traducirErrorNotion(error) };
  }
}
