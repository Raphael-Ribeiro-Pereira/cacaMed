import { DOENCAS } from './batalha.js';
import { inicioDaSemana } from './coroas.js';

// Segunda camada do painel de estatísticas: lê o histórico de eventos do
// próprio jogador (respostas e recibos) e devolve só agregados, sem gabaritos.
const FONTE_ERRO = { quiz: 'Quiz', verdadeMentira: 'V ou M', batalha: 'Batalha' };
const TITULO = { quiz: 'Rodada do Quiz', verdadeMentira: 'Baralho de frases', ddx: 'Plantão médico', erroMedico: 'Auditoria de erro médico',
  causaEfeito: 'Relações de causa e efeito', batalha: 'Batalha diagnóstica', cruzadinha: 'Cruzadinha', pacienteDdx: 'Paciente DDX' };
const SEMANA = 7 * 86400000;
const quando = e => Date.parse(e.data?.data || e.created_at) || 0;
const capitalizar = t => t.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/, l => l.toLocaleUpperCase('pt-BR'));

function tituloRecibo(d) {
  if (d.modo === 'cruzadinha' && d.titulo) return String(d.titulo).includes(' · ') ? String(d.titulo) : String(d.titulo).split('-').map(capitalizar).join(' · ');
  if (d.modo === 'pacienteDdx' && d.titulo) return String(d.titulo);
  if (d.modo === 'batalha' && d.doencaId) {
    const doenca = DOENCAS.find(x => x.id === d.doencaId);
    return `Batalha · ${d.revelada && doenca ? doenca.nome : 'doença desconhecida'}`;
  }
  return TITULO[d.modo] || 'Partida';
}

export function resumirHistorico(eventos, agora = new Date()) {
  const respostas = eventos.filter(e => e.kind === 'resposta' && typeof e.data?.acertou === 'boolean');
  const recibos = eventos.filter(e => e.kind === 'recibo' && e.data?.modo && e.data.modo !== 'revisao').sort((a, b) => quando(b) - quando(a));
  const xpDe = e => Math.max(0, Number(e.data.xp ?? e.data.xpConcedido ?? e.data.relatorio?.xp) || 0);
  const okDe = e => !e.data.abandonada && !['abandono', 'derrota'].includes(e.data.resultado);

  const grupos = new Map();
  for (const r of respostas) {
    if (r.data.acertou) continue;
    const tema = String(r.data.tema || 'Sem tema');
    const g = grupos.get(tema) || { tema, erros: 0, fontes: new Set() };
    g.erros++; g.fontes.add(FONTE_ERRO[r.data.modo] || 'Jogo');
    grupos.set(tema, g);
  }
  const erros = [...grupos.values()].sort((a, b) => b.erros - a.erros || a.tema.localeCompare(b.tema, 'pt-BR')).slice(0, 5)
    .map(g => ({ tema: g.tema, erros: g.erros, fonte: [...g.fontes].join(' · ') }));

  const atual = inicioDaSemana(agora).getTime();
  const semanas = Array.from({ length: 8 }, (_, i) => ({ inicio: new Date(atual - (7 - i) * SEMANA).toISOString(), xp: 0, acertos: 0, respostas: 0, partidas: 0 }));
  const balde = t => semanas[t >= atual ? 7 : 7 - Math.ceil((atual - t) / SEMANA)];
  for (const e of recibos) { const b = balde(quando(e)); if (b) { b.xp += xpDe(e); b.partidas++; } }
  for (const r of respostas) { const b = balde(quando(r)); if (b) { b.respostas++; b.acertos += Number(r.data.acertou); } }

  return {
    erros,
    semanas: semanas.map(s => ({ inicio: s.inicio, xp: s.xp, partidas: s.partidas, acerto: s.respostas ? Math.round(s.acertos / s.respostas * 100) : null })),
    recentes: recibos.slice(0, 8).map(e => ({ modo: e.data.modo, titulo: tituloRecibo(e.data), data: new Date(quando(e)).toISOString(), xp: xpDe(e), ok: okDe(e) })),
    conclusao: { concluidas: recibos.filter(e => !e.data.abandonada && e.data.resultado !== 'abandono').length, total: recibos.length },
    atualizadoEm: new Date(agora).toISOString(),
  };
}
