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
test('v3: 300 XP menos o desconto do destino (alta indevida 80, encaminhamento desnecessário 20) e +100 no caminho seguro', () => {
  const completo = ['gravidade', 'inicio', 'antecedentes', 'medicamentos', 'alergias', 'associados', 'ausculta', 'pfe', 'asma', 'tratamento', 'antiinflamatorio', 'oxigenio', 'reavaliar', 'orientar'];
  assert.equal(executarPlantao(caso, [...completo, 'alta']).xp, 400);
  assert.equal(executarPlantao(caso, [...completo, 'encaminhar']).xp, 280);
  const precisaEncaminhar = { ...caso, destinoAdequado: 'encaminhar' };
  assert.equal(executarPlantao(precisaEncaminhar, [...completo, 'encaminhar']).xp, 400);
  const alta = executarPlantao(precisaEncaminhar, [...completo, 'alta']);
  assert.equal(alta.xp, 220);
  assert.equal(alta.seguro, false);
});

test('quatro destinos: o certo não desconta, outro desconta 20 e alta indevida desconta 80', () => {
  const caso = obterCasoPlantao('pdx-escorpionismo');
  assert.equal(caso.destinoAdequado, 'observacao');
  assert.deepEqual(caso.acoes.filter(a => a.terminal).map(a => a.id).sort(), ['alta', 'encaminhar', 'observacao', 'uti']);
  const certas = caso.acoes.filter(a => !a.terminal && a.pontos > 0).map(a => a.id);
  const ordem = [];
  while (ordem.length < certas.length) for (const id of certas) { const a = caso.acoes.find(x => x.id === id); if (!ordem.includes(id) && (a.exige || []).every(x => ordem.includes(x))) ordem.push(id); }
  assert.equal(executarPlantao(caso, [...ordem, 'observacao']).xp, 400);
  assert.equal(executarPlantao(caso, [...ordem, 'uti']).xp, 280);
  assert.equal(executarPlantao(caso, [...ordem, 'alta']).xp, 220);
  assert.equal(executarPlantao(caso, [...ordem, 'observacao']).seguro, true);
});

test('bônus de desempenho: só em caso seguro, até +100 (50 do caminho seguro e 50 do tempo), sem relógio na saída; a demora piora o monitor', () => {
  const caso = obterCasoPlantao('pdx-iamcsst');
  const marco = caso.desempenho.acao;
  const feitas = caso.acoes.filter(a => !a.terminal && a.pontos > 0 && a.id !== marco).map(a => a.id);
  // Rápido: hipótese e marco antes de qualquer investigação; lento: o marco por último.
  const ordenar = (primeiro) => {
    const ordem = primeiro ? [caso.hipoteseCorreta, marco] : [];
    const todas = [...feitas, ...(primeiro ? [] : [marco])].filter(id => !ordem.includes(id));
    while (ordem.length < feitas.length + 1) for (const id of todas) { const a = caso.acoes.find(x => x.id === id); if (!ordem.includes(id) && (a.exige || []).every(x => ordem.includes(x))) ordem.push(id); }
    return ordem;
  };
  const rapido = executarPlantao(caso, [...ordenar(true), caso.destinoAdequado]);
  const lento = executarPlantao(caso, [...ordenar(false), caso.destinoAdequado]);
  assert.ok(rapido.seguro && lento.seguro);
  assert.equal(rapido.bonus, 100);
  assert.ok(lento.bonus >= 50 && lento.bonus < 100);
  assert.equal(rapido.xp, 400);
  const investigacao = caso.acoes.filter(a => ['Anamnese', 'Exames', 'Exame físico'].includes(a.grupo)).map(a => a.id);
  const parcial = executarPlantao(caso, investigacao);
  assert.ok(parcial.minutos >= 15);
  assert.equal(parcial.piorando, true);
  assert.equal(parcial.vitais.spo2, 93);
  const tratado = executarPlantao(caso, ordenar(true).slice(0, 4));
  assert.equal(tratado.piorando, false);
  assert.equal(executarPlantao(caso, [...ordenar(true), 'encaminhar' === caso.destinoAdequado ? 'uti' : 'encaminhar']).bonus, 0);
});

test('todo o banco do Plantão: ids únicos, quatro destinos, hipótese certa existente e caminho completo seguro', async () => {
  const { CASOS_PLANTAO, DESTINOS } = await import('./plantao.js');
  assert.equal(new Set(CASOS_PLANTAO.map(c => c.id)).size, CASOS_PLANTAO.length);
  for (const c of CASOS_PLANTAO) {
    assert.ok(DESTINOS.every(d => c.acoes.some(a => a.id === d && a.terminal)), c.id);
    assert.ok(c.acoes.some(a => a.id === c.hipoteseCorreta && a.grupo === 'Hipóteses'), c.id);
    assert.ok(DESTINOS.includes(c.destinoAdequado), c.id);
  }
});
