import React, { useState } from 'react';
import { ArrowLeft, Play, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SelecaoTopicos({ setTelaAtual, iniciarJogo, dadosUsuario }) {
  const [materiaAtiva, setMateriaAtiva] = useState(null);
  const [subMateriaAtiva, setSubMateriaAtiva] = useState(null);

  // Fundimos as suas matérias com as cores premium do Figma
  const estruturaModos = {
    'Anatomia': { icon: '🦴', color: '#38bdf8', fases: ['Sistema esquelético', 'Sistema muscular', 'Sistema nervoso', 'Sistema circulatório', 'Sistema linfático', 'Sistema respiratório', 'Sistema digestório', 'Sistema urinário', 'Sistema reprodutor', 'Sistema endócrino', 'Sistema tegumentar'] },
    'Farmacologia': { icon: '💊', color: '#10b981', fases: ['Medicamentos', 'Classes de medicamentos', 'Mecanismos de ação', 'Receptores', 'Enzimas'] },
    'Microbiologia': { icon: '🧫', color: '#eab308', fases: ['Vírus', 'Bactérias', 'Fungos', 'Parasitas'] },
    'Histologia': { icon: '🔬', color: '#06b6d4', fases: ['Células', 'Tecidos', 'Epitelios', 'Matriz', 'Organelas'] },
    'Imunologia': { icon: '🛡️', color: '#ec4899', fases: ['Imunologia'] },
    'Patologia': { icon: '🦠', color: '#f97316', fases: ['Doencas', 'Exames'] }
  };

  // Sua lógica INTACTA de cálculo de progressão
  const calcularProgresso = (materiaNome) => {
    if (!dadosUsuario || !dadosUsuario.xpTopicos) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };
    const prefixo = materiaNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() + "-";
    let totalXP = 0;
    Object.keys(dadosUsuario.xpTopicos).forEach(chave => {
      if (chave.startsWith(prefixo)) totalXP += dadosUsuario.xpTopicos[chave];
    });
    
    if (totalXP === 0) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };

    const nivel = Math.floor(Math.sqrt(totalXP / 1000)) + 1;
    const xpProximoNivel = Math.pow(nivel, 2) * 1000;
    const xpNivelAtual = Math.pow(nivel - 1, 2) * 1000;
    const xpNesteNivel = totalXP - xpNivelAtual; 
    const xpParaUpar = xpProximoNivel - xpNivelAtual; 
    const porcentagem = xpNesteNivel === 0 ? 0 : (xpNesteNivel / xpParaUpar) * 100;
    return { nivel, porcentagem, xpNesteNivel, xpParaUpar, isZero: false };
  };

  const calcularProgressoSubtopico = (materiaNome, subMateriaNome) => {
    if (!dadosUsuario || !dadosUsuario.xpTopicos) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };
    const materiaBlindada = materiaNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const subMateriaBlindada = subMateriaNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const chaveXP = `${materiaBlindada}-${subMateriaBlindada}`;
    const totalXP = dadosUsuario.xpTopicos[chaveXP] || 0;
    
    if (totalXP === 0) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };

    const nivel = Math.floor(Math.sqrt(totalXP / 1000)) + 1;
    const xpProximoNivel = Math.pow(nivel, 2) * 1000;
    const xpNivelAtual = Math.pow(nivel - 1, 2) * 1000;
    const xpNesteNivel = totalXP - xpNivelAtual; 
    const xpParaUpar = xpProximoNivel - xpNivelAtual; 
    const porcentagem = xpNesteNivel === 0 ? 0 : (xpNesteNivel / xpParaUpar) * 100;
    return { nivel, porcentagem, xpNesteNivel, xpParaUpar, isZero: false };
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-x-hidden selection:bg-cyan-500/30 flex flex-col pb-8">
      {/* Background Padrão Premium */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to right, rgba(0, 229, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.05)_0%,#0B1120_100%)]" />

      <div className="max-w-[1200px] mx-auto px-6 py-6 md:py-8 relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <header className="flex items-center gap-5 mb-8 shrink-0">
          <button
            onClick={() => setTelaAtual('menu')}
            className="w-12 h-12 rounded-xl bg-[#151F32] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/30 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold tracking-wide uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" /> Escolha a Ala de Plantão
            </h1>
            <p className="text-slate-500 text-sm mt-1">Selecione a especialidade médica para iniciar as cruzadinhas.</p>
          </div>
        </header>

        {/* Grid de Áreas */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 flex-1 min-h-0"
        >
          {Object.keys(estruturaModos).map((materia) => {
            const status = calcularProgresso(materia);
            const { icon, color } = estruturaModos[materia];

            return (
              <motion.div
                key={materia}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMateriaAtiva(materia); setSubMateriaAtiva(null); }}
                className="bg-[#151F32] rounded-3xl p-6 border border-white/[0.02] cursor-pointer hover:border-cyan-500/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl grayscale-0 transition-all duration-300 group-hover:scale-110" style={{ filter: status.isZero ? 'grayscale(100%) opacity(50%)' : `drop-shadow(0 0 12px ${color}40)` }}>
                    {icon}
                  </span>
                  <span className="bg-[#0F172A] px-3 py-1 rounded-full border border-white/[0.05] text-xs font-bold text-white shadow-inner">
                    Nível {status.nivel}
                  </span>
                </div>

                <h3 className="text-white text-lg font-bold tracking-tight mb-3 group-hover:text-cyan-50 transition-colors">{materia}</h3>

                <div>
                  <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                    <span>{status.isZero ? 'Bloqueado' : 'XP Acumulado'}</span>
                    <span style={{ color: status.isZero ? '#64748b' : color }}>
                      {status.isZero ? '0%' : `${Math.round(status.porcentagem)}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0F172A] rounded-full overflow-hidden border border-white/[0.02]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${status.porcentagem}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: status.isZero ? '#334155' : color, boxShadow: status.isZero ? 'none' : `0 0 10px ${color}80` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Modal de Subáreas Premium (Sobrepõe a tela) */}
      <AnimatePresence>
        {materiaAtiva && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            {/* Fundo Desfocado */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMateriaAtiva(null)}
              className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-sm"
            />
            
            {/* Cartão do Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-[#1e293b] rounded-3xl w-full max-w-lg p-6 md:p-8 relative z-10 border border-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh]"
            >
              <button onClick={() => setMateriaAtiva(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/[0.05]">
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6 shrink-0 pr-8">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl filter drop-shadow-md">{estruturaModos[materiaAtiva].icon}</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] block mb-0.5" style={{ color: estruturaModos[materiaAtiva].color }}>Foco do Plantão</span>
                    <h2 className="text-2xl font-bold text-white">{materiaAtiva}</h2>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">Escolha o tópico de especialização para gerar as cruzadinhas.</p>
              </div>

              {/* Lista com Scroll se for muito longa */}
              <div className="space-y-2 mb-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {estruturaModos[materiaAtiva].fases.map((subMateria) => {
                  const statusSub = calcularProgressoSubtopico(materiaAtiva, subMateria);
                  const isSelected = subMateriaAtiva === subMateria;

                  return (
                    <button
                      key={subMateria}
                      onClick={() => setSubMateriaAtiva(subMateria)}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all flex justify-between items-center group ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                          : "bg-[#0F172A] border-white/[0.02] hover:bg-[#151F32] hover:border-white/[0.05]"
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {subMateria}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                          Nível {statusSub.nivel} • {statusSub.xpNesteNivel}/{statusSub.xpParaUpar} XP
                        </span>
                      </div>
                      
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botão Iniciar com sua Lógica Intacta */}
              <button
                disabled={!subMateriaAtiva}
                onClick={() => iniciarJogo(materiaAtiva, subMateriaAtiva)}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all text-base font-bold shrink-0 ${
                  subMateriaAtiva
                    ? "bg-cyan-500 text-[#0B1120] hover:bg-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.3)]"
                    : "bg-[#0F172A] text-slate-500 cursor-not-allowed border border-white/[0.05]"
                }`}
              >
                <Play className={`w-5 h-5 ${subMateriaAtiva ? "fill-[#0B1120]" : "fill-slate-500"}`} />
                Iniciar Plantão
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Estilo CSS extra apenas para a barra de rolagem do modal ficar bonita */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}