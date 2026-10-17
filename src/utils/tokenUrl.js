// Endereço com o token de um login antigo depois do # (aba restaurada, voltar no histórico depois do login do Google,
// link guardado): o Supabase tenta entrar com ele, recebe 403 e deixa o token no endereço (visto em 17/10/2026).
// Antes de o cliente ler o endereço, tira o token já vencido; um token ainda válido segue para o Supabase.
export function limparTokenVencido(local = globalThis.location, historico = globalThis.history, agora = Date.now()) {
  if (!local?.hash?.includes('access_token=')) return false;
  const expira = Number(new URLSearchParams(local.hash.slice(1)).get('expires_at')) * 1000;
  if (expira && expira > agora + 5000) return false;
  historico.replaceState(historico.state, '', local.pathname + local.search);
  return true;
}
