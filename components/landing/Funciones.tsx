import { Icono, type NombreIcono } from "@/components/ui/Icono";

const funciones: { icono: NombreIcono; titulo: string; texto: string }[] = [
  { icono: "paleta", titulo: "Marca propia", texto: "Tu logotipo y tu color principal en todo el portal." },
  { icono: "ojo", titulo: "Vista previa", texto: "Revisa exactamente lo que verá tu cliente antes de publicar." },
  { icono: "actualizar", titulo: "Siempre al día", texto: "El portal pide los datos actuales a Notion al abrirse." },
];

export function Funciones() {
  return (
    <section className="wrap flex flex-col gap-10 py-14">
      <div className="flex max-w-[560px] flex-col gap-2.5">
        <span className="eyebrow">Funciones</span>
        <h2 className="n2c-h1">Lo justo para trabajar con clientes</h2>
      </div>
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {funciones.map((f) => (
          <div className="n2c-card flex flex-col gap-2.5 p-6" key={f.titulo}>
            <span className="feat-i"><Icono nombre={f.icono} className="ic-lg" /></span>
            <h3 className="n2c-h3">{f.titulo}</h3>
            <p className="n2c-muted">{f.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
