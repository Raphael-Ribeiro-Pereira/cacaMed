import { criarEntradaTreino, responderTreinoPerfil } from '../utils/treinos.js';

export function operarTreinoSupabase(perfil, pedido, recibos = []) {
  const { modo, acao, entradaId } = pedido;
  if (!['quiz', 'verdadeMentira'].includes(modo)) throw new Error('Modo inválido.');
  const stats = perfil.treinos?.[modo] || {};
  const entrada = stats.entrada;
  if (acao === 'iniciarTreino') {
    if (entrada && (!entrada.encerrada || entrada.id === entradaId)) return perfil;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entradaId || '')) throw new Error('Identificador inválido.');
    if (recibos.includes(entradaId)) throw new Error('Esta rodada já foi encerrada.');
    return { ...perfil, treinos: { ...perfil.treinos, [modo]: { ...stats,
      entrada: criarEntradaTreino(modo, pedido.variante, entradaId, entrada) } } };
  }
  if (!entrada || entrada.id !== entradaId) throw new Error('Rodada não encontrada. Consulte o progresso salvo.');
  if (acao === 'abandonarTreino') {
    if (entrada.encerrada) return perfil;
    return { ...perfil, treinos: { ...perfil.treinos, [modo]: { ...stats,
      entrada: { ...entrada, encerrada: true, abandonada: true } } } };
  }
  if (acao !== 'responderTreino') throw new Error('Operação inválida.');
  return responderTreinoPerfil(perfil, modo, entradaId, pedido.respostas);
}

export function eventosTreino(perfil, modo, agora = new Date().toISOString()) {
  const entrada = perfil.treinos?.[modo]?.entrada;
  if (!entrada) return [];
  const eventos = entrada.resultados.map(r => ({
    id: `resposta:${entrada.id}:${r.itemId}`, kind: 'resposta',
    data: { ...r, modo, rodadaId: entrada.id, variante: entrada.variante, data: agora },
  }));
  if (entrada.encerrada) eventos.push({ id: `recibo:${entrada.id}`, kind: 'recibo',
    data: { rodadaId: entrada.id, modo, relatorio: entrada.relatorio || null, abandonada: Boolean(entrada.abandonada) } });
  return eventos;
}
