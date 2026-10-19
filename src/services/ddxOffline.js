import { useMemo } from 'react';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';
import { armazemDoAparelho, filaDoAparelho } from './filaOffline.js';

// DDX sem rede (docs/app-offline.md#tickets-do-ddx-offline). Sem rede, o aparelho roda o mesmo motor do servidor sobre o
// perfil local e guarda os pedidos do caso; quando o caso termina, eles vão juntos para a fila (tipo `pedidosDdx`).
// Admissão offline só com ticket confirmado pelo servidor: tickets ganhos offline não contam até a confirmação.
export const CAMPO_DDX = { iniciarPlantao: 'ddx', acaoPlantao: 'ddx', iniciarAuditoria: 'erroMedico', responderAuditoria: 'erroMedico',
  iniciarRelacao: 'causaEfeito', responderRelacao: 'causaEfeito' };
const INICIAR = ['iniciarPlantao', 'iniciarAuditoria', 'iniciarRelacao'];
const encerrada = (campo, e) => Boolean(campo === 'ddx' ? e?.relatorio?.encerrado : e?.relatorio);
const semRede = erro => !erro?.status;

// Saldo que pode ser gasto offline: os tickets da última confirmação do servidor menos as admissões que ainda
// não chegaram a ele (na fila ou em casos abertos).
export async function saldoOffline(uid, { armazem, fila }) {
  const confirmado = Number((await armazem.ler(`confirmado:${uid}`).catch(() => null))?.tickets) || 0;
  const naFila = (await fila.daConta(uid)).filter(i => i.tipo === 'pedidosDdx' && i.estado !== 'recusado'
    && i.dados.pedidos.some(p => INICIAR.includes(p.acao))).length;
  const abertos = Object.values((await armazem.ler(`ddxAbertos:${uid}`).catch(() => null)) || {}).filter(l => l.some(p => INICIAR.includes(p.acao))).length;
  return confirmado - naFila - abertos;
}

export function servicoDdxComOffline(servicoReal, { perfilAtual, armazem, fila, avisarFila = () => {}, online = () => navigator.onLine !== false, agora = () => new Date() }) {
  const local = async (usuario, acao, dados) => {
    const campo = CAMPO_DDX[acao];
    const uid = usuario.uid;
    if (INICIAR.includes(acao) && await saldoOffline(uid, { armazem, fila }) < 1) {
      throw new Error('Sem internet e sem ticket confirmado para abrir um caso. Tickets ganhos sem internet liberam o DDX quando a rede voltar.');
    }
    const pedido = { ...dados, acao };
    const { perfil } = executarPedidoSupabase(perfilAtual(), pedido, { agora: agora() });
    const entrada = { ...perfil[campo].entrada, provisoria: true };
    const abertos = (await armazem.ler(`ddxAbertos:${uid}`).catch(() => null)) || {};
    const pedidos = [...(abertos[dados.entradaId] || []), pedido];
    if (encerrada(campo, entrada)) {
      delete abertos[dados.entradaId];
      await fila.enfileirar(uid, 'pedidosDdx', { pedidos, encerradoEm: agora().toISOString() }, dados.entradaId);
      avisarFila();
    } else abertos[dados.entradaId] = pedidos;
    await armazem.gravar(`ddxAbertos:${uid}`, abertos);
    return { ...perfil, [campo]: { ...perfil[campo], entrada } };
  };
  return async (usuario, acao, dados = {}) => {
    const campo = CAMPO_DDX[acao];
    if (!campo) return servicoReal(usuario, acao, dados);
    // O caso que começou offline termina offline, para o servidor receber a sequência inteira.
    const aberta = perfilAtual()?.[campo]?.entrada;
    const provisoria = aberta?.provisoria && !encerrada(campo, aberta) && aberta.id === dados.entradaId;
    if (!online() || provisoria) return local(usuario, acao, dados);
    try { return await servicoReal(usuario, acao, dados); }
    catch (erro) { if (semRede(erro)) return local(usuario, acao, dados); throw erro; }
  };
}

// Gancho das telas do DDX: o serviço da API com o caminho offline. É recriado a cada perfil novo e lê o perfil da
// renderização, que é o mais recente quando o jogador toca na tela.
export function useServicoDdx(servicoApi, dadosUsuario) {
  return useMemo(() => servicoDdxComOffline(servicoApi, { perfilAtual: () => dadosUsuario, armazem: armazemDoAparelho(), fila: filaDoAparelho(),
    avisarFila: () => window.dispatchEvent(new Event('cacomed-fila')) }), [servicoApi, dadosUsuario]);
}
