import type { Metadata } from "next";
import { FormRecuperar } from "@/components/auth/FormRecuperar";

export const metadata: Metadata = { title: "Recuperar contraseña · Notion2Client" };

export default function PaginaRecuperar() {
  return <FormRecuperar />;
}
