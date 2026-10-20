import { originalRevisao } from '../utils/revisaoInteligente.js';
import { obterAuditoria } from '../utils/erroMedico.js';
import '../utils/erroMedicoRevisao.js';

// Explicação da LLM na tela de revisão (decidida em 07/10/2026; docs/revisao-inteligente.md#llm-na-tela-de-revisão).
// Só vai para a LLM o conteúdo do item e as escolhas: nunca nome, e-mail ou UID. A resposta fica em cache por item,
// versão e escolhas, então dois jogadores com o mesmo erro recebem o mesmo texto.
export const AVISO_IA = 'Explicação gerada por IA. Confira a fonte.';

const textoAlternativa = (opcoes, id) => opcoes.find(o => o.id === id)?.texto ?? String(id);

// Acha a resposta errada confirmada na sessão atual ou numa carta já feita da revisão da semana (o relatório geral);
// a explicação só existe para ela.
export function resultadoParaExplicar(perfil, { revisaoId, itemId, versao }) {
  const entrada = perfil?.revisao?.entrada;
  const feita = Object.values(perfil?.revisao?.semana?.feitas || {}).find(f => f.revisaoId === revisaoId);
  const resultados = entrada?.id === revisaoId ? entrada.resultados : feita?.resultados;
  if (!resultados) throw new Error('Sessão não encontrada. Consulte a revisão salva.');
  const r = resultados.find(x => x.itemId === itemId && x.versao === Number(versao));
  if (!r) throw new Error('Responda o item antes de pedir a explicação.');
  if (r.acertou) throw new Error('A explicação é só para respostas erradas.');
  return r;
}

// Monta a chave do cache, o pedido para a LLM e o texto revisado que aparece sem ela.
export function contextoExplicacao(resultado) {
  const { modo, itemId, versao } = resultado;
  const escolhas = [...new Set([JSON.stringify(resultado.escolhaPartida ?? null), JSON.stringify(resultado.escolha)])]
    .map(s => JSON.parse(s)).filter(e => e !== null);
  const chave = JSON.stringify([modo, itemId, Number(versao), escolhas.map(e => JSON.stringify(e)).sort()]);
  const original = originalRevisao({ modo, itemId, versao });
  if (!original) throw new Error('Conteúdo alterado. Atualize a revisão.');
  let conteudo;
  if (modo === 'verdadeMentira') {
    conteudo = [`Afirmação: ${original.texto}`, `Ela é ${original.verdadeira ? 'VERDADEIRA' : 'FALSA'}.`,
      `O aluno classificou como: ${escolhas.map(e => (e ? 'verdadeira' : 'falsa')).join(' e depois ')}.`, `Explicação revisada: ${original.explicacao}`];
  } else if (modo === 'erroMedico') {
    const a = obterAuditoria(itemId);
    conteudo = [`Caso: ${a.titulo}. ${a.paciente}. ${a.cenario}`, 'Prontuário:', ...a.registros.map((t, i) => `${i + 1}. ${t}`),
      ...a.perguntas.flatMap((p, i) => [`Etapa "${p.titulo}": correta = ${textoAlternativa(p.alternativas, p.correta)}.`,
        `Marcado pelo aluno: ${escolhas.map(e => textoAlternativa(p.alternativas, e[i])).join(' / ')}.`, `Explicação revisada: ${p.explicacao}`])];
  } else {
    conteudo = [`Pergunta: ${original.enunciado}`, `Alternativas: ${original.opcoes.map(o => o.texto).join(' | ')}`,
      `Correta: ${textoAlternativa(original.opcoes, original.correta)}`,
      `Marcada pelo aluno: ${escolhas.map(e => textoAlternativa(original.opcoes, e)).join(' e, na revisão, ')}`, `Explicação revisada: ${original.explicacao}`];
  }
  const mensagens = [
    { role: 'system', content: 'Você é professor de medicina e escreve para um estudante brasileiro. Explique, em português do Brasil e em até 120 palavras, '
      + 'por que cada alternativa marcada pelo aluno não é a resposta e por que a correta é. Use só as informações dadas; não acrescente dados, '
      + 'doses ou números novos e não cite fontes nem referências.' },
    { role: 'user', content: conteudo.join('\n') },
  ];
  const fallback = modo === 'erroMedico' ? obterAuditoria(itemId).perguntas.map(p => p.explicacao).join(' ') : original.explicacao;
  return { chave, mensagens, fallback, fonte: original.fonte || null, modo, itemId, versao: Number(versao) };
}

// Texto aceito da LLM: sem vazio, sem link e com tamanho de explicação.
export function textoValido(texto) {
  const t = String(texto || '').trim();
  return t.length >= 20 && t.length <= 1500 && !/https?:\/\//i.test(t) ? t : null;
}
