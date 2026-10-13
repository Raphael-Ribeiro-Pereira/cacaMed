import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDITORIAS, CATEGORIAS_FALHA, obterAuditoria, avaliarAuditoria } from './erroMedico.js';

test('auditoria é independente, tem três etapas e fica bloqueada até a revisão própria', () => {
  const analise = obterAuditoria('aud-asma-alta-1');
  assert.equal(analise.caso.revisado, false);
  assert.deepEqual(analise.perguntas.map(p => p.id), ['linha', 'categoria', 'correcao']);
  assert.equal(analise.perguntas[0].alternativas.length, analise.registros.length);
  assert.equal(analise.perguntas[1].alternativas.length, CATEGORIAS_FALHA.length);
  assert.throws(() => obterAuditoria('inexistente'), /não encontrada/);
});

test('análise exige todas as etapas e rejeita alternativas de fora', () => {
  const analise = obterAuditoria('aud-asma-alta-1');
  assert.throws(() => avaliarAuditoria(analise, ['l6']), /todas as etapas/);
  assert.throws(() => avaliarAuditoria(analise, ['l9', 'omissao', 'k1']), /inválida/);
});

test('relatório marca a linha, a categoria e a correção', () => {
  const analise = obterAuditoria('aud-asma-alta-1');
  assert.equal(avaliarAuditoria(analise, ['l6', 'omissao', 'k1']).acertos, 3);
  const parcial = avaliarAuditoria(analise, ['l4', 'atraso', 'k1']);
  assert.deepEqual(parcial.etapas.map(e => e.acertou), [false, false, true]);
});

test('todo o banco: falha em linha existente, categoria válida, correção existente e ids únicos', () => {
  assert.equal(new Set(AUDITORIAS.map(a => a.id)).size, AUDITORIAS.length);
  for (const a of AUDITORIAS) {
    assert.ok(a.falha.linha >= 1 && a.falha.linha <= a.registros.length, a.id);
    assert.ok(CATEGORIAS_FALHA.some(c => c.id === a.falha.categoria), a.id);
    assert.ok(a.correcoes.some(c => c.id === a.falha.correcao), a.id);
    assert.ok(a.correcoes.length >= 3 && a.correcoes.length <= 4, a.id);
    assert.match(a.fonte, /^https:\/\//);
  }
});
