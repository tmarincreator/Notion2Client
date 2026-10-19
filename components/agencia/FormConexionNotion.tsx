"use client";

import { startTransition, useActionState, useState, useTransition } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoContrasena } from "@/components/ui/CampoContrasena";
import { AvisoFormulario } from "@/components/portales/Pasos";
import { conectarNotion, desconectarNotion, type EstadoMarca } from "@/app/(agencia)/ajustes/actions";

/*
  Ajustes → pegar (o cambiar) el token de la integración de Notion de la agencia.
  El servidor lo comprueba contra Notion y lo guarda cifrado; aquí nunca se vuelve a mostrar.
*/
export function FormConexionNotion({ conectado }: { conectado: boolean }) {
  const [estado, enviar, conectando] = useActionState(conectarNotion, {});
  const [estadoDesconexion, setEstadoDesconexion] = useState<EstadoMarca>({});
  const [desconectando, iniciar] = useTransition();
  const [token, setToken] = useState("");
  const ocupado = conectando || desconectando;
  const aviso = ocupado ? {} : estadoDesconexion.error || estadoDesconexion.ok ? estadoDesconexion : estado;

  function desconectar() {
    if (!window.confirm("¿Desconectar Notion? Tus portales publicados dejarán de mostrar contenido hasta que lo vuelvas a conectar.")) return;
    iniciar(async () => {
      setEstadoDesconexion(await desconectarNotion());
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (ocupado || !token.trim()) return;
        setEstadoDesconexion({});
        startTransition(() => enviar(token));
      }}
    >
      <AvisoFormulario error={aviso.error} ok={aviso.ok} />
      <Campo
        id="notion-token"
        etiqueta={conectado ? "Cambiar token de la integración" : "Token de la integración"}
        pista={
          conectado
            ? "Escribe otro solo si quieres cambiarlo. Si es de otro espacio, revisa la base de cada portal."
            : "Se comprueba con Notion y se guarda cifrado. Tus clientes nunca lo ven."
        }
      >
        <CampoContrasena
          id="notion-token"
          valor={token}
          onCambio={setToken}
          autoComplete="off"
          describedBy="notion-token-hint"
        />
      </Campo>
      <div className="flex flex-wrap justify-end gap-3">
        {conectado && (
          <Boton variante="fantasma" disabled={ocupado} onClick={desconectar}>
            {desconectando ? "Desconectando…" : "Desconectar"}
          </Boton>
        )}
        <Boton type="submit" variante={conectado ? "secundario" : "primario"} disabled={!token.trim() || ocupado} aria-busy={conectando}>
          {conectando ? "Comprobando…" : conectado ? "Cambiar token" : "Conectar Notion"}
        </Boton>
      </div>
    </form>
  );
}
