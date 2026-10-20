// Relatório de uma carta da revisão da semana (decidido em 19/10/2026; docs/revisao-inteligente.md#métrica-de-ritmo-e-indecisão-decidida-em-19102026).
// Os itens vêm de `relatorioRevisao` (servidor): tempo até responder, tempo esperado pelo ritmo e indecisão, em ms.
// A análise é por regras, a partir desses números; a versão escrita pela IA usa os mesmos dados (pendência).

const seg = ms => (ms / 1000).toFixed(ms < 10000 ? 1 : 0).replace('.', ',');
const curto = texto => { const s = String(texto || '').replace(/[“”"]/g, ''); return s.length > 60 ? `${s.slice(0, 57)}...` : s; };
export const textoDoItem = item => item.modo === 'erroMedico' ? item.titulo : item.modo === 'verdadeMentira' ? item.texto : item.enunciado;
export const textoEscolhaRevisao = (item, valor) => item.modo === 'verdadeMentira' ? (valor ? 'Verdadeira' : 'Falsa')
  : item.modo === 'erroMedico' ? null : item.opcoes?.find(o => o.id === valor)?.texto ?? null;

// Pressa: errou em menos de 70% do tempo esperado. Dúvida: indecisão de pelo menos 3 s e 40% do esperado.
export const comDuvida = item => item.indecisaoMs >= Math.max(3000, item.esperadoMs * 0.4);
export const comPressa = item => !item.acertou && item.tempoMs < item.esperadoMs * 0.7;

export function medidasDaCarta(itens) {
  const medidos = itens.filter(i => i.tempoMs);
  const total = medidos.reduce((s, i) => s + i.tempoMs, 0);
  const indecisao = medidos.reduce((s, i) => s + (i.indecisaoMs || 0), 0);
  return { acertos: itens.filter(i => i.acertou).length, total: itens.length, medidos: medidos.length,
    tempoMedioMs: medidos.length ? total / medidos.length : 0, indecisaoMs: indecisao, indecisaoPct: total ? Math.round(indecisao / total * 100) : 0,
    maisDuvida: medidos.filter(i => i.indecisaoMs > 0).sort((a, b) => b.indecisaoMs - a.indecisaoMs)[0] || null };
}

export function analisarCarta(itens) {
  const linhas = [];
  for (const item of itens.filter(i => i.tempoMs)) {
    const onde = `Em “${curto(textoDoItem(item))}”`;
    const marcada = textoEscolhaRevisao(item, item.escolha);
    const marcou = marcada ? ` e marcou “${curto(marcada)}”` : '';
    if (!item.acertou && comDuvida(item)) linhas.push(`${onde}, você passou ${seg(item.indecisaoMs)} s além do tempo que costuma levar para ler e pensar um item deste tamanho (${seg(item.esperadoMs)} s)${marcou}: sinal de dúvida entre alternativas parecidas.`);
    else if (comPressa(item)) linhas.push(`${onde}, você respondeu em ${seg(item.tempoMs)} s, menos do que costuma levar só para ler um item deste tamanho (${seg(item.esperadoMs)} s): pode ter sido pressa ou leitura incompleta.`);
    else if (!item.acertou) linhas.push(`${onde}, você levou o seu tempo normal (${seg(item.tempoMs)} s)${marcou}: o conceito ainda não está firme. Vale ler a explicação abaixo.`);
    else if (comDuvida(item)) linhas.push(`${onde}, você acertou, mas com ${seg(item.indecisaoMs)} s de dúvida: o conceito ainda não está automático.`);
  }
  const erradas = itens.filter(i => !i.acertou);
  if (!linhas.length) linhas.push(erradas.length ? 'Sem o tempo de cada resposta, a análise fica só nos erros: leia a explicação de cada item abaixo.'
    : 'Você acertou tudo no seu ritmo, sem dúvida aparente. Os itens voltam na semana que vem para fixar.');
  const temas = [...new Set(erradas.map(i => String(i.tema || '').replace(/^Erro médico · /, '').split(' · ')[0]))].filter(Boolean);
  if (temas.length) linhas.push(`Os erros desta carta são de ${temas.join(' e ')}.`);
  return linhas;
}
