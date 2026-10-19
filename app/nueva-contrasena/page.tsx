import type { Metadata } from "next";
import { FormNuevaContrasena } from "@/components/auth/FormNuevaContrasena";

export const metadata: Metadata = { title: "Contraseña nueva · Notion2Client", robots: { index: false, follow: false } };

// proxy.ts solo deja entrar con sesión (la abre el enlace del correo de recuperación).
export default function PaginaNuevaContrasena() {
  return <FormNuevaContrasena />;
}
