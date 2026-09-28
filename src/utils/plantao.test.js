import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { obterCasoPlantao, executarPlantao } from './plantao.js';

const caso = obterCasoPlantao('resp-asma-1');
test('plantão exige avaliações antes do tratamento e registra alta prematura', () => {
  assert.throws(() => executarPlantao(caso, ['tratamento']), /avaliações necessárias/);
  const resultado = executarPlantao(caso, ['alta']);
  assert.equal(resultado.altaInsegura, true);
  assert.equal(resultado.seguro, false);
  assert.equal(resultado.xp, 0);
});
test('plantão não duplica ações, não aceita ação posterior ao encerramento e permite revisar hipótese', () => {
  assert.throws(() => executarPlantao(caso, ['gravidade', 'gravidade']), /repetida/);
  assert.throws(() => executarPlantao(caso, ['alta', 'gravidade']), /inválida/);
  assert.equal(executarPlantao(caso, ['asma', 'pneumonia']).hipotese, 'pneumonia');
  assert.equal(executarPlantao(caso, ['pneumonia', 'asma']).hipotese, 'asma');
});
test('exames desnecessários reduzem eficiência e o tempo não altera XP', () => {
  const base = executarPlantao(caso, ['gravidade', 'alta']);
  const extra = executarPlantao(caso, ['gravidade', 'radiografia', 'alta']);
  assert.equal(extra.pontos.eficiencia, base.pontos.eficiencia - 10);
  assert.ok(extra.minutos > base.minutos);
});
test('artefato Apps Script é idêntico ao motor do navegador', () => {
  const origem = readFileSync(new URL('./plantao.js', import.meta.url), 'utf8');
  const script = readFileSync(new URL('../../docs/plantao-motor.gs', import.meta.url), 'utf8');
  const auditoria = readFileSync(new URL('./erroMedico.js', import.meta.url), 'utf8');
  assert.equal(script, '// GERADO por node scripts/sincronizar-plantao.mjs. Não editar manualmente.\n' + origem.replace(/^export /gm, '') + '\n' + auditoria.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, ''));
});
