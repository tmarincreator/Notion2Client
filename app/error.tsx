"use client";

import { PantallaError } from "@/components/ui/PantallaError";

// Errores de cualquier página (landing, login, portales de clientes…).
export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <PantallaError {...props} />;
}
