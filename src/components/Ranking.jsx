import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Crown, Trophy, Flame } from "lucide-react";
import { motion } from "framer-motion";
import StitchBrand from './ui/StitchBrand';
import { resumirCruzadinhas } from '../utils/progressoCruzadinha';
import { nivelPorXP } from '../utils/economia';
import { obterPatente } from '../utils/patentes';
import { buscarRankingPublico, calcularIdPublico, sincronizarRanking } from '../services/rankingPublico';

// ==========================================
// 🌻 SISTEMA DE PARTÍCULAS DO EASTER EGG (INTOCADO)
// ==========================================
const ParticulaRomantica = ({ id, texto, posicaoInicial, duracao, tamanho, derivaH, onFinalizar }) => {

  useEffect(() => {
    const timer = setTimeout(() => onFinalizar(id), duracao * 1000);
    return () => clearTimeout(timer);
  }, [id, duracao, onFinalizar]);

  return (
    <div
      style={{
        position: 'fixed', bottom: '80px', left: `${posicaoInicial}px`, 
        fontSize: `${tamanho}rem`, fontWeight: 'bold', color: '#d4004b',
        opacity: 0.9, pointerEvents: 'none', zIndex: 10000,
        animation: `flutuarRomantico ${duracao}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
        '--deriva-horizontal': `${derivaH}px` 
      }}
    >
      {texto}
    </div>
  );
};

const PODIUM_CONFIG = [
  { idx: 1, order: "order-1", height: "h-20", avatarSize: "w-12 h-12", borderColor: "border-slate-400", glowColor: "rgba(185,202,196,0.4)", labelBg: "bg-slate-400", labelText: "2º", medalColor: "text-slate-300" },
  { idx: 0, order: "order-2", height: "h-28", avatarSize: "w-16 h-16", borderColor: "border-amber-400", glowColor: "rgba(255,185,95,0.5)", labelBg: "bg-amber-400", labelText: "1º", medalColor: "text-amber-400" },
  { idx: 2, order: "order-3", height: "h-16", avatarSize: "w-11 h-11", borderColor: "border-violet-500", glowColor: "rgba(139,92,246,0.4)", labelBg: "bg-violet-500", labelText: "3º", medalColor: "text-violet-400" },
];

export default function Ranking({ usuario, dadosUsuario, setTelaAtual }) {
  const [abaAtual, setAbaAtual] = useState('global');
  const [criterioOrdenacao, setCriterioOrdenacao] = useState('nivel');
  
  const [particulas, setParticulas] = useState([]);
  const [dadosDoBanco, setDadosDoBanco] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroRanking, setErroRanking] = useState(false);
  const [idPublico, setIdPublico] = useState(null);
  const [tentativaRanking, setTentativaRanking] = useState(0);

  // 🌻 EASTER EGG (MANTIDO)
  const dispararParticulas = () => {
    const novosItens = [];
    const opcoesTexto = ['R', 'C', '❤️']; 
    for (let i = 0; i < 10; i++) {
      novosItens.push({
        id: Date.now() + i, 
        texto: opcoesTexto[Math.floor(Math.random() * opcoesTexto.length)], 
        posicao: Math.random() * (window.innerWidth - 60) + 30, 
        duracao: (Math.random() * 2 + 3).toFixed(2),
        tamanho: (Math.random() * 0.5 + 1).toFixed(2),
        derivaH: (Math.random() * 100 - 50).toFixed(0),
      });
    }
    setParticulas(prev => [...prev, ...novosItens]);
  };

  const removerParticula = (id) => setParticulas(prev => prev.filter(p => p.id !== id));

  const somaNiveisPessoal = nivelPorXP(dadosUsuario?.pontuacaoTotal);
  const resumoPessoal = resumirCruzadinhas(dadosUsuario?.estatisticas);

  const patentePessoal = obterPatente(somaNiveisPessoal);

  // O ranking público recebe apenas as métricas expostas pelo Apps Script.
  useEffect(() => {
    let ativo = true;
    const buscarDados = async () => {
      setCarregando(true);
      setErroRanking(false);
      try {
        const meuId = await calcularIdPublico(usuario.uid);
        if (ativo) setIdPublico(meuId);
        await sincronizarRanking(usuario, dadosUsuario);
        let ranking = [];
        for (let tentativa = 0; tentativa < 4; tentativa++) {
          if (!ativo) return;
          ranking = await buscarRankingPublico();
          const minhaLinha = ranking.find(item => item.idPublico === meuId);
          if (import.meta.env.VITE_FONTE_DADOS === 'planilha' || (minhaLinha && Number(minhaLinha.xpGlobal) === Number(dadosUsuario?.pontuacaoTotal))) break;
          if (tentativa < 3) await new Promise(resolve => setTimeout(resolve, 1500));
        }
        if (!ativo) return;
        setDadosDoBanco(ranking.map((data, index) => {
          const nivel = Number(data.nivelGlobal) || 0;
          const patente = obterPatente(nivel);
          return {
            uid: data.idPublico || `planilha-${index}`,
            nome: String(data.nome || 'Doutor(a)'),
            nivel,
            xpTotal: Number(data.xpGlobal) || 0,
            letras: Number(data.letras) || 0,
            tempoMedio: data.tempoMedio == null ? null : Number(data.tempoMedio),
            patente: patente.titulo,
            cor: patente.cor,
            partidas: Number(data.partidas) || 0,
          };
        }));
      } catch (error) {
        console.error("Erro ao carregar ranking público:", error);
        if (ativo) setErroRanking(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    };
    buscarDados();
    return () => { ativo = false; };
  }, [usuario, dadosUsuario, tentativaRanking]);

  // ==========================================
  // 🎛️ MOTOR DE FILTROS E ORDENAÇÃO
  // ==========================================
  const rankingProcessado = useMemo(() => {
    let lista = [...dadosDoBanco];

    if (criterioOrdenacao === 'nivel') lista.sort((a, b) => b.nivel - a.nivel || b.xpTotal - a.xpTotal || a.uid.localeCompare(b.uid));
    else if (criterioOrdenacao === 'letras') lista.sort((a, b) => b.letras - a.letras || a.uid.localeCompare(b.uid));
    else if (criterioOrdenacao === 'tempo') lista.sort((a, b) => (a.tempoMedio ?? Infinity) - (b.tempoMedio ?? Infinity) || a.uid.localeCompare(b.uid));

    lista = lista.map((m, index) => ({ ...m, posicaoGlobal: index + 1 }));

    if (abaAtual === 'patente') lista = lista.filter(m => m.patente === patentePessoal.titulo);
    else if (abaAtual === 'hall') lista = lista.slice(0, 3);

    return lista.map((m, index) => ({ ...m, posicaoExibida: index + 1 }));
  }, [dadosDoBanco, abaAtual, criterioOrdenacao, patentePessoal]);

  const top3 = rankingProcessado.slice(0, 3);
  const rest = rankingProcessado.slice(3);
  const possuiTempo = dadosDoBanco.some(m => Number.isFinite(m.tempoMedio));

  // ==========================================
  // 🎯 MATEMÁTICA DE RIVALIDADE (RADAR)
  // ==========================================
  const meuIndex = rankingProcessado.findIndex(m => m.uid === idPublico);
  const eu = meuIndex >= 0 ? rankingProcessado[meuIndex] : null;
  let tituloRadar = eu ? `#${eu.posicaoGlobal} do Mundo` : 'Sua posição';
  let textoRadar = eu ? 'Continue jogando para subir posições!' : 'Você ainda não aparece no Top 100 da temporada.';
  if (!eu && abaAtual === 'hall') textoRadar = 'Chegue ao Top 3 para entrar no Hall da Fama!';
  else if (!eu && abaAtual === 'patente') textoRadar = 'Você ainda não aparece nesta patente.';
  else if (meuIndex === 0) textoRadar = 'Você lidera esta lista!';
  else if (meuIndex > 0) {
    const rival = rankingProcessado[meuIndex - 1];
    if (criterioOrdenacao === 'nivel') textoRadar = `Faltam ${rival.nivel - eu.nivel + 1} níveis para passar o #${rival.posicaoExibida}.`;
    else if (criterioOrdenacao === 'letras') textoRadar = `Faltam ${rival.letras - eu.letras + 1} acertos para passar o #${rival.posicaoExibida}.`;
    else if (eu.tempoMedio == null) textoRadar = 'Jogue uma cruzadinha para registrar seu tempo médio.';
    else textoRadar = `Reduza ${Math.max(1, eu.tempoMedio - rival.tempoMedio + 1)}s para passar o #${rival.posicaoExibida}.`;
  }

  return (
    <div className="stitch-integrated stitch-ranking min-h-screen bg-[#0B1120] text-slate-300 font-sans relative overflow-x-hidden flex flex-col selection:bg-cyan-500/30">
      <StitchBrand secao="RANKING" />
      
      <style>
        {`
          @keyframes flutuarRomantico {
            0% { transform: translateY(0) translateX(0); opacity: 0.9; }
            10% { opacity: 1; }
            80% { opacity: 0.7; }
            100% { transform: translateY(-300px) translateX(var(--deriva-horizontal)); opacity: 0; }
          }
        `}
      </style>

      {/* Partículas do Easter Egg ficam na raiz absoluta */}
      {particulas.map(p => (
        <ParticulaRomantica key={p.id} id={p.id} texto={p.texto} posicaoInicial={p.posicao} duracao={p.duracao} tamanho={p.tamanho} derivaH={p.derivaH} onFinalizar={removerParticula} />
      ))}

      {/* Background do Figma */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.04)_0%,#0B1120_70%)]" />

      <div className="max-w-[1200px] mx-auto px-6 py-6 relative z-10 flex flex-col h-full w-full">

        {/* ─── HEADER ─── */}
        <header className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <button aria-label="Voltar ao centro de comando" onClick={() => setTelaAtual('menu')} className="w-10 h-10 rounded-xl bg-[#151F32] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-amber-500/30 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }} />
                Devoradores de Plantão
              </h1>
              <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Ranking de plantonistas</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#151F32] border border-cyan-500/20 rounded-full px-4 py-2 shadow-[0_0_15px_rgba(0,229,255,0.08)]">
            <div className="flex flex-col text-right">
              <span className="text-white text-sm font-bold">{(dadosUsuario?.nome || dadosUsuario?.username || 'Doutor(a)').split(' ')[0]}</span>
              <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-wider">{patentePessoal.titulo}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
              <span className="text-cyan-400 font-mono text-xs font-bold">{eu ? `#${eu.posicaoGlobal}` : '—'}</span>
            </div>
          </div>
        </header>

        {/* ─── PODIUM (RENDERIZADO CONDICIONALMENTE) ─── */}
        {carregando ? (
           <div className="flex-1 flex flex-col items-center justify-center">
             <div className="text-4xl animate-spin mb-4">⏳</div>
             <p className="text-slate-400 font-bold uppercase tracking-widest">Sincronizando Plantões...</p>
           </div>
        ) : erroRanking ? (
          <div role="alert" className="rounded-2xl border border-amber-500/30 bg-[#151F32] p-6 text-amber-400"><p>Não foi possível carregar o ranking global.</p><button type="button" onClick={() => setTentativaRanking(valor => valor + 1)} className="mt-3 rounded-xl border border-amber-500/40 px-4 py-2 text-white">Tentar novamente</button></div>
        ) : (
          <>
            {top3.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="shrink-0 mb-5"
              >
                <div className="bg-[#151F32] rounded-3xl border border-white/[0.02] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/5 blur-[60px] rounded-full pointer-events-none" />

                  <div className="flex items-end justify-center gap-4 md:gap-8">
                    {PODIUM_CONFIG.map((cfg) => {
                      const player = top3[cfg.idx];
                      if (!player) return <div key={cfg.idx} className={`w-20 md:w-28 ${cfg.order}`} />; 
                      
                      return (
                        <motion.div
                          key={player.uid}
                          layout="position"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: cfg.idx * 0.15 }}
                          className={`flex flex-col items-center ${cfg.order} ${player.uid === idPublico ? 'scale-105' : ''}`}
                        >
                          <div className="relative mb-3">
                            {cfg.idx === 0 && (
                              <motion.div animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                                <Crown className="w-6 h-6 text-amber-400" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' }} />
                              </motion.div>
                            )}
                            <div className={`${cfg.avatarSize} rounded-full flex items-center justify-center font-bold text-lg border-[3px] ${cfg.borderColor} bg-[#0F172A]`} style={{ boxShadow: `0 0 20px ${cfg.glowColor}` }}>
                              {player.nome.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          {player.uid === idPublico && <span className="text-[9px] text-cyan-400 uppercase tracking-wider">Você</span>}
                          <span className={`text-xs font-bold mb-1 text-center truncate w-24 ${player.uid === idPublico ? 'text-cyan-300' : 'text-white'}`}>{player.nome}</span>
                          <span className="text-slate-500 text-[10px] mb-1.5 hidden md:block">{player.patente}</span>
                          
                          <span className="font-mono text-xl font-bold" style={{ color: cfg.idx === 0 ? '#ffb95f' : (cfg.idx === 1 ? '#b9cac4' : '#8b5cf6'), filter: `drop-shadow(0 0 6px ${cfg.glowColor})` }}>
                            {criterioOrdenacao === 'nivel' ? player.nivel : criterioOrdenacao === 'letras' ? player.letras : player.tempoMedio == null ? '—' : `${Math.floor(player.tempoMedio / 60)}:${String(player.tempoMedio % 60).padStart(2, '0')}`}
                          </span>
                          <span className="text-slate-600 text-[9px] uppercase tracking-wider font-bold">
                            {criterioOrdenacao === 'nivel' ? 'Níveis' : criterioOrdenacao === 'letras' ? 'Acertos' : 'Média'}
                          </span>

                          <motion.div
                            initial={{ height: 0 }} animate={{ height: 'auto' }} transition={{ duration: 0.6, delay: 0.3 + cfg.idx * 0.1 }}
                            className={`${cfg.height} w-20 md:w-24 mt-3 rounded-t-xl flex items-start justify-center pt-3 relative overflow-hidden`}
                            style={{
                              background: cfg.idx === 0 ? 'linear-gradient(to top, rgba(255,185,95,0.15), rgba(255,185,95,0.03))' : cfg.idx === 1 ? 'linear-gradient(to top, rgba(185,202,196,0.12), rgba(185,202,196,0.02))' : 'linear-gradient(to top, rgba(139,92,246,0.12), rgba(139,92,246,0.02))',
                              borderTop: cfg.idx === 0 ? '2px solid rgba(255,185,95,0.4)' : cfg.idx === 1 ? '2px solid rgba(185,202,196,0.3)' : '2px solid rgba(139,92,246,0.3)',
                              borderLeft: '1px solid rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.03)',
                            }}
                          >
                            <span className={`text-sm font-black ${cfg.medalColor} opacity-80`}>{cfg.labelText}</span>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}

            {/* ─── LEADERBOARD TABLE ─── */}
            <motion.section
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="flex-1 min-h-0 flex flex-col bg-[#151F32] rounded-3xl border border-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden"
            >
              {/* Table Header com Filtros */}
              <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-white/[0.04] shrink-0 gap-4">
                <div className="flex bg-[#0B1120] rounded-xl p-1 border border-white/[0.04]">
                  {[['global', '🌍 Global'], ['patente', '🎖️ Mesma Patente'], ['hall', '🏆 Hall da Fama']].map(([key, label]) => (
                    <button
                      key={key} onClick={() => setAbaAtual(key)}
                      aria-pressed={abaAtual === key}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${abaAtual === key ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-[#0B1120] rounded-xl p-1 border border-white/[0.04]">
                  {[['nivel', 'Nível', '🎓'], ['letras', 'Acertos', '🎯'], ...(possuiTempo ? [['tempo', 'Média', '⏱️']] : [])].map(([key, label, icone]) => (
                    <button
                      key={key} onClick={() => setCriterioOrdenacao(key)}
                      aria-label={`Ordenar por ${label.toLowerCase()}`}
                      aria-pressed={criterioOrdenacao === key}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${criterioOrdenacao === key ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <span>{icone}</span> <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[36px_minmax(0,1fr)_64px] sm:grid-cols-[40px_minmax(0,1fr)_90px_80px_75px] gap-2 sm:gap-4 px-4 sm:px-6 py-3 border-b border-white/[0.03] text-[9px] uppercase font-bold tracking-widest text-slate-500 shrink-0">
                <span>#</span>
                <span>Plantonista</span>
                <span className="text-center hidden sm:block">Patente</span>
                <span className="text-center">Estatística</span>
                <span className="text-center hidden sm:block">Partidas</span>
              </div>

              {/* Rows */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {rest.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-slate-500 text-sm font-bold uppercase tracking-widest">
                    Nenhum outro plantonista encontrado.
                  </div>
                ) : (
                  rest.map((player, i) => (
                      <motion.div
                        key={player.uid}
                        layout="position"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}
                        className={`grid grid-cols-[36px_minmax(0,1fr)_64px] sm:grid-cols-[40px_minmax(0,1fr)_90px_80px_75px] gap-2 sm:gap-4 items-center px-4 sm:px-6 py-3.5 border-b border-white/[0.02] transition-colors group relative ${player.uid === idPublico ? 'bg-cyan-500/[0.06] hover:bg-cyan-500/[0.1]' : 'hover:bg-white/[0.02]'}`}
                      >
                        <span className={`font-mono text-base font-bold ${player.uid === idPublico ? 'text-cyan-400' : 'text-slate-500'}`}>
                          #{player.posicaoExibida}
                        </span>

                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${player.posicaoExibida <= 6 ? 'bg-[#1e293b] border border-white/[0.08] text-slate-400' : 'bg-[#0f172a] border border-white/[0.04] text-slate-500'}`}>
                            {player.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-sm font-bold truncate flex items-center gap-2 ${player.uid === idPublico ? 'text-cyan-300' : 'text-white'}`}>
                              {player.nome}
                              {player.uid === idPublico && <span className="text-[9px] text-cyan-500 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">Você</span>}
                            </span>
                          </div>
                        </div>

                        <span className="text-center text-[10px] font-bold hidden sm:block truncate" style={{ color: player.cor }}>{player.patente}</span>

                        <div className="flex items-center justify-center">
                          <span className={`font-mono text-base font-bold ${player.posicaoExibida <= 5 ? 'text-amber-400' : 'text-slate-300'}`}>
                            {criterioOrdenacao === 'nivel' ? player.nivel : criterioOrdenacao === 'letras' ? player.letras : player.tempoMedio == null ? '—' : `${Math.floor(player.tempoMedio / 60)}:${String(player.tempoMedio % 60).padStart(2, '0')}`}
                          </span>
                        </div>

                        <div className="hidden sm:flex flex-col items-center justify-center gap-0.5">
                          <span className="text-xs font-bold text-slate-400">{player.partidas}</span>
                          <span className="text-[8px] text-slate-600 uppercase tracking-widest">Partidas</span>
                        </div>
                      </motion.div>
                  ))
                )}
              </div>

              {/* BARRA DO RADAR FIXA NO RODAPÉ DA TABELA */}
              <div className="shrink-0 border-t border-cyan-500/20 bg-[#0B1120]/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* EASTER EGG INJETADO DISCRETAMENTE AQUI */}
                  <button type="button" onClick={dispararParticulas} className="cursor-pointer text-2xl hover:scale-125 transition-transform" aria-label="Ativar surpresa" title="R ❤️ C">🌻</button>
                  <div>
                    <div className="text-cyan-300 text-sm font-bold uppercase tracking-wide">{tituloRadar}</div>
                    <div className="text-slate-400 text-xs font-medium">{textoRadar}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-[#151F32] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                    <Flame className="w-4 h-4 text-orange-400" style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.8))' }} />
                    <span className="text-orange-400 font-bold text-xs">{dadosUsuario?.estatisticasGerais?.streakAtual || 0} partidas seguidas</span>
                  </div>
                  <div className="text-amber-400 font-mono text-lg font-bold flex items-center gap-2" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }}>
                    {criterioOrdenacao === 'nivel' ? somaNiveisPessoal : criterioOrdenacao === 'letras' ? resumoPessoal.letras : resumoPessoal.tempoMedio == null ? '—' : `${Math.floor(resumoPessoal.tempoMedio / 60)}:${String(resumoPessoal.tempoMedio % 60).padStart(2, '0')}`}
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{criterioOrdenacao}</span>
                  </div>
                </div>
              </div>

            </motion.section>
          </>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
