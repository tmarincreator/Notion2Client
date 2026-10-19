import { Icono } from "./Icono";

/*
  Campo de formulario: etiqueta + control + mensaje de error o pista.
  El control (Input, CampoContrasena…) se pasa como hijo.
  Ids que genera para accesibilidad: `${id}-err` y `${id}-hint`.
*/
export function Campo({
  id,
  etiqueta,
  error,
  pista,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string | null;
  pista?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="n2c-field">
      <label className="n2c-label" htmlFor={id}>{etiqueta}</label>
      {children}
      {error ? (
        <span className="n2c-error" id={`${id}-err`} role="alert">
          <Icono nombre="aviso" />
          {error}
        </span>
      ) : (
        pista && <span className="n2c-hint" id={`${id}-hint`}>{pista}</span>
      )}
    </div>
  );
}

/* Caja de texto del sistema de diseño. `conError` la pinta en rojo. */
export function Input({
  conError = false,
  className = "",
  ...resto
}: { conError?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`n2c-input ${conError ? "n2c-input--error" : ""} ${className}`.trim()}
      aria-invalid={conError || undefined}
      {...resto}
    />
  );
}
