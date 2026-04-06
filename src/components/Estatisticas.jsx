import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, User, Activity, Trophy, ShieldAlert, TrendingUp, Flame, Stethoscope, Clock, Ticket, Medal, Syringe, HeartPulse, BookOpen, PenTool, Award } from 'lucide-react';

const DOCTOR_NAMES = {
  house: 'Dr. House', cameron: 'Dra. Cameron', foreman: 'Dr. Foreman', 
  chase: 'Dr. Chase', treze: 'Treze', wilson: 'Dr. Wilson', 
  taub: 'Dr. Taub', kutner: 'Dr. Kutner', cuddy: 'Dra. Cuddy'
};

const getPatente = (nivel) => {
  if (nivel <= 5) return { titulo: 'Estudante (Básico)', cor: '#64748b' };
  if (nivel <= 15) return { titulo: 'Estudante (Clínico)', cor: '#0ea5e9' };
  if (nivel <= 30) return { titulo: 'Interno', cor: '#8b5cf6' };
  if (nivel <= 50) return { titulo: 'Residente (R1)', cor: '#f59e0b' };
  if (nivel <= 80) return { titulo: 'Médico Especialista', cor: '#ef4444' };
  return { titulo: 'Chefe de Plantão', cor: '#10b981' };
};

const formatTime = (totalSeconds) => {
  if (!totalSeconds) return '0 min';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
};

export default function Estatisticas({ setTelaAtual, dadosUsuario }) {
  const [activeTab, setActiveTab] = useState('geral'); 

  // --- TRATAMENTO DE DADOS ---
  const statsDDX = dadosUsuario?.estatisticas || {};
  const statsCruzadinhaGerais = dadosUsuario?.estatisticasGerais || {};
  
  // 1. Métricas Gerais
  const xpTotal = dadosUsuario?.pontuacaoTotal || 0;
  const streakAtual = statsCruzadinhaGerais?.streakAtual || 0;
  const maiorStreak = statsCruzadinhaGerais?.maiorStreak || 0;
  const ticketsTotais = dadosUsuario?.tickets || 0;

  let somaNiveis = 0;
  Object.values(dadosUsuario?.xpTopicos || {}).forEach(xp => {
    if (xp > 0) somaNiveis += Math.floor(Math.sqrt(xp / 1000)) + 1;
  });
  const patenteAtual = getPatente(somaNiveis);

  // 2. Métricas Clínicas (DDX)
  const vitorias = statsDDX?.partidas_ganhas || 0;
  const derrotas = statsDDX?.partidas_perdidas || 0;
  const mortesErro = statsDDX?.mortes_por_erro || 0;
  const processos = statsDDX?.processos_judiciais || 0;
  const tempoDDX = statsDDX?.tempo_total_jogado || 0;
  const totalCasos = vitorias + derrotas;
  const taxaSobrevivencia = totalCasos > 0 ? Math.round((vitorias / totalCasos) * 100) : 0;

  const medicos = statsDDX?.medicos_recrutados || {};
  const medicoFavoritoId = Object.keys(medicos).sort((a, b) => medicos[b] - medicos[a])[0];
  const medicoFavoritoNome = medicoFavoritoId ? DOCTOR_NAMES[medicoFavoritoId] : 'Nenhum';

  const especialidades = statsDDX?.especialidades || {};
  const especialidadeMaisJogada = Object.keys(especialidades).sort((a, b) => especialidades[b] - especialidades[a])[0] || 'Nenhuma';

  const dadosGraficoSobrevivencia = [
    { name: 'Vidas Salvas', value: vitorias, color: '#10b981' }, 
    { name: 'Óbitos', value: derrotas, color: '#ef4444' } 
  ];

  // 3. Métricas das Cruzadinhas
  const maiorPalavra = statsCruzadinhaGerais?.maiorPalavra || 0;
  const errosTotaisCruz = statsCruzadinhaGerais?.errosTotais || 0;
  const historicoCru = statsCruzadinhaGerais?.historico || [];
  
  let totalLetrasCruzadinha = 0;
  let tempoCruzadinha = 0;
  Object.values(dadosUsuario?.estatisticas || {}).forEach(stat => {
    if (typeof stat === 'object' && stat.letras !== undefined) {
      totalLetrasCruzadinha += stat.letras;
      tempoCruzadinha += stat.tempo;
    }
  });

  const dadosGraficoHistorico = useMemo(() => {
    return historicoCru.slice(-10).map((partida, index) => ({
      name: `P${index + 1}`,
      Letras: partida.letrasCorretas || 0,
      Erros: partida.erros || 0
    }));
  }, [historicoCru]);

  // Ícone de Marca d'Água dinâmico
  const WatermarkIcon = activeTab === 'geral' ? User : activeTab === 'clinico' ? HeartPulse : PenTool;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans flex flex-col overflow-hidden relative">
      
      {/* BACKGROUND & WATERMARK */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
         <WatermarkIcon className="w-[80vw] h-[80vw] text-slate-800 opacity-[0.15] rotate-[-15deg] transform scale-150" />
      </div>

      {/* HEADER */}
      <header className="px-6 py-8 md:px-12 md:pt-12 md:pb-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <button onClick={() => setTelaAtual('menu')} className="w-10 h-10 rounded-full bg-[#151F32] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all shadow-lg group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Dossiê Médico</h1>
            <p className="text-xs text-cyan-500 uppercase tracking-[0.2em] font-bold mt-1">Estatísticas e Telemetria</p>
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="px-6 md:px-12 flex gap-2 md:gap-4 border-b border-white/[0.05] relative z-10 overflow-x-auto pb-px scrollbar-hide">
        {[
          { id: 'geral', label: 'Perfil Geral', icon: User },
          { id: 'clinico', label: 'UTI (DDX)', icon: HeartPulse },
          { id: 'teorico', label: 'Cruzadinhas', icon: BookOpen }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
            )}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative z-10 pb-32">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* ABA: PERFIL GERAL */}
            {activeTab === 'geral' && (
              <motion.div key="geral" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Cartão XP */}
                <div className="col-span-1 md:col-span-2 bg-[#151F32] rounded-3xl p-8 border border-cyan-500/20 shadow-lg relative overflow-hidden flex items-center justify-between">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-cyan-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 mb-2"><Award className="w-4 h-4" /> Experiência Global</span>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">{xpTotal.toLocaleString()}</h2>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Pontos de experiência acumulados.</p>
                  </div>
                  <div className="hidden sm:flex w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/30 items-center justify-center relative z-10">
                    <Trophy className="w-10 h-10 text-cyan-400" />
                  </div>
                </div>

                {/* Cartão Patente */}
                <div className="col-span-1 md:col-span-2 bg-[#151F32] rounded-3xl p-8 border border-white/[0.05] shadow-lg flex items-center gap-6 relative overflow-hidden">
                   <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none"><Medal className="w-48 h-48" style={{ color: patenteAtual.cor }} /></div>
                   <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${patenteAtual.cor}20`, borderColor: `${patenteAtual.cor}50` }}>
                     <Medal className="w-8 h-8" style={{ color: patenteAtual.cor }} />
                   </div>
                   <div className="relative z-10">
                     <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 block">Patente Atual</span>
                     <h3 className="text-2xl font-black mb-1" style={{ color: patenteAtual.cor }}>{patenteAtual.titulo}</h3>
                     <p className="text-xs text-slate-500">Nível de carreira somado: <strong className="text-white">{somaNiveis}</strong></p>
                   </div>
                </div>

                {/* Cartão Streak */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-orange-500/10 to-[#151F32] rounded-3xl p-8 border border-orange-500/20 shadow-lg flex flex-col justify-center">
                  <span className="text-orange-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 mb-2"><Flame className="w-4 h-4" /> Sequência de Plantões</span>
                  <div className="flex items-end gap-2">
                    <h2 className="text-5xl font-black text-white">{streakAtual}</h2>
                    <span className="text-orange-500 font-bold mb-1">Dias</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-3">Seu recorde máximo foi de <strong className="text-white">{maiorStreak} dias</strong> seguidos.</p>
                </div>

                {/* Cartão Tickets */}
                <div className="col-span-1 md:col-span-2 bg-[#151F32] rounded-3xl p-8 border border-emerald-500/20 shadow-lg flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-emerald-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 mb-2"><Ticket className="w-4 h-4" /> Recursos Disponíveis</span>
                    <h2 className="text-5xl font-black text-white tracking-tighter">{ticketsTotais}</h2>
                    <p className="text-slate-400 text-xs mt-2">Tickets de UTI guardados no inventário.</p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative z-10">
                    <Ticket className="w-8 h-8 text-emerald-400 rotate-45" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ABA: DESEMPENHO CLÍNICO (DDX) */}
            {activeTab === 'clinico' && (
              <motion.div key="clinico" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Gráfico de Sobrevivência */}
                  <div className="col-span-1 lg:col-span-2 bg-[#151F32] rounded-3xl p-8 border border-white/[0.05] shadow-lg flex flex-col items-center relative">
                    <div className="w-full flex justify-between items-center mb-6">
                       <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold">Taxa de Sobrevivência</h3>
                       <span className="bg-slate-800 text-slate-300 text-[10px] px-3 py-1 rounded-full font-bold">{totalCasos} Casos Totais</span>
                    </div>
                    {totalCasos > 0 ? (
                      <div className="relative w-full h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={dadosGraficoSobrevivencia} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                              {dadosGraficoSobrevivencia.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className={`text-5xl font-black ${taxaSobrevivencia >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{taxaSobrevivencia}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-600">
                        <Activity className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">Sem Plantões DDX</p>
                      </div>
                    )}
                    <div className="flex gap-8 mt-4 w-full justify-center">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" /><span className="text-sm text-white font-bold">{vitorias} Salvos</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#ef4444]" /><span className="text-sm text-white font-bold">{derrotas} Óbitos <span className="text-slate-500 text-xs ml-1">({mortesErro} por Erro)</span></span></div>
                    </div>
                  </div>

                  <div className="col-span-1 flex flex-col gap-6">
                    {/* Cartão de Processos Judiciais */}
                    <div className={`flex-1 rounded-3xl p-6 border shadow-lg flex items-center gap-5 relative overflow-hidden ${processos > 0 ? 'bg-rose-950/30 border-rose-500/30' : 'bg-[#151F32] border-white/[0.05]'}`}>
                      <div className="relative z-10">
                        <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 block ${processos > 0 ? 'text-rose-400' : 'text-slate-500'}`}>Comitê de Ética</span>
                        <h4 className="text-2xl font-black text-white mb-1 flex items-center gap-2">{processos} Processos</h4>
                        <p className={`text-xs leading-relaxed mt-2 ${processos > 0 ? 'text-rose-300/70' : 'text-slate-400'}`}>
                          {processos > 0 ? "A sua negligência causou transferências forçadas." : "Ficha impecável. Sem queixas de pacientes."}
                        </p>
                      </div>
                    </div>

                    {/* Cartão Tempo Total UTI */}
                    <div className="flex-1 bg-[#151F32] rounded-3xl p-6 border border-white/[0.05] shadow-lg flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Horas em Plantão</span>
                        <h4 className="text-xl font-bold text-white mb-1">{formatTime(tempoDDX)}</h4>
                        <p className="text-slate-400 text-[10px] uppercase">Tempo total dentro da UTI.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Especialidade Mais Jogada */}
                   <div className="bg-[#151F32] rounded-3xl p-6 border border-white/[0.05] shadow-lg flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                        <Syringe className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Ala mais Frequente</span>
                        <h4 className="text-lg font-bold text-white mb-0.5">{especialidadeMaisJogada}</h4>
                      </div>
                    </div>

                    {/* Cartão Médico Favorito */}
                    <div className="bg-[#151F32] rounded-3xl p-6 border border-white/[0.05] shadow-lg flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 block">Especialista de Confiança</span>
                        <h4 className="text-lg font-bold text-white mb-0.5">{medicoFavoritoNome}</h4>
                      </div>
                    </div>
                </div>

              </motion.div>
            )}

            {/* ABA: CRUZADINHAS */}
            {activeTab === 'teorico' && (
              <motion.div key="teorico" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Partidas Jogadas */}
                  <div className="bg-[#151F32] rounded-3xl p-6 border border-white/[0.05] shadow-lg">
                    <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Casos Teóricos</span>
                    <h3 className="text-4xl font-black text-white mb-1">{historicoCru.length}</h3>
                    <p className="text-slate-400 text-xs">Cruzadinhas finalizadas.</p>
                  </div>

                  {/* Total de Letras */}
                  <div className="bg-[#151F32] rounded-3xl p-6 border border-white/[0.05] shadow-lg">
                    <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Termos Escritos</span>
                    <h3 className="text-4xl font-black text-white mb-1">{totalLetrasCruzadinha}</h3>
                    <p className="text-slate-400 text-xs">Letras certas ao longo do tempo.</p>
                  </div>

                  {/* Total de Erros */}
                  <div className="bg-[#151F32] rounded-3xl p-6 border border-white/[0.05] shadow-lg">
                    <span className="text-rose-400 text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> Diagnósticos Errados</span>
                    <h3 className="text-4xl font-black text-white mb-1">{errosTotaisCruz}</h3>
                    <p className="text-slate-400 text-xs">Tentativas incorretas.</p>
                  </div>
                </div>

                {/* Gráfico de Linha - Histórico de Acertos */}
                <div className="bg-[#151F32] rounded-3xl p-6 md:p-8 border border-white/[0.05] shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Curva de Aprendizagem</h3>
                      <p className="text-xs text-slate-400">Desempenho (Letras vs Erros) nas últimas 10 partidas.</p>
                    </div>
                    {/* Maior Palavra */}
                    <div className="bg-[#0B1120] px-4 py-2 rounded-xl border border-white/[0.05] flex items-center gap-3">
                       <span className="text-slate-500 text-[10px] uppercase font-bold">Maior Palavra:</span>
                       <span className="text-emerald-400 font-mono font-bold text-sm">{maiorPalavra} Letras</span>
                    </div>
                  </div>

                  {historicoCru.length > 0 ? (
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dadosGraficoHistorico} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          />
                          <Line type="monotone" name="Letras Certas" dataKey="Letras" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0B1120', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#10b981' }} />
                          <Line type="monotone" name="Erros" dataKey="Erros" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ef4444' }} opacity={0.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                     <div className="h-64 flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/[0.05] rounded-2xl">
                       <PenTool className="w-10 h-10 mb-3 opacity-20" />
                       <p className="text-sm font-bold uppercase tracking-widest">Sem Histórico Suficiente</p>
                     </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}