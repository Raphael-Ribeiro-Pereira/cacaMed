import test from 'node:test';
import assert from 'node:assert/strict';
import { entradasDaGrade, gerarTabuleiro, montarGrade } from './motorTabuleiro.js';

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

// Decidido em 16/10/2026: o nível não filtra mais as palavras; qualquer palavra do tópico pode cair em qualquer nível.
test('palavras de qualquer dificuldade entram na grade do nível 0', () => {
  const comuns = ['ATLAS', 'TALUS', 'ULNA', 'SACRO', 'RADIO', 'COCCIX'];
  const dificeis = ['UMERO', 'FEMUR', 'TIBIA', 'FIBULA', 'ESCAPULA', 'CLAVICULA', 'PATELA', 'CARPO', 'TARSO'];
  const banco = { OSSOS: [...comuns.map(palavra => ({ palavra, dificuldade: 0 })), ...dificeis.map(palavra => ({ palavra, dificuldade: 9 }))] };
  const original = Math.random;
  let estado = 42;
  Math.random = () => ((estado = (1664525 * estado + 1013904223) >>> 0) / 4294967296);
  try {
    const { metricas, selecao, gradePronta } = gerarTabuleiro(banco, 'OSSOS', 0);
    assert.ok(metricas.palavras >= 10);
    assert.equal(selecao.posicionadas, metricas.palavras);
    assert.ok(entradasDaGrade(gradePronta).some(e => dificeis.includes(e.palavra)));
  } finally { Math.random = original; }
});

test('a grade remontada a partir das entradas é igual à gerada', () => {
  const banco = { OSSOS: ['FEMUR', 'TIBIA', 'FIBULA', 'PATELA', 'UMERO', 'RADIO', 'ULNA', 'CARPO', 'TARSO', 'SACRO', 'COCCIX', 'VEIA PORTA'].map((palavra, i) => ({ palavra, dificuldade: 0, dicaBasica: 'dica ' + i })) };
  const gerada = gerarTabuleiro(banco, 'OSSOS', 0);
  const entradas = entradasDaGrade(gerada.gradePronta);
  const remontada = montarGrade(entradas, gerada.tamanho);
  const resumo = g => g.gradePronta.flat().filter(c => !c.vazia).map(c => [c.linha, c.coluna, c.letraCerta, c.numero, c.palavraInicialHorizontal, c.palavraInicialVertical, c.dicaBasicaHorizontal, c.dicaBasicaVertical, c.idHorizontal, c.idVertical].join('|'));
  assert.deepEqual(resumo(remontada), resumo(gerada));
  assert.deepEqual(remontada.limites, gerada.limites);
});

test('nível 2 usa até 12 termos quando o tópico permite cruzamentos', () => {
  const termos = ['PULMAO', 'BRONQUIO', 'TRAQUEIA', 'ALVEOLO', 'LARINGE', 'FARINGE', 'DIAFRAGMA', 'PLEURA', 'EPIGLOTE', 'HEMATOSE', 'OXIGENIO', 'CARINA', 'BRONQUIOLO', 'VENTILACAO', 'INSPIRACAO', 'EXPIRACAO', 'TORAX', 'COSTELA'];
  const banco = { RESPIRATORIO: termos.map(palavra => ({ palavra, dificuldade: 2 })) };
  const aleatorioOriginal = Math.random;
  try {
    for (let semente = 1; semente <= 8; semente++) {
      let estado = semente;
      Math.random = () => ((estado = (1664525 * estado + 1013904223) >>> 0) / 4294967296);
      const resultado = gerarTabuleiro(banco, 'RESPIRATORIO', 2);
      assert.ok(resultado.metricas.palavras >= 12, `semente ${semente}: ${resultado.metricas.palavras} palavras`);
      assert.equal(resultado.selecao.meta, 12);
    }
  } finally { Math.random = aleatorioOriginal; }
});
