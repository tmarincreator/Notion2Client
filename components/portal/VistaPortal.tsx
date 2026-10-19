"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/ui/Icono";
import { LogoAgencia } from "@/components/ui/Logo";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { salirPortal } from "@/app/p/[slug]/actions";
import type { DatosPortal } from "@/lib/portales/tipos";
import { TarjetaDato } from "./TarjetaDato";
import { BadgeEntregable, DetalleEntregable } from "./DetalleEntregable";

/*
  Portal del cliente: cabecera con la marca de la agencia, resumen y entregables.
  `datos` ya llega filtrado del servidor: solo trae las propiedades visibles.
  Con `vistaPrevia` lo usa la agencia antes de publicar (sin botón de salir).
*/
export function VistaPortal({
  datos,
  error,
  vistaPrevia,
}: {
  datos: DatosPortal;
  error?: string;
  vistaPrevia?: { volver: string };
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const estilo = { "--accent": datos.color, "--accent-hover": datos.color } as React.CSSProperties;

  function salir() {
    iniciar(async () => {
      await salirPortal(datos.slug);
      router.refresh();
    });
  }

  return (
    <div style={estilo} className="min-h-screen">
      {vistaPrevia && (
        <div className="border-b border-[var(--border)] bg-[var(--warning-soft)] text-[var(--warning-ink)]">
          <div className="wrap flex min-h-12 flex-wrap items-center justify-between gap-3 py-2">
            <span className="n2c-small flex items-center gap-2 font-semibold">
              <Icono nombre="ojo" />
              Vista previa · así verá el portal tu cliente
            </span>
            <BotonEnlace variante="secundario" tamano="sm" href={vistaPrevia.volver}>
              Volver a la configuración
            </BotonEnlace>
          </div>
        </div>
      )}

      <header className="border-b border-[var(--border)] bg-white">
        <div className="wrap flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <LogoAgencia iniciales={datos.agencia.iniciales} logoUrl={datos.agencia.logo} />
            <span className="text-[15px] font-bold">{datos.agencia.nombre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Boton variante="fantasma" tamano="sm" disabled={pendiente} onClick={() => iniciar(() => router.refresh())}>
              <Icono nombre="actualizar" />
              <span className="hide-sm">{pendiente ? "Actualizando…" : "Actualizar"}</span>
            </Boton>
            {!vistaPrevia && (
              <Boton variante="fantasma" tamano="sm" disabled={pendiente} onClick={salir}>
                <Icono nombre="salir" />
                Salir
              </Boton>
            )}
          </div>
        </div>
      </header>

      <main className="wrap flex flex-col gap-7 pt-10 pb-14">
        <div className="flex flex-col gap-1.5">
          <span className="n2c-label n2c-muted">{datos.cliente}</span>
          <h1 className="n2c-h1">{datos.nombre}</h1>
          {datos.actualizado && (
            <span className="n2c-small n2c-muted flex items-center gap-1.5">
              <Icono nombre="reloj" />
              Información actualizada {datos.actualizado}
            </span>
          )}
        </div>

        {/* Solo para la agencia: el cliente no necesita saber que hay un límite. */}
        {vistaPrevia && datos.limiteAlcanzado && (
          <div className="n2c-banner n2c-banner--warning" role="status">
            <Icono nombre="aviso" />
            <div className="n2c-banner__body">
              Esta base tiene más de {datos.limiteAlcanzado} registros: el portal muestra solo los {datos.limiteAlcanzado} editados más recientemente.
            </div>
          </div>
        )}

        {error ? (
          <div className="n2c-card n2c-empty">
            <span className="n2c-empty__icon"><Icono nombre="aviso" /></span>
            <h2 className="n2c-h3">No se ha podido cargar el proyecto</h2>
            <p>{error}</p>
            <Boton variante="secundario" disabled={pendiente} onClick={() => iniciar(() => router.refresh())}>
              Volver a intentar
            </Boton>
          </div>
        ) : datos.entregables.length === 0 ? (
          <SinEntregables />
        ) : (
          <Contenido datos={datos} />
        )}
      </main>
    </div>
  );
}

function Contenido({ datos }: { datos: DatosPortal }) {
  const items = datos.entregables;
  const [seleccionado, setSeleccionado] = useState(
    (items.find((i) => i.estado?.enRevision) ?? items[0]).id,
  );
  const detalle = useRef<HTMLElement>(null);
  const sel = items.find((i) => i.id === seleccionado) ?? items[0];

  const conEstado = items.some((i) => i.estado);
  const completados = items.filter((i) => i.estado?.completado).length;
  const progreso = Math.round((completados / items.length) * 100);
  const proxima = items.find((i) => !i.estado?.completado && i.fecha);
  const enRevision = items.filter((i) => i.estado?.enRevision);

  function elegir(id: string) {
    setSeleccionado(id);
    // En móvil el detalle queda debajo de la lista: lo acercamos a la vista.
    if (window.innerWidth < 860) detalle.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {conEstado && (
          <TarjetaDato
            etiqueta="Progreso"
            valor={`${progreso}%`}
            detalle={`${completados} de ${items.length} completados`}
            progreso={progreso}
          />
        )}
        {proxima && <TarjetaDato etiqueta="Próxima entrega" valor={proxima.fecha!} detalle={proxima.titulo} />}
        {conEstado && (
          <TarjetaDato
            etiqueta="Pendiente de tu revisión"
            valor={enRevision.length}
            detalle={enRevision.length ? `Revisa: ${enRevision[0].titulo}` : "Nada pendiente por ahora"}
          />
        )}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <section className="n2c-card min-w-0 flex-[999_1_480px] overflow-hidden" aria-labelledby="h-entregables">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-[18px]">
            <h2 className="n2c-h3" id="h-entregables">Entregables</h2>
            <span className="n2c-caption n2c-muted">{items.length} elementos</span>
          </div>
          <ul>
            {items.map((it) => (
              <li key={it.id} className="border-b border-[var(--border)] last:border-b-0">
                <button
                  type="button"
                  className="row-btn flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  style={it.id === sel.id ? { background: "var(--surface-sunken)" } : undefined}
                  aria-pressed={it.id === sel.id}
                  onClick={() => elegir(it.id)}
                >
                  <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">{it.titulo}</span>
                    {it.fecha && <span className="n2c-small n2c-muted">{datos.etiquetaFecha ?? "Fecha"}: {it.fecha}</span>}
                  </span>
                  <BadgeEntregable estado={it.estado} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <DetalleEntregable ref={detalle} entregable={sel} etiquetaFecha={datos.etiquetaFecha} />
      </div>
    </>
  );
}

function SinEntregables() {
  return (
    <div className="n2c-card n2c-empty">
      <span className="n2c-empty__icon"><Icono nombre="capas" /></span>
      <h2 className="n2c-h3">Todavía no hay entregables</h2>
      <p>Cuando tu contacto añada tareas o entregables al proyecto, aparecerán aquí.</p>
    </div>
  );
}
