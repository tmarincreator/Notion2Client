import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuLateral } from "@/components/agencia/MenuLateral";
import { PieMenu, PieMenuCargando } from "@/components/agencia/PieMenu";

// El área privada no debe aparecer en buscadores.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/*
  Estructura común del área de la agencia: menú lateral + contenido.
  proxy.ts manda al login a quien no tiene sesión; PieMenu lo vuelve a
  comprobar en el servidor con obtenerUsuario().
*/
export default function LayoutAgencia({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <MenuLateral
        pie={
          <Suspense fallback={<PieMenuCargando />}>
            <PieMenu />
          </Suspense>
        }
      />
      <main className="flex max-w-[1280px] min-w-0 flex-[999_1_560px] flex-col gap-6 px-4 pt-6 pb-10 sm:px-10 sm:pt-8">
        {children}
      </main>
    </div>
  );
}
