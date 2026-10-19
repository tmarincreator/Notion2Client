import { Icono } from "@/components/ui/Icono";
import { BotonEnlace } from "@/components/ui/Boton";
import { elegirBase, guardarCampos } from "@/app/(agencia)/portales/actions";
import { listarBases, obtenerBase } from "@/lib/notion/bases";
import { tokenAgencia } from "@/lib/notion/conexion";
import type { ErrorNotion } from "@/lib/notion/errores";
import { FormBase } from "./FormBase";
import { FormCampos } from "./FormCampos";

/* Pasos 2 y 3 del asistente: leen de Notion (en el servidor) con el token de la agencia. */

export async function PasoBase({ id, actual }: { id: string; actual: string | null }) {
  const bases = await listarBases(await tokenAgencia());
  if (!bases.ok) return <ErrorNotionAviso error={bases.error} />;
  return <FormBase id={id} accion={elegirBase.bind(null, id)} bases={bases.datos} actual={actual} />;
}

export async function PasoCampos({ id, fuente, visibles }: { id: string; fuente: string; visibles: string[] }) {
  const base = await obtenerBase(await tokenAgencia(), fuente);
  if (!base.ok) return <ErrorNotionAviso error={base.error} volver={`/portales/${id}?paso=2`} />;
  return (
    <>
      <p className="n2c-small n2c-muted flex items-center gap-2">
        <Icono nombre="capas" />
        Base: <strong>{base.datos.nombre}</strong> · {base.datos.propiedades.length} propiedades
      </p>
      <FormCampos
        id={id}
        accion={guardarCampos.bind(null, id)}
        propiedades={base.datos.propiedades}
        visiblesIniciales={visibles}
      />
    </>
  );
}

function ErrorNotionAviso({ error, volver }: { error: ErrorNotion; volver?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="n2c-banner n2c-banner--danger" role="alert">
        <Icono nombre="aviso" />
        <div className="n2c-banner__body">{error.mensaje}</div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        {volver && <BotonEnlace variante="fantasma" href={volver}>Elegir otra base</BotonEnlace>}
        <BotonEnlace variante="secundario" href="/ajustes">Revisar conexión con Notion</BotonEnlace>
      </div>
    </div>
  );
}
