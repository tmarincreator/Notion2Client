import "server-only";
import { Client } from "@notionhq/client";

/*
  Cliente de Notion para el servidor. Cada agencia usa su propio token
  (guardado cifrado en Supabase, ver conexion.ts), así que solo puede leer
  las bases que ella misma ha compartido con su integración.
  El token nunca debe llegar al navegador: por eso este archivo es "server-only".
*/

export class NotionSinTokenError extends Error {
  constructor() {
    super("La agencia no ha conectado Notion");
    this.name = "NotionSinTokenError";
  }
}

export function getNotionClient(token: string | null) {
  if (!token) throw new NotionSinTokenError();
  // El SDK ya reintenta solo ante límites de uso (429) y caídas temporales (5xx).
  return new Client({ auth: token, timeoutMs: 15_000 });
}

/** Principio y final del token, para mostrar en Ajustes sin exponerlo. */
export function tokenVisible(token: string) {
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
}
