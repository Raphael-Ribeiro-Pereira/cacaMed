export const dataLocalHoje = (agora = new Date()) =>
  agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

const banco = {
  facil: { id: 'login_diario', titulo: 'Plantão Iniciado', subtitulo: 'Bater o ponto no hospital', meta: 1, recompensaXP: 50, recompensaTicket: 0 },
  medias: [
    { id: 'jogar_cruzadinha', titulo: 'Rato de Biblioteca', subtitulo: 'Jogar 1 Cruzadinha', meta: 1, recompensaXP: 100, recompensaTicket: 0 },
    { id: 'acertar_palavras', titulo: 'Mão Firme', subtitulo: 'Acertar 5 palavras', meta: 5, recompensaXP: 150, recompensaTicket: 0 }
  ],
  dificeis: [
    { id: 'vencer_ddx', titulo: 'Salvador de Vidas', subtitulo: 'Concluir 1 atendimento seguro no DDX', meta: 1, recompensaXP: 300, recompensaTicket: 1 }
  ]
};

export const lerMissoes = dados =>
  Array.isArray(dados?.missoesDiarias) ? dados.missoesDiarias :
    Array.isArray(dados?.missoesDiarias?.missoes) ? dados.missoesDiarias.missoes : [];

export const criarMissoesDiarias = (sorteio = Math.random) => [
  { ...banco.facil, progresso: 1, concluida: true },
  { ...banco.medias[Math.floor(sorteio() * banco.medias.length)], progresso: 0, concluida: false },
  { ...banco.dificeis[Math.floor(sorteio() * banco.dificeis.length)], progresso: 0, concluida: false }
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
    xpLogin: mesmoDia ? 0 : banco.facil.recompensaXP
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
