-- Notion2Client · Enlaces reservados para los portales de demostración
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.
--
-- Los portales de la demo de la landing (lib/sample-data.ts) usan estos enlaces.
-- Si una agencia pudiera usarlos, su portal real quedaría mezclado con la demo.
-- Si añades un portal a la demo, añade también su enlace aquí (en las dos listas).

-- Si ya existe algún portal con estos enlaces, la restricción no se podrá crear:
-- cambia antes su slug (update public.portales set slug = '…' where slug = '…').
alter table public.portales
  add constraint portales_slug_no_reservado check (slug not in ('lumen-cafe', 'marea-ropa'));

create or replace function public.slug_disponible(p_slug text, p_excepto uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_slug not in ('lumen-cafe', 'marea-ropa')
     and not exists (select 1 from public.portales where slug = p_slug and id is distinct from p_excepto);
$$;
