// Página de desenvolvimento, fora da entrada da build de produção. Todas as
// gravações são isoladas pelo servidor e exigem a conta real de administrador.
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/firebase';
import { supabase, USAR_AUTH_SUPABASE } from '../src/supabase';
import { usuarioSupabase } from '../src/services/authSupabase';
import { chamarPerfilSupabase } from '../src/services/perfilSupabase';
import TreinoMedico from '../src/components/TreinoMedico';
import RevisaoInteligente from '../src/components/RevisaoInteligente';
import { BANCO_QUIZ, BANCO_FRASES } from '../src/utils/bancoTreinos';
import { obterAuditoria } from '../src/utils/erroMedico';
import { obterRelacao } from '../src/utils/causaEfeito';
import '../src/index.css';

const medidas = [];
let ultimoPedido;
const servicoPerfil = async (usuario, acao, dados = {}) => {
  const inicio = performance.now();
  let resultado;
  try {
    resultado = await chamarPerfilSupabase(usuario, acao, { ...dados, ambiente: 'homologacao' });
    medidas.push({ acao, ms: Math.round(performance.now() - inicio), sucesso: true });
  } catch (erro) {
    medidas.push({ acao, ms: Math.round(performance.now() - inicio), sucesso: false, erro: erro.message });
    throw erro;
  }
  if (acao.startsWith('responder') || acao === 'acaoPlantao' || acao === 'registrarPartida') ultimoPedido = { acao, dados };
  return resultado;
};
const verificar = (condicao, texto) => { if (!condicao) throw new Error(texto); };
const mesmaEconomia = (a,b) => a.pontuacaoTotal === b.pontuacaoTotal && a.tickets === b.tickets;

export default function HomologacaoSupabase() {
  const [usuario, setUsuario] = useState(null);
  const [dados, setDados] = useState(null);
  const [modo, setModo] = useState(sessionStorage.getItem('cacamed-supabase-teste-modo') || 'quiz');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [status, setStatus] = useState('Carregando sessão…');
  const [relatorio, setRelatorio] = useState(JSON.parse(sessionStorage.getItem('cacamed-supabase-teste-relatorio') || 'null'));
  useEffect(() => {
    let ativo = true;
    const receber = user => {
    if (!ativo) return;
    setUsuario(user);
    if (!user) { setStatus('Entre como admin na página principal e volte a esta página.'); return; }
    servicoPerfil(user, 'prepararHomologacao').then(p => { setDados(p); setStatus('Ambiente remoto de teste pronto.'); }).catch(e => setErro(e.message));
    };
    if (USAR_AUTH_SUPABASE) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
        // Não inicia APIs Auth dentro do callback que ainda segura o lock.
        setTimeout(() => receber(session ? usuarioSupabase(session.user) : null), 0);
      });
      return () => { ativo = false; subscription.unsubscribe(); };
    }
    const cancelar = onAuthStateChanged(auth, receber);
    return () => { ativo = false; cancelar(); };
  }, []);
  const concorrencia = async () => {
    if (ocupado || !usuario) return;
    setOcupado(true); setErro(''); medidas.length = 0;
    try {
      const realAntes = await chamarPerfilSupabase(usuario, 'obterPerfil');
      let p = await servicoPerfil(usuario, 'obterPerfil');
      const testes = [];
      for (const n of [2, 5, 10]) {
        setStatus(`${n} gravações simultâneas do mesmo recibo`);
        const partida = { id: crypto.randomUUID(), chaveXP: 'ANATOMIA-SISTEMA RESPIRATORIO', subMateria: 'Sistema Respiratorio', palavras: 5, letras: 30, tempo: 100, erros: 2, maiorPalavra: 10, xp: 999999 };
        const resultados = await Promise.allSettled(Array.from({ length: n }, () => servicoPerfil(usuario, 'registrarPartida', { partida })));
        verificar(resultados.every(r => r.status === 'fulfilled'), 'Recibo concorrente teve falha; consulte o estado salvo.');
        p = await servicoPerfil(usuario, 'obterPerfil');
        verificar(resultados.every(r => mesmaEconomia(r.value, p)), 'Economia divergente entre reenvios concorrentes.');
        verificar(mesmaEconomia(p, await servicoPerfil(usuario, 'registrarPartida', { partida })), 'Reenvio posterior duplicou recompensa.');
        testes.push({ simultaneas: n, sucesso: n, reciboUnico: true });
      }
      setStatus('Respostas simultâneas de Quiz');
      let entradaId = crypto.randomUUID();
      p = await servicoPerfil(usuario, 'iniciarTreino', { modo: 'quiz', variante: 'teoria', entradaId });
      entradaId = p.treinos.quiz.entrada.id;
      const respostas = p.treinos.quiz.entrada.itens.map(item => ({ itemId: item.id, escolha: BANCO_QUIZ.find(q => q.id === item.id).correta }));
      // O motor confirma uma pergunta por pedido. A concorrência é aplicada
      // à quinta resposta, após as quatro primeiras confirmações.
      for (let i = (p.treinos.quiz.entrada.respostas?.length || 0) + 1; i < respostas.length; i++) {
        p = await servicoPerfil(usuario, 'responderTreino', { modo: 'quiz', entradaId, respostas: respostas.slice(0, i) });
      }
      const resultados = await Promise.allSettled(Array.from({ length: 5 }, () => servicoPerfil(usuario, 'responderTreino', { modo: 'quiz', entradaId, respostas })));
      verificar(resultados.every(r => r.status === 'fulfilled'), 'Quiz concorrente teve falha.');
      p = await servicoPerfil(usuario, 'obterPerfil');
      verificar(resultados.every(r => mesmaEconomia(r.value, p)) && p.treinos.quiz.entrada.encerrada, 'Quiz concorrente divergente.');
      const adulteradas = respostas.map((r, i) => i ? r : { ...r, escolha: p.treinos.quiz.entrada.itens[0].opcoes.find(o => o.id !== r.escolha).id });
      let recusou = false;
      try { await servicoPerfil(usuario, 'responderTreino', { modo: 'quiz', entradaId, respostas: adulteradas }); } catch { recusou = true; }
      verificar(recusou, 'Resposta confirmada pôde ser alterada.');
      verificar(JSON.stringify(realAntes) === JSON.stringify(await chamarPerfilSupabase(usuario, 'obterPerfil')), 'Perfil real alterado.');
      const result = { data: new Date().toISOString(), tipo: 'concorrencia-mesmo-jogador', testes, quizSimultaneas: 5, alteracaoRecusada: recusou, perfilRealPreservado: true, medidas: [...medidas], limites: 'Mesmo administrador autenticado, perfil isolado. Não simula jogadores diferentes nem carga sustentada.' };
      sessionStorage.setItem('cacamed-supabase-teste-relatorio', JSON.stringify(result));
      setRelatorio(result); setDados(p); setStatus('Concorrência validada no perfil isolado.');
    } catch (e) {
      const parcial = { data: new Date().toISOString(), tipo: 'concorrencia-interrompida', erro: e.message, medidas: [...medidas] };
      setRelatorio(parcial); sessionStorage.setItem('cacamed-supabase-teste-relatorio', JSON.stringify(parcial));
      setErro(e.message); setStatus('Concorrência interrompida; confira o relatório.');
    }
    finally { setOcupado(false); }
  };
  const trocar = m => { sessionStorage.setItem('cacamed-supabase-teste-modo',m); setModo(m); };
  const executar = async () => {
    if (ocupado || !usuario) return;
    setOcupado(true); setErro(''); medidas.length = 0;
    const positivos = [];
    try {
      const realAntes = await chamarPerfilSupabase(usuario, 'obterPerfil');
      let p = await servicoPerfil(usuario, 'obterPerfil');
      for (let rodada = 0; rodada < 2; rodada++) {
        setStatus(`Quiz: rodada ${rodada + 1}/2`);
        const entradaId = crypto.randomUUID();
        p = await servicoPerfil(usuario, 'iniciarTreino', { modo: 'quiz', variante: rodada ? 'casos' : 'teoria', entradaId });
        const respostas = [];
        for (const [i,item] of p.treinos.quiz.entrada.itens.entries()) {
          const original = BANCO_QUIZ.find(q => q.id === item.id);
          respostas.push({ escolha: !rodada && !i ? item.opcoes.find(o => o.id !== original.correta).id : original.correta, itemId: item.id });
          p = await servicoPerfil(usuario, 'responderTreino', { modo: 'quiz', entradaId, respostas: [...respostas] });
        }
        verificar(p.treinos.quiz.entrada.encerrada, 'Quiz não encerrado.');
        const repetido = await servicoPerfil(usuario, 'responderTreino', { modo: 'quiz', entradaId, respostas });
        verificar(mesmaEconomia(p,repetido) && p.treinos.quiz.partidas === repetido.treinos.quiz.partidas, 'Quiz duplicou recompensa.');
      }
      positivos.push('Duas rodadas consecutivas do Quiz e reenvio sem duplicar recompensa.');
      setStatus('Verdade ou mentira');
      p = await servicoPerfil(usuario, 'iniciarTreino', { modo: 'verdadeMentira', variante: 'misto', entradaId: crypto.randomUUID() });
      const entradaId = p.treinos.verdadeMentira.entrada.id;
      const itens = p.treinos.verdadeMentira.entrada.itens;
      const gabarito = itens.map(item => BANCO_FRASES.find(q => q.id === item.id).verdadeira);
      const totalVerdades = gabarito.filter(Boolean).length;
      const trocarIndice = totalVerdades === 1 ? gabarito.indexOf(false) : totalVerdades === 4 ? gabarito.indexOf(true) : 0;
      const respostas = itens.map((item,i) => ({ escolha: i === trocarIndice ? !gabarito[i] : gabarito[i], itemId: item.id }));
      p = await servicoPerfil(usuario, 'responderTreino', { modo: 'verdadeMentira', entradaId, respostas });
      verificar(p.treinos.verdadeMentira.entrada.relatorio.acertos === 4, 'Classificação das frases divergente.');
      verificar(mesmaEconomia(p,await servicoPerfil(usuario, 'responderTreino', { modo: 'verdadeMentira', entradaId, respostas })), 'Frases duplicaram recompensa.');
      positivos.push('Cinco frases avaliadas, quatro acertos e reenvio preservado.');
      setStatus('Revisão inteligente');
      const antesRevisao = p;
      p = await servicoPerfil(usuario, 'consultarRevisao');
      const revisaoId = crypto.randomUUID();
      p = await servicoPerfil(usuario, 'iniciarRevisao', { revisaoId });
      for (const item of p.revisao.entrada.itens) {
        const original = (item.modo === 'quiz' ? BANCO_QUIZ : BANCO_FRASES).find(q => q.id === item.id);
        const escolha = item.modo === 'quiz' ? original.correta : original.verdadeira;
        p = await servicoPerfil(usuario, 'responderRevisao', { revisaoId, itemId: item.id, versao: item.versao, escolha });
      }
      verificar(p.revisao.entrada.encerrada && mesmaEconomia(p,antesRevisao), 'Revisão mudou a economia.');
      positivos.push('Revisão usou erros reais do teste, finalizou e preservou XP/tickets.');
      setStatus('Plantão médico: conclusão e repetição');
      for (let rodada=0; rodada<2; rodada++) {
        const entradaId=crypto.randomUUID();
        p=await servicoPerfil(usuario,'iniciarPlantao',{casoId:'resp-asma-1',entradaId});
        p=await servicoPerfil(usuario,'acaoPlantao',{entradaId,escolhas:['gravidade','inicio','antecedentes','medicamentos','alergias','associados','ausculta','pfe','asma','tratamento','antiinflamatorio','reavaliar','orientar','alta']});
        verificar(p.ddx.entrada.relatorio.encerrado && p.ddx.entrada.relatorio.seguro, 'Plantão não concluído com segurança.');
        if(rodada) verificar(p.ddx.entrada.xpConcedido===0,'Plantão repetido concedeu XP.');
      }
      positivos.push('Plantão confirmou caso seguro; repetição sem XP novo.');
      for(const c of [{campo:'erroMedico',iniciar:'iniciarAuditoria',responder:'responderAuditoria',key:'auditoriaId',caso:obterAuditoria('resp-asma-auditoria-1')},
        {campo:'causaEfeito',iniciar:'iniciarRelacao',responder:'responderRelacao',key:'relacaoId',caso:obterRelacao('resp-asma-relacoes-1')}]) {
        setStatus(`DDX: ${c.campo}`);
        for(let rodada=0;rodada<2;rodada++) {
          const entradaId=crypto.randomUUID();
          p=await servicoPerfil(usuario,c.iniciar,{[c.key]:c.caso.id,entradaId});
          const respostas=[];
          for(const pergunta of c.caso.perguntas) {
            respostas.push(pergunta.correta);
            p=await servicoPerfil(usuario,c.responder,{entradaId,respostas:[...respostas]});
          }
          verificar(p[c.campo].entrada.relatorio.acertos===4,'Relatório DDX divergente.');
          if(rodada) verificar(p[c.campo].entrada.xpConcedido===0,'DDX repetido concedeu XP.');
        }
        positivos.push(`${c.campo}: quatro etapas, 4/4 e repetição sem XP.`);
      }
      setStatus('Recibo de cruzadinha e verificação final');
      const partida={id:crypto.randomUUID(),chaveXP:'ANATOMIA-SISTEMA RESPIRATORIO',subMateria:'Sistema Respiratorio',palavras:5,letras:30,tempo:100,erros:2,maiorPalavra:10,xp:999999};
      p=await servicoPerfil(usuario,'registrarPartida',{partida});
      verificar(mesmaEconomia(p,await servicoPerfil(usuario,'registrarPartida',{partida})),'Cruzadinha duplicou recompensa.');
      positivos.push('Cruzadinha recalculada no servidor e recibo idempotente.');
      const realDepois=await chamarPerfilSupabase(usuario,'obterPerfil');
      verificar(JSON.stringify(realAntes)===JSON.stringify(realDepois),'Perfil real sofreu alteração.');
      positivos.push('Perfil real integralmente preservado.');
      const ordenadas=medidas.map(m=>m.ms).sort((a,b)=>a-b);
      const result={data:new Date().toISOString(),positivo:positivos,medidas:[...medidas], latencia:{amostras:medidas.length,media:Math.round(ordenadas.reduce((a,b)=>a+b,0)/ordenadas.length),mediana:ordenadas[Math.floor(ordenadas.length/2)],p95:ordenadas[Math.ceil(ordenadas.length*0.95)-1]},saldoTeste:{xp:p.pontuacaoTotal,tickets:p.tickets}};
      sessionStorage.setItem('cacamed-supabase-teste-relatorio',JSON.stringify(result)); setRelatorio(result); setDados(p); setStatus('Homologação completa, sem alterar o perfil real.');
    } catch(e) {setErro(e.message);setStatus('Teste interrompido; respostas confirmadas preservadas no ambiente isolado.');}
    finally {setOcupado(false);}
  };
  return <><aside style={{padding:16,background:'#ffb95f',color:'#0c1322'}}><h1>Homologação Supabase · API remota · dados isolados</h1><p role="status">{status}</p>{erro&&<p role="alert">{erro}</p>}<nav style={{display:'flex',gap:16,flexWrap:'wrap'}}>
    <button disabled={ocupado||!dados} onClick={executar}>Executar teste completo da API</button>
    <button disabled={ocupado||!dados} onClick={concorrencia}>Testar gravações simultâneas</button>
    <button disabled={ocupado||!relatorio} onClick={() => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'cacamed-homologacao.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }}>Baixar relatório de testes</button>
    <button disabled={ocupado||!dados} onClick={()=>trocar('quiz')}>Testar Quiz</button><button disabled={ocupado||!dados} onClick={()=>trocar('verdadeMentira')}>Testar Verdade ou mentira</button><button disabled={ocupado||!dados} onClick={()=>trocar('revisao')}>Testar Revisão</button>
    <button disabled={ocupado||!ultimoPedido} onClick={async()=>{try {setDados(await servicoPerfil(usuario,ultimoPedido.acao,ultimoPedido.dados));setStatus('Reenvio confirmado.');}catch(e){setErro(e.message);}}}>Reenviar último pedido</button>
    <a href="/">Voltar ao app real</a></nav>{relatorio&&<pre style={{whiteSpace:'pre-wrap',fontSize:13}}>{JSON.stringify(relatorio,null,2)}</pre>}</aside>
    {dados&&!ocupado&&(modo==='revisao'?<RevisaoInteligente usuario={usuario} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={()=>trocar('quiz')} servicoPerfil={servicoPerfil}/>:<TreinoMedico key={modo} modo={modo} usuario={usuario} dadosUsuario={dados} setDadosUsuario={setDados} setTelaAtual={()=>trocar('revisao')} servicoPerfil={servicoPerfil}/>)}</>;
}
createRoot(document.getElementById('root')).render(<HomologacaoSupabase/>);
