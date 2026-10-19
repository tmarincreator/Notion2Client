import { connection } from "next/server";
import { Icono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";
import { BotonActualizar } from "./BotonActualizar";
import { FormConexionNotion } from "./FormConexionNotion";
import { comprobarConexion, listarBases } from "@/lib/notion/bases";
import { conexionAgencia, tokenAgencia } from "@/lib/notion/conexion";
import { formatearMomento } from "@/lib/formato";

/*
  Ajustes → Conexión con Notion: estado de la conexión de la agencia (comprobada
  en directo), formulario del token y bases de datos que puede leer la integración.
*/
export async function SeccionNotion() {
  // Notion se consulta en cada visita: el estado de la conexión debe ser el actual.
  await connection();
  const [guardada, token] = await Promise.all([conexionAgencia(), tokenAgencia()]);
  const [conexion, bases] = token ? await Promise.all([comprobarConexion(token), listarBases(token)]) : [null, null];

  // Hay conexión guardada pero el token no se puede descifrar (p. ej. cambió NOTION_TOKEN_KEY).
  const error: { mensaje: string; extra?: string } | null =
    guardada && !token
      ? { mensaje: "No podemos leer el token guardado.", extra: "Vuelve a pegarlo abajo para reconectar Notion." }
      : conexion && !conexion.ok
        ? {
            mensaje: conexion.error.mensaje,
            extra: conexion.error.tipo === "token-invalido" ? "Genera un token nuevo en notion.so/profile/integrations y pégalo abajo." : undefined,
          }
        : null;

  return (
    <>
      <section className="n2c-card flex flex-col gap-5 p-6" aria-labelledby="h-notion">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="n2c-h3" id="h-notion">Conexión con Notion</h2>
            {!guardada ? (
              <Badge tono="borrador">Desconectado</Badge>
            ) : error ? (
              <Badge tono="peligro">Error</Badge>
            ) : (
              <Badge tono="exito">Conectado</Badge>
            )}
          </div>
          {guardada && <BotonActualizar texto="Comprobar de nuevo" />}
        </div>

        {guardada && conexion?.ok && (
          <dl className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            <Dato etiqueta="Espacio de trabajo" valor={conexion.datos.espacio} />
            <Dato etiqueta="Integración" valor={conexion.datos.integracion} />
            <Dato etiqueta="Credencial" valor={guardada.tokenVisible} mono />
          </dl>
        )}
        {error && <AvisoError mensaje={error.mensaje} extra={error.extra} />}
        {!guardada && (
          <p className="n2c-small n2c-muted">
            Conecta la integración de tu espacio de Notion. Notion2Client solo podrá leer las bases que compartas con ella.
          </p>
        )}

        <FormConexionNotion conectado={!!guardada} />

        <details className="n2c-small n2c-muted">
          <summary className="cursor-pointer font-semibold text-[var(--ink)]">¿Cómo se obtiene el token?</summary>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5">
            <li>Entra en notion.so/profile/integrations y crea una integración interna.</li>
            <li>En sus permisos basta con «Read content»: el portal solo lee.</li>
            <li>Copia el token (empieza por «ntn_») y pégalo arriba.</li>
            <li>En cada base que quieras usar: ••• → Conexiones → añade tu integración.</li>
          </ol>
        </details>
      </section>

      {conexion?.ok && bases && (
        <section className="n2c-card overflow-hidden" aria-labelledby="h-bases">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-[18px]">
            <div className="flex flex-col gap-0.5">
              <h2 className="n2c-h3" id="h-bases">Bases de datos accesibles</h2>
              <span className="n2c-small n2c-muted">Solo aparecen las bases compartidas con la integración.</span>
            </div>
            <BotonActualizar texto="Actualizar lista" />
          </div>

          {!bases.ok ? (
            <div className="p-5"><AvisoError mensaje={bases.error.mensaje} /></div>
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
                      <span className="n2c-small n2c-muted">Editada {formatearMomento(b.editada)}</span>
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

function AvisoError({ mensaje, extra }: { mensaje: string; extra?: string }) {
  return (
    <div className="n2c-banner n2c-banner--danger" role="alert">
      <Icono nombre="aviso" />
      <div className="n2c-banner__body">
        <strong>{mensaje}</strong>
        {extra && <span>{extra}</span>}
      </div>
    </div>
  );
}
