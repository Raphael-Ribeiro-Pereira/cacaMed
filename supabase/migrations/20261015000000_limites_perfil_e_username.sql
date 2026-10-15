-- S-09 e S-14 de docs/seguranca.md (15/10/2026). Aplicar numa quinta, junto com a Edge Function da mesma época.
-- Conferido na produção em 15/10/2026: o maior perfil tem 24 KB e não há username repetido.

-- 1. Gravação com teto: perfil de até 256 KB e até 200 eventos por chamada (PT413 vira HTTP 413 no PostgREST).
create or replace function public.cacamed_commit(p_player_id text, p_expected_version bigint, p_profile jsonb, p_events jsonb default '[]'::jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_version bigint; evt jsonb;
begin
  if p_profile->>'uid' is distinct from p_player_id then raise exception 'PROFILE_OWNER_MISMATCH'; end if;
  if octet_length(p_profile::text) > 262144 then raise exception 'PROFILE_TOO_LARGE' using errcode = 'PT413'; end if;
  if jsonb_array_length(coalesce(p_events, '[]'::jsonb)) > 200 then raise exception 'TOO_MANY_EVENTS' using errcode = 'PT413'; end if;
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

-- 2. Username único sem diferenciar maiúsculas, fora da homologação. A API traduz a violação (23505) em
--    "Este username já está em uso" (409), o que fecha a corrida entre dois cadastros ao mesmo tempo.
create unique index if not exists cacamed_player_state_username_unico
  on public.cacamed_player_state (lower(profile->>'username'))
  where player_id not like 'homologacao:%' and coalesce(profile->>'username', '') <> '';
