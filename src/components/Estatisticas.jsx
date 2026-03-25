import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import {
  ArrowLeft, Flame, Trophy, Activity, TextCursorInput, Brain, HeartPulse, Bone, Pill, Stethoscope, Shield, Microscope, Dna, Bug
} from "lucide-react";
import { motion } from "framer-motion";

// ==========================================
// 🧠 DICIONÁRIO DE TRADUÇÃO (REVERSE LOOKUP)
// ==========================================
const ESTRUTURA_MODOS = {
  'Anatomia': { icon: Bone, color: '#38bdf8', epic: 'Arquiteto Esquelético', fases: ['Sistema esquelético', 'Sistema muscular', 'Sistema nervoso', 'Sistema circulatório', 'Sistema linfático', 'Sistema respiratório', 'Sistema digestório', 'Sistema urinário', 'Sistema reprodutor', 'Sistema endócrino', 'Sistema tegumentar'] },
  'Farmacologia': { icon: Pill, color: '#10b981', epic: 'O Alquimista Químico', fases: ['Medicamentos', 'Classes de medicamentos', 'Mecanismos de ação', 'Receptores', 'Enzimas'] },
  'Microbiologia': { icon: Bug, color: '#eab308', epic: 'Caçador de Vírus', fases: ['Vírus', 'Bactérias', 'Fungos', 'Parasitas'] },
  'Histologia': { icon: Dna, color: '#06b6d4', epic: 'Mestre Celular', fases: ['Células', 'Tecidos', 'Epitelios', 'Matriz', 'Organelas'] },
  'Imunologia': { icon: Shield, color: '#ec4899', epic: 'Guardião Imune', fases: ['Imunologia'] },
  'Patologia': { icon: Microscope, color: '#f97316', epic: 'Caçador de Doenças', fases: ['Doencas', 'Exames'] }
};

// Constrói um mapa rápido para traduzir a chave do Firebase (ex: "ANATOMIA-SISTEMAESQUELETICO") de volta para o visual
const MAPA_REVERSO = {};
Object.keys(ESTRUTURA_MODOS).forEach(area => {
  const areaBlindada = area.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  ESTRUTURA_MODOS[area].fases.forEach(fase => {
    const faseBlindada = fase.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    MAPA_REVERSO[`${areaBlindada}-${faseBlindada}`] = {
      areaOriginal: area,
      faseOriginal: fase,
      icon: ESTRUTURA_MODOS[area].icon,
      color: ESTRUTURA_MODOS[area].color,
      epic: ESTRUTURA_MODOS[area].epic
    };
  });
});

export default function Estatisticas({ dadosUsuario, setTelaAtual }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const estatisticas = dadosUsuario?.estatisticas || {};
  const statsGerais = dadosUsuario?.estatisticasGerais || {};
  const xpTopicos = dadosUsuario?.xpTopicos || {};

  const dadosProcessados = useMemo(() => {
    let maiorNivel = { materia: 'Nenhuma', nivel: 0 };
    let maiorLetras = { materia: 'Nenhuma', total: 0 };
    let melhorTempoAbsoluto = Infinity;
    let tempoGeralTotal = 0;
    let partidasGeraisTotal = 0;
    
    const graficoPieMap = {};
    const especialidadesCards = [];

    // 1. Analisa os Níveis (XP) e monta os Cards Específicos por Subtópico
    Object.keys(xpTopicos).forEach(chave => {
      const xp = xpTopicos[chave];
      if (xp > 0) {
        const nivel = Math.floor(Math.sqrt(xp / 1000)) + 1;
        
        // O NOSSO TRADUTOR EM AÇÃO
        const info = MAPA_REVERSO[chave] || {
          areaOriginal: chave.split('-')[0] || 'Especialidade',
          faseOriginal: chave.split('-')[1] || chave,
          icon: HeartPulse,
          color: '#3b82f6',
          epic: 'Plantonista Geral'
        };

        if (nivel > maiorNivel.nivel) {
          maiorNivel = { materia: info.faseOriginal, nivel: nivel };
        }

        const xpProximoNivel = Math.pow(nivel, 2) * 1000;
        const xpNivelAtualBase = Math.pow(nivel - 1, 2) * 1000;
        const xpNesteNivel = xp - xpNivelAtualBase; 
        const xpParaUpar = xpProximoNivel - xpNivelAtualBase; 
        const porcentagem = xpNesteNivel === 0 ? 0 : Math.round((xpNesteNivel / xpParaUpar) * 100);

        especialidadesCards.push({
          id: chave,
          title: info.faseOriginal, // Ex: "Sistema esquelético"
          areaInfo: `${info.areaOriginal} • ${info.epic}`, // Ex: "Anatomia • Arquiteto Esquelético"
          icon: info.icon,
          color: info.color,
          progress: porcentagem,
          xpStr: xp > 1000 ? `${(xp/1000).toFixed(1)}k` : xp.toString(),
          nivel: nivel,
          tempoMedioRaw: 0,
          partidasNoSubtopico: 0
        });
      }
    });

    // 2. Analisa as Estatísticas de Partida (Tempo, Letras, etc)
    Object.keys(estatisticas).forEach(chave => {
      const stats = estatisticas[chave];
      
      if (stats.partidas > 0) {
        tempoGeralTotal += stats.tempo;
        partidasGeraisTotal += stats.partidas;

        const info = MAPA_REVERSO[chave] || { areaOriginal: chave.split('-')[0] || 'Geral', faseOriginal: chave.split('-')[1] || chave };

        if (stats.letras > maiorLetras.total) maiorLetras = { materia: info.faseOriginal, total: stats.letras };
        if (stats.melhorTempo && stats.melhorTempo < melhorTempoAbsoluto) melhorTempoAbsoluto = stats.melhorTempo;

        const tempoMedioSegundos = Math.floor(stats.tempo / stats.partidas);

        // Alimenta o gráfico de rosca agrupando pela Área Maior (ex: todas as partidas de Anatomia)
        graficoPieMap[info.areaOriginal] = (graficoPieMap[info.areaOriginal] || 0) + stats.partidas;

        // Atualiza o tempo médio e partidas no Card do Subtópico exato
        const cardIndex = especialidadesCards.findIndex(c => c.id === chave);
        if (cardIndex !== -1) {
          especialidadesCards[cardIndex].tempoMedioRaw = tempoMedioSegundos;
          especialidadesCards[cardIndex].partidasNoSubtopico = stats.partidas;
        }
      }
    });

    // 3. Formata os dados para o Gráfico de Rosca
    const dadosGraficoPie = Object.keys(graficoPieMap).map(area => ({
      name: area,
      value: graficoPieMap[area]
    })).sort((a, b) => b.value - a.value);

    let materiaDominanteTexto = "Sem Dados";
    let porcentagemDominante = 0;
    if (dadosGraficoPie.length > 0) {
      const campeao = dadosGraficoPie[0];
      porcentagemDominante = Math.round((campeao.value / partidasGeraisTotal) * 100);
      materiaDominanteTexto = campeao.name;
    }

    // 4. Formata o Histórico para o Gráfico de Linha
    const historicoData = (statsGerais.historico || []).map((h, i) => ({
      name: `Dia ${i + 1}`,
      Tempo: h.tempo,
      Erros: h.erros,
      materia: MAPA_REVERSO[`${h.materia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()}`]?.faseOriginal || h.materia
    }));

    const chartDataFull = [...historicoData];
    if (chartDataFull.length > 0 && chartDataFull.length < 30) {
      const last = chartDataFull[chartDataFull.length - 1];
      for(let i = chartDataFull.length; i < 30; i++) {
        chartDataFull.push({ name: `Dia ${i+1}`, Tempo: last.Tempo, Erros: 0 });
      }
    }

    const mediaErros = partidasGeraisTotal > 0 ? (statsGerais.errosTotais / partidasGeraisTotal).toFixed(1) : 0;

    return {
      maiorLetras,
      melhorTempoAbsoluto: melhorTempoAbsoluto === Infinity ? 0 : melhorTempoAbsoluto,
      partidasGeraisTotal,
      mediaErros,
      dadosGraficoPie,
      materiaDominanteTexto,
      porcentagemDominante,
      historicoData: chartDataFull,
      streakAtual: statsGerais.streakAtual || 0,
      maiorStreak: statsGerais.maiorStreak || 0,
      maiorPalavra: statsGerais.maiorPalavra || 0,
      especialidadesCards: especialidadesCards.sort((a,b) => b.nivel - a.nivel) // Ordena do maior nível para o menor
    };
  }, [estatisticas, xpTopicos, statsGerais]);

  const formatarTempo = (segundos) => {
    if (segundos == null || isNaN(segundos) || segundos === 0) return "00:00";
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  const CORES = ['#a855f7', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-x-hidden flex flex-col selection:bg-purple-500/30">
      
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.05)_0%,#0B1120_60%)]" />

      <div className="max-w-[1400px] mx-auto px-6 py-6 md:py-8 relative z-10 flex flex-col h-full w-full">

        <header className="flex items-center gap-4 mb-6 shrink-0">
          <button onClick={() => setTelaAtual("menu")} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#151F32] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/30 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
              📈 Dashboard Analítico
            </h1>
            <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Desempenho e histórico de plantões.</p>
          </div>
        </header>

        {dadosProcessados.partidasGeraisTotal === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 opacity-50">📂</div>
            <h2 className="text-white text-2xl font-bold mb-2">Prontuário Vazio</h2>
            <p className="text-slate-500 text-sm">Conclua seu primeiro plantão para gerar estatísticas detalhadas.</p>
          </div>
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 shrink-0"
            >
              {[
                { label: 'Streak Atual', value: dadosProcessados.streakAtual.toString(), sub: 'Dias', icon: Flame, glow: '#f97316', iconColor: 'text-orange-400' },
                { label: 'Maior Streak', value: dadosProcessados.maiorStreak.toString(), sub: 'Dias', icon: Trophy, glow: '#eab308', iconColor: 'text-yellow-400' },
                { label: 'Taxa de Erros', value: dadosProcessados.mediaErros.toString(), sub: 'Média ⚠️', icon: Activity, glow: '#ef4444', iconColor: 'text-red-500' },
                { label: 'Maior Palavra', value: dadosProcessados.maiorPalavra > 0 ? dadosProcessados.maiorPalavra.toString() : '-', sub: 'Letras', icon: TextCursorInput, glow: '#00e5ff', iconColor: 'text-cyan-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#151F32] rounded-2xl p-4 md:p-5 border border-white/[0.02] shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-20 h-20 blur-[30px] rounded-full pointer-events-none opacity-10 group-hover:opacity-20 transition-all" style={{ backgroundColor: s.glow }} />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl border border-white/[0.05]" style={{ backgroundColor: `${s.glow}10`, borderColor: `${s.glow}20` }}>
                      <s.icon className={`w-4 h-4 md:w-5 md:h-5 ${s.iconColor}`} style={{ filter: `drop-shadow(0 0 8px ${s.glow}80)` }} />
                    </div>
                    <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">{s.value}</span>
                    <span className="text-slate-500 text-xs font-bold">{s.sub}</span>
                  </div>
                </div>
              ))}
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 md:gap-6 mb-6">
              <motion.section
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-[#151F32] rounded-3xl p-5 md:p-6 border border-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-white text-base md:text-lg font-bold">Evolução do Tempo (Segundos)</h2>
                    <p className="text-slate-500 text-xs">Últimas 30 Partidas</p>
                  </div>
                  <div className="flex bg-[#0F172A] rounded-lg p-1 border border-white/[0.05]">
                    <span className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#1e293b] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]">Velocidade</span>
                  </div>
                </div>

                <div className="w-full h-[200px] md:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosProcessados.historicoData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                      />
                      <Line type="monotone" dataKey="Tempo" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-[#151F32] rounded-3xl p-5 md:p-6 border border-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center"
              >
                <div className="w-full text-left mb-2">
                  <h2 className="text-white text-base md:text-lg font-bold">Foco Global</h2>
                  <p className="text-slate-500 text-xs">Agrupado por Área Pai</p>
                </div>
                
                <div className="w-full flex-1 relative min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dadosProcessados.dadosGraficoPie} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" paddingAngle={5} dataKey="value" stroke="none">
                        {dadosProcessados.dadosGraficoPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-3xl md:text-4xl font-black text-white">{dadosProcessados.porcentagemDominante}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 max-w-[80px] truncate">{dadosProcessados.materiaDominanteTexto}</div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* ─── EPIC TITLES & SPECIALTIES GRID (SUBÁREAS) ─── */}
            <motion.section
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
              className="flex-1 min-h-0 flex flex-col mb-8"
            >
              <div className="mb-4">
                <h2 className="text-white text-lg font-bold">Títulos Épicos & Domínio por Subtópico</h2>
                <p className="text-slate-500 text-xs uppercase tracking-widest">O seu progresso detalhado em cada ala jogada.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {dadosProcessados.especialidadesCards.map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={spec.id}
                      className="bg-[#151F32] rounded-2xl p-5 border border-white/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:bg-[#1a263d] hover:border-white/[0.05] transition-colors group relative overflow-hidden flex flex-col"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity pointer-events-none" style={{ background: `radial-gradient(circle at bottom right, ${spec.color}, transparent 60%)` }} />

                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0" style={{ backgroundColor: `${spec.color}15`, borderColor: `${spec.color}30` }}>
                          <Icon className="w-5 h-5" style={{ color: spec.color, filter: `drop-shadow(0 0 8px ${spec.color}80)` }} />
                        </div>
                        <div className="min-w-0">
                          {/* O NOVO TRADUTOR MOSTRA O SUBTÓPICO PERFEITO AQUI */}
                          <h3 className="text-white text-sm font-bold truncate">{spec.title}</h3>
                          <span className="text-[9px] italic truncate block font-medium" style={{ color: spec.color }}>{spec.areaInfo}</span>
                        </div>
                      </div>

                      <div className="mb-3 relative z-10">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                          <span className="text-slate-500">Nível {spec.nivel}</span>
                          <span style={{ color: spec.color }}>{spec.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0B1120] rounded-full overflow-hidden border border-white/[0.05]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${spec.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: index * 0.1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: spec.color, boxShadow: `0 0 10px ${spec.color}80` }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto relative z-10 flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase text-slate-500 font-bold tracking-widest">Tempo Médio</span>
                          <span className="text-white font-mono text-xs">{formatarTempo(spec.tempoMedioRaw)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[8px] uppercase text-slate-500 font-bold tracking-widest">Partidas</span>
                          <span className="text-white font-mono text-xs">{spec.partidasNoSubtopico}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          </>
        )}
      </div>
    </div>
  );
}