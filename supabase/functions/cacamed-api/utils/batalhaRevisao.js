import { CAPITULOS, DOENCAS, FONTES, HIPOTESES, MOVES, capituloDe, executarBatalha, obterDoenca } from './batalha.js';
import { registrarBancoRevisao } from './revisaoInteligente.js';

// Cada batalha encerrada vira até três itens da Revisão Inteligente: diagnóstico,
// conduta e resposta à complicação. O item herda a versão da doença; mudar o
// conteúdo da doença tira as versões antigas da fila sem apagar o histórico.
const TERAPIAS = MOVES.filter(m => m.id !== 'critica');
const nomeHipotese = id => HIPOTESES.find(h => h.id === id)?.nome || id;
const fonteDe = (d, sobre) => {
  const c = (sobre && d.fontes.find(f => sobre.test(f.sobre))) || d.fontes[0];
  return c ? `${FONTES[c.fonte]?.curto || c.fonte}, p. ${c.pag}` : '';
};
// O tema aparece antes da resposta: nunca pode entregar o diagnóstico.
const temaDe = d => `Batalha · ${capituloDe(d.id)?.nome || CAPITULOS[0].nome}`;

function itensDaDoenca(d, i) {
  const pistas = d.golpes.slice(0, 2).map(g => g.pista).join(' ');
  // Achados do exame-chave e da anamnese, sem o resultado que já escreve o nome da doença.
  const achados = [...new Set([d.chave, 'anamnese'])].map(e => d.exames[e])
    .filter(t => t && !/^sem altera/i.test(t) && !t.toLowerCase().includes(d.nome.toLowerCase())).slice(0, 2).join(' ');
  const itens = [
    { id: `batalha-${d.id}-diagnostico`, tipo: 'diagnostico', doencaId: d.id, versao: d.versao, tema: temaDe(d), variante: 'diagnostico',
      enunciado: `${d.paciente}. ${d.queixa} ${pistas} ${achados} Qual é o diagnóstico mais provável?`,
      opcoes: [d.id, ...d.dif.slice(0, 3)].map(id => ({ id: `h-${id}`, texto: nomeHipotese(id) })),
      correta: `h-${d.id}`, explicacao: d.aprendizado, fonte: fonteDe(d, /defini|suspeit|caso/i) },
    { id: `batalha-${d.id}-conduta`, tipo: 'conduta', doencaId: d.id, versao: d.versao, tema: temaDe(d), variante: 'conduta',
      enunciado: `Diagnóstico confirmado: ${d.nome} (${d.tipo}). Qual conduta controla a doença?`,
      opcoes: TERAPIAS.map(m => ({ id: `t-${m.id}`, texto: `${m.desc} (${m.nome})` })),
      correta: `t-${d.cura}`, explicacao: d.conduta, fonte: fonteDe(d, /tratamento|esquema|dose|terap|hidrata/i) },
  ];
  // Distratores: respostas críticas das doenças seguintes, sem repetir texto.
  const outras = [];
  for (let k = 1; outras.length < 3 && k < DOENCAS.length; k++) {
    const r = DOENCAS[(i + k) % DOENCAS.length].buff.resposta;
    if (r !== d.buff.resposta && !outras.includes(r)) outras.push(r);
  }
  itens.push({ id: `batalha-${d.id}-complicacao`, tipo: 'complicacao', doencaId: d.id, versao: d.versao, tema: temaDe(d), variante: 'complicacao',
    enunciado: `Paciente com ${d.nome.toLowerCase()} evolui com ${d.buff.nome.toLowerCase()}. Qual é a resposta prioritária?`,
    opcoes: [d.buff.resposta, ...outras].map((texto, k) => ({ id: `c-${d.id}-${k}`, texto })),
    correta: `c-${d.id}-0`, explicacao: d.buff.explica, fonte: fonteDe(d, /alarme|grave|complica|choque|reação/i) });
  return itens;
}

export const BANCO_BATALHA_REVISAO = DOENCAS.flatMap(itensDaDoenca);

// Respostas registradas quando a batalha termina. O treinamento é guiado e o
// abandono não mostra o raciocínio completo: nenhum dos dois entra na fila.
export function respostasBatalha(entrada) {
  if (!entrada?.relatorio || entrada.modo === 'tutorial' || entrada.relatorio.resultado === 'abandono') return [];
  const d = obterDoenca(entrada.doencaId);
  if (d.versao !== entrada.versao) return [];
  const estado = executarBatalha(d, entrada.pet, entrada.acoes);
  const curou = entrada.acoes.some(a => a.t === 'golpe' && a.id === d.cura);
  const acertos = { diagnostico: estado.revealed && !estado.wrongHyp, conduta: curou && !estado.ineff };
  if (estado.evolved) acertos.complicacao = estado.neutral;
  return BANCO_BATALHA_REVISAO.filter(q => q.doencaId === d.id && q.tipo in acertos).map(q => ({
    modo: 'batalha', itemId: q.id, versao: q.versao, tema: q.tema, rodadaId: entrada.id,
    acertou: acertos[q.tipo], data: entrada.encerradoEm,
  }));
}

export function eventosBatalha(entrada) {
  return respostasBatalha(entrada).map(r => ({ id: `resposta:${r.rodadaId}:${r.itemId}`, kind: 'resposta', data: r }));
}

export function avaliarRespostaBatalha(item, resposta) {
  const original = BANCO_BATALHA_REVISAO.find(q => q.id === item.id && q.versao === item.versao);
  if (!original || resposta?.itemId !== item.id) throw new Error('Conteúdo alterado. Atualize a revisão.');
  if (!item.opcoes.some(o => o.id === resposta.escolha)) throw new Error('Alternativa inválida.');
  return { itemId: item.id, versao: item.versao, tema: item.tema, escolha: resposta.escolha, correta: original.correta,
    acertou: resposta.escolha === original.correta, explicacao: original.explicacao, fonte: original.fonte };
}

registrarBancoRevisao('batalha', BANCO_BATALHA_REVISAO, avaliarRespostaBatalha);
