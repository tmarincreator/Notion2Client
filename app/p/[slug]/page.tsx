import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { AccesoPortal } from "@/components/portal/AccesoPortal";
import { VistaPortal } from "@/components/portal/VistaPortal";
import { tieneAcceso } from "@/lib/portales/acceso";
import { cargarContenido, inicialesDe, portalPublico } from "@/lib/portales/datos";
import { portalDemo } from "@/lib/portales/demo";
import { urlLogo } from "@/lib/agencia";

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  // Consulta Supabase (que usa la hora actual): solo en tiempo de petición.
  await connection();
  const { slug } = await props.params;
  const portal = (await portalPublico(slug)) ?? portalDemo(slug);
  return { title: portal ? `${portal.nombre} · ${portal.cliente}` : "Portal no disponible" };
}

/*
  El portal depende del enlace (slug) que abre el cliente, así que se resuelve
  en el momento de la visita. Mientras tanto se muestra un indicador de carga.
*/
export default function PaginaPortal(props: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Portal params={props.params} />
    </Suspense>
  );
}

async function Portal({ params }: { params: PageProps<"/p/[slug]">["params"] }) {
  // El portal (estado, acceso, datos de Notion) se resuelve siempre en cada visita.
  await connection();
  const { slug } = await params;
  const publico = await portalPublico(slug);
  const demo = publico ? null : portalDemo(slug);
  if (!publico && !demo) notFound();

  const cabecera = publico
    ? {
        nombre: publico.nombre,
        cliente: publico.cliente,
        color: publico.color,
        agencia: { nombre: publico.agencia, iniciales: inicialesDe(publico.agencia), logo: urlLogo(publico.logo_path) },
      }
    : demo!;

  // Sin la cookie de acceso no se lee nada de Notion ni se envía al navegador.
  if (!(await tieneAcceso(slug))) {
    return <AccesoPortal slug={slug} cabecera={cabecera} demo={!!demo} />;
  }

  if (demo) return <VistaPortal datos={demo} />;

  if (!publico!.fuente_notion_id) {
    return <VistaPortal datos={{ ...cabecera, slug, actualizado: "", etiquetaFecha: null, entregables: [] }} />;
  }
  const contenido = await cargarContenido({ ...publico!, fuente_notion_id: publico!.fuente_notion_id });
  if (!contenido.ok) {
    return (
      <VistaPortal
        datos={{ ...cabecera, slug, actualizado: "", etiquetaFecha: null, entregables: [] }}
        error="No hemos podido cargar la información del proyecto. Inténtalo de nuevo en unos minutos."
      />
    );
  }
  return <VistaPortal datos={contenido.datos} />;
}

function Cargando() {
  return (
    <div className="flex min-h-screen items-center justify-center" aria-busy="true" aria-label="Cargando portal">
      <span className="n2c-skel w-40" />
    </div>
  );
}
