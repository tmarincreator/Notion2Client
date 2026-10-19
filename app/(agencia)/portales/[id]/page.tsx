import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotonEnlace } from "@/components/ui/Boton";
import { BadgeEstadoPortal } from "@/components/agencia/FilaPortal";
import { Pasos } from "@/components/portales/Pasos";
import { FormDatos } from "@/components/portales/FormDatos";
import { FormMarca } from "@/components/portales/FormMarca";
import { FormPublicar } from "@/components/portales/FormPublicar";
import { PasoBase, PasoCampos } from "@/components/portales/PasosNotion";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerMarca } from "@/lib/agencia";
import { obtenerPortal, portalTieneContrasena } from "@/lib/portales/datos";
import { PASOS, estadoAsistente } from "@/lib/portales/asistente";
import {
  despublicarPortal,
  fijarContrasena,
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
  const { completos, paso, pendientes } = estadoAsistente(portal, tieneContrasena, consulta.paso);

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

        {paso === 2 && <PasoBase id={id} actual={portal.fuente_notion_id} publicado={portal.estado === "publicado"} />}

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
