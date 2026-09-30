import test from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_QUIZ, BANCO_FRASES } from './bancoTreinos.js';
import { chaveItemRevisao, selecionarFilaRevisao, criarEntradaRevisao, responderRevisaoPerfil, encerrarRevisaoPerfil } from './revisaoInteligente.js';

const agora = '2026-09-28T12:00:00.000Z';
const erro = (q = BANCO_QUIZ[0], rodadaId = 'a', data = '2026-09-20T12:00:00.000Z') => ({ modo: q.opcoes ? 'quiz' : 'verdadeMentira', itemId: q.id, versao: q.versao, tema: q.tema, acertou: false, rodadaId, data });
const base = itens => ({ pontuacaoTotal: 490, tickets: 9, missoesDiarias: [{ id: 'exemplo', progresso: 0 }],
  revisao: { entrada: criarEntradaRevisao(selecionarFilaRevisao(itens, [], agora), 'sessao', agora) } });
const responder = (perfil, historico = [], data = agora, correta = true) => {
  const item = perfil.revisao.entrada.itens[perfil.revisao.entrada.resultados.length];
  const q = (item.modo === 'quiz' ? BANCO_QUIZ : BANCO_FRASES).find(r => r.id === item.id);
  const escolha = item.modo === 'quiz' ? correta ? q.correta : q.opcoes.find(o => o.id !== q.correta).id : correta ? q.verdadeira : !q.verdadeira;
  return responderRevisaoPerfil(perfil, perfil.revisao.entrada.id, { itemId: item.id, versao: item.versao, escolha }, historico, data);
};

test('fila deduplica tentativas, ignora versões ausentes e prioriza nunca revisados/mais erros', () => {
  const primeiro = erro(BANCO_QUIZ[0]);
  const historico = [primeiro, { ...primeiro }, erro(BANCO_QUIZ[1]), erro(BANCO_QUIZ[1], 'b'),
    { ...primeiro, itemId: 'removido' }, { ...primeiro, versao: 999 }, ...BANCO_QUIZ.slice(2, 9).map(q => erro(q))];
  const revisoes = [{ ...primeiro, data: '2026-09-21T12:00:00.000Z', proximaRevisao: '2026-09-22T12:00:00.000Z', sequencia: 1 }];
  const fila = selecionarFilaRevisao(historico, revisoes, agora);
  assert.equal(fila.itens.length, 5);
  assert.equal(fila.resumo.disponiveis, 9);
  assert.equal(fila.itens[0].itemId, BANCO_QUIZ[1].id);
  assert.equal(fila.itens[0].erros, 2);
  assert.ok(fila.itens.every(r => r.itemId !== primeiro.itemId));
  assert.equal(new Set(fila.itens.map(chaveItemRevisao)).size, 5);
});

test('sessão não revela gabarito, usa até cinco itens e rejeita fila vazia', () => {
  const entrada = base([erro(), erro(BANCO_FRASES[0])]).revisao.entrada;
  assert.equal(entrada.itens.length, 2);
  for (const item of entrada.itens) {
    assert.ok(!('correta' in item)); assert.ok(!('verdadeira' in item)); assert.ok(!('explicacao' in item));
  }
  assert.throws(() => criarEntradaRevisao(selecionarFilaRevisao([], [], agora), 's'), /Nenhum item/);
});

test('acertos programam intervalos e respeitam teto semanal sem alterar economia; tipos são estritos', () => {
  let historico = [];
  let data = agora;
  for (const [i, dias] of [1, 6, 7].entries()) {
    const entrada = criarEntradaRevisao(selecionarFilaRevisao([erro()], historico, data), `s${i}`, data);
    let perfil = { ...base([erro()]), revisao: { entrada } };
    perfil = responder(perfil, historico, data);
    const resultado = perfil.revisao.entrada.resultados[0];
    assert.equal(Date.parse(resultado.proximaRevisao) - Date.parse(data), dias * 86400000);
    assert.equal(resultado.sequencia, i + 1);
    assert.equal(perfil.pontuacaoTotal, 490); assert.equal(perfil.tickets, 9); assert.equal(perfil.missoesDiarias[0].progresso, 0);
    historico = [...historico, resultado]; data = resultado.proximaRevisao;
  }
  const antiga = { ...erro(), data: '2026-09-15T12:00:00.000Z', proximaRevisao: '2026-09-16T12:00:00.000Z', sequencia: 1 };
  const entrada = criarEntradaRevisao(selecionarFilaRevisao([erro(BANCO_QUIZ[0], 'a', '2026-09-14T12:00:00.000Z')], [antiga], agora), 's', agora);
  assert.equal(responder({ ...base([erro()]), revisao: { entrada } }, [antiga]).revisao.entrada.resultados[0].proximaRevisao, '2026-10-01T12:00:00.000Z');
  const p = base([erro(BANCO_FRASES[0])]); const item = p.revisao.entrada.itens[0];
  assert.throws(() => responderRevisaoPerfil(p, 'sessao', { itemId: item.id, versao: 999, escolha: true }), /sessão mudou/);
  assert.throws(() => responderRevisaoPerfil(p, 'sessao', { itemId: item.id, versao: item.versao, escolha: 'false' }), /Alternativa inválida/);
});

test('dois erros em sete dias respeitam teto de frequência, sem repetir na sessão', () => {
  const primeiro = responder(base([erro()]), [], agora, false);
  const r = primeiro.revisao.entrada.resultados[0];
  assert.equal(r.proximaRevisao, agora);
  const segundoBase = { ...primeiro, revisao: { ...primeiro.revisao, entrada: criarEntradaRevisao(selecionarFilaRevisao([erro()], [r], agora), 'segunda', agora) } };
  const segundo = responder(segundoBase, [r], agora, false);
  const rr = segundo.revisao.entrada.resultados[0];
  assert.equal(rr.sequencia, 0);
  assert.equal(rr.proximaRevisao, '2026-10-05T12:00:00.000Z');
  const fila = selecionarFilaRevisao([erro()], [r, rr], agora);
  assert.equal(fila.resumo.disponiveis, 0); assert.equal(fila.resumo.aguardando, 1);
  assert.equal(selecionarFilaRevisao([erro()], [r, rr], rr.proximaRevisao).resumo.disponiveis, 1);
});

test('novo erro reinicia sequência; acerto posterior em jogo reduz frequência', () => {
  const r = { ...erro(), data: '2026-09-23T12:00:00.000Z', sequencia: 3, proximaRevisao: '2026-09-30T12:00:00.000Z' };
  const novaTentativa = erro(BANCO_QUIZ[0], 'novo', '2026-09-28T11:00:00.000Z');
  const fila = selecionarFilaRevisao([erro(), novaTentativa], [r], agora);
  assert.equal(fila.resumo.disponiveis, 1); assert.equal(fila.itens[0].sequencia, 0);
  const acertou = { ...novaTentativa, rodadaId: 'acerto', acertou: true };
  assert.equal(selecionarFilaRevisao([erro(), acertou], [], agora).resumo.disponiveis, 0);
});

test('reenvio reordenado retorna estado salvo; mudança real, outra sessão ou item futuro são rejeitados', () => {
  const inicial = base([erro(), erro(BANCO_QUIZ[1])]);
  const parcial = responder(inicial);
  const r = parcial.revisao.entrada.resultados[0];
  const pedido = { escolha: r.escolha, versao: r.versao, itemId: r.itemId };
  assert.equal(responderRevisaoPerfil(parcial, 'sessao', pedido), parcial);
  assert.throws(() => responderRevisaoPerfil(parcial, 'sessao', { ...pedido, escolha: 'alterada' }), /já foi confirmada/);
  assert.throws(() => responderRevisaoPerfil(parcial, 'outra', pedido), /Sessão não encontrada/);
  assert.throws(() => responderRevisaoPerfil(inicial, 'sessao', { ...pedido, itemId: inicial.revisao.entrada.itens[1].id }), /sessão mudou/);
  const final = responder(parcial);
  assert.equal(final.revisao.sessoes, 1); assert.equal(final.revisao.entrada.relatorio.respondidos, 2);
  assert.equal(responderRevisaoPerfil(final, 'sessao', pedido), final);
});

test('encerramento parcial preserva respostas e não programa itens não respondidos', () => {
  const parcial = responder(base([erro(), erro(BANCO_QUIZ[1])]));
  const encerrado = encerrarRevisaoPerfil(parcial, 'sessao', agora);
  assert.equal(encerrado.revisao.entrada.relatorio.respondidos, 1);
  assert.equal(encerrado.revisao.entrada.abandonada, true);
  assert.equal(encerrado.revisao.entrada.resultados.length, 1);
  assert.equal(encerrarRevisaoPerfil(encerrado, 'sessao'), encerrado);
});
