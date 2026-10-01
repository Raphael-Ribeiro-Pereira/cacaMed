import { getIdToken } from 'firebase/auth';
import { SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, supabase } from '../supabase';
import { criarTransporteSupabase } from './transporteSupabase';
import { registrarTempoAPI } from './diagnosticoDesempenho';

export async function chamarPerfilSupabase(usuario, acao, dados = {}, timeoutMs = 15000) {
  const transporte = criarTransporteSupabase({ url: SUPABASE_URL, chavePublica: SUPABASE_CHAVE_PUBLICA,
    obterToken: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (usuario.source === 'supabase') {
        if (session?.user.id !== usuario.authId) throw new Error('Entre novamente na conta.');
        return session.access_token;
      }
      // Um navegador pode ter alternado a conta Firebase; não reaproveita a
      // sessão Supabase de outro jogador só porque ela está no armazenamento.
      if (session?.user.app_metadata?.firebase_uid === usuario.uid) return session.access_token;
      return getIdToken(usuario);
    } });
  return transporte(acao, dados, timeoutMs);
}

let migracao;
let uidMigracao;
export function migrarSessaoFirebase(usuario) {
  if (migracao && uidMigracao === usuario.uid) return migracao;
  uidMigracao = usuario.uid;
  migracao = (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.app_metadata?.firebase_uid === usuario.uid) return true;
    const transporte = criarTransporteSupabase({ url: SUPABASE_URL, chavePublica: SUPABASE_CHAVE_PUBLICA, obterToken: () => getIdToken(usuario) });
    const resultado = await transporte('migrarIdentidade');
    if (!resultado.migrada) return false;
    const { error } = await supabase.auth.verifyOtp({ token_hash: resultado.tokenHash, type: 'email' });
    if (error) throw new Error('Não foi possível concluir a sessão migrada. Entre novamente.');
    return true;
  })().finally(() => { migracao = undefined; });
  return migracao;
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
