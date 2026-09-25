import test from 'node:test';
import assert from 'node:assert/strict';
import { atualizarEstatisticasClinicas, limparEstatisticasClinicasAntigas, possuiEstatisticasClinicasAntigas } from './estatisticasClinicas.js';

test('remove somente contadores clínicos antigos e preserva cruzadinhas', () => {
  const antes = { partidas_ganhas: 8, ddx_vitorias: 3, especialidades: { cardio: 2 }, 'ANATOMIA-GERAL': { letras: 12, tempo: 40 } };
  assert.equal(possuiEstatisticasClinicasAntigas(antes), true);
  assert.deepEqual(limparEstatisticasClinicasAntigas(antes), { 'ANATOMIA-GERAL': { letras: 12, tempo: 40 } });
  assert.equal(antes.partidas_ganhas, 8);
});

test('DDX e Hardcore acumulam resultados independentes', () => {
  const base = { partidas_perdidas: 9, 'ANATOMIA-GERAL': { letras: 12, tempo: 40 } };
  const ddx = atualizarEstatisticasClinicas(base, {
    modo: 'ddx', resultado: 'vitoria', tempoSegundos: 100,
    especialidade: 'cardio', equipe: ['house'], teveProcesso: false
  });
  const final = atualizarEstatisticasClinicas(ddx, {
    modo: 'hardcore', resultado: 'derrota', motivoDerrota: 'tempo',
    tempoSegundos: 20, especialidade: 'neuro', equipe: [], teveProcesso: true
  });
  assert.equal(final.ddx.partidas_ganhas, 1);
  assert.equal(final.ddx.partidas_perdidas, 0);
  assert.equal(final.ddx.medicos_recrutados.house, 1);
  assert.equal(final.hardcore.partidas_ganhas, 0);
  assert.equal(final.hardcore.partidas_perdidas, 1);
  assert.equal(final.hardcore.mortes_por_tempo, 1);
  assert.equal(final.hardcore.processos_judiciais, 1);
  assert.equal(final.hardcore.tempo_total_jogado, 20);
  assert.equal(final.partidas_perdidas, undefined);
  assert.deepEqual(final['ANATOMIA-GERAL'], base['ANATOMIA-GERAL']);
});
