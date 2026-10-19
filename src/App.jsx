import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { sairDaConta } from './services/sairDaConta';
import { supabase } from './supabase';
import { usuarioSupabase } from './services/authSupabase';
import { marcarInterfacePronta } from './services/diagnosticoDesempenho';
import { buscarConteudoSupabase } from './services/perfilSupabase';
import './index.css';

import Login from './components/Login';
const Cadastro = lazy(() => import('./components/Cadastro'));
const RecuperarSenha = lazy(() => import('./components/RecuperarSenha'));
import MenuPrincipal from './components/MenuPrincipal';
const PerfilUsuario = lazy(() => import('./components/PerfilUsuario'));
const SelecaoTopicos = lazy(() => import('./components/SelecaoTopicos'));
const Jogo = lazy(() => import('./components/Jogo'));
const Ranking = lazy(() => import('./components/Ranking'));
const Estatisticas = lazy(() => import('./components/Estatisticas'));
const Cadastro2 = lazy(() => import('./components/Cadastro2'));
import { chamarPerfilPlanilha } from './services/perfilPlanilha';
import { fotoDoPerfil } from './utils/fotosCracha';
import { animar } from './utils/prototipo';
import { carregarRanking } from './services/rankingSessao';
import { BarraLateral } from './components/cascaUi';
import { Ecg } from './components/entradaUi';
import IndicadorConexao from './components/IndicadorConexao';
import { useConexao } from './services/conexao';
import { guardarPalavras, guardarPerfil, palavrasGuardadas, perfilGuardado } from './services/perfilOffline';
import './prototipo.css';

// Abertura do protótipo de movimento com as etapas reais: sessão, credencial e perfil com as missões do dia.
const ETAPAS_ABERTURA = ['Conectando ao prontuário', 'Validando credencial', 'Carregando missões do dia', 'Plantão liberado'];
function Abertura({ etapa }) {
  return <div className="cbt"><div className="cbt-scr plain" role="status" aria-live="polite">
    <div className="logo">caco<b>Med</b></div>
    <Ecg />
    <div className="boot-steps">{[0, 1, 2].map(i => <span key={i} className={i <= etapa ? 'on' : ''} />)}</div>
    <div className="boot-line"><motion.span key={etapa} style={{ display: 'inline-block' }} initial={animar() ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }}>{ETAPAS_ABERTURA[etapa]}</motion.span></div>
  </div></div>;
}
// Telas com a casca do protótipo: barra lateral na web (as de jogo ficam sem ela para não pular
// as confirmações de progresso não salvo) e barra de abas no celular, dentro de cada tela.
const TELAS_CASCA = ['menu', 'ranking', 'estatisticas', 'perfil', 'topicos'];
const espera = ms => new Promise(ok => setTimeout(ok, ms));

const PlantaoMedico = lazy(() => import('./components/PlantaoMedico'));
const ErroMedico = lazy(() => import('./components/ErroMedico'));
const CausaEfeito = lazy(() => import('./components/CausaEfeito'));
const TreinoMedico = lazy(() => import('./components/TreinoMedico'));
const RevisaoInteligente = lazy(() => import('./components/RevisaoInteligente'));
const BatalhaDiagnostica = lazy(() => import('./components/BatalhaDiagnostica'));

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [dadosUsuario, setDadosUsuario] = useState(null); 
  const [telaAtual, setTelaAtual] = useState('login'); 
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [erroPerfil, setErroPerfil] = useState('');
  const [tentativaPerfil, setTentativaPerfil] = useState(0);
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const [etapaAbertura, setEtapaAbertura] = useState(0);
  // Cadastro por e-mail em andamento: a sessão nova não troca de tela enquanto a animação do código roda.
  const cadastroEmAndamento = useRef(false);

  // Estados das Cruzadinhas
  const [bancoDePalavras, setBancoDePalavras] = useState(null);
  const [estadoBanco, setEstadoBanco] = useState('carregando');
  const [erroBanco, setErroBanco] = useState('');
  const [tentativaBanco, setTentativaBanco] = useState(0);
  const [materia, setMateria] = useState('');
  const [subMateria, setSubMateria] = useState('');

  useEffect(() => {
    if (!carregandoAuth) marcarInterfacePronta(telaAtual);
  }, [carregandoAuth, telaAtual]);


  useEffect(() => {
    let ativo = true;
    let versaoSessao = 0;
    let ultimaIdentidade;
    // Login só pelo Supabase desde 17/10/2026: o perfil vem da API; sem perfil, a conta segue para o Cadastro 2.0.
    const receberUsuario = async (user) => {
      const identidade = user ? user.authId : null;
      // INITIAL_SESSION e SIGNED_IN podem chegar para a mesma sessão no retorno
      // OAuth. Uma identidade já recebida não precisa recarregar o perfil.
      if (identidade === ultimaIdentidade) return;
      ultimaIdentidade = identidade;
      const versaoAtual = ++versaoSessao;
      const sessaoAtual = () => ativo && versaoAtual === versaoSessao;
      if (user && cadastroEmAndamento.current) { setUsuario(user); return; }
      setCarregandoAuth(true);
      setEtapaAbertura(user ? 1 : 0);
      if (!user) {
        setUsuario(null);
        setDadosUsuario(null);
        setTelaAtual('login');
        setCarregandoAuth(false);
        return;
      }
      setUsuario(user);
      try {
        setEtapaAbertura(2);
        const perfil = await chamarPerfilPlanilha(user, 'obterPerfil');
        if (!sessaoAtual()) return;
        if (perfil && animar()) { setEtapaAbertura(3); await espera(350); if (!sessaoAtual()) return; }
        setDadosUsuario(perfil);
        if (perfil) guardarPerfil(user.uid, perfil, { confirmado: true }).catch(() => {});
        setTelaAtual(perfil ? 'menu' : 'cadastro2');
        setErroPerfil('');
      } catch (erro) {
        if (!sessaoAtual()) return;
        // App offline: sem rede, abre com o último perfil guardado, se o último contato com o servidor tiver menos de 15 dias.
        if (!erro.status) {
          const guardado = await perfilGuardado(user.uid).catch(() => null);
          if (!sessaoAtual()) return;
          if (guardado?.perfil) { setDadosUsuario(guardado.perfil); setTelaAtual('menu'); setErroPerfil(''); return; }
          if (guardado?.vencida) { setErroPerfil('Faz mais de 15 dias do último acesso com internet. Conecte-se para entrar de novo; o que você jogou sem rede continua guardado.'); setTelaAtual('erroPerfil'); return; }
        }
        setErroPerfil(erro.message || 'Não foi possível carregar seu perfil.');
        setTelaAtual('erroPerfil');
      } finally {
        if (sessaoAtual()) setCarregandoAuth(false);
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === 'PASSWORD_RECOVERY') setRecuperandoSenha(true);
      // Não chama APIs Auth dentro do callback: o SDK ainda segura o lock da sessão.
      if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT'].includes(evento)) setTimeout(() => {
        if (ativo) void receberUsuario(session ? usuarioSupabase(session.user) : null);
      }, 0);
    });
    return () => { ativo = false; versaoSessao++; subscription.unsubscribe(); };
  }, [tentativaPerfil]);

  useEffect(() => {
    const controlador = new AbortController();
    const carregarBancoDaNuvem = async () => {
      setEstadoBanco('carregando');
      setErroBanco('');
      try {
        const bancoFormatado = (await buscarConteudoSupabase('palavras', { signal: controlador.signal })).resultado.banco;
        if (controlador.signal.aborted) return;
        setBancoDePalavras(bancoFormatado);
        setEstadoBanco(Object.keys(bancoFormatado).length ? 'pronto' : 'vazio');
        guardarPalavras(bancoFormatado);
      } catch (erro) {
        if (controlador.signal.aborted) return;
        // Sem rede: usa o banco de palavras da última consulta.
        const guardado = await palavrasGuardadas();
        if (guardado && !controlador.signal.aborted) { setBancoDePalavras(guardado); setEstadoBanco('pronto'); return; }
        console.error("Erro ao puxar a planilha:", erro);
        setErroBanco(erro.message || 'Não foi possível carregar o banco de palavras.');
        setEstadoBanco('erro');
      }
    };
    carregarBancoDaNuvem();
    return () => controlador.abort();
  }, [tentativaBanco]);

  const comCasca = Boolean(usuario && dadosUsuario && TELAS_CASCA.includes(telaAtual) && !carregandoAuth);
  // App offline: indicador de rede e envio da fila do aparelho; o perfil confirmado pelo servidor substitui o provisório.
  const uidAtual = usuario?.uid;
  const aoConfirmarFila = useCallback(perfil => { setDadosUsuario(perfil); guardarPerfil(uidAtual, perfil, { confirmado: true }).catch(() => {}); }, [uidAtual]);
  const conexao = useConexao(dadosUsuario ? usuario : null, aoConfirmarFila);
  // App offline: com o perfil carregado, baixa em segundo plano as telas que funcionam sem rede, para o service worker
  // guardá-las (ele só guarda arquivos que já passaram por ele).
  const temPerfil = Boolean(dadosUsuario);
  useEffect(() => {
    if (!temPerfil) return undefined;
    const pre = () => { import('./components/SelecaoTopicos'); import('./components/Jogo'); import('./components/TreinoMedico'); };
    const id = window.requestIdleCallback ? window.requestIdleCallback(pre, { timeout: 5000 }) : setTimeout(pre, 3000);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, [temPerfil]);
  // O perfil em tela (inclusive com XP provisório) fica guardado para o app abrir sem rede.
  useEffect(() => { if (uidAtual && dadosUsuario) guardarPerfil(uidAtual, dadosUsuario).catch(() => {}); }, [uidAtual, dadosUsuario]);
  useEffect(() => {
    document.body.classList.toggle('com-casca', comCasca);
    return () => document.body.classList.remove('com-casca');
  }, [comCasca]);

  const iniciarJogo = (materiaEscolhida, subMateriaEscolhida) => {
    setMateria(materiaEscolhida);
    setSubMateria(subMateriaEscolhida);
    setTelaAtual('jogo');
  };


  if (recuperandoSenha) return <Suspense fallback={<div className="stitch-page stitch-loading">Carregando...</div>}><RecuperarSenha /></Suspense>;
  if (carregandoAuth) return <Abertura etapa={etapaAbertura} />;

  return (
    <Suspense fallback={<div className="stitch-page stitch-loading" role="status">Carregando...</div>}>
      {telaAtual === 'login' && <Login setTelaAtual={setTelaAtual} />}
      {usuario && dadosUsuario && <IndicadorConexao conexao={conexao} />}
      {comCasca && <BarraLateral tela={telaAtual} ir={setTelaAtual} p={dadosUsuario} foto={fotoDoPerfil(dadosUsuario)} aoPassarRanking={() => { carregarRanking().catch(() => {}); }} />}
      {/* Conta confirmada pelo código: recarrega a sessão, e o App abre o Cadastro 2.0 (ou o menu, se já houver perfil). */}
      {telaAtual === 'cadastro' && <Cadastro setTelaAtual={setTelaAtual} aoCriarConta={ativo => { cadastroEmAndamento.current = ativo; }}
        onContaConfirmada={() => { cadastroEmAndamento.current = false; setTentativaPerfil(valor => valor + 1); }} />}
      {telaAtual === 'cadastro2' && usuario && <Cadastro2 usuario={usuario} onConcluido={perfil => { setDadosUsuario(perfil); setTelaAtual('menu'); }} />}
      {telaAtual === 'erroPerfil' && <main className="stitch-page stitch-loading flex-col p-6 text-center"><p role="alert">{erroPerfil}</p><div className="flex gap-3"><button className="stitch-primary" onClick={() => setTentativaPerfil(valor => valor + 1)}>Tentar novamente</button><button className="stitch-back" onClick={sairDaConta}>Voltar ao login</button></div></main>}
      {telaAtual === 'menu' && usuario && <MenuPrincipal dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} usuario={usuario} setDadosUsuario={setDadosUsuario} />}
      {telaAtual === 'perfil' && usuario && <PerfilUsuario usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {/* CRUZADINHAS */}
      {telaAtual === 'topicos' && usuario && <SelecaoTopicos setTelaAtual={setTelaAtual} iniciarJogo={iniciarJogo} dadosUsuario={dadosUsuario} bancoDePalavras={bancoDePalavras || {}} estadoBanco={estadoBanco} erroBanco={erroBanco} recarregarBanco={() => setTentativaBanco(valor => valor + 1)} usuario={usuario} setDadosUsuario={setDadosUsuario} />}
      {telaAtual === 'jogo' && usuario && (
        <Jogo bancoDePalavras={bancoDePalavras} materia={materia} subMateria={subMateria} setTelaAtual={setTelaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />
      )}
      
      {['quiz', 'verdadeMentira'].includes(telaAtual) && usuario && <TreinoMedico key={telaAtual} modo={telaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'revisaoInteligente' && usuario && <RevisaoInteligente usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {/* PAINÉIS DE DADOS */}
      {telaAtual === 'ranking' && usuario && <Ranking usuario={usuario} dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'estatisticas' && usuario && <Estatisticas usuario={usuario} dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {telaAtual === 'selecaoDDX' && usuario && <PlantaoMedico usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'erroMedico' && usuario && <ErroMedico usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'causaEfeito' && usuario && <CausaEfeito usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'batalha' && usuario && <BatalhaDiagnostica usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}

    </Suspense>
  );
}

export default App;
