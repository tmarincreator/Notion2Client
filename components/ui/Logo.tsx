/* Logotipos: el de Notion2Client y el de la agencia (iniciales sobre su color). */

export function Wordmark({ pequeno = false }: { pequeno?: boolean }) {
  return (
    <>
      <svg className={pequeno ? "logo logo-sm" : "logo"} viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="7" fill="#0f766e" />
        <path d="M8 18v-5.5a4 4 0 0 1 8 0V18" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Notion2Client
    </>
  );
}

/*
  Logotipo de la agencia. Si la agencia subió uno (`logoUrl`), se muestra la
  imagen; si no, sus iniciales sobre el color de la variable CSS --accent
  (o el que se pase en `color`).
*/
export function LogoAgencia({
  iniciales,
  color,
  grande = false,
  logoUrl,
}: {
  iniciales: string;
  color?: string;
  grande?: boolean;
  logoUrl?: string | null;
}) {
  const tamano = grande ? { width: 56, height: 56, borderRadius: 14 } : {};

  if (logoUrl) {
    return (
      // Imagen externa de Supabase Storage: <img> evita configurar dominios en next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className="n2c-agency-logo"
        style={{ ...tamano, background: "transparent", objectFit: "contain" }}
      />
    );
  }

  const estilo = {
    ...(color ? { "--accent": color } : {}),
    ...tamano,
    ...(grande ? { fontSize: 18 } : {}),
  } as React.CSSProperties;
  return (
    <span className="n2c-agency-logo" style={estilo}>
      {iniciales}
    </span>
  );
}
