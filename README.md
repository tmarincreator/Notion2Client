# Notion2Client

Micro-SaaS para agencias: convierte una base de datos de Notion en un portal privado para cada cliente, con la marca de la agencia, un enlace propio y contraseña. La agencia elige qué propiedades ve el cliente; las demás nunca salen del servidor.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · Supabase (Auth, Postgres con RLS, Storage) · API de Notion · Tailwind 4 · Vitest.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellénalo (ver abajo)
npm run dev                  # http://localhost:3000
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin generar archivos |
| `npm test` | Tests unitarios (Vitest) |

### Variables de entorno

Todas están explicadas en [`.env.example`](.env.example). El servidor las comprueba al arrancar (`instrumentation.ts`): en producción no arranca si falta alguna; en desarrollo solo avisa.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Conexión a Supabase |
| `SUPABASE_SECRET_KEY` | Solo servidor: comprobar contraseñas de portales y leer el token de Notion de un portal |
| `PORTAL_SECRET` | Firma las cookies de acceso de los clientes |
| `NOTION_TOKEN_KEY` | Cifra los tokens de Notion de las agencias (cambiarla obliga a reconectar Notion) |
| `NEXT_PUBLIC_SITE_URL` | Dirección pública para los enlaces de los correos (obligatoria en producción) |

### Supabase

1. **Migraciones**: ejecuta en orden los archivos de [`supabase/migrations`](supabase/migrations) (SQL Editor → New query → Run), del `0001` al último.
2. **Authentication → URL Configuration**: *Site URL* = `NEXT_PUBLIC_SITE_URL`; en *Redirect URLs* solo `https://tudominio.com/**` y `http://localhost:3000/**`.
3. **Correos**: las plantillas por defecto funcionan (el enlace vuelve a `/auth/confirm`). Para producción, configura un SMTP propio.

**Pasar a Supabase CLI** (recomendado para no copiar SQL a mano). Los nombres de los archivos ya siguen su formato:

```bash
npx supabase init                      # crea supabase/config.toml (respeta migrations/)
npx supabase link --project-ref <ref>
# Las migraciones ya ejecutadas a mano se marcan como aplicadas:
npx supabase migration repair --status applied 0001 0002 0003 0004 0005 0006 0007 0008
npx supabase db push                   # a partir de aquí, aplica solo las nuevas
```

## Cómo funciona

### Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Landing |
| `/login`, `/registro`, `/recuperar`, `/nueva-contrasena` | Acceso de la agencia (Supabase Auth) |
| `/dashboard` | Portales de la agencia: crear, archivar, restaurar, borrar |
| `/portales/nuevo`, `/portales/[id]?paso=1…5` | Asistente: datos → base de Notion → campos visibles → marca → contraseña y publicación |
| `/vista-previa/[id]` | El portal tal como lo verá el cliente, aunque no esté publicado |
| `/ajustes` | Conexión con Notion (token de la agencia) y marca (logotipo y color) |
| `/cuenta` | Nombre, correo y contraseña de la agencia |
| `/p/[slug]` | Portal del cliente (contraseña) |
| `/demo/lumen-cafe`, `/demo/marea-ropa` | Portales de demostración (contraseña `demo1234`) |

### Estructura

- `app/` — rutas. `app/(agencia)/` comparte el menú lateral; las Server Actions viven junto a cada ruta (`actions.ts`).
- `components/` — `ui/` (piezas básicas), `auth/`, `agencia/`, `portales/` (asistente), `portal/` (lo que ve el cliente), `landing/`.
- `lib/notion/` — cliente, lectura de bases, cifrado y conexión por agencia.
- `lib/portales/` — datos de Supabase, cookie de acceso, conversión de filas de Notion en entregables, asistente.
- `lib/supabase/` — clientes de servidor, navegador, proxy y admin (clave secreta).
- `lib/formato.ts`, `lib/color.ts`, `lib/env.ts`, `lib/demo.ts`, `lib/url.ts` — utilidades.
- `tests/` — tests unitarios de `lib/`.

### Seguridad

- **Datos de cada agencia**: RLS en todas las tablas; las acciones comprueban la sesión y si el cambio afectó a alguna fila.
- **Notion**: cada agencia conecta su propia integración. El token se comprueba contra Notion, se cifra con AES-256-GCM (`NOTION_TOKEN_KEY`) y nadie puede leerlo con un `select`.
- **Qué ve el cliente**: solo las propiedades marcadas como visibles; el filtrado se hace en el servidor antes de enviar nada al navegador.
- **Contraseña del portal**: guardada como hash bcrypt. Se comprueba en una función que solo puede llamar el servidor; 5 fallos desde una IP la bloquean 5 minutos y 100 fallos por hora bloquean el portal 15 minutos.
- **Cookie de acceso**: httpOnly, firmada con HMAC, 8 horas, ligada al portal, al tipo (portal o demo) y a la versión de acceso: cambiar la contraseña o despublicar echa a quien ya había entrado.
- **Cabeceras**: CSP, `X-Frame-Options: DENY`, HSTS en producción y otras (`next.config.ts`).

### Errores y logs

`error.tsx`, `global-error.tsx` y `not-found.tsx` muestran pantallas propias con un código (`digest`). El mismo código aparece en los logs del servidor, que `instrumentation.ts` escribe en una línea JSON por error. Para recibir alertas, conecta ahí un servicio como Sentry.

## Antes de desplegar

- [ ] Variables de entorno en el hosting (el servidor no arranca si falta alguna).
- [ ] Migraciones al día y URLs de Auth configuradas en Supabase.
- [ ] La app detrás de un proxy o plataforma que ponga la IP real (`x-forwarded-for`), como Vercel: el bloqueo por IP depende de ello.
- [ ] CI en verde (`.github/workflows/ci.yml`: lint, tipos, tests y build).
