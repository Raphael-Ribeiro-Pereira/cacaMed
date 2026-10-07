// Apoio visual das telas do DDX no visual do protótipo: o monitor lê os sinais vitais do texto do caso,
// o prontuário auditado separa a hora de cada registro e as etapas ganham nomes curtos.
const numero = (texto, rotulo) => {
  const m = String(texto || '').match(new RegExp(`${rotulo}\\s*([\\d.,]+)`, 'i'));
  return m ? Number(m[1].replace(',', '.')) : null;
};

// "FC 108 bpm · FR 26 irpm · SpO₂ 94% em ar ambiente · PA 120/80 mmHg · T 36,7°C"
export function lerVitais(texto) {
  const pa = String(texto || '').match(/PA\s*(\d+\/\d+)/i)?.[1] || null;
  return { fc: numero(texto, 'FC'), fr: numero(texto, 'FR'), spo2: numero(texto, 'SpO₂') ?? numero(texto, 'SpO2'), pa, t: numero(texto, 'T') };
}

// Depois de reavaliar, o monitor mostra os valores novos que a resposta da reavaliação traz.
export function vitaisDoCaso(caso, reavaliado) {
  const base = lerVitais(caso.vitais);
  if (!reavaliado) return base;
  const novo = lerVitais(caso.acoes.find(a => a.id === 'reavaliar')?.resposta);
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, novo[k] ?? v]));
}

// "08:10 — Paciente chegou..." vira ["08:10", "Paciente chegou..."].
export const registrosComHora = registros => registros.map(r => {
  const m = String(r).match(/^(\d{1,2}:\d{2})\s*[—–-]\s*(.*)$/);
  return m ? [m[1], m[2]] : ['', String(r)];
});

const NOMES = { falha: 'Falha', evidencia: 'Evidência', correcao: 'Correção', justificativa: 'Justificativa',
  mecanismo: 'Mecanismo', consequencia: 'Consequência', compensacao: 'Compensação', intervencao: 'Intervenção' };
export const nomeEtapa = id => NOMES[id] || String(id).replace(/^./, l => l.toUpperCase());

// Rótulos curtos da cadeia causal do Causa e efeito (o primeiro é o estímulo; os demais, uma etapa cada).
// Só exibição: resumem as perguntas da relação, sem gabarito.
const CADEIAS = { 'resp-asma-relacoes-1': ['Poeira', 'Broncoespasmo', 'Resistência ↑', 'Esforço ↑', 'Beta-2'] };
export const cadeiaDe = relacao => CADEIAS[relacao.id] || ['Estímulo', ...relacao.perguntas.map(p => nomeEtapa(p.id))];

// XP do caminho completo do Plantão, mostrado no hub: todas as ações que somam pontos, na ordem
// que os pré-requisitos permitem, e o encerramento adequado. Usa o mesmo motor do servidor.
export function xpCaminhoCompleto(caso, executar) {
  const feitas = [];
  for (let mudou = true; mudou;) {
    mudou = false;
    for (const a of caso.acoes) {
      if (feitas.includes(a.id) || a.terminal || a.pontos <= 0 || !(a.exige || []).every(x => feitas.includes(x))) continue;
      feitas.push(a.id); mudou = true;
    }
  }
  return executar(caso, [...feitas, caso.destinoAdequado]).xp;
}
