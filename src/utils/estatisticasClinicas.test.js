import test from 'node:test';
import assert from 'node:assert/strict';
import { limparEstatisticasClinicasAntigas, possuiEstatisticasClinicasAntigas } from './estatisticasClinicas.js';

test('remove somente contadores clínicos antigos e preserva cruzadinhas', () => {
  const antes = { partidas_ganhas: 8, ddx_vitorias: 3, especialidades: { cardio: 2 }, 'ANATOMIA-GERAL': { letras: 12, tempo: 40 } };
  assert.equal(possuiEstatisticasClinicasAntigas(antes), true);
  assert.deepEqual(limparEstatisticasClinicasAntigas(antes), { 'ANATOMIA-GERAL': { letras: 12, tempo: 40 } });
  assert.equal(antes.partidas_ganhas, 8);
});

