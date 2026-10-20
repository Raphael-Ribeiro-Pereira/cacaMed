import test from 'node:test';
import assert from 'node:assert/strict';
import { DOENCAS, executarBatalha, obterDoenca } from './batalha.js';
import { BANCO_BATALHA_REVISAO, respostasBatalha } from './batalhaRevisao.js';
import { selecionarFilaRevisao } from './revisaoInteligente.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';

const ID = '33333333-3333-4333-8333-333333333333';
const admin = extra => ({ uid: 'a', role: 'admin', pontuacaoTotal: 0, tickets: 2, xpTopicos: {}, economia: { versao: 2, ultimoNivelPremiado: 1 }, batalha: { tutorial: true }, ...extra });

// Hipótese errada, terapia ineficaz e nenhuma resposta à complicação até perder.
function jogarMal(perfil, doencaId) {
  const d = obterDoenca(doencaId);
  const errada = d.cura === 'bacti' ? 'proto' : 'bacti';
  const acoes = [{ t: 'hipotese', id: d.dif[0] }, { t: 'golpe', id: errada }, { t: 'hipotese', id: d.id }];
  let estado = executarBatalha(d, 'pulsa', acoes);
  while (!estado.fim) {
    const exame = d.kit.find(id => !estado.exams.includes(id));
    acoes.push(estado.cd[errada] === 0 ? { t: 'golpe', id: errada } : exame ? { t: 'exame', id: exame } : { t: 'golpe', id: 'suporte' });
    estado = executarBatalha(d, 'pulsa', acoes);
  }
  const p = executarPedidoSupabase(perfil, { acao: 'iniciarBatalha', modo: 'historia', doencaId, pet: 'pulsa', entradaId: ID }).perfil;
  return executarPedidoSupabase(p, { acao: 'acaoBatalha', entradaId: ID, acoes });
}

test('banco: três itens por doença, alternativas únicas e tema sem entregar o diagnóstico', () => {
  assert.equal(BANCO_BATALHA_REVISAO.length, DOENCAS.length * 3);
  for (const q of BANCO_BATALHA_REVISAO) {
    const d = obterDoenca(q.doencaId);
    assert.ok(q.opcoes.length >= 3 && q.opcoes.length <= 4, q.id);
    assert.equal(new Set(q.opcoes.map(o => o.id)).size, q.opcoes.length, q.id);
    assert.equal(new Set(q.opcoes.map(o => o.texto)).size, q.opcoes.length, q.id);
    assert.ok(q.opcoes.some(o => o.id === q.correta), q.id);
    assert.ok(q.explicacao && q.fonte.includes(', p. '), q.id);
    assert.ok(!q.tema.toLowerCase().includes(d.nome.toLowerCase()), q.id);
    if (q.tipo === 'diagnostico') assert.ok(!q.enunciado.toLowerCase().includes(d.nome.toLowerCase()), q.id);
  }
});

test('desde 19/10/2026 os erros da Batalha não entram na Revisão; os itens antigos ficam fora da fila', () => {
  const { perfil, eventos } = jogarMal(admin(), 'malaria');
  assert.equal(eventos.filter(e => e.kind === 'resposta').length, 0, 'a Batalha não gera tentativas');
  // O histórico antigo (gerado até 19/10) continua guardado, mas não vira item da fila.
  const antigas = respostasBatalha(perfil.batalha.entrada);
  assert.equal(antigas.length, 3);
  const depois = new Date(Date.parse(perfil.batalha.entrada.encerradoEm) + 1000).toISOString();
  assert.equal(selecionarFilaRevisao(antigas, [], depois).itens.length, 0);
});

test('treinamento, abandono e conteúdo alterado não geram itens de revisão', () => {
  const base = { id: ID, doencaId: 'pneumo', versao: 1, pet: 'cocobi', acoes: [], encerradoEm: '2026-10-06T12:00:00.000Z' };
  assert.deepEqual(respostasBatalha({ ...base, modo: 'tutorial', relatorio: { resultado: 'vitoria' } }), []);
  assert.deepEqual(respostasBatalha({ ...base, modo: 'x1', relatorio: { resultado: 'abandono' } }), []);
  assert.deepEqual(respostasBatalha({ ...base, modo: 'x1', versao: 0, relatorio: { resultado: 'derrota' } }), []);
  assert.deepEqual(respostasBatalha({ ...base, modo: 'x1' }), [], 'batalha aberta');
});
