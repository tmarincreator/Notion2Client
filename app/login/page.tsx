import type { Metadata } from "next";
import { FormularioAcceso } from "@/components/auth/FormularioAcceso";

export const metadata: Metadata = { title: "Iniciar sesión · Notion2Client" };

export default function PaginaLogin() {
  return <FormularioAcceso modo="acceso" />;
}
