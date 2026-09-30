// Entrada de desenvolvimento independente; não é incluída na build de produção.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import TreinoMedico from '../src/components/TreinoMedico';
import RevisaoInteligente from '../src/components/RevisaoInteligente';
import { BANCO_QUIZ, BANCO_FRASES } from '../src/utils/bancoTreinos';
import { selecionarFilaRevisao, criarEntradaRevisao, responderRevisaoPerfil, encerrarRevisaoPerfil, chaveItemRevisao } from '../src/utils/revisaoInteligente';
import { criarEntradaTreino, responderTreinoPerfil } from '../src/utils/treinos';
import { criarMissoesDiarias } from '../src/utils/missoes';
import '../src/index.css';

const chave = 'cacoMed-homologacao-v2';
const inicial = { uid: 'teste-local', nome: 'Homologação', role: 'admin', pontuacaoTotal: 490, tickets: 0, missoesDiarias: criarMissoesDiarias() };
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
export function Homologacao() {
  const [modo, setModo] = useState(localStorage.getItem('cacoMed-homologacao-modo') || 'quiz');
  const [dados, setDados] = useState(salvo);
  const trocarModo = valor => { setModo(valor); localStorage.setItem('cacoMed-homologacao-modo', valor); };
  return <><aside style={{ padding: 12, background: '#ffb95f', color: '#0c1322', position: 'relative', zIndex: 100 }}><strong>HOMOLOGAÇÃO ISOLADA · dados fictícios locais · sem gravação no perfil real</strong><nav style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 8 }}><button onClick={() => trocarModo('quiz')}>Testar Quiz</button><button onClick={() => trocarModo('verdadeMentira')}>Testar Verdade ou mentira</button><button onClick={() => trocarModo('revisao')}>Testar Revisão</button><button onClick={() => { historico = { tentativas: [], revisoes: [] }; guardarHistorico(); setDados(guardar(inicial)); trocarModo('quiz'); }}>Reiniciar dados de teste</button><button onClick={() => { setDados(semearErrosRevisao()); trocarModo('revisao'); }}>Criar cinco erros fictícios</button><button onClick={() => { simularFalhaRevisao = true; }}>Simular falha na próxima resposta</button></nav></aside>{modo === 'revisao' ? <RevisaoInteligente usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('quiz')} servicoPerfil={servicoPerfil} /> : <TreinoMedico key={modo} modo={modo} usuario={inicial} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => trocarModo('revisao')} servicoPerfil={servicoPerfil} />}</>;
}
const root = import.meta.hot?.data.root || createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Homologacao />);
