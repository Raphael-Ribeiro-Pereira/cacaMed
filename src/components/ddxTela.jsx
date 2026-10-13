import { useState } from 'react';
import { nivelPorXP } from '../utils/economia';
import { animar } from '../utils/prototipo';

// Envio das respostas do Erro médico e do Causa e efeito: o servidor recebe todas as etapas de uma vez,
// recalcula o resultado e grava. Reenviar as mesmas respostas não duplica XP nem ticket.
export function useEnvioDdx({ usuario, dadosUsuario, setDadosUsuario, servicoPerfil, acao, entradaId }) {
  const [estado, setEstado] = useState('idle');
  const [subiu, setSubiu] = useState(null);
  const enviar = async respostas => {
    setEstado('enviando');
    try {
      const perfil = await servicoPerfil(usuario, acao, { entradaId, respostas });
      const antes = nivelPorXP(dadosUsuario?.pontuacaoTotal), agora = nivelPorXP(perfil?.pontuacaoTotal);
      if (agora > antes) setTimeout(() => setSubiu({ from: antes, to: agora, xp: Number(perfil.pontuacaoTotal) || 0 }), animar() ? 1300 : 0);
      setDadosUsuario(perfil);
      setEstado('ok');
      return true;
    } catch {
      setEstado('erro');
      return false;
    }
  };
  return { estado, enviar, subiu, setSubiu };
}
