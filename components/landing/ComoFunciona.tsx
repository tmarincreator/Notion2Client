const pasos = [
  { titulo: "Conecta Notion", texto: "Pega el token de tu integración y elige la base de datos del proyecto." },
  { titulo: "Elige qué se muestra", texto: "Todo empieza oculto. Activa solo los campos que tu cliente debe ver." },
  { titulo: "Publica y comparte", texto: "Añade tu logotipo y color, revisa la vista previa y copia el enlace." },
];

export function ComoFunciona() {
  return (
    <section id="como" className="wrap flex scroll-mt-4 flex-col gap-10 py-14">
      <div className="flex max-w-[560px] flex-col gap-2.5">
        <span className="eyebrow">Cómo funciona</span>
        <h2 className="n2c-h1">De tu base de datos a un portal en tres pasos</h2>
      </div>
      <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {pasos.map((p, i) => (
          <div className="flex flex-col gap-3" key={p.titulo}>
            <span className="step-n">{i + 1}</span>
            <h3 className="n2c-h3">{p.titulo}</h3>
            <p className="n2c-muted">{p.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
