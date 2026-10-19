import { Icono } from "@/components/ui/Icono";

export default function PortalNoEncontrado() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="n2c-card n2c-empty w-full max-w-[420px]">
        <span className="n2c-empty__icon"><Icono nombre="candado" /></span>
        <h1 className="n2c-h3">Este portal no está disponible</h1>
        <p>Puede que el enlace no sea correcto o que el portal se haya desactivado. Pide un enlace nuevo a tu contacto.</p>
      </div>
    </div>
  );
}
