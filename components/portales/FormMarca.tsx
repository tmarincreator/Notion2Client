"use client";

import { startTransition, useActionState, useState } from "react";
import { Icono } from "@/components/ui/Icono";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { LogoAgencia } from "@/components/ui/Logo";
import type { EstadoFormulario } from "@/app/(agencia)/portales/actions";
import { AvisoFormulario } from "@/components/ui/AvisoFormulario";

const SUGERIDOS = ["#c2410c", "#2563eb", "#0f766e", "#7c3aed", "#be123c", "#111827"];

/* Paso 4: color del portal y acceso a la vista previa con datos reales. */
export function FormMarca({
  id,
  accion,
  colorInicial,
  agencia,
}: {
  id: string;
  accion: (previo: EstadoFormulario, color: string) => Promise<EstadoFormulario>;
  colorInicial: string;
  agencia: { nombre: string; iniciales: string; logo: string | null };
}) {
  const [estado, enviarAccion, enviando] = useActionState(accion, {});
  const [color, setColor] = useState(colorInicial);
  const estilo = { "--accent": color, "--accent-hover": color } as React.CSSProperties;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    startTransition(() => enviarAccion(color));
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={enviar}>
      <AvisoFormulario error={enviando ? undefined : estado.error} />

      <div className="flex flex-col gap-2">
        <span className="n2c-label">Color principal</span>
        <div className="flex flex-wrap items-center gap-2">
          {SUGERIDOS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Usar el color ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className="size-8 rounded-full border-2"
              style={{ background: c, borderColor: color === c ? "var(--ink)" : "transparent" }}
            />
          ))}
          <label className="n2c-small flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pr-3 pl-1">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="size-6 cursor-pointer" />
            <span className="n2c-mono">{color}</span>
          </label>
        </div>
      </div>

      {/* Muestra rápida de cómo quedan cabecera y botones con este color. */}
      <div style={estilo} className="n2c-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <LogoAgencia iniciales={agencia.iniciales} logoUrl={agencia.logo} />
          <span className="font-bold">{agencia.nombre}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="n2c-progress w-32"><span style={{ width: "60%" }} /></div>
          <span className="n2c-btn n2c-btn--primary n2c-btn--sm" aria-hidden="true">Entrar al portal</span>
        </div>
      </div>

      <p className="n2c-small n2c-muted flex items-center gap-2">
        <Icono nombre="ojo" />
        Guarda el color y abre la vista previa para ver el portal completo con tus datos de Notion.
      </p>

      <div className="flex flex-wrap justify-end gap-3">
        <BotonEnlace variante="fantasma" href={`/portales/${id}?paso=3`}>Atrás</BotonEnlace>
        <BotonEnlace variante="secundario" href={`/vista-previa/${id}`} target="_blank">
          <Icono nombre="abrir" />
          Vista previa
        </BotonEnlace>
        <Boton type="submit" aria-busy={enviando}>{enviando ? "Guardando…" : "Guardar y continuar"}</Boton>
      </div>
    </form>
  );
}
