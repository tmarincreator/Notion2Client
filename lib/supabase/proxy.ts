import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RUTAS_PRIVADAS = ["/dashboard", "/ajustes", "/cuenta", "/portales", "/vista-previa"];
const RUTAS_ACCESO = ["/login", "/registro"];

const empiezaPor = (ruta: string, prefijos: string[]) =>
  prefijos.some((p) => ruta === p || ruta.startsWith(`${p}/`));

/*
  Renueva la sesión de Supabase en cada petición y hace las redirecciones
  rápidas: sin sesión fuera del área privada, con sesión fuera del login.
*/
export async function updateSession(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
          Object.entries(headers).forEach(([clave, valor]) => respuesta.headers.set(clave, valor));
        },
      },
    },
  );

  // No pongas código entre createServerClient y getClaims: aquí se renueva el token.
  const { data } = await supabase.auth.getClaims();
  const conSesion = !!data?.claims;
  const ruta = request.nextUrl.pathname;

  if (!conSesion && empiezaPor(ruta, RUTAS_PRIVADAS)) return redirigir(request, respuesta, "/login");
  if (conSesion && empiezaPor(ruta, RUTAS_ACCESO)) return redirigir(request, respuesta, "/dashboard");

  return respuesta;
}

// Una redirección debe llevarse las cookies renovadas o la sesión se pierde.
function redirigir(request: NextRequest, respuesta: NextResponse, destino: string) {
  const url = request.nextUrl.clone();
  url.pathname = destino;
  url.search = "";
  const redireccion = NextResponse.redirect(url);
  respuesta.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
  // Cabeceras anti-caché que añade Supabase al renovar la sesión.
  for (const clave of ["cache-control", "expires", "pragma"]) {
    const valor = respuesta.headers.get(clave);
    if (valor) redireccion.headers.set(clave, valor);
  }
  return redireccion;
}
