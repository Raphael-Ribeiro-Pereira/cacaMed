import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Activity, Thermometer, Droplets, HeartPulse, Send, Zap, Target, Skull, Loader2, Bug, Clock, LogOut, ClipboardList } from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Monitor de ECG Animado Realista ---
function MonitorVital({ bpm }) {
  const controls = useAnimation();

  let corSinal = "#22c55e"; // Verde
  let statusTexto = "ESTÁVEL";

  if (bpm > 100 || bpm < 60) {
    corSinal = "#eab308"; // Amarelo
    statusTexto = "ALERTA";
  }
  if (bpm > 140 || bpm < 40) {
    corSinal = "#ef4444"; // Vermelho
    statusTexto = "CRÍTICO";
  }
  if (bpm === 0) {
    corSinal = "#ef4444"; 
    statusTexto = "FLATLINE";
  }

  useEffect(() => {
    let isMounted = true;

    const animateEcg = async () => {
      while (isMounted) {
        if (bpm <= 0) {
          await controls.start({
            d: "M 0 12 L 40 12",
            transition: { duration: 1, ease: "linear" }
          });
          await new Promise(r => setTimeout(r, 100));
          continue;
        }

        const tempoCiclo = 60 / bpm; 
        const tempoBatimento = Math.min(0.2, tempoCiclo * 0.4); 
        const tempoDescanso = tempoCiclo - tempoBatimento;

        const topY = Math.random() * -10 + 2; 
        const botY = Math.random() * 5 + 18;  

        const beatPath = `M 0 12 L 8 12 L 10 10 L 12 12 L 15 ${topY} L 18 ${botY} L 21 12 L 25 10 L 28 12 L 40 12`;
        const flatPath = `M 0 12 L 40 12`;

        if (!isMounted) break;
        await controls.start({ d: beatPath, transition: { duration: tempoBatimento, ease: "easeOut" } });

        if (!isMounted) break;
        await controls.start({ d: flatPath, transition: { duration: tempoDescanso, ease: "linear" } });
      }
    };

    animateEcg();
    return () => { isMounted = false; };
  }, [bpm, controls]);

  return (
    <div className="bg-[#0B1120] border border-white/[0.05] p-4 rounded-2xl flex flex-col justify-center shadow-inner relative overflow-hidden h-28 w-full shrink-0 mb-3">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 transition-colors duration-1000" style={{ backgroundColor: corSinal }}></div>

      <div className="flex justify-between w-full mb-1 z-10">
        <span className="text-slate-500 font-bold text-xs tracking-widest uppercase">FC (BPM)</span>
        <span className="text-[10px] font-black uppercase tracking-widest transition-colors duration-1000" style={{ color: corSinal }}>
          {statusTexto}
        </span>
      </div>

      <div className="flex items-end gap-4 w-full z-10 flex-1">
        <motion.span
          key={bpm} 
          initial={{ scale: 1.1, color: '#fff' }}
          animate={{ scale: 1, color: corSinal }}
          className="text-4xl font-black font-mono leading-none tracking-tighter w-16"
        >
          {bpm}
        </motion.span>

        <div className="flex-1 h-12 relative flex items-center">
          <svg viewBox="0 0 40 24" className="w-full h-full transition-colors duration-1000" style={{ color: corSinal, filter: `drop-shadow(0 0 8px ${corSinal}80)` }} preserveAspectRatio="none">
            <motion.path stroke="currentColor" strokeWidth="1.5" fill="none" animate={controls} initial={{ d: "M 0 12 L 40 12" }} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Mapa de Médicos
const DOCTOR_MAP = {
  house: { emoji: '🦯', name: 'Dr. House', specialty: 'Diagnóstico Geral / Nefro', color: '#38bdf8' },
  cameron: { emoji: '🛡️', name: 'Dra. Cameron', specialty: 'Imunologia / Alergia', color: '#ec4899' },
  foreman: { emoji: '🧠', name: 'Dr. Foreman', specialty: 'Neurologia', color: '#f59e0b' },
  chase: { emoji: '🔪', name: 'Dr. Chase', specialty: 'Cirurgia / UTI / Cardio', color: '#f43f5e' },
  treze: { emoji: '🧬', name: 'Treze', specialty: 'Doenças Raras / Genética', color: '#10b981' },
  wilson: { emoji: '🎗️', name: 'Dr. Wilson', specialty: 'Oncologia', color: '#fbbf24' },
  taub: { emoji: '👁️', name: 'Dr. Taub', specialty: 'Dermatologia / Cir. Plástica', color: '#60a5fa' },
  kutner: { emoji: '⚡', name: 'Dr. Kutner', specialty: 'Trauma / Intoxicação', color: '#eab308' },
  cuddy: { emoji: '📋', name: 'Dra. Cuddy', specialty: 'Administração / Ética', color: '#a78bfa' },
};

export default function JogoDDX({ setTelaAtual, configDDX, dadosUsuario, salvarDadosUsuario }) {
  const equipe = configDDX?.equipe || ['house'];
  const dificuldade = configDDX?.dificuldade || 'residente';
  const tempoModo = configDDX?.tempo || 'casual';
  const casoPreCarregado = configDDX?.casoPreCarregado || {};
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const chatEndRef = useRef(null);
  const [chat, setChat] = useState([]);
  const [inputText, setInputText] = useState("");
  const [gameState, setGameState] = useState('loading'); 
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(tempoModo === 'ranqueado' ? 600 : null);
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  
  const [patientInfo, setPatientInfo] = useState({ nome: 'Gerando...', idade: '--', sexo: 'N/I', resumo: 'Aguardando ambulância...', qp: 'Aguardando queixa...', tags: [] });
  const [vitais, setVitais] = useState({ fc: '--', pa: '--', spo2: '--', temp: '--', fr: '--' });
  const [diagnosticoCorreto, setDiagnosticoCorreto] = useState('');
  const [opcoesResidente, setOpcoesResidente] = useState([]);

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
    if (casoPreCarregado && casoPreCarregado.linha1) {
      setPatientInfo({
        nome: casoPreCarregado.linha1.split(',')[0],
        idade: casoPreCarregado.linha1.split(',')[1] || '??',
        sexo: casoPreCarregado.sexo || 'N/I',
        resumo: casoPreCarregado.linha3,
        qp: casoPreCarregado.qp || 'Sintomas agudos inespecíficos',
        tags: casoPreCarregado.tags || []
      });
      setVitais(casoPreCarregado.vitais || { fc: 110, pa: '110x70', spo2: 94, temp: 37.8, fr: 22 });
      setDiagnosticoCorreto(casoPreCarregado.diagnostico || 'Erro Desconhecido');
      setOpcoesResidente(casoPreCarregado.opcoesIniciais || []);
      
      setChat([
        { id: 1, sender: 'system', text: `Entrada: ${casoPreCarregado.linha1}` }, 
        { id: 2, sender: 'ai', text: casoPreCarregado.linha3 }
      ]);
      setGameState('playing');
    } else {
      setPatientInfo({ nome: "Paciente Emergência", idade: "30a", sexo: 'M', resumo: "Paciente instável.", qp: "Rebaixamento de consciência", tags: ["ESTADO CRÍTICO"] });
      setVitais({ fc: 110, pa: '110x70', spo2: 94, temp: 37.8, fr: 24 });
      setChat([{ id: 1, sender: 'ai', text: "Inicie a avaliação." }]);
      setGameState('playing');
    }
  }, [casoPreCarregado]);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === null || showBriefing) return;
    if (timeLeft <= 0) {
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: 'TEMPO ESGOTADO. Parada cardíaca irreversível.' }]);
      setGameState('lost');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, showBriefing]);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 🔥 O NOVO CÉREBRO DA IA (PROMPT JSON) 🔥
  const handleAcao = async (textoAcao) => {
    if (!textoAcao || gameState !== 'playing' || isAiThinking || showBriefing) return;
    
    setInputText("");
    setChat(prev => [...prev, { id: Date.now(), sender: 'player', text: textoAcao }]);
    setIsAiThinking(true);

    const historico = chat.map(m => `${m.sender}: ${m.text}`).join('\n');
    const equipeDetalhes = equipe.map(id => `${id} (${DOCTOR_MAP[id]?.name || id} - Especialidade: ${DOCTOR_MAP[id]?.specialty || ''})`).join(', ');

    // Construção do Prompt Mestre com as Variáveis Atuais
    const promptTurno = `---
ROLE & MISSION
---
Você é o **Motor de Simulação Médica Avançada** e o **Preceptor Clínico** do jogo Caça-Med. Sua única função é simular a fisiologia de um paciente crítico e julgar friamente cada ação do jogador (médico plantonista).

PROIBIÇÕES ABSOLUTAS:
1. Nunca revele o diagnóstico oculto ou o tratamento ouro antes do jogador descobri-los.
2. Nunca invente doenças, medicamentos ou mecanismos fisiológicos que não estejam no gabarito.
3. Nunca responda em tom coloquial ou de "assistente". Seu tom é frio, técnico e implacável.

---
HIDDEN CONTEXT (O JOGO SABE, O JOGADOR NÃO)
---
GABARITO OCULTO:
- Doença real do paciente: ${diagnosticoCorreto}
- Exame ouro para confirmação: ${casoPreCarregado?.gabarito?.exame_ouro || 'Indisponível'}
- Tratamento(s) salvador(es): ${casoPreCarregado?.gabarito?.tratamento_salvador?.join(', ') || 'Tratamento de suporte'}
- Tratamento(s) letal(is): ${casoPreCarregado?.gabarito?.tratamento_letal?.join(', ') || 'Nenhum específico'}

ESTADO ATUAL DO PACIENTE:
- FC Atual: ${vitais.fc} bpm | PA Atual: ${vitais.pa} mmHg
- SpO2 Atual: ${vitais.spo2}% | Temp Atual: ${vitais.temp}°C | FR Atual: ${vitais.fr || '--'} rpm
- Histórico de Ações já realizadas neste plantão:
${historico}

EQUIPE DISPONÍVEL (ID e personalidade):
${equipeDetalhes}

---
PHYSIOLOGICAL & GAME RULES
---
Para a ação digitada pelo jogador, avalie TRÊS DIMENSÕES antes de gerar o JSON:

1. CAUSA-E-EFEITO FISIOLÓGICO E EXAMES
   - Siga a biologia real. Vasodilatadores derrubam PA. O2 melhora SpO2.
   - Se o jogador pedir um exame, forneça o laudo clínico realista compatível com a doença no campo "narrativa_sala".
   - SEMPRE justifique a mudança nos vitais com mecanismos fisiopatológicos no campo "_raciocinio_medico".

2. REGRA DE INTERRUPÇÃO DA EQUIPE
   - Se o jogador tentar uma ação abertamente letal ou grotesca, UM dos médicos da equipe DEVE intervir e cancelar a ação.
   - O paciente não morre na interrupção, mas o estresse piora levemente os vitais.

3. CRITÉRIOS DE VITÓRIA / DERROTA
   - VITÓRIA: O jogador administra o tratamento salvador E acerta o diagnóstico. Declare estado_jogo: "vitoria".
   - DERROTA: Se a conduta for imediatamente letal ou a PA chegar a 0x0 / FC a 0. Declare estado_jogo: "derrota".
   - CASO CONTRÁRIO: Mantenha estado_jogo: "jogando".

---
MANDATORY OUTPUT FORMAT (STRICT JSON ONLY)
---
NUNCA use formatação markdown como \`\`\`json. Comece sua resposta diretamente com a chave { e termine com }. Formato EXATO:
{
  "_raciocinio_medico": "Seu pensamento fisiológico interno. (Ex: Furosemida reduz a pré-carga, piorando PA em TEP).",
  "narrativa_sala": "Texto imersivo para o jogador. Se pediu exame, dê o laudo. (Ex: O monitor apita. Raio-X mostra cardiomegalia).",
  "novos_vitais": { "fc": 140, "pa": "70x40", "spo2": 88, "temp": 37.0, "fr": 28 },
  "intervencao_equipe": { "ocorreu": true, "id_medico": "house", "mensagem": "Você quer matar o paciente? Pare!" },
  "estado_jogo": "jogando"
}

Ação do jogador agora: "${textoAcao}"`;

    const res = await chamarIA(promptTurno);
    setIsAiThinking(false);

    if (!res) {
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: 'O sistema do hospital caiu (Erro de API). Tente enviar novamente.' }]);
      return;
    }

    try {
      // Peneira de Limpeza: Remove a formatação markdown se a IA ignorar a ordem
      let limpo = res.replace(/```json/gi, '').replace(/```/g, '').trim();
      const dadosIA = JSON.parse(limpo);

      // 1. Atualiza o Monitor de Sinais Vitais em Tempo Real
      if (dadosIA.novos_vitais) {
        setVitais(prev => ({ ...prev, ...dadosIA.novos_vitais }));
      }

      // 2. Coloca a Narrativa da IA no Chat
      if (dadosIA.narrativa_sala) {
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: dadosIA.narrativa_sala }]);
      }

      // 3. Verifica se Alguém da Equipe Interrompeu
      if (dadosIA.intervencao_equipe && dadosIA.intervencao_equipe.ocorreu) {
        const docId = dadosIA.intervencao_equipe.id_medico?.toLowerCase() || 'house';
        const doctor = DOCTOR_MAP[docId] || DOCTOR_MAP['house'];
        
        setChat(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'team', 
          doctorName: doctor.name, 
          emoji: doctor.emoji, 
          color: doctor.color, 
          text: dadosIA.intervencao_equipe.mensagem 
        }]);
      }

      // 4. Verifica Condição de Fim de Jogo
      if (dadosIA.estado_jogo === 'vitoria') {
        setChat(prev => [...prev, { id: Date.now()+2, sender: 'system', text: 'Sinais vitais estabilizados. Alta programada.' }]);
        setGameState('won');
        if (dadosUsuario) salvarDadosUsuario({ ...dadosUsuario, pontuacaoTotal: (dadosUsuario.pontuacaoTotal || 0) + 1000 });
      } else if (dadosIA.estado_jogo === 'derrota') {
        setChat(prev => [...prev, { id: Date.now()+2, sender: 'system', text: 'Óbito registrado.' }]);
        setGameState('lost');
        setVitais(prev => ({ ...prev, fc: 0, pa: '0x0', spo2: 0 })); // Força o Flatline!
      }

    } catch (err) {
      console.error("Erro no JSON da IA:", err, res);
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: '⚠️ Anomalia no Prontuário Eletrônico. Reformule a sua ordem.' }]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAcao(inputText.trim());
  };

  const bpmReal = gameState === 'lost' ? 0 : (parseInt(vitais.fc) || 0);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans flex flex-col md:flex-row overflow-x-hidden relative">
      
      {/* 🔥 O MODAL DA PRANCHETA (BRIEFING) DARK MODE */}
      <AnimatePresence>
        {showBriefing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, y: 20 }} 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-[#0B1120]/85 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }} 
              animate={{ y: 0, scale: 1 }} 
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="relative w-full max-w-lg bg-[#151F32] rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.8),_0_0_0_1px_rgba(255,255,255,0.05)] pt-10 pb-8 px-8 text-slate-300 font-sans border-t-4 border-cyan-500/40"
            >
              <div className="absolute top-6 right-8 rotate-[15deg] pointer-events-none">
                <div className="border-[3px] border-rose-500/40 text-rose-500/50 px-3 py-0.5 rounded text-lg font-black tracking-widest uppercase">
                  Urgência
                </div>
              </div>

              <div className="border-b-[1.5px] border-white/[0.05] pb-4 mb-5 flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none">CAÇA-MED Hospital</h2>
                  <p className="text-[9px] font-bold text-cyan-500/70 uppercase tracking-[0.2em] mt-1.5">Ficha de Admissão — Leito 04</p>
                </div>
                <ClipboardList className="w-6 h-6 text-slate-500 mb-1" />
              </div>

              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2 border-b border-white/[0.05] pb-1">
                    <span className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Nome do Paciente</span>
                    <span className="font-bold text-sm text-slate-200 truncate block">{patientInfo.nome}</span>
                  </div>
                  <div className="border-b border-white/[0.05] pb-1">
                    <span className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Idade</span>
                    <span className="font-bold text-sm text-slate-200">{patientInfo.idade}</span>
                  </div>
                  <div className="border-b border-white/[0.05] pb-1">
                    <span className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Sexo</span>
                    <span className="font-bold text-sm text-slate-200">{patientInfo.sexo}</span>
                  </div>
                </div>

                <div className="bg-[#0B1120]/40 p-3 rounded-md border border-white/[0.02]">
                  <span className="block text-[9px] uppercase font-bold text-cyan-500/70 mb-1 tracking-widest">Queixa Principal (QP)</span>
                  <p className="text-sm font-semibold italic text-slate-300">"{patientInfo.qp}"</p>
                </div>

                <div>
                  <span className="block text-[9px] uppercase font-bold text-cyan-500/70 mb-1.5 tracking-widest border-b border-white/[0.05] pb-1">História da Moléstia Atual (HMA)</span>
                  <p className="text-sm leading-relaxed text-justify text-slate-400 font-medium mt-2">
                    {patientInfo.resumo}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="block text-[9px] uppercase font-bold text-cyan-500/70 mb-2 tracking-widest border-b border-white/[0.05] pb-1">Sinais Vitais de Triagem</span>
                  <div className="flex justify-between items-center bg-[#0B1120] text-white rounded-md p-3 shadow-inner border border-white/[0.02]">
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">PA</span><span className="font-mono text-sm font-bold">{vitais.pa}</span></div>
                    <div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">FC</span><span className="font-mono text-sm font-bold text-rose-400">{vitais.fc}</span></div>
                    <div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">FR</span><span className="font-mono text-sm font-bold text-cyan-400">{vitais.fr || '--'}</span></div>
                    <div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">SpO2</span><span className="font-mono text-sm font-bold text-blue-400">{vitais.spo2}%</span></div>
                    <div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">Temp</span><span className="font-mono text-sm font-bold text-amber-400">{vitais.temp}°C</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center border-t border-white/[0.05] pt-5">
                <button 
                  onClick={() => setShowBriefing(false)} 
                  className="w-full bg-cyan-600/10 hover:bg-rose-600 text-cyan-400 hover:text-white border border-cyan-500/20 hover:border-rose-500 px-6 py-3.5 rounded-md font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 group"
                >
                  <Activity className="w-4 h-4 text-cyan-500/60 group-hover:text-white transition-colors" />
                  Assumir Plantão
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR DO JOGO */}
      <aside className={`w-full md:w-[320px] lg:w-[380px] bg-[#0f172a] border-r border-white/[0.05] flex flex-col md:h-screen sticky top-0 z-20 shadow-2xl transition-all duration-700 ${showBriefing ? 'blur-sm grayscale opacity-50' : ''}`}>
        <div className="p-5 border-b border-white/[0.05] bg-[#0B1120] relative">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${gameState === 'lost' ? 'bg-slate-600' : 'bg-red-500'}`} />
              <span className="text-white text-[10px] uppercase tracking-widest">UTI — Leito 04</span>
            </div>
            
            {tempoModo === 'ranqueado' && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold shadow-lg border ${timeLeft <= 60 ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                <Clock className="w-3.5 h-3.5" />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
          
          <h2 className="text-xl text-white font-bold mb-3">{patientInfo.nome}</h2>
          
          <div className="flex flex-wrap gap-2 items-start">
            <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
              IDADE: {patientInfo.idade}
            </div>

            {patientInfo.tags.map((tag, idx) => (
              <div key={idx} className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                <AlertTriangle className="w-2.5 h-2.5" />
                {tag.substring(0, 20)}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col bg-[#050B14]">
          <span className="text-slate-600 text-[9px] uppercase font-bold mb-2">Monitor em Tempo Real</span>
          
          <MonitorVital bpm={bpmReal} />
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: 'PA (mmHg)', value: gameState==='lost' ? '0x0' : vitais.pa, color: 'cyan', icon: Activity },
              { label: 'SpO2 (%)', value: gameState==='lost' ? '0' : vitais.spo2, color: 'blue', icon: Droplets },
            ].map(v => (
              <div key={v.label} className="bg-[#0B1120] border border-white/[0.03] p-3 rounded-lg flex flex-col items-center justify-center relative shadow-inner">
                <v.icon className={`w-3 h-3 text-${v.color}-500 absolute top-2 left-2 opacity-30`} />
                <span className={`text-${v.color}-500 text-[8px] uppercase font-bold`}>{v.label}</span>
                <span className={`text-${v.color}-400 text-2xl font-mono tracking-tighter`}>{v.value}</span>
              </div>
            ))}
            
            <div className="col-span-2 bg-[#0B1120] border border-white/[0.03] p-3 rounded-lg flex flex-col items-center justify-center relative shadow-inner">
                <Thermometer className="w-3 h-3 text-orange-500 absolute top-2 left-2 opacity-30" />
                <span className="text-orange-500 text-[8px] uppercase font-bold">Temp (°C)</span>
                <span className="text-orange-400 text-2xl font-mono tracking-tighter">{gameState==='lost' ? '--' : vitais.temp}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className={`flex-1 flex flex-col relative bg-[#0B1120] transition-all duration-700 ${showBriefing ? 'blur-md opacity-30' : ''}`}>
        
        <button 
          onClick={() => setShowExitModal(true)} 
          disabled={showBriefing}
          className="absolute top-5 right-6 z-30 flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-all bg-[#151F32]/80 backdrop-blur-md border border-white/[0.05] hover:border-rose-500/30 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
        >
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Abandonar Plantão</span>
        </button>

        {gameState === 'loading' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-cyan-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Acessando Prontuários Reais...</span>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
              <AnimatePresence initial={false}>
                {chat.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                    
                    {msg.sender === 'system' && (
                      <div className="w-full flex justify-center my-2 mt-10">
                        <div className={`border text-[10px] md:text-xs font-mono px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg ${msg.text.includes('ESGOTA') || msg.text.includes('Óbito') ? 'bg-red-950/50 border-red-500/30 text-red-400' : 'bg-[#0F172A] border-white/[0.05] text-slate-400'}`}>
                          <Zap className="w-3 h-3" /> {msg.text}
                        </div>
                      </div>
                    )}
                    
                    {msg.sender === 'ai' && (
                      <div className="max-w-[85%] md:max-w-[70%] bg-[#1e293b] border-l-4 border-cyan-500 text-white p-3 md:p-4 rounded-xl rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <span className="text-cyan-400 text-[9px] md:text-[10px] uppercase tracking-wider font-bold mb-1 block flex items-center gap-1.5">
                          <Activity className="w-3 h-3" /> Preceptor Clínico
                        </span>
                        <p className="leading-relaxed text-xs md:text-sm whitespace-pre-line">{msg.text}</p>
                      </div>
                    )}
                    
                    {msg.sender === 'team' && (
                      <div className="max-w-[85%] md:max-w-[70%] bg-[#1e293b]/80 border-l-4 text-white p-3 md:p-4 rounded-xl rounded-tl-sm shadow-xl relative overflow-hidden" style={{ borderColor: msg.color }}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: msg.color }} />
                        <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5 relative z-10" style={{ color: msg.color }}>
                          <span>{msg.emoji}</span> {msg.doctorName} (Interrompeu a Ação)
                        </span>
                        <p className="leading-relaxed text-xs md:text-sm whitespace-pre-line relative z-10">{msg.text}</p>
                      </div>
                    )}

                    {msg.sender === 'player' && (
                      <div className="max-w-[85%] md:max-w-[70%] bg-cyan-900/30 border-r-4 border-emerald-400 text-emerald-50 p-3 md:p-4 rounded-xl rounded-tr-sm backdrop-blur-sm shadow-[0_4px_20px_rgba(16,185,129,0.1)]">
                        <span className="text-emerald-400 text-[9px] md:text-[10px] uppercase tracking-wider font-bold mb-1 block text-right">Dr. {dadosUsuario?.username || 'Você'}</span>
                        <p className="leading-relaxed text-xs md:text-sm text-right">{msg.text}</p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {isAiThinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start">
                    <div className="bg-[#1e293b] border-l-4 border-cyan-500/50 p-3 rounded-xl rounded-tl-sm flex gap-2 items-center shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}/>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }}/>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-[#0B1120]/90 backdrop-blur-md border-t border-white/[0.05] sticky bottom-0 z-10 w-full">
              
              {gameState === 'playing' && !isAiThinking && dificuldade === 'formado' && (
                <button type="button" onClick={() => handleAcao(`Diagnóstico: ${diagnosticoCorreto}. Solicito tratamento padrão.`)} className="absolute -top-10 right-4 text-rose-500/40 hover:text-rose-500 transition-colors bg-[#0B1120] p-2 rounded-full border border-rose-500/20 shadow-lg"><Bug className="w-4 h-4" /></button>
              )}

              {dificuldade === 'residente' && opcoesResidente.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto w-full">
                  {opcoesResidente.map((opcao, idx) => (
                    <button 
                      key={idx} onClick={() => handleAcao(opcao)} disabled={gameState !== 'playing' || isAiThinking || showBriefing}
                      className="bg-[#151F32] hover:bg-[#1e293b] border border-white/[0.05] hover:border-cyan-500/40 text-slate-300 hover:text-white p-3 rounded-lg text-left text-xs transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <span className="pr-4">{opcao}</span>
                      <Target className="w-4 h-4 opacity-0 group-hover:opacity-100 text-cyan-400 transition-all shrink-0" />
                    </button>
                  ))}
                  <div className="sm:col-span-2 mt-1">
                    <form onSubmit={handleFormSubmit} className="flex gap-2">
                      <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} disabled={gameState !== 'playing' || isAiThinking || showBriefing} placeholder="Ou digite o diagnóstico final aqui..." className="flex-1 bg-[#151F32]/50 border border-white/[0.05] rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500 text-xs" />
                      <button type="submit" disabled={!inputText.trim() || gameState !== 'playing' || isAiThinking || showBriefing} className="bg-cyan-500/20 text-cyan-400 px-4 rounded-lg font-bold hover:bg-cyan-500 hover:text-[#0B1120] transition-all text-xs border border-cyan-500/30">Enviar</button>
                    </form>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="flex gap-3 max-w-4xl mx-auto w-full">
                  <input 
                    type="text" value={inputText} onChange={e => setInputText(e.target.value)} disabled={gameState !== 'playing' || isAiThinking || showBriefing}
                    placeholder="Solicite exames ou prescreva o tratamento..."
                    className="flex-1 bg-[#151F32] border border-white/[0.1] rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all text-sm shadow-inner"
                  />
                  <button type="submit" disabled={!inputText.trim() || gameState !== 'playing' || isAiThinking || showBriefing} className="bg-cyan-500 text-black px-6 md:px-8 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                    <Send className="w-4 h-4" /> <span className="hidden sm:inline">Emitir Ordem</span>
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {showExitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full p-8 rounded-3xl bg-[#151F32] border border-rose-500/30 text-center shadow-[0_20px_60px_rgba(244,63,94,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-rose-500/10 blur-[40px] rounded-full pointer-events-none" />
              
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-inner">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Abandonar Plantão?</h2>
              
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Se você sair agora, o paciente ficará desassistido e <strong className="text-rose-400">você perderá definitivamente o Ticket</strong> utilizado para entrar nesta sala. Tem certeza?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitModal(false)} 
                  className="flex-1 py-3.5 rounded-xl bg-[#0B1120] text-white font-bold hover:bg-slate-800 transition-colors border border-white/[0.05] text-sm"
                >
                  Ficar na UTI
                </button>
                <button 
                  onClick={() => setTelaAtual('menu')} 
                  className="flex-1 py-3.5 rounded-xl bg-rose-600/20 text-rose-500 font-bold hover:bg-rose-600 hover:text-white transition-all border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] text-sm"
                >
                  Sim, Abandonar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(gameState === 'won' || gameState === 'lost') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`max-w-md w-full p-8 rounded-3xl text-center border ${gameState === 'won' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'}`}>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                {gameState === 'won' ? <Target className="w-8 h-8 text-emerald-400" /> : <Skull className="w-8 h-8 text-rose-500" />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{gameState === 'won' ? 'Vida Salva!' : 'Paciente em Óbito'}</h2>
              <p className="text-slate-300 text-sm mb-6">O diagnóstico correto era: <span className="font-bold text-white block mt-1">{diagnosticoCorreto}</span></p>
              <button onClick={() => setTelaAtual('menu')} className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all shadow-xl">Voltar ao Menu</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}