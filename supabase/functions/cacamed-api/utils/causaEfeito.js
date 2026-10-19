import { RELACOES } from './causaEfeitoBanco.js';
import { avaliarAuditoria } from './erroMedico.js';

export { RELACOES };

// Causa e efeito (formato v2): o jogador monta o circuito colocando cartas em quatro elos. Cada elo vira uma
// "pergunta" cujas alternativas são as seis cartas, o que mantém o contrato do servidor (uma resposta por elo,
// economia v3: 300 XP + bônus). O "Testar circuito" da tela envia os quatro elos de uma vez.
export const ELOS = [
  { id: 'mecanismo', rotulo: 'Mecanismo' },
  { id: 'consequencia', rotulo: 'Consequência' },
  { id: 'compensacao', rotulo: 'Compensação' },
  { id: 'intervencao', rotulo: 'Intervenção' },
];

export function obterRelacao(id, banco = RELACOES) {
  const relacao = banco.find(item => item.id === id);
  if (!relacao) throw new Error('Desafio não encontrado.');
  const perguntas = relacao.elos.map(elo => ({ id: elo.id, titulo: ELOS.find(e => e.id === elo.id).rotulo, correta: elo.correta,
    explicacao: elo.explicacao, alternativas: relacao.cartas }));
  return { ...relacao, perguntas,
    caso: { id: relacao.id, paciente: relacao.paciente, queixa: relacao.cenario, vitais: relacao.vitais, fonte: relacao.fonte, revisado: Boolean(relacao.revisado) } };
}

export function avaliarRelacao(relacao, respostas) {
  return avaliarAuditoria(relacao, respostas);
}
