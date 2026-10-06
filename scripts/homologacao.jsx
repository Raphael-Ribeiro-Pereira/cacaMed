// Entrada de desenvolvimento independente; não é incluída na build de produção.
import { useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TreinoMedico from '../src/components/TreinoMedico';
import RevisaoInteligente from '../src/components/RevisaoInteligente';
import BatalhaDiagnostica from '../src/components/BatalhaDiagnostica';
import Ranking from '../src/components/Ranking';
import Estatisticas from '../src/components/Estatisticas';
import PerfilUsuario from '../src/components/PerfilUsuario';
import { calcularIdPublico } from '../src/services/rankingPublico';
import { MATERIAS, semanaCoroas, fimDaSemana } from '../src/utils/coroas';
import { resumirHistorico } from '../src/utils/estatisticasPainel';
import { executarPedidoSupabase } from '../src/shared/executarPedidoSupabase';
import { BANCO_QUIZ, BANCO_FRASES } from '../src/utils/bancoTreinos';
import { selecionarFilaRevisao, criarEntradaRevisao, responderRevisaoPerfil, encerrarRevisaoPerfil, chaveItemRevisao } from '../src/utils/revisaoInteligente';
import { criarEntradaTreino, responderTreinoPerfil } from '../src/utils/treinos';
import { criarMissoesDiarias } from '../src/utils/missoes';
import '../src/index.css';

const chave = 'cacoMed-homologacao-v2';
const inicial = { uid: 'teste-local', email: 'homologacao@exemplo.com', nome: 'Homologação', username: 'homologacao', titulo: 'Doutor', role: 'admin', pontuacaoTotal: 490, tickets: 0, missoesDiarias: criarMissoesDiarias() };
let salvo = JSON.parse(localStorage.getItem(chave) || 'null') || inicial;
const guardar = perfil => { salvo = perfil; localStorage.setItem(chave, JSON.stringify(perfil)); return perfil; };
const chaveHistorico = 'cacoMed-homologacao-revisao';
let historico = JSON.parse(localStorage.getItem(chaveHistorico) || 'null') || { tentativas: [], revisoes: [] };
let simularFalhaRevisao = false;
const guardarHistorico = () => localStorage.setItem(chaveHistorico, JSON.stringify(historico));
function repararRevisaoLocal() {
  for (const resultado of salvo.revisao?.entrada?.resultados || []) {
    if (!historico.revisoes.some(r => r.revisaoId === salvo.revisao.entrada.id && chaveItemRevisao(r) === chaveItemRevisao(resultado))) {
      historico.revisoes.push({ ...resultado, revisaoId: salvo.revisao.entrada.id });
    }
  }
  guardarHistorico();
  if (salvo.revisao?.entrada) guardar({ ...salvo, revisao: { ...salvo.revisao, entrada: { ...salvo.revisao.entrada, historicoConfirmado: true } } });
}
function semearErrosRevisao() {
  const data = new Date(Date.now() - 2 * 86400000).toISOString();
  historico = { tentativas: [BANCO_QUIZ[0], BANCO_QUIZ[1], BANCO_QUIZ[4], BANCO_FRASES[0], BANCO_FRASES[1]].map((q, i) => ({
    modo: q.opcoes ? 'quiz' : 'verdadeMentira', itemId: q.id, versao: q.versao, tema: q.tema, rodadaId: `ficticia-${i}`, acertou: false, data })), revisoes: [] };
  guardarHistorico(); return guardar({ ...inicial, revisao: {} });
}
async function servicoPerfil(_, acao, pedido) {
  if (acao === 'obterPerfil') { repararRevisaoLocal(); return salvo; }
  if (['consultarRevisao', 'iniciarRevisao', 'responderRevisao', 'encerrarRevisao'].includes(acao)) {
    repararRevisaoLocal();
    if (acao === 'consultarRevisao') return guardar({ ...salvo, revisao: { ...salvo.revisao, resumo: selecionarFilaRevisao(historico.tentativas, historico.revisoes).resumo } });
    if (acao === 'iniciarRevisao') {
      if (salvo.revisao?.entrada && !salvo.revisao.entrada.encerrada) return salvo;
      const fila = selecionarFilaRevisao(historico.tentativas, historico.revisoes);
      return guardar({ ...salvo, revisao: { ...salvo.revisao, resumo: fila.resumo, entrada: criarEntradaRevisao(fila, pedido.revisaoId) } });
    }
    guardar(acao === 'encerrarRevisao' ? encerrarRevisaoPerfil(salvo, pedido.revisaoId)
      : responderRevisaoPerfil(salvo, pedido.revisaoId, { escolha: pedido.escolha, versao: pedido.versao, itemId: pedido.itemId }, historico.revisoes));
    if (acao === 'responderRevisao' && simularFalhaRevisao) { simularFalhaRevisao = false; throw new Error('Falha simulada após salvar a resposta.'); }
    repararRevisaoLocal();
    return guardar({ ...salvo, revisao: { ...salvo.revisao, resumo: selecionarFilaRevisao(historico.tentativas, historico.revisoes).resumo } });
  }
  const stats = salvo.treinos?.[pedido.modo] || {};
  if (acao === 'iniciarTreino') {
    if (stats.entrada && !stats.entrada.encerrada) return salvo;
    return guardar({ ...salvo, treinos: { ...salvo.treinos, [pedido.modo]: { ...stats, entrada: criarEntradaTreino(pedido.modo, pedido.variante, pedido.entradaId, stats.entrada) } } });
  }
  if (acao === 'abandonarTreino') return guardar({ ...salvo, treinos: { ...salvo.treinos, [pedido.modo]: { ...stats, entrada: { ...stats.entrada, encerrada: true, abandonada: true } } } });
  // Exercita a reconstrução de objetos que os testes isolados anteriores
  // não simulavam: o pedido mantém valores, mas inverte a ordem dos campos.
  const respostas = pedido.respostas.map(({ itemId, escolha }) => ({ escolha, itemId }));
  guardar(responderTreinoPerfil(salvo, pedido.modo, pedido.entradaId, respostas));
  for (const r of salvo.treinos[pedido.modo].entrada.resultados) {
    if (!historico.tentativas.some(t => t.rodadaId === pedido.entradaId && t.itemId === r.itemId)) {
      historico.tentativas.push({ ...r, modo: pedido.modo, rodadaId: pedido.entradaId, data: new Date().toISOString() });
    }
  }
  guardarHistorico(); return salvo;
}
// Batalha: roda a mesma regra do servidor (executarPedidoSupabase) sobre o perfil fictício, com atraso de rede simulado.
let simularFalhaBatalha = false;
async function servicoBatalha(_, acao, pedido = {}) {
  await new Promise(ok => setTimeout(ok, 350));
  if (acao === 'obterPerfil') return salvo;
  if (acao === 'acaoBatalha' && simularFalhaBatalha) { simularFalhaBatalha = false; throw new Error('Falha simulada ao salvar o turno.'); }
  const { perfil, eventos } = executarPedidoSupabase(salvo, { ...pedido, acao });
  registrarEventos(eventos);
  return guardar(perfil);
}
// Como na API: respostas entram no histórico lido pela Revisão; recibos alimentam o painel de estatísticas.
function registrarEventos(eventos) {
  historico.recibos ||= [];
  for (const evento of eventos) {
    if (evento.kind === 'resposta' && !historico.tentativas.some(t => t.rodadaId === evento.data.rodadaId && t.itemId === evento.data.itemId)) historico.tentativas.push(evento.data);
    if (evento.kind === 'recibo' && !historico.recibos.some(r => r.id === evento.id)) historico.recibos.push({ id: evento.id, data: evento.data, created_at: new Date().toISOString() });
  }
  guardarHistorico();
}
// Ranking, Coroas, Estatísticas e Crachá com dados fictícios e o mesmo motor do servidor.
const RIVAIS = [['Ana Beatriz', 9420], ['Bruno Lima', 7310], ['Carla Mendes', 6120], ['Diego Rocha', 4980], ['Elisa Prado', 3720], ['Fábio Nunes', 2400], ['Gabi Torres', 1650], ['Hugo Faria', 980], ['Íris Melo', 610], ['João Pedro', 320]];
const idFicticio = nome => 'h' + [...nome].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16).padStart(8, '0');
async function rankingFicticio() {
  await new Promise(ok => setTimeout(ok, 900));
  const meu = await calcularIdPublico(inicial.uid);
  return [...RIVAIS.map(([nome, xp], i) => ({ idPublico: idFicticio(nome), nome, xpGlobal: xp, partidas: 40 - i * 3, letras: 1800 - i * 150, tempoMedio: 70 + i * 9 })),
    { idPublico: meu, nome: salvo.nome, xpGlobal: salvo.pontuacaoTotal, partidas: 12, letras: 640, tempoMedio: 95 }].sort((a, b) => b.xpGlobal - a.xpGlobal);
}
async function coroasFicticias() {
  await new Promise(ok => setTimeout(ok, 1200));
  const xp = { anatomia: [600, 410, 280], neurologia: [300, 720, 510], farmaco: [210, 260, 680], micro: [180, 140, 220], patologia: [400, 160, 190], clinica: [350, 300, 260] };
  return { semana: semanaCoroas(), fim: fimDaSemana().toISOString(), materias: Object.fromEntries(MATERIAS.map(m => [m.id, RIVAIS.slice(0, 3)
    .map(([nome], i) => ({ idPublico: idFicticio(nome), nome, xp: xp[m.id][i] })).sort((a, b) => b.xp - a.xp)])) };
}
let simularFalhaPerfil = false;
async function servicoCracha(_, acao, pedido = {}) {
  await new Promise(ok => setTimeout(ok, 700));
  if (acao === 'obterEstatisticas') return resumirHistorico([...historico.tentativas.map(t => ({ kind: 'resposta', data: t, created_at: t.data })),
    ...(historico.recibos || []).map(r => ({ kind: 'recibo', data: r.data, created_at: r.created_at }))]);
  if (acao === 'verificarUsername') return { disponivel: !['admin', 'ana', 'bruno', 'carla', 'raphael'].includes(pedido.username) };
  if (acao === 'editarPerfil' && simularFalhaPerfil) { simularFalhaPerfil = false; throw new Error('Falha simulada ao salvar o crachá.'); }
  return guardar(executarPedidoSupabase(salvo, { ...pedido, acao }).perfil);
}
function semearPainel() {
  const agora = Date.now(), dia = 86400000;
  historico.recibos = [['cruzadinha', 'ANATOMIA-SISTEMA ESQUELETICO', 180, 0.2], ['quiz', null, 95, 1.1], ['batalha', null, 110, 1.3], ['ddx', null, 250, 8], ['verdadeMentira', null, 150, 8.2], ['cruzadinha', 'FARMACOLOGIA-BASICA', 140, 15], ['cruzadinha', 'NEUROLOGIA-TRONCO', 210, 22], ['quiz', null, 80, 30]]
    .map(([modo, titulo, xp, dias], i) => ({ id: `recibo:ficticio-${i}`, created_at: new Date(agora - dias * dia).toISOString(),
      data: { modo, rodadaId: `ficticio-${i}`, xp, ...(titulo ? { titulo } : {}), ...(modo === 'batalha' ? { resultado: 'vitoria', doencaId: 'dengue', revelada: true } : {}) } }));
  historico.tentativas = [...historico.tentativas, ...[BANCO_QUIZ[0], BANCO_QUIZ[1], BANCO_QUIZ[4], BANCO_FRASES[0], BANCO_FRASES[1], BANCO_QUIZ[2]].map((q, i) => ({
    modo: q.opcoes ? 'quiz' : 'verdadeMentira', itemId: q.id, versao: q.versao, tema: q.tema, rodadaId: `painel-${i}`, acertou: i % 3 === 2, data: new Date(agora - (i * 4 + 1) * dia).toISOString() }))];
  guardarHistorico();
  return guardar({ ...salvo, pontuacaoTotal: 7620, tickets: 6, xpTopicos: { 'ANATOMIA-SISTEMA ESQUELETICO': 3120, 'FARMACOLOGIA-BASICA': 960, 'NEUROLOGIA-TRONCO': 1840, 'DDX-RESPIRATORIO': 250, 'DDX-BATALHA': 230 },
    estatisticas: { 'ANATOMIA-SISTEMA ESQUELETICO': { partidas: 24, letras: 1100, tempo: 2400 }, 'FARMACOLOGIA-BASICA': { partidas: 9, letras: 420, tempo: 990 }, 'NEUROLOGIA-TRONCO': { partidas: 8, letras: 344, tempo: 1010 } },
    estatisticasGerais: { errosTotais: 212, maiorPalavra: 14, streakAtual: 4, maiorStreak: 9 },
    treinos: { quiz: { partidas: 2, acertos: 13, itens: 16, xp: 170, medidor: 1 }, verdadeMentira: { partidas: 1, acertos: 18, itens: 24, xp: 150, medidor: 0 } },
    ddx: { partidas: 1, seguros: 1, xp: 250 }, erroMedico: { partidas: 1, acertos: 3, etapas: 4, xp: 100 }, causaEfeito: { partidas: 0, acertos: 0, etapas: 0, xp: 0 },
    batalha: { ...salvo.batalha, tutorial: true, partidas: 3, vitorias: 2, xp: 230, descobertas: ['pneumo', 'dengue'], historia: 2, golpes: { bacti: 6, proto: 1, suporte: 5, critica: 2 },
      pets: { cocobi: { esc: 2, ativ: 1, suc: 1 }, pulsa: { esc: 1, ativ: 1, suc: 0 } }, buffs: { pneumo: 1, dengue: 1 },
      historico: [{ modo: 'historia', doencaId: 'pneumo', resultado: 'vitoria' }, { modo: 'historia', doencaId: 'dengue', resultado: 'vitoria' }, { modo: 'x1', doencaId: 'malaria', resultado: 'derrota' }] },
    revisao: { ...salvo.revisao, resumo: { total: 8, disponiveis: 5, aguardando: 3, proximaRevisao: new Date(agora + dia).toISOString() } },
    coroas: { semana: semanaCoroas(), xp: { anatomia: 640, neurologia: 330, micro: 90 } } });
}
export function Homologacao() {
  const [modo, setModo] = useState(localStorage.getItem('cacoMed-homologacao-modo') || 'quiz');
  const [dados, setDados] = useState(salvo);
  const trocarModo = valor => { setModo(valor); localStorage.setItem('cacoMed-homologacao-modo', valor); };
  // As telas do protótipo ocupam a janela inteira; começam abaixo da faixa de homologação.
  const faixa = useRef(null);
  const [alturaFaixa, setAlturaFaixa] = useState(86);
  useLayoutEffect(() => {
    const medir = () => setAlturaFaixa(faixa.current?.offsetHeight || 86);
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);
  return <><aside ref={faixa} style={{ padding: 12, background: '#ffb95f', color: '#0c1322', position: 'relative', zIndex: 100 }}><strong>HOMOLOGAÇÃO ISOLADA · dados fictícios locais · sem gravação no perfil real</strong><nav style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 8 }}><button onClick={() => trocarModo('quiz')}>Testar Quiz</button><button onClick={() => trocarModo('verdadeMentira')}>Testar Verdade ou mentira</button><button onClick={() => trocarModo('revisao')}>Testar Revisão</button><button onClick={() => { historico = { tentativas: [], revisoes: [] }; guardarHistorico(); setDados(guardar(inicial)); trocarModo('quiz'); }}>Reiniciar dados de teste</button><button onClick={() => { setDados(semearErrosRevisao()); trocarModo('revisao'); }}>Criar cinco erros fictícios</button><button onClick={() => { simularFalhaRevisao = true; }}>Simular falha na próxima resposta</button><button onClick={() => trocarModo('batalha')}>Testar Batalha</button><button onClick={() => { setDados(guardar({ ...salvo, tickets: 3, batalha: {} })); trocarModo('batalha'); }}>Reiniciar Batalha (3 tickets)</button><button onClick={() => { simularFalhaBatalha = true; }}>Simular falha no próximo turno</button><button onClick={() => trocarModo('ranking')}>Testar Ranking e Coroas</button><button onClick={() => trocarModo('estatisticas')}>Testar Estatísticas</button><button onClick={() => trocarModo('perfil')}>Testar Crachá</button><button onClick={() => { setDados(semearPainel()); }}>Semear painel, coroas e histórico</button><button onClick={() => { simularFalhaPerfil = true; }}>Simular falha ao salvar o crachá</button></nav></aside>{['batalha', 'ranking', 'estatisticas', 'perfil'].includes(modo) && <style>{`.cbt { top: ${alturaFaixa}px; }`}</style>}{modo === 'batalha' ? <BatalhaDiagnostica usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('quiz')} servicoPerfil={servicoBatalha} />
  : modo === 'ranking' ? <Ranking usuario={inicial} dadosUsuario={dados} setTelaAtual={tela => trocarModo(['menu', 'topicos'].includes(tela) ? 'quiz' : tela)} buscarRanking={rankingFicticio} buscarCoroas={coroasFicticias} sincronizar={async () => {}} />
  : modo === 'estatisticas' ? <Estatisticas usuario={inicial} dadosUsuario={dados} setTelaAtual={tela => trocarModo(['menu', 'topicos'].includes(tela) ? 'quiz' : tela === 'revisaoInteligente' ? 'revisao' : tela)} servicoPerfil={servicoCracha} />
  : modo === 'perfil' ? <PerfilUsuario usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={tela => trocarModo(['menu', 'login'].includes(tela) ? 'quiz' : tela)} servicoPerfil={servicoCracha} aoSair={async () => {}} /> : modo === 'revisao' ? <RevisaoInteligente usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('quiz')} servicoPerfil={servicoPerfil} /> : <TreinoMedico key={modo} modo={modo} usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('revisao')} servicoPerfil={servicoPerfil} />}</>;
}
const root = import.meta.hot?.data.root || createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Homologacao />);
