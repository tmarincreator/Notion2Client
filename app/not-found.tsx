import type { Metadata } from "next";
import { Icono } from "@/components/ui/Icono";
import { BotonEnlace } from "@/components/ui/Boton";

export const metadata: Metadata = { title: "Página no encontrada · Notion2Client" };

export default function NoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="n2c-card n2c-empty w-full max-w-[420px]">
        <span className="n2c-empty__icon"><Icono nombre="buscar" /></span>
        <h1 className="n2c-h3">No encontramos esta página</h1>
        <p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
        <BotonEnlace href="/">Ir al inicio</BotonEnlace>
      </div>
    </div>
  );
}
