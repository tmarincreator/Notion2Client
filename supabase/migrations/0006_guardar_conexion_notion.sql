-- Notion2Client · Guardar la conexión con Notion sin poder leer el token cifrado
-- Ejecutar una vez en Supabase → SQL Editor → New query → Run.
--
-- Un upsert (INSERT ... ON CONFLICT DO UPDATE SET col = EXCLUDED.col) necesita
-- permiso SELECT sobre las columnas que actualiza, y token_cifrado no se puede
-- leer a propósito. Esta función guarda la conexión de la agencia con sesión.

create or replace function public.guardar_conexion_notion(
  p_token_cifrado text, p_token_visible text, p_espacio text, p_integracion text
) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_agencia uuid := (select auth.uid());
begin
  if v_agencia is null then
    raise exception 'Sin sesión';
  end if;
  insert into public.conexiones_notion (agencia_id, token_cifrado, token_visible, espacio, integracion)
  values (v_agencia, p_token_cifrado, p_token_visible, p_espacio, p_integracion)
  on conflict (agencia_id) do update
    set token_cifrado = excluded.token_cifrado,
        token_visible = excluded.token_visible,
        espacio       = excluded.espacio,
        integracion   = excluded.integracion;
end $$;

revoke execute on function public.guardar_conexion_notion(text, text, text, text) from public, anon;
grant execute on function public.guardar_conexion_notion(text, text, text, text) to authenticated;

-- Esta función es ahora la única forma de crear o cambiar la conexión (borrarla sigue siendo un delete normal).
revoke insert, update on public.conexiones_notion from authenticated;
