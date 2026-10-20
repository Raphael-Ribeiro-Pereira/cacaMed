import { useLayoutEffect, useState } from 'react';
import { BrainCircuit, ClipboardCheck, ScanLine } from 'lucide-react';

// Revisão semanal: modos das cartas, medidas do palco e a geometria do leque e do anel (a mesma do protótipo aprovado
// em 19/10/2026, docs/prototipos/revisao-hub.html). Os componentes ficam em components/revisaoSemana.jsx.
export const MODOS_REVISAO = {
  quiz: { rotulo: 'Quiz', icone: BrainCircuit, cor: '#00f5d4', un: ['erro', 'erros'] },
  verdadeMentira: { rotulo: 'Verdade ou mentira', icone: ScanLine, cor: '#ffd166', un: ['erro', 'erros'] },
  erroMedico: { rotulo: 'Erro médico', icone: ClipboardCheck, cor: '#ff8fa3', un: ['caso', 'casos'] },
};
export const tituloCarta = (carta, cartas) => {
  const mesmas = cartas.filter(c => c.modo === carta.modo);
  const rotulo = MODOS_REVISAO[carta.modo]?.rotulo || 'Revisão';
  return mesmas.length > 1 ? `${rotulo} ${mesmas.findIndex(c => c.id === carta.id) + 1}` : rotulo;
};
export const minutos = segundos => Math.max(1, Math.round((Number(segundos) || 0) / 60));
export const espera = ms => new Promise(r => setTimeout(r, ms));
export const seg = ms => (ms / 1000).toFixed(ms < 10000 ? 1 : 0).replace('.', ',');

// Medidas do palco: largura, altura e o tamanho da carta (variáveis --cw e --ch do CSS, que mudam com a tela).
export function useMedidas(ref) {
  const [m, setM] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => {
      const cs = getComputedStyle(el);
      setM({ w: el.clientWidth, h: el.clientHeight, cw: parseFloat(cs.getPropertyValue('--cw')) || 116, ch: parseFloat(cs.getPropertyValue('--ch')) || 166 });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return m;
}

// ---------- Geometria (a mesma do protótipo) ----------
export const INCLINA = [-4, 3, -2, 5, -1, 2];
export const suave = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const posDeck = (i, n) => ({ x: (i - (n - 1) / 2) * 1.2, y: -i * 1.6, r: INCLINA[i % INCLINA.length], s: 1 });
export function posLeque(i, n, m) {
  if (n === 1) return { x: 0, y: 0, r: 0, s: 1 };
  const abertura = Math.min(m.w < 600 ? 60 : 72, 18 * (n - 1));
  const meia = abertura / 2 * Math.PI / 180;
  const ponta = (m.cw * Math.cos(meia) + m.ch * Math.sin(meia)) / 2;
  const R = Math.min(m.w < 600 ? 320 : 640, (m.w / 2 - ponta - 8) / Math.sin(meia));
  const a = -abertura / 2 + i * abertura / (n - 1);
  const rad = a * Math.PI / 180;
  return { x: R * Math.sin(rad), y: R * (1 - Math.cos(rad)) - R * (1 - Math.cos(meia)) / 2, r: a, s: 1 };
}
// Caminho em espiral entre duas posições ("furacão"), em quadros para o framer-motion.
export function espiral(i, n, de, para, m, { voltas = 1.5, raio = .34 } = {}) {
  const K = 30, q = { x: [], y: [], rotate: [], scale: [], times: [] };
  const Rw = Math.min(m.w, m.h) * raio;
  const f0 = (i / Math.max(n, 1)) * 360;
  for (let k = 0; k <= K; k++) {
    const t = k / K, e = suave(t);
    const fi = (f0 + 360 * voltas * e) * Math.PI / 180, r = Rw * Math.sin(Math.PI * t);
    q.x.push(de.x + (para.x - de.x) * e + r * Math.cos(fi));
    q.y.push(de.y + (para.y - de.y) * e + r * Math.sin(fi) * .7);
    q.rotate.push(de.r + (para.r - de.r) * e + 300 * voltas * e * (1 - e));
    q.scale.push(de.s + (para.s - de.s) * e - .12 * Math.sin(Math.PI * t));
    q.times.push(t);
  }
  return q;
}
export const VAGAS = 8;
export const angVaga = v => -90 + v * 360 / VAGAS;
export const geometriaAnel = m => { const R = Math.min(m.w, m.h) * (m.w < 600 ? .35 : .33); return { R, k: Math.min(.8, (2 * Math.PI * R / VAGAS) * .62 / m.cw) }; };
export const noAnel = (ang, g, centro = { x: 0, y: 0 }) => { const a = ang * Math.PI / 180; return { x: centro.x + g.R * Math.cos(a), y: centro.y + g.R * Math.sin(a), r: 0, s: g.k }; };
// Giro do anel: cada carta anda pelo arco, sempre em pé; a escolhida termina maior ("abrir") ou volta ao tamanho ("fechar").
export function girar(de, ate, c0, c1, g, modo) {
  const K = 28, q = { x: [], y: [], rotate: [], scale: [], times: [] };
  for (let k = 0; k <= K; k++) {
    const t = k / K, e = suave(t), a = (de + (ate - de) * e) * Math.PI / 180;
    q.x.push(c0.x + (c1.x - c0.x) * e + g.R * Math.cos(a));
    q.y.push(c0.y + (c1.y - c0.y) * e + g.R * Math.sin(a));
    q.rotate.push(0);
    q.scale.push(modo === 'abrir' ? g.k * (1 + .3 * e) : modo === 'fechar' ? g.k * (1.3 - .3 * e) : g.k);
    q.times.push(t);
  }
  return q;
}
export const alvo = p => ({ x: p.x, y: p.y, rotate: p.r, scale: p.s });

