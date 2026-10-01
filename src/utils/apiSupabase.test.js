import test from 'node:test';
import assert from 'node:assert/strict';
import { criarApiSupabase } from '../shared/apiSupabase.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { BANCO_QUIZ } from './bancoTreinos.js';
import { obterAuditoria } from './erroMedico.js';
import { obterRelacao } from './causaEfeito.js';
import { criarMissoesDiarias, dataLocalHoje } from './missoes.js';

function fixture() {
  const states = new Map();
  const events = new Map();
  let conflictAfterCommit = false;
  let antesDoRecibo;
  const database = async (path, options = {}) => {
    if (path === 'rpc/cacamed_commit') {
      const p = JSON.parse(options.body);
      const old = states.get(p.p_player_id);
      if (old ? old.version !== p.p_expected_version : p.p_expected_version !== -1) throw Object.assign(new Error('conflict'), { code: 'PT409' });
      states.set(p.p_player_id, { profile: structuredClone(p.p_profile), version: (old?.version ?? -1) + 1 });
      for (const e of p.p_events || []) if (!events.has(p.p_player_id + ':' + e.id)) events.set(p.p_player_id + ':' + e.id, { ...e, playerId: p.p_player_id });
      if (conflictAfterCommit) { conflictAfterCommit = false; throw Object.assign(new Error('race'), { code: 'PT409' }); }
      return 1;
    }
    const url = new URL('https://test/' + path);
    const uid = url.searchParams.get('player_id')?.slice(3);
    if (url.pathname === '/cacamed_player_state') return states.has(uid) ? [structuredClone(states.get(uid))] : [];
    if (url.pathname === '/cacamed_events') {
      if (antesDoRecibo) { const executar = antesDoRecibo; antesDoRecibo = undefined; executar(); }
      const id = url.searchParams.get('event_id')?.slice(3);
      let rows = [...events.values()].filter(e => e.playerId === uid && (!id || e.id === id));
      if (url.searchParams.has('kind')) rows = rows.filter(e => ['resposta', 'revisao'].includes(e.kind));
      return rows.slice(Number(url.searchParams.get('offset')) || 0, (Number(url.searchParams.get('offset')) || 0) + 1000).map(e => ({ event_id: e.id, data: e.data, kind: e.kind }));
    }
    throw new Error('Unexpected database request: ' + path);
  };
  const api = criarApiSupabase({ database, identity: async token => {
    if (token !== 'jogador' && token !== 'admin') throw Object.assign(new Error('Entre novamente na conta.'), { status: 401 });
    return { uid: token, email: token + '@example.com', nome: 'Teste' };
  }, palavras: async () => ({ banco: {} }), ranking: async () => [], migrateIdentity: async () => ({ migrada: false }) });
  async function call(pedido, uid = 'jogador') {
    const r = await api(new Request('https://test/api', { method: 'POST', headers: { Authorization: 'Bearer ' + uid, Origin: 'http://localhost:5174' }, body: JSON.stringify(pedido) }));
    const body = await r.json();
    return { status: r.status, ...body };
  }
  return { api, call, states, events, race: () => { conflictAfterCommit = true; }, antesDoRecibo: executar => { antesDoRecibo = executar; } };
}

test('recibo confirmado entre leituras devolve perfil atualizado, sem recompensa duplicada', async () => {
  const f = fixture();
  await f.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'teste' });
  const partida = { id: crypto.randomUUID(), chaveXP: 'ANATOMIA-OSSOS', subMateria: 'Ossos', palavras: 5, letras: 30, tempo: 100, erros: 0, maiorPalavra: 10 };
  const anterior = f.states.get('jogador');
  const confirmado = executarPedidoSupabase(anterior.profile, { acao: 'registrarPartida', partida });
  f.antesDoRecibo(() => {
    f.states.set('jogador', { profile: confirmado.perfil, version: anterior.version + 1 });
    for (const e of confirmado.eventos) f.events.set('jogador:' + e.id, { ...e, playerId: 'jogador' });
  });
  const r = await f.call({ acao: 'registrarPartida', partida });
  assert.equal(r.status, 200);
  assert.deepEqual(r.resultado, confirmado.perfil);
  assert.equal(f.states.get('jogador').version, anterior.version + 1);
  assert.equal(f.events.size, 1);
});

test('API Supabase: duas rodadas, recuperação de concorrência e recibo permanente sem duplicar XP', async () => {
  const f = fixture();
  await f.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'teste', role: 'admin', tickets: 999 });
  assert.equal(f.states.get('jogador').profile.role, 'jogador');
  const ids = [crypto.randomUUID(), crypto.randomUUID()];
  for (const entradaId of ids) {
    const { resultado } = await f.call({ acao: 'iniciarTreino', modo: 'quiz', variante: 'teoria', entradaId });
    const respostas = [];
    for (const item of resultado.treinos.quiz.entrada.itens) {
      respostas.push({ itemId: item.id, escolha: BANCO_QUIZ.find(q => q.id === item.id).correta });
      if (respostas.length === 5) f.race();
      const r = await f.call({ acao: 'responderTreino', modo: 'quiz', entradaId, respostas });
      assert.equal(r.status, 200);
    }
    const before = structuredClone(f.states.get('jogador').profile);
    const repeated = await f.call({ acao: 'responderTreino', modo: 'quiz', entradaId, respostas: respostas.map(r => ({ escolha: r.escolha, itemId: r.itemId })) });
    assert.deepEqual(repeated.resultado, before);
  }
  assert.equal(f.events.size, 12);
  assert.equal((await f.call({ acao: 'iniciarTreino', modo: 'quiz', variante: 'teoria', entradaId: ids[0] })).status, 400);
  assert.equal((await f.call({ acao: 'obterPerfil', uid: 'admin' })).resultado.uid, 'jogador');
  assert.equal((await f.call({ acao: 'admin', operacao: 'setXP', valor: 999 })).status, 400);
});

test('DDX na nova API cobra uma vez, confirma quatro etapas e não recompensa repetição', () => {
  for (const config of [
    { campo: 'erroMedico', iniciar: 'iniciarAuditoria', responder: 'responderAuditoria', chave: 'auditoriaId', caso: obterAuditoria('resp-asma-auditoria-1') },
    { campo: 'causaEfeito', iniciar: 'iniciarRelacao', responder: 'responderRelacao', chave: 'relacaoId', caso: obterRelacao('resp-asma-relacoes-1') },
  ]) {
    let p = { uid: 'admin', role: 'admin', tickets: 10, pontuacaoTotal: 0, economia: { versao: 2, ultimoNivelPremiado: 1 }, dataUltimoLogin: dataLocalHoje(), missoesDiarias: criarMissoesDiarias() };
    for (let rodada = 0; rodada < 2; rodada++) {
      const entradaId = crypto.randomUUID();
      const inicio = { acao: config.iniciar, [config.chave]: config.caso.id, entradaId };
      p = executarPedidoSupabase(p, inicio).perfil;
      const saldo = p.tickets;
      assert.equal(executarPedidoSupabase(p, inicio).perfil.tickets, saldo);
      const respostas = [];
      for (const pergunta of config.caso.perguntas) {
        respostas.push(pergunta.correta);
        p = executarPedidoSupabase(p, { acao: config.responder, entradaId, respostas: [...respostas] }).perfil;
      }
      assert.equal(p[config.campo].entrada.xpConcedido, rodada ? 0 : 100);
      assert.equal(p.pontuacaoTotal, 100);
      assert.equal(p.tickets, 9 - rodada);
      assert.deepEqual(executarPedidoSupabase(p, { acao: config.responder, entradaId, respostas }).perfil, p);
    }
    assert.throws(() => executarPedidoSupabase({ ...p, [config.campo]: {}, tickets: 0 }, { acao: config.iniciar, [config.chave]: config.caso.id, entradaId: crypto.randomUUID() }), /Tickets/);
  }
});

test('Cruzadinha recalcula XP, ignora saldo do cliente e respeita recibos fora do histórico recente', () => {
  const p = { uid: 'teste', tickets: 0, pontuacaoTotal: 0, dataUltimoLogin: dataLocalHoje(), missoesDiarias: criarMissoesDiarias() };
  const partida = { id: crypto.randomUUID(), chaveXP: 'ANATOMIA-SISTEMA RESPIRATORIO', subMateria: 'Sistema Respiratorio', palavras: 5, letras: 30, tempo: 100, erros: 2, maiorPalavra: 10, xp: 999999, tickets: 999 };
  const primeiro = executarPedidoSupabase(p, { acao: 'registrarPartida', partida });
  assert.equal(primeiro.perfil.pontuacaoTotal, 160); // 110 da partida + 50 da missão.
  assert.equal(primeiro.perfil.tickets, 3);
  assert.equal(primeiro.eventos.length, 1);
  const semCache = { ...primeiro.perfil, cruzadinhasRegistradas: [] };
  assert.deepEqual(executarPedidoSupabase(semCache, { acao: 'registrarPartida', partida }, { recibos: [partida.id] }).perfil, semCache);
});

test('API bloqueia credencial inválida, origem desconhecida e corpo excessivo; GET público funciona', async () => {
  const { api, call } = fixture();
  assert.equal((await call({ acao: 'obterPerfil' }, 'invalido')).status, 401);
  assert.equal((await api(new Request('https://test/api', { method: 'POST' }))).status, 401);
  assert.equal((await api(new Request('https://test/api', { headers: { Origin: 'https://evil.example' } }))).status, 403);
  assert.equal((await call({ acao: 'obterPerfil', texto: 'x'.repeat(40000) })).status, 413);
  assert.equal((await call({ acao: 'prepararHomologacao', ambiente: 'homologacao', role: 'admin' })).status, 403);
  assert.equal((await call({ acao: 'prepararHomologacao' })).status, 400);
  assert.equal((await api(new Request('https://test/api?acao=ranking'))).status, 200);
  assert.equal((await api(new Request('https://test/api?acao=palavras'))).status, 200);
  assert.equal((await api(new Request('https://test/api', { method: 'OPTIONS', headers: { Origin: 'https://caca-med.vercel.app' } }))).status, 204);
});
