import { criarEntradaRevisao, responderRevisaoPerfil, encerrarRevisaoPerfil, originalRevisao, selecionarFilaRevisao, chaveItemRevisao, NIVEL_REVISAO,
  apresentarItemRevisao, avaliarItemRevisao, palavrasRevisao } from '../utils/revisaoInteligente.js';
import { filaDaSemana, iniciarSemanaRevisao, itensDaSemana, registrarCartaFeita, concluirSemanaRevisao, revisaoTravada, revisaoFeitaNaSemana,
  LIMITE_FILA_S, RITMO_PADRAO, ritmoDoJogador } from '../utils/revisaoSemanal.js';
import { inicioDaSemana } from '../utils/coroas.js';
import { concederRecompensa, nivelPorXP } from '../utils/economia.js';
import { BANCO_QUIZ, BANCO_FRASES } from '../utils/bancoTreinos.js';
import { BANCO_REVISAO_ERRO } from '../utils/erroMedicoRevisao.js';
import { obterAuditoria } from '../utils/erroMedico.js';

// Revisão v2: libera no nível 10 (o administrador sempre entra). Os erros são registrados desde o nível 1.
export const revisaoLiberada = perfil => perfil.role === 'admin' || nivelPorXP(perfil.pontuacaoTotal) >= NIVEL_REVISAO;
const ID_SESSAO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Resumo que a tela e o menu leem: a fila da semana (ou as cartas congeladas, se a revisão começou) e os contadores.
function resumoDaSemana(perfil, fila, agora) {
  const semana = perfil.revisao?.semana;
  const travada = revisaoTravada(perfil);
  const feita = revisaoFeitaNaSemana(perfil, agora);
  const temas = itens => [...new Set(itens.map(i => String(i.tema || '').replace(/^Erro médico · /, '')))].slice(0, 3);
  const cartas = travada ? semana.cartas.map(c => ({ id: c.id, modo: c.modo, erros: c.itens.length, segundos: c.segundos, temas: temas(c.itens),
    ...(semana.feitas[c.id] ? { feita: true, acertos: semana.feitas[c.id].acertos, total: semana.feitas[c.id].total } : {}) }))
    : feita ? [] : fila.cartas.map(c => ({ id: c.id, modo: c.modo, erros: c.itens.length, segundos: c.segundos, temas: temas(c.itens) }));
  const estado = travada ? 'andamento' : feita ? 'concluida' : fila.cartas.length ? 'pronta' : fila.resumoBase.total ? 'emDia' : 'vazia';
  return { semana: semana?.id, estado, cartas, segundos: travada ? semana.segundos : feita ? 0 : fila.segundos, limite: LIMITE_FILA_S, lotada: !travada && !feita && fila.lotada,
    reserva: travada || feita ? 0 : fila.reserva.length, ritmo: Math.round(fila.ritmo * 100) / 100,
    total: fila.resumoBase.total, disponiveis: fila.itens.length + fila.reserva.length, aguardando: fila.resumoBase.aguardando,
    proximaRevisao: fila.resumoBase.proximaRevisao, proximaSemana: inicioDaSemana(new Date(new Date(agora).getTime() + 7 * 86400000)).toISOString(), atualizadoEm: agora };
}

// Cartas da semana como a fila do motor espera (itens e cartas), para abrir a sessão de uma delas. Conteúdo que mudou de
// versão depois do começo da semana sai da carta.
const filaCongelada = semana => ({ itens: itensDaSemana(semana).filter(i => originalRevisao(i)),
  cartas: semana.cartas.map(c => ({ ...c, itens: c.itens.filter(i => originalRevisao(i)) })) });

export function operarRevisaoSupabase(perfil, pedido, tentativas, historico, recibos = [], agora = new Date().toISOString()) {
  if (!revisaoLiberada(perfil)) throw new Error(`A Revisão inteligente libera no nível ${NIVEL_REVISAO}.`);
  const entrada = perfil.revisao?.entrada;
  const reinicio = Date.parse(perfil.revisao?.reiniciadoEm) || 0;
  const anteriores = historico.filter(r => Date.parse(r.data) > reinicio);
  const doJogo = tentativas.filter(r => Date.parse(r.data) > reinicio);
  const ritmo = ritmoDoJogador(doJogo, anteriores);
  const comResumo = (p, revisoes = anteriores) => ({ ...p, revisao: { ...p.revisao, resumo: resumoDaSemana(p, filaDaSemana(doJogo, revisoes, agora, ritmo), agora) } });
  if (pedido.acao === 'consultarRevisao') {
    const atual = comResumo(perfil);
    // App offline: cada consulta prepara uma sessão por carta da semana que falta (sem gabarito), para a rede que cair.
    const semana = atual.revisao.semana;
    if (!revisaoTravada(atual)) return atual;
    const fila = filaCongelada(semana);
    const sessoes = Object.fromEntries(fila.cartas.filter(c => !semana.feitas[c.id] && c.itens.length)
      .map(c => [c.id, criarEntradaRevisao(fila, 'offline', agora, Math.random, c.id)]));
    return { ...atual, revisao: { ...atual.revisao, offline: { atualizadoEm: agora, sessoes } } };
  }
  if (pedido.acao === 'iniciarSemanaRevisao') {
    if (revisaoTravada(perfil)) return perfil;
    if (revisaoFeitaNaSemana(perfil, agora)) throw new Error('A revisão desta semana já foi feita. A próxima fica disponível na segunda.');
    return comResumo(iniciarSemanaRevisao(perfil, filaDaSemana(doJogo, anteriores, agora, ritmo), agora));
  }
  if (pedido.acao === 'iniciarRevisao') {
    if (entrada && (!entrada.encerrada || entrada.id === pedido.revisaoId)) return perfil;
    if (!ID_SESSAO.test(pedido.revisaoId || '')) throw new Error('Identificador inválido.');
    if (recibos.includes(pedido.revisaoId)) throw new Error('Esta sessão já foi encerrada.');
    const semana = perfil.revisao?.semana;
    if (!revisaoTravada(perfil)) throw new Error(revisaoFeitaNaSemana(perfil, agora) ? 'Esta carta já foi feita nesta semana.' : 'Comece a revisão da semana para abrir as cartas.');
    const carta = semana.cartas.find(c => c.id === String(pedido.carta || ''));
    if (!carta) throw new Error('Carta não encontrada. Atualize a revisão.');
    if (semana.feitas[carta.id]) throw new Error('Esta carta já foi feita nesta semana.');
    const fila = filaCongelada(semana);
    // A carta que ficou sem itens (todos mudaram de versão) conta como feita.
    if (!fila.cartas.find(c => c.id === carta.id).itens.length) {
      const vazia = { ...perfil, revisao: { ...perfil.revisao, entrada: { id: pedido.revisaoId, carta: carta.id, modo: carta.modo, itens: [], resultados: [],
        encerrada: true, encerradoEm: agora, historicoConfirmado: true, iniciadoEm: agora, relatorio: { acertos: 0, respondidos: 0, total: 0, temas: [], xp: 0, proximaRevisao: null } } } };
      return comResumo(concluirSemanaRevisao(registrarCartaFeita(vazia), agora));
    }
    return { ...perfil, revisao: { ...perfil.revisao, entrada: criarEntradaRevisao(fila, pedido.revisaoId, agora, Math.random, carta.id) } };
  }
  let novo;
  if (pedido.acao === 'encerrarRevisao') novo = encerrarRevisaoPerfil(perfil, pedido.revisaoId, agora);
  else if (pedido.acao === 'responderRevisao') novo = responderRevisaoPerfil(perfil, pedido.revisaoId,
    { itemId: pedido.itemId, versao: pedido.versao, escolha: pedido.escolha, tempoMs: pedido.tempoMs }, anteriores, agora);
  else throw new Error('Operação inválida.');
  if (novo === perfil) return perfil;
  // +40 XP pelo item dominado nesta resposta (não conta para missões nem tickets).
  const ultimo = pedido.acao === 'responderRevisao' ? novo.revisao.entrada.resultados.at(-1) : null;
  if (ultimo?.dominou) novo = { ...concederRecompensa(novo, ultimo.xp), revisao: novo.revisao };
  // Carta terminada: entra no relatório da semana; a última fecha a semana e paga o prêmio.
  if (novo.revisao.entrada.encerrada) novo = concluirSemanaRevisao(registrarCartaFeita(novo), agora);
  const resultados = novo.revisao.entrada.resultados;
  const novos = resultados.filter(r => !anteriores.some(h => h.revisaoId === pedido.revisaoId && h.itemId === r.itemId && h.versao === r.versao));
  const atualizado = comResumo(novo, [...anteriores, ...novos.map(r => ({ ...r, revisaoId: pedido.revisaoId }))]);
  return { ...atualizado, revisao: { ...atualizado.revisao, entrada: { ...atualizado.revisao.entrada, historicoConfirmado: true } } };
}

// Relatório geral da semana (o anel): as cartas feitas, com o conteúdo de cada item, o gabarito, a explicação revisada e
// as medidas de ritmo (decididas em 19/10/2026). O tempo esperado usa o ritmo de antes da semana; o que passa dele é
// indecisão. O gabarito só sai de carta já feita.
export function relatorioSemanaRevisao(perfil) {
  const semana = perfil?.revisao?.semana;
  if (!semana) throw new Error('Nenhuma revisão da semana para mostrar.');
  const ritmo = Number(semana.ritmo) || RITMO_PADRAO.sPorPalavra;
  const cartas = semana.cartas.filter(c => semana.feitas[c.id]).map(c => {
    const feita = semana.feitas[c.id];
    const itens = feita.resultados.filter(r => originalRevisao(r)).map(r => {
      const avaliado = avaliarItemRevisao(r, r.escolha);
      const palavras = palavrasRevisao(r);
      const esperadoMs = Math.round(palavras * ritmo * 1000);
      return { modo: r.modo, itemId: r.itemId, versao: r.versao, tema: avaliado.tema, ...apresentarItemRevisao(r),
        escolha: r.escolha, correta: avaliado.correta, acertou: r.acertou, explicacao: avaliado.explicacao, fonte: avaliado.fonte,
        ...(avaliado.etapas ? { etapas: avaliado.etapas } : {}), ...(r.parecida ? { parecida: true } : { escolhaPartida: r.escolhaPartida }),
        palavras, esperadoMs, ...(r.tempoMs ? { tempoMs: r.tempoMs, indecisaoMs: Math.max(0, r.tempoMs - esperadoMs) } : {}) };
    });
    return { id: c.id, modo: c.modo, revisaoId: feita.revisaoId, acertos: feita.acertos, total: feita.total, abandonada: feita.abandonada, itens };
  });
  return { semana: semana.id, iniciadaEm: semana.iniciadaEm, concluidaEm: semana.concluidaEm || null, ritmo, itens: semana.itens || 0,
    premio: semana.premio || null, missao: semana.missao || null, faltam: semana.cartas.filter(c => !semana.feitas[c.id]).length, cartas };
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
  // A carta do Erro médico leva todos os casos da semana; as outras, até 7 itens.
  if (!Array.isArray(itens) || !itens.length || itens.length > 20 || !Array.isArray(respostas) || respostas.length > itens.length) throw new Error('Sessão da fila inválida.');
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
  for (const r of respostas) atual = operarRevisaoSupabase(atual, { acao: 'responderRevisao', revisaoId: item.id, itemId: r?.itemId, versao: Number(r?.versao), escolha: r?.escolha, tempoMs: r?.tempoMs }, tentativas, historico, [], agora);
  if (encerrada && !atual.revisao.entrada.encerrada) atual = operarRevisaoSupabase(atual, { acao: 'encerrarRevisao', revisaoId: item.id }, tentativas, historico, [], agora);
  const eventos = eventosRevisao(atual);
  // Outra sessão aberta online continua aberta; a sessão offline só deixa as respostas, o XP e os recibos.
  if (anterior && !anterior.encerrada && anterior.id !== item.id) atual = { ...atual, revisao: { ...atual.revisao, entrada: anterior } };
  return { perfil: atual, eventos };
}
