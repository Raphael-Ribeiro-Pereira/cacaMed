-- Revisão Inteligente v2 (docs/revisao-inteligente.md#llm-na-tela-de-revisão): cache das explicações da LLM e reportes.
-- Só a Edge Function (service_role) lê e grava: RLS ligado e nenhuma política para anon ou authenticated.
create table if not exists public.cacamed_explicacoes (
  chave text primary key,
  modo text not null,
  item_id text not null,
  versao integer not null,
  texto text not null check (char_length(texto) between 20 and 1500),
  criado_em timestamptz not null default now()
);
alter table public.cacamed_explicacoes enable row level security;
revoke all on public.cacamed_explicacoes from anon, authenticated;

create table if not exists public.cacamed_explicacoes_reportes (
  id bigint generated always as identity primary key,
  chave text not null,
  player_id text not null,
  motivo text not null default '',
  criado_em timestamptz not null default now()
);
create index if not exists cacamed_explicacoes_reportes_chave on public.cacamed_explicacoes_reportes (chave);
alter table public.cacamed_explicacoes_reportes enable row level security;
revoke all on public.cacamed_explicacoes_reportes from anon, authenticated;
