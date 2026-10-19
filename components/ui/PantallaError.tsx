"use client";

import { useEffect } from "react";
import { Icono } from "./Icono";
import { Boton, BotonEnlace } from "./Boton";

/*
  Contenido de las pantallas de error (error.tsx y global-error.tsx).
  El código (`digest`) es el mismo que queda en los logs del servidor: si el
  usuario lo envía, se encuentra el error exacto.
*/
export function PantallaError({
  error,
  retry,
  volver = { href: "/", texto: "Ir al inicio" },
  pantallaCompleta = true,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  volver?: { href: string; texto: string };
  pantallaCompleta?: boolean;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`flex items-center justify-center px-4 ${pantallaCompleta ? "min-h-screen py-16" : "py-10"}`}>
      <div className="n2c-card n2c-empty w-full max-w-[460px]" role="alert">
        <span className="n2c-empty__icon"><Icono nombre="aviso" /></span>
        <h1 className="n2c-h3">Algo ha fallado</h1>
        <p>No es culpa tuya. Vuelve a intentarlo en unos segundos; si sigue pasando, escríbenos con el código de abajo.</p>
        {error.digest && <span className="n2c-mono n2c-muted">Código: {error.digest}</span>}
        <div className="flex flex-wrap justify-center gap-3">
          <BotonEnlace variante="secundario" href={volver.href}>{volver.texto}</BotonEnlace>
          <Boton onClick={() => retry()}>Volver a intentar</Boton>
        </div>
      </div>
    </div>
  );
}
