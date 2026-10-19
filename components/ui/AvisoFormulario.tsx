import { Icono } from "./Icono";

/* Aviso de un formulario: error (rojo, se anuncia al momento) o confirmación. */
export function AvisoFormulario({ error, ok }: { error?: string; ok?: string }) {
  if (error) {
    return (
      <div className="n2c-banner n2c-banner--danger" role="alert">
        <Icono nombre="aviso" />
        <div className="n2c-banner__body">{error}</div>
      </div>
    );
  }
  if (ok) {
    return (
      <div className="n2c-banner" role="status">
        <Icono nombre="check" />
        <div className="n2c-banner__body">{ok}</div>
      </div>
    );
  }
  return null;
}
