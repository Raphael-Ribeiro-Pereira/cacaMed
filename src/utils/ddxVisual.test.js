import test from 'node:test';
import assert from 'node:assert/strict';
import { cadeiaDe, lerVitais, nomeEtapa, registrosComHora, vitaisDoCaso, xpCaminhoCompleto } from './ddxVisual.js';
import { CASOS_PLANTAO, executarPlantao } from './plantao.js';
import { AUDITORIAS } from './erroMedico.js';
import { RELACOES } from './causaEfeito.js';

test('lê os sinais vitais do texto do caso e os da reavaliação', () => {
  const caso = CASOS_PLANTAO[0];
  assert.deepEqual(lerVitais(caso.vitais), { fc: 108, fr: 26, spo2: 94, pa: '120/80', t: 36.7 });
  assert.deepEqual(vitaisDoCaso(caso, true), { fc: 92, fr: 18, spo2: 97, pa: '120/80', t: 36.7 });
  assert.deepEqual(vitaisDoCaso(caso, false), lerVitais(caso.vitais));
});

test('separa a hora dos registros auditados', () => {
  const registros = registrosComHora(AUDITORIAS[0].registros);
  assert.equal(registros.length, AUDITORIAS[0].registros.length);
  assert.deepEqual(registros[0], ['08:10', 'Paciente chegou com falta de ar e chiado. Sinais vitais registrados.']);
  assert.deepEqual(registrosComHora(['Sem hora']), [['', 'Sem hora']]);
});

test('nomeia as etapas e monta a cadeia com um elo por pergunta', () => {
  assert.deepEqual(AUDITORIAS[0].perguntas.map(p => nomeEtapa(p.id)), ['Falha', 'Evidência', 'Correção', 'Justificativa']);
  const cadeia = cadeiaDe(RELACOES[0]);
  assert.equal(cadeia.length, RELACOES[0].perguntas.length + 1);
  assert.deepEqual(cadeiaDe({ id: 'outra', perguntas: [{ id: 'mecanismo' }, { id: 'novo' }] }), ['Estímulo', 'Mecanismo', 'Novo']);
});

test('o caminho completo do Plantão vale 250 XP no caso respiratório', () => {
  assert.equal(xpCaminhoCompleto(CASOS_PLANTAO[0], executarPlantao), 250);
});
