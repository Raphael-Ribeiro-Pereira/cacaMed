import { BANCO_QUIZ, BANCO_FRASES } from './bancoTreinos.js';
import { avaliarRespostaTreino, conceitoDoQuiz, frasesDoSorteio } from './treinos.js';
import { inicioDaSemana } from './coroas.js';

// Revisão Inteligente v2 (decidida em 07/10/2026; docs/revisao-inteligente.md), semanal desde 19/10/2026.
export const TAMANHO_SESSAO = 7;
export const NIVEL_REVISAO = 10;
export const XP_DOMINIO = 40;
// Sequência de acertos que domina o item: o terceiro acerto seguido. O item dominado sai da fila até um erro novo.
export const SEQUENCIA_DOMINIO = 3;
// Repetição em semanas (decidida em 19/10/2026): errou ou acertou a primeira, volta na semana seguinte; acertou a
// segunda seguida, volta duas semanas depois. A semana é a das Coroas (segunda a domingo, horário de Brasília).
export const proximaSemanaRevisao = (agora, sequencia) =>
  inicioDaSemana(new Date(new Date(agora).getTime() + (sequencia === 2 ? 2 : 1) * 7 * 86400000)).toISOString();
// Modos com carta. Os erros da Batalha não entram na Revisão (decidido em 19/10/2026).
export const MODOS_CARTA = ['quiz', 'verdadeMentira', 'erroMedico'];

const DIA_REVISAO = 86400000;
// Ferramenta de admin: o relógio da Revisão adiantado em dias, para ver os intervalos sem esperar. Só vale para o
// administrador; as respostas dadas nesse tempo ficam com a data adiantada.
export const MAXIMO_RELOGIO_ADMIN = 60;
export const agoraDaRevisao = (perfil, agora = new Date().toISOString()) => {
  const dias = perfil?.role === 'admin' ? Math.min(MAXIMO_RELOGIO_ADMIN, Math.max(0, Number(perfil.revisao?.relogioAdminDias) || 0)) : 0;
  return new Date(new Date(agora).getTime() + dias * DIA_REVISAO).toISOString();
};
export const chaveItemRevisao = item => JSON.stringify([item.modo, item.itemId || item.id, Number(item.versao)]);
const tempoRevisao = valor => Number.isFinite(Date.parse(valor)) ? Date.parse(valor) : 0;
const BANCOS_REVISAO = { quiz: BANCO_QUIZ, verdadeMentira: BANCO_FRASES };
const AVALIADORES_REVISAO = {};
const APRESENTADORES_REVISAO = {};
// Bancos de outros modos (Batalha, Erro médico) se registram ao serem importados pela API Supabase.
export function registrarBancoRevisao(modo, banco, avaliar, apresentar) {
  BANCOS_REVISAO[modo] = banco; AVALIADORES_REVISAO[modo] = avaliar;
  if (apresentar) APRESENTADORES_REVISAO[modo] = apresentar;
}
export const originalRevisao = item => (BANCOS_REVISAO[item.modo] || [])
  .find(q => q.id === (item.itemId || item.id) && q.versao === Number(item.versao));

// Palavras que a pessoa lê para responder (decidido em 19/10/2026): enunciado e alternativas. No Erro médico, o caso
// inteiro (prontuário e as três etapas). Base do ritmo de leitura e raciocínio e do tempo estimado da fila.
const contarPalavras = textos => textos.join(' ').split(/\s+/).filter(p => /[\p{L}\d]/u.test(p)).length;
const textosDe = valor => typeof valor === 'string' ? [valor] : Array.isArray(valor) ? valor.flatMap(textosDe)
  : valor && typeof valor === 'object' ? Object.entries(valor).filter(([k]) => k !== 'id').flatMap(([, v]) => textosDe(v)) : [];
const palavrasGuardadas = new Map();
export function palavrasRevisao(item) {
  const original = originalRevisao(item);
  if (!original) return 0;
  const chave = chaveItemRevisao(item);
  if (!palavrasGuardadas.has(chave)) palavrasGuardadas.set(chave, item.modo === 'quiz' ? contarPalavras([original.enunciado, ...original.opcoes.map(o => o.texto)])
    : item.modo === 'verdadeMentira' ? contarPalavras([original.texto, 'Verdadeira', 'Falsa'])
      : contarPalavras(textosDe(APRESENTADORES_REVISAO[item.modo] ? APRESENTADORES_REVISAO[item.modo](original) : original)));
  return palavrasGuardadas.get(chave);
}
// Tempo até responder, medido no aparelho (do item aparecer ao toque). Fora de 0 a 10 minutos, não é guardado.
export const tempoRespostaValido = valor => Number.isInteger(valor) && valor > 0 && valor <= 600000;

// Uma pergunta parecida errada na revisão entra na fila como se fosse um erro de partida.
const errosDeParecidas = revisoes => revisoes.filter(r => r.parecida && r.acertou === false)
  .map(r => ({ modo: r.modo, itemId: r.itemId, versao: r.versao, tema: r.tema, escolha: r.escolha, acertou: false, data: r.data, rodadaId: r.revisaoId }));

// Recebe somente registros do próprio jogador, filtrados pela API autenticada.
// Gabaritos não integram o resumo da fila retornado ao navegador.
export function selecionarFilaRevisao(tentativas, revisoes, agora = new Date().toISOString()) {
  const instante = tempoRevisao(agora);
  const grupos = new Map();
  const vistos = new Set();
  for (const r of [...tentativas, ...errosDeParecidas(revisoes)]) {
    // Só os modos com carta: os erros da Batalha saíram da Revisão em 19/10/2026 (o histórico antigo fica guardado).
    if (!MODOS_CARTA.includes(r.modo)) continue;
    if (!originalRevisao(r) || typeof r.acertou !== 'boolean' || !tempoRevisao(r.data)) continue;
    const chave = chaveItemRevisao(r);
    const recibo = JSON.stringify([r.rodadaId, chave]);
    if (vistos.has(recibo)) continue;
    vistos.add(recibo);
    const grupo = grupos.get(chave) || { ...r, erros: 0, primeiroErro: Infinity, ultimoErro: 0 };
    if (!r.acertou) {
      grupo.erros++;
      grupo.primeiroErro = Math.min(grupo.primeiroErro, tempoRevisao(r.data));
      if (tempoRevisao(r.data) >= grupo.ultimoErro) { grupo.ultimoErro = tempoRevisao(r.data); grupo.escolhaPartida = r.escolha; }
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
    // Dominado (terceiro acerto seguido): sai da fila até errar de novo num jogo.
    if (ultima && !novoErro && Number(ultima.sequencia) >= SEQUENCIA_DOMINIO) continue;
    let proxima = ultima && !novoErro ? tempoRevisao(ultima.proximaRevisao) : grupo.ultimoErro;
    if (grupo.acertou) proxima = Math.max(proxima, tempoRevisao(grupo.data) + DIA_REVISAO);
    itens.push({ modo: grupo.modo, itemId: grupo.itemId, versao: Number(grupo.versao), tema: grupo.tema,
      erros: grupo.erros, primeiroErro: grupo.primeiroErro, ultimoErro: grupo.ultimoErro, revisada: Boolean(ultima), escolhaPartida: grupo.escolhaPartida,
      sequencia: novoErro ? 0 : Number(ultima?.sequencia) || 0, proximaRevisao: new Date(proxima).toISOString() });
  }
  const elegiveis = itens.filter(r => tempoRevisao(r.proximaRevisao) <= instante)
    .sort((a, b) => Number(a.revisada) - Number(b.revisada) || b.erros - a.erros || a.primeiroErro - b.primeiroErro || chaveItemRevisao(a).localeCompare(chaveItemRevisao(b)));
  const futuras = itens.filter(r => tempoRevisao(r.proximaRevisao) > instante);
  const cartas = montarCartas(elegiveis);
  return { itens: elegiveis, cartas, resumo: { total: itens.length, disponiveis: elegiveis.length, aguardando: futuras.length,
    cartas: cartas.map(({ id, modo, itens: lista }) => ({ id, modo, erros: lista.length })),
    proximaRevisao: futuras.length ? new Date(Math.min(...futuras.map(r => tempoRevisao(r.proximaRevisao)))).toISOString() : null,
    atualizadoEm: agora } };
}

// Quiz e V ou M: cartas de até 7 erros, na ordem de prioridade. Erro médico: uma carta com os casos em sequência.
export function montarCartas(elegiveis) {
  const cartas = [];
  for (const modo of MODOS_CARTA) {
    const doModo = elegiveis.filter(i => i.modo === modo);
    if (!doModo.length) continue;
    const tamanho = modo === 'erroMedico' ? doModo.length : TAMANHO_SESSAO;
    for (let i = 0; i < doModo.length; i += tamanho) cartas.push({ id: `${modo}-${i / tamanho + 1}`, modo, itens: doModo.slice(i, i + tamanho) });
  }
  return cartas;
}

// Palavras que contam na comparação: sem acento, com mais de 3 letras e fora da lista de palavras comuns.
const COMUNS = new Set(['para', 'como', 'qual', 'quais', 'mais', 'menos', 'pode', 'podem', 'sobre', 'entre', 'quando', 'onde', 'esta', 'este', 'essa',
  'esse', 'isso', 'pelo', 'pela', 'pelos', 'pelas', 'seus', 'suas', 'sendo', 'deve', 'muito', 'outro', 'outra', 'apenas', 'cada', 'todo', 'toda',
  'ocorre', 'ser', 'sao', 'tem', 'uma', 'umas', 'uns', 'dos', 'das', 'nos', 'nas', 'com', 'sem', 'por', 'que', 'aos']);
const palavras = texto => new Set(String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .split(/[^a-z0-9]+/).filter(p => p.length > 3 && !COMUNS.has(p)));
const conceitoDe = (modo, item) => modo === 'quiz' ? conceitoDoQuiz(item) : item.conceito;
const textoDe = (modo, item) => modo === 'quiz' ? item.enunciado : item.texto;

// Perguntas parecidas, nesta ordem: mesmo conceito, mesmo tema e palavras iguais no enunciado.
export function escolherParecidas(modo, base, quantidade, excluir = new Set()) {
  if (quantidade <= 0) return [];
  const banco = modo === 'quiz' ? BANCO_QUIZ : frasesDoSorteio();
  const originais = base.map(originalRevisao).filter(Boolean);
  const conceitos = new Set(originais.map(o => conceitoDe(modo, o)).filter(Boolean));
  const temas = new Set(originais.map(o => o.tema));
  const termos = new Set(originais.flatMap(o => [...palavras(textoDe(modo, o))]));
  const candidatos = banco.filter(q => !excluir.has(chaveItemRevisao({ modo, id: q.id, versao: q.versao })))
    .map(q => ({ q, nota: (conceitoDe(modo, q) && conceitos.has(conceitoDe(modo, q)) ? 1000 : 0) + (temas.has(q.tema) ? 100 : 0)
      + [...palavras(textoDe(modo, q))].filter(p => termos.has(p)).length }))
    .filter(c => c.nota > 0)
    .sort((a, b) => b.nota - a.nota || a.q.id.localeCompare(b.q.id));
  const escolhidas = [];
  const usados = new Set();
  for (const { q } of candidatos) {
    if (usados.has(q.id)) continue;
    usados.add(q.id);
    escolhidas.push({ modo, itemId: q.id, versao: q.versao, tema: q.tema, sequencia: 0, parecida: true });
    if (escolhidas.length === quantidade) break;
  }
  return escolhidas;
}

// Abre a sessão de uma carta: os erros da carta e, no Quiz e no V ou M, perguntas parecidas até chegar a 7.
export function criarEntradaRevisao(fila, id, agora = new Date().toISOString(), sorteio = Math.random, cartaId) {
  if (!fila.itens.length) throw new Error('Nenhum item disponível para revisão agora.');
  const carta = cartaId ? fila.cartas.find(c => c.id === cartaId) : fila.cartas[0];
  if (!carta) throw new Error('Carta não encontrada. Atualize a revisão.');
  const excluir = new Set(fila.itens.map(chaveItemRevisao));
  const completar = carta.modo === 'erroMedico' ? [] : escolherParecidas(carta.modo, carta.itens, TAMANHO_SESSAO - carta.itens.length, excluir);
  const itens = [...carta.itens, ...completar].map(item => ({ id: item.itemId, modo: item.modo, versao: item.versao, tema: originalRevisao(item).tema,
    sequenciaAnterior: item.sequencia, ...(item.parecida ? { parecida: true } : { escolhaPartida: item.escolhaPartida }), ...apresentarItemRevisao(item, sorteio) }));
  return { id, carta: carta.id, modo: carta.modo, itens, resultados: [], encerrada: false, historicoConfirmado: true, iniciadoEm: agora };
}

// Conteúdo do item como a tela mostra, sem o gabarito. Com `sorteio`, as alternativas do Quiz são embaralhadas.
export function apresentarItemRevisao(item, sorteio) {
  const original = originalRevisao(item);
  if (!original) return null;
  if (APRESENTADORES_REVISAO[item.modo]) return APRESENTADORES_REVISAO[item.modo](original);
  if (item.modo === 'verdadeMentira') return { texto: original.texto };
  const opcoes = original.opcoes.map(o => ({ ...o }));
  if (sorteio) for (let i = opcoes.length - 1; i > 0; i--) { const j = Math.floor(sorteio() * (i + 1)); [opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]]; }
  return { variante: original.variante, enunciado: original.enunciado, opcoes };
}
// Corrige uma escolha já feita (gabarito, explicação e fonte), para o relatório da semana.
export function avaliarItemRevisao(item, escolha) {
  const apresentado = { id: item.itemId || item.id, modo: item.modo, versao: Number(item.versao), tema: originalRevisao(item)?.tema, ...apresentarItemRevisao(item) };
  const resposta = { itemId: apresentado.id, versao: apresentado.versao, escolha };
  return AVALIADORES_REVISAO[item.modo] ? AVALIADORES_REVISAO[item.modo](apresentado, resposta) : avaliarRespostaTreino({ modo: item.modo, itens: [apresentado] }, resposta, 0);
}

// Escolha comparável: o Erro médico responde com uma lista.
const mesmaEscolha = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// `historico` ficou sem uso com a repetição em semanas (não há mais teto de duas revisões em 7 dias); a assinatura fica.
export function responderRevisaoPerfil(perfil, id, resposta, historico, agora = new Date().toISOString()) {
  const stats = perfil.revisao || {};
  const entrada = stats.entrada;
  if (!entrada || entrada.id !== id) throw new Error('Sessão não encontrada. Consulte a revisão salva.');
  const anterior = entrada.resultados.find(r => r.itemId === resposta.itemId && r.versao === resposta.versao);
  if (anterior) {
    if (mesmaEscolha(anterior.escolha, resposta.escolha)) return perfil;
    throw new Error('Esta resposta já foi confirmada. Consulte a revisão salva.');
  }
  const item = entrada.itens[entrada.resultados.length];
  if (entrada.encerrada || !item || item.id !== resposta.itemId || item.versao !== resposta.versao) throw new Error('A sessão mudou. Consulte a revisão salva.');
  const avaliacao = AVALIADORES_REVISAO[item.modo] ? AVALIADORES_REVISAO[item.modo](item, resposta) : avaliarRespostaTreino({ modo: item.modo, itens: [item] }, resposta, 0);
  const sequencia = avaliacao.acertou ? item.sequenciaAnterior + 1 : 0;
  // +40 XP uma vez por item e versão, no terceiro acerto seguido (docs/revisao-inteligente.md#xp-da-revisão).
  const chave = chaveItemRevisao(item);
  const dominados = stats.dominados || [];
  const dominou = avaliacao.acertou && sequencia === SEQUENCIA_DOMINIO && !dominados.includes(chave);
  const proximaRevisao = sequencia >= SEQUENCIA_DOMINIO ? null : proximaSemanaRevisao(agora, sequencia);
  const resultado = { ...avaliacao, modo: item.modo, data: agora, sequencia, proximaRevisao,
    ...(tempoRespostaValido(resposta.tempoMs) ? { tempoMs: resposta.tempoMs } : {}),
    ...(item.parecida ? { parecida: true } : { escolhaPartida: item.escolhaPartida }), ...(dominou ? { dominou: true, xp: XP_DOMINIO } : {}) };
  const resultados = [...entrada.resultados, resultado];
  const terminou = resultados.length === entrada.itens.length;
  const nova = { ...entrada, resultados, historicoConfirmado: false, encerrada: terminou,
    ...(terminou ? { encerradoEm: agora, relatorio: relatorioRevisao(entrada.itens, resultados) } : {}) };
  return { ...perfil, revisao: { ...stats, entrada: nova, itens: (stats.itens || 0) + 1, acertos: (stats.acertos || 0) + Number(resultado.acertou),
    sessoes: (stats.sessoes || 0) + Number(terminou), ...(dominou ? { dominados: [...dominados, chave] } : {}) } };
}

function relatorioRevisao(itens, resultados) {
  return { acertos: resultados.filter(r => r.acertou).length, respondidos: resultados.length, total: itens.length,
    temas: [...new Set(resultados.map(r => r.tema))], xp: resultados.reduce((t, r) => t + (r.xp || 0), 0),
    proximaRevisao: resultados.some(r => r.proximaRevisao) ? new Date(Math.min(...resultados.filter(r => r.proximaRevisao).map(r => tempoRevisao(r.proximaRevisao)))).toISOString() : null };
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
