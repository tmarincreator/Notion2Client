import { Icono, type NombreIcono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import type { EstadoPortal, Portal, TonoBadge } from "@/lib/portales/tipos";

const formatoFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const estados: Record<EstadoPortal, { texto: string; tono: TonoBadge; enlace?: string }> = {
  publicado: { texto: "Publicado", tono: "exito" },
  borrador: { texto: "Borrador", tono: "borrador", enlace: "Sin publicar" },
  archivado: { texto: "Archivado", tono: "archivado", enlace: "Desactivado" },
};

export type AccionPortal = "copiar" | "archivar" | "restaurar" | "borrar";

type PropsPortal = {
  portal: Portal;
  ocupado: boolean;
  onAccion: (accion: AccionPortal, portal: Portal) => void;
};

export function BadgeEstadoPortal({ estado }: { estado: EstadoPortal }) {
  return <Badge tono={estados[estado].tono}>{estados[estado].texto}</Badge>;
}

const enlaceDe = (p: Portal) => (p.estado === "publicado" ? `/p/${p.slug}` : estados[p.estado].enlace);

// La hora depende de la zona del navegador: puede no coincidir con la del servidor.
const Actualizado = ({ iso }: { iso: string }) => <span suppressHydrationWarning>{formatoFecha.format(new Date(iso))}</span>;

/* Una fila de la tabla de portales (escritorio). */
export function FilaPortal({ portal: p, ocupado, onAccion }: PropsPortal) {
  return (
    <tr>
      <td>
        <div className="flex flex-col">
          <b className="text-sm font-semibold">{p.nombre}</b>
          <span className="text-[13px] text-[var(--ink-muted)]">{p.cliente}</span>
        </div>
      </td>
      <td>
        <BadgeEstadoPortal estado={p.estado} />
      </td>
      <td className={p.estado === "publicado" ? "n2c-mono" : ""} style={{ fontSize: 13, color: "var(--ink-muted)" }}>
        {enlaceDe(p)}
      </td>
      <td style={{ color: "var(--ink-muted)" }}>
        <Actualizado iso={p.actualizado} />
      </td>
      <td>
        <AccionesPortal portal={p} ocupado={ocupado} onAccion={onAccion} />
      </td>
    </tr>
  );
}

/* El mismo portal como tarjeta (móvil), con las mismas acciones. */
export function TarjetaPortal({ portal: p, ocupado, onAccion }: PropsPortal) {
  return (
    <li className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <b className="text-[15px] font-semibold">{p.nombre}</b>
          <span className="text-[13px] text-[var(--ink-muted)]">{p.cliente}</span>
        </div>
        <BadgeEstadoPortal estado={p.estado} />
      </div>
      <div className="n2c-small n2c-muted flex flex-wrap gap-x-4 gap-y-1">
        <span className={p.estado === "publicado" ? "n2c-mono break-all" : ""}>{enlaceDe(p)}</span>
        <span>
          Actualizado <Actualizado iso={p.actualizado} />
        </span>
      </div>
      <AccionesPortal portal={p} ocupado={ocupado} onAccion={onAccion} />
    </li>
  );
}

function AccionesPortal({ portal: p, ocupado, onAccion }: PropsPortal) {
  // Nombre del portal en cada etiqueta: con lector de pantalla las filas no se confunden.
  const de = `«${p.nombre}»`;
  return (
    <div className="n2c-actions flex-wrap">
      {p.estado === "publicado" && (
        <>
          <AccionIcono icono="editar" texto={`Editar ${de}`} href={`/portales/${p.id}?paso=1`} />
          <AccionIcono icono="ojo" texto={`Vista previa de ${de}`} href={`/vista-previa/${p.id}`} />
          <AccionIcono icono="abrir" texto={`Abrir ${de} en una pestaña nueva`} href={`/p/${p.slug}`} nuevaPestana />
          <BotonIcono icono="copiar" texto={`Copiar enlace de ${de}`} disabled={ocupado} onClick={() => onAccion("copiar", p)} />
          <BotonIcono icono="archivar" texto={`Archivar ${de}`} disabled={ocupado} onClick={() => onAccion("archivar", p)} />
        </>
      )}
      {p.estado === "borrador" && (
        <>
          <AccionIcono icono="ojo" texto={`Vista previa de ${de}`} href={`/vista-previa/${p.id}`} />
          <BotonIcono icono="archivar" texto={`Archivar ${de}`} disabled={ocupado} onClick={() => onAccion("archivar", p)} />
          <BotonEnlace variante="secundario" tamano="sm" href={`/portales/${p.id}`} aria-label={`Continuar configurando ${de}`}>
            Continuar
          </BotonEnlace>
        </>
      )}
      {p.estado === "archivado" && (
        <>
          <BotonIcono icono="papelera" texto={`Borrar ${de} para siempre`} disabled={ocupado} onClick={() => onAccion("borrar", p)} />
          <Boton variante="fantasma" tamano="sm" disabled={ocupado} onClick={() => onAccion("restaurar", p)} aria-label={`Restaurar ${de}`}>
            Restaurar
          </Boton>
        </>
      )}
    </div>
  );
}

function BotonIcono({ icono, texto, ...resto }: { icono: NombreIcono; texto: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Boton variante="fantasma" tamano="icono" aria-label={texto} title={texto} {...resto}>
      <Icono nombre={icono} />
    </Boton>
  );
}

function AccionIcono({
  icono,
  texto,
  href,
  nuevaPestana = false,
}: {
  icono: NombreIcono;
  texto: string;
  href: string;
  nuevaPestana?: boolean;
}) {
  return (
    <BotonEnlace
      variante="fantasma"
      tamano="icono"
      href={href}
      aria-label={texto}
      title={texto}
      {...(nuevaPestana ? { target: "_blank", rel: "noopener" } : {})}
    >
      <Icono nombre={icono} />
    </BotonEnlace>
  );
}
