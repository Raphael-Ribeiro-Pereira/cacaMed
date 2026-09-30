import { obterCasoPlantao } from './plantao.js';

// O atendimento auditado é uma variante fictícia do mesmo paciente do Plantão.
// Revisão clínica pendente: a disponibilidade acompanha o caso de origem.
export const AUDITORIAS = [{
  id: 'resp-asma-auditoria-1', versao: 1, casoId: 'resp-asma-1', revisado: false,
  titulo: 'Revisão de atendimento por falta de ar',
  registros: [
    '08:10 — Paciente chegou com falta de ar e chiado. Sinais vitais registrados.',
    '08:12 — Estava consciente e falava frases completas, com esforço respiratório leve.',
    '08:15 — Relatou asma, interrupção do controlador e ausência de alergias conhecidas.',
    '08:18 — Ausculta com sibilos difusos; PFE de 65% do melhor valor pessoal.',
    '08:20 — Tratamento de alívio iniciado e corticoide sistêmico avaliado conforme protocolo.',
    '08:22 — Recebeu alta sem registro de resposta ao tratamento, reavaliação ou plano de ação.',
  ],
  contexto: 'Não há informação sobre a evolução após a alta. Analise o processo documentado; um resultado desfavorável, sozinho, não comprova erro.',
  perguntas: [
    { id: 'falha', titulo: 'Qual é a falha principal documentada?', correta: 'alta',
      alternativas: [
        { id: 'alta', texto: 'Alta sem reavaliar a resposta ao tratamento' },
        { id: 'pfe', texto: 'Medir o pico de fluxo expiratório' },
        { id: 'ausculta', texto: 'Auscultar os pulmões' },
        { id: 'tratamento', texto: 'Iniciar tratamento de alívio' },
      ], explicacao: 'O registro não demonstra melhora nem avaliação dos critérios de alta. As avaliações realizadas não substituem a reavaliação após o tratamento.' },
    { id: 'evidencia', titulo: 'Qual informação sustenta essa conclusão?', correta: 'resposta',
      alternativas: [
        { id: 'asma', texto: 'O diagnóstico prévio de asma, por si só' },
        { id: 'resposta', texto: 'Ausência de registro de resposta, sinais vitais e reavaliação após o tratamento' },
        { id: 'idade', texto: 'A idade da paciente' },
        { id: 'desfecho', texto: 'Presumir que houve piora depois da alta' },
      ], explicacao: 'A conclusão deve se apoiar no atendimento documentado. Não há desfecho informado que permita presumir piora ou dano.' },
    { id: 'correcao', titulo: 'Qual correção seria adequada neste roteiro?', correta: 'reavaliar',
      alternativas: [
        { id: 'alta', texto: 'Manter a alta sem nova avaliação' },
        { id: 'tomografia', texto: 'Pedir tomografia de rotina em todos os casos' },
        { id: 'reavaliar', texto: 'Observar a resposta, reavaliar gravidade e registrar critérios antes de decidir a alta' },
        { id: 'suspender', texto: 'Suspender o tratamento apenas para completar o registro' },
      ], explicacao: 'A evolução clínica e a resposta ao tratamento orientam a decisão. Exames de rotina sem indicação não corrigem a falta de reavaliação.' },
    { id: 'justificativa', titulo: 'Por que essa correção melhora a segurança?', correta: 'criterios',
      alternativas: [
        { id: 'certeza', texto: 'Porque garante que nenhuma complicação ocorrerá' },
        { id: 'criterios', texto: 'Porque verifica a resposta e permite planejar alta, orientações e acompanhamento conforme o estado da paciente' },
        { id: 'tempo', texto: 'Porque qualquer atendimento mais longo é necessariamente melhor' },
        { id: 'exames', texto: 'Porque solicitar mais exames sempre significa maior segurança' },
      ], explicacao: 'Segurança depende de critérios e reavaliação, sem prometer ausência de complicações. O plano de ação, as orientações e o acompanhamento também precisam ser registrados.' },
  ],
}];

export function obterAuditoria(id) {
  const auditoria = AUDITORIAS.find(item => item.id === id);
  if (!auditoria) throw new Error('Análise não encontrada.');
  const caso = obterCasoPlantao(auditoria.casoId);
  return { ...auditoria, caso: { ...caso, revisado: Boolean(caso.revisado && auditoria.revisado) } };
}

export function avaliarAuditoria(auditoria, respostas) {
  if (!Array.isArray(respostas) || respostas.length !== auditoria.perguntas.length) {
    throw new Error('Responda todas as etapas antes de concluir a análise.');
  }
  const etapas = auditoria.perguntas.map((pergunta, indice) => {
    const escolha = pergunta.alternativas.find(item => item.id === respostas[indice]);
    if (!escolha) throw new Error('Resposta inválida.');
    return { id: pergunta.id, titulo: pergunta.titulo, escolha: escolha.texto,
      correta: pergunta.alternativas.find(item => item.id === pergunta.correta).texto,
      acertou: escolha.id === pergunta.correta, explicacao: pergunta.explicacao };
  });
  return { etapas, acertos: etapas.filter(item => item.acertou).length, total: etapas.length };
}
