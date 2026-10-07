// Entrada de desenvolvimento independente; não é incluída na build de produção.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TreinoMedico from '../src/components/TreinoMedico';
import RevisaoInteligente from '../src/components/RevisaoInteligente';
import BatalhaDiagnostica from '../src/components/BatalhaDiagnostica';
import Ranking from '../src/components/Ranking';
import Estatisticas from '../src/components/Estatisticas';
import PerfilUsuario from '../src/components/PerfilUsuario';
import MenuPrincipal from '../src/components/MenuPrincipal';
import PacienteDdx from '../src/components/PacienteDdx';
import SelecaoTopicos from '../src/components/SelecaoTopicos';
import Jogo from '../src/components/Jogo';
import Login from '../src/components/Login';
import Cadastro from '../src/components/Cadastro';
import Cadastro2 from '../src/components/Cadastro2';
import { BarraLateral } from '../src/components/cascaUi';
import { fotoDoPerfil } from '../src/utils/fotosCracha';
import { calcularIdPublico } from '../src/services/rankingPublico';
import { MATERIAS, semanaCoroas, fimDaSemana } from '../src/utils/coroas';
import { resumirHistorico } from '../src/utils/estatisticasPainel';
import { executarPedidoSupabase } from '../src/shared/executarPedidoSupabase';
import { BANCO_QUIZ, BANCO_FRASES } from '../src/utils/bancoTreinos';
import { selecionarFilaRevisao, criarEntradaRevisao, responderRevisaoPerfil, encerrarRevisaoPerfil, chaveItemRevisao } from '../src/utils/revisaoInteligente';
import { criarEntradaTreino, responderTreinoPerfil } from '../src/utils/treinos';
import { criarMissoesDiarias, dataLocalHoje } from '../src/utils/missoes';
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
// Entrada (login, cadastro e Cadastro 2.0) com conta fictícia: senha certa "plantao2026";
// o e-mail homologacao@exemplo.com já tem conta; usernames ana, bruno, carla, admin e raphael já estão em uso.
const espera = ms => new Promise(ok => setTimeout(ok, ms));
let navegarFicticio = () => {};
let simularFalhaCadastro = false;
let simularContaAntigaGoogle = false;
let perfilCadastrado = null;
const contaFicticia = {
  async entrarComSenha(email, senha) { await espera(800); if (senha !== 'plantao2026') throw new Error('Credenciais inválidas.'); navegarFicticio('menu'); },
  async entrarComGoogle() {
    await espera(1100);
    if (simularContaAntigaGoogle) { simularContaAntigaGoogle = false; return { pendente: { credencial: 'ficticia', email: 'homologacao@exemplo.com' } }; }
    navegarFicticio('cadastro2');
    return {};
  },
  async vincularGoogle(email, senha) { await espera(800); if (senha !== 'plantao2026') throw new Error('Senha antiga incorreta.'); navegarFicticio('menu'); },
  async recuperarSenha() { await espera(800); },
  async criarConta({ nome, email }) {
    await espera(900);
    if (email.toLowerCase() === 'homologacao@exemplo.com') throw Object.assign(new Error('Em uso.'), { code: 'auth/email-already-in-use' });
    return { user: { uid: 'cadastro-' + email.toLowerCase(), email, displayName: nome, providerData: [{ providerId: 'password' }] } };
  },
  async criarSenha() { await espera(700); },
  async gravarPerfilAntigo() { await espera(700); },
  async sair() { await espera(300); navegarFicticio('login'); },
};
const usuarioGoogle = { uid: 'google-ficticio', email: 'ana.souza@exemplo.com', displayName: 'Ana Beatriz Souza', providerData: [{ providerId: 'google.com' }] };
async function servicoEntrada(user, acao, pedido = {}) {
  if (acao === 'verificarUsername') return servicoCracha(user, acao, pedido);
  await espera(acao === 'cadastrar' ? 1800 : 600);
  if (acao === 'cadastrar') {
    if (simularFalhaCadastro) { simularFalhaCadastro = false; throw new Error('Falha simulada no cadastro.'); }
    perfilCadastrado = { uid: user.uid, email: user.email, nome: user.displayName || user.email.split('@')[0], username: pedido.username, titulo: pedido.titulo, role: 'jogador',
      materiaPreferida: pedido.materiaPreferida, especialidade: pedido.materiaPreferida, pontuacaoTotal: 0, tickets: 0, xpTopicos: {}, estatisticas: {}, estatisticasGerais: {},
      economia: { versao: 2, ultimoNivelPremiado: 1 }, missoesDiarias: criarMissoesDiarias(), dataUltimoLogin: dataLocalHoje(), tutorialCruzadinhasConcluido: false, criadoEm: new Date().toISOString() };
    return perfilCadastrado;
  }
  if (acao === 'editarPerfil') return (perfilCadastrado = { ...perfilCadastrado, ...pedido });
  throw new Error('Ação indisponível na homologação.');
}
// Paciente DDX com o mesmo motor do servidor; a falha simulada vale para a próxima gravação.
let simularFalhaPaciente = false;
async function servicoPaciente(_, acao, pedido = {}) {
  await espera(900);
  if (simularFalhaPaciente) { simularFalhaPaciente = false; throw new Error('Falha simulada ao gravar o caso.'); }
  const { perfil, eventos } = executarPedidoSupabase(salvo, { ...pedido, acao });
  registrarEventos(eventos);
  return guardar(perfil);
}
// Cruzadinhas: banco fictício pequeno; a gravação roda a regra do servidor (registrarPartida) sobre o perfil fictício.
const termo = (palavra, dicaBasica) => ({ palavra, palavraComEspaco: palavra, dificuldade: 0, dicaBasica });
const BANCO_FICTICIO = {
  'ANATOMIA-SISTEMA ESQUELETICO': [['FEMUR', 'Osso mais longo do corpo, na coxa.'], ['TIBIA', 'Osso medial da perna.'], ['FIBULA', 'Osso lateral e fino da perna.'], ['UMERO', 'Osso do braço.'], ['RADIO', 'Osso lateral do antebraço.'], ['ULNA', 'Osso medial do antebraço.'], ['PATELA', 'Osso sesamoide do joelho.'], ['ESTERNO', 'Osso plano no centro do tórax.'], ['CLAVICULA', 'Une o esterno à escápula.'], ['SACRO', 'Osso formado por vértebras fundidas na pelve.']].map(([p, d]) => termo(p, d)),
  'ANATOMIA-SISTEMA MUSCULAR': [['BICEPS', 'Flexor do cotovelo com duas cabeças.'], ['TRICEPS', 'Extensor do cotovelo.'], ['DELTOIDE', 'Músculo que arredonda o ombro.'], ['TRAPEZIO', 'Músculo do dorso que eleva o ombro.'], ['SARTORIO', 'Músculo mais longo do corpo.'], ['DIAFRAGMA', 'Principal músculo da respiração.'], ['MASSETER', 'Músculo da mastigação.']].map(([p, d]) => termo(p, d)),
  'FARMACOLOGIA-ANTIBIOTICOS': [['AMOXICILINA', 'Penicilina de amplo espectro por via oral.'], ['AZITROMICINA', 'Macrolídeo de dose única diária.'], ['DOXICICLINA', 'Tetraciclina usada na leptospirose.'], ['CEFTRIAXONA', 'Cefalosporina de terceira geração.'], ['VANCOMICINA', 'Glicopeptídeo contra MRSA.'], ['GENTAMICINA', 'Aminoglicosídeo nefrotóxico.']].map(([p, d]) => termo(p, d)),
};
let simularFalhaCruzadinha = false;
async function registrarFicticio(_, partida) {
  await espera(1100);
  if (simularFalhaCruzadinha) { simularFalhaCruzadinha = false; throw new Error('Falha simulada ao gravar a cruzadinha.'); }
  const { perfil, eventos } = executarPedidoSupabase(salvo, { acao: 'registrarPartida', partida });
  registrarEventos(eventos);
  return guardar(perfil);
}
async function servicoGenerico(_, acao, pedido = {}) {
  await espera(600);
  const { perfil, eventos } = executarPedidoSupabase(salvo, { ...pedido, acao });
  registrarEventos(eventos);
  return guardar(perfil);
}
// Dicas da IA fictícias (nível 3 ou mais do tópico), no mesmo formato JSON que a IA devolve.
async function iaFicticia(prompt) {
  await espera(700);
  const dica = p => ({ laudo: `Laudo fictício: termo de ${p.length} letras.`, residente: `Residente: aparece no plantão com frequência (${p[0]}...).`, paciente: `Paciente: é aquele de ${p.length} letras.` });
  const lista = prompt.includes('Lista: ') ? prompt.split('Lista: ')[1].split(',').map(p => p.trim()).filter(Boolean) : null;
  return JSON.stringify(lista ? Object.fromEntries(lista.map(p => [p, dica(p)])) : dica(prompt.match(/\[([^\]]+)\]/)?.[1] || 'TERMO'));
}
const TELAS_PROTOTIPO = ['batalha', 'ranking', 'estatisticas', 'perfil', 'menu', 'login', 'cadastro', 'cadastro2', 'pacienteDdx', 'topicos', 'jogo'];
const TELAS_CASCA = ['menu', 'ranking', 'estatisticas', 'perfil', 'topicos'];

export function Homologacao() {
  const [modo, setModo] = useState(localStorage.getItem('cacoMed-homologacao-modo') || 'quiz');
  const [dados, setDados] = useState(salvo);
  const trocarModo = valor => { setModo(valor); localStorage.setItem('cacoMed-homologacao-modo', valor); };
  // Navegação das telas como no App: telas sem equivalente aqui (cruzadinhas, DDX) voltam ao menu.
  const navegar = tela => trocarModo({ revisaoInteligente: 'revisao', selecaoDDX: 'menu' }[tela] || tela);
  const [partidaCruzadinha, setPartidaCruzadinha] = useState(() => JSON.parse(localStorage.getItem('cacoMed-homologacao-cruzadinha') || 'null') || ['Anatomia', 'Sistema Esqueletico']);
  const iniciarCruzadinha = (materia, sub) => { setPartidaCruzadinha([materia, sub]); localStorage.setItem('cacoMed-homologacao-cruzadinha', JSON.stringify([materia, sub])); trocarModo('jogo'); };
  useEffect(() => { navegarFicticio = navegar; });
  const comCasca = TELAS_CASCA.includes(modo);
  useEffect(() => { document.body.classList.toggle('com-casca', comCasca); }, [comCasca]);
  // As telas do protótipo ocupam a janela inteira; começam abaixo da faixa de homologação.
  const faixa = useRef(null);
  const [alturaFaixa, setAlturaFaixa] = useState(86);
  useLayoutEffect(() => {
    const medir = () => setAlturaFaixa(faixa.current?.offsetHeight || 86);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(faixa.current);
    return () => observador.disconnect();
  }, []);
  return <><aside ref={faixa} style={{ padding: 12, background: '#ffb95f', color: '#0c1322', position: 'relative', zIndex: 100 }}><details open={(localStorage.getItem('cacoMed-homologacao-faixa') || (window.innerWidth >= 960 ? 'aberta' : 'fechada')) === 'aberta'} onToggle={e => localStorage.setItem('cacoMed-homologacao-faixa', e.currentTarget.open ? 'aberta' : 'fechada')}><summary style={{ cursor: 'pointer' }}><strong>HOMOLOGAÇÃO ISOLADA · dados fictícios locais · sem gravação no perfil real</strong></summary><nav style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 8 }}><button onClick={() => trocarModo('quiz')}>Testar Quiz</button><button onClick={() => trocarModo('verdadeMentira')}>Testar Verdade ou mentira</button><button onClick={() => trocarModo('revisao')}>Testar Revisão</button><button onClick={() => { historico = { tentativas: [], revisoes: [] }; guardarHistorico(); setDados(guardar(inicial)); trocarModo('quiz'); }}>Reiniciar dados de teste</button><button onClick={() => { setDados(semearErrosRevisao()); trocarModo('revisao'); }}>Criar cinco erros fictícios</button><button onClick={() => { simularFalhaRevisao = true; }}>Simular falha na próxima resposta</button><button onClick={() => trocarModo('batalha')}>Testar Batalha</button><button onClick={() => { setDados(guardar({ ...salvo, tickets: 3, batalha: {} })); trocarModo('batalha'); }}>Reiniciar Batalha (3 tickets)</button><button onClick={() => { simularFalhaBatalha = true; }}>Simular falha no próximo turno</button><button onClick={() => trocarModo('ranking')}>Testar Ranking e Coroas</button><button onClick={() => trocarModo('estatisticas')}>Testar Estatísticas</button><button onClick={() => trocarModo('perfil')}>Testar Crachá</button><button onClick={() => { setDados(semearPainel()); }}>Semear painel, coroas e histórico</button><button onClick={() => { simularFalhaPerfil = true; }}>Simular falha ao salvar o crachá</button><button onClick={() => trocarModo('menu')}>Testar menu</button><button onClick={() => trocarModo('login')}>Testar login</button><button onClick={() => trocarModo('cadastro')}>Testar cadastro</button><button onClick={() => trocarModo('cadastro2')}>Testar Cadastro 2.0</button><button onClick={() => { simularFalhaCadastro = true; }}>Simular falha no cadastro</button><button onClick={() => { simularContaAntigaGoogle = true; }}>Google com conta antiga</button><button onClick={() => trocarModo('pacienteDdx')}>Testar Paciente DDX</button><button onClick={() => { simularFalhaPaciente = true; }}>Simular falha ao gravar o caso</button><button onClick={() => trocarModo('topicos')}>Testar cruzadinhas</button><button onClick={() => { simularFalhaCruzadinha = true; }}>Simular falha ao gravar a cruzadinha</button><button onClick={() => { setDados(guardar({ ...salvo, tutorialCruzadinhasConcluido: false, estatisticas: {}, estatisticasGerais: {} })); }}>Rever tutorial da cruzadinha</button></nav></details></aside>{TELAS_PROTOTIPO.includes(modo) && <style>{`.cbt { top: ${alturaFaixa}px; }`}</style>}{comCasca && <BarraLateral tela={modo} ir={navegar} p={dados} foto={fotoDoPerfil(dados)} />}{modo === 'topicos' ? <SelecaoTopicos setTelaAtual={navegar} iniciarJogo={iniciarCruzadinha} dadosUsuario={dados} bancoDePalavras={BANCO_FICTICIO} usuario={inicial} setDadosUsuario={setDados} servicoPerfil={servicoGenerico} />
  : modo === 'jogo' ? <Jogo key={partidaCruzadinha.join('-')} bancoDePalavras={BANCO_FICTICIO} materia={partidaCruzadinha[0]} subMateria={partidaCruzadinha[1]} setTelaAtual={navegar} usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} registrar={registrarFicticio} servicoPerfil={servicoGenerico} consultarIA={iaFicticia} />
  : modo === 'pacienteDdx' ? <PacienteDdx usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={navegar} servicoPerfil={servicoPaciente} />
  : modo === 'menu' ? <MenuPrincipal usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={navegar} buscarRanking={rankingFicticio} />
  : modo === 'login' ? <Login setTelaAtual={navegar} conta={contaFicticia} />
  : modo === 'cadastro' ? <Cadastro setTelaAtual={navegar} conta={contaFicticia} servicoPerfil={servicoEntrada} onConcluido={perfil => { setDados(perfil); navegar('menu'); }} />
  : modo === 'cadastro2' ? <Cadastro2 usuario={usuarioGoogle} conta={contaFicticia} servicoPerfil={servicoEntrada} onConcluido={perfil => { setDados(perfil); navegar('menu'); }} />
  : modo === 'batalha' ? <BatalhaDiagnostica usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('quiz')} servicoPerfil={servicoBatalha} />
  : modo === 'ranking' ? <Ranking usuario={inicial} dadosUsuario={dados} setTelaAtual={navegar} buscarRanking={rankingFicticio} buscarCoroas={coroasFicticias} sincronizar={async () => {}} />
  : modo === 'estatisticas' ? <Estatisticas usuario={inicial} dadosUsuario={dados} setTelaAtual={navegar} servicoPerfil={servicoCracha} />
  : modo === 'perfil' ? <PerfilUsuario usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={navegar} servicoPerfil={servicoCracha} aoSair={async () => {}} /> : modo === 'revisao' ? <RevisaoInteligente usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('quiz')} servicoPerfil={servicoPerfil} /> : <TreinoMedico key={modo} modo={modo} usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('revisao')} servicoPerfil={servicoPerfil} />}</>;
}
const root = import.meta.hot?.data.root || createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Homologacao />);
