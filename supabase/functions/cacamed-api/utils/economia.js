export const VERSAO_ECONOMIA = 2;
export const nivelPorXP = xp => Math.floor(Math.sqrt(Math.max(0, Number(xp) || 0) / 500)) + 1;
export const xpParaNivel = nivel => 500 * (Math.max(1, nivel) - 1) ** 2;
export function progressoGlobal(perfil) {
  const xp = Math.max(0, Number(perfil?.pontuacaoTotal) || 0);
  const nivel = nivelPorXP(xp);
  const base = xpParaNivel(nivel);
  const proximo = xpParaNivel(nivel + 1);
  return { nivel, xp, base, proximo, percentual: (xp - base) / (proximo - base) * 100 };
}
export function migrarEconomia(perfil) {
  if (perfil.economia?.versao === VERSAO_ECONOMIA) return perfil;
  return { ...perfil, economia: { versao: VERSAO_ECONOMIA, ultimoNivelPremiado: nivelPorXP(perfil.pontuacaoTotal) } };
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
