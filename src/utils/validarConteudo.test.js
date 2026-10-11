import test from 'node:test';
import assert from 'node:assert/strict';
import { validarFrases, validarCasos } from '../../scripts/validar-conteudo.mjs';

const frase = (verdadeira, texto) => ({ id: `frase-pressao-pulso-${verdadeira ? 'v' : 'f'}`, conceito: 'pressao-pulso', versao: 1,
  tema: 'Fisiologia cardiovascular', texto, verdadeira, explicacao: 'A diferença entre as pressões define a pressão de pulso.', fonte: null });

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
