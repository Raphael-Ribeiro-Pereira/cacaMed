import { armazemDoAparelho } from './filaOffline.js';

// Sessão de 15 dias sem rede (docs/app-offline.md#sessão-de-15-dias): o aparelho guarda o último perfil e a data do
// último contato confirmado com o servidor. Sem rede, o app abre com esse perfil enquanto a data tiver menos de 15 dias.
export const VALIDADE_OFFLINE_MS = 15 * 86400000;
export const sessaoOfflineValida = (validadoEm, agora = Date.now()) => {
  const t = Date.parse(validadoEm);
  return Number.isFinite(t) && t <= agora && agora - t < VALIDADE_OFFLINE_MS;
};

const chave = uid => `perfil:${uid}`;
// Guarda o perfil atual (pode ter XP provisório); `confirmado` renova a validação de 15 dias.
// As gravações vão em fila: uma gravação de tela não pode apagar a data de uma confirmação que chegou junto.
let fila = Promise.resolve();
export function guardarPerfil(uid, perfil, { confirmado = false, armazem = armazemDoAparelho() } = {}) {
  if (!uid || !perfil) return Promise.resolve();
  fila = fila.catch(() => {}).then(async () => {
    const anterior = await armazem.ler(chave(uid)).catch(() => null);
    await armazem.gravar(chave(uid), { perfil, validadoEm: confirmado ? new Date().toISOString() : anterior?.validadoEm || null });
  });
  return fila;
}

// Devolve { perfil, validadoEm } quando a sessão offline ainda vale; { vencida: true } quando passou de 15 dias.
export async function perfilGuardado(uid, { agora = Date.now(), armazem = armazemDoAparelho() } = {}) {
  const guardado = await armazem.ler(chave(uid)).catch(() => null);
  if (!guardado?.perfil) return null;
  return sessaoOfflineValida(guardado.validadoEm, agora) ? guardado : { vencida: true };
}

// Banco de palavras da última consulta, para a cruzadinha abrir sem rede.
export const guardarPalavras = (banco, armazem = armazemDoAparelho()) => armazem.gravar('palavras', { banco, guardadoEm: new Date().toISOString() }).catch(() => {});
export const palavrasGuardadas = async (armazem = armazemDoAparelho()) => (await armazem.ler('palavras').catch(() => null))?.banco || null;
