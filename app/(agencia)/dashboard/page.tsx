import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelPortales, PanelPortalesCargando } from "@/components/agencia/PanelPortales";
import { obtenerUsuario } from "@/lib/auth";
import { comprobarConexion } from "@/lib/notion/bases";
import { listarPortales } from "@/lib/portales/datos";

export const metadata: Metadata = { title: "Portales · Notion2Client" };

export default function PaginaDashboard() {
  return (
    <Suspense fallback={<PanelPortalesCargando />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await obtenerUsuario();
  const [portales, conexion] = await Promise.all([listarPortales(), comprobarConexion()]);
  return (
    <PanelPortales
      portales={portales}
      notion={conexion.ok ? { conectado: true, espacio: conexion.datos.espacio } : { conectado: false, mensaje: conexion.error.mensaje }}
    />
  );
}
