import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problema } from "@/components/landing/Problema";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Privacidad } from "@/components/landing/Privacidad";
import { Funciones } from "@/components/landing/Funciones";
import { Precios } from "@/components/landing/Precios";
import { PreguntasFrecuentes } from "@/components/landing/PreguntasFrecuentes";
import { LlamadaFinal } from "@/components/landing/LlamadaFinal";
import { Pie } from "@/components/landing/Pie";

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problema />
        <ComoFunciona />
        <Privacidad />
        <Funciones />
        <Precios />
        <PreguntasFrecuentes />
        <LlamadaFinal />
      </main>
      <Pie />
    </>
  );
}
