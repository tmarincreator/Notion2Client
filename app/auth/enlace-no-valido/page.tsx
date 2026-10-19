import type { Metadata } from "next";
import { Icono } from "@/components/ui/Icono";
import { BotonEnlace } from "@/components/ui/Boton";

export const metadata: Metadata = { title: "Enlace no válido · Notion2Client" };

export default function EnlaceNoValido() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="n2c-card n2c-empty w-full max-w-[420px]">
        <span className="n2c-empty__icon"><Icono nombre="aviso" /></span>
        <h1 className="n2c-h3">Este enlace ya no es válido</h1>
        <p>Puede que haya caducado o que ya lo hayas usado. Si ya confirmaste tu correo, inicia sesión directamente.</p>
        <BotonEnlace href="/login">Iniciar sesión</BotonEnlace>
      </div>
    </div>
  );
}
