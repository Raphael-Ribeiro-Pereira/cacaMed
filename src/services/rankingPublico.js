import { getIdToken } from 'firebase/auth';

const ENDPOINT_RANKING = 'https://script.google.com/macros/s/AKfycbyo7eh7LTMLKpR7KAINlxMarLRe2DbL72niTbPA9xKlgi8fMy2WUs8bhb_fMl0y06pWfw/exec';
let sequencia = 0;
let ultimaSincronizacao = { chave: null, instante: 0, promessa: null };

export async function calcularIdPublico(uid) {
  const bytes = new TextEncoder().encode(uid);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function sincronizarRanking(user, dadosUsuario) {
  if (import.meta.env.VITE_FONTE_DADOS === 'planilha') return;
  if (!user || !dadosUsuario) return;
  const chave = JSON.stringify([
    user.uid,
    dadosUsuario.nome,
    dadosUsuario.username,
    dadosUsuario.pontuacaoTotal,
    dadosUsuario.xpTopicos,
    dadosUsuario.estatisticas,
  ]);
  if (ultimaSincronizacao.chave === chave) {
    if (ultimaSincronizacao.promessa) return ultimaSincronizacao.promessa;
    if (Date.now() - ultimaSincronizacao.instante < 30000) return;
  }

  const promessa = (async () => {
    const idToken = await getIdToken(user);
    await fetch(ENDPOINT_RANKING, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ idToken, apiKey: import.meta.env.VITE_FIREBASE_API_KEY }),
    });
  })();
  ultimaSincronizacao = { chave, instante: Date.now(), promessa };
  try {
    await promessa;
  } catch (erro) {
    ultimaSincronizacao = { chave: null, instante: 0, promessa: null };
    throw erro;
  }
  ultimaSincronizacao = { chave, instante: Date.now(), promessa: null };
}

export function buscarRankingPublico({ documentRef = document, timeoutMs = 45000 } = {}) {
  return new Promise((resolve, reject) => {
    const callback = `__cacoMedRanking${Date.now()}_${++sequencia}`;
    const script = documentRef.createElement('script');
    const timeout = setTimeout(() => finalizar(new Error('Tempo esgotado ao carregar o ranking.')), timeoutMs);

    function finalizar(erro, dados) {
      clearTimeout(timeout);
      script.remove();
      delete window[callback];
      if (erro) reject(erro);
      else resolve(dados);
    }

    window[callback] = resposta => {
      if (!resposta?.sucesso || !Array.isArray(resposta.ranking)) {
        finalizar(new Error('Resposta inválida do ranking.'));
        return;
      }
      finalizar(null, resposta.ranking);
    };

    script.onerror = () => finalizar(new Error('Falha ao carregar o ranking.'));
    const url = new URL(ENDPOINT_RANKING);
    url.searchParams.set('prefix', callback);
    if (import.meta.env.VITE_FONTE_DADOS === 'planilha') url.searchParams.set('temporada', 'nova');
    script.src = url.toString();
    documentRef.head.appendChild(script);
  });
}
