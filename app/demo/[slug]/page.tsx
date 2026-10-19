import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AccesoPortal } from "@/components/portal/AccesoPortal";
import { VistaPortal } from "@/components/portal/VistaPortal";
import { tieneAcceso } from "@/lib/portales/acceso";
import { CONTRASENA_DEMO, portalDemo } from "@/lib/demo";
import { entrarDemo, salirDemo } from "./actions";

export async function generateMetadata(props: PageProps<"/demo/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const portal = portalDemo(slug);
  return { title: portal ? `Demo · ${portal.nombre} · ${portal.cliente}` : "Demo no disponible" };
}

/* Portal de demostración de la landing: misma experiencia que un portal real, con datos fijos. */
export default function PaginaDemo(props: PageProps<"/demo/[slug]">) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" role="status" aria-label="Cargando demo"><span className="n2c-skel w-40" /></div>}>
      <Demo params={props.params} />
    </Suspense>
  );
}

async function Demo({ params }: { params: PageProps<"/demo/[slug]">["params"] }) {
  const { slug } = await params;
  const datos = portalDemo(slug);
  if (!datos) notFound();

  if (!(await tieneAcceso(slug, "demo", 0))) {
    return <AccesoPortal cabecera={datos} accion={entrarDemo.bind(null, slug)} pistaDemo={CONTRASENA_DEMO} />;
  }
  return <VistaPortal datos={datos} salir={salirDemo.bind(null, slug)} />;
}
