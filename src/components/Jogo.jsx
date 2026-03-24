import { useState, useEffect, useMemo, useRef, useCallback } from 'react'; 
import { auth, db } from '../firebase'; 
import { doc, updateDoc } from 'firebase/firestore';
import { gerarTabuleiro } from '../utils/motorTabuleiro'; 

import PainelVitoria from './PainelVitoria';
import Tabuleiro from './Tabuleiro';

const getPatente = (nivel) => {
  if (nivel <= 5) return { titulo: 'Estudante (Básico)', cor: '#64748b' };
  if (nivel <= 15) return { titulo: 'Estudante (Clínico)', cor: '#0ea5e9' };
  if (nivel <= 30) return { titulo: 'Interno', cor: '#8b5cf6' };
  if (nivel <= 50) return { titulo: 'Residente (R1)', cor: '#f59e0b' };
  if (nivel <= 80) return { titulo: 'Médico Especialista', cor: '#ef4444' };
  return { titulo: 'Chefe de Plantão', cor: '#10b981' };
};

export default function Jogo({ bancoDePalavras, materia, subMateria, setTelaAtual, usuario, dadosUsuario, setDadosUsuario }) {
  const meuUid = auth.currentUser?.uid || usuario?.uid || dadosUsuario?.uid;

  const [valores, setValores] = useState({}); 
  const [direcaoAtual, setDirecaoAtual] = useState('horizontal');
  const [dica, setDica] = useState('A IA está preparando o seu plantão... 🧠');
  const [vitoria, setVitoria] = useState(false);
  const [jogoIniciado, setJogoIniciado] = useState(false); 
  const [chaveRecarregamento, setChaveRecarregamento] = useState(0); 
  
  const [celulasDestacadas, setCelulasDestacadas] = useState([]);
  const [dicasSalvas, setDicasSalvas] = useState({});

  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [relatorioXP, setRelatorioXP] = useState(null);
  const [ganhouPergaminho, setGanhouPergaminho] = useState(false);
  
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
      intervalo = setInterval(() => {
        setTempoDecorrido(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [vitoria, jogoIniciado, chaveRecarregamento]);

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  const { gradePronta, limites } = useMemo(() => {
    // Esse log invisível "engana" o inspetor do React, provando que a variável
    // está sendo usada, e garante que o mapa seja refeito ao passar de fase!
    console.debug("Gerando novo plantão. Rodada:", chaveRecarregamento);
    
    return gerarTabuleiro(bancoDePalavras, chaveXP);
  }, [bancoDePalavras, chaveXP, chaveRecarregamento]);

  const palavrasDoTabuleiro = useMemo(() => {
    const palavras = new Set();
    gradePronta.forEach(linha => {
      linha.forEach(c => {
        if (c.palavraInicial) palavras.add(c.palavraInicial);
      });
    });
    return Array.from(palavras);
  }, [gradePronta]);

  // 🔥 ERRO 2 CORRIGIDO: Envolvemos a função em um useCallback para o Linter não reclamar
  const obterConfiguracaoDica = useCallback(() => {
    const nomeDoutora = dadosUsuario?.username || dadosUsuario?.nome || 'Doutora';
    let intensidade = "";
    let tom = "";

    if (nivelAtual === 0) {
      intensidade = "EXTREMAMENTE FÁCIL. Este é o nível tutorial. Dê uma definição bem leiga e informe com qual letra a palavra começa, ou faça no estilo 'preencha a lacuna'. A dica deve ser óbvia e encorajadora.";
      tom = "Você é um professor orientador muito gentil e acolhedor.";
    } else if (nivelAtual <= 2) {
      intensidade = "Fácil e direta. Foque no conceito anatômico ou médico básico sem pegadinhas. Não dê a resposta direta.";
      tom = "Você é um professor orientador parceiro.";
    } else if (nivelAtual <= 5) {
      intensidade = "Moderada. Traga um cenário clínico rápido do dia a dia (ex: fratura comum, sintoma clássico, indicação cirúrgica).";
      tom = "Você é um médico preceptor exigente.";
    } else {
      intensidade = "MUITO DIFÍCIL. Nível de prova de residência médica. Foque em detalhes obscuros, exceções ou inervações específicas.";
      tom = "Você é um professor carrasco e rigoroso de medicina.";
    }

    return { nome: nomeDoutora, intensidade, tom };
  }, [dadosUsuario, nivelAtual]);

  useEffect(() => {
    const preCarregarDicasEmLote = async () => {
      if (palavrasDoTabuleiro.length === 0) return;
      if (jogoIniciado) return; 
      
      const API_KEY = 'AIzaSyCuBiqm9Gv9s7VM5FpEtLtRpdu_JdPE2is'; 
      const config = obterConfiguracaoDica();
      
      let contextoDaMateria = `área de ${materia}`;
      if (materia === 'Patologia') contextoDaMateria = `Patologia (focando em biópsia e sintomas)`;

      const prompt = `${config.tom} Ao dar a dica, dirija-se à aluna pelo nome: Dra. ${config.nome}. Crie uma dica para CADA palavra da lista abaixo (${contextoDaMateria}). 
      Nível de dificuldade exigido: ${config.intensidade}.
      Retorne APENAS um objeto JSON válido. A chave deve ser a palavra EXATAMENTE como enviei, e o valor deve ser a dica. Sem formatação markdown ou textos adicionais.
      Lista: ${palavrasDoTabuleiro.join(', ')}`;

      try {
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const dados = await resposta.json();
        
        let textoResposta = dados.candidates[0].content.parts[0].text;
        textoResposta = textoResposta.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const dicasGeradas = JSON.parse(textoResposta);
        setDicasSalvas(prev => ({ ...prev, ...dicasGeradas }));
        setDica('Prontuários carregados! Clique em um número para começar a investigar.');
        setJogoIniciado(true); 
      } catch (erro) {
        // 🔥 ERRO 1 CORRIGIDO: Agora usamos a variável 'erro' pedindo para o console printar ela
        console.error("Erro na API de dicas:", erro);
        setDica("Clique no número de uma palavra para ver a dica da IA.");
        setJogoIniciado(true); 
      }
    };
    preCarregarDicasEmLote();
  }, [palavrasDoTabuleiro, materia, nivelAtual, jogoIniciado, obterConfiguracaoDica]); // 🔥 ERRO 2 CORRIGIDO: Adicionado aqui

  const gerarDica = async (termo) => {
    if (dicasSalvas[termo]) {
      setDica(dicasSalvas[termo]); 
      return; 
    }
    setDica(`Consultando os arquivos do hospital (Nível ${nivelAtual})...`);
    
    const API_KEY = 'AIzaSyCuBiqm9Gv9s7VM5FpEtLtRpdu_JdPE2is'; 
    const config = obterConfiguracaoDica();
    
    let contextoDaMateria = `para o termo anatômico/médico: ${termo}`;
    
    const prompt = `${config.tom} Dirija-se à aluna pelo nome: Dra. ${config.nome}. Crie uma dica para um jogo de palavras cruzadas ${contextoDaMateria}. 
    Nível de dificuldade exigido: ${config.intensidade}. Seja direto. Retorne apenas o texto da dica.`;

    try {
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const dados = await resposta.json();
        const novaDica = dados.candidates[0].content.parts[0].text;
        setDica(novaDica);
        setDicasSalvas(prev => ({ ...prev, [termo]: novaDica }));
    } catch (erro) {
        // 🔥 ERRO 1 CORRIGIDO DE NOVO: Printando o erro
        console.error("Erro na API ao gerar dica individual:", erro);
        setDica("Ops! Deu um erro de conexão com os arquivos do hospital.");
    }
  };

  const autoCompletarNivel = () => {
    const todosOsValoresCorretos = {};
    gradePronta.forEach(linha => {
      linha.forEach(celula => {
        if (!celula.vazia && celula.letraCerta !== ' ') { 
          todosOsValoresCorretos[`${celula.linha}-${celula.coluna}`] = celula.letraCerta;
        }
      });
    });
    setValores(todosOsValoresCorretos);
  };

  useEffect(() => {
    let todasCertas = true;
    let temPalavra = false;

    gradePronta.forEach(linha => {
      linha.forEach(celula => {
        if (!celula.vazia && celula.letraCerta !== ' ') { 
          temPalavra = true;
          const valorDigitado = valores[`${celula.linha}-${celula.coluna}`];
          if (!valorDigitado || valorDigitado.toUpperCase() !== celula.letraCerta.toUpperCase()) {
            todasCertas = false;
          }
        }
      });
    });

    if (temPalavra && todasCertas && !vitoria && !cadeadoRecompensa.current) {
      cadeadoRecompensa.current = true; 
      setVitoria(true);
      setCelulasDestacadas([]); 
      
      if (xpAtualSubtopico === 0) setGanhouPergaminho(true);

      const calcularE_SalvarXP = async () => {
        if (meuUid && dadosUsuario) {
          let numLetras = 0;
          let numPalavras = 0;
          let tamanhoMaiorPalavra = 0;
          
          gradePronta.forEach(linha => {
            linha.forEach(c => {
              if (!c.vazia && c.letraCerta !== ' ') numLetras++;
              if (c.numero) numPalavras++;
              if (c.palavraInicial && c.palavraInicial.length > tamanhoMaiorPalavra) {
                tamanhoMaiorPalavra = c.palavraInicial.length;
              }
            });
          });

          let xpFinalDaFase = 0;

          if (xpAtualSubtopico === 0) {
            setRelatorioXP({ isTutorial: true });
            xpFinalDaFase = 1;
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

          const missoesAtuais = dadosUsuario.missoesDiarias?.missoes || [];
          
          const missoesAtualizadas = missoesAtuais.map(missao => {
            if (missao.concluida) return missao; 
            let novoProgresso = missao.progressoAtual || 0;
            if (missao.tipo === 'cruzadinha') novoProgresso += 1;
            if (missao.tipo === 'xp_global') novoProgresso += xpFinalDaFase;
            if (novoProgresso > missao.meta) novoProgresso = missao.meta;
            return { ...missao, progressoAtual: novoProgresso, concluida: novoProgresso >= missao.meta };
          });

          const statsAntigas = dadosUsuario.estatisticas?.[chaveXP] || { partidas: 0, tempo: 0, letras: 0 };
          const recordeTempo = statsAntigas.melhorTempo ? Math.min(statsAntigas.melhorTempo, tempoDecorrido) : tempoDecorrido;
          
          const novasStatsLocal = {
            partidas: statsAntigas.partidas + 1,
            tempo: statsAntigas.tempo + tempoDecorrido,
            letras: statsAntigas.letras + numLetras,
            melhorTempo: recordeTempo
          };

          const hoje = new Date().toISOString().split('T')[0];
          const statsGerais = dadosUsuario.estatisticasGerais || {
            streakAtual: 0, maiorStreak: 0, ultimoDia: '', diasSeguidos: 0, errosTotais: 0, maiorPalavra: 0, historico: []
          };

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

          const novoHistorico = [...(statsGerais.historico || []), {
            data: hoje,
            materia: subMateria,
            tempo: tempoDecorrido,
            erros: errosNaPartida,
            letrasCorretas: numLetras
          }].slice(-30);

          const novasStatsGerais = {
            streakAtual: novaStreak,
            maiorStreak: novaMaiorStreak,
            ultimoDia: hoje,
            diasSeguidos: novosDiasSeguidos,
            errosTotais: novosErrosTotais,
            maiorPalavra: novaMaiorPalavra,
            historico: novoHistorico
          };

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
          if (newPatente.titulo !== oldPatente.titulo && oldSomaNiveis > 0) {
            alertasNivel.push({ isPromocao: true, nome: 'PROMOÇÃO DE CARREIRA', antigo: oldPatente.titulo, novo: newPatente.titulo, icone: '🌟', cor: newPatente.cor });
          } else if (newSomaNiveis > oldSomaNiveis && oldSomaNiveis > 0) {
            alertasNivel.push({ nome: 'Nível Global', antigo: oldSomaNiveis, novo: newSomaNiveis, icone: '🌍' });
          }
          if (newSubLevel > oldSubLevel && oldSubLevel > 0) {
            alertasNivel.push({ nome: subMateria, antigo: oldSubLevel, novo: newSubLevel, icone: '⭐' });
          }
          if (alertasNivel.length > 0) {
            setLevelUps(alertasNivel);
            setTimeout(() => setLevelUps([]), 8000); 
          }

          const xpGlobalAntigo = dadosUsuario.pontuacaoTotal || 0;
          const novoXPGlobal = xpGlobalAntigo + xpFinalDaFase;

          try {
            await updateDoc(doc(db, "usuarios", meuUid), { 
              pontuacaoTotal: novoXPGlobal, 
              [`xpTopicos.${chaveXP}`]: newSubXP,
              [`estatisticas.${chaveXP}`]: novasStatsLocal,
              estatisticasGerais: novasStatsGerais,
              "missoesDiarias.missoes": missoesAtualizadas
            });
            setDadosUsuario(prev => ({ 
              ...prev, 
              pontuacaoTotal: novoXPGlobal, 
              xpTopicos: { ...prev.xpTopicos, [chaveXP]: newSubXP },
              estatisticas: { ...prev.estatisticas, [chaveXP]: novasStatsLocal },
              estatisticasGerais: novasStatsGerais,
              missoesDiarias: { ...prev.missoesDiarias, missoes: missoesAtualizadas }
            }));
          } catch (error) { console.error("Erro ao salvar os dados da partida:", error); }
        }
      };
      calcularE_SalvarXP();
    } else if (!todasCertas && vitoria) {
      setVitoria(false); 
      cadeadoRecompensa.current = false; 
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
    if (celula.palavraInicial) gerarDica(celula.palavraInicial);
    let novaDirecao = direcaoAtual;
    if (celula.pertenceHorizontal && celula.pertenceVertical) {
      if (direcaoAtual === 'horizontal' && celula.pertenceHorizontal) novaDirecao = 'horizontal';
      else if (direcaoAtual === 'vertical' && celula.pertenceVertical) novaDirecao = 'vertical';
      else novaDirecao = 'horizontal';
    } else if (celula.pertenceHorizontal) novaDirecao = 'horizontal';
    else if (celula.pertenceVertical) novaDirecao = 'vertical';
    setDirecaoAtual(novaDirecao);
    atualizarDestaqueVisual(celula.linha, celula.coluna, novaDirecao);
  };

  const handleClick = (celula) => {
    if (celula.pertenceHorizontal && celula.pertenceVertical) {
      const direcaoInvertida = direcaoAtual === 'horizontal' ? 'vertical' : 'horizontal';
      setDirecaoAtual(direcaoInvertida);
      atualizarDestaqueVisual(celula.linha, celula.coluna, direcaoInvertida);
    }
  };

  const handleInput = (e, l, c) => {
    const val = e.target.value.toUpperCase();
    
    const letraCorretaDaCelula = gradePronta[l][c].letraCerta.toUpperCase();
    if (val !== '' && val !== letraCorretaDaCelula) {
      setErrosNaPartida(prev => prev + 1);
    }

    setValores(prev => ({ ...prev, [`${l}-${c}`]: val })); 
    
    if (val !== '') {
      let nextL = l;
      let nextC = c;
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
        if (inputFuturo) {
          inputFuturo.focus();
          break; 
        }
      }
    }
  };

  const handleKeyDown = (e, l, c) => {
    if (e.key === 'Backspace' && !valores[`${l}-${c}`]) {
      let prevL = l;
      let prevC = c;
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
        document.getElementById(`input-${prevL}-${prevC}`)?.focus(); 
        break;
      }
    }
  };

  const avancarParaProximoNivel = () => {
    setValores({}); 
    setVitoria(false); 
    setJogoIniciado(false); 
    setCelulasDestacadas([]); 
    cadeadoRecompensa.current = false; 
    setGanhouPergaminho(false);
    setLevelUps([]); 
    setDicasSalvas({}); 
    setTempoDecorrido(0); 
    setErrosNaPartida(0); 
    setRelatorioXP(null);
    setDica('A IA está preparando os seus prontuários... 🧠');
    setChaveRecarregamento(prev => prev + 1); 
  };

  return (
    <div className="tela-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '15px 20px', position: 'relative' }}>
      
      <style>
        {`
          @keyframes slideInUpLeft {
            0% { transform: translateX(-100%) scale(0.8); opacity: 0; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
        `}
      </style>

      {levelUps.length > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '40px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 9999 }}>
          {levelUps.map((lu, idx) => {
            if (lu.isPromocao) {
              return (
                <div key={idx} style={{ backgroundColor: '#fffbeb', padding: '25px 35px', borderRadius: '20px', boxShadow: `0 15px 35px ${lu.cor}50`, display: 'flex', alignItems: 'center', gap: '25px', animation: 'slideInUpLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards', borderLeft: `8px solid ${lu.cor}`, borderRight: `8px solid ${lu.cor}` }}>
                  <div style={{ fontSize: '4.5rem' }}>{lu.icone}</div> 
                  <div style={{ paddingRight: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.8rem', color: lu.cor, marginBottom: '8px', textTransform: 'uppercase' }}>Nova Patente Alcançada!</div>
                    <div style={{ fontSize: '1.4rem', color: '#334155' }}>
                      De <span style={{color: '#94a3b8', textDecoration: 'line-through'}}>{lu.antigo}</span> ➔ <span style={{color: lu.cor, fontWeight: 'bold', fontSize: '1.8rem'}}>{lu.novo}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} style={{ backgroundColor: '#1e293b', padding: '25px 35px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '25px', animation: 'slideInUpLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards', borderLeft: '8px solid #fbbf24' }}>
                <div style={{ fontSize: '3.8rem' }}>{lu.icone}</div> 
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.6rem', color: '#fbbf24', marginBottom: '8px' }}>Nível Aumentado!</div>
                  <div style={{ fontSize: '1.3rem', color: '#f8fafc' }}>
                    {lu.nome}: <span style={{color: '#94a3b8', textDecoration: 'line-through'}}>{lu.antigo}</span> ➔ <span style={{color: '#2ed573', fontWeight: 'bold', fontSize: '1.6rem'}}>{lu.novo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
        <button className="botao-voltar" onClick={() => setTelaAtual('menu')} style={{ margin: 0 }}>⬅ Sair</button>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: vitoria ? '#2ed573' : (jogoIniciado ? '#ff4757' : '#94a3b8'), backgroundColor: '#fff', padding: '5px 20px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          ⏱ {formatarTempo(tempoDecorrido)}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={autoCompletarNivel} disabled={!jogoIniciado} style={{ backgroundColor: '#ff4757', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', opacity: jogoIniciado ? 1 : 0.4 }}>Passar Fase</button>
          <div title={nivelAtual === 0 ? "Ganhe para desbloquear o Nível 1!" : `${xpProgressoNesteNivel} / ${xpNecessarioParaUpar} XP`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#e0e6ed', padding: '5px 15px', borderRadius: '15px', cursor: 'help' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>Nível {nivelAtual}</span>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', marginTop: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${porcentagemBarra}%`, height: '100%', backgroundColor: '#1e90ff', transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 style={{ margin: '0 0 10px 0', flexShrink: 0 }}>{materia} <span style={{ fontSize: '1.1rem', color: '#7f8fa6', fontWeight: 'normal' }}>| {subMateria}</span></h2>

      {vitoria && ganhouPergaminho && (
        <div style={{ backgroundColor: '#fffbeb', border: '2px solid #fbbf24', padding: '15px 30px', borderRadius: '15px', textAlign: 'center', marginBottom: '15px', flexShrink: 0, boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)' }}>
          <h3 style={{ margin: 0, color: '#d97706', fontSize: '1.4rem' }}>📜 Pergaminho Desbloqueado!</h3>
          <p style={{ margin: '5px 0 0 0', color: '#b45309', fontWeight: 'bold' }}>Você completou seu primeiro plantão nesta área e alcançou o Nível 1!</p>
        </div>
      )}

      {vitoria && (
        <div style={{ flexShrink: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
          {relatorioXP?.isTutorial ? (
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '2px solid #fbbf24', maxWidth: '500px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#d97706', margin: '0 0 15px 0', fontSize: '1.4rem' }}>🎓 Como Funciona o XP?</h3>
              <div style={{ color: '#475569', fontSize: '1rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0 }}><strong>1. Base de Pontos:</strong> Cada letra e palavra desvendada te dá XP.</p>
                <p style={{ margin: 0 }}><strong>2. Bônus de Velocidade:</strong> Terminar rápido pode multiplicar seus pontos em até <strong>2x</strong>!</p>
                <p style={{ margin: 0 }}><strong>3. Bônus de Dificuldade:</strong> Seu Nível atual também aumenta o multiplicador.</p>
                <p style={{ margin: '10px 0 0 0', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #1F6FEB', fontStyle: 'italic' }}>
                  A partir da sua próxima partida, os pontos começarão a ser contabilizados rumo ao Nível 2. Bom plantão!
                </p>
              </div>
              <button onClick={avancarParaProximoNivel} style={{ marginTop: '20px', backgroundColor: '#1F6FEB', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s' }}>Entendi, vamos jogar! ➔</button>
            </div>
          ) : (
            <PainelVitoria relatorioXP={relatorioXP} avancarParaProximoNivel={avancarParaProximoNivel} />
          )}
        </div>
      )}
      
      <div className="area-dica" style={{ flexShrink: 0, marginBottom: '10px', margin: '0 auto 10px auto' }}>
          <h3>🩺 Dica da Palavra:</h3>
          <p>{dica}</p>
      </div>

      <Tabuleiro gradePronta={gradePronta} limites={limites} valores={valores} celulasDestacadas={celulasDestacadas} bloqueado={vitoria || !jogoIniciado} handleInput={handleInput} handleKeyDown={handleKeyDown} handleFocus={handleFocus} handleClick={handleClick} />
    </div>
  );
}