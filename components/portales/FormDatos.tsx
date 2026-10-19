"use client";

import { startTransition, useActionState, useState } from "react";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { Campo, Input } from "@/components/ui/Campo";
import type { DatosBasicos, EstadoFormulario } from "@/app/(agencia)/portales/actions";
import { AvisoFormulario } from "./Pasos";

/** "Lumen Café" → "lumen-cafe" */
export function proponerSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/* Paso 1: cliente, nombre visible y enlace del portal. */
export function FormDatos({
  accion,
  inicial,
}: {
  accion: (previo: EstadoFormulario, datos: DatosBasicos) => Promise<EstadoFormulario>;
  inicial?: DatosBasicos;
}) {
  const [estado, enviarAccion, enviando] = useActionState(accion, {});
  const [cliente, setCliente] = useState(inicial?.cliente ?? "");
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [slug, setSlug] = useState(inicial?.slug ?? "");
  // Mientras no lo toque la agencia, el enlace se propone a partir del cliente.
  const [slugManual, setSlugManual] = useState(!!inicial);
  const errores = enviando ? {} : (estado.errores ?? {});

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    startTransition(() => enviarAccion({ cliente, nombre, slug }));
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={enviar} noValidate>
      <AvisoFormulario error={enviando ? undefined : estado.error} />

      <Campo id="pt-cliente" etiqueta="Nombre del cliente" error={errores.cliente}>
        <Input
          id="pt-cliente"
          placeholder="Atlas Coffee"
          value={cliente}
          maxLength={120}
          onChange={(e) => {
            setCliente(e.target.value);
            if (!slugManual) setSlug(proponerSlug(e.target.value));
          }}
          conError={!!errores.cliente}
        />
      </Campo>

      <Campo id="pt-nombre" etiqueta="Nombre visible del portal" error={errores.nombre} pista="Es el título que verá tu cliente.">
        <Input
          id="pt-nombre"
          placeholder="Rediseño web"
          value={nombre}
          maxLength={120}
          onChange={(e) => setNombre(e.target.value)}
          conError={!!errores.nombre}
        />
      </Campo>

      <Campo
        id="pt-slug"
        etiqueta="Enlace del portal"
        error={errores.slug}
        pista="Solo minúsculas, números y guiones. Debe ser único."
      >
        <div className="flex items-center gap-2">
          <span className="n2c-mono n2c-small n2c-muted flex-none">/p/</span>
          <Input
            id="pt-slug"
            className="n2c-mono"
            placeholder="atlas-coffee"
            value={slug}
            maxLength={60}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              setSlugManual(true);
            }}
            conError={!!errores.slug}
          />
        </div>
      </Campo>

      <div className="flex flex-wrap justify-end gap-3">
        <BotonEnlace variante="fantasma" href="/dashboard">Cancelar</BotonEnlace>
        <Boton type="submit" aria-busy={enviando}>{enviando ? "Guardando…" : "Guardar y continuar"}</Boton>
      </div>
    </form>
  );
}
