import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Stethoscope } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function EcgPulse() {
  const controls = useAnimation();
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      while (mounted) {
        const r = Math.random() * -25 - 15;
        const s = Math.random() * 15 + 15;
        const flat = "M 0 15 L 10 15 L 15 15 L 18 15 L 22 15 L 25 15 L 30 15 L 40 15";
        const beat = `M 0 15 L 10 15 L 12 12 L 15 15 L 18 ${r} L 22 ${s} L 25 12 L 28 15 L 30 15 L 40 15`;
        await controls.start({ d: beat, transition: { duration: 0.12, ease: "easeOut" } });
        await controls.start({ d: flat, transition: { duration: 0.2, ease: "easeInOut" } });
        await new Promise(r => setTimeout(r, Math.random() * 700 + 500));
      }
    };
    run();
    return () => { mounted = false; };
  }, [controls]);

  return (
    <svg viewBox="0 0 40 30" className="w-12 h-6 text-cyan-500 drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]" preserveAspectRatio="none">
      <motion.path stroke="currentColor" strokeWidth="1.5" fill="none" animate={controls} initial={{ d: "M 0 15 L 40 15" }} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Login({ setTelaAtual }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setErro("Credenciais inválidas ou Doutor não encontrado no sistema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-hidden flex items-center justify-center selection:bg-cyan-500/30">
      
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06)_0%,#0B1120_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#0B1120_100%)]" />

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center overflow-hidden">
        <motion.svg width="200%" height="100%" xmlns="http://www.w3.org/2000/svg" initial={{ x: 0 }} animate={{ x: "-50%" }} transition={{ repeat: Infinity, ease: "linear", duration: 20 }}>
          <pattern id="ekg-login" x="0" y="0" width="500" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 100 H 150 L 160 90 L 170 100 H 180 L 195 70 L 210 140 L 225 40 L 240 110 L 255 100 H 290 L 310 85 L 330 100 H 500" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#ekg-login)" />
        </motion.svg>
      </div>

      {/* Cartão Principal REDIMENSIONADO PARA ORIGINAL (max-w-[400px]) */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[600px] mx-4"
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="w-14 h-14 rounded-2xl bg-[#0f1f2e] border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <Stethoscope className="w-7 h-7 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.6))' }} /> {/* 4. Aumentamos o estetoscópio para w-7 h-7 */}
            </motion.div>
            <h1 className="text-white text-4xl md:text-5xl font-black tracking-wide">
              {/* 5. Subimos de text-2xl para text-4xl/5xl e deixamos a fonte mais grossa (font-black) */}
              CAÇA-MED<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>_</motion.span>
            </h1>
          </div>
          <p className="text-cyan-400 text-xs md:text-sm uppercase font-bold tracking-[0.25em]">
            {/* 6. Aumentamos o subtítulo de 10px para text-sm e afastamos mais as letras (tracking-[0.25em]) */}
            🩺 Bater Ponto — Entrar no Plantão
          </p>
        </div>

        <div className="bg-[#151F32] rounded-[24px] border border-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 md:p-8 relative overflow-hidden">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/5 blur-[40px] rounded-full pointer-events-none" />

          <div className="absolute top-4 right-4 opacity-60">
            <EcgPulse />
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-4">
            
            {erro && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-lg text-xs text-center font-medium">
                {erro}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">E-mail Profissional</label>
              <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${
                emailFocused ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-white/[0.05] hover:border-white/[0.1]'
              }`}>
                <Mail className={`w-4 h-4 shrink-0 transition-colors ${emailFocused ? 'text-cyan-400' : 'text-slate-600'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => { setEmailFocused(true); setPasswordFocused(false); }}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="doutor@cacamed.com"
                  className="flex-1 w-full min-w-0 bg-transparent text-white text-base outline-none placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Senha de Acesso</label>
              <div className={`flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 transition-all duration-300 ${
                passwordFocused ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-white/[0.05] hover:border-white/[0.1]'
              }`}>
                <Lock className={`w-4 h-4 shrink-0 transition-colors ${passwordFocused ? 'text-cyan-400' : 'text-slate-600'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => { setPasswordFocused(true); setEmailFocused(false); }}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Mín. 6 caracteres"
                  className="flex-1 w-full min-w-0 bg-transparent text-white text-base outline-none placeholder:text-slate-600 font-medium"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] font-bold text-cyan-500/70 hover:text-cyan-400 transition-colors uppercase tracking-wider">
                Emergência: Esqueceu a senha?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileHover={{ y: -1, boxShadow: '0 0 25px rgba(6,182,212,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-[#0B1120] transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Acessando...</span>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" /> Entrar no Plantão
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-cyan-500/40 rounded-full" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-cyan-500/40 rounded-full" />
            </div>
          </div>
        </div>

        <p className="text-center mt-5 text-slate-500 text-xs font-medium">
          Ainda não é plantonista?{" "}
          <button onClick={() => setTelaAtual('cadastro')} type="button" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors underline underline-offset-4">
            Cadastre-se na recepção
          </button>
        </p>
      </motion.div>

      {/* MODAL ESQUECEU A SENHA */}
      {showForgot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[380px] bg-[#151F32] rounded-[24px] border border-amber-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <span className="text-xl">🔑</span>
                </div>
                <h2 className="text-white text-xl font-bold">Recuperar Acesso</h2>
                <p className="text-slate-400 text-xs mt-1.5">Enviaremos as instruções para o seu e-mail.</p>
              </div>

              {forgotSent ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-xl">✅</motion.span>
                  </div>
                  <p className="text-emerald-400 text-base font-bold mb-1">Código enviado!</p>
                  <p className="text-slate-400 text-xs">Verifique a caixa de entrada de <br/><span className="text-white font-bold">{forgotEmail}</span></p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 block">E-mail Cadastrado</label>
                    <div className="flex items-center gap-3 bg-[#0B1120] rounded-xl px-4 py-2.5 border-2 border-amber-500/20 focus-within:border-amber-500/60 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all">
                      <Mail className="w-4 h-4 text-amber-500/60 shrink-0" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="seu.email@cacamed.com"
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600 font-medium"
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ y: -1, boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setForgotSent(true)}
                    disabled={!forgotEmail.includes('@')}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B1120] font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Instruções
                  </motion.button>
                </div>
              )}

              <button
                onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                className="w-full mt-3 py-2.5 rounded-xl bg-[#0B1120] border border-white/[0.05] text-slate-400 hover:text-white font-bold transition-all text-xs"
              >
                Voltar ao Login
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}