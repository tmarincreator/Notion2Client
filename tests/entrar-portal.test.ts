import { beforeEach, describe, expect, it, vi } from "vitest";

// Respuesta de Supabase (intentar_acceso_portal) que devolverá cada test.
const rpc = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));
vi.mock("next/server", () => ({ connection: async () => {} }));
const cookiesPuestas = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: (n: string, v: string) => cookiesPuestas.set(n, v) }),
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.5" }),
}));

const { entrarPortal } = await import("@/app/p/[slug]/actions");

beforeEach(() => {
  rpc.mockReset();
  cookiesPuestas.clear();
  vi.stubEnv("PORTAL_SECRET", "s".repeat(40));
});

describe("entrar a un portal", () => {
  it("si falla Supabase no dice que la contraseña es incorrecta", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    const r = await entrarPortal("acme", {}, "una-contraseña");
    expect(r.error).toMatch(/No hemos podido comprobar la contraseña/);
    expect(r.error).not.toMatch(/no es correcta/);
    expect(cookiesPuestas.size).toBe(0);
  });

  it("contraseña incorrecta", async () => {
    rpc.mockResolvedValue({ data: [{ resultado: "incorrecta", segundos_restantes: 0, acceso_version: 0 }], error: null });
    expect((await entrarPortal("acme", {}, "mal")).error).toMatch(/no es correcta/);
    expect(cookiesPuestas.size).toBe(0);
  });

  it("bloqueado: dice cuántos minutos faltan", async () => {
    rpc.mockResolvedValue({ data: [{ resultado: "bloqueado", segundos_restantes: 290, acceso_version: 0 }], error: null });
    expect((await entrarPortal("acme", {}, "mal")).error).toMatch(/5 minutos/);
  });

  it("contraseña correcta: da la cookie de acceso", async () => {
    rpc.mockResolvedValue({ data: [{ resultado: "ok", segundos_restantes: 0, acceso_version: 2 }], error: null });
    expect(await entrarPortal("acme", {}, "buena")).toEqual({ ok: true });
    expect(cookiesPuestas.get("n2c-portal-acme")).toMatch(/^portal:acme:v2\./);
  });
});
