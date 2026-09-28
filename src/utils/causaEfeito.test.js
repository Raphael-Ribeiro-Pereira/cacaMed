import test from 'node:test';
import assert from 'node:assert/strict';
import { obterRelacao, avaliarRelacao } from './causaEfeito.js';
import { CASOS_PLANTAO } from './plantao.js';

test('Causa e efeito exige revisão própria e respostas completas válidas', () => {
  const caso = CASOS_PLANTAO[0]; const anterior = caso.revisado;
  try { caso.revisado = true; assert.equal(obterRelacao('resp-asma-relacoes-1').caso.revisado, false); }
  finally { caso.revisado = anterior; }
  assert.throws(() => obterRelacao('inexistente'), /não encontrado/);
  const relacao = obterRelacao('resp-asma-relacoes-1');
  assert.throws(() => avaliarRelacao(relacao, ['contracao']), /todas as etapas/);
  assert.throws(() => avaliarRelacao(relacao, ['invalida', 'resistencia', 'tentativa', 'relaxar']), /inválida/);
});

test('Causa e efeito avalia sequência e diferencia compensação de garantia de ventilação', () => {
  const relacao = obterRelacao('resp-asma-relacoes-1');
  assert.equal(avaliarRelacao(relacao, ['contracao', 'resistencia', 'tentativa', 'relaxar']).acertos, 4);
  const parcial = avaliarRelacao(relacao, ['contracao', 'menor', 'garantia', 'relaxar']);
  assert.equal(parcial.acertos, 2);
  assert.match(parcial.etapas[2].explicacao, /não garantem/);
});
