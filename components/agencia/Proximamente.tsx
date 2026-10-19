import { Icono } from "@/components/ui/Icono";
import { Badge } from "@/components/ui/Badge";
import { BotonEnlace } from "@/components/ui/Boton";

/* Marcador de posición para pantallas que se construirán en fases siguientes. */
export function Proximamente({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <>
      <h1 className="n2c-h1">{titulo}</h1>
      <div className="n2c-card n2c-empty">
        <span className="n2c-empty__icon"><Icono nombre="herramienta" /></span>
        <Badge tono="marca" sinPunto>Próximamente</Badge>
        <h2 className="n2c-h3">Esta pantalla llegará en la siguiente fase</h2>
        <p>{descripcion}</p>
        <BotonEnlace variante="secundario" href="/dashboard">Volver a portales</BotonEnlace>
      </div>
    </>
  );
}
