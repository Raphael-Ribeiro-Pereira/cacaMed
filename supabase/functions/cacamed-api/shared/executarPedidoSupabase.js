import { operarTreinoSupabase, eventosTreino } from './operarTreinoSupabase.js';
import { operarRevisaoSupabase, eventosRevisao } from './operarRevisaoSupabase.js';
import { registrarPartidaSupabase, operarAdminSupabase, operarPlantaoSupabase, operarAuditoriaSupabase, operarRelacaoSupabase } from './operarJogosSupabase.js';
import { migrarEconomia } from '../utils/economia.js';
import { prepararMissoesDoDia } from '../utils/missoes.js';

export const ACOES_REVISAO = ['consultarRevisao', 'iniciarRevisao', 'responderRevisao', 'encerrarRevisao'];
export function executarPedidoSupabase(original, pedido, { recibos = [], tentativas = [], revisoes = [] } = {}) {
  let perfil = migrarEconomia(original);
  const preparo = prepararMissoesDoDia(perfil);
  if (preparo) perfil = { ...perfil, dataUltimoLogin: preparo.dataUltimoLogin, missoesDiarias: preparo.missoesDiarias };
  let eventos = [];
  if (pedido.acao === 'obterPerfil') return { perfil, eventos };
  if (ACOES_REVISAO.includes(pedido.acao)) {
    perfil = operarRevisaoSupabase(perfil, pedido, tentativas, revisoes, recibos);
    eventos = eventosRevisao(perfil);
  } else if (['iniciarTreino', 'responderTreino', 'abandonarTreino'].includes(pedido.acao)) {
    perfil = operarTreinoSupabase(perfil, pedido, recibos);
    eventos = eventosTreino(perfil, pedido.modo);
  } else if (pedido.acao === 'registrarPartida') {
    perfil = registrarPartidaSupabase(perfil, pedido.partida, recibos);
    eventos = [{ id: `recibo:${pedido.partida.id}`, kind: 'recibo', data: { modo: 'cruzadinha', rodadaId: pedido.partida.id } }];
  } else if (pedido.acao === 'tutorial') perfil = { ...perfil, tutorialCruzadinhasConcluido: true };
  else if (pedido.acao === 'editarPerfil') {
    const nome = String(pedido.nome || '').trim();
    const username = String(pedido.username || '').trim();
    if (nome.length < 2 || nome.length > 80 || username.length < 2 || username.length > 40 || /^[=+\-@]/.test(nome) || /^[=+\-@]/.test(username)) throw new Error('Nome inválido.');
    perfil = { ...perfil, nome, username };
  } else if (pedido.acao === 'admin') {
    if (perfil.role !== 'admin') throw new Error('Acesso restrito ao administrador.');
    perfil = operarAdminSupabase(perfil, pedido);
  } else {
    const configuracao = [
      { acoes: ['iniciarPlantao', 'acaoPlantao'], operar: operarPlantaoSupabase, campo: 'ddx', encerrada: e => e.relatorio?.encerrado },
      { acoes: ['iniciarAuditoria', 'responderAuditoria'], operar: operarAuditoriaSupabase, campo: 'erroMedico', encerrada: e => Boolean(e.relatorio) },
      { acoes: ['iniciarRelacao', 'responderRelacao'], operar: operarRelacaoSupabase, campo: 'causaEfeito', encerrada: e => Boolean(e.relatorio) },
    ].find(c => c.acoes.includes(pedido.acao));
    if (!configuracao) throw new Error('Ação desconhecida.');
    perfil = configuracao.operar(perfil, pedido, recibos);
    const entrada = perfil[configuracao.campo].entrada;
    if (configuracao.encerrada(entrada)) eventos.push({ id: `recibo:${entrada.id}`, kind: 'recibo',
      data: { modo: configuracao.campo, rodadaId: entrada.id, xpConcedido: entrada.xpConcedido, data: entrada.encerradoEm } });
  }
  return { perfil, eventos };
}
