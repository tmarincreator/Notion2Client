import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cookies en memoria en lugar de las de Next.js.
const almacen = new Map<string, string>();
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nombre: string) => (almacen.has(nombre) ? { value: almacen.get(nombre)! } : undefined),
    set: (nombre: string, valor: string, opciones?: { maxAge?: number }) => {
      if (opciones?.maxAge === 0) almacen.delete(nombre);
      else almacen.set(nombre, valor);
    },
  }),
}));

const { marcarRecuperacion, recuperacionValida, borrarRecuperacion } = await import("@/lib/recuperacion");
const { concederAcceso } = await import("@/lib/portales/acceso");

beforeEach(() => {
  almacen.clear();
  vi.stubEnv("PORTAL_SECRET", "s".repeat(40));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("prueba de recuperación de contraseña", () => {
  it("sin haber abierto el enlace del correo no vale (una sesión cualquiera no basta)", async () => {
    expect(await recuperacionValida("usuario-1")).toBe(false);
  });

  it("vale para el usuario que abrió el enlace", async () => {
    await marcarRecuperacion("usuario-1");
    expect(await recuperacionValida("usuario-1")).toBe(true);
  });

  it("no vale para otro usuario", async () => {
    await marcarRecuperacion("usuario-1");
    expect(await recuperacionValida("usuario-2")).toBe(false);
  });

  it("caduca a los 15 minutos", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    await marcarRecuperacion("usuario-1");
    vi.setSystemTime(new Date("2026-01-01T10:14:00Z"));
    expect(await recuperacionValida("usuario-1")).toBe(true);
    vi.setSystemTime(new Date("2026-01-01T10:16:00Z"));
    expect(await recuperacionValida("usuario-1")).toBe(false);
  });

  it("rechaza una cookie manipulada", async () => {
    await marcarRecuperacion("usuario-1");
    const [, caduca, firma] = almacen.get("n2c-recuperacion")!.split(".");
    almacen.set("n2c-recuperacion", `usuario-2.${caduca}.${firma}`);
    expect(await recuperacionValida("usuario-2")).toBe(false);
    almacen.set("n2c-recuperacion", "basura");
    expect(await recuperacionValida("usuario-1")).toBe(false);
  });

  it("se borra tras usarla", async () => {
    await marcarRecuperacion("usuario-1");
    await borrarRecuperacion();
    expect(await recuperacionValida("usuario-1")).toBe(false);
  });

  it("una cookie de acceso a portal no sirve como prueba de recuperación", async () => {
    await concederAcceso("usuario-1", "portal", 1);
    almacen.set("n2c-recuperacion", almacen.get("n2c-portal-usuario-1")!);
    expect(await recuperacionValida("usuario-1")).toBe(false);
  });
});
