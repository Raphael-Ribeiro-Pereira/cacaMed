import test from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_QUIZ } from './bancoTreinos.js';
import { BANCO_REVISAO_ERRO } from './erroMedicoRevisao.js';
import { obterAuditoria } from './erroMedico.js';
import { palavrasRevisao } from './revisaoInteligente.js';
import { filaDaSemana, ritmoDoJogador, premioDaSemana, revisaoTravada, revisaoFeitaNaSemana, avaliarLembreteRevisao, LIMITE_FILA_S, RITMO_PADRAO } from './revisaoSemanal.js';
import { operarRevisaoSupabase, relatorioSemanaRevisao } from '../shared/operarRevisaoSupabase.js';
import { executarPedidoSupabase, precisaHistoricoRevisao } from '../shared/executarPedidoSupabase.js';
import { criarMissoesDiarias, dataLocalHoje } from './missoes.js';
import { xpParaNivel } from './economia.js';

// Revisão semanal (docs/revisao-inteligente.md#revisão-semanal-decidida-em-19102026). 19/10/2026 é segunda-feira.
const SEGUNDA = '2026-10-19T15:00:00.000Z';
const QUARTA = '2026-10-21T15:00:00.000Z';
const erroQuiz = (q, data = '2026-10-18T12:00:00.000Z', rodadaId = `r-${q.id}`) => ({ modo: 'quiz', itemId: q.id, versao: q.versao, tema: q.tema,
  acertou: false, escolha: q.opcoes.find(o => o.id !== q.correta).id, rodadaId, data });
const erroCaso = (c, data = '2026-10-18T12:00:00.000Z') => ({ modo: 'erroMedico', itemId: c.id, versao: c.versao, tema: c.tema, acertou: false,
  escolha: obterAuditoria(c.id).perguntas.map(p => p.alternativas.find(a => a.id !== p.correta).id), rodadaId: `r-${c.id}`, data });
const jogador = extra => ({ uid: 'u', role: 'jogador', pontuacaoTotal: xpParaNivel(10), tickets: 0, economia: { versao: 3, ultimoNivelPremiado: 10 },
  dataUltimoLogin: dataLocalHoje(new Date(SEGUNDA)), ofensiva: { dias: 1, ultimoDia: dataLocalHoje(new Date(SEGUNDA)) }, missoesDiarias: criarMissoesDiarias(() => 0.5), ...extra });
const ID = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

test('ritmo: padrão de 0,42 s por palavra até juntar respostas certas medidas', () => {
  assert.equal(ritmoDoJogador([], []), RITMO_PADRAO.sPorPalavra);
  const q = BANCO_QUIZ[0];
  const rapidas = Array.from({ length: 12 }, (_, i) => ({ modo: 'quiz', itemId: q.id, versao: q.versao, acertou: true, tempoMs: palavrasRevisao({ modo: 'quiz', itemId: q.id, versao: q.versao }) * 200, data: `2026-10-1${i % 9}T12:00:00Z` }));
  assert.ok(Math.abs(ritmoDoJogador(rapidas, []) - 0.31) < 0.001, 'metade do peso no padrão, metade nas respostas (0,2 s)');
  assert.equal(ritmoDoJogador([{ ...rapidas[0], acertou: false }, { ...rapidas[0], tempoMs: 0 }], []), RITMO_PADRAO.sPorPalavra, 'só certas com tempo valem');
});

test('fila da semana vai até ~10 min; o que não cabe vai para a reserva e some depois de 8 semanas', () => {
  const casos = BANCO_REVISAO_ERRO.slice(0, 8).map((c, i) => erroCaso(c, new Date(Date.parse('2026-10-10T12:00:00Z') + i * 3600000).toISOString()));
  const fila = filaDaSemana(casos, [], SEGUNDA);
  assert.ok(fila.segundos <= LIMITE_FILA_S && fila.segundos > LIMITE_FILA_S * 0.7, `${fila.segundos} s`);
  assert.ok(fila.reserva.length >= 1);
  // Erros novos entram do mais recente ao mais antigo: o mais antigo fica na reserva.
  assert.equal(fila.reserva.at(-1).itemId, casos[0].itemId);
  assert.equal(fila.cartas.length, 1);
  // Item disponível há mais de 8 semanas sai de vez.
  const velho = erroQuiz(BANCO_QUIZ[0], '2026-08-01T12:00:00.000Z');
  assert.equal(filaDaSemana([velho], [], SEGUNDA).itens.length, 0);
  assert.equal(filaDaSemana([velho], [], '2026-09-20T12:00:00.000Z').itens.length, 1);
});

test('prioridade: os itens que voltam pela repetição entram antes dos erros novos', () => {
  const casos = BANCO_REVISAO_ERRO.slice(0, 8).map(c => erroCaso(c, '2026-10-17T12:00:00.000Z'));
  const antigo = erroCaso(BANCO_REVISAO_ERRO[9], '2026-09-01T12:00:00.000Z');
  const revisto = { modo: 'erroMedico', itemId: antigo.itemId, versao: antigo.versao, acertou: true, sequencia: 1, revisaoId: 'v', data: '2026-10-10T12:00:00.000Z', proximaRevisao: '2026-10-19T03:00:00.000Z' };
  const fila = filaDaSemana([...casos, antigo], [revisto], SEGUNDA);
  assert.equal(fila.itens[0].itemId, antigo.itemId);
  assert.equal(fila.itens[0].sequencia, 1);
});

test('semana: começar trava; cada carta abre uma vez; a última fecha a semana com o prêmio e a missão', () => {
  const erros = [...BANCO_QUIZ.slice(0, 3).map(q => erroQuiz(q)), erroCaso(BANCO_REVISAO_ERRO[0])];
  let perfil = jogador();
  perfil = { ...perfil, missoesDiarias: [...perfil.missoesDiarias, { id: 'revisao_semana', evento: 'revisao_semana', meta: 1, progresso: 0, concluida: false, recompensaXP: 400, recompensaTicket: 2 }] };
  const operar = (p, pedido, revisoes = []) => operarRevisaoSupabase(p, pedido, erros, revisoes, [], SEGUNDA);
  assert.throws(() => operar(perfil, { acao: 'iniciarRevisao', revisaoId: ID(1), carta: 'quiz-1' }), /Comece a revisão da semana/);
  perfil = operar(perfil, { acao: 'iniciarSemanaRevisao' });
  assert.ok(revisaoTravada(perfil));
  assert.deepEqual(perfil.revisao.semana.cartas.map(c => c.id), ['quiz-1', 'erroMedico-1']);
  assert.equal(perfil.revisao.resumo.estado, 'andamento');
  assert.equal(operar(perfil, { acao: 'iniciarSemanaRevisao' }), perfil, 'começar de novo não muda nada');
  const xpAntes = perfil.pontuacaoTotal;
  let respondidos = 0;
  for (const [n, carta] of [[2, 'quiz-1'], [3, 'erroMedico-1']].map(([k, c]) => [k, c])) {
    perfil = operar(perfil, { acao: 'iniciarRevisao', revisaoId: ID(n), carta });
    for (const item of perfil.revisao.entrada.itens) {
      const q = BANCO_QUIZ.find(x => x.id === item.id);
      const escolha = item.modo === 'quiz' ? q.correta : obterAuditoria(item.id).perguntas.map(p => p.correta);
      perfil = operar(perfil, { acao: 'responderRevisao', revisaoId: ID(n), itemId: item.id, versao: item.versao, escolha, tempoMs: 9000 });
      respondidos++;
    }
    assert.ok(perfil.revisao.semana.feitas[carta]);
    assert.throws(() => operar(perfil, { acao: 'iniciarRevisao', revisaoId: ID(n + 10), carta }), /já foi feita/);
  }
  assert.equal(revisaoTravada(perfil), false, 'a última carta destrava');
  assert.ok(revisaoFeitaNaSemana(perfil, SEGUNDA));
  const premio = premioDaSemana(respondidos);
  assert.deepEqual(perfil.revisao.semana.premio, premio);
  assert.equal(perfil.pontuacaoTotal - xpAntes, premio.xp + 400, 'prêmio da semana e a missão');
  assert.equal(perfil.tickets, premio.tickets + 2);
  assert.equal(perfil.missoesDiarias.at(-1).concluida, true);
  assert.equal(perfil.revisao.resumo.estado, 'concluida');
  assert.throws(() => operar(perfil, { acao: 'iniciarSemanaRevisao' }), /já foi feita/);
  // Na semana seguinte, nova revisão.
  assert.ok(revisaoTravada(operarRevisaoSupabase(perfil, { acao: 'iniciarSemanaRevisao' }, [...erros, erroQuiz(BANCO_QUIZ[5], '2026-10-25T12:00:00Z')], [], [], '2026-10-27T12:00:00.000Z')));

  // Relatório geral: as duas cartas, com gabarito, explicação e as medidas de ritmo.
  const r = relatorioSemanaRevisao(perfil);
  assert.equal(r.cartas.length, 2);
  assert.equal(r.faltam, 0);
  const item = r.cartas[0].itens[0];
  assert.ok(item.enunciado && item.opcoes && item.correta && item.explicacao);
  assert.equal(item.tempoMs, 9000);
  assert.equal(item.esperadoMs, Math.round(item.palavras * r.ritmo * 1000));
  assert.equal(item.indecisaoMs, Math.max(0, 9000 - item.esperadoMs));
  assert.ok(r.cartas[1].itens[0].etapas, 'Erro médico com as etapas');
});

test('semana que vira no meio: as cartas continuam, a trava fica e o prêmio sai ao terminar', () => {
  const erros = [erroQuiz(BANCO_QUIZ[0])];
  let perfil = operarRevisaoSupabase(jogador(), { acao: 'iniciarSemanaRevisao' }, erros, [], [], SEGUNDA);
  const depois = '2026-10-28T12:00:00.000Z';
  assert.ok(revisaoTravada(perfil));
  perfil = operarRevisaoSupabase(perfil, { acao: 'iniciarRevisao', revisaoId: ID(5), carta: 'quiz-1' }, erros, [], [], depois);
  const xp = perfil.pontuacaoTotal;
  perfil = operarRevisaoSupabase(perfil, { acao: 'encerrarRevisao', revisaoId: ID(5) }, erros, [], [], depois);
  assert.equal(revisaoTravada(perfil), false);
  assert.ok(revisaoFeitaNaSemana(perfil, depois), 'conta como a revisão da semana em que terminou');
  assert.equal(perfil.pontuacaoTotal, xp, 'carta encerrada sem respostas: zero item, zero prêmio');
});

test('lembrete: fila lotada avisa na hora; senão a partir de quarta com 5 min; uma vez por semana', () => {
  const lotada = BANCO_REVISAO_ERRO.slice(0, 8).map(c => erroCaso(c));
  const cheio = avaliarLembreteRevisao(jogador(), lotada, [], SEGUNDA);
  assert.equal(cheio.revisao.aviso.motivo, 'cheia');
  assert.equal(cheio.missoesDiarias.at(-1).id, 'revisao_semana');
  assert.equal(cheio.missoesDiarias.at(-1).recompensaXP, 400);
  const cinco = BANCO_REVISAO_ERRO.slice(0, 4).map(c => erroCaso(c));
  assert.equal(avaliarLembreteRevisao(jogador(), cinco, [], SEGUNDA).revisao.aviso, undefined, 'segunda com 6 min: ainda não');
  const quarta = avaliarLembreteRevisao(jogador(), cinco, [], QUARTA);
  assert.equal(quarta.revisao.aviso.motivo, 'quarta');
  assert.equal(avaliarLembreteRevisao(jogador(), cinco.slice(0, 2), [], QUARTA).revisao.aviso, undefined, 'menos de 5 min: sem aviso');
  assert.equal(avaliarLembreteRevisao(cheio, lotada, [], QUARTA).revisao.aviso.motivo, 'cheia', 'uma vez por semana');
  // A missão volta no dia seguinte (primeiro pedido do dia) até a revisão sair.
  const amanha = new Date('2026-10-20T15:00:00.000Z');
  const { perfil } = executarPedidoSupabase(cheio, { acao: 'obterPerfil' }, { agora: amanha });
  assert.ok(perfil.missoesDiarias.some(m => m.id === 'revisao_semana'));
  // O aviso visto fica marcado.
  assert.equal(executarPedidoSupabase(cheio, { acao: 'verAvisoRevisao' }, { agora: new Date(SEGUNDA) }).perfil.revisao.aviso.visto, true);
});

test('a API só lê o histórico quando a Revisão precisa ou quando o lembrete ainda pode disparar', () => {
  const agora = new Date(SEGUNDA);
  assert.equal(precisaHistoricoRevisao(jogador(), { acao: 'consultarRevisao' }, agora), true);
  assert.equal(precisaHistoricoRevisao(jogador(), { acao: 'responderTreino' }, agora), true);
  assert.equal(precisaHistoricoRevisao(jogador(), { acao: 'responderTreino' }, agora, false), false, 'abaixo do nível 10');
  assert.equal(precisaHistoricoRevisao(jogador({ revisao: { lembreteConferidoEm: SEGUNDA } }), { acao: 'responderTreino' }, agora), false, 'conferido há menos de 30 min');
  assert.equal(precisaHistoricoRevisao(jogador({ revisao: { lembreteConferidoEm: SEGUNDA } }), { acao: 'responderTreino' }, new Date('2026-10-19T15:31:00Z')), true);
  assert.equal(precisaHistoricoRevisao(jogador({ dataUltimoLogin: '2026-10-18' }), { acao: 'obterPerfil' }, agora), true, 'primeiro pedido do dia');
  assert.equal(precisaHistoricoRevisao(jogador(), { acao: 'obterPerfil' }, agora), false);
  assert.equal(precisaHistoricoRevisao(jogador({ revisao: { aviso: { semana: '2026-S43' } } }), { acao: 'responderTreino' }, agora), false, 'lembrete já disparado na semana');
});
