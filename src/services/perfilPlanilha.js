import { chamarPerfilSupabase } from './perfilSupabase';

// Porta única para a API (Edge Function cacamed-api). O nome vem da época da planilha do Google, que saiu em 17/10/2026
// junto com o Firebase; continua porque as telas recebem esta função como serviço padrão (e a homologação a troca).
export function chamarPerfilPlanilha(usuario, acao, dados = {}, timeoutMs = 15000) {
  if (!usuario) return Promise.reject(new Error('Entre na conta para continuar.'));
  return chamarPerfilSupabase(usuario, acao, dados, Math.min(timeoutMs, 15000));
}
