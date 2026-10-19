import type { Metadata } from "next";
import { Suspense } from "react";
import { FormMarcaAgencia } from "@/components/agencia/FormMarcaAgencia";
import { SeccionNotion } from "@/components/agencia/SeccionNotion";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerMarca } from "@/lib/agencia";

export const metadata: Metadata = { title: "Marca y Notion · Notion2Client" };

export default function PaginaAjustes() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="n2c-h1">Marca y Notion</h1>
        <p className="n2c-muted">Conecta tu espacio de Notion y revisa qué bases de datos puede leer Notion2Client.</p>
      </div>

      <Suspense fallback={<SeccionCargando etiqueta="Comprobando la conexión con Notion" />}>
        <SeccionNotion />
      </Suspense>

      <Suspense fallback={<SeccionCargando etiqueta="Cargando la marca de la agencia" />}>
        <SeccionMarca />
      </Suspense>
    </>
  );
}

async function SeccionMarca() {
  const [usuario, marca] = await Promise.all([obtenerUsuario(), obtenerMarca()]);
  return (
    <FormMarcaAgencia
      agenciaId={usuario.id}
      nombre={usuario.nombre}
      iniciales={usuario.iniciales}
      colorInicial={marca.color}
      logoInicial={marca.logoUrl}
    />
  );
}

function SeccionCargando({ etiqueta }: { etiqueta: string }) {
  return (
    <div className="n2c-card flex flex-col gap-4 p-6" role="status" aria-label={etiqueta}>
      <span className="n2c-skel" style={{ width: "30%", height: 20 }} />
      <div className="flex gap-6">
        {[1, 2, 3].map((n) => <span key={n} className="n2c-skel flex-1" />)}
      </div>
    </div>
  );
}

