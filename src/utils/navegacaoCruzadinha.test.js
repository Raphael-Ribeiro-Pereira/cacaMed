import test from 'node:test';
import assert from 'node:assert/strict';
import { proximaCelulaDaEntrada } from './navegacaoCruzadinha.js';

test('digitação passa por interseção preenchida e para na próxima casa vazia', () => {
  const grade = [[
    { idHorizontal: 'entrada', letraCerta: 'C' },
    { idHorizontal: 'entrada', idVertical: 'cruzamento', letraCerta: 'O' },
    { idHorizontal: 'entrada', letraCerta: 'R' },
  ]];
  assert.deepEqual(proximaCelulaDaEntrada(grade, { '0-0': 'C', '0-1': 'O' }, 0, 0, 'horizontal'), { linha: 0, coluna: 2 });
  assert.deepEqual(proximaCelulaDaEntrada(grade, { '0-0': 'C', '0-1': 'O', '0-2': 'R' }, 0, 0, 'horizontal'), null);
  assert.deepEqual(proximaCelulaDaEntrada(grade, {}, 0, 2, 'horizontal', -1, false), { linha: 0, coluna: 1 });
});
