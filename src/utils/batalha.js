// Motor da Batalha diagnóstica. Determinístico: o servidor reexecuta a lista de ações do jogador para
// validar a partida e calcular a recompensa; o navegador usa o mesmo motor para a resposta imediata.
import { CAPITULOS_BATALHA, DOENCAS_BATALHA, EXTRAS_BATALHA, FONTES_BATALHA } from './batalhaConteudo.js';

export const FONTES = FONTES_BATALHA;
export const CAPITULOS = [...CAPITULOS_BATALHA].sort((a, b) => a.ordem - b.ordem);
// A ordem da História é a ordem dos capítulos.
export const DOENCAS = CAPITULOS.flatMap(c => c.ids.map(id => DOENCAS_BATALHA.find(d => d.id === id)));
export const MAXIMO_ACOES = 80;

export const AGENTE = {
  bacteria: { nome: 'BACTÉRIA', cor: '#b49cff' },
  virus: { nome: 'VÍRUS', cor: '#ff8a5c' },
  protozoario: { nome: 'PROTOZOÁRIO', cor: '#ffb703' },
  helminto: { nome: 'HELMINTO', cor: '#5ce0a8' },
};

export const MOVES = [
  { id: 'bacti', nome: 'BactiBaque', cat: 'Terapia', desc: 'Antibacteriano', cd: 1, cor: '#b49cff' },
  { id: 'proto', nome: 'ProtoStop', cat: 'Terapia', desc: 'Antiparasitário', cd: 1, cor: '#ffb703' },
  { id: 'suporte', nome: 'Suporte Vital', cat: 'Suporte', desc: 'Hidratação e O₂', cd: 1, cor: '#5cc8ff' },
  { id: 'critica', nome: 'Resposta crítica', cat: 'Resposta crítica', desc: 'Contra o buff ativo', cd: 2, cor: '#ff3366' },
];

export const PETS = [
  { id: 'cocobi', nome: 'Cocobi', esp: 'Bacteriologia', hab: 'Coloração de Gram', desc: 'Mostra se o agente é uma bactéria. Se for, o próximo BactiBaque causa o dobro.', cor: '#b49cff' },
  { id: 'capsi', nome: 'Capsi', esp: 'Virologia', hab: 'Radar viral', desc: 'Descarta duas hipóteses erradas e diz se o agente é um vírus.', cor: '#5cc8ff' },
  { id: 'pulsa', nome: 'Pulsa', esp: 'Terapia intensiva', hab: 'Estabilizar', desc: 'Recupera 35 de estabilidade e segura a próxima piora do paciente.', cor: '#ff5c8a' },
];
export const PET_QUANDO = 'Aparece em momento crítico: estabilidade abaixo de 60% ou buff ativo. Uma vez por batalha.';

// Catálogo de exames. Cada doença oferece 5 deles (o "kit"), com o resultado escrito para aquele caso.
export const EXAMES = [
  { id: 'anamnese', nome: 'Anamnese dirigida', desc: 'Epidemiologia e exame físico' },
  { id: 'hemograma', nome: 'Hemograma', desc: 'Série branca e plaquetas' },
  { id: 'rx', nome: 'RX de tórax', desc: 'Consolidação ou não' },
  { id: 'ns1', nome: 'Teste NS1', desc: 'Antígeno da dengue' },
  { id: 'gota', nome: 'Gota espessa', desc: 'Pesquisa de parasitos no sangue' },
  { id: 'escarro', nome: 'Baciloscopia de escarro', desc: 'Pesquisa de BAAR' },
  { id: 'sorologia', nome: 'Sorologia', desc: 'IgM, ELISA ou imunofluorescência' },
  { id: 'bioquimica', nome: 'Bioquímica', desc: 'Fígado, rim, CPK e potássio' },
  { id: 'fezes', nome: 'Exame de fezes', desc: 'Pesquisa de ovos (Kato-Katz)' },
  { id: 'dermato', nome: 'Exame dermatoneurológico', desc: 'Pele e nervos periféricos' },
  { id: 'bacilo', nome: 'Baciloscopia de pele', desc: 'Esfregaço intradérmico' },
  { id: 'usg', nome: 'Ultrassom de abdome', desc: 'Fígado e baço' },
  { id: 'ecg', nome: 'Eletrocardiograma', desc: 'Ritmo e repolarização' },
  { id: 'liquor', nome: 'Líquor', desc: 'Punção lombar' },
  { id: 'hemocultura', nome: 'Hemocultura', desc: 'Cultura de sangue' },
  { id: 'medula', nome: 'Aspirado de medula', desc: 'Pesquisa direta do parasito' },
];

export const HIPOTESES = [...DOENCAS.map(d => ({ id: d.id, nome: d.nome })), ...EXTRAS_BATALHA];

function hash(texto) {
  let h = 7;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function obterDoenca(id) {
  const doenca = DOENCAS.find(d => d.id === id);
  if (!doenca) throw new Error('Doença não encontrada.');
  return doenca;
}
export const obterPet = id => {
  const pet = PETS.find(p => p.id === id);
  if (!pet) throw new Error('Pet inválido.');
  return pet;
};
export const capituloDe = id => CAPITULOS.find(c => c.ids.includes(id));
// Em cada batalha aparecem 5 hipóteses: a certa e 4 diferenciais da própria doença, sempre na mesma ordem.
export const hipotesesDe = doenca => [doenca.id, ...doenca.dif]
  .sort((a, b) => hash(doenca.id + a) - hash(doenca.id + b))
  .map(id => HIPOTESES.find(h => h.id === id));
export const examesDe = doenca => doenca.kit.map(id => EXAMES.find(e => e.id === id));

export function criarEstado() {
  return {
    hp: 100, stab: 100, revealed: false, evolved: false, buff: false, neutral: false,
    cd: { bacti: 0, proto: 0, suporte: 0, critica: 0 }, exams: [], elim: [], clues: [], turn: 1, golpe: 0,
    petReady: false, petUsed: false, boost: false, guard: false, good: [], bad: [], wrongHyp: 0, ineff: 0, fim: null,
  };
}

const TIPOS = ['exame', 'hipotese', 'golpe', 'pet'];
export function validarAcao(acao) {
  if (!acao || typeof acao !== 'object' || Array.isArray(acao) || !TIPOS.includes(acao.t)) throw new Error('Ação inválida.');
  if (acao.t !== 'pet' && typeof acao.id !== 'string') throw new Error('Ação inválida.');
  const chaves = Object.keys(acao).filter(k => !['t', 'id'].includes(k));
  if (chaves.length) throw new Error('Ação inválida.');
}

// Aplica uma ação do jogador e o turno da doença. Devolve o novo estado e os eventos (mensagem, efeito
// visual e retrato do estado naquele momento) para a interface reproduzir a sequência.
export function aplicarAcao(anterior, acao, doenca, petId) {
  validarAcao(acao);
  if (anterior.fim) throw new Error('A batalha já terminou.');
  const s = structuredClone(anterior);
  const d = doenca;
  const pet = obterPet(petId);
  const hips = hipotesesDe(d);
  const eventos = [];
  const ev = (msg, fx) => eventos.push({ msg, fx: fx || null, hp: s.hp, stab: s.stab, revealed: s.revealed, evolved: s.evolved,
    buff: s.buff, neutral: s.neutral, petReady: s.petReady, petUsed: s.petUsed, pistas: s.clues.length });
  const pista = (t, src) => { if (!s.clues.some(c => c.t === t)) s.clues.push({ t, src }); };
  const bom = t => { if (!s.good.includes(t)) s.good.push(t); };
  const atingir = dano => {
    let hp = Math.max(0, s.hp - dano), preso = false;
    if (s.buff && d.buff.kind === 'escudo' && hp < 25) { hp = Math.min(s.hp, 25); preso = true; }
    s.hp = hp;
    ev('', 'foe-hit');
    if (preso) ev(d.buff.escudo || 'A doença resiste! A carga não passa de 25%.');
  };
  const cuidar = n => { s.stab = Math.min(100, s.stab + n); ev('', 'heal'); };

  if (acao.t === 'golpe') {
    const mv = MOVES.find(m => m.id === acao.id);
    if (!mv) throw new Error('Habilidade inválida.');
    if (s.cd[mv.id] > 0) throw new Error('Habilidade em recarga.');
    if (mv.id === 'critica' && !s.buff) throw new Error('Não há buff ativo.');
    s.cd[mv.id] = mv.cd + 1;
    ev(`Você usou ${mv.id === 'critica' ? d.buff.resposta : mv.nome}!`, 'me-lunge');
    if (mv.id === 'critica') {
      s.buff = false; s.neutral = true;
      ev('', 'shot:critica');
      ev(`${d.buff.nome} ${d.buff.neutra}!`);
      ev(d.buff.explica);
      bom(`Resposta crítica contra ${d.buff.nome}: ${d.buff.resposta.toLowerCase()}.`);
      atingir(8);
    } else if (mv.id === d.cura) {
      const dobro = s.boost && mv.id === 'bacti';
      const dano = Math.round((mv.id === 'suporte' ? 26 : 30) * (s.revealed ? 1 : 0.8) * (dobro ? 2 : 1));
      ev('', `shot:${mv.id}`);
      atingir(dano);
      ev(s.revealed ? 'É super eficaz!' : 'Mesmo sem diagnóstico, fez efeito! É super eficaz!');
      if (dobro) { s.boost = false; ev('Com a Coloração de Gram, o golpe causou o dobro.'); }
      if (mv.id === 'suporte') cuidar(10);
      bom(`${mv.nome} (${mv.desc.toLowerCase()}) é a conduta que controla ${d.nome.toLowerCase()}.`);
    } else if (mv.id === 'suporte') {
      const antes = s.stab;
      cuidar(16);
      ev('O paciente ficou mais estável. A doença segue ativa.');
      if (antes < 70) bom('Suporte Vital quando a estabilidade caiu.');
    } else {
      ev('', `miss:${mv.id}`);
      ev('Não surtiu efeito…');
      // Antes do diagnóstico, o motivo exato entregaria a doença: vira pista de exclusão e o porquê vai para o relatório.
      if (s.revealed) ev(d.porque[mv.id] || 'Essa terapia não age sobre este agente.');
      else { pista(`${mv.nome} (${mv.desc.toLowerCase()}) não fez efeito.`, 'Tentativa'); ev('Essa terapia não age sobre o agente desta doença. Anotado como pista.'); }
      s.hp = Math.min(100, s.hp + 6); s.ineff++;
      s.bad.push(`${mv.nome}: ${d.porque[mv.id] || 'não age sobre este agente.'}`);
      ev('Tempo perdido: a doença ganhou força.', 'foe-pump');
    }
  } else if (acao.t === 'exame') {
    const ex = EXAMES.find(e => e.id === acao.id);
    if (!ex || !d.kit.includes(ex.id)) throw new Error('Exame indisponível nesta batalha.');
    if (s.exams.includes(ex.id)) throw new Error('Exame já realizado.');
    s.exams.push(ex.id);
    ev(`Você pediu ${ex.nome}.`, 'scan');
    const resultado = d.exames[ex.id] || 'Sem alterações.';
    pista(resultado, ex.nome);
    ev(`Resultado: ${resultado}`);
    if (d.chave === ex.id) bom(`${ex.nome} trouxe o achado que sustenta o diagnóstico.`);
  } else if (acao.t === 'hipotese') {
    const h = hips.find(x => x.id === acao.id);
    if (!h || s.revealed || s.elim.includes(h.id)) throw new Error('Hipótese indisponível.');
    ev(`Hipótese registrada: ${h.nome}.`);
    if (h.id !== d.id) {
      s.elim.push(h.id); s.wrongHyp++; s.stab = Math.max(0, s.stab - 8);
      ev(`Não é ${h.nome}. Hipótese descartada.`, 'me-hurt');
      ev('Tempo perdido: a estabilidade do paciente caiu 8.');
      s.bad.push(`Hipótese errada: ${h.nome}.`);
    } else {
      s.revealed = true;
      s.elim = hips.filter(y => y.id !== d.id).map(y => y.id);
      ev(`Diagnóstico confirmado: ${d.nome}!`, 'reveal');
      atingir(10);
      bom(s.wrongHyp ? `Diagnóstico de ${d.nome.toLowerCase()} depois de ${s.wrongHyp} hipótese${s.wrongHyp > 1 ? 's' : ''} descartada${s.wrongHyp > 1 ? 's' : ''}.` : `Diagnóstico de ${d.nome.toLowerCase()} na primeira hipótese.`);
      ev('Espere… a doença está se adaptando!');
      s.evolved = true; s.buff = true;
      ev(`${d.buff.nome}! ${d.buff.desc}`, 'evolve');
    }
  } else {
    if (!s.petReady || s.petUsed) throw new Error('O pet ainda não pode ajudar.');
    s.petUsed = true;
    ev(`${pet.nome}, agora! ${pet.hab}!`, 'pet-cast');
    if (pet.id === 'cocobi') {
      if (d.agente === 'bacteria' && d.gram) { s.boost = true; pista(d.gram.clue, 'Cocobi'); ev(d.gram.boost); }
      else { pista('Gram sem bactérias na amostra.', 'Cocobi'); ev('Nenhuma bactéria no Gram. Pense em vírus ou parasita.'); }
    } else if (pet.id === 'capsi') {
      const tirar = hips.filter(h => h.id !== d.id && !s.elim.includes(h.id)).slice(0, 2).map(h => h.id);
      s.elim.push(...tirar);
      pista(d.agente === 'virus' ? 'Radar viral: o agente é um vírus.' : 'Radar viral: não é um vírus.', 'Capsi');
      ev(`${d.agente === 'virus' ? 'É um vírus!' : 'Não é vírus.'} Duas hipóteses erradas foram descartadas.`);
    } else {
      s.guard = true;
      cuidar(35);
      ev('Estabilidade recuperada. A próxima piora será contida.');
    }
    bom(`${pet.nome} usou ${pet.hab} no momento crítico.`);
  }

  if (s.hp <= 0) {
    s.fim = 'vitoria';
    ev(`${s.revealed ? d.nome : 'A doença'} foi controlada!`, 'faint');
    return { estado: s, eventos };
  }

  // turno da doença
  const g = d.golpes[s.golpe % d.golpes.length];
  s.golpe++;
  ev(`${s.revealed ? d.nome : 'A doença desconhecida'} usou ${g.nome}!`, 'foe-lunge');
  let dano = d.ataque + (g.extra || 0);
  if (s.buff && d.buff.kind === 'forca') dano = Math.round(dano * 1.5);
  if (s.guard) { s.guard = false; dano = 0; ev(`${pet.nome} conteve a piora!`, 'pet-cast'); }
  if (dano) { s.stab = Math.max(0, s.stab - dano); ev('', 'me-hurt'); }
  if (!s.clues.some(c => c.t === g.pista)) { pista(g.pista, 'Sintoma'); ev(`Nova pista: ${g.pista}`); }
  if (s.buff && d.buff.kind === 'sangria' && s.stab > 0) {
    s.stab = Math.max(0, s.stab - 6);
    ev(d.buff.turno || `${d.buff.nome}. Estabilidade −6.`, 'me-hurt');
  }
  if (s.stab <= 0) {
    s.fim = 'derrota';
    ev(`A estabilidade de ${d.paciente.split(',')[0]} chegou a zero.`, 'down');
    ev('Paciente transferido para a UTI. A batalha foi encerrada.');
    return { estado: s, eventos };
  }
  s.turn++;
  for (const k of Object.keys(s.cd)) s.cd[k] = Math.max(0, s.cd[k] - 1);
  if (!s.petUsed && !s.petReady && (s.stab < 60 || s.buff)) {
    s.petReady = true;
    ev(`${pet.nome} está pronto para ajudar! Momento crítico.`, 'pet-ready');
  }
  return { estado: s, eventos };
}

export function executarBatalha(doenca, petId, acoes = []) {
  if (!Array.isArray(acoes) || acoes.length > MAXIMO_ACOES) throw new Error('Registro de ações inválido.');
  let estado = criarEstado();
  for (const acao of acoes) estado = aplicarAcao(estado, acao, doenca, petId).estado;
  return estado;
}

// Regras propostas no protótipo; aguardam aprovação da economia antes da liberação para jogadores.
// Tutorial: 50 XP uma vez. História: XP só na primeira vitória de cada doença e versão.
// Duelo (1 ticket): XP em toda partida concluída.
export function recompensaBatalha(estado, { modo, primeiraVez = true } = {}) {
  if (modo === 'tutorial') {
    const linhas = [['Treinamento concluído', primeiraVez ? 50 : 0], [estado.fim === 'vitoria' ? 'Pneumonia controlada' : 'Paciente transferido', 0]];
    return { linhas, xp: primeiraVez ? 50 : 0 };
  }
  const linhas = estado.fim === 'vitoria' ? [
    ['Doença controlada', 60],
    [estado.revealed ? (estado.wrongHyp ? 'Diagnóstico com hipóteses erradas' : 'Diagnóstico na primeira hipótese') : 'Sem diagnóstico confirmado', estado.revealed ? (estado.wrongHyp ? 10 : 20) : 0],
    ['Buff neutralizado', estado.neutral ? 20 : 0],
    ['Escolhas ineficazes', -5 * estado.ineff],
  ] : [
    ['Transferência para a UTI', 10],
    [estado.revealed ? 'Diagnóstico confirmado' : 'Sem diagnóstico confirmado', estado.revealed ? 10 : 0],
  ];
  let xp = Math.max(0, linhas.reduce((total, [, valor]) => total + valor, 0));
  if (modo === 'historia' && (!primeiraVez || estado.fim !== 'vitoria')) {
    linhas.push([primeiraVez ? 'História: XP só na vitória' : 'Doença já concluída na História', 0]);
    xp = 0;
  }
  return { linhas, xp };
}

// Resumo guardado no perfil ao encerrar, para o relatório sobreviver à recarga da página.
export function relatorioBatalha(estado, doenca, petId) {
  return {
    resultado: estado.fim, turnos: estado.turn, pistas: estado.clues, corretas: estado.good, ineficazes: estado.bad,
    revelada: estado.revealed, buffAtivado: estado.evolved, buffNeutralizado: estado.neutral, petUsado: estado.petUsed,
    doencaId: doenca.id, pet: petId,
  };
}
