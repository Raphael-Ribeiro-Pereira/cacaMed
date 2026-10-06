import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { MATERIAS, coroasDoJogador, fimDaSemana, numeroSemana, tituloEpico } from '../utils/coroas';
import { animar, fmt } from '../utils/prototipo';
import { Avatar, CountNum, Crown } from './prototipoUi';

// Coroas por matéria, portadas do protótipo de movimento. tabela: { semana, materias: { id: [{ id, nome, xp, me }] } }.
export function TagsCoroa({ tabela, id }) {
  const ms = MATERIAS.filter(m => tabela?.materias[m.id]?.[0]?.id === id);
  if (!ms.length) return null;
  return <span className="cz-tags">{ms.map(m => <span key={m.id} className="cz-tag" style={{ '--c': m.cor }} title={`Coroa de ${m.nome}`}>{tituloEpico(m.chave)[1]}</span>)}</span>;
}

function Contagem({ fim }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.floor((Date.parse(fim) - agora) / 1000));
  const partes = [[Math.floor(s / 86400), 'd'], [Math.floor(s / 3600) % 24, 'h'], [Math.floor(s / 60) % 60, 'min'], [s % 60, 's']];
  return <div className="cz-count" aria-label="Tempo até as coroas fecharem">
    {partes.map(([v, u]) => <span key={u} className="cz-u">
      <span className="cz-dig mono"><AnimatePresence mode="popLayout" initial={false}>
        <motion.b key={v} initial={animar() ? { y: -14, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }} transition={{ duration: .28 }}>{String(v).padStart(2, '0')}</motion.b>
      </AnimatePresence></span>
      <small>{u}</small>
    </span>)}
  </div>;
}

const RAIOS = Array.from({ length: 12 }, (_, i) => i * 30);

function Cartao({ m, i, lista, antes, web, foto, onOpen }) {
  const [titulo, emoji] = tituloEpico(m.chave);
  const dono = lista[0];
  const eu = lista.findIndex(r => r.me);
  const meu = lista[eu];
  const souDono = eu === 0;
  const trocou = Boolean(antes && dono && antes[0]?.id !== dono.id);
  const pct = souDono ? 100 : meu && dono ? Math.round((meu.xp / Math.max(1, dono.xp)) * 100) : 0;
  const A = animar();
  return <motion.button className={`cz-card ${souDono ? 'mine' : ''} ${trocou ? 'swap' : ''}`} style={{ '--c': m.cor }} onClick={onOpen}
    aria-label={dono ? `Trono de ${m.nome}: ${dono.me ? 'você' : dono.nome} lidera com ${dono.xp} XP` : `Trono de ${m.nome}: vago`}
    initial={A ? { opacity: 0, y: 26, rotateX: -38 } : false} animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ delay: .18 + i * .08, type: 'spring', damping: 17, stiffness: 170 }}
    whileHover={A && web ? { y: -5 } : undefined} whileTap={A ? { scale: .97 } : undefined}>
    <AnimatePresence>{souDono && <motion.span key="rib" className="cz-ribbon mono" initial={A ? { scale: 0, rotate: 10 } : false} animate={{ scale: 1, rotate: 38 }} exit={{ scale: 0 }} transition={{ delay: trocou ? .7 : 0, type: 'spring', damping: 12 }}>SUA COROA</motion.span>}</AnimatePresence>
    <span className="cz-seal"><span className="cz-ring" /><span className="cz-emoji" style={{ animationDelay: `${i * .35}s` }}>{emoji}</span></span>
    <b className="cz-title">{titulo}</b>
    <small className="cz-mat mono">{m.nome}</small>
    <span className="cz-holder">
      <AnimatePresence mode="popLayout" initial={false}>
        {dono ? <motion.span key={dono.id} className="cz-h" initial={{ x: 34, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -34, opacity: 0, rotate: -6 }} transition={{ type: 'spring', damping: 17, stiffness: 200 }}>
          <span className="cz-hav">
            <Avatar nome={dono.nome} me={dono.me} foto={foto} size={26} />
            <motion.span className="cz-mini" initial={trocou && A ? { y: -46, rotate: -50, opacity: 0 } : false} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ delay: .3, type: 'spring', damping: 8, stiffness: 170 }}><Crown tier={1} size={17} /></motion.span>
          </span>
          <span className="cz-hn">{dono.me ? 'Você' : dono.nome}</span>
          <span className="cz-hx mono"><CountNum to={dono.xp} /></span>
        </motion.span> : <motion.span key="vago" className="cz-h" initial={false} animate={{ opacity: 1 }}><span className="cz-hn">Trono vago</span></motion.span>}
      </AnimatePresence>
    </span>
    <span className="cz-me">
      <span className="cz-bar"><motion.span initial={A ? { width: 0 } : false} animate={{ width: `${pct}%` }} transition={{ delay: .45 + i * .08, duration: .9, ease: [0.16, 1, 0.3, 1] }} /></span>
      <small>{souDono ? (lista[1] ? <>Na frente por <b className="mono">{fmt(dono.xp - lista[1].xp)} XP</b></> : 'Ninguém mais pontuou') : meu ? <>Você: {eu + 1}º · faltam <b className="mono">{fmt(dono.xp - meu.xp + 1)} XP</b></> : dono ? 'Você ainda não pontuou' : 'Primeiro XP da semana leva a coroa'}</small>
    </span>
    {trocou && souDono && A && <span className="cz-burst" aria-hidden="true">{RAIOS.map(a => <i key={a} style={{ '--a': `${a}deg` }} />)}</span>}
  </motion.button>;
}

export function Coroas({ tabela, antes, fresco, erro, web, foto, onOpen }) {
  const minhas = coroasDoJogador(tabela);
  const roubo = antes ? MATERIAS.find(m => !antes.materias[m.id]?.[0]?.me && tabela.materias[m.id]?.[0]?.me) : undefined;
  const A = animar();
  return <div className="cz">
    <section className="cz-hero rise">
      <span className="cz-rays" aria-hidden="true" />
      {[1, 2, 3, 4, 5].map(k => <i key={k} className={`cz-sp s${k}`} aria-hidden="true" />)}
      <motion.span className="cz-big" aria-hidden="true" animate={A ? { y: [0, -7, 0], rotate: [-4, 4, -4] } : undefined} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}><Crown tier={1} size={62} /></motion.span>
      <span className="kicker">Coroas da semana {numeroSemana(tabela.semana)}</span>
      <h2>Um trono por matéria</h2>
      <p>Quem somar mais XP na matéria até domingo leva o título épico do crachá.</p>
      <Contagem fim={tabela.fim || fimDaSemana().toISOString()} />
      <span className={`cz-mine ${minhas.length ? 'on' : ''}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={minhas.length} initial={A ? { y: 10, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
            {minhas.length ? <>👑 Você tem <b>{minhas.length} coroa{minhas.length > 1 ? 's' : ''}</b></> : 'Você ainda não tem coroa nesta semana'}
          </motion.span>
        </AnimatePresence>
      </span>
    </section>

    <AnimatePresence>
      {roubo && <motion.div key="bn" className="cz-banner" style={{ '--c': roubo.cor }} role="status"
        initial={A ? { opacity: 0, height: 0, y: -8 } : false} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', damping: 22, stiffness: 240 }}>
        <span className="cz-bn-in"><Crown tier={1} size={26} /><span><b>Coroa tomada!</b> Você passou {antes.materias[roubo.id]?.[0]?.nome || 'a liderança anterior'} e agora é {tituloEpico(roubo.chave)[0]} da semana.</span></span>
      </motion.div>}
    </AnimatePresence>

    <div className="cz-grid">{MATERIAS.map((m, i) => <Cartao key={m.id} m={m} i={i} lista={tabela.materias[m.id] || []} antes={antes?.materias[m.id]} web={web} foto={foto} onOpen={() => onOpen(m.id)} />)}</div>
    <p className="note" style={{ textAlign: 'center' }}>{erro ? `Não foi possível conferir as coroas agora: ${erro}` : fresco ? 'Coroas conferidas no servidor. Contam o XP por tema de cruzadinhas, Plantão, Erro médico, Causa e efeito e Batalha.' : 'Última visita exibida; conferindo no servidor.'}</p>
  </div>;
}

export function Trono({ m, lista, foto, onClose, onJogar }) {
  const [titulo, emoji] = tituloEpico(m.chave);
  const max = Math.max(1, lista[0]?.xp || 0);
  const eu = lista.findIndex(r => r.me);
  const top = lista.slice(0, 5);
  if (eu >= 5) top.push(lista[eu]);
  const A = animar();
  return <>
    <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
    <motion.div key="sh" className="sheet cz-sheet" style={{ '--c': m.cor }} role="dialog" aria-modal="true" aria-label={`Trono de ${m.nome}`}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
      <div className="cz-th">
        <span className="cz-seal lg"><span className="cz-ring" /><span className="cz-emoji">{emoji}</span></span>
        <span><span className="kicker">Trono de {m.nome}</span><h3>{titulo}</h3><small>XP em {m.nome} nesta semana</small></span>
        <button className="icon-btn" onClick={onClose} aria-label="Fechar"><X /></button>
      </div>
      {top.length ? <ol className="cz-race">{top.map((r, k) => {
        const pos = lista.indexOf(r);
        return <motion.li key={r.id} className={r.me ? 'me' : ''} initial={A ? { opacity: 0, x: -16 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: .1 + k * .07 }}>
          <span className="pos mono">{pos === 0 ? <Crown tier={1} size={20} /> : `${pos + 1}º`}</span>
          <Avatar nome={r.nome} me={r.me} foto={foto} size={28} />
          <span className="cz-rn"><b>{r.me ? 'Você' : r.nome}</b>
            <span className="cz-rbar"><motion.span initial={A ? { width: 0 } : false} animate={{ width: `${(r.xp / max) * 100}%` }} transition={{ delay: .2 + k * .07, duration: .85, ease: [0.16, 1, 0.3, 1] }} /></span>
          </span>
          <span className="cz-rx mono"><CountNum to={r.xp} /></span>
        </motion.li>;
      })}</ol> : <p className="note">Ninguém pontuou em {m.nome} nesta semana.</p>}
      <p className="gap-line cz-gap">{!lista.length ? <>O primeiro XP em {m.nome} já leva a coroa.</> : eu === 0
        ? (lista[1] ? <>A coroa é sua. {lista[1].nome} está a <b>{fmt(lista[0].xp - lista[1].xp)} XP</b>; segure até domingo.</> : <>A coroa é sua. Ninguém mais pontuou em {m.nome} nesta semana.</>)
        : <>Faltam <b>{fmt(lista[0].xp - (lista[eu]?.xp || 0) + 1)} XP</b> para tomar a coroa de {lista[0].nome.replace(/\.$/, '')}.</>}</p>
      <button className="primary cz-go" onClick={onJogar}>Jogar {m.nome}<ArrowRight /></button>
    </motion.div>
  </>;
}
