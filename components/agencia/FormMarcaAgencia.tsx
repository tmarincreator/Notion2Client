"use client";

import { startTransition, useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/ui/Icono";
import { Boton } from "@/components/ui/Boton";
import { LogoAgencia } from "@/components/ui/Logo";
import { AvisoFormulario } from "@/components/ui/AvisoFormulario";
import { createClient } from "@/lib/supabase/client";
import { guardarColorAgencia, guardarLogo, quitarLogo, type EstadoMarca } from "@/app/(agencia)/ajustes/actions";

const SUGERIDOS = ["#c2410c", "#2563eb", "#0f766e", "#7c3aed", "#be123c", "#111827"];
const TIPOS: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAX_BYTES = 1024 * 1024;

/* Ajustes → Marca de la agencia: logotipo y color predeterminado de los portales nuevos. */
export function FormMarcaAgencia({
  agenciaId,
  nombre,
  iniciales,
  colorInicial,
  logoInicial,
}: {
  agenciaId: string;
  nombre: string;
  iniciales: string;
  colorInicial: string;
  logoInicial: string | null;
}) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState(colorInicial);
  const [estadoColor, enviarColor, guardandoColor] = useActionState(guardarColorAgencia, {});
  const [estadoLogo, setEstadoLogo] = useState<EstadoMarca>({});
  const [subiendo, iniciar] = useTransition();
  const estilo = { "--accent": color, "--accent-hover": color } as React.CSSProperties;

  function elegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const extension = TIPOS[archivo.type];
    if (!extension) return setEstadoLogo({ error: "Formato no válido. Usa PNG, JPG o WebP." });
    if (archivo.size > MAX_BYTES) return setEstadoLogo({ error: "El archivo pesa más de 1 MB. Prueba con una imagen más ligera." });

    iniciar(async () => {
      // El navegador sube el archivo a su carpeta de Supabase Storage; el servidor guarda cuál es.
      const supabase = createClient();
      const ruta = `${agenciaId}/logo-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("logos").upload(ruta, archivo, { contentType: archivo.type });
      if (error) {
        setEstadoLogo({ error: "No hemos podido subir el logotipo. Comprueba que sea PNG, JPG o WebP de hasta 1 MB." });
        return;
      }
      const resultado = await guardarLogo(ruta);
      if (resultado.error) await supabase.storage.from("logos").remove([ruta]);
      setEstadoLogo(resultado);
      router.refresh();
    });
  }

  function quitar() {
    iniciar(async () => {
      setEstadoLogo(await quitarLogo());
      router.refresh();
    });
  }

  return (
    <section className="n2c-card flex flex-col gap-5 p-6" aria-labelledby="h-marca">
      <div className="flex flex-col gap-1">
        <h2 className="n2c-h3" id="h-marca">Marca de la agencia</h2>
        <p className="n2c-small n2c-muted">Tus clientes verán tu logotipo en sus portales. El color se aplica a los portales nuevos; cada portal puede cambiarlo.</p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="n2c-label">Logotipo</span>
        <AvisoFormulario error={subiendo ? undefined : estadoLogo.error} ok={subiendo ? undefined : estadoLogo.ok} />
        <div className="flex flex-wrap items-center gap-4">
          <LogoAgencia iniciales={iniciales} color={color} logoUrl={logoInicial} grande />
          <div className="flex flex-wrap gap-2">
            <input ref={entrada} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={elegirArchivo} aria-label="Elegir logotipo" />
            <Boton variante="secundario" tamano="sm" disabled={subiendo} onClick={() => entrada.current?.click()}>
              <Icono nombre="archivo" />
              {subiendo ? "Guardando…" : logoInicial ? "Cambiar logotipo" : "Subir logotipo"}
            </Boton>
            {logoInicial && (
              <Boton variante="fantasma" tamano="sm" disabled={subiendo} onClick={quitar}>
                Quitar
              </Boton>
            )}
          </div>
        </div>
        <span className="n2c-caption n2c-muted">PNG, JPG o WebP, máximo 1 MB. Mejor cuadrado y con fondo transparente. Sin logotipo se muestran tus iniciales.</span>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!guardandoColor) startTransition(() => enviarColor(color));
        }}
      >
        <span className="n2c-label">Color principal</span>
        <AvisoFormulario error={guardandoColor ? undefined : estadoColor.error} ok={guardandoColor ? undefined : estadoColor.ok} />
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
              suppressHydrationWarning
            />
          ))}
          <label className="n2c-small flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pr-3 pl-1">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="size-6 cursor-pointer" />
            <span className="n2c-mono">{color}</span>
          </label>
        </div>

        {/* Vista previa de la cabecera del portal con esta marca. */}
        <div style={estilo} className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <LogoAgencia iniciales={iniciales} logoUrl={logoInicial} />
            <span className="font-bold">{nombre}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="n2c-progress w-32"><span style={{ width: "60%" }} /></div>
            <span className="n2c-btn n2c-btn--primary n2c-btn--sm" aria-hidden="true">Entrar al portal</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Boton type="submit" variante="secundario" disabled={color === colorInicial || guardandoColor} aria-busy={guardandoColor}>
            {guardandoColor ? "Guardando…" : "Guardar color"}
          </Boton>
        </div>
      </form>
    </section>
  );
}
