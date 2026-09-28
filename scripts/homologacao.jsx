// Entrada de desenvolvimento independente; não é incluída na build de produção.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import TreinoMedico from '../src/components/TreinoMedico';
import { criarEntradaTreino, responderTreinoPerfil } from '../src/utils/treinos';
import { criarMissoesDiarias } from '../src/utils/missoes';
import '../src/index.css';

const chave = 'cacoMed-homologacao-v2';
const inicial = { uid: 'teste-local', nome: 'Homologação', role: 'admin', pontuacaoTotal: 490, tickets: 0, missoesDiarias: criarMissoesDiarias() };
let salvo = JSON.parse(localStorage.getItem(chave) || 'null') || inicial;
const guardar = perfil => { salvo = perfil; localStorage.setItem(chave, JSON.stringify(perfil)); return perfil; };
async function servicoPerfil(_, acao, pedido) {
  if (acao === 'obterPerfil') return salvo;
  const stats = salvo.treinos?.[pedido.modo] || {};
  if (acao === 'iniciarTreino') {
    if (stats.entrada && !stats.entrada.encerrada) return salvo;
    return guardar({ ...salvo, treinos: { ...salvo.treinos, [pedido.modo]: { ...stats, entrada: criarEntradaTreino(pedido.modo, pedido.variante, pedido.entradaId, stats.entrada) } } });
  }
  if (acao === 'abandonarTreino') return guardar({ ...salvo, treinos: { ...salvo.treinos, [pedido.modo]: { ...stats, entrada: { ...stats.entrada, encerrada: true, abandonada: true } } } });
  // Exercita a reconstrução de objetos que os testes isolados anteriores
  // não simulavam: o pedido mantém valores, mas inverte a ordem dos campos.
  const respostas = pedido.respostas.map(({ itemId, escolha }) => ({ escolha, itemId }));
  return guardar(responderTreinoPerfil(salvo, pedido.modo, pedido.entradaId, respostas));
}
export function Homologacao() {
  const [modo, setModo] = useState('quiz');
  const [dados, setDados] = useState(salvo);
  return <><aside style={{ padding: 12, background: '#ffb95f', color: '#0c1322', position: 'relative', zIndex: 100 }}><strong>HOMOLOGAÇÃO ISOLADA · dados fictícios locais · sem gravação no perfil real</strong><nav style={{ display: 'flex', gap: 20, marginTop: 8 }}><button onClick={() => setModo('quiz')}>Testar Quiz</button><button onClick={() => setModo('verdadeMentira')}>Testar Verdade ou mentira</button><button onClick={() => { setDados(guardar(inicial)); setModo('quiz'); }}>Reiniciar dados de teste</button></nav></aside><TreinoMedico key={modo} modo={modo} usuario={{ uid: inicial.uid }} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={() => setModo(modo === 'quiz' ? 'verdadeMentira' : 'quiz')} servicoPerfil={servicoPerfil} /></>;
}
const root = import.meta.hot?.data.root || createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Homologacao />);
