import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cifrarToken, descifrarToken } from "@/lib/notion/cifrado";

const TOKEN = "ntn_" + "a1B2c3".repeat(8);

beforeEach(() => vi.stubEnv("NOTION_TOKEN_KEY", randomBytes(32).toString("base64")));
afterEach(() => vi.unstubAllEnvs());

describe("cifrado de los tokens de Notion", () => {
  it("descifra lo que cifra y el texto guardado no contiene el token", () => {
    const cifrado = cifrarToken(TOKEN);
    expect(cifrado.startsWith("v1.")).toBe(true);
    expect(cifrado).not.toContain(TOKEN);
    expect(descifrarToken(cifrado)).toBe(TOKEN);
  });

  it("cifra distinto cada vez (IV aleatorio)", () => {
    expect(cifrarToken(TOKEN)).not.toBe(cifrarToken(TOKEN));
  });

  it("devuelve null si el texto se ha manipulado", () => {
    const [v, iv, etiqueta, datos] = cifrarToken(TOKEN).split(".");
    const otro = datos.startsWith("A") ? `B${datos.slice(1)}` : `A${datos.slice(1)}`;
    expect(descifrarToken([v, iv, etiqueta, otro].join("."))).toBeNull();
    expect(descifrarToken("v1.no.es.valido")).toBeNull();
    expect(descifrarToken("cualquier cosa")).toBeNull();
  });

  it("devuelve null con otra clave", () => {
    const cifrado = cifrarToken(TOKEN);
    vi.stubEnv("NOTION_TOKEN_KEY", randomBytes(32).toString("base64"));
    expect(descifrarToken(cifrado)).toBeNull();
  });

  it("exige una clave de 32 bytes", () => {
    vi.stubEnv("NOTION_TOKEN_KEY", randomBytes(16).toString("base64"));
    expect(() => cifrarToken(TOKEN)).toThrow(/NOTION_TOKEN_KEY/);
  });
});
