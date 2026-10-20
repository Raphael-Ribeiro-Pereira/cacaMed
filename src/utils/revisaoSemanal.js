import { chaveItemRevisao, montarCartas, palavrasRevisao, selecionarFilaRevisao, TAMANHO_SESSAO } from './revisaoInteligente.js';
import { semanaCoroas } from './coroas.js';
import { concederRecompensa } from './economia.js';
import { aplicarProgressoMissoes, dataLocalHoje, lerMissoes } from './missoes.js';

// Revisão semanal (decidida em 19/10/2026; docs/revisao-inteligente.md#revisão-semanal-decidida-em-19102026).
// A fila da semana vai até ~10 minutos estimados pelo ritmo da pessoa; o que não cabe fica na reserva por até 8 semanas.
export const LIMITE_FILA_S = 10 * 60;
export const MINIMO_AVISO_S = 5 * 60;
export const SEMANAS_RESERVA = 8;
// Ritmo de leitura e raciocínio: média de segundos por palavra nas respostas certas. Até juntar respostas, vale o padrão
// (o mesmo do protótipo), com peso de 12 respostas; as últimas 200 respostas certas medidas entram na conta.
export const RITMO_PADRAO = { sPorPalavra: 0.42, peso: 12 };
// Prêmio de conclusão, uma vez por semana: 35 XP por item revisado (até 1000) e 1 ticket a cada 7 itens (até 4).
export const premioDaSemana = itens => ({ xp: Math.min(1000, itens * 35), tickets: Math.min(4, Math.floor(itens / 7)) });
// Missão "revisão da semana": fora das 4 sorteadas, com o valor da maior missão diária.
export const MISSAO_REVISAO = { id: 'revisao_semana', titulo: 'Revisão da semana', subtitulo: 'Terminar todas as cartas da Revisão desta semana',
  nivel: 5, meta: 1, evento: 'revisao_semana', recompensaXP: 400, recompensaTicket: 2, especial: true };

const DIA = 86400000;
const tempo = valor => Number.isFinite(Date.parse(valor)) ? Date.parse(valor) : 0;
const MODOS_SESSAO_CHEIA = ['quiz', 'verdadeMentira'];

export function ritmoDoJogador(tentativas = [], revisoes = []) {
  const medidas = [...tentativas, ...revisoes]
    .filter(r => r.acertou === true && Number.isInteger(r.tempoMs) && r.tempoMs > 0 && r.tempoMs <= 600000)
    .sort((a, b) => tempo(a.data) - tempo(b.data)).slice(-200)
    .map(r => ({ segundos: r.tempoMs / 1000, palavras: palavrasRevisao(r) })).filter(m => m.palavras > 0);
  const soma = RITMO_PADRAO.sPorPalavra * RITMO_PADRAO.peso + medidas.reduce((s, m) => s + m.segundos / m.palavras, 0);
  return soma / (RITMO_PADRAO.peso + medidas.length);
}

export const segundosDoItem = (item, ritmo) => palavrasRevisao(item) * ritmo;
// Quiz e V ou M completam 7 com perguntas parecidas: o tempo delas entra na estimativa pela média dos erros da carta.
export function segundosDaCarta(carta, ritmo) {
  const erros = carta.itens.map(i => segundosDoItem(i, ritmo));
  const soma = erros.reduce((a, b) => a + b, 0);
  const parecidas = MODOS_SESSAO_CHEIA.includes(carta.modo) ? Math.max(0, TAMANHO_SESSAO - erros.length) : 0;
  return soma + parecidas * (soma / Math.max(1, erros.length));
}
const segundosDasCartas = (cartas, ritmo) => cartas.reduce((s, c) => s + segundosDaCarta(c, ritmo), 0);

// A fila da semana: primeiro os itens que voltam pela repetição (já revistos), depois os erros novos, do mais recente ao
// mais antigo, até ~10 minutos. O que não cabe vai para a reserva; item disponível há mais de 8 semanas sai de vez.
export function filaDaSemana(tentativas, revisoes, agora, ritmo = ritmoDoJogador(tentativas, revisoes)) {
  const base = selecionarFilaRevisao(tentativas, revisoes, agora);
  const limiteReserva = tempo(agora) - SEMANAS_RESERVA * 7 * DIA;
  const ordenados = base.itens.filter(i => tempo(i.proximaRevisao) >= limiteReserva)
    .sort((a, b) => Number(b.revisada) - Number(a.revisada)
      || (a.revisada ? tempo(a.proximaRevisao) - tempo(b.proximaRevisao) : b.ultimoErro - a.ultimoErro)
      || chaveItemRevisao(a).localeCompare(chaveItemRevisao(b)));
  const escolhidos = [];
  const reserva = [];
  for (const item of ordenados) {
    if (escolhidos.length && segundosDasCartas(montarCartas([...escolhidos, item]), ritmo) > LIMITE_FILA_S) reserva.push(item);
    else escolhidos.push(item);
  }
  const cartas = montarCartas(escolhidos).map(c => ({ ...c, segundos: Math.round(segundosDaCarta(c, ritmo)) }));
  const segundos = Math.round(segundosDasCartas(cartas, ritmo));
  // Lotada: chegou aos ~10 minutos, ou algo já ficou de fora (foi para a reserva).
  return { itens: escolhidos, cartas, reserva, ritmo, segundos, lotada: reserva.length > 0 || segundos >= LIMITE_FILA_S, resumoBase: base.resumo };
}

// ---------- A revisão da semana no perfil (`revisao.semana`) ----------
// Começa no aviso de "Começar revisão": as cartas ficam congeladas e o jogador só sai quando terminar todas, mesmo
// fechando o app (trava). Se a semana virar no meio, as cartas que faltam continuam, e o prêmio sai ao terminar.
export const revisaoTravada = perfil => Boolean(perfil?.revisao?.semana?.iniciadaEm && !perfil.revisao.semana.concluidaEm);
export const revisaoFeitaNaSemana = (perfil, agora) => {
  const concluida = perfil?.revisao?.semana?.concluidaEm;
  return Boolean(concluida && semanaCoroas(new Date(concluida)) === semanaCoroas(new Date(agora)));
};
const itemCongelado = i => ({ modo: i.modo, itemId: i.itemId, versao: i.versao, tema: i.tema, sequencia: i.sequencia,
  revisada: i.revisada, ...(i.escolhaPartida !== undefined ? { escolhaPartida: i.escolhaPartida } : {}) });

export function iniciarSemanaRevisao(perfil, fila, agora) {
  if (!fila.cartas.length) throw new Error('Nenhum item para revisar nesta semana.');
  // O ritmo de antes da semana fica guardado: é a base do tempo esperado e da indecisão no relatório.
  const semana = { id: semanaCoroas(new Date(agora)), iniciadaEm: agora, segundos: fila.segundos, ritmo: Math.round(fila.ritmo * 1000) / 1000,
    cartas: fila.cartas.map(c => ({ id: c.id, modo: c.modo, segundos: c.segundos, itens: c.itens.map(itemCongelado) })), feitas: {} };
  return { ...perfil, revisao: { ...perfil.revisao, semana } };
}
export const itensDaSemana = semana => semana.cartas.flatMap(c => c.itens);

// Guarda o resumo da carta que acabou de terminar (o relatório geral é montado com ele no fim da semana).
export function registrarCartaFeita(perfil) {
  const stats = perfil.revisao || {};
  const entrada = stats.entrada;
  const semana = stats.semana;
  if (!entrada?.encerrada || !semana || semana.concluidaEm || semana.feitas[entrada.carta] || !semana.cartas.some(c => c.id === entrada.carta)) return perfil;
  const feita = { revisaoId: entrada.id, encerradaEm: entrada.encerradoEm, abandonada: Boolean(entrada.abandonada),
    acertos: entrada.resultados.filter(r => r.acertou).length, total: entrada.itens.length,
    resultados: entrada.resultados.map(r => ({ itemId: r.itemId, modo: r.modo, versao: r.versao, escolha: r.escolha, acertou: r.acertou,
      ...(r.tempoMs ? { tempoMs: r.tempoMs } : {}), ...(r.parecida ? { parecida: true } : { escolhaPartida: r.escolhaPartida }), ...(r.dominou ? { dominou: true } : {}) })) };
  return { ...perfil, revisao: { ...stats, semana: { ...semana, feitas: { ...semana.feitas, [entrada.carta]: feita } } } };
}

// Todas as cartas feitas: fecha a semana, paga o prêmio e conclui a missão "revisão da semana", se ela estiver no dia.
export function concluirSemanaRevisao(perfil, agora) {
  const semana = perfil.revisao?.semana;
  if (!semana || semana.concluidaEm || semana.cartas.some(c => !semana.feitas[c.id])) return perfil;
  const itens = Object.values(semana.feitas).reduce((s, f) => s + f.resultados.length, 0);
  const premio = premioDaSemana(itens);
  const missoes = aplicarProgressoMissoes(lerMissoes(perfil), { revisao_semana: 1 });
  const pago = concederRecompensa(perfil, premio.xp + missoes.xp, premio.tickets + missoes.tickets);
  return { ...pago, missoesDiarias: missoes.missoes,
    revisao: { ...perfil.revisao, semana: { ...semana, concluidaEm: agora, itens, premio, missao: missoes.xp ? { xp: missoes.xp, tickets: missoes.tickets } : null } } };
}

// ---------- Lembrete: missão do dia e aviso (decididos em 19/10/2026) ----------
// 1. A fila lotou (~10 min): aviso e missão na hora, em qualquer dia. 2. Senão, a partir de quarta, com pelo menos
// 5 minutos de fila. O aviso aparece uma vez por semana; a missão fica todo dia, depois de aparecer, até a revisão sair.
const diaDaSemana = agora => new Date(`${dataLocalHoje(new Date(agora))}T12:00:00Z`).getUTCDay();
export const lembreteDaSemana = (perfil, agora) => perfil?.revisao?.aviso?.semana === semanaCoroas(new Date(agora)) ? perfil.revisao.aviso : null;
// O lembrete ainda pode disparar nesta semana (o servidor só lê o histórico quando precisa).
export const lembretePendente = (perfil, agora) => !lembreteDaSemana(perfil, agora) && !revisaoTravada(perfil) && !revisaoFeitaNaSemana(perfil, agora);

export function garantirMissaoRevisao(perfil, agora) {
  if (!lembreteDaSemana(perfil, agora) || revisaoFeitaNaSemana(perfil, agora)) return perfil;
  const missoes = lerMissoes(perfil);
  if (missoes.some(m => m.id === MISSAO_REVISAO.id)) return perfil;
  return { ...perfil, missoesDiarias: [...missoes, { ...MISSAO_REVISAO, progresso: 0, concluida: false }] };
}

export function avaliarLembreteRevisao(perfil, tentativas, revisoes, agora) {
  if (!lembretePendente(perfil, agora)) return garantirMissaoRevisao(perfil, agora);
  const { segundos, lotada } = filaDaSemana(tentativas, revisoes, agora);
  const motivo = lotada ? 'cheia' : [0, 3, 4, 5, 6].includes(diaDaSemana(agora)) && segundos >= MINIMO_AVISO_S ? 'quarta' : null;
  const conferido = { ...perfil, revisao: { ...perfil.revisao, lembreteConferidoEm: agora } };
  if (!motivo) return conferido;
  return garantirMissaoRevisao({ ...conferido, revisao: { ...conferido.revisao,
    aviso: { semana: semanaCoroas(new Date(agora)), motivo, minutos: Math.round(segundos / 60), criadoEm: agora, visto: false } } }, agora);
}
