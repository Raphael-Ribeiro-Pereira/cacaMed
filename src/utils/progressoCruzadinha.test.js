import test from 'node:test';
import assert from 'node:assert/strict';
import { resumirCruzadinhas, somarNiveisTopicos } from './progressoCruzadinha.js';

test('conta partidas acumuladas além do histórico limitado e ignora modos clínicos', () => {
  assert.deepEqual(resumirCruzadinhas({
    'ANATOMIA-OSSOS': { partidas: 31, letras: 310, tempo: 620 },
    'ANATOMIA-MUSCULOS': { partidas: 2, letras: 20, tempo: 80 },
    ddx: { partidas: 9, letras: 999, tempo: 999 }
  }), { partidas: 33, letras: 330, tempo: 700, tempoMedio: 21 });
});

test('nível global soma os níveis dos tópicos com XP', () => {
  assert.equal(somarNiveisTopicos({ a: 0, b: 1, c: 1000, d: 4000 }), 1 + 2 + 3);
});
