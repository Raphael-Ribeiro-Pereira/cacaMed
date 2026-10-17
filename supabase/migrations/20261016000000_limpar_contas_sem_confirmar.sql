-- Cadastro com código (16/10/2026): o Supabase cria a conta no momento do cadastro e a deixa pendente até o código
-- ser digitado. Quem desiste deixa uma conta parada e ocupa o e-mail de quem poderia ser o dono. Esta rotina apaga,
-- todo dia, as contas que continuam sem e-mail confirmado depois de 24 horas e que não têm perfil de jogo.
create extension if not exists pg_cron;

create or replace function public.cacamed_limpar_contas_sem_confirmar()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  apagadas integer;
begin
  delete from auth.users u
  where u.email_confirmed_at is null
    and u.created_at < now() - interval '24 hours'
    and not exists (select 1 from public.cacamed_player_state s where s.player_id like '%' || u.id::text);
  get diagnostics apagadas = row_count;
  return apagadas;
end;
$$;

revoke all on function public.cacamed_limpar_contas_sem_confirmar() from public, anon, authenticated;

-- Todo dia às 06:00 UTC (03:00 em Brasília).
select cron.schedule('cacamed-limpar-contas-sem-confirmar', '0 6 * * *', $$select public.cacamed_limpar_contas_sem_confirmar()$$);
