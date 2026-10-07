import { operarTreinoSupabase, eventosTreino } from './operarTreinoSupabase.js';
import { operarRevisaoSupabase, eventosRevisao } from './operarRevisaoSupabase.js';
import { registrarPartidaSupabase, operarAdminSupabase, operarPlantaoSupabase, operarAuditoriaSupabase, operarRelacaoSupabase, operarBatalhaSupabase, operarPacienteSupabase } from './operarJogosSupabase.js';
import { eventosBatalha } from '../utils/batalhaRevisao.js';
import { nomeDoCaso } from '../utils/pacienteDdxNota.js';
import { registrarXpSemanal } from '../utils/coroas.js';
import { migrarEconomia } from '../utils/economia.js';
import { prepararMissoesDoDia } from '../utils/missoes.js';

export const ACOES_REVISAO = ['consultarRevisao', 'iniciarRevisao', 'responderRevisao', 'encerrarRevisao'];
export const FOTOS_CRACHA = 6;
// Regra do crachá para um username novo; nomes antigos continuam válidos até serem trocados.
export const usernameValido = username => /^[a-z0-9._]{3,20}$/.test(username);
// Título legível da cruzadinha no histórico: matéria da chave e o tópico como o jogador viu (com acentos).
const tituloCruzadinha = partida => {
  const materia = String(partida.chaveXP || '').split('-')[0].toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, l => l.toLocaleUpperCase('pt-BR'));
  return `${materia} · ${String(partida.subMateria || '').trim()}`.slice(0, 90);
};
export function executarPedidoSupabase(original, pedido, { recibos = [], tentativas = [], revisoes = [], agora = new Date() } = {}) {
  let perfil = migrarEconomia(original);
  const preparo = prepararMissoesDoDia(perfil);
  if (preparo) perfil = { ...perfil, dataUltimoLogin: preparo.dataUltimoLogin, missoesDiarias: preparo.missoesDiarias };
  const base = perfil;
  let eventos = [];
  if (pedido.acao === 'obterPerfil') return { perfil, eventos };
  if (ACOES_REVISAO.includes(pedido.acao)) {
    perfil = operarRevisaoSupabase(perfil, pedido, tentativas, revisoes, recibos);
    eventos = eventosRevisao(perfil);
  } else if (['iniciarTreino', 'responderTreino', 'abandonarTreino'].includes(pedido.acao)) {
    perfil = operarTreinoSupabase(perfil, pedido, recibos);
    eventos = eventosTreino(perfil, pedido.modo);
  } else if (pedido.acao === 'registrarPartida') {
    perfil = registrarPartidaSupabase(perfil, pedido.partida, recibos, agora);
    eventos = [{ id: `recibo:${pedido.partida.id}`, kind: 'recibo', data: { modo: 'cruzadinha', rodadaId: pedido.partida.id, titulo: tituloCruzadinha(pedido.partida) } }];
  } else if (pedido.acao === 'concluirCasoPaciente') {
    const antes = perfil;
    perfil = operarPacienteSupabase(perfil, pedido, recibos, new Date(agora).toISOString());
    const feito = perfil.pacienteDdx?.historico?.at(-1);
    if (perfil !== antes && feito) eventos = [{ id: `recibo:${feito.id}`, kind: 'recibo', data: { modo: 'pacienteDdx', rodadaId: feito.id, casoId: feito.casoId, nota: feito.nota, titulo: `Paciente DDX · ${nomeDoCaso(feito.casoId) || feito.casoId}` } }];
  } else if (pedido.acao === 'tutorial') perfil = { ...perfil, tutorialCruzadinhasConcluido: true };
  else if (pedido.acao === 'editarPerfil') {
    const nome = String(pedido.nome || '').trim();
    const username = String(pedido.username || '').trim();
    if (nome.length < 2 || nome.length > 80 || username.length < 2 || username.length > 40 || /^[=+\-@]/.test(nome) || /^[=+\-@]/.test(username)) throw new Error('Nome inválido.');
    if (username !== perfil.username && !usernameValido(username)) throw new Error('Use 3 a 20 letras minúsculas, números, ponto ou _ no username.');
    const foto = pedido.foto === undefined ? perfil.foto : Number(pedido.foto);
    if (foto !== undefined && (!Number.isInteger(foto) || foto < 0 || foto >= FOTOS_CRACHA)) throw new Error('Foto inválida.');
    perfil = { ...perfil, nome, username, ...(foto === undefined ? {} : { foto }) };
  } else if (pedido.acao === 'pularTutorialBatalha') perfil = operarBatalhaSupabase(perfil, pedido);
  else if (pedido.acao === 'admin') {
    if (perfil.role !== 'admin') throw new Error('Acesso restrito ao administrador.');
    perfil = operarAdminSupabase(perfil, pedido);
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
  }
  // XP semanal por matéria (Coroas) e recibos com XP e data para o histórico das estatísticas.
  if (pedido.acao !== 'admin') perfil = registrarXpSemanal(base, perfil, agora);
  const ganho = Math.max(0, (Number(perfil.pontuacaoTotal) || 0) - (Number(base.pontuacaoTotal) || 0));
  eventos = eventos.map(e => e.kind === 'recibo' ? { ...e, data: { xp: e.data.xpConcedido ?? ganho, data: new Date(agora).toISOString(), ...e.data } } : e);
  return { perfil, eventos };
}
