import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Activity, Thermometer, Droplets, HeartPulse, Send, Zap, Target, Skull, Loader2, Bug, Clock, LogOut, ClipboardList, Users, Scale } from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// --- Monitor de ECG Animado Realista ---
function MonitorVital({ bpm }) {
  const controls = useAnimation();
  let corSinal = "#22c55e"; 
  let statusTexto = "ESTÁVEL";

  if (bpm > 100 || bpm < 60) { corSinal = "#eab308"; statusTexto = "ALERTA"; }
  if (bpm > 140 || bpm < 40) { corSinal = "#ef4444"; statusTexto = "CRÍTICO"; }
  if (bpm === 0) { corSinal = "#ef4444"; statusTexto = "FLATLINE"; }

  useEffect(() => {
    let isMounted = true;
    const animateEcg = async () => {
      while (isMounted) {
        if (bpm <= 0) {
          await controls.start({ d: "M 0 12 L 40 12", transition: { duration: 1, ease: "linear" } });
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
  const startTime = useRef(Date.now()); // Para medir o tempo da partida
  
  const [chat, setChat] = useState([]);
  const [inputText, setInputText] = useState("");
  const [gameState, setGameState] = useState('loading'); 
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(tempoModo === 'ranqueado' ? 600 : null);
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [estatisticasSalvas, setEstatisticasSalvas] = useState(false); // Trava de segurança para não salvar dobrado
  
  const [patientInfo, setPatientInfo] = useState({ nome: 'Gerando...', idade: '--', sexo: 'N/I', resumo: 'Aguardando ambulância...', qp: 'Aguardando queixa...', tags: [] });
  const [vitais, setVitais] = useState({ fc: '--', pa: '--', spo2: '--', temp: '--', fr: '--' });
  const [diagnosticoCorreto, setDiagnosticoCorreto] = useState('');
  
  const [satisfacao, setSatisfacao] = useState(100);
  const [opcoesTaticas, setOpcoesTaticas] = useState({ exames: [], tratamentos: [], diagnosticos: [] });
  const [menuAtivo, setMenuAtivo] = useState(null);
  const [primeiroTurno, setPrimeiroTurno] = useState(true);
  
  const [equipeReuniao, setEquipeReuniao] = useState([]); 
  const [showReuniao, setShowReuniao] = useState(false);

  const [showProcesso, setShowProcesso] = useState(false);
  const [dicaRedencao, setDicaRedencao] = useState("O paciente decide te dar mais uma chance, não desperdice.");

  const getEmojiSatisfacao = (val) => {
    if (val >= 80) return '😁';
    if (val >= 50) return '😐';
    if (val >= 20) return '😠';
    return '🤬';
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, isAiThinking, menuAtivo]);

  // 🔥 FASE 4: O MOTOR DE TELEMETRIA
  const registrarFimDeJogo = (resultado, motivoDerrota = null, teveProcesso = false) => {
    if (!dadosUsuario || estatisticasSalvas) return;
    setEstatisticasSalvas(true);

    const tempoGastoSegundos = Math.floor((Date.now() - startTime.current) / 1000);
    const stats = dadosUsuario.estatisticas || {
      partidas_ganhas: 0,
      partidas_perdidas: 0,
      mortes_por_erro: 0,
      mortes_por_tempo: 0,
      processos_judiciais: 0,
      especialidades: {},
      medicos_recrutados: {},
      tempo_total_jogado: 0, 
    };

    if (resultado === 'vitoria') stats.partidas_ganhas += 1;
    else if (resultado === 'derrota') {
      stats.partidas_perdidas += 1;
      if (motivoDerrota === 'tempo') stats.mortes_por_tempo += 1;
      if (motivoDerrota === 'erro') stats.mortes_por_erro += 1;
    }

    if (teveProcesso) stats.processos_judiciais += 1;

    const esp = casoPreCarregado.especialidade || 'Geral';
    stats.especialidades[esp] = (stats.especialidades[esp] || 0) + 1;

    equipe.forEach(docId => {
      stats.medicos_recrutados[docId] = (stats.medicos_recrutados[docId] || 0) + 1;
    });

    stats.tempo_total_jogado += tempoGastoSegundos;

    // Injeta os dados consolidados no Firebase através da sua função prop!
    salvarDadosUsuario({
      ...dadosUsuario,
      pontuacaoTotal: (dadosUsuario.pontuacaoTotal || 0) + (resultado === 'vitoria' ? 1000 : 100),
      estatisticas: stats
    });
  };

  const chamarIA = async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const generationConfig = { temperature: 0.2, responseMimeType: "application/json" };
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
      const v = casoPreCarregado.vitais || {};
      const objVitais = Array.isArray(v) ? v[0] : v; 
      setVitais({
        fc: objVitais?.fc || objVitais?.FC || objVitais?.Fc || '--',
        pa: objVitais?.pa || objVitais?.PA || objVitais?.Pa || '--',
        spo2: objVitais?.spo2 || objVitais?.SPO2 || objVitais?.SpO2 || '--',
        temp: objVitais?.temp || objVitais?.TEMP || objVitais?.Temp || '--',
        fr: objVitais?.fr || objVitais?.FR || objVitais?.Fr || '--'
      });
      setDiagnosticoCorreto(casoPreCarregado.diagnostico || 'Erro Desconhecido');
      setChat([
        { id: 1, sender: 'system', text: `Entrada: ${casoPreCarregado.linha1}` }, 
        { id: 2, sender: 'system', text: `Queixa: "${casoPreCarregado.qp}"` }
      ]);
      setGameState('playing');
      startTime.current = Date.now(); // Reinicia o cronômetro analítico
    }
  }, [casoPreCarregado]);

  useEffect(() => {
    if (!showBriefing && gameState === 'playing' && dificuldade === 'residente' && primeiroTurno) {
      setPrimeiroTurno(false);
      handleAcao("O jogador acabou de entrar na sala e avaliou o quadro inicial. Gere o primeiro pacote de opções de exames, tratamentos e diagnósticos baseados no quadro atual.", true);
    }
  }, [showBriefing, gameState, dificuldade, primeiroTurno]);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === null || showBriefing) return;
    if (timeLeft <= 0 && !estatisticasSalvas) {
      registrarFimDeJogo('derrota', 'tempo');
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: 'TEMPO ESGOTADO. Parada cardíaca irreversível.' }]);
      setGameState('lost');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, showBriefing, estatisticasSalvas]);

  useEffect(() => {
    if (satisfacao <= 0 && gameState === 'playing' && !showProcesso) {
      setShowProcesso(true);
    }
  }, [satisfacao, gameState, showProcesso]);

  const handleProcessoDesistir = () => {
    registrarFimDeJogo('derrota', 'erro', true);
    setShowProcesso(false);
    setGameState('lost');
    setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: 'O paciente assinou a alta a pedido. Óbito a caminho do outro hospital. Processo Judicial registrado.' }]);
  };

  const handleProcessoDesculpar = () => {
    setShowProcesso(false);
    setSatisfacao(50);
    setChat(prev => [
      ...prev,
      { id: Date.now(), sender: 'player', text: "Respire fundo. Peço imensas desculpas pela minha conduta. O nosso foco é salvar a sua vida. O que mais o senhor não nos contou?" },
      { id: Date.now() + 1, sender: 'ai', text: `O paciente acalma-se e murmura: "${dicaRedencao}"` }
    ]);
  };

  const handleAcao = async (textoAcao, isInvisible = false) => {
    if (!textoAcao || gameState !== 'playing' || isAiThinking || showBriefing) return;
    
    setInputText("");
    if (!isInvisible) setChat(prev => [...prev, { id: Date.now(), sender: 'player', text: textoAcao }]);
    setIsAiThinking(true);

    const historico = chat.map(m => `${m.sender}: ${m.text}`).join('\n');
    const equipeDetalhes = equipe.map(id => `${id} (${DOCTOR_MAP[id]?.name || id})`).join(', ');

    const promptTurno = `---
ROLE & MISSION
---
Você é o Motor de Simulação Médica do jogo Caça-Med. 
Sua missão é gerar um PACOTÃO DE DADOS (JSON) contendo a narrativa implícita, os vitais, e opções estratégicas para o próximo turno.

GABARITO OCULTO:
- Doença Real: ${diagnosticoCorreto}
- Exame Ouro: ${casoPreCarregado?.gabarito?.exame_ouro || 'Indisponível'}
- Tratamento Salvador: ${casoPreCarregado?.gabarito?.tratamento_salvador?.join(', ') || 'N/A'}
- Tratamentos Letais: ${casoPreCarregado?.gabarito?.tratamento_letal?.join(', ') || 'N/A'}

ESTADO ATUAL DO PACIENTE:
- FC: ${vitais.fc} | PA: ${vitais.pa} | SpO2: ${vitais.spo2}% | Temp: ${vitais.temp}°C | FR: ${vitais.fr}
- Satisfação Atual: ${satisfacao}% (0 a 100)
- Histórico:
${historico}

AÇÃO DO JOGADOR AGORA: "${textoAcao}"

REGRAS:
1. "status_paciente": Analise a ação, mude os vitais com base na biologia, e AJUSTE FORTEMENTE a satisfação (desça se for ignorado/erro, suba se for cuidado/acerto). NUNCA diga se o jogador errou ou acertou, apenas descreva os sintomas (ex: "O paciente começa a suar frio...").
   - GERE A "dica_redencao": Uma frase onde o paciente confessa um segredo crucial que ajuda a matar a charada da doença real.
2. "opcoes_jogador": Você DEVE gerar exatamente 4 "exames", 4 "tratamentos" e 4 "diagnosticos". Coloque um emoji de emoção no início de cada frase (ex: [😐] Pedir Raio-X).
3. "reuniao_equipe": Crie palpites da equipe médica disponível: ${equipeDetalhes}.
   - ELES PODEM BLOQUEAR OPÇÕES ABSURDAS. Se na lista que você criou houver uma ação letal, a equipe deve vetar essa opção listando o ÍNDICE dela (0 a 3) nos arrays correspondentes.
4. "estado_jogo": "jogando", "vitoria" ou "derrota".

FORMATO JSON OBRIGATÓRIO:
{
  "status_paciente": {
    "narrativa_clinica": "A dor aumenta e a respiração fica sibilante...",
    "satisfacao": 60,
    "novos_vitais": { "fc": 115, "pa": "90x60", "spo2": 91, "temp": 37.0, "fr": 26 },
    "dica_redencao": "Doutor, eu esqueci de falar que antes de desmaiar eu comi um camarão..."
  },
  "opcoes_jogador": {
    "exames": ["[🩸] Hemograma", "[🩻] Raio-X de Tórax", "[🔬] Endoscopia", "[🧠] Tomografia"],
    "tratamentos": ["[💊] Administrar AAS", "[💉] Adrenalina IM", "[😡] Engula o choro", "[🚑] Intubação imediata"],
    "diagnosticos": ["[💡] Infarto Agudo", "[💡] Choque Anafilático", "[💡] Crise de Pânico", "[💡] Refluxo"]
  },
  "reuniao_equipe": [
    { 
      "id": "house", 
      "fala": "Adrenalina agora? O coração dele não vai aguentar. E pare com essa ideia de Intubação.",
      "exames_bloqueados": [],
      "tratamentos_bloqueados": [1, 3],
      "diagnosticos_bloqueados": []
    }
  ],
  "estado_jogo": "jogando"
}`;

    const res = await chamarIA(promptTurno);
    setIsAiThinking(false);

    if (!res) {
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: '⚠️ Falha no Link Neural com a equipe. Tente novamente.' }]);
      return;
    }

    try {
      let limpo = res.replace(/```json/gi, '').replace(/```/g, '').trim();
      const dadosIA = JSON.parse(limpo);

      if (dadosIA.status_paciente) {
        const { novos_vitais: nv, satisfacao: sat, narrativa_clinica, dica_redencao } = dadosIA.status_paciente;
        
        if (nv) {
          const vIA = Array.isArray(nv) ? nv[0] : nv;
          const getV = (k1, k2, k3, current) => {
            if (vIA[k1] !== undefined && vIA[k1] !== null) return vIA[k1];
            if (vIA[k2] !== undefined && vIA[k2] !== null) return vIA[k2];
            if (vIA[k3] !== undefined && vIA[k3] !== null) return vIA[k3];
            return current;
          };
          setVitais(prev => ({ 
            fc: getV('fc', 'FC', 'Fc', prev.fc),
            pa: getV('pa', 'PA', 'Pa', prev.pa),
            spo2: getV('spo2', 'SPO2', 'SpO2', prev.spo2),
            temp: getV('temp', 'TEMP', 'Temp', prev.temp),
            fr: getV('fr', 'FR', 'Fr', prev.fr)
          }));
        }

        if (sat !== undefined) setSatisfacao(sat);
        if (dica_redencao) setDicaRedencao(dica_redencao);
        
        if (narrativa_clinica && !isInvisible) {
          setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: narrativa_clinica }]);
        } else if (narrativa_clinica && isInvisible) {
          setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: "O paciente o aguarda. Analise os vitais e tome uma decisão." }]);
        }
      }

      if (dadosIA.opcoes_jogador) setOpcoesTaticas(dadosIA.opcoes_jogador);
      if (dadosIA.reuniao_equipe) setEquipeReuniao(dadosIA.reuniao_equipe);

      if (dadosIA.estado_jogo === 'vitoria') {
        registrarFimDeJogo('vitoria');
        setChat(prev => [...prev, { id: Date.now()+2, sender: 'system', text: 'Sinais vitais estabilizados. Alta programada.' }]);
        setGameState('won');
      } else if (dadosIA.estado_jogo === 'derrota') {
        registrarFimDeJogo('derrota', 'erro');
        setChat(prev => [...prev, { id: Date.now()+2, sender: 'system', text: 'Óbito registrado.' }]);
        setGameState('lost');
        setVitais(prev => ({ ...prev, fc: 0, pa: '0x0', spo2: 0 })); 
      }

    } catch (err) {
      console.error("Erro no JSON da IA:", err, res);
      setChat(prev => [...prev, { id: Date.now(), sender: 'system', text: '⚠️ O preceptor ficou confuso com a resposta. Escolha novamente.' }]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAcao(inputText.trim());
  };

  const bpmReal = gameState === 'lost' ? 0 : (parseInt(vitais.fc) || 0);

  const isOptionBlocked = (categoria, idx) => {
    let bloqueado = false;
    let bloqueador = null;
    let corBloqueador = null;
    if (equipeReuniao && equipeReuniao.length > 0) {
      equipeReuniao.forEach(medico => {
        const arrBloqueios = medico[`${categoria}_bloqueados`] || [];
        if (arrBloqueios.includes(idx)) {
          bloqueado = true;
          bloqueador = DOCTOR_MAP[medico.id]?.name || 'Equipe';
          corBloqueador = DOCTOR_MAP[medico.id]?.color || '#ef4444';
        }
      });
    }
    return { bloqueado, bloqueador, corBloqueador };
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans flex flex-col md:flex-row overflow-x-hidden relative">
      
      <AnimatePresence>
        {showProcesso && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full p-8 rounded-3xl bg-[#1a0f14] border border-rose-500 shadow-[0_20px_60px_rgba(244,63,94,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-rose-600/20 blur-[40px] rounded-full pointer-events-none" />
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30">
                <Scale className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 text-center tracking-tight">PACIENTE EM FÚRIA</h2>
              <p className="text-rose-200/80 text-sm mb-8 text-center leading-relaxed">
                A sua conduta irresponsável fez com que a paciência da família chegasse ao limite. O paciente está exigindo a transferência e ameaça <strong>processar o hospital por negligência médica</strong>.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleProcessoDesculpar} 
                  className="w-full py-4 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 font-bold transition-colors border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)] text-sm flex items-center justify-center gap-2"
                >
                  Engolir o Orgulho e Pedir Desculpas
                </button>
                <button 
                  onClick={handleProcessoDesistir} 
                  className="w-full py-3 rounded-xl bg-transparent text-slate-500 hover:text-rose-500 font-bold transition-all text-xs uppercase tracking-widest"
                >
                  Assinar Transferência e Desistir do Caso
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReuniao && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[65] flex items-center justify-center p-4 md:p-8 bg-[#0B1120]/90 backdrop-blur-md">
            <motion.div initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-3xl bg-[#151F32] rounded-3xl border border-cyan-500/30 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/[0.05] bg-[#0F172A] flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Reunião Clínica</h2>
                    <p className="text-xs text-cyan-500 uppercase tracking-widest font-bold">Conselho Médico em Andamento</p>
                  </div>
                </div>
                <button onClick={() => setShowReuniao(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">Voltar ao Paciente</button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipeReuniao && equipeReuniao.length > 0 ? (
                  equipeReuniao.map((medico, index) => {
                    const docInfo = DOCTOR_MAP[medico.id] || DOCTOR_MAP['house'];
                    return (
                      <div key={index} className="bg-[#0B1120] p-5 rounded-xl border-l-4 shadow-lg relative" style={{ borderColor: docInfo.color }}>
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundColor: docInfo.color, filter: 'blur(40px)' }} />
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{docInfo.emoji}</span>
                          <div><span className="block font-bold text-white text-sm">{docInfo.name}</span><span className="block text-[10px] uppercase font-bold" style={{ color: docInfo.color }}>{docInfo.specialty}</span></div>
                        </div>
                        <p className="text-slate-300 text-sm italic leading-relaxed">"{medico.fala}"</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-10 text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 opacity-50" /><p className="text-sm font-bold uppercase tracking-widest">A equipe está analisando os dados...</p></div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBriefing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-[#0B1120]/85 backdrop-blur-md">
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", damping: 25, stiffness: 120 }} className="relative w-full max-w-lg bg-[#151F32] rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.8),_0_0_0_1px_rgba(255,255,255,0.05)] pt-10 pb-8 px-8 text-slate-300 font-sans border-t-4 border-cyan-500/40">
              <div className="absolute top-6 right-8 rotate-[15deg] pointer-events-none"><div className="border-[3px] border-rose-500/40 text-rose-500/50 px-3 py-0.5 rounded text-lg font-black tracking-widest uppercase">Urgência</div></div>
              <div className="border-b-[1.5px] border-white/[0.05] pb-4 mb-5 flex items-end justify-between">
                <div><h2 className="text-xl font-black uppercase tracking-tight text-white leading-none">CAÇA-MED Hospital</h2><p className="text-[9px] font-bold text-cyan-500/70 uppercase tracking-[0.2em] mt-1.5">Ficha de Admissão — Leito 04</p></div>
                <ClipboardList className="w-6 h-6 text-slate-500 mb-1" />
              </div>
              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2 border-b border-white/[0.05] pb-1"><span className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Nome do Paciente</span><span className="font-bold text-sm text-slate-200 truncate block">{patientInfo.nome}</span></div>
                  <div className="border-b border-white/[0.05] pb-1"><span className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Idade</span><span className="font-bold text-sm text-slate-200">{patientInfo.idade}</span></div>
                  <div className="border-b border-white/[0.05] pb-1"><span className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Sexo</span><span className="font-bold text-sm text-slate-200">{patientInfo.sexo}</span></div>
                </div>
                <div className="bg-[#0B1120]/40 p-3 rounded-md border border-white/[0.02]"><span className="block text-[9px] uppercase font-bold text-cyan-500/70 mb-1 tracking-widest">Queixa Principal (QP)</span><p className="text-sm font-semibold italic text-slate-300">"{patientInfo.qp}"</p></div>
                <div><span className="block text-[9px] uppercase font-bold text-cyan-500/70 mb-1.5 tracking-widest border-b border-white/[0.05] pb-1">História da Moléstia Atual (HMA)</span><p className="text-sm leading-relaxed text-justify text-slate-400 font-medium mt-2">{patientInfo.resumo}</p></div>
                <div className="pt-2"><span className="block text-[9px] uppercase font-bold text-cyan-500/70 mb-2 tracking-widest border-b border-white/[0.05] pb-1">Sinais Vitais de Triagem</span>
                  <div className="flex justify-between items-center bg-[#0B1120] text-white rounded-md p-3 shadow-inner border border-white/[0.02]">
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">PA</span><span className="font-mono text-sm font-bold">{vitais.pa}</span></div><div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">FC</span><span className="font-mono text-sm font-bold text-rose-400">{vitais.fc}</span></div><div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">FR</span><span className="font-mono text-sm font-bold text-cyan-400">{vitais.fr}</span></div><div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">SpO2</span><span className="font-mono text-sm font-bold text-blue-400">{vitais.spo2}%</span></div><div className="w-px h-6 bg-slate-800"></div>
                    <div className="text-center"><span className="text-slate-500 text-[8px] uppercase block mb-0.5">Temp</span><span className="font-mono text-sm font-bold text-amber-400">{vitais.temp}°C</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center border-t border-white/[0.05] pt-5">
                <button onClick={() => setShowBriefing(false)} className="w-full bg-cyan-600/10 hover:bg-rose-600 text-cyan-400 hover:text-white border border-cyan-500/20 hover:border-rose-500 px-6 py-3.5 rounded-md font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 group">
                  <Activity className="w-4 h-4 text-cyan-500/60 group-hover:text-white transition-colors" /> Assumir Plantão
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className={`w-full md:w-[320px] lg:w-[380px] bg-[#0f172a] border-r border-white/[0.05] flex flex-col md:h-screen sticky top-0 z-20 shadow-2xl transition-all duration-700 ${showBriefing ? 'blur-sm grayscale opacity-50' : ''}`}>
        <div className="p-5 border-b border-white/[0.05] bg-[#0B1120] relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${gameState === 'lost' ? 'bg-slate-600' : 'bg-red-500'}`} />
              <span className="text-white text-[10px] uppercase tracking-widest">UTI — Leito 04</span>
            </div>
            {tempoModo === 'ranqueado' && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold shadow-lg border ${timeLeft <= 60 ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
              </div>
            )}
          </div>
          
          <h2 className="text-xl text-white font-bold mb-3 flex items-center gap-3">
            {patientInfo.nome}
            <div className={`flex items-center justify-center bg-[#151F32] border border-white/[0.1] rounded-full w-8 h-8 shadow-inner transition-all ${satisfacao <= 20 ? 'animate-pulse border-rose-500 bg-rose-500/20' : ''}`} title={`Satisfação: ${satisfacao}%`}>
              <span className="text-lg leading-none">{getEmojiSatisfacao(satisfacao)}</span>
            </div>
          </h2>
          
          <div className="flex flex-wrap gap-2 items-start">
            <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">IDADE: {patientInfo.idade}</div>
            {patientInfo.tags.map((tag, idx) => (
              <div key={idx} className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                <AlertTriangle className="w-2.5 h-2.5" /> {tag.substring(0, 20)}
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

      <main className={`flex-1 flex flex-col relative bg-[#0B1120] transition-all duration-700 ${showBriefing ? 'blur-md opacity-30' : ''}`}>
        
        <button 
          onClick={() => {
            if (gameState === 'playing' && !estatisticasSalvas) registrarFimDeJogo('derrota', 'erro');
            setShowExitModal(true);
          }} 
          disabled={showBriefing || showProcesso} 
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
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-40">
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
                        <span className="text-cyan-400 text-[9px] md:text-[10px] uppercase tracking-wider font-bold mb-1 block flex items-center gap-1.5"><Activity className="w-3 h-3" /> Preceptor Clínico</span>
                        <p className="leading-relaxed text-xs md:text-sm whitespace-pre-line">{msg.text}</p>
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
              
              {dificuldade === 'residente' && !menuAtivo && !showBriefing && !showProcesso && (
                <div className="max-w-4xl mx-auto flex justify-end mb-3">
                  <button 
                    onClick={() => setShowReuniao(true)}
                    disabled={gameState !== 'playing' || isAiThinking || primeiroTurno}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] disabled:opacity-50"
                  >
                    <Users className="w-4 h-4" /> Reunião Clínica
                  </button>
                </div>
              )}

              {dificuldade === 'formado' ? (
                <form onSubmit={handleFormSubmit} className="flex gap-3 max-w-4xl mx-auto w-full">
                  <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} disabled={gameState !== 'playing' || isAiThinking || showBriefing || showProcesso} placeholder="Formado: Digite a conduta, exame ou diagnóstico..." className="flex-1 bg-[#151F32] border border-white/[0.1] rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all text-sm shadow-inner" />
                  <button type="submit" disabled={!inputText.trim() || gameState !== 'playing' || isAiThinking || showBriefing || showProcesso} className="bg-cyan-500 text-black px-6 md:px-8 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" /> <span className="hidden sm:inline">Emitir Ordem</span></button>
                </form>
              ) : (
                <div className="max-w-4xl mx-auto w-full">
                  {!menuAtivo ? (
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setMenuAtivo('exames')} disabled={gameState !== 'playing' || isAiThinking || showBriefing || primeiroTurno || showProcesso} className="bg-[#151F32] border border-cyan-500/20 text-cyan-400 p-4 rounded-xl font-bold hover:bg-cyan-900/30 hover:border-cyan-400 transition-all flex flex-col items-center gap-2 disabled:opacity-50 shadow-md"><Activity className="w-6 h-6 mb-1 opacity-80" /> Exames</button>
                      <button onClick={() => setMenuAtivo('tratamentos')} disabled={gameState !== 'playing' || isAiThinking || showBriefing || primeiroTurno || showProcesso} className="bg-[#151F32] border border-rose-500/20 text-rose-400 p-4 rounded-xl font-bold hover:bg-rose-900/30 hover:border-rose-400 transition-all flex flex-col items-center gap-2 disabled:opacity-50 shadow-md"><Droplets className="w-6 h-6 mb-1 opacity-80" /> Tratamento</button>
                      <button onClick={() => setMenuAtivo('diagnosticos')} disabled={gameState !== 'playing' || isAiThinking || showBriefing || primeiroTurno || showProcesso} className="bg-[#151F32] border border-emerald-500/20 text-emerald-400 p-4 rounded-xl font-bold hover:bg-emerald-900/30 hover:border-emerald-400 transition-all flex flex-col items-center gap-2 disabled:opacity-50 shadow-md"><Target className="w-6 h-6 mb-1 opacity-80" /> Diagnóstico</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">Selecione um {menuAtivo} <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /></span>
                        <button onClick={() => setMenuAtivo(null)} className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded bg-[#151F32] border border-white/[0.05] transition-colors">← Voltar aos Botões</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {opcoesTaticas[menuAtivo]?.map((opcao, idx) => {
                          const { bloqueado, bloqueador, corBloqueador } = isOptionBlocked(menuAtivo, idx);
                          return (
                            <button 
                              key={idx} 
                              onClick={() => { handleAcao(`Eu decido: ${opcao}`); setMenuAtivo(null); }}
                              disabled={isAiThinking || bloqueado || showProcesso}
                              className={`p-3 md:p-4 rounded-lg text-left text-xs md:text-sm transition-all shadow-md group flex flex-col gap-1.5 leading-relaxed border ${
                                bloqueado ? 'bg-black/40 border-rose-900/30 text-slate-600 cursor-not-allowed opacity-60' : 'bg-[#151F32] hover:bg-[#1e293b] border-white/[0.05] hover:border-cyan-500/40 text-slate-200'
                              }`}
                            >
                              <span className={bloqueado ? 'line-through decoration-rose-500/50' : ''}>{opcao}</span>
                              {bloqueado && (
                                <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: corBloqueador }}><AlertTriangle className="w-3 h-3" /> Vetado por {bloqueador}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
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
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-inner"><AlertTriangle className="w-8 h-8 text-rose-500" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">Abandonar Plantão?</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Se você sair agora, o paciente ficará desassistido e <strong className="text-rose-400">você perderá o Ticket</strong> utilizado. Tem certeza?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowExitModal(false)} className="flex-1 py-3.5 rounded-xl bg-[#0B1120] text-white font-bold hover:bg-slate-800 transition-colors border border-white/[0.05] text-sm">Ficar na UTI</button>
                <button onClick={() => setTelaAtual('menu')} className="flex-1 py-3.5 rounded-xl bg-rose-600/20 text-rose-500 font-bold hover:bg-rose-600 hover:text-white transition-all border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] text-sm">Sim, Abandonar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(gameState === 'won' || gameState === 'lost') && !showProcesso && (
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