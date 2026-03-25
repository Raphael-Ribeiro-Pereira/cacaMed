import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Activity, Thermometer, Droplets, HeartPulse, Send, Zap, Target, Skull, Loader2, Bug } from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Monitor de ECG Animado (Mantido 100%) ---
function OrganicMonitorEKG() {
  const controls = useAnimation();
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      while (isMounted) {
        const rPeak = Math.random() * -40 - 20;
        const sWave = Math.random() * 20 + 20;
        const flat = "M 0 50 L 20 50 L 30 50 L 40 50 L 45 50 L 50 50 L 60 50 L 70 50 L 80 50 L 90 50 L 100 50 L 300 50";
        const beat = `M 0 50 L 20 50 L 30 45 L 40 50 L 45 ${rPeak} L 55 ${sWave} L 60 45 L 70 50 L 80 50 L 90 50 L 100 50 L 300 50`;
        await controls.start({ d: beat, transition: { duration: 0.15, ease: "easeOut" } });
        await controls.start({ d: flat, transition: { duration: 0.25, ease: "easeInOut" } });
        await new Promise(r => setTimeout(r, Math.random() * 600 + 400));
      }
    };
    run();
    return () => { isMounted = false; };
  }, [controls]);

  return (
    <div className="w-full h-14 mb-3 border-b border-white/[0.05] overflow-hidden relative shrink-0">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to right, rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.1) 1px, transparent 1px)`, backgroundSize: '10px 10px' }} />
      <svg viewBox="0 0 200 100" className="w-full h-full text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" preserveAspectRatio="none">
        <motion.path stroke="currentColor" strokeWidth="2" fill="none" animate={controls} initial={{ d: "M 0 50 L 300 50" }} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const DOCTOR_MAP = {
  house: { emoji: '🦯', name: 'Dr. House' },
  cameron: { emoji: '🛡️', name: 'Dra. Cameron' },
  foreman: { emoji: '🧠', name: 'Dr. Foreman' },
  chase: { emoji: '🔪', name: 'Dr. Chase' },
  treze: { emoji: '🧬', name: 'Treze' },
  wilson: { emoji: '🎗️', name: 'Dr. Wilson' },
  taub: { emoji: '👁️', name: 'Dr. Taub' },
  kutner: { emoji: '⚡', name: 'Dr. Kutner' },
  cuddy: { emoji: '📋', name: 'Dra. Cuddy' },
};

export default function JogoDDX({ setTelaAtual, configDDX, dadosUsuario, salvarDadosUsuario }) {
  const equipe = configDDX?.equipe || ['house'];
  const dificuldade = configDDX?.dificuldade || 'residente';
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const chatEndRef = useRef(null);
  const [chat, setChat] = useState([]);
  const [inputText, setInputText] = useState("");
  const [gameState, setGameState] = useState('loading'); 
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [patientInfo, setPatientInfo] = useState({ nome: 'Gerando...', idade: '--', resumo: 'Aguardando ambulância...', tags: [] });
  const [vitais, setVitais] = useState({ fc: '--', pa: '--', spo2: '--', temp: '--' });
  const [diagnosticoCorreto, setDiagnosticoCorreto] = useState('');

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, isAiThinking]);

  const chamarIA = async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) { return null; }
  };

  useEffect(() => {
    const iniciarCaso = async () => {
      const promptInicial = `Aja como um preceptor médico titular. Crie um caso clínico REAL de UTI adaptado de literatura. Dificuldade: ${dificuldade}.
      Retorne APENAS um objeto JSON puro. Estrutura:
      {
        "linha1": "Nome Completo, Idade",
        "vitais": { "fc": "115", "pa": "100x60", "spo2": "92", "temp": "38.5" },
        "tags": ["ESTADO 1", "ESTADO 2"],
        "linha3": "Texto técnico curto.",
        "diagnostico": "Nome da doença"
      }`;

      const resposta = await chamarIA(promptInicial);
      
      try {
        const jsonLimpo = resposta.replace(/```json/g, '').replace(/```/g, '').trim();
        const dados = JSON.parse(jsonLimpo);

        setPatientInfo({
          nome: dados.linha1.split(',')[0],
          idade: dados.linha1.split(',')[1] || '??',
          resumo: dados.linha3,
          tags: dados.tags || []
        });
        setVitais(dados.vitais);
        setDiagnosticoCorreto(dados.diagnostico);
        setChat([{ id: 1, sender: 'system', text: `Entrada: ${dados.linha1}` }, { id: 2, sender: 'ai', text: dados.linha3 }]);
      } catch (e) {
        setPatientInfo({ nome: "Paciente Emergência", idade: "30a", resumo: "Paciente instável.", tags: ["ESTADO CRÍTICO"] });
        setVitais({ fc: '110', pa: '110x70', spo2: '94', temp: '37.8' });
        setChat([{ id: 1, sender: 'ai', text: "Inicie a avaliação." }]);
      }
      setGameState('playing');
    };
    iniciarCaso();
  }, []);

  const handleTextInput = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || gameState !== 'playing' || isAiThinking) return;
    
    const t = inputText.trim();
    setInputText("");
    setChat(prev => [...prev, { id: Date.now(), sender: 'player', text: t }]);
    setIsAiThinking(true);

    const historico = chat.map(m => `${m.sender}: ${m.text}`).join('\n');
    const promptTurno = `Diagnóstico Gabarito: ${diagnosticoCorreto}. 
    Responda exames com valores REAIS. Se o médico errar feio, use [DERROTA]. Se acertar o diagnóstico (${diagnosticoCorreto}), use [VITORIA].
    Histórico:\n${historico}\nMédico: ${t}\nPreceptor:`;

    const res = await chamarIA(promptTurno);
    setIsAiThinking(false);

    if (res.includes('[VITORIA]')) {
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: res.replace('[VITORIA]', '') }]);
      setGameState('won');
      if (dadosUsuario) salvarDadosUsuario({ ...dadosUsuario, pontuacaoTotal: (dadosUsuario.pontuacaoTotal || 0) + 1000 });
    } else if (res.includes('[DERROTA]')) {
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: res.replace('[DERROTA]', '') }]);
      setGameState('lost');
    } else {
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: res }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans flex flex-col md:flex-row overflow-x-hidden">
      
      {/* SIDEBAR: FOCO NOS AJUSTES DAS BADGES */}
      <aside className="w-full md:w-[320px] lg:w-[380px] bg-[#0f172a] border-r border-white/[0.05] flex flex-col md:h-screen sticky top-0 z-20 shadow-2xl">
        <div className="p-5 border-b border-white/[0.05] bg-[#0B1120]">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${gameState === 'lost' ? 'bg-slate-600' : 'bg-red-500'}`} />
            <span className="text-white text-[10px] uppercase tracking-widest">UTI — Leito 04</span>
          </div>
          
          <h2 className="text-xl text-white font-bold mb-3">{patientInfo.nome}</h2>
          
          {/* LAYOUT DE BADGES: Ajustado para o Design System */}
          <div className="flex flex-wrap gap-2 items-start">
            {/* BADGE IDADE: Reutilizando o componente original com cor Azul */}
            <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
              IDADE: {patientInfo.idade}
            </div>

            {/* BADGES SINTOMAS: Gêmeas da badge de idade, mas na cor Vermelha */}
            {patientInfo.tags.map((tag, idx) => (
              <div key={idx} className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                <AlertTriangle className="w-2.5 h-2.5" />
                {tag.substring(0, 20)} {/* Limite de segurança para 3 palavras aprox. */}
              </div>
            ))}
          </div>

          <p className="text-slate-500 text-xs mt-4 leading-relaxed italic opacity-80">"{patientInfo.resumo}"</p>
        </div>

        {/* RESTANTE DO MONITOR (Mantido 100%) */}
        <div className="p-4 flex-1 flex flex-col bg-[#050B14]">
          <span className="text-slate-600 text-[9px] uppercase font-bold mb-2">Monitor em Tempo Real</span>
          <OrganicMonitorEKG />
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'FC (bpm)', value: gameState==='lost' ? '0' : vitais.fc, color: 'emerald', icon: HeartPulse },
              { label: 'PA (mmHg)', value: gameState==='lost' ? '0x0' : vitais.pa, color: 'cyan', icon: Activity },
              { label: 'SpO2 (%)', value: gameState==='lost' ? '0' : vitais.spo2, color: 'blue', icon: Droplets },
              { label: 'Temp (°C)', value: gameState==='lost' ? '--' : vitais.temp, color: 'orange', icon: Thermometer },
            ].map(v => (
              <div key={v.label} className="bg-[#0B1120] border border-white/[0.03] p-3 rounded-lg flex flex-col items-center justify-center relative shadow-inner">
                <v.icon className={`w-3 h-3 text-${v.color}-500 absolute top-2 left-2 opacity-30`} />
                <span className={`text-${v.color}-500 text-[8px] uppercase font-bold`}>{v.label}</span>
                <span className={`text-${v.color}-400 text-2xl font-mono tracking-tighter`}>{v.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CHAT AREA (Mantido 100%) */}
      <main className="flex-1 flex flex-col relative bg-[#0B1120]">
        {gameState === 'loading' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-cyan-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Acessando Prontuários Reais...</span>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
              {chat.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl text-sm ${msg.sender === 'player' ? 'bg-cyan-900/30 border-r-4 border-emerald-400 text-emerald-50' : 'bg-[#1e293b] border-l-4 border-cyan-500 text-white shadow-lg'}`}>
                    <span className="text-[9px] uppercase font-bold block mb-1 opacity-50">{msg.sender === 'player' ? 'Você' : 'Preceptor'}</span>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-[#0B1120]/80 backdrop-blur-md border-t border-white/[0.05] sticky bottom-0">
              <form onSubmit={handleTextInput} className="flex gap-3 max-w-3xl mx-auto relative">
                {gameState === 'playing' && (
                  <button type="button" onClick={() => setInputText(`Diagnóstico: ${diagnosticoCorreto}`)} className="absolute -top-10 right-0 text-rose-500/40 hover:text-rose-500 transition-colors"><Bug className="w-4 h-4" /></button>
                )}
                <input 
                  type="text" value={inputText} onChange={e => setInputText(e.target.value)} 
                  disabled={gameState !== 'playing' || isAiThinking}
                  placeholder="Solicite exames ou prescreva o tratamento..."
                  className="flex-1 bg-[#151F32] border border-white/[0.1] rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all text-sm"
                />
                <button type="submit" className="bg-cyan-500 text-black px-6 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* OVERLAYS (Mantido 100%) */}
      <AnimatePresence>
        {(gameState === 'won' || gameState === 'lost') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`max-w-md w-full p-8 rounded-3xl text-center border ${gameState === 'won' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'}`}>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                {gameState === 'won' ? <Target className="w-8 h-8 text-emerald-400" /> : <Skull className="w-8 h-8 text-rose-500" />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{gameState === 'won' ? 'Vida Salva!' : 'Paciente em Óbito'}</h2>
              <p className="text-slate-300 text-sm mb-6">O diagnóstico correto era: <span className="font-bold text-white block mt-1">{diagnosticoCorreto}</span></p>
              <button onClick={() => setTelaAtual('menu')} className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all">Voltar ao Menu</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}