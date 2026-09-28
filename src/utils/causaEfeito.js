import { obterCasoPlantao } from './plantao.js';
import { avaliarAuditoria } from './erroMedico.js';

export const RELACOES = [{
  id: 'resp-asma-relacoes-1', versao: 1, casoId: 'resp-asma-1', revisado: false,
  titulo: 'Mecanismos da falta de ar',
  fonte: 'https://www.ncbi.nlm.nih.gov/books/NBK7223/',
  registros: ['Paciente com asma relata chiado e falta de ar após contato com poeira.', 'FR 26 irpm, esforço respiratório leve e expiração prolongada.', 'O roteiro propõe relacionar alterações das vias aéreas e resposta ao broncodilatador.'],
  contexto: 'Interprete as relações fisiológicas neste cenário. A frequência respiratória isolada não informa a ventilação alveolar nem determina a gravidade.',
  perguntas: [
    { id: 'mecanismo', titulo: 'Qual mecanismo pode estreitar rapidamente as vias aéreas após o estímulo?', correta: 'contracao', alternativas: [
      { id: 'contracao', texto: 'Contração do músculo liso brônquico' },
      { id: 'relaxamento', texto: 'Relaxamento do músculo liso brônquico' },
      { id: 'osso', texto: 'Crescimento ósseo dentro dos brônquios em minutos' },
      { id: 'alveolos', texto: 'Aumento obrigatório do número de alvéolos' },
    ], explicacao: 'O broncoespasmo reduz o calibre das vias aéreas. Edema e secreções também podem contribuir; o estreitamento não tem uma única causa.' },
    { id: 'consequencia', titulo: 'Qual sequência relaciona esse estreitamento à limitação do fluxo?', correta: 'resistencia', alternativas: [
      { id: 'menor', texto: 'Menor calibre → menor resistência → expiração facilitada' },
      { id: 'resistencia', texto: 'Menor calibre → maior resistência → fluxo expiratório limitado' },
      { id: 'sem', texto: 'Menor calibre → nenhuma alteração do fluxo' },
      { id: 'certeza', texto: 'Chiado → prova de ventilação normal' },
    ], explicacao: 'O estreitamento aumenta a resistência e dificulta a saída de ar. A intensidade do chiado não mede sozinha a obstrução.' },
    { id: 'compensacao', titulo: 'Como interpretar o aumento do esforço e da frequência respiratória?', correta: 'tentativa', alternativas: [
      { id: 'garantia', texto: 'Garante ventilação alveolar adequada em qualquer situação' },
      { id: 'cura', texto: 'Demonstra que o broncoespasmo já foi resolvido' },
      { id: 'tentativa', texto: 'Pode representar tentativa de manter a ventilação diante da maior carga respiratória' },
      { id: 'dispensa', texto: 'Dispensa reavaliação da paciente' },
    ], explicacao: 'A maior carga exige mais trabalho respiratório. Essa resposta pode ser insuficiente e evoluir com fadiga; frequência e esforço não garantem ventilação adequada.' },
    { id: 'intervencao', titulo: 'Qual efeito fisiológico é esperado de um agonista beta-2 broncodilatador?', correta: 'relaxar', alternativas: [
      { id: 'contrair', texto: 'Contrair o músculo liso e reduzir o calibre brônquico' },
      { id: 'curar', texto: 'Eliminar definitivamente toda a inflamação da asma' },
      { id: 'alta', texto: 'Garantir alta segura sem verificar a resposta' },
      { id: 'relaxar', texto: 'Relaxar o músculo liso, ampliando o calibre e reduzindo a resistência' },
    ], explicacao: 'A broncodilatação pode melhorar o fluxo. Ela não elimina toda a inflamação nem substitui a reavaliação da resposta clínica.' },
  ],
}];

export function obterRelacao(id) {
  const relacao = RELACOES.find(item => item.id === id);
  if (!relacao) throw new Error('Desafio não encontrado.');
  const caso = obterCasoPlantao(relacao.casoId);
  return { ...relacao, caso: { ...caso, fonte: relacao.fonte, revisado: Boolean(caso.revisado && relacao.revisado) } };
}

export function avaliarRelacao(relacao, respostas) {
  return avaliarAuditoria(relacao, respostas);
}
