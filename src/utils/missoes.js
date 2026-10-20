export const dataLocalHoje = (agora = new Date()) =>
  agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const diaAnterior = dia => {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const lerMissoes = dados =>
  Array.isArray(dados?.missoesDiarias) ? dados.missoesDiarias :
    Array.isArray(dados?.missoesDiarias?.missoes) ? dados.missoesDiarias.missoes : [];

// Economia v3 (docs/economia-v3.md#missões-diárias): a missão de login e mais 4 sorteadas, uma de cada nível
// (1, 2, 3 e 4 ou 5; a de nível 5 sai em 1 a cada 3 dias). `evento` é o nome do progresso que a missão conta.
export const RECOMPENSA_MISSAO = { 1: [50, 1], 2: [100, 1], 3: [150, 1], 4: [250, 1], 5: [400, 2] };
export const XP_LOGIN_POR_DIA = 25;
export const JANELA_UM_DE_CADA = 30 * 60 * 1000;
export const TIPOS_UM_DE_CADA = ['cruzadinha', 'quiz', 'verdadeMentira', 'ddx'];
export const CATALOGO_MISSOES = {
  1: [{ id: 'rodada_qualquer', titulo: 'Primeiro plantão do dia', subtitulo: 'Concluir 1 rodada de qualquer jogo', meta: 1, evento: 'rodadas' }],
  2: [
    { id: 'tres_rodadas', titulo: 'Ritmo de plantão', subtitulo: 'Concluir 3 rodadas de qualquer jogo', meta: 3, evento: 'rodadas' },
    { id: 'acertos_10', titulo: 'Conexões corretas', subtitulo: 'Acertar 10 itens no Quiz ou no Verdade ou mentira', meta: 10, evento: 'acertos_treino' },
  ],
  3: [
    { id: 'caso_ddx', titulo: 'Caso do dia', subtitulo: 'Concluir 1 caso do DDX', meta: 1, evento: 'caso_ddx' },
    { id: 'cruzadinha_sem_dica', titulo: 'Memória afiada', subtitulo: 'Concluir uma cruzadinha sem dica extra', meta: 1, evento: 'cruzadinha_sem_dica' },
    { id: 'rodada_perfeita', titulo: 'Rodada perfeita', subtitulo: 'Acertar tudo em uma rodada de Quiz ou Verdade ou mentira', meta: 1, evento: 'rodada_perfeita' },
  ],
  4: [
    { id: 'tres_perfeitas', titulo: 'Sequência perfeita', subtitulo: 'Fazer 3 rodadas perfeitas no dia', meta: 3, evento: 'rodada_perfeita' },
    { id: 'caso_ddx_impecavel', titulo: 'Conduta impecável', subtitulo: 'Concluir um caso do DDX sem erro e com bônus máximo', meta: 1, evento: 'caso_ddx_impecavel' },
  ],
  5: [
    { id: 'um_de_cada', titulo: 'Plantão completo', subtitulo: 'Jogar cruzadinha, Quiz, Verdade ou mentira e um caso do DDX em menos de 30 minutos', meta: 4, evento: 'um_de_cada' },
    { id: 'cruzadinha_relampago', titulo: 'Diagnóstico relâmpago', subtitulo: 'Concluir uma cruzadinha sem dica e abaixo do tempo esperado da grade', meta: 1, evento: 'cruzadinha_relampago' },
  ],
};

const novaMissao = (modelo, nivel) => {
  const [recompensaXP, recompensaTicket] = RECOMPENSA_MISSAO[nivel];
  return { ...modelo, nivel, recompensaXP, recompensaTicket, progresso: 0, concluida: false };
};
export const missaoDeLogin = dias => ({ id: 'login', titulo: `Ofensiva: ${dias} dia${dias === 1 ? '' : 's'} seguido${dias === 1 ? '' : 's'}`,
  subtitulo: `Entrar no jogo todo dia: ${XP_LOGIN_POR_DIA} XP por dia de ofensiva`,
  nivel: 0, meta: 1, evento: 'login', recompensaXP: XP_LOGIN_POR_DIA * dias, recompensaTicket: 0, progresso: 1, concluida: true });
// Sorteio fixo por jogador e dia: pedir de novo no mesmo dia sorteia as mesmas missões (mulberry32 sobre um hash FNV-1a).
export function sorteioDoDia(uid, dia) {
  let h = 2166136261;
  for (const c of `${uid}|${dia}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// `sorteio` devolve um número em [0, 1), como Math.random (os testes passam um sorteio fixo).
// `nivelFixo` (4 ou 5) fixa o nível da missão mais alta: só as ferramentas de admin usam.
export function criarMissoesDiarias(sorteio = Math.random, diasOfensiva = 1, nivelFixo) {
  const escolher = lista => lista[Math.min(lista.length - 1, Math.floor(sorteio() * lista.length))];
  const sorteado = sorteio() < 1 / 3 ? 5 : 4;
  const nivelAlto = [4, 5].includes(nivelFixo) ? nivelFixo : sorteado;
  return [missaoDeLogin(diasOfensiva), ...[1, 2, 3, nivelAlto].map(nivel => novaMissao(escolher(CATALOGO_MISSOES[nivel]), nivel))];
}

// No primeiro pedido do dia (fuso America/Sao_Paulo): conta a ofensiva, sorteia as missões e paga o login.
// Pular um dia volta o multiplicador a 1; o resto (XP, nível, tickets) não muda.
export const prepararMissoesDoDia = (dados, hoje = dataLocalHoje(), sorteio = sorteioDoDia(dados.uid, hoje)) => {
  const [ano, mes, dia] = hoje.split('-');
  const mesmoDia = dados.dataUltimoLogin === hoje || dados.dataUltimoLogin === `${dia}/${mes}/${ano}`;
  if (mesmoDia && lerMissoes(dados).some(m => m.id === 'login')) return null;
  const anterior = dados.ofensiva || {};
  const dias = anterior.ultimoDia === hoje ? Math.max(1, Number(anterior.dias) || 1)
    : anterior.ultimoDia === diaAnterior(hoje) ? (Number(anterior.dias) || 0) + 1 : 1;
  const missoesDiarias = criarMissoesDiarias(sorteio, dias);
  // Reset ou troca de versão no mesmo dia já pago não paga o login de novo.
  const xpLogin = anterior.ultimoDia === hoje ? 0 : missoesDiarias[0].recompensaXP;
  return { dataUltimoLogin: hoje, missoesDiarias, ofensiva: { dias, ultimoDia: hoje }, xpLogin };
};

// `evento`: { rodadas, acertos_treino, caso_ddx, ... } com quanto cada progresso andou; `jogo` ({ tipo, instante })
// alimenta a missão "Plantão completo", que conta os tipos jogados nos últimos 30 minutos.
export const aplicarProgressoMissoes = (missoes, evento) => {
  let xp = 0;
  let tickets = 0;
  const atualizadas = missoes.map(missao => {
    if (missao.concluida) return missao;
    let progresso;
    let extra = {};
    if (missao.evento === 'um_de_cada') {
      if (!evento.jogo || !TIPOS_UM_DE_CADA.includes(evento.jogo.tipo)) return missao;
      const { tipo, instante } = evento.jogo;
      const marcas = { ...missao.marcas, [tipo]: instante };
      progresso = TIPOS_UM_DE_CADA.filter(t => marcas[t] !== undefined && instante - marcas[t] <= JANELA_UM_DE_CADA).length;
      extra = { marcas };
    } else {
      const chave = missao.evento || missao.id;
      if (!evento[chave]) return missao;
      progresso = (missao.progresso || 0) + evento[chave];
    }
    progresso = Math.min(missao.meta, progresso);
    const concluida = progresso >= missao.meta;
    if (concluida) {
      xp += missao.recompensaXP || 0;
      tickets += missao.recompensaTicket || 0;
    }
    return { ...missao, ...extra, progresso, concluida };
  });
  return { missoes: atualizadas, xp, tickets };
};
