import { useEffect, useRef, useState } from 'react';
import { animar } from '../utils/prototipo';

// Código de 6 números do e-mail de cadastro. No acerto, a animação escolhida em 15/10/2026
// (prototipos/codigo-animacoes.html, variação D): as casinhas entram num redemoinho e se fundem
// num quadrado; os números vêm em espiral e o quadrado abre e fecha a boca para comer cada um;
// no fim ele tomba 45° e vira o visto. Cerca de 4 s; com "reduzir movimento", só o visto.
export const TAMANHO_CODIGO = 6;
const espera = ms => new Promise(ok => setTimeout(ok, ms));
const easeIn = t => t * t * t;

// Leva cada elemento da sua posição até o centro do palco em espiral, cada vez mais rápido.
// aoChegar(i) dispara quando o elemento i chega (é "comido").
function redemoinho(els, { centro, origem, dur, voltas, achata = .5, ordem, atraso, aoChegar, ativo, rastro }) {
  return new Promise(fim => {
    const t0 = performance.now();
    const estado = els.map((el, i) => {
      const [x0, y0] = origem(el), dx = x0 - centro[0];
      return { el, x0, y0, r: Math.abs(dx) || 1, a: dx < 0 ? Math.PI : 0, atr: ordem.indexOf(i) * atraso, comido: false };
    });
    const passo = agora => {
      if (!ativo()) return fim();
      let restam = 0;
      estado.forEach((e, i) => {
        if (e.comido) return;
        const p = Math.min(1, Math.max(0, (agora - t0 - e.atr) / dur));
        const r = e.r * (1 - easeIn(p)) * (1 - p * .15), a = e.a + easeIn(p) * voltas * Math.PI * 2;
        const x = centro[0] + Math.cos(a) * r, y = centro[1] + Math.sin(a) * r * achata - Math.sin(p * Math.PI) * 14;
        e.el.style.transform = `translate(${x - e.x0}px, ${y - e.y0}px) rotate(${p * 540}deg) scale(${1 - p * .55})`;
        e.el.style.opacity = String(1 - Math.max(0, p - .85) * 4);
        if (p > .1 && p < .95 && Math.random() < .25) rastro(x, y);
        if (p >= 1) { e.comido = true; e.el.style.opacity = '0'; aoChegar?.(i); } else restam++;
      });
      if (restam) requestAnimationFrame(passo); else fim();
    };
    requestAnimationFrame(passo);
  });
}

async function animarAcerto({ palco, caixas, digitos, boca, visto, onda, ativo }) {
  const caixaPalco = palco.getBoundingClientRect();
  const centro = [caixaPalco.width / 2, caixaPalco.height / 2];
  const origem = el => { const b = el.getBoundingClientRect(); return [b.left - caixaPalco.left + b.width / 2, b.top - caixaPalco.top + b.height / 2]; };
  const anima = (el, quadros, opcoes) => el.animate(quadros, { fill: 'forwards', ...opcoes }).finished.catch(() => {});
  const rastro = (x, y) => {
    const ponto = document.createElement('span');
    ponto.className = 'cd-rastro';
    ponto.style.left = x + 'px'; ponto.style.top = y + 'px';
    palco.appendChild(ponto);
    ponto.animate([{ opacity: .5, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.2)' }], { duration: 380, fill: 'forwards' }).finished.then(() => ponto.remove(), () => ponto.remove());
  };
  // Brilho de acerto antes de tudo se mexer.
  await Promise.all(caixas.map((c, i) => anima(c, [{ boxShadow: '0 0 0 0 rgba(0, 245, 212, 0)' },
    { borderColor: '#00f5d4', boxShadow: '0 0 0 6px rgba(0, 245, 212, .18)' }, { borderColor: '#00f5d4', boxShadow: '0 0 0 0 rgba(0, 245, 212, 0)' }], { duration: 300, delay: i * 30 })));
  if (!ativo()) return;
  const [cima, baixo] = boca.children;
  let fundidas = 0;
  const funde = () => {
    fundidas++;
    const e = .35 + fundidas * .11;
    boca.animate([{ transform: `scale(${e - .11}) rotate(${(fundidas - 1) * 60}deg)` }, { transform: `scale(${e + .08}) rotate(${fundidas * 60}deg)` },
      { transform: `scale(${e}) rotate(${fundidas * 60}deg)` }], { duration: 300, fill: 'forwards', easing: 'ease-out' });
  };
  const morde = () => {
    const o = { duration: 280, easing: 'ease-in-out' };
    cima.animate([{ transform: 'none' }, { transform: 'rotate(-30deg) translateY(-5px)' }, { transform: 'none' }], o);
    baixo.animate([{ transform: 'none' }, { transform: 'rotate(30deg) translateY(5px)' }, { transform: 'none' }], o);
    boca.animate([{ transform: 'scale(1.01) rotate(360deg)' }, { transform: 'scale(1.14, .9) rotate(360deg)' }, { transform: 'scale(1.01) rotate(360deg)' }], { duration: 300, fill: 'forwards' });
  };
  const comum = { centro, origem, ativo, rastro };
  const caixasNoRedemoinho = redemoinho(caixas, { ...comum, dur: 1100, voltas: 1.5, ordem: [0, 5, 1, 4, 2, 3], atraso: 90, aoChegar: funde });
  await espera(500);
  await Promise.all([caixasNoRedemoinho, redemoinho(digitos, { ...comum, dur: 1400, voltas: 2.4, ordem: [2, 3, 1, 4, 0, 5], atraso: 110, aoChegar: morde })]);
  if (!ativo()) return;
  await espera(300);
  // A boca fecha, tomba 45° e some enquanto o visto se desenha.
  await anima(boca, [{ transform: 'scale(1.01) rotate(360deg)', opacity: 1 }, { transform: 'scale(1.2) rotate(405deg)', opacity: 1, offset: .6 },
    { transform: 'scale(1.45) rotate(405deg)', opacity: 0 }], { duration: 450, easing: 'ease-in' });
  if (!ativo()) return;
  const [circulo, traco] = visto.children;
  await Promise.all([anima(circulo, [{ opacity: 1, strokeDashoffset: 240 }, { opacity: 1, strokeDashoffset: 0 }], { duration: 500 }),
    anima(visto, [{ transform: 'rotate(45deg)' }, { transform: 'none' }], { duration: 500 })]);
  await anima(traco, [{ strokeDashoffset: 60 }, { strokeDashoffset: 0 }], { duration: 310 });
  anima(onda, [{ opacity: .8, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(2.6)' }], { duration: 700 });
}

// conferir(codigo) resolve quando o código vale e rejeita com uma mensagem para o jogador.
// aoConfirmar() roda quando a animação do acerto termina.
export default function CodigoEmail({ conferir, aoConfirmar }) {
  const [valor, setValor] = useState('');
  const [fase, setFase] = useState('digitando');
  const [erro, setErro] = useState('');
  const [foco, setFoco] = useState(false);
  const [pronto, setPronto] = useState(false);
  const palco = useRef(null), caixas = useRef([]), digitos = useRef([]), boca = useRef(null), visto = useRef(null), onda = useRef(null), entrada = useRef(null);
  const confirmar = useRef(aoConfirmar);
  useEffect(() => { confirmar.current = aoConfirmar; }, [aoConfirmar]);

  const enviar = async codigo => {
    setFase('conferindo');
    try {
      await conferir(codigo);
      setFase('ok');
    } catch (falha) {
      setErro(falha.message || 'Não foi possível conferir o código. Tente de novo.');
      setFase('erro');
      // Depois da tremida, limpa o código errado (se a pessoa ainda não começou a digitar outro).
      setTimeout(() => { setValor(v => (v === codigo ? '' : v)); setFase(f => (f === 'erro' ? 'digitando' : f)); entrada.current?.focus(); }, 650);
    }
  };
  const mudar = e => {
    const novo = e.target.value.replace(/\D/g, '').slice(0, TAMANHO_CODIGO);
    setValor(novo);
    if (novo) setErro('');
    if (novo.length === TAMANHO_CODIGO) enviar(novo);
  };

  // A animação roda uma vez por acerto; se a tela sair (ou demorar demais), segue mesmo assim.
  useEffect(() => {
    if (fase !== 'ok') return undefined;
    let ativo = true, seguiu = false;
    const seguir = () => { if (!seguiu) { seguiu = true; setPronto(true); setTimeout(() => confirmar.current?.(), 700); } };
    const reserva = setTimeout(seguir, 9000);
    if (!animar()) {
      visto.current.classList.add('fixo');
      seguir();
    } else {
      animarAcerto({ palco: palco.current, caixas: caixas.current, digitos: digitos.current, boca: boca.current, visto: visto.current, onda: onda.current, ativo: () => ativo })
        .then(() => { if (ativo) seguir(); });
    }
    return () => { ativo = false; clearTimeout(reserva); };
  }, [fase]);

  const atual = Math.min(valor.length, TAMANHO_CODIGO - 1);
  const casas = Array.from({ length: TAMANHO_CODIGO }, (_, i) => i);
  return <div className="cd">
    <div className="cd-palco" ref={palco} onClick={() => entrada.current?.focus()}>
      <div className={`cd-fila ${fase === 'erro' ? 'erro' : ''}`} aria-hidden="true">
        {casas.map(i => <span key={i} ref={el => { caixas.current[i] = el; }}
          className={`cd-caixa ${valor[i] ? 'on' : ''} ${foco && fase === 'digitando' && i === atual && valor.length < TAMANHO_CODIGO ? 'cur' : ''}`} />)}
      </div>
      <div className={`cd-fila cd-digs ${fase === 'erro' ? 'erro' : ''}`} aria-hidden="true">
        {casas.map(i => <span key={i} ref={el => { digitos.current[i] = el; }} className="cd-dig"><b key={valor[i] || 'vazio'}>{valor[i] || ''}</b></span>)}
      </div>
      <span className="cd-boca" ref={boca} aria-hidden="true"><i /><i /></span>
      <svg className="cd-visto" ref={visto} viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" transform="rotate(-90 42 42)" /><path d="m27 43 10 10 21-22" /></svg>
      <span className="cd-onda" ref={onda} aria-hidden="true" />
      <input ref={entrada} className="cd-real" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={TAMANHO_CODIGO} autoFocus
        aria-label={`Código de ${TAMANHO_CODIGO} números do e-mail`} value={valor} onChange={mudar} onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
        disabled={fase === 'conferindo' || fase === 'ok'} />
    </div>
    <p className={`cd-msg ${fase === 'erro' ? 'err' : pronto ? 'ok' : ''}`} aria-live="polite">
      {fase === 'conferindo' ? 'Conferindo o código…' : pronto ? 'E-mail confirmado!' : fase === 'ok' ? '' : erro}
    </p>
  </div>;
}
