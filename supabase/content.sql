create table public.cacamed_content (
  id text primary key,
  version integer not null default 1,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.cacamed_content enable row level security;
revoke all on public.cacamed_content from anon, authenticated;
grant select, insert, update on public.cacamed_content to service_role;

create function public.cacamed_ranking()
returns table(player_id text, nome text, xp_global bigint, partidas bigint, letras bigint, tempo_medio bigint, atualizado_em timestamptz)
language sql stable security invoker set search_path = '' as $$
  select s.player_id, coalesce(s.profile->>'nome',s.profile->>'username','Plantonista'),
    coalesce((s.profile->>'pontuacaoTotal')::bigint,0),
    coalesce(t.partidas,0), coalesce(t.letras,0),
    case when t.partidas>0 then t.tempo / t.partidas else null end, s.updated_at
  from public.cacamed_player_state s
  left join lateral (
    select sum(coalesce((value->>'partidas')::bigint,0))::bigint as partidas,
      sum(coalesce((value->>'letras')::bigint,0))::bigint as letras,
      sum(coalesce((value->>'tempo')::bigint,0))::bigint as tempo
    from jsonb_each(coalesce(s.profile->'estatisticas','{}'::jsonb))
  ) t on true
  where s.player_id not like 'homologacao:%'
  order by coalesce((s.profile->>'pontuacaoTotal')::bigint,0) desc,s.player_id
  limit 100;
$$;
revoke all on function public.cacamed_ranking() from public, anon, authenticated;
grant execute on function public.cacamed_ranking() to service_role;
