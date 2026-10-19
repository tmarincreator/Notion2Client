import { Icono } from "@/components/ui/Icono";
import { BotonEnlace } from "@/components/ui/Boton";

const incluye = ["Portales para tus clientes", "Tu logotipo y color", "Control de campos visibles", "Contraseña por portal"];

export function Precios() {
  return (
    <section id="precios" className="wrap flex scroll-mt-4 flex-col gap-8 py-14">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span className="eyebrow">Precios</span>
        <h2 className="n2c-h1">Gratis durante el acceso anticipado</h2>
        <p className="n2c-muted">Los planes de pago llegarán más adelante. Te avisaremos con tiempo.</p>
      </div>
      <div className="n2c-card mx-auto flex w-full max-w-[440px] flex-col gap-5 p-8">
        <div>
          <div className="n2c-label n2c-muted">Acceso anticipado</div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl leading-[52px] font-bold tracking-[-0.025em]">0 €</span>
            <span className="n2c-muted">al mes</span>
          </div>
        </div>
        <ul className="flex flex-col gap-2.5">
          {incluye.map((i) => (
            <li className="li" key={i}><Icono nombre="check" className="good" />{i}</li>
          ))}
        </ul>
        <BotonEnlace tamano="lg" bloque href="/registro">Crear cuenta gratis</BotonEnlace>
      </div>
    </section>
  );
}
