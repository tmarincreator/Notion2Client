import "server-only";
import { Client } from "@notionhq/client";

/*
  Cliente de Notion para el servidor.
  De momento usa un único token (NOTION_TOKEN en .env.local). Más adelante cada
  agencia guardará el suyo cifrado en Supabase y se pasará aquí como parámetro.
  El token nunca debe llegar al navegador: por eso este archivo es "server-only".
*/

export class NotionSinTokenError extends Error {
  constructor() {
    super("Falta NOTION_TOKEN en .env.local");
    this.name = "NotionSinTokenError";
  }
}

let cliente: Client | null = null;

export function getNotionClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new NotionSinTokenError();

  // El SDK ya reintenta solo ante límites de uso (429) y caídas temporales (5xx).
  cliente ??= new Client({ auth: token, timeoutMs: 15_000 });
  return cliente;
}

/** Últimos caracteres del token, para mostrar en Ajustes sin exponerlo. */
export function tokenVisible() {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
}
