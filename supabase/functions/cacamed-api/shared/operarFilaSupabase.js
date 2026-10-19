import { BANCO_QUIZ, BANCO_FRASES } from '../utils/bancoTreinos.js';
import { responderTreinoPerfil } from '../utils/treinos.js';
import { eventosTreino } from './operarTreinoSupabase.js';

// App offline (docs/app-offline.md): o aparelho guarda o que foi jogado sem rede numa fila e envia um item por vez.
// O servidor refaz tudo com os motores compartilhados: o valor oficial é sempre o daqui. Item recusado volta com o
// motivo (erro 400); a repetição do mesmo item é ignorada pelo recibo `recibo:<id>`.
export const VALIDADE_SESSAO_OFFLINE = 15 * 86400000;
export const TIPOS_FILA = ['rodadaTreino'];

// Data do evento: vale a do aparelho dentro da janela entre o último evento offline aceito (ou 15 dias atrás) e agora.
// Fora dela, a data vira a do envio. Como a fila vai em ordem, as datas aceitas só andam para a frente.
export function dataDoEvento(perfil, data, agora) {
  const fim = Date.parse(agora);
  const inicio = Math.max(Date.parse(perfil.offline?.ultimoEvento) || 0, fim - VALIDADE_SESSAO_OFFLINE);
  const t = Date.parse(data);
  return Number.isFinite(t) && t >= inicio && t <= fim ? new Date(t).toISOString() : new Date(fim).toISOString();
}

// Rodada de Quiz ou Verdade ou mentira jogada no aparelho: os itens precisam existir no banco atual, na mesma versão.
function rodadaTreino(perfil, item, agora) {
  const { modo, variante, itens, respostas } = item.dados || {};
  if (!['quiz', 'verdadeMentira'].includes(modo)) throw new Error('Modo de treino inválido.');
  if (!Array.isArray(itens) || itens.length !== 5 || !Array.isArray(respostas) || respostas.length !== 5) throw new Error('Rodada incompleta.');
  const banco = modo === 'quiz' ? BANCO_QUIZ : BANCO_FRASES;
  const originais = itens.map(i => banco.find(q => q.id === i?.id && q.versao === Number(i?.versao)));
  if (originais.some(o => !o)) throw new Error('Conteúdo desatualizado: esta rodada usou perguntas que mudaram. Ela não pontua.');
  if (modo === 'quiz' && originais.some(o => o.variante !== variante)) throw new Error('Rodada inválida.');
  if (new Set(originais.map(o => o.id)).size !== 5) throw new Error('Rodada inválida.');
  const encerradoEm = dataDoEvento(perfil, item.dados.encerradoEm, agora);
  // Início inválido (depois do fim ou mais de 1 hora antes) não ganha bônus de tempo: conta como 1 hora de rodada.
  const fim = Date.parse(encerradoEm);
  const ini = Date.parse(item.dados.iniciadoEm);
  const iniciadoEm = new Date(Number.isFinite(ini) && ini <= fim && ini >= fim - 3600000 ? ini : fim - 3600000).toISOString();
  const entrada = { id: item.id, modo, variante: modo === 'quiz' ? variante : 'misto', iniciadoEm, respostas: [], resultados: [], encerrada: false,
    itens: originais.map(o => modo === 'quiz' ? { id: o.id, versao: o.versao, tema: o.tema, enunciado: o.enunciado, opcoes: o.opcoes }
      : { id: o.id, versao: o.versao, tema: o.tema, texto: o.texto }) };
  const anterior = perfil.treinos?.[modo]?.entrada;
  let atual = { ...perfil, treinos: { ...perfil.treinos, [modo]: { ...perfil.treinos?.[modo], entrada } } };
  // O Quiz confirma uma resposta por vez; o V ou M, as cinco juntas.
  const passos = modo === 'quiz' ? [1, 2, 3, 4, 5] : [5];
  for (const n of passos) atual = responderTreinoPerfil(atual, modo, item.id, respostas.slice(0, n).map(r => ({ itemId: r?.itemId, escolha: r?.escolha })), encerradoEm);
  const eventos = eventosTreino(atual, modo, encerradoEm);
  // Uma rodada aberta online continua aberta: a rodada offline só deixa os números e os recibos.
  if (anterior && !anterior.encerrada) atual = { ...atual, treinos: { ...atual.treinos, [modo]: { ...atual.treinos[modo], entrada: anterior } } };
  return { perfil: { ...atual, offline: { ...atual.offline, ultimoEvento: encerradoEm } }, eventos };
}

export function operarFilaSupabase(perfil, item, recibos = [], agora = new Date().toISOString()) {
  if (!item || typeof item !== 'object' || !/^[0-9a-f-]{36}$/i.test(String(item.id || ''))) throw new Error('Item da fila inválido.');
  if (recibos.includes(item.id)) return { perfil, eventos: [] };
  if (!TIPOS_FILA.includes(item.tipo)) throw new Error('Tipo de item ainda não aceito offline.');
  return rodadaTreino(perfil, item, agora);
}
