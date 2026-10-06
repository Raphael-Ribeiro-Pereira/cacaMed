import { buscarRankingPublico } from './rankingPublico';

// Ranking público guardado durante a sessão: o menu e a tela de Ranking abrem com a última
// lista na hora e atualizam por trás. Pedidos simultâneos (hover na barra lateral, menu) viram um só.
let cache = null;
let pendente = null;
export const rankingEmCache = () => cache;
export const guardarRanking = lista => { cache = lista; };
export function carregarRanking(buscar = buscarRankingPublico) {
  if (pendente) return pendente;
  pendente = buscar().then(lista => { cache = lista; pendente = null; return lista; }, falha => { pendente = null; throw falha; });
  return pendente;
}
