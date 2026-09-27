import { getIdToken } from 'firebase/auth';

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyo7eh7LTMLKpR7KAINlxMarLRe2DbL72niTbPA9xKlgi8fMy2WUs8bhb_fMl0y06pWfw/exec';

function origemGooglePermitida(origem) {
  try {
    const url = new URL(origem);
    return url.protocol === 'https:' &&
      (url.hostname === 'script.google.com' || url.hostname.endsWith('.googleusercontent.com'));
  } catch {
    return false;
  }
}

export function chamarPerfilPlanilha(usuario, acao, dados = {}, timeoutMs = 60000) {
  if (!usuario) return Promise.reject(new Error('Entre na conta para continuar.'));
  return getIdToken(usuario).then(idToken => new Promise((resolve, reject) => {
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), valor => valor.toString(16).padStart(2, '0')).join('');
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0';
    iframe.title = 'Conexão segura com o perfil cacoMed';
    const url = new URL(ENDPOINT);
    url.searchParams.set('ponte', nonce);
    url.searchParams.set('origem', window.location.origin);
    let concluido = false;
    const finalizar = (erro, resultado) => {
      if (concluido) return;
      concluido = true;
      clearTimeout(temporizador);
      window.removeEventListener('message', receber);
      iframe.remove();
      if (erro) reject(erro);
      else resolve(resultado);
    };
    const receber = evento => {
      if (!origemGooglePermitida(evento.origin) || evento.data?.nonce !== nonce) return;
      if (evento.data.cacoMed === 'pronto') {
        evento.source.postMessage({
          cacoMed: 'pedido', nonce,
          pedido: { ...dados, acao, idToken, apiKey: import.meta.env.VITE_FIREBASE_API_KEY },
        }, evento.origin);
      } else if (evento.data.cacoMed === 'resposta') {
        finalizar(evento.data.erro ? new Error(evento.data.erro) : null, evento.data.resultado);
      }
    };
    const temporizador = setTimeout(() => finalizar(new Error('A planilha demorou a responder. Tente novamente.')), timeoutMs);
    iframe.onerror = () => finalizar(new Error('Não foi possível abrir o serviço de perfis.'));
    window.addEventListener('message', receber);
    iframe.src = url.toString();
    document.body.appendChild(iframe);
  }));
}
