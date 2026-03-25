import React, { useState, useEffect } from "react";
import { ArrowLeft, Camera, Check, KeyRound, LogOut, Pencil, Save, Shield, Stethoscope, Trophy, X, Zap, User, Mail, Calendar, MapPin, Award } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

// --- COMPONENTES VISUAIS ---
function AvatarRing({ level }) {
  const circumference = 2 * Math.PI * 58;
  const progress = Math.min((level / 50) * 100, 100); 
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="ring-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="64" cy="64" r="58" stroke="#1e293b" strokeWidth="3" fill="none" />
      <motion.circle
        cx="64" cy="64" r="58"
        stroke="url(#ring-grad)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        filter="url(#ring-glow)"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 360;
        const rad = (angle * Math.PI) / 180;
        const x1 = 64 + 52 * Math.cos(rad);
        const y1 = 64 + 52 * Math.sin(rad);
        const x2 = 64 + 55 * Math.cos(rad);
        const y2 = 64 + 55 * Math.sin(rad);
        return (
          <line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 6 === 0 ? "#38bdf8" : "#1e293b"} strokeWidth="1" opacity={i % 6 === 0 ? 0.8 : 0.3} />
        );
      })}
    </svg>
  );
}

function MiniEcg() {
  const controls = useAnimation();
  useEffect(() => {
    let m = true;
    const run = async () => {
      while (m) {
        const flat = "M 0 10 L 8 10 L 10 10 L 12 10 L 20 10";
        const beat = "M 0 10 L 8 10 L 10 3 L 12 17 L 14 8 L 16 10 L 20 10";
        await controls.start({ d: beat, transition: { duration: 0.1, ease: "easeOut" } });
        await controls.start({ d: flat, transition: { duration: 0.15, ease: "easeInOut" } });
        await new Promise(r => setTimeout(r, Math.random() * 800 + 600));
      }
    };
    run();
    return () => { m = false; };
  }, [controls]);

  return (
    <svg viewBox="0 0 20 20" className="w-5 h-3 text-cyan-500 drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]">
      <motion.path stroke="currentColor" strokeWidth="1.5" fill="none" animate={controls} initial={{ d: "M 0 10 L 20 10" }} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const obterTituloEpico = (materia) => {
  const mat = (materia || '').toUpperCase();
  if (mat.includes('NEURO')) return { titulo: 'Devorador de Cérebros', emoji: '🧠', cor: '#d946ef' };
  if (mat.includes('OSSO') || mat.includes('ESQUELETICO')) return { titulo: 'Devorador de Ossos', emoji: '🦴', cor: '#f8fafc' };
  if (mat.includes('MUSCUL') || mat.includes('ANATOMIA')) return { titulo: 'Escultor de Corpos', emoji: '💪', cor: '#ef4444' };
  if (mat.includes('FARMACO')) return { titulo: 'O Alquimista Químico', emoji: '💊', cor: '#10b981' };
  if (mat.includes('MICRO') || mat.includes('VIRUS') || mat.includes('BACTERIA')) return { titulo: 'Caçador de Vírus', emoji: '🦠', cor: '#84cc16' };
  if (mat.includes('IMUNO')) return { titulo: 'Lorde dos Anticorpos', emoji: '🛡️', cor: '#3b82f6' };
  if (mat.includes('PATO') || mat.includes('DOENCA')) return { titulo: 'Detetive de Lâminas', emoji: '🔬', cor: '#6366f1' };
  if (mat.includes('HISTO') || mat.includes('CELULA')) return { titulo: 'Mestre Celular', emoji: '🧬', cor: '#ec4899' };
  return { titulo: 'Bisturi de Ouro', emoji: '🛡️', cor: '#fbbf24' };
};

const getPatente = (nivel) => {
    if (nivel <= 5) return 'Estudante (Básico)';
    if (nivel <= 15) return 'Estudante (Clínico)';
    if (nivel <= 30) return 'Interno';
    if (nivel <= 50) return 'Residente (R1)';
    if (nivel <= 80) return 'Médico Especialista';
    return 'Chefe de Plantão';
};

// ==========================================
// COMPONENTE PRINCIPAL DO PERFIL
// ==========================================
export default function PerfilUsuario({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual }) {
  const [username, setUsername] = useState(dadosUsuario?.username || "");
  const [fullName, setFullName] = useState(dadosUsuario?.nome || dadosUsuario?.username || "");
  const email = usuario?.email || "email_indisponivel@cacamed.com";
  
  const [focusedField, setFocusedField] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const infoPerfil = String(dadosUsuario?.titulo || dadosUsuario?.genero || dadosUsuario?.sexo || '').toLowerCase().trim();
  const ehFeminino = infoPerfil.includes('doutora') || infoPerfil.includes('dra') || infoPerfil.includes('fem') || infoPerfil === 'f';
  const imagemPerfil = ehFeminino ? '/fem.png' : '/masc.png';

  let somaNiveis = 0;
  let maxXp = -1;
  let materiaEspecialista = 'Clínico Geral';
  
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
  const xpNext = Math.ceil((xpCurrent + 1) / 1000) * 1000 + 1000;
  const xpPercent = Math.min(100, Math.round((xpCurrent / xpNext) * 100));

  const totalPlantoes = dadosUsuario?.estatisticasGerais?.historico?.length || 0;
  const streak = dadosUsuario?.missoesDiarias?.streak || 0;

  const stats = [
    { label: "Plantões", value: totalPlantoes.toString(), icon: Stethoscope, color: "#38bdf8" },
    { label: "Vitórias DDX", value: "0", icon: Trophy, color: "#fbbf24" },
    { label: "Streak", value: `${streak}🔥`, icon: Zap, color: "#f97316" },
    { label: "XP Total", value: xpCurrent > 1000 ? `${(xpCurrent/1000).toFixed(1)}k` : xpCurrent, icon: Award, color: "#a855f7" },
  ];

  const tituloData = obterTituloEpico(materiaEspecialista);
  const patente = getPatente(level);

  const handleSave = async () => {
    if (!usuario?.uid) return;
    try {
        await updateDoc(doc(db, "usuarios", usuario.uid), {
            username: username,
            nome: fullName
        });
        setDadosUsuario(prev => ({...prev, username, nome: fullName}));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    } catch (e) {
        console.error("Erro ao salvar perfil:", e);
        alert("Erro de comunicação com o servidor hospitalar.");
    }
  };

  const handleLogout = async () => {
    try {
        await signOut(auth);
        setTelaAtual('login');
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
  };

  const handlePasswordChange = async () => {
    if(!currentPw || !newPw || newPw.length < 6) return;
    try {
        const credential = EmailAuthProvider.credential(usuario.email, currentPw);
        await reauthenticateWithCredential(usuario, credential);
        await updatePassword(usuario, newPw);
        alert("Senha alterada com sucesso, Doutor!");
        setShowPasswordModal(false);
        setCurrentPw("");
        setNewPw("");
    } catch (error) {
        alert("Acesso negado. A senha atual está incorreta.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-hidden flex items-center justify-center selection:bg-cyan-500/30">
      
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.05)_0%,#0B1120_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#0B1120_100%)]" />

      {/* Painel com as medidas compactas originais do Figma */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[1300px] mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTelaAtual('menu')}
              className="w-9 h-9 rounded-xl bg-[#151F32] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-white text-lg tracking-tight flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }} />
                Identificação do Plantonista
              </h1>
              <p className="text-slate-500 text-[10px]">Crachá de Acesso — UTI Central</p>
            </div>
          </div>
          <MiniEcg />
        </div>

        <div className="bg-[#151F32] rounded-[24px] border border-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(56,189,248,0.1) 2px, rgba(56,189,248,0.1) 4px)' }} />

          <div className="relative z-10 flex flex-col md:flex-row">

            {/* ESQUERDA: Medida de 280px fiel ao Figma */}
            <div className="w-full md:w-[400px] shrink-0 border-b md:border-b-0 md:border-r border-white/[0.04] p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#0f172a]/50 to-transparent">
              <div className="relative w-[128px] h-[128px] mb-4">
                <AvatarRing level={level} />
                <img src={imagemPerfil} alt="Avatar" className="absolute inset-[8px] rounded-full object-cover border-2 border-[#0f172a]" />
                
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }} className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#0B1120] border border-cyan-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <span className="text-cyan-400 text-[10px] font-mono">LVL</span>
                  <span className="text-white text-xs font-mono">{level}</span>
                </motion.div>
                
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="absolute top-1 right-1 w-8 h-8 rounded-full bg-[#0B1120] border border-white/[0.1] flex items-center justify-center hover:border-cyan-500/50 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                </motion.button>
              </div>

              <h2 className="text-white text-base text-center mb-1">{fullName}</h2>
              <p className="text-slate-500 text-[10px] mb-3 flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" /> {email}
              </p>

              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-center gap-2 bg-[#0B1120] border border-cyan-500/15 rounded-lg px-3 py-1.5">
                  <Stethoscope className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300 text-[10px]">Nível {level} — {patente}</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#0B1120] border border-amber-500/15 rounded-lg px-3 py-1.5">
                  <span className="text-sm">{tituloData.emoji}</span>
                  <span className="text-amber-300 text-[10px] italic">{tituloData.titulo}</span>
                </div>
              </div>

              <div className="w-full mt-3">
                <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1">
                  <span className="text-slate-600">XP Nível {level}</span>
                  <span className="text-cyan-400 font-mono text-[9px]">{xpCurrent.toLocaleString()}/{xpNext.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0B1120] rounded-full overflow-hidden border border-white/[0.03]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ boxShadow: '0 0 10px rgba(56,189,248,0.4)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mt-3 w-full">
                {stats.map(s => (
                  <div key={s.label} className="bg-[#0B1120] border border-white/[0.03] rounded-lg p-2 flex flex-col items-center">
                    <s.icon className="w-3 h-3 mb-0.5" style={{ color: s.color, filter: `drop-shadow(0 0 4px ${s.color}60)` }} />
                    <span className="text-white text-xs font-mono">{s.value}</span>
                    <span className="text-slate-600 text-[8px] uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 w-full bg-[#0B1120] border border-white/[0.03] rounded-lg p-2 flex items-center gap-2">
                <div className="w-6 h-8 bg-gradient-to-b from-cyan-500/20 to-blue-500/10 rounded border border-cyan-500/20 flex items-center justify-center">
                  <span className="text-[7px] text-cyan-400 font-mono">ID</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] text-slate-600 uppercase tracking-widest block">Matrícula</span>
                  <span className="text-slate-400 text-[10px] font-mono">CM-2024-00472</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-slate-600 uppercase tracking-widest">Desde</span>
                  <span className="text-slate-400 text-[10px] font-mono flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" /> Jan 2024
                  </span>
                </div>
              </div>
            </div>

            {/* DIREITA: Espaçamentos compactos fieis ao Figma */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                  <h3 className="text-white text-sm uppercase tracking-wider">Dados do Prontuário</h3>
                </div>
                <div className="h-[1px] bg-gradient-to-r from-cyan-500/20 via-white/[0.03] to-transparent" />
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block flex items-center gap-1">
                    <User className="w-2.5 h-2.5" /> Username
                  </label>
                  <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${focusedField === 'username' ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(56,189,248,0.12)]' : 'border-white/[0.05] hover:border-white/[0.1]'}`}>
                    <span className="text-slate-600 text-sm">@</span>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                    {username.length >= 3 && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block flex items-center gap-1">
                    <Stethoscope className="w-2.5 h-2.5" /> Nome Completo
                  </label>
                  <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${focusedField === 'fullname' ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(56,189,248,0.12)]' : 'border-white/[0.05] hover:border-white/[0.1]'}`}>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} onFocus={() => setFocusedField('fullname')} onBlur={() => setFocusedField(null)} className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5" /> E-mail (imutável)
                  </label>
                  <div className="flex items-center gap-3 bg-[#0B1120]/60 rounded-xl px-4 py-2.5 border-2 border-white/[0.03]">
                    <input type="email" value={email} readOnly className="flex-1 bg-transparent text-slate-500 text-sm outline-none cursor-not-allowed" />
                    <div className="text-[8px] uppercase tracking-widest text-slate-600 bg-[#151F32] px-2 py-0.5 rounded-full border border-white/[0.04]">Fixo</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Especialização</label>
                    <div className="bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-white/[0.05] flex items-center gap-2">
                      <span className="text-sm">🩺</span>
                      <span className="text-white text-sm">{materiaEspecialista}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> Hospital Base
                    </label>
                    <div className="bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-white/[0.05] flex items-center gap-2">
                      <span className="text-white text-sm">CaçaMed Global</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                <motion.button whileHover={{ y: -1, boxShadow: '0 0 25px rgba(59,130,246,0.3)' }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2 text-sm relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {saved ? (
                      <motion.span key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><Check className="w-4 h-4" /> Salvo com Sucesso!</motion.span>
                    ) : (
                      <motion.span key="save" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar Alterações</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => setShowPasswordModal(true)} className="py-2.5 rounded-xl bg-[#0B1120] border border-white/[0.08] hover:border-blue-500/30 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" /> Mudar Senha
                  </motion.button>
                  <motion.button whileHover={{ y: -1, boxShadow: '0 0 20px rgba(239,68,68,0.15)' }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="py-2.5 rounded-xl bg-red-950/40 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-2 text-xs">
                    <LogOut className="w-3.5 h-3.5" /> Sair da Conta
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-cyan-500/20" />
            <MiniEcg />
            <span className="text-[8px] text-slate-600 uppercase tracking-widest">CaçaMed v2.4</span>
            <MiniEcg />
            <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-cyan-500/20" />
          </div>
        </div>
      </motion.div>

      {/* MODAL DE SENHA */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 10 }} transition={{ duration: 0.3 }} className="w-full max-w-[400px] bg-[#151F32] rounded-[24px] border border-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />
              <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>

              <div className="relative z-10">
                <div className="text-center mb-5">
                  <div className="w-11 h-11 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(59,130,246,0.15)]"><KeyRound className="w-5 h-5 text-blue-400" /></div>
                  <h2 className="text-white text-base">Alterar Senha de Acesso</h2>
                  <p className="text-slate-500 text-[10px] mt-0.5">Insira a senha atual e defina uma nova.</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Senha Atual</label>
                    <div className="flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-white/[0.05] focus-within:border-blue-500/50 focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all">
                      <KeyRound className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Nova Senha</label>
                    <div className="flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-white/[0.05] focus-within:border-emerald-500/50 focus-within:shadow-[0_0_12px_rgba(16,185,129,0.1)] transition-all">
                      <KeyRound className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mín. 6 caracteres" className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                      {newPw.length >= 6 && <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40"><Check className="w-2.5 h-2.5 text-emerald-400" /></div>}
                    </div>
                  </div>
                </div>

                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={currentPw.length < 4 || newPw.length < 6} onClick={handlePasswordChange} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_12px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4" /> Confirmar Alteração
                </motion.button>
                <button onClick={() => setShowPasswordModal(false)} className="w-full mt-2 py-2 rounded-xl bg-[#0B1120] border border-white/[0.05] text-slate-400 hover:text-white transition-all text-xs">Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}