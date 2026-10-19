import { Icono, type NombreIcono } from "@/components/ui/Icono";
import { Badge, type TonoBadge } from "@/components/ui/Badge";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import type { EstadoPortal, Portal } from "@/lib/portales/tipos";

const formatoFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const estados: Record<EstadoPortal, { texto: string; tono: TonoBadge; enlace?: string }> = {
  publicado: { texto: "Publicado", tono: "exito" },
  borrador: { texto: "Borrador", tono: "borrador", enlace: "Sin publicar" },
  archivado: { texto: "Archivado", tono: "archivado", enlace: "Desactivado" },
};

export function BadgeEstadoPortal({ estado }: { estado: EstadoPortal }) {
  return <Badge tono={estados[estado].tono}>{estados[estado].texto}</Badge>;
}

/* Una fila de la tabla de portales del dashboard, con sus acciones según el estado. */
export function FilaPortal({
  portal: p,
  onCopiar,
  onRestaurar,
}: {
  portal: Portal;
  onCopiar: (slug: string) => void;
  onRestaurar: (id: string) => void;
}) {
  const publicado = p.estado === "publicado";

  return (
    <tr>
      <td>
        <div className="flex flex-col">
          <b className="text-sm font-semibold">{p.nombre}</b>
          <span className="text-[13px] text-[var(--ink-muted)]">{p.cliente}</span>
        </div>
      </td>
      <td>
        <div className="flex flex-col items-start gap-1">
          <BadgeEstadoPortal estado={p.estado} />
        </div>
      </td>
      <td className={publicado ? "n2c-mono" : ""} style={{ fontSize: 13, color: "var(--ink-muted)" }}>
        {publicado ? `/p/${p.slug}` : estados[p.estado].enlace}
      </td>
      <td style={{ color: "var(--ink-muted)" }} suppressHydrationWarning>{formatoFecha.format(new Date(p.actualizado))}</td>
      <td>
        <div className="n2c-actions">
          {publicado && (
            <>
              <AccionIcono icono="editar" texto="Editar portal" href={`/portales/${p.id}?paso=1`} />
              <AccionIcono icono="ojo" texto="Vista previa" href={`/vista-previa/${p.id}`} />
              <AccionIcono icono="abrir" texto="Abrir portal en una pestaña nueva" href={`/p/${p.slug}`} nuevaPestana />
              <Boton variante="fantasma" tamano="icono" aria-label="Copiar enlace" title="Copiar enlace" onClick={() => onCopiar(p.slug)}>
                <Icono nombre="copiar" />
              </Boton>
            </>
          )}
          {p.estado === "borrador" && (
            <BotonEnlace variante="secundario" tamano="sm" href={`/portales/${p.id}`}>Continuar</BotonEnlace>
          )}
          {p.estado === "archivado" && (
            <Boton variante="fantasma" tamano="sm" onClick={() => onRestaurar(p.id)}>Restaurar</Boton>
          )}
        </div>
      </td>
    </tr>
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
