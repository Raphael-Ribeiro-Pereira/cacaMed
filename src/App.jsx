import { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import './index.css';

import Login from './components/Login';
import MenuPrincipal from './components/MenuPrincipal';
import PerfilUsuario from './components/PerfilUsuario';
import SelecaoTopicos from './components/SelecaoTopicos';
import Jogo from './components/Jogo';
import Ranking from './components/Ranking';
import Estatisticas from './components/Estatisticas';

// 🔥 AS DUAS TELAS NOVAS IMPORTADAS AQUI:
import SelecaoFlashcards from './components/SelecaoFlashcards';
import FlashCards from './components/FlashCards'; 

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [dadosUsuario, setDadosUsuario] = useState(null); 
  const [telaAtual, setTelaAtual] = useState('login'); 
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  // Estados das Cruzadinhas
  const [bancoDePalavras, setBancoDePalavras] = useState(null);
  const [materia, setMateria] = useState('');
  const [subMateria, setSubMateria] = useState('');

  // 🔥 ESTADOS DO BARALHO DE FLASHCARDS
  const [baralhoAtivo, setBaralhoAtivo] = useState(null);
  const [areaFlashcard, setAreaFlashcard] = useState(''); 
  const [dificuldadeFlashcard, setDificuldadeFlashcard] = useState('medio');

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
          const colunas = linhas[i].split(',');
          
          if (colunas[0] && colunas[0].trim() !== '' && colunas[1] && colunas[1].trim() !== '') {
            const palavraSegura = colunas[0]
              .trim()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
              .replace(/-/g, " ") 
              .replace(/\s+/g, " ") 
              .toUpperCase();
            
            const materiaBruta = colunas[1].trim();
            const subMateriaBruta = colunas[2] && colunas[2].trim() !== '' ? colunas[2].trim() : 'Geral';

            const materiaBlindada = materiaBruta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            const subMateriaBlindada = subMateriaBruta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

            const chaveBanco = `${materiaBlindada}-${subMateriaBlindada}`;

            if (!bancoFormatado[chaveBanco]) bancoFormatado[chaveBanco] = [];
            
            bancoFormatado[chaveBanco].push({ 
              palavra: palavraSegura, 
              numero: contadorPalavras,
              palavraComEspaco: colunas[0].trim() 
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

  // 🔥 FUNÇÃO QUE INICIA O FLASHCARD ATUALIZADA
  const iniciarFlashcards = (deck, areaNome, dificuldadeDesejada) => {
    setBaralhoAtivo(deck);
    setAreaFlashcard(areaNome);
    setDificuldadeFlashcard(dificuldadeDesejada);
    setTelaAtual('flashcards');
  };

  if (carregandoAuth || (!bancoDePalavras && telaAtual !== 'login')) {
    return <div className="tela-container"><h2 style={{color: '#2c3e50'}}>Acessando Prontuários... 🩺</h2></div>;
  }

  return (
    <>
      {telaAtual === 'login' && <Login />}
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
      
      {/* 🔥 AS TELAS DOS FLASHCARDS COM TODOS OS PARÂMETROS: */}
      {telaAtual === 'selecaoFlashcards' && usuario && <SelecaoFlashcards setTelaAtual={setTelaAtual} iniciarFlashcards={iniciarFlashcards} />}
      {telaAtual === 'flashcards' && usuario && <FlashCards baralho={baralhoAtivo} area={areaFlashcard} dificuldade={dificuldadeFlashcard} setTelaAtual={setTelaAtual} usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} />}
    </>
  );
}

export default App;