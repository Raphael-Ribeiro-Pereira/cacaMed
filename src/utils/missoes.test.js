import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicarProgressoMissoes, criarMissoesDiarias, prepararMissoesDoDia, sorteioDoDia, CATALOGO_MISSOES, JANELA_UM_DE_CADA } from './missoes.js';

const sempre = valor => () => valor;

test('v3: cinco missões por dia, login e uma de cada nível 1, 2, 3 e 4 ou 5', () => {
  const comum = criarMissoesDiarias(sempre(0.5), 1);
  assert.deepEqual(comum.map(m => m.nivel), [0, 1, 2, 3, 4]);
  assert.deepEqual(comum.slice(1).map(m => [m.recompensaXP, m.recompensaTicket]), [[50, 1], [100, 1], [150, 1], [250, 1]]);
  const alto = criarMissoesDiarias(sempre(0.1), 1);
  assert.equal(alto[4].nivel, 5);
  assert.deepEqual([alto[4].recompensaXP, alto[4].recompensaTicket], [400, 2]);
  for (const nivel of [1, 2, 3, 4, 5]) assert.ok(CATALOGO_MISSOES[nivel].length >= 1);
});

test('v3: ofensiva soma dias seguidos, paga 25 × dias sem ticket e volta a 1 depois de pular um dia', () => {
  const ontem = prepararMissoesDoDia({ uid: 'u', ofensiva: { dias: 4, ultimoDia: '2026-10-18' } }, '2026-10-19', sempre(0.5));
  assert.deepEqual(ontem.ofensiva, { dias: 5, ultimoDia: '2026-10-19' });
  assert.equal(ontem.xpLogin, 125);
  assert.equal(ontem.missoesDiarias[0].recompensaTicket, 0);
  const pulou = prepararMissoesDoDia({ uid: 'u', ofensiva: { dias: 4, ultimoDia: '2026-10-17' } }, '2026-10-19', sempre(0.5));
  assert.equal(pulou.ofensiva.dias, 1);
  assert.equal(pulou.xpLogin, 25);
});

test('v3: login repetido no mesmo dia não paga de novo; missões antigas do mesmo dia trocam sem pagar outra vez', () => {
  const primeiro = prepararMissoesDoDia({ uid: 'u' }, '2026-10-19', sempre(0.5));
  assert.equal(prepararMissoesDoDia({ uid: 'u', ...primeiro }, '2026-10-19'), null);
  const v2 = { uid: 'u', dataUltimoLogin: '2026-10-19', missoesDiarias: [{ id: 'jogar_cruzadinha' }], ofensiva: primeiro.ofensiva };
  const troca = prepararMissoesDoDia(v2, '2026-10-19', sempre(0.5));
  assert.equal(troca.xpLogin, 0);
  assert.equal(troca.missoesDiarias.length, 5);
});

test('v3: o sorteio é fixo por jogador e dia', () => {
  const a = criarMissoesDiarias(sorteioDoDia('u', '2026-10-19')).map(m => m.id);
  assert.deepEqual(criarMissoesDiarias(sorteioDoDia('u', '2026-10-19')).map(m => m.id), a);
});

test('missão concede XP e ticket só na primeira conclusão', () => {
  const missoes = criarMissoesDiarias(sempre(0.5));
  const primeira = aplicarProgressoMissoes(missoes, { rodadas: 1 });
  assert.equal(primeira.xp, 50);
  assert.equal(primeira.tickets, 1);
  const segunda = aplicarProgressoMissoes(primeira.missoes, { rodadas: 1 });
  assert.equal(segunda.xp, 0);
});

test('v3: "Plantão completo" exige os quatro tipos de jogo dentro de 30 minutos', () => {
  let missoes = [{ id: 'um_de_cada', evento: 'um_de_cada', meta: 4, progresso: 0, concluida: false, recompensaXP: 400, recompensaTicket: 2 }];
  const t0 = Date.UTC(2026, 9, 19, 12);
  let r;
  for (const [tipo, t] of [['cruzadinha', t0], ['quiz', t0 + 1000], ['verdadeMentira', t0 + 2000]]) ({ missoes } = aplicarProgressoMissoes(missoes, { jogo: { tipo, instante: t } }));
  r = aplicarProgressoMissoes(missoes, { jogo: { tipo: 'ddx', instante: t0 + JANELA_UM_DE_CADA + 1 } });
  assert.equal(r.xp, 0, 'a cruzadinha saiu da janela');
  r = aplicarProgressoMissoes(r.missoes, { jogo: { tipo: 'cruzadinha', instante: t0 + JANELA_UM_DE_CADA + 2 } });
  assert.equal(r.xp, 400);
  assert.equal(r.tickets, 2);
});
