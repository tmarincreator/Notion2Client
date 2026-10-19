import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cookies en memoria en lugar de las de Next.js.
const almacen = new Map<string, { valor: string; ruta?: string }>();
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nombre: string) => (almacen.has(nombre) ? { value: almacen.get(nombre)!.valor } : undefined),
    set: (nombre: string, valor: string, opciones?: { maxAge?: number; path?: string }) => {
      if (opciones?.maxAge === 0) almacen.delete(nombre);
      else almacen.set(nombre, { valor, ruta: opciones?.path });
    },
  }),
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }),
}));

const { concederAcceso, tieneAcceso, retirarAcceso, origenCliente } = await import("@/lib/portales/acceso");

beforeEach(() => {
  almacen.clear();
  vi.stubEnv("PORTAL_SECRET", "s".repeat(40));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("cookie de acceso al portal", () => {
  it("da acceso al portal con la versión con la que se concedió", async () => {
    await concederAcceso("acme", "portal", 3);
    expect(await tieneAcceso("acme", "portal", 3)).toBe(true);
    expect(almacen.get("n2c-portal-acme")?.ruta).toBe("/p/acme");
  });

  it("deja de valer cuando sube la versión (contraseña cambiada o despublicado)", async () => {
    await concederAcceso("acme", "portal", 3);
    expect(await tieneAcceso("acme", "portal", 4)).toBe(false);
  });

  it("una cookie de la demo no abre un portal real con el mismo enlace", async () => {
    await concederAcceso("lumen-cafe", "demo", 0);
    expect(almacen.get("n2c-portal-lumen-cafe")?.ruta).toBe("/demo/lumen-cafe");
    expect(await tieneAcceso("lumen-cafe", "portal", 0)).toBe(false);
    expect(await tieneAcceso("lumen-cafe", "demo", 0)).toBe(true);
  });

  it("no sirve para otro portal aunque se copie el valor", async () => {
    await concederAcceso("acme", "portal", 1);
    almacen.set("n2c-portal-otro", almacen.get("n2c-portal-acme")!);
    expect(await tieneAcceso("otro", "portal", 1)).toBe(false);
  });

  it("rechaza una cookie manipulada", async () => {
    await concederAcceso("acme", "portal", 1);
    const { valor } = almacen.get("n2c-portal-acme")!;
    // Alargar la caducidad sin poder firmar de nuevo.
    const [clave, , firma] = valor.split(".");
    almacen.set("n2c-portal-acme", { valor: `${clave}.9999999999.${firma}` });
    expect(await tieneAcceso("acme", "portal", 1)).toBe(false);
    almacen.set("n2c-portal-acme", { valor: "basura" });
    expect(await tieneAcceso("acme", "portal", 1)).toBe(false);
  });

  it("rechaza una cookie firmada con otro secreto", async () => {
    await concederAcceso("acme", "portal", 1);
    vi.stubEnv("PORTAL_SECRET", "t".repeat(40));
    expect(await tieneAcceso("acme", "portal", 1)).toBe(false);
  });

  it("caduca a las 8 horas", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    await concederAcceso("acme", "portal", 1);
    vi.setSystemTime(new Date("2026-01-01T17:59:00Z"));
    expect(await tieneAcceso("acme", "portal", 1)).toBe(true);
    vi.setSystemTime(new Date("2026-01-01T18:01:00Z"));
    expect(await tieneAcceso("acme", "portal", 1)).toBe(false);
  });

  it("salir borra la cookie", async () => {
    await concederAcceso("acme", "portal", 1);
    await retirarAcceso("acme", "portal");
    expect(await tieneAcceso("acme", "portal", 1)).toBe(false);
  });

  it("exige un PORTAL_SECRET de al menos 32 caracteres", async () => {
    vi.stubEnv("PORTAL_SECRET", "corto");
    await expect(concederAcceso("acme", "portal", 1)).rejects.toThrow(/PORTAL_SECRET/);
  });
});

describe("origen del intento de contraseña", () => {
  it("usa la primera IP de x-forwarded-for y no la guarda en claro", async () => {
    const origen = await origenCliente();
    expect(origen).not.toContain("203.0.113.5");
    expect(origen).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await origenCliente()).toBe(origen);
  });
});
