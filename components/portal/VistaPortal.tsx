"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/ui/Icono";
import { LogoAgencia } from "@/components/ui/Logo";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { estiloAcento } from "@/lib/color";
import type { DatosPortal } from "@/lib/portales/tipos";
import { ResumenPortal } from "./ResumenPortal";
import { ListaEntregables } from "./ListaEntregables";

/*
  Portal del cliente: cabecera con la marca de la agencia, resumen y entregables.
  `datos` ya llega filtrado del servidor: solo trae las propiedades visibles.
  `salir` borra la cookie de acceso (portal real o demo). Con `vistaPrevia` lo
  usa la agencia antes de publicar (sin botón de salir).
*/
export function VistaPortal({
  datos,
  error,
  salir,
  vistaPrevia,
}: {
  datos: DatosPortal;
  error?: string;
  salir?: () => Promise<void>;
  vistaPrevia?: { volver: string };
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const actualizar = () => iniciar(() => router.refresh());

  return (
    <div style={estiloAcento(datos.color)} className="min-h-screen">
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

      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="wrap flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <LogoAgencia iniciales={datos.agencia.iniciales} logoUrl={datos.agencia.logo} />
            <span className="text-[15px] font-bold">{datos.agencia.nombre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Boton variante="fantasma" tamano="sm" disabled={pendiente} onClick={actualizar} aria-label="Actualizar">
              <Icono nombre="actualizar" />
              <span className="hide-sm">{pendiente ? "Actualizando…" : "Actualizar"}</span>
            </Boton>
            {salir && !vistaPrevia && (
              <Boton
                variante="fantasma"
                tamano="sm"
                disabled={pendiente}
                onClick={() =>
                  iniciar(async () => {
                    await salir();
                    router.refresh();
                  })
                }
              >
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
          <div className="n2c-card n2c-empty" role="alert">
            <span className="n2c-empty__icon"><Icono nombre="aviso" /></span>
            <h2 className="n2c-h3">No se ha podido cargar el proyecto</h2>
            <p>{error}</p>
            <Boton variante="secundario" disabled={pendiente} onClick={actualizar}>
              Volver a intentar
            </Boton>
          </div>
        ) : datos.entregables.length === 0 ? (
          <div className="n2c-card n2c-empty">
            <span className="n2c-empty__icon"><Icono nombre="capas" /></span>
            <h2 className="n2c-h3">Todavía no hay entregables</h2>
            <p>Cuando tu contacto añada tareas o entregables al proyecto, aparecerán aquí.</p>
          </div>
        ) : (
          <>
            <ResumenPortal entregables={datos.entregables} />
            <ListaEntregables entregables={datos.entregables} etiquetaFecha={datos.etiquetaFecha} />
          </>
        )}
      </main>
    </div>
  );
}
