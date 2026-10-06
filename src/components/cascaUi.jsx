import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUp, BarChart3, BrainCircuit, Grid3x3, HeartPulse, Home, RotateCcw, ScanLine, Stethoscope, Swords, Ticket, Trophy, UserRound } from 'lucide-react';
import { tituloEpico } from '../utils/coroas';
import { especialidade } from '../utils/cracha';
import { progressoGlobal } from '../utils/economia';
import { MODOS, dadosModo } from '../utils/modosPerfil';
import { animar, fmt } from '../utils/prototipo';
import { Avatar, CountNum, FlameIcon, Podium, StreakChip } from './prototipoUi';

// Casca do protótipo de movimento: barra lateral da web, crachá do usuário com o cartão de
// progresso, missões do dia e prévia do ranking. Estilos em src/prototipo.css, sob .cbt.
const n = v => Number(v) || 0;
// O crachá do topo e o cartão mostram o primeiro nome, como no protótipo.
const primeiro = p => String(p.nome || p.username || 'Plantonista').trim().split(/\s+/)[0];

export function ProgressCard({ p, foto, ir, onNav }) {
  const L = progressoGlobal(p);
  const [titulo] = tituloEpico(especialidade(p)[0]);
  const modos = MODOS.map(([id, nome, cor]) => ({ id, nome, cor, ...dadosModo(p, id) }));
  const comXp = modos.filter(m => m.xp > 0);
  const total = comXp.reduce((s, m) => s + m.xp, 0) || 1;
  const jogos = modos.reduce((s, m) => s + m.partidas, 0);
  const vai = tela => { onNav?.(); ir(tela); };
  return <div className="pcard">
    <div className="pc-head"><Avatar nome={p.nome} me foto={foto} size={50} ring={L.percentual / 100} /><div><b>{primeiro(p)}</b><small>{titulo}</small></div><span className="lvl">NÍVEL {L.nivel}</span></div>
    <div className="pc-xp"><strong className="mono"><CountNum to={L.xp} /></strong><span>XP</span></div>
    <div className="bar"><span style={{ width: `${L.percentual}%` }} /></div>
    <div className="xpfoot"><span>{fmt(L.proximo - L.xp)} XP para o nível {L.nivel + 1}</span><span>{Math.floor(L.percentual)}%</span></div>
    <div className="pc-stats">
      <div><Ticket size={15} /><b className="mono">{n(p.tickets)}</b><small>tickets</small></div>
      <div><FlameIcon size={15} /><b className="mono">{n(p.estatisticasGerais?.streakAtual)}</b><small>cruzadinhas seguidas</small></div>
      <div><Stethoscope size={15} /><b className="mono">{jogos}</b><small>partidas</small></div>
    </div>
    {comXp.length > 0 && <>
      <span className="pc-sec">De onde vem seu XP</span>
      <div className="stackbar">{comXp.map(m => <span key={m.id} style={{ flexGrow: m.xp, background: m.cor }} title={m.nome} />)}</div>
      <div className="legend">{[...comXp].sort((a, b) => b.xp - a.xp).slice(0, 4).map(m => <span key={m.id}><i style={{ background: m.cor }} />{m.nome} <b className="mono">{Math.round(m.xp / total * 100)}%</b></span>)}</div>
    </>}
    <div className="pc-links"><button className="w-link" onClick={() => vai('estatisticas')}><BarChart3 size={15} />Estatísticas</button><button className="w-link" onClick={() => vai('perfil')}>Perfil completo <ArrowRight size={15} /></button></div>
  </div>;
}

// Foto com o nível; na web, passar o mouse abre o cartão de progresso; no celular, um toque abre a folha.
export function UserBadge({ p, foto, ir, web, place = 'below', xpDe }) {
  const L = progressoGlobal(p);
  const [open, setOpen] = useState(false);
  const [tela, setTela] = useState(null);
  const t = useRef(undefined);
  const ancora = useCallback(el => setTela(el?.closest('.cbt') ?? null), []);
  const abrir = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), 110); };
  const fechar = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), 220); };
  useEffect(() => () => clearTimeout(t.current), []);
  // A folha vai para a raiz da tela: dentro do cabeçalho animado ela se ancoraria nele.
  const folha = <AnimatePresence>
    {open && !web && <>
      <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
      <motion.div key="sh" className="sheet" role="dialog" aria-modal="true" aria-label={`Progresso de ${p.nome}`} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}><ProgressCard p={p} foto={foto} ir={ir} onNav={() => setOpen(false)} /></motion.div>
    </>}
  </AnimatePresence>;
  return <div ref={ancora} className={`ubadge-wrap ${place}`} onMouseEnter={web ? abrir : undefined} onMouseLeave={web ? fechar : undefined}>
    <button className="ubadge" aria-expanded={open} aria-label={`Progresso de ${p.nome}, nível ${L.nivel}`} onClick={() => setOpen(o => !o)} onFocus={web ? abrir : undefined} onBlur={web ? fechar : undefined}>
      <Avatar nome={p.nome} me foto={foto} size={place === 'right' ? 36 : 40} ring={L.percentual / 100} />
      <span className="ub-lvl mono">{L.nivel}</span>
      <span className="ub-txt"><b>{primeiro(p)}<StreakChip n={n(p.estatisticasGerais?.streakAtual)} /></b><small><CountNum from={xpDe ?? undefined} to={L.xp} /> XP · {n(p.tickets)} <Ticket size={11} /></small></span>
    </button>
    <AnimatePresence>
      {open && web && <motion.div key="pop" className={`pop ${place}`} initial={{ opacity: 0, scale: .94, y: place === 'below' ? -6 : 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .18 }}><ProgressCard p={p} foto={foto} ir={ir} onNav={() => setOpen(false)} /></motion.div>}
    </AnimatePresence>
    {tela ? createPortal(folha, tela) : folha}
  </div>;
}

/* ---------- missões do dia: os anéis enchem do valor da última visita ao menu até o atual ---------- */
function MissionRing({ p, m, done, fillFrom }) {
  const size = 34, sw = 3.5, r = (size - sw) / 2 - 1, C = 2 * Math.PI * r;
  const segs = m <= 5;
  const gap = m > 1 && segs ? 3.2 : 0;
  const seg = C / (segs ? m : 1) - gap;
  return <span className={`mring ${done ? 'done' : ''}`}>
    <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {segs ? Array.from({ length: m }, (_, i) => <g key={i}>
        <circle cx={size / 2} cy={size / 2} r={r} className="mt" strokeDasharray={`${seg} ${C}`} strokeDashoffset={-i * (C / m)} />
        <circle cx={size / 2} cy={size / 2} r={r} className="mf" strokeDasharray={`${i < p ? seg : 0} ${C}`} strokeDashoffset={-i * (C / m)} style={{ transitionDelay: `${Math.max(0, i - fillFrom) * 160}ms` }} />
      </g>) : <>
        <circle cx={size / 2} cy={size / 2} r={r} className="mt" />
        <circle cx={size / 2} cy={size / 2} r={r} className="mf" strokeDasharray={`${C * Math.min(1, p / m)} ${C}`} />
      </>}
    </svg>
    <span className="mdisc"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-8.5" /></svg></span>
    <span className="mburst">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--a': `${i * 45}deg` }} />)}</span>
  </span>;
}

function MissionRow({ m, from, i }) {
  const meta = n(m.meta) || 1;
  const atual = Math.min(n(m.progresso), meta);
  const [mostrado, setMostrado] = useState(from);
  const [feita, setFeita] = useState(from >= meta);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    if (!animar() || from === atual) return undefined;
    const t1 = setTimeout(() => setMostrado(atual), 700 + i * 380);
    const t2 = atual >= meta && from < meta ? setTimeout(() => { setFeita(true); setPop(true); }, 700 + i * 380 + 650 + Math.max(0, meta - from - 1) * 160) : undefined;
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [from, atual, meta, i]);
  const p = animar() ? mostrado : atual;
  const done = animar() ? feita || (from === atual && atual >= meta) : atual >= meta;
  return <div className={`mission ${done ? 'done' : ''} ${pop ? 'just' : ''}`} title={m.subtitulo}>
    <MissionRing p={p} m={meta} done={done} fillFrom={from} />
    <span><b>{m.titulo}</b><small>{Math.min(p, meta)}/{meta}{done ? ' · concluída' : ` · ${m.subtitulo}`}</small></span>
    <span className="rw">+{n(m.recompensaXP)}</span>
    <AnimatePresence>{pop && <motion.span className="mfloat" initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 1, 0], y: -26 }} transition={{ duration: 1.6 }} onAnimationComplete={() => setPop(false)}>+{n(m.recompensaXP)} XP</motion.span>}</AnimatePresence>
  </div>;
}

// Progresso mostrado na última visita ao menu, por dia e missão, para animar só o que mudou.
const vistas = new Map();
export function Missions({ missoes, dia }) {
  const [from] = useState(() => Object.fromEntries(missoes.map(m => [m.id, Math.min(vistas.get(`${dia}:${m.id}`) ?? n(m.progresso), n(m.meta) || 1)])));
  useEffect(() => { missoes.forEach(m => vistas.set(`${dia}:${m.id}`, n(m.progresso))); }, [missoes, dia]);
  const feitas = missoes.filter(m => n(m.progresso) >= n(m.meta)).length;
  if (!missoes.length) return <div className="missions">{[0, 1, 2].map(i => <div key={i} className="sk sk-row" />)}</div>;
  return <div className="missions">
    <div className="mstrip" aria-hidden="true">{missoes.map(m => <span key={m.id} className={n(m.progresso) >= n(m.meta) ? 'on' : n(m.progresso) > 0 ? 'half' : ''} />)}<small className="mono">{feitas}/{missoes.length} hoje</small></div>
    {missoes.map((m, i) => <MissionRow key={m.id} m={m} i={i} from={from[m.id] ?? n(m.progresso)} />)}
  </div>;
}

/* ---------- prévia do ranking: pódio, vizinhos e distância para o próximo ---------- */
export function RankPreview({ lista, foto, compact, delta = 0, erro, aoTentar, ir }) {
  if (erro) return <div className="cbt-erro"><p>Ranking indisponível agora.</p><button className="w-link" onClick={aoTentar}>Tentar de novo</button></div>;
  if (!lista) return <div style={{ display: 'grid', gap: 8 }}><div className="sk" style={{ height: compact ? 150 : 190 }} />{[0, 1, 2].map(i => <div key={i} className="sk" style={{ height: 44 }} />)}</div>;
  const pos = lista.findIndex(r => r.me);
  const acima = pos > 0 ? lista[pos - 1] : null;
  const resto = lista.slice(3, compact ? 6 : 7);
  if (pos > (compact ? 5 : 6)) resto.push(lista[pos]);
  return <div className="rankprev">
    <Podium lista={lista} foto={foto} />
    <div className="rklist">
      {resto.map(r => {
        const i = lista.indexOf(r);
        return <motion.div layout={animar()} key={r.id} className={`rk ${r.me ? 'me' : ''}`} transition={{ type: 'spring', damping: 26, stiffness: 260 }}>
          <span className="pos">{i + 1}</span><Avatar nome={r.nome} me={r.me} foto={foto} size={30} /><b>{r.me ? 'Você' : r.nome}</b>
          <span className="xp">{r.me && delta !== 0 && <span className={`move ${delta > 0 ? 'up' : 'down'}`}>{delta > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{Math.abs(delta)}</span>}{fmt(r.valor)}</span>
        </motion.div>;
      })}
    </div>
    <p className="gap-line">{pos === 0 ? 'Você lidera a temporada. Segure a coroa.' : acima ? <>Faltam <b>{fmt(acima.valor - lista[pos].valor + 1)} XP</b> para passar {acima.nome}.</> : pos < 0 ? 'Jogue para entrar no ranking da temporada.' : null}</p>
    {!compact && <button className="w-link" onClick={() => ir('ranking')}>Abrir ranking completo <ArrowRight size={15} /></button>}
  </div>;
}

/* ---------- barra lateral da web ---------- */
const NAV = [
  ['menu', 'Centro de comando', Home], null,
  ['topicos', 'Cruzadinhas', Grid3x3], ['quiz', 'Quiz médico', BrainCircuit, 'NOVO'], ['verdadeMentira', 'Verdade ou mentira', ScanLine, 'NOVO'], null,
  ['selecaoDDX', 'DDX · Casos', HeartPulse, 'REVISÃO'], ['batalha', 'Batalha diagnóstica', Swords, 'PILOTO', true], ['revisaoInteligente', 'Revisão inteligente', RotateCcw, 'PILOTO', true], null,
  ['ranking', 'Ranking', Trophy], ['estatisticas', 'Estatísticas', BarChart3], ['perfil', 'Perfil', UserRound],
];
const SECAO = { jogo: 'topicos', erroMedico: 'selecaoDDX', causaEfeito: 'selecaoDDX' };
export function BarraLateral({ tela, ir, p, foto, aoPassarRanking }) {
  const on = SECAO[tela] || tela;
  const admin = p.role === 'admin';
  return <aside className="cbt web cbt-casca">
    <div className="side">
      <div className="side-brand">caco<b>Med</b><small>TERMINAL DE PLANTÃO</small></div>
      <nav className="side-nav" aria-label="Seções">
        {NAV.filter(item => !item?.[4] || admin).map((item, i) => {
          if (!item) return <span key={`sep${i}`} className="nav-sep" />;
          const [id, t, icone, badge] = item;
          const Ic = icone;
          return <button key={id} className={`nav-i ${on === id ? 'on' : ''}`} title={t} aria-current={on === id ? 'page' : undefined} onClick={() => on !== id && ir(id)}
            onMouseEnter={id === 'ranking' ? aoPassarRanking : undefined}>
            <Ic /><span className="lbl">{t}</span>{badge && <span className={`badge ${badge === 'NOVO' ? 'new' : 'rev'}`}>{badge}</span>}
          </button>;
        })}
      </nav>
      <div className="side-user"><UserBadge p={p} foto={foto} ir={ir} web place="right" /></div>
    </div>
  </aside>;
}
