import { pendientesDe, type Portal } from "./tipos";

/** Pasos del asistente de configuración de un portal, en orden (paso n = índice n - 1). */
export const PASOS = [
  "Datos del cliente",
  "Base de Notion",
  "Campos visibles",
  "Marca y vista previa",
  "Contraseña y publicación",
] as const;

/**
  Qué pasos están hechos, cuál mostrar y qué falta para publicar.
  Sin `?paso=` válido se abre el primer paso pendiente.
*/
export function estadoAsistente(
  portal: Pick<Portal, "fuente_notion_id" | "propiedades_visibles">,
  tieneContrasena: boolean,
  pasoPedido: unknown,
) {
  const completos = [
    1,
    ...(portal.fuente_notion_id ? [2] : []),
    ...(portal.propiedades_visibles.length ? [3, 4] : []),
    ...(tieneContrasena ? [5] : []),
  ];
  const pedido = Number(pasoPedido);
  const primeroPendiente = [2, 3, 4, 5].find((n) => !completos.includes(n)) ?? 5;
  const paso = Number.isInteger(pedido) && pedido >= 1 && pedido <= PASOS.length ? pedido : primeroPendiente;
  return { completos, paso, pendientes: pendientesDe(portal, tieneContrasena) };
}
