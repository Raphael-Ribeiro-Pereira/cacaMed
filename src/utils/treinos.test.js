import test from 'node:test';
import assert from 'node:assert/strict';
import { BANCO_QUIZ, BANCO_FRASES } from './bancoTreinos.js';
import { criarEntradaTreino, responderTreinoPerfil } from './treinos.js';
import { concederRecompensa, nivelPorXP, migrarEconomia } from './economia.js';
import { criarMissoesDiarias } from './missoes.js';

const perfil = entrada => ({ pontuacaoTotal: 0, tickets: 0, missoesDiarias: [], treinos: { [entrada.modo]: { entrada } } });
const resposta = (entrada, i, acertar = true) => {
  const item = entrada.itens[i];
  const original = (entrada.modo === 'quiz' ? BANCO_QUIZ : BANCO_FRASES).find(q => q.id === item.id);
  const escolha = entrada.modo === 'quiz' ? (acertar ? original.correta : item.opcoes.find(o => o.id !== original.correta).id) : (acertar ? original.verdadeira : !original.verdadeira);
  return { itemId: item.id, escolha };
};
function fecharQuiz(base, certos) {
  const entrada = base.treinos.quiz.entrada;
  let atual = base;
  const respostas = [];
  for (let i = 0; i < 5; i++) { respostas.push(resposta(entrada, i, i < certos)); atual = responderTreinoPerfil(atual, 'quiz', entrada.id, [...respostas]); }
  return atual;
}

test('progressão global calcula faixas e soma tickets de todos os níveis atravessados', () => {
  assert.deepEqual([0, 499, 500, 1999, 2000, 4500].map(nivelPorXP), [1, 1, 2, 2, 3, 4]);
  const novo = concederRecompensa({ pontuacaoTotal: 0, tickets: 0 }, 4500);
  assert.equal(novo.tickets, 2 + 3 + 4);
  assert.equal(concederRecompensa(novo, 0).tickets, 9);
  const antigo = migrarEconomia({ pontuacaoTotal: 5322, tickets: 7 });
  assert.equal(antigo.tickets, 7);
  assert.equal(concederRecompensa(antigo, 100).tickets, 7);
});

test('banco contém opções distintas, gabaritos válidos, fontes e IDs únicos', () => {
  assert.equal(new Set([...BANCO_QUIZ, ...BANCO_FRASES].map(q => q.id)).size, BANCO_QUIZ.length + BANCO_FRASES.length);
  for (const q of BANCO_QUIZ) { assert.equal(q.opcoes.length, 4); assert.equal(new Set(q.opcoes.map(o => o.texto)).size, 4); assert.ok(q.opcoes.some(o => o.id === q.correta)); }
  for (const q of [...BANCO_QUIZ, ...BANCO_FRASES]) { assert.ok(q.explicacao); assert.match(q.fonte, /^https:\/\//); }
});

test('sorteio de frases tem cinco conceitos diferentes e todas as distribuições de 1 a 4 verdades', () => {
  const numeros = new Set();
  let semente = 12345;
  const sortear = () => { semente = (semente * 1664525 + 1013904223) >>> 0; return semente / 4294967296; };
  for (let i = 0; i < 100; i++) {
    const entrada = criarEntradaTreino('verdadeMentira', '', 'teste', null, sortear);
    const originais = entrada.itens.map(q => BANCO_FRASES.find(f => f.id === q.id));
    assert.equal(entrada.itens.length, 5);
    assert.equal(new Set(originais.map(q => q.conceito)).size, 5);
    const verdades = originais.filter(q => q.verdadeira).length;
    assert.ok(verdades >= 1 && verdades <= 4); numeros.add(verdades);
    assert.ok(entrada.itens.every(q => !('verdadeira' in q) && !('correta' in q)));
  }
  assert.equal(numeros.size, 4);
});

test('quiz registra resposta parcial, rejeita edição e só recompensa conclusão', () => {
  const entrada = criarEntradaTreino('quiz', 'teoria', 'teste');
  const inicial = perfil(entrada);
  const parcial = responderTreinoPerfil(inicial, 'quiz', 'teste', [resposta(entrada, 0)]);
  assert.equal(parcial.pontuacaoTotal, 0);
  assert.equal(parcial.treinos.quiz.entrada.resultados[0].acertou, true);
  assert.throws(() => responderTreinoPerfil(parcial, 'quiz', 'teste', [resposta(entrada, 0, false), resposta(entrada, 1)]), /outra aba/);
  assert.throws(() => responderTreinoPerfil(inicial, 'quiz', 'teste', [{ itemId: entrada.itens[0].id, escolha: 'inventada' }]), /Alternativa/);
  const final = fecharQuiz(inicial, 1);
  assert.equal(final.pontuacaoTotal, 20); assert.equal(final.treinos.quiz.medidor, 1);
  assert.equal(responderTreinoPerfil(final, 'quiz', 'teste', final.treinos.quiz.entrada.respostas).pontuacaoTotal, 20);
});

test('quiz compara conteúdo das respostas independentemente da ordem dos campos do transporte', () => {
  const entrada = criarEntradaTreino('quiz', 'teoria', 'transporte');
  const primeira = resposta(entrada, 0);
  const parcial = responderTreinoPerfil(perfil(entrada), 'quiz', entrada.id, [primeira]);
  const reordenada = { escolha: primeira.escolha, itemId: primeira.itemId };
  assert.equal(responderTreinoPerfil(parcial, 'quiz', entrada.id, [reordenada]), parcial);
  const segunda = responderTreinoPerfil(parcial, 'quiz', entrada.id, [reordenada, resposta(entrada, 1)]);
  assert.equal(segunda.treinos.quiz.entrada.respostas.length, 2);
  assert.equal(segunda.pontuacaoTotal, 0);
  assert.throws(() => responderTreinoPerfil(segunda, 'quiz', entrada.id,
    [resposta(entrada, 0, false), resposta(entrada, 1), resposta(entrada, 2)]), /outra aba/);
  assert.throws(() => responderTreinoPerfil(segunda, 'quiz', 'outra-rodada', []), /Rodada não encontrada/);
});

test('verdade ou mentira reenvia campos reordenados sem pagar novamente e preserva booleanos', () => {
  const entrada = criarEntradaTreino('verdadeMentira', '', 'transporte');
  const respostas = entrada.itens.map((_, i) => resposta(entrada, i));
  const final = responderTreinoPerfil(perfil(entrada), 'verdadeMentira', entrada.id, respostas);
  assert.equal(responderTreinoPerfil(final, 'verdadeMentira', entrada.id,
    respostas.map(({ itemId, escolha }) => ({ escolha, itemId }))), final);
  assert.throws(() => responderTreinoPerfil(perfil(entrada), 'verdadeMentira', entrada.id,
    respostas.map(r => ({ ...r, escolha: String(r.escolha) }))), /Selecione|Alternativa/);
});

test('rodadas de quiz compartilham contador entre teoria e casos; modos não misturam contadores', () => {
  let atual = fecharQuiz(perfil(criarEntradaTreino('quiz', 'teoria', 'a')), 0);
  assert.equal(atual.treinos.quiz.medidor, 0);
  atual.treinos.quiz.entrada = criarEntradaTreino('quiz', 'teoria', 'b');
  atual = fecharQuiz(atual, 1);
  atual.treinos.quiz.entrada = criarEntradaTreino('quiz', 'casos', 'c');
  atual = fecharQuiz(atual, 5);
  assert.equal(atual.pontuacaoTotal, 145); assert.equal(atual.tickets, 1);
  assert.equal(atual.treinos.quiz.medidor, 0);
  const outra = criarEntradaTreino('verdadeMentira', '', 'd');
  atual.treinos.verdadeMentira = { entrada: outra };
  atual = responderTreinoPerfil(atual, 'verdadeMentira', 'd', outra.itens.map((_, i) => resposta(outra, i)));
  assert.equal(atual.tickets, 1); assert.equal(atual.treinos.verdadeMentira.medidor, 1);
});

test('verdade ou mentira avalia seleção e rejeição; zero acertos não gera XP ou marco', () => {
  const entrada = criarEntradaTreino('verdadeMentira', '', 'teste');
  const errado = responderTreinoPerfil(perfil(entrada), 'verdadeMentira', 'teste', entrada.itens.map((_, i) => resposta(entrada, i, false)));
  assert.equal(errado.pontuacaoTotal, 0); assert.equal(errado.treinos.verdadeMentira.medidor, 0);
  const certo = responderTreinoPerfil(perfil(entrada), 'verdadeMentira', 'teste', entrada.itens.map((_, i) => resposta(entrada, i)));
  assert.equal(certo.pontuacaoTotal, 100);
  assert.throws(() => responderTreinoPerfil(perfil(entrada), 'verdadeMentira', 'teste', entrada.itens.map(item => ({ itemId: item.id, escolha: false }))), /Selecione/);
});

test('missões de treino concedem um ticket cada uma e não repetem pagamento', () => {
  let atual = perfil(criarEntradaTreino('quiz', 'teoria', 'a')); atual.missoesDiarias = criarMissoesDiarias();
  atual = fecharQuiz(atual, 5);
  assert.equal(atual.tickets, 1); assert.equal(atual.pontuacaoTotal, 150);
  atual.treinos.quiz.entrada = criarEntradaTreino('quiz', 'teoria', 'b');
  atual = fecharQuiz(atual, 1);
  assert.equal(atual.tickets, 3); assert.equal(atual.pontuacaoTotal, 220);
});
