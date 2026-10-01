-- Aplicada por execute_sql na homologação de 30/09/2026 (America/Sao_Paulo).
-- Migração de atualização para o schema já existente; não é o schema inicial.
create or replace function public.cacamed_commit(p_player_id text, p_expected_version bigint, p_profile jsonb, p_events jsonb default '[]'::jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_version bigint; evt jsonb;
begin
  if p_profile->>'uid' is distinct from p_player_id then raise exception 'PROFILE_OWNER_MISMATCH'; end if;
  if p_expected_version = -1 then
    insert into public.cacamed_player_state(player_id, profile)
      values (p_player_id, p_profile) on conflict do nothing returning version into next_version;
  else
    update public.cacamed_player_state set profile = p_profile, version = version + 1, updated_at = now()
      where player_id = p_player_id and version = p_expected_version returning version into next_version;
  end if;
  -- Conflito de versão é do aplicativo. 40001 faz PostgREST repetir a mesma
  -- transação sem reler a versão, podendo manter um loop até o timeout.
  if next_version is null then raise exception 'STATE_CONFLICT' using errcode = 'PT409'; end if;
  for evt in select value from jsonb_array_elements(p_events) loop
    insert into public.cacamed_events(player_id, event_id, kind, data)
      values (p_player_id, evt->>'id', evt->>'kind', evt->'data') on conflict do nothing;
  end loop;
  return next_version;
end;
$$;
revoke all on function public.cacamed_commit(text, bigint, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.cacamed_commit(text, bigint, jsonb, jsonb) to service_role;
