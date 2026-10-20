import test from 'node:test';
import assert from 'node:assert/strict';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { BANCO_QUIZ } from './bancoTreinos.js';
import { agoraDaRevisao, originalRevisao, selecionarFilaRevisao } from './revisaoInteligente.js';
import { criarMissoesDiarias, dataLocalHoje, missaoDeLogin } from './missoes.js';
import { xpParaNivel } from './economia.js';

// Ferramentas de admin (docs/plano-admin-e-prototipos.md): cada operação grava no perfil de quem é admin.
const agora = new Date('2026-10-20T15:00:00Z');
const hoje = dataLocalHoje(agora);
const sempre = valor => () => valor;
const perfilAdmin = extra => ({ uid: 'admin', role: 'admin', pontuacaoTotal: 0, tickets: 0, economia: { versao: 3, ultimoNivelPremiado: 1 },
  dataUltimoLogin: hoje, ofensiva: { dias: 3, ultimoDia: hoje }, missoesDiarias: criarMissoesDiarias(sempre(0.5), 3), ...extra });
const admin = (perfil, operacao, extra = {}) => executarPedidoSupabase(perfil, { acao: 'admin', operacao, ...extra }, { agora });

test('as ferramentas novas são só do administrador', () => {
  for (const operacao of ['setTickets', 'subirNivel', 'sortearMissoes', 'completarMissao', 'avancarDia', 'liberarCasos', 'relogioRevisao', 'semearRevisao']) {
    assert.throws(() => admin(perfilAdmin({ role: 'jogador' }), operacao, { valor: 1 }), /restrito/, operacao);
  }
  assert.throws(() => admin(perfilAdmin(), 'inventada'), /desconhecida/);
});

test('tickets e nível: define o saldo e sobe um nível com o prêmio de sempre', () => {
  assert.equal(admin(perfilAdmin(), 'setTickets', { valor: 12 }).perfil.tickets, 12);
  assert.throws(() => admin(perfilAdmin(), 'setTickets', { valor: 101 }), /limites/);
  const nivel2 = admin(perfilAdmin({ tickets: 1 }), 'subirNivel').perfil;
  assert.equal(nivel2.pontuacaoTotal, xpParaNivel(2));
  assert.equal(nivel2.tickets, 3, 'o nível 2 paga 2 tickets');
  const nivel10 = admin(perfilAdmin({ pontuacaoTotal: xpParaNivel(9) + 120, economia: { versao: 3, ultimoNivelPremiado: 9 } }), 'subirNivel').perfil;
  assert.equal(nivel10.pontuacaoTotal, xpParaNivel(10));
  assert.equal(nivel10.tickets, 10);
  assert.equal(nivel10.economia.ultimoNivelPremiado, 10);
});

test('missões: sorteia de novo (mantendo o login), fixa o nível alto e completa uma missão pagando a recompensa', () => {
  const base = perfilAdmin();
  const alta = admin(base, 'sortearMissoes', { valor: 5 }).perfil.missoesDiarias;
  assert.equal(alta.length, 5);
  assert.deepEqual(alta[0], base.missoesDiarias[0], 'a missão de login, já paga, fica');
  assert.equal(alta[4].nivel, 5);
  assert.equal(admin(base, 'sortearMissoes', { valor: 4 }).perfil.missoesDiarias[4].nivel, 4);
  assert.throws(() => admin(base, 'sortearMissoes', { valor: 3 }), /limites/);

  const missao = base.missoesDiarias[2];
  const feito = admin(base, 'completarMissao', { missaoId: missao.id }).perfil;
  const concluida = feito.missoesDiarias.find(m => m.id === missao.id);
  assert.equal(concluida.concluida, true);
  assert.equal(concluida.progresso, concluida.meta);
  assert.equal(feito.pontuacaoTotal, missao.recompensaXP);
  assert.equal(feito.tickets, missao.recompensaTicket);
  assert.throws(() => admin(feito, 'completarMissao', { missaoId: missao.id }), /já está concluída/);
  assert.throws(() => admin(base, 'completarMissao', { missaoId: 'login' }), /não encontrada/);
});

test('avançar o dia: 1 dia continua a ofensiva e paga o login; 2 dias a zeram', () => {
  const seguinte = admin(perfilAdmin(), 'avancarDia', { valor: 1 }).perfil;
  assert.deepEqual(seguinte.ofensiva, { dias: 4, ultimoDia: hoje });
  assert.equal(seguinte.dataUltimoLogin, hoje);
  assert.equal(seguinte.pontuacaoTotal, 100, '25 XP por dia de ofensiva');
  assert.deepEqual(seguinte.missoesDiarias[0], missaoDeLogin(4));
  const quebrada = admin(perfilAdmin(), 'avancarDia', { valor: 2 }).perfil;
  assert.equal(quebrada.ofensiva.dias, 1);
  assert.equal(quebrada.pontuacaoTotal, 25);
  assert.throws(() => admin(perfilAdmin(), 'avancarDia', { valor: 8 }), /limites/);
});

test('liberar casos: os concluídos voltam a pagar XP e o resto das estatísticas fica', () => {
  const perfil = admin(perfilAdmin({ ddx: { concluidos: ['caso:1'], partidas: 4 }, erroMedico: { concluidos: ['aud:1'], xp: 400 } }), 'liberarCasos').perfil;
  assert.deepEqual(perfil.ddx, { concluidos: [], partidas: 4 });
  assert.deepEqual(perfil.erroMedico, { concluidos: [], xp: 400 });
  assert.deepEqual(perfil.causaEfeito, { concluidos: [] });
});

test('relógio da Revisão: adianta só para o admin e libera um item antes do intervalo', () => {
  const perfil = admin(perfilAdmin(), 'relogioRevisao', { valor: 2 }).perfil;
  assert.equal(perfil.revisao.relogioAdminDias, 2);
  assert.equal(agoraDaRevisao(perfil, agora), '2026-10-22T15:00:00.000Z');
  assert.equal(agoraDaRevisao({ ...perfil, role: 'jogador' }, agora), agora.toISOString(), 'jogador sempre no relógio real');
  assert.throws(() => admin(perfilAdmin(), 'relogioRevisao', { valor: 61 }), /limites/);

  // Item errado há uma hora e acertado agora na revisão: volta em 1 dia. Com o relógio +2 dias, já está na fila.
  const q = BANCO_QUIZ[0];
  const tentativas = [{ modo: 'quiz', itemId: q.id, versao: q.versao, tema: q.tema, acertou: false, escolha: 'x', rodadaId: 'r0', data: new Date(agora - 3600000).toISOString() }];
  const revisoes = [{ modo: 'quiz', itemId: q.id, versao: q.versao, tema: q.tema, acertou: true, sequencia: 1, revisaoId: 'v1', data: agora.toISOString(),
    proximaRevisao: new Date(agora.getTime() + 86400000).toISOString() }];
  const consultar = p => executarPedidoSupabase(p, { acao: 'consultarRevisao' }, { agora, tentativas, revisoes }).perfil.revisao.resumo.disponiveis;
  assert.equal(consultar(perfilAdmin()), 0);
  assert.equal(consultar(perfil), 1);
});

test('erros fictícios da Revisão: seis respostas erradas de itens do banco, que entram na fila', () => {
  const base = perfilAdmin();
  const { perfil, eventos } = admin(base, 'semearRevisao');
  assert.notEqual(perfil, base, 'perfil novo: a API só grava (com os eventos) quando o perfil muda');
  assert.equal(eventos.length, 6);
  assert.deepEqual(eventos.map(e => e.data.modo), ['quiz', 'quiz', 'quiz', 'verdadeMentira', 'verdadeMentira', 'erroMedico']);
  for (const e of eventos) {
    assert.equal(e.kind, 'resposta');
    assert.equal(e.data.acertou, false);
    assert.ok(originalRevisao(e.data), `${e.data.modo} ${e.data.itemId} existe no banco`);
  }
  assert.equal(new Set(eventos.map(e => e.id)).size, 6);
  const fila = selecionarFilaRevisao(eventos.map(e => e.data), [], agora.toISOString());
  assert.equal(fila.itens.length, 6);
});
