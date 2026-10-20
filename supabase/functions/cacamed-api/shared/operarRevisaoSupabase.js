import { selecionarFilaRevisao, criarEntradaRevisao, responderRevisaoPerfil, encerrarRevisaoPerfil, chaveItemRevisao, originalRevisao, NIVEL_REVISAO } from '../utils/revisaoInteligente.js';
import { concederRecompensa, nivelPorXP } from '../utils/economia.js';
import { BANCO_QUIZ, BANCO_FRASES } from '../utils/bancoTreinos.js';
import { BANCO_REVISAO_ERRO } from '../utils/erroMedicoRevisao.js';
import { obterAuditoria } from '../utils/erroMedico.js';

// Revisão v2: libera no nível 10 (o administrador sempre entra). Os erros são registrados desde o nível 1.
export const revisaoLiberada = perfil => perfil.role === 'admin' || nivelPorXP(perfil.pontuacaoTotal) >= NIVEL_REVISAO;

export function operarRevisaoSupabase(perfil, pedido, tentativas, historico, recibos = [], agora = new Date().toISOString()) {
  if (!revisaoLiberada(perfil)) throw new Error(`A Revisão inteligente libera no nível ${NIVEL_REVISAO}.`);
  const entrada = perfil.revisao?.entrada;
  const reinicio = Date.parse(perfil.revisao?.reiniciadoEm) || 0;
  const anteriores = historico.filter(r => Date.parse(r.data) > reinicio);
  const fila = () => selecionarFilaRevisao(tentativas.filter(r => Date.parse(r.data) > reinicio), anteriores, agora);
  if (pedido.acao === 'consultarRevisao' || pedido.acao === 'iniciarRevisao') {
    if (pedido.acao === 'iniciarRevisao' && entrada && (!entrada.encerrada || entrada.id === pedido.revisaoId)) return perfil;
    const selecao = fila();
    let nova = entrada;
    if (pedido.acao === 'iniciarRevisao') {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pedido.revisaoId || '')) throw new Error('Identificador inválido.');
      if (recibos.includes(pedido.revisaoId)) throw new Error('Esta sessão já foi encerrada.');
      nova = criarEntradaRevisao(selecao, pedido.revisaoId, agora, Math.random, pedido.carta ? String(pedido.carta) : undefined);
    }
    // App offline: cada consulta prepara uma sessão por carta (sem gabarito), que o aparelho usa se a rede cair.
    const offline = pedido.acao === 'consultarRevisao' ? { offline: { atualizadoEm: agora,
      sessoes: Object.fromEntries(selecao.cartas.map(c => [c.id, criarEntradaRevisao(selecao, 'offline', agora, Math.random, c.id)])) } } : {};
    return { ...perfil, revisao: { ...perfil.revisao, resumo: selecao.resumo, ...offline, ...(nova ? { entrada: nova } : {}) } };
  }
  let novo;
  if (pedido.acao === 'encerrarRevisao') novo = encerrarRevisaoPerfil(perfil, pedido.revisaoId, agora);
  else if (pedido.acao === 'responderRevisao') novo = responderRevisaoPerfil(perfil, pedido.revisaoId,
    { itemId: pedido.itemId, versao: pedido.versao, escolha: pedido.escolha }, anteriores, agora);
  else throw new Error('Operação inválida.');
  if (novo === perfil) return perfil;
  // +40 XP pelo item dominado nesta resposta (não conta para missões nem tickets).
  const ultimo = pedido.acao === 'responderRevisao' ? novo.revisao.entrada.resultados.at(-1) : null;
  if (ultimo?.dominou) novo = { ...concederRecompensa(novo, ultimo.xp), revisao: novo.revisao };
  const resultados = novo.revisao.entrada.resultados;
  const novos = resultados.filter(r => !anteriores.some(h => h.revisaoId === pedido.revisaoId && h.itemId === r.itemId && h.versao === r.versao));
  const resumo = selecionarFilaRevisao(tentativas.filter(r => Date.parse(r.data) > reinicio), [...anteriores, ...novos], agora).resumo;
  return { ...novo, revisao: { ...novo.revisao, resumo, entrada: { ...novo.revisao.entrada, historicoConfirmado: true } } };
}

// Ferramenta de admin: 3 erros do Quiz, 2 do V ou M e 1 caso do Erro médico, sorteados no banco, como respostas
// erradas de uma rodada fictícia de agora. Viram tentativas da fila como as de um jogo de verdade.
export function errosFicticiosRevisao(agora, sorteio = Math.random) {
  const sortear = (lista, quantidade) => {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) { const j = Math.floor(sorteio() * (i + 1)); [copia[i], copia[j]] = [copia[j], copia[i]]; }
    return copia.slice(0, quantidade);
  };
  const rodadaId = `admin-${crypto.randomUUID()}`;
  const erradaDe = q => q.opcoes ? q.opcoes.find(o => o.id !== q.correta).id : !q.verdadeira;
  const tentativas = [...sortear(BANCO_QUIZ, 3), ...sortear(BANCO_FRASES, 2)].map(q => ({ modo: q.opcoes ? 'quiz' : 'verdadeMentira',
    itemId: q.id, versao: q.versao, tema: q.tema, escolha: erradaDe(q) }));
  for (const item of sortear(BANCO_REVISAO_ERRO, 1)) {
    const caso = obterAuditoria(item.id);
    tentativas.push({ modo: 'erroMedico', itemId: item.id, versao: item.versao, tema: item.tema,
      escolha: caso.perguntas.map(p => p.alternativas.find(a => a.id !== p.correta).id) });
  }
  return tentativas.map(t => ({ id: `resposta:${rodadaId}:${t.modo}:${t.itemId}`, kind: 'resposta',
    data: { ...t, acertou: false, rodadaId, data: new Date(agora).toISOString() } }));
}

export function eventosRevisao(perfil) {
  const entrada = perfil.revisao?.entrada;
  if (!entrada) return [];
  const eventos = entrada.resultados.map(r => ({ id: `revisao:${entrada.id}:${r.modo}:${r.itemId}:${r.versao}`,
    kind: 'revisao', data: { ...r, revisaoId: entrada.id } }));
  if (entrada.encerrada) eventos.push({ id: `recibo:${entrada.id}`, kind: 'recibo', data: { revisaoId: entrada.id, modo: 'revisao' } });
  return eventos;
}

// Sessão da Revisão jogada sem rede (fila do app offline, tipo `sessaoRevisao`). Os itens precisam existir no banco atual;
// a sequência de acertos de cada um vem do histórico do servidor, nunca do aparelho, porque ela decide o XP de domínio.
export function sincronizarSessaoRevisao(perfil, item, tentativas, historico, recibos = [], agora = new Date().toISOString()) {
  if (!revisaoLiberada(perfil)) throw new Error(`A Revisão inteligente libera no nível ${NIVEL_REVISAO}.`);
  if (!/^[0-9a-f-]{36}$/i.test(String(item?.id || ''))) throw new Error('Item da fila inválido.');
  if (recibos.includes(item.id)) return { perfil, eventos: [] };
  const { itens, respostas, encerrada } = item.dados || {};
  if (!Array.isArray(itens) || !itens.length || itens.length > 7 || !Array.isArray(respostas) || respostas.length > itens.length) throw new Error('Sessão da fila inválida.');
  const reinicio = Date.parse(perfil.revisao?.reiniciadoEm) || 0;
  const anteriores = historico.filter(r => Date.parse(r.data) > reinicio);
  const fila = selecionarFilaRevisao(tentativas.filter(r => Date.parse(r.data) > reinicio), anteriores, agora);
  const sequenciaDe = chave => {
    const naFila = fila.itens.find(i => chaveItemRevisao(i) === chave);
    if (naFila) return naFila.sequencia;
    const ultima = anteriores.filter(r => chaveItemRevisao(r) === chave).sort((a, b) => Date.parse(a.data) - Date.parse(b.data)).at(-1);
    return ultima?.acertou ? Number(ultima.sequencia) || 0 : 0;
  };
  const montados = itens.map(i => {
    const original = originalRevisao({ modo: i?.modo, itemId: i?.id, versao: i?.versao });
    if (!original) throw new Error('Conteúdo desatualizado: esta sessão usou itens que mudaram. Ela não conta.');
    const chave = chaveItemRevisao({ modo: i.modo, itemId: i.id, versao: i.versao });
    return { id: original.id, modo: i.modo, versao: original.versao, tema: original.tema, sequenciaAnterior: sequenciaDe(chave),
      ...(i.parecida ? { parecida: true } : { escolhaPartida: i.escolhaPartida }), ...(original.opcoes ? { opcoes: original.opcoes } : {}) };
  });
  const anterior = perfil.revisao?.entrada;
  let atual = { ...perfil, revisao: { ...perfil.revisao, entrada: { id: item.id, carta: item.dados.carta, itens: montados, resultados: [], encerrada: false, historicoConfirmado: true, iniciadoEm: agora } } };
  for (const r of respostas) atual = operarRevisaoSupabase(atual, { acao: 'responderRevisao', revisaoId: item.id, itemId: r?.itemId, versao: Number(r?.versao), escolha: r?.escolha }, tentativas, historico, [], agora);
  if (encerrada && !atual.revisao.entrada.encerrada) atual = operarRevisaoSupabase(atual, { acao: 'encerrarRevisao', revisaoId: item.id }, tentativas, historico, [], agora);
  const eventos = eventosRevisao(atual);
  // Outra sessão aberta online continua aberta; a sessão offline só deixa as respostas, o XP e os recibos.
  if (anterior && !anterior.encerrada && anterior.id !== item.id) atual = { ...atual, revisao: { ...atual.revisao, entrada: anterior } };
  return { perfil: atual, eventos };
}
