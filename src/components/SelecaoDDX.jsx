import React, { useState } from 'react';
import { ArrowLeft, Clock, Zap, Target, BookOpen, Stethoscope, Ticket, Settings, Check, Loader2, Lock, Shield, Brain, Scissors, Dna, Ribbon, Eye, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { auth } from '../firebase';
import { consumirTicketDDX } from '../services/ticketsDDX';
import StitchBrand from './ui/StitchBrand';

// 🔥 IMPORTANDO O NOSSO BANCO DE CASOS REAIS
import casosBase from '../data/casos.json';

const ELENCO_HOUSE = [
  { id: 'house', name: 'Dr. House', Icon: Stethoscope, specialty: 'Infectologia / Nefro', color: '#00f5d4' },
  { id: 'cameron', name: 'Dra. Cameron', Icon: Shield, specialty: 'Imunologia', color: '#8b5cf6' },
  { id: 'foreman', name: 'Dr. Foreman', Icon: Brain, specialty: 'Neurologia', color: '#ffb95f' },
  { id: 'chase', name: 'Dr. Chase', Icon: Scissors, specialty: 'Cirurgia / UTI', color: '#d4004b' },
  { id: 'treze', name: 'Treze', Icon: Dna, specialty: 'Med. Interna / Genética', color: '#00f5d4' },
  { id: 'wilson', name: 'Dr. Wilson', Icon: Ribbon, specialty: 'Oncologia', color: '#ffb95f' },
  { id: 'taub', name: 'Dr. Taub', Icon: Eye, specialty: 'Cirurgia Plástica', color: '#8b5cf6' },
  { id: 'kutner', name: 'Dr. Kutner', Icon: Zap, specialty: 'Trauma / Esporte', color: '#d4004b' },
  { id: 'cuddy', name: 'Dra. Cuddy', Icon: ClipboardList, specialty: 'Administração / Ética', color: '#00f5d4' },
];

export default function SelecaoDDX({ setTelaAtual, iniciarDDX, dadosUsuario, setDadosUsuario }) {
  const [tempo, setTempo] = useState('ranqueado');
  const [dificuldade, setDificuldade] = useState('residente');
  const [equipe, setEquipe] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const ticketsAtuais = dadosUsuario?.tickets || 0;
  const semTickets = ticketsAtuais < 1;

  const handleToggleMembro = (id) => {
    if (equipe.includes(id)) {
      setEquipe(equipe.filter(membroId => membroId !== id));
    } else {
      if (equipe.length < 3) {
        setEquipe([...equipe, id]);
      }
    }
  };

  const handleIniciar = async () => {
    if (isGenerating) return;
    if (semTickets) {
      alert("Você não tem Tickets suficientes! Jogue algumas Cruzadinhas para ganhar mais.");
      return;
    }

    if (equipe.length === 0) {
      alert("Você precisa levar pelo menos um médico com você!");
      return;
    }

    setIsGenerating(true);

    try {
      const meuUid = auth.currentUser?.uid || dadosUsuario?.uid;
      if (!meuUid) throw new Error('Usuário não autenticado.');
      if (!casosBase.length) throw new Error('Nenhum caso disponível.');
      const indiceSorteado = Math.floor(Math.random() * casosBase.length);
      const casoSorteado = casosBase[indiceSorteado];
      const entradaId = crypto.randomUUID();
      const novosTickets = await consumirTicketDDX(meuUid, entradaId);
      setDadosUsuario(prev => ({ ...prev, tickets: novosTickets }));
      iniciarDDX({ equipe, tempo, dificuldade, casoPreCarregado: casoSorteado, entradaId });
    } catch (error) {
      console.error("Erro ao carregar o prontuário:", error);
      alert(error.message || 'Não foi possível iniciar o caso. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="stitch-integrated stitch-ddx-select min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-x-hidden flex flex-col selection:bg-cyan-500/30 pb-10">
      <StitchBrand secao="DIAGNÓSTICOS DDX" tickets={ticketsAtuais} />
      
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#3a4a46 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at top, #141b2b 0%, #070e1d 80%)' }} />

      <div className="max-w-[1200px] mx-auto px-6 py-6 md:py-8 relative z-10 flex flex-col h-full w-full">

        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTelaAtual('menu')} 
              className="w-12 h-12 rounded-xl bg-[#151F32] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/30 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide">Dept. de Diagnósticos</h1>
              </div>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">Sala de Reuniões — Prepare sua equipe médica.</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 border px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] ${semTickets ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' : 'bg-[#0F172A] border-orange-500/20 text-orange-400'}`}>
            <Ticket className="w-5 h-5" />
            <span className="text-base font-bold">Tickets: {ticketsAtuais}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 shrink-0">
          
          <div className="bg-[#151F32] rounded-2xl p-5 border border-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-bold text-sm">Modo de Tempo</span>
            </div>
            <div className="flex bg-[#0F172A] rounded-xl p-1.5 border border-white/[0.02]">
              <button 
                onClick={() => setTempo('ranqueado')} 
                className={`flex-1 py-3 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${tempo === 'ranqueado' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Target className="w-4 h-4" /> Ranqueado (10 Min)
              </button>
              <button 
                onClick={() => setTempo('casual')} 
                className={`flex-1 py-3 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${tempo === 'casual' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Casual (Livre)
              </button>
            </div>
          </div>

          <div className="bg-[#151F32] rounded-2xl p-5 border border-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-rose-400" />
              <span className="text-white font-bold text-sm">Dificuldade</span>
            </div>
            <div className="flex bg-[#0F172A] rounded-xl p-1.5 border border-white/[0.02]">
              <button 
                onClick={() => setDificuldade('residente')} 
                className={`flex-1 py-3 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${dificuldade === 'residente' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Residente (Múltipla Escolha)
              </button>
              <button 
                onClick={() => setDificuldade('formado')} 
                className={`flex-1 py-3 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${dificuldade === 'formado' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <BookOpen className="w-4 h-4" /> Formado (Texto Livre)
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 shrink-0">
          <div>
            <h2 className="text-white text-lg font-bold">Recrutar Especialistas</h2>
            <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Selecione até três profissionais para acompanhar o caso.</p>
          </div>
          <div className="bg-[#151F32] border border-white/[0.08] px-4 py-2 rounded-full flex items-center gap-3 shadow-inner">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Capacidade:</span>
            <motion.span key={equipe.length} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 0.22 }} className={`text-base font-black ${equipe.length === 3 ? 'text-emerald-400' : 'text-cyan-400'}`}>{equipe.length}/3</motion.span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0 mb-8">
          {ELENCO_HOUSE.map((medico) => {
            const isSelected = equipe.includes(medico.id);
            const isMaxedOut = equipe.length >= 3 && !isSelected;

            return (
              <motion.button
                key={medico.id}
                whileHover={!isMaxedOut ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isMaxedOut ? { scale: 0.98 } : {}}
                onClick={() => handleToggleMembro(medico.id)}
                disabled={isMaxedOut}
                className={`relative text-left p-4 md:p-5 rounded-2xl transition-all overflow-hidden border flex items-start gap-4 ${
                  isSelected
                    ? 'bg-[#1e293b] border-white/[0.2] shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
                    : isMaxedOut
                      ? 'bg-[#0f172a]/50 border-white/[0.02] opacity-50 cursor-not-allowed grayscale-[60%]'
                      : 'bg-[#151F32] border-white/[0.04] hover:border-white/[0.12] hover:bg-[#1a263d] shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                }`}
              >
                {isSelected && <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundColor: medico.cor }} />}
                
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-[#0B1120] rounded-full flex items-center justify-center border border-white/[0.1] shadow-lg z-10">
                    <Check className="w-3.5 h-3.5" style={{ color: medico.cor }} />
                  </div>
                )}

                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: `inset 0 0 20px ${medico.cor}20, 0 0 15px ${medico.cor}10` }} />
                )}

                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#0B1120] border flex items-center justify-center text-2xl md:text-3xl shrink-0 relative z-10" style={{ borderColor: isSelected ? `${medico.cor}50` : 'rgba(255,255,255,0.05)', backgroundColor: isSelected ? `${medico.cor}10` : '#0B1120' }}>
                  <medico.Icon className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" style={{ color: medico.cor }} />
                </div>
                
                <div className="min-w-0 flex-1 relative z-10 pr-4">
                  <h3 className="text-white text-base md:text-lg font-bold leading-tight truncate">{medico.name}</h3>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest block truncate mt-1" style={{ color: medico.cor }}>
                    {medico.specialty}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="shrink-0 flex justify-center pb-4">
          <motion.button
            whileHover={!isGenerating && !semTickets ? { scale: 1.05 } : {}}
            whileTap={!isGenerating && !semTickets ? { scale: 0.95 } : {}}
            onClick={handleIniciar}
            disabled={isGenerating || semTickets}
            className={`group py-4 px-8 md:px-12 rounded-2xl font-bold text-base md:text-lg transition-all flex items-center gap-4 relative disabled:opacity-70 disabled:cursor-not-allowed ${
              semTickets 
                ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-[#0B1120] shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-[#0B1120]" />
                <span>Bipando a UTI...</span>
              </>
            ) : semTickets ? (
              <>
                <Lock className="w-5 h-5 md:w-6 md:h-6 text-slate-500" />
                <span>Sem Tickets Suficientes</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 md:w-6 md:h-6 fill-[#0B1120]" />
                <span>Entrar na Sala Vermelha</span>
                <span className="bg-[#0B1120]/20 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold ml-2 shadow-inner">
                  Custo: 1 <Ticket className="w-3.5 h-3.5" />
                </span>
              </>
            )}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
