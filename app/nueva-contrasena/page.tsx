import type { Metadata } from "next";
import { Suspense } from "react";
import { Icono } from "@/components/ui/Icono";
import { BotonEnlace } from "@/components/ui/Boton";
import { FormNuevaContrasena } from "@/components/auth/FormNuevaContrasena";
import { MarcoAcceso } from "@/components/auth/MarcoAcceso";
import { obtenerUsuario } from "@/lib/auth";
import { recuperacionValida } from "@/lib/recuperacion";

export const metadata: Metadata = { title: "Contraseña nueva · Notion2Client", robots: { index: false, follow: false } };

/*
  proxy.ts solo deja entrar con sesión. Además hace falta haber abierto el
  enlace de recuperación del correo hace menos de 15 minutos: con una sesión
  cualquiera no se puede cambiar la contraseña sin la actual.
*/
export default function PaginaNuevaContrasena() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Cargando">
          <span className="n2c-skel w-40" />
        </div>
      }
    >
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  const usuario = await obtenerUsuario();
  if (await recuperacionValida(usuario.id)) return <FormNuevaContrasena />;

  return (
    <MarcoAcceso>
      <div className="n2c-empty p-0">
        <span className="n2c-empty__icon"><Icono nombre="aviso" /></span>
        <h1 className="n2c-h3">El enlace ha caducado</h1>
        <p>Para elegir una contraseña nueva abre el enlace del correo de recuperación (vale 15 minutos). Si quieres cambiarla y sabes la actual, hazlo desde Cuenta.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <BotonEnlace variante="secundario" href="/cuenta">Ir a Cuenta</BotonEnlace>
          <BotonEnlace href="/recuperar">Pedir otro enlace</BotonEnlace>
        </div>
      </div>
    </MarcoAcceso>
  );
}
