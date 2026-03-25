import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Stethoscope, GraduationCap, Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SPECIALTIES = [
  { value: "anatomia", label: "Anatomia", emoji: "🦴" },
  { value: "neurologia", label: "Neurologia", emoji: "🧠" },
  { value: "farmaco", label: "Farmacologia", emoji: "💊" },
  { value: "micro", label: "Microbiologia", emoji: "🦠" },
  { value: "clinica", label: "Clínica Geral", emoji: "🩺" },
  { value: "patologia", label: "Patologia", emoji: "🔬" },
];

export default function Cadastro({ setTelaAtual }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('doutora');
  const [specialty, setSpecialty] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const nameValid = name.trim().length >= 3;
  const emailValid = email.includes('@') && email.includes('.');
  const passwordValid = password.length >= 6;
  const confirmValid = confirmPassword === password && confirmPassword.length > 0;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro("");
    
    if (!nameValid || !emailValid || !passwordValid || !confirmValid || !specialty) {
        setErro("Preencha todos os campos do prontuário corretamente.");
        return;
    }

    setLoading(true);
    try {
      // Cria o usuário na Autenticação do Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Cria o documento do usuário na Coleção "usuarios" no Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: name,
        email: email,
        username: name.split(" ")[0].toLowerCase() + Math.floor(Math.random() * 1000),
        titulo: gender === 'doutora' ? 'Doutora' : 'Doutor',
        especialidade: specialty,
        pontuacaoTotal: 50, // Bônus de cadastro
        xpTopicos: {},
        missoesDiarias: { data: new Date().toISOString().split('T')[0], streak: 1 },
        criadoEm: new Date().toISOString()
      });

      // O App.jsx vai capturar a mudança de auth e jogar para o menu automaticamente
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErro("Este e-mail já está escalado para outro plantão.");
      } else {
        setErro("Erro no sistema hospitalar. Tente novamente.");
      }
      setLoading(false);
    }
  };

  const getBorderClass = (field, isValid) => {
    if (focusedField === field) {
      if (isValid === true) return 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      return 'border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
    }
    if (isValid === true) return 'border-emerald-500/30';
    return 'border-white/[0.05] hover:border-white/[0.1]';
  };

  return (
    <div className="h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-hidden flex items-center justify-center selection:bg-emerald-500/30">
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,#0B1120_70%)]" />

      {/* EKG BG */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center overflow-hidden">
        <motion.svg width="200%" height="100%" xmlns="http://www.w3.org/2000/svg" initial={{ x: 0 }} animate={{ x: "-50%" }} transition={{ repeat: Infinity, ease: "linear", duration: 25 }}>
          <pattern id="ekg-reg" x="0" y="0" width="500" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 100 H 150 L 160 90 L 170 100 H 180 L 195 70 L 210 140 L 225 40 L 240 110 L 255 100 H 290 L 310 85 L 330 100 H 500" fill="none" stroke="#10b981" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#ekg-reg)" />
        </motion.svg>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#0B1120_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[520px] mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="w-10 h-10 rounded-2xl bg-[#0f1f2e] border border-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <Stethoscope className="w-5 h-5 text-emerald-500" style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' }} />
            </motion.div>
            <h1 className="text-white text-xl tracking-wide">
              CAÇA-MED<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>_</motion.span>
            </h1>
          </div>
          <p className="text-emerald-400 text-xs uppercase tracking-[0.2em]">🩺 Novo Plantonista — Cadastre-se</p>
        </div>

        {/* Card */}
        <div className="bg-[#151F32] rounded-[24px] border border-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />

          <form onSubmit={handleRegister} className="relative z-10 space-y-3">
            
            {/* Erro */}
            {erro && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-lg text-xs text-center font-medium">
                {erro}
              </motion.div>
            )}

            {/* Name */}
            <div>
              <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Nome Completo</label>
              <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${getBorderClass('name', nameValid)}`}>
                <User className={`w-4 h-4 shrink-0 transition-colors ${nameValid ? 'text-emerald-400' : focusedField === 'name' ? 'text-blue-400' : 'text-slate-600'}`} />
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  placeholder="Seu nome real"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                />
                {nameValid && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Gender Toggle + Specialty Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Gender */}
              <div>
                <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Título</label>
                <div className="flex bg-[#0B1120] rounded-xl p-0.5 border border-white/[0.04]">
                  <button type="button" onClick={() => setGender('doutora')} className={`flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${gender === 'doutora' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40' : 'text-slate-500'}`}>
                    👩‍⚕️ Doutora
                  </button>
                  <button type="button" onClick={() => setGender('doutor')} className={`flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${gender === 'doutor' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/40' : 'text-slate-500'}`}>
                    👨‍⚕️ Doutor
                  </button>
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Matéria Preferida</label>
                <div className={`bg-[#0B1120] rounded-xl px-3 py-2.5 border-2 transition-all duration-300 ${getBorderClass('specialty', specialty !== "")}`}>
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    onFocus={() => setFocusedField('specialty')} onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-sm outline-none text-white appearance-none cursor-pointer [&>option]:bg-[#0B1120] [&>option]:text-white"
                  >
                    <option value="" className="text-slate-500">Selecione...</option>
                    {SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">E-mail Profissional</label>
              <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${getBorderClass('email', emailValid)}`}>
                <Mail className={`w-4 h-4 shrink-0 transition-colors ${emailValid ? 'text-emerald-400' : focusedField === 'email' ? 'text-blue-400' : 'text-slate-600'}`} />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  placeholder="doutor@cacamed.com"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                />
                {emailValid && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Criar Senha</label>
                <div className={`flex items-center gap-2 bg-[#0B1120] rounded-xl px-3 py-2.5 border-2 transition-all duration-300 ${getBorderClass('password', passwordValid)}`}>
                  <Lock className={`w-3.5 h-3.5 shrink-0 transition-colors ${passwordValid ? 'text-emerald-400' : focusedField === 'password' ? 'text-blue-400' : 'text-slate-600'}`} />
                  <input
                    type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    placeholder="Mín. 6 caracteres"
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600 min-w-0"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-600 hover:text-slate-300 transition-colors shrink-0">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 block">Confirmar Senha</label>
                <div className={`flex items-center gap-2 bg-[#0B1120] rounded-xl px-3 py-2.5 border-2 transition-all duration-300 ${getBorderClass('confirm', confirmValid)}`}>
                  <Lock className={`w-3.5 h-3.5 shrink-0 transition-colors ${confirmValid ? 'text-emerald-400' : focusedField === 'confirm' ? 'text-blue-400' : 'text-slate-600'}`} />
                  <input
                    type={showPassword ? "text" : "password"} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                    placeholder="Repita a senha"
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600 min-w-0"
                  />
                  {confirmValid && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/40">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Level Badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border border-emerald-500/15"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs">Nível 1</span>
                  <span className="text-emerald-400 text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Estudante Básico</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex-1 h-1 bg-[#151F32] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '5%' }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-emerald-400 rounded-full" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
                  </div>
                  <Star className="w-3 h-3 text-emerald-500/60" />
                  <span className="text-[9px] text-emerald-500/80">+50 XP inicial</span>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !nameValid || !emailValid || !passwordValid || !confirmValid || !specialty}
              whileHover={{ y: -1, boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Registrando...</span>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" /> Criar Prontuário
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-4 text-slate-500 text-xs">
          Já é plantonista?{" "}
          <button onClick={() => setTelaAtual("login")} className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2">
            Acesse o sistema
          </button>
        </p>
      </motion.div>
    </div>
  );
}