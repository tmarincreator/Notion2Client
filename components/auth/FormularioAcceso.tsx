"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { iniciarSesion, registrarse } from "@/app/auth/actions";
import { Icono } from "@/components/ui/Icono";
import { Wordmark } from "@/components/ui/Logo";
import { Boton } from "@/components/ui/Boton";
import { Campo, Input } from "@/components/ui/Campo";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import { CORREO_VALIDO } from "@/lib/formato";

type Modo = "acceso" | "registro";
type Errores = Partial<Record<"agencia" | "correo" | "contrasena", string>>;

const pestanaActiva =
  "h-9 rounded-lg bg-white text-sm font-semibold text-[var(--ink)] shadow-[0_1px_2px_rgba(17,22,27,0.08)] grid place-items-center";
const pestanaInactiva = "h-9 rounded-lg text-sm font-medium text-[var(--ink-muted)] grid place-items-center";

/*
  Formulario de acceso y registro con Supabase Auth.
  Primero valida en el navegador (errores al instante) y después llama a la
  Server Action, que crea la sesión en cookies y redirige al dashboard.
*/
export function FormularioAcceso({ modo }: { modo: Modo }) {
  const esAcceso = modo === "acceso";
  const [estado, enviarAccion, enviando] = useActionState(esAcceso ? iniciarSesion : registrarse, {});
  const ids = esAcceso
    ? { correo: "login-email", contrasena: "login-pass" }
    : { correo: "su-email", contrasena: "su-pass" };

  const [agencia, setAgencia] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState<Errores>({});

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    const nuevos: Errores = {};
    if (!esAcceso && !agencia.trim()) nuevos.agencia = "Escribe el nombre de tu agencia.";
    if (!correo.trim()) nuevos.correo = "Escribe tu correo electrónico.";
    else if (!CORREO_VALIDO.test(correo)) nuevos.correo = "Este correo no parece válido. Revisa que tenga @ y dominio.";
    if (!contrasena) nuevos.contrasena = "Escribe tu contraseña.";
    else if (!esAcceso && contrasena.length < 8) nuevos.contrasena = "La contraseña necesita al menos 8 caracteres.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    // Llamada directa (no <form action>) para que React no vacíe los campos.
    startTransition(() => enviarAccion({ correo, contrasena, agencia: esAcceso ? undefined : agencia }));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 px-4 py-12">
      <Link href="/" className="n2c-wordmark" aria-label="Volver a la página de inicio">
        <Wordmark />
      </Link>

      <div className="n2c-card flex w-full max-w-[420px] flex-col gap-6 p-8 shadow-[var(--shadow-md)]">
        <nav aria-label="Acceso" className="grid grid-cols-2 gap-1 rounded-[10px] bg-[var(--surface-sunken)] p-1">
          <Link href="/login" aria-current={esAcceso ? "page" : undefined} className={esAcceso ? pestanaActiva : pestanaInactiva}>
            Iniciar sesión
          </Link>
          <Link href="/registro" aria-current={!esAcceso ? "page" : undefined} className={!esAcceso ? pestanaActiva : pestanaInactiva}>
            Crear cuenta
          </Link>
        </nav>

        <div className="flex flex-col gap-1.5">
          <h1 className="n2c-h2">{esAcceso ? "Te damos la bienvenida" : "Crea tu cuenta"}</h1>
          <p className="n2c-small n2c-muted">
            {esAcceso ? "Entra para gestionar los portales de tus clientes." : "Gratis durante el acceso anticipado. Sin tarjeta."}
          </p>
        </div>

        {estado.error && !enviando && (
          <div className="n2c-banner n2c-banner--danger" role="alert">
            <Icono nombre="aviso" />
            <div className="n2c-banner__body">{estado.error}</div>
          </div>
        )}
        {estado.aviso && !enviando && (
          <div className="n2c-banner" role="status">
            <Icono nombre="check" />
            <div className="n2c-banner__body">{estado.aviso}</div>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
          {!esAcceso && (
            <Campo id="su-agency" etiqueta="Nombre de la agencia" error={errores.agencia}>
              <Input
                id="su-agency"
                type="text"
                placeholder="Estudio Norte"
                autoComplete="organization"
                value={agencia}
                onChange={(e) => setAgencia(e.target.value)}
                conError={!!errores.agencia}
                aria-describedby={errores.agencia ? "su-agency-err" : undefined}
              />
            </Campo>
          )}

          <Campo id={ids.correo} etiqueta="Correo electrónico" error={errores.correo}>
            <Input
              id={ids.correo}
              type="email"
              placeholder="tu@agencia.com"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              conError={!!errores.correo}
              aria-describedby={errores.correo ? `${ids.correo}-err` : undefined}
            />
          </Campo>

          <Campo
            id={ids.contrasena}
            etiqueta="Contraseña"
            error={errores.contrasena}
            pista={esAcceso ? undefined : "Mínimo 8 caracteres."}
          >
            <CampoContrasena
              id={ids.contrasena}
              valor={contrasena}
              onCambio={setContrasena}
              autoComplete={esAcceso ? "current-password" : "new-password"}
              conError={!!errores.contrasena}
              describedBy={`${ids.contrasena}-${errores.contrasena ? "err" : "hint"}`}
            />
          </Campo>

          <Boton type="submit" tamano="lg" bloque className="mt-1" aria-busy={enviando}>
            {esAcceso ? (enviando ? "Entrando…" : "Iniciar sesión") : enviando ? "Creando cuenta…" : "Crear cuenta"}
          </Boton>
        </form>

        <p className="n2c-small n2c-muted text-center">
          {esAcceso ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}
          <Link className="n2c-link" href={esAcceso ? "/registro" : "/login"}>
            {esAcceso ? "Crear cuenta" : "Iniciar sesión"}
          </Link>
        </p>
      </div>

      <p className="n2c-small n2c-muted flex items-center gap-2 text-center">
        <Icono nombre="escudo" className="tint" />
        Tu token de Notion se guarda cifrado y nunca se muestra a tus clientes.
      </p>
    </div>
  );
}
