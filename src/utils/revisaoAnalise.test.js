import test from 'node:test';
import assert from 'node:assert/strict';
import { analisarCarta, medidasDaCarta } from './revisaoAnalise.js';

const item = (extra) => ({ modo: 'quiz', enunciado: 'Qual antibiótico?', tema: 'Farmacologia · Antibióticos', opcoes: [{ id: 'a', texto: 'Amoxicilina' }, { id: 'b', texto: 'Vancomicina' }],
  correta: 'a', escolha: 'b', acertou: false, esperadoMs: 10000, ...extra });

test('relatório da carta: pressa, dúvida, conceito não firme e acerto com dúvida', () => {
  const itens = [
    item({ tempoMs: 5000, indecisaoMs: 0 }),
    item({ tempoMs: 18000, indecisaoMs: 8000 }),
    item({ tempoMs: 11000, indecisaoMs: 1000 }),
    item({ acertou: true, escolha: 'a', tempoMs: 16000, indecisaoMs: 6000 }),
    item({ acertou: true, escolha: 'a', tempoMs: 9000, indecisaoMs: 0 }),
  ];
  const linhas = analisarCarta(itens);
  assert.match(linhas[0], /pressa/);
  assert.match(linhas[1], /dúvida entre alternativas.*|8,0 s além/);
  assert.match(linhas[1], /“Vancomicina”/);
  assert.match(linhas[2], /não está firme/);
  assert.match(linhas[3], /não está automático/);
  assert.match(linhas.at(-1), /Farmacologia/);
  const m = medidasDaCarta(itens);
  assert.equal(m.acertos, 2);
  assert.equal(m.indecisaoMs, 15000);
  assert.equal(m.indecisaoPct, Math.round(15000 / 59000 * 100));
  assert.equal(m.maisDuvida.indecisaoMs, 8000);
});

test('relatório da carta: tudo certo no ritmo, e erros sem tempo medido', () => {
  assert.match(analisarCarta([item({ acertou: true, escolha: 'a', tempoMs: 9000, indecisaoMs: 0 })])[0], /acertou tudo/);
  assert.match(analisarCarta([item({})])[0], /Sem o tempo/);
});
