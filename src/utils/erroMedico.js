import { AUDITORIAS } from './erroMedicoBanco.js';

export { AUDITORIAS };

// Erro médico (formato v2): o jogador toca na linha do prontuário onde o cuidado falhou, escolhe a categoria da
// falha e escolhe a correção. As três etapas viram "perguntas" com alternativas, o que mantém o contrato do
// servidor (uma resposta por etapa; economia v3: 300 XP + bônus, em operarJogosSupabase.js) e o recálculo do resultado na Edge Function.
export const CATEGORIAS_FALHA = [
  { id: 'omissao', texto: 'Omissão' },
  { id: 'atraso', texto: 'Atraso' },
  { id: 'conduta', texto: 'Conduta inadequada' },
  { id: 'registro', texto: 'Falha de registro' },
  { id: 'medicacao', texto: 'Erro grande de medicação' },
  { id: 'logica', texto: 'Erro lógico de causa e efeito' },
];

export function obterAuditoria(id, banco = AUDITORIAS) {
  const auditoria = banco.find(item => item.id === id);
  if (!auditoria) throw new Error('Análise não encontrada.');
  const { falha } = auditoria;
  const perguntas = [
    { id: 'linha', titulo: 'Em qual registro o cuidado falhou?', correta: `l${falha.linha}`, explicacao: falha.explicacoes.linha,
      alternativas: auditoria.registros.map((texto, i) => ({ id: `l${i + 1}`, texto })) },
    { id: 'categoria', titulo: 'Que tipo de falha foi essa?', correta: falha.categoria, explicacao: falha.explicacoes.categoria, alternativas: CATEGORIAS_FALHA },
    { id: 'correcao', titulo: 'Qual seria a correção?', correta: falha.correcao, explicacao: falha.explicacoes.correcao, alternativas: auditoria.correcoes },
  ];
  return { ...auditoria, perguntas,
    caso: { id: auditoria.id, paciente: auditoria.paciente, queixa: auditoria.cenario, fonte: auditoria.fonte, revisado: Boolean(auditoria.revisado) } };
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
