import { criarEntradaTreino, responderTreinoPerfil } from '../utils/treinos.js';

// Quiz e Verdade ou mentira sem rede (docs/app-offline.md#5-telas-offline). Envolve o serviço da API: com rede, nada
// muda; sem rede (ou se o pedido cai por falta de rede), a rodada é criada e corrigida no aparelho com os mesmos
// motores do servidor. Ao terminar, a rodada vai para a fila e o XP aparece como provisório até o servidor confirmar.
const semRede = erro => !erro?.status;

export function servicoTreinoComOffline(servicoReal, { perfilAtual, guardarNaFila, online = () => navigator.onLine !== false, agora = () => new Date().toISOString() }) {
  const local = (usuario, acao, dados) => {
    const perfil = perfilAtual();
    const { modo } = dados;
    const stats = perfil.treinos?.[modo] || {};
    if (acao === 'iniciarTreino') {
      if (stats.entrada && !stats.entrada.encerrada) return perfil;
      const entrada = { ...criarEntradaTreino(modo, dados.variante, dados.entradaId, stats.entrada), iniciadoEm: agora(), provisoria: true };
      return { ...perfil, treinos: { ...perfil.treinos, [modo]: { ...stats, entrada } } };
    }
    if (acao === 'responderTreino') {
      const instante = agora();
      const respondido = responderTreinoPerfil(perfil, modo, dados.entradaId, dados.respostas, instante);
      const entrada = { ...respondido.treinos[modo].entrada, provisoria: true };
      const novo = { ...respondido, treinos: { ...respondido.treinos, [modo]: { ...respondido.treinos[modo], entrada } } };
      if (entrada.encerrada && !stats.entrada?.encerrada) {
        return guardarNaFila(usuario, 'rodadaTreino', { modo, variante: entrada.variante, itens: entrada.itens.map(i => ({ id: i.id, versao: i.versao })),
          respostas: entrada.respostas, iniciadoEm: entrada.iniciadoEm, encerradoEm: instante }, entrada.id).then(() => novo);
      }
      return novo;
    }
    if (acao === 'abandonarTreino') {
      return { ...perfil, treinos: { ...perfil.treinos, [modo]: { ...stats, entrada: { ...stats.entrada, encerrada: true, abandonada: true } } } };
    }
    throw new Error('Sem internet. Esta ação precisa de rede.');
  };
  return async (usuario, acao, dados = {}) => {
    const daRodada = ['iniciarTreino', 'responderTreino', 'abandonarTreino'].includes(acao);
    // A rodada que já começou offline termina offline, para não misturar correções.
    const provisoria = perfilAtual()?.treinos?.[dados.modo]?.entrada?.provisoria && !perfilAtual().treinos[dados.modo].entrada.encerrada;
    if (daRodada && (!online() || (provisoria && acao !== 'iniciarTreino'))) return local(usuario, acao, dados);
    try { return await servicoReal(usuario, acao, dados); }
    catch (erro) { if (daRodada && semRede(erro)) return local(usuario, acao, dados); throw erro; }
  };
}
