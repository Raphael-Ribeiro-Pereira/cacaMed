import test from 'node:test';
import assert from 'node:assert/strict';
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
test('destino errado desconta: alta indevida 80, encaminhamento desnecessário 20, destino certo nada', () => {
  const completo = ['gravidade', 'inicio', 'antecedentes', 'medicamentos', 'alergias', 'associados', 'ausculta', 'pfe', 'asma', 'tratamento', 'antiinflamatorio', 'oxigenio', 'reavaliar', 'orientar'];
  assert.equal(executarPlantao(caso, [...completo, 'alta']).xp, 250);
  assert.equal(executarPlantao(caso, [...completo, 'encaminhar']).xp, 230);
  const precisaEncaminhar = { ...caso, destinoAdequado: 'encaminhar' };
  assert.equal(executarPlantao(precisaEncaminhar, [...completo, 'encaminhar']).xp, 250);
  const alta = executarPlantao(precisaEncaminhar, [...completo, 'alta']);
  assert.equal(alta.xp, 170);
  assert.equal(alta.seguro, false);
});
