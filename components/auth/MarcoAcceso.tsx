import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";

/* Estructura común de las pantallas de acceso: logotipo, tarjeta centrada y nota opcional debajo. */
export function MarcoAcceso({ children, pie }: { children: React.ReactNode; pie?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 px-4 py-12">
      <Link href="/" className="n2c-wordmark" aria-label="Volver a la página de inicio">
        <Wordmark />
      </Link>
      <div className="n2c-card flex w-full max-w-[420px] flex-col gap-6 p-6 shadow-[var(--shadow-md)] sm:p-8">{children}</div>
      {pie}
    </div>
  );
}
