import type { Metadata } from "next";
import { Pasos } from "@/components/portales/Pasos";
import { FormDatos } from "@/components/portales/FormDatos";
import { crearPortal } from "../actions";

export const metadata: Metadata = { title: "Nuevo portal · Notion2Client" };

export default function PaginaNuevoPortal() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="n2c-h1">Nuevo portal</h1>
        <p className="n2c-muted">Se guarda como borrador: tu cliente no verá nada hasta que lo publiques.</p>
      </div>
      <Pasos actual={1} />
      <section className="n2c-card flex max-w-[720px] flex-col gap-5 p-6">
        <h2 className="n2c-h3">Datos del cliente</h2>
        <FormDatos accion={crearPortal} />
      </section>
    </>
  );
}
