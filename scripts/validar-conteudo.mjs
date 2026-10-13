import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { BANCO_QUIZ, BANCO_FRASES } from '../src/utils/bancoTreinos.js';
import { TEMAS_TREINO, conceitoDoQuiz } from '../src/utils/treinos.js';
import { CASOS_PLANTAO, executarPlantao } from '../src/utils/plantao.js';
import { AUDITORIAS, CATEGORIAS_FALHA } from '../src/utils/erroMedico.js';
import { RELACOES } from '../src/utils/causaEfeito.js';
import { lerVitais, xpCaminhoCompleto } from '../src/utils/ddxVisual.js';
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

// Casos do Plantão: o caminho completo (todas as ações com ponto positivo e o destino adequado) roda no
// motor real e precisa sair seguro. Citações seguem o formato de content:fontes e são conferidas por ele.
// Temas do DDX: sistemas do corpo ou áreas clínicas. O hub agrupa os casos por esses temas.
export const TEMAS_DDX = ['Respiratório', 'Cardiovascular', 'Neurológico', 'Endócrino e metabólico', 'Infeccioso', 'Renal e urinário', 'Gastrointestinal', 'Hematológico', 'Obstétrico', 'Pediátrico', 'Toxicológico e ambiental', 'Pele e partes moles', 'Zoonoses e acidentes por animais', 'Vascular'];
const GRUPOS_PLANTAO = ['Avaliação', 'Anamnese', 'Exame físico', 'Exames', 'Hipóteses', 'Conduta', 'Evolução', 'Encerramento'];
const CRITERIOS_PLANTAO = ['raciocinio', 'seguranca', 'eficiencia'];
// mg/dL é unidade de exame (glicemia), não de dose.
const DOSE = /\b\d+(?:[.,]\d+)?\s?(?:mg(?!\/dL)|mcg|µg|ml|mL|UI|unidades)\b|\bmg\/kg\b/;
export function validarPlantao(data) {
  const errors = [], warnings = [];
  if (!data || !Array.isArray(data.casos) || !Array.isArray(data.pontos_revisor)) return { errors: ['Esperado objeto com casos e pontos_revisor (arrays).'], warnings };
  unico(data.casos, 'id', 'ID de caso', errors);
  const existentes = new Set(CASOS_PLANTAO.map(c => c.id));
  for (const [i, c] of data.casos.entries()) {
    const label = `casos[${i}] (${c?.id})`;
    stringFields(c, ['id', 'sistema', 'titulo', 'paciente', 'queixa', 'fonte', 'vitais', 'hipoteseCorreta', 'destinoAdequado', 'estadoInicial'], label, errors);
    if (!idValido(c.id) || existentes.has(c.id)) errors.push(`${label}: ID inválido ou já existente.`);
    if (c.versao !== 1 || c.revisado !== false) errors.push(`${label}: versao deve ser 1 e revisado false.`);
    const v = lerVitais(c.vitais);
    if ([v.fc, v.fr, v.spo2, v.t].some(x => x == null) || !v.pa) errors.push(`${label}: vitais devem trazer FC, FR, SpO₂, PA e T.`);
    const acoes = Array.isArray(c.acoes) ? c.acoes : [];
    unico(acoes, 'id', `${label}: ação`, errors);
    const ids = new Set(acoes.map(a => a.id));
    for (const a of acoes) {
      stringFields(a, ['id', 'grupo', 'texto', 'resposta', 'criterio'], `${label}.${a.id}`, errors);
      if (!idValido(a.id) || !GRUPOS_PLANTAO.includes(a.grupo) || !CRITERIOS_PLANTAO.includes(a.criterio)) errors.push(`${label}.${a.id}: id, grupo ou critério inválido.`);
      if (!Number.isInteger(a.pontos) || !Number.isInteger(a.minutos) || a.minutos < 1) errors.push(`${label}.${a.id}: pontos e minutos inteiros.`);
      if ((a.exige || []).some(x => !ids.has(x))) errors.push(`${label}.${a.id}: exige ação inexistente.`);
      if (Boolean(a.terminal) !== ['alta', 'encaminhar'].includes(a.id) || (a.terminal && a.grupo !== 'Encerramento')) errors.push(`${label}.${a.id}: só alta e encaminhar encerram, no grupo Encerramento.`);
      if (DOSE.test(`${a.texto} ${a.resposta}`)) warnings.push(`${label}.${a.id}: parece citar dose; o Plantão não prescreve doses.`);
    }
    if (!ids.has('alta') || !ids.has('encaminhar')) errors.push(`${label}: precisa das ações alta e encaminhar.`);
    if (!['alta', 'encaminhar'].includes(c.destinoAdequado)) errors.push(`${label}: destinoAdequado deve ser alta ou encaminhar.`);
    const hipoteses = acoes.filter(a => a.grupo === 'Hipóteses');
    const certa = hipoteses.find(a => a.id === c.hipoteseCorreta);
    if (hipoteses.length < 2 || !certa || certa.pontos <= 0 || hipoteses.some(a => a !== certa && a.pontos !== 0)) errors.push(`${label}: ao menos 2 hipóteses; só a correta pontua.`);
    if (!acoes.some(a => a.grupo === 'Exames' && a.pontos < 0)) warnings.push(`${label}: nenhum exame desnecessário com penalidade.`);
    if (!Array.isArray(c.essenciais) || !c.essenciais.includes(c.hipoteseCorreta) || c.essenciais.some(x => !ids.has(x) || acoes.find(a => a.id === x).pontos <= 0)) errors.push(`${label}: essenciais devem ser ações positivas e incluir a hipótese correta.`);
    if (!Array.isArray(c.criteriosAlta) || c.criteriosAlta.some(x => !ids.has(x)) || (c.destinoAdequado === 'alta' && !c.criteriosAlta.length)) errors.push(`${label}: criteriosAlta inválidos.`);
    if (c.destinoAdequado === 'alta' && !ids.has('reavaliar')) warnings.push(`${label}: caso de alta sem a ação reavaliar (o monitor usa os vitais dela).`);
    if (!Array.isArray(c.citacoes) || c.citacoes.length < 2) errors.push(`${label}: ao menos 2 citações com trecho.`);
    if (errors.some(e => e.startsWith(label))) continue;
    try {
      const xp = xpCaminhoCompleto(c, executarPlantao);
      const feitas = acoes.filter(a => !a.terminal && a.pontos > 0).map(a => a.id);
      const r = executarPlantao(c, ordenarPorExige(c, feitas).concat(c.destinoAdequado));
      if (!r.seguro) errors.push(`${label}: caminho completo não sai seguro (omissões: ${r.omissoes.join(', ') || 'nenhuma'}).`);
      if (xp !== 250) warnings.push(`${label}: caminho completo vale ${xp} XP; o piloto vale 250.`);
    } catch (e) {
      errors.push(`${label}: motor recusou o caminho completo (${e.message}).`);
    }
  }
  return { errors, warnings: [...new Set(warnings)] };
}
function ordenarPorExige(caso, ids) {
  const feitas = [];
  for (let mudou = true; mudou;) {
    mudou = false;
    for (const id of ids) {
      const a = caso.acoes.find(x => x.id === id);
      if (!feitas.includes(id) && (a.exige || []).every(x => feitas.includes(x))) { feitas.push(id); mudou = true; }
    }
  }
  return feitas;
}

// Erro médico (v2): cada auditoria é um caso próprio, com uma linha de falha, uma categoria e a correção entre 3 ou 4 opções.
const citacoesOk = (c, label, errors) => {
  if (!Array.isArray(c.citacoes) || c.citacoes.length < 2) errors.push(`${label}: ao menos 2 citações com trecho.`);
  for (const [j, f] of (c.citacoes || []).entries()) stringFields(f, ['url', 'titulo', 'orgao', 'trecho', 'sustenta'], `${label}.citacoes[${j}]`, errors);
};
const HORA = /^\d{2}:\d{2} — \S/;
export function validarErroMedico(data) {
  const errors = [], warnings = [];
  if (!data || !Array.isArray(data.auditorias) || !Array.isArray(data.pontos_revisor)) return { errors: ['Esperado objeto com auditorias e pontos_revisor (arrays).'], warnings };
  unico(data.auditorias, 'id', 'ID de auditoria', errors);
  const existentes = new Set(AUDITORIAS.map(a => a.id));
  const titulos = new Set(AUDITORIAS.map(a => normalizar(a.titulo)));
  for (const [i, a] of data.auditorias.entries()) {
    const label = `auditorias[${i}] (${a?.id})`;
    stringFields(a, ['id', 'tema', 'titulo', 'paciente', 'cenario', 'contexto', 'fonte'], label, errors);
    if (!idValido(a.id) || existentes.has(a.id)) errors.push(`${label}: ID inválido ou já existente.`);
    if (titulos.has(normalizar(a.titulo))) errors.push(`${label}: título já existe.`);
    titulos.add(normalizar(a.titulo));
    if (a.versao !== 2 || a.revisado !== false) errors.push(`${label}: versao deve ser 2 e revisado false.`);
    if (!TEMAS_DDX.includes(a.tema)) errors.push(`${label}: tema "${a.tema}" fora da lista (${TEMAS_DDX.join(', ')}).`);
    const regs = Array.isArray(a.registros) ? a.registros : [];
    if (regs.length < 5 || regs.length > 8 || regs.some(r => !HORA.test(r))) errors.push(`${label}: de 5 a 8 registros no formato "08:10 — texto".`);
    const horas = regs.map(r => r.slice(0, 5));
    if (horas.some((h, k) => k && h < horas[k - 1])) errors.push(`${label}: horários fora de ordem.`);
    const f = a.falha || {};
    if (!Number.isInteger(f.linha) || f.linha < 1 || f.linha > regs.length) errors.push(`${label}: falha.linha deve apontar um registro.`);
    if (!CATEGORIAS_FALHA.some(c => c.id === f.categoria)) errors.push(`${label}: categoria inválida.`);
    const cor = Array.isArray(a.correcoes) ? a.correcoes : [];
    if (cor.length < 3 || cor.length > 4 || !cor.some(c => c.id === f.correcao) || new Set(cor.map(c => normalizar(c.texto))).size !== cor.length) errors.push(`${label}: de 3 a 4 correções distintas, uma delas certa.`);
    for (const k of ['linha', 'categoria', 'correcao']) if (!texto(f.explicacoes?.[k])) errors.push(`${label}: explicação de ${k} obrigatória.`);
    if (a.falha && a.falha.categoria === 'medicacao' && !/\d/.test(regs[f.linha - 1] || '')) warnings.push(`${label}: erro de medicação sem número na linha da falha.`);
    if (DOSE.test(regs.join(' '))) warnings.push(`${label}: registros citam dose; confira se a fonte brasileira traz a quantidade.`);
    citacoesOk(a, label, errors);
  }
  const contagem = {};
  for (const a of data.auditorias) contagem[a.falha?.categoria] = (contagem[a.falha?.categoria] || 0) + 1;
  warnings.push(`Categorias do lote: ${Object.entries(contagem).map(([k, v]) => `${k}=${v}`).join(', ')}.`);
  return { errors, warnings };
}

// Causa e efeito (v2): quatro elos, seis cartas (duas distratoras) e cada carta com texto único.
export function validarCausaEfeito(data) {
  const errors = [], warnings = [];
  if (!data || !Array.isArray(data.relacoes) || !Array.isArray(data.pontos_revisor)) return { errors: ['Esperado objeto com relacoes e pontos_revisor (arrays).'], warnings };
  unico(data.relacoes, 'id', 'ID de relação', errors);
  const existentes = new Set(RELACOES.map(r => r.id));
  const titulos = new Set(RELACOES.map(r => normalizar(r.titulo)));
  for (const [i, r] of data.relacoes.entries()) {
    const label = `relacoes[${i}] (${r?.id})`;
    stringFields(r, ['id', 'tema', 'titulo', 'paciente', 'cenario', 'vitais', 'estimulo', 'contexto', 'fonte'], label, errors);
    if (!idValido(r.id) || existentes.has(r.id)) errors.push(`${label}: ID inválido ou já existente.`);
    if (titulos.has(normalizar(r.titulo))) errors.push(`${label}: título já existe.`);
    titulos.add(normalizar(r.titulo));
    if (r.versao !== 2 || r.revisado !== false) errors.push(`${label}: versao deve ser 2 e revisado false.`);
    if (!TEMAS_DDX.includes(r.tema)) errors.push(`${label}: tema "${r.tema}" fora da lista (${TEMAS_DDX.join(', ')}).`);
    const v = lerVitais(r.vitais);
    if ([v.fc, v.fr, v.spo2, v.t].some(x => x == null) || !v.pa) errors.push(`${label}: vitais devem trazer FC, FR, SpO₂, PA e T.`);
    if (r.elos?.map(e => e.id).join() !== 'mecanismo,consequencia,compensacao,intervencao') errors.push(`${label}: elos devem ser mecanismo, consequencia, compensacao e intervencao, nessa ordem.`);
    const cartas = Array.isArray(r.cartas) ? r.cartas : [];
    if (cartas.length !== 6 || new Set(cartas.map(c => normalizar(c.texto))).size !== 6 || new Set(cartas.map(c => c.id)).size !== 6) errors.push(`${label}: seis cartas com id e texto únicos.`);
    const certas = (r.elos || []).map(e => e.correta);
    if (new Set(certas).size !== 4 || certas.some(c => !cartas.some(x => x.id === c))) errors.push(`${label}: quatro cartas certas distintas, todas na mão.`);
    for (const e of r.elos || []) if (!texto(e.explicacao)) errors.push(`${label}.${e.id}: explicação obrigatória.`);
    const palavras = cartas.map(c => String(c.texto).split(/\s+/).length);
    if (palavras.some(n => n > 18)) warnings.push(`${label}: carta com mais de 18 palavras (difícil de ler no celular).`);
    const certasIdx = new Set(certas);
    const distratoras = cartas.filter(c => !certasIdx.has(c.id));
    if (distratoras.some(c => palavras[cartas.indexOf(c)] < 3)) warnings.push(`${label}: distrator curto demais.`);
    citacoesOk(r, label, errors);
  }
  return { errors, warnings };
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
  if (!['frases', 'casos', 'plantao', 'erro', 'causa'].includes(kind) || !path) {
    console.error('Uso: npm run content:validate -- <frases|casos|plantao|erro|causa> arquivo.json [--ready]');
    process.exitCode = 2;
    return;
  }
  try {
    const data = JSON.parse(await readFile(resolve(path), 'utf8'));
    const result = kind === 'frases' ? validarFrases(data, { pronto: ready }) : kind === 'plantao' ? validarPlantao(data) : kind === 'erro' ? validarErroMedico(data) : kind === 'causa' ? validarCausaEfeito(data) : validarCasos(data, { pronto: ready });
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
