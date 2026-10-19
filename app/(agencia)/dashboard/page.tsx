import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelPortales, PanelPortalesCargando } from "@/components/agencia/PanelPortales";
import { obtenerUsuario } from "@/lib/auth";
import { conexionAgencia } from "@/lib/notion/conexion";
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
  // Estado guardado de la conexión: no llama a Notion (Ajustes sí lo comprueba en directo).
  const [portales, conexion] = await Promise.all([listarPortales(), conexionAgencia()]);
  return (
    <PanelPortales
      portales={portales}
      notion={conexion ? { conectado: true, espacio: conexion.espacio } : { conectado: false, mensaje: "Notion todavía no está conectado." }}
    />
  );
}
