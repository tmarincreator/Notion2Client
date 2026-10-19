import { Icono } from "@/components/ui/Icono";

const antes = [
  "Aspecto genérico, sin tu logotipo ni tus colores",
  "Es fácil dejar a la vista costes, márgenes o notas",
  "Tu cliente se pierde entre páginas y vistas",
];

const despues = [
  "Tu marca, un enlace único y contraseña propia",
  "Solo se envían los campos que tú activas",
  "Una vista clara, sin rastro de Notion",
];

export function Problema() {
  return (
    <section className="wrap flex flex-col gap-10 py-14">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span className="eyebrow">El problema</span>
        <h2 className="n2c-h1 max-w-[620px]">Compartir un Notion no se parece a tu agencia</h2>
      </div>
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
        <Columna titulo="Enlace público de Notion" puntos={antes} icono="cruz" tono="bad" />
        <Columna titulo="Portal de Notion2Client" puntos={despues} icono="check" tono="good" />
      </div>
    </section>
  );
}

function Columna({
  titulo,
  puntos,
  icono,
  tono,
}: {
  titulo: string;
  puntos: string[];
  icono: "cruz" | "check";
  tono: "bad" | "good";
}) {
  return (
    <div className="n2c-card flex flex-col gap-4 p-7">
      <h3 className="n2c-h3">{titulo}</h3>
      <ul className="flex flex-col gap-3">
        {puntos.map((p) => (
          <li className="li" key={p}>
            <Icono nombre={icono} className={tono} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
