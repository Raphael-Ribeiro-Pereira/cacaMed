import { BANCO_QUIZ, BANCO_FRASES } from './bancoTreinos.js';
import { avaliarRespostaTreino } from './treinos.js';

const DIA_REVISAO = 86400000;
export const chaveItemRevisao = item => JSON.stringify([item.modo, item.itemId || item.id, Number(item.versao)]);
const tempoRevisao = valor => Number.isFinite(Date.parse(valor)) ? Date.parse(valor) : 0;
const BANCOS_REVISAO = { quiz: BANCO_QUIZ, verdadeMentira: BANCO_FRASES };
const AVALIADORES_REVISAO = {};
// Bancos de outros modos (como a Batalha) se registram ao serem importados pela API
// Supabase. O motor do Apps Script legado continua só com Quiz e Verdade ou mentira.
export function registrarBancoRevisao(modo, banco, avaliar) { BANCOS_REVISAO[modo] = banco; AVALIADORES_REVISAO[modo] = avaliar; }
const originalRevisao = item => (BANCOS_REVISAO[item.modo] || [])
  .find(q => q.id === (item.itemId || item.id) && q.versao === Number(item.versao));

function limitarFrequenciaRevisao(proxima, anteriores, agora) {
  const recentes = anteriores.map(r => tempoRevisao(r.data))
    .filter(data => data > agora - 7 * DIA_REVISAO && data <= agora).sort((a, b) => a - b);
  return recentes.length >= 2 ? Math.max(proxima, recentes.at(-2) + 7 * DIA_REVISAO) : proxima;
}

// Recebe somente registros do próprio jogador, filtrados pela API autenticada.
// Gabaritos e escolhas não integram o resumo da fila retornado ao navegador.
export function selecionarFilaRevisao(tentativas, revisoes, agora = new Date().toISOString()) {
  const instante = tempoRevisao(agora);
  const grupos = new Map();
  const vistos = new Set();
  for (const r of tentativas) {
    if (!originalRevisao(r) || typeof r.acertou !== 'boolean' || !tempoRevisao(r.data)) continue;
    const chave = chaveItemRevisao(r);
    const recibo = JSON.stringify([r.rodadaId, chave]);
    if (vistos.has(recibo)) continue;
    vistos.add(recibo);
    const grupo = grupos.get(chave) || { ...r, erros: 0, primeiroErro: Infinity, ultimoErro: 0 };
    if (!r.acertou) {
      grupo.erros++;
      grupo.primeiroErro = Math.min(grupo.primeiroErro, tempoRevisao(r.data));
      grupo.ultimoErro = Math.max(grupo.ultimoErro, tempoRevisao(r.data));
    }
    if (tempoRevisao(r.data) >= tempoRevisao(grupo.data)) { grupo.data = r.data; grupo.acertou = r.acertou; }
    grupos.set(chave, grupo);
  }
  const itens = [];
  for (const [chave, grupo] of grupos) {
    if (!grupo.erros) continue;
    const anteriores = revisoes.filter(r => chaveItemRevisao(r) === chave).sort((a, b) => tempoRevisao(a.data) - tempoRevisao(b.data));
    const ultima = anteriores.at(-1);
    const novoErro = ultima && grupo.ultimoErro > tempoRevisao(ultima.data);
    let proxima = ultima && !novoErro ? tempoRevisao(ultima.proximaRevisao) : grupo.ultimoErro;
    if (grupo.acertou) proxima = Math.max(proxima, tempoRevisao(grupo.data) + DIA_REVISAO);
    proxima = limitarFrequenciaRevisao(proxima, anteriores, instante);
    itens.push({ modo: grupo.modo, itemId: grupo.itemId, versao: Number(grupo.versao), tema: grupo.tema,
      erros: grupo.erros, primeiroErro: grupo.primeiroErro, revisada: Boolean(ultima),
      sequencia: novoErro ? 0 : Number(ultima?.sequencia) || 0, proximaRevisao: new Date(proxima).toISOString() });
  }
  const elegiveis = itens.filter(r => tempoRevisao(r.proximaRevisao) <= instante)
    .sort((a, b) => Number(a.revisada) - Number(b.revisada) || b.erros - a.erros || a.primeiroErro - b.primeiroErro || chaveItemRevisao(a).localeCompare(chaveItemRevisao(b)));
  const futuras = itens.filter(r => tempoRevisao(r.proximaRevisao) > instante);
  return { itens: elegiveis.slice(0, 5), resumo: { total: itens.length, disponiveis: elegiveis.length, aguardando: futuras.length,
    proximaRevisao: futuras.length ? new Date(Math.min(...futuras.map(r => tempoRevisao(r.proximaRevisao)))).toISOString() : null,
    atualizadoEm: agora } };
}

export function criarEntradaRevisao(fila, id, agora = new Date().toISOString(), sorteio = Math.random) {
  if (!fila.itens.length) throw new Error('Nenhum item disponível para revisão agora.');
  const itens = fila.itens.map(item => {
    const original = originalRevisao(item);
    const base = { id: item.itemId, modo: item.modo, versao: item.versao, tema: original.tema, sequenciaAnterior: item.sequencia };
    if (item.modo === 'verdadeMentira') return { ...base, texto: original.texto };
    const opcoes = original.opcoes.map(o => ({ ...o }));
    for (let i = opcoes.length - 1; i > 0; i--) { const j = Math.floor(sorteio() * (i + 1)); [opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]]; }
    return { ...base, variante: original.variante, enunciado: original.enunciado, opcoes };
  });
  return { id, itens, resultados: [], encerrada: false, historicoConfirmado: true, iniciadoEm: agora };
}

export function responderRevisaoPerfil(perfil, id, resposta, historico = [], agora = new Date().toISOString()) {
  const stats = perfil.revisao || {};
  const entrada = stats.entrada;
  if (!entrada || entrada.id !== id) throw new Error('Sessão não encontrada. Consulte a revisão salva.');
  const anterior = entrada.resultados.find(r => r.itemId === resposta.itemId && r.versao === resposta.versao);
  if (anterior) {
    if (anterior.escolha === resposta.escolha) return perfil;
    throw new Error('Esta resposta já foi confirmada. Consulte a revisão salva.');
  }
  const item = entrada.itens[entrada.resultados.length];
  if (entrada.encerrada || !item || item.id !== resposta.itemId || item.versao !== resposta.versao) throw new Error('A sessão mudou. Consulte a revisão salva.');
  const avaliacao = AVALIADORES_REVISAO[item.modo] ? AVALIADORES_REVISAO[item.modo](item, resposta) : avaliarRespostaTreino({ modo: item.modo, itens: [item] }, resposta, 0);
  const sequencia = avaliacao.acertou ? item.sequenciaAnterior + 1 : 0;
  const dias = avaliacao.acertou ? (sequencia === 1 ? 1 : sequencia === 2 ? 3 : 7) : 0;
  const anteriores = historico.filter(r => chaveItemRevisao(r) === chaveItemRevisao(item));
  const proxima = limitarFrequenciaRevisao(tempoRevisao(agora) + dias * DIA_REVISAO, [...anteriores, { data: agora }], tempoRevisao(agora));
  const resultado = { ...avaliacao, modo: item.modo, data: agora, sequencia, proximaRevisao: new Date(proxima).toISOString() };
  const resultados = [...entrada.resultados, resultado];
  const terminou = resultados.length === entrada.itens.length;
  const nova = { ...entrada, resultados, historicoConfirmado: false, encerrada: terminou,
    ...(terminou ? { encerradoEm: agora, relatorio: relatorioRevisao(entrada.itens, resultados) } : {}) };
  return { ...perfil, revisao: { ...stats, entrada: nova, itens: (stats.itens || 0) + 1, acertos: (stats.acertos || 0) + Number(resultado.acertou),
    sessoes: (stats.sessoes || 0) + Number(terminou) } };
}

function relatorioRevisao(itens, resultados) {
  return { acertos: resultados.filter(r => r.acertou).length, respondidos: resultados.length, total: itens.length,
    temas: [...new Set(resultados.map(r => r.tema))],
    proximaRevisao: resultados.length ? new Date(Math.min(...resultados.map(r => tempoRevisao(r.proximaRevisao)))).toISOString() : null };
}

export function encerrarRevisaoPerfil(perfil, id, agora = new Date().toISOString()) {
  const stats = perfil.revisao || {};
  const entrada = stats.entrada;
  if (!entrada || entrada.id !== id) throw new Error('Sessão não encontrada. Consulte a revisão salva.');
  if (entrada.encerrada) return perfil;
  return { ...perfil, revisao: { ...stats, abandonadas: (stats.abandonadas || 0) + 1,
    entrada: { ...entrada, encerrada: true, abandonada: true, historicoConfirmado: false, encerradoEm: agora,
      relatorio: relatorioRevisao(entrada.itens, entrada.resultados) } } };
}
