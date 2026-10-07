import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Play } from 'lucide-react';
import { CountNum, MiniEcg } from './prototipoUi';
import { progressoGlobal } from '../utils/economia';
import { animar, fmt, latenciaPrevista } from '../utils/prototipo';

// Resultado do protótipo de movimento (Cruzadinha, Quiz, Verdade ou mentira e DDX): o XP calculado no
// aparelho aparece linha a linha enquanto a gravação corre; o que só o servidor sabe entra depois.
// fase: 'salvando' | 'ok' | 'erro'. linhas e extras: [rótulo, valor, 'pos' | 'mul' | 'neg' | 'mut'].
export function Resultado({ stamp, tom, sub, linhas, total, unidade = 'XP', extras = [], bonus = 0, fase, aoTentar, principal, aoVoltar, rotuloVoltar = 'Voltar ao início', detalhes, aviso, recibo }) {
  const [masked] = useState(animar);
  const [mostradas, setMostradas] = useState(masked ? 0 : linhas.length);
  const [cerimonia, setCerimonia] = useState(!masked);
  const idRecibo = useMemo(() => recibo ? String(recibo).slice(0, 8).toUpperCase() : null, [recibo]);
  useEffect(() => {
    if (!masked) return undefined;
    const ts = linhas.map((_, i) => setTimeout(() => setMostradas(i + 1), 650 + i * 420));
    ts.push(setTimeout(() => setCerimonia(true), 650 + linhas.length * 420 + 1050));
    return () => ts.forEach(clearTimeout);
    // A cerimônia roda uma vez, com as linhas da conclusão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const confirmado = cerimonia && fase === 'ok';
  const burst = useMemo(() => masked ? Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2, d = 90 + ((i * 37) % 70);
    return <i key={i} style={{ '--c': ['var(--mint)', 'var(--amber)', 'var(--violet)', 'var(--mint-2)'][i % 4], '--x': `${Math.cos(a) * d}px`, '--y': `${Math.sin(a) * d}px`, '--r': `${(i * 97) % 540}deg` }} />;
  }) : null, [masked]);
  const totalVisivel = mostradas >= linhas.length && cerimonia;
  return <div className="cbt-scr vic">
    {burst && <div className="burst">{burst}</div>}
    <div className="scroll">
      <div className="res-main">
        <div className={`stamp ${tom || ''}`}>{stamp}</div>
        <div className="vic-sub">{sub}</div>
        <div className="ledger" aria-label="Detalhamento do XP">
          {linhas.map(([l, v, c], i) => <div key={i} className={`lrow ${i < mostradas ? 'show' : ''}`}><span>{l}</span><b className={c}>{v}</b></div>)}
          {confirmado && extras.map(([l, v, c], i) => <div key={'x' + i} className="lrow srv show"><span>{l}</span><b className={c}>{v}</b></div>)}
        </div>
        <div className="total" aria-live="polite">{totalVisivel ? <CountNum from={0} to={total + (confirmado ? bonus : 0)} ms={1000} /> : '0'}<small>{unidade}</small></div>
        {aviso && <div className="pid" style={{ marginTop: 6 }}>{aviso}</div>}
        <div className={`save ${fase === 'ok' ? 'ok' : fase === 'erro' ? 'err' : ''}`} role="status">
          {fase === 'salvando' && <><MiniEcg /><span>Registrando no prontuário</span></>}
          {fase === 'ok' && <><Check size={15} /><span>Salvo no prontuário</span></>}
          {fase === 'erro' && <span>Não foi possível salvar. Tente de novo: a partida não conta duas vezes.</span>}
        </div>
        {idRecibo && <div className="pid">recibo {idRecibo}</div>}
      </div>
      {detalhes && <div className="details">{detalhes}</div>}
    </div>
    <div className="actions">
      {fase === 'erro'
        ? <button className="primary" onClick={aoTentar}>Tentar salvar de novo</button>
        : principal.node || <button className="primary" disabled={fase !== 'ok'} onClick={principal.aoClicar}><Play size={18} fill="currentColor" />{principal.rotulo}</button>}
      <button className="ghost" disabled={fase !== 'ok'} onClick={aoVoltar}>{rotuloVoltar}</button>
    </div>
  </div>;
}

// Botão que enche no ritmo da espera prevista enquanto o pedido corre (até 90% no tempo previsto e,
// se passar, se arrasta até ~98% com "Quase lá…", sem parecer travado).
export function BotaoCarregar({ rotulo, icone, carregando, aoClicar, desabilitado }) {
  const [masked] = useState(animar);
  const [prog, setProg] = useState(0);
  const [atrasado, setAtrasado] = useState(false);
  const [resta, setResta] = useState(0);
  useEffect(() => {
    if (!carregando || !masked) return undefined;
    const inicio = performance.now(), previsto = latenciaPrevista();
    let raf = 0;
    const passo = () => {
      const e = performance.now() - inicio, k = e / previsto;
      setProg(k < 1 ? 0.9 * (1 - (1 - k) ** 2) : 0.9 + 0.08 * (1 - Math.exp(-(k - 1) * 1.4)));
      setAtrasado(k > 1.05);
      setResta(Math.max(0, (previsto - e) / 1000));
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [carregando, masked]);
  if (!masked) return <button className="primary" disabled={carregando || desabilitado} onClick={aoClicar}>{carregando ? 'Carregando...' : <>{icone}{rotulo}</>}</button>;
  const texto = !carregando ? <>{icone}{rotulo}</> : atrasado ? 'Quase lá…' : `Preparando rodada · ~${(prog ? resta : latenciaPrevista() / 1000).toFixed(1).replace('.', ',')} s`;
  return <button className={`loadbtn ${carregando ? '' : 'ready'}`} disabled={carregando || desabilitado} onClick={aoClicar} aria-busy={carregando}>
    <span className="lb-txt">{texto}</span>
    <span className="lb-fill" style={{ clipPath: `inset(0 ${carregando ? 100 - prog * 100 : 0}% 0 0)` }}><span className="lb-txt dark">{texto}</span></span>
  </button>;
}

// Contagem 3, 2, 1 antes da rodada.
export function Contagem({ aoTerminar }) {
  const [n, setN] = useState(animar() ? 3 : 0);
  const fim = useRef(aoTerminar);
  useEffect(() => { fim.current = aoTerminar; });
  useEffect(() => {
    if (n === 0) { fim.current(); return undefined; }
    const t = setTimeout(() => setN(n - 1), 650);
    return () => clearTimeout(t);
  }, [n]);
  return <div className="plain" role="status" aria-label={n ? `Começa em ${n}` : 'Começando'} style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', background: 'var(--canvas)' }}>
    <AnimatePresence mode="popLayout"><motion.b key={n} className="mono" style={{ fontSize: 88, color: 'var(--mint)', textShadow: '0 0 40px rgba(0,245,212,.5)' }} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .4, opacity: 0 }} transition={{ duration: .4, ease: [0.16, 1, 0.3, 1] }}>{n || ''}</motion.b></AnimatePresence>
  </div>;
}

// Subida de nível global, com o número virando e os tickets que o nível novo concede.
export function SubiuNivel({ info, onClose }) {
  const [n, setN] = useState(info.from);
  useEffect(() => { const t = setTimeout(() => setN(info.to), 750); return () => clearTimeout(t); }, [info.to]);
  const L = progressoGlobal({ pontuacaoTotal: info.xp });
  const tickets = (info.to * (info.to + 1) - info.from * (info.from + 1)) / 2;
  const botao = useRef(null);
  useEffect(() => { botao.current?.focus(); }, []);
  const bits = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2, d = 110 + ((i * 53) % 90);
    return <i key={i} style={{ '--c': ['var(--mint)', 'var(--amber)', '#b49cff', '#fff'][i % 4], '--x': `${Math.cos(a) * d}px`, '--y': `${Math.sin(a) * d}px`, '--r': `${(i * 83) % 540}deg` }} />;
  });
  return <motion.div className="lvlup" role="dialog" aria-modal="true" aria-label={`Subiu para o nível ${info.to}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <div className="lvl-rays" />
    <div className="burst" style={{ top: '38%', left: '50%' }}>{bits}</div>
    <motion.div className="lvl-badge" initial={animar() ? { scale: .2, rotate: -25 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 11, stiffness: 160 }}>
      <AnimatePresence mode="popLayout"><motion.b key={n} className="mono" initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: -90, opacity: 0 }} transition={{ duration: .35 }}>{n}</motion.b></AnimatePresence>
    </motion.div>
    <motion.div className="lvl-txt" initial={animar() ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }}>
      <span className="kicker" style={{ color: 'var(--amber)' }}>Subiu de nível</span>
      <h2>Nível {info.to}</h2>
      <p>{tickets > 0 ? <>Recompensa do nível: <b>+{fmt(tickets)} ticket{tickets > 1 ? 's' : ''}</b></> : 'Continue assim.'}</p>
      <div className="bar" style={{ width: 220 }}><span style={{ width: `${L.percentual}%` }} /></div>
      <small className="mono">{fmt(L.proximo - L.xp)} XP para o nível {info.to + 1}</small>
      <button ref={botao} className="primary" style={{ marginTop: 10, width: 220 }} onClick={onClose}><Check size={17} />Continuar</button>
    </motion.div>
  </motion.div>;
}
