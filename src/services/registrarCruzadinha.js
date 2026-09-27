import { doc, runTransaction } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { aplicarProgressoMissoes, lerMissoes } from '../utils/missoes';
import { chamarPerfilPlanilha } from './perfilPlanilha';

export const registrarCruzadinha = async (uid, partida) => {
  if (import.meta.env.VITE_FONTE_DADOS === 'planilha') {
    if (auth.currentUser?.uid !== uid) throw new Error('Sessão diferente da conta da partida.');
    return chamarPerfilPlanilha(auth.currentUser, 'registrarPartida', { partida });
  }
  const ref = doc(db, 'usuarios', uid);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Perfil do usuário não encontrado.');
    const dados = snapshot.data();
    const ids = dados.cruzadinhasRegistradas || [];
    if (ids.includes(partida.id)) return dados;

    const progresso = aplicarProgressoMissoes(lerMissoes(dados), {
      jogar_cruzadinha: 1,
      acertar_palavras: partida.palavras
    });
    const medidorAnterior = Number(dados.medidorTicketsCruzadinha) || 0;
    const ganhouTicket = medidorAnterior + 1 >= 2;
    const stats = { ...(dados.estatisticas || {}) };
    const anterior = stats[partida.chaveXP] || {};
    stats[partida.chaveXP] = {
      ...anterior,
      partidas: (Number(anterior.partidas) || 0) + 1,
      tempo: (Number(anterior.tempo) || 0) + partida.tempo,
      letras: (Number(anterior.letras) || 0) + partida.letras,
      melhorTempo: anterior.melhorTempo ? Math.min(anterior.melhorTempo, partida.tempo) : partida.tempo
    };
    const gerais = { ...(dados.estatisticasGerais || {}) };
    gerais.errosTotais = (Number(gerais.errosTotais) || 0) + partida.erros;
    gerais.maiorPalavra = Math.max(Number(gerais.maiorPalavra) || 0, partida.maiorPalavra);
    gerais.streakAtual = (Number(gerais.streakAtual) || 0) + 1;
    gerais.maiorStreak = Math.max(Number(gerais.maiorStreak) || 0, gerais.streakAtual);
    if (gerais.ultimoDia !== partida.dia) {
      const dataAnterior = new Date(`${partida.dia}T12:00:00Z`);
      dataAnterior.setUTCDate(dataAnterior.getUTCDate() - 1);
      gerais.diasSeguidos = gerais.ultimoDia === dataAnterior.toISOString().slice(0, 10)
        ? (Number(gerais.diasSeguidos) || 0) + 1 : 1;
      gerais.ultimoDia = partida.dia;
    }
    gerais.historico = [...(gerais.historico || []), {
      data: partida.dia, materia: partida.subMateria, tempo: partida.tempo,
      erros: partida.erros, letrasCorretas: partida.letras
    }].slice(-30);

    const atualizado = {
      ...dados,
      pontuacaoTotal: (Number(dados.pontuacaoTotal) || 0) + partida.xp + progresso.xp,
      xpTopicos: { ...(dados.xpTopicos || {}), [partida.chaveXP]: (Number(dados.xpTopicos?.[partida.chaveXP]) || 0) + partida.xp },
      tickets: (Number(dados.tickets) || 0) + progresso.tickets + Number(ganhouTicket),
      medidorTicketsCruzadinha: ganhouTicket ? 0 : medidorAnterior + 1,
      missoesDiarias: progresso.missoes,
      estatisticas: stats,
      estatisticasGerais: gerais,
      cruzadinhasRegistradas: [...ids, partida.id].slice(-100)
    };
    transaction.update(ref, {
      pontuacaoTotal: atualizado.pontuacaoTotal,
      xpTopicos: atualizado.xpTopicos,
      tickets: atualizado.tickets,
      medidorTicketsCruzadinha: atualizado.medidorTicketsCruzadinha,
      missoesDiarias: atualizado.missoesDiarias,
      estatisticas: atualizado.estatisticas,
      estatisticasGerais: atualizado.estatisticasGerais,
      cruzadinhasRegistradas: atualizado.cruzadinhasRegistradas
    });
    return atualizado;
  });
};
