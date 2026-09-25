import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicarProgressoMissoes, criarMissoesDiarias, prepararMissoesDoDia } from './missoes.js';

test('reset no mesmo dia não concede bônus outra vez ao migrar missões antigas', () => {
  const dados = { dataUltimoLogin: '24/09/2026', missoesDiarias: { data: '2026-09-24' }, pontuacaoTotal: 100 };
  const preparo = prepararMissoesDoDia(dados, '2026-09-24');
  assert.equal(preparo.xpLogin, 0);
  assert.equal(preparo.missoesDiarias.length, 3);
});

test('login repetido no mesmo dia mantém missões e XP', () => {
  const dados = { dataUltimoLogin: '2026-09-24', missoesDiarias: criarMissoesDiarias(() => 0) };
  assert.equal(prepararMissoesDoDia(dados, '2026-09-24'), null);
});

test('missão clínica concede XP e ticket só na primeira conclusão', () => {
  const missoes = criarMissoesDiarias(() => 0);
  missoes[2] = { id: 'vencer_ddx', meta: 1, progresso: 0, concluida: false, recompensaXP: 300, recompensaTicket: 1 };
  const primeira = aplicarProgressoMissoes(missoes, { vencer_ddx: 1 });
  assert.equal(primeira.xp, 300);
  assert.equal(primeira.tickets, 1);
  const segunda = aplicarProgressoMissoes(primeira.missoes, { vencer_ddx: 1 });
  assert.equal(segunda.xp, 0);
  assert.equal(segunda.tickets, 0);
});
