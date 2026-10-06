import test from 'node:test';
import assert from 'node:assert/strict';
import { criarApiSupabase } from '../shared/apiSupabase.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { BANCO_QUIZ } from './bancoTreinos.js';
import { fimDaSemana, materiaDoTopico, montarCoroas, registrarXpSemanal, semanaCoroas } from './coroas.js';
import { resumirHistorico } from './estatisticasPainel.js';

const perfilBase = extra => ({ uid: 'u1', nome: 'Ana Souza', username: 'ana', role: 'jogador', pontuacaoTotal: 0, tickets: 0, xpTopicos: {}, estatisticas: {},
  estatisticasGerais: {}, economia: { versao: 2, ultimoNivelPremiado: 1 }, ...extra });
const partida = () => ({ id: crypto.randomUUID(), chaveXP: 'ANATOMIA-OSSOS', subMateria: 'Ossos', palavras: 5, letras: 30, tempo: 100, erros: 0, maiorPalavra: 10 });

test('semana das coroas segue Brasília e fecha domingo às 23:59', () => {
  assert.equal(semanaCoroas('2026-10-12T02:59:59Z'), '2026-S41', 'domingo 23:59 em Brasília ainda é a semana 41');
  assert.equal(semanaCoroas('2026-10-12T03:00:00Z'), '2026-S42');
  assert.equal(fimDaSemana('2026-10-06T12:00:00Z').toISOString(), '2026-10-12T02:59:59.999Z');
  assert.deepEqual(['ANATOMIA-OSSOS', 'NEUROANATOMIA-TRONCO', 'DDX-BATALHA', 'DDX-RESPIRATORIO', 'FARMACOLOGIA-BASICA'].map(materiaDoTopico),
    ['anatomia', 'neurologia', 'micro', 'clinica', 'farmaco']);
});

test('XP semanal por matéria acumula na semana, zera na seguinte e ignora ajustes do admin', () => {
  const agora = new Date('2026-10-06T15:00:00Z');
  const { perfil } = executarPedidoSupabase(perfilBase(), { acao: 'registrarPartida', partida: partida() }, { agora });
  const ganho = perfil.xpTopicos['ANATOMIA-OSSOS'];
  assert.deepEqual(perfil.coroas, { semana: '2026-S41', xp: { anatomia: ganho } });
  const dois = executarPedidoSupabase(perfil, { acao: 'registrarPartida', partida: partida() }, { agora }).perfil;
  assert.equal(dois.coroas.xp.anatomia, dois.xpTopicos['ANATOMIA-OSSOS']);
  const proxima = executarPedidoSupabase(dois, { acao: 'registrarPartida', partida: partida() }, { agora: new Date('2026-10-13T15:00:00Z') }).perfil;
  assert.equal(proxima.coroas.semana, '2026-S42');
  assert.equal(proxima.coroas.xp.anatomia, proxima.xpTopicos['ANATOMIA-OSSOS'] - dois.xpTopicos['ANATOMIA-OSSOS']);
  const admin = executarPedidoSupabase(perfilBase({ role: 'admin' }), { acao: 'admin', operacao: 'setNivelCruzadinha', chaveXP: 'NEUROLOGIA-X', valor: 3 }, { agora });
  assert.equal(admin.perfil.coroas, undefined);
  assert.equal(registrarXpSemanal(perfilBase(), perfilBase(), agora).coroas, undefined, 'sem XP novo, nada muda');
});

test('tabela das coroas: só a semana atual, XP positivo, dez por matéria em ordem', () => {
  const agora = new Date('2026-10-06T15:00:00Z');
  const jogadores = Array.from({ length: 12 }, (_, i) => ({ idPublico: `id${String(i).padStart(2, '0')}`, nome: `J${i}`, coroas: { semana: '2026-S41', xp: { anatomia: 100 + i, neurologia: i % 2 ? 50 : 0 } } }));
  jogadores.push({ idPublico: 'velho', nome: 'Velho', coroas: { semana: '2026-S40', xp: { anatomia: 9999 } } });
  const t = montarCoroas(jogadores, agora);
  assert.equal(t.semana, '2026-S41');
  assert.equal(t.materias.anatomia.length, 10);
  assert.equal(t.materias.anatomia[0].nome, 'J11');
  assert.ok(!t.materias.anatomia.some(l => l.idPublico === 'velho'));
  assert.equal(t.materias.neurologia.length, 6);
  assert.deepEqual(t.materias.farmaco, []);
});

test('histórico do painel: erros por tema, semanas, partidas recentes e conclusão', () => {
  const agora = new Date('2026-10-06T15:00:00Z');
  const eventos = [
    { kind: 'resposta', created_at: '2026-10-06T10:00:00Z', data: { modo: 'quiz', tema: 'Microbiologia', acertou: false, data: '2026-10-06T10:00:00Z' } },
    { kind: 'resposta', created_at: '2026-10-06T10:00:00Z', data: { modo: 'batalha', tema: 'Microbiologia', acertou: false, data: '2026-10-06T10:00:00Z' } },
    { kind: 'resposta', created_at: '2026-10-05T10:00:00Z', data: { modo: 'quiz', tema: 'Hematologia', acertou: true, data: '2026-10-05T10:00:00Z' } },
    { kind: 'resposta', created_at: '2026-09-29T10:00:00Z', data: { modo: 'verdadeMentira', tema: 'Hematologia', acertou: false, data: '2026-09-29T10:00:00Z' } },
    { kind: 'recibo', created_at: '2026-10-06T11:00:00Z', data: { modo: 'cruzadinha', titulo: 'ANATOMIA-OSSOS', xp: 120 } },
    { kind: 'recibo', created_at: '2026-10-04T11:00:00Z', data: { modo: 'batalha', xpConcedido: 0, resultado: 'derrota', doencaId: 'dengue', revelada: true, data: '2026-10-04T11:00:00Z' } },
    { kind: 'recibo', created_at: '2026-10-03T11:00:00Z', data: { modo: 'quiz', abandonada: true, relatorio: { xp: 0 } } },
    { kind: 'recibo', created_at: '2026-10-03T11:00:00Z', data: { modo: 'revisao' } },
  ];
  const r = resumirHistorico(eventos, agora);
  assert.deepEqual(r.erros[0], { tema: 'Microbiologia', erros: 2, fonte: 'Quiz · Batalha' });
  assert.equal(r.erros[1].tema, 'Hematologia');
  assert.equal(r.semanas.length, 8);
  assert.equal(r.semanas[7].inicio, '2026-10-05T03:00:00.000Z');
  assert.deepEqual([r.semanas[7].xp, r.semanas[7].acerto], [120, 33]);
  assert.deepEqual([r.semanas[6].partidas, r.semanas[6].acerto], [2, 0]);
  assert.deepEqual(r.recentes.map(h => [h.titulo, h.ok]), [['Anatomia · Ossos', true], ['Batalha · Dengue', false], ['Rodada do Quiz', false]]);
  assert.deepEqual(r.conclusao, { concluidas: 2, total: 3 });
});

function fixture() {
  const states = new Map();
  const events = new Map();
  const database = async (path, options = {}) => {
    if (path === 'rpc/cacamed_commit') {
      const p = JSON.parse(options.body);
      const old = states.get(p.p_player_id);
      if (old ? old.version !== p.p_expected_version : p.p_expected_version !== -1) throw Object.assign(new Error('conflict'), { code: 'PT409' });
      states.set(p.p_player_id, { profile: structuredClone(p.p_profile), version: (old?.version ?? -1) + 1 });
      for (const e of p.p_events || []) events.set(p.p_player_id + ':' + e.id, { ...e, playerId: p.p_player_id, created_at: new Date().toISOString() });
      return 1;
    }
    const url = new URL('https://test/' + path);
    const filtroUser = url.searchParams.get('profile->>username');
    if (url.pathname === '/cacamed_player_state' && filtroUser) {
      const alvo = filtroUser.slice('ilike.'.length).replace(/\\(.)/g, '$1').toLowerCase();
      return [...states].filter(([, s]) => String(s.profile.username).toLowerCase() === alvo).map(([id]) => ({ player_id: id }));
    }
    const uid = url.searchParams.get('player_id')?.slice(3);
    if (url.pathname === '/cacamed_player_state') return states.has(uid) ? [structuredClone(states.get(uid))] : [];
    if (url.pathname === '/cacamed_events') {
      const id = url.searchParams.get('event_id')?.slice(3);
      let rows = [...events.values()].filter(e => e.playerId === uid && (!id || e.id === id));
      const kinds = url.searchParams.get('kind')?.match(/\((.*)\)/)?.[1].split(',');
      if (kinds) rows = rows.filter(e => kinds.includes(e.kind));
      return rows.map(e => ({ event_id: e.id, data: e.data, kind: e.kind, created_at: e.created_at }));
    }
    throw new Error('Unexpected database request: ' + path);
  };
  const api = criarApiSupabase({ database, identity: async token => ({ uid: token, email: token + '@example.com', nome: token === 'bia' ? 'Bia' : 'Ana' }),
    palavras: async () => ({ banco: {} }), ranking: async () => [], coroas: async () => ({ semana: semanaCoroas(), materias: {} }), migrateIdentity: async () => ({}) });
  const call = async (pedido, uid = 'ana') => {
    const r = await api(new Request('https://test/api', { method: 'POST', headers: { Authorization: 'Bearer ' + uid, Origin: 'http://localhost:5174' }, body: JSON.stringify(pedido) }));
    return { status: r.status, ...(await r.json()) };
  };
  return { api, call, states };
}

test('crachá: username único sem diferenciar maiúsculas, regra nova só ao trocar e foto validada', async () => {
  const f = fixture();
  await f.call({ acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'ana' });
  await f.call({ acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'micro', username: 'Bia_Med' }, 'bia');
  assert.deepEqual((await f.call({ acao: 'verificarUsername', username: 'bia_med' })).resultado, { disponivel: false });
  assert.deepEqual((await f.call({ acao: 'verificarUsername', username: 'biaxmed' })).resultado, { disponivel: true }, '_ não vira curinga');
  assert.deepEqual((await f.call({ acao: 'verificarUsername', username: 'ana' })).resultado, { disponivel: true }, 'o próprio username continua disponível');
  assert.deepEqual((await f.call({ acao: 'verificarUsername', username: 'A' })).resultado, { disponivel: false, motivo: 'invalido' });
  const tomado = await f.call({ acao: 'editarPerfil', nome: 'Ana Souza', username: 'bia_med' });
  assert.equal(tomado.status, 409);
  assert.equal((await f.call({ acao: 'editarPerfil', nome: 'Ana Souza', username: 'Ana Maria' })).status, 400);
  const ok = await f.call({ acao: 'editarPerfil', nome: 'Ana Souza', username: 'ana.souza', foto: 3 });
  assert.equal(ok.status, 200);
  assert.deepEqual([ok.resultado.username, ok.resultado.foto, ok.resultado.nome], ['ana.souza', 3, 'Ana Souza']);
  assert.equal((await f.call({ acao: 'editarPerfil', nome: 'Ana Souza', username: 'ana.souza', foto: 9 })).status, 400);
  const antigo = await f.call({ acao: 'editarPerfil', nome: 'Bia Lima', username: 'Bia_Med' }, 'bia');
  assert.equal(antigo.status, 200, 'username antigo fora da regra nova continua válido se não mudar');
});

test('painel: obterEstatisticas lê só o histórico do próprio jogador e não grava nada', async () => {
  const f = fixture();
  await f.call({ acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'ana' });
  const entradaId = crypto.randomUUID();
  const { resultado } = await f.call({ acao: 'iniciarTreino', modo: 'quiz', variante: 'teoria', entradaId });
  const respostas = [];
  for (const item of resultado.treinos.quiz.entrada.itens) {
    const q = BANCO_QUIZ.find(x => x.id === item.id);
    respostas.push({ itemId: item.id, escolha: respostas.length ? q.correta : q.opcoes.find(o => o.id !== q.correta).id });
    await f.call({ acao: 'responderTreino', modo: 'quiz', entradaId, respostas });
  }
  await f.call({ acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'micro', username: 'bia' }, 'bia');
  const versao = f.states.get('ana').version;
  const r = await f.call({ acao: 'obterEstatisticas' });
  assert.equal(r.status, 200);
  assert.equal(r.resultado.erros.length, 1);
  assert.equal(r.resultado.erros[0].erros, 1);
  assert.equal(r.resultado.recentes[0].titulo, 'Rodada do Quiz');
  assert.ok(r.resultado.recentes[0].xp > 0, 'recibo do treino registra o XP da rodada');
  assert.equal(r.resultado.semanas[7].partidas, 1);
  assert.equal(f.states.get('ana').version, versao);
  const vazio = await f.call({ acao: 'obterEstatisticas' }, 'bia');
  assert.deepEqual([vazio.resultado.recentes.length, vazio.resultado.erros.length], [0, 0]);
  const publico = await f.api(new Request('https://test/api?acao=coroas', { method: 'GET' }));
  assert.equal((await publico.json()).coroas.semana, semanaCoroas());
});
