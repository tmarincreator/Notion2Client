import type { Metadata } from "next";
import { FormularioAcceso } from "@/components/auth/FormularioAcceso";

export const metadata: Metadata = { title: "Crear cuenta · Notion2Client" };

export default function PaginaRegistro() {
  return <FormularioAcceso modo="registro" />;
}
