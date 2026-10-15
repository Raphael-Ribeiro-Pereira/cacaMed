import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarFrases, validarCasos, validarErroMedico } from '../../scripts/validar-conteudo.mjs';

const frase = (verdadeira, texto) => ({ id: `frase-pressao-pulso-${verdadeira ? 'v' : 'f'}`, conceito: 'pressao-pulso', versao: 1,
  tema: 'Fisiologia', texto, verdadeira, explicacao: 'A diferença entre as pressões define a pressão de pulso.', fonte: null });

test('frases exigem par verdadeiro/falso e fonte na etapa pronta', () => {
  const data = { frases: [
    frase(true, 'A pressão de pulso corresponde à diferença entre pressão sistólica e diastólica.'),
    frase(false, 'A pressão de pulso corresponde à média entre pressão sistólica e diastólica.')
  ], pontos_revisor: [] };
  assert.deepEqual(validarFrases(data).errors, []);
  assert.match(validarFrases(data, { pronto: true }).errors.join(' '), /fonte pendente/);
  const invalid = structuredClone(data);
  invalid.frases[1].verdadeira = true;
  assert.match(validarFrases(invalid).errors.join(' '), /verdadeiro\/falso/);

  const doQuiz = structuredClone(data);
  for (const f of doQuiz.frases) { f.conceito = 'insulina'; f.id = `frase-insulina-${f.verdadeira ? 'v' : 'f'}`; }
  assert.match(validarFrases(doQuiz).errors.join(' '), /já é assunto do Quiz/);
  const subtema = structuredClone(data);
  for (const f of subtema.frases) f.tema = 'Fisiologia cardiovascular';
  assert.match(validarFrases(subtema).errors.join(' '), /fora da lista de áreas amplas/);
});

test('casos recusam estrutura inválida e páginas não conferidas na etapa pronta', () => {
  const data = { casos: [{ id: 'caso-novo', versao: 1, revisado: false, modulo: 'febre-ubs', ordem: 6, nivel: 1,
    nome: 'Caso fictício novo', categoria: 'Clínica', paciente: { nome: 'Pessoa fictícia', idade: '30 anos', cenario: 'UBS' },
    queixa: 'Sintoma em avaliação', aprendizado: 'Avaliar contexto.', pistas: [{ nome: 'Pista', texto: 'Dado observado' }],
    perguntas: Array.from({ length: 5 }, () => ({ p: 'Pergunta?', r: 'Resposta.', chave: true })),
    exames: Array.from({ length: 3 }, (_, i) => ({ id: `exame-${i}`, nome: 'Exame', resultado: 'Resultado.', chave: i === 0 })),
    hipoteses: Array.from({ length: 4 }, (_, i) => ({ nome: `Hipótese ${i}`, certa: i === 0, porque: 'Motivo.' })),
    conduta: Array.from({ length: 5 }, (_, i) => ({ texto: `Conduta ${i}`, certa: i === 0, porque: 'Motivo.' })),
    alerta: null, notificar: null, citacoes: Array.from({ length: 4 }, () => ({ fonte: 'dcn', pag: 0, sobre: 'Ideia.' })) }],
    fontes_novas: [], modulos_novos: [], pontos_revisor: [] };
  assert.deepEqual(validarCasos(data).errors, []);
  assert.match(validarCasos(data, { pronto: true }).errors.join(' '), /página ainda não conferida/);
  data.casos[0].hipoteses[1].certa = true;
  assert.match(validarCasos(data).errors.join(' '), /uma certa/);
});

test('conferência de fontes acha o trecho literal, recusa trecho inventado e domínio fora da lista', async () => {
  const { normalizar, trechosAusentes, dominioPermitido, validarListaFontes } = await import('../../scripts/conferir-fontes.mjs');
  const pagina = normalizar('<p>&sect;1&ordm; A Aten&ccedil;&atilde;o B&aacute;sica ser&aacute; a principal porta de entrada e  centro de <b>comunica&ccedil;&atilde;o</b> .</p>');
  assert.deepEqual(trechosAusentes(pagina, 'A Atenção Básica será a principal porta de entrada e centro de comunicação.'), []);
  assert.deepEqual(trechosAusentes(pagina, '§1º A Atenção Básica ... centro de comunicação'), []);
  assert.equal(trechosAusentes(pagina, 'A Atenção Básica será a única porta de entrada').length, 1);
  assert.ok(dominioPermitido('https://www.cdc.gov/tetanus/causes/index.html'));
  assert.ok(dominioPermitido('https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2436_22_09_2017.html'));
  assert.ok(!dominioPermitido('https://www.ncbi.nlm.nih.gov.exemplo.com/books/NBK1/'));
  assert.ok(!dominioPermitido('https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction'));
  assert.ok(!dominioPermitido('http://www.cdc.gov/x'));
  assert.ok(!dominioPermitido('https://www.ncbi.nlm.nih.gov/books/NBK538324/'));
  assert.ok(!dominioPermitido('https://pmc.ncbi.nlm.nih.gov/articles/PMC1/'));
  assert.match(validarListaFontes({ fontes: [{ conceito: 'x', url: 'https://openstax.org/a', titulo: 't', orgao: 'o', trecho: 'algo' }] }).join(' '), /domínio fora/);
  assert.match(validarListaFontes({ fontes: [{ conceito: 'x', area: 'Fisiologia renal', url: 'https://www.cdc.gov/a', titulo: 't', orgao: 'o', trecho: 'algo' }] }).join(' '), /área/);
});

test('S-15: fonte com link precisa ser https; texto sem link continua aceito', () => {
  const lote = JSON.parse(readFileSync(new URL('../../content/approved/erro-lote-001.json', import.meta.url), 'utf8'));
  const erros = fonte => validarErroMedico({ auditorias: [{ ...lote.auditorias[0], fonte }], pontos_revisor: [] }).errors.filter(e => /link da fonte/.test(e));
  assert.deepEqual(erros('https://bvsms.saude.gov.br/x.pdf'), []);
  assert.deepEqual(erros('Biblioteca do caso (ver referências no relatório)'), []);
  assert.equal(erros('javascript:alert(1)').length, 1);
  assert.equal(erros('http://exemplo.gov.br').length, 1);
});
