import { operarTreinoSupabase, eventosTreino } from './operarTreinoSupabase.js';
import { operarRevisaoSupabase, eventosRevisao, sincronizarSessaoRevisao, errosFicticiosRevisao } from './operarRevisaoSupabase.js';
import { agoraDaRevisao } from '../utils/revisaoInteligente.js';
import { emitirCruzadinhaSupabase, registrarPartidaSupabase, operarAdminSupabase, operarPlantaoSupabase, operarAuditoriaSupabase, operarRelacaoSupabase, operarBatalhaSupabase } from './operarJogosSupabase.js';
import { eventosBatalha } from '../utils/batalhaRevisao.js';
import { tentativaErroMedico } from '../utils/erroMedicoRevisao.js';
import { operarFilaSupabase } from './operarFilaSupabase.js';
import { AUDITORIAS } from '../utils/erroMedico.js';
import { registrarXpSemanal } from '../utils/coroas.js';
import { concederRecompensa, migrarEconomia } from '../utils/economia.js';
import { dataLocalHoje, prepararMissoesDoDia } from '../utils/missoes.js';
import { materiaValida, validarCurso } from '../utils/curso.js';

export const ACOES_REVISAO = ['consultarRevisao', 'iniciarRevisao', 'responderRevisao', 'encerrarRevisao'];
export const FOTOS_CRACHA = 6;
// Regra do crachá para um username novo; nomes antigos continuam válidos até serem trocados.
export const usernameValido = username => /^[a-z0-9._]{3,20}$/.test(username);
// Título legível da cruzadinha no histórico: matéria da chave e o tópico como o jogador viu (com acentos).
const tituloCruzadinha = partida => {
  const materia = String(partida.chaveXP || '').split('-')[0].toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, l => l.toLocaleUpperCase('pt-BR'));
  return `${materia} · ${String(partida.subMateria || '').trim()}`.slice(0, 90);
};
// Caso do DDX da fila offline (docs/app-offline.md#tickets-do-ddx-offline): os pedidos do caso (admissão e respostas,
// todos com o mesmo entradaId, que é o id do item) passam pelas mesmas regras de um pedido online. Se o saldo zerou
// antes de a admissão chegar (outro aparelho gastou o último ticket), o caso é recusado e não paga XP.
export const PEDIDOS_DDX_OFFLINE = ['iniciarPlantao', 'acaoPlantao', 'iniciarAuditoria', 'responderAuditoria', 'iniciarRelacao', 'responderRelacao'];
function sincronizarPedidosDdx(perfil, item, opcoes) {
  if (!/^[0-9a-f-]{36}$/i.test(String(item.id || ''))) throw new Error('Item da fila inválido.');
  if (opcoes.recibos.includes(item.id)) return { perfil, eventos: [] };
  const pedidos = item.dados?.pedidos;
  if (!Array.isArray(pedidos) || !pedidos.length || pedidos.length > 60
      || pedidos.some(p => !PEDIDOS_DDX_OFFLINE.includes(p?.acao) || p.entradaId !== item.id)) throw new Error('Caso da fila inválido.');
  let atual = perfil;
  const eventos = [];
  for (const p of pedidos) {
    let r;
    try { r = executarPedidoSupabase(atual, p, { ...opcoes, recibos: [] }); }
    catch (erro) { throw new Error(/Tickets insuficientes/.test(erro.message) ? 'Sem ticket na sincronização: o caso jogado sem internet não pagou XP.' : erro.message); }
    atual = r.perfil;
    eventos.push(...r.eventos);
  }
  return { perfil: atual, eventos };
}

// `banco`: banco de palavras com as dicas de todas as planilhas (só a emissão da cruzadinha usa).
export function executarPedidoSupabase(original, pedido, { recibos = [], tentativas = [], revisoes = [], agora = new Date(), banco } = {}) {
  let perfil = migrarEconomia(original);
  // Primeiro pedido do dia: missões novas, ofensiva e o XP do login (sem ticket).
  const preparo = prepararMissoesDoDia(perfil, dataLocalHoje(agora));
  if (preparo) perfil = { ...concederRecompensa(perfil, preparo.xpLogin), dataUltimoLogin: preparo.dataUltimoLogin,
    missoesDiarias: preparo.missoesDiarias, ofensiva: preparo.ofensiva };
  const base = perfil;
  let eventos = [];
  if (pedido.acao === 'obterPerfil') return { perfil, eventos };
  // App offline: caso do DDX jogado sem rede chega como a sequência de pedidos e é refeito aqui, em ordem.
  if (pedido.acao === 'sincronizarFila' && pedido.item?.tipo === 'pedidosDdx') return sincronizarPedidosDdx(perfil, pedido.item, { recibos, tentativas, revisoes, agora, banco });
  // A Revisão usa o relógio do servidor, adiantado só para o admin que pediu (ferramenta de teste).
  if (pedido.acao === 'sincronizarFila' && pedido.item?.tipo === 'sessaoRevisao') return sincronizarSessaoRevisao(perfil, pedido.item, tentativas, revisoes, recibos, agoraDaRevisao(perfil, agora));
  if (ACOES_REVISAO.includes(pedido.acao)) {
    perfil = operarRevisaoSupabase(perfil, pedido, tentativas, revisoes, recibos, agoraDaRevisao(perfil, agora));
    eventos = eventosRevisao(perfil);
  } else if (['iniciarTreino', 'responderTreino', 'abandonarTreino'].includes(pedido.acao)) {
    perfil = operarTreinoSupabase(perfil, pedido, recibos);
    eventos = eventosTreino(perfil, pedido.modo);
  } else if (pedido.acao === 'registrarPartida') {
    perfil = registrarPartidaSupabase(perfil, pedido.partida, recibos, agora);
    eventos = [{ id: `recibo:${pedido.partida.id}`, kind: 'recibo', data: { modo: 'cruzadinha', rodadaId: pedido.partida.id, titulo: tituloCruzadinha(pedido.partida) } }];
  } else if (pedido.acao === 'emitirCruzadinha') perfil = emitirCruzadinhaSupabase(perfil, pedido, banco, agora);
  else if (pedido.acao === 'sincronizarFila') ({ perfil, eventos } = operarFilaSupabase(perfil, pedido.item, recibos, new Date(agora).toISOString()));
  else if (pedido.acao === 'tutorial') perfil = { ...perfil, tutorialCruzadinhasConcluido: true };
  else if (pedido.acao === 'editarPerfil') {
    const nome = String(pedido.nome || '').trim();
    const username = String(pedido.username || '').trim();
    if (nome.length < 2 || nome.length > 80 || username.length < 2 || username.length > 40 || /^[=+\-@]/.test(nome) || /^[=+\-@]/.test(username)) throw new Error('Nome inválido.');
    if (username !== perfil.username && !usernameValido(username)) throw new Error('Use 3 a 20 letras minúsculas, números, ponto ou _ no username.');
    const foto = pedido.foto === undefined ? perfil.foto : Number(pedido.foto);
    if (foto !== undefined && (!Number.isInteger(foto) || foto < 0 || foto >= FOTOS_CRACHA)) throw new Error('Foto inválida.');
    // Curso e matéria preferida são opcionais (o app antigo não manda) e seguem a mesma regra do cadastro.
    let curso = {};
    if (pedido.curso !== undefined) {
      curso = validarCurso(pedido.curso);
      if (!curso) throw new Error('Conte a etapa e a faculdade do curso.');
    }
    let materia = {};
    if (pedido.materiaPreferida !== undefined) {
      if (!materiaValida(pedido.materiaPreferida)) throw new Error('Matéria inválida.');
      materia = { materiaPreferida: pedido.materiaPreferida, especialidade: pedido.materiaPreferida };
    }
    perfil = { ...perfil, nome, username, ...(foto === undefined ? {} : { foto }), ...curso, ...materia };
  } else if (pedido.acao === 'pularTutorialBatalha') perfil = operarBatalhaSupabase(perfil, pedido);
  else if (pedido.acao === 'admin') {
    if (perfil.role !== 'admin') throw new Error('Acesso restrito ao administrador.');
    perfil = operarAdminSupabase(perfil, pedido, agora);
    if (pedido.operacao === 'semearRevisao') eventos = errosFicticiosRevisao(agoraDaRevisao(perfil, agora));
  } else {
    const configuracao = [
      { acoes: ['iniciarPlantao', 'acaoPlantao'], operar: operarPlantaoSupabase, campo: 'ddx', encerrada: e => e.relatorio?.encerrado },
      { acoes: ['iniciarAuditoria', 'responderAuditoria'], operar: operarAuditoriaSupabase, campo: 'erroMedico', encerrada: e => Boolean(e.relatorio) },
      { acoes: ['iniciarRelacao', 'responderRelacao'], operar: operarRelacaoSupabase, campo: 'causaEfeito', encerrada: e => Boolean(e.relatorio) },
      { acoes: ['iniciarBatalha', 'acaoBatalha', 'abandonarBatalha'], operar: operarBatalhaSupabase, campo: 'batalha', encerrada: e => Boolean(e.relatorio) },
    ].find(c => c.acoes.includes(pedido.acao));
    if (!configuracao) throw new Error('Ação desconhecida.');
    perfil = configuracao.operar(perfil, pedido, recibos);
    const entrada = perfil[configuracao.campo].entrada;
    if (configuracao.encerrada(entrada)) eventos.push({ id: `recibo:${entrada.id}`, kind: 'recibo',
      data: { modo: configuracao.campo, rodadaId: entrada.id, xpConcedido: entrada.xpConcedido, data: entrada.encerradoEm,
        ...(configuracao.campo === 'batalha' ? { resultado: entrada.relatorio.resultado, doencaId: entrada.doencaId, revelada: Boolean(entrada.relatorio.revelada) } : {}) } });
    // Diagnóstico, conduta e complicação da batalha alimentam a Revisão Inteligente.
    if (configuracao.campo === 'batalha' && configuracao.encerrada(entrada)) eventos.push(...eventosBatalha(entrada));
    // Revisão v2: o caso do Erro médico encerrado vira uma tentativa da fila (entra nela se alguma etapa errou).
    if (configuracao.campo === 'erroMedico' && configuracao.encerrada(entrada) && entrada.encerradoEm) {
      const auditoria = AUDITORIAS.find(a => a.id === entrada.auditoriaId);
      if (auditoria) eventos.push({ id: `resposta:${entrada.id}:${auditoria.id}`, kind: 'resposta', data: tentativaErroMedico(entrada, auditoria, entrada.encerradoEm) });
    }
  }
  // XP semanal por matéria (Coroas) e recibos com XP e data para o histórico das estatísticas.
  if (pedido.acao !== 'admin') perfil = registrarXpSemanal(base, perfil, agora);
  const ganho = Math.max(0, (Number(perfil.pontuacaoTotal) || 0) - (Number(base.pontuacaoTotal) || 0));
  eventos = eventos.map(e => e.kind === 'recibo' ? { ...e, data: { xp: e.data.xpConcedido ?? ganho, data: new Date(agora).toISOString(), ...e.data } } : e);
  return { perfil, eventos };
}
