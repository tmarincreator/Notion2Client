import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/*
  Prueba de que la sesión viene de un enlace de recuperación del correo.
  /auth/confirm la guarda al validar el enlace; /nueva-contrasena la exige.
  Sin ella, cualquiera con una sesión abierta (p. ej. en un ordenador
  compartido) podría cambiar la contraseña sin saber la actual.
  Cookie httpOnly firmada con PORTAL_SECRET, ligada al usuario, 15 minutos.
*/

const NOMBRE = "n2c-recuperacion";
const DURACION_SEGUNDOS = 15 * 60;

function firmar(texto: string) {
  const secreto = process.env.PORTAL_SECRET;
  if (!secreto || secreto.length < 32) throw new Error("Falta PORTAL_SECRET (mínimo 32 caracteres) en .env.local");
  // Prefijo propio: una firma de esta cookie no sirve para las de acceso a portales.
  return createHmac("sha256", secreto).update(`recuperacion:${texto}`).digest("base64url");
}

export async function marcarRecuperacion(usuarioId: string) {
  await connection();
  const contenido = `${usuarioId}.${Math.floor(Date.now() / 1000) + DURACION_SEGUNDOS}`;
  (await cookies()).set(NOMBRE, `${contenido}.${firmar(contenido)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function recuperacionValida(usuarioId: string) {
  await connection();
  const valor = (await cookies()).get(NOMBRE)?.value;
  if (!valor) return false;

  const [id, caduca, firma] = valor.split(".");
  if (!id || !caduca || !firma) return false;
  const recibida = Buffer.from(firma);
  const esperada = Buffer.from(firmar(`${id}.${caduca}`));
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return false;

  return id === usuarioId && Number(caduca) > Date.now() / 1000;
}

export async function borrarRecuperacion() {
  (await cookies()).set(NOMBRE, "", { path: "/", maxAge: 0 });
}
