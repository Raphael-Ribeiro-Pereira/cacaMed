import test from 'node:test';
import assert from 'node:assert/strict';
import { bonusTempo, bonusTreino, bonusCruzadinha, bonusDdx, migrarEconomia, VERSAO_ECONOMIA } from './economia.js';
import { recompensaBatalha } from './batalha.js';
import { xpCasoDdx } from '../shared/operarJogosSupabase.js';

test('v3: bônus de tempo cheio até metade do esperado, cai em linha reta e zera em 1,5 vez', () => {
  assert.deepEqual([0, 30, 60, 75, 90, 200].map(s => bonusTempo(s, 60, 25)), [25, 25, 13, 6, 0, 0]);
  assert.equal(bonusTempo(NaN, 60, 25), 0);
  assert.equal(bonusTempo(-1, 60, 25), 0);
});

test('v3: Quiz e V ou M somam metade por acertos e metade por tempo, até +50', () => {
  assert.equal(bonusTreino(5, 5, 10, 60), 50);
  assert.equal(bonusTreino(1, 5, 10, 60), 30);
  assert.equal(bonusTreino(5, 5, 999, 60), 25);
});

test('v3: cruzadinha ganha até +50 de tempo, menos a penalidade das dicas, sem ficar negativa', () => {
  assert.equal(bonusCruzadinha(10, 150, 0), 50);
  assert.equal(bonusCruzadinha(10, 150, 15), 35);
  assert.equal(bonusCruzadinha(999, 150, 15), 0);
});

test('v3: casos do DDX pagam 300 + até 100; sem caminho seguro o bônus cai pela metade; zero acerto não paga', () => {
  assert.equal(bonusDdx(1, true), 100);
  assert.equal(bonusDdx(2 / 3, false), 33);
  assert.equal(xpCasoDdx({ acertos: 3, total: 3 }), 400);
  assert.equal(xpCasoDdx({ acertos: 2, total: 3 }), 333);
  assert.equal(xpCasoDdx({ acertos: 0, total: 3 }), 0);
});

test('v3: Batalha paga 500 fixos na vitória e nada na derrota', () => {
  assert.equal(recompensaBatalha({ fim: 'vitoria', revealed: true, wrongHyp: true, ineff: 4 }, { modo: 'x1' }).xp, 500);
  assert.equal(recompensaBatalha({ fim: 'derrota', revealed: true }, { modo: 'x1' }).xp, 0);
});

test('v3: migração não paga retroativo e não rebaixa o último nível premiado', () => {
  const v2 = { pontuacaoTotal: 5322, tickets: 7, economia: { versao: 2, ultimoNivelPremiado: 4 } };
  const v3 = migrarEconomia(v2);
  assert.equal(v3.economia.versao, VERSAO_ECONOMIA);
  assert.equal(v3.tickets, 7);
  assert.equal(v3.pontuacaoTotal, 5322);
  assert.equal(v3.economia.ultimoNivelPremiado, 4);
});
