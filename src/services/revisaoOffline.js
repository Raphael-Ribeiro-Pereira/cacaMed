import { encerrarRevisaoPerfil, responderRevisaoPerfil } from '../utils/revisaoInteligente.js';
import '../utils/erroMedicoRevisao.js';

// Revisão Inteligente sem rede (docs/app-offline.md#5-telas-offline). A cada consulta com rede, o servidor prepara uma
// sessão por carta (`revisao.offline.sessoes`). Sem rede, a carta abre dessa reserva, as respostas são corrigidas no
// aparelho e, no fim (ou ao encerrar antes), a sessão vai para a fila. A explicação da IA espera a rede; até lá, aparece
// a explicação revisada do banco.
const semRede = erro => !erro?.status;
const ACOES = ['consultarRevisao', 'iniciarRevisao', 'responderRevisao', 'encerrarRevisao', 'explicarRevisao', 'reportarExplicacao'];

export function servicoRevisaoComOffline(servicoReal, { perfilAtual, guardarNaFila, online = () => navigator.onLine !== false, agora = () => new Date().toISOString() }) {
  const enviarParaFila = (usuario, entrada) => guardarNaFila(usuario, 'sessaoRevisao', { carta: entrada.carta, encerrada: true,
    itens: entrada.itens.map(i => ({ id: i.id, modo: i.modo, versao: i.versao, ...(i.parecida ? { parecida: true } : { escolhaPartida: i.escolhaPartida }) })),
    respostas: entrada.resultados.map(r => ({ itemId: r.itemId, versao: r.versao, escolha: r.escolha })) }, entrada.id);
  const local = async (usuario, acao, dados) => {
    const perfil = perfilAtual();
    const stats = perfil.revisao || {};
    if (acao === 'consultarRevisao') return perfil;
    if (acao === 'explicarRevisao' || acao === 'reportarExplicacao') throw new Error('A explicação da IA precisa de internet.');
    if (acao === 'iniciarRevisao') {
      if (stats.entrada && !stats.entrada.encerrada) return perfil;
      const reserva = stats.offline?.sessoes?.[dados.carta];
      if (!reserva) throw new Error('Sem internet: esta carta ainda não foi preparada para jogar offline. Abra a Revisão com internet uma vez.');
      const sessoes = { ...stats.offline.sessoes };
      delete sessoes[dados.carta];
      return { ...perfil, revisao: { ...stats, offline: { ...stats.offline, sessoes },
        entrada: { ...reserva, id: dados.revisaoId, iniciadoEm: agora(), provisoria: true } } };
    }
    const novo = acao === 'responderRevisao'
      ? responderRevisaoPerfil(perfil, dados.revisaoId, { itemId: dados.itemId, versao: dados.versao, escolha: dados.escolha }, [], agora())
      : encerrarRevisaoPerfil(perfil, dados.revisaoId, agora());
    const entrada = { ...novo.revisao.entrada, provisoria: true };
    if (entrada.encerrada && !stats.entrada?.encerrada && entrada.resultados.length) await enviarParaFila(usuario, entrada);
    return { ...novo, revisao: { ...novo.revisao, entrada } };
  };
  return async (usuario, acao, dados = {}) => {
    if (!ACOES.includes(acao)) return servicoReal(usuario, acao, dados);
    const aberta = perfilAtual()?.revisao?.entrada;
    const provisoria = aberta?.provisoria && !aberta.encerrada && ['responderRevisao', 'encerrarRevisao'].includes(acao);
    if (!online() || provisoria) return local(usuario, acao, dados);
    try { return await servicoReal(usuario, acao, dados); }
    catch (erro) { if (semRede(erro)) return local(usuario, acao, dados); throw erro; }
  };
}
