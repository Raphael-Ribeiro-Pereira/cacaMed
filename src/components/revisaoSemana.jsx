import { useEffect, useRef, useState } from 'react';
import { animate, motion, useAnimate, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight, Clock, X } from 'lucide-react';
import { MODOS_REVISAO, tituloCarta, minutos, espera, seg, useMedidas, INCLINA, suave, posDeck, posLeque, espiral, VAGAS, angVaga, geometriaAnel, noAnel, girar, alvo } from '../utils/revisaoCartas';
import { analisarCarta, medidasDaCarta, textoDoItem } from '../utils/revisaoAnalise';

// Revisão semanal: as peças visuais do protótipo aprovado em 19/10/2026 (docs/prototipos/revisao-hub.html), no visual
// do app. O leque abre em "furacão", o relatório geral é um anel de cartas em pé e o fim é o monstro do cérebro.

// ---------- Carta ----------
export function CartaRevisao({ carta, titulo, frente = true, quadros, transicao, ativa = false, aoTocar, classe = '', z = 1, vista = false, apagada = false }) {
  const modo = MODOS_REVISAO[carta.modo] || MODOS_REVISAO.quiz;
  const Icone = modo.icone;
  const un = carta.erros === 1 ? modo.un[0] : modo.un[1];
  const linha = carta.feita ? <><Check size={12} strokeWidth={3} /> {carta.acertos}/{carta.total} certas</>
    : carta.pausada ? `Item ${carta.pausada.atual} de ${carta.pausada.total}` : `${carta.erros} ${un} · ~${minutos(carta.segundos)} min`;
  const rotulo = `${titulo}: ${carta.feita ? `feita, ${carta.acertos} de ${carta.total} certas` : carta.pausada ? 'em andamento' : `${carta.erros} ${un}, cerca de ${minutos(carta.segundos)} minutos`}`;
  return <motion.button type="button" className={`rv-carta ${ativa ? 'ativa' : ''} ${carta.feita ? 'feita' : ''} ${carta.pausada ? 'pausada' : ''} ${vista ? 'vista' : ''} ${apagada ? 'apagada' : ''} ${classe}`}
    style={{ '--c': modo.cor, '--r': `${quadros?.rotate?.at?.(-1) ?? quadros?.rotate ?? 0}deg`, zIndex: z }} initial={false} animate={quadros} transition={transicao}
    onClick={ativa ? aoTocar : undefined} tabIndex={ativa ? 0 : -1} aria-label={rotulo}>
    <span className="rv-corpo"><motion.span className="rv-flip" initial={false} animate={{ rotateY: frente ? 0 : 180 }} transition={{ duration: .5, ease: [.3, .7, .3, 1] }}>
      <span className="rv-face rv-frente">
        {carta.feita && !vista && <span className="rv-feito"><Check strokeWidth={3} /></span>}
        {carta.pausada && <span className="rv-pausa">Em andamento</span>}
        <span className="rv-canto"><b>{carta.erros}</b><Icone /></span>
        <span className="rv-miolo"><span className="rv-medalha"><Icone /></span><strong>{titulo}</strong><small>{linha}</small>{carta.temas?.length > 0 && <em>{carta.temas.join(' · ')}</em>}</span>
        <span className="rv-canto inv"><b>{carta.erros}</b><Icone /></span>
        {vista && <span className="rv-check-centro"><svg viewBox="0 0 100 100"><motion.circle cx="50" cy="50" r="38" initial={{ scale: .4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .3 }} />
          <motion.path d="M31 52l13 13 26-28" initial={{ strokeDashoffset: 62 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: .65, delay: .2 }} /></svg></span>}
      </span>
      <span className="rv-face rv-verso"><span className="rv-emblema"><span>caco<b>Med</b></span></span></span>
    </motion.span></span>
  </motion.button>;
}

// Baralho fechado na mesa do hub.
export function Baralho({ cartas, aoTocar }) {
  const ref = useRef(null);
  return <div className="rv-mesa" ref={ref}>
    {cartas.map((c, i) => <CartaRevisao key={c.id} carta={c} titulo={tituloCarta(c, cartas)} frente={false} quadros={alvo(posDeck(i, cartas.length))}
      ativa={i === cartas.length - 1} aoTocar={aoTocar} z={i + 1} />)}
    <span className="rv-mesa-rotulo">{cartas.length} {cartas.length === 1 ? 'carta' : 'cartas'} na mesa</span>
  </div>;
}

// ---------- Modo foco: o leque ----------
// `abrir`: o baralho chega girando em espiral e abre em leque, virando cada carta. `aoEscolher` recebe a carta depois
// do brilho e do bloco no centro. `trava`: o texto que substitui o X enquanto faltam cartas da semana.
export function Leque({ cartas, abrir, aoEscolher, trava, aoSair, dica }) {
  const ref = useRef(null);
  const m = useMedidas(ref);
  const reduzir = useReducedMotion();
  const [fase, setFase] = useState(abrir && !reduzir ? 'deck' : 'aberto');
  const [escolhida, setEscolhida] = useState(null);
  const [mostraDica, setMostraDica] = useState(true);
  // Baralho no centro, depois o furacão até o leque; cada passo agenda o seguinte.
  useEffect(() => {
    if (!m || fase === 'aberto') return undefined;
    const t = fase === 'deck' ? setTimeout(() => setFase('abrindo'), 120) : setTimeout(() => setFase('aberto'), 1500 + cartas.length * 90);
    return () => clearTimeout(t);
  }, [m, fase, cartas.length]);
  useEffect(() => { const t = setTimeout(() => setMostraDica(false), 3500); return () => clearTimeout(t); }, []);
  const n = cartas.length;
  const escolher = async c => {
    if (fase !== 'aberto' || escolhida) return;
    if (c.feita) return;
    setEscolhida(c.id);
    await espera(reduzir ? 0 : 900);
    aoEscolher(c);
  };
  const quadrosDe = (c, i) => {
    if (!m) return alvo(posDeck(i, n));
    const leque = posLeque(i, n, m);
    if (fase === 'deck') return alvo(posDeck(i, n));
    if (escolhida) return c.id === escolhida ? { x: 0, y: 0, rotate: 0, scale: 1.12 } : (() => { const q = espiral(i, n, leque, { x: 0, y: 8, r: INCLINA[i % 6], s: .9 }, m, { voltas: .8, raio: .18 }); delete q.times; return q; })();
    if (fase === 'abrindo') { const q = espiral(i, n, posDeck(i, n), leque, m); return q; }
    return alvo(leque);
  };
  const transicaoDe = (c, i) => {
    if (escolhida) return c.id === escolhida ? { duration: .5, ease: [.16, 1, .3, 1] } : { duration: .8, ease: 'linear' };
    if (fase === 'abrindo') return { duration: 1.5, delay: i * .09, ease: 'linear', times: espiral(i, n, posDeck(i, n), posLeque(i, n, m), m).times };
    return { duration: .45, ease: [.16, 1, .3, 1] };
  };
  return <div className="rv-foco rv-leque" ref={ref}>
    <motion.div className="rv-foco-fundo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .42 }} />
    {fase === 'abrindo' && !reduzir && <motion.div className="rv-vortex" initial={{ opacity: 0, rotate: 0, scale: .35 }} animate={{ opacity: [0, .95, 0], rotate: 600, scale: 1.35 }} transition={{ duration: 1.5, times: [0, .35, 1] }} />}
    {m && cartas.map((c, i) => <CartaRevisao key={c.id} carta={c} titulo={tituloCarta(c, cartas)} frente={fase !== 'deck'} quadros={quadrosDe(c, i)} transicao={transicaoDe(c, i)}
      ativa={fase === 'aberto' && !escolhida && !c.feita} aoTocar={() => escolher(c)} classe={escolhida === c.id ? 'brilho' : ''} z={escolhida === c.id ? 50 : i + 1} />)}
    {trava ? <div className="rv-trava" role="status"><Clock />{trava}</div>
      : aoSair && <button type="button" className="rv-sair" onClick={aoSair} aria-label="Sair das cartas"><X size={18} /></button>}
    {mostraDica && fase === 'aberto' && dica && <motion.div className="rv-dica" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{dica}</motion.div>}
  </div>;
}

// ---------- Relatório de uma carta ----------
function Alternativas({ item }) {
  const marca = (certa, errada) => <span className="rv-pr-marca">{certa ? <Check size={12} strokeWidth={3} /> : errada ? <X size={12} strokeWidth={3} /> : null}</span>;
  if (item.modo === 'erroMedico') return <ul className="rv-pr-alts">{(item.etapas || []).map(e => <li key={e.id} className={e.acertou ? 'certa' : 'errada'}>
    {marca(e.acertou, !e.acertou)}<span><b>{e.titulo}</b> {e.escolha}{!e.acertou && <> · Correto: {e.correta}</>}</span></li>)}</ul>;
  const opcoes = item.modo === 'verdadeMentira' ? [{ id: true, texto: 'Verdadeira' }, { id: false, texto: 'Falsa' }] : item.opcoes || [];
  return <ul className="rv-pr-alts">{opcoes.map(o => {
    const certa = o.id === item.correta, sua = o.id === item.escolha;
    return <li key={String(o.id)} className={certa ? 'certa' : sua ? 'errada' : ''}>{marca(certa, sua && !certa)}<span>{o.texto}{sua && <em>sua resposta</em>}</span></li>;
  })}</ul>;
}
export function RelatorioCarta({ carta, titulo, explicacao }) {
  const modo = MODOS_REVISAO[carta.modo];
  const Icone = modo.icone;
  const med = medidasDaCarta(carta.itens);
  const max = Math.max(1, ...carta.itens.map(i => i.tempoMs || 0));
  return <>
    <div className="rv-pr-topo"><span className="rv-pr-ic"><Icone /></span><div><p className="kicker" style={{ color: modo.cor }}>Relatório · {modo.rotulo}</p><h2>{titulo}</h2></div></div>
    <div className="rv-pr-numeros">
      <div><b>{med.acertos}/{med.total}</b><span>certas</span></div>
      <div><b>{med.medidos ? `${seg(med.tempoMedioMs)} s` : '—'}</b><span>tempo médio por item</span></div>
      <div><b>{(carta.ritmo || 0).toFixed(2).replace('.', ',')} s</b><span>por palavra: seu ritmo de leitura e raciocínio</span></div>
      <div><b>{med.medidos ? `${seg(med.indecisaoMs)} s` : '—'}</b><span>de indecisão{med.medidos ? ` (${med.indecisaoPct}% do tempo)` : ''}</span></div>
    </div>
    {med.medidos > 0 && <section><h3>Seu ritmo, item a item</h3>
      <div className="rv-pr-barras">{carta.itens.map((it, i) => <div key={`${it.itemId}-${i}`} className={`rv-pr-barra ${it.acertou ? 'ok' : 'no'}`} title={it.tempoMs ? `${seg(it.tempoMs)} s · esperado ${seg(it.esperadoMs)} s` : 'sem tempo medido'}>
        {it.tempoMs > 0 && <><i className="duvida" style={{ height: `${(it.indecisaoMs || 0) / max * 100}%` }} /><i style={{ height: `${Math.max(6, (it.tempoMs - (it.indecisaoMs || 0)) / max * 100)}%` }} /></>}<small>{i + 1}</small></div>)}</div>
      <p className="rv-pr-nota">Barra cheia: tempo para ler e pensar (verde acertou, vermelho errou). Listrado em âmbar: indecisão, o tempo além do seu ritmo.</p></section>}
    <section><h3>O que pode estar influenciando seus erros</h3><ul className="rv-pr-analise">{analisarCarta(carta.itens).map((l, i) => <li key={i}>{l}</li>)}</ul>
      <p className="rv-pr-nota">Análise a partir do tempo e das escolhas desta carta.</p></section>
    <section><h3>Cada item, explicado</h3>{carta.itens.map((it, i) => <article key={`${it.itemId}-${i}`} className="rv-pr-item">
      <p className="tema">Item {i + 1} · {String(it.tema || '').replace(`${modo.rotulo} · `, '')}{it.parecida ? ' · parecida' : ''}</p>
      <b>{it.modo === 'verdadeMentira' ? `“${textoDoItem(it)}”` : textoDoItem(it)}</b>
      <Alternativas item={it} />
      {it.acertou ? <p className="rv-pr-nota" style={{ margin: 0 }}>{it.explicacao}</p> : explicacao(it, carta)}
    </article>)}</section>
  </>;
}

// ---------- Relatório geral: o anel ----------
// `vistas`: cartas já vistas (verdes e apagadas). `aoVer` marca a carta ao tocar em "Entendi"; `aoTerminar` roda
// quando todas foram vistas (o monstro). `aoSair` só existe quando a revisão já acabou.
export function Anel({ relatorio, vistas, aoVer, aoTerminar, aoSair, explicacao }) {
  const ref = useRef(null);
  const m = useMedidas(ref);
  const reduzir = useReducedMotion();
  const cartas = relatorio.cartas.map(c => ({ ...c, erros: c.total, feita: true, segundos: 0, ritmo: relatorio.ritmo }));
  const n = cartas.length;
  const vagas = cartas.map((_, i) => Math.round(i * VAGAS / Math.max(n, 1)) % VAGAS);
  const [aberta, setAberta] = useState(null);
  const [giro, setGiro] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const largo = m && m.w >= 860;
  const painel = m && (largo ? (() => { const width = Math.min(560, m.w * .46), height = Math.min(m.h - 48, 760); return { left: m.w - 24 - width, top: (m.h - height) / 2, width, height }; })()
    : { left: 10, top: 10, width: m.w - 20, height: m.h - 20 });
  const abrirCarta = async c => {
    if (ocupado || !m) return;
    setOcupado(true);
    const g = geometriaAnel(m);
    const ang = angVaga(vagas[cartas.indexOf(c)]);
    const delta = ((0 - ang) % 360 + 540) % 360 - 180;
    const xAlvo = largo ? painel.left + painel.width / 2 - m.w / 2 : 0;
    setGiro({ id: c.id, delta, centro: { x: xAlvo - g.R, y: 0 }, modo: 'abrir' });
    await espera(reduzir ? 0 : 950);
    setAberta(c.id);
    setOcupado(false);
  };
  const entendi = async () => {
    if (ocupado || !aberta) return;
    setOcupado(true);
    const id = aberta;
    setAberta(null);
    await espera(reduzir ? 0 : 300);
    setGiro(atual => ({ ...atual, modo: 'fechar' }));
    await espera(reduzir ? 0 : 1150);
    setGiro(null);
    const todas = cartas.every(c => c.id === id || vistas.has(c.id));
    aoVer(id);
    setOcupado(false);
    if (todas && aoTerminar) { await espera(reduzir ? 0 : 1300); aoTerminar(); }
  };
  const quadrosDe = (c, i) => {
    const g = geometriaAnel(m);
    const ang = angVaga(vagas[i]);
    if (!giro) return alvo(noAnel(ang, g));
    if (giro.modo === 'abrir') return girar(ang, ang + giro.delta, { x: 0, y: 0 }, giro.centro, g, c.id === giro.id ? 'abrir' : null);
    return girar(ang + giro.delta, ang + 360, giro.centro, { x: 0, y: 0 }, g, c.id === giro.id ? 'fechar' : null);
  };
  const cartaAberta = cartas.find(c => c.id === aberta);
  const vistasN = cartas.filter(c => vistas.has(c.id)).length;
  return <div className="rv-foco rv-anel" ref={ref}>
    <motion.div className="rv-foco-fundo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .42 }} />
    {m && !giro && Array.from({ length: VAGAS }, (_, v) => v).filter(v => !vagas.includes(v)).map(v => {
      const p = noAnel(angVaga(v), geometriaAnel(m));
      return <motion.span key={v} className="rv-vaga" initial={{ opacity: 0 }} animate={{ opacity: 1, x: p.x, y: p.y, scale: p.s }} transition={{ duration: .4 }} />;
    })}
    {!giro && <motion.div className="rv-anel-titulo" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><p className="kicker">Revisão da semana</p><h2>Seu relatório</h2>
      <p>{vistasN === n ? 'Tudo visto' : vistasN ? `${vistasN} de ${n} vistos · toque numa carta` : 'Toque numa carta para ver o relatório completo'}</p></motion.div>}
    {m && cartas.map((c, i) => <CartaRevisao key={c.id} carta={c} titulo={tituloCarta(c, cartas)} quadros={quadrosDe(c, i)}
      transicao={giro ? { duration: giro.modo === 'abrir' ? .95 : 1.15, ease: 'linear', times: quadrosDe(c, i).times } : { duration: reduzir ? 0 : .9, delay: reduzir ? 0 : i * .07, ease: [.16, 1, .3, 1] }}
      ativa={!giro && !ocupado} aoTocar={() => abrirCarta(c)} vista={vistas.has(c.id)} apagada={vistas.has(c.id)} z={giro?.id === c.id ? 70 : 10 + i}
      classe={giro && giro.id !== c.id && giro.modo === 'abrir' ? 'rv-esmaecida' : ''} />)}
    {cartaAberta && largo && <motion.div className="rv-lado" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}>
      <p className="kicker">Relatório</p><h2>{tituloCarta(cartaAberta, cartas)}</h2><p>{cartaAberta.acertos}/{cartaAberta.total} certas</p></motion.div>}
    {cartaAberta && <motion.div className="rv-painel" role="region" aria-label="Relatório da carta" style={{ '--c': MODOS_REVISAO[cartaAberta.modo].cor }}
      initial={reduzir ? false : { left: m.w / 2 + (largo ? painel.left + painel.width / 2 - m.w / 2 : 0) - m.cw * .5, top: m.h / 2 - m.ch * .5, width: m.cw, height: m.ch, opacity: .6 }}
      animate={{ ...painel, opacity: 1 }} transition={{ duration: .56, ease: [.7, 0, .2, 1] }}>
      <motion.div className="rv-painel-scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduzir ? 0 : .45 }}>
        <RelatorioCarta carta={cartaAberta} titulo={tituloCarta(cartaAberta, cartas)} explicacao={explicacao} /></motion.div>
      <div className="rv-painel-acoes"><button className="primary" onClick={entendi} autoFocus>Entendi <Check size={17} /></button></div>
    </motion.div>}
    {aoSair && !cartaAberta && !giro && <button type="button" className="rv-sair" onClick={aoSair} aria-label="Fechar o relatório"><X size={18} /></button>}
  </div>;
}

// ---------- Fim: o monstro do cérebro ----------
// Tentáculos: [ponto de apoio, forma normal, forma de coração (só os dois de fora)].
const TENTACULOS = [
  ['78 180', 'M78 180C60 196 40 200 34 218C30 230 44 236 50 226', 'M78 180C40 152 22 84 60 52C84 34 112 42 120 60'],
  ['94 186', 'M94 186C84 208 72 222 76 238C78 248 90 246 88 236'],
  ['110 190', 'M110 190C106 212 102 230 110 246C114 254 124 250 118 240'],
  ['130 190', 'M130 190C134 212 138 230 130 246C126 254 116 250 122 240'],
  ['146 186', 'M146 186C156 208 168 222 164 238C162 248 150 246 152 236'],
  ['162 180', 'M162 180C180 196 200 200 206 218C210 230 196 236 190 226', 'M162 180C200 152 218 84 180 52C156 34 128 42 120 60'],
];
const VERDE = '#25cf93', ROXO = '#7c4fe0';
// O verde sobe de baixo para cima no corpo e nos tentáculos (0 = todo roxo, 1 = todo verde).
const paradasVerdor = v => {
  const cheio = v >= .999, vazio = v <= .001;
  const a = Math.max(0, Math.min(1, v - .07)), b = Math.max(0, Math.min(1, v + .07));
  return [[0, vazio ? ROXO : VERDE], [cheio ? 1 : a, vazio ? ROXO : VERDE], [cheio ? 1 : b, cheio ? VERDE : ROXO], [1, cheio ? VERDE : ROXO]];
};
function MonstroSvg({ verdor, feliz }) {
  const corpo = 'M60 116C56 152 68 180 88 190C104 197 136 197 152 190C172 180 184 152 180 116Z';
  return <svg viewBox="0 0 240 260" aria-hidden="true" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
    <defs>
      <linearGradient id="rv-g-corpo" gradientUnits="userSpaceOnUse" x1="0" y1="256" x2="0" y2="105">{paradasVerdor(verdor).map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient>
      <linearGradient id="rv-g-luz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="rgba(255,255,255,.16)" /><stop offset=".45" stopColor="rgba(255,255,255,0)" /><stop offset="1" stopColor="rgba(0,0,0,.2)" /></linearGradient>
    </defs>
    <g className="bob">
      <motion.path initial={false} animate={{ opacity: feliz ? 1 : 0, scale: feliz ? [1, 1.06, 1] : 1 }} transition={{ duration: .9, delay: feliz ? .5 : 0, scale: { repeat: 2, duration: .9 } }}
        style={{ transformOrigin: '120px 120px' }} fill="rgba(255,110,160,.18)" d="M120 60C112 42 84 32 60 52C22 84 40 152 78 180L120 200L162 180C200 152 218 84 180 52C156 32 128 42 120 60Z" />
      <g fill="none" strokeLinecap="round">{TENTACULOS.map(([apoio, d, coracao]) => {
        const [x, y] = apoio.split(' ');
        const forma = feliz && coracao ? coracao : d;
        return <g key={apoio} className={`onda${feliz && coracao ? ' parada' : ''}`} style={{ transformOrigin: `${x}px ${y}px` }}>
          <motion.path initial={false} animate={{ d: forma }} transition={{ duration: .9, ease: [.3, 0, .2, 1] }} stroke="rgba(30,8,60,.5)" strokeWidth="19" />
          <motion.path initial={false} animate={{ d: forma }} transition={{ duration: .9, ease: [.3, 0, .2, 1] }} stroke="url(#rv-g-corpo)" strokeWidth="14" />
        </g>;
      })}</g>
      <path fill="url(#rv-g-corpo)" stroke="rgba(30,8,60,.5)" strokeWidth="3" d={corpo} />
      <path fill="url(#rv-g-luz)" d={corpo} />
      <ellipse cx="78" cy="136" rx="9" ry="5" fill="rgba(255,255,255,.3)" transform="rotate(-30 78 136)" />
      <g fill="rgba(0,0,0,.14)"><circle cx="76" cy="150" r="4" /><circle cx="166" cy="142" r="3" /><circle cx="152" cy="176" r="5" /><circle cx="92" cy="182" r="3" /></g>
      <g fill="#f7b7c8" stroke="#dc8aa3" strokeWidth="2">
        <circle cx="120" cy="80" r="11" /><circle cx="92" cy="100" r="15" /><circle cx="148" cy="100" r="15" /><circle cx="110" cy="87" r="15" /><circle cx="130" cy="87" r="15" /><circle cx="102" cy="106" r="12" /><circle cx="138" cy="106" r="12" /><circle cx="120" cy="99" r="15" />
      </g>
      <g fill="none" stroke="#dc8aa3" strokeWidth="2" strokeLinecap="round"><path d="M98 92q6-6 12 0" /><path d="M120 90q6 6 12 0" /><path d="M108 104q8 6 16 0" /><path d="M138 97q5-6 10-2" /><path d="M84 102q5 4 10 2" /></g>
      <path fill="rgba(170,220,255,.22)" stroke="rgba(215,240,255,.9)" strokeWidth="3" d="M64 114C64 52 176 52 176 114Z" />
      <path fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="4" strokeLinecap="round" d="M80 96C82 80 94 70 108 66" />
      <path fill="url(#rv-g-corpo)" d="M54 117C54 107 186 107 186 117C186 128 54 128 54 117Z" />
      <path fill="rgba(0,0,0,.16)" d="M54 117C54 107 186 107 186 117C186 128 54 128 54 117Z" />
      <motion.g initial={false} animate={{ opacity: feliz ? 0 : 1 }} transition={{ duration: .3 }}>
        <ellipse cx="100" cy="146" rx="10" ry="11" fill="#fff" /><ellipse cx="140" cy="146" rx="10" ry="11" fill="#fff" />
        <circle cx="101" cy="148" r="5" fill="#1a0f2e" /><circle cx="139" cy="148" r="5" fill="#1a0f2e" />
        <circle cx="103" cy="145" r="1.8" fill="#fff" /><circle cx="141" cy="145" r="1.8" fill="#fff" />
        <path d="M86 131L110 138M154 131L130 138" stroke="#24123f" strokeWidth="5" strokeLinecap="round" />
        <g className="rv-boca" style={{ transformOrigin: '120px 166px' }}><path d="M106 162Q120 182 134 162Z" fill="#2a0f3a" /><path d="M112 170Q120 178 128 170Q120 172 112 170Z" fill="#ff7aa8" /><path d="M109 162L113 170L117 162ZM123 162L127 170L131 162Z" fill="#fff" /></g>
      </motion.g>
      <motion.g initial={false} animate={{ opacity: feliz ? 1 : 0 }} transition={{ duration: .4, delay: feliz ? .2 : 0 }}>
        <path d="M90 148Q100 136 110 148M130 148Q140 136 150 148" fill="none" stroke="#1a0f2e" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="86" cy="160" rx="7" ry="4" fill="#ff8fb1" opacity=".75" /><ellipse cx="154" cy="160" rx="7" ry="4" fill="#ff8fb1" opacity=".75" />
        <path d="M102 160Q120 184 138 160Q120 170 102 160Z" fill="#2a0f3a" /><path d="M112 168Q120 176 128 168Q120 171 112 168Z" fill="#ff7aa8" />
      </motion.g>
    </g>
  </svg>;
}

// O monstro aparece com fome, devora as cartas do anel uma a uma e fica verde de baixo para cima; satisfeito, faz um
// coração com os tentáculos e sorri. Depois, os parabéns com o prêmio da semana.
export function Monstro({ relatorio, aoVoltar }) {
  const reduzir = useReducedMotion();
  const [escopo, animar] = useAnimate();
  const m = useMedidas(escopo);
  const [verdor, setVerdor] = useState(0);
  const [feliz, setFeliz] = useState(false);
  const [fim, setFim] = useState(false);
  const [xp, setXp] = useState(0);
  const cartas = relatorio.cartas.map(c => ({ ...c, erros: c.total, feita: true }));
  const n = cartas.length;
  const vagas = cartas.map((_, i) => Math.round(i * VAGAS / Math.max(n, 1)) % VAGAS);
  const iniciou = useRef(false);
  useEffect(() => {
    if (!m || iniciou.current) return;
    iniciou.current = true;
    const tingir = (de, ate, duracao) => new Promise(r => { if (reduzir) { setVerdor(ate); r(); return; } animate(de, ate, { duration: duracao, ease: suave, onUpdate: setVerdor, onComplete: r }); });
    (async () => {
      const g = geometriaAnel(m);
      const largura = Math.min(m.w * .7, 330), altura = largura * 260 / 240;
      const boca = { x: 0, y: m.h * .42 - altura / 2 + altura * 170 / 260 - m.h / 2 };
      if (!reduzir) await animar('.rv-monstro', { opacity: [0, 1, 1], scale: [.3, 1.06, 1], y: [60, -8, 0] }, { duration: .75, ease: [.2, 1, .3, 1] });
      else await animar('.rv-monstro', { opacity: 1 }, { duration: 0 });
      for (const [i, c] of cartas.entries()) {
        const de = noAnel(angVaga(vagas[i]), g);
        if (!reduzir) animar('.rv-boca', { scaleX: 1.15, scaleY: 1.7 }, { duration: .26 });
        await animar(`[data-comida="${c.id}"]`, { x: [de.x, (de.x + boca.x) / 2, boca.x], y: [de.y, (de.y + boca.y) / 2 - 40, boca.y], rotate: [0, 270, 540], scale: [de.s, de.s * .5, de.s * .08], opacity: [1, 1, 0] },
          { duration: reduzir ? 0 : .72, ease: [.45, 0, .7, 1] });
        if (!reduzir) {
          animar('.rv-boca', { scaleX: [1.15, 1.1, 1, 1], scaleY: [1.7, .1, 1.2, 1] }, { duration: .4 });
          animar('.rv-monstro-corpo', { scaleX: [1, 1.08, .97, 1], scaleY: [1, .93, 1.04, 1] }, { duration: .44 });
        }
        await tingir(i / n, (i + 1) / n, .56);
        await espera(reduzir ? 0 : 160);
      }
      await espera(reduzir ? 0 : 300);
      setFeliz(true);
      await espera(reduzir ? 0 : 1700);
      setFim(true);
      const premio = relatorio.premio?.xp || 0;
      if (reduzir) setXp(premio); else animate(0, premio, { duration: 1, ease: suave, onUpdate: v => setXp(Math.round(v)) });
    })();
  }, [m, reduzir, animar, cartas, vagas, n, relatorio.premio]);
  const certas = cartas.reduce((s, c) => s + c.acertos, 0), total = cartas.reduce((s, c) => s + c.total, 0);
  const tickets = relatorio.premio?.tickets || 0;
  return <div className="rv-foco" ref={escopo}>
    <div className="rv-foco-fundo" />
    {m && cartas.map((c, i) => { const p = noAnel(angVaga(vagas[i]), geometriaAnel(m)); return <motion.div key={c.id} data-comida={c.id} className="rv-carta" style={{ x: p.x, y: p.y, scale: p.s, zIndex: 10 + i, pointerEvents: 'none' }}>
      <span className="rv-corpo"><span className="rv-flip"><span className="rv-face rv-frente" style={{ '--c': MODOS_REVISAO[c.modo].cor, background: 'linear-gradient(165deg, #13c193, #0b5a45 72%)', filter: 'brightness(.4) saturate(.7)' }} /></span></span>
    </motion.div>; })}
    <motion.div className="rv-monstro" style={{ opacity: 0 }}>
      <motion.div className="rv-monstro-corpo"><MonstroSvg verdor={verdor} feliz={feliz} /></motion.div>
    </motion.div>
    {fim && <motion.div className="rv-fim" initial={reduzir ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .48, ease: [.16, 1, .3, 1] }}>
      <p className="kicker">Revisão concluída</p><h2>Parabéns! Você concluiu sua revisão da semana</h2>
      <p>{n} {n === 1 ? 'carta' : 'cartas'} · {relatorio.itens} itens · {certas}/{total} certas</p>
      <div className="rv-premios"><span>+{xp} XP</span>{tickets > 0 && <span className="ticket">+{tickets} {tickets === 1 ? 'ticket' : 'tickets'}</span>}</div>
      {relatorio.missao && <p><Check size={14} style={{ display: 'inline', verticalAlign: '-2px', color: 'var(--ok)' }} /> Missão do dia concluída: +{relatorio.missao.xp} XP e {relatorio.missao.tickets} tickets</p>}
      <button className="primary" onClick={aoVoltar} autoFocus>Voltar ao hub <ChevronRight size={17} /></button>
    </motion.div>}
  </div>;
}
