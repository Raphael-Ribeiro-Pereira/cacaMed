import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { BookOpen, Check, ChevronLeft, ChevronRight, Compass, Crosshair, House, Leaf, Library, Lock, Plus, ShieldAlert, SkipForward, Thermometer, X } from 'lucide-react';
import { AGENTE, CAPITULOS, DOENCAS, FONTES, estadoNaHistoria, vencidasNaHistoria } from '../utils/batalha';
import { CICLO_TRANSMISSAO, CURA, VIAS, montarEnfermaria, montarTransmissao, posicionarMedico } from '../utils/batalhaCenasSvg';
import { Doctor, Species } from './batalhaArte';
import '../batalhaHistoria.css';

// Batalha diagnóstica, modo história v2 (docs/modo-historia-v2.md; protótipo aprovado em 19/10/2026): mapa de ramos
// estilo conquistas, cutscene de entrada, transição em microscópio, cena de transmissão, pergaminho e enciclopédia.
const espera = ms => new Promise(r => setTimeout(r, ms));
const minusculo = t => String(t || '').charAt(0).toLowerCase() + String(t || '').slice(1);
const EMBLEMAS = { termometro: Thermometer, casa: House, folha: Leaf };
const ramoDe = id => { const cap = CAPITULOS.find(c => c.ids.includes(id)); return { cap, i: cap ? cap.ids.indexOf(id) : -1 }; };
const doenca = id => DOENCAS.find(d => d.id === id);

function Emblema({ cap }) {
  const Icone = EMBLEMAS[cap?.icone] || Plus;
  return <span className="hv-emblema" style={{ '--cor': cap?.cor || '#6f7d96' }}><Icone /></span>;
}

// Texto estilo Pokémon: letra por letra; com o texto completo, a seta pisca e espera o toque (Enter ou espaço).
// Tocar durante a digitação completa o texto. Com "reduzir movimento", o texto aparece inteiro.
function useFala() {
  const reduzir = useReducedMotion();
  const [fala, setFala] = useState(null);
  const falaRef = useRef(null);
  const resolver = useRef(null);
  useEffect(() => { falaRef.current = fala; });
  useEffect(() => {
    if (!fala || fala.n >= fala.texto.length) return undefined;
    const t = setTimeout(() => setFala(f => f && { ...f, n: f.n + 1 }), 28);
    return () => clearTimeout(t);
  }, [fala]);
  const tocar = useCallback(() => {
    const f = falaRef.current;
    if (!f) return;
    if (f.n < f.texto.length) { setFala({ ...f, n: f.texto.length }); return; }
    const r = resolver.current;
    resolver.current = null; falaRef.current = null;
    setFala(null);
    r?.();
  }, []);
  useEffect(() => {
    if (!fala) return undefined;
    const tecla = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(); } };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [fala, tocar]);
  const dizer = useCallback(texto => new Promise(resolve => { resolver.current = resolve; setFala({ texto, n: reduzir ? texto.length : 0 }); }), [reduzir]);
  const caixa = fala && <button type="button" className={`hv-caixa ${fala.n >= fala.texto.length ? 'pronta' : ''}`} onClick={tocar} aria-live="polite">
    {fala.texto.slice(0, fala.n)}<span style={{ visibility: 'hidden' }}>{fala.texto.slice(fala.n)}</span><span className="hv-seta" /></button>;
  return [caixa, dizer];
}

// Quadro 4:3 das cenas, no maior tamanho que cabe na tela (celular deitado ou computador).
function useQuadro(ref) {
  const [tam, setTam] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => { const w = Math.min(el.clientWidth, el.clientHeight * 4 / 3); setTam({ w, h: w * 3 / 4 }); };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return tam;
}

// ---------- Cutscene de entrada: a enfermaria vista de cima ----------
// O médico entra e anda até o leito, aparece um "!" e vêm duas falas. "Pular" aparece da segunda vez em diante.
// `aoTerminar` recebe o ponto do paciente na tela, onde o microscópio fecha.
export function CenaEntrada({ doenca: d, podePular, aoTerminar }) {
  const ref = useRef(null);
  const svgRef = useRef(null);
  const quadro = useQuadro(ref);
  const reduzir = useReducedMotion();
  const [caixa, dizer] = useFala();
  const vivo = useRef(true);
  // O mesmo objeto a cada renderização: no React 19, um objeto novo regrava o SVG e desfaz a animação.
  const [html] = useState(() => ({ __html: montarEnfermaria() }));
  const pontoPaciente = useCallback(() => {
    const r = svgRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width * 625 / 800, y: r.top + r.height * 310 / 600 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }, []);
  useEffect(() => {
    vivo.current = true;
    const svg = svgRef.current;
    const cena = { x: 400, y: 650, ang: 0, passo: 0 };
    posicionarMedico(svg, cena);
    const andar = (x, y, vel = 150) => new Promise(resolve => {
      const de = { x: cena.x, y: cena.y };
      const dur = reduzir ? 1 : Math.hypot(x - de.x, y - de.y) / vel * 1000;
      const t0 = performance.now();
      cena.ang = Math.round(Math.atan2(x - de.x, de.y - y) * 180 / Math.PI);
      const passo = t => {
        if (!vivo.current) return;
        const p = Math.min(1, (t - t0) / dur);
        cena.x = de.x + (x - de.x) * p; cena.y = de.y + (y - de.y) * p; cena.passo = (t - t0) / 110;
        posicionarMedico(svg, cena);
        if (p < 1) requestAnimationFrame(passo); else { cena.passo = 0; posicionarMedico(svg, cena); resolve(); }
      };
      requestAnimationFrame(passo);
    });
    (async () => {
      await andar(400, 380); if (!vivo.current) return;
      await andar(500, 380); if (!vivo.current) return;
      const balao = svg.querySelector('#cn-balao');
      balao?.setAttribute('transform', `translate(${cena.x} ${cena.y - 40})`);
      balao?.setAttribute('opacity', '1');
      await espera(reduzir ? 300 : 800); if (!vivo.current) return;
      balao?.setAttribute('opacity', '0');
      await dizer(`Leito 4. Paciente com ${minusculo(d.capitulo)}.`); if (!vivo.current) return;
      await dizer('Ninguém sabe ainda o que ele tem. Vamos investigar.'); if (!vivo.current) return;
      vivo.current = false;
      aoTerminar(pontoPaciente());
    })();
    return () => { vivo.current = false; };
    // A cena roda uma vez por paciente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pular = () => { if (!vivo.current) return; vivo.current = false; aoTerminar(pontoPaciente()); };
  return <div className="hv-cena" ref={ref}>
    <div className="hv-quadro" style={{ width: quadro.w, height: quadro.h }}>
      <svg ref={svgRef} viewBox="0 0 800 600" role="img" aria-label="Enfermaria: o médico vai até o leito do paciente" dangerouslySetInnerHTML={html} />
      {caixa}
    </div>
    {podePular && <button type="button" className="hv-pular" onClick={pular}>Pular <SkipForward size={14} /></button>}
  </div>;
}

// ---------- Transição em microscópio ----------
// A tela fecha num círculo sobre o paciente; `aoMeio` troca a cena pela batalha; a tela reabre como uma lente.
export function Microscopio({ centro, aoMeio, aoFim }) {
  const irisRef = useRef(null);
  const lenteRef = useRef(null);
  const reduzir = useReducedMotion();
  const [fase, setFase] = useState('iris');
  useEffect(() => {
    let vivo = true;
    const W = window.innerWidth, H = window.innerHeight, R = Math.hypot(W, H);
    const roda = (x, y, r) => ({ left: `${x - r}px`, top: `${y - r}px`, width: `${r * 2}px`, height: `${r * 2}px` });
    (async () => {
      if (fase === 'iris') {
        const c = centro || { x: W / 2, y: H / 2 };
        const a = irisRef.current?.animate([roda(c.x, c.y, R), { ...roda(c.x, c.y, 34), offset: .55 }, { ...roda(c.x, c.y, 34), offset: .8 }, roda(c.x, c.y, 0)],
          { duration: reduzir ? 1 : 1000, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' });
        await a?.finished.catch(() => {});
        if (!vivo) return;
        aoMeio();
        setFase('lente');
      } else {
        const a = lenteRef.current?.animate([roda(W / 2, H * .35, 0), { ...roda(W / 2, H * .35, Math.min(W, H) * .3), offset: .45 }, roda(W / 2, H * .35, R)],
          { duration: reduzir ? 1 : 900, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
        await a?.finished.catch(() => {});
        if (vivo) aoFim();
      }
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);
  return <div className="hv-transicao" aria-hidden="true">
    {fase === 'iris' ? <div className="hv-iris" ref={irisRef} style={{ left: 0, top: 0, width: '100%', height: '100%' }} />
      : <div className="hv-lente" ref={lenteRef} style={{ left: '50%', top: '35%', width: 0, height: 0 }} />}
  </div>;
}

// ---------- Cena de transmissão ----------
// Uma das 5 cenas, pela via, sem dizer o nome da doença. A cena se repete enquanto as duas falas contam a cadeia:
// primeiro como o agente chegou ali (só no texto), depois como chegou ao paciente (o que se vê).
export function CenaTransmissao({ doenca: d, aoFim }) {
  const ref = useRef(null);
  const svgRef = useRef(null);
  const quadro = useQuadro(ref);
  const reduzir = useReducedMotion();
  const [caixa, dizer] = useFala();
  const [cena] = useState(() => montarTransmissao(d.via, d.id));
  const [html] = useState(() => ({ __html: cena.svg }));
  useEffect(() => {
    let vivo = true, raf = null;
    const t0 = performance.now();
    const loop = t => { if (!vivo) return; cena.atualizar(svgRef.current, reduzir ? 4000 : (t - t0) % CICLO_TRANSMISSAO); raf = requestAnimationFrame(loop); };
    cena.atualizar(svgRef.current, reduzir ? 4000 : 0);
    raf = requestAnimationFrame(loop);
    (async () => {
      await espera(reduzir ? 200 : 1400);
      for (const fala of d.cadeia || []) { if (!vivo) return; await dizer(fala); }
      if (vivo) aoFim();
    })();
    return () => { vivo = false; cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div className="hv-cena" ref={ref}>
    <div className="hv-quadro" style={{ width: quadro.w, height: quadro.h }}>
      <span className="hv-rotulo-via">Transmissão · {VIAS[d.via]?.nome || 'contágio'}</span>
      <svg ref={svgRef} viewBox="0 0 800 600" role="img" aria-label={`Cena de transmissão: ${VIAS[d.via]?.nome || ''}`} dangerouslySetInnerHTML={html} />
      {caixa}
    </div>
  </div>;
}

// ---------- Mapa estilo conquistas ----------
// O "Início" no centro; cada ramo é uma área com cor, emblema e direção; um ramo tracejado mostra onde entra uma
// área nova. Ao abrir, a linha verde se desenha uma vez até o último paciente aberto de cada ramo.
const RAIZ = { x: 660, y: 660 }, PRIMEIRO = 200, PASSO = 132, MUNDO = 1320;
const DIRECOES = [[1, 0], [0, -1], [0, 1], [-1, 0]];
const posNo = id => { const { cap, i } = ramoDe(id); const [dx, dy] = cap.direcao; const dd = PRIMEIRO + i * PASSO; return { x: RAIZ.x + dx * dd, y: RAIZ.y + dy * dd }; };
function segmentos([dx, dy], n) {
  return Array.from({ length: n }, (_, i) => {
    const de = i === 0 ? 48 : PRIMEIRO + (i - 1) * PASSO + 39, ate = PRIMEIRO + i * PASSO - 39;
    return `M${RAIZ.x + dx * de} ${RAIZ.y + dy * de} L${RAIZ.x + dx * ate} ${RAIZ.y + dy * ate}`;
  });
}

export function MapaHistoria({ stats, admin, recemVencida, aoVoltar, aoAtender, aoPergaminho, aoEnciclopedia }) {
  const reduzir = useReducedMotion();
  const vistaRef = useRef(null);
  const mundoRef = useRef(null);
  const linhasRef = useRef(null);
  const vista = useRef({ x: 0, y: 0, escala: 1, mexeu: false });
  const arraste = useRef(null);
  const [ficha, setFicha] = useState(null);
  const [liberarTudo, setLiberarTudo] = useState(false);
  const [toast, setToast] = useState('');
  // Volta da vitória: 0 mostra o paciente ainda aberto; 1, vencido; 2, a linha até o próximo aberta.
  const [etapa, setEtapa] = useState(recemVencida ? 0 : 2);
  const guia = useRef(0);
  const vencidas = vencidasNaHistoria(stats);
  const estado = id => {
    if (recemVencida && etapa === 0 && id === recemVencida) return 'disponivel';
    if (recemVencida && etapa < 2) { const { cap, i } = ramoDe(recemVencida); if (cap.ids[i + 1] === id) return 'bloqueado'; }
    const st = estadoNaHistoria(stats, id);
    return st === 'bloqueado' && liberarTudo ? 'disponivel' : st;
  };
  const futuro = DIRECOES.find(d => !CAPITULOS.some(c => c.direcao[0] === d[0] && c.direcao[1] === d[1])) || [-1, 0];
  const posFuturo = i => ({ x: RAIZ.x + futuro[0] * (PRIMEIRO + i * PASSO), y: RAIZ.y + futuro[1] * (PRIMEIRO + i * PASSO) });

  const aplicar = useCallback((suave = false) => {
    const m = mundoRef.current;
    if (!m) return;
    m.classList.toggle('suave', suave && !reduzir);
    m.style.transform = `translate(${vista.current.x}px, ${vista.current.y}px) scale(${vista.current.escala})`;
  }, [reduzir]);
  const limitar = useCallback(() => {
    const v = vistaRef.current, s = vista.current;
    const t = MUNDO * s.escala, mx = v.clientWidth * .5, my = v.clientHeight * .5;
    s.x = Math.min(mx, Math.max(v.clientWidth - t - mx, s.x)); s.y = Math.min(my, Math.max(v.clientHeight - t - my, s.y));
  }, []);
  const centralizar = useCallback((suave = true, foco = null) => {
    const v = vistaRef.current, s = vista.current;
    if (!v) return;
    s.escala = v.clientHeight < 460 || v.clientWidth < 600 ? .72 : 1;
    const alvo = foco ? posNo(foco) : { x: RAIZ.x + 120, y: RAIZ.y };
    s.x = v.clientWidth / 2 - alvo.x * s.escala; s.y = v.clientHeight / 2 - alvo.y * s.escala;
    limitar(); aplicar(suave);
  }, [aplicar, limitar]);
  // Primeira posição, e o mapa volta ao centro quando a tela muda (girar o celular) se o jogador ainda não arrastou.
  useLayoutEffect(() => {
    centralizar(false, recemVencida || null);
    const ro = new ResizeObserver(() => { if (vista.current.mexeu) { limitar(); aplicar(); } else centralizar(false, recemVencida || null); });
    ro.observe(vistaRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // A linha verde se desenha uma vez, da raiz até a ponta aberta de cada ramo.
  useEffect(() => {
    if (reduzir || recemVencida) return;
    for (const cap of CAPITULOS) {
      const abertos = [...(linhasRef.current?.querySelectorAll(`path.aberta[data-ramo="${cap.id}"]`) || [])];
      (async () => {
        for (const p of abertos) {
          const L = p.getTotalLength();
          p.style.strokeDasharray = L;
          await p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 260, easing: 'linear' }).finished.catch(() => {});
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Volta da vitória: o paciente ganha cor e nome, a linha até o próximo fica verde e ele abre com um salto.
  useEffect(() => {
    if (!recemVencida || etapa >= 2) return undefined;
    const t = setTimeout(() => setEtapa(e => e + 1), etapa === 0 ? (reduzir ? 50 : 450) : (reduzir ? 50 : 900));
    return () => clearTimeout(t);
  }, [recemVencida, etapa, reduzir]);
  useEffect(() => {
    if (!recemVencida || etapa !== 2) return undefined;
    const { cap, i } = ramoDe(recemVencida);
    const proximo = cap.ids[i + 1];
    const p = proximo && linhasRef.current?.querySelector(`path[data-para="${proximo}"]`);
    if (p && !reduzir) { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 600, easing: 'ease-out' }); }
    setToast(proximo ? 'Novo paciente liberado neste ramo.' : `Ramo "${cap.nome}" completo!`);
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [recemVencida, etapa, reduzir]);

  const aoApertar = e => { arraste.current = { x: e.clientX, y: e.clientY, vx: vista.current.x, vy: vista.current.y, moveu: false }; };
  const aoMover = e => {
    const a = arraste.current;
    if (!a) return;
    const dx = e.clientX - a.x, dy = e.clientY - a.y;
    if (!a.moveu && Math.hypot(dx, dy) > 6) { a.moveu = true; vistaRef.current.setPointerCapture?.(e.pointerId); vistaRef.current.classList.add('arrastando'); }
    if (a.moveu) { vista.current.mexeu = true; vista.current.x = a.vx + dx; vista.current.y = a.vy + dy; limitar(); aplicar(); }
  };
  const aoSoltar = () => { vistaRef.current?.classList.remove('arrastando'); setTimeout(() => { arraste.current = null; }, 0); };
  const aoRolar = e => { vista.current.mexeu = true; vista.current.x -= e.deltaX; vista.current.y -= e.deltaY; limitar(); aplicar(); };
  const tocarNo = id => { if (arraste.current?.moveu) return; setFicha(id); };
  const proximoPaciente = () => {
    const abertos = CAPITULOS.flatMap(c => c.ids).filter(id => estado(id) === 'disponivel');
    if (!abertos.length) { setToast('Todos os pacientes da história foram descobertos.'); setTimeout(() => setToast(''), 2600); return; }
    const id = abertos[guia.current % abertos.length];
    guia.current++;
    setFicha(null); centralizar(true, id);
    setTimeout(() => setFicha(id), reduzir ? 0 : 450);
  };

  const linhas = [];
  for (const cap of CAPITULOS) segmentos(cap.direcao, cap.ids.length).forEach((d, i) => {
    const id = cap.ids[i];
    linhas.push(<path key={`b-${id}`} className="base" d={d} />, <path key={`l-${id}`} className={estado(id) === 'bloqueado' ? 'fechada' : 'aberta'} data-ramo={cap.id} data-para={id} d={d} />);
  });
  segmentos(futuro, 3).forEach((d, i) => linhas.push(<path key={`f-${i}`} className="futura" d={d} />));
  const total = DOENCAS.length;
  const fichaInfo = ficha && ficha !== 'raiz' ? (() => {
    const d = doenca(ficha); const { cap, i } = ramoDe(ficha); const st = estado(ficha);
    const anterior = i > 0 ? doenca(cap.ids[i - 1]) : null;
    return { d, cap, i, st, anterior };
  })() : null;
  return <div className="hv-mapa">
    <div className="hv-vista" ref={vistaRef} onPointerDown={aoApertar} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar} onWheel={aoRolar}>
      <div className="hv-mundo" ref={mundoRef}>
        <svg className="hv-linhas" ref={linhasRef} width={MUNDO} height={MUNDO}>{linhas}</svg>
        {CAPITULOS.map(cap => {
          const p = posNo(cap.ids[0]);
          const estilo = cap.direcao[0] === 1 ? { left: p.x - 39, top: p.y - 96 } : { left: p.x + 52, top: p.y - (cap.direcao[1] < 0 ? 30 : 8) };
          return <div key={cap.id} className="hv-rotulo" style={{ '--cor': cap.cor, ...estilo }}><Emblema cap={cap} /><span><b>{cap.nome}</b><small>{cap.area} · {cap.sub}</small></span></div>;
        })}
        <div className="hv-rotulo futuro" style={{ '--cor': '#6f7d96', left: posFuturo(2).x - 39, top: posFuturo(0).y - 96 }}><Emblema /><span><b>Ramo futuro</b><small>Uma área nova entra aqui</small></span></div>
        <button type="button" className="hv-no raiz" style={{ left: RAIZ.x, top: RAIZ.y }} onClick={() => tocarNo('raiz')} aria-label="Início: seu primeiro plantão"><span className="hv-arte"><Doctor /></span></button>
        {CAPITULOS.flatMap(cap => cap.ids.map(id => {
          const st = estado(id); const p = posNo(id); const d = doenca(id);
          return <button key={id} type="button" className={`hv-no ${st} ${recemVencida === id && etapa >= 1 ? 'pulso' : ''} ${recemVencida && etapa === 2 && ramoDe(recemVencida).cap.ids[ramoDe(recemVencida).i + 1] === id ? 'salto' : ''}`}
            style={{ '--cor': cap.cor, left: p.x, top: p.y }} onClick={() => tocarNo(id)}
            aria-label={st === 'vencido' ? d.nome : st === 'disponivel' ? `Paciente novo: ${d.capitulo}` : 'Paciente bloqueado'}>
            <span className={`hv-arte ${st === 'vencido' ? '' : 'hv-escura'}`}><Species id={id} /></span>
            <span className="hv-selo">{st === 'vencido' ? <Check strokeWidth={3} /> : st === 'disponivel' ? '?' : <Lock />}</span>
            {st === 'vencido' && <span className="hv-nome-no">{d.nome}</span>}
          </button>;
        }))}
        {[0, 1, 2].map(i => <span key={i} className="hv-no futuro" style={{ left: posFuturo(i).x, top: posFuturo(i).y }} aria-hidden="true"><Plus /></span>)}
      </div>
    </div>
    <div className="topbar"><button className="icon-btn" onClick={aoVoltar} aria-label="Voltar"><ChevronLeft /></button>
      <h1><small>Batalha · História</small>Mapa da história</h1>
      <span className="chip mint"><Check />{vencidas.size}/{total}</span>
      {admin && <button className={`icon-btn ${liberarTudo ? 'on' : ''}`} onClick={() => setLiberarTudo(v => !v)} aria-pressed={liberarTudo} aria-label="Revisão: liberar todos os pacientes" title={liberarTudo ? 'Revisão: tudo liberado' : 'Revisão: progressão real'} style={liberarTudo ? { color: 'var(--amber)' } : undefined}><ShieldAlert /></button>}
      <button className="icon-btn" onClick={() => { vista.current.mexeu = false; centralizar(); }} aria-label="Centralizar o mapa"><Crosshair /></button>
      <button className="icon-btn" onClick={aoEnciclopedia} aria-label="Enciclopédia"><BookOpen /></button>
    </div>
    {toast && <div className="hv-toast" role="status">{toast}</div>}
    {!ficha && <div className="hv-acoes"><button type="button" className="hv-guia" onClick={proximoPaciente}><Compass />Próximo paciente</button></div>}
    {ficha === 'raiz' && <div className="hv-ficha" role="dialog" aria-label="Início">
      <button className="hv-fechar" onClick={() => setFicha(null)} aria-label="Fechar"><X size={16} /></button>
      <span className="hv-arte"><Doctor /></span>
      <div><p className="kicker">Início</p><h2>Seu primeiro plantão</h2><p className="sub">Cada ramo é uma área. Cada vitória abre o próximo paciente do mesmo ramo.</p></div>
    </div>}
    {fichaInfo && <div className="hv-ficha" role="dialog" aria-label="Paciente">
      <button className="hv-fechar" onClick={() => setFicha(null)} aria-label="Fechar"><X size={16} /></button>
      <span className={`hv-arte ${fichaInfo.st === 'vencido' ? '' : 'hv-escura'}`}><Species id={ficha} /></span>
      <div><p className="kicker" style={{ color: fichaInfo.cap.cor }}>{fichaInfo.st === 'vencido' ? 'Descoberta' : fichaInfo.st === 'disponivel' ? 'Paciente novo' : 'Bloqueado'}</p>
        <h2>{fichaInfo.st === 'vencido' ? fichaInfo.d.nome : fichaInfo.st === 'disponivel' ? fichaInfo.d.capitulo : 'Paciente bloqueado'}</h2>
        <p className="sub">{fichaInfo.st === 'vencido' ? `${fichaInfo.cap.nome} · ${fichaInfo.i + 1} de ${fichaInfo.cap.ids.length} · agente: ${AGENTE[fichaInfo.d.agente].nome.toLowerCase()}`
          : fichaInfo.st === 'disponivel' ? `${fichaInfo.cap.nome} · ${fichaInfo.i + 1} de ${fichaInfo.cap.ids.length} · doença: ??`
            : `Descubra ${fichaInfo.anterior && vencidas.has(fichaInfo.anterior.id) ? fichaInfo.anterior.nome : 'o paciente anterior'} deste ramo para liberar.`}</p></div>
      {fichaInfo.st !== 'bloqueado' && <div className="hv-ficha-acoes">
        {fichaInfo.st === 'vencido' ? <button className="ghost" style={{ width: 'auto', padding: '10px 14px' }} onClick={() => aoPergaminho(ficha)}><BookOpen size={16} /> Pergaminho</button>
          : <button className="ghost" style={{ width: 'auto', padding: '10px 14px' }} onClick={() => setFicha(null)}>Fechar</button>}
        <button className="primary" onClick={() => aoAtender(ficha)}>{fichaInfo.st === 'vencido' ? 'Rever o caso' : 'Atender paciente'} <ChevronRight size={17} /></button>
      </div>}
    </div>}
  </div>;
}

// ---------- Pergaminho ----------
// Rascunho montado só com campos que já existem no conteúdo, marcado até a revisão médica. Profilaxia e sintoma
// marcante entram quando o usuário colocar nos lotes de conteúdo (pendência de 19/10/2026).
export function Pergaminho({ doenca: d, rotulo, aoVoltar }) {
  const papelRef = useRef(null);
  const roloRef = useRef(null);
  const reduzir = useReducedMotion();
  useLayoutEffect(() => {
    if (reduzir) return;
    const papel = papelRef.current, h = papel.getBoundingClientRect().height;
    papel.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: 'cubic-bezier(.4,0,.2,1)' });
    roloRef.current.animate([{ transform: `translateY(${-h}px)` }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.4,0,.2,1)' });
  }, [reduzir]);
  const revisado = d.revisado === true;
  return <div className="hv-perg">
    <div className="topbar"><button className="icon-btn" onClick={aoVoltar} aria-label="Voltar"><ChevronLeft /></button><h1><small>Pergaminho</small>{d.nome}</h1></div>
    <div className="hv-perg-area">
      <div className="hv-rolo" />
      <article className="hv-papel" ref={papelRef}>
        <div className="hv-perg-topo"><Species id={d.id} /><div><h2>{d.nome}</h2><p className="tipo">{d.tipo} · {AGENTE[d.agente].nome.toLowerCase()}</p>
          {!revisado && <span className="hv-carimbo">Rascunho · aguarda revisão médica</span>}</div></div>
        <h3>Resumo</h3><p>{d.aprendizado}</p>
        <h3>Como chega ao paciente</h3><p><b>{VIAS[d.via]?.nome || 'Transmissão'}.</b> {(d.cadeia || []).join(' ')}</p>
        {d.exames?.anamnese && <p style={{ marginTop: 6 }}><i>Neste caso:</i> {minusculo(d.exames.anamnese)}</p>}
        <h3>Sintomas principais</h3><ul>{(d.golpes || []).map(g => <li key={g.nome}>{g.nome}</li>)}</ul>
        {d.marcante && <><h3>Sintoma marcante</h3><p>{d.marcante}</p></>}
        {d.buff?.explica && <><h3>Complicação a vigiar</h3><p className="destaque"><b>{d.buff.nome}.</b> {d.buff.explica}</p></>}
        <h3>Ponto fraco</h3><p>{CURA[d.cura] || '—'}</p>
        <h3>Tratamento recomendado</h3><p>{d.conduta}</p>
        <h3>Profilaxia</h3>{d.profilaxia ? <p>{d.profilaxia}</p> : <p className="falta">Ainda não escrita: entra nos próximos lotes de conteúdo, com revisão médica.</p>}
        {d.notificar && <><h3>Notificação</h3><p>{d.notificar}</p></>}
        <h3>Fontes</h3><ul className="fontes">{(d.fontes || []).map((f, i) => <li key={i}>{FONTES[f.fonte]?.curto || f.fonte}, p. {f.pag} do PDF: {f.sobre}</li>)}</ul>
      </article>
      <div className="hv-rolo" ref={roloRef} />
    </div>
    <div className="hv-perg-acoes"><button className="primary" onClick={aoVoltar} autoFocus>{rotulo} <ChevronRight size={17} /></button></div>
  </div>;
}

// ---------- Enciclopédia ----------
export function Enciclopedia({ stats, aoAbrir, aoFontes, aoVoltar }) {
  const vencidas = vencidasNaHistoria(stats);
  const descobertas = new Set([...vencidas, ...(stats.descobertas || [])]);
  return <div className="cbt-scr">
    <div className="topbar"><button className="icon-btn" onClick={aoVoltar} aria-label="Voltar"><ChevronLeft /></button><h1><small>Batalha · História</small>Enciclopédia</h1>
      <span className="chip mint">{descobertas.size}/{DOENCAS.length}</span></div>
    <div className="scroll">
      {CAPITULOS.map(cap => <section key={cap.id} className="hv-enc-ramo" style={{ '--cor': cap.cor }}>
        <h3><Emblema cap={cap} />{cap.nome}</h3>
        <div className="hv-enc-grade">{cap.ids.map(id => descobertas.has(id)
          ? <button key={id} type="button" className="hv-enc-item" onClick={() => aoAbrir(id)}><Species id={id} /><b>{doenca(id).nome}</b><small>Abrir o pergaminho</small></button>
          : <button key={id} type="button" className="hv-enc-item" disabled aria-label="Doença não descoberta"><span className="hv-escura"><Species id={id} /></span><b>???</b><small>Não descoberta</small></button>)}</div>
      </section>)}
      <button className="ghost" onClick={aoFontes}><Library size={16} /> Biblioteca de fontes</button>
    </div>
  </div>;
}

// ---------- Celular em pé ----------
// A Batalha pede para virar o aparelho. No Android, o botão tenta girar sozinho (tela cheia e trava de orientação);
// no iPhone o navegador não deixa forçar, então o aviso pede para virar e, se não girar, desligar o bloqueio de rotação.
const emPe = () => typeof window !== 'undefined' && window.innerHeight > window.innerWidth && window.innerWidth < 600;
export function AvisoGirar() {
  const [mostrar, setMostrar] = useState(emPe);
  const [falhou, setFalhou] = useState(false);
  useEffect(() => {
    const conferir = () => setMostrar(emPe());
    window.addEventListener('resize', conferir);
    window.addEventListener('orientationchange', conferir);
    return () => { window.removeEventListener('resize', conferir); window.removeEventListener('orientationchange', conferir); };
  }, []);
  if (!mostrar) return null;
  const girar = async () => {
    try { await document.documentElement.requestFullscreen?.(); await window.screen?.orientation?.lock?.('landscape'); }
    catch { setFalhou(true); }
  };
  return <div className="hv-girar" role="alertdialog" aria-modal="true" aria-label="Vire o celular">
    <span className="hv-telefone" aria-hidden="true" />
    <h2>Vire o celular</h2>
    <p>A Batalha é jogada com o celular deitado.</p>
    <button className="primary" onClick={girar}>Girar a tela</button>
    {falhou && <p role="status">Este aparelho não deixa girar sozinho: vire o celular. Se não girar, desligue o bloqueio de rotação.</p>}
  </div>;
}
