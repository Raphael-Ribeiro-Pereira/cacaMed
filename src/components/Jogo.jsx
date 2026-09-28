import { useState, useEffect, useMemo, useRef } from 'react'; 
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { gerarTabuleiro } from '../utils/motorTabuleiro'; 
import Tabuleiro from './Tabuleiro';
import { chamarOpenRouter } from '../services/openrouter';
import { registrarCruzadinha } from '../services/registrarCruzadinha';
import { dataLocalHoje } from '../utils/missoes';
import { celulasPreenchidasAteProximaVazia, escolherDirecaoDaEntrada, proximaCelulaDaEntrada, resolverLetraRepetida } from '../utils/navegacaoCruzadinha';
import { aplicarProgressoMissoes, lerMissoes } from '../utils/missoes';
import { nivelPorXP } from '../utils/economia';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import AdminSpeedDial from './AdminSpeedDial';

import { Clock, LogOut, Stethoscope, Trophy, Ticket, Star, Lock, ChevronDown, User, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const aplicarCensura = (textoDica, palavraSecreta) => {
  if (!textoDica || !palavraSecreta) return textoDica;
  const palavraLimpa = palavraSecreta.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const radical = palavraLimpa.length > 4 ? palavraLimpa.substring(0, palavraLimpa.length - 2) : palavraLimpa;

  return textoDica.split(' ').map(palavra => {
    const pLimpa = palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
    if (pLimpa.includes(radical) && pLimpa.length >= radical.length) return '***';
    return palavra;
  }).join(' ');
};

const passosTutorial = [
  { titulo: 'Escolha uma palavra', texto: 'Clique em uma casa numerada para selecionar uma palavra. Em uma interseção, o jogo prioriza a palavra com mais casas vazias; Enter ou Espaço alterna a direção.' },
  { titulo: 'Preencha a grade', texto: 'Digite uma letra por casa. O cursor pula letras já preenchidas e aceita a letra repetida de uma interseção sem duplicá-la; Backspace volta para a casa anterior.' },
  { titulo: 'Entenda o feedback', texto: 'A casa mostra feedback enquanto você digita. Uma palavra só é validada quando todas as suas casas estiverem preenchidas. Complete todas as palavras para terminar o plantão.' },
  { titulo: 'Use as dicas', texto: 'O laudo fica no prontuário. A partir do nível 3, você pode abrir dicas adicionais: a do residente custa 5 XP e a do paciente, mais 10 XP.' },
  { titulo: 'Receba suas recompensas', texto: 'Letras e palavras formam o XP base. Nível e tempo podem multiplicá-lo; dicas reduzem o resultado, com mínimo de 10 XP por partida. Missões podem dar XP extra, e cada cruzadinha concluída concede 2 tickets, além das recompensas de missão e nível global. O relatório final mostra cada parcela.' },
  { titulo: 'Antes de sair', texto: 'Se abandonar o plantão antes de completá-lo, as letras e o progresso desta partida serão perdidos. O botão de saída pedirá confirmação.' }
];

export default function Jogo({ bancoDePalavras, materia, subMateria, setTelaAtual, usuario, dadosUsuario, setDadosUsuario }) {
  const meuUid = auth.currentUser?.uid || usuario?.uid || dadosUsuario?.uid;

  const [valores, setValores] = useState({}); 
  const [direcaoAtual, setDirecaoAtual] = useState('horizontal');
  const [mensagemGeral, setMensagemGeral] = useState('A IA está a preparar o seu plantão... 🧠');
  const [vitoria, setVitoria] = useState(false);
  const [jogoIniciado, setJogoIniciado] = useState(false); 
  const [chaveRecarregamento, setChaveRecarregamento] = useState(0); 
  
  const [celulasDestacadas, setCelulasDestacadas] = useState([]);
  
  const [dicasSalvas, setDicasSalvas] = useState({});
  const [palavraSelecionada, setPalavraSelecionada] = useState(null);
  const [niveisDesbloqueados, setNiveisDesbloqueados] = useState({}); 
  const [penalidadeXP, setPenalidadeXP] = useState(0);

  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [relatorioXP, setRelatorioXP] = useState(null);
  const [progressoTicket, setProgressoTicket] = useState(null);
  
  const [errosNaPartida, setErrosNaPartida] = useState(0);
  const [levelUps, setLevelUps] = useState([]);
  const cadeadoRecompensa = useRef(false);
  const partidaIdRef = useRef(null);
  const direcaoFocoRef = useRef(null);
  const letrasPuladasRef = useRef([]);
  const tentativasErradasRef = useRef(new Set());

  // Recompensa pendente até a conclusão ser confirmada pelo backend.
  const [xpPendente, setXpPendente] = useState(null);
  const [tutorialAberto, setTutorialAberto] = useState(() =>
    dadosUsuario?.tutorialCruzadinhasConcluido !== true &&
    !(dadosUsuario?.estatisticasGerais?.historico?.length > 0) &&
    !Object.values(dadosUsuario?.estatisticas || {}).some(estatistica => Number(estatistica?.partidas) > 0)
  );
  const [passoTutorial, setPassoTutorial] = useState(0);
  const [salvandoTutorial, setSalvandoTutorial] = useState(false);
  const [erroTutorial, setErroTutorial] = useState('');
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  useEffect(() => {
    if (!tutorialAberto && !confirmarSaida && !vitoria) return;
    const dialogo = document.querySelector('[data-active-crossword-dialog]');
    if (!dialogo) return;
    const focoAnterior = document.activeElement;
    const focoInicial = dialogo.querySelector('h2, h3, button');
    focoInicial?.focus();
    const manterFoco = evento => {
      if (evento.key === 'Escape' && confirmarSaida) {
        setConfirmarSaida(false);
        return;
      }
      if (evento.key !== 'Tab') return;
      const elementos = [...dialogo.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')];
      if (!elementos.length) return;
      const primeiro = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (evento.shiftKey && (document.activeElement === primeiro || !dialogo.contains(document.activeElement))) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && (document.activeElement === ultimo || !dialogo.contains(document.activeElement))) {
        evento.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', manterFoco);
    return () => {
      document.removeEventListener('keydown', manterFoco);
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, [tutorialAberto, confirmarSaida, vitoria]);

  const concluirTutorial = async () => {
    if (dadosUsuario?.tutorialCruzadinhasConcluido === true || dadosUsuario?.estatisticasGerais?.historico?.length > 0 || Object.values(dadosUsuario?.estatisticas || {}).some(estatistica => Number(estatistica?.partidas) > 0)) {
      setTutorialAberto(false);
      return;
    }
    if (!meuUid) {
      setErroTutorial('Não foi possível identificar seu perfil. Entre novamente e tente de novo.');
      return;
    }
    setSalvandoTutorial(true);
    setErroTutorial('');
    try {
      if (import.meta.env.VITE_FONTE_DADOS === 'planilha') {
        const perfil = await chamarPerfilPlanilha(usuario, 'tutorial');
        setDadosUsuario(perfil);
      } else {
        await updateDoc(doc(db, 'usuarios', meuUid), { tutorialCruzadinhasConcluido: true });
        setDadosUsuario(prev => ({ ...prev, tutorialCruzadinhasConcluido: true }));
      }
      setTutorialAberto(false);
    } catch (error) {
      console.error('Falha ao registrar tutorial da cruzadinha:', error);
      setErroTutorial('Não foi possível salvar o tutorial. Tente novamente.');
    } finally {
      setSalvandoTutorial(false);
    }
  };

  const materiaBlindada = materia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const subMateriaBlindada = subMateria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const chaveXP = `${materiaBlindada}-${subMateriaBlindada}`;

  const xpAtualSubtopico = Number(dadosUsuario?.xpTopicos?.[chaveXP]) || 0;
  const nivelAtual = xpAtualSubtopico === 0 ? 0 : Math.floor(Math.sqrt(xpAtualSubtopico / 1000)) + 1;
  const [nivelDaGrade, setNivelDaGrade] = useState(nivelAtual);
  const xpNivelAtualBase = nivelAtual <= 1 ? 0 : Math.pow(nivelAtual - 1, 2) * 1000;
  const xpProximoNivelBase = nivelAtual === 0 ? 1 : Math.pow(nivelAtual, 2) * 1000;
  const xpProgressoNesteNivel = xpAtualSubtopico - xpNivelAtualBase;
  const xpNecessarioParaUpar = xpProximoNivelBase - xpNivelAtualBase;
  const porcentagemBarra = nivelAtual === 0 ? 0 : (xpProgressoNesteNivel / xpNecessarioParaUpar) * 100;

  useEffect(() => {
    let intervalo;
    if (jogoIniciado && !vitoria && !tutorialAberto && !confirmarSaida) intervalo = setInterval(() => setTempoDecorrido(prev => prev + 1), 1000);
    return () => clearInterval(intervalo);
  }, [vitoria, jogoIniciado, chaveRecarregamento, tutorialAberto, confirmarSaida]);

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  const { gradePronta, limites } = useMemo(() => {
    const resultado = gerarTabuleiro(bancoDePalavras, chaveXP, nivelDaGrade);
    if (import.meta.env.DEV && resultado.selecao) {
      console.debug('[Cruzadinha] seleção da grade', chaveXP, resultado.selecao);
    }
    return resultado;
  // A chave força uma nova grade aleatória ao avançar, mesmo no mesmo nível.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bancoDePalavras, chaveXP, chaveRecarregamento, nivelDaGrade]);

  const palavrasDoTabuleiro = useMemo(() => {
    const palavras = [];
    gradePronta.forEach(linha => {
      linha.forEach(c => {
        if (c.palavraInicialHorizontal) palavras.push(c.palavraInicialHorizontal);
        if (c.palavraInicialVertical) palavras.push(c.palavraInicialVertical);
      });
    });
    return palavras;
  }, [gradePronta]);

  const mapaDicasBasicas = useMemo(() => {
    const mapa = {};
    gradePronta.forEach(linha => {
      linha.forEach(c => {
        if (c.palavraInicialHorizontal && c.dicaBasicaHorizontal) mapa[c.palavraInicialHorizontal] = c.dicaBasicaHorizontal;
        if (c.palavraInicialVertical && c.dicaBasicaVertical) mapa[c.palavraInicialVertical] = c.dicaBasicaVertical;
      });
    });
    return mapa;
  }, [gradePronta]);

  useEffect(() => {
    const preCarregarDicasEmLote = async () => {
      if (palavrasDoTabuleiro.length === 0 || jogoIniciado) return; 

      if (nivelAtual <= 2) {
        const dicasEstaticas = {};
        palavrasDoTabuleiro.forEach(palavra => {
          let dicaOriginal = mapaDicasBasicas[palavra] || "Encontre esta estrutura.";
          dicaOriginal = aplicarCensura(dicaOriginal, palavra);
          dicasEstaticas[palavra] = {
            laudo: `${dicaOriginal} (Dica: Começa com a letra ${palavra[0]})`,
            residente: "Indisponível (Modo Básico não possui Residentes).",
            paciente: "Indisponível (Modo Básico não possui Pacientes)."
          };
        });
        setDicasSalvas(prev => ({ ...prev, ...dicasEstaticas }));
        setMensagemGeral('Prontuários carregados! Selecione um número para começar.');
        setJogoIniciado(true);
        return; 
      }
      
      setMensagemGeral(`A IA está a estruturar as dicas (Nível ${nivelAtual})...`);
      
      const prompt = `Você é um gerador de dicas de palavras cruzadas médicas. Para CADA palavra da lista, crie 3 níveis de dicas (máx 15 palavras cada).
      Nível 1 (laudo): Termos técnicos anatômicos/patológicos formais.
      Nível 2 (residente): Correlação clínica, sintomas ou prática de hospital.
      Nível 3 (paciente): Linguagem extremamente simples e leiga, quase infantil.
      REGRAS ABSOLUTAS: É PROIBIDO usar a palavra solicitada ou os seus radicais nas dicas.
      Retorne APENAS um objeto JSON válido. Exemplo:
      {
        "FEMUR": { "laudo": "...", "residente": "...", "paciente": "..." },
        "TIBIA": { "laudo": "...", "residente": "...", "paciente": "..." }
      }
      Lista: ${palavrasDoTabuleiro.join(', ')}`;

      try {
        let textoResposta = await chamarOpenRouter(prompt, { temperature: 0.2 });
        textoResposta = textoResposta.replace(/```json/gi, '').replace(/```/g, '').trim();
        const dicasGeradas = JSON.parse(textoResposta);
        
        setDicasSalvas(prev => ({ ...prev, ...dicasGeradas }));
        setMensagemGeral('Fichas clínicas prontas! Selecione um número para começar.');
        setJogoIniciado(true); 
      } catch (erro) {
        console.error(erro);
        setMensagemGeral("Clique no número de uma palavra para gerar a dica.");
        setJogoIniciado(true); 
      }
    };
    preCarregarDicasEmLote();
  }, [palavrasDoTabuleiro, nivelAtual, jogoIniciado, mapaDicasBasicas]);

  const gerarDica = async (termo) => {
    setPalavraSelecionada(termo);
    if (dicasSalvas[termo]) return; 

    setMensagemGeral(`Consultando a IA para o termo...`);
    const prompt = `Gere dicas para estudantes de medicina. O termo é [${termo}]. Retorne UM JSON estrito com 3 níveis curtos (máx 15 palavras). Formato: {"laudo": "termo técnico...", "residente": "prática clínica...", "paciente": "termo leigo..."}. PROIBIDO usar a palavra '${termo}'.`;
    
    try {
        let textoResposta = await chamarOpenRouter(prompt, { temperature: 0.2 });
        textoResposta = textoResposta.replace(/```json/gi, '').replace(/```/g, '').trim();
        const novaDicaObj = JSON.parse(textoResposta);
        setDicasSalvas(prev => ({ ...prev, [termo]: novaDicaObj }));
    } catch {
        const fallback = { laudo: "Erro de ligação. Tente deduzir!", residente: "Indisponível", paciente: "Indisponível" };
        setDicasSalvas(prev => ({ ...prev, [termo]: fallback }));
    }
  };

  useEffect(() => {
    // Se o tabuleiro ainda não gerou casas válidas, abortamos a verificação para evitar vitórias falsas.
    if (!gradePronta || gradePronta.length === 0) return;

    let todasCertas = true; let temPalavra = false;
    gradePronta.forEach(linha => linha.forEach(celula => {
        if (!celula.vazia && celula.letraCerta !== ' ') { 
          temPalavra = true;
          const valorDigitado = valores[`${celula.linha}-${celula.coluna}`];
          if (!valorDigitado || valorDigitado.toUpperCase() !== celula.letraCerta.toUpperCase()) todasCertas = false;
        }
    }));

    if (temPalavra && todasCertas && !vitoria && !cadeadoRecompensa.current) {
      cadeadoRecompensa.current = true; setVitoria(true); setCelulasDestacadas([]); 

      const prepararXPPendente = () => {
        if (meuUid && dadosUsuario) {
          let numLetras = 0; let numPalavras = 0; let tamanhoMaiorPalavra = 0;
          gradePronta.forEach(linha => linha.forEach(c => {
              if (!c.vazia && c.letraCerta !== ' ') numLetras++;
              if (c.inicioHorizontal) numPalavras++;
              if (c.inicioVertical) numPalavras++;
              if (c.palavraInicialHorizontal && c.palavraInicialHorizontal.length > tamanhoMaiorPalavra) tamanhoMaiorPalavra = c.palavraInicialHorizontal.length;
              if (c.palavraInicialVertical && c.palavraInicialVertical.length > tamanhoMaiorPalavra) tamanhoMaiorPalavra = c.palavraInicialVertical.length;
          }));

          const xpLetras = numLetras * 2;
          const xpPalavras = numPalavras * 10;
          const xpBase = xpLetras + xpPalavras;
          const multNivel = 1 + ((Math.max(1, nivelDaGrade) - 1) * 0.1);
          const tempoIdeal = numPalavras * 15;
          let multTempo = 1.0;
          if (tempoDecorrido <= tempoIdeal * 0.25) multTempo = 2.0;
          else if (tempoDecorrido <= tempoIdeal * 0.5) multTempo = 1.5;
          else if (tempoDecorrido <= tempoIdeal) multTempo = 1.2;
          const xpCalculado = Math.floor(xpBase * multNivel * multTempo) - penalidadeXP;
          const xpFinalDaFase = Math.max(10, xpCalculado);

          setProgressoTicket({ atual: 2, ganhou: true });

          const progressoMissoes = aplicarProgressoMissoes(lerMissoes(dadosUsuario), { jogar_cruzadinha: 1, acertar_palavras: numPalavras });
          const xpMissaoBonus = progressoMissoes.xp;
          const ticketMissaoBonus = progressoMissoes.tickets;
          const missoesConcluidas = progressoMissoes.missoes.filter((missao, index) => !lerMissoes(dadosUsuario)[index]?.concluida && missao.concluida);
          setRelatorioXP({ ganho: xpFinalDaFase, letras: numLetras, palavras: numPalavras, xpLetras, xpPalavras, base: xpBase, multNivel, multTempo, penalidade: penalidadeXP, xpCalculado, xpMissoes: xpMissaoBonus, ticketsMissoes: ticketMissaoBonus, missoesConcluidas });

          if (!partidaIdRef.current) partidaIdRef.current = crypto.randomUUID();
          setXpPendente({
            status: 'pendente',
            partida: {
              id: partidaIdRef.current, chaveXP, subMateria, dia: dataLocalHoje(),
              xp: xpFinalDaFase, palavras: palavrasDoTabuleiro.length, penalidadeXP,
              letras: numLetras, tempo: tempoDecorrido, erros: errosNaPartida,
              maiorPalavra: tamanhoMaiorPalavra
            }
          });
        }
      };
      prepararXPPendente();
    } else if (!todasCertas && vitoria) {
      setVitoria(false); cadeadoRecompensa.current = false; 
    }
  }, [valores, gradePronta, vitoria, usuario, dadosUsuario, nivelAtual, nivelDaGrade, tempoDecorrido, chaveXP, xpAtualSubtopico, materia, subMateria, materiaBlindada, errosNaPartida, meuUid, penalidadeXP, palavrasDoTabuleiro.length]);

  useEffect(() => {
    if (!xpPendente || xpPendente.status !== 'pendente' || !meuUid) return;
    setXpPendente(prev => ({ ...prev, status: 'salvando' }));
    registrarCruzadinha(meuUid, xpPendente.partida)
      .then(dados => {
        const xpRecebido = (Number(dados.xpTopicos?.[chaveXP]) || 0) - (Number(dadosUsuario?.xpTopicos?.[chaveXP]) || 0);
        const xpGlobalRecebido = (Number(dados.pontuacaoTotal) || 0) - (Number(dadosUsuario?.pontuacaoTotal) || 0);
        const ticketRecebido = (Number(dados.tickets) || 0) - (Number(dadosUsuario?.tickets) || 0);
        setRelatorioXP(prev => prev ? { ...prev, ganho: xpRecebido, xpMissoes: Math.max(0, xpGlobalRecebido - xpRecebido), ticketsRecebidos: Math.max(0, ticketRecebido) } : prev);
        setProgressoTicket({ atual: dados.medidorTicketsCruzadinha === 0 ? 2 : dados.medidorTicketsCruzadinha, ganhou: dados.medidorTicketsCruzadinha === 0 });
        const anterior = nivelPorXP(dadosUsuario?.pontuacaoTotal);
        const novo = nivelPorXP(dados.pontuacaoTotal);
        if (novo > anterior) { setLevelUps([{ nome: 'Nível global', antigo: anterior, novo, icone: '⭐' }]); setTimeout(() => setLevelUps([]), 8000); }
        setDadosUsuario(dados);
        setXpPendente(prev => ({ ...prev, status: 'salvo' }));
      })
      .catch(error => {
        console.error('Falha ao salvar cruzadinha:', error);
        setXpPendente(prev => ({ ...prev, status: 'erro' }));
      });
  }, [xpPendente, meuUid, setDadosUsuario, chaveXP, dadosUsuario]);

  const atualizarDestaqueVisual = (linha, coluna, direcao) => {
    const celulaAtual = gradePronta[linha][coluna];
    const idDaPalavraQueQueremosPintar = direcao === 'horizontal' ? celulaAtual.idHorizontal : celulaAtual.idVertical;
    if (!idDaPalavraQueQueremosPintar) return;
    let novasDestacadas = [];
    gradePronta.forEach(linhaMatriz => {
      linhaMatriz.forEach(celula => {
        if (!celula.vazia && celula.letraCerta !== ' ') { 
          if (direcao === 'horizontal' && celula.idHorizontal === idDaPalavraQueQueremosPintar) novasDestacadas.push(`${celula.linha}-${celula.coluna}`);
          else if (direcao === 'vertical' && celula.idVertical === idDaPalavraQueQueremosPintar) novasDestacadas.push(`${celula.linha}-${celula.coluna}`);
        }
      });
    });
    setCelulasDestacadas(novasDestacadas);
  };

  const selecionarEntrada = (celula, direcao) => {
    setDirecaoAtual(direcao);
    atualizarDestaqueVisual(celula.linha, celula.coluna, direcao);
    const idDaPalavra = direcao === 'horizontal' ? celula.idHorizontal : celula.idVertical;
    let palavraDaDica = null;
    gradePronta.forEach(linha => {
      linha.forEach(c => {
        if (direcao === 'horizontal' && c.idHorizontal === idDaPalavra && c.inicioHorizontal) palavraDaDica = c.palavraInicialHorizontal;
        if (direcao === 'vertical' && c.idVertical === idDaPalavra && c.inicioVertical) palavraDaDica = c.palavraInicialVertical;
      });
    });
    if (palavraDaDica) gerarDica(palavraDaDica);
  };

  const handleFocus = (celula) => {
    if (!direcaoFocoRef.current) letrasPuladasRef.current = [];
    const novaDirecao = direcaoFocoRef.current || escolherDirecaoDaEntrada(gradePronta, valores, celula, direcaoAtual);
    direcaoFocoRef.current = null;
    selecionarEntrada(celula, novaDirecao);
  };

  const handleClick = (celula) => {
    letrasPuladasRef.current = [];
    if (celula.pertenceHorizontal && celula.pertenceVertical) {
      selecionarEntrada(celula, escolherDirecaoDaEntrada(gradePronta, valores, celula, direcaoAtual));
    }
  };

  const preencherPalavraAdmin = () => {
    if (dadosUsuario?.role !== 'admin' || !jogoIniciado || vitoria) return;
    const preenchimento = {};
    gradePronta.flat().forEach(celula => {
      const chave = `${celula.linha}-${celula.coluna}`;
      if (celulasDestacadas.includes(chave)) preenchimento[chave] = celula.letraCerta;
    });
    setValores(anterior => ({ ...anterior, ...preenchimento }));
  };

  const finalizarAdmin = () => {
    if (dadosUsuario?.role !== 'admin' || !jogoIniciado || vitoria) return;
    const preenchimento = {};
    gradePronta.flat().forEach(celula => {
      if (!celula.vazia && celula.letraCerta !== ' ') preenchimento[`${celula.linha}-${celula.coluna}`] = celula.letraCerta;
    });
    setValores(preenchimento);
  };

  const novaGradeAdmin = () => {
    if (dadosUsuario?.role !== 'admin' || vitoria) return;
    setValores({}); setCelulasDestacadas([]); setPalavraSelecionada(null);
    setJogoIniciado(false); setTempoDecorrido(0); setErrosNaPartida(0);
    tentativasErradasRef.current.clear(); setDicasSalvas({}); setNiveisDesbloqueados({});
    setPenalidadeXP(0); partidaIdRef.current = null;
    setChaveRecarregamento(anterior => anterior + 1);
  };

  const handleInput = (e, l, c) => {
    const val = e.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    letrasPuladasRef.current = [];
    const novosValores = { ...valores, [`${l}-${c}`]: val };
    setValores(novosValores);
    if (val && val !== gradePronta[l][c].letraCerta) {
      const assinatura = `${l}:${c}:${val}`;
      if (!tentativasErradasRef.current.has(assinatura)) {
        tentativasErradasRef.current.add(assinatura);
        setErrosNaPartida(prev => prev + 1);
      }
    }
    
    if (val !== '') {
      /* MODO ALTERNATIVO — avançar uma casa por vez, inclusive preenchidas:
      const proxima = proximaCelulaDaEntrada(gradePronta, novosValores, l, c, direcaoAtual, 1, false);
      if (proxima) {
        direcaoFocoRef.current = direcaoAtual;
        document.getElementById(`input-${proxima.linha}-${proxima.coluna}`)?.focus();
      }
      Para ativar, substituir o bloco ativo abaixo. O tratamento de letras
      digitadas sobre células já preenchidas está no handleKeyDown.
      */
      // MODO ATUAL — avança ao vazio e guarda as letras puladas para aceitar repetição.
      const proxima = proximaCelulaDaEntrada(gradePronta, novosValores, l, c, direcaoAtual);
      if (proxima) {
        letrasPuladasRef.current = celulasPreenchidasAteProximaVazia(gradePronta, novosValores, l, c, direcaoAtual);
        direcaoFocoRef.current = direcaoAtual;
        document.getElementById(`input-${proxima.linha}-${proxima.coluna}`)?.focus();
      }
      // Fim do modo atual.
    }
  };

  const handleKeyDown = (e, l, c) => {
    const celula = gradePronta[l]?.[c];
    if ((e.key === ' ' || e.key === 'Enter') && celula?.pertenceHorizontal && celula?.pertenceVertical) {
      e.preventDefault();
      selecionarEntrada(celula, direcaoAtual === 'horizontal' ? 'vertical' : 'horizontal');
      return;
    }
    const seta = { ArrowRight: [0, 1, 'horizontal'], ArrowLeft: [0, -1, 'horizontal'], ArrowDown: [1, 0, 'vertical'], ArrowUp: [-1, 0, 'vertical'] }[e.key];
    if (seta) {
      letrasPuladasRef.current = [];
      const [passoLinha, passoColuna, direcao] = seta;
      const destino = gradePronta[l + passoLinha]?.[c + passoColuna];
      if (destino && !destino.vazia && destino.letraCerta !== ' ') {
        e.preventDefault();
        direcaoFocoRef.current = direcao;
        document.getElementById(`input-${destino.linha}-${destino.coluna}`)?.focus();
      }
      return;
    }
    if (e.key === 'Backspace' && !valores[`${l}-${c}`]) {
      letrasPuladasRef.current = [];
      const anterior = proximaCelulaDaEntrada(gradePronta, valores, l, c, direcaoAtual, -1, false);
      if (anterior) document.getElementById(`input-${anterior.linha}-${anterior.coluna}`)?.focus();
      return;
    }
    if (e.key.length === 1 && /^[A-Z]$/.test(e.key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase())) {
      const resultado = resolverLetraRepetida(e.key, letrasPuladasRef.current, valores[`${l}-${c}`]);
      if (resultado.acao === 'consumir') {
        e.preventDefault();
        letrasPuladasRef.current = resultado.restantes;
      } else if (resultado.acao === 'substituir') {
        e.preventDefault();
        handleInput({ target: { value: resultado.letra } }, l, c);
      } else {
        letrasPuladasRef.current = [];
      }
    }
  };

  const avancarParaProximoNivel = () => {
    if (xpPendente?.status === 'erro') {
      setXpPendente(prev => ({ ...prev, status: 'pendente' }));
      return;
    }
    if (xpPendente?.status !== 'salvo') return;

    const novoXP = Number(dadosUsuario?.xpTopicos?.[chaveXP]) || 0;
    setNivelDaGrade(novoXP === 0 ? 0 : Math.floor(Math.sqrt(novoXP / 1000)) + 1);
    setValores({}); setVitoria(false); setJogoIniciado(false); setCelulasDestacadas([]); 
    tentativasErradasRef.current.clear();
    cadeadoRecompensa.current = false; setLevelUps([]); 
    partidaIdRef.current = null;
    setDicasSalvas({}); setTempoDecorrido(0); setErrosNaPartida(0); setRelatorioXP(null);
    setProgressoTicket(null); setPalavraSelecionada(null); setNiveisDesbloqueados({}); setPenalidadeXP(0);
    setXpPendente(null); 
    setMensagemGeral('A IA está a preparar o seu plantão... 🧠');
    setChaveRecarregamento(prev => prev + 1); 
  };

  const handleDesbloquearDica = (nivelDesejado) => {
    if (!palavraSelecionada) return;
    if (nivelAtual <= 2) return; 
    setNiveisDesbloqueados(prev => ({ ...prev, [palavraSelecionada]: nivelDesejado }));
    if (nivelDesejado === 2) setPenalidadeXP(prev => prev + 5);
    if (nivelDesejado === 3) setPenalidadeXP(prev => prev + 10);
  };

  return (
    <div className="stitch-integrated stitch-crossword min-h-screen bg-[#0B1120] text-white font-sans relative overflow-x-hidden flex flex-col selection:bg-cyan-500/30 w-full">
      <style>{`
        @keyframes slideInUpLeft { 0% { transform: translateX(-100%) scale(0.8); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,#0B1120_100%)]" />

      {levelUps.length > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '40px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 99999 }}>
          {levelUps.map((lu, idx) => {
            if (lu.isPromocao) {
              return (
                <div key={idx} style={{ backgroundColor: '#141b2b', padding: '25px 35px', borderRadius: '20px', boxShadow: `0 15px 35px ${lu.cor}50`, display: 'flex', alignItems: 'center', gap: '25px', animation: 'slideInUpLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards', borderLeft: `8px solid ${lu.cor}`, borderRight: `8px solid ${lu.cor}` }}>
                  <div style={{ fontSize: '4.5rem' }}>{lu.icone}</div> 
                  <div style={{ paddingRight: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.8rem', color: lu.cor, marginBottom: '8px', textTransform: 'uppercase' }}>Nova Patente Alcançada!</div>
                    <div style={{ fontSize: '1.4rem', color: '#dce2f7' }}>De <span style={{color: '#b9cac4', textDecoration: 'line-through'}}>{lu.antigo}</span> ➔ <span style={{color: lu.cor, fontWeight: 'bold', fontSize: '1.8rem'}}>{lu.novo}</span></div>
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} style={{ backgroundColor: '#141b2b', padding: '25px 35px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '25px', animation: 'slideInUpLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards', borderLeft: '8px solid #ffb95f' }}>
                <div style={{ fontSize: '3.8rem' }}>{lu.icone}</div> 
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.6rem', color: '#ffb95f', marginBottom: '8px' }}>Nível Aumentado!</div>
                  <div style={{ fontSize: '1.3rem', color: '#dce2f7' }}>{lu.nome}: <span style={{color: '#b9cac4', textDecoration: 'line-through'}}>{lu.antigo}</span> ➔ <span style={{color: '#00f5d4', fontWeight: 'bold', fontSize: '1.6rem'}}>{lu.novo}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <header inert={tutorialAberto || confirmarSaida || vitoria} className="h-20 bg-[#1e293b]/50 border-b border-white/[0.05] backdrop-blur-md flex items-center justify-between px-4 md:px-8 relative z-10 shrink-0 shadow-sm gap-3">
        <button aria-label="Abandonar plantão" onClick={() => { if (vitoria && xpPendente?.status === 'salvo') setTelaAtual('topicos'); else if (!vitoria) setConfirmarSaida(true); }} disabled={vitoria && xpPendente?.status !== 'salvo'} className="flex items-center gap-2.5 text-slate-400 hover:text-rose-400 transition-colors text-sm font-bold disabled:opacity-40 shrink-0">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Abandonar Plantão</span>
        </button>

        <div className="flex items-center gap-3 md:gap-10 min-w-0">
          <div className="flex flex-col items-center">
            <span className="text-cyan-400 text-xs uppercase tracking-widest mb-1.5 font-bold">Dificuldade {nivelAtual}</span>
            <div role="progressbar" aria-label={`Progresso do tópico ${subMateria}`} aria-valuemin="0" aria-valuemax={xpNecessarioParaUpar} aria-valuenow={xpProgressoNesteNivel} className="w-20 md:w-36 h-2 bg-[#0F172A] rounded-full overflow-hidden border border-white/[0.05]" title={`${xpProgressoNesteNivel} / ${xpNecessarioParaUpar} XP`}>
              <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${porcentagemBarra}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 bg-[#0F172A] px-3 md:px-5 py-2 rounded-full border border-white/[0.05] shadow-inner">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-white text-lg tracking-wider font-bold">{formatarTempo(tempoDecorrido)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => { setPassoTutorial(0); setErroTutorial(''); setTutorialAberto(true); }} className="text-xs font-bold text-cyan-400 hover:text-white transition-colors">Tutorial</button>
          <span className="hidden md:inline text-xs font-mono text-cyan-400">CRUZADINHA · {subMateria}</span>
        </div>
      </header>

      <main inert={tutorialAberto || confirmarSaida || vitoria} className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10 w-full overflow-hidden">
        
        <div className="w-full md:w-[340px] lg:w-[400px] shrink-0 border-b md:border-b-0 md:border-r border-white/[0.05] flex flex-col p-4 md:p-5 bg-[#0f172a]/50 overflow-y-auto max-h-[35vh] md:max-h-full">
          
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-cyan-400 text-sm font-bold tracking-wide">Prontuário Médico</h2>
             </div>
             {penalidadeXP > 0 && (
                <span className="text-rose-400 text-[10px] font-bold px-2 py-1 bg-rose-500/10 rounded border border-rose-500/20 shadow-inner">
                   Punição: -{penalidadeXP} XP
                </span>
             )}
          </div>

          <AnimatePresence mode="wait">
            {!palavraSelecionada || !dicasSalvas[palavraSelecionada] ? (
              <motion.div key="mensagem-geral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-white/[0.1] rounded-2xl">
                <p className="text-slate-400 text-sm leading-relaxed">{mensagemGeral}</p>
              </motion.div>
            ) : (
              <motion.div key="sanfona-dicas" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
                
                <div className="bg-[#1e293b]/80 border border-cyan-500/30 rounded-xl p-4 shadow-lg">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest flex items-center gap-2 mb-2">
                     <Activity className="w-3 h-3" /> Laudo Especialista
                  </span>
                  <p className="text-white text-sm leading-relaxed">{dicasSalvas[palavraSelecionada].laudo}</p>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/[0.05] bg-[#151F32]">
                   {(niveisDesbloqueados[palavraSelecionada] || 1) >= 2 ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-4 border-l-4 border-amber-500">
                         <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest flex items-center gap-2 mb-2">
                           <User className="w-3 h-3" /> Observação do Residente
                         </span>
                         <p className="text-slate-300 text-sm leading-relaxed">{dicasSalvas[palavraSelecionada].residente}</p>
                      </motion.div>
                   ) : (
                      <button onClick={() => handleDesbloquearDica(2)} disabled={nivelAtual <= 2} className="w-full p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group">
                         <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Revelar Opinião do Residente</span>
                         </div>
                         <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                      </button>
                   )}
                </div>

                {((niveisDesbloqueados[palavraSelecionada] || 1) >= 2) && (
                   <div className="rounded-xl overflow-hidden border border-white/[0.05] bg-[#151F32]">
                      {(niveisDesbloqueados[palavraSelecionada] || 1) >= 3 ? (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-4 border-l-4 border-emerald-500">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest flex items-center gap-2 mb-2">
                              <User className="w-3 h-3" /> Relato para o Paciente
                            </span>
                            <p className="text-slate-300 text-sm leading-relaxed italic">"{dicasSalvas[palavraSelecionada].paciente}"</p>
                         </motion.div>
                      ) : (
                         <button onClick={() => handleDesbloquearDica(3)} disabled={nivelAtual <= 2} className="w-full p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group">
                            <div className="flex items-center gap-3">
                               <Lock className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                               <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Revelar Relato Leigo</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                         </button>
                      )}
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
              <span className="text-[9px] uppercase tracking-widest text-slate-600">{materia} • {subMateria}</span>
              <span className="bg-[#0F172A] border border-white/[0.05] text-cyan-400 text-[10px] px-2 py-0.5 rounded-full">
                {celulasDestacadas.length > 0 ? `${celulasDestacadas.length} Letras` : 'Aguardando'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-0 md:p-4 overflow-hidden w-full h-full relative">
          <div className="p-2 md:p-5 rounded-none md:rounded-2xl bg-transparent md:bg-[#1e293b]/20 border-none md:border md:border-white/[0.02] shadow-none md:shadow-[0_10px_40px_rgba(0,0,0,0.3)] w-full h-full relative overflow-x-auto overflow-y-auto touch-pan-x touch-pan-y scrollbar-hide whitespace-nowrap">
            <Tabuleiro gradePronta={gradePronta} limites={limites} valores={valores} celulasDestacadas={celulasDestacadas} bloqueado={vitoria || !jogoIniciado || tutorialAberto || confirmarSaida} handleInput={handleInput} handleKeyDown={handleKeyDown} handleFocus={handleFocus} handleClick={handleClick} />
          </div>
        </div>
      </main>

      {dadosUsuario?.role === 'admin' && !tutorialAberto && !confirmarSaida && !vitoria && <AdminSpeedDial titulo="Ferramentas admin · Tabuleiro"><div className="flex flex-col gap-2"><button type="button" onClick={preencherPalavraAdmin} disabled={!celulasDestacadas.length || !jogoIniciado} className="stitch-primary disabled:opacity-40">Preencher palavra selecionada</button><button type="button" onClick={finalizarAdmin} disabled={!jogoIniciado} className="stitch-primary disabled:opacity-40">Finalizar cruzadinha</button><button type="button" onClick={novaGradeAdmin} className="stitch-primary">Gerar nova grade</button></div></AdminSpeedDial>}

      <AnimatePresence>
        {vitoria && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-lg">
              <motion.div data-active-crossword-dialog initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} role="dialog" aria-modal="true" aria-label="Relatório do plantão" className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-8 text-center relative bg-[#0f1f18] border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none bg-emerald-500/30" />

                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-emerald-500/10 border border-emerald-500/50 relative z-10">
                  <Trophy className="w-8 h-8 text-emerald-400" />
                </div>

                <h2 tabIndex="-1" className="text-2xl text-emerald-400 mb-1 relative z-10 font-bold">Plantão Concluído! 🎉</h2>
                <p className="text-slate-400 text-sm mb-6 relative z-10">Todas as palavras foram preenchidas corretamente.</p>
                {xpPendente?.status !== 'salvo' && (
                  <p role="status" aria-live="polite" className={`mb-4 text-sm relative z-10 ${xpPendente?.status === 'erro' ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {xpPendente?.status === 'erro'
                      ? 'Não foi possível confirmar o salvamento. Mantenha esta tela aberta e tente novamente; a mesma partida será reenviada sem duplicar a recompensa.'
                      : 'Confirmando sua recompensa na planilha. Os valores abaixo são uma prévia até o salvamento terminar.'}
                  </p>
                )}

                <div className="flex justify-center gap-3 mb-6 relative z-10">
                  <div className="bg-[#0B1120] border border-emerald-500/20 px-5 py-3 rounded-xl flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-lg font-bold">+{relatorioXP?.ganho || 0} XP</span>
                  </div>
                </div>
                
                <div className="bg-[#0B1120] border border-white/[0.1] rounded-xl p-4 mb-5 text-left text-xs text-slate-300 space-y-2 relative z-10" aria-label="Detalhamento do XP">
                  <h3 className="text-sm font-bold text-cyan-400 mb-2">{xpPendente?.status === 'salvo' ? 'Relatório de XP' : 'Prévia de XP'}</h3>
                  <div className="flex justify-between"><span>{relatorioXP?.letras} letras × 2 XP</span><span>+{relatorioXP?.xpLetras} XP</span></div>
                  <div className="flex justify-between"><span>{relatorioXP?.palavras} palavras × 10 XP</span><span>+{relatorioXP?.xpPalavras} XP</span></div>
                  <div className="flex justify-between border-t border-white/[0.1] pt-2"><span>Base</span><span>{relatorioXP?.base} XP</span></div>
                  <div className="flex justify-between"><span>Multiplicador do nível</span><span>×{relatorioXP?.multNivel?.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span>Multiplicador do tempo ({formatarTempo(tempoDecorrido)})</span><span>×{relatorioXP?.multTempo?.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span>Dicas extras</span><span>−{relatorioXP?.penalidade || 0} XP</span></div>
                  {relatorioXP?.xpCalculado < 10 && <p className="text-cyan-400">Aplicado o mínimo de 10 XP por partida.</p>}
                  <div className="flex justify-between border-t border-white/[0.1] pt-2 font-bold text-emerald-400"><span>XP da cruzadinha</span><span>+{relatorioXP?.ganho || 0} XP</span></div>
                  <div className="flex justify-between"><span>Missões diárias{relatorioXP?.missoesConcluidas?.length ? `: ${relatorioXP.missoesConcluidas.map(m => m.titulo).join(', ')}` : ''}</span><span>+{relatorioXP?.xpMissoes || 0} XP</span></div>
                  <div className="flex justify-between font-bold text-cyan-400"><span>Total de XP global</span><span>+{(relatorioXP?.ganho || 0) + (relatorioXP?.xpMissoes || 0)} XP</span></div>
                  <p className="text-slate-400">Tickets: +{relatorioXP?.ticketsRecebidos ?? ((progressoTicket?.ganhou ? 2 : 0) + (relatorioXP?.ticketsMissoes || 0))} (jogo, missões e nível).</p>
                </div>

                {progressoTicket && (
                  <div className="bg-[#0B1120] border border-orange-500/20 p-4 rounded-xl mb-6 relative overflow-hidden shadow-inner">
                    {progressoTicket.ganhou && (
                      <motion.div animate={{ opacity: [0, 0.15, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-orange-500 pointer-events-none" />
                    )}
                    <div className="flex justify-between items-center mb-2 relative z-10">
                      <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">Tickets da cruzadinha</span>
                      <span className="text-orange-400 font-mono text-xs font-bold">+2 tickets</span>
                    </div>
                    <div className="flex gap-2 relative z-10">
                      <div className={`flex-1 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 ${progressoTicket.atual >= 1 ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-[#0F172A] border-white/[0.05] text-slate-600'}`}>
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div className={`flex-1 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 delay-300 ${progressoTicket.atual >= 2 ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-[#0F172A] border-white/[0.05] text-slate-600'}`}>
                        <Ticket className="w-4 h-4" />
                      </div>
                    </div>
                    {progressoTicket.ganhou && (
                      <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-orange-400 text-[10px] font-bold mt-2 text-center uppercase tracking-widest">
                        +2 tickets da cruzadinha! Disponíveis para o DDX.
                      </motion.p>
                    )}
                  </div>
                )}

                <div className="mb-6 relative z-10">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 font-bold">
                    <span className="text-slate-500">Nível {nivelAtual}</span>
                    <span className="text-emerald-400">Progresso</span>
                  </div>
                  <div className="w-full h-2 bg-[#0B1120] rounded-full overflow-hidden border border-white/[0.05]">
                    <motion.div initial={{ width: '0%' }} animate={{ width: `${porcentagemBarra}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full rounded-full bg-emerald-400" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.6)' }} />
                  </div>
                </div>

                <button onClick={avancarParaProximoNivel} disabled={xpPendente?.status !== 'salvo' && xpPendente?.status !== 'erro'} className="w-full bg-[#1e293b] hover:bg-[#151F32] border border-white/[0.1] text-white py-3 rounded-xl transition-all relative z-10 text-sm font-bold disabled:opacity-50 disabled:cursor-wait">
                  {xpPendente?.status === 'erro' ? 'Tentar salvar novamente' : xpPendente?.status === 'salvo' ? 'Próximo Plantão' : 'Salvando progresso...'}
                </button>
                <button onClick={() => { if (xpPendente?.status === 'salvo') setTelaAtual('topicos'); }} disabled={xpPendente?.status !== 'salvo'} className="w-full mt-2 bg-transparent text-slate-400 hover:text-white py-2 transition-all relative z-10 text-xs font-bold disabled:opacity-40">
                  Sair
                </button>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {tutorialAberto && !vitoria && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-[#0B1120]/90 backdrop-blur-lg flex items-center justify-center p-4">
            <motion.div data-active-crossword-dialog initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} role="dialog" aria-modal="true" aria-labelledby="tutorial-cruzadinha-titulo" className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-[#1e293b] p-6 md:p-8 shadow-xl">
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-2">Tutorial · {passoTutorial + 1}/{passosTutorial.length}</p>
              <h2 tabIndex="-1" id="tutorial-cruzadinha-titulo" className="text-2xl font-bold text-white mb-4">{passosTutorial[passoTutorial].titulo}</h2>
              <p className="text-slate-300 leading-relaxed min-h-24">{passosTutorial[passoTutorial].texto}</p>
              {erroTutorial && <p role="alert" className="text-rose-400 text-sm mt-3">{erroTutorial}</p>}
              <div className="flex justify-between gap-3 mt-6">
                <button type="button" disabled={passoTutorial === 0 || salvandoTutorial} onClick={() => setPassoTutorial(p => p - 1)} className="px-4 py-3 rounded-xl border border-white/[0.1] text-slate-300 disabled:opacity-40">Voltar</button>
                {passoTutorial < passosTutorial.length - 1
                  ? <button type="button" onClick={() => setPassoTutorial(p => p + 1)} className="px-5 py-3 rounded-xl bg-cyan-500 text-[#0B1120] font-bold">Próximo</button>
                  : <button type="button" disabled={salvandoTutorial} onClick={concluirTutorial} className="px-5 py-3 rounded-xl bg-cyan-500 text-[#0B1120] font-bold disabled:opacity-40">{salvandoTutorial ? 'Salvando...' : 'Começar plantão'}</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
        {confirmarSaida && !vitoria && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#0B1120]/90 backdrop-blur-lg flex items-center justify-center p-4">
            <div data-active-crossword-dialog role="alertdialog" aria-modal="true" aria-labelledby="confirmar-saida-titulo" className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#1e293b] p-7 shadow-xl">
              <h2 tabIndex="-1" id="confirmar-saida-titulo" className="text-xl font-bold text-white mb-3">Abandonar plantão?</h2>
              <p className="text-slate-300 text-sm mb-6">Você perderá as letras preenchidas e o progresso desta partida. Tem certeza de que quer sair?</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setConfirmarSaida(false)} className="flex-1 rounded-xl border border-white/[0.1] py-3 text-white">Continuar jogando</button>
                <button type="button" onClick={() => setTelaAtual('topicos')} className="flex-1 rounded-xl bg-rose-500 py-3 font-bold text-white">Abandonar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
