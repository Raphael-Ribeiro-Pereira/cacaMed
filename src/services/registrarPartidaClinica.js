import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { aplicarProgressoMissoes, lerMissoes } from '../utils/missoes';
import { atualizarEstatisticasClinicas } from '../utils/estatisticasClinicas';

export const registrarPartidaClinica = async (uid, partida) => {
  const ref = doc(db, 'usuarios', uid);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Perfil do usuário não encontrado.');
    const dados = snapshot.data();
    const partidasRegistradas = dados.partidasClinicasRegistradas || [];
    if (partidasRegistradas.includes(partida.id)) return dados;

    const { modo, resultado } = partida;
    const stats = atualizarEstatisticasClinicas(dados.estatisticas, partida);

    const evento = modo === 'hardcore' ? { jogar_hardcore: 1 } : resultado === 'vitoria' ? { vencer_ddx: 1 } : {};
    const progresso = aplicarProgressoMissoes(lerMissoes(dados), evento);
    const xpPartida = modo === 'hardcore' ? (resultado === 'vitoria' ? 2000 : 200) : (resultado === 'vitoria' ? 1000 : 100);
    const atualizado = {
      ...dados,
      estatisticas: stats,
      missoesDiarias: progresso.missoes,
      pontuacaoTotal: (Number(dados.pontuacaoTotal) || 0) + xpPartida + progresso.xp,
      tickets: (Number(dados.tickets) || 0) + progresso.tickets,
      partidasClinicasRegistradas: [...partidasRegistradas, partida.id].slice(-100)
    };
    transaction.update(ref, {
      estatisticas: atualizado.estatisticas,
      missoesDiarias: atualizado.missoesDiarias,
      pontuacaoTotal: atualizado.pontuacaoTotal,
      tickets: atualizado.tickets,
      partidasClinicasRegistradas: atualizado.partidasClinicasRegistradas
    });
    return atualizado;
  });
};
