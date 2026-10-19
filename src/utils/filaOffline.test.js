import test from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_QUIZ, BANCO_FRASES } from './bancoTreinos.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { dataDoEvento } from '../shared/operarFilaSupabase.js';
import { missaoDeLogin } from './missoes.js';

const agora = new Date('2026-10-19T15:00:00Z');
const hoje = '2026-10-19';
const perfilBase = () => ({ uid: 'u', pontuacaoTotal: 0, tickets: 0, dataUltimoLogin: hoje, ofensiva: { dias: 1, ultimoDia: hoje }, missoesDiarias: [missaoDeLogin(1)] });
const rodadaQuiz = (certas = 5, extra = {}) => {
  const qs = BANCO_QUIZ.filter(q => q.variante === 'teoria').slice(0, 5);
  return { id: crypto.randomUUID(), tipo: 'rodadaTreino', dados: { modo: 'quiz', variante: 'teoria', itens: qs.map(q => ({ id: q.id, versao: q.versao })),
    respostas: qs.map((q, i) => ({ itemId: q.id, escolha: i < certas ? q.correta : q.opcoes.find(o => o.id !== q.correta).id })),
    iniciadoEm: '2026-10-19T14:59:30Z', encerradoEm: '2026-10-19T14:59:50Z', ...extra } };
};
const sincronizar = (perfil, item, recibos = []) => executarPedidoSupabase(perfil, { acao: 'sincronizarFila', item }, { agora, recibos });

test('offline: rodada de Quiz jogada sem rede é refeita pelo servidor, paga XP e gera respostas e recibo', () => {
  const item = rodadaQuiz(5);
  const { perfil, eventos } = sincronizar(perfilBase(), item);
  assert.equal(perfil.pontuacaoTotal, 150);
  assert.equal(perfil.treinos.quiz.partidas, 1);
  assert.equal(eventos.filter(e => e.kind === 'resposta').length, 5);
  assert.ok(eventos.some(e => e.id === `recibo:${item.id}`));
  assert.equal(perfil.offline.ultimoEvento, '2026-10-19T14:59:50.000Z');
  // O mesmo item de novo (recibo já gravado) não paga outra vez.
  assert.strictEqual(sincronizar(perfil, item, [item.id]).perfil, perfil);
});

test('offline: Verdade ou mentira também entra pela fila', () => {
  const fs = [...BANCO_FRASES.filter(f => f.verdadeira).slice(0, 2), ...BANCO_FRASES.filter(f => !f.verdadeira).slice(0, 3)];
  const item = { id: crypto.randomUUID(), tipo: 'rodadaTreino', dados: { modo: 'verdadeMentira', itens: fs.map(f => ({ id: f.id, versao: f.versao })),
    respostas: fs.map(f => ({ itemId: f.id, escolha: f.verdadeira })), iniciadoEm: '2026-10-19T14:59:20Z', encerradoEm: '2026-10-19T14:59:40Z' } };
  assert.equal(sincronizar(perfilBase(), item).perfil.pontuacaoTotal, 150);
});

test('offline: conteúdo que mudou de versão, rodada incompleta ou tipo desconhecido são recusados com o motivo', () => {
  const velha = rodadaQuiz(5);
  velha.dados.itens[0].versao = 999;
  assert.throws(() => sincronizar(perfilBase(), velha), /Conteúdo desatualizado/);
  const curta = rodadaQuiz(5);
  curta.dados.respostas.pop();
  assert.throws(() => sincronizar(perfilBase(), curta), /incompleta/);
  assert.throws(() => sincronizar(perfilBase(), { ...rodadaQuiz(), tipo: 'outro' }), /ainda não aceito/);
  assert.throws(() => sincronizar(perfilBase(), { ...rodadaQuiz(), id: 'x' }), /inválido/);
});

test('offline: a data do aparelho vale só dentro da janela; início inválido não ganha bônus de tempo', () => {
  const p = { offline: { ultimoEvento: '2026-10-19T10:00:00Z' } };
  assert.equal(dataDoEvento(p, '2026-10-19T12:00:00Z', agora.toISOString()), '2026-10-19T12:00:00.000Z');
  assert.equal(dataDoEvento(p, '2026-10-19T09:00:00Z', agora.toISOString()), agora.toISOString(), 'antes do último evento aceito');
  assert.equal(dataDoEvento(p, '2026-10-20T09:00:00Z', agora.toISOString()), agora.toISOString(), 'no futuro');
  assert.equal(dataDoEvento({}, '2026-09-01T09:00:00Z', agora.toISOString()), agora.toISOString(), 'mais de 15 dias');
  const semInicio = rodadaQuiz(5, { iniciadoEm: '2026-10-19T15:30:00Z' });
  assert.equal(sincronizar(perfilBase(), semInicio).perfil.pontuacaoTotal, 125, '100 + 25 dos acertos, sem os 25 do tempo');
});

test('offline: uma rodada aberta online continua aberta depois da sincronização', () => {
  let perfil = executarPedidoSupabase(perfilBase(), { acao: 'iniciarTreino', modo: 'quiz', variante: 'teoria', entradaId: crypto.randomUUID() }, { agora }).perfil;
  const aberta = perfil.treinos.quiz.entrada;
  perfil = sincronizar(perfil, rodadaQuiz(3)).perfil;
  assert.equal(perfil.treinos.quiz.entrada.id, aberta.id);
  assert.equal(perfil.treinos.quiz.entrada.encerrada, false);
  assert.equal(perfil.treinos.quiz.partidas, 1);
});
