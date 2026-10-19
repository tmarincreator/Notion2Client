/* Tarjeta de resumen del portal (Progreso, Próxima entrega, Pendiente de revisión…). */
export function TarjetaDato({
  etiqueta,
  valor,
  detalle,
  progreso,
}: {
  etiqueta: string;
  valor: string | number;
  detalle: string;
  /** Si se indica (0–100), se muestra la barra de progreso. */
  progreso?: number;
}) {
  if (progreso !== undefined) {
    return (
      <div className="n2c-card flex flex-col gap-2.5 p-5">
        <span className="n2c-label n2c-muted">{etiqueta}</span>
        <div className="flex items-baseline gap-2">
          <span className="n2c-h1">{valor}</span>
          <span className="n2c-small n2c-muted">{detalle}</span>
        </div>
        <div className="n2c-progress"><span style={{ width: `${progreso}%` }} /></div>
      </div>
    );
  }

  return (
    <div className="n2c-card flex flex-col gap-1.5 p-5">
      <span className="n2c-label n2c-muted">{etiqueta}</span>
      <span className="n2c-h2">{valor}</span>
      <span className="n2c-small n2c-muted">{detalle}</span>
    </div>
  );
}
