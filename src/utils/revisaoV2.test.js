import test from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_QUIZ } from './bancoTreinos.js';
import { selecionarFilaRevisao, criarEntradaRevisao, responderRevisaoPerfil, XP_DOMINIO } from './revisaoInteligente.js';
import { BANCO_REVISAO_ERRO, tentativaErroMedico } from './erroMedicoRevisao.js';
import { obterAuditoria } from './erroMedico.js';
import { operarRevisaoSupabase, revisaoLiberada } from '../shared/operarRevisaoSupabase.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { xpParaNivel } from './economia.js';
import { criarApiSupabase } from '../shared/apiSupabase.js';

const agora = '2026-10-19T12:00:00.000Z';
const erroQuiz = (q, data = '2026-10-18T12:00:00.000Z') => ({ modo: 'quiz', itemId: q.id, versao: q.versao, tema: q.tema, acertou: false,
  escolha: q.opcoes.find(o => o.id !== q.correta).id, rodadaId: `r-${q.id}`, data });

test('v2: libera no nível 10; abaixo disso só o administrador entra', () => {
  assert.equal(revisaoLiberada({ role: 'jogador', pontuacaoTotal: xpParaNivel(10) - 1 }), false);
  assert.equal(revisaoLiberada({ role: 'jogador', pontuacaoTotal: xpParaNivel(10) }), true);
  assert.equal(revisaoLiberada({ role: 'admin', pontuacaoTotal: 0 }), true);
});

test('v2: o caso do Erro médico errado entra na fila com carta própria e é refeito inteiro', () => {
  const a = obterAuditoria(BANCO_REVISAO_ERRO[0].id);
  const errada = a.perguntas.map(p => p.alternativas.find(x => x.id !== p.correta).id);
  const entradaJogo = { id: 'jogo-1', respostas: errada, relatorio: { acertos: 0, total: 3 } };
  const tentativa = tentativaErroMedico(entradaJogo, a, '2026-10-18T12:00:00.000Z');
  assert.equal(tentativa.acertou, false);
  const fila = selecionarFilaRevisao([tentativa], [], agora);
  assert.deepEqual(fila.resumo.cartas, [{ id: 'erroMedico-1', modo: 'erroMedico', erros: 1 }]);
  const entrada = criarEntradaRevisao(fila, 'rev', agora, Math.random, 'erroMedico-1');
  const item = entrada.itens[0];
  assert.equal(entrada.itens.length, 1, 'o Erro médico não completa com parecidas');
  assert.deepEqual(item.escolhaPartida, errada);
  assert.equal(item.registros.length, a.registros.length);
  assert.ok(item.perguntas.every(p => !('correta' in p) && !('explicacao' in p)), 'sem gabarito no aparelho');
  const certo = responderRevisaoPerfil({ revisao: { entrada } }, 'rev', { itemId: item.id, versao: item.versao, escolha: a.perguntas.map(p => p.correta) }, [], agora);
  const r = certo.revisao.entrada.resultados[0];
  assert.equal(r.acertou, true);
  assert.equal(r.etapas.length, 3);
  assert.throws(() => responderRevisaoPerfil({ revisao: { entrada } }, 'rev', { itemId: item.id, versao: item.versao, escolha: 'l1' }, [], agora), /Resposta inválida/);
});

test('v2: o Erro médico encerrado no jogo gera a tentativa para a fila', () => {
  const a = obterAuditoria(BANCO_REVISAO_ERRO[0].id);
  let p = { uid: 'u', role: 'admin', tickets: 5, pontuacaoTotal: 0, dataUltimoLogin: agora.slice(0, 10), ofensiva: { dias: 1, ultimoDia: agora.slice(0, 10) }, missoesDiarias: [{ id: 'login' }] };
  const entradaId = crypto.randomUUID();
  p = executarPedidoSupabase(p, { acao: 'iniciarAuditoria', auditoriaId: a.id, entradaId }, { agora: new Date(agora) }).perfil;
  const respostas = a.perguntas.map((q, i) => i === 0 ? q.alternativas.find(x => x.id !== q.correta).id : q.correta);
  const { eventos } = executarPedidoSupabase(p, { acao: 'responderAuditoria', entradaId, respostas }, { agora: new Date(agora) });
  const tentativa = eventos.find(e => e.kind === 'resposta');
  assert.equal(tentativa.data.modo, 'erroMedico');
  assert.equal(tentativa.data.acertou, false);
});

test('v2: pergunta parecida errada entra na fila; o terceiro acerto seguido domina e paga 40 XP uma vez', () => {
  const q = BANCO_QUIZ[0];
  const parecidaErrada = { modo: 'quiz', itemId: BANCO_QUIZ[1].id, versao: BANCO_QUIZ[1].versao, tema: BANCO_QUIZ[1].tema, parecida: true,
    acertou: false, escolha: 'x', data: '2026-10-18T13:00:00.000Z', revisaoId: 'rev-antiga', sequencia: 0, proximaRevisao: '2026-10-18T13:00:00.000Z' };
  const fila = selecionarFilaRevisao([erroQuiz(q)], [parecidaErrada], agora);
  assert.ok(fila.itens.some(i => i.itemId === BANCO_QUIZ[1].id), 'a parecida errada voltou como erro');
  // Item com dois acertos seguidos: o próximo acerto domina.
  const entrada = { id: 'rev', itens: [{ id: q.id, modo: 'quiz', versao: q.versao, tema: q.tema, sequenciaAnterior: 2, opcoes: q.opcoes }], resultados: [] };
  const base = { pontuacaoTotal: xpParaNivel(10), tickets: 0, role: 'jogador', revisao: { entrada } };
  const tentativas = [erroQuiz(q)];
  let p = operarRevisaoSupabase(base, { acao: 'responderRevisao', revisaoId: 'rev', itemId: q.id, versao: q.versao, escolha: q.correta }, tentativas, [], [], agora);
  assert.equal(p.pontuacaoTotal, xpParaNivel(10) + XP_DOMINIO);
  assert.equal(p.tickets, 0);
  assert.equal(p.revisao.entrada.resultados[0].dominou, true);
  // Errou, voltou a dominar: não paga de novo.
  const outra = { ...p, revisao: { ...p.revisao, entrada: { ...entrada, id: 'rev2' } } };
  p = operarRevisaoSupabase(outra, { acao: 'responderRevisao', revisaoId: 'rev2', itemId: q.id, versao: q.versao, escolha: q.correta }, tentativas, [], [], agora);
  assert.equal(p.pontuacaoTotal, xpParaNivel(10) + XP_DOMINIO);
});

// API com banco falso: perfil com uma resposta errada confirmada, cache e reportes em memória.
function apiExplicacao(explicar) {
  const q = BANCO_QUIZ[0];
  const errada = q.opcoes.find(o => o.id !== q.correta).id;
  const perfil = { role: 'admin', revisao: { entrada: { id: 'rev', itens: [], resultados: [
    { modo: 'quiz', itemId: q.id, versao: q.versao, acertou: false, escolha: errada, escolhaPartida: errada }] } } };
  const cache = new Map();
  const reportes = [];
  const pedidosLlm = [];
  const database = async (path, options = {}) => {
    const url = new URL('https://test/' + path);
    if (url.pathname === '/cacamed_player_state') return [{ profile: perfil, version: 1 }];
    if (url.pathname === '/cacamed_explicacoes' && options.method === 'POST') { const b = JSON.parse(options.body); cache.set(b.chave, b); return null; }
    if (url.pathname === '/cacamed_explicacoes') { const c = cache.get(url.searchParams.get('chave').slice(3)); return c ? [c] : []; }
    if (url.pathname === '/cacamed_explicacoes_reportes') { reportes.push(JSON.parse(options.body)); return null; }
    throw new Error('Pedido inesperado: ' + path);
  };
  const api = criarApiSupabase({ database, identity: async () => ({ uid: 'admin' }), ranking: async () => [],
    explicar: explicar && (async m => { pedidosLlm.push(m); return explicar(m); }) });
  const call = async pedido => (await api(new Request('https://test/api', { method: 'POST', headers: { Authorization: 'Bearer x' }, body: JSON.stringify(pedido) }))).json();
  return { q, call, cache, reportes, pedidosLlm };
}

test('v2: explicação da LLM vem do servidor, sem dado pessoal, e fica em cache por item e escolha', async () => {
  const f = apiExplicacao(async () => 'A alternativa marcada descreve outra função; a correta resume o papel descrito no enunciado.');
  const pedido = { acao: 'explicarRevisao', revisaoId: 'rev', itemId: f.q.id, versao: f.q.versao };
  const primeira = await f.call(pedido);
  assert.match(primeira.resultado.texto, /alternativa marcada/);
  assert.equal(primeira.resultado.aviso, 'Explicação gerada por IA. Confira a fonte.');
  assert.ok(primeira.resultado.fallback);
  const enviado = JSON.stringify(f.pedidosLlm[0]);
  assert.ok(!enviado.includes('admin') && enviado.includes(f.q.enunciado), 'só o conteúdo do item vai para a LLM');
  await f.call(pedido);
  assert.equal(f.pedidosLlm.length, 1, 'a segunda vez sai do cache');
  await f.call({ acao: 'reportarExplicacao', chave: primeira.resultado.chave, motivo: 'texto confuso' });
  assert.equal(f.reportes[0].chave, primeira.resultado.chave);
});

test('v2: sem LLM configurada, com falha ou texto inválido, volta a explicação revisada do banco', async () => {
  for (const explicar of [undefined, async () => { throw new Error('cota'); }, async () => 'Veja https://exemplo.com']) {
    const f = apiExplicacao(explicar);
    const r = await f.call({ acao: 'explicarRevisao', revisaoId: 'rev', itemId: f.q.id, versao: f.q.versao });
    assert.equal(r.resultado.texto, null);
    assert.equal(r.resultado.fallback, f.q.explicacao);
    assert.equal(f.cache.size, 0);
  }
  const f = apiExplicacao();
  const certo = await f.call({ acao: 'explicarRevisao', revisaoId: 'rev', itemId: 'outro', versao: 1 });
  assert.match(certo.erro, /Responda o item/);
});
