import type { Metadata } from "next";
import { Suspense } from "react";
import { FormContrasena, FormCorreo, FormNombre } from "@/components/agencia/FormulariosCuenta";
import { obtenerUsuario } from "@/lib/auth";

export const metadata: Metadata = { title: "Cuenta · Notion2Client" };

export default function PaginaCuenta() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="n2c-h1">Cuenta</h1>
        <p className="n2c-muted">Datos de acceso y nombre de tu agencia.</p>
      </div>
      <Suspense fallback={<Cargando />}>
        <Formularios />
      </Suspense>
    </>
  );
}

async function Formularios() {
  const usuario = await obtenerUsuario();
  // Si no hay nombre de agencia, obtenerUsuario usa el correo como nombre.
  const nombre = usuario.nombre === usuario.correo ? "" : usuario.nombre;
  return (
    <>
      <FormNombre inicial={nombre} />
      <FormCorreo actual={usuario.correo} />
      <FormContrasena />
    </>
  );
}

function Cargando() {
  return (
    <div className="n2c-card flex max-w-[720px] flex-col gap-4 p-6" aria-busy="true" aria-label="Cargando la cuenta">
      <span className="n2c-skel" style={{ width: "35%", height: 20 }} />
      <span className="n2c-skel" style={{ width: "70%" }} />
    </div>
  );
}
