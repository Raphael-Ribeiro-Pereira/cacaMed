import { BANCO_QUIZ, BANCO_FRASES } from './bancoTreinos.js';
import { concederRecompensa } from './economia.js';
import { aplicarProgressoMissoes, lerMissoes } from './missoes.js';

// Bancos separados (09/10/2026): o V ou M ganha conceitos que não estão no Quiz. Frase do banco novo
// traz o campo revisado e só entra no sorteio depois da revisão médica; as 32 frases antigas (sem o campo,
// mesmos conceitos do Quiz) continuam no banco para o histórico e a revisão, mas saem do sorteio
// quando o banco novo tiver MINIMO_CONCEITOS_VM conceitos com o par verdadeiro/falso revisado
// (40 desde 11/10/2026: o usuário pediu um banco maior que o atual antes da troca).
export const MINIMO_CONCEITOS_VM = 40;
// Temas do Quiz e do V ou M por área ampla (decisão de 11/10/2026): a Revisão v2 agrupa sessões por tema.
export const TEMAS_TREINO = ['Anatomia', 'Fisiologia', 'Histologia', 'Embriologia', 'Bioquímica', 'Microbiologia', 'Imunologia',
  'Parasitologia', 'Farmacologia', 'Patologia', 'Semiologia', 'Clínica médica', 'Pediatria', 'Ginecologia e obstetrícia', 'Saúde coletiva'];
export const conceitoDoQuiz = item => item.id.replace(/^quiz-(teoria|casos)-/, '');
export const fraseLegada = item => item.revisado === undefined;
export function frasesDoSorteio(banco = BANCO_FRASES) {
  const revisadas = banco.filter(item => item.revisado === true);
  const lados = new Map();
  for (const item of revisadas) lados.set(item.conceito, (lados.get(item.conceito) || new Set()).add(item.verdadeira));
  const completos = new Set([...lados].filter(([, s]) => s.size === 2).map(([conceito]) => conceito));
  return completos.size >= MINIMO_CONCEITOS_VM ? revisadas.filter(item => completos.has(item.conceito)) : banco.filter(fraseLegada);
}

function embaralhar(itens, sorteio) {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
export function criarEntradaTreino(modo, variante, id, anterior, sorteio = Math.random) {
  if (!['quiz', 'verdadeMentira'].includes(modo) || (modo === 'quiz' && !['teoria', 'casos'].includes(variante))) throw new Error('Modo de treino inválido.');
  const anteriores = new Set((anterior?.itens || []).map(item => item.id));
  let itens;
  if (modo === 'quiz') {
    const banco = embaralhar(BANCO_QUIZ.filter(item => item.variante === variante), sorteio);
    itens = [...banco.filter(item => !anteriores.has(item.id)), ...banco.filter(item => anteriores.has(item.id))].slice(0, 5)
      .map(({ id, versao, tema, enunciado, opcoes }) => ({ id, versao, tema, enunciado, opcoes: embaralhar(opcoes, sorteio) }));
  } else {
    const verdades = 1 + Math.floor(sorteio() * 4);
    const conceitos = new Set();
    const sorteaveis = frasesDoSorteio();
    itens = [];
    for (const [valor, quantidade] of [[true, verdades], [false, 5 - verdades]]) {
      const banco = embaralhar(sorteaveis.filter(item => item.verdadeira === valor), sorteio);
      const ordenado = [...banco.filter(item => !anteriores.has(item.id)), ...banco.filter(item => anteriores.has(item.id))];
      for (const item of ordenado) {
        if (conceitos.has(item.conceito)) continue;
        conceitos.add(item.conceito);
        itens.push({ id: item.id, versao: item.versao, tema: item.tema, texto: item.texto });
        if (itens.length === (valor ? verdades : 5)) break;
      }
      if (quantidade < 1) throw new Error('Distribuição inválida.');
    }
    itens = embaralhar(itens, sorteio);
  }
  return { id, modo, variante: modo === 'quiz' ? variante : 'misto', itens, respostas: [], resultados: [], encerrada: false, iniciadoEm: new Date().toISOString() };
}
export function avaliarRespostaTreino(entrada, resposta, indice) {
  const item = entrada.itens[indice];
  if (!item || resposta?.itemId !== item.id) throw new Error('Item de resposta inválido.');
  const original = (entrada.modo === 'quiz' ? BANCO_QUIZ : BANCO_FRASES).find(q => q.id === item.id && q.versao === item.versao);
  if (!original) throw new Error('Conteúdo alterado. Atualize a rodada.');
  const escolha = resposta.escolha;
  if (entrada.modo === 'quiz' ? !item.opcoes.some(opcao => opcao.id === escolha) : typeof escolha !== 'boolean') throw new Error('Alternativa inválida.');
  const correta = entrada.modo === 'quiz' ? original.correta : original.verdadeira;
  return { itemId: item.id, versao: item.versao, tema: item.tema, escolha, correta, acertou: escolha === correta,
    explicacao: original.explicacao, fonte: original.fonte };
}
// A ponte pode reordenar propriedades de objetos. Compare os valores do domínio,
// preservando a ordem dos itens e o tipo da escolha (booleano ou ID de alternativa).
function mesmaRespostaTreino(a, b) {
  return Boolean(a && b && a.itemId === b.itemId && a.escolha === b.escolha);
}
export function responderTreinoPerfil(perfil, modo, entradaId, respostas) {
  const stats = { partidas: 0, validas: 0, acertos: 0, itens: 0, xp: 0, medidor: 0, ...perfil.treinos?.[modo] };
  let entrada = stats.entrada;
  if (!entrada || entrada.id !== entradaId) throw new Error('Rodada não encontrada. Consulte o progresso salvo.');
  if (!Array.isArray(respostas)) throw new Error('Respostas inválidas.');
  if (respostas.length === entrada.respostas.length && entrada.respostas.every((r, i) => mesmaRespostaTreino(r, respostas[i]))) return perfil;
  if (entrada.encerrada || respostas.length > 5 || (modo === 'quiz' ? respostas.length !== entrada.respostas.length + 1 : respostas.length !== 5) ||
      entrada.respostas.some((resposta, i) => !mesmaRespostaTreino(resposta, respostas[i]))) throw new Error('A rodada mudou em outra aba. Consulte o progresso salvo.');
  if (modo === 'verdadeMentira' && (![1, 2, 3, 4].includes(respostas.filter(r => r.escolha === true).length))) throw new Error('Selecione de uma a quatro frases verdadeiras.');
  const resultados = respostas.map((r, i) => avaliarRespostaTreino(entrada, r, i));
  const terminou = respostas.length === 5;
  entrada = { ...entrada, respostas: respostas.map(({ itemId, escolha }) => ({ itemId, escolha })), resultados, encerrada: terminou };
  let base = perfil;
  let atualizado = { ...stats, entrada };
  if (terminou) {
    const acertos = resultados.filter(r => r.acertou).length;
    const valida = acertos >= 1;
    const medidor = stats.medidor + Number(valida);
    const ticketRodada = Math.floor(medidor / 2);
    const xp = acertos * (modo === 'quiz' && entrada.variante === 'casos' ? 25 : 20);
    const missoes = aplicarProgressoMissoes(lerMissoes(perfil), { rodadas_validas: Number(valida), acertos_treino: acertos });
    base = concederRecompensa(perfil, xp + missoes.xp, ticketRodada + missoes.tickets);
    entrada = { ...entrada, encerradoEm: new Date().toISOString(), relatorio: { acertos, total: 5, valida, xp, xpMissoes: missoes.xp,
      ticketsRodada: ticketRodada, ticketsMissoes: missoes.tickets, ticketsNivel: base.tickets - (Number(perfil.tickets) || 0) - ticketRodada - missoes.tickets,
      medidor: medidor % 2 } };
    atualizado = { ...stats, entrada, partidas: stats.partidas + 1, validas: stats.validas + Number(valida),
      acertos: stats.acertos + acertos, itens: stats.itens + 5, xp: stats.xp + xp, medidor: medidor % 2 };
    base.missoesDiarias = missoes.missoes;
  }
  return { ...base, treinos: { ...perfil.treinos, [modo]: atualizado } };
}
