-- Ranking público mostra só o username, nunca o nome da conta Google (S-08 de docs/seguranca.md, LGPD).
-- Mesmas colunas de antes: compatível com a API e o frontend atuais, pode ser aplicada sozinha.
create or replace function public.cacamed_ranking()
returns table(player_id text, nome text, xp_global bigint, partidas bigint, letras bigint, tempo_medio bigint, atualizado_em timestamptz)
language sql stable security invoker set search_path = '' as $$
  select s.player_id, coalesce(nullif(s.profile->>'username',''),'Plantonista'),
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
