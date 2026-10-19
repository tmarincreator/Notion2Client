import "server-only";
import { isFullDataSource, isFullPage } from "@notionhq/client";
import { getNotionClient } from "./cliente";
import { conNotion } from "./errores";
import { leerPropiedades, leerValor, textoPlano, type PropiedadLeida, type ValorLeido } from "./propiedades";

/*
  Operaciones de lectura sobre Notion. Todas reciben el token de la agencia
  (null si no ha conectado Notion) y devuelven { ok, datos } o
  { ok: false, error } con un mensaje ya preparado para la pantalla.

  Nota: desde la versión 2025-09-03 de la API, una "base de datos" de Notion
  puede contener varias fuentes de datos (data sources). Lo que la agencia
  elige y lo que leemos son las fuentes de datos; las llamamos "bases" en la app.
*/

export type ConexionLeida = { espacio: string; integracion: string };

export type BaseResumen = { id: string; nombre: string; url: string; editada: string };

export type BaseDetalle = BaseResumen & { propiedades: PropiedadLeida[] };

export type Registro = { id: string; valores: Record<string, ValorLeido> };

/** Comprueba que el token funciona y devuelve el espacio de trabajo conectado. */
export function comprobarConexion(token: string | null) {
  return conNotion(async (): Promise<ConexionLeida> => {
    const yo = await getNotionClient(token).users.me();
    const espacio = yo.type === "bot" && "workspace_name" in yo.bot ? yo.bot.workspace_name : null;
    return { espacio: espacio ?? "Notion", integracion: yo.name ?? "Integración" };
  });
}

/** Bases (fuentes de datos) compartidas con la integración. */
export function listarBases(token: string | null) {
  return conNotion(async (): Promise<BaseResumen[]> => {
    const notion = getNotionClient(token);
    const resultados = [];
    let cursor: string | undefined;
    do {
      const pagina = await notion.search({
        filter: { property: "object", value: "data_source" },
        sort: { timestamp: "last_edited_time", direction: "descending" },
        start_cursor: cursor,
      });
      resultados.push(...pagina.results);
      cursor = pagina.has_more ? (pagina.next_cursor ?? undefined) : undefined;
    } while (cursor);

    return resultados.filter(isFullDataSource).map((f) => ({
      id: f.id,
      nombre: textoPlano(f.title) || "Sin título",
      url: f.url,
      editada: f.last_edited_time,
    }));
  });
}

/** Nombre y propiedades (con su tipo) de una base. */
export function obtenerBase(token: string | null, id: string) {
  return conNotion(async (): Promise<BaseDetalle> => {
    const f = await getNotionClient(token).dataSources.retrieve({ data_source_id: id });
    if (!isFullDataSource(f)) throw new Error("Respuesta parcial de Notion");
    return {
      id: f.id,
      nombre: textoPlano(f.title) || "Sin título",
      url: f.url,
      editada: f.last_edited_time,
      propiedades: leerPropiedades(f),
    };
  });
}

/**
  Lee registros de una base. Solo se convierten las propiedades de
  `propiedadesVisibles` (por id): las ocultas se descartan aquí, en el servidor,
  y nunca llegan al navegador del cliente.
*/
export function leerRegistros(token: string | null, id: string, opciones: { propiedadesVisibles: string[]; limite?: number }) {
  const visibles = new Set(opciones.propiedadesVisibles);
  const limite = opciones.limite ?? 100;

  return conNotion(async (): Promise<Registro[]> => {
    const notion = getNotionClient(token);
    const registros: Registro[] = [];
    let cursor: string | undefined;

    do {
      const pagina = await notion.dataSources.query({
        data_source_id: id,
        start_cursor: cursor,
        page_size: Math.min(100, limite - registros.length),
        // Pedimos a Notion solo las propiedades visibles.
        filter_properties: [...visibles],
      });
      for (const fila of pagina.results) {
        if (!isFullPage(fila)) continue;
        const valores: Record<string, ValorLeido> = {};
        for (const valor of Object.values(fila.properties)) {
          if (visibles.has(valor.id)) valores[valor.id] = leerValor(valor);
        }
        registros.push({ id: fila.id, valores });
      }
      cursor = pagina.has_more ? (pagina.next_cursor ?? undefined) : undefined;
    } while (cursor && registros.length < limite);

    return registros;
  });
}

/** Muestra pequeña para la vista de prueba al configurar un portal. */
export function leerMuestra(token: string | null, id: string, propiedadesVisibles: string[]) {
  return leerRegistros(token, id, { propiedadesVisibles, limite: 5 });
}
