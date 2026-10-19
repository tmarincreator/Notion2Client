"use client";

import { useEffect, type RefObject } from "react";

/**
  Cuando llega una respuesta del servidor (`estado`), lleva el foco al primer
  campo marcado como no válido (aria-invalid). Así quien usa teclado o lector
  de pantalla llega directo al error en vez de tener que buscarlo.
*/
export function useEnfocarError(formulario: RefObject<HTMLFormElement | null>, estado: unknown) {
  useEffect(() => {
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [estado, formulario]);
}
