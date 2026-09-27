import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularPontuacaoCruzadinha, conferirGrade, resumirGrade } from './pontuacaoCruzadinha.js';

const grade = [[
  { linha: 0, coluna: 0, vazia: false, letraCerta: 'A', inicioHorizontal: true, palavraInicialHorizontal: 'ATLAS' },
  { linha: 0, coluna: 1, vazia: false, letraCerta: 'T' },
  { linha: 0, coluna: 2, vazia: false, letraCerta: 'L' },
  { linha: 0, coluna: 3, vazia: false, letraCerta: 'A' },
  { linha: 0, coluna: 4, vazia: false, letraCerta: 'S' }
]];

test('confere respostas usando o gabarito da grade, não XP informado pelo cliente', () => {
  assert.equal(conferirGrade(grade, { '0-0': 'A', '0-1': 'T', '0-2': 'L', '0-3': 'A', '0-4': 'S' }), true);
  assert.equal(conferirGrade(grade, { '0-0': 'B', '0-1': 'T', '0-2': 'L', '0-3': 'A', '0-4': 'S' }), false);
  assert.equal(conferirGrade(grade, { '0-0': 'A' }), false);
});

test('conserva fórmula atual e desconta as dicas oficiais', () => {
  assert.deepEqual(resumirGrade(grade), { letras: 5, palavras: 1, maiorPalavra: 5 });
  assert.equal(calcularPontuacaoCruzadinha({ grade, nivel: 0, segundos: 100, dicas: 0 }).ganho, 20);
  assert.equal(calcularPontuacaoCruzadinha({ grade, nivel: 0, segundos: 100, dicas: 1 }).ganho, 15);
  assert.equal(calcularPontuacaoCruzadinha({ grade, nivel: 0, segundos: 100, dicas: 2 }).ganho, 10);
  assert.equal(calcularPontuacaoCruzadinha({ grade, nivel: 2, segundos: 0, dicas: 0 }).ganho, 44);
});

test('rejeita entradas inválidas e grade sem palavras', () => {
  assert.throws(() => calcularPontuacaoCruzadinha({ grade, nivel: -1, segundos: 0 }));
  assert.throws(() => calcularPontuacaoCruzadinha({ grade: [], nivel: 0, segundos: 0 }));
});
