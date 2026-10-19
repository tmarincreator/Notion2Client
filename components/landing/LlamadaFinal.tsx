import { BotonEnlace } from "@/components/ui/Boton";

export function LlamadaFinal() {
  return (
    <section className="wrap pb-[72px]">
      <div className="flex flex-col items-center gap-5 rounded-[14px] bg-[var(--brand)] px-8 py-14 text-center text-white">
        <h2 className="n2c-h1 max-w-[640px]">Tu próximo cliente merece algo mejor que un enlace de Notion</h2>
        <BotonEnlace
          variante="secundario"
          tamano="lg"
          href="/registro"
          className="border-white"
        >
          Crear cuenta gratis
        </BotonEnlace>
      </div>
    </section>
  );
}
