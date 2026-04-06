import React, { useState, useEffect } from "react";
import {
  Activity, AlertTriangle, BarChart2, Check, HelpCircle,
  LayoutGrid, LogOut, Target, Ticket, Trophy, X, Star, BookOpen, HeartPulse
} from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
};

// --- Funções Auxiliares de Gamificação ---
const getPatente = (nivel) => {
  if (nivel <= 5) return 'Estudante Básico';
  if (nivel <= 15) return 'Estudante Clínico';
  if (nivel <= 30) return 'Interno';
  if (nivel <= 50) return 'Residente R1';
  if (nivel <= 80) return 'Médico Especialista';
  return 'Chefe de Plantão';
};

export default function MenuPrincipal ({ usuario, dadosUsuario, setTelaAtual, top3Semana = [] }) {
  const [isHardcore, setIsHardcore] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const themeHex = isHardcore ? "#F43F5E" : "#00E5FF";
  const themeClass = isHardcore ? "text-rose-500" : "text-cyan-400";
  const borderClass = isHardcore ? "border-rose-500" : "border-cyan-500";
  const bgClass = isHardcore ? "bg-rose-500" : "bg-cyan-400";
  const shadowClass = isHardcore ? "shadow-rose-500/50" : "shadow-cyan-400/50";
  const glowShadowClass = isHardcore
    ? "drop-shadow(0 0 12px rgba(244,63,94,0.9))"
    : "drop-shadow(0 0 12px rgba(0,229,255,0.9))";

  const toggleHardcore = () => {
    setIsHardcore(!isHardcore);
  };

  // --- LÓGICA DO JOGADOR REAL ---
  const fullName = dadosUsuario?.nome || dadosUsuario?.username || "Dr. Desconhecido";
  const primeiroNome = fullName.split(' ')[0] === 'Dr.' || fullName.split(' ')[0] === 'Dra.' ? fullName.split(' ').slice(0, 2).join(' ') : fullName.split(' ')[0];

  const infoPerfil = String(dadosUsuario?.titulo || dadosUsuario?.genero || dadosUsuario?.sexo || '').toLowerCase().trim();
  const ehFeminino = infoPerfil.includes('doutora') || infoPerfil.includes('dra') || infoPerfil.includes('fem') || infoPerfil === 'f';
  const imagemPerfil = ehFeminino ? '/fem.png' : '/masc.png';

  let somaNiveis = 0;
  let maxXp = -1;
  let materiaEspecialista = 'Clínica Geral';

  const xpTopicos = dadosUsuario?.xpTopicos || {};
  Object.keys(xpTopicos).forEach(chave => {
    const xpDaMateria = xpTopicos[chave];
    if (xpDaMateria > 0) somaNiveis += Math.floor(Math.sqrt(xpDaMateria / 1000)) + 1;
    if (xpDaMateria > maxXp) {
      maxXp = xpDaMateria;
      materiaEspecialista = chave.split('-')[0];
    }
  });

  const level = somaNiveis || 1;
  const xpCurrent = dadosUsuario?.pontuacaoTotal || 0;
  const xpBaseAtual = Math.floor(xpCurrent / 1000) * 1000;
  const progressoNesteMilestone = xpCurrent - xpBaseAtual;
  const xpPercent = Math.max(0, Math.min(100, Math.round((progressoNesteMilestone / 1000) * 100)));
  const patente = getPatente(level);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTelaAtual('login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const missoesParaExibir = dadosUsuario?.missoesDiarias?.length === 3 ? dadosUsuario.missoesDiarias : [
    { titulo: "Sincronizando...", subtitulo: "Acessando banco de dados", progresso: 0, meta: 1, concluida: false },
    { titulo: "Aguarde", subtitulo: "Carregando plantões", progresso: 0, meta: 1, concluida: false },
    { titulo: "Conectando", subtitulo: "Buscando informações", progresso: 0, meta: 1, concluida: false }
  ];

  return (
    <div className={`min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-x-hidden pb-8 ${isHardcore ? "selection:bg-rose-500/30" : "selection:bg-cyan-500/30"}`}>

      <div
        className="fixed inset-0 pointer-events-none opacity-20 transition-colors duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isHardcore ? 'rgba(244, 63, 94, 0.05)' : 'rgba(0, 229, 255, 0.05)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isHardcore ? 'rgba(244, 63, 94, 0.05)' : 'rgba(0, 229, 255, 0.05)'} 1px, transparent 1px),
            linear-gradient(to right, ${isHardcore ? 'rgba(244, 63, 94, 0.1)' : 'rgba(0, 229, 255, 0.1)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isHardcore ? 'rgba(244, 63, 94, 0.1)' : 'rgba(0, 229, 255, 0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
          backgroundPosition: 'center center'
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] transition-colors duration-1000"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M45 35v10H35v10h10v10h10V55h10V45H55V35H45z' fill='${isHardcore ? '%23F43F5E' : '%2300E5FF'}' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />

      <div className="fixed inset-0 pointer-events-none opacity-[0.04] flex items-center overflow-hidden">
        <motion.svg
          width="200%" height="100%" xmlns="http://www.w3.org/2000/svg"
          initial={{ x: 0 }} animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: isHardcore ? 5 : 15 }}
        >
          <pattern id="ekg" x="0" y="0" width="500" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 100 H 150 L 160 90 L 170 100 H 180 L 195 70 L 210 140 L 225 40 L 240 110 L 255 100 H 290 L 310 85 L 330 100 H 500" fill="none" stroke={themeHex} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#ekg)" />
        </motion.svg>
      </div>

      <div className={`fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,#0B1120_100%)] transition-colors duration-1000 ${isHardcore ? 'bg-rose-950/10' : ''}`} />

      <div className="max-w-[1400px] mx-auto px-6 py-6 md:px-8 md:py-8 flex flex-col min-h-screen relative z-10">

        {/* Header Superior */}
        <motion.header
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
        >
          <div className="flex items-center gap-4 group cursor-default">
            <motion.div
              whileHover={{ rotate: 180 }} transition={{ duration: 0.5, ease: "backOut" }}
              className={`w-12 h-12 rounded-2xl bg-[#0f1f2e] border border-[#1e2e42] flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-shadow duration-500 ${isHardcore ? 'shadow-rose-500/20' : 'shadow-cyan-500/10'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeHex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                <circle cx="20" cy="10" r="2" />
              </svg>
            </motion.div>
            <div className="flex flex-col">
              <h1 className={`text-white text-xl font-bold tracking-wide leading-none mb-1 transition-colors ${isHardcore ? 'group-hover:text-rose-400' : 'group-hover:text-cyan-400'}`}>
                CAÇA-MED<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>_</motion.span>
              </h1>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors ${isHardcore ? 'text-rose-500/80' : 'text-slate-500'}`}>
                {isHardcore ? "Alerta Vermelho" : "Terminal Secundário"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold text-sm">{primeiroNome}</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">{patente}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {materiaEspecialista}
              </div>
              <div className="w-32 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${xpPercent}%`, backgroundColor: isHardcore ? "#F43F5E" : "#22D3EE" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full transition-colors duration-500 ${isHardcore ? 'shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`}
                />
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer" onClick={() => setTelaAtual('perfil')}>
              <img src={imagemPerfil} alt="Avatar" className={`w-12 h-12 rounded-full object-cover border-2 transition-all duration-500 ${isHardcore ? 'border-rose-500 brightness-100 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-[#1e2e42] brightness-75 hover:brightness-100'}`} />
            </motion.div>
          </div>
        </motion.header>

        {/* Título da Seção */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-4 ml-2">
          <h2 className={`text-white text-base font-bold flex items-center gap-2 tracking-wide uppercase transition-colors duration-500`}>
            <motion.div
              animate={{
                scale: [1, 1.25, 1, 1.25, 1],
                filter: [
                  `drop-shadow(0 0 2px ${isHardcore ? 'rgba(244,63,94,0.3)' : 'rgba(0,229,255,0.3)'})`, glowShadowClass,
                  `drop-shadow(0 0 2px ${isHardcore ? 'rgba(244,63,94,0.3)' : 'rgba(0,229,255,0.3)'})`, glowShadowClass,
                  `drop-shadow(0 0 2px ${isHardcore ? 'rgba(244,63,94,0.3)' : 'rgba(0,229,255,0.3)'})`
                ]
              }}
              transition={{ duration: isHardcore ? 0.8 : 1.5, times: [0, 0.15, 0.3, 0.45, 1], repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity className={`${themeClass} w-5 h-5 transition-colors duration-500`} />
            </motion.div>
            {isHardcore ? "Emergência" : "Centro de Comando"}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 ml-7">
            {isHardcore ? "Código Vermelho ativado. Todos os residentes para a UTI." : "Selecione seu próximo desafio no plantão."}
          </p>
        </motion.div>

        {/* Grid Principal (Bento) */}
        <motion.main variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">

          {/* Top Row - Substituído se for Hardcore */}
          {isHardcore ? (
            <motion.div
              variants={itemVariants} 
              whileHover={{ scale: 1.01 }} 
              // 🔥 ROTEAMENTO DA FASE 1: Enviamos para o Hardcore em vez do SelecaoDDX normal
              onClick={() => setTelaAtual('hardcore')} 
              className="lg:col-span-12 bg-gradient-to-br from-rose-950/40 to-[#151F32] rounded-3xl px-6 py-5 relative overflow-hidden group hover:from-rose-900/50 transition-all cursor-pointer border border-rose-500/20 shadow-[0_4px_30px_rgba(244,63,94,0.1)] hover:shadow-[0_8px_40px_rgba(244,63,94,0.3)] flex flex-row items-center justify-between gap-6"
            >
              <motion.div className="absolute inset-0 bg-rose-500/10" animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.4)] group-hover:bg-rose-500/20 transition-colors shrink-0">
                  <AlertTriangle className="w-7 h-7 text-rose-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]">Modo Hardcore</span>
                    <span className="text-rose-400 text-xs font-semibold flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Caso Crítico</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Paciente em Choque</h3>
                  <p className="text-slate-300 mt-0.5 text-sm">Inicie o simulador imediatamente. Tempo é miocárdio.</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} className="relative z-10 bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center gap-2 transition-colors shrink-0">
                Atender Chamado
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* Card: Cruzadinhas */}
              <motion.div
                variants={itemVariants} whileHover={{ y: -2, scale: 1.005 }} onClick={() => setTelaAtual('topicos')}
                className="lg:col-span-8 bg-[#151F32] rounded-3xl p-6 relative overflow-hidden group hover:bg-[#1a263d] transition-colors cursor-pointer border border-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,229,255,0.06)] flex items-center gap-5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-[#0F1A2A] border border-cyan-500/20 flex items-center justify-center shadow-inner shadow-cyan-500/10 group-hover:border-cyan-500/40 transition-colors shrink-0 relative z-10">
                  <LayoutGrid className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-50 transition-colors">Cruzadinhas Médicas</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-0.5">Desafie seu conhecimento anatômico e fisiológico.</p>
                </div>
                <div className="w-36 shrink-0 relative z-10">
                  <div className="flex justify-between items-end mb-1 text-[10px] font-medium">
                    <span className="text-cyan-400">Nível {level}</span>
                    <span className="text-slate-400">{xpPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} whileInView={{ width: `${xpPercent}%` }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                      className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Card: Diagnósticos */}
              <motion.div
                variants={itemVariants} whileHover={{ y: -2, scale: 1.01 }} onClick={() => setTelaAtual('selecaoDDX')}
                className="lg:col-span-4 bg-[#151F32] rounded-3xl p-6 relative overflow-hidden group hover:bg-[#1a263d] transition-colors cursor-pointer border border-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0F1A2A] border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors shrink-0">
                  <AnimatedOrganicECG isHardcore={isHardcore} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white">Diagnósticos DDX</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-0.5">Simulador clínico avançado.</p>
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#131B2B] border border-orange-500/20 rounded-full px-3 py-1.5 shadow-[0_0_10px_rgba(249,115,22,0.05)]">
                    <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}><Ticket className="w-3.5 h-3.5 text-orange-400" /></motion.div>
                    <span className="text-orange-400 font-bold text-xs">{dadosUsuario?.tickets || 0}</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Bottom Row */}
          <motion.div variants={itemVariants} className={`lg:col-span-4 bg-[#151F32] rounded-3xl p-6 border ${isHardcore ? 'border-rose-500/10' : 'border-white/[0.02]'} shadow-[0_4px_20px_rgba(0,0,0,0.2)]`}>
            <div className="flex items-center gap-2 mb-4">
              <Target className={`w-5 h-5 transition-colors ${themeClass}`} />
              <h3 className="text-white font-bold text-sm">Missões Diárias</h3>
            </div>
            <div className="space-y-4">
              {missoesParaExibir.map((missao, index) => {
                const perc = missao.meta > 0 ? Math.round((missao.progresso / missao.meta) * 100) : 0;
                const finalPerc = Math.min(100, perc);
                return (
                  <motion.div key={index} whileHover={{ x: 5 }} className="flex items-center gap-3 cursor-default">
                    {missao.concluida || finalPerc >= 100 ? (
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 transform -rotate-90"><circle cx="24" cy="24" r="16" stroke={themeHex} strokeWidth="2.5" fill="transparent" /></svg>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 + (index * 0.2) }}>
                          <Check className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${themeClass}`} />
                        </motion.div>
                      </div>
                    ) : (
                      <CircularProgress progress={finalPerc} label={`${finalPerc}%`} delay={0.5 + (index * 0.2)} isHardcore={isHardcore} themeHex={themeHex} />
                    )}
                    <div>
                      <h4 className="text-white text-xs md:text-sm font-semibold">{missao.titulo}</h4>
                      <p className="text-slate-400 text-[10px]">{missao.subtitulo}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} onClick={() => setTelaAtual('ranking')} className={`lg:col-span-4 bg-[#151F32] rounded-3xl p-6 border ${isHardcore ? 'border-rose-500/10' : 'border-white/[0.02]'} shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/[0.05] transition-colors flex flex-col group cursor-pointer`}>
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Trophy className={`w-5 h-5 ${isHardcore ? 'text-rose-400' : 'text-orange-400'}`} />
              <h3 className="text-white font-bold text-sm">Devoradores de Plantões</h3>
            </div>
            <div className="flex-1 flex items-end justify-center gap-4 pb-2">
              <div className="flex flex-col items-center">
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.2 }} className="w-10 h-10 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-bold text-slate-300 mb-2 bg-[#0F172A]">{top3Semana[1]?.nome?.substring(0, 3) || 'Dr.B'}</motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: 60 }} transition={{ duration: 0.8, delay: 0.5 }} className="w-12 bg-[#1E293B] rounded-t-xl flex items-center justify-center"><span className="text-slate-400 font-bold text-sm">2</span></motion.div>
              </div>
              <div className="flex flex-col items-center z-10">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3 }} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-[10px] font-bold mb-2 bg-[#0F172A] ${isHardcore ? 'border-rose-500 text-rose-500' : 'border-orange-500 text-orange-400'}`}>{top3Semana[0]?.nome?.substring(0, 4) || 'Dr.A'}</motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: 85 }} transition={{ duration: 1, delay: 0.3 }} className={`w-14 bg-[#1E293B]/40 border-2 rounded-t-xl flex items-center justify-center relative overflow-hidden ${isHardcore ? 'border-rose-500/30' : 'border-orange-500/30'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-t ${isHardcore ? 'from-rose-500/10' : 'from-orange-500/10'} to-transparent`}></div>
                  <span className={`${isHardcore ? 'text-rose-500' : 'text-orange-400'} font-bold text-xl relative z-10`}>1</span>
                </motion.div>
              </div>
              <div className="flex flex-col items-center">
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.4 }} className={`w-10 h-10 rounded-full border flex items-center justify-center text-[10px] font-bold mb-2 bg-[#0F172A] ${isHardcore ? 'border-rose-700 text-rose-600' : 'border-orange-700 text-orange-600'}`}>{top3Semana[2]?.nome?.substring(0, 3) || 'Dr.C'}</motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: 45 }} transition={{ duration: 0.8, delay: 0.6 }} className="w-12 bg-[#1E293B] rounded-t-xl flex items-center justify-center"><span className={`${isHardcore ? 'text-rose-700' : 'text-orange-700'} font-bold text-sm`}>3</span></motion.div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02, x: -2 }} onClick={toggleHardcore} className={`bg-[#151F32] rounded-2xl px-5 py-4 flex items-center justify-between border cursor-pointer hover:bg-[#1a263d] transition-colors shadow-md flex-1 ${isHardcore ? 'border-rose-500/30' : 'border-white/[0.02]'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={isHardcore ? "text-rose-500 w-5 h-5" : "text-slate-500 w-5 h-5"} />
                <div><span className={`${isHardcore ? 'text-rose-400 font-bold' : 'text-slate-300 font-medium'} text-sm block`}>Modo Hardcore</span><span className="text-slate-600 text-[10px]">{isHardcore ? 'Alerta vermelho ativo' : 'Casos raros e cronômetro'}</span></div>
              </div>
              <div className={`w-10 h-5 rounded-full relative shadow-inner transition-colors ${isHardcore ? 'bg-rose-500/30' : 'bg-[#0F172A]'}`}><div className={`w-4 h-4 rounded-full absolute top-[2px] left-[2px] transition-transform ${isHardcore ? 'bg-rose-500 translate-x-[20px]' : 'bg-slate-500 translate-x-0'}`} /></div>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02, x: -2 }} onClick={() => setTelaAtual('estatisticas')} className={`bg-[#151F32] rounded-2xl px-5 py-4 flex items-center gap-3 border cursor-pointer hover:bg-[#1a263d] transition-colors flex-1 shadow-md group ${isHardcore ? 'border-rose-500/10' : 'border-white/[0.02]'}`}>
              <BarChart2 className={`w-5 h-5 transition-colors ${isHardcore ? 'text-rose-500 group-hover:text-rose-400' : 'text-blue-500 group-hover:text-blue-400'}`} />
              <div><span className="text-slate-300 font-medium text-sm group-hover:text-white block">Estatísticas</span><span className="text-slate-600 text-[10px]">Seu histórico de plantões</span></div>
            </motion.div>
          </div>
        </motion.main>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="flex justify-end items-center gap-4 mt-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex items-center gap-2 border px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider ${isHardcore ? 'border-rose-500/50 text-rose-500 hover:bg-rose-500/10' : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'}`} onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Sair do Plantão
          </motion.button>
          
          {/* 🔥 BOTÃO DE AJUDA LIGADO AO MODAL */}
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 15 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => setShowHelp(true)}
            className={`w-12 h-12 rounded-full bg-[#151F32] border flex items-center justify-center transition-colors shadow-lg ${isHardcore ? 'border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-500/20' : 'border-white/[0.05] text-slate-400 hover:text-white hover:bg-[#1a263d]'}`}
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
        </motion.div>

      </div>

      {/* 🔥 MODAL DO MANUAL DO RESIDENTE (AJUDA) */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#151F32] border border-cyan-500/20 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header do Modal */}
              <div className="p-6 border-b border-white/[0.05] bg-[#0F172A] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Manual do Residente</h2>
                    <p className="text-xs text-cyan-500 uppercase tracking-widest font-bold mt-0.5">Como sobreviver no Caça-Med</p>
                  </div>
                </div>
                <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white bg-[#1e293b] hover:bg-rose-500/20 hover:border-rose-500/50 border border-white/[0.05] p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo do Modal (Scrollable) */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar">
                
                {/* Secção: Sistema de Progressão */}
                <section>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-cyan-400" /> O Sistema de XP e Patentes
                  </h3>
                  <div className="bg-[#0B1120] p-5 rounded-2xl border border-white/[0.02]">
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">
                      A sua evolução no hospital mede-se em <strong className="text-cyan-400">Pontos de Experiência (XP)</strong>. 
                      Ganhe pontos acertando termos médicos ou salvando vidas. O seu XP define o seu Nível e, consequentemente, a sua <strong className="text-white">Patente Médica</strong>.
                    </p>
                    <ul className="text-xs text-slate-500 space-y-2 mt-4 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Estudante Básico (Níveis Iniciais)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Interno & Residente (Níveis Médios)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Chefe de Plantão (Elite)</li>
                    </ul>
                  </div>
                </section>

                {/* Secção: Cruzadinhas vs DDX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className="bg-[#0B1120] p-5 rounded-2xl border border-white/[0.02]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-blue-400" /> Estudos Teóricos
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      As <strong className="text-blue-400">Cruzadinhas Médicas</strong> são o seu campo de treino. Não há risco de vida. 
                      Jogue para memorizar anatomia e farmacologia. Cada partida gera XP base, bónus por tempo, e preenche o seu <strong className="text-orange-400">Cartão Fidelidade</strong> para ganhar Tickets.
                    </p>
                  </section>

                  <section className="bg-[#0B1120] p-5 rounded-2xl border border-white/[0.02]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-400" /> UTI (Simulador DDX)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Onde as coisas ficam sérias. Analise o Prontuário, peça exames e dê o diagnóstico correto antes que o paciente venha a óbito. 
                      <strong className="text-rose-400"> Custa 1 Ticket por caso.</strong> Erros médicos podem resultar em processos judiciais!
                    </p>
                  </section>
                </div>

                {/* Secção: Modo Hardcore & Tickets */}
                <section className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-rose-950/20 p-5 rounded-2xl border border-rose-500/20">
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Modo Hardcore
                    </h3>
                    <p className="text-xs text-rose-200/70 leading-relaxed">
                      Ative a alavanca no menu principal para enfrentar casos complexos e raros no DDX, com um <strong className="text-rose-400">cronómetro implacável</strong>. Exclusivo para quem já domina a UTI.
                    </p>
                  </div>
                  <div className="flex-1 bg-orange-950/20 p-5 rounded-2xl border border-orange-500/20">
                    <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Ticket className="w-4 h-4" /> Gestão de Tickets
                    </h3>
                    <p className="text-xs text-orange-200/70 leading-relaxed">
                      Os Tickets de UTI são o seu passe para o Simulador DDX. Pode ganhá-los completando <strong className="text-orange-400">Missões Diárias</strong> ou jogando várias Cruzadinhas.
                    </p>
                  </div>
                </section>

              </div>
              
              {/* Footer do Modal */}
              <div className="p-4 border-t border-white/[0.05] bg-[#0F172A] text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">O conhecimento é a sua melhor ferramenta.</p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function AnimatedOrganicECG ({ isHardcore }) {
  const controls = useAnimation();
  useEffect(() => {
    let isMounted = true;
    const animate = async () => {
      while (isMounted) {
        const topY = Math.random() * 5 + 1;
        const botY = Math.random() * 5 + 18;
        const waitTime = isHardcore ? Math.random() * 300 + 200 : Math.random() * 800 + 400;
        const beatDuration = isHardcore ? Math.random() * 0.1 + 0.1 : Math.random() * 0.15 + 0.15;
        const beatPath = `M 2 12 L 6 12 L 9 ${topY} L 15 ${botY} L 18 12 L 22 12`;
        const restPath = `M 2 12 L 6 12 L 9 11 L 15 13 L 18 12 L 22 12`;

        if (!isMounted) break;
        await controls.start({ d: beatPath, transition: { duration: beatDuration, ease: "easeOut" } });
        if (!isMounted) break;
        await controls.start({ d: restPath, transition: { duration: beatDuration * 1.5, ease: "easeInOut" } });
        await new Promise(r => setTimeout(r, waitTime));
      }
    };
    animate();
    return () => { isMounted = false; };
  }, [controls, isHardcore]);

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-full h-full transition-colors duration-500 ${isHardcore ? 'text-rose-500' : 'text-cyan-400'}`}>
      <motion.path initial={{ d: "M 2 12 L 6 12 L 9 11 L 15 13 L 18 12 L 22 12" }} animate={controls} />
    </svg>
  );
}

function CircularProgress ({ progress, label, delay = 0, themeHex }) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setCurrentProgress(progress), delay * 1000);
    return () => clearTimeout(timer);
  }, [progress, delay]);

  const strokeDashoffset = circumference - (currentProgress / 100) * circumference;

  return (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 transform -rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="#1E293B" strokeWidth="2.5" fill="transparent" />
        <circle cx="24" cy="24" r={radius} stroke={themeHex} strokeWidth="2.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-[1500ms] ease-out" />
      </svg>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }} className="absolute text-[10px] text-white font-bold">{label}</motion.span>
    </div>
  );
}