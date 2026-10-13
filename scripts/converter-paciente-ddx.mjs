import { writeFile } from 'node:fs/promises';
import { CASOS_PACIENTE, FONTES_PACIENTE } from '../src/utils/pacienteDdxConteudo.js';

// Funde o Paciente DDX no Plantão (decisão de 13/10/2026): cada um dos 17 casos vira um caso do Plantão.
//   perguntas -> Anamnese · exames -> Exame físico ou Exames · hipóteses -> Hipóteses · condutas -> Conduta.
// Conduta certa vale pontos e exige a hipótese; conduta errada custa pontos. O texto clínico é o do caso original
// (já validado pelo usuário); só entram sinais vitais, destino e tempo de cada ação, que o Paciente DDX não tinha.
//   node scripts/converter-paciente-ddx.mjs content/inbox/plantao-lote-002.json
const META = {
  'dengue-a': { sistema: 'Infeccioso', vitais: 'FC 88 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 118/76 mmHg · T 38,6°C', destino: 'alta', estado: 'Febril, em atendimento ambulatorial' },
  'malaria-vivax': { sistema: 'Infeccioso', vitais: 'FC 104 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 110/70 mmHg · T 39,2°C', destino: 'alta', estado: 'Febril, com baço palpável' },
  leptospirose: { sistema: 'Infeccioso', vitais: 'FC 98 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 120/80 mmHg · T 38,9°C', destino: 'alta', estado: 'Febril, sem icterícia' },
  hanseniase: { sistema: 'Infeccioso', vitais: 'FC 76 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 126/80 mmHg · T 36,5°C', destino: 'alta', estado: 'Estável, com lesões na pele' },
  tuberculose: { sistema: 'Respiratório', vitais: 'FC 92 bpm · FR 20 irpm · SpO₂ 95% em ar ambiente · PA 110/70 mmHg · T 37,8°C', destino: 'alta', estado: 'Emagrecido, com tosse persistente' },
  iamcsst: { sistema: 'Cardiovascular', vitais: 'FC 96 bpm · FR 20 irpm · SpO₂ 96% em ar ambiente · PA 150/90 mmHg · T 36,6°C', destino: 'encaminhar', estado: 'Com dor no peito; o tempo é decisivo',
    desempenho: { id: 'ecg', limite: 15 }, agravamento: { apos: 15, antes: 'ecg', vitais: { fc: 112, pa: '96/60', spo2: 93 }, estado: 'Piorando: dor persistente e suor frio' } },
  tep: { sistema: 'Cardiovascular', vitais: 'FC 112 bpm · FR 24 irpm · SpO₂ 91% em ar ambiente · PA 118/74 mmHg · T 36,9°C', destino: 'encaminhar', estado: 'Com falta de ar e taquicardia' },
  'dissecao-aorta': { sistema: 'Cardiovascular', vitais: 'FC 98 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 180/100 mmHg · T 36,5°C', destino: 'uti', estado: 'Com dor intensa e pressão diferente nos braços' },
  'dengue-c': { sistema: 'Infeccioso', vitais: 'FC 108 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 110/70 mmHg · T 36,4°C', destino: 'encaminhar', estado: 'Com sinais de alarme na fase crítica',
    desempenho: { id: 'hidratacao', limite: 40 }, agravamento: { apos: 30, antes: 'hidratacao', vitais: { fc: 124, pa: '90/60' }, estado: 'Piorando: queda da pressão' } },
  escorpionismo: { sistema: 'Zoonoses e acidentes por animais', vitais: 'FC 138 bpm · FR 32 irpm · SpO₂ 96% em ar ambiente · PA 100/60 mmHg · T 36,8°C', destino: 'observacao', estado: 'Com sudorese e salivação' },
  botropico: { sistema: 'Zoonoses e acidentes por animais', vitais: 'FC 92 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 130/80 mmHg · T 36,8°C', destino: 'observacao', estado: 'Com edema crescente no pé e na perna' },
  bacteriuria: { sistema: 'Obstétrico', vitais: 'FC 82 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 110/70 mmHg · T 36,6°C', destino: 'alta', estado: 'Gestante sem queixas, em consulta de pré-natal' },
  'sifilis-gestacao': { sistema: 'Obstétrico', vitais: 'FC 78 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 108/68 mmHg · T 36,5°C', destino: 'alta', estado: 'Gestante em primeira consulta de pré-natal' },
  'pre-eclampsia': { sistema: 'Obstétrico', vitais: 'FC 96 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 168/112 mmHg · T 36,7°C', destino: 'encaminhar', estado: 'Gestante hipertensa, com edema de face e mãos' },
  'pneumonia-crianca': { sistema: 'Pediátrico', vitais: 'FC 134 bpm · FR 46 irpm · SpO₂ 96% em ar ambiente · PA 92/58 mmHg · T 37,9°C', destino: 'alta', estado: 'Criança ativa, com respiração rápida' },
  desidratacao: { sistema: 'Pediátrico', vitais: 'FC 130 bpm · FR 28 irpm · SpO₂ 98% em ar ambiente · PA 88/54 mmHg · T 37,2°C', destino: 'observacao', estado: 'Criança com sede e olhos fundos' },
  'rn-doenca-grave': { sistema: 'Pediátrico', vitais: 'FC 170 bpm · FR 64 irpm · SpO₂ 95% em ar ambiente · PA 70/40 mmHg · T 37,8°C', destino: 'encaminhar', estado: 'Recém-nascido letárgico, com febre' },
};
// Exames que na prática são exame físico à beira do leito.
const FISICO = new Set(['sv', 'fisico', 'exf', 'geral', 'olhos', 'prega', 'sede', 'obs', 'umb', 'ausc', 'dermato', 'incap', 'temp', 'fr', 'pa', 'tira', 'bcf', 'pocus']);
const SOMA_ALVO = 230; // com os 20 pontos-base de eficiência, o caminho completo vale 250 XP

export function converter(c) {
  const m = META[c.id];
  if (!m) throw new Error(`Sem metadados para ${c.id}`);
  const acoes = [];
  c.perguntas.forEach((p, i) => acoes.push({ id: `p${i + 1}`, grupo: 'Anamnese', texto: p.p, resposta: p.r, pontos: p.chave ? 15 : 5, criterio: 'raciocinio', minutos: 1, _chave: p.chave }));
  c.exames.forEach(e => acoes.push({ id: e.id, grupo: FISICO.has(e.id) ? 'Exame físico' : 'Exames', texto: e.nome, resposta: e.resultado, pontos: e.chave ? 15 : 5, criterio: 'raciocinio', minutos: FISICO.has(e.id) ? 2 : e.chave ? 5 : 3, _chave: e.chave }));
  const certa = c.hipoteses.findIndex(h => h.certa);
  c.hipoteses.forEach((h, i) => acoes.push({ id: `h${i + 1}`, grupo: 'Hipóteses', texto: `Registrar ${h.nome} como hipótese principal`, resposta: h.certa ? `Hipótese registrada: ${h.porque}` : `Hipótese registrada, mas os dados do caso não a sustentam como principal. ${h.porque}`, pontos: h.certa ? 30 : 0, criterio: 'raciocinio', minutos: 1 }));
  const hipId = `h${certa + 1}`;
  c.conduta.forEach((x, i) => acoes.push({ id: `c${i + 1}`, grupo: 'Conduta', texto: x.texto, resposta: x.porque, pontos: x.certa ? 20 : -15, criterio: 'seguranca', minutos: 3, ...(x.certa ? { exige: [hipId] } : {}), _certa: x.certa }));
  // A hipótese fecha a soma em 230 pontos positivos; o mínimo de 10 e o máximo de 60 mantêm o peso dela razoável.
  const soma = acoes.filter(a => a.pontos > 0).reduce((t, a) => t + a.pontos, 0);
  const hip = acoes.find(a => a.id === hipId);
  hip.pontos = Math.min(60, Math.max(10, hip.pontos + SOMA_ALVO - soma));
  const faltou = SOMA_ALVO - acoes.filter(a => a.pontos > 0).reduce((t, a) => t + a.pontos, 0);
  if (faltou !== 0) { const ultima = [...acoes].reverse().find(a => a._certa); ultima.pontos += faltou; }
  const essenciais = acoes.filter(a => a._chave || a._certa).map(a => a.id).concat(hipId);
  const condutasCertas = acoes.filter(a => a._certa).map(a => a.id);
  // Se há marco de desempenho, a conduta correspondente é a ação com o id indicado (ecg, hidratacao): renomeia a primeira conduta que combina.
  const caso = { id: `pdx-${c.id}`, versao: 1, revisado: false, sistema: m.sistema, titulo: c.nome, paciente: `${c.paciente.nome}, ${c.paciente.idade}`, queixa: c.queixa,
    fonte: 'Biblioteca do caso (ver referências no relatório)', vitais: m.vitais, hipoteseCorreta: hipId, destinoAdequado: m.destino, criteriosAlta: m.destino === 'alta' ? condutasCertas : [],
    estadoInicial: m.estado, acoes: acoes.map(({ _chave, _certa, ...a }) => a), essenciais,
    aprendizado: c.aprendizado, alerta: c.alerta, notificar: c.notificar,
    referencias: c.citacoes.map(r => ({ fonte: FONTES_PACIENTE[r.fonte]?.curto || r.fonte, pag: r.pag, sobre: r.sobre })),
    citacoes: c.citacoes.map(r => ({ url: 'biblioteca-do-caso', titulo: FONTES_PACIENTE[r.fonte]?.titulo || r.fonte, orgao: FONTES_PACIENTE[r.fonte]?.orgao || '', trecho: `p. ${r.pag}`, sustenta: r.sobre })) };
  caso.acoes.push({ id: 'alta', grupo: 'Encerramento', texto: 'Encerrar com alta orientada', resposta: 'Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.', pontos: 0, criterio: 'seguranca', minutos: 1, terminal: true });
  caso.acoes.push({ id: 'encaminhar', grupo: 'Encerramento', texto: 'Encaminhar para serviço de maior complexidade', resposta: 'Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.', pontos: 0, criterio: 'seguranca', minutos: 1, terminal: true });
  if (m.desempenho) {
    const alvo = caso.acoes.find(a => a.grupo === 'Conduta' && a.pontos > 0 && (m.desempenho.id === 'ecg' ? /ECG/.test(a.texto) : /Hidrata/i.test(a.texto)));
    if (!alvo) throw new Error(`Marco de desempenho não achado em ${c.id}`);
    caso.desempenho = { acao: alvo.id, limite: m.desempenho.limite };
    caso.agravamentos = [{ ...m.agravamento, antes: alvo.id }];
  }
  return caso;
}

async function main() {
  const destino = process.argv[2];
  if (!destino) { console.error('Uso: node scripts/converter-paciente-ddx.mjs content/inbox/plantao-lote-002.json'); process.exitCode = 2; return; }
  const casos = CASOS_PACIENTE.map(converter);
  const pontos = [
    'Conversão do Paciente DDX para o formato do Plantão. O texto clínico (perguntas, exames, hipóteses, condutas, alerta, notificação e aprendizado) é o dos 17 casos que você já validou; só são novos os sinais vitais, o destino e o tempo de cada ação, que o Paciente DDX não tinha.',
    'Sinais vitais: onde o exame de sinais vitais do caso trazia valores, eles foram mantidos; os que faltavam (FR, SpO₂, PA em crianças) são fictícios e coerentes com o quadro. Confira.',
    'Destinos escolhidos (alta, UTI, encaminhamento ou retorno/observação) são decisão do agente a partir da conduta correta de cada caso. Confira principalmente dissecção de aorta (UTI), escorpionismo, acidente botrópico e diarreia com desidratação (observação).',
    'Os pontos seguem a regra do Plantão: pergunta ou exame-chave +15, não essencial +5, hipótese certa até +60, conduta certa +20, conduta errada -15; o caminho completo vale 250 XP.',
    'Infarto com supra e dengue com sinais de alarme têm bônus de desempenho escondido (ECG em até 15 minutos; hidratação venosa em até 40 minutos) e piora do monitor se a ação demora.',
    'As referências (fonte e página) são as mesmas do Paciente DDX; não foram conferidas de novo contra os PDFs nesta conversão.',
  ];
  await writeFile(destino, JSON.stringify({ casos, pontos_revisor: pontos }, null, 2));
  console.log(`${casos.length} casos convertidos.`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) await main();
