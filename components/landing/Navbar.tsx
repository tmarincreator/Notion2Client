import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import { BotonEnlace } from "@/components/ui/Boton";

const secciones = [
  { href: "#como", texto: "Cómo funciona" },
  { href: "#privacidad", texto: "Privacidad" },
  { href: "#precios", texto: "Precios" },
  { href: "#faq", texto: "Preguntas" },
];

/* Barra de navegación de la parte pública. */
export function Navbar() {
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="wrap flex min-h-[68px] flex-wrap items-center justify-between gap-4 py-3">
        <Link href="/" className="n2c-wordmark">
          <Wordmark />
        </Link>
        <nav className="hide-sm flex gap-7 text-sm font-medium text-[var(--ink-muted)]" aria-label="Principal">
          {secciones.map((s) => (
            <a key={s.href} href={s.href}>{s.texto}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <BotonEnlace variante="fantasma" href="/login">Iniciar sesión</BotonEnlace>
          <BotonEnlace href="/registro">Crear cuenta</BotonEnlace>
        </div>
      </div>
    </header>
  );
}
