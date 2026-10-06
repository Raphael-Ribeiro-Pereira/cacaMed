import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, FlaskConical, PawPrint, Pointer, Search, Shield, Stethoscope, X, Zap } from 'lucide-react';
import { AGENTE, MOVES, PET_QUANDO, aplicarAcao, executarBatalha, examesDe, hipotesesDe, obterPet } from '../utils/batalha';
import { Blob, Doctor, PetArt, Retrato, Species } from './batalhaArte';

const SEM_ANIMACAO = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const MORTO = Symbol('morto');

// Treinamento guiado: cada passo destaca um elemento; só a ação pedida fica liberada.
const passos = web => [
  { k: 'tap', el: '.foe-plate', t: 'Esta é a doença. Ainda não sabemos qual é, por isso o "???". A barra mostra a carga: quando zerar, a doença está controlada.' },
  { k: 'tap', el: '.me-plate', t: 'Este é o seu paciente. Você nunca o ataca: escolhas erradas é que dão tempo para a doença. Se a estabilidade zerar, ele vai para a UTI.' },
  { k: 'm:exams', el: '.b-exams', t: 'Comece investigando. Toque em Exames.' },
  { k: 'ex:rx', el: '[data-k="ex:rx"]', t: 'Febre, tosse e dor ao respirar fundo. Peça o RX de tórax.' },
  { k: 'tap', el: web ? '.bt-side .clues' : '.clue-btn', t: web ? 'O resultado do exame e o sintoma que a doença mostrou viraram pistas no prontuário.' : 'O resultado do exame e o sintoma que a doença mostrou viraram pistas. Elas ficam aqui.' },
  { k: 'm:dx', el: '.b-dx', t: 'Consolidação no RX e febre alta: você já tem uma hipótese. Toque em Diagnosticar.' },
  { k: 'dx:pneumo', el: '[data-k="dx:pneumo"]', t: 'Escolha Pneumonia pneumocócica. Uma hipótese errada custaria estabilidade.' },
  { k: 'tap', el: '.foe-plate', t: 'Acertou! A doença se revelou e evoluiu: ganhou Hipoxemia. Um buff muda as regras até você responder a ele.' },
  { k: 'pet', el: '.b-pet', t: 'Com o buff ativo, o Cocobi entrou em momento crítico. Toque nele para fazer a Coloração de Gram.' },
  { k: 'm:moves', el: '.b-moves', t: 'Gram positivo: o próximo antibacteriano causa o dobro. Abra as Habilidades.' },
  { k: 'mv:critica', el: '[data-k="mv:critica"]', t: 'Primeiro, responda ao buff: oxigênio e reavaliação da gravidade.' },
  { k: 'm:moves', el: '.b-moves', t: 'Buff neutralizado. Agora, a terapia.' },
  { k: 'mv:bacti', el: '[data-k="mv:bacti"]', t: 'BactiBaque: o antibacteriano é a conduta que controla a pneumonia.' },
  { k: 'tap', el: '.b-moves', t: 'Cada habilidade usada fica um turno em recarga. Agora é com você: termine de controlar a doença.' },
];

function Digitando({ t }) {
  const [n, setN] = useState(SEM_ANIMACAO ? t.length : 0);
  useEffect(() => {
    if (SEM_ANIMACAO) return;
    const t0 = performance.now();
    const id = setInterval(() => { const k = Math.min(t.length, Math.floor((performance.now() - t0) / 17)); setN(k); if (k >= t.length) clearInterval(id); }, 30);
    return () => clearInterval(id);
  }, [t]);
  return <span className="typer">{t.slice(0, n)}<span className="ghost">{t.slice(n)}</span></span>;
}

function SeloGravacao({ estado, onReenviar }) {
  if (estado === 'idle') return null;
  const texto = { pend: 'Salvando', ok: 'Salvo', err: 'Reenviar' }[estado];
  return <button type="button" className={`sync ${estado === 'ok' ? 'ok' : estado === 'err' ? 'err' : ''}`} disabled={estado !== 'err'} onClick={onReenviar}><span className="dot" />{texto}</button>;
}

export default function BatalhaArena({ entrada, doenca, web, usuario, servicoPerfil, setDadosUsuario, onSair, onFim }) {
  const d = doenca;
  const pet = obterPet(entrada.pet);
  const hips = useMemo(() => hipotesesDe(d), [d]);
  const exs = useMemo(() => examesDe(d), [d]);
  const tutorial = entrada.modo === 'tutorial';
  const [estado, setEstado] = useState(() => executarBatalha(d, entrada.pet, entrada.acoes));
  const [vis, setVis] = useState(null);
  const [msg, setMsg] = useState({ t: '', k: 0 });
  const [menu, setMenu] = useState(null);
  const [fx, setFx] = useState('');
  const [proj, setProj] = useState(null);
  const [foeFx, setFoeFx] = useState('');
  const [meFx, setMeFx] = useState('');
  const [petFx, setPetFx] = useState('off');
  const [sync, setSync] = useState('idle');
  const [erroFinal, setErroFinal] = useState('');
  const [folha, setFolha] = useState(null);
  const [novaPista, setNovaPista] = useState(0);
  const TUT = useMemo(() => passos(web), [web]);
  const [ti, setTi] = useState(tutorial && !entrada.acoes.length ? 0 : TUT.length);
  const passo = ti < TUT.length ? TUT[ti] : null;
  const [furo, setFuro] = useState(null);
  const corpoRef = useRef(null);
  const estadoRef = useRef(estado);
  const acoesRef = useRef(entrada.acoes);
  const vivo = useRef(true);
  const pular = useRef(null);
  const gravando = useRef({ voo: false, de: 0, pendente: false });

  const tk = k => { if (passo && passo.k === k) setTi(i => i + 1); };
  const livre = k => !passo || passo.k === k;

  const pausa = ms => new Promise((ok, falha) => { setTimeout(() => (vivo.current ? ok() : falha(MORTO)), SEM_ANIMACAO ? Math.min(ms, 40) : ms); });
  const dizer = (t, segurar = 750) => new Promise((ok, falha) => {
    setMsg({ t, k: Math.random() });
    const fim = () => { clearTimeout(id); pular.current = null; if (vivo.current) ok(); else falha(MORTO); };
    const id = setTimeout(fim, SEM_ANIMACAO ? 400 : Math.min(1500, t.length * 17) + segurar);
    pular.current = fim;
  });
  const tiro = async (c, erro) => { setProj({ k: Math.random(), c, erro }); await pausa(560); setProj(null); };

  async function efeito(codigo) {
    if (!codigo) return;
    if (codigo === 'me-lunge') { setMeFx('lunge'); await pausa(260); setMeFx(''); }
    else if (codigo.startsWith('shot:')) await tiro(codigo.slice(5));
    else if (codigo.startsWith('miss:')) await tiro(codigo.slice(5), true);
    else if (codigo === 'foe-hit') { setFoeFx('hit'); await pausa(650); setFoeFx(''); }
    else if (codigo === 'foe-pump') { setFoeFx('pump'); await pausa(500); setFoeFx(''); }
    else if (codigo === 'foe-lunge') { setFoeFx('lunge'); await pausa(340); setFoeFx(''); }
    else if (codigo === 'heal') { setMeFx('heal'); await pausa(600); setMeFx(''); }
    else if (codigo === 'me-hurt') { setFx('shake'); setMeFx('hurt'); await pausa(620); setFx(''); setMeFx(''); }
    else if (codigo === 'scan') { setFx('scan'); await pausa(800); setFx(''); }
    else if (codigo === 'reveal') { setFx('flash'); await pausa(260); setFoeFx('appear'); await pausa(700); setFx(''); setFoeFx(''); }
    else if (codigo === 'evolve') { setFoeFx('evolve'); await pausa(1700); setFoeFx('evolved'); await pausa(500); setFoeFx(''); }
    else if (codigo === 'pet-cast') { setPetFx('cast'); await tiro('pet'); setPetFx(''); }
    else if (codigo === 'pet-ready') setPetFx('ready');
    else if (codigo === 'faint') { setFoeFx('faint'); await pausa(1000); }
    else if (codigo === 'down') setMeFx('down');
  }

  // Grava em segundo plano a lista de ações. Um único pedido por vez; o servidor aceita só extensões.
  async function gravar() {
    const g = gravando.current;
    if (g.voo) { g.pendente = true; return g.promessa; }
    g.voo = true; g.pendente = false;
    const enviadas = acoesRef.current.length;
    setSync('pend');
    g.promessa = (async () => {
      try {
        const perfil = await servicoPerfil(usuario, 'acaoBatalha', { entradaId: entrada.id, acoes: acoesRef.current.slice(0, enviadas) });
        g.voo = false; g.de = enviadas;
        if (g.pendente && acoesRef.current.length > enviadas) return await gravar();
        if (vivo.current) setSync('ok');
        return perfil;
      } catch (erro) {
        g.voo = false;
        if (vivo.current) setSync('err');
        throw erro;
      }
    })();
    return g.promessa;
  }

  async function confirmarFim() {
    setErroFinal('');
    try {
      let perfil = await gravar();
      while (gravando.current.de < acoesRef.current.length) perfil = await gravar();
      if (!perfil?.batalha?.entrada?.relatorio) throw new Error('O resultado ainda não foi confirmado.');
      setDadosUsuario(perfil);
      onFim();
    } catch (erro) {
      if (vivo.current) setErroFinal(erro.message || 'Não foi possível confirmar o resultado.');
    }
  }

  async function jogar(acao) {
    setMenu(null);
    let r;
    try { r = aplicarAcao(estadoRef.current, acao, d, entrada.pet); }
    catch (erro) { await dizer(erro.message, 400).catch(() => {}); setMenu('main'); return; }
    acoesRef.current = [...acoesRef.current, acao];
    let pistasAntes = estadoRef.current.clues.length;
    try {
      for (const ev of r.eventos) {
        setVis(ev);
        if (ev.pistas > pistasAntes) { setNovaPista(n => n + 1); pistasAntes = ev.pistas; }
        await efeito(ev.fx);
        if (ev.msg) await dizer(ev.msg, ev.msg.length > 60 ? 1200 : 500);
      }
      estadoRef.current = r.estado;
      setEstado(r.estado); setVis(null);
      if (r.estado.fim) { setMsg({ t: 'Confirmando o resultado…', k: Math.random() }); await confirmarFim(); return; }
      gravar().catch(() => {});
      await dizer('O que você vai fazer?', 0);
      setMenu('main');
    } catch (erro) { if (erro !== MORTO) throw erro; }
  }

  // abertura
  useEffect(() => {
    vivo.current = true;
    (async () => {
      try {
        if (entrada.acoes.length) { setPetFx(''); await dizer('Batalha retomada do último turno salvo.', 400); }
        else {
          if (tutorial) await dizer('Treinamento guiado com a Dra. Íris, sua preceptora.', 600);
          await dizer('Uma doença desconhecida apareceu!', 650);
          await dizer(`Paciente: ${d.paciente}. ${d.queixa}`, 1000);
          setPetFx('enter');
          await dizer(`Vai, ${pet.nome}! ${pet.esp} no plantão.`, 450);
          setPetFx('');
        }
        if (estadoRef.current.fim) { await confirmarFim(); return; }
        await dizer('O que você vai fazer?', 0);
        setMenu('main');
      } catch (erro) { if (erro !== MORTO) throw erro; }
    })();
    return () => { vivo.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // aviso ao sair com turno ainda não gravado
  useEffect(() => {
    if (sync !== 'pend' && sync !== 'err') return;
    const avisar = evento => { evento.preventDefault(); evento.returnValue = ''; };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [sync]);

  // holofote do treinamento: mede o alvo relativo à tela
  useLayoutEffect(() => {
    if (!passo || !menu) return;
    const host = corpoRef.current?.closest('.cbt-scr');
    const medir = () => {
      const el = host?.querySelector(passo.el);
      if (!el || !host) return setFuro(null);
      const a = el.getBoundingClientRect(), h = host.getBoundingClientRect();
      setFuro({ x: a.left - h.left, y: a.top - h.top, w: a.width, h: a.height, W: h.width, H: h.height });
    };
    medir();
    const t1 = setTimeout(medir, 220), t2 = setTimeout(medir, 600);
    window.addEventListener('resize', medir);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', medir); };
  }, [ti, menu, passo]);

  // teclado: 1–4 escolhem, Esc volta, Enter/Espaço avançam o texto
  useEffect(() => {
    const k = e => {
      if (folha || e.target.closest?.('input, textarea')) return;
      if ((e.key === 'Enter' || e.key === ' ') && pular.current) { e.preventDefault(); pular.current(); return; }
      if (e.key === 'Enter' && passo?.k === 'tap' && menu) { e.preventDefault(); setTi(i => i + 1); return; }
      if (e.key === 'Escape' && menu && menu !== 'main') { setMenu('main'); return; }
      const n = '123456'.indexOf(e.key);
      if (n < 0 || !menu) return;
      const botao = document.querySelectorAll('.cbt .bmenu button:not(.bback)')[n];
      if (botao && !botao.disabled) botao.click();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const s = { ...estado, ...(vis || {}) };
  const pistasVisiveis = estado.clues.slice(0, vis ? vis.pistas : estado.clues.length);
  const cor = v => (v > 50 ? 'g' : v > 22 ? 'y' : 'r');
  const hipoteses = <div className="hyps">{hips.map(h => {
    const st = s.revealed && h.id === d.id ? 'ok' : estado.elim.includes(h.id) ? 'off' : '';
    return <span key={h.id} className={`hyp ${st}`}>{st === 'ok' ? <Check size={13} /> : st === 'off' ? <X size={13} /> : <span className="dot" />}{h.nome}</span>;
  })}</div>;
  const pistas = <div className="clues">{pistasVisiveis.length ? pistasVisiveis.map(c => <motion.div key={c.t} className="clue" initial={SEM_ANIMACAO ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}><span className="src">{c.src}</span>{c.t}</motion.div>) : <p className="muted" style={{ fontSize: 12.5 }}>Os sintomas da doença e os exames aparecem aqui.</p>}</div>;
  const rotulo = entrada.modo === 'x1' ? 'Duelo clínico' : tutorial ? 'Treinamento guiado' : 'História';

  return <div className="cbt-scr cbt-arena">
    <div className="topbar bt-top">
      <button className="icon-btn" onClick={() => setFolha('sair')} aria-label="Sair da batalha"><ChevronLeft /></button>
      <h1><small>{rotulo} · turno {s.turn}</small>Batalha diagnóstica</h1>
      <SeloGravacao estado={sync} onReenviar={() => gravar().catch(() => {})} />
      {!web && <button className="chip mint clue-btn" onClick={() => setFolha('pistas')} aria-label={`${pistasVisiveis.length} pistas`}><Search /><span key={novaPista} className="mono">{pistasVisiveis.length}</span></button>}
    </div>
    <div className="bt-body" ref={corpoRef}>
      <div className="bt-main">
        <div className={`arena ${fx === 'shake' ? 'shake' : ''}`}>
          <div className="ar-floor" />
          <div className="plate foe-plate">
            <div className="pl-row"><b>{s.revealed ? d.nome : '???'}</b><span className="ty" style={{ '--tc': s.revealed ? AGENTE[d.agente].cor : '#8d9bb3' }}>{s.revealed ? AGENTE[d.agente].nome : 'DESCONHECIDO'}</span></div>
            <div className="hp"><span className="lbl">CARGA</span><span className={`hpbar ${cor(s.hp)}`}><span style={{ width: `${s.hp}%` }} /></span></div>
            <AnimatePresence>{s.buff && <motion.span key="bf" className="buff" initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: .6 }}><Shield size={12} />{d.buff.nome}</motion.span>}</AnimatePresence>
            {s.neutral && <span className="buff off"><Check size={12} />{d.buff.nome} {d.buff.neutra}</span>}
          </div>
          <div className="bt-foe"><span className="pad foe-pad" /><div className={`fx ${foeFx}`}><div className="idle">{s.revealed ? <Species id={d.id} evolved={s.evolved} /> : <Blob />}</div></div></div>
          <div className="bt-me">
            <span className="pad me-pad" />
            <div className={`fx doc ${meFx}`}><Doctor /></div>
            <div className={`petsp ${petFx}`}><div className="idle"><PetArt id={pet.id} /></div>{s.petReady && !s.petUsed && <span className="pet-alert">!</span>}</div>
          </div>
          <div className={`plate me-plate ${meFx === 'hurt' ? 'hurt' : ''}`}>
            <div className="pl-row"><b>{d.paciente}</b><span className="ty" style={{ '--tc': 'var(--mint)' }}>PACIENTE</span></div>
            <div className="hp"><span className="lbl">ESTAB.</span><span className={`hpbar ${cor(s.stab)}`}><span style={{ width: `${s.stab}%` }} /></span></div>
            <span className="hpnum mono">{s.stab}/100</span>
          </div>
          {proj && <span key={proj.k} className={`proj p-${proj.c} ${proj.erro ? 'miss' : ''}`}><i /><i /><i /><i /></span>}
          {fx === 'flash' && <span className="ar-flash" />}
          {fx === 'scan' && <span className="ar-scan" />}
        </div>
        <div className="bt-bottom">
          <button className="msgbox" onClick={() => pular.current?.()} aria-live="polite"><Digitando key={msg.k} t={msg.t} />{!menu && <span className="nxt" aria-hidden="true">▼</span>}</button>
          {erroFinal && <div className="card" role="alert" style={{ display: 'grid', gap: 8 }}><p>{erroFinal}</p><p className="muted" style={{ fontSize: 12 }}>O XP só é confirmado pelo servidor. Reenviar não duplica a recompensa.</p><button className="primary" onClick={confirmarFim}>Reenviar resultado</button></div>}
          {menu && <motion.div key={menu} className={`bmenu m-${menu}`} initial={SEM_ANIMACAO ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .16 }}>
            {menu === 'main' && <>
              <button className="bm b-moves" disabled={!livre('m:moves')} onClick={() => { tk('m:moves'); setMenu('moves'); }}><Zap /><b>Habilidades</b><small>4 · recarga por turno</small></button>
              <button className="bm b-exams" onClick={() => { tk('m:exams'); setMenu('exams'); }} disabled={estado.exams.length >= exs.length || !livre('m:exams')}><FlaskConical /><b>Exames</b><small>{exs.length - estado.exams.length} disponíveis</small></button>
              <button className={`bm b-pet ${estado.petReady && !estado.petUsed ? 'ready' : ''}`} style={{ '--pc': pet.cor }} disabled={!estado.petReady || estado.petUsed || !livre('pet')} onClick={() => { tk('pet'); jogar({ t: 'pet' }); }}><PawPrint /><b>{pet.nome}</b><small>{estado.petUsed ? 'já ajudou' : estado.petReady ? pet.hab : 'momento crítico'}</small></button>
              <button className="bm b-dx" disabled={estado.revealed || !livre('m:dx')} onClick={() => { tk('m:dx'); setMenu('dx'); }}><Stethoscope /><b>Diagnosticar</b><small>{estado.revealed ? 'confirmado' : `${hips.length - estado.elim.length} hipóteses`}</small></button>
            </>}
            {menu === 'moves' && <>
              {MOVES.map(m => {
                const cd = estado.cd[m.id], semBuff = m.id === 'critica' && !estado.buff;
                return <button key={m.id} data-k={`mv:${m.id}`} className="mv" style={{ '--mc': m.cor }} disabled={cd > 0 || semBuff || !livre(`mv:${m.id}`)} onClick={() => { tk(`mv:${m.id}`); jogar({ t: 'golpe', id: m.id }); }}>
                  <b>{m.nome}</b><small>{m.id === 'critica' && estado.buff ? d.buff.resposta : `${m.cat} · ${m.desc}`}</small>
                  <span className="cdtag mono">{cd > 0 ? `RECARGA ${cd}` : semBuff ? 'SEM BUFF' : 'PRONTA'}</span>
                </button>;
              })}
              <button className="bback" disabled={Boolean(passo)} onClick={() => setMenu('main')}>Voltar</button>
            </>}
            {menu === 'exams' && <>
              {exs.map(e => <button key={e.id} data-k={`ex:${e.id}`} className="ex" disabled={estado.exams.includes(e.id) || !livre(`ex:${e.id}`)} onClick={() => { tk(`ex:${e.id}`); jogar({ t: 'exame', id: e.id }); }}><b>{e.nome}</b><small>{estado.exams.includes(e.id) ? 'resultado no prontuário' : e.desc}</small></button>)}
              <button className="bback" disabled={Boolean(passo)} onClick={() => setMenu('main')}>Voltar</button>
            </>}
            {menu === 'dx' && <>
              {hips.map(h => <button key={h.id} data-k={`dx:${h.id}`} className="hx" disabled={estado.elim.includes(h.id) || !livre(`dx:${h.id}`)} onClick={() => { tk(`dx:${h.id}`); jogar({ t: 'hipotese', id: h.id }); }}><b>{h.nome}</b></button>)}
              <button className="bback" disabled={Boolean(passo)} onClick={() => setMenu('main')}>Voltar</button>
            </>}
          </motion.div>}
        </div>
      </div>
      {web && <aside className="bt-side">
        <div className="bs-h"><span>PRONTUÁRIO DE PISTAS</span><b className="mono">{pistasVisiveis.length}</b></div>
        {pistas}
        <div className="bs-h"><span>HIPÓTESES</span></div>
        {hipoteses}
        <div className="bs-pet" style={{ '--pc': pet.cor }}><span className="bs-pet-art"><PetArt id={pet.id} /></span><span><b>{pet.nome} · {pet.esp}</b><small>{estado.petUsed ? `${pet.hab} usada.` : estado.petReady ? `${pet.hab} pronta.` : PET_QUANDO}</small></span></div>
        <span className="kbd-hint"><kbd>1</kbd>–<kbd>4</kbd> escolher · <kbd>Esc</kbd> voltar · <kbd>Enter</kbd> avançar</span>
      </aside>}
    </div>
    {passo && menu && furo && <div className="tut" aria-live="polite">
      <span className="tut-hole" style={{ left: furo.x - 6, top: furo.y - 6, width: furo.w + 12, height: furo.h + 12 }} />
      {passo.k !== 'tap' && <span className="tut-hand" style={{ left: furo.x + furo.w / 2, top: furo.y + furo.h - 6 }}><Pointer size={26} /></span>}
      {(() => {
        const bw = Math.min(380, furo.W - 24), abaixo = furo.y + furo.h / 2 < furo.H * 0.45;
        const left = Math.max(12, Math.min(furo.W - bw - 12, furo.x + furo.w / 2 - bw / 2));
        return <motion.div key={ti} className="tut-bub" style={abaixo ? { top: furo.y + furo.h + 16, left, width: bw } : { bottom: furo.H - furo.y + 16, left, width: bw }}
          initial={SEM_ANIMACAO ? false : { opacity: 0, y: abaixo ? -8 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
          <span className="tut-av"><Retrato /></span>
          <div><b>Dra. Íris <small className="mono">· {ti + 1}/{TUT.length}</small></b><p>{passo.t}</p>
            <div className="tut-row">{passo.k === 'tap' && <button className="tut-ok" onClick={() => setTi(i => i + 1)}>{ti === TUT.length - 1 ? 'Assumir o plantão' : 'Entendi'}</button>}<button className="tut-skip" onClick={() => setTi(TUT.length)}>Pular orientações</button></div></div>
        </motion.div>;
      })()}
    </div>}
    <AnimatePresence>
      {folha && <>
        <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFolha(null)} />
        <motion.div key="sh" className="sheet" role="dialog" aria-modal="true" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
          {folha === 'pistas' ? <>
            <h3>Prontuário de pistas</h3>
            {pistas}
            <h3 style={{ fontSize: 14 }}>Hipóteses</h3>
            {hipoteses}
            <button className="ghost" onClick={() => setFolha(null)}>Voltar à arena</button>
          </> : <>
            <h3>Sair da batalha?</h3>
            <p>{sync === 'ok' || sync === 'idle' ? 'Os turnos já jogados ficam salvos para retomar depois.' : 'O último turno ainda não foi salvo. Ao sair, ele pode se perder.'}{entrada.modo === 'x1' ? ' O ticket do duelo já foi usado.' : ''}</p>
            <button className="primary violet" onClick={() => onSair(false)}>Sair e retomar depois</button>
            <button className="ghost" onClick={() => onSair(true)}>Abandonar esta batalha (sem XP)</button>
            <button className="ghost" onClick={() => setFolha(null)}>Continuar lutando</button>
          </>}
        </motion.div>
      </>}
    </AnimatePresence>
  </div>;
}
