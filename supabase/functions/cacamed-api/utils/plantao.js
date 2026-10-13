// Conteúdo piloto: revisar clinicamente antes de liberar para jogadores.
import { CASOS_PLANTAO } from './plantaoBanco.js';

export { CASOS_PLANTAO };

export function obterCasoPlantao(id) {
  const caso = CASOS_PLANTAO.find(item => item.id === id);
  if (!caso) throw new Error('Caso não encontrado.');
  return caso;
}

// Destinos possíveis ao encerrar (13/10/2026): alta, UTI, encaminhamento e retorno/observação. Cada caso traz os quatro.
export const DESTINOS = ['alta', 'uti', 'encaminhar', 'observacao'];

// Cada caso traz alta e encaminhamento escritos; UTI e observação têm texto-padrão, e o relatório diz se o destino
// escolhido era o adequado. O sistema do caso é um dos temas do DDX.
const DESTINO_PADRAO = {
  uti: { texto: 'Transferir para a UTI', resposta: 'Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.' },
  observacao: { texto: 'Manter em observação, com retorno programado', resposta: 'Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.' },
};
const TEMA_POR_SISTEMA = { 'Endócrino': 'Endócrino e metabólico', 'Toxicológico': 'Toxicológico e ambiental', 'Ambiental': 'Toxicológico e ambiental',
  'Zoonoses': 'Zoonoses e acidentes por animais', 'Urinário': 'Renal e urinário' };
export function completarDestinos(caso) {
  const acoes = [...caso.acoes];
  for (const id of DESTINOS) {
    if (!acoes.some(a => a.id === id)) acoes.push({ id, grupo: 'Encerramento', ...DESTINO_PADRAO[id], pontos: 0, criterio: 'seguranca', minutos: 1, terminal: true });
  }
  const ordem = ['alta', 'observacao', 'encaminhar', 'uti'];
  return { ...caso, sistema: TEMA_POR_SISTEMA[caso.sistema] || caso.sistema, acoes: [...acoes.filter(a => !ordem.includes(a.id)), ...ordem.map(id => acoes.find(a => a.id === id))] };
}

// Evolução dos sinais vitais sem mostrar relógio: ações podem trazer `vitais` (valores novos) e o caso pode trazer
// `agravamentos` ({ apos, antes, vitais, estado }): passados `apos` minutos simulados sem a ação `antes`, o paciente piora.
// `desempenho` ({ acao, limite }) define o bônus escondido: até +50 XP se a ação-marco vem dentro do limite, em caso seguro.
export function executarPlantao(caso, escolhas = []) {
  if (!Array.isArray(escolhas) || escolhas.length > caso.acoes.length) throw new Error('Registro de ações inválido.');
  const feitas = new Set();
  const eventos = [];
  const pontos = { raciocinio: 0, seguranca: 0, eficiencia: 20 };
  let minutos = 0;
  let encerrado = false;
  let hipotese = '';
  let destino = '';
  let estadoPaciente = caso.estadoInicial;
  let vitais = {};
  let piorando = false;
  let minutosMarco = null;
  for (const id of escolhas) {
    const acao = caso.acoes.find(item => item.id === id);
    if (!acao || feitas.has(id) || encerrado) throw new Error('Ação inválida ou repetida.');
    if ((acao.exige || []).some(item => !feitas.has(item))) throw new Error('Complete as avaliações necessárias antes desta ação.');
    feitas.add(id);
    if (acao.grupo === 'Hipóteses') hipotese = id;
    if (acao.estadoPaciente) { estadoPaciente = acao.estadoPaciente; piorando = false; }
    if (acao.vitais) { vitais = { ...vitais, ...acao.vitais }; piorando = false; }
    pontos[acao.criterio] += acao.pontos;
    minutos += acao.minutos;
    if (caso.desempenho && id === caso.desempenho.acao) minutosMarco = minutos;
    eventos.push({ id, texto: acao.texto, resposta: acao.resposta, minutos });
    for (const ag of [...(caso.agravamentos || [])].sort((a, b) => a.apos - b.apos)) {
      if (minutos >= ag.apos && !feitas.has(ag.antes)) { vitais = { ...vitais, ...ag.vitais }; if (ag.estado) estadoPaciente = ag.estado; piorando = true; }
    }
    if (acao.terminal) { encerrado = true; destino = id; }
  }
  // Rever a hipótese é permitido, mas somente a hipótese final pontua.
  for (const acao of caso.acoes.filter(item => item.grupo === 'Hipóteses')) {
    if (feitas.has(acao.id) && hipotese !== acao.id) pontos[acao.criterio] -= acao.pontos;
  }
  const omissoes = caso.essenciais.filter(id => !feitas.has(id));
  if (hipotese !== caso.hipoteseCorreta && feitas.has(caso.hipoteseCorreta)) omissoes.push(caso.hipoteseCorreta);
  const altaInsegura = destino === 'alta' && caso.criteriosAlta.some(id => !feitas.has(id));
  const seguro = encerrado && destino === caso.destinoAdequado && !altaInsegura && hipotese === caso.hipoteseCorreta && !omissoes.length;
  // Alta indevida (sem os critérios, ou quando o caso pedia outro destino) desconta 80; outro destino sem necessidade, 20.
  const altaIndevida = altaInsegura || (destino === 'alta' && caso.destinoAdequado !== 'alta');
  const desconto = altaIndevida ? 80 : destino && destino !== caso.destinoAdequado ? 20 : 0;
  const base = encerrado ? Math.max(0, pontos.raciocinio + pontos.seguranca + pontos.eficiencia - desconto) : 0;
  // Bônus de desempenho: não aparece em cronômetro nenhum; só entra no relatório como "bônus de desempenho".
  let bonus = 0;
  if (seguro && caso.desempenho && minutosMarco != null) {
    const { limite } = caso.desempenho;
    bonus = minutosMarco <= limite ? 50 : minutosMarco >= limite * 2 ? 0 : Math.round((50 * (limite * 2 - minutosMarco)) / limite);
  }
  return { escolhas: [...escolhas], eventos, minutos, encerrado, hipotese, destino, seguro, altaInsegura, omissoes, pontos, desconto, bonus, xp: base + bonus,
    estadoPaciente, vitais, piorando };
}
