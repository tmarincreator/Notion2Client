-- Notion2Client · Retirar el acceso de los clientes al cambiar la contraseña o despublicar
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.
--
-- La cookie de acceso del cliente lleva firmada la versión de acceso del portal.
-- Cambiar la contraseña, despublicar o archivar sube la versión, así que las
-- cookies emitidas antes dejan de valer al momento (no a las 8 horas).

alter table public.portales add column acceso_version integer not null default 1;

-- Lo hace un trigger para que ningún camino (función, update directo) se lo salte.
-- La agencia no tiene permiso para escribir esta columna.
create or replace function public.subir_version_acceso() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.contrasena_hash is distinct from old.contrasena_hash or new.estado is distinct from old.estado then
    new.acceso_version := old.acceso_version + 1;
  end if;
  return new;
end $$;

create trigger portales_version_acceso before update on public.portales
  for each row execute function public.subir_version_acceso();

-- Los datos públicos del portal incluyen la versión (cambia lo que devuelve: se borra y se recrea).
drop function if exists public.portal_publico(text);

create function public.portal_publico(p_slug text)
returns table (slug text, cliente text, nombre text, color text, agencia text, logo_path text,
               fuente_notion_id text, propiedades_visibles text[], actualizado timestamptz, acceso_version integer)
language sql stable security definer set search_path = '' as $$
  select p.slug, p.cliente, p.nombre, p.color,
         coalesce(u.raw_user_meta_data ->> 'agencia', 'Agencia'),
         a.logo_path,
         p.fuente_notion_id, p.propiedades_visibles, p.actualizado, p.acceso_version
    from public.portales p
    join auth.users u on u.id = p.agencia_id
    left join public.agencias a on a.id = p.agencia_id
   where p.slug = p_slug and p.estado = 'publicado';
$$;

grant execute on function public.portal_publico(text) to anon, authenticated;

-- Igual que en 0002, pero si la contraseña es correcta devuelve la versión con la que firmar la cookie.
drop function if exists public.intentar_acceso_portal(text, text);

create function public.intentar_acceso_portal(p_slug text, p_contrasena text)
returns table (resultado text, segundos_restantes integer, acceso_version integer)
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_hash      text;
  v_version   integer;
  v_intento   public.portal_intentos;
  max_fallos  constant integer := 5;
  bloqueo     constant interval := interval '5 minutes';
begin
  select p.contrasena_hash, p.acceso_version into v_hash, v_version
    from public.portales p
   where p.slug = p_slug and p.estado = 'publicado' and p.contrasena_hash is not null;

  -- Portal inexistente o sin publicar: misma respuesta que una contraseña incorrecta.
  if v_hash is null then
    return query select 'incorrecta'::text, 0, 0;
    return;
  end if;

  -- Bloquea la fila para que varios intentos a la vez no se salten el contador.
  insert into public.portal_intentos (slug) values (p_slug) on conflict (slug) do nothing;
  select * into v_intento from public.portal_intentos where slug = p_slug for update;

  if v_intento.bloqueado_hasta is not null and v_intento.bloqueado_hasta > now() then
    return query select 'bloqueado'::text, ceil(extract(epoch from v_intento.bloqueado_hasta - now()))::integer, 0;
    return;
  end if;

  if v_hash = extensions.crypt(p_contrasena, v_hash) then
    update public.portal_intentos set fallos = 0, bloqueado_hasta = null where slug = p_slug;
    return query select 'ok'::text, 0, v_version;
    return;
  end if;

  if v_intento.fallos + 1 >= max_fallos then
    update public.portal_intentos set fallos = 0, bloqueado_hasta = now() + bloqueo where slug = p_slug;
    return query select 'bloqueado'::text, extract(epoch from bloqueo)::integer, 0;
  else
    update public.portal_intentos set fallos = v_intento.fallos + 1, bloqueado_hasta = null where slug = p_slug;
    return query select 'incorrecta'::text, 0, 0;
  end if;
end $$;

revoke execute on function public.intentar_acceso_portal(text, text) from public;
grant execute on function public.intentar_acceso_portal(text, text) to anon, authenticated;
