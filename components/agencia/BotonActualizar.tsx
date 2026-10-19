"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/ui/Icono";
import { Boton } from "@/components/ui/Boton";

/* Vuelve a pedir los datos de la pantalla al servidor (p. ej. a Notion) sin recargar la página. */
export function BotonActualizar({ texto }: { texto: string }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  return (
    <Boton variante="secundario" tamano="sm" disabled={pendiente} onClick={() => iniciar(() => router.refresh())}>
      <Icono nombre="actualizar" />
      {pendiente ? "Actualizando…" : texto}
    </Boton>
  );
}
