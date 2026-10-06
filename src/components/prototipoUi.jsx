import { useEffect, useId, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { BarChart3, Home, Trophy, UserRound } from 'lucide-react';
import { Retrato } from './batalhaArte';
import { FOTOS } from '../utils/fotosCracha';
import { animar, fmt, iniciais } from '../utils/prototipo';

// Peças visuais do protótipo de movimento compartilhadas por menu, Ranking, Coroas,
// Estatísticas e Crachá. Os estilos estão em src/prototipo.css, sob .cbt.
export function CountNum({ to, from, ms = 1100 }) {
  const [v, setV] = useState(from ?? to);
  const prev = useRef(from ?? to);
  useEffect(() => {
    const a = prev.current;
    prev.current = to;
    if (!animar() || a === to) return undefined;
    const c = animate(a, to, { duration: ms / 1000, ease: [0.16, 1, 0.3, 1], onUpdate: setV, onComplete: () => setV(to) });
    const fim = setTimeout(() => setV(to), ms + 400);
    return () => { c.stop(); clearTimeout(fim); };
  }, [to, ms]);
  return <>{fmt(animar() ? v : to)}</>;
}

export const MiniEcg = () => <svg className="mini-ecg" viewBox="0 0 38 14" aria-hidden="true"><path d="M0 8h10l3-6 5 11 3-7 3 2h14" /></svg>;

export function FlameIcon({ size = 16 }) {
  const u = useId().replace(/:/g, '');
  return <svg className="flame" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <defs><linearGradient id={`f${u}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff3366" /><stop offset=".55" stopColor="#ff8a1f" /><stop offset="1" stopColor="#ffd54a" /></linearGradient></defs>
    <path className="fl-o" d="M12.2 1.8c.7 3.3 3.9 5 5.1 8.2 1.5 3.8-.5 8.6-5 10.2-4.6 1.6-8.1-1.7-8-5.8.1-2.7 1.6-4.6 3.3-5.8-.2 2 .5 3.5 1.9 4.1.2-3.9 1.4-7.7 2.7-10.9z" fill={`url(#f${u})`} />
    <path className="fl-i" d="M12.3 11.5c.4 1.8 2.3 2.7 2.3 4.8 0 1.7-1.2 3-2.8 3s-2.9-1.2-2.8-2.9c.1-1.4 1-2.3 1.9-2.9 0 .9.4 1.5 1 1.7-.1-1.4.1-2.6.4-3.7z" fill="#fff4c2" />
  </svg>;
}

const matiz = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
// Avatar: a própria pessoa aparece com o retrato do crachá; os demais, com iniciais coloridas.
// ring (0 a 1) desenha o progresso do nível em volta da foto.
export function Avatar({ nome, me, foto = 0, size = 40, tier, ring }) {
  const h = matiz(nome);
  const fundo = `linear-gradient(135deg, hsl(${h} 55% 46%), hsl(${(h + 40) % 360} 60% 30%))`;
  const C = 2 * Math.PI * (size / 2 + 3);
  return <span className={`av2 ${tier ? 't' + tier : ''} ${me ? 'me' : ''}`} style={{ width: size, height: size, fontSize: size * 0.34 }}>
    {me ? <span className="av2-in photo"><Retrato f={FOTOS[foto] || FOTOS[0]} /></span>
      : <span className="av2-in" style={{ background: fundo, color: '#fff' }}>{iniciais(nome)}</span>}
    {ring != null && <svg className="av2-ring" viewBox={`0 0 ${size + 8} ${size + 8}`} style={{ width: size + 8, height: size + 8 }}>
      <circle cx={size / 2 + 4} cy={size / 2 + 4} r={size / 2 + 3} className="t" />
      <circle cx={size / 2 + 4} cy={size / 2 + 4} r={size / 2 + 3} className="f" strokeDasharray={C} strokeDashoffset={C * (1 - ring)} />
    </svg>}
  </span>;
}

// Sequência de cruzadinhas ao lado do nome (o jogo não registra ofensiva diária de login).
export function StreakChip({ n }) {
  return <span className="stc" title={`${n} cruzadinhas seguidas`} aria-label={`${n} cruzadinhas seguidas`}>
    <FlameIcon size={14} /><b key={n} className="mono">{n}</b>
  </span>;
}

// Barra de abas do celular: Início, Ranking, Estatísticas e Perfil.
const ABAS = [['menu', 'Início', Home], ['ranking', 'Ranking', Trophy], ['estatisticas', 'Estatísticas', BarChart3], ['perfil', 'Perfil', UserRound]];
export function Tabbar({ on, ir }) {
  return <nav className="tabbar" aria-label="Seções">{ABAS.map(([id, t, icone]) => {
    const Ic = icone;
    return <button key={id} className={`tab ${on === id ? 'on' : ''}`} aria-current={on === id ? 'page' : undefined} onClick={() => on !== id && ir(id)}><Ic />{t}</button>;
  })}</nav>;
}

const CORES_COROA = {
  1: ['#FFF6C2', '#FFD54A', '#FFB703', '#A86F00'],
  2: ['#FFFFFF', '#E3E9F1', '#A9B4C4', '#5F6B7C'],
  3: ['#FFD9B5', '#E3A06A', '#B26B34', '#6A3B19'],
};
export function Crown({ tier, size = 34 }) {
  const id = useId().replace(/:/g, '');
  const [a, b, c, d] = CORES_COROA[tier];
  const corpo = 'M4 31 L7.5 11 L16.5 21 L24 5 L31.5 21 L40.5 11 L44 31 Z';
  return <span className={`crown c${tier}`} style={{ width: size, height: size * 0.78 }}>
    <svg viewBox="0 0 48 38" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset=".38" stopColor={b} /><stop offset=".7" stopColor={c} /><stop offset="1" stopColor={d} /></linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id={`k${id}`}><path d={corpo} /><rect x="4" y="29" width="40" height="7" rx="2" /></clipPath>
      </defs>
      <path d={corpo} fill={`url(#g${id})`} stroke={d} strokeWidth=".8" strokeLinejoin="round" />
      <rect x="4" y="29" width="40" height="7" rx="2" fill={`url(#g${id})`} stroke={d} strokeWidth=".8" />
      <circle cx="7.5" cy="10" r="3" fill={b} stroke={d} strokeWidth=".6" />
      <circle cx="24" cy="4.2" r="3.2" fill={b} stroke={d} strokeWidth=".6" />
      <circle cx="40.5" cy="10" r="3" fill={b} stroke={d} strokeWidth=".6" />
      <circle cx="24" cy="23.5" r="2.8" fill={tier === 1 ? '#00F5D4' : tier === 2 ? '#8B5CF6' : '#FF3366'} stroke={d} strokeWidth=".6" />
      <g clipPath={`url(#k${id})`}>
        <rect y="0" width="16" height="38" fill={`url(#s${id})`} transform="skewX(-18)">
          {animar() && <animate attributeName="x" values="-30;70" dur={tier === 1 ? '2.4s' : '3.4s'} begin={`${tier * 0.5}s`} repeatCount="indefinite" />}
        </rect>
      </g>
    </svg>
    {tier === 1 && <><i className="spark s1" /><i className="spark s2" /><i className="spark s3" /></>}
  </span>;
}

// Pódio em colunas. lista: [{ id, nome, valor, me }] já ordenada; formatar mostra o valor.
export function Podium({ lista, foto, size = 'sm', subir = true, formatar = v => `${fmt(v)} XP` }) {
  const altura = size === 'lg' ? [118, 88, 66] : [74, 56, 42];
  return <div className={`podium2 ${size}`} role="list" aria-label="Três primeiros do ranking">
    {[1, 0, 2].map(k => {
      const r = lista[k];
      const tier = k + 1;
      return <div key={k} className={`pcol p${tier} ${r?.me ? 'me' : ''}`} role="listitem">
        {r ? <>
          <Crown tier={tier} size={size === 'lg' ? (tier === 1 ? 46 : 36) : (tier === 1 ? 34 : 27)} />
          <Avatar nome={r.nome} me={r.me} foto={foto} size={size === 'lg' ? (tier === 1 ? 64 : 52) : (tier === 1 ? 44 : 36)} tier={tier} />
          <b className="pname">{r.me ? 'Você' : r.nome}</b>
          <span className="pxp mono">{formatar(r.valor)}</span>
        </> : <><span className="sk" style={{ width: 40, height: 40, borderRadius: '50%' }} /><span className="sk" style={{ width: 60, height: 12 }} /></>}
        <span className={`pbar mono ${subir && animar() ? 'rise-bar' : ''}`} style={{ height: altura[k], '--d': `${(3 - tier) * 140 + 120}ms` }}>{tier}º</span>
      </div>;
    })}
  </div>;
}
