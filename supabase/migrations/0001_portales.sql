-- Notion2Client · Tabla de portales
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.

create extension if not exists pgcrypto with schema extensions;

create table public.portales (
  id                    uuid primary key default gen_random_uuid(),
  agencia_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  cliente               text not null check (char_length(cliente) between 1 and 120),
  nombre                text not null check (char_length(nombre) between 1 and 120),
  estado                text not null default 'borrador' check (estado in ('borrador', 'publicado', 'archivado')),
  color                 text not null default '#c2410c' check (color ~ '^#[0-9a-fA-F]{6}$'),
  -- Fuente de datos de Notion elegida y propiedades (por id) que verá el cliente.
  fuente_notion_id      text,
  propiedades_visibles  text[] not null default '{}',
  -- Nunca se guarda la contraseña: solo su hash (bcrypt).
  contrasena_hash       text,
  creado                timestamptz not null default now(),
  actualizado           timestamptz not null default now()
);

create index portales_agencia_idx on public.portales (agencia_id);

-- Cada agencia solo ve y modifica sus propios portales.
alter table public.portales enable row level security;

create policy "agencia lee sus portales" on public.portales
  for select to authenticated using (agencia_id = (select auth.uid()));
create policy "agencia crea sus portales" on public.portales
  for insert to authenticated with check (agencia_id = (select auth.uid()));
create policy "agencia edita sus portales" on public.portales
  for update to authenticated using (agencia_id = (select auth.uid())) with check (agencia_id = (select auth.uid()));
create policy "agencia borra sus portales" on public.portales
  for delete to authenticated using (agencia_id = (select auth.uid()));

-- El hash no se puede leer desde la app, ni siquiera por la propia agencia,
-- y los visitantes sin sesión no tocan la tabla (solo las funciones de abajo).
revoke all on public.portales from anon, authenticated;
grant select (id, agencia_id, slug, cliente, nombre, estado, color, fuente_notion_id, propiedades_visibles, creado, actualizado)
  on public.portales to authenticated;
grant insert (slug, cliente, nombre, estado, color, fuente_notion_id, propiedades_visibles),
      update (slug, cliente, nombre, estado, color, fuente_notion_id, propiedades_visibles),
      delete
  on public.portales to authenticated;

create or replace function public.tocar_actualizado() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado := now();
  return new;
end $$;

create trigger portales_actualizado before update on public.portales
  for each row execute function public.tocar_actualizado();

-- Guarda la contraseña del portal como hash. Solo funciona sobre portales propios.
create or replace function public.fijar_contrasena_portal(p_portal uuid, p_contrasena text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if char_length(p_contrasena) < 8 then
    raise exception 'La contraseña debe tener al menos 8 caracteres';
  end if;
  update public.portales
     set contrasena_hash = extensions.crypt(p_contrasena, extensions.gen_salt('bf'))
   where id = p_portal and agencia_id = (select auth.uid());
  if not found then
    raise exception 'Portal no encontrado';
  end if;
end $$;

-- ¿El portal tiene contraseña? (la agencia no puede leer el hash directamente)
create or replace function public.portal_tiene_contrasena(p_portal uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select contrasena_hash is not null from public.portales
   where id = p_portal and agencia_id = (select auth.uid());
$$;

-- Datos de un portal publicado para el servidor de la app (nunca el hash).
-- Los ids de Notion no dan acceso a nada por sí solos: el token vive solo en el servidor.
create or replace function public.portal_publico(p_slug text)
returns table (slug text, cliente text, nombre text, color text, agencia text,
               fuente_notion_id text, propiedades_visibles text[], actualizado timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.slug, p.cliente, p.nombre, p.color,
         coalesce(u.raw_user_meta_data ->> 'agencia', 'Agencia'),
         p.fuente_notion_id, p.propiedades_visibles, p.actualizado
    from public.portales p join auth.users u on u.id = p.agencia_id
   where p.slug = p_slug and p.estado = 'publicado';
$$;

-- Comprueba la contraseña que escribe el cliente.
create or replace function public.comprobar_contrasena_portal(p_slug text, p_contrasena text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select p.contrasena_hash = extensions.crypt(p_contrasena, p.contrasena_hash)
      from public.portales p
     where p.slug = p_slug and p.estado = 'publicado' and p.contrasena_hash is not null
  ), false);
$$;

-- ¿Está libre este enlace? (los slugs son únicos entre todas las agencias)
create or replace function public.slug_disponible(p_slug text, p_excepto uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.portales where slug = p_slug and id is distinct from p_excepto);
$$;

revoke execute on function public.fijar_contrasena_portal(uuid, text) from public, anon;
revoke execute on function public.portal_tiene_contrasena(uuid) from public, anon;
grant execute on function public.fijar_contrasena_portal(uuid, text) to authenticated;
grant execute on function public.portal_tiene_contrasena(uuid) to authenticated;
revoke execute on function public.slug_disponible(text, uuid) from public, anon;
grant execute on function public.slug_disponible(text, uuid) to authenticated;
grant execute on function public.portal_publico(text) to anon, authenticated;
grant execute on function public.comprobar_contrasena_portal(text, text) to anon, authenticated;
