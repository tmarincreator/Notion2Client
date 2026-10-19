import "server-only";
import type { DataSourceObjectResponse, PageObjectResponse, RichTextItemResponse } from "@notionhq/client";

/*
  Convierte la estructura y los valores de Notion a formatos sencillos que las
  pantallas ya saben mostrar. Las propiedades que aún no sabemos mostrar se
  marcan como "no compatibles" en vez de romper el portal.
*/

/** Tipos de propiedad que el portal sabe mostrar, con el nombre que ve la agencia. */
export type TipoPropiedadNotion = "Título" | "Estado" | "Fecha" | "Selección" | "Texto" | "Archivos" | "Persona" | "Número";

type ConfigPropiedad = DataSourceObjectResponse["properties"][string];
type ValorPropiedad = PageObjectResponse["properties"][string];

export type PropiedadLeida = {
  id: string;
  nombre: string;
  /** null = todavía no podemos mostrar este tipo en el portal. */
  tipo: TipoPropiedadNotion | null;
  tipoNotion: string;
  /** El nombre sugiere información interna (coste, margen, notas…). */
  sensible: boolean;
};

export type ArchivoLeido = { nombre: string; url: string };

export type ValorLeido =
  | { tipo: "texto"; valor: string }
  | { tipo: "numero"; valor: number }
  | { tipo: "fecha"; inicio: string; fin: string | null }
  | { tipo: "lista"; valor: string[] }
  | { tipo: "archivos"; valor: ArchivoLeido[] }
  | { tipo: "vacio" };

const TIPOS: Partial<Record<ConfigPropiedad["type"], TipoPropiedadNotion>> = {
  title: "Título",
  status: "Estado",
  date: "Fecha",
  select: "Selección",
  multi_select: "Selección",
  rich_text: "Texto",
  url: "Texto",
  email: "Texto",
  phone_number: "Texto",
  files: "Archivos",
  people: "Persona",
  number: "Número",
};

// Palabras que suelen indicar datos internos que no conviene enseñar al cliente.
const PATRON_SENSIBLE =
  /cost|margen|margin|tarifa|rate|precio|price|presupuesto|budget|factur|invoice|beneficio|profit|sueldo|salari|intern|privad|private|confidencial|secret|contraseña|password/i;

export function esSensible(nombre: string) {
  return PATRON_SENSIBLE.test(nombre);
}

export function leerPropiedades(fuente: DataSourceObjectResponse): PropiedadLeida[] {
  return Object.values(fuente.properties).map((p) => ({
    id: p.id,
    nombre: p.name,
    tipo: TIPOS[p.type] ?? null,
    tipoNotion: p.type,
    sensible: esSensible(p.name),
  }));
}

export function textoPlano(partes: RichTextItemResponse[]) {
  return partes.map((p) => p.plain_text).join("");
}

function texto(valor: string | null | undefined): ValorLeido {
  return valor ? { tipo: "texto", valor } : { tipo: "vacio" };
}

export function leerValor(p: ValorPropiedad): ValorLeido {
  switch (p.type) {
    case "title":
      return texto(textoPlano(p.title));
    case "rich_text":
      return texto(textoPlano(p.rich_text));
    case "status":
      return texto(p.status?.name);
    case "select":
      return texto(p.select?.name);
    case "multi_select":
      return p.multi_select.length ? { tipo: "lista", valor: p.multi_select.map((o) => o.name) } : { tipo: "vacio" };
    case "url":
      return texto(p.url);
    case "email":
      return texto(p.email);
    case "phone_number":
      return texto(p.phone_number);
    case "number":
      return p.number === null ? { tipo: "vacio" } : { tipo: "numero", valor: p.number };
    case "date":
      return p.date ? { tipo: "fecha", inicio: p.date.start, fin: p.date.end } : { tipo: "vacio" };
    case "people": {
      const nombres = p.people.map((u) => ("name" in u && u.name) || "").filter(Boolean);
      return nombres.length ? { tipo: "lista", valor: nombres } : { tipo: "vacio" };
    }
    case "files": {
      const archivos = p.files.flatMap((f): ArchivoLeido[] => {
        if (f.type === "file") return [{ nombre: f.name, url: f.file.url }];
        if (f.type === "external") return [{ nombre: f.name, url: f.external.url }];
        return [];
      });
      return archivos.length ? { tipo: "archivos", valor: archivos } : { tipo: "vacio" };
    }
    default:
      return { tipo: "vacio" };
  }
}
