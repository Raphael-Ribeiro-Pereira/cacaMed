import { useEffect, useState } from 'react';
import { Award, BadgeCheck, Check, ClipboardCheck, Mail, Stethoscope, Trophy, X } from 'lucide-react';
import { tituloEpico } from '../utils/coroas';
import { especialidade, hash, matriculaDe, tratamento } from '../utils/cracha';
import { progressoGlobal } from '../utils/economia';
import { FOTOS } from '../utils/fotosCracha';
import { resumirCruzadinhas } from '../utils/progressoCruzadinha';
import { fmt } from '../utils/prototipo';
import { Retrato } from './batalhaArte';

// Peças do crachá usadas pelo Crachá (PerfilUsuario) e pela impressão do crachá no cadastro.
export function Barcode({ v }) {
  let h = hash(v), x = 0;
  const barras = [];
  while (x < 118) { h = (h * 1103515245 + 12345) >>> 0; const w = 1 + (h % 3); barras.push([x, w]); x += w + 1 + ((h >> 5) % 2); }
  return <svg className="cr-bar" viewBox="0 0 120 24" aria-hidden="true">{barras.map(([bx, w], i) => <rect key={i} x={bx} width={w} height="24" />)}</svg>;
}
export function QR({ v }) {
  let h = hash(v);
  const cells = [];
  const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
  for (let r = 0; r < 21; r++) for (let c = 0; c < 21; c++) { h = (h * 1664525 + 1013904223) >>> 0; if (!finder(r, c) && h % 5 < 2) cells.push([r, c]); }
  const f = (x, y) => <g key={`${x}${y}`}><rect x={x} y={y} width="7" height="7" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1" /><rect x={x + 2} y={y + 2} width="3" height="3" rx=".6" /></g>;
  return <svg className="cr-qr" viewBox="-1 -1 23 23" aria-hidden="true"><g fill="currentColor">{cells.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />)}{f(0, 0)}{f(14, 0)}{f(0, 14)}</g></svg>;
}

function Ring({ pct }) {
  const C = 2 * Math.PI * 58;
  const [off, setOff] = useState(C);
  useEffect(() => { const t = setTimeout(() => setOff(C * (1 - pct / 100)), 80); return () => clearTimeout(t); }, [C, pct]);
  return <svg className="cr-ring" viewBox="0 0 128 128" aria-hidden="true">
    <defs><linearGradient id="crg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00f5d4" /><stop offset=".55" stopColor="#00dfc1" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
    <circle cx="64" cy="64" r="58" className="t" />
    <circle cx="64" cy="64" r="58" className="f" stroke="url(#crg)" strokeDasharray={C} strokeDashoffset={off} />
    {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <line key={i} x1={64 + 51 * Math.cos(a)} y1={64 + 51 * Math.sin(a)} x2={64 + 54 * Math.cos(a)} y2={64 + 54 * Math.sin(a)} className={i % 6 ? 'tk' : 'tk on'} />; })}
  </svg>;
}

export function StatusUser({ check }) {
  return { idle: null, checking: <span className="cr-st chk"><span className="spin" />Conferindo no servidor</span>, ok: <span className="cr-st ok"><Check size={13} />Disponível</span>,
    taken: <span className="cr-st no"><X size={13} />Já usado por outro plantonista</span>, falha: <span className="cr-st no"><X size={13} />Não foi possível conferir agora</span>,
    invalid: <span className="cr-st no"><X size={13} />Use 3 a 20 letras minúsculas, números, ponto ou _</span> }[check];
}

export function CrachaFrente({ p, email, nome, username, foto, desde, oculto }) {
  const L = progressoGlobal(p);
  const [esp] = especialidade(p);
  const [titulo, emoji, corTitulo] = tituloEpico(esp);
  const matricula = matriculaDe(p.uid || username);
  const cruz = resumirCruzadinhas(p.estatisticas).partidas;
  const concluidos = ['ddx', 'erroMedico', 'causaEfeito'].reduce((t, k) => t + (Number(p[k]?.partidas) || 0), 0);
  const stats = [
    ['Cruzadinhas', String(cruz), Stethoscope, 'var(--mint)'],
    ['Plantões seguros', String(Number(p.ddx?.seguros) || 0), Trophy, 'var(--amber)'],
    ['Plantões concluídos', String(concluidos), ClipboardCheck, 'var(--mint)'],
    ['XP total', L.xp >= 1000 ? `${(L.xp / 1000).toFixed(1).replace('.', ',')}k` : String(L.xp), Award, '#b49cff'],
  ];
  return <div className="cr-face cr-front" aria-hidden={oculto}>
    <div className="cr-slot" />
    <div className="cr-top"><span className="cr-org">caco<b>Med</b><small>HOSPITAL-ESCOLA</small></span><span className="cr-chipcard" /><span className="cr-access">ACESSO<br /><b>UTI CENTRAL</b></span></div>
    <div className="cr-photo">
      <Ring pct={L.percentual} />
      <span className="cr-pic"><Retrato f={FOTOS[foto] || FOTOS[0]} title={`Foto de ${nome}`} /></span>
      <span className="cr-lvl mono"><small>LVL</small>{L.nivel}</span>
    </div>
    <b className="cr-name">{p.titulo && <small className="cr-tt">{tratamento(p.titulo)}</small>}{nome}</b>
    <span className="cr-user">@{username}<BadgeCheck size={14} /></span>
    <span className="cr-mail"><Mail size={11} />{email}</span>
    <div className="cr-pills">
      <span className="cr-pill lv"><Stethoscope size={13} />Nível {L.nivel}</span>
      <span className="cr-pill ti" style={{ '--tc': corTitulo }}><span aria-hidden="true">{emoji}</span>{titulo}</span>
    </div>
    <div className="cr-xp">
      <div><span>PRÓXIMO NÍVEL</span><b className="mono">{fmt(L.xp)}/{fmt(L.proximo)}</b></div>
      <span className="cr-xpbar"><span style={{ width: `${L.percentual}%` }} /></span>
    </div>
    <div className="cr-stats">{stats.map(([t, v, icone, c]) => { const Ic = icone; return <div key={t}><Ic size={14} style={{ color: c }} /><b className="mono">{v}</b><small>{t}</small></div>; })}</div>
    <div className="cr-foot">
      <span className="cr-id mono">ID</span>
      <div><small>MATRÍCULA</small><b className="mono">{matricula}</b></div>
      <div className="r"><small>DESDE</small><b className="mono">{desde}</b></div>
    </div>
    <Barcode v={matricula + username} />
    <span className="cr-holo" />
  </div>;
}
