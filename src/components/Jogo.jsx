import { useState, useEffect, useMemo, useRef } from 'react'; 
import { auth, db } from '../firebase'; 
import { doc, updateDoc } from 'firebase/firestore';
import { gerarTabuleiro } from '../utils/motorTabuleiro'; 
import Tabuleiro from './Tabuleiro';

import { Clock, FastForward, LogOut, Stethoscope, Trophy, Ticket, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getPatente = (nivel) => {
  if (nivel <= 5) return { titulo: 'Estudante (Básico)', cor: '#64748b' };
  if (nivel <= 15) return { titulo: 'Estudante (Clínico)', cor: '#0ea5e9' };
  if (nivel <= 30) return { titulo: 'Interno', cor: '#8b5cf6' };
  if (nivel <= 50) return { titulo: 'Residente (R1)', cor: '#f59e0b' };
  if (nivel <= 80) return { titulo: 'Médico Especialista', cor: '#ef4444' };
  return { titulo: 'Chefe de Plantão', cor: '#10b981' };
};

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

export default function Jogo({ bancoDePalavras, materia, subMateria, setTelaAtual, usuario, dadosUsuario, setDadosUsuario }) {
  const meuUid = auth.currentUser?.uid || usuario?.uid || dadosUsuario?.uid;

  useEffect(() => {
    document.documentElement.style.fontSize = '16px';
    return () => {
      document.documentElement.style.fontSize = '24px';
    };
  }, []);

  const [valores, setValores] = useState({}); 
  const [direcaoAtual, setDirecaoAtual] = useState('horizontal');
  const [dica, setDica] = useState('A IA está a preparar o seu plantão... 🧠');
  const [vitoria, setVitoria] = useState(false);
  const [jogoIniciado, setJogoIniciado] = useState(false); 
  const [chaveRecarregamento, setChaveRecarregamento] = useState(0); 
  
  const [celulasDestacadas, setCelulasDestacadas] = useState([]);
  const [dicasSalvas, setDicasSalvas] = useState({});

  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [relatorioXP, setRelatorioXP] = useState(null);
  
  // 🔥 ESTADO DO CARTÃO FIDELIDADE
  const [progressoTicket, setProgressoTicket] = useState(null);
  
  const [errosNaPartida, setErrosNaPartida] = useState(0);
  const [levelUps, setLevelUps] = useState([]);
  const cadeadoRecompensa = useRef(false);

  const materiaBlindada = materia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const subMateriaBlindada = subMateria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const chaveXP = `${materiaBlindada}-${subMateriaBlindada}`;

  const xpAtualSubtopico = Number(dadosUsuario?.xpTopicos?.[chaveXP]) || 0;
  const nivelAtual = xpAtualSubtopico === 0 ? 0 : Math.floor(Math.sqrt(xpAtualSubtopico / 1000)) + 1;
  const xpNivelAtualBase = nivelAtual <= 1 ? 0 : Math.pow(nivelAtual - 1, 2) * 1000;
  const xpProximoNivelBase = nivelAtual === 0 ? 1 : Math.pow(nivelAtual, 2) * 1000;
  const xpProgressoNesteNivel = xpAtualSubtopico - xpNivelAtualBase;
  const xpNecessarioParaUpar = xpProximoNivelBase - xpNivelAtualBase;
  const porcentagemBarra = nivelAtual === 0 ? 0 : (xpProgressoNesteNivel / xpNecessarioParaUpar) * 100;

  useEffect(() => {
    let intervalo;
    if (jogoIniciado && !vitoria) {
      intervalo = setInterval(() => setTempoDecorrido(prev => prev + 1), 1000);
    }
    return () => clearInterval(intervalo);
  }, [vitoria, jogoIniciado, chaveRecarregamento]);

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  const { gradePronta, limites } = useMemo(() => {
    return gerarTabuleiro(bancoDePalavras, chaveXP, nivelAtual);
  }, [bancoDePalavras, chaveXP, chaveRecarregamento, nivelAtual]); 

  const palavrasDoTabuleiro = useMemo(() => {
    const palavras = new Set();
    gradePronta.forEach(linha => {
      linha.forEach(c => {
        if (c.palavraInicialHorizontal) palavras.add(c.palavraInicialHorizontal);
        if (c.palavraInicialVertical) palavras.add(c.palavraInicialVertical);
      });
    });
    return Array.from(palavras);
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
          dicasEstaticas[palavra] = `${dicaOriginal} (Dica: Começa com a letra ${palavra[0]})`;
        });
        setDicasSalvas(prev => ({ ...prev, ...dicasEstaticas }));
        setDica('Prontuários carregados! Clique num número para começar.');
        setJogoIniciado(true);
        return; 
      }
      
      setDica(`Consultando a IA (Nível ${nivelAtual})...`);
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const prompt = `Você é um gerador de dicas de palavras cruzadas para estudantes de medicina. Crie uma dica para CADA palavra da lista abaixo. REGRAS OBRIGATÓRIAS: 1. MÁXIMO de 15 palavras por dica. 2. É ESTRITAMENTE PROIBIDO usar a própria palavra ou seus radicais na dica. 3. Foque em correlação clínica, função ou sintoma. Retorne APENAS um objeto JSON válido, onde a chave é a palavra exata e o valor é a dica. Lista: ${palavrasDoTabuleiro.join(', ')}`;

      try {
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const dados = await resposta.json();
        let textoResposta = dados.candidates[0].content.parts[0].text;
        textoResposta = textoResposta.replace(/```json/gi, '').replace(/```/g, '').trim();
        const dicasGeradas = JSON.parse(textoResposta);
        setDicasSalvas(prev => ({ ...prev, ...dicasGeradas }));
        setDica('Dicas clínicas prontas! Clique num número para começar.');
        setJogoIniciado(true); 
      } catch (erro) {
        setDica("Clique no número de uma palavra para ver a dica.");
        setJogoIniciado(true); 
      }
    };
    preCarregarDicasEmLote();
  }, [palavrasDoTabuleiro, nivelAtual, jogoIniciado, mapaDicasBasicas]);

  const gerarDica = async (termo) => {
    if (dicasSalvas[termo]) {
      setDica(dicasSalvas[termo]); return; 
    }
    if (nivelAtual <= 2) {
       let dicaOriginal = mapaDicasBasicas[termo] || "Encontre esta estrutura.";
       dicaOriginal = aplicarCensura(dicaOriginal, termo);
       const dicaFormatada = `${dicaOriginal} (Dica: Começa com a letra ${termo[0]})`;
       setDica(dicaFormatada);
       setDicasSalvas(prev => ({ ...prev, [termo]: dicaFormatada }));
       return;
    }
    setDica(`Consultando a IA (Nível ${nivelAtual})...`);
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;; 
    const prompt = `Você é um gerador de dicas para estudantes de medicina. O termo é [${termo}]. Escreva uma dica clínica objetiva com NO MÁXIMO 15 palavras. É ESTRITAMENTE PROIBIDO usar a palavra '${termo}' ou seus radicais.`;
    try {
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const dados = await resposta.json();
        const novaDica = dados.candidates[0].content.parts[0].text;
        setDica(novaDica);
        setDicasSalvas(prev => ({ ...prev, [termo]: novaDica }));
    } catch (erro) {
        setDica("Ops! Ocorreu um erro de ligação com a IA.");
    }
  };

  const autoCompletarNivel = () => {
    const todosOsValoresCorretos = {};
    gradePronta.forEach(linha => linha.forEach(celula => {
        if (!celula.vazia && celula.letraCerta !== ' ') todosOsValoresCorretos[`${celula.linha}-${celula.coluna}`] = celula.letraCerta;
    }));
    setValores(todosOsValoresCorretos);
  };

  useEffect(() => {
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

      const calcularE_SalvarXP = async () => {
        if (meuUid && dadosUsuario) {
          let numLetras = 0; let numPalavras = 0; let tamanhoMaiorPalavra = 0;
          gradePronta.forEach(linha => linha.forEach(c => {
              if (!c.vazia && c.letraCerta !== ' ') numLetras++;
              if (c.numero) numPalavras++;
              if (c.palavraInicialHorizontal && c.palavraInicialHorizontal.length > tamanhoMaiorPalavra) tamanhoMaiorPalavra = c.palavraInicialHorizontal.length;
              if (c.palavraInicialVertical && c.palavraInicialVertical.length > tamanhoMaiorPalavra) tamanhoMaiorPalavra = c.palavraInicialVertical.length;
          }));

          let xpFinalDaFase = 0;
          if (xpAtualSubtopico === 0) {
            setRelatorioXP({ isTutorial: true }); xpFinalDaFase = 1;
          } else {
            const xpBase = (numLetras * 2) + (numPalavras * 10);
            const multNivel = 1 + ((nivelAtual - 1) * 0.1); 
            const tempoIdeal = numPalavras * 15; 
            let multTempo = 1.0;
            if (tempoDecorrido <= tempoIdeal * 0.25) multTempo = 2.0; 
            else if (tempoDecorrido <= tempoIdeal * 0.5) multTempo = 1.5; 
            else if (tempoDecorrido <= tempoIdeal) multTempo = 1.2; 
            xpFinalDaFase = Math.floor(xpBase * multNivel * multTempo);
            setRelatorioXP({ ganho: xpFinalDaFase, base: xpBase, multNivel: multNivel.toFixed(1), multTempo: multTempo.toFixed(1) });
          }

          // 🔥 LÓGICA DO CARTÃO FIDELIDADE (1 Ticket a cada 2 Cruzadinhas)
          const medidorAntigo = dadosUsuario.medidorTicketsCruzadinha || 0;
          let novoMedidor = medidorAntigo + 1;
          let ticketGanhoPartida = 0;

          if (novoMedidor >= 2) {
            novoMedidor = 0;
            ticketGanhoPartida = 1;
          }

          setProgressoTicket({
            atual: ticketGanhoPartida > 0 ? 2 : novoMedidor, // Se ganhou, mostra o cartão cheio (2/2)
            ganhou: ticketGanhoPartida > 0
          });

          // LÓGICA DE MISSÕES DIÁRIAS
          const missoesAtuais = Array.isArray(dadosUsuario.missoesDiarias) ? dadosUsuario.missoesDiarias : (dadosUsuario.missoesDiarias?.missoes || []);
          let xpMissaoBonus = 0;
          let ticketMissaoBonus = 0;

          const missoesAtualizadas = missoesAtuais.map(missao => {
            if (missao.concluida) return missao;
            
            let novoProgresso = missao.progresso || 0;
            if (missao.id === 'jogar_cruzadinha') novoProgresso += 1;
            if (missao.id === 'acertar_palavras') novoProgresso += numPalavras;
            
            if (novoProgresso >= missao.meta) {
               novoProgresso = missao.meta;
               xpMissaoBonus += missao.recompensaXP || 0;
               ticketMissaoBonus += missao.recompensaTicket || 0;
            }
            return { ...missao, progresso: novoProgresso, concluida: novoProgresso >= missao.meta };
          });

          const statsAntigas = dadosUsuario.estatisticas?.[chaveXP] || { partidas: 0, tempo: 0, letras: 0 };
          const recordeTempo = statsAntigas.melhorTempo ? Math.min(statsAntigas.melhorTempo, tempoDecorrido) : tempoDecorrido;
          const novasStatsLocal = { partidas: statsAntigas.partidas + 1, tempo: statsAntigas.tempo + tempoDecorrido, letras: statsAntigas.letras + numLetras, melhorTempo: recordeTempo };
          const hoje = new Date().toISOString().split('T')[0];
          const statsGerais = dadosUsuario.estatisticasGerais || { streakAtual: 0, maiorStreak: 0, ultimoDia: '', diasSeguidos: 0, errosTotais: 0, maiorPalavra: 0, historico: [] };

          let novosDiasSeguidos = statsGerais.diasSeguidos;
          if (statsGerais.ultimoDia !== hoje) {
            const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (statsGerais.ultimoDia === ontem) novosDiasSeguidos += 1;
            else novosDiasSeguidos = 1; 
          }

          const novaStreak = statsGerais.streakAtual + 1;
          const novaMaiorStreak = Math.max(statsGerais.maiorStreak || 0, novaStreak);
          const novaMaiorPalavra = Math.max(statsGerais.maiorPalavra || 0, tamanhoMaiorPalavra);
          const novosErrosTotais = (statsGerais.errosTotais || 0) + errosNaPartida;
          const novoHistorico = [...(statsGerais.historico || []), { data: hoje, materia: subMateria, tempo: tempoDecorrido, erros: errosNaPartida, letrasCorretas: numLetras }].slice(-30);
          const novasStatsGerais = { streakAtual: novaStreak, maiorStreak: novaMaiorStreak, ultimoDia: hoje, diasSeguidos: novosDiasSeguidos, errosTotais: novosErrosTotais, maiorPalavra: novaMaiorPalavra, historico: novoHistorico };

          let oldSomaNiveis = 0;
          Object.keys(dadosUsuario.xpTopicos || {}).forEach(k => {
            const xpM = dadosUsuario.xpTopicos[k];
            if (xpM > 0) oldSomaNiveis += Math.floor(Math.sqrt(xpM / 1000)) + 1;
          });
          
          const newSubXP = xpAtualSubtopico + xpFinalDaFase;
          const newSubLevel = Math.floor(Math.sqrt(newSubXP / 1000)) + 1;
          const oldSubLevel = xpAtualSubtopico === 0 ? 0 : Math.floor(Math.sqrt(xpAtualSubtopico / 1000)) + 1;
          
          let newSomaNiveis = 0;
          const novosTopicosSimulados = { ...(dadosUsuario.xpTopicos || {}), [chaveXP]: newSubXP };
          Object.keys(novosTopicosSimulados).forEach(k => {
            const xpM = novosTopicosSimulados[k];
            if (xpM > 0) newSomaNiveis += Math.floor(Math.sqrt(xpM / 1000)) + 1;
          });

          const oldPatente = getPatente(oldSomaNiveis);
          const newPatente = getPatente(newSomaNiveis);

          let alertasNivel = [];
          if (newPatente.titulo !== oldPatente.titulo && oldSomaNiveis > 0) alertasNivel.push({ isPromocao: true, nome: 'PROMOÇÃO DE CARREIRA', antigo: oldPatente.titulo, novo: newPatente.titulo, icone: '🌟', cor: newPatente.cor });
          else if (newSomaNiveis > oldSomaNiveis && oldSomaNiveis > 0) alertasNivel.push({ nome: 'Nível Global', antigo: oldSomaNiveis, novo: newSomaNiveis, icone: '🌍' });
          if (newSubLevel > oldSubLevel && oldSubLevel > 0) alertasNivel.push({ nome: subMateria, antigo: oldSubLevel, novo: newSubLevel, icone: '⭐' });
          
          if (alertasNivel.length > 0) {
            setLevelUps(alertasNivel);
            setTimeout(() => setLevelUps([]), 8000); 
          }

          const xpGlobalAntigo = dadosUsuario.pontuacaoTotal || 0;
          const novoXPGlobal = xpGlobalAntigo + xpFinalDaFase + xpMissaoBonus; 
          
          // 🔥 Soma os tickets das missões + 1 ticket (se o cartão fidelidade encheu)
          const novosTickets = (dadosUsuario.tickets || 0) + ticketMissaoBonus + ticketGanhoPartida; 

          try {
            await updateDoc(doc(db, "usuarios", meuUid), { 
              pontuacaoTotal: novoXPGlobal, 
              tickets: novosTickets,
              medidorTicketsCruzadinha: novoMedidor, // Guarda o progresso do cartão fidelidade
              [`xpTopicos.${chaveXP}`]: newSubXP,
              [`estatisticas.${chaveXP}`]: novasStatsLocal,
              estatisticasGerais: novasStatsGerais,
              missoesDiarias: missoesAtualizadas
            });
            setDadosUsuario(prev => ({ 
              ...prev, 
              pontuacaoTotal: novoXPGlobal, 
              tickets: novosTickets,
              medidorTicketsCruzadinha: novoMedidor,
              xpTopicos: { ...prev.xpTopicos, [chaveXP]: newSubXP },
              estatisticas: { ...prev.estatisticas, [chaveXP]: novasStatsLocal },
              estatisticasGerais: novasStatsGerais, 
              missoesDiarias: missoesAtualizadas
            }));
          } catch (error) { console.error("Erro ao guardar os dados:", error); }
        }
      };
      calcularE_SalvarXP();
    } else if (!todasCertas && vitoria) {
      setVitoria(false); cadeadoRecompensa.current = false; 
    }
  }, [valores, gradePronta, vitoria, usuario, dadosUsuario, setDadosUsuario, nivelAtual, tempoDecorrido, chaveXP, xpAtualSubtopico, materia, subMateria, materiaBlindada, errosNaPartida, meuUid]);

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

  const handleFocus = (celula) => {
    let novaDirecao = direcaoAtual;
    if (celula.pertenceHorizontal && celula.pertenceVertical) {
      if (direcaoAtual === 'horizontal' && celula.pertenceHorizontal) novaDirecao = 'horizontal';
      else if (direcaoAtual === 'vertical' && celula.pertenceVertical) novaDirecao = 'vertical';
      else novaDirecao = 'horizontal';
    } else if (celula.pertenceHorizontal) novaDirecao = 'horizontal';
    else if (celula.pertenceVertical) novaDirecao = 'vertical';
    
    setDirecaoAtual(novaDirecao);
    atualizarDestaqueVisual(celula.linha, celula.coluna, novaDirecao);

    const idDaPalavra = novaDirecao === 'horizontal' ? celula.idHorizontal : celula.idVertical;
    let palavraDaDica = null;
    gradePronta.forEach(linha => {
      linha.forEach(c => {
        if (novaDirecao === 'horizontal' && c.idHorizontal === idDaPalavra && c.inicioHorizontal) palavraDaDica = c.palavraInicialHorizontal;
        if (novaDirecao === 'vertical' && c.idVertical === idDaPalavra && c.inicioVertical) palavraDaDica = c.palavraInicialVertical;
      });
    });
    if (palavraDaDica) gerarDica(palavraDaDica);
  };

  const handleClick = (celula) => {
    if (celula.pertenceHorizontal && celula.pertenceVertical) {
      const direcaoInvertida = direcaoAtual === 'horizontal' ? 'vertical' : 'horizontal';
      setDirecaoAtual(direcaoInvertida);
      atualizarDestaqueVisual(celula.linha, celula.coluna, direcaoInvertida);
      const idDaPalavra = direcaoInvertida === 'horizontal' ? celula.idHorizontal : celula.idVertical;
      let palavraDaDica = null;
      gradePronta.forEach(linha => {
        linha.forEach(c => {
          if (direcaoInvertida === 'horizontal' && c.idHorizontal === idDaPalavra && c.inicioHorizontal) palavraDaDica = c.palavraInicialHorizontal;
          if (direcaoInvertida === 'vertical' && c.idVertical === idDaPalavra && c.inicioVertical) palavraDaDica = c.palavraInicialVertical;
        });
      });
      if (palavraDaDica) gerarDica(palavraDaDica);
    }
  };

  const handleInput = (e, l, c) => {
    const val = e.target.value.toUpperCase();
    const letraCorretaDaCelula = gradePronta[l][c].letraCerta.toUpperCase();
    if (val !== '' && val !== letraCorretaDaCelula) setErrosNaPartida(prev => prev + 1);

    setValores(prev => ({ ...prev, [`${l}-${c}`]: val })); 
    
    if (val !== '') {
      let nextL = l; let nextC = c;
      while (true) {
        if (direcaoAtual === 'vertical') nextL++; else nextC++;
        const linhaDaMatriz = gradePronta[nextL];
        if (!linhaDaMatriz) break; 
        const proximaCelula = linhaDaMatriz[nextC];
        if (!proximaCelula || proximaCelula.vazia) break; 
        const idDaProxima = direcaoAtual === 'horizontal' ? proximaCelula.idHorizontal : proximaCelula.idVertical;
        const idDaAtual = direcaoAtual === 'horizontal' ? gradePronta[l][c].idHorizontal : gradePronta[l][c].idVertical;
        if (idDaProxima !== idDaAtual) break; 
        if (proximaCelula.letraCerta === ' ') continue;
        const inputFuturo = document.getElementById(`input-${nextL}-${nextC}`);
        if (inputFuturo) { inputFuturo.focus(); break; }
      }
    }
  };

  const handleKeyDown = (e, l, c) => {
    if (e.key === 'Backspace' && !valores[`${l}-${c}`]) {
      let prevL = l; let prevC = c;
      while (true) {
        if (direcaoAtual === 'vertical') prevL--; else prevC--;
        const linhaDaMatriz = gradePronta[prevL];
        if (!linhaDaMatriz) break;
        const celulaAnterior = linhaDaMatriz[prevC];
        if (!celulaAnterior || celulaAnterior.vazia) break;
        const idDaAnterior = direcaoAtual === 'horizontal' ? celulaAnterior.idHorizontal : celulaAnterior.idVertical;
        const idDaAtual = direcaoAtual === 'horizontal' ? gradePronta[l][c].idHorizontal : gradePronta[l][c].idVertical;
        if (idDaAnterior !== idDaAtual) break;
        if (celulaAnterior.letraCerta === ' ') continue;
        document.getElementById(`input-${prevL}-${prevC}`)?.focus(); break;
      }
    }
  };

  const avancarParaProximoNivel = () => {
    setValores({}); setVitoria(false); setJogoIniciado(false); setCelulasDestacadas([]); 
    cadeadoRecompensa.current = false; setLevelUps([]); 
    setDicasSalvas({}); setTempoDecorrido(0); setErrosNaPartida(0); setRelatorioXP(null);
    setProgressoTicket(null);
    setDica('A IA está a preparar o seu plantão... 🧠');
    setChaveRecarregamento(prev => prev + 1); 
  };

  return (
    <div className="h-screen bg-[#0B1120] text-white font-sans relative overflow-hidden flex flex-col selection:bg-cyan-500/30">
      <style>{`@keyframes slideInUpLeft { 0% { transform: translateX(-100%) scale(0.8); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }`}</style>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,#0B1120_100%)]" />

      {levelUps.length > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '40px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 99999 }}>
          {levelUps.map((lu, idx) => {
            if (lu.isPromocao) {
              return (
                <div key={idx} style={{ backgroundColor: '#fffbeb', padding: '25px 35px', borderRadius: '20px', boxShadow: `0 15px 35px ${lu.cor}50`, display: 'flex', alignItems: 'center', gap: '25px', animation: 'slideInUpLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards', borderLeft: `8px solid ${lu.cor}`, borderRight: `8px solid ${lu.cor}` }}>
                  <div style={{ fontSize: '4.5rem' }}>{lu.icone}</div> 
                  <div style={{ paddingRight: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.8rem', color: lu.cor, marginBottom: '8px', textTransform: 'uppercase' }}>Nova Patente Alcançada!</div>
                    <div style={{ fontSize: '1.4rem', color: '#334155' }}>De <span style={{color: '#94a3b8', textDecoration: 'line-through'}}>{lu.antigo}</span> ➔ <span style={{color: lu.cor, fontWeight: 'bold', fontSize: '1.8rem'}}>{lu.novo}</span></div>
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} style={{ backgroundColor: '#1e293b', padding: '25px 35px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '25px', animation: 'slideInUpLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards', borderLeft: '8px solid #fbbf24' }}>
                <div style={{ fontSize: '3.8rem' }}>{lu.icone}</div> 
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.6rem', color: '#fbbf24', marginBottom: '8px' }}>Nível Aumentado!</div>
                  <div style={{ fontSize: '1.3rem', color: '#f8fafc' }}>{lu.nome}: <span style={{color: '#94a3b8', textDecoration: 'line-through'}}>{lu.antigo}</span> ➔ <span style={{color: '#2ed573', fontWeight: 'bold', fontSize: '1.6rem'}}>{lu.novo}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HEADER 100% FIEL AO FIGMA (E ANABOLIZADO) */}
      <header className="h-20 bg-[#1e293b]/50 border-b border-white/[0.05] backdrop-blur-md flex items-center justify-between px-8 relative z-10 shrink-0 shadow-sm">
        <button onClick={() => setTelaAtual('topicos')} className="flex items-center gap-2.5 text-slate-400 hover:text-rose-400 transition-colors text-sm font-bold">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Abandonar Plantão</span>
        </button>

        <div className="flex items-center gap-10">
          <div className="flex flex-col items-center">
            <span className="text-cyan-400 text-xs uppercase tracking-widest mb-1.5 font-bold">Nível {nivelAtual}</span>
            <div className="w-36 h-2 bg-[#0F172A] rounded-full overflow-hidden border border-white/[0.05]" title={`${xpProgressoNesteNivel} / ${xpNecessarioParaUpar} XP`}>
              <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${porcentagemBarra}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#0F172A] px-5 py-2 rounded-full border border-white/[0.05] shadow-inner">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-white text-lg tracking-wider font-bold">{formatarTempo(tempoDecorrido)}</span>
          </div>
        </div>

        <button onClick={autoCompletarNivel} disabled={!jogoIniciado} className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#151F32] border border-white/[0.1] px-5 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
          <span className="hidden md:inline">Pular Caso</span>
          <FastForward className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-row min-h-0 relative z-10">
        
        <div className="w-[340px] shrink-0 border-r border-white/[0.05] flex flex-col p-5 bg-[#0f172a]/50">
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="bg-[#1e293b]/80 border border-cyan-500/20 rounded-2xl p-5 flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-cyan-400 text-sm tracking-wide">🩺 Dica do Caso Clínico</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <p className="text-white text-sm leading-relaxed mb-4">"{dica}"</p>
              <div className="pt-3 border-t border-white/[0.05]">
                <p className="text-slate-400 text-xs leading-relaxed">{materia} • {subMateria}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05]">
              <span className="text-[9px] uppercase tracking-widest text-slate-600">Gerado por IA</span>
              <span className="bg-[#0F172A] border border-white/[0.05] text-cyan-400 text-[10px] px-2 py-0.5 rounded-full">
                {celulasDestacadas.length > 0 ? `${celulasDestacadas.length} Letras` : 'Selecione'}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="p-5 rounded-2xl bg-[#1e293b]/20 border border-white/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.3)] w-full h-full relative overflow-hidden">
            <Tabuleiro gradePronta={gradePronta} limites={limites} valores={valores} celulasDestacadas={celulasDestacadas} bloqueado={vitoria || !jogoIniciado} handleInput={handleInput} handleKeyDown={handleKeyDown} handleFocus={handleFocus} handleClick={handleClick} />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {vitoria && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-lg">
            {relatorioXP?.isTutorial ? (
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md rounded-3xl p-8 text-center relative overflow-hidden bg-[#1e293b] border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
                <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none bg-amber-500/20" />
                <h3 className="text-2xl font-bold text-amber-400 mb-6 relative z-10">🎓 Como Funciona o XP?</h3>
                <div className="text-slate-300 text-sm text-left flex flex-col gap-3 relative z-10 mb-6">
                  <p><strong>1. Base:</strong> Letras e palavras desvendadas.</p>
                  <p><strong>2. Bónus Tempo:</strong> Terminar rápido multiplica até <strong>2x</strong>!</p>
                  <p><strong>3. Bónus Nível:</strong> O seu Nível aumenta o multiplicador.</p>
                  <div className="mt-2 p-3 bg-[#0F172A] rounded-xl border-l-4 border-cyan-500 text-cyan-400 text-xs italic">A partir da sua próxima partida, os pontos serão contabilizados!</div>
                </div>
                <button onClick={avancarParaProximoNivel} className="w-full bg-cyan-600 hover:bg-cyan-500 text-[#0B1120] py-3 rounded-xl transition-all relative z-10 text-sm font-bold">Entendido, vamos jogar! ➔</button>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="w-full max-w-md rounded-3xl p-8 text-center relative overflow-hidden bg-[#0f1f18] border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none bg-emerald-500/30" />

                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-emerald-500/10 border border-emerald-500/50 relative z-10">
                  <Trophy className="w-8 h-8 text-emerald-400" />
                </div>

                <h2 className="text-2xl text-emerald-400 mb-1 relative z-10 font-bold">Plantão Concluído! 🎉</h2>
                <p className="text-slate-400 text-sm mb-6 relative z-10">Todas as palavras foram preenchidas corretamente.</p>

                <div className="flex justify-center gap-3 mb-6 relative z-10">
                  <div className="bg-[#0B1120] border border-emerald-500/20 px-5 py-3 rounded-xl flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-lg font-bold">+{relatorioXP?.ganho || 0} XP</span>
                  </div>
                </div>

                {/* 🔥 CARTÃO FIDELIDADE ADICIONADO AQUI 🔥 */}
                {progressoTicket && (
                  <div className="bg-[#0B1120] border border-orange-500/20 p-4 rounded-xl mb-6 relative overflow-hidden shadow-inner">
                    {progressoTicket.ganhou && (
                      <motion.div animate={{ opacity: [0, 0.15, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-orange-500 pointer-events-none" />
                    )}
                    <div className="flex justify-between items-center mb-2 relative z-10">
                      <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">Cartão Fidelidade</span>
                      <span className="text-orange-400 font-mono text-xs font-bold">{progressoTicket.atual}/2</span>
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
                        +1 Ticket ganho! Pode ir para a UTI.
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

                <button onClick={avancarParaProximoNivel} className="w-full bg-[#1e293b] hover:bg-[#151F32] border border-white/[0.1] text-white py-3 rounded-xl transition-all relative z-10 text-sm font-bold">
                  Próximo Plantão
                </button>
                <button onClick={() => setTelaAtual('topicos')} className="w-full mt-2 bg-transparent text-slate-400 hover:text-white py-2 transition-all relative z-10 text-xs font-bold">
                  Sair
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}