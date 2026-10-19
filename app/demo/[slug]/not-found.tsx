import { Icono } from "@/components/ui/Icono";
import { BotonEnlace } from "@/components/ui/Boton";

// /demo/<algo que no es una demo>: se ofrece la demo que sí existe.
export default function DemoNoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="n2c-card n2c-empty w-full max-w-[420px]">
        <span className="n2c-empty__icon"><Icono nombre="buscar" /></span>
        <h1 className="n2c-h3">Esta demo no existe</h1>
        <p>Puede que el enlace esté mal escrito. Prueba la demo de un portal de cliente con datos de ejemplo.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <BotonEnlace variante="secundario" href="/">Ir al inicio</BotonEnlace>
          <BotonEnlace href="/demo/lumen-cafe">Ver la demo</BotonEnlace>
        </div>
      </div>
    </div>
  );
}
