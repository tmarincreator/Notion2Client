import type { EntregablePortal } from "@/lib/portales/tipos";
import { TarjetaDato } from "./TarjetaDato";

/* Tarjetas de resumen del portal: progreso, próxima entrega y lo pendiente de revisar. */
export function ResumenPortal({ entregables }: { entregables: EntregablePortal[] }) {
  const conEstado = entregables.some((e) => e.estado);
  const completados = entregables.filter((e) => e.estado?.completado).length;
  const progreso = Math.round((completados / entregables.length) * 100);
  const proxima = entregables.find((e) => !e.estado?.completado && e.fecha);
  const enRevision = entregables.filter((e) => e.estado?.enRevision);

  if (!conEstado && !proxima) return null;

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {conEstado && (
        <TarjetaDato
          etiqueta="Progreso"
          valor={`${progreso}%`}
          detalle={`${completados} de ${entregables.length} completados`}
          progreso={progreso}
        />
      )}
      {proxima?.fecha && <TarjetaDato etiqueta="Próxima entrega" valor={proxima.fecha} detalle={proxima.titulo} />}
      {conEstado && (
        <TarjetaDato
          etiqueta="Pendiente de tu revisión"
          valor={enRevision.length}
          detalle={enRevision.length ? `Revisa: ${enRevision[0].titulo}` : "Nada pendiente por ahora"}
        />
      )}
    </div>
  );
}
