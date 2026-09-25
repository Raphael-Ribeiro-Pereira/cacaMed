import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarTabuleiro } from './motorTabuleiro.js';

test('busca de grades preserva palavras e melhora a qualidade da primeira candidata', () => {
  const banco = { OSSOS: ['ATLAS', 'TALUS', 'ULNA', 'SACRO', 'RADIO', 'COCCIX', 'UMERO', 'FEMUR', 'TIBIA', 'FIBULA', 'ESCAPULA', 'CLAVICULA', 'PATELA', 'CARPO', 'TARSO'].map(palavra => ({ palavra, dificuldade: 0 })) };
  const original = Math.random;
  const qualidade = m => m.densidade * 100 + m.intersecoes * 3 - m.area * .1;
  try {
    Math.random = () => .5;
    const base = gerarTabuleiro(banco, 'OSSOS', 0, { tentativas: 1 }).metricas;
    const melhor = gerarTabuleiro(banco, 'OSSOS').metricas;
    assert.ok(melhor.palavras >= base.palavras);
    if (melhor.palavras === base.palavras) assert.ok(qualidade(melhor) >= qualidade(base));
    assert.ok(melhor.intersecoes >= melhor.palavras - 1);
  } finally { Math.random = original; }
});

test('respostas iguais ocupam entradas distintas sem sobrescrever cruzamentos', () => {
  const banco = { ORTOPEDIA: [
    { palavra: 'TALUS', dicaBasica: 'Osso do tornozelo', dificuldade: 0 },
    { palavra: 'TALUS', dicaBasica: 'Osso do tarso', dificuldade: 0 },
  ] };
  const randomOriginal = Math.random;
  Math.random = () => 0.5;
  try {
    const { gradePronta } = gerarTabuleiro(banco, 'ORTOPEDIA');
    const inicios = gradePronta.flat().filter(c => c.inicioHorizontal || c.inicioVertical);
    assert.equal(inicios.length, 2);
    assert.equal(inicios.reduce((total, c) => total + Number(!!c.inicioHorizontal) + Number(!!c.inicioVertical), 0), 2);
    const entradas = inicios.flatMap(c => [
      ...(c.inicioHorizontal ? [{ id: c.idHorizontal, direcao: 'Horizontal', palavra: c.palavraInicialHorizontal }] : []),
      ...(c.inicioVertical ? [{ id: c.idVertical, direcao: 'Vertical', palavra: c.palavraInicialVertical }] : []),
    ]);
    for (const entrada of entradas) {
      const celulas = gradePronta.flat().filter(c => c[`id${entrada.direcao}`] === entrada.id);
      assert.equal(celulas.map(c => c.letraCerta).join(''), entrada.palavra);
    }
    assert.deepEqual(entradas.map(e => e.palavra), ['TALUS', 'TALUS']);
  } finally {
    Math.random = randomOriginal;
  }
});

test('letra inicial e resposta de cada entrada permanecem coerentes após cruzamentos', () => {
  const banco = { OSSOS: ['ATLAS', 'TALUS', 'ULNA', 'SACRO', 'RADIO', 'COCCIX'].map(palavra => ({ palavra, dicaBasica: palavra, dificuldade: 0 })) };
  const randomOriginal = Math.random;
  Math.random = () => 0.5;
  try {
    const { gradePronta } = gerarTabuleiro(banco, 'OSSOS');
    const celulas = gradePronta.flat();
    const atlas = celulas.find(c => c.palavraInicialHorizontal === 'ATLAS' || c.palavraInicialVertical === 'ATLAS');
    assert.ok(atlas);
    assert.equal(atlas.letraCerta, 'A');
    for (const inicio of celulas) {
      for (const direcao of ['Horizontal', 'Vertical']) {
        const palavra = inicio[`palavraInicial${direcao}`];
        if (!palavra) continue;
        const entrada = celulas.filter(c => c[`id${direcao}`] === inicio[`id${direcao}`]);
        assert.equal(entrada.map(c => c.letraCerta).join(''), palavra);
      }
    }
  } finally {
    Math.random = randomOriginal;
  }
});
