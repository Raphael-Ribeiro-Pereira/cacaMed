// Memória das palavras que o jogador já respondeu em cada tópico da cruzadinha (decidido em 15/10/2026).
// A grade prefere palavras novas do nível, depois novas dos outros níveis; as já respondidas só voltam
// quando faltam novas, das mais antigas para as mais recentes. O que fazer quando o tópico acaba é pendência.
export const LIMITE_MEMORIA_TOPICO = 600;

export const palavraDaMemoria = valor => String(valor || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toUpperCase().trim().replace(/\s+/g, ' ');
const valida = palavra => /^[A-Z0-9 ]{2,40}$/.test(palavra);

// Lista do tópico, da resposta mais antiga para a mais recente, sem repetir: quem foi respondido de novo vai para o fim.
export function lembrarRespostas(anteriores, novas, limite = LIMITE_MEMORIA_TOPICO) {
  const recentes = [...new Set((Array.isArray(novas) ? novas : []).map(palavraDaMemoria).filter(valida))];
  const ficam = (Array.isArray(anteriores) ? anteriores : []).map(palavraDaMemoria).filter(p => valida(p) && !recentes.includes(p));
  return [...new Set(ficam), ...recentes].slice(-limite);
}
