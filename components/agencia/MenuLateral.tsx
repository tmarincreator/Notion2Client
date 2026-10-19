"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/auth/actions";
import { Icono, type NombreIcono } from "@/components/ui/Icono";
import { Wordmark } from "@/components/ui/Logo";

const enlaces: { href: string; texto: string; icono: NombreIcono }[] = [
  { href: "/dashboard", texto: "Portales", icono: "cuadricula" },
  { href: "/ajustes", texto: "Marca y Notion", icono: "paleta" },
  { href: "/cuenta", texto: "Cuenta", icono: "personas" },
];

// `pie` llega del servidor (PieMenu) con los datos de la sesión.
export function MenuLateral({ pie }: { pie: React.ReactNode }) {
  return (
    <aside className="n2c-side flex-[1_1_220px]">
      <Link href="/dashboard" className="n2c-wordmark">
        <Wordmark />
      </Link>
      {/* La ruta actual solo se conoce al pedir la página: sin marcar hasta entonces. */}
      <Suspense fallback={<Navegacion ruta={null} />}>
        <NavegacionActiva />
      </Suspense>
      {pie}
    </aside>
  );
}

function NavegacionActiva() {
  return <Navegacion ruta={usePathname()} />;
}

function Navegacion({ ruta }: { ruta: string | null }) {
  // "Nuevo portal" y la configuración de un portal pertenecen a la sección Portales.
  const activo = (href: string) => !!ruta && (ruta === href || (href === "/dashboard" && ruta.startsWith("/portales")));

  return (
    <nav className="side-nav" aria-label="Navegación">
      {enlaces.map((e) => (
        <Link key={e.href} className="n2c-nav" href={e.href} aria-current={activo(e.href) ? "page" : undefined}>
          <Icono nombre={e.icono} className="ic-lg" />
          {e.texto}
        </Link>
      ))}
      {/* En móvil el pie del menú se oculta, así que "Salir" aparece aquí. */}
      <form action={cerrarSesion} className="contents">
        <button type="submit" className="n2c-nav cursor-pointer min-[761px]:hidden">
          <Icono nombre="salir" className="ic-lg" />
          Salir
        </button>
      </form>
    </nav>
  );
}
