import test from 'node:test';
import assert from 'node:assert/strict';
import { DOENCAS, executarBatalha, obterDoenca } from './batalha.js';
import { BANCO_BATALHA_REVISAO, respostasBatalha } from './batalhaRevisao.js';
import { criarEntradaRevisao, responderRevisaoPerfil, selecionarFilaRevisao } from './revisaoInteligente.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';

const ID = '33333333-3333-4333-8333-333333333333';
const REV = '44444444-4444-4444-8444-444444444444';
const admin = extra => ({ uid: 'a', role: 'admin', pontuacaoTotal: 0, tickets: 2, xpTopicos: {}, economia: { versao: 2, ultimoNivelPremiado: 1 }, batalha: { tutorial: true }, ...extra });

// Hipótese errada, terapia ineficaz e nenhuma resposta à complicação até perder.
function jogarMal(perfil, doencaId) {
  const d = obterDoenca(doencaId);
  const errada = d.cura === 'bacti' ? 'proto' : 'bacti';
  const acoes = [{ t: 'hipotese', id: d.dif[0] }, { t: 'golpe', id: errada }, { t: 'hipotese', id: d.id }];
  let estado = executarBatalha(d, 'pulsa', acoes);
  while (!estado.fim) {
    const exame = d.kit.find(id => !estado.exams.includes(id));
    acoes.push(estado.cd[errada] === 0 ? { t: 'golpe', id: errada } : exame ? { t: 'exame', id: exame } : { t: 'golpe', id: 'suporte' });
    estado = executarBatalha(d, 'pulsa', acoes);
  }
  const p = executarPedidoSupabase(perfil, { acao: 'iniciarBatalha', modo: 'historia', doencaId, pet: 'pulsa', entradaId: ID }).perfil;
  return executarPedidoSupabase(p, { acao: 'acaoBatalha', entradaId: ID, acoes });
}

test('banco: três itens por doença, alternativas únicas e tema sem entregar o diagnóstico', () => {
  assert.equal(BANCO_BATALHA_REVISAO.length, DOENCAS.length * 3);
  for (const q of BANCO_BATALHA_REVISAO) {
    const d = obterDoenca(q.doencaId);
    assert.ok(q.opcoes.length >= 3 && q.opcoes.length <= 4, q.id);
    assert.equal(new Set(q.opcoes.map(o => o.id)).size, q.opcoes.length, q.id);
    assert.equal(new Set(q.opcoes.map(o => o.texto)).size, q.opcoes.length, q.id);
    assert.ok(q.opcoes.some(o => o.id === q.correta), q.id);
    assert.ok(q.explicacao && q.fonte.includes(', p. '), q.id);
    assert.ok(!q.tema.toLowerCase().includes(d.nome.toLowerCase()), q.id);
    if (q.tipo === 'diagnostico') assert.ok(!q.enunciado.toLowerCase().includes(d.nome.toLowerCase()), q.id);
  }
});

test('erros da batalha entram na fila e são revisados como quiz', () => {
  const { perfil, eventos } = jogarMal(admin(), 'malaria');
  const respostas = eventos.filter(e => e.kind === 'resposta').map(e => e.data);
  assert.deepEqual(respostas.map(r => [r.itemId, r.acertou]), [
    ['batalha-malaria-diagnostico', false], ['batalha-malaria-conduta', false], ['batalha-malaria-complicacao', false]]);
  assert.ok(respostas.every(r => r.modo === 'batalha' && r.rodadaId === ID && r.versao === 1 && r.data === perfil.batalha.entrada.encerradoEm));
  const depois = new Date(Date.parse(perfil.batalha.entrada.encerradoEm) + 1000).toISOString();
  const fila = selecionarFilaRevisao(respostas, [], depois);
  assert.equal(fila.itens.length, 3);
  const entrada = criarEntradaRevisao(fila, REV, depois, () => 0);
  const item = entrada.itens.find(i => i.id === 'batalha-malaria-conduta');
  assert.ok(!('correta' in item), 'o gabarito não vai para o navegador');
  let revisado = { ...perfil, revisao: { entrada } };
  for (const atual of entrada.itens) {
    const original = BANCO_BATALHA_REVISAO.find(q => q.id === atual.id);
    revisado = responderRevisaoPerfil(revisado, REV, { itemId: atual.id, versao: atual.versao, escolha: original.correta }, [], depois);
  }
  assert.equal(revisado.revisao.entrada.relatorio.acertos, 3);
  assert.equal(revisado.pontuacaoTotal, perfil.pontuacaoTotal, 'revisão não concede XP');
  assert.throws(() => responderRevisaoPerfil({ ...perfil, revisao: { entrada } }, REV, { itemId: entrada.itens[0].id, versao: 1, escolha: 'x' }, [], depois), /Alternativa/);
});

test('treinamento, abandono e conteúdo alterado não geram itens de revisão', () => {
  const base = { id: ID, doencaId: 'pneumo', versao: 1, pet: 'cocobi', acoes: [], encerradoEm: '2026-10-06T12:00:00.000Z' };
  assert.deepEqual(respostasBatalha({ ...base, modo: 'tutorial', relatorio: { resultado: 'vitoria' } }), []);
  assert.deepEqual(respostasBatalha({ ...base, modo: 'x1', relatorio: { resultado: 'abandono' } }), []);
  assert.deepEqual(respostasBatalha({ ...base, modo: 'x1', versao: 0, relatorio: { resultado: 'derrota' } }), []);
  assert.deepEqual(respostasBatalha({ ...base, modo: 'x1' }), [], 'batalha aberta');
});
