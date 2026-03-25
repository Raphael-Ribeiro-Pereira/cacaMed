import { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import './index.css';

import Login from './components/Login';
import Cadastro from './components/Cadastro'; // <-- AQUI ESTÁ O NOVO IMPORT
import MenuPrincipal from './components/MenuPrincipal';
import PerfilUsuario from './components/PerfilUsuario';
import SelecaoTopicos from './components/SelecaoTopicos';
import Jogo from './components/Jogo';
import Ranking from './components/Ranking';
import Estatisticas from './components/Estatisticas';

// TELAS NOVAS IMPORTADAS AQUI:
import SelecaoFlashcards from './components/SelecaoFlashcards';
import FlashCards from './components/FlashCards'; 

// 🔥 IMPORTANDO A NOVA TELA DO HOUSE
import SelecaoDDX from './components/SelecaoDDX'; 
import JogoDDX from './components/JogoDDX';

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [dadosUsuario, setDadosUsuario] = useState(null); 
  const [telaAtual, setTelaAtual] = useState('login'); 
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  // Estados das Cruzadinhas
  const [bancoDePalavras, setBancoDePalavras] = useState(null);
  const [materia, setMateria] = useState('');
  const [subMateria, setSubMateria] = useState('');

  // ESTADOS DO BARALHO DE FLASHCARDS
  const [baralhoAtivo, setBaralhoAtivo] = useState(null);
  const [areaFlashcard, setAreaFlashcard] = useState(''); 
  const [dificuldadeFlashcard, setDificuldadeFlashcard] = useState('medio');

  // 🔥 ESTADO DO MODO DDX (Para guardar a equipe e dificuldade)
  const [configDDX, setConfigDDX] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setDadosUsuario(docSnap.data());
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

  const iniciarFlashcards = (deck, areaNome, dificuldadeDesejada) => {
    setBaralhoAtivo(deck);
    setAreaFlashcard(areaNome);
    setDificuldadeFlashcard(dificuldadeDesejada);
    setTelaAtual('flashcards');
  };

  const iniciarDDX = (configuracoes) => {
    setConfigDDX(configuracoes);
    setTelaAtual('jogoDDX');
  };

  if (carregandoAuth || (!bancoDePalavras && telaAtual !== 'login' && telaAtual !== 'cadastro')) {
    return <div className="tela-container"><h2 style={{color: '#2c3e50'}}>Acessando Prontuários... 🩺</h2></div>;
  }

  return (
    <>
      {telaAtual === 'login' && <Login setTelaAtual={setTelaAtual} />}
      {telaAtual === 'cadastro' && <Cadastro setTelaAtual={setTelaAtual} />}
      {telaAtual === 'menu' && usuario && <MenuPrincipal dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'perfil' && usuario && <PerfilUsuario usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {/* CRUZADINHAS */}
      {telaAtual === 'topicos' && usuario && <SelecaoTopicos setTelaAtual={setTelaAtual} iniciarJogo={iniciarJogo} dadosUsuario={dadosUsuario} />}
      {telaAtual === 'jogo' && usuario && (
        <Jogo bancoDePalavras={bancoDePalavras} materia={materia} subMateria={subMateria} setTelaAtual={setTelaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />
      )}
      
      {/* PAINÉIS DE DADOS */}
      {telaAtual === 'ranking' && usuario && <Ranking dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      {telaAtual === 'estatisticas' && usuario && <Estatisticas dadosUsuario={dadosUsuario} setTelaAtual={setTelaAtual} />}
      
      {/* 🔥 MODO HOUSE (DDX) */}
      {telaAtual === 'selecaoDDX' && usuario && <SelecaoDDX setTelaAtual={setTelaAtual} iniciarDDX={iniciarDDX} />}
      {telaAtual === 'jogoDDX' && usuario && <JogoDDX setTelaAtual={setTelaAtual} configDDX={configDDX} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />}

      {/* FLASHCARDS */}
      {telaAtual === 'selecaoFlashcards' && usuario && <SelecaoFlashcards setTelaAtual={setTelaAtual} iniciarFlashcards={iniciarFlashcards} />}
      {telaAtual === 'flashcards' && usuario && <FlashCards baralho={baralhoAtivo} area={areaFlashcard} dificuldade={dificuldadeFlashcard} setTelaAtual={setTelaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />}
    </>
  );
}

export default App;