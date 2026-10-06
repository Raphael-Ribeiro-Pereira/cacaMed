// Coroas por matéria: um trono por matéria, para quem somar mais XP na semana.
// A semana segue o horário de Brasília (UTC−3, sem horário de verão) e fecha
// no domingo às 23:59. O XP semanal sai dos aumentos de xpTopicos, então vale
// para qualquer modo que já registra XP por tema.
export const MATERIAS = [
  { id: 'anatomia', nome: 'Anatomia', chave: 'ANATOMIA', cor: '#ff4d7e' },
  { id: 'neurologia', nome: 'Neurologia', chave: 'NEUROLOGIA', cor: '#a78bfa' },
  { id: 'farmaco', nome: 'Farmacologia', chave: 'FARMACOLOGIA', cor: '#00f5d4' },
  { id: 'micro', nome: 'Microbiologia', chave: 'MICROBIOLOGIA', cor: '#7ee081' },
  { id: 'patologia', nome: 'Patologia', chave: 'PATOLOGIA', cor: '#5cc8ff' },
  { id: 'clinica', nome: 'Clínica Geral', chave: 'CLÍNICA GERAL', cor: '#ffb95f' },
];

const normalizar = valor => String(valor || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
const REGRAS = [
  ['neurologia', /NEURO/],
  ['farmaco', /FARMACO/],
  ['micro', /MICRO|VIRUS|BACTERIA|PARASIT|IMUNO|INFECT|DDX-BATALHA/],
  ['patologia', /PATO|DOENCA|HISTO|CELULA/],
  ['anatomia', /ANATOMIA|OSSO|ESQUELETICO|MUSCUL/],
];
export const materiaDoTopico = chave => REGRAS.find(([, regra]) => regra.test(normalizar(chave)))?.[0] || 'clinica';

// Mesma regra de título épico do crachá.
export function tituloEpico(materia) {
  const m = normalizar(materia);
  if (m.includes('NEURO')) return ['Devorador de Cérebros', '🧠', '#8b5cf6'];
  if (m.includes('OSSO') || m.includes('ESQUELETICO')) return ['Devorador de Ossos', '🦴', '#dce2f7'];
  if (m.includes('MUSCUL') || m.includes('ANATOMIA')) return ['Escultor de Corpos', '💪', '#ff4d7e'];
  if (m.includes('FARMACO')) return ['O Alquimista Químico', '💊', '#00f5d4'];
  if (m.includes('MICRO') || m.includes('VIRUS') || m.includes('BACTERIA')) return ['Caçador de Vírus', '🦠', '#00dfc1'];
  if (m.includes('IMUNO')) return ['Lorde dos Anticorpos', '🛡️', '#8b5cf6'];
  if (m.includes('PATO') || m.includes('DOENCA')) return ['Detetive de Lâminas', '🔬', '#8b5cf6'];
  if (m.includes('HISTO') || m.includes('CELULA')) return ['Mestre Celular', '🧬', '#ff4d7e'];
  return ['Bisturi de Ouro', '🛡️', '#ffb95f'];
}

const FUSO = -3 * 3600000;
const DIA = 86400000;
// Data "de parede" em Brasília, representada nos campos UTC.
const local = agora => new Date(new Date(agora).getTime() + FUSO);
export function semanaCoroas(agora = new Date()) {
  const l = local(agora);
  const d = new Date(Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const semana = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / DIA + 1) / 7);
  return `${d.getUTCFullYear()}-S${String(semana).padStart(2, '0')}`;
}
export const numeroSemana = semana => Number(String(semana).split('-S')[1]) || 0;
// Instante em que as coroas da semana fecham: domingo, 23:59:59.999 em Brasília.
export function fimDaSemana(agora = new Date()) {
  const l = local(agora);
  const dias = (7 - l.getUTCDay()) % 7;
  return new Date(Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate() + dias, 23, 59, 59, 999) - FUSO);
}

// Acumula no perfil o XP ganho por matéria nesta semana; zera quando a semana vira.
export function registrarXpSemanal(antes, depois, agora = new Date()) {
  const ganhos = {};
  for (const [chave, valor] of Object.entries(depois.xpTopicos || {})) {
    const delta = (Number(valor) || 0) - (Number(antes.xpTopicos?.[chave]) || 0);
    if (delta > 0) { const m = materiaDoTopico(chave); ganhos[m] = (ganhos[m] || 0) + delta; }
  }
  if (!Object.keys(ganhos).length) return depois;
  const semana = semanaCoroas(agora);
  const xp = { ...(depois.coroas?.semana === semana ? depois.coroas.xp : {}) };
  for (const [m, v] of Object.entries(ganhos)) xp[m] = (Number(xp[m]) || 0) + v;
  return { ...depois, coroas: { semana, xp } };
}

export const xpDaSemana = (perfil, agora = new Date()) => perfil?.coroas?.semana === semanaCoroas(agora) ? perfil.coroas.xp : {};

// Tabela pública: os dez primeiros de cada matéria, só com XP positivo.
export function montarCoroas(jogadores, agora = new Date()) {
  const semana = semanaCoroas(agora);
  const materias = Object.fromEntries(MATERIAS.map(m => [m.id, jogadores
    .filter(j => j.coroas?.semana === semana && Number(j.coroas.xp?.[m.id]) > 0)
    .map(j => ({ idPublico: j.idPublico, nome: j.nome, xp: Number(j.coroas.xp[m.id]) }))
    .sort((a, b) => b.xp - a.xp || a.idPublico.localeCompare(b.idPublico)).slice(0, 10)]));
  return { semana, fim: fimDaSemana(agora).toISOString(), materias };
}
export const inicioDaSemana = (agora = new Date()) => new Date(fimDaSemana(agora).getTime() + 1 - 7 * DIA);

// Tabela já montada no cliente ({ materias: { id: [{ id, nome, xp, me }] } }): matérias em que o jogador lidera.
export const coroasDoJogador = tabela => MATERIAS.filter(m => tabela?.materias[m.id]?.[0]?.me);

// Junta a tabela pública com o XP semanal do próprio perfil, que pode estar mais novo que o servidor.
export function montarTabelaCoroas(publica, meuId, meuNome, meuXp = {}, agora = new Date()) {
  const semana = semanaCoroas(agora);
  const valida = publica?.semana === semana ? publica : { semana, materias: {} };
  return { semana, fim: valida.fim || fimDaSemana(agora).toISOString(), materias: Object.fromEntries(MATERIAS.map(m => {
    const lista = (valida.materias?.[m.id] || []).map(r => ({ id: r.idPublico, nome: r.nome, xp: Number(r.xp) || 0, me: Boolean(meuId) && r.idPublico === meuId }));
    const meu = Number(meuXp[m.id]) || 0;
    const i = lista.findIndex(r => r.me);
    if (i >= 0) lista[i] = { ...lista[i], xp: Math.max(lista[i].xp, meu) };
    else if (meu > 0) lista.push({ id: meuId || 'eu', nome: meuNome, xp: meu, me: true });
    return [m.id, lista.sort((a, b) => b.xp - a.xp)];
  })) };
}
