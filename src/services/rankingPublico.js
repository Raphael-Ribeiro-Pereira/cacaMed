import { buscarConteudoSupabase } from './perfilSupabase';
import { chamarPerfilPlanilha } from './perfilPlanilha';

// S-08: o ID público é um HMAC com segredo do servidor, então o app pergunta o seu à API (uma vez por conta e por
// visita). Se a API ainda não tiver a ação, ou falhar, usa o SHA-256 de antes.
const meusIds = new Map();
export function obterMeuIdPublico(usuario) {
  if (!meusIds.has(usuario.uid)) {
    meusIds.set(usuario.uid, chamarPerfilPlanilha(usuario, 'meuIdPublico')
      .then(r => r?.idPublico || calcularIdPublico(usuario.uid))
      .catch(() => { meusIds.delete(usuario.uid); return calcularIdPublico(usuario.uid); }));
  }
  return meusIds.get(usuario.uid);
}

export async function calcularIdPublico(uid) {
  const bytes = new TextEncoder().encode(uid);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function buscarRankingPublico({ timeoutMs = 15000 } = {}) {
  return buscarConteudoSupabase('ranking', { signal: AbortSignal.timeout(Math.min(timeoutMs, 15000)) }).then(body => body.ranking);
}

// Coroas da semana por matéria.
export function buscarCoroasPublicas({ timeoutMs = 15000 } = {}) {
  return buscarConteudoSupabase('coroas', { signal: AbortSignal.timeout(timeoutMs) }).then(body => body.coroas);
}
