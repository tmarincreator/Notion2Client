-- Notion2Client · Bloqueo de intentos por IP (en vez de por portal) y funciones solo para el servidor
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.
--
-- Antes, 5 fallos seguidos bloqueaban el portal para todo el mundo: cualquiera
-- podía dejar fuera al cliente. Ahora:
--   - 5 fallos desde un mismo origen (IP) bloquean solo ese origen 5 minutos.
--   - 100 fallos en una hora entre todos los orígenes bloquean el portal 15 minutos
--     (frena la fuerza bruta desde muchas IPs; para abusar de él hacen falta 20+ IPs).
--
-- El origen lo aporta el servidor de la app (HMAC de la IP: no se guardan IPs en claro).
-- Para que nadie se lo invente, estas funciones ya no las puede llamar la clave
-- pública (anon): solo el servidor con la clave secreta (service_role).

drop function if exists public.intentar_acceso_portal(text, text);
drop table if exists public.portal_intentos;

-- Fallos por portal y origen.
create table public.portal_intentos (
  slug             text not null,
  origen           text not null,
  fallos           integer not null default 0,
  bloqueado_hasta  timestamptz,
  ultimo           timestamptz not null default now(),
  primary key (slug, origen)
);
create index portal_intentos_ultimo_idx on public.portal_intentos (ultimo);

-- Fallos de todos los orígenes de un portal en la ventana actual (1 hora).
create table public.portal_intentos_global (
  slug             text primary key,
  fallos           integer not null default 0,
  ventana_desde    timestamptz not null default now(),
  bloqueado_hasta  timestamptz
);

alter table public.portal_intentos enable row level security;
alter table public.portal_intentos_global enable row level security;
revoke all on public.portal_intentos, public.portal_intentos_global from anon, authenticated;

create function public.intentar_acceso_portal(p_slug text, p_contrasena text, p_origen text)
returns table (resultado text, segundos_restantes integer, acceso_version integer)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_hash           text;
  v_version        integer;
  v_intento        public.portal_intentos;
  v_global         public.portal_intentos_global;
  max_fallos       constant integer := 5;
  bloqueo          constant interval := interval '5 minutes';
  max_global       constant integer := 100;
  ventana_global   constant interval := interval '1 hour';
  bloqueo_global   constant interval := interval '15 minutes';
begin
  if coalesce(p_origen, '') = '' then
    raise exception 'Falta el origen';
  end if;

  select p.contrasena_hash, p.acceso_version into v_hash, v_version
    from public.portales p
   where p.slug = p_slug and p.estado = 'publicado' and p.contrasena_hash is not null;

  -- Portal inexistente o sin publicar: misma respuesta que una contraseña incorrecta.
  if v_hash is null then
    return query select 'incorrecta'::text, 0, 0;
    return;
  end if;

  -- Limpieza de orígenes que llevan un día sin intentarlo.
  delete from public.portal_intentos where ultimo < now() - interval '1 day';

  -- Bloquea las filas para que varios intentos a la vez no se salten los contadores.
  insert into public.portal_intentos_global (slug) values (p_slug) on conflict (slug) do nothing;
  select * into v_global from public.portal_intentos_global where slug = p_slug for update;
  insert into public.portal_intentos (slug, origen) values (p_slug, p_origen) on conflict (slug, origen) do nothing;
  select * into v_intento from public.portal_intentos where slug = p_slug and origen = p_origen for update;

  if v_global.bloqueado_hasta is not null and v_global.bloqueado_hasta > now() then
    return query select 'bloqueado'::text, ceil(extract(epoch from v_global.bloqueado_hasta - now()))::integer, 0;
    return;
  end if;
  if v_intento.bloqueado_hasta is not null and v_intento.bloqueado_hasta > now() then
    return query select 'bloqueado'::text, ceil(extract(epoch from v_intento.bloqueado_hasta - now()))::integer, 0;
    return;
  end if;

  if v_hash = extensions.crypt(p_contrasena, v_hash) then
    update public.portal_intentos set fallos = 0, bloqueado_hasta = null, ultimo = now()
     where slug = p_slug and origen = p_origen;
    return query select 'ok'::text, 0, v_version;
    return;
  end if;

  -- Fallo: cuenta en la ventana global (que se reinicia cada hora)…
  if v_global.ventana_desde < now() - ventana_global then
    v_global.fallos := 0;
    v_global.ventana_desde := now();
  end if;
  if v_global.fallos + 1 >= max_global then
    update public.portal_intentos_global
       set fallos = 0, ventana_desde = now(), bloqueado_hasta = now() + bloqueo_global
     where slug = p_slug;
  else
    update public.portal_intentos_global
       set fallos = v_global.fallos + 1, ventana_desde = v_global.ventana_desde, bloqueado_hasta = null
     where slug = p_slug;
  end if;

  -- …y en la del origen.
  if v_intento.fallos + 1 >= max_fallos then
    update public.portal_intentos set fallos = 0, bloqueado_hasta = now() + bloqueo, ultimo = now()
     where slug = p_slug and origen = p_origen;
    return query select 'bloqueado'::text, extract(epoch from bloqueo)::integer, 0;
  else
    update public.portal_intentos set fallos = v_intento.fallos + 1, bloqueado_hasta = null, ultimo = now()
     where slug = p_slug and origen = p_origen;
    return query select 'incorrecta'::text, 0, 0;
  end if;
end $$;

revoke execute on function public.intentar_acceso_portal(text, text, text) from public, anon, authenticated;
grant execute on function public.intentar_acceso_portal(text, text, text) to service_role;

-- El token cifrado de un portal publicado tampoco lo puede pedir ya cualquiera (ver 0005).
revoke execute on function public.token_notion_portal(text) from public, anon, authenticated;
grant execute on function public.token_notion_portal(text) to service_role;
