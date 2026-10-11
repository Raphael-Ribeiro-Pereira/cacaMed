import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { BANCO_QUIZ, BANCO_FRASES } from '../src/utils/bancoTreinos.js';
import { TEMAS_TREINO, conceitoDoQuiz } from '../src/utils/treinos.js';
import { CASOS_PACIENTE, FONTES_PACIENTE, MODULOS_PACIENTE } from '../src/utils/pacienteDdxConteudo.js';

const texto = value => typeof value === 'string' && value.trim().length > 0;
const idValido = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const normalizar = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const unico = (items, field, label, errors) => {
  const seen = new Set();
  for (const item of items) {
    const value = item?.[field];
    if (seen.has(value)) errors.push(`${label} duplicado: ${value}`);
    seen.add(value);
  }
};
const stringFields = (obj, fields, label, errors) => {
  for (const field of fields) if (!texto(obj?.[field])) errors.push(`${label}.${field} obrigatório`);
};

export function validarFrases(data, { pronto = false } = {}) {
  const errors = [], warnings = [];
  if (!data || !Array.isArray(data.frases) || !Array.isArray(data.pontos_revisor)) return { errors: ['Esperado objeto com frases e pontos_revisor (arrays).'], warnings };
  const frases = data.frases;
  if (frases.length === 0 || frases.length % 2) errors.push('frases deve conter pares verdadeira/falsa.');
  if (frases.length !== 80) warnings.push(`Lote com ${frases.length / 2} conceitos; o prompt pede 40.`);
  if (!data.pontos_revisor.every(texto)) errors.push('pontos_revisor deve conter apenas textos não vazios.');
  unico(frases, 'id', 'ID de frase', errors);
  const textos = new Set(BANCO_FRASES.map(x => normalizar(x.texto)));
  const ids = new Set(BANCO_FRASES.map(x => x.id));
  const conceitos = new Set(BANCO_FRASES.map(x => x.conceito));
  // Bancos separados: o V ou M não pode repetir assunto do Quiz. O tema igual (ex.: Microbiologia) é permitido.
  const conceitosQuiz = new Set(BANCO_QUIZ.map(conceitoDoQuiz));
  const porConceito = new Map();
  const conceitosPorFonte = new Map();
  for (const [i, f] of frases.entries()) {
    const label = `frases[${i}]`;
    stringFields(f, ['id', 'conceito', 'tema', 'texto', 'explicacao'], label, errors);
    if (!idValido(f.conceito) || f.id !== `frase-${f.conceito}-${f.verdadeira ? 'v' : 'f'}`) errors.push(`${label}: ID/conceito inválido.`);
    if (f.versao !== 1 || typeof f.verdadeira !== 'boolean') errors.push(`${label}: versao deve ser 1 e verdadeira deve ser booleano.`);
    const words = String(f.texto || '').trim().split(/\s+/).filter(Boolean).length;
    if (words < 8 || words > 25) errors.push(`${label}: texto deve ter 8 a 25 palavras.`);
    if (ids.has(f.id) || conceitos.has(f.conceito)) errors.push(`${label}: ID ou conceito já existe no banco.`);
    const normalized = normalizar(f.texto);
    if (textos.has(normalized)) errors.push(`${label}: frase duplicada (texto normalizado).`);
    textos.add(normalized);
    if (conceitosQuiz.has(f.conceito)) errors.push(`${label}: conceito ${f.conceito} já é assunto do Quiz.`);
    if (f.tema && !TEMAS_TREINO.includes(f.tema)) errors.push(`${label}: tema "${f.tema}" fora da lista de áreas amplas (${TEMAS_TREINO.join(', ')}).`);
    if (f.fonte) conceitosPorFonte.set(f.fonte, (conceitosPorFonte.get(f.fonte) || new Set()).add(f.conceito));
    if (f.fonte !== null && (typeof f.fonte !== 'string' || !/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(f.fonte))) errors.push(`${label}: fonte deve ser URL https ou null.`);
    if (pronto && !f.fonte) errors.push(`${label}: fonte pendente.`);
    if (!porConceito.has(f.conceito)) porConceito.set(f.conceito, []);
    porConceito.get(f.conceito).push(f);
  }
  for (const [fonte, lista] of conceitosPorFonte) if (lista.size > 1) warnings.push(`mesma fonte em conceitos diferentes (${[...lista].join(', ')}): confira se ${fonte} trata de todos.`);
  for (const [conceito, pair] of porConceito) {
    if (pair.length !== 2 || pair[0].verdadeira !== true || pair[1].verdadeira !== false) errors.push(`${conceito}: esperado par verdadeiro/falso nessa ordem.`);
    if (pair.length === 2 && (pair[0].explicacao !== pair[1].explicacao || pair[0].fonte !== pair[1].fonte || pair[0].tema !== pair[1].tema)) errors.push(`${conceito}: tema, explicação e fonte devem coincidir no par.`);
  }
  return { errors, warnings: [...new Set(warnings)] };
}

export function validarCasos(data, { pronto = false } = {}) {
  const errors = [], warnings = [];
  if (!data || !Array.isArray(data.casos) || !Array.isArray(data.fontes_novas) || !Array.isArray(data.modulos_novos) || !Array.isArray(data.pontos_revisor)) return { errors: ['Esperado objeto com casos, fontes_novas, modulos_novos e pontos_revisor (arrays).'], warnings };
  if (!data.pontos_revisor.every(texto)) errors.push('pontos_revisor deve conter apenas textos não vazios.');
  unico(data.casos, 'id', 'ID de caso', errors);
  unico(data.fontes_novas, 'id', 'ID de fonte', errors);
  unico(data.modulos_novos, 'id', 'ID de módulo', errors);
  const existingIds = new Set(CASOS_PACIENTE.map(c => c.id));
  const existingNames = new Set(CASOS_PACIENTE.map(c => normalizar(c.nome)));
  const modules = new Set(MODULOS_PACIENTE.map(m => m.id));
  const sources = new Set(Object.keys(FONTES_PACIENTE));
  for (const [i, m] of data.modulos_novos.entries()) {
    stringFields(m, ['id', 'nome', 'rede', 'resumo'], `modulos_novos[${i}]`, errors);
    if (!idValido(m.id) || modules.has(m.id)) errors.push(`modulos_novos[${i}]: ID inválido ou existente.`);
    modules.add(m.id);
  }
  for (const [i, s] of data.fontes_novas.entries()) {
    stringFields(s, ['id', 'curto', 'titulo', 'orgao', 'endereco'], `fontes_novas[${i}]`, errors);
    if (!idValido(s.id) || sources.has(s.id) || !Number.isInteger(s.ano) || !/^https:\/\//.test(s.endereco || '')) errors.push(`fontes_novas[${i}]: ID, ano ou URL inválido.`);
    sources.add(s.id);
  }
  const positions = new Set(CASOS_PACIENTE.map(c => `${c.modulo}:${c.ordem}`));
  for (const [i, c] of data.casos.entries()) {
    const label = `casos[${i}]`;
    stringFields(c, ['id', 'modulo', 'nome', 'categoria', 'queixa', 'aprendizado'], label, errors);
    stringFields(c.paciente, ['nome', 'idade', 'cenario'], `${label}.paciente`, errors);
    if (!idValido(c.id) || existingIds.has(c.id) || existingNames.has(normalizar(c.nome))) errors.push(`${label}: ID ou nome já existente/inválido.`);
    if (c.versao !== 1 || c.revisado !== false || !modules.has(c.modulo) || ![1, 2, 3].includes(c.nivel)) errors.push(`${label}: versão, revisão, módulo ou nível inválido.`);
    if (!Number.isInteger(c.ordem) || c.ordem < 1 || positions.has(`${c.modulo}:${c.ordem}`)) errors.push(`${label}: ordem duplicada ou inválida no módulo.`);
    positions.add(`${c.modulo}:${c.ordem}`);
    if (!Array.isArray(c.pistas) || c.pistas.length < 1) errors.push(`${label}: pistas obrigatórias.`);
    for (const [j, p] of (c.pistas || []).entries()) stringFields(p, ['nome', 'texto'], `${label}.pistas[${j}]`, errors);
    if (!Array.isArray(c.perguntas) || c.perguntas.length !== 5) errors.push(`${label}: exatamente 5 perguntas.`);
    for (const [j, p] of (c.perguntas || []).entries()) { stringFields(p, ['p', 'r'], `${label}.perguntas[${j}]`, errors); if (typeof p.chave !== 'boolean') errors.push(`${label}.perguntas[${j}].chave inválida.`); }
    if (!Array.isArray(c.exames) || c.exames.length < 3 || c.exames.length > 5) errors.push(`${label}: 3 a 5 exames.`);
    unico(c.exames || [], 'id', `${label}.exames[].id`, errors);
    for (const [j, e] of (c.exames || []).entries()) { stringFields(e, ['id', 'nome', 'resultado'], `${label}.exames[${j}]`, errors); if (!idValido(e.id) || typeof e.chave !== 'boolean') errors.push(`${label}.exames[${j}]: ID/chave inválido.`); }
    if (!(c.perguntas || []).some(p => p.chave) && !(c.exames || []).some(e => e.chave)) errors.push(`${label}: nenhuma investigação-chave.`);
    if (!Array.isArray(c.hipoteses) || c.hipoteses.length !== 4 || c.hipoteses.filter(h => h.certa === true).length !== 1) errors.push(`${label}: quatro hipóteses, uma certa.`);
    for (const [j, h] of (c.hipoteses || []).entries()) { stringFields(h, ['nome', 'porque'], `${label}.hipoteses[${j}]`, errors); if (typeof h.certa !== 'boolean') errors.push(`${label}.hipoteses[${j}].certa inválida.`); }
    if (!Array.isArray(c.conduta) || c.conduta.length < 5 || c.conduta.length > 7 || !c.conduta.some(x => x.certa === true) || !c.conduta.some(x => x.certa === false)) errors.push(`${label}: 5 a 7 condutas, com acerto e erro.`);
    for (const [j, item] of (c.conduta || []).entries()) { stringFields(item, ['texto', 'porque'], `${label}.conduta[${j}]`, errors); if (typeof item.certa !== 'boolean') errors.push(`${label}.conduta[${j}].certa inválida.`); }
    if (c.alerta !== null) stringFields(c.alerta, ['nome', 'quando', 'resposta', 'porque'], `${label}.alerta`, errors);
    if (c.notificar !== null && !texto(c.notificar)) errors.push(`${label}.notificar deve ser texto ou null.`);
    if (!Array.isArray(c.citacoes) || c.citacoes.length < 4 || c.citacoes.length > 9) errors.push(`${label}: 4 a 9 citações.`);
    for (const [j, cite] of (c.citacoes || []).entries()) {
      if (!sources.has(cite.fonte) || !Number.isInteger(cite.pag) || cite.pag < 0 || !texto(cite.sobre) || 'trecho' in cite) errors.push(`${label}.citacoes[${j}]: fonte, página ou assunto inválido.`);
      if (pronto && cite.pag === 0) errors.push(`${label}.citacoes[${j}]: página ainda não conferida.`);
    }
  }
  return { errors, warnings };
}

async function main() {
  const args = process.argv.slice(2);
  const kind = args[0], path = args[1], ready = args.includes('--ready');
  if (!['frases', 'casos'].includes(kind) || !path) {
    console.error('Uso: npm run content:validate -- <frases|casos> arquivo.json [--ready]');
    process.exitCode = 2;
    return;
  }
  try {
    const data = JSON.parse(await readFile(resolve(path), 'utf8'));
    const result = kind === 'frases' ? validarFrases(data, { pronto: ready }) : validarCasos(data, { pronto: ready });
    for (const error of result.errors) console.error(`ERRO: ${error}`);
    for (const warning of result.warnings) console.warn(`AVISO: ${warning}`);
    console.log(`${result.errors.length} erros, ${result.warnings.length} avisos.`);
    if (result.errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(`Falha ao ler JSON: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
