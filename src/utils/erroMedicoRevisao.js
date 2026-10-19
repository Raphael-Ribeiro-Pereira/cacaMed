import { AUDITORIAS, avaliarAuditoria, obterAuditoria } from './erroMedico.js';
import { registrarBancoRevisao } from './revisaoInteligente.js';

// Revisão v2 (docs/revisao-inteligente.md#ddx-erro-médico): o caso errado volta inteiro e o jogador refaz as três
// etapas. Só entram casos revisados; o item herda a versão do caso, então mudar o caso tira a versão antiga da fila.
export const BANCO_REVISAO_ERRO = AUDITORIAS.filter(a => a.revisado === true)
  .map(a => ({ id: a.id, versao: a.versao, tema: `Erro médico · ${a.tema}`, titulo: a.titulo, fonte: a.fonte }));

// Item enviado ao aparelho: o prontuário e as alternativas, sem o gabarito.
export function itemRevisaoErro(item) {
  const a = obterAuditoria(item.id);
  return { titulo: a.titulo, paciente: a.paciente, cenario: a.cenario, contexto: a.contexto, registros: a.registros,
    perguntas: a.perguntas.map(({ id, titulo, alternativas }) => ({ id, titulo, alternativas })) };
}

// A resposta é a lista das três escolhas; acerta quem acerta as três.
export function avaliarRevisaoErro(item, resposta) {
  const a = obterAuditoria(item.id);
  if (a.versao !== item.versao) throw new Error('Conteúdo alterado. Atualize a revisão.');
  if (!Array.isArray(resposta.escolha)) throw new Error('Resposta inválida.');
  const r = avaliarAuditoria(a, resposta.escolha);
  return { itemId: item.id, versao: item.versao, tema: item.tema, escolha: [...resposta.escolha], correta: a.perguntas.map(p => p.correta),
    acertou: r.acertos === r.total, etapas: r.etapas, explicacao: a.perguntas.map(p => p.explicacao).join(' '), fonte: a.fonte };
}

registrarBancoRevisao('erroMedico', BANCO_REVISAO_ERRO, avaliarRevisaoErro, itemRevisaoErro);

// Tentativa do jogo principal para a fila: um caso encerrado com alguma etapa errada.
export const tentativaErroMedico = (entrada, auditoria, agora) => ({ modo: 'erroMedico', itemId: auditoria.id, versao: auditoria.versao,
  tema: `Erro médico · ${auditoria.tema}`, acertou: entrada.relatorio.acertos === entrada.relatorio.total,
  escolha: [...entrada.respostas], rodadaId: entrada.id, data: new Date(agora).toISOString() });
