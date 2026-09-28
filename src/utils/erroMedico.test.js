import test from 'node:test';
import assert from 'node:assert/strict';
import { obterAuditoria, avaliarAuditoria } from './erroMedico.js';
import { CASOS_PLANTAO } from './plantao.js';

test('auditoria compartilha paciente e bloqueio de revisão com o Plantão', () => {
  const analise = obterAuditoria('resp-asma-auditoria-1');
  assert.equal(analise.caso.id, 'resp-asma-1');
  assert.equal(analise.caso.revisado, false);
  assert.throws(() => obterAuditoria('inexistente'), /não encontrada/);
});

test('análise exige todas as respostas e rejeita alternativas fora do caso', () => {
  const analise = obterAuditoria('resp-asma-auditoria-1');
  assert.throws(() => avaliarAuditoria(analise, ['alta']), /todas as etapas/);
  assert.throws(() => avaliarAuditoria(analise, ['inventada', 'resposta', 'reavaliar', 'criterios']), /inválida/);
});

test('aprovar o Plantão sozinho não libera a variante de auditoria não revisada', () => {
  const caso = CASOS_PLANTAO.find(item => item.id === 'resp-asma-1');
  const revisadoAnterior = caso.revisado;
  try {
    caso.revisado = true;
    assert.equal(obterAuditoria('resp-asma-auditoria-1').caso.revisado, false);
  } finally { caso.revisado = revisadoAnterior; }
});

test('relatório diferencia evidência documentada de desfecho presumido', () => {
  const analise = obterAuditoria('resp-asma-auditoria-1');
  const completo = avaliarAuditoria(analise, ['alta', 'resposta', 'reavaliar', 'criterios']);
  assert.equal(completo.acertos, 4);
  const presumido = avaliarAuditoria(analise, ['alta', 'desfecho', 'reavaliar', 'certeza']);
  assert.equal(presumido.acertos, 2);
  assert.equal(presumido.etapas[1].acertou, false);
  assert.match(presumido.etapas[1].explicacao, /presumir/);
});
