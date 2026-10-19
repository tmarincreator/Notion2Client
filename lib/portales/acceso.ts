import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/*
  Acceso del cliente a un portal: tras escribir la contraseña correcta se guarda
  una cookie httpOnly firmada con PORTAL_SECRET. El navegador no puede leerla
  ni falsificarla, y los datos de Notion solo se envían si es válida.
  El tipo ("portal" o "demo") va firmado: una cookie de la demo nunca abre un
  portal real aunque compartan enlace. También va firmada la versión de acceso
  del portal, que sube al cambiar la contraseña o despublicarlo (migración 0007):
  las cookies anteriores dejan de valer al momento. La demo usa la versión 0.
*/

const DURACION_SEGUNDOS = 8 * 60 * 60;

export type TipoAcceso = "portal" | "demo";

const nombreCookie = (slug: string) => `n2c-portal-${slug}`;
const claveDe = (slug: string, tipo: TipoAcceso, version: number) => `${tipo}:${slug}:v${version}`;

function firmar(texto: string) {
  const secreto = process.env.PORTAL_SECRET;
  if (!secreto || secreto.length < 32) throw new Error("Falta PORTAL_SECRET (mínimo 32 caracteres) en .env.local");
  return createHmac("sha256", secreto).update(texto).digest("base64url");
}

export async function concederAcceso(slug: string, tipo: TipoAcceso, version: number) {
  // La caducidad usa la hora actual: solo en tiempo de petición.
  await connection();
  const caduca = Math.floor(Date.now() / 1000) + DURACION_SEGUNDOS;
  const contenido = `${claveDe(slug, tipo, version)}.${caduca}`;
  const almacen = await cookies();
  almacen.set(nombreCookie(slug), `${contenido}.${firmar(contenido)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/p/${slug}`,
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function retirarAcceso(slug: string) {
  const almacen = await cookies();
  almacen.set(nombreCookie(slug), "", { path: `/p/${slug}`, maxAge: 0 });
}

export async function tieneAcceso(slug: string, tipo: TipoAcceso, version: number) {
  // Comprobar la caducidad usa la hora actual: solo en tiempo de petición.
  await connection();
  const valor = (await cookies()).get(nombreCookie(slug))?.value;
  if (!valor) return false;

  const ultimoPunto = valor.lastIndexOf(".");
  const contenido = valor.slice(0, ultimoPunto);
  const firma = Buffer.from(valor.slice(ultimoPunto + 1));
  const esperada = Buffer.from(firmar(contenido));
  if (firma.length !== esperada.length || !timingSafeEqual(firma, esperada)) return false;

  const [claveCookie, caduca] = [contenido.slice(0, contenido.lastIndexOf(".")), Number(contenido.split(".").pop())];
  return claveCookie === claveDe(slug, tipo, version) && caduca > Date.now() / 1000;
}
