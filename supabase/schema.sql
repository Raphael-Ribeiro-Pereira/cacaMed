
create table public.cacamed_player_state (
  player_id text primary key,
  auth_user_id uuid unique references auth.users(id),
  profile jsonb not null check (jsonb_typeof(profile) = 'object'),
  version bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.cacamed_player_state enable row level security;
revoke all on public.cacamed_player_state from anon, authenticated;
grant select, insert, update on public.cacamed_player_state to service_role;

create table public.cacamed_events (
  player_id text not null references public.cacamed_player_state(player_id),
  event_id text not null,
  kind text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (player_id, event_id)
);
alter table public.cacamed_events enable row level security;
revoke all on public.cacamed_events from anon, authenticated;
grant select, insert on public.cacamed_events to service_role;
create index cacamed_events_history on public.cacamed_events (player_id, kind, created_at desc);

create function public.cacamed_commit(p_player_id text, p_expected_version bigint, p_profile jsonb, p_events jsonb default '[]'::jsonb)
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
  if next_version is null then raise exception 'STATE_CONFLICT' using errcode = '40001'; end if;
  for evt in select value from jsonb_array_elements(p_events) loop
    insert into public.cacamed_events(player_id, event_id, kind, data)
      values (p_player_id, evt->>'id', evt->>'kind', evt->'data') on conflict do nothing;
  end loop;
  return next_version;
end;
$$;
revoke all on function public.cacamed_commit(text, bigint, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.cacamed_commit(text, bigint, jsonb, jsonb) to service_role;

