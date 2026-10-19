import type { Metadata } from "next";

// Los portales de clientes nunca deben aparecer en buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function LayoutPortal({ children }: LayoutProps<"/p/[slug]">) {
  return children;
}
