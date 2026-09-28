import { getIdToken } from 'firebase/auth';

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyo7eh7LTMLKpR7KAINlxMarLRe2DbL72niTbPA9xKlgi8fMy2WUs8bhb_fMl0y06pWfw/exec';
const TEMPO_ABERTURA_MS = 60000;
let ponteAtual;
let fila = Promise.resolve();

function origemGooglePermitida(origem) {
  try {
    const url = new URL(origem);
    return url.protocol === 'https:' &&
      (url.hostname === 'script.google.com' || url.hostname.endsWith('.googleusercontent.com'));
  } catch {
    return false;
  }
}

function descartarPonte(ponte) {
  if (ponteAtual !== ponte) return;
  ponteAtual = undefined;
  ponte.iframe.remove();
}

function abrirPonte() {
  if (ponteAtual) return ponteAtual;
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), valor => valor.toString(16).padStart(2, '0')).join('');
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0';
  iframe.title = 'Conexão segura com o perfil cacoMed';
  const url = new URL(ENDPOINT);
  url.searchParams.set('ponte', nonce);
  url.searchParams.set('origem', window.location.origin);
  const ponte = { iframe, nonce };
  ponteAtual = ponte;
  ponte.pronta = new Promise((resolve, reject) => {
    let concluido = false;
    const finalizar = erro => {
      if (concluido) return;
      concluido = true;
      clearTimeout(temporizador);
      window.removeEventListener('message', receber);
      if (erro) {
        descartarPonte(ponte);
        reject(erro);
      } else resolve();
    };
    const receber = evento => {
      if (!origemGooglePermitida(evento.origin) || evento.data?.nonce !== nonce) return;
      if (evento.data.cacoMed === 'pronto') {
        ponte.origem = evento.origin;
        ponte.destino = evento.source;
        finalizar();
      }
    };
    const falharAbertura = mensagem => {
      const erro = new Error(mensagem);
      erro.code = 'PONTE_ABERTURA';
      console.warn('[cacoMed] A ponte de perfis não confirmou a abertura.', { origem: window.location.origin });
      finalizar(erro);
    };
    const temporizador = setTimeout(() => falharAbertura('Não foi possível abrir a conexão com a planilha. Tente novamente.'), TEMPO_ABERTURA_MS);
    iframe.onerror = () => falharAbertura('Não foi possível abrir o serviço de perfis.');
    window.addEventListener('message', receber);
    iframe.src = url.toString();
    document.body.appendChild(iframe);
  });
  return ponte;
}

async function enviarPedido(usuario, acao, dados, timeoutMs) {
  const idToken = await getIdToken(usuario);
  let ponte = abrirPonte();
  try {
    await ponte.pronta;
  } catch (erro) {
    if (erro.code !== 'PONTE_ABERTURA') throw erro;
    // Nenhum pedido foi enviado: recriar a ponte não repete uma gravação.
    ponte = abrirPonte();
    await ponte.pronta;
  }
  return new Promise((resolve, reject) => {
    let concluido = false;
    const finalizar = (erro, resultado) => {
      if (concluido) return;
      concluido = true;
      clearTimeout(temporizador);
      window.removeEventListener('message', receber);
      if (erro) reject(erro);
      else resolve(resultado);
    };
    const receber = evento => {
      if (!origemGooglePermitida(evento.origin) || evento.data?.nonce !== ponte.nonce) return;
      if (evento.data.cacoMed === 'resposta') finalizar(evento.data.erro ? new Error(evento.data.erro) : null, evento.data.resultado);
    };
    const temporizador = setTimeout(() => {
      descartarPonte(ponte);
      finalizar(new Error('A planilha demorou a responder. Tente novamente.'));
    }, timeoutMs);
    window.addEventListener('message', receber);
    ponte.destino.postMessage({
      cacoMed: 'pedido', nonce: ponte.nonce,
      pedido: { ...dados, acao, idToken, apiKey: import.meta.env.VITE_FIREBASE_API_KEY },
    }, ponte.origem);
  });
}

export function chamarPerfilPlanilha(usuario, acao, dados = {}, timeoutMs = 60000) {
  if (!usuario) return Promise.reject(new Error('Entre na conta para continuar.'));
  const pedido = fila.catch(() => {}).then(() => enviarPedido(usuario, acao, dados, timeoutMs));
  fila = pedido;
  return pedido;
}
