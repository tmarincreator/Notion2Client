-- Notion2Client · Conexión con Notion por agencia
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.
--
-- Cada agencia conecta su propia integración de Notion. El token se guarda
-- cifrado (AES-256-GCM) con NOTION_TOKEN_KEY, una clave que solo tiene el
-- servidor de la app: Supabase nunca ve el token en claro.

create table public.conexiones_notion (
  agencia_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  token_cifrado  text not null,
  -- Principio y final del token, para reconocerlo en Ajustes sin mostrarlo.
  token_visible  text not null,
  espacio        text not null,
  integracion    text not null,
  actualizado    timestamptz not null default now()
);

alter table public.conexiones_notion enable row level security;

create policy "agencia lee su conexion" on public.conexiones_notion
  for select to authenticated using (agencia_id = (select auth.uid()));
create policy "agencia crea su conexion" on public.conexiones_notion
  for insert to authenticated with check (agencia_id = (select auth.uid()));
create policy "agencia edita su conexion" on public.conexiones_notion
  for update to authenticated using (agencia_id = (select auth.uid())) with check (agencia_id = (select auth.uid()));
create policy "agencia borra su conexion" on public.conexiones_notion
  for delete to authenticated using (agencia_id = (select auth.uid()));

-- El token cifrado no se puede leer con un select: solo con las funciones de abajo.
revoke all on public.conexiones_notion from anon, authenticated;
grant select (agencia_id, token_visible, espacio, integracion, actualizado) on public.conexiones_notion to authenticated;
grant insert (token_cifrado, token_visible, espacio, integracion),
      update (token_cifrado, token_visible, espacio, integracion),
      delete
  on public.conexiones_notion to authenticated;

create trigger conexiones_notion_actualizado before update on public.conexiones_notion
  for each row execute function public.tocar_actualizado();

-- Token (cifrado) de la agencia con sesión, para configurar sus portales.
create or replace function public.token_notion_agencia() returns text
language sql stable security definer set search_path = '' as $$
  select token_cifrado from public.conexiones_notion where agencia_id = (select auth.uid());
$$;

-- Token (cifrado) de la agencia dueña de un portal publicado, para mostrárselo al cliente.
-- Lo puede pedir cualquiera, pero sin NOTION_TOKEN_KEY (solo en el servidor) no sirve de nada.
create or replace function public.token_notion_portal(p_slug text) returns text
language sql stable security definer set search_path = '' as $$
  select c.token_cifrado
    from public.portales p
    join public.conexiones_notion c on c.agencia_id = p.agencia_id
   where p.slug = p_slug and p.estado = 'publicado';
$$;

revoke execute on function public.token_notion_agencia() from public, anon;
grant execute on function public.token_notion_agencia() to authenticated;
revoke execute on function public.token_notion_portal(text) from public;
grant execute on function public.token_notion_portal(text) to anon, authenticated;
