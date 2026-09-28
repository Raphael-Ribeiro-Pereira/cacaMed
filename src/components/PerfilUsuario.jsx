import React, { useState, useEffect, useRef } from "react";
import { resumirCruzadinhas } from '../utils/progressoCruzadinha';
import { progressoGlobal } from '../utils/economia';
import { ArrowLeft, Check, KeyRound, LogOut, Pencil, Save, Shield, Stethoscope, Trophy, X, User, Mail, Calendar, Award } from "lucide-react";
import { motion, AnimatePresence, useAnimation, useReducedMotion } from "framer-motion";
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut, EmailAuthProvider, linkWithCredential, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import StitchBrand from './ui/StitchBrand';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';

// --- COMPONENTES VISUAIS ---
function AvatarRing({ level }) {
  const circumference = 2 * Math.PI * 58;
  const progress = Math.min((level / 50) * 100, 100); 
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f5d4" />
          <stop offset="50%" stopColor="#00dfc1" />
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
      <circle cx="64" cy="64" r="58" stroke="#3a4a46" strokeWidth="3" fill="none" />
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
          <line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 6 === 0 ? "#00f5d4" : "#3a4a46"} strokeWidth="1" opacity={i % 6 === 0 ? 0.8 : 0.3} />
        );
      })}
    </svg>
  );
}

function MiniEcg() {
  const controls = useAnimation();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) {
      controls.stop();
      controls.set({ d: "M 0 10 L 20 10" });
      return;
    }
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
    return () => { m = false; controls.stop(); };
  }, [controls, reduceMotion]);

  return (
    <svg viewBox="0 0 20 20" className="w-5 h-3 text-cyan-500 drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]">
      <motion.path stroke="currentColor" strokeWidth="1.5" fill="none" animate={controls} initial={{ d: "M 0 10 L 20 10" }} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const obterTituloEpico = (materia) => {
  const mat = (materia || '').toUpperCase();
  if (mat.includes('NEURO')) return { titulo: 'Devorador de Cérebros', emoji: '🧠', cor: '#8b5cf6' };
  if (mat.includes('OSSO') || mat.includes('ESQUELETICO')) return { titulo: 'Devorador de Ossos', emoji: '🦴', cor: '#dce2f7' };
  if (mat.includes('MUSCUL') || mat.includes('ANATOMIA')) return { titulo: 'Escultor de Corpos', emoji: '💪', cor: '#d4004b' };
  if (mat.includes('FARMACO')) return { titulo: 'O Alquimista Químico', emoji: '💊', cor: '#00f5d4' };
  if (mat.includes('MICRO') || mat.includes('VIRUS') || mat.includes('BACTERIA')) return { titulo: 'Caçador de Vírus', emoji: '🦠', cor: '#00dfc1' };
  if (mat.includes('IMUNO')) return { titulo: 'Lorde dos Anticorpos', emoji: '🛡️', cor: '#8b5cf6' };
  if (mat.includes('PATO') || mat.includes('DOENCA')) return { titulo: 'Detetive de Lâminas', emoji: '🔬', cor: '#8b5cf6' };
  if (mat.includes('HISTO') || mat.includes('CELULA')) return { titulo: 'Mestre Celular', emoji: '🧬', cor: '#d4004b' };
  return { titulo: 'Bisturi de Ouro', emoji: '🛡️', cor: '#ffb95f' };
};

// ==========================================
// COMPONENTE PRINCIPAL DO PERFIL
// ==========================================
export default function PerfilUsuario({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual }) {
  const [username, setUsername] = useState(dadosUsuario?.username || "");
  const [fullName, setFullName] = useState(dadosUsuario?.nome || dadosUsuario?.username || "");
  const email = usuario?.email || "email_indisponivel@cacoMed.com";
  
  const [focusedField, setFocusedField] = useState(null);
  const [saved, setSaved] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [senhaErro, setSenhaErro] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [senhaVinculada, setSenhaVinculada] = useState(false);
  const botaoSenhaRef = useRef(null);
  const entradaSenhaRef = useRef(null);
  const possuiSenha = senhaVinculada || usuario?.providerData?.some(provedor => provedor.providerId === 'password');

  useEffect(() => {
    if (!showPasswordModal) return;
    entradaSenhaRef.current?.focus();
    const aoTeclar = evento => {
      if (evento.key === 'Escape' && !salvandoSenha) {
        setShowPasswordModal(false);
        botaoSenhaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [showPasswordModal, salvandoSenha]);

  const infoPerfil = String(dadosUsuario?.titulo || dadosUsuario?.genero || dadosUsuario?.sexo || '').toLowerCase().trim();
  const ehFeminino = infoPerfil.includes('doutora') || infoPerfil.includes('dra') || infoPerfil.includes('fem') || infoPerfil === 'f';
  const imagemPerfil = ehFeminino ? '/fem.png' : '/masc.png';

  let maxXp = -1;
  let materiaEspecialista = 'Clínico Geral';
  
  const xpTopicos = dadosUsuario?.xpTopicos || {};
  Object.keys(xpTopicos).forEach(chave => {
    const xpDaMateria = xpTopicos[chave];
    if (xpDaMateria > maxXp) {
      maxXp = xpDaMateria;
      materiaEspecialista = chave.split('-')[0];
    }
  });

  const progresso = progressoGlobal(dadosUsuario);
  const level = progresso.nivel;
  const xpCurrent = progresso.xp;
  const xpNext = progresso.proximo;
  const xpPercent = progresso.percentual;

  const totalCruzadinhas = resumirCruzadinhas(dadosUsuario?.estatisticas).partidas;
  const dataCadastro = usuario?.metadata?.creationTime
    ? new Date(usuario.metadata.creationTime).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : '—';

  const stats = [
    { label: "Cruzadinhas", value: totalCruzadinhas.toString(), icon: Stethoscope, color: "#00f5d4" },
    { label: "Plantões seguros", value: String(dadosUsuario?.ddx?.seguros || 0), icon: Trophy, color: "#ffb95f" },
    { label: "Plantões concluídos", value: String(dadosUsuario?.ddx?.partidas || 0), icon: Stethoscope, color: "#00f5d4" },
    { label: "XP Total", value: xpCurrent > 1000 ? `${(xpCurrent/1000).toFixed(1)}k` : xpCurrent, icon: Award, color: "#8b5cf6" },
  ];

  const tituloData = obterTituloEpico(materiaEspecialista);

  const handleSave = async () => {
    if (!usuario?.uid || salvandoPerfil) return;
    setSalvandoPerfil(true);
    setErroSalvar('');
    try {
        if (import.meta.env.VITE_FONTE_DADOS === 'planilha') {
          const perfil = await chamarPerfilPlanilha(usuario, 'editarPerfil', { username, nome: fullName });
          setDadosUsuario(perfil);
        } else {
          await updateDoc(doc(db, "usuarios", usuario.uid), { username, nome: fullName });
          setDadosUsuario(prev => ({...prev, username, nome: fullName}));
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    } catch (e) {
        console.error("Erro ao salvar perfil:", e);
        setErroSalvar(e.message || 'Não foi possível salvar o perfil. Tente novamente.');
    } finally {
        setSalvandoPerfil(false);
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
    if ((possuiSenha && !currentPw) || newPw.length < 6 || salvandoSenha) return;
    if (!possuiSenha && newPw !== confirmPw) {
      setSenhaErro('As senhas não coincidem.');
      return;
    }
    if (possuiSenha && currentPw === newPw) {
      setSenhaErro('A nova senha precisa ser diferente da atual.');
      return;
    }
    setSenhaErro('');
    setSalvandoSenha(true);
    try {
        if (possuiSenha) {
          const credential = EmailAuthProvider.credential(usuario.email, currentPw);
          await reauthenticateWithCredential(usuario, credential);
          await updatePassword(usuario, newPw);
        } else {
          await linkWithCredential(usuario, EmailAuthProvider.credential(usuario.email, newPw));
          setSenhaVinculada(true);
        }
        setShowPasswordModal(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
    } catch (falha) {
        setSenhaErro(falha.code === 'auth/email-already-in-use'
          ? 'Este e-mail já possui uma conta por senha. Entre nela e vincule o Google antes de criar outra senha.'
          : possuiSenha ? 'Não foi possível trocar a senha. Confira a senha atual e tente novamente.' : 'Não foi possível criar a senha. Entre novamente com Google e tente outra vez.');
    } finally {
        setSalvandoSenha(false);
    }
  };

  return (
    <div className="stitch-integrated stitch-profile min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-x-hidden flex flex-col items-center selection:bg-cyan-500/30">
      <StitchBrand secao="PERFIL DO PLANTONISTA" />
      
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
              aria-label="Voltar ao centro de comando"
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
              <div className="stitch-avatar-glow relative w-[128px] h-[128px] mb-4 rounded-full">
                <AvatarRing level={level} />
                <img src={imagemPerfil} alt="Avatar" className="absolute inset-[8px] rounded-full object-cover border-2 border-[#0f172a]" />
                
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }} className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#0B1120] border border-cyan-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <span className="text-cyan-400 text-[10px] font-mono">LVL</span>
                  <span className="text-white text-xs font-mono">{level}</span>
                </motion.div>
                
              </div>

              <h2 className="text-white text-base text-center mb-1">{fullName}</h2>
              <p className="text-slate-500 text-[10px] mb-3 flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" /> {email}
              </p>

              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-center gap-2 bg-[#0B1120] border border-cyan-500/15 rounded-lg px-3 py-1.5">
                  <Stethoscope className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300 text-[10px]">Nível {level}</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#0B1120] border border-amber-500/15 rounded-lg px-3 py-1.5">
                  <span className="text-sm">{tituloData.emoji}</span>
                  <span className="text-amber-300 text-[10px] italic">{tituloData.titulo}</span>
                </div>
              </div>

              <div className="w-full mt-3">
                <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1">
                  <span className="text-slate-600">Próximos 1.000 XP globais</span>
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
                  <span className="text-slate-400 text-[10px] font-mono">{usuario?.uid?.slice(0, 12) || '—'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-slate-600 uppercase tracking-widest">Desde</span>
                  <span className="text-slate-400 text-[10px] font-mono flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" /> {dataCadastro}
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
                  <label htmlFor="perfil-username" className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block flex items-center gap-1">
                    <User className="w-2.5 h-2.5" /> Username
                  </label>
                  <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${focusedField === 'username' ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(56,189,248,0.12)]' : 'border-white/[0.05] hover:border-white/[0.1]'}`}>
                    <span className="text-slate-600 text-sm">@</span>
                    <input id="perfil-username" type="text" value={username} onChange={e => setUsername(e.target.value)} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                    {username.length >= 3 && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="perfil-nome" className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block flex items-center gap-1">
                    <Stethoscope className="w-2.5 h-2.5" /> Nome Completo
                  </label>
                  <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${focusedField === 'fullname' ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(56,189,248,0.12)]' : 'border-white/[0.05] hover:border-white/[0.1]'}`}>
                    <input id="perfil-nome" type="text" value={fullName} onChange={e => setFullName(e.target.value)} onFocus={() => setFocusedField('fullname')} onBlur={() => setFocusedField(null)} className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="perfil-email" className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5" /> E-mail (imutável)
                  </label>
                  <div className="flex items-center gap-3 bg-[#0B1120]/60 rounded-xl px-4 py-2.5 border-2 border-white/[0.03]">
                    <input id="perfil-email" type="email" value={email} readOnly className="flex-1 bg-transparent text-slate-500 text-sm outline-none cursor-not-allowed" />
                    <div className="text-[8px] uppercase tracking-widest text-slate-600 bg-[#151F32] px-2 py-0.5 rounded-full border border-white/[0.04]">Fixo</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Especialização</label>
                    <div className="bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-white/[0.05] flex items-center gap-2">
                      <span className="text-sm">🩺</span>
                      <span className="text-white text-sm">{materiaEspecialista}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                <motion.button whileHover={{ y: -1, boxShadow: '0 0 25px rgba(59,130,246,0.3)' }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={salvandoPerfil} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2 text-sm relative overflow-hidden disabled:opacity-50">
                  <AnimatePresence mode="wait">
                    {saved ? (
                      <motion.span key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><Check className="w-4 h-4" /> Salvo com Sucesso!</motion.span>
                    ) : (
                      <motion.span key="save" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar Alterações</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                {erroSalvar && <p role="alert" className="text-rose-400 text-xs">{erroSalvar}</p>}

                <div className="grid grid-cols-2 gap-2">
                  <motion.button ref={botaoSenhaRef} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => { setSenhaErro(''); setShowPasswordModal(true); }} className="py-2.5 rounded-xl bg-[#0B1120] border border-white/[0.08] hover:border-blue-500/30 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" /> {possuiSenha ? 'Mudar Senha' : 'Criar Senha'}
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
            <span className="text-[8px] text-slate-600 uppercase tracking-widest">cacoMed · Terminal de Plantão</span>
            <MiniEcg />
            <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-cyan-500/20" />
          </div>
        </div>
      </motion.div>

      {/* MODAL DE SENHA */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-md">
            <motion.div role="dialog" aria-modal="true" aria-labelledby="perfil-titulo-senha" initial={{ opacity: 0, scale: 0.93, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 10 }} transition={{ duration: 0.3 }} className="w-full max-w-[400px] bg-[#151F32] rounded-[24px] border border-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />
              <button aria-label="Fechar alteração de senha" onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>

              <div className="relative z-10">
                <div className="text-center mb-5">
                  <div className="w-11 h-11 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(59,130,246,0.15)]"><KeyRound className="w-5 h-5 text-blue-400" /></div>
                  <h2 id="perfil-titulo-senha" className="text-white text-base">{possuiSenha ? 'Alterar Senha de Acesso' : 'Criar Senha de Acesso'}</h2>
                  <p className="text-slate-500 text-[10px] mt-0.5">{possuiSenha ? 'Insira a senha atual e defina uma nova.' : 'Depois você poderá entrar também com e-mail e senha.'}</p>
                </div>

                <div className="space-y-3 mb-4">
                  {possuiSenha && <div>
                    <label htmlFor="perfil-senha-atual" className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Senha Atual</label>
                    <div className="flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-white/[0.05] focus-within:border-blue-500/50 focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all">
                      <KeyRound className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <input ref={entradaSenhaRef} id="perfil-senha-atual" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                    </div>
                  </div>}
                  <div>
                    <label htmlFor="perfil-senha-nova" className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">{possuiSenha ? 'Nova Senha' : 'Senha'}</label>
                    <div className="flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-white/[0.05] focus-within:border-emerald-500/50 focus-within:shadow-[0_0_12px_rgba(16,185,129,0.1)] transition-all">
                      <KeyRound className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <input ref={possuiSenha ? undefined : entradaSenhaRef} id="perfil-senha-nova" type="password" autoComplete="new-password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mín. 6 caracteres" className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600" />
                      {newPw.length >= 6 && <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40"><Check className="w-2.5 h-2.5 text-emerald-400" /></div>}
                    </div>
                  </div>
                  {!possuiSenha && <div>
                    <label htmlFor="perfil-senha-confirmar" className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Confirmar senha</label>
                    <input id="perfil-senha-confirmar" type="password" autoComplete="new-password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full rounded-xl bg-[#0B1120] border border-white/[0.05] px-4 py-2.5 text-white text-sm" />
                  </div>}
                </div>

                {senhaErro && <p role="alert" className="text-rose-400 text-xs mb-3">{senhaErro}</p>}
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={(possuiSenha && currentPw.length < 4) || newPw.length < 6 || (!possuiSenha && newPw !== confirmPw) || salvandoSenha} onClick={handlePasswordChange} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_12px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4" /> {possuiSenha ? 'Confirmar Alteração' : 'Criar Senha'}
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
