import test from 'node:test';
import assert from 'node:assert/strict';
import { CASOS, FONTES, MODULOS, avaliarCaso, casosDe, estadoMapa, obterCaso, proximoCaso } from './pacienteDdx.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { resumirHistorico } from './estatisticasPainel.js';

const perfeito = c => ({
  perguntas: c.perguntas.map((q, i) => (q.chave ? i : -1)).filter(i => i >= 0),
  exames: c.exames.map((e, i) => (e.chave ? i : -1)).filter(i => i >= 0),
  hipotese: c.hipoteses.findIndex(h => h.certa),
  conduta: c.conduta.map((x, i) => (x.certa ? i : -1)).filter(i => i >= 0),
});
const admin = extra => ({ uid: 'adm', nome: 'Admin', role: 'admin', pontuacaoTotal: 300, tickets: 2, economia: { versao: 2, ultimoNivelPremiado: 1 }, ...extra });

test('conteúdo do Paciente DDX: ids únicos, uma hipótese certa, conduta com acertos e fontes existentes', () => {
  assert.equal(CASOS.length, 17);
  assert.equal(new Set(CASOS.map(c => c.id)).size, CASOS.length);
  for (const c of CASOS) {
    assert.ok(MODULOS.some(m => m.id === c.modulo), c.id);
    assert.equal(c.hipoteses.filter(h => h.certa).length, 1, c.id);
    assert.ok(c.conduta.some(x => x.certa) && c.conduta.some(x => !x.certa), c.id);
    assert.ok(c.perguntas.some(q => q.chave) || c.exames.some(e => e.chave), c.id);
    assert.ok(c.citacoes.length && c.citacoes.every(x => FONTES[x.fonte] && Number.isInteger(x.pag) && !('trecho' in x)), c.id);
    assert.equal(c.versao, 1);
    assert.equal(c.revisado, false);
  }
  assert.equal(proximoCaso(casosDe(MODULOS[0].id)[0].id).ordem, 2);
});

test('nota do caso: 100 no caminho certo, desconta erros e recusa escolhas inválidas', () => {
  const c = obterCaso('dengue-a');
  assert.equal(avaliarCaso(c, perfeito(c)).nota, 100);
  const errado = { perguntas: [], exames: [], hipotese: c.hipoteses.findIndex(h => !h.certa), conduta: c.conduta.map((x, i) => (x.certa ? -1 : i)).filter(i => i >= 0) };
  assert.equal(avaliarCaso(c, errado).nota, 0);
  const r = avaliarCaso(c, { ...perfeito(c), hipotese: errado.hipotese });
  assert.equal(r.nota, 75);
  assert.equal(r.hipoteseCerta, false);
  assert.throws(() => avaliarCaso(c, { ...perfeito(c), conduta: [] }), /conduta/);
  assert.throws(() => avaliarCaso(c, { ...perfeito(c), perguntas: [0, 0] }), /Perguntas/);
  assert.throws(() => avaliarCaso(c, { ...perfeito(c), exames: [99] }), /Exames/);
  assert.throws(() => avaliarCaso(c, { ...perfeito(c), hipotese: 9 }), /Hipótese/);
});

test('mapa: um caso por vez e o módulo seguinte abre com dois casos feitos; revisão libera tudo', () => {
  const [m1, m2] = MODULOS;
  const a = casosDe(m1.id), b = casosDe(m2.id);
  let mapa = estadoMapa({}, false);
  assert.equal(mapa[a[0].id], 'cur');
  assert.equal(mapa[a[1].id], 'lock');
  assert.equal(mapa[b[0].id], 'lock');
  mapa = estadoMapa({ [a[0].id]: 80, [a[1].id]: 60 }, false);
  assert.equal(mapa[a[0].id], 'done');
  assert.equal(mapa[a[2].id], 'cur');
  assert.equal(mapa[b[0].id], 'open');
  assert.ok(Object.values(estadoMapa({}, true)).every(s => s === 'cur' || s === 'open'));
});

test('servidor: guarda a melhor nota, não paga XP, ignora reenvio e é só do administrador', () => {
  const c = obterCaso('iamcsst');
  const entradaId = crypto.randomUUID();
  const pedido = { acao: 'concluirCasoPaciente', entradaId, casoId: c.id, versao: c.versao, respostas: perfeito(c) };
  const { perfil, eventos } = executarPedidoSupabase(admin(), pedido);
  assert.equal(perfil.pacienteDdx.casos[c.id], 100);
  assert.equal(perfil.pacienteDdx.partidas, 1);
  assert.equal(perfil.pontuacaoTotal, 300);
  assert.equal(perfil.tickets, 2);
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].id, `recibo:${entradaId}`);
  assert.equal(eventos[0].data.titulo, `Paciente DDX · ${c.nome}`);
  assert.equal(eventos[0].data.xp, 0);
  const reenvio = executarPedidoSupabase(perfil, pedido);
  assert.equal(reenvio.perfil.pacienteDdx.partidas, 1);
  assert.equal(reenvio.eventos.length, 0);
  const pior = executarPedidoSupabase(perfil, { ...pedido, entradaId: crypto.randomUUID(), respostas: { ...perfeito(c), hipotese: c.hipoteses.findIndex(h => !h.certa) } }).perfil;
  assert.equal(pior.pacienteDdx.casos[c.id], 100, 'a melhor nota fica');
  assert.equal(pior.pacienteDdx.historico.at(-1).nota, 75);
  const painel = resumirHistorico(eventos.map(e => ({ kind: e.kind, data: e.data, created_at: e.data.data })));
  assert.equal(painel.recentes[0].titulo, `Paciente DDX · ${c.nome}`);
  assert.throws(() => executarPedidoSupabase(admin({ role: 'jogador' }), { ...pedido, entradaId: crypto.randomUUID() }), /administrador/);
  assert.throws(() => executarPedidoSupabase(admin(), { ...pedido, entradaId: crypto.randomUUID(), versao: 2 }), /versão/);
});
