import test from 'node:test';
import assert from 'node:assert/strict';
import { operarTreinoSupabase, eventosTreino } from '../shared/operarTreinoSupabase.js';
import { BANCO_QUIZ } from './bancoTreinos.js';

test('duas rodadas completas preservam recompensa e recibos permanentes', () => {
  let perfil = { uid: 'teste', pontuacaoTotal: 0, tickets: 0 };
  const ids = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];
  for (const entradaId of ids) {
    perfil = operarTreinoSupabase(perfil, { acao: 'iniciarTreino', modo: 'quiz', variante: 'teoria', entradaId });
    const respostas = [];
    for (const item of perfil.treinos.quiz.entrada.itens) {
      respostas.push({ itemId: item.id, escolha: BANCO_QUIZ.find(q => q.id === item.id).correta });
      perfil = operarTreinoSupabase(perfil, { acao: 'responderTreino', modo: 'quiz', entradaId, respostas: [...respostas] });
    }
    assert.equal(eventosTreino(perfil, 'quiz').length, 6);
    const repetido = operarTreinoSupabase(perfil, { acao: 'responderTreino', modo: 'quiz', entradaId, respostas });
    assert.strictEqual(repetido, perfil);
  }
  assert.equal(perfil.pontuacaoTotal, 200);
  assert.equal(perfil.tickets, 1);
  assert.throws(() => operarTreinoSupabase(perfil, { acao: 'iniciarTreino', modo: 'quiz', variante: 'teoria', entradaId: ids[0] }, ids), /já foi encerrada/);
});
