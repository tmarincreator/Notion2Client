"use client";

import { startTransition, useActionState, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo, Input } from "@/components/ui/Campo";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import { AvisoFormulario } from "@/components/portales/Pasos";
import { cambiarContrasena, cambiarCorreo, cambiarNombre, type EstadoCuenta } from "@/app/(agencia)/cuenta/actions";

/* Tarjeta de un ajuste de la cuenta: título, descripción y su formulario. */
function Tarjeta({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <section className="n2c-card flex max-w-[720px] flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="n2c-h3">{titulo}</h2>
        <p className="n2c-small n2c-muted">{descripcion}</p>
      </div>
      {children}
    </section>
  );
}

export function FormNombre({ inicial }: { inicial: string }) {
  const [estado, enviar, enviando] = useActionState(cambiarNombre, {});
  const [nombre, setNombre] = useState(inicial);
  const error = enviando ? undefined : estado.errores?.nombre;

  return (
    <Tarjeta titulo="Nombre de la agencia" descripcion="Es el nombre que ven tus clientes en sus portales.">
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!enviando) startTransition(() => enviar(nombre));
        }}
      >
        <AvisoFormulario error={enviando ? undefined : estado.error} ok={enviando ? undefined : estado.ok} />
        <Campo id="cu-nombre" etiqueta="Nombre" error={error}>
          <Input id="cu-nombre" value={nombre} maxLength={120} autoComplete="organization" onChange={(e) => setNombre(e.target.value)} conError={!!error} />
        </Campo>
        <div className="flex justify-end">
          <Boton type="submit" variante="secundario" disabled={nombre.trim() === inicial} aria-busy={enviando}>
            {enviando ? "Guardando…" : "Guardar nombre"}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}

export function FormCorreo({ actual }: { actual: string }) {
  const [estado, enviar, enviando] = useActionState(cambiarCorreo, {});
  const [correo, setCorreo] = useState("");
  const error = enviando ? undefined : estado.errores?.correo;

  return (
    <Tarjeta titulo="Correo electrónico" descripcion={`Ahora entras con ${actual}.`}>
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!enviando) startTransition(() => enviar(correo));
        }}
      >
        <AvisoFormulario error={enviando ? undefined : estado.error} ok={enviando ? undefined : estado.ok} />
        <Campo id="cu-correo" etiqueta="Correo nuevo" error={error} pista="Puede que te enviemos un enlace para confirmarlo.">
          <Input id="cu-correo" type="email" placeholder="tu@agencia.com" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} conError={!!error} />
        </Campo>
        <div className="flex justify-end">
          <Boton type="submit" variante="secundario" disabled={!correo.trim()} aria-busy={enviando}>
            {enviando ? "Guardando…" : "Cambiar correo"}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}

export function FormContrasena() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  // Los campos solo se vacían si el cambio salió bien: si hay un error, no hay que volver a escribirlo todo.
  const [estado, enviar, enviando] = useActionState(async (previo: EstadoCuenta, datos: { actual: string; nueva: string }) => {
    const resultado = await cambiarContrasena(previo, datos);
    if (resultado.ok) {
      setActual("");
      setNueva("");
    }
    return resultado;
  }, {});
  const errores = enviando ? {} : (estado.errores ?? {});

  return (
    <Tarjeta titulo="Contraseña" descripcion="Para cambiarla necesitas la contraseña actual.">
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (enviando) return;
          startTransition(() => enviar({ actual, nueva }));
        }}
      >
        <AvisoFormulario error={enviando ? undefined : estado.error} ok={enviando ? undefined : estado.ok} />
        <Campo id="cu-actual" etiqueta="Contraseña actual" error={errores.actual}>
          <CampoContrasena id="cu-actual" valor={actual} onCambio={setActual} autoComplete="current-password" conError={!!errores.actual} describedBy={errores.actual ? "cu-actual-err" : undefined} />
        </Campo>
        <Campo id="cu-nueva" etiqueta="Contraseña nueva" error={errores.nueva} pista="Mínimo 8 caracteres.">
          <CampoContrasena id="cu-nueva" valor={nueva} onCambio={setNueva} autoComplete="new-password" conError={!!errores.nueva} describedBy={errores.nueva ? "cu-nueva-err" : "cu-nueva-hint"} />
        </Campo>
        <div className="flex justify-end">
          <Boton type="submit" variante="secundario" disabled={!actual || !nueva} aria-busy={enviando}>
            {enviando ? "Guardando…" : "Cambiar contraseña"}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
