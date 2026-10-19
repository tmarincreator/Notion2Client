"use client";

import "./globals.css";
import { PantallaError } from "@/components/ui/PantallaError";

// Errores en el layout raíz: sustituye a toda la página, así que trae su propio <html>.
export default function GlobalError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es">
      <body className="n2c-root min-h-screen">
        <title>Algo ha fallado · Notion2Client</title>
        <PantallaError {...props} />
      </body>
    </html>
  );
}
