import { Icono } from "@/components/ui/Icono";

const preguntas = [
  { p: "¿Tu cliente necesita una cuenta de Notion?", r: "No. Solo necesita el enlace y la contraseña del portal." },
  { p: "¿Puede tu cliente editar algo?", r: "No. El portal es de solo lectura y no modifica tu Notion." },
  { p: "¿Qué datos de Notion se envían?", r: "Solo los campos que hayas activado. El resto se filtra en el servidor." },
  { p: "¿Puedo usar mi propio dominio?", r: "Todavía no. Cada portal tiene una dirección única en notion2client.com." },
];

export function PreguntasFrecuentes() {
  return (
    <section id="faq" className="wrap flex scroll-mt-4 flex-col gap-6 py-14">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span className="eyebrow">Preguntas frecuentes</span>
        <h2 className="n2c-h1">Antes de empezar</h2>
      </div>
      <div className="faq mx-auto w-full max-w-[720px]">
        {preguntas.map((q, i) => (
          <details key={q.p} open={i === 0}>
            <summary>
              {q.p}
              <Icono nombre="chevron" />
            </summary>
            <p>{q.r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
