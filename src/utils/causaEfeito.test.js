import test from 'node:test';
import assert from 'node:assert/strict';
import { RELACOES, obterRelacao, avaliarRelacao } from './causaEfeito.js';

test('Causa e efeito é independente, exige revisão própria e respostas completas válidas', () => {
  const relacao = obterRelacao('ce-asma-1');
  assert.equal(relacao.caso.revisado, false);
  assert.equal(relacao.perguntas.length, 4);
  assert.throws(() => obterRelacao('inexistente'), /não encontrado/);
  assert.throws(() => avaliarRelacao(relacao, ['c1']), /todas as etapas/);
  assert.throws(() => avaliarRelacao(relacao, ['c9', 'c2', 'c3', 'c4']), /inválida/);
});

test('o circuito acerta quando cada carta vai ao seu elo e mostra o elo que quebra', () => {
  const relacao = obterRelacao('ce-asma-1');
  assert.equal(avaliarRelacao(relacao, ['c1', 'c2', 'c3', 'c4']).acertos, 4);
  const parcial = avaliarRelacao(relacao, ['c1', 'c6', 'c5', 'c4']);
  assert.deepEqual(parcial.etapas.map(e => e.acertou), [true, false, false, true]);
  assert.match(parcial.etapas[2].explicacao, /fadiga/);
});

test('todo o banco: quatro elos, seis cartas, cartas certas distintas e ids únicos', () => {
  assert.equal(new Set(RELACOES.map(r => r.id)).size, RELACOES.length);
  for (const r of RELACOES) {
    assert.deepEqual(r.elos.map(e => e.id), ['mecanismo', 'consequencia', 'compensacao', 'intervencao'], r.id);
    assert.equal(r.cartas.length, 6, r.id);
    const certas = r.elos.map(e => e.correta);
    assert.equal(new Set(certas).size, 4, r.id);
    assert.ok(certas.every(c => r.cartas.some(x => x.id === c)), r.id);
    assert.equal(new Set(r.cartas.map(c => c.texto)).size, 6, r.id);
  }
});
