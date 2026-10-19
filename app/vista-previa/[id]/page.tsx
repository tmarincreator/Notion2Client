import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VistaPortal } from "@/components/portal/VistaPortal";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerMarca } from "@/lib/agencia";
import { tokenAgencia } from "@/lib/notion/conexion";
import { cargarContenido, obtenerPortal } from "@/lib/portales/datos";

export const metadata: Metadata = { title: "Vista previa · Notion2Client", robots: { index: false, follow: false } };

/*
  Vista previa para la agencia: el portal tal y como lo verá el cliente
  (mismas reglas de visibilidad), aunque todavía no esté publicado.
*/
export default function PaginaVistaPrevia(props: PageProps<"/vista-previa/[id]">) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><span className="n2c-skel w-40" /></div>}>
      <VistaPrevia params={props.params} />
    </Suspense>
  );
}

async function VistaPrevia({ params }: { params: PageProps<"/vista-previa/[id]">["params"] }) {
  const [{ id }, usuario, marca] = await Promise.all([params, obtenerUsuario(), obtenerMarca()]);
  const portal = await obtenerPortal(id);
  if (!portal) notFound();

  const volver = { volver: `/portales/${id}?paso=4` };
  const vacio = {
    slug: portal.slug,
    nombre: portal.nombre,
    cliente: portal.cliente,
    color: portal.color,
    agencia: { nombre: usuario.nombre, iniciales: usuario.iniciales, logo: marca.logoUrl },
    actualizado: "",
    etiquetaFecha: null,
    entregables: [],
  };

  if (!portal.fuente_notion_id) {
    return <VistaPortal datos={vacio} vistaPrevia={volver} error="Este portal todavía no tiene una base de datos de Notion." />;
  }
  const contenido = await cargarContenido({
    ...portal,
    fuente_notion_id: portal.fuente_notion_id,
    agencia: usuario.nombre,
    logo_path: marca.logoPath,
    token: await tokenAgencia(),
  });
  if (!contenido.ok) return <VistaPortal datos={vacio} vistaPrevia={volver} error={contenido.error.mensaje} />;
  return <VistaPortal datos={contenido.datos} vistaPrevia={volver} />;
}
