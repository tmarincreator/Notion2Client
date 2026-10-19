import { Icono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";

const campos = [
  { nombre: "Entregable", visible: true, sensible: false },
  { nombre: "Fecha de entrega", visible: true, sensible: false },
  { nombre: "Coste interno", visible: false, sensible: true },
  { nombre: "Notas internas", visible: false, sensible: true },
];

export function Privacidad() {
  return (
    <section id="privacidad" className="wrap scroll-mt-4 py-14">
      <div className="flex flex-wrap items-center gap-12">
        <div className="flex flex-[1_1_380px] flex-col gap-3">
          <span className="eyebrow">Privacidad primero</span>
          <h2 className="n2c-h1">Lo que ocultas no sale del servidor</h2>
          <p className="n2c-muted text-base">
            Los campos ocultos se filtran antes de llegar al navegador de tu cliente. No basta con esconderlos en pantalla.
          </p>
          <ul className="mt-2 flex flex-col gap-3">
            <li className="li"><Icono nombre="escudo" className="tint" />Avisamos cuando un campo parece interno: coste, margen, tarifa, notas.</li>
            <li className="li"><Icono nombre="candado" className="tint" />Cada portal tiene su propia contraseña.</li>
            <li className="li"><Icono nombre="ojoTachado" className="tint" />Los portales no aparecen en buscadores.</li>
          </ul>
        </div>

        {/* Ejemplo interactivo: los interruptores se pueden pulsar, pero no guardan nada. */}
        <div className="n2c-card flex-[1_1_420px] overflow-hidden" aria-label="Ejemplo de campos visibles">
          <div className="mini-row text-xs text-[var(--ink-muted)]">
            <span>Propiedad de Notion</span>
            <span>Tu cliente</span>
          </div>
          {campos.map((c) => (
            <div className="mini-row" key={c.nombre} style={c.sensible ? { color: "var(--ink-muted)" } : undefined}>
              <span className="flex items-center gap-2">
                {c.nombre}
                {c.sensible && <Badge tono="aviso" sinPunto>Sensible</Badge>}
              </span>
              <label className="n2c-switch">
                <input type="checkbox" defaultChecked={c.visible} aria-label={`${c.nombre} visible`} />
                <span className="track" />
                <span className="word on">Visible</span>
                <span className="word off">Oculto</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
