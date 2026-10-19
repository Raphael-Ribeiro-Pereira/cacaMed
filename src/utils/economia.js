// Economia v3 (decidida em 07/10/2026, fórmulas dos bônus aprovadas em 19/10/2026; docs/economia-v3.md).
export const VERSAO_ECONOMIA = 3;
export const XP_JOGO = 100;
export const XP_DDX = 300;
export const XP_BATALHA = 500;
// Tempo esperado de uma rodada de 5 itens, em segundos. O servidor mede do início à conclusão; a tela não mostra.
export const TEMPO_ESPERADO_TREINO = { teoria: 60, casos: 120, misto: 60 };
export const SEGUNDOS_POR_PALAVRA = 15;

export const nivelPorXP = xp => Math.floor(Math.sqrt(Math.max(0, Number(xp) || 0) / 500)) + 1;
export const xpParaNivel = nivel => 500 * (Math.max(1, nivel) - 1) ** 2;
export function progressoGlobal(perfil) {
  const xp = Math.max(0, Number(perfil?.pontuacaoTotal) || 0);
  const nivel = nivelPorXP(xp);
  const base = xpParaNivel(nivel);
  const proximo = xpParaNivel(nivel + 1);
  return { nivel, xp, base, proximo, percentual: (xp - base) / (proximo - base) * 100 };
}

// Tempo: valor cheio até a metade do esperado, cai em linha reta e zera em 1,5 vez o esperado.
// Tempo desconhecido ou impossível (negativo, não numérico) não paga bônus.
export function bonusTempo(segundos, esperado, maximo) {
  const s = Number(segundos);
  if (!Number.isFinite(s) || s < 0 || !(esperado > 0)) return 0;
  if (s <= esperado * 0.5) return maximo;
  if (s >= esperado * 1.5) return 0;
  return Math.round(maximo * (esperado * 1.5 - s) / esperado);
}
// Quiz e Verdade ou mentira: até +50, metade pelos acertos e metade pelo tempo.
export const bonusTreino = (acertos, total, segundos, esperado) =>
  Math.round(25 * Math.max(0, Math.min(acertos, total)) / total) + bonusTempo(segundos, esperado, 25);
// Cruzadinha: até +50 pelo tempo, menos a penalidade das dicas, sem passar de zero.
export const bonusCruzadinha = (segundos, esperado, penalidadeDicas = 0) =>
  Math.max(0, bonusTempo(segundos, esperado, 50) - Math.max(0, Number(penalidadeDicas) || 0));
// DDX: até +100 pela fração de acertos de primeira; sem o caminho seguro, vale metade.
export const bonusDdx = (fracaoPrimeira, seguro) =>
  Math.round(100 * Math.max(0, Math.min(1, Number(fracaoPrimeira) || 0)) * (seguro ? 1 : 0.5));
export const segundosEntre = (inicio, fim) => {
  const s = (new Date(fim).getTime() - new Date(inicio).getTime()) / 1000;
  return Number.isFinite(s) ? s : NaN;
};

// A troca de versão não paga nada retroativo: XP, tickets e níveis ficam como estão.
export function migrarEconomia(perfil) {
  if (perfil.economia?.versao === VERSAO_ECONOMIA) return perfil;
  const nivel = nivelPorXP(perfil.pontuacaoTotal);
  return { ...perfil, economia: { ...perfil.economia, versao: VERSAO_ECONOMIA,
    ultimoNivelPremiado: Math.max(Number(perfil.economia?.ultimoNivelPremiado) || 0, nivel) } };
}
export function concederRecompensa(perfil, xp, tickets = 0) {
  if (!Number.isInteger(xp) || xp < 0 || !Number.isInteger(tickets) || tickets < 0) throw new Error('Recompensa inválida.');
  const base = migrarEconomia(perfil);
  const pontuacaoTotal = (Number(base.pontuacaoTotal) || 0) + xp;
  const anterior = Math.max(base.economia.ultimoNivelPremiado, nivelPorXP(base.pontuacaoTotal));
  const nivel = nivelPorXP(pontuacaoTotal);
  const ticketsNivel = nivel > anterior ? (nivel * (nivel + 1) - anterior * (anterior + 1)) / 2 : 0;
  return { ...base, pontuacaoTotal, tickets: (Number(base.tickets) || 0) + tickets + ticketsNivel,
    economia: { ...base.economia, ultimoNivelPremiado: Math.max(anterior, nivel) } };
}
