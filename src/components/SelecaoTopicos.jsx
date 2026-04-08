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
      {/* Background Padrão Premium - IDÊNTICO AO MENU (SEM ECG) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 transition-colors duration-1000 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 229, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 229, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to right, rgba(0, 229, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 229, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
          backgroundPosition: 'center center'
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] transition-colors duration-1000 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M45 35v10H35v10h10v10h10V55h10V45H55V35H45z' fill='%2300E5FF' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,#0B1120_100%)] transition-colors duration-1000 z-0" />

      <div className="max-w-[1200px] mx-auto px-6 py-6 md:py-8 relative z-10 flex flex-col h-full w-full">
        {/* Header Sincronizado */}
        <header className="flex items-center gap-5 mb-8 shrink-0 relative z-10">
          <button
            onClick={() => setTelaAtual('menu')}
            className="w-12 h-12 rounded-2xl bg-[#151F32] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1a263d] hover:border-cyan-500/30 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.2)] group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold tracking-wide uppercase flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.25, 1, 1.25, 1],
                  filter: [
                    'drop-shadow(0 0 2px rgba(0,229,255,0.3))', 'drop-shadow(0 0 12px rgba(0,229,255,0.9))',
                    'drop-shadow(0 0 2px rgba(0,229,255,0.3))', 'drop-shadow(0 0 12px rgba(0,229,255,0.9))',
                    'drop-shadow(0 0 2px rgba(0,229,255,0.3))'
                  ]
                }}
                transition={{ duration: 1.5, times: [0, 0.15, 0.3, 0.45, 1], repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap className="w-5 h-5 text-cyan-400" />
              </motion.div>
              Escolha a Ala de Plantão
            </h1>
            <p className="text-slate-400 text-sm mt-1">Selecione a especialidade médica para iniciar as cruzadinhas.</p>
          </div>
        </header>

        {/* Grid de Áreas */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 flex-1 min-h-0 relative z-10"
        >
          {Object.keys(estruturaModos).map((materia) => {
            const status = calcularProgresso(materia);
            const { icon, color } = estruturaModos[materia];

            return (
              <motion.div
                key={materia}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMateriaAtiva(materia); setSubMateriaAtiva(null); }}
                className="bg-[#151F32] rounded-3xl p-6 relative overflow-hidden group hover:bg-[#1a263d] transition-colors cursor-pointer border border-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}40`;
                  e.currentTarget.style.boxShadow = `0 8px 30px ${color}25, 0 0 15px ${color}10 inset`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `rgba(255,255,255,0.02)`;
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.2)`;
                }}
              >
                {/* Efeito Glow Interno */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                  style={{ backgroundImage: `linear-gradient(to bottom right, ${color}15, transparent)` }} 
                />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#0F1A2A] border border-white/[0.05] flex items-center justify-center shadow-inner group-hover:border-opacity-50 transition-colors shrink-0" style={{ borderColor: `${color}30` }}>
                    <span className="text-3xl grayscale-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ filter: status.isZero ? 'grayscale(100%) opacity(50%)' : `drop-shadow(0 0 10px ${color}70)` }}>
                      {icon}
                    </span>
                  </div>
                  <span className="bg-[#0F172A] px-3 py-1.5 rounded-full border border-white/[0.05] text-[10px] uppercase font-bold tracking-widest text-slate-300 shadow-inner group-hover:text-white transition-colors">
                    Nível {status.nivel}
                  </span>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-white text-xl font-bold tracking-tight mb-4 transition-colors duration-300" 
                      onMouseEnter={(e) => e.currentTarget.style.color = color} 
                      onMouseLeave={(e) => e.currentTarget.style.color = "white"}>
                    {materia}
                  </h3>

                  <div>
                    <div className="flex justify-between items-end mb-1.5 text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{status.isZero ? 'Bloqueado' : 'XP Acumulado'}</span>
                      <span style={{ color: status.isZero ? '#64748b' : color }}>
                        {status.isZero ? '0%' : `${Math.round(status.porcentagem)}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0F172A] rounded-full overflow-hidden border border-white/[0.02]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${status.porcentagem}%` }}
                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                        className="h-full rounded-full shadow-inner"
                        style={{ backgroundColor: status.isZero ? '#334155' : color, boxShadow: status.isZero ? 'none' : `0 0 15px ${color}80` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Modal de Subáreas Modernizado */}
      <AnimatePresence>
        {materiaAtiva && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
            {/* Fundo Desfocado Base */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMateriaAtiva(null)}
              className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-md"
            />
            
            {/* Cartão do Modal usando cores dinâmicas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#151F32] rounded-3xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
              style={{ 
                border: `1px solid ${estruturaModos[materiaAtiva].color}50`, 
                boxShadow: `0 30px 100px rgba(0,0,0,0.8), 0 0 40px ${estruturaModos[materiaAtiva].color}25` 
              }}
            >
              {/* Header do Modal */}
              <div className="p-6 md:p-8 border-b border-white/[0.05] bg-[#0F172A] flex justify-between items-start shrink-0 relative overflow-hidden">
                {/* Glow de fundo do header */}
                <div 
                  className="absolute inset-0 z-0 pointer-events-none" 
                  style={{ background: `radial-gradient(circle at top right, ${estruturaModos[materiaAtiva].color}30, transparent 70%)` }} 
                />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#151F32] border border-white/[0.05] flex items-center justify-center shadow-inner" style={{ borderColor: `${estruturaModos[materiaAtiva].color}50` }}>
                    <span className="text-2xl filter drop-shadow-md">{estruturaModos[materiaAtiva].icon}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-0.5" style={{ color: estruturaModos[materiaAtiva].color }}>Foco do Plantão</span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{materiaAtiva}</h2>
                  </div>
                </div>
                
                <button 
                  onClick={() => setMateriaAtiva(null)} 
                  className="w-10 h-10 rounded-full bg-[#151F32] flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/[0.05] z-10 shrink-0"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${estruturaModos[materiaAtiva].color}80`;
                    e.currentTarget.style.backgroundColor = `${estruturaModos[materiaAtiva].color}20`;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `rgba(255,255,255,0.05)`;
                    e.currentTarget.style.backgroundColor = `#151F32`;
                    e.currentTarget.style.color = '#94a3b8'; // text-slate-400
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo do Modal com Scroll */}
              <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-[#0B1120] relative">
                <p className="text-slate-400 text-sm mb-6 pb-4 border-b border-white/[0.02]">
                  Escolha o tópico de especialização para gerar as cruzadinhas.
                </p>

                <div className="space-y-3">
                  {estruturaModos[materiaAtiva].fases.map((subMateria) => {
                    const statusSub = calcularProgressoSubtopico(materiaAtiva, subMateria);
                    const isSelected = subMateriaAtiva === subMateria;
                    const mColor = estruturaModos[materiaAtiva].color;

                    return (
                      <button
                        key={subMateria}
                        onClick={() => setSubMateriaAtiva(subMateria)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex justify-between items-center group relative overflow-hidden ${
                          isSelected
                            ? "shadow-lg"
                            : "bg-[#151F32] border-white/[0.02] hover:bg-[#1a263d]"
                        }`}
                        style={isSelected ? { 
                          backgroundColor: `${mColor}15`, 
                          borderColor: `${mColor}60`,
                          boxShadow: `0 0 20px ${mColor}20`
                        } : {
                          // Inline hover styles logic for not-selected
                        }}
                        onMouseEnter={(e) => {
                          if(!isSelected) e.currentTarget.style.borderColor = `${mColor}30`;
                        }}
                        onMouseLeave={(e) => {
                          if(!isSelected) e.currentTarget.style.borderColor = `rgba(255,255,255,0.02)`;
                        }}
                      >
                        {isSelected && (
                           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, ${mColor}, transparent)` }} />
                        )}

                        <div className="flex flex-col gap-1 relative z-10">
                          <span className={`text-base font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                            {subMateria}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${isSelected ? '' : 'text-slate-500'}`} style={isSelected ? { color: mColor } : {}}>
                            Nível {statusSub.nivel} • {statusSub.xpNesteNivel}/{statusSub.xpParaUpar} XP
                          </span>
                        </div>
                        
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: mColor, boxShadow: `0 0 10px ${mColor}` }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer do Modal (Botão) */}
              <div className="p-6 md:p-8 bg-[#0F172A] border-t border-white/[0.05] shrink-0">
                <button
                  disabled={!subMateriaAtiva}
                  onClick={() => iniciarJogo(materiaAtiva, subMateriaAtiva)}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 text-sm font-bold uppercase tracking-widest shrink-0 ${
                    subMateriaAtiva
                      ? "text-[#0B1120]"
                      : "bg-[#151F32] text-slate-500 cursor-not-allowed border border-white/[0.05]"
                  }`}
                  style={subMateriaAtiva ? {
                    backgroundColor: estruturaModos[materiaAtiva].color,
                    boxShadow: `0 0 30px ${estruturaModos[materiaAtiva].color}60`
                  } : {}}
                  onMouseEnter={(e) => {
                    if(subMateriaAtiva) {
                      e.currentTarget.style.filter = 'brightness(1.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if(subMateriaAtiva) {
                      e.currentTarget.style.filter = 'brightness(1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Play className={`w-5 h-5 transition-colors ${subMateriaAtiva ? "fill-[#0B1120]" : "fill-slate-500"}`} />
                  Iniciar Plantão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Estilos Globais Internos da Tela */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}} />
    </div>
  );
}