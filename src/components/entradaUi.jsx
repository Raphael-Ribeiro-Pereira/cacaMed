import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Check, Eye, EyeOff, Grid3x3, HeartPulse, RotateCw, ScanLine, Sparkles, Stethoscope, Trophy, X } from 'lucide-react';
import { tituloEpico } from '../utils/coroas';
import { MATERIA_CADASTRO, tratamento } from '../utils/cracha';
import { MATERIAS_CADASTRO } from '../utils/entrada';
import { FOTOS } from '../utils/fotosCracha';
import { animar } from '../utils/prototipo';
import { Retrato } from './batalhaArte';
import { CrachaFrente } from './crachaUi';

// Peças das telas de entrada portadas do protótipo de movimento: casca (coluna única no celular,
// marca ou crachá ao lado na web), campos, escolhas do crachá e a impressão do crachá no cadastro.
export const Ecg = () => <svg className="ecg" viewBox="0 0 280 70" aria-hidden="true"><path d="M0 40h70l10-4 8 4h20l8-30 10 56 9-38 6 12h28l12-8 10 8h89" /></svg>;

export const GoogleG = () => <svg className="gg" viewBox="0 0 48 48" aria-hidden="true">
  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
</svg>;

export function Campo({ id, label, icon, estado, ajuda, children }) {
  const Ic = icon;
  return <label className="cr-f" htmlFor={id}>
    <span className="cr-l"><Ic size={12} />{label}</span>
    <span className={`cr-in au-in ${estado || ''}`}>{children}</span>
    {ajuda !== undefined && <span className="cr-help" aria-live="polite">{ajuda}</span>}
  </label>;
}
export const Ok = ({ on, children }) => <span className={`cr-st ${on ? 'ok' : 'chk'}`}>{on ? <Check size={13} /> : <span className="au-dot" />}{children}</span>;
export const Olho = ({ ver, set }) => <button type="button" className="au-eye" onClick={() => set(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>{ver ? <EyeOff size={17} /> : <Eye size={17} />}</button>;
export const Erro = ({ texto }) => <AnimatePresence>{texto && <motion.p className="au-err" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><X size={15} />{texto}</motion.p>}</AnimatePresence>;

export function CascaEntrada({ web, lado, children }) {
  if (!web) return <div className="scroll au-m">{children}</div>;
  return <div className="au-web">
    <aside className="au-side">{lado}</aside>
    <div className="au-main scroll"><div className="au-col">{children}</div></div>
  </div>;
}

export const Marca = () => <div className="au-logo"><span className="au-mark"><Stethoscope /></span><span className="logo">caco<b>Med</b><i className="au-cur">_</i></span></div>;

const RECURSOS = [
  [Grid3x3, 'Cruzadinhas', 'Anatomia, fisiologia, farmaco e mais'],
  [HeartPulse, 'DDX · casos clínicos', 'Plantão, Erro médico e Causa e efeito'],
  [ScanLine, 'Quiz e Verdade ou mentira', 'Rodadas rápidas, com a fonte de cada resposta'],
  [Trophy, 'Devoradores de Plantão', 'Ranking da temporada e coroas por matéria'],
];
export function LadoMarca() {
  return <div className="au-brandside">
    <Marca />
    <span className="kicker">Terminal de plantão · nova temporada</span>
    <h2>O plantão que treina seu <b>raciocínio clínico</b>.</h2>
    <Ecg />
    <ul className="au-feats">{RECURSOS.map(([icone, t, d]) => { const Ic = icone; return <li key={t}><span className="ic"><Ic size={17} /></span><span><b>{t}</b><small>{d}</small></span></li>; })}</ul>
  </div>;
}

// cracha: { p, email, nome, username, foto, desde }, as mesmas props do CrachaFrente.
export function LadoCracha({ cracha }) {
  return <div className="au-crside">
    <span className="kicker">Prévia ao vivo</span>
    <div className="cr-lanyard" aria-hidden="true"><span className="cr-strap" /><span className="cr-clip" /></div>
    <div className="cr-card au-prev"><div className="cr-inner"><CrachaFrente {...cracha} /></div></div>
    <p>É assim que você aparece no ranking e no perfil. Dá para trocar a foto e o username depois.</p>
  </div>;
}

export function MiniCracha({ cracha }) {
  const materia = MATERIA_CADASTRO[cracha.p.materiaPreferida];
  const [titulo, emoji, cor] = tituloEpico(materia || '');
  return <div className="au-mini" aria-label="Prévia do crachá">
    <span className="au-mini-pic"><Retrato f={FOTOS[cracha.foto] || FOTOS[0]} /></span>
    <span className="au-mini-tx">
      <small className="mono">PRÉVIA DO CRACHÁ</small>
      <b>{cracha.p.titulo && `${tratamento(cracha.p.titulo)} `}{cracha.nome}</b>
      <span className="mono">@{cracha.username}</span>
      {materia ? <span className="cr-pill ti" style={{ '--tc': cor }}><span aria-hidden="true">{emoji}</span>{titulo}</span> : <span className="au-mini-q">Escolha a matéria para ganhar um título</span>}
    </span>
  </div>;
}

export function Escolhas({ titulo, setTitulo, materia, setMateria, foto, setFoto, tentou }) {
  const epico = materia ? tituloEpico(MATERIA_CADASTRO[materia]) : null;
  return <>
    <div className="cr-f"><span className="cr-l">Título</span>
      <div className={`au-seg ${tentou && !titulo ? 'bad' : ''}`} role="radiogroup" aria-label="Título">
        {['Doutor', 'Doutora'].map(t => <button key={t} type="button" role="radio" aria-checked={titulo === t} className={titulo === t ? 'on' : ''} onClick={() => setTitulo(t)}>{t === 'Doutor' ? 'Dr.' : 'Dra.'}<small>{t}</small></button>)}
      </div>
    </div>
    <div className="cr-f"><span className="cr-l">Matéria preferida</span>
      <div className={`au-mats ${tentou && !materia ? 'bad' : ''}`} role="radiogroup" aria-label="Matéria preferida">
        {MATERIAS_CADASTRO.map(([v, t, e]) => <button key={v} type="button" role="radio" aria-checked={materia === v} className={materia === v ? 'on' : ''} onClick={() => setMateria(v)}><span aria-hidden="true">{e}</span>{t}</button>)}
      </div>
      {epico && <span className="cr-help au-ti">Título épico no crachá: <b style={{ color: epico[2] }}>{epico[0]}</b></span>}
    </div>
    <div className="cr-f"><span className="cr-l">Foto do crachá</span>
      <div className="cr-fotos" role="radiogroup" aria-label="Foto do crachá">
        {FOTOS.map((ft, i) => <button key={ft.id} type="button" role="radio" aria-checked={foto === i} className={foto === i ? 'on' : ''} onClick={() => setFoto(i)} title={ft.nome}><Retrato f={ft} /></button>)}
      </div>
    </div>
  </>;
}

// Impressão do crachá enquanto o cadastro grava. Até o tempo previsto o crachá sai quase inteiro;
// o último trecho só sai quando o servidor confirma. etapa: índice do passo em andamento (passos.length = concluído).
const PREVISTO_MS = 2600;
export function Impressao({ cracha, passos, etapa, erro, tentativa, aoTentar, aoRevisar, aoEntrar }) {
  const ctl = useAnimationControls();
  const [saiu, setSaiu] = useState(null);
  const concluido = etapa >= passos.length;
  useEffect(() => {
    ctl.set({ y: '-101%' });
    if (animar()) ctl.start({ y: '-9%', transition: { duration: PREVISTO_MS / 1000, ease: [0.25, 0.1, 0.35, 1] } });
    return () => ctl.stop();
  }, [tentativa, ctl]);
  useEffect(() => { if (erro) ctl.stop(); }, [erro, ctl]);
  useEffect(() => {
    if (!concluido) return undefined;
    let vivo = true;
    const fim = animar() ? ctl.start({ y: '0%', transition: { duration: .5, ease: [0.16, 1, 0.3, 1] } }) : Promise.resolve(ctl.set({ y: '0%' }));
    fim.then(() => { if (vivo) setSaiu(tentativa); });
    return () => { vivo = false; };
  }, [concluido, ctl, tentativa]);
  const pronto = concluido && saiu === tentativa;
  const doutora = tratamento(cracha.p.titulo) === 'Dra.';
  const primeiro = String(cracha.nome || '').trim().split(/\s+/)[0];
  return <motion.div className="au-print" role="dialog" aria-modal="true" aria-label="Emissão do crachá" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="pr-in">
      <span className="kicker">Recepção · emissão de crachá</span>
      <h2>{pronto ? `Bem-vind${doutora ? 'a' : 'o'} ao plantão, ${doutora ? 'Dra.' : 'Dr.'} ${primeiro}` : erro ? 'A impressora parou' : 'Imprimindo seu crachá'}</h2>
      <div className="pr-machine">
        <div className="pr-slot" aria-hidden="true"><span className={`pr-led ${erro ? 'err' : pronto ? 'ok' : ''}`} /><span className="pr-mouth" /></div>
        <div className="pr-window">
          <motion.div className="pr-card" animate={ctl}>
            <div className={`cr-card ${pronto ? 'pr-shine' : ''}`}><div className="cr-inner"><CrachaFrente {...cracha} /></div></div>
          </motion.div>
        </div>
      </div>
      <ol className="pr-steps">{passos.map((t, i) => {
        const st = erro && i === etapa ? 'err' : i < etapa || pronto ? 'done' : i === etapa ? 'on' : '';
        return <li key={t} className={st}>{st === 'done' ? <Check size={13} /> : st === 'err' ? <X size={13} /> : st === 'on' ? <span className="spin sm" /> : <span className="au-dot" />}{t}</li>;
      })}</ol>
      <AnimatePresence mode="wait">
        {pronto && <motion.div key="ok" className="pr-act" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="pr-stamp"><Sparkles size={14} />Crachá emitido · missões do dia liberadas</span>
          <button className="primary" onClick={aoEntrar}><Stethoscope />Entrar no plantão</button>
        </motion.div>}
        {erro && <motion.div key="err" className="pr-act" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="cr-err" role="alert">{erro}</p>
          <button className="primary" onClick={aoTentar}><RotateCw />Tentar de novo</button>
          <button className="ghost" onClick={aoRevisar}>Revisar dados</button>
        </motion.div>}
      </AnimatePresence>
    </div>
  </motion.div>;
}
