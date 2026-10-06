import { DOENCAS } from './batalha.js';
import { resumirCruzadinhas } from './progressoCruzadinha.js';
import { fmt } from './prototipo.js';

// Modos do jogo e o resumo de cada um a partir do perfil (Estatísticas e cartão de progresso do menu).
export const MODOS = [
  ['cruzadinha', 'Cruzadinhas', 'var(--mint)'], ['quiz', 'Quiz', '#5cc8ff'], ['verdadeMentira', 'Verdadeiro ou mentira', 'var(--amber)'],
  ['ddx', 'Plantão médico', '#b49cff'], ['erroMedico', 'Erro médico', '#8b5cf6'], ['causaEfeito', 'Causa e efeito', '#6d4bd8'], ['batalha', 'Batalha diagnóstica', '#ff5c8a'],
];
const n = v => Number(v) || 0;

export function dadosModo(p, id) {
  if (id === 'cruzadinha') {
    const r = resumirCruzadinhas(p.estatisticas);
    const xp = Object.entries(p.xpTopicos || {}).filter(([k]) => !k.startsWith('DDX-')).reduce((t, [, v]) => t + n(v), 0);
    return { partidas: r.partidas, acertos: r.letras, erros: n(p.estatisticasGerais?.errosTotais), unidade: 'letras', xp,
      recompensa: r.partidas ? `${fmt(r.partidas * 2)} tickets · maior palavra com ${n(p.estatisticasGerais?.maiorPalavra)} letras` : '2 tickets por cruzadinha' };
  }
  if (id === 'quiz' || id === 'verdadeMentira') {
    const t = p.treinos?.[id] || {};
    return { partidas: n(t.partidas), acertos: n(t.acertos), erros: Math.max(0, n(t.itens) - n(t.acertos)), unidade: id === 'quiz' ? 'perguntas' : 'frases', xp: n(t.xp),
      recompensa: `${n(t.medidor)}/2 rodadas para o próximo ticket` };
  }
  if (id === 'ddx') {
    const d = p.ddx || {};
    return { partidas: n(d.partidas), acertos: n(d.seguros), erros: Math.max(0, n(d.partidas) - n(d.seguros)), unidade: 'plantões', xp: n(d.xp),
      recompensa: n(d.seguros) ? `${n(d.seguros)} plantão${n(d.seguros) > 1 ? 'ões' : ''} seguro${n(d.seguros) > 1 ? 's' : ''}` : '—' };
  }
  if (id === 'batalha') {
    const b = p.batalha || {};
    return { partidas: n(b.partidas), acertos: n(b.vitorias), erros: Math.max(0, n(b.partidas) - n(b.vitorias)), unidade: 'batalhas', xp: n(b.xp),
      recompensa: `${(b.descobertas || []).length}/${DOENCAS.length} doenças descobertas` };
  }
  const a = p[id] || {};
  return { partidas: n(a.partidas), acertos: n(a.acertos), erros: Math.max(0, n(a.etapas) - n(a.acertos)), unidade: 'etapas', xp: n(a.xp), recompensa: '—' };
}
