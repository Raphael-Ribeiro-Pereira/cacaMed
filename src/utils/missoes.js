export const dataLocalHoje = (agora = new Date()) =>
  agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

export const lerMissoes = dados =>
  Array.isArray(dados?.missoesDiarias) ? dados.missoesDiarias :
    Array.isArray(dados?.missoesDiarias?.missoes) ? dados.missoesDiarias.missoes : [];

export const criarMissoesDiarias = () => [
 { id: 'jogar_cruzadinha', titulo: 'Palavras em dia', subtitulo: 'Concluir 1 cruzadinha', meta: 1, recompensaXP: 50, recompensaTicket: 1, progresso: 0, concluida: false },
 { id: 'rodadas_validas', titulo: 'Dose de conhecimento', subtitulo: 'Concluir 2 rodadas de Quiz ou Verdade ou mentira com pelo menos 1 acerto', meta: 2, recompensaXP: 50, recompensaTicket: 1, progresso: 0, concluida: false },
 { id: 'acertos_treino', titulo: 'Conexões corretas', subtitulo: 'Acertar 5 itens nos novos jogos', meta: 5, recompensaXP: 50, recompensaTicket: 1, progresso: 0, concluida: false },
];

export const prepararMissoesDoDia = (dados, hoje = dataLocalHoje()) => {
  const atuais = lerMissoes(dados);
  const [ano, mes, dia] = hoje.split('-');
  const mesmoDia = dados.dataUltimoLogin === hoje || dados.dataUltimoLogin === `${dia}/${mes}/${ano}`;
  if (mesmoDia && atuais.length === 3) return null;
  return {
    dataUltimoLogin: hoje,
    missoesDiarias: criarMissoesDiarias(),
    // Documentos antigos podem ter recebido o bônus antes de migrar o formato.
    xpLogin: 0
  };
};

export const aplicarProgressoMissoes = (missoes, evento) => {
  let xp = 0;
  let tickets = 0;
  const atualizadas = missoes.map(missao => {
    if (missao.concluida || !evento[missao.id]) return missao;
    const progresso = Math.min(missao.meta, (missao.progresso || 0) + evento[missao.id]);
    const concluida = progresso >= missao.meta;
    if (concluida) {
      xp += missao.recompensaXP || 0;
      tickets += missao.recompensaTicket || 0;
    }
    return { ...missao, progresso, concluida };
  });
  return { missoes: atualizadas, xp, tickets };
};
