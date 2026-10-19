"use client";

import { PantallaError } from "@/components/ui/PantallaError";

// Errores del área de la agencia: se muestran dentro del layout, con el menú lateral.
export default function ErrorAgencia(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <PantallaError {...props} volver={{ href: "/dashboard", texto: "Volver a portales" }} pantallaCompleta={false} />;
}
