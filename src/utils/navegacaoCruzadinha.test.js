import test from 'node:test';
import assert from 'node:assert/strict';
import { celulasPreenchidasAteProximaVazia, escolherDirecaoDaEntrada, proximaCelulaDaEntrada, resolverLetraRepetida } from './navegacaoCruzadinha.js';

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

test('interseção prioriza a palavra com mais casas vazias e mantém direção em empate', () => {
  const grade = [[
    { linha: 0, coluna: 0, idHorizontal: 1, letraCerta: 'A' },
    { linha: 0, coluna: 1, idHorizontal: 1, idVertical: 2, pertenceHorizontal: true, pertenceVertical: true, letraCerta: 'B' },
    { linha: 0, coluna: 2, idHorizontal: 1, letraCerta: 'C' },
  ], [{ linha: 1, coluna: 1, idVertical: 2, letraCerta: 'D' }, { linha: 1, coluna: 2, vazia: true }]];
  const cruzamento = grade[0][1];
  assert.equal(escolherDirecaoDaEntrada(grade, {}, cruzamento, 'vertical'), 'horizontal');
  assert.equal(escolherDirecaoDaEntrada(grade, { '0-0': 'A' }, cruzamento, 'vertical'), 'vertical');
});

test('letra repetida da interseção é consumida antes da próxima casa vazia', () => {
  const grade = [[
    { idHorizontal: 'entrada', letraCerta: 'P' },
    { idHorizontal: 'entrada', idVertical: 'cruzamento', letraCerta: 'U' },
    { idHorizontal: 'entrada', letraCerta: 'N' },
  ]];
  const ignoradas = celulasPreenchidasAteProximaVazia(grade, { '0-0': 'P', '0-1': 'U' }, 0, 0, 'horizontal');
  assert.deepEqual(ignoradas, [{ linha: 0, coluna: 1, letra: 'U' }]);
  assert.deepEqual(resolverLetraRepetida('u', ignoradas), { acao: 'consumir', restantes: [] });
  assert.deepEqual(resolverLetraRepetida('n', ignoradas), { acao: 'digitar', letra: 'N' });
  assert.deepEqual(resolverLetraRepetida('a', [], 'U'), { acao: 'substituir', letra: 'A' });
});
