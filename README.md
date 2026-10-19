# Notion2Client Portal

Micro-SaaS para que agencias conviertan una base de datos de Notion en un portal para sus clientes.
Contexto del producto y diseño original: carpeta `IA/CONTEXT` y `IA/Design-handoff` (en OneDrive).

## Estado: Fase 1 — estructura y pantallas visuales

Todo funciona con datos de ejemplo (`lib/sample-data.ts`). Todavía **no** hay Supabase,
autenticación real, backend, Notion ni IA.

## Arrancar

```bash
npm install      # solo la primera vez
npm run dev      # http://localhost:3000
```

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Landing pública |
| `/login`, `/registro` | Acceso y registro (visual; cualquier correo válido + contraseña de 8+ caracteres entra) |
| `/dashboard` | Portales de la agencia (con selector de estados de demostración) |
| `/ajustes`, `/cuenta`, `/portales/nuevo` | Próximamente |
| `/p/lumen-cafe` | Portal de cliente de ejemplo — contraseña `demo1234` |
| `/p/marea-ropa` | Portal de ejemplo sin entregables (estado vacío) |

## Estructura

- `app/` — rutas (Next.js App Router). `app/(agencia)/` comparte el menú lateral.
- `components/` — `ui/` piezas básicas (Boton, Campo/Input, Badge, Logo, Icono), `landing/`, `auth/`, `agencia/`, `portal/`.
- `lib/sample-data.ts` — datos de prueba (agencia, portales, contenido de clientes y bases de Notion simuladas); se sustituirá por Supabase y Notion.
- `app/globals.css` — colores y componentes del diseño de Claude Design.
