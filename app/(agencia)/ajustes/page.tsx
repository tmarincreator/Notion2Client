import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Icono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";
import { BotonActualizar } from "@/components/agencia/BotonActualizar";
import { FormMarcaAgencia } from "@/components/agencia/FormMarcaAgencia";
import { obtenerUsuario } from "@/lib/auth";
import { obtenerMarca } from "@/lib/agencia";
import { comprobarConexion, listarBases } from "@/lib/notion/bases";
import type { ErrorNotion } from "@/lib/notion/errores";

export const metadata: Metadata = { title: "Marca y Notion · Notion2Client" };

export default function PaginaAjustes() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="n2c-h1">Marca y Notion</h1>
        <p className="n2c-muted">Conecta tu espacio de Notion y revisa qué bases de datos puede leer Notion2Client.</p>
      </div>

      <Suspense fallback={<SeccionCargando />}>
        <SeccionNotion />
      </Suspense>

      <Suspense fallback={<SeccionCargando />}>
        <SeccionMarca />
      </Suspense>
    </>
  );
}

async function SeccionMarca() {
  const [usuario, marca] = await Promise.all([obtenerUsuario(), obtenerMarca()]);
  return (
    <FormMarcaAgencia
      agenciaId={usuario.id}
      nombre={usuario.nombre}
      iniciales={usuario.iniciales}
      colorInicial={marca.color}
      logoInicial={marca.logoUrl}
    />
  );
}

async function SeccionNotion() {
  // Notion se consulta en cada visita: el estado de la conexión debe ser el actual.
  await connection();
  const [conexion, bases] = await Promise.all([comprobarConexion(), listarBases()]);

  return (
    <>
      <section className="n2c-card flex flex-col gap-5 p-6" aria-labelledby="h-notion">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="n2c-h3" id="h-notion">Conexión con Notion</h2>
            {conexion.ok ? (
              <Badge tono="exito">Conectado</Badge>
            ) : conexion.error.tipo === "sin-token" ? (
              <Badge tono="borrador">Desconectado</Badge>
            ) : (
              <Badge tono="peligro">Error</Badge>
            )}
          </div>
          <BotonActualizar texto="Comprobar de nuevo" />
        </div>

        {conexion.ok ? (
          <dl className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            <Dato etiqueta="Espacio de trabajo" valor={conexion.datos.espacio} />
            <Dato etiqueta="Integración" valor={conexion.datos.integracion} />
            <Dato etiqueta="Credencial" valor={conexion.datos.tokenVisible ?? "—"} mono />
          </dl>
        ) : (
          <AvisoError error={conexion.error} />
        )}

        <details className="n2c-small n2c-muted">
          <summary className="cursor-pointer font-semibold text-[var(--ink)]">¿Cómo se obtiene la credencial?</summary>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5">
            <li>Entra en notion.so/profile/integrations y crea una integración interna.</li>
            <li>En sus permisos basta con «Read content»: el portal solo lee.</li>
            <li>Copia el token (empieza por «ntn_»).</li>
            <li>En cada base que quieras usar: ••• → Conexiones → añade tu integración.</li>
          </ol>
        </details>
      </section>

      {conexion.ok && (
        <section className="n2c-card overflow-hidden" aria-labelledby="h-bases">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-[18px]">
            <div className="flex flex-col gap-0.5">
              <h2 className="n2c-h3" id="h-bases">Bases de datos accesibles</h2>
              <span className="n2c-small n2c-muted">Solo aparecen las bases compartidas con la integración.</span>
            </div>
            <BotonActualizar texto="Actualizar lista" />
          </div>

          {!bases.ok ? (
            <div className="p-5"><AvisoError error={bases.error} /></div>
          ) : bases.datos.length === 0 ? (
            <div className="n2c-empty">
              <span className="n2c-empty__icon"><Icono nombre="capas" /></span>
              <h3 className="n2c-h3">No encontramos ninguna base de datos</h3>
              <p>Abre en Notion la base que quieras usar, pulsa ••• → Conexiones y añade tu integración. Después pulsa «Actualizar lista».</p>
            </div>
          ) : (
            <ul>
              {bases.datos.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5 last:border-b-0">
                  <span className="flex min-w-0 flex-[1_1_220px] items-center gap-3">
                    <Icono nombre="capas" style={{ color: "var(--ink-muted)" }} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-semibold">{b.nombre}</span>
                      <span className="n2c-small n2c-muted">Editada {formatearFecha(b.editada)}</span>
                    </span>
                  </span>
                  <a href={b.url} target="_blank" rel="noreferrer" className="n2c-link n2c-small flex items-center gap-1.5">
                    Abrir en Notion
                    <Icono nombre="abrir" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}

function Dato({ etiqueta, valor, mono = false }: { etiqueta: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="n2c-caption n2c-muted">{etiqueta}</dt>
      <dd className={`truncate font-semibold ${mono ? "n2c-mono" : ""}`}>{valor}</dd>
    </div>
  );
}

function AvisoError({ error }: { error: ErrorNotion }) {
  const textoExtra =
    error.tipo === "sin-token"
      ? "Añade NOTION_TOKEN en .env.local y reinicia el servidor."
      : error.tipo === "token-invalido"
        ? "Genera un token nuevo en notion.so/profile/integrations y sustitúyelo en .env.local."
        : null;
  return (
    <div className={`n2c-banner ${error.tipo === "sin-token" ? "n2c-banner--warning" : "n2c-banner--danger"}`} role="alert">
      <Icono nombre="aviso" />
      <div className="n2c-banner__body">
        <strong>{error.mensaje}</strong>
        {textoExtra && <span>{textoExtra}</span>}
      </div>
    </div>
  );
}

function SeccionCargando() {
  return (
    <div className="n2c-card flex flex-col gap-4 p-6" aria-busy="true" aria-label="Comprobando la conexión con Notion">
      <span className="n2c-skel" style={{ width: "30%", height: 20 }} />
      <div className="flex gap-6">
        {[1, 2, 3].map((n) => <span key={n} className="n2c-skel flex-1" />)}
      </div>
    </div>
  );
}

const formatoFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

function formatearFecha(iso: string) {
  return formatoFecha.format(new Date(iso));
}
