import test from 'node:test';
import assert from 'node:assert/strict';
import { MATERIAS_CADASTRO, MATERIA_CADASTRO, materiaValida, tituloVisitante, validarCurso } from './curso.js';
import { MATERIAS, tituloEpico } from './coroas.js';
import { FACULDADES_MEDICINA } from './faculdadesMedicina.js';
import { prefixoTitulo, tituloDoCracha } from './cracha.js';

test('curso de Medicina: etapa de 1 a 12 ou formado, faculdade obrigatória', () => {
  assert.deepEqual(validarCurso({ etapa: 5, faculdade: 'Universidade de São Paulo (USP)' }),
    { naoMedicina: false, etapa: 5, formado: false, faculdade: 'Universidade de São Paulo (USP)' });
  assert.deepEqual(validarCurso({ formado: true, etapa: 7, faculdade: 'UFMG' }), { naoMedicina: false, etapa: null, formado: true, faculdade: 'UFMG' });
  for (const etapa of [0, 13, 2.5, '3', null]) assert.equal(validarCurso({ etapa, faculdade: 'UFMG' }), null, `etapa ${etapa}`);
  assert.equal(validarCurso({ etapa: 3 }), null);
  assert.equal(validarCurso({ etapa: 3, faculdade: '   ' }), null);
  assert.equal(validarCurso(null), null);
  assert.equal(validarCurso([]), null);
});

test('fora da Medicina: sem etapa, faculdade opcional e limpa', () => {
  assert.deepEqual(validarCurso({ naoMedicina: true, etapa: 4, formado: true }), { naoMedicina: true, etapa: null, formado: false, faculdade: null });
  assert.equal(validarCurso({ naoMedicina: true, faculdade: '=HYPERLINK("x")' }).faculdade, 'HYPERLINK("x")');
  assert.equal(validarCurso({ naoMedicina: true, faculdade: 'a'.repeat(300) }).faculdade.length, 120);
});

test('18 matérias, as 6 antigas com o mesmo nome e as novas com título próprio', () => {
  assert.equal(MATERIAS_CADASTRO.length, 18);
  assert.equal(new Set(MATERIAS_CADASTRO.map(([id]) => id)).size, 18);
  for (const [id, chave] of [['anatomia', 'ANATOMIA'], ['neurologia', 'NEUROLOGIA'], ['farmaco', 'FARMACOLOGIA'], ['micro', 'MICROBIOLOGIA'], ['clinica', 'CLÍNICA GERAL'], ['patologia', 'PATOLOGIA']]) {
    assert.equal(MATERIA_CADASTRO[id], chave);
  }
  assert.ok(materiaValida('cardio') && !materiaValida('toString') && !materiaValida('veterinaria'));
  const titulos = MATERIAS_CADASTRO.map(([id]) => tituloEpico(MATERIA_CADASTRO[id])[0]);
  // Só Clínica Geral fica com o título padrão; as outras 17 têm o seu.
  assert.equal(new Set(titulos).size, 18);
  // As 6 coroas não mudam de título.
  assert.deepEqual(MATERIAS.map(m => tituloEpico(m.chave)[0]),
    ['Escultor de Corpos', 'Devorador de Cérebros', 'O Alquimista Químico', 'Caçador de Vírus', 'Detetive de Lâminas', 'Bisturi de Ouro']);
});

test('quem não é de Medicina: sem Dr./Dra. e com o título de visitante', () => {
  assert.equal(prefixoTitulo({ titulo: 'Doutora' }), 'Dra.');
  assert.equal(prefixoTitulo({ titulo: 'Doutora', naoMedicina: true }), '');
  assert.deepEqual(tituloDoCracha({ titulo: 'Doutora', naoMedicina: true, materiaPreferida: 'cardio' }), tituloVisitante('Doutora'));
  assert.equal(tituloDoCracha({ titulo: 'Doutor', naoMedicina: true })[0], 'Infiltrado no Plantão');
  assert.equal(tituloDoCracha({ titulo: 'Doutor', materiaPreferida: 'cardio' })[0], 'Domador de Corações');
});

test('lista de faculdades de Medicina: sem repetição e com nome e município', () => {
  assert.ok(FACULDADES_MEDICINA.length > 300);
  assert.equal(new Set(FACULDADES_MEDICINA.map(([n, l]) => n + '|' + l)).size, FACULDADES_MEDICINA.length);
  for (const [nome, local] of FACULDADES_MEDICINA) {
    assert.ok(nome.length >= 3 && nome.length <= 120, nome);
    assert.match(local, / · [A-Z]{2}$/);
  }
});

test('linhaCurso resume etapa e faculdade para o crachá', async () => {
  const { linhaCurso } = await import('./cracha.js');
  assert.equal(linhaCurso({ etapa: 7, faculdade: 'Universidade de São Paulo (USP)' }), '7ª etapa · USP');
  assert.equal(linhaCurso({ formado: true, titulo: 'Doutora', faculdade: 'Faculdade X' }), 'Formada · Faculdade X');
  assert.equal(linhaCurso({ naoMedicina: true, etapa: null, faculdade: 'Enfermagem UFMG' }), 'Enfermagem UFMG');
  assert.equal(linhaCurso({ naoMedicina: true }), '');
  assert.equal(linhaCurso({}), '');
});

test('quem não é de Medicina ganha dois títulos: o de visitante e o épico da matéria', async () => {
  const { titulosDoCracha, tituloDoCracha } = await import('./cracha.js');
  const visitante = titulosDoCracha({ naoMedicina: true, titulo: 'Doutora', materiaPreferida: 'bioquimica' });
  assert.deepEqual(visitante.map(t => t[0]), ['Infiltrada no Plantão', 'Mago das Enzimas']);
  assert.deepEqual(titulosDoCracha({ titulo: 'Doutor', materiaPreferida: 'bioquimica' }).map(t => t[0]), ['Mago das Enzimas']);
  assert.equal(tituloDoCracha({ naoMedicina: true, titulo: 'Doutor', materiaPreferida: 'cardio' })[0], 'Infiltrado no Plantão');
});
