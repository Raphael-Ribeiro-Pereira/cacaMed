import { useId } from 'react';
import { DOENCAS } from '../utils/batalha';

// Arte original em SVG da Batalha diagnóstica: nada copiado de outras franquias.
const useUid = () => useId().replace(/:/g, '');

/* doença ainda sem diagnóstico: monocromática e com interrogação */
export function Blob() {
  const u = useUid();
  return <svg viewBox="0 0 120 120" className="sp blob" aria-hidden="true">
    <defs><radialGradient id={`b${u}`} cx=".38" cy=".3" r=".75"><stop offset="0" stopColor="#56617c" /><stop offset="1" stopColor="#161b29" /></radialGradient></defs>
    <path d="M60 10c27 0 47 19 46 46-1 20-8 33-17 42-8 8-19 10-29 5-11 6-23 4-31-5-10-11-17-25-16-43C14 29 33 10 60 10z" fill={`url(#b${u})`} stroke="#6b7897" strokeWidth="2" />
    <path d="M30 40c4-10 14-18 26-20" stroke="rgba(255,255,255,.18)" strokeWidth="5" strokeLinecap="round" fill="none" />
    <ellipse cx="44" cy="50" rx="7" ry="3.2" fill="#c9d3e6" className="blob-eye" />
    <ellipse cx="76" cy="50" rx="7" ry="3.2" fill="#c9d3e6" className="blob-eye" />
    <text x="60" y="92" textAnchor="middle" fontSize="36" fontWeight="800" fill="#dce2f7" opacity=".9" fontFamily="var(--sans)">?</text>
  </svg>;
}

function Pneumo({ evolved }) {
  const u = useUid();
  return <svg viewBox="0 0 120 120" className={`sp pneumo ${evolved ? 'evo' : ''}`} aria-hidden="true">
    <defs>
      <radialGradient id={`p${u}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#c4adff" /><stop offset=".55" stopColor="#8b5cf6" /><stop offset="1" stopColor="#4c25b8" /></radialGradient>
    </defs>
    <ellipse cx="60" cy="62" rx="55" ry="43" fill="rgba(180,156,255,.13)" stroke={evolved ? '#d9c9ff' : 'rgba(200,180,255,.55)'} strokeWidth={evolved ? 4 : 2} strokeDasharray={evolved ? undefined : '5 6'} className="capsule" />
    {evolved && Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2, x = 60 + Math.cos(a) * 55, y = 62 + Math.sin(a) * 43;
      return <circle key={i} cx={x} cy={y} r="3.4" fill="#e6dcff" />;
    })}
    <ellipse cx="38" cy="62" rx="22" ry="29" transform="rotate(-22 38 62)" fill={`url(#p${u})`} stroke="#2e1670" strokeWidth="2.5" />
    <ellipse cx="82" cy="62" rx="22" ry="29" transform="rotate(22 82 62)" fill={`url(#p${u})`} stroke="#2e1670" strokeWidth="2.5" />
    <g fill="#fff"><circle cx="31" cy="58" r="5" /><circle cx="45" cy="56" r="5" /><circle cx="75" cy="56" r="5" /><circle cx="89" cy="58" r="5" /></g>
    <g fill="#1b0c45"><circle cx="32" cy="59" r="2.4" /><circle cx="46" cy="57" r="2.4" /><circle cx="76" cy="57" r="2.4" /><circle cx="90" cy="59" r="2.4" /></g>
    <g stroke="#1b0c45" strokeWidth="2.6" strokeLinecap="round">
      <path d={evolved ? 'M25 48l11 5M50 46l-10 5' : 'M26 50l9 3M50 48l-9 3'} /><path d={evolved ? 'M70 46l10 5M95 48l-11 5' : 'M70 48l9 3M94 50l-9 3'} />
    </g>
    <path d="M33 70q5 4 10 0M77 70q5 4 10 0" stroke="#1b0c45" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>;
}

function Dengue({ evolved }) {
  const u = useUid();
  const n = evolved ? 16 : 12, r1 = 33, r2 = evolved ? 50 : 45;
  return <svg viewBox="0 0 120 120" className={`sp dengue ${evolved ? 'evo' : ''}`} aria-hidden="true">
    <defs><radialGradient id={`d${u}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ffd0a8" /><stop offset=".5" stopColor="#ff8a5c" /><stop offset="1" stopColor="#c23c1c" /></radialGradient></defs>
    {evolved && <circle cx="60" cy="62" r="52" fill="rgba(255,70,70,.14)" className="aura" />}
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      return <g key={i}><line x1={60 + c * r1} y1={62 + s * r1} x2={60 + c * r2} y2={62 + s * r2} stroke="#8f2b12" strokeWidth="4" strokeLinecap="round" /><circle cx={60 + c * r2} cy={62 + s * r2} r="5" fill={evolved ? '#ff5a4a' : '#ffae7a'} stroke="#8f2b12" strokeWidth="1.5" /></g>;
    })}
    <circle cx="60" cy="62" r="34" fill={`url(#d${u})`} stroke="#8f2b12" strokeWidth="2.5" />
    <g fill="rgba(255,255,255,.22)"><circle cx="44" cy="46" r="5" /><circle cx="76" cy="80" r="4" /><circle cx="48" cy="82" r="3" /></g>
    <g fill="#fff"><ellipse cx="50" cy="58" rx="6" ry="6.5" /><ellipse cx="70" cy="58" rx="6" ry="6.5" /></g>
    <g fill="#3a0d02"><circle cx="51" cy="59.5" r="3" /><circle cx="69" cy="59.5" r="3" /></g>
    <path d={evolved ? 'M43 49l12 5M77 49l-12 5' : 'M44 50l10 3M76 50l-10 3'} stroke="#3a0d02" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M49 72q11 8 22 0" stroke="#3a0d02" strokeWidth="2.6" fill="#5a1606" strokeLinecap="round" />
    <path d="M53 73l2 4 2-3.4M63 73.4l2 3.6 2-4" fill="#fff" />
    {evolved && <g fill="#5cc8ff" className="drops"><path d="M20 92c2 4 4 6 4 8a4 4 0 0 1-8 0c0-2 2-4 4-8z" /><path d="M100 96c2 4 4 6 4 8a4 4 0 0 1-8 0c0-2 2-4 4-8z" /><path d="M92 20c2 4 4 6 4 8a4 4 0 0 1-8 0c0-2 2-4 4-8z" /></g>}
  </svg>;
}

function Malaria({ evolved }) {
  const u = useUid();
  return <svg viewBox="0 0 120 120" className={`sp malaria ${evolved ? 'evo' : ''}`} aria-hidden="true">
    <defs><radialGradient id={`m${u}`} cx=".5" cy=".5" r=".55"><stop offset="0" stopColor="#ffb1bd" /><stop offset=".6" stopColor="#f0667e" /><stop offset="1" stopColor="#c23a55" /></radialGradient></defs>
    <circle cx="60" cy="64" r="46" fill={`url(#m${u})`} stroke="#8e2138" strokeWidth="2.5" />
    {evolved && <g fill="#ffd9e0">{[[34, 44], [88, 50], [30, 82], [84, 88], [60, 100], [46, 32], [94, 72]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" />)}</g>}
    <circle cx="60" cy="66" r="21" fill="rgba(255,255,255,.2)" stroke="#3f6cf0" strokeWidth="7" />
    <circle cx="75" cy="50" r="7.5" fill="#23349c" />
    <g fill="#1d2a73"><circle cx="54" cy="64" r="3" /><circle cx="66" cy="64" r="3" /></g>
    <path d={evolved ? 'M49 56l9 4M71 56l-9 4' : 'M50 57l7 2M70 57l-7 2'} stroke="#1d2a73" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M54 73q6 4 12-1" stroke="#1d2a73" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    {evolved && <g className="hypno"><path d="M98 12c9 0 14 6 14 13 0 6-4 9-7 10-2 3-7 3-9 0-3 1-8-1-9-6-2-8 3-17 11-17z" fill="rgba(200,215,255,.55)" stroke="#dfe7ff" strokeWidth="1.4" /><path d="M94 24q2 2 4 0M101 24q2 2 4 0" stroke="#2a3a80" strokeWidth="1.6" fill="none" strokeLinecap="round" /><text x="112" y="8" fontSize="9" fontWeight="800" fill="#dfe7ff" fontFamily="var(--mono)">z</text><text x="117" y="2" fontSize="7" fontWeight="800" fill="#dfe7ff" fontFamily="var(--mono)">z</text></g>}
  </svg>;
}


/* criaturas das outras doenças: um desenho paramétrico (forma + cores) lido de doencas.json */
function Rosto({ x, y, s = 1, evolved }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g fill="#fff"><ellipse cx="-10" cy="0" rx="6" ry="6.6" /><ellipse cx="10" cy="0" rx="6" ry="6.6" /></g>
    <g fill="#1b1030"><circle cx="-9" cy="1.4" r="3.1" /><circle cx="11" cy="1.4" r="3.1" /></g>
    <path d={evolved ? 'M-18 -9l12 5M18 -9l-12 5' : 'M-17 -8l10 3M17 -8l-10 3'} stroke="#1b1030" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M-6 12q6 6 12 0" stroke="#1b1030" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </g>;
}
function Gen({ a, evolved }) {
  const u = useUid(), id = `g${u}`;
  const grad = <defs><radialGradient id={id} cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".35" stopColor={a.cor} /><stop offset="1" stopColor={a.cor2} /></radialGradient></defs>;
  const fill = `url(#${id})`;
  const manchas = a.traco === 'manchas';
  const aura = evolved ? <circle cx="60" cy="62" r="54" fill={a.cor} opacity=".16" className="aura" /> : null;
  let corpo, rosto;
  if (a.forma === 'bacilo') {
    corpo = <g transform="rotate(-16 60 62)"><rect x="12" y="34" width="96" height="56" rx="28" fill={fill} stroke={a.cor2} strokeWidth="2.6" />
      {manchas && <g fill={a.cor2} opacity=".35"><circle cx="30" cy="52" r="5" /><circle cx="86" cy="76" r="4.5" /><circle cx="94" cy="50" r="3.5" /><circle cx="40" cy="78" r="3.5" /></g>}
      {evolved && <g stroke={a.cor2} strokeWidth="2.4" strokeLinecap="round">{[28, 46, 64, 82].map(x => <g key={x}><path d={`M${x} 34v-7`} /><path d={`M${x} 90v7`} /></g>)}</g>}</g>;
    rosto = <Rosto x={60} y={62} evolved={evolved} />;
  } else if (a.forma === 'espiral') {
    corpo = <g fill="none" strokeLinecap="round"><path d="M14 80C28 36 46 100 62 62S92 28 108 52" stroke={a.cor2} strokeWidth="30" /><path d="M14 80C28 36 46 100 62 62S92 28 108 52" stroke={fill} strokeWidth="24" />
      {evolved && <path d="M14 80C28 36 46 100 62 62S92 28 108 52" stroke="#fff" strokeOpacity=".3" strokeWidth="4" strokeDasharray="2 12" />}</g>;
    rosto = <Rosto x={60} y={64} s={.74} evolved={evolved} />;
  } else if (a.forma === 'diplo') {
    corpo = <g><circle cx="40" cy="64" r="32" fill={fill} stroke={a.cor2} strokeWidth="2.6" /><circle cx="82" cy="60" r="32" fill={fill} stroke={a.cor2} strokeWidth="2.6" />
      {evolved && <g fill={a.cor2} opacity=".5">{[[26, 44], [96, 40], [60, 92], [24, 82], [100, 82]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.2" />)}</g>}</g>;
    rosto = <Rosto x={61} y={62} evolved={evolved} />;
  } else if (a.forma === 'verme') {
    corpo = <g fill="none" strokeLinecap="round"><path d="M12 86C26 38 52 104 76 64S98 34 108 48" stroke={a.cor2} strokeWidth="30" /><path d="M12 86C26 38 52 104 76 64S98 34 108 48" stroke={fill} strokeWidth="24" />
      <path d="M12 86C26 38 52 104 76 64S98 34 108 48" stroke={a.cor2} strokeOpacity=".4" strokeWidth="24" strokeDasharray="2 9" /></g>;
    rosto = <Rosto x={96} y={52} s={.62} evolved={evolved} />;
  } else if (a.forma === 'flagelado') {
    corpo = <g><path d="M84 52c14-4 16-18 30-22" stroke={a.cor2} strokeWidth="5" fill="none" strokeLinecap="round" className="flag" />
      <ellipse cx="52" cy="64" rx="40" ry="31" fill={fill} stroke={a.cor2} strokeWidth="2.6" />
      <circle cx="74" cy="80" r="7" fill={a.cor2} opacity=".5" />
      {manchas && <g fill={a.cor2} opacity=".3"><circle cx="24" cy="56" r="4" /><circle cx="36" cy="84" r="3.4" /></g>}</g>;
    rosto = <Rosto x={50} y={62} evolved={evolved} />;
  } else {
    const n = evolved ? 16 : 12;
    corpo = <g>{Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); return <g key={i}><line x1={60 + c * 32} y1={62 + s * 32} x2={60 + c * (evolved ? 52 : 46)} y2={62 + s * (evolved ? 52 : 46)} stroke={a.cor2} strokeWidth="4" strokeLinecap="round" /><circle cx={60 + c * (evolved ? 52 : 46)} cy={62 + s * (evolved ? 52 : 46)} r="5" fill={evolved ? '#ff5a4a' : a.cor} stroke={a.cor2} strokeWidth="1.6" /></g>; })}
      <circle cx="60" cy="62" r="34" fill={fill} stroke={a.cor2} strokeWidth="2.6" /></g>;
    rosto = <Rosto x={60} y={62} evolved={evolved} />;
  }
  return <svg viewBox="0 0 120 120" className={`sp gen ${a.forma} ${evolved ? 'evo' : ''}`} aria-hidden="true">{grad}{aura}{corpo}{rosto}</svg>;
}

export function Species({ id, evolved }) {
  if (id === 'dengue') return <Dengue evolved={evolved} />;
  if (id === 'malaria') return <Malaria evolved={evolved} />;
  const arte = DOENCAS.find(d => d.id === id)?.arte;
  if (arte) return <Gen a={arte} evolved={evolved} />;
  return <Pneumo evolved={evolved} />;
}

/* médico de costas, como o treinador no canto da arena */
export function Doctor() {
  return <svg viewBox="0 0 120 130" className="sp doctor" aria-hidden="true">
    <path d="M12 132c0-33 18-52 48-54 30 2 48 21 48 54z" fill="#eef2f8" stroke="#aeb9cc" strokeWidth="2" />
    <path d="M60 86v46" stroke="#cdd5e3" strokeWidth="2" />
    <path d="M24 112c6-6 12-8 18-9M96 112c-6-6-12-8-18-9" stroke="#d5dce8" strokeWidth="2" fill="none" />
    <rect x="86" y="98" width="13" height="8" rx="2" fill="#00f5d4" opacity=".9" />
    <rect x="51" y="62" width="18" height="20" rx="4" fill="#d9a47f" />
    <path d="M40 84q20 -12 40 0" stroke="#2f3a4f" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M40 84c-4 10 0 22 10 28M80 84c4 10 0 22-10 28" stroke="#2f3a4f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <ellipse cx="37" cy="50" rx="4.5" ry="7" fill="#d9a47f" />
    <ellipse cx="83" cy="50" rx="4.5" ry="7" fill="#d9a47f" />
    <circle cx="60" cy="46" r="23" fill="#e2b08a" />
    <path d="M36 48c-3-20 9-31 24-31s27 10 24 31c-2 10-9 16-24 16S38 58 36 48z" fill="#2b2138" />
    <path d="M44 26c6-5 20-6 28 1" stroke="rgba(255,255,255,.18)" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>;
}

/* pets clínicos */
export function PetArt({ id }) {
  const u = useUid();
  const eyes = (y, l = 24, r = 40) => <>
    <ellipse cx={l} cy={y} rx="5" ry="6" fill="#fff" /><ellipse cx={r} cy={y} rx="5" ry="6" fill="#fff" />
    <circle cx={l + 1} cy={y + 1} r="2.8" fill="#10131f" /><circle cx={r + 1} cy={y + 1} r="2.8" fill="#10131f" />
    <circle cx={l + 2} cy={y - 1} r="1" fill="#fff" /><circle cx={r + 2} cy={y - 1} r="1" fill="#fff" />
  </>;
  if (id === 'capsi') return <svg viewBox="0 0 64 64" className="sp pet" aria-hidden="true">
    <defs><linearGradient id={`c${u}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b8ecff" /><stop offset="1" stopColor="#2b9fd6" /></linearGradient></defs>
    {[[20, 10], [32, 6], [44, 10]].map(([x, y], i) => <g key={i}><line x1={x} y1={y + 6} x2={x} y2={y} stroke="#1c6f99" strokeWidth="2.4" /><circle cx={x} cy={y} r="3" fill="#ffe27a" stroke="#1c6f99" strokeWidth="1.2" /></g>)}
    <polygon points="32,14 52,25 52,47 32,58 12,47 12,25" fill={`url(#c${u})`} stroke="#1c6f99" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M32 14v22M12 25l20 11 20-11M32 36v22" stroke="rgba(255,255,255,.35)" strokeWidth="1.4" fill="none" />
    {eyes(34)}
    <path d="M27 44q5 4 10 0" stroke="#10131f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </svg>;
  if (id === 'pulsa') return <svg viewBox="0 0 64 64" className="sp pet" aria-hidden="true">
    <defs><linearGradient id={`h${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9ab5" /><stop offset="1" stopColor="#e0245e" /></linearGradient></defs>
    <path d="M32 58C11 44 5 31 11 21c6-9 17-8 21 1 4-9 15-10 21-1 6 10 0 23-21 37z" fill={`url(#h${u})`} stroke="#8e1238" strokeWidth="2.4" strokeLinejoin="round" />
    {eyes(27, 23, 41)}
    <path d="M9 40h12l3-6 4 11 4-9 2 4h21" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="pulse-line" />
    <g fill="#ffc2d4" opacity=".8"><ellipse cx="16" cy="33" rx="3" ry="2" /><ellipse cx="48" cy="33" rx="3" ry="2" /></g>
  </svg>;
  return <svg viewBox="0 0 64 64" className="sp pet" aria-hidden="true">
    <defs><radialGradient id={`k${u}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#dccfff" /><stop offset=".6" stopColor="#9b72ff" /><stop offset="1" stopColor="#5b33c9" /></radialGradient></defs>
    <ellipse cx="23" cy="58" rx="6" ry="3.4" fill="#4a2aa8" /><ellipse cx="41" cy="58" rx="6" ry="3.4" fill="#4a2aa8" />
    <circle cx="32" cy="35" r="22" fill={`url(#k${u})`} stroke="#3b1f86" strokeWidth="2.4" />
    <g fill="rgba(59,31,134,.35)"><circle cx="18" cy="24" r="2" /><circle cx="45" cy="20" r="1.6" /><circle cx="48" cy="44" r="2" /><circle cx="16" cy="44" r="1.6" /></g>
    {eyes(33)}
    <g fill="#ffb3d1" opacity=".75"><ellipse cx="17" cy="41" rx="3.4" ry="2.2" /><ellipse cx="47" cy="41" rx="3.4" ry="2.2" /></g>
    <path d="M27 43q5 5 10 0" stroke="#10131f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </svg>;
}

// Preceptora do treinamento (arte original em SVG).
const MENTORA = { id: 'iris', nome: 'Dra. Íris', pele: '#e6b691', cabelo: 'coque', corCabelo: '#b8bcc8', pijama: '#8b5cf6', oculos: true, fundo: ['#6d4bd8', '#1b1238'] };

const escurecer = (hex, k = 0.78) => {
  const n = parseInt(hex.slice(1), 16);
  const c = s => Math.round(((n >> s) & 255) * k).toString(16).padStart(2, '0');
  return `#${c(16)}${c(8)}${c(0)}`;
};

export function Retrato({ f = MENTORA, title }) {
  const u = useId().replace(/:/g, '');
  const sombra = escurecer(f.pele, 0.82);
  const hc = f.corCabelo;
  return <svg viewBox="0 0 100 100" className="portrait" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
    <defs>
      <radialGradient id={`bg${u}`} cx=".5" cy=".35" r=".75"><stop offset="0" stopColor={f.fundo[0]} /><stop offset="1" stopColor={f.fundo[1]} /></radialGradient>
      <linearGradient id={`jl${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dfe5ee" /></linearGradient>
      <linearGradient id={`hr${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={hc} /><stop offset="1" stopColor={escurecer(hc, 0.8)} /></linearGradient>
    </defs>
    <rect width="100" height="100" fill={`url(#bg${u})`} />
    <g fill="#fff" opacity=".13">
      <path d="M14 20h3v-3h3v3h3v3h-3v3h-3v-3h-3z" /><path d="M80 14h2v-2h2v2h2v2h-2v2h-2v-2h-2z" /><path d="M84 40h3v-3h3v3h3v3h-3v3h-3v-3h-3z" />
      <path d="M10 52c0-3 4-4 5-1 1-3 5-2 5 1 0 3-5 6-5 6s-5-3-5-6z" />
    </g>
    {/* cabelo de trás */}
    {f.cabelo === 'longo' && <path d="M29 44C27 23 41 16 50 16s23 7 21 28l3 33c-7 3-13 2-16-2V60H42v15c-3 4-9 5-16 2z" fill={`url(#hr${u})`} />}
    {f.cabelo === 'ondulado' && <g fill={hc}>{[[31, 40, 8], [36, 27, 8], [46, 20, 8], [57, 20, 8], [66, 27, 8], [70, 40, 7.5], [29, 52, 5], [72, 52, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>}
    {f.cabelo === 'coque' && <circle cx="50" cy="15.5" r="7.5" fill={`url(#hr${u})`} />}
    {/* pescoço, jaleco, pijama cirúrgico e estetoscópio */}
    <path d="M42.5 58h15v13c-4.5 5-10.5 5-15 0z" fill={sombra} />
    <path d="M6 101c2-17 16-25 31-28l13 13 13-13c15 3 29 11 31 28z" fill={`url(#jl${u})`} stroke="#c3ccd9" strokeWidth=".8" />
    <path d="M40.5 71.5L50 88l9.5-16.5-3-1.5L50 80l-6.5-10z" fill={f.pijama} />
    <path d="M44 70.5l6 9 6-9c-3.5 3-8.5 3-12 0z" fill={f.pele} />
    <path d="M37 73l9.5 17-3 11M63 73l-9.5 17 3 11" stroke="#c3ccd9" strokeWidth="1.2" fill="none" />
    <rect x="21" y="88" width="13" height="10" rx="2" fill="none" stroke="#c3ccd9" strokeWidth="1" />
    <path d="M25 88v-4" stroke={f.pijama} strokeWidth="1.8" strokeLinecap="round" />
    <rect x="64" y="86" width="15" height="6" rx="1.5" fill={f.pijama} opacity=".85" />
    <path d="M40 72c-7 10-4 20 5 22M60 72c7 10 4 20-5 22" stroke="#2c3445" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M45 94q5 3 10 0" stroke="#2c3445" strokeWidth="2.2" fill="none" />
    <circle cx="50" cy="97.5" r="3.4" fill="#aab4c3" stroke="#5a6475" strokeWidth="1" />
    {/* cabeça */}
    <ellipse cx="32.6" cy="47" rx="3.3" ry="4.6" fill={f.pele} />
    <ellipse cx="67.4" cy="47" rx="3.3" ry="4.6" fill={f.pele} />
    <ellipse cx="50" cy="45" rx="17.6" ry="20.4" fill={f.pele} />
    <path d="M36 54c3 8 8 11 14 11s11-3 14-11c-3 5-8 7-14 7s-11-2-14-7z" fill={sombra} opacity=".45" />
    {/* rosto */}
    <path d="M39.5 39.8q4.2-2.6 8.4 0M52.1 39.8q4.2-2.6 8.4 0" stroke={escurecer(hc, 0.72)} strokeWidth="1.7" fill="none" strokeLinecap="round" />
    <ellipse cx="44" cy="46" rx="2.4" ry="3" fill="#241c2a" /><ellipse cx="56" cy="46" rx="2.4" ry="3" fill="#241c2a" />
    <circle cx="44.9" cy="44.9" r=".85" fill="#fff" /><circle cx="56.9" cy="44.9" r=".85" fill="#fff" />
    <path d="M50 48.5q-1.4 3.8.9 4.6" stroke={sombra} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M45.2 55.4q4.8 3.8 9.6 0" stroke="#8a3b42" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <g fill="#ff8f8f" opacity=".3"><ellipse cx="39.5" cy="52.5" rx="2.8" ry="1.6" /><ellipse cx="60.5" cy="52.5" rx="2.8" ry="1.6" /></g>
    {/* cabelo da frente */}
    {f.cabelo === 'curto' && <path d="M31.8 46C29 28 39 20.5 51 20.5S72 28 68.4 46c-1.5-6-3.6-10-6.8-12-2 3.4-7 4.5-11.4 2.4-3 3.2-9 4-13 1.4-2.5 2.6-4.3 5.3-5.4 7.8zM47 21.5l3-5 2.2 5.2z" fill={`url(#hr${u})`} />}
    {f.cabelo === 'ondulado' && <path d="M31 44c-3-18 9-26 20-26 13 0 22 10 18 27-1-6-3-10-6-12-2 3-5 3-7 1-2 3-6 3-8 1-2 3-6 3-8 1-3 3-6 5-9 8z" fill={hc} />}
    {f.cabelo === 'longo' && <path d="M31 46c-1-18 9-26 20-26s20 8 18 26c-3-10-11-16-22-15-7 1-13 7-16 15z" fill={`url(#hr${u})`} />}
    {f.cabelo === 'coque' && <path d="M32 44c-2-17 8-23 18-23s20 6 18 23c-2-10-10-15-18-15s-16 5-18 15z" fill={`url(#hr${u})`} />}
    {f.cabelo === 'raspado' && <path d="M33 37c2-12 10-15.5 17-15.5S65 25 67 37c-5-6-11-8-17-8s-12 2-17 8z" fill={hc} opacity=".92" />}
    {f.cabelo === 'touca' && <><path d="M30 42c-1-17 10-24 20-24s21 7 20 24c-7-6-13-7.5-20-7.5S37 36 30 42z" fill={f.pijama} /><g fill="#fff" opacity=".35">{[[40, 26], [50, 23], [60, 26], [45, 31], [55, 31]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.1" />)}</g><path d="M30.5 41.5c6-5.5 13-7 19.5-7s13.5 1.5 19.5 7" stroke={escurecer(f.pijama, 0.7)} strokeWidth="1.2" fill="none" /></>}
    {f.oculos && <g><rect x="37.6" y="42" width="11.6" height="8.4" rx="3.2" fill="rgba(190,225,255,.16)" stroke="#1d2433" strokeWidth="1.5" /><rect x="50.8" y="42" width="11.6" height="8.4" rx="3.2" fill="rgba(190,225,255,.16)" stroke="#1d2433" strokeWidth="1.5" /><path d="M49.2 45.5h1.6" stroke="#1d2433" strokeWidth="1.5" /></g>}
  </svg>;
}
