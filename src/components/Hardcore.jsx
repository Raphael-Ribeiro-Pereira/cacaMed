import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Activity, Thermometer, Droplets, Send, Zap, Target, Skull, Loader2, LogOut, FileWarning, Scale } from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { gerarCasoIatrogeniaHardcore } from '../services/geradorCasos';

// --- Monitor de ECG Animado Realista ---
function MonitorVital({ bpm }) {
  const controls = useAnimation();

  let corSinal = "#22c55e";
  let statusTexto = "ESTÁVEL";

  if (bpm > 100 || bpm < 60) { corSinal = "#eab308"; statusTexto = "ALERTA"; }
  if (bpm > 140 || bpm < 40) { corSinal = "#ef4444"; statusTexto = "CRÍTICO"; }
  if (bpm === 0 || isNaN(bpm)) { corSinal = "#ef4444"; statusTexto = "FLATLINE"; }

  useEffect(() => {
    let isMounted = true;
    const flatPath = `M 0 12 L 8 12 L 10 12 L 12 12 L 15 12 L 18 12 L 21 12 L 25 12 L 28 12 L 40 12`;

    const animateEcg = async () => {
      try {
        while (isMounted) {
          if (bpm <= 0 || isNaN(bpm)) {
            await controls.start({ d: flatPath, transition: { duration: 1, ease: "linear" } });
            await new Promise(r => setTimeout(r, 100));
            continue;
          }

          const tempoCiclo = 60 / bpm;
          const tempoBatimento = Math.min(0.2, tempoCiclo * 0.4);
          const tempoDescanso = Math.max(0.1, tempoCiclo - tempoBatimento);

          const topY = Math.random() * -10 + 2;
          const botY = Math.random() * 5 + 18;

          const beatPath = `M 0 12 L 8 12 L 10 10 L 12 12 L 15 ${topY} L 18 ${botY} L 21 12 L 25 10 L 28 12 L 40 12`;

          if (!isMounted) break;
          await controls.start({ d: beatPath, transition: { duration: tempoBatimento, ease: "easeOut" } });

          if (!isMounted) break;
          await controls.start({ d: flatPath, transition: { duration: tempoDescanso, ease: "linear" } });
        }
      } catch (error) { }
    };

    animateEcg();
    return () => { isMounted = false; controls.stop(); };
  }, [bpm, controls]);

  return (
    <div className="bg-[#0B1120] border border-rose-500/20 p-4 rounded-2xl flex flex-col justify-center shadow-inner relative overflow-hidden h-28 w-full shrink-0 mb-3">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 transition-colors duration-1000" style={{ backgroundColor: corSinal }}></div>
      <div className="flex justify-between w-full mb-1 z-10">
        <span className="text-rose-500/50 font-bold text-xs tracking-widest uppercase">FC (BPM)</span>
        <span className="text-[10px] font-black uppercase tracking-widest transition-colors duration-1000" style={{ color: corSinal }}>{statusTexto}</span>
      </div>
      <div className="flex items-end gap-4 w-full z-10 flex-1">
        <motion.span key={bpm} initial={{ scale: 1.1, color: '#fff' }} animate={{ scale: 1, color: corSinal }} className="text-4xl font-black font-mono leading-none tracking-tighter w-16">{bpm}</motion.span>
        <div className="flex-1 h-12 relative flex items-center">
          <svg viewBox="0 0 40 24" className="w-full h-full transition-colors duration-1000" style={{ color: corSinal, filter: `drop-shadow(0 0 8px ${corSinal}80)` }} preserveAspectRatio="none">
            <motion.path stroke="currentColor" strokeWidth="1.5" fill="none" animate={controls} initial={{ d: "M 0 12 L 40 12" }} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Hardcore({ setTelaAtual, dadosUsuario, salvarDadosUsuario }) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const chatEndRef = useRef(null);
  const startTime = useRef(Date.now());

  const [chat, setChat] = useState([]);
  const [inputText, setInputText] = useState("");
  const [gameState, setGameState] = useState('loading'); // 'loading', 'playing', 'won', 'lost'
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 MINUTOS CRAVADOS

  const [showExitModal, setShowExitModal] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showRelatorioForense, setShowRelatorioForense] = useState(false);
  const [estatisticasSalvas, setEstatisticasSalvas] = useState(false);

  const [patientInfo, setPatientInfo] = useState({ nome: 'Gerando...', idade: '--', sexo: 'N/I', resumo: 'Aguardando ambulância...', qp: 'Aguardando queixa...', tags: [] });
  const [vitais, setVitais] = useState({ fc: '--', pa: '--', spo2: '--', temp: '--', fr: '--' });

  // Segredos do Caso Hardcore
  const [diagnosticoReal, setDiagnosticoReal] = useState('');
  const [erroMedico, setErroMedico] = useState('');
  const [condutaSalvadora, setCondutaSalvadora] = useState('');
  const [ator, setAtor] = useState('Paciente'); // Quem está falando (Paciente ou Familiar)

  // Respostas do Relatório Forense
  const [palpiteErro, setPalpiteErro] = useState("");
  const [palpiteDiagnostico, setPalpiteDiagnostico] = useState("");

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, isAiThinking]);

  // 🔥 MOTOR DE TELEMETRIA (VACINADO CONTRA NaN)
  const registrarFimDeJogo = (resultado, motivoDerrota = null, teveProcesso = false) => {
    if (!dadosUsuario || estatisticasSalvas) return;
    setEstatisticasSalvas(true);

    const tempoGastoSegundos = Math.floor((Date.now() - startTime.current) / 1000);
    const stats = { ...(dadosUsuario.estatisticas || {}) };

    stats.partidas_ganhas = Number(stats.partidas_ganhas) || 0;
    stats.partidas_perdidas = Number(stats.partidas_perdidas) || 0;
    stats.mortes_por_erro = Number(stats.mortes_por_erro) || 0;
    stats.mortes_por_tempo = Number(stats.mortes_por_tempo) || 0;
    stats.processos_judiciais = Number(stats.processos_judiciais) || 0;
    stats.tempo_total_jogado = Number(stats.tempo_total_jogado) || 0;
    stats.especialidades = stats.especialidades || {};

    stats.especialidades['Emergência Hardcore'] = (stats.especialidades['Emergência Hardcore'] || 0) + 1;

    if (resultado === 'vitoria') stats.partidas_ganhas += 1;
    else if (resultado === 'derrota') {
      stats.partidas_perdidas += 1;
      if (motivoDerrota === 'tempo') stats.mortes_por_tempo += 1;
      if (motivoDerrota === 'erro') stats.mortes_por_erro += 1;
    }

    if (teveProcesso) stats.processos_judiciais += 1;
    stats.tempo_total_jogado += tempoGastoSegundos;

    const xpGanho = resultado === 'vitoria' ? 2000 : 200;

    salvarDadosUsuario({
      ...dadosUsuario,
      pontuacaoTotal: (dadosUsuario.pontuacaoTotal || 0) + xpGanho,
      estatisticas: stats
    });
  };

  const chamarIA = async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const generationConfig = { temperature: 0.7, responseMimeType: "application/json" };
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ];

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig, safetySettings });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.error("Erro na API do Gemini:", e);
      return null;
    }
  };

  // 🔥 FASE 2: GERAÇÃO DO CASO HERANÇA MALDITA (PROMPT INICIAL)
  useEffect(() => {
    const gerarCasoHardcore = async () => {
      setGameState('loading');
      console.log("[MOTOR HARDCORE] ⚡ Solicitando caso de iatrogenia...");
      try {
        const dados = await gerarCasoIatrogeniaHardcore();
        console.log("[MOTOR HARDCORE] 📥 JSON recebido com sucesso:", dados);
        
        setPatientInfo({ 
          nome: dados.paciente.nome, 
          idade: dados.paciente.idade, 
          sexo: dados.paciente.sexo, 
          resumo: dados.relato_emergencia, 
          qp: "Colapso iminente", 
          tags: ["Iatrogenia", "Risco Imediato"] 
        });
        
        setVitais(dados.vitais_iniciais);
        setAtor(dados.ator_cena);
        setDiagnosticoReal(dados.gabarito_hardcore.doenca_base);
        setErroMedico(dados.gabarito_hardcore.erro_cometido);
        setCondutaSalvadora(dados.gabarito_hardcore.conduta_salvadora);

        setChat([
          { id: 1, sender: 'system', text: '⚠️ CÓDIGO VERMELHO: Iatrogenia Suspeita. Reverter erro imediatamente.' }, 
          { id: 2, sender: 'ai', text: `[${dados.ator_cena}]: ${dados.relato_emergencia}` }
        ]);

        setGameState('playing');
        startTime.current = Date.now();
      } catch (error) {
        console.error("[MOTOR HARDCORE] ❌ Falha Crítica na Geração:", error);
        setGameState('error');
        setChat([{ id: 1, sender: 'system', text: `Erro de conexão com a UTI. Recarregue a página.` }]);
      }
    };
    gerarCasoHardcore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (gameState !== 'playing' || showBriefing) return;
    if (timeLeft <= 0 && !estatisticasSalvas) {
      registrarFimDeJogo('derrota', 'tempo');
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: 'TEMPO ESGOTADO. Óbito irrecuperável.' }]);
      setGameState('lost');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, showBriefing, estatisticasSalvas]);

  // 🔥 FASE 2: A REAÇÃO DA IA (PROMPT DE TURNO)
  const handleAcao = async (e) => {
    e.preventDefault();
    const textoAcao = inputText.trim();
    if (!textoAcao || gameState !== 'playing' || isAiThinking || showBriefing) return;

    setInputText("");
    setChat(prev => [...prev, { id: Date.now(), sender: 'player', text: textoAcao }]);
    setIsAiThinking(true);

    const historico = chat.map(m => `${m.sender}: ${m.text}`).join('\n');

    const promptTurno = `Você é o motor Hardcore de simulação médica.
    
    CENÁRIO OCULTO: 
    - Doença Real do Paciente: [${diagnosticoReal}]
    - Erro do Médico Anterior (Causando a crise AGORA): [${erroMedico}]
    
    O jogador DEVE aplicar esta conduta exata para salvar o paciente: [ ${condutaSalvadora} ]. Se o jogador pedir exames, imagem ou fizer perguntas demoradas, defina 'estado_jogo': 'derrota' e o paciente morre por falta de tempo. Se ele aplicar a conduta salvadora, defina 'estado_jogo': 'vitoria'.

    ESTADO ATUAL:
    - Vitais: FC ${vitais.fc}, PA ${vitais.pa}, SpO2 ${vitais.spo2}, FR ${vitais.fr}.
    - Ator atual no chat: [${ator}].
    
    AÇÃO DO JOGADOR AGORA: "${textoAcao}"
    Histórico da conversa: ${historico}

    REGRAS DE CONDUTA (PBL):
    1. OBJETIVO 1 (ESTABILIZAR): O jogador DEVE primeiro reverter o erro médico (ex: dar antídoto, parar infusão, suporte de vida).
       - Se o jogador pedir exames de imagem ou laboratório demorados ANTES de estabilizar a via aérea/hemodinâmica, o paciente PIORA gravemente e o ator entra em desespero.
       - Se a ação do jogador for exatamente a conduta para reverter a Iatrogenia, defina "estabilizou_iatrogenia": true.
    
    2. OBJETIVO 2 (CURAR): Só DEPOIS de estabilizar a iatrogenia é que o jogador pode focar na Doença Real.
       - Se o jogador propuser o tratamento final correto para a Doença Real, defina "estado_jogo": "vitoria".
    
    3. PENALIDADE LETAL: Se o jogador der uma medicação que piora a doença real OU a iatrogenia atual, defina "estado_jogo": "derrota".

    4. INTERPRETAÇÃO DO ATOR: A "fala_ator" deve ser realista. Se o jogador faz perguntas simples ("tem alergias?"), responda como o familiar/paciente. Não use jargões médicos se for um leigo.

    Retorne APENAS um JSON válido neste formato:
    {
      "fala_ator": "A resposta do paciente ou familiar ao que o médico acabou de fazer ou perguntar.",
      "novos_vitais": { "fc": 130, "pa": "80x50", "spo2": 88, "temp": 36.5, "fr": 28 },
      "estabilizou_iatrogenia": false,
      "estado_jogo": "jogando" 
    }`;

    const res = await chamarIA(promptTurno);
    setIsAiThinking(false);

    if (!res) {
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: '⚠️ Falha no Link Neural.' }]);
      return;
    }

    try {
      const dadosIA = JSON.parse(res.replace(/```json/gi, '').replace(/```/g, '').trim());

      setVitais(dadosIA.novos_vitais);
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: `[${ator}]: ${dadosIA.fala_ator}` }]);

      // A mecânica de tempo extra
      if (dadosIA.estabilizou_iatrogenia) {
        setChat(prev => [...prev, { id: Date.now() + 1, sender: 'system', text: '⚡ Conduta correta! O erro médico foi revertido e os vitais estão a estabilizar. Bônus de +60 segundos.' }]);
        setTimeLeft(prev => prev + 60);
      }

      if (dadosIA.estado_jogo === 'vitoria') {
        setShowRelatorioForense(true);
      } else if (dadosIA.estado_jogo === 'derrota') {
        registrarFimDeJogo('derrota', 'erro');
        setChat(prev => [...prev, { id: Date.now() + 2, sender: 'system', text: 'Conduta letal. O paciente não resistiu à intervenção.' }]);
        setGameState('lost');
        setVitais(prev => ({ ...prev, fc: 0, pa: '0x0', spo2: 0 }));
      }

    } catch (err) {
      console.error("Erro no JSON da IA:", err);
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: '⚠️ O paciente não reagiu como esperado. Tente outra conduta.' }]);
    }
  };

  const avaliarRelatorioForense = async () => {
    setIsAiThinking(true);
    const promptAvaliacao = `GABARITO: 
     Doença: ${diagnosticoReal}
     Erro Iatrogênico: ${erroMedico}
     
     O jogador preencheu o Relatório Forense assim:
     1. Erro do colega: "${palpiteErro}"
     2. Doença Real: "${palpiteDiagnostico}"

     Avalie rigorosamente. O jogador não precisa acertar as palavras exatas, mas o CONCEITO CLÍNICO deve estar correto.
     Retorne JSON: { "aprovado": true/false, "feedback": "Explicação do porquê acertou ou errou" }`;

    const res = await chamarIA(promptAvaliacao);
    setIsAiThinking(false);

    if (res) {
      try {
        const dados = JSON.parse(res.replace(/```json/gi, '').replace(/```/g, '').trim());
        setShowRelatorioForense(false);
        if (dados.aprovado) {
          registrarFimDeJogo('vitoria');
          setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: `🏆 RELATÓRIO APROVADO: ${dados.feedback}` }]);
          setGameState('won');
        } else {
          registrarFimDeJogo('derrota', 'erro', true);
          setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: `❌ PROCESSO ÉTICO ABERTO: ${dados.feedback}` }]);
          setGameState('lost');
        }
      } catch (e) {
        console.error("Erro ao ler o relatório forense", e);
        setShowRelatorioForense(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans flex flex-col md:flex-row overflow-x-hidden relative selection:bg-rose-500/30">

      {/* Efeito de Sirene Vermelha */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.15)_0%,#050505_80%)] animate-pulse" style={{ animationDuration: '2s' }} />

      <AnimatePresence>
        {showBriefing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative w-full max-w-lg bg-[#110505] rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.4)] border border-rose-500/50 p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-rose-500/20 pb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
                <div>
                  <h2 className="text-2xl font-black text-rose-500 tracking-tighter uppercase">Herança Maldita</h2>
                  <p className="text-[10px] text-rose-400/70 uppercase tracking-widest font-bold">Código Vermelho — Erro Médico Suspeito</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-slate-300">
                <p>O médico do turno anterior cometeu um erro grave. O paciente está sofrendo os efeitos de um tratamento incorreto.</p>
                <div className="bg-rose-950/30 p-4 rounded-lg border border-rose-500/20">
                  <p className="font-mono text-rose-300"><strong>HMA Atual:</strong> {patientInfo.resumo}</p>
                </div>
                <ul className="list-disc pl-5 text-rose-400/80 font-bold text-xs space-y-1">
                  <li>Identifique e reverta a Iatrogenia primeiro.</li>
                  <li>Converse com o acompanhante para colher a história.</li>
                  <li>Você tem 3 minutos antes da falência múltipla de órgãos.</li>
                </ul>
              </div>
              {gameState === 'loading' ? (
                <div className="mt-8 relative w-full h-14 bg-rose-950/50 border border-rose-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                  {/* Barra de Progresso Falsa (Simula 4 segundos de pensamento) */}
                  <motion.div 
                    initial={{ width: "0%" }} 
                    animate={{ width: "90%" }} 
                    transition={{ duration: 4, ease: "easeOut" }} 
                    className="absolute top-0 left-0 h-full bg-rose-600/40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 z-10 text-rose-300 font-bold uppercase tracking-widest text-sm">
                    <Zap className="w-5 h-5 animate-pulse text-rose-400" />
                    Sincronizando Prontuário...
                  </div>
                </div>
              ) : gameState === 'error' ? (
                <button 
                  onClick={() => setTelaAtual('menu')} 
                  className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold h-14 rounded-xl uppercase tracking-widest transition-all"
                >
                  Falha de Conexão. Voltar.
                </button>
              ) : (
                <button 
                  onClick={() => setShowBriefing(false)} 
                  className="mt-8 w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-14 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                >
                  Assumir Caso
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRelatorioForense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg">
            <div className="max-w-lg w-full p-8 rounded-3xl bg-[#1a1a1a] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,229,255,0.1)]">
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><Scale className="w-6 h-6 text-cyan-400" /> Relatório Forense</h2>
              <p className="text-slate-400 text-xs mb-6">O paciente estabilizou. Agora, para fechar o caso sem sofrer um processo ético, aponte as causas da quase-tragédia.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-1">Qual foi o Erro do Médico Anterior?</label>
                  <input type="text" value={palpiteErro} onChange={e => setPalpiteErro(e.target.value)} className="w-full bg-[#0a0a0a] border border-rose-500/30 rounded-lg p-3 text-white text-sm outline-none focus:border-rose-500" placeholder="Ex: Deu dipirona para alérgico" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-1">Qual é o Diagnóstico Real (Doença de Base)?</label>
                  <input type="text" value={palpiteDiagnostico} onChange={e => setPalpiteDiagnostico(e.target.value)} className="w-full bg-[#0a0a0a] border border-cyan-500/30 rounded-lg p-3 text-white text-sm outline-none focus:border-cyan-500" placeholder="Ex: Dengue hemorrágica" />
                </div>
              </div>

              <button onClick={avaliarRelatorioForense} disabled={isAiThinking || !palpiteErro || !palpiteDiagnostico} className="mt-8 w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 rounded-xl uppercase tracking-widest transition-all">
                Assinar Relatório
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className={`w-full md:w-[320px] bg-[#0a0505] border-r border-rose-900/30 flex flex-col md:h-screen sticky top-0 z-20 shadow-2xl transition-all duration-700 ${showBriefing ? 'blur-sm opacity-20' : ''}`}>
        <div className="p-5 border-b border-rose-900/30 bg-[#050202] relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-rose-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 animate-pulse"><AlertTriangle className="w-3 h-3" /> CÓDIGO VERMELHO</span>
            <div className={`px-3 py-1 rounded-full font-mono text-xs font-bold border ${timeLeft <= 60 ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-rose-950 text-rose-400 border-rose-800'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <h2 className="text-xl text-white font-bold mb-1">{patientInfo.nome}</h2>
          <div className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
            ID: {patientInfo.idade} • {patientInfo.sexo}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col bg-[#050202]">
          <MonitorVital bpm={gameState === 'lost' ? 0 : (parseInt(vitais.fc) || 0)} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: 'PA (mmHg)', value: gameState === 'lost' ? '0x0' : vitais.pa, color: 'cyan', icon: Activity },
              { label: 'SpO2 (%)', value: gameState === 'lost' ? '0' : vitais.spo2, color: 'blue', icon: Droplets },
            ].map(v => (
              <div key={v.label} className="bg-[#0f0a0a] border border-rose-900/20 p-3 rounded-lg flex flex-col items-center justify-center relative shadow-inner">
                <span className={`text-slate-500 text-[8px] uppercase font-bold`}>{v.label}</span>
                <span className={`text-slate-200 text-2xl font-mono tracking-tighter ${gameState === 'lost' ? 'text-rose-500' : ''}`}>{v.value}</span>
              </div>
            ))}
            <div className="col-span-2 bg-[#0f0a0a] border border-rose-900/20 p-3 rounded-lg flex flex-col items-center justify-center shadow-inner">
              <span className="text-slate-500 text-[8px] uppercase font-bold">FR (Resp/min)</span>
              <span className="text-slate-200 text-2xl font-mono tracking-tighter">{gameState === 'lost' ? '--' : vitais.fr}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col relative transition-all duration-700 ${showBriefing ? 'blur-md opacity-20' : ''}`}>

        <button onClick={() => setShowExitModal(true)} disabled={showBriefing} className="absolute top-5 right-6 z-30 flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors">
          <LogOut className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Desistir</span>
        </button>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-40 custom-scrollbar">
          <AnimatePresence initial={false}>
            {chat.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'system' && (
                  <div className="w-full flex justify-center my-2">
                    <div className="border text-[10px] font-mono px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg bg-rose-950/30 border-rose-500/20 text-rose-400">
                      <Zap className="w-3 h-3" /> {msg.text}
                    </div>
                  </div>
                )}
                {msg.sender === 'ai' && (
                  <div className="max-w-[85%] bg-[#1a0f0f] border-l-4 border-rose-600 text-white p-4 rounded-xl rounded-tl-sm shadow-lg">
                    <span className="text-rose-500 text-[10px] uppercase tracking-wider font-bold mb-1 block">{ator}</span>
                    <p className="leading-relaxed text-sm">{msg.text}</p>
                  </div>
                )}
                {msg.sender === 'player' && (
                  <div className="max-w-[85%] bg-[#0f172a] border-r-4 border-cyan-500 text-cyan-50 p-4 rounded-xl rounded-tr-sm shadow-lg">
                    <span className="text-cyan-400 text-[10px] uppercase tracking-wider font-bold mb-1 block text-right">Dr. {dadosUsuario?.username || 'Você'}</span>
                    <p className="leading-relaxed text-sm text-right">{msg.text}</p>
                  </div>
                )}
              </motion.div>
            ))}
            {isAiThinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-[#1a0f0f] border-l-4 border-rose-600/50 p-3 rounded-xl flex gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" /><div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} /></div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-[#0a0505]/90 backdrop-blur-md border-t border-rose-900/30 sticky bottom-0 w-full">
          <form onSubmit={handleAcao} className="flex gap-3 max-w-4xl mx-auto w-full">
            <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} disabled={gameState !== 'playing' || isAiThinking || showBriefing} placeholder="Fale com o familiar ou prescreva uma conduta..." className="flex-1 bg-[#1a0f0f] border border-rose-900/50 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all text-sm placeholder:text-rose-900" />
            <button type="submit" disabled={!inputText.trim() || gameState !== 'playing' || isAiThinking} className="bg-rose-600 text-white px-8 rounded-xl font-bold hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      </main>

      {/* Exit Modal (Reused) */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="max-w-md w-full p-8 rounded-3xl bg-[#110505] border border-rose-500/50 text-center shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Fugir da Emergência?</h2>
              <p className="text-slate-400 text-sm mb-6">O paciente vai a óbito na sua ausência.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowExitModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold">Ficar</button>
                <button onClick={() => setTelaAtual('menu')} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold">Abandonar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(gameState === 'won' || gameState === 'lost') && !showRelatorioForense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`max-w-md w-full p-8 rounded-3xl text-center border ${gameState === 'won' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'}`}>
              <h2 className="text-2xl font-bold text-white mb-2">{gameState === 'won' ? 'Crise Evitada!' : 'Óbito Irreversível'}</h2>
              <p className="text-slate-300 text-sm mb-6">Doença Real: <span className="font-bold block">{diagnosticoReal}</span> Erro Médico Anterior: <span className="font-bold block">{erroMedico}</span></p>
              <button onClick={() => setTelaAtual('menu')} className="w-full py-3 bg-white text-black rounded-xl font-bold">Voltar ao Menu</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}