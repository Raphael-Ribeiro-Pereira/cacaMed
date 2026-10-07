import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoDaCasa, estimarXpCruzadinha, nivelDoTopico, palavraDaCasa, palavrasDaGrade, palavrasResolvidas, tamanhoDaPalavra } from './cruzadinha.js';
import { gerarTabuleiro } from './motorTabuleiro.js';

// OSSO na horizontal cruzando SOL na vertical pela segunda letra.
const casa = (linha, coluna, extra) => ({ linha, coluna, vazia: false, ...extra });
const grade = [
  [{ linha: 0, coluna: 0, vazia: true }, casa(0, 1, { letraCerta: 'S', numero: 2, inicioVertical: true, palavraInicialVertical: 'SOL', idVertical: 'v1', pertenceVertical: true }), { linha: 0, coluna: 2, vazia: true }, { linha: 0, coluna: 3, vazia: true }],
  [casa(1, 0, { letraCerta: 'O', numero: 1, inicioHorizontal: true, palavraInicialHorizontal: 'OSSO', idHorizontal: 'h1', pertenceHorizontal: true }),
    casa(1, 1, { letraCerta: 'O', idHorizontal: 'h1', pertenceHorizontal: true, idVertical: 'v1', pertenceVertical: true }),
    casa(1, 2, { letraCerta: 'S', idHorizontal: 'h1', pertenceHorizontal: true }), casa(1, 3, { letraCerta: 'O', idHorizontal: 'h1', pertenceHorizontal: true })],
  [{ linha: 2, coluna: 0, vazia: true }, casa(2, 1, { letraCerta: 'L', idVertical: 'v1', pertenceVertical: true }), { linha: 2, coluna: 2, vazia: true }, { linha: 2, coluna: 3, vazia: true }],
];

test('lista as palavras na ordem dos números com as casas de cada uma', () => {
  const palavras = palavrasDaGrade(grade);
  assert.deepEqual(palavras.map(p => [p.numero, p.d, p.palavra]), [[1, 'horizontal', 'OSSO'], [2, 'vertical', 'SOL']]);
  assert.deepEqual(palavras[0].casas, ['1-0', '1-1', '1-2', '1-3']);
  assert.deepEqual(palavras[1].casas, ['0-1', '1-1', '2-1']);
  assert.equal(palavraDaCasa(palavras, grade[1][1], 'vertical').palavra, 'SOL');
  assert.equal(palavraDaCasa(palavras, grade[1][2], 'vertical').palavra, 'OSSO');
});

test('marca a casa certa, a letra de outra posição da palavra e a letra que não existe', () => {
  assert.equal(estadoDaCasa(grade, {}, grade[1][0]), '');
  assert.equal(estadoDaCasa(grade, { '1-0': 'o' }, grade[1][0]), 'ok');
  assert.equal(estadoDaCasa(grade, { '1-0': 'S' }, grade[1][0]), 'near');
  assert.equal(estadoDaCasa(grade, { '1-1': 'L' }, grade[1][1]), 'near');
  assert.equal(estadoDaCasa(grade, { '1-0': 'X' }, grade[1][0]), 'bad');
});

test('só considera resolvida a palavra com todas as letras certas', () => {
  const palavras = palavrasDaGrade(grade);
  assert.deepEqual(palavrasResolvidas(palavras, grade, { '0-1': 'S', '1-1': 'O' }), []);
  assert.deepEqual(palavrasResolvidas(palavras, grade, { '0-1': 'S', '1-1': 'O', '2-1': 'L' }).map(p => p.palavra), ['SOL']);
});

test('nível do tópico e tamanho da palavra seguem as regras do jogo', () => {
  assert.deepEqual(nivelDoTopico(0), { nivel: 0, pct: 0 });
  assert.deepEqual(nivelDoTopico(1000), { nivel: 2, pct: 0 });
  assert.deepEqual(nivelDoTopico(2500), { nivel: 2, pct: 50 });
  assert.equal(tamanhoDaPalavra('VEIA CAVA'), '4, 4');
  assert.equal(tamanhoDaPalavra('FEMUR'), '5');
});

test('estimativa de XP cresce com o nível e respeita o mínimo de 10', () => {
  const topico = Array.from({ length: 15 }, (_, i) => ({ palavra: 'CLAVICULA'.slice(0, 5 + (i % 4)) }));
  const nivel0 = estimarXpCruzadinha(topico, 0);
  assert.ok(nivel0 > 100 && nivel0 % 10 === 0);
  assert.ok(estimarXpCruzadinha(topico, 6) > nivel0);
  assert.equal(estimarXpCruzadinha([], 3), 0);
});

test('funciona sobre uma grade gerada pelo motor', () => {
  const banco = { 'ANATOMIA-OSSOS': ['FEMUR', 'TIBIA', 'FIBULA', 'UMERO', 'RADIO', 'ULNA', 'PATELA', 'ESTERNO'].map((palavra, i) => ({ palavra, numero: i + 1, dificuldade: 0, dicaBasica: 'Osso.' })) };
  const { gradePronta } = gerarTabuleiro(banco, 'ANATOMIA-OSSOS', 0);
  const palavras = palavrasDaGrade(gradePronta);
  assert.ok(palavras.length >= 2);
  for (const p of palavras) assert.equal(p.casas.length, p.palavra.replace(/\s/g, '').length);
  const tudo = Object.fromEntries(gradePronta.flat().filter(c => !c.vazia && c.letraCerta !== ' ').map(c => [`${c.linha}-${c.coluna}`, c.letraCerta]));
  assert.equal(palavrasResolvidas(palavras, gradePronta, tudo).length, palavras.length);
});
