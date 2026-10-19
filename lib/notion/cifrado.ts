import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/*
  Cifrado de los tokens de Notion antes de guardarlos en Supabase.
  AES-256-GCM con NOTION_TOKEN_KEY (32 bytes en base64), que solo tiene el
  servidor. Formato guardado: "v1.<iv>.<etiqueta>.<cifrado>" en base64url.
*/

function clave() {
  const valor = process.env.NOTION_TOKEN_KEY;
  const bytes = valor ? Buffer.from(valor, "base64") : null;
  if (!bytes || bytes.length !== 32) {
    throw new Error("Falta NOTION_TOKEN_KEY (32 bytes en base64) en .env.local");
  }
  return bytes;
}

export function cifrarToken(token: string) {
  const iv = randomBytes(12);
  const cifrador = createCipheriv("aes-256-gcm", clave(), iv);
  const cifrado = Buffer.concat([cifrador.update(token, "utf8"), cifrador.final()]);
  return ["v1", iv, cifrador.getAuthTag(), cifrado].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

/** null si el texto no es válido o se cifró con otra clave. */
export function descifrarToken(texto: string): string | null {
  const [version, iv, etiqueta, cifrado] = texto.split(".");
  if (version !== "v1" || !iv || !etiqueta || !cifrado) return null;
  try {
    const descifrador = createDecipheriv("aes-256-gcm", clave(), Buffer.from(iv, "base64url"));
    descifrador.setAuthTag(Buffer.from(etiqueta, "base64url"));
    return Buffer.concat([descifrador.update(Buffer.from(cifrado, "base64url")), descifrador.final()]).toString("utf8");
  } catch {
    return null;
  }
}
