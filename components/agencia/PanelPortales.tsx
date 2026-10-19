"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Icono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import { Input } from "@/components/ui/Campo";
import { FilaPortal } from "./FilaPortal";
import { restaurarPortal } from "@/app/(agencia)/portales/actions";
import type { EstadoPortal, Portal } from "@/lib/portales/tipos";

type Filtro = "todos" | EstadoPortal;
export type EstadoNotion = { conectado: true; espacio: string } | { conectado: false; mensaje: string };

const pestanas: { id: Filtro; texto: string }[] = [
  { id: "todos", texto: "Todos" },
  { id: "publicado", texto: "Publicados" },
  { id: "borrador", texto: "Borradores" },
  { id: "archivado", texto: "Archivados" },
];

/* Dashboard de la agencia: cabecera, pestañas, buscador y tabla de portales. */
export function PanelPortales({ portales, notion }: { portales: Portal[]; notion: EstadoNotion }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  const texto = busqueda.trim().toLowerCase();
  const filas = portales
    .filter((p) => filtro === "todos" || p.estado === filtro)
    .filter((p) => !texto || p.nombre.toLowerCase().includes(texto) || p.cliente.toLowerCase().includes(texto));

  async function copiarEnlace(slug: string) {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setAviso("Enlace copiado");
    } catch {
      setAviso("No se pudo copiar. Enlace: " + url);
    }
  }

  function restaurar(id: string) {
    iniciar(async () => {
      await restaurarPortal(id);
      setAviso("Portal restaurado como borrador");
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="n2c-h1">Portales</h1>
          <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-[var(--ink-muted)]">
            {notion.conectado ? (
              <>
                <Badge tono="exito">Notion conectado</Badge>
                <span>Espacio {notion.espacio}</span>
              </>
            ) : (
              <>
                <Badge tono="peligro">Notion sin conectar</Badge>
                <Link className="n2c-link" href="/ajustes">{notion.mensaje} Revisar</Link>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {portales.length > 0 && (
            <div className="n2c-input-wrap n2c-input-wrap--icon w-[260px] max-w-full">
              <Icono nombre="buscar" />
              <Input
                type="search"
                placeholder="Buscar cliente o portal"
                aria-label="Buscar portales"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          )}
          <BotonEnlace href="/portales/nuevo">
            <Icono nombre="mas" />
            Nuevo portal
          </BotonEnlace>
        </div>
      </div>

      {portales.length === 0 ? (
        <div className="n2c-card n2c-empty">
          <span className="n2c-empty__icon"><Icono nombre="capas" /></span>
          <h2 className="n2c-h3">Crea tu primer portal</h2>
          <p>Elige una base de datos de Notion, decide qué campos ve tu cliente y comparte un enlace con contraseña.</p>
          <BotonEnlace href="/portales/nuevo">
            <Icono nombre="mas" />
            Nuevo portal
          </BotonEnlace>
        </div>
      ) : (
        <>
          <div className="n2c-tabs flex-wrap" role="tablist" aria-label="Filtrar portales">
            {pestanas.map((t) => (
              <button
                key={t.id}
                type="button"
                className="n2c-tab"
                role="tab"
                aria-selected={filtro === t.id}
                onClick={() => setFiltro(t.id)}
              >
                {t.texto}
                <span className="n2c-count">
                  {t.id === "todos" ? portales.length : portales.filter((p) => p.estado === t.id).length}
                </span>
              </button>
            ))}
          </div>

          {filas.length > 0 ? (
            <div className="n2c-card overflow-x-auto">
              <table className="n2c-table min-w-[720px]">
                <thead>
                  <tr>
                    <th style={{ width: "32%" }}>Portal</th>
                    <th>Estado</th>
                    <th>Enlace</th>
                    <th>Actualizado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((p) => (
                    <FilaPortal key={p.id} portal={p} onCopiar={copiarEnlace} onRestaurar={restaurar} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="n2c-card n2c-empty">
              <span className="n2c-empty__icon"><Icono nombre="buscar" /></span>
              <h2 className="n2c-h3">No hay portales que coincidan</h2>
              <p>Prueba con otro nombre de cliente o de portal, o cambia de pestaña.</p>
              {texto && (
                <Boton variante="secundario" onClick={() => setBusqueda("")}>Borrar búsqueda</Boton>
              )}
            </div>
          )}
        </>
      )}

      {aviso && (
        <div className="n2c-toast" role="status">
          <Icono nombre="check" />
          {aviso}
        </div>
      )}
    </>
  );
}

export function PanelPortalesCargando() {
  return (
    <>
      <h1 className="n2c-h1">Portales</h1>
      <div className="n2c-card py-2" aria-busy="true" aria-label="Cargando portales">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center gap-6 border-b border-[var(--border)] px-5 py-4 last:border-b-0">
            <div className="flex flex-[2] flex-col gap-2">
              <span className="n2c-skel" style={{ width: "60%" }} />
              <span className="n2c-skel" style={{ width: "35%", height: 10 }} />
            </div>
            <span className="n2c-skel max-w-[90px] flex-1" style={{ height: 22, borderRadius: 999 }} />
            <span className="n2c-skel hide-sm max-w-[120px] flex-1" />
            <span className="n2c-skel hide-sm max-w-[70px] flex-1" />
          </div>
        ))}
      </div>
    </>
  );
}
