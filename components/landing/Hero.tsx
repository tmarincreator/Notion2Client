import { Icono } from "@/components/ui/Icono";
import { Badge, type TonoBadge } from "@/components/ui/Badge";
import { BotonEnlace } from "@/components/ui/Boton";
import { LogoAgencia } from "@/components/ui/Logo";

const ejemplo: { titulo: string; estado: string; tono: TonoBadge }[] = [
  { titulo: "Identidad visual y manual de marca", estado: "Entregado", tono: "exito" },
  { titulo: "Diseño de la home v2", estado: "En revisión", tono: "aviso" },
  { titulo: "Maquetación de la carta digital", estado: "En curso", tono: "marca" },
  { titulo: "Fotografía de producto", estado: "Pendiente", tono: "borrador" },
];

export function Hero() {
  return (
    <section className="wrap flex flex-col items-center gap-[22px] pt-[72px] pb-14 text-center">
      <Badge tono="marca" sinPunto>Acceso anticipado</Badge>
      <h1 className="max-w-[820px] text-[clamp(36px,5vw,56px)] leading-[1.08] font-bold tracking-[-0.025em]">
        Tu Notion, convertido en un portal para tus clientes
      </h1>
      <p className="max-w-[600px] text-lg leading-7 text-[var(--ink-muted)]">
        Conecta una base de datos, elige qué campos se ven y comparte un enlace con tu marca y contraseña. Sin exponer costes ni notas internas.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <BotonEnlace tamano="lg" href="/registro">
          Crear cuenta gratis
          <Icono nombre="flecha" />
        </BotonEnlace>
        <BotonEnlace variante="secundario" tamano="lg" href="/p/lumen-cafe">
          Ver un portal de ejemplo
        </BotonEnlace>
      </div>
      <span className="text-[13px] text-[var(--ink-muted)]">Sin tarjeta. Pensado para agencias, freelancers y consultores.</span>

      <MaquetaPortal />
    </section>
  );
}

/* Demostración visual: maqueta de un portal de cliente dentro de una ventana de navegador. */
function MaquetaPortal() {
  return (
    <div
      aria-label="Ejemplo de portal de cliente"
      className="mt-6 w-full max-w-[960px] overflow-hidden rounded-[14px] border border-[var(--border)] bg-white text-left shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-sunken)] px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </span>
        <span className="n2c-mono mx-auto flex h-7 max-w-[420px] flex-1 items-center gap-2 overflow-hidden rounded-md border border-[var(--border)] bg-white px-2.5 whitespace-nowrap text-[var(--ink-muted)]">
          <Icono nombre="candado" className="ic-sm" />
          notion2client.com/p/lumen-cafe
        </span>
      </div>
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-7 py-[18px]">
        <LogoAgencia iniciales="EN" color="#c2410c" />
        <div>
          <div className="n2c-label">Estudio Norte</div>
          <div className="n2c-small n2c-muted">Rebrand web · Lumen Café</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-7 px-7 pt-5 pb-7">
        <div className="flex min-w-0 flex-[999_1_420px] flex-col">
          {ejemplo.map((e) => (
            <div className="pv-item" key={e.titulo}>
              <span className="font-semibold">{e.titulo}</span>
              <Badge tono={e.tono}>{e.estado}</Badge>
            </div>
          ))}
        </div>
        <div
          className="flex flex-[1_1_240px] flex-col gap-2.5 self-start rounded-[14px] border border-[var(--border)] p-5"
          style={{ "--accent": "#c2410c" } as React.CSSProperties}
        >
          <span className="n2c-label n2c-muted">Progreso del proyecto</span>
          <span className="n2c-h1">40%</span>
          <div className="n2c-progress"><span style={{ width: "40%" }} /></div>
          <span className="n2c-small n2c-muted">Próxima entrega: 18 oct</span>
        </div>
      </div>
    </div>
  );
}
