import { SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, supabase } from '../supabase';
import { criarTransporteSupabase } from './transporteSupabase';
import { registrarTempoAPI } from './diagnosticoDesempenho';

export async function chamarPerfilSupabase(usuario, acao, dados = {}, timeoutMs = 15000) {
  const transporte = criarTransporteSupabase({ url: SUPABASE_URL, chavePublica: SUPABASE_CHAVE_PUBLICA,
    // Não reaproveita a sessão de outro jogador só porque ela está no armazenamento do navegador.
    obterToken: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== usuario.authId) throw new Error('Entre novamente na conta.');
      return session.access_token;
    } });
  return transporte(acao, dados, timeoutMs);
}

export async function buscarConteudoSupabase(acao, { signal } = {}) {
  const inicio = performance.now();
  const url = new URL('/functions/v1/cacamed-api', SUPABASE_URL);
  url.searchParams.set('acao', acao);
  try {
    const response = await fetch(url, { headers: { apikey: SUPABASE_CHAVE_PUBLICA }, signal });
    const body = await response.json();
    if (!response.ok || body.erro) throw new Error(body.erro || 'Não foi possível carregar o conteúdo.');
    registrarTempoAPI(acao, inicio, true);
    return body;
  } catch (erro) {
    registrarTempoAPI(acao, inicio, false);
    throw erro;
  }
}
