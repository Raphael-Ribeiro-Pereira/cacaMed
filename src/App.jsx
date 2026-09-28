import { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { prepararMissoesDoDia } from './utils/missoes';
import { Stethoscope } from 'lucide-react';
import { limparEstatisticasClinicasAntigas, possuiEstatisticasClinicasAntigas } from './utils/estatisticasClinicas';
import './index.css';

import Login from './components/Login';
import Cadastro from './components/Cadastro';
import MenuPrincipal from './components/MenuPrincipal';
import PerfilUsuario from './components/PerfilUsuario';
import SelecaoTopicos from './components/SelecaoTopicos';
import Jogo from './components/Jogo';
import Ranking from './components/Ranking';
import { sincronizarRanking } from './services/rankingPublico';
import Estatisticas from './components/Estatisticas';
import Cadastro2 from './components/Cadastro2';
import VincularGoogle from './components/VincularGoogle';
import { chamarPerfilPlanilha } from './services/perfilPlanilha';
import { importarBancoCSV } from './utils/importarBancoCSV';

const PERFIL_NA_PLANILHA = import.meta.env.VITE_FONTE_DADOS === 'planilha';

import PlantaoMedico from './components/PlantaoMedico';
import ErroMedico from './components/ErroMedico';
import CausaEfeito from './components/CausaEfeito';
import TreinoMedico from './components/TreinoMedico';

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [dadosUsuario, setDadosUsuario] = useState(null); 
  const [telaAtual, setTelaAtual] = useState('login'); 
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [erroPerfil, setErroPerfil] = useState('');
  const [tentativaPerfil, setTentativaPerfil] = useState(0);

  // Estados das Cruzadinhas
  const [bancoDePalavras, setBancoDePalavras] = useState(null);
  const [estadoBanco, setEstadoBanco] = useState('carregando');
  const [erroBanco, setErroBanco] = useState('');
  const [tentativaBanco, setTentativaBanco] = useState(0);
  const [materia, setMateria] = useState('');
  const [subMateria, setSubMateria] = useState('');


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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const versaoAtual = ++versaoSessao;
      const sessaoAtual = () => ativo && versaoAtual === versaoSessao;
      setCarregandoAuth(true);
      if (user) {
        setUsuario(user);
        if (PERFIL_NA_PLANILHA) {
          try {
            const perfil = await chamarPerfilPlanilha(user, 'obterPerfil');
            if (!sessaoAtual()) return;
            setDadosUsuario(perfil);
            if (perfil) setTelaAtual('menu');
            else {
              const token = await getIdTokenResult(user);
              if (!sessaoAtual()) return;
              const veioDoGoogle = token.signInProvider === 'google.com';
              const temSenhaAntiga = user.providerData.some(provedor => provedor.providerId === 'password');
              setTelaAtual(veioDoGoogle && temSenhaAntiga ? 'vincularGoogle' : 'cadastro2');
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
    });
    return () => { ativo = false; versaoSessao++; unsubscribe(); };
  }, [tentativaPerfil]);

  useEffect(() => {
    const controlador = new AbortController();
    const carregarBancoDaNuvem = async () => {
      setEstadoBanco('carregando');
      setErroBanco('');
      try {
        const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQzuC7MJYVdSo2Ufi_OQnREAFSDrYi2SY5_KGJvrKv_7lSXGVbiieXop7OA0keLmZV5tuQgGdkSIT8/pub?output=csv";
        const resposta = await fetch(urlCSV + "&tempo=" + new Date().getTime(), { signal: controlador.signal });
        if (!resposta.ok) throw new Error(`Banco de palavras indisponível (HTTP ${resposta.status}).`);
        const textoNuvem = await resposta.text();
        const bancoFormatado = importarBancoCSV(textoNuvem);
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


  if (carregandoAuth) {
    return <div className="stitch-page stitch-loading"><Stethoscope aria-hidden="true" /><span>Acessando prontuários...</span></div>;
  }

  return (
    <>
      {telaAtual === 'login' && <Login setTelaAtual={setTelaAtual} />}
      {telaAtual === 'cadastro' && <Cadastro setTelaAtual={setTelaAtual} onConcluido={perfil => { setDadosUsuario(perfil); setTelaAtual('menu'); }} />}
      {telaAtual === 'vincularGoogle' && usuario && <VincularGoogle usuario={usuario} onConfirmado={() => setTelaAtual('cadastro2')} />}
      {telaAtual === 'cadastro2' && usuario && <Cadastro2 usuario={usuario} onConcluido={perfil => { setDadosUsuario(perfil); setTelaAtual('menu'); }} />}
      {telaAtual === 'erroPerfil' && <main className="stitch-page stitch-loading flex-col p-6 text-center"><p role="alert">{erroPerfil}</p><div className="flex gap-3"><button className="stitch-primary" onClick={() => setTentativaPerfil(valor => valor + 1)}>Tentar novamente</button><button className="stitch-back" onClick={() => signOut(auth)}>Voltar ao login</button></div></main>}
      {telaAtual === 'menu' && usuario && <MenuPrincipal dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} usuario={usuario} setDadosUsuario={setDadosUsuario} />}
      {telaAtual === 'perfil' && usuario && <PerfilUsuario usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {/* CRUZADINHAS */}
      {telaAtual === 'topicos' && usuario && <SelecaoTopicos setTelaAtual={setTelaAtual} iniciarJogo={iniciarJogo} dadosUsuario={dadosUsuario} bancoDePalavras={bancoDePalavras || {}} estadoBanco={estadoBanco} erroBanco={erroBanco} recarregarBanco={() => setTentativaBanco(valor => valor + 1)} usuario={usuario} setDadosUsuario={setDadosUsuario} />}
      {telaAtual === 'jogo' && usuario && (
        <Jogo bancoDePalavras={bancoDePalavras} materia={materia} subMateria={subMateria} setTelaAtual={setTelaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />
      )}
      
      {['quiz', 'verdadeMentira'].includes(telaAtual) && usuario && <TreinoMedico key={telaAtual} modo={telaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {/* PAINÉIS DE DADOS */}
      {telaAtual === 'ranking' && usuario && <Ranking usuario={usuario} dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'estatisticas' && usuario && <Estatisticas dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {telaAtual === 'selecaoDDX' && usuario && <PlantaoMedico usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'erroMedico' && usuario && <ErroMedico usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'causaEfeito' && usuario && <CausaEfeito usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}

    </>
  );
}

export default App;
