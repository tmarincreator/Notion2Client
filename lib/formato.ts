/*
  Formatos y validaciones compartidos (servidor y navegador).
*/

export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const COLOR_VALIDO = /^#[0-9a-fA-F]{6}$/;

/** "Estudio Norte" → "EN". Sin texto, "A" (de agencia). */
export const inicialesDe = (texto: string) =>
  texto
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]!.toUpperCase())
    .join("") || "A";

/*
  Fechas de Notion ("2025-10-22" o "2025-10-22T23:30:00.000+02:00").
  Notion las da en la zona horaria de quien las escribió, así que el día que
  hay que mostrar es la parte de la fecha tal cual. Convertirlas a otra zona
  (p. ej. UTC) movía las de última hora al día siguiente.
*/
const formatoDia = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatearFecha(iso: string) {
  return formatoDia.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

/*
  Momentos concretos (cuándo se editó algo) en la hora de España, que es la
  del público de la app. El servidor puede estar en cualquier zona.
*/
export const ZONA_HORARIA = "Europe/Madrid";
const formatoDiaAnio = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: ZONA_HORARIA });

export function formatearMomento(iso: string) {
  return formatoDiaAnio.format(new Date(iso));
}

/** "hace 5 min", "hace 3 h", "hace 2 días" o, si es más antiguo, "el 18 oct 2025". */
export function haceTiempo(iso: string, ahora: number) {
  const minutos = Math.floor((ahora - new Date(iso).getTime()) / 60_000);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
  return `el ${formatearMomento(iso)}`;
}
