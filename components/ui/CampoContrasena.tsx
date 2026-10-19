"use client";

import { useState } from "react";
import { Icono } from "./Icono";
import { Input } from "./Campo";
import { Boton } from "./Boton";

/* Campo de contraseña con botón para mostrarla u ocultarla. */
export function CampoContrasena({
  id,
  valor,
  onCambio,
  autoComplete,
  conError = false,
  describedBy,
}: {
  id: string;
  valor: string;
  onCambio: (v: string) => void;
  autoComplete: string;
  conError?: boolean;
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="n2c-input-wrap">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        conError={conError}
        aria-describedby={describedBy}
      />
      <Boton
        variante="fantasma"
        className="n2c-btn--icon"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        onClick={() => setVisible((v) => !v)}
      >
        <Icono nombre={visible ? "ojoTachado" : "ojo"} />
      </Boton>
    </div>
  );
}
