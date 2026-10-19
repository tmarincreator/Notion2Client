import type { Metadata } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Notion2Client — Portales para clientes desde tu Notion",
  description:
    "Conecta una base de datos de Notion, elige qué campos se ven y comparte un portal con tu marca y contraseña. Sin exponer costes ni notas internas.",
  openGraph: {
    title: "Notion2Client — Tu Notion, convertido en un portal para tus clientes",
    description:
      "Portales con tu marca, enlace único y contraseña. Solo se envían los campos que tú activas.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${figtree.variable} ${jetbrains.variable}`}>
      <body className="n2c-root min-h-screen">{children}</body>
    </html>
  );
}
