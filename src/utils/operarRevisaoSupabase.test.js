import test from 'node:test';
import assert from 'node:assert/strict';
import { operarRevisaoSupabase, eventosRevisao } from '../shared/operarRevisaoSupabase.js';
import { BANCO_QUIZ } from './bancoTreinos.js';

test('revisão migrada usa erros, preserva saldo e não repete resposta confirmada', () => {
  const item = BANCO_QUIZ[0];
  const tentativas = [{ modo: 'quiz', itemId: item.id, versao: item.versao, tema: item.tema,
    rodadaId: 'origem', acertou: false, data: '2026-09-29T10:00:00Z' }];
  const revisaoId = '11111111-1111-4111-8111-111111111111';
  const agora = '2026-09-30T10:00:00Z';
  let perfil = { role: 'admin', pontuacaoTotal: 123, tickets: 7 };
  perfil = operarRevisaoSupabase(perfil, { acao: 'iniciarRevisao', revisaoId }, tentativas, [], [], agora);
  assert.equal(perfil.revisao.entrada.itens.length, 1);
  const pedido = { acao: 'responderRevisao', revisaoId, itemId: item.id, versao: item.versao, escolha: item.correta };
  perfil = operarRevisaoSupabase(perfil, pedido, tentativas, [], [], agora);
  assert.equal(perfil.pontuacaoTotal, 123);
  assert.equal(perfil.tickets, 7);
  assert.equal(perfil.revisao.resumo.disponiveis, 0);
  assert.equal(perfil.revisao.entrada.historicoConfirmado, true);
  const eventos = eventosRevisao(perfil);
  assert.equal(eventos.length, 2);
  assert.strictEqual(operarRevisaoSupabase(perfil, pedido, tentativas, [eventos[0].data], [], agora), perfil);
  assert.throws(() => operarRevisaoSupabase({ ...perfil, role: 'jogador' }, pedido, tentativas, [], [], agora), /piloto/);
});
