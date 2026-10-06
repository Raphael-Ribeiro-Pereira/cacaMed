import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from './firebase'; 
import { getIdTokenResult, onAuthStateChanged } from 'firebase/auth';
import { sairDaConta } from './services/sairDaConta';
import { USAR_SUPABASE, USAR_AUTH_SUPABASE, supabase } from './supabase';
import { usuarioSupabase } from './services/authSupabase';
import { marcarInterfacePronta } from './services/diagnosticoDesempenho';
import { buscarConteudoSupabase, migrarSessaoFirebase } from './services/perfilSupabase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { prepararMissoesDoDia } from './utils/missoes';
import { limparEstatisticasClinicasAntigas, possuiEstatisticasClinicasAntigas } from './utils/estatisticasClinicas';
import './index.css';

import Login from './components/Login';
const Cadastro = lazy(() => import('./components/Cadastro'));
const RecuperarSenha = lazy(() => import('./components/RecuperarSenha'));
import MenuPrincipal from './components/MenuPrincipal';
const PerfilUsuario = lazy(() => import('./components/PerfilUsuario'));
const SelecaoTopicos = lazy(() => import('./components/SelecaoTopicos'));
const Jogo = lazy(() => import('./components/Jogo'));
const Ranking = lazy(() => import('./components/Ranking'));
import { sincronizarRanking } from './services/rankingPublico';
const Estatisticas = lazy(() => import('./components/Estatisticas'));
const Cadastro2 = lazy(() => import('./components/Cadastro2'));
const VincularGoogle = lazy(() => import('./components/VincularGoogle'));
import { chamarPerfilPlanilha } from './services/perfilPlanilha';
import { importarBancoCSV } from './utils/importarBancoCSV';
import { fotoDoPerfil } from './utils/fotosCracha';
import { animar } from './utils/prototipo';
import { carregarRanking } from './services/rankingSessao';
import { BarraLateral } from './components/cascaUi';
import { Ecg } from './components/entradaUi';
import './prototipo.css';

const PERFIL_NA_PLANILHA = ['planilha', 'supabase'].includes(import.meta.env.VITE_FONTE_DADOS);

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
  // Cadastro por e-mail em andamento: a sessão nova não troca de tela enquanto o crachá é impresso.
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


  const verificarEResetarMissoes = async (uid, dadosAtuais) => {
    if (!prepararMissoesDoDia(dadosAtuais) && !possuiEstatisticasClinicasAntigas(dadosAtuais.estatisticas)) return dadosAtuais;
    try {
      return await runTransaction(db, async transaction => {
        const ref = doc(db, 'usuarios', uid);
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) return dadosAtuais;
        const dados = snapshot.data();
        const preparo = prepararMissoesDoDia(dados);
        const alteracoes = {};
        if (preparo) Object.assign(alteracoes, {
          dataUltimoLogin: preparo.dataUltimoLogin,
          missoesDiarias: preparo.missoesDiarias,
          pontuacaoTotal: (Number(dados.pontuacaoTotal) || 0) + preparo.xpLogin
        });
        if (possuiEstatisticasClinicasAntigas(dados.estatisticas)) {
          alteracoes.estatisticas = limparEstatisticasClinicasAntigas(dados.estatisticas);
        }
        if (!Object.keys(alteracoes).length) return dados;
        const atualizado = { ...dados, ...alteracoes };
        transaction.update(ref, alteracoes);
        return atualizado;
      });
    } catch (error) {
      console.error('Falha ao atualizar missões diárias:', error);
      return dadosAtuais;
    }
  };

  useEffect(() => {
    let ativo = true;
    let versaoSessao = 0;
    let ultimaIdentidade;
    const receberUsuario = async (user) => {
      const identidade = user ? `${user.source || 'firebase'}:${user.authId || user.uid}` : null;
      // INITIAL_SESSION e SIGNED_IN podem chegar para a mesma sessão no retorno
      // OAuth. Uma identidade já recebida não precisa recarregar o perfil.
      if (identidade === ultimaIdentidade) return;
      ultimaIdentidade = identidade;
      const versaoAtual = ++versaoSessao;
      const sessaoAtual = () => ativo && versaoAtual === versaoSessao;
      if (user && cadastroEmAndamento.current) { setUsuario(user); return; }
      setCarregandoAuth(true);
      setEtapaAbertura(user ? 1 : 0);
      if (user) {
        setUsuario(user);
        if (PERFIL_NA_PLANILHA) {
          try {
            setEtapaAbertura(2);
            const perfil = await chamarPerfilPlanilha(user, 'obterPerfil');
            if (USAR_SUPABASE && perfil && user.source !== 'supabase') {
              await migrarSessaoFirebase(user);
            }
            if (!sessaoAtual()) return;
            if (perfil && animar()) { setEtapaAbertura(3); await espera(350); if (!sessaoAtual()) return; }
            setDadosUsuario(perfil);
            if (perfil) setTelaAtual('menu');
            else {
              const token = user.source === 'supabase' ? { signInProvider: user.providerData.some(p => p.providerId === 'google.com') ? 'google.com' : 'password' } : await getIdTokenResult(user);
              if (!sessaoAtual()) return;
              const veioDoGoogle = token.signInProvider === 'google.com';
              const temSenhaAntiga = user.providerData.some(provedor => provedor.providerId === 'password');
              setTelaAtual(user.source !== 'supabase' && veioDoGoogle && temSenhaAntiga ? 'vincularGoogle' : 'cadastro2');
            }
            setErroPerfil('');
          } catch (erro) {
            if (!sessaoAtual()) return;
            setErroPerfil(erro.message || 'Não foi possível carregar seu perfil.');
            setTelaAtual('erroPerfil');
          } finally {
            if (sessaoAtual()) setCarregandoAuth(false);
          }
          return;
        }
        try {
          const docSnap = await getDoc(doc(db, 'usuarios', user.uid));
          if (!sessaoAtual()) return;
          if (!docSnap.exists()) throw new Error('Perfil antigo não encontrado. Entre novamente ou conclua o cadastro.');
          const dados = await verificarEResetarMissoes(user.uid, docSnap.data());
          if (!sessaoAtual()) return;
          setDadosUsuario(dados);
          setTelaAtual('menu');
          setErroPerfil('');
        } catch (erro) {
          if (!sessaoAtual()) return;
          setErroPerfil(erro.message || 'Não foi possível carregar seu perfil.');
          setTelaAtual('erroPerfil');
        } finally {
          if (sessaoAtual()) setCarregandoAuth(false);
        }
      } else {
        setUsuario(null);
        setDadosUsuario(null);
        setTelaAtual('login');
        setCarregandoAuth(false);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (USAR_AUTH_SUPABASE) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return;
      }
      if (ativo) void receberUsuario(user);
    });
    const subscription = USAR_AUTH_SUPABASE ? supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === 'PASSWORD_RECOVERY') setRecuperandoSenha(true);
      // Não chama APIs Auth dentro do callback: o SDK ainda segura o lock da sessão.
      if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT'].includes(evento)) setTimeout(() => {
        if (ativo) void receberUsuario(session ? usuarioSupabase(session.user) : evento === 'SIGNED_OUT' ? null : auth.currentUser);
      }, 0);
    }).data.subscription : null;
    return () => { ativo = false; versaoSessao++; unsubscribe(); subscription?.unsubscribe(); };
  }, [tentativaPerfil]);

  useEffect(() => {
    const controlador = new AbortController();
    const carregarBancoDaNuvem = async () => {
      setEstadoBanco('carregando');
      setErroBanco('');
      try {
        const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQzuC7MJYVdSo2Ufi_OQnREAFSDrYi2SY5_KGJvrKv_7lSXGVbiieXop7OA0keLmZV5tuQgGdkSIT8/pub?output=csv";
        let bancoFormatado;
        if (USAR_SUPABASE) bancoFormatado = (await buscarConteudoSupabase('palavras', { signal: controlador.signal })).resultado.banco;
        else {
          const resposta = await fetch(urlCSV + "&tempo=" + new Date().getTime(), { signal: controlador.signal });
          if (!resposta.ok) throw new Error(`Banco de palavras indisponível (HTTP ${resposta.status}).`);
          bancoFormatado = importarBancoCSV(await resposta.text());
        }
        if (controlador.signal.aborted) return;
        setBancoDePalavras(bancoFormatado);
        setEstadoBanco(Object.keys(bancoFormatado).length ? 'pronto' : 'vazio');
      } catch (erro) {
        if (controlador.signal.aborted) return;
        console.error("Erro ao puxar a planilha:", erro);
        setErroBanco(erro.message || 'Não foi possível carregar o banco de palavras.');
        setEstadoBanco('erro');
      }
    };
    carregarBancoDaNuvem();
    return () => controlador.abort();
  }, [tentativaBanco]);

  const comCasca = Boolean(usuario && dadosUsuario && TELAS_CASCA.includes(telaAtual) && !carregandoAuth);
  useEffect(() => {
    document.body.classList.toggle('com-casca', comCasca);
    return () => document.body.classList.remove('com-casca');
  }, [comCasca]);

  useEffect(() => {
    if (PERFIL_NA_PLANILHA || !usuario || !dadosUsuario) return;
    sincronizarRanking(usuario, dadosUsuario).catch(() => {
      console.warn('Ranking pendente de sincronização.');
    });
  }, [usuario, dadosUsuario]);

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
      {comCasca && <BarraLateral tela={telaAtual} ir={setTelaAtual} p={dadosUsuario} foto={fotoDoPerfil(dadosUsuario)} aoPassarRanking={() => { carregarRanking().catch(() => {}); }} />}
      {telaAtual === 'cadastro' && <Cadastro setTelaAtual={setTelaAtual} aoCriarConta={ativo => { cadastroEmAndamento.current = ativo; }}
        onConcluido={perfil => { cadastroEmAndamento.current = false; setDadosUsuario(perfil); setTelaAtual('menu'); }} />}
      {telaAtual === 'vincularGoogle' && usuario && <VincularGoogle usuario={usuario} onConfirmado={() => setTelaAtual('cadastro2')} />}
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
