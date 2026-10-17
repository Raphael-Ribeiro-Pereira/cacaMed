import test from 'node:test';
import assert from 'node:assert/strict';
import { criarApiSupabase } from '../shared/apiSupabase.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { BANCO_QUIZ } from './bancoTreinos.js';
import { obterAuditoria } from './erroMedico.js';
import { obterRelacao } from './causaEfeito.js';
import { criarMissoesDiarias, dataLocalHoje } from './missoes.js';
import { LIMITE_CRUZADINHAS } from '../shared/operarJogosSupabase.js';
import { criarLimitador } from '../shared/limitador.js';
import { aprovadaPara } from '../shared/migrarSenhaSupabase.js';

// Tópico com 6 palavras: a maior tem 10 letras e as 5 maiores somam 38, o que cabe nas partidas dos testes.
const BANCO_PALAVRAS = { 'ANATOMIA-OSSOS': ['MANDIBULAS', 'CLAVICULA', 'ESCAPULA', 'FIBULA', 'FEMUR', 'TIBIA'].map(palavra => ({ palavra })) };

function fixture(opcoes = {}) {
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
  }, palavras: async () => ({ banco: BANCO_PALAVRAS }), ranking: async () => [], migrateIdentity: async () => ({ migrada: false }), ...opcoes });
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

test('DDX na nova API cobra uma vez, confirma as etapas (uma a uma ou em bloco) e não recompensa repetição', () => {
  for (const config of [
    { campo: 'erroMedico', iniciar: 'iniciarAuditoria', responder: 'responderAuditoria', chave: 'auditoriaId', caso: obterAuditoria('aud-asma-alta-1') },
    { campo: 'causaEfeito', iniciar: 'iniciarRelacao', responder: 'responderRelacao', chave: 'relacaoId', caso: obterRelacao('ce-asma-1') },
  ]) {
    let p = { uid: 'admin', role: 'admin', tickets: 10, pontuacaoTotal: 0, economia: { versao: 2, ultimoNivelPremiado: 1 }, dataUltimoLogin: dataLocalHoje(), missoesDiarias: criarMissoesDiarias() };
    for (let rodada = 0; rodada < 2; rodada++) {
      const entradaId = crypto.randomUUID();
      const inicio = { acao: config.iniciar, [config.chave]: config.caso.id, entradaId };
      p = executarPedidoSupabase(p, inicio).perfil;
      const saldo = p.tickets;
      assert.equal(executarPedidoSupabase(p, inicio).perfil.tickets, saldo);
      const respostas = [];
      const certas = config.caso.perguntas.map(pergunta => pergunta.correta);
      if (rodada) {
        for (const resposta of certas) { respostas.push(resposta); p = executarPedidoSupabase(p, { acao: config.responder, entradaId, respostas: [...respostas] }).perfil; }
      } else {
        // A tela nova envia todas as etapas de uma vez ("Testar circuito" e "Marcar a falha").
        respostas.push(...certas);
        p = executarPedidoSupabase(p, { acao: config.responder, entradaId, respostas: [...respostas] }).perfil;
      }
      const xpEsperado = config.caso.perguntas.length * 25;
      assert.equal(p[config.campo].entrada.xpConcedido, rodada ? 0 : xpEsperado);
      assert.equal(p.pontuacaoTotal, xpEsperado);
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

test('Cruzadinha só soma dias seguidos em dias consecutivos de Brasília e recomeça depois de uma falta', () => {
  const jogar = (perfil, agora) => executarPedidoSupabase(perfil, { acao: 'registrarPartida', partida: {
    id: crypto.randomUUID(), chaveXP: 'ANATOMIA-OSSOS', subMateria: 'Ossos', palavras: 5, letras: 30, tempo: 100, erros: 0, maiorPalavra: 10 } }, { agora: new Date(agora) }).perfil;
  const dias = perfil => [perfil.estatisticasGerais.diasSeguidos, perfil.estatisticasGerais.ultimoDia];
  let p = { uid: 'teste', tickets: 0, pontuacaoTotal: 0, estatisticasGerais: { diasSeguidos: 5, ultimoDia: '2026-09-20' } };
  p = jogar(p, '2026-10-05T15:00:00Z');
  assert.deepEqual(dias(p), [1, '2026-10-05'], 'contador antigo inflado recomeça');
  p = jogar(p, '2026-10-06T02:30:00Z');
  assert.deepEqual(dias(p), [1, '2026-10-05'], '23:30 em Brasília ainda é o mesmo dia');
  p = jogar(p, '2026-10-06T15:00:00Z');
  assert.deepEqual(dias(p), [2, '2026-10-06']);
  p = jogar(p, '2026-10-07T12:00:00Z');
  assert.deepEqual(dias(p), [3, '2026-10-07']);
  p = jogar(p, '2026-10-09T12:00:00Z');
  assert.deepEqual(dias(p), [1, '2026-10-09'], 'um dia sem jogar zera a sequência');
  p = jogar({ ...p, estatisticasGerais: { diasSeguidos: 4, ultimoDia: '2026-09-30' } }, '2026-10-01T12:00:00Z');
  assert.deepEqual(dias(p), [5, '2026-10-01'], 'virada de mês continua a sequência');
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

test('definirSenha recebe o token da sessão para trocar a senha sem encerrá-la', async () => {
  // Incidente de 07/10/2026: a troca pelo admin encerrava todas as sessões e o cadastro caía em seguida.
  let recebido;
  const api = criarApiSupabase({ database: async () => [], identity: async token => ({ uid: 'u1', authId: 'a1', source: 'supabase', token: undefined, tokenVisto: token }),
    definePassword: async (user, pedido, token) => { recebido = { user, pedido, token }; return { sucesso: true }; },
    palavras: async () => ({ banco: {} }), ranking: async () => [], migrateIdentity: async () => ({ migrada: false }) });
  const r = await api(new Request('https://test/api', { method: 'POST', headers: { Authorization: 'Bearer sessao-atual', Origin: 'http://localhost:5174' },
    body: JSON.stringify({ acao: 'definirSenha', senha: 'segredo1' }) }));
  assert.equal(r.status, 200);
  assert.equal(recebido.token, 'sessao-atual');
  assert.equal(recebido.pedido.senha, 'segredo1');
});

test('S-02: cruzadinha só aceita partida que cabe no tópico do banco de palavras', async () => {
  const f = fixture();
  await f.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'teste' });
  const partida = extra => ({ id: crypto.randomUUID(), chaveXP: 'ANATOMIA-OSSOS', subMateria: 'Ossos', palavras: 5, letras: 30, tempo: 100, erros: 0, maiorPalavra: 10, ...extra });
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ chaveXP: 'INVENTADO-QUALQUER' }) })).erro, 'Tópico da cruzadinha desconhecido.');
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ palavras: 7 }) })).status, 400, 'mais palavras do que o tópico tem');
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ letras: 39 }) })).status, 400, 'mais letras do que as 5 maiores palavras somam');
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ maiorPalavra: 11 }) })).status, 400);
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida() })).status, 200);
});

test('cruzadinha lembra as palavras respondidas no perfil e recusa palavra fora do tópico', async () => {
  const f = fixture();
  await f.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'teste' });
  const partida = extra => ({ id: crypto.randomUUID(), chaveXP: 'ANATOMIA-OSSOS', subMateria: 'Ossos', palavras: 3, letras: 15, tempo: 100, erros: 0, maiorPalavra: 6, ...extra });
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ respostas: ['FEMUR', 'INVENTADA'] }) })).status, 400, 'palavra fora do tópico');
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ respostas: ['FEMUR', 'TIBIA', 'FIBULA', 'CLAVICULA'] }) })).status, 400, 'mais respostas que palavras');
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ respostas: 'FEMUR' }) })).status, 400);
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ respostas: ['FEMUR', 'TIBIA', 'FIBULA'] }) })).status, 200);
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida({ respostas: ['ESCAPULA', 'Fêmur'] }) })).status, 200);
  assert.deepEqual(f.states.get('jogador').profile.palavrasRespondidas, { 'ANATOMIA-OSSOS': ['TIBIA', 'FIBULA', 'ESCAPULA', 'FEMUR'] });
  assert.equal((await f.call({ acao: 'registrarPartida', partida: partida() })).status, 200, 'app antigo sem respostas');
  assert.equal(f.states.get('jogador').profile.palavrasRespondidas['ANATOMIA-OSSOS'].length, 4);
});

test('S-02: tempo impossível não ganha bônus e há teto de cruzadinhas por hora e por dia', () => {
  const jogar = (perfil, agora, extra = {}) => executarPedidoSupabase(perfil, { acao: 'registrarPartida', partida: {
    id: crypto.randomUUID(), chaveXP: 'ANATOMIA-OSSOS', subMateria: 'Ossos', palavras: 5, letras: 30, tempo: 100, erros: 0, maiorPalavra: 10, ...extra } }, { agora: new Date(agora) }).perfil;
  const base = { uid: 'teste', tickets: 0, pontuacaoTotal: 0, missoesDiarias: [] };
  const xp = perfil => perfil.xpTopicos['ANATOMIA-OSSOS'];
  assert.equal(xp(jogar(base, '2026-10-14T12:00:00Z', { tempo: 0 })), 110, 'tempo 0 fica sem multiplicador');
  assert.equal(xp(jogar(base, '2026-10-14T12:00:00Z', { tempo: 10 })), 220, 'tempo plausível e rápido dobra');
  let p = base;
  for (let i = 0; i < LIMITE_CRUZADINHAS.hora; i++) p = jogar(p, `2026-10-14T12:${String(i * 4).padStart(2, '0')}:00Z`);
  assert.throws(() => jogar(p, '2026-10-14T12:50:00Z'), /Muitas cruzadinhas em uma hora/);
  p = jogar(p, '2026-10-14T13:05:00Z');
  for (let h = 14; p.cruzadinhasHorarios.length < LIMITE_CRUZADINHAS.dia; h++) {
    for (let i = 0; i < 10 && p.cruzadinhasHorarios.length < LIMITE_CRUZADINHAS.dia; i++) p = jogar(p, `2026-10-14T${h}:${String(i * 5).padStart(2, '0')}:00Z`);
  }
  assert.throws(() => jogar(p, '2026-10-15T08:00:00Z'), /limite de cruzadinhas de hoje/);
  assert.doesNotThrow(() => jogar(p, '2026-10-15T14:00:00Z'), 'a janela de 24 h anda');
});

test('S-03: limite de frequência responde 429 com Retry-After e o ranking público vai com cache', async () => {
  const limites = { publico: [2, 60000], ip: [100, 60000], jogador: [3, 60000], username: [1, 60000], senha: [1, 900000] };
  const f = fixture({ limites });
  await f.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'teste' });
  assert.equal((await f.call({ acao: 'verificarUsername', username: 'outro' })).status, 200);
  assert.equal((await f.call({ acao: 'verificarUsername', username: 'outro2' })).status, 429, 'username tem limite próprio');
  assert.equal((await f.call({ acao: 'obterPerfil' })).status, 429, 'quarto pedido do jogador no minuto');
  assert.equal((await f.call({ acao: 'obterPerfil' }, 'admin')).status, 200, 'outro jogador não é afetado');
  const get = () => f.api(new Request('https://test/api?acao=ranking', { headers: { 'cf-connecting-ip': '203.0.113.9' } }));
  const primeiro = await get();
  assert.equal(primeiro.headers.get('cache-control'), 'public, max-age=60');
  await get();
  const terceiro = await get();
  assert.equal(terceiro.status, 429);
  assert.ok(Number(terceiro.headers.get('retry-after')) >= 1);
});

test('S-03: limitador por janela fixa recomeça depois da janela', () => {
  let t = 0;
  const limitar = criarLimitador({ agora: () => t });
  assert.equal(limitar('a', 2, 1000), 0);
  assert.equal(limitar('a', 2, 1000), 0);
  assert.equal(limitar('a', 2, 1000), 1);
  assert.equal(limitar('b', 2, 1000), 0, 'chaves separadas');
  t = 1000;
  assert.equal(limitar('a', 2, 1000), 0);
});

test('S-06: aprovação de migração vale só para o e-mail aprovado', () => {
  assert.equal(aprovadaPara({ aprovada: true, aprovadaEmail: 'Carol@Exemplo.com ' }, 'carol@exemplo.com'), true);
  assert.equal(aprovadaPara({ aprovada: true }, 'carol@exemplo.com'), false, 'aprovação antiga sem e-mail não vale');
  assert.equal(aprovadaPara({ aprovada: true, aprovadaEmail: 'carol@exemplo.com' }, 'outra@exemplo.com'), false);
  assert.equal(aprovadaPara({ aprovada: false, aprovadaEmail: 'carol@exemplo.com' }, 'carol@exemplo.com'), false);
  assert.equal(aprovadaPara({ aprovada: true, aprovadaEmail: '' }, ''), false);
});

test('S-06 e S-09: e-mail antigo não verificado não reserva o endereço; username repetido no banco vira 409', async () => {
  let gravado;
  const database = async (path, options = {}) => {
    if (path === 'rpc/cacamed_commit') { gravado = JSON.parse(options.body).p_profile; if (gravado.username === 'corrida') throw Object.assign(new Error('dup'), { code: '23505' }); return 1; }
    return [];
  };
  const api = criarApiSupabase({ database, identity: async () => ({ uid: 'fb1', email: 'vitima@exemplo.com', nome: 'X', source: 'firebase', emailVerified: false }),
    palavras: async () => ({ banco: {} }), ranking: async () => [], migrateIdentity: async () => ({}) });
  const cadastrar = username => api(new Request('https://test/api', { method: 'POST', headers: { Authorization: 'Bearer t', Origin: 'http://localhost:5174' },
    body: JSON.stringify({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username }) }));
  assert.equal((await cadastrar('novo.jogador')).status, 200);
  assert.equal(gravado.email, undefined);
  assert.equal(gravado.emailNaoVerificado, 'vitima@exemplo.com');
  const corrida = await cadastrar('corrida');
  assert.equal(corrida.status, 409);
});

<<<<<<< HEAD
test('cadastrar guarda o curso validado e aceita as matérias novas; app antigo sem curso continua cadastrando', async () => {
  const f = fixture();
  const ok = await f.call({ acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'cardio', username: 'nova', curso: { etapa: 4, faculdade: ' Universidade Federal de Minas Gerais (UFMG) ', extra: 'x' } });
  assert.equal(ok.status, 200);
  const perfil = f.states.get('jogador').profile;
  assert.deepEqual([perfil.materiaPreferida, perfil.naoMedicina, perfil.etapa, perfil.formado, perfil.faculdade, perfil.extra],
    ['cardio', false, 4, false, 'Universidade Federal de Minas Gerais (UFMG)', undefined]);
  const visitante = await f.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'visita', curso: { naoMedicina: true } }, 'admin');
  assert.equal(visitante.status, 200);
  assert.equal(f.states.get('admin').profile.naoMedicina, true);
  const g = fixture();
  for (const curso of [{ etapa: 13, faculdade: 'UFMG' }, { etapa: 3 }, 'medicina', null]) {
    assert.equal((await g.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'teste', curso })).status, 400, JSON.stringify(curso));
  }
  assert.equal((await g.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'veterinaria', username: 'teste' })).status, 400);
  const antigo = await g.call({ acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'clinica', username: 'teste' });
  assert.equal(antigo.status, 200);
  assert.equal('etapa' in g.states.get('jogador').profile, false);
=======
test('CORS aceita o domínio cacamed.com e recusa origem desconhecida', async () => {
  const f = fixture();
  const chamar = origin => f.api(new Request('https://test/api?acao=palavras', { method: 'OPTIONS', headers: { Origin: origin } }));
  assert.equal((await chamar('https://cacamed.com')).headers.get('Access-Control-Allow-Origin'), 'https://cacamed.com');
  assert.equal((await chamar('https://outro.exemplo')).headers.get('Access-Control-Allow-Origin'), null);
>>>>>>> d4eba0b (fix: allow the cacamed.com origin in the API CORS list)
});
