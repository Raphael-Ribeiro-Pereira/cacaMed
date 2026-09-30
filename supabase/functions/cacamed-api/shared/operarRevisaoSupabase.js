import { selecionarFilaRevisao, criarEntradaRevisao, responderRevisaoPerfil, encerrarRevisaoPerfil } from '../utils/revisaoInteligente.js';

export function operarRevisaoSupabase(perfil, pedido, tentativas, historico, recibos = [], agora = new Date().toISOString()) {
  if (perfil.role !== 'admin') throw new Error('Revisão inteligente em piloto para administrador.');
  const entrada = perfil.revisao?.entrada;
  const reinicio = Date.parse(perfil.revisao?.reiniciadoEm) || 0;
  const anteriores = historico.filter(r => Date.parse(r.data) > reinicio);
  const fila = () => selecionarFilaRevisao(tentativas.filter(r => Date.parse(r.data) > reinicio), anteriores, agora);
  if (pedido.acao === 'consultarRevisao' || pedido.acao === 'iniciarRevisao') {
    if (pedido.acao === 'iniciarRevisao' && entrada && (!entrada.encerrada || entrada.id === pedido.revisaoId)) return perfil;
    const selecao = fila();
    let nova = entrada;
    if (pedido.acao === 'iniciarRevisao') {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pedido.revisaoId || '')) throw new Error('Identificador inválido.');
      if (recibos.includes(pedido.revisaoId)) throw new Error('Esta sessão já foi encerrada.');
      nova = criarEntradaRevisao(selecao, pedido.revisaoId, agora);
    }
    return { ...perfil, revisao: { ...perfil.revisao, resumo: selecao.resumo, ...(nova ? { entrada: nova } : {}) } };
  }
  let novo;
  if (pedido.acao === 'encerrarRevisao') novo = encerrarRevisaoPerfil(perfil, pedido.revisaoId, agora);
  else if (pedido.acao === 'responderRevisao') novo = responderRevisaoPerfil(perfil, pedido.revisaoId,
    { itemId: pedido.itemId, versao: pedido.versao, escolha: pedido.escolha }, anteriores, agora);
  else throw new Error('Operação inválida.');
  if (novo === perfil) return perfil;
  const resultados = novo.revisao.entrada.resultados;
  const novos = resultados.filter(r => !anteriores.some(h => h.revisaoId === pedido.revisaoId && h.itemId === r.itemId && h.versao === r.versao));
  const resumo = selecionarFilaRevisao(tentativas.filter(r => Date.parse(r.data) > reinicio), [...anteriores, ...novos], agora).resumo;
  return { ...novo, revisao: { ...novo.revisao, resumo, entrada: { ...novo.revisao.entrada, historicoConfirmado: true } } };
}

export function eventosRevisao(perfil) {
  const entrada = perfil.revisao?.entrada;
  if (!entrada) return [];
  const eventos = entrada.resultados.map(r => ({ id: `revisao:${entrada.id}:${r.modo}:${r.itemId}:${r.versao}`,
    kind: 'revisao', data: { ...r, revisaoId: entrada.id } }));
  if (entrada.encerrada) eventos.push({ id: `recibo:${entrada.id}`, kind: 'recibo', data: { revisaoId: entrada.id, modo: 'revisao' } });
  return eventos;
}
