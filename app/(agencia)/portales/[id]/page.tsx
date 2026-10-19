import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icono } from "@/components/ui/Icono";
import { BotonEnlace } from "@/components/ui/Boton";
import { BadgeEstadoPortal } from "@/components/agencia/FilaPortal";
import { PASOS, Pasos } from "@/components/portales/Pasos";
import { FormDatos } from "@/components/portales/FormDatos";
import { FormBase } from "@/components/portales/FormBase";
import { FormCampos } from "@/components/portales/FormCampos";
import { FormMarca } from "@/components/portales/FormMarca";
import { FormPublicar } from "@/components/portales/FormPublicar";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerMarca } from "@/lib/agencia";
import { listarBases, obtenerBase } from "@/lib/notion/bases";
import { tokenAgencia } from "@/lib/notion/conexion";
import type { ErrorNotion } from "@/lib/notion/errores";
import { obtenerPortal, portalTieneContrasena } from "@/lib/portales/datos";
import { pendientesDe } from "@/lib/portales/tipos";
import {
  despublicarPortal,
  elegirBase,
  fijarContrasena,
  guardarCampos,
  guardarDatos,
  guardarMarca,
  publicarPortal,
} from "../actions";

export const metadata: Metadata = { title: "Configurar portal · Notion2Client" };

export default function PaginaPortal(props: PageProps<"/portales/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Asistente params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Asistente({
  params,
  searchParams,
}: {
  params: PageProps<"/portales/[id]">["params"];
  searchParams: PageProps<"/portales/[id]">["searchParams"];
}) {
  const [{ id }, consulta, usuario, marca] = await Promise.all([params, searchParams, obtenerUsuario(), obtenerMarca()]);
  const portal = await obtenerPortal(id);
  if (!portal) notFound();

  const tieneContrasena = await portalTieneContrasena(id);
  const pendientes = pendientesDe(portal, tieneContrasena);
  const completos = [
    1,
    ...(portal.fuente_notion_id ? [2] : []),
    ...(portal.propiedades_visibles.length ? [3, 4] : []),
    ...(tieneContrasena ? [5] : []),
  ];
  // Sin ?paso=, se abre el primer paso pendiente.
  const pedido = Number(consulta.paso);
  const primeroPendiente = [2, 3, 4, 5].find((n) => !completos.includes(n)) ?? 5;
  const paso = pedido >= 1 && pedido <= PASOS.length ? pedido : primeroPendiente;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="n2c-label n2c-muted">{portal.cliente}</span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="n2c-h1">{portal.nombre}</h1>
            <BadgeEstadoPortal estado={portal.estado} />
          </div>
        </div>
        <BotonEnlace variante="secundario" href="/dashboard">Volver a portales</BotonEnlace>
      </div>

      <Pasos actual={paso} id={id} completos={completos} />

      <section className="n2c-card flex max-w-[860px] flex-col gap-5 p-6">
        <h2 className="n2c-h3">{PASOS[paso - 1]}</h2>

        {paso === 1 && (
          <FormDatos
            accion={guardarDatos.bind(null, id)}
            inicial={{ cliente: portal.cliente, nombre: portal.nombre, slug: portal.slug }}
            publicado={portal.estado === "publicado"}
          />
        )}

        {paso === 2 && <PasoBase id={id} actual={portal.fuente_notion_id} />}

        {paso === 3 &&
          (portal.fuente_notion_id ? (
            <PasoCampos id={id} fuente={portal.fuente_notion_id} visibles={portal.propiedades_visibles} />
          ) : (
            <Falta texto="Primero elige una base de datos de Notion." href={`/portales/${id}?paso=2`} />
          ))}

        {paso === 4 && (
          <FormMarca
            id={id}
            accion={guardarMarca.bind(null, id)}
            colorInicial={portal.color}
            agencia={{ nombre: usuario.nombre, iniciales: usuario.iniciales, logo: marca.logoUrl }}
          />
        )}

        {paso === 5 && (
          <FormPublicar
            id={id}
            slug={portal.slug}
            estadoPortal={portal.estado}
            tieneContrasena={tieneContrasena}
            pendientes={pendientes}
            accionContrasena={fijarContrasena.bind(null, id)}
            accionPublicar={publicarPortal.bind(null, id)}
            accionDespublicar={despublicarPortal.bind(null, id)}
          />
        )}
      </section>
    </>
  );
}

async function PasoBase({ id, actual }: { id: string; actual: string | null }) {
  const bases = await listarBases(await tokenAgencia());
  if (!bases.ok) return <ErrorNotionAviso error={bases.error} />;
  return <FormBase id={id} accion={elegirBase.bind(null, id)} bases={bases.datos} actual={actual} />;
}

async function PasoCampos({ id, fuente, visibles }: { id: string; fuente: string; visibles: string[] }) {
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

function Falta({ texto, href }: { texto: string; href: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="n2c-muted">{texto}</p>
      <BotonEnlace href={href}>Ir al paso</BotonEnlace>
    </div>
  );
}

function Cargando() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Cargando portal">
      <span className="n2c-skel" style={{ width: 280, height: 32 }} />
      <div className="n2c-card flex flex-col gap-4 p-6">
        {[1, 2, 3].map((n) => <span key={n} className="n2c-skel" style={{ width: `${80 - n * 15}%` }} />)}
      </div>
    </div>
  );
}
