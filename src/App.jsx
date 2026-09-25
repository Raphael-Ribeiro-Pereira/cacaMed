import { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
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
import Estatisticas from './components/Estatisticas';

// 🔥 TELAS DO SIMULADOR CLÍNICO
import SelecaoDDX from './components/SelecaoDDX'; 
import JogoDDX from './components/JogoDDX';
import Hardcore from './components/Hardcore'; // ⬅️ AQUI! Faltava importar o ficheiro Hardcore.jsx!

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [dadosUsuario, setDadosUsuario] = useState(null); 
  const [telaAtual, setTelaAtual] = useState('login'); 
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  // Estados das Cruzadinhas
  const [bancoDePalavras, setBancoDePalavras] = useState(null);
  const [materia, setMateria] = useState('');
  const [subMateria, setSubMateria] = useState('');

  // 🔥 ESTADO DO MODO DDX (Para guardar a equipe e dificuldade)
  const [configDDX, setConfigDDX] = useState(null);

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          let dados = docSnap.data();
          dados = await verificarEResetarMissoes(user.uid, dados);
          setDadosUsuario(dados);
        }
        setTelaAtual('menu'); 
      } else {
        setUsuario(null);
        setDadosUsuario(null);
        setTelaAtual('login');
      }
      setCarregandoAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const carregarBancoDaNuvem = async () => {
      try {
        const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQzuC7MJYVdSo2Ufi_OQnREAFSDrYi2SY5_KGJvrKv_7lSXGVbiieXop7OA0keLmZV5tuQgGdkSIT8/pub?output=csv";
        const resposta = await fetch(urlCSV + "&tempo=" + new Date().getTime());
        const textoNuvem = await resposta.text();
        const linhas = textoNuvem.replace(/\r/g, '').split('\n');
        
        const bancoFormatado = {};
        let contadorPalavras = 1;

        for (let i = 1; i < linhas.length; i++) {
          const colunas = linhas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          
          if (colunas[0] && colunas[0].trim() !== '' && colunas[1] && colunas[1].trim() !== '') {
            const palavraSegura = colunas[0].trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, " ").replace(/\s+/g, " ").toUpperCase();
            const materiaBruta = colunas[1].trim();
            const subMateriaBruta = colunas[2] && colunas[2].trim() !== '' ? colunas[2].trim() : 'Geral';

            const dificuldadeStr = colunas[3] ? colunas[3].replace(/"/g, '').trim() : '0';
            const dificuldade = isNaN(parseInt(dificuldadeStr)) ? 0 : parseInt(dificuldadeStr);
            const dicaBasica = colunas[4] ? colunas[4].replace(/"/g, '').trim() : '';

            const materiaBlindada = materiaBruta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            const subMateriaBlindada = subMateriaBruta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

            const chaveBanco = `${materiaBlindada}-${subMateriaBlindada}`;

            if (!bancoFormatado[chaveBanco]) bancoFormatado[chaveBanco] = [];
            
            bancoFormatado[chaveBanco].push({ 
              palavra: palavraSegura, 
              numero: contadorPalavras,
              palavraComEspaco: colunas[0].replace(/"/g, '').trim(),
              dificuldade: dificuldade, 
              dicaBasica: dicaBasica    
            });
            contadorPalavras++;
          }
        }
        setBancoDePalavras(bancoFormatado);
      } catch (erro) {
        console.error("Erro ao puxar a planilha:", erro);
      }
    };
    carregarBancoDaNuvem();
  }, []);

  const iniciarJogo = (materiaEscolhida, subMateriaEscolhida) => {
    setMateria(materiaEscolhida);
    setSubMateria(subMateriaEscolhida);
    setTelaAtual('jogo');
  };

  const iniciarDDX = (configuracoes) => {
    setConfigDDX(configuracoes);
    setTelaAtual('jogoDDX');
  };

  if (carregandoAuth) {
    return <div className="stitch-page stitch-loading"><Stethoscope aria-hidden="true" /><span>Acessando prontuários...</span></div>;
  }

  return (
    <>
      {telaAtual === 'login' && <Login setTelaAtual={setTelaAtual} />}
      {telaAtual === 'cadastro' && <Cadastro setTelaAtual={setTelaAtual} />}
      {telaAtual === 'menu' && usuario && <MenuPrincipal dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'perfil' && usuario && <PerfilUsuario usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {/* CRUZADINHAS */}
      {telaAtual === 'topicos' && usuario && <SelecaoTopicos setTelaAtual={setTelaAtual} iniciarJogo={iniciarJogo} dadosUsuario={dadosUsuario} bancoDePalavras={bancoDePalavras || {}} />}
      {telaAtual === 'jogo' && usuario && (
        <Jogo bancoDePalavras={bancoDePalavras} materia={materia} subMateria={subMateria} setTelaAtual={setTelaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />
      )}
      
      {/* PAINÉIS DE DADOS */}
      {telaAtual === 'ranking' && usuario && <Ranking usuario={usuario} dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'estatisticas' && usuario && <Estatisticas dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {/* 🔥 MODO HOUSE (DDX) E MODO HARDCORE */}
      {telaAtual === 'selecaoDDX' && usuario && <SelecaoDDX setTelaAtual={setTelaAtual} iniciarDDX={iniciarDDX} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />}
      {telaAtual === 'jogoDDX' && usuario && <JogoDDX setTelaAtual={setTelaAtual} configDDX={configDDX} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />}
      
      {/* ⬅️ AQUI! O React agora sabe que tem de desenhar a sala de emergência! */}
      {telaAtual === 'hardcore' && usuario && <Hardcore setTelaAtual={setTelaAtual} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />}

    </>
  );
}

export default App;
