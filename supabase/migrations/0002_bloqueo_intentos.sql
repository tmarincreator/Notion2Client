-- Notion2Client · Bloqueo tras 5 contraseñas incorrectas seguidas (5 minutos)
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.

-- Fallos seguidos por portal. Solo la toca la función de abajo: nadie puede leerla ni escribirla desde la app.
create table public.portal_intentos (
  slug             text primary key,
  fallos           integer not null default 0,
  bloqueado_hasta  timestamptz
);

alter table public.portal_intentos enable row level security;
revoke all on public.portal_intentos from anon, authenticated;

-- Sustituye a comprobar_contrasena_portal: comprueba la contraseña y lleva la cuenta de fallos.
-- Devuelve 'ok', 'incorrecta' o 'bloqueado' (con los segundos que faltan para desbloquear).
create or replace function public.intentar_acceso_portal(p_slug text, p_contrasena text)
returns table (resultado text, segundos_restantes integer)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_hash      text;
  v_intento   public.portal_intentos;
  max_fallos  constant integer := 5;
  bloqueo     constant interval := interval '5 minutes';
begin
  select p.contrasena_hash into v_hash
    from public.portales p
   where p.slug = p_slug and p.estado = 'publicado' and p.contrasena_hash is not null;

  -- Portal inexistente o sin publicar: misma respuesta que una contraseña incorrecta.
  if v_hash is null then
    return query select 'incorrecta'::text, 0;
    return;
  end if;

  -- Bloquea la fila para que varios intentos a la vez no se salten el contador.
  insert into public.portal_intentos (slug) values (p_slug) on conflict (slug) do nothing;
  select * into v_intento from public.portal_intentos where slug = p_slug for update;

  if v_intento.bloqueado_hasta is not null and v_intento.bloqueado_hasta > now() then
    return query select 'bloqueado'::text, ceil(extract(epoch from v_intento.bloqueado_hasta - now()))::integer;
    return;
  end if;

  if v_hash = extensions.crypt(p_contrasena, v_hash) then
    update public.portal_intentos set fallos = 0, bloqueado_hasta = null where slug = p_slug;
    return query select 'ok'::text, 0;
    return;
  end if;

  if v_intento.fallos + 1 >= max_fallos then
    update public.portal_intentos set fallos = 0, bloqueado_hasta = now() + bloqueo where slug = p_slug;
    return query select 'bloqueado'::text, extract(epoch from bloqueo)::integer;
  else
    update public.portal_intentos set fallos = v_intento.fallos + 1, bloqueado_hasta = null where slug = p_slug;
    return query select 'incorrecta'::text, 0;
  end if;
end $$;

grant execute on function public.intentar_acceso_portal(text, text) to anon, authenticated;

-- La función antigua no contaba fallos: se elimina para que no se pueda usar para saltarse el bloqueo.
drop function if exists public.comprobar_contrasena_portal(text, text);
