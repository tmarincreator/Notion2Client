import { cerrarSesion } from "@/app/auth/actions";
import { Icono } from "@/components/ui/Icono";
import { Boton } from "@/components/ui/Boton";
import { obtenerUsuario } from "@/lib/auth";

// Pie del menú lateral con la agencia de la sesión. Lee cookies: va dentro de <Suspense>.
export async function PieMenu() {
  const usuario = await obtenerUsuario();
  return <ContenidoPie iniciales={usuario.iniciales} nombre={usuario.nombre} correo={usuario.correo} />;
}

// Mismo hueco mientras llega la sesión, para que el menú no salte.
export function PieMenuCargando() {
  return <ContenidoPie iniciales="" nombre={" "} correo={" "} />;
}

function ContenidoPie({ iniciales, nombre, correo }: { iniciales: string; nombre: string; correo: string }) {
  return (
    <div className="n2c-side__foot side-foot">
      <span className="n2c-avatar">{iniciales}</span>
      <div className="min-w-0 flex-1">
        <div className="n2c-label">{nombre}</div>
        <div className="n2c-caption n2c-muted truncate">{correo}</div>
      </div>
      <form action={cerrarSesion}>
        <Boton type="submit" variante="fantasma" className="n2c-btn--icon" aria-label="Cerrar sesión" title="Cerrar sesión">
          <Icono nombre="salir" />
        </Boton>
      </form>
    </div>
  );
}
