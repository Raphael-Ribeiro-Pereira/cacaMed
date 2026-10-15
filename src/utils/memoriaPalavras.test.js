import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarTabuleiro } from './motorTabuleiro.js';
import { lembrarRespostas } from './memoriaPalavras.js';
import { montarDicas } from './dicasCruzadinha.js';

const naGrade = gradePronta => gradePronta.flat().flatMap(c => [c.palavraInicialHorizontal, c.palavraInicialVertical]).filter(Boolean);
const comSemente = (semente, executar) => {
  const original = Math.random;
  let estado = semente;
  Math.random = () => ((estado = (1664525 * estado + 1013904223) >>> 0) / 4294967296);
  try { return executar(); } finally { Math.random = original; }
};

test('memória guarda as respostas da mais antiga para a mais recente, sem repetir', () => {
  assert.deepEqual(lembrarRespostas([], ['FEMUR', 'TIBIA', 'FEMUR']), ['FEMUR', 'TIBIA']);
  assert.deepEqual(lembrarRespostas(['FEMUR', 'TIBIA', 'ULNA'], ['fêmur', 'RADIO']), ['TIBIA', 'ULNA', 'FEMUR', 'RADIO']);
  assert.deepEqual(lembrarRespostas(['A B'], ['', 'X', 'OK', '=SOMA(1)', 'VEIA  PORTA']), ['A B', 'OK', 'VEIA PORTA'], 'descarta o que não é palavra do banco');
  assert.deepEqual(lembrarRespostas(['AA', 'BB', 'CC'], ['DD'], 3), ['BB', 'CC', 'DD']);
  assert.deepEqual(lembrarRespostas(undefined, undefined), []);
});

// Incidente de 15/10/2026: no Digestório, três cruzadinhas seguidas tiveram as mesmas palavras.
test('três grades seguidas não repetem palavras enquanto houver novas', () => {
  const banco = { OSSOS: ['FEMUR', 'TIBIA', 'FIBULA', 'PATELA', 'UMERO', 'RADIO', 'ULNA', 'CARPO', 'TARSO', 'SACRO', 'COCCIX', 'ATLAS', 'AXIS', 'TALUS', 'ESTERNO', 'COSTELA',
    'CLAVICULA', 'ESCAPULA', 'MANDIBULA', 'MAXILA', 'OCCIPITAL', 'FRONTAL', 'PARIETAL', 'TEMPORAL', 'ETMOIDE', 'VOMER', 'HIOIDE', 'ESTRIBO', 'BIGORNA', 'MARTELO',
    'CALCANEO', 'NAVICULAR', 'CUBOIDE', 'FALANGE', 'METATARSO', 'ILIO', 'ISQUIO', 'PUBIS', 'ACROMIO', 'OLECRANO', 'TROCLEA', 'CONDILO', 'EPICONDILO', 'FORAME',
    'ACETABULO', 'SINFISE', 'MALEOLO', 'DIAFISE', 'EPIFISE', 'METAFISE', 'PERIOSTEO', 'MEDULA', 'OSTEOBLASTO', 'OSTEOCLASTO', 'OSTEOCITO', 'CARTILAGEM', 'LIGAMENTO',
    'FONTANELA', 'SUTURA', 'BREGMA', 'PTERIO', 'ZIGOMA', 'LACRIMAL', 'NASAL', 'PALATINO', 'ESFENOIDE', 'ESCAFOIDE', 'SEMILUNAR', 'PISIFORME', 'CAPITATO', 'HAMATO',
    'CUNEIFORME'].map(palavra => ({ palavra, dificuldade: 0 })) };
  comSemente(7, () => {
    let memoria = [];
    const vistas = [];
    for (let rodada = 0; rodada < 3; rodada++) {
      const { gradePronta, selecao } = gerarTabuleiro(banco, 'OSSOS', 0, { respondidas: memoria });
      const palavras = naGrade(gradePronta);
      assert.ok(palavras.length >= 10, `rodada ${rodada}: ${palavras.length} palavras`);
      assert.equal(selecao.repetidas, 0);
      assert.deepEqual(palavras.filter(p => vistas.includes(p)), [], `rodada ${rodada} repetiu`);
      vistas.push(...palavras);
      memoria = lembrarRespostas(memoria, palavras);
    }
  });
});

test('sem novas no nível, puxa novas dos outros níveis antes de repetir', () => {
  const faceis = ['FEMUR', 'TIBIA', 'ULNA', 'RADIO', 'SACRO', 'ATLAS'];
  const dificeis = ['ESCAPULA', 'CLAVICULA', 'MANDIBULA', 'OCCIPITAL', 'CALCANEO', 'NAVICULAR', 'METATARSO', 'ESTERNO', 'COSTELA', 'FALANGE', 'PATELA', 'CARPO', 'TARSO', 'TALUS'];
  const banco = { OSSOS: [...faceis.map(palavra => ({ palavra, dificuldade: 0 })), ...dificeis.map(palavra => ({ palavra, dificuldade: 8 }))] };
  comSemente(3, () => {
    const { gradePronta, selecao } = gerarTabuleiro(banco, 'OSSOS', 0, { respondidas: faceis });
    const palavras = naGrade(gradePronta);
    assert.equal(selecao.compativeis, 0);
    assert.ok(palavras.length >= 10);
    assert.deepEqual(palavras.filter(p => faceis.includes(p)), [], 'as fáceis já respondidas não voltam');
  });
});

test('com tudo respondido, as respostas mais antigas voltam primeiro', () => {
  const termos = ['FEMUR', 'TIBIA', 'FIBULA', 'PATELA', 'UMERO', 'RADIO', 'ULNA', 'CARPO', 'TARSO', 'SACRO', 'COCCIX', 'ATLAS', 'AXIS', 'TALUS', 'ESTERNO', 'COSTELA',
    'CLAVICULA', 'ESCAPULA', 'MANDIBULA', 'MAXILA', 'OCCIPITAL', 'FRONTAL', 'PARIETAL', 'TEMPORAL', 'ETMOIDE', 'VOMER', 'HIOIDE', 'ESTRIBO', 'BIGORNA', 'MARTELO'];
  const banco = { OSSOS: termos.map(palavra => ({ palavra, dificuldade: 0 })) };
  const recentes = termos.slice(20);
  comSemente(5, () => {
    const { gradePronta, selecao } = gerarTabuleiro(banco, 'OSSOS', 0, { respondidas: termos });
    const palavras = naGrade(gradePronta);
    assert.ok(palavras.length >= 10);
    assert.equal(selecao.novas, 0);
    assert.equal(selecao.repetidas, palavras.length);
    assert.deepEqual(palavras.filter(p => recentes.includes(p)), [], 'as 10 mais recentes ficam de fora');
  });
});

test('dicas saem do banco: primeira letra no laudo até o nível 2 e nas dicas extras a partir do 3', () => {
  const descricoes = { FEMUR: 'Osso da coxa, o fêmur é o mais longo.', 'VEIA PORTA': 'Leva o sangue do intestino ao fígado.' };
  const ate2 = montarDicas(['FEMUR', 'FEMUR', 'VEIA PORTA', 'ULNA'], descricoes, 2);
  assert.deepEqual(Object.keys(ate2), ['FEMUR', 'VEIA PORTA', 'ULNA']);
  assert.equal(ate2.FEMUR.laudo, 'Osso da coxa, o *** é o mais longo. (Começa com a letra F)');
  assert.equal(ate2.ULNA.laudo, 'Encontre esta estrutura. (Começa com a letra U)');
  assert.equal(ate2.FEMUR.residente, '');
  const nivel3 = montarDicas(['FEMUR', 'VEIA PORTA'], descricoes, 3);
  assert.equal(nivel3.FEMUR.laudo, 'Osso da coxa, o *** é o mais longo.');
  assert.equal(nivel3.FEMUR.residente, 'Começa com a letra F.');
  assert.equal(nivel3.FEMUR.paciente, 'Termina com a letra R.');
  assert.equal(nivel3['VEIA PORTA'].paciente, 'Termina com a letra A.');
});
