-- Notion2Client · Marca de la agencia (color predeterminado y logotipo)
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.

-- 1. Datos de marca: una fila por agencia.
create table public.agencias (
  id           uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- Color con el que nacen los portales nuevos (cada portal puede cambiarlo).
  color        text not null default '#c2410c' check (color ~ '^#[0-9a-fA-F]{6}$'),
  -- Ruta del logotipo dentro del bucket "logos": "<id de la agencia>/logo-….png"
  logo_path    text check (logo_path is null or logo_path like (id::text || '/%')),
  actualizado  timestamptz not null default now()
);

alter table public.agencias enable row level security;

create policy "agencia lee su marca" on public.agencias
  for select to authenticated using (id = (select auth.uid()));
create policy "agencia crea su marca" on public.agencias
  for insert to authenticated with check (id = (select auth.uid()));
create policy "agencia edita su marca" on public.agencias
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke all on public.agencias from anon, authenticated;
grant select, insert (color, logo_path), update (color, logo_path) on public.agencias to authenticated;

create trigger agencias_actualizado before update on public.agencias
  for each row execute function public.tocar_actualizado();

-- 2. Bucket de logotipos: público para ver (los clientes no tienen sesión),
--    solo PNG, JPG o WebP y máximo 1 MB (lo comprueba el propio Supabase).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Cada agencia solo sube, cambia o borra archivos dentro de su carpeta "<su id>/".
create policy "agencia ve sus logos" on storage.objects
  for select to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "agencia sube sus logos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "agencia cambia sus logos" on storage.objects
  for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "agencia borra sus logos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 3. Los datos públicos del portal incluyen ahora el logotipo de la agencia.
--    (Cambia lo que devuelve la función, por eso se borra y se vuelve a crear.)
drop function if exists public.portal_publico(text);

create function public.portal_publico(p_slug text)
returns table (slug text, cliente text, nombre text, color text, agencia text, logo_path text,
               fuente_notion_id text, propiedades_visibles text[], actualizado timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.slug, p.cliente, p.nombre, p.color,
         coalesce(u.raw_user_meta_data ->> 'agencia', 'Agencia'),
         a.logo_path,
         p.fuente_notion_id, p.propiedades_visibles, p.actualizado
    from public.portales p
    join auth.users u on u.id = p.agencia_id
    left join public.agencias a on a.id = p.agencia_id
   where p.slug = p_slug and p.estado = 'publicado';
$$;

grant execute on function public.portal_publico(text) to anon, authenticated;
