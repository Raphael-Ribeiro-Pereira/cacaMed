// Cenas do modo história v2 da Batalha (protótipo aprovado em 19/10/2026, docs/prototipos/batalha-historia.html):
// a enfermaria vista de cima (cutscene de entrada) e as 5 cenas de transmissão, em desenho animado original (SVG 800x600).
// Cada cena é montada como texto SVG (só com dados do app, nunca do jogador) e animada por uma função `atualizar`.

const TRACO = '#1f2633';
export const VIAS = {
  ar: { nome: 'Ar ou gotículas' },
  inseto: { nome: 'Inseto vetor' },
  agua: { nome: 'Água ou lama' },
  carrapato: { nome: 'Carrapato' },
  alimento: { nome: 'Alimento' },
};
// Ponto fraco do pergaminho, pela terapia que controla a doença.
export const CURA = { bacti: 'Antibacterianos', proto: 'Antiparasitários', suporte: 'Tratamento de suporte (não há remédio que mate o agente)' };

let semente = 7;
const aleatorio = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };
const suave = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

// Pessoa de lado, olhando para a direita, com os pés na origem. Partes com id: braço (para levantar) e boca (para tossir).
function pessoa(id, { x, y, s = .85, camisa = '#4f7cc9', cabelo = '#3a2a1e', calca = '#3a4a6b', pele = '#e2b08a', espelho = false }) {
  return `<g transform="translate(${x} ${y}) scale(${espelho ? -s : s} ${s})"><g id="${id}">
    <ellipse cx="0" cy="0" rx="48" ry="10" fill="rgba(0,0,0,.18)"/>
    <rect x="-22" y="-98" width="20" height="98" rx="10" fill="${calca}" stroke="${TRACO}" stroke-width="4"/>
    <rect x="4" y="-98" width="20" height="98" rx="10" fill="${calca}" stroke="${TRACO}" stroke-width="4"/>
    <ellipse cx="-10" cy="-3" rx="19" ry="9" fill="#2a2f3d"/><ellipse cx="18" cy="-3" rx="19" ry="9" fill="#2a2f3d"/>
    <g id="${id}-tronco"><rect x="-36" y="-204" width="72" height="120" rx="32" fill="${camisa}" stroke="${TRACO}" stroke-width="4"/>
      <path d="M-30 -120 Q0 -110 30 -120" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="6" stroke-linecap="round"/>
      <circle cx="6" cy="-250" r="46" fill="${pele}" stroke="${TRACO}" stroke-width="4"/>
      <path d="M-40 -232 Q-50 -282 -2 -298 Q46 -306 52 -264 Q30 -280 6 -276 Q-20 -268 -24 -236 Z" fill="${cabelo}" stroke="${TRACO}" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="30" cy="-252" rx="5.5" ry="8" fill="${TRACO}"/><circle cx="32" cy="-255" r="2" fill="#fff"/>
      <circle cx="20" cy="-232" r="9" fill="#ff8fa3" opacity=".35"/>
      <path id="${id}-boca" d="M30 -226 Q38 -219 46 -226" fill="${TRACO}" stroke="${TRACO}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <g id="${id}-braco"><rect x="6" y="-192" width="22" height="96" rx="11" fill="${camisa}" stroke="${TRACO}" stroke-width="4"/><circle cx="17" cy="-96" r="12" fill="${pele}" stroke="${TRACO}" stroke-width="4"/></g>
    </g></g></g>`;
}
const BOCA_FECHADA = 'M30 -226 Q38 -219 46 -226', BOCA_ABERTA = 'M28 -228 Q37 -206 48 -228 Q38 -234 28 -228 Z';
const giro = (el, graus, ox, oy) => el?.setAttribute('transform', `rotate(${graus} ${ox} ${oy})`);

// ---------- Cutscene de entrada: enfermaria vista de cima ----------
function leito(x, y, { cobertor, cabelo, dormindo = false }) {
  return `<g transform="translate(${x} ${y})">
    <rect x="-7" y="-7" width="144" height="214" rx="20" fill="#9aa6ba" stroke="${TRACO}" stroke-width="3"/>
    <rect width="130" height="200" rx="16" fill="#f7f9fc" stroke="${TRACO}" stroke-width="3"/>
    <rect x="20" y="12" width="90" height="42" rx="16" fill="#fff" stroke="#c9d2e0" stroke-width="3"/>
    <circle cx="65" cy="40" r="21" fill="#e2b08a" stroke="${TRACO}" stroke-width="3"/>
    <path d="M44 38 Q46 16 65 16 Q86 16 86 38 Q76 28 65 30 Q52 30 44 38 Z" fill="${cabelo}" stroke="${TRACO}" stroke-width="3" stroke-linejoin="round"/>
    ${dormindo ? `<path d="M55 46 q4 3 8 0M68 46 q4 3 8 0" fill="none" stroke="${TRACO}" stroke-width="2.5" stroke-linecap="round"/>` : `<circle cx="58" cy="45" r="3" fill="${TRACO}"/><circle cx="73" cy="45" r="3" fill="${TRACO}"/>`}
    <path d="M8 68 H122 V186 Q122 194 114 194 H16 Q8 194 8 186 Z" fill="${cobertor}" stroke="${TRACO}" stroke-width="3"/>
    <path d="M8 80 H122" stroke="rgba(255,255,255,.45)" stroke-width="6"/><path d="M40 110 q20 10 50 0M34 150 q30 12 64 0" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="4" stroke-linecap="round"/>
  </g>`;
}
export function montarEnfermaria() {
  return `<defs>
      <pattern id="cn-piso" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#e6ecf4"/><rect width="40" height="40" fill="#dde5ef"/><rect x="40" y="40" width="40" height="40" fill="#dde5ef"/><path d="M0 0H80V80" fill="none" stroke="rgba(31,38,51,.06)" stroke-width="2"/></pattern>
      <linearGradient id="cn-parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a8b90"/><stop offset="1" stop-color="#2f6266"/></linearGradient>
      <linearGradient id="cn-vidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cdeffa"/><stop offset="1" stop-color="#7cc3dc"/></linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#cn-piso)"/>
    <rect width="800" height="128" fill="url(#cn-parede)"/><rect y="120" width="800" height="12" fill="#24494c"/>
    <rect x="70" y="18" width="170" height="88" rx="14" fill="#eef3f8" stroke="${TRACO}" stroke-width="3"/><rect x="82" y="28" width="146" height="68" rx="8" fill="url(#cn-vidro)"/>
    <path d="M155 28V96M82 62H228" stroke="#eef3f8" stroke-width="6"/><path d="M96 86 L130 36" stroke="rgba(255,255,255,.6)" stroke-width="8" stroke-linecap="round"/>
    <rect x="350" y="26" width="120" height="70" rx="12" fill="#eef3f8" stroke="${TRACO}" stroke-width="3"/><rect x="360" y="36" width="100" height="50" rx="6" fill="#0b1a17"/>
    <polyline class="hv-ecg" points="364,62 384,62 392,62 398,44 405,78 411,58 418,62 456,62" fill="none" stroke="#00f5d4" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="660" cy="62" r="30" fill="#fff" stroke="${TRACO}" stroke-width="3"/><path d="M660 62V42M660 62L674 70" stroke="${TRACO}" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(38 150)"><rect x="-22" y="20" width="44" height="40" rx="8" fill="#c97b4a" stroke="${TRACO}" stroke-width="3"/>
      <ellipse cx="-14" cy="0" rx="14" ry="26" fill="#4caf6d" stroke="${TRACO}" stroke-width="3" transform="rotate(-25 -14 0)"/><ellipse cx="14" cy="-4" rx="14" ry="28" fill="#5cc27d" stroke="${TRACO}" stroke-width="3" transform="rotate(22 14 -4)"/><ellipse cx="0" cy="-12" rx="12" ry="26" fill="#6fd08d" stroke="${TRACO}" stroke-width="3"/></g>
    ${leito(110, 190, { cobertor: '#8fb3d9', cabelo: '#9aa0a8', dormindo: true })}
    <text class="hv-zz" x="210" y="200" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="26" fill="#6c7a94">z</text><text class="hv-zz hv-zz2" x="226" y="178" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="20" fill="#6c7a94">z</text>
    <path d="M286 170 V420" stroke="#9aa6ba" stroke-width="6" stroke-linecap="round"/><path d="M286 176 q14 30 0 60 q14 30 0 60 q14 30 0 60 q14 30 0 60" fill="#a8dcd3" stroke="${TRACO}" stroke-width="3"/>
    ${leito(560, 270, { cobertor: '#f0a878', cabelo: '#4a3424' })}
    <g transform="translate(730 300)"><rect x="-34" y="-30" width="68" height="46" rx="8" fill="#4b5568" stroke="${TRACO}" stroke-width="3"/><rect x="-26" y="-22" width="52" height="30" rx="4" fill="#0b1a17"/>
      <polyline class="hv-ecg" points="-22,-6 -10,-6 -6,-16 -1,4 4,-8 8,-6 22,-6" fill="none" stroke="#00f5d4" stroke-width="2.5" stroke-linejoin="round"/><path d="M0 16V110M-22 110H22" stroke="#4b5568" stroke-width="6" stroke-linecap="round"/></g>
    <rect x="350" y="586" width="100" height="20" rx="4" fill="#2a3242"/><rect x="342" y="580" width="116" height="8" rx="4" fill="#9aa6ba"/>
    <g id="cn-medico"><g id="cn-med-corpo">
      <ellipse cx="0" cy="10" rx="34" ry="24" fill="rgba(0,0,0,.16)"/>
      <circle id="cn-braco-e" cx="-28" cy="0" r="11" fill="#f4f7fb" stroke="${TRACO}" stroke-width="3"/><circle id="cn-braco-d" cx="28" cy="0" r="11" fill="#f4f7fb" stroke="${TRACO}" stroke-width="3"/>
      <ellipse cx="0" cy="2" rx="28" ry="19" fill="#f4f7fb" stroke="${TRACO}" stroke-width="3"/>
      <path d="M-16 -8 Q0 8 16 -8" fill="none" stroke="#00c9ad" stroke-width="4" stroke-linecap="round"/>
      <circle cx="0" cy="-2" r="16" fill="#e2b08a" stroke="${TRACO}" stroke-width="3"/>
      <path d="M-16 0 A16 16 0 0 1 16 0 Q16 10 0 12 Q-16 10 -16 0 Z" fill="#2b2138" transform="rotate(180 0 -2)"/>
      <ellipse cx="0" cy="-17" rx="5" ry="3.5" fill="#d29a74"/>
    </g></g>
    <g id="cn-balao" opacity="0"><path d="M-26 -60 h52 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-18 l-8 12 l-8 -12 h-18 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12z" fill="#fff" stroke="${TRACO}" stroke-width="3"/>
      <path d="M0 -50 V-26" stroke="#e5484d" stroke-width="7" stroke-linecap="round"/><circle cx="0" cy="-14" r="4" fill="#e5484d"/></g>`;
}
// O médico visto de cima: posição, direção (graus) e passo (balanço dos braços).
export function posicionarMedico(raiz, { x, y, ang, passo }) {
  const balanco = Math.sin(passo) * 7;
  raiz.querySelector('#cn-medico')?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang}) scale(1.45)`);
  raiz.querySelector('#cn-braco-e')?.setAttribute('cy', balanco.toFixed(1));
  raiz.querySelector('#cn-braco-d')?.setAttribute('cy', (-balanco).toFixed(1));
  raiz.querySelector('#cn-med-corpo')?.setAttribute('transform', `scale(${(1 + Math.abs(Math.sin(passo)) * .03).toFixed(3)})`);
}

// ---------- Cenas de transmissão (5, por via) ----------
// A cena mostra só o último passo (como chegou ao paciente); o começo da cadeia vem na primeira fala. Nada aqui diz
// o nome da doença. `atualizar(raiz, t)` desenha o instante t (ms) de um ciclo de CICLO_TRANSMISSAO.
export const CICLO_TRANSMISSAO = 5600;
export function montarTransmissao(via, id) {
  semente = 11;
  const $ = (raiz, sel) => raiz.querySelector(sel);
  const gotas = Array.from({ length: 16 }, () => ({ dy: aleatorio() * 30 - 15, v: .9 + aleatorio() * .5, t0: aleatorio() * 500 + (aleatorio() < .5 ? 500 : 3100), fx: aleatorio() * 14, fy: aleatorio() * 30 - 15 }));
  const ceu = (a, b, c) => `<defs><linearGradient id="tx-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="800" height="600" fill="url(#tx-ceu)"/>`;
  if (via === 'ar') return {
    svg: `${ceu('#e2f0f1', '#d5e8ea', '#c9dfe2')}
      <rect x="520" y="70" width="170" height="120" rx="14" fill="#fff" stroke="${TRACO}" stroke-width="4"/><path d="M560 150 q0 -50 45 -50 q45 0 45 50 q-45 22 -90 0z" fill="#8fd1b0" stroke="${TRACO}" stroke-width="3"/><path d="M605 104 V150" stroke="${TRACO}" stroke-width="3"/>
      <rect y="430" width="800" height="170" fill="#b9c6d3"/><rect y="424" width="800" height="12" fill="#a6b4c3"/>
      <rect x="110" y="368" width="580" height="26" rx="12" fill="#b07a4f" stroke="${TRACO}" stroke-width="4"/><rect x="140" y="390" width="16" height="44" rx="6" fill="#8a5a36"/><rect x="644" y="390" width="16" height="44" rx="6" fill="#8a5a36"/>
      ${pessoa('tx-pac', { x: 250, y: 520, camisa: '#f0a878' })}${pessoa('tx-tos', { x: 560, y: 520, camisa: '#6b9e74', cabelo: '#8a8f99', espelho: true })}
      <g>${gotas.map((_, i) => `<circle id="tx-g${i}" r="6" fill="#8fd16b" stroke="#3f8f3a" stroke-width="2" opacity="0"/>`).join('')}</g>`,
    atualizar: (raiz, t) => {
      const tosse = (t % 2600) > 500 && (t % 2600) < 1100;
      $(raiz, '#tx-tos-boca')?.setAttribute('d', tosse ? BOCA_ABERTA : BOCA_FECHADA); giro($(raiz, '#tx-tos-tronco'), tosse ? 8 : 0, 0, -90);
      gotas.forEach((g, i) => {
        const c = $(raiz, `#tx-g${i}`); if (!c) return;
        const dt = (t - g.t0) / 1000; if (dt < 0) { c.setAttribute('opacity', '0'); return; }
        const p = Math.min(1, dt * g.v); const x = 532 - (532 - (290 + g.fx)) * p, y = 330 + g.dy * Math.sin(p * Math.PI) + g.fy * p * .3;
        c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('opacity', p < 1 ? '.9' : '.75');
      });
    },
  };
  if (via === 'inseto') {
    const tipo = id === 'leish' ? 'flebotomo' : id === 'malaria' ? 'anopheles' : 'aedes';
    return {
      svg: `${ceu('#ffb27a', '#e07a8d', '#6b5b9c')}
      <circle cx="640" cy="330" r="60" fill="#ffd27a" opacity=".9"/><path d="M0 430 Q200 360 420 420 T800 400 V600 H0Z" fill="#4e4677" opacity=".6"/>
      <g transform="translate(560 250)"><rect width="200" height="180" rx="10" fill="#2c2f4a" stroke="${TRACO}" stroke-width="4"/><path d="M-20 0 L100 -80 L220 0Z" fill="#23263d" stroke="${TRACO}" stroke-width="4" stroke-linejoin="round"/><rect x="30" y="40" width="50" height="50" rx="6" fill="#ffd27a"/><rect x="120" y="90" width="44" height="90" rx="6" fill="#3a3f60"/></g>
      <rect y="470" width="800" height="130" fill="#3f6b46"/><path d="M0 470 Q100 455 200 470 T400 470 T600 470 T800 470" fill="none" stroke="#4f8257" stroke-width="10"/>
      ${pessoa('tx-pac', { x: 330, y: 540, camisa: '#d9534f' })}
      <circle id="tx-picada" cx="362" cy="416" r="0" fill="#ff4d4d" opacity=".85"/>
      <g id="tx-inseto">${tipo === 'flebotomo'
        ? `<ellipse cx="0" cy="0" rx="9" ry="5" fill="#c9a46a" stroke="${TRACO}" stroke-width="2"/><g id="tx-asas"><ellipse cx="-4" cy="-10" rx="9" ry="6" fill="rgba(245,225,180,.85)" stroke="#a88a55" stroke-width="2" stroke-dasharray="2 2"/><ellipse cx="5" cy="-10" rx="9" ry="6" fill="rgba(245,225,180,.85)" stroke="#a88a55" stroke-width="2" stroke-dasharray="2 2"/></g><path d="M-6 4 l-6 8M0 5 l0 9M6 4 l6 8" stroke="${TRACO}" stroke-width="1.5"/><path d="M9 0 l8 2" stroke="${TRACO}" stroke-width="2"/>`
        : `<ellipse cx="0" cy="0" rx="16" ry="6" fill="#2b2b33" stroke="${TRACO}" stroke-width="2"/>${tipo === 'aedes' ? '<path d="M-8 -5v10M-2 -6v12M4 -6v12" stroke="#fff" stroke-width="2"/>' : ''}<circle cx="16" cy="-2" r="5" fill="#2b2b33"/><g id="tx-asas"><ellipse cx="-4" cy="-12" rx="13" ry="7" fill="rgba(220,235,255,.85)" stroke="#8ea0bd" stroke-width="2"/><ellipse cx="6" cy="-12" rx="13" ry="7" fill="rgba(220,235,255,.85)" stroke="#8ea0bd" stroke-width="2"/></g><path d="M-10 5 l-8 12M-2 6 l-2 14M6 6 l4 14" stroke="${TRACO}" stroke-width="2"/><path d="M20 0 l14 6" stroke="${TRACO}" stroke-width="2.5"/>`}</g>`,
      atualizar: (raiz, t) => {
        giro($(raiz, '#tx-pac-braco'), -28, 17, -186);
        const k = id === 'leish' ? 1.4 : 1.7; const pouso = id === 'leish' ? { x: 386, y: 413 } : { x: 420, y: 406 }; let x, y, s = 1;
        if (t < 2400) { const p = suave(t / 2400); x = 840 - (840 - pouso.x) * p; y = 180 + (pouso.y - 180) * p + Math.sin(p * 16) * 26 * (1 - p); }
        else if (t < 3600) { x = pouso.x; y = pouso.y + Math.sin(t / 90) * 1.5; }
        else { const p = suave(Math.min(1, (t - 3600) / 1400)); x = pouso.x + p * 420; y = pouso.y - p * 300; s = 1 - p * .3; }
        // Virado para a esquerda, com a tromba no braço.
        $(raiz, '#tx-inseto')?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${-k * s} ${k * s})`);
        $(raiz, '#tx-asas')?.setAttribute('transform', `scale(1 ${Math.floor(t / 45) % 2 ? .35 : 1})`);
        $(raiz, '#tx-picada')?.setAttribute('r', t > 2600 ? Math.min(7, (t - 2600) / 120).toFixed(1) : '0');
      },
    };
  }
  if (via === 'agua') return {
    svg: `${ceu('#a9b8c6', '#9aabbb', '#8e9fb0')}
      ${[[30, 170, 150, 260], [200, 120, 130, 310], [560, 150, 200, 280]].map(([x, y, w, h]) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#6f7f8e" stroke="${TRACO}" stroke-width="4"/>${Array.from({ length: Math.floor((h - 60) / 70) }, (_, j) => Array.from({ length: Math.floor((w - 20) / 50) }, (__, i) => `<rect x="${x + 18 + i * 50}" y="${y + 24 + j * 70}" width="28" height="36" rx="5" fill="#cfdbe4"/>`).join('')).join('')}</g>`).join('')}
      <g id="tx-chuva">${Array.from({ length: 26 }, (_, i) => `<path d="M${(i * 37) % 800} ${(i * 53) % 400} l-10 26" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>
      ${pessoa('tx-pac', { x: 260, y: 556, camisa: '#f0c419' })}
      <path id="tx-agua" fill="#8a6a45" stroke="${TRACO}" stroke-width="4"/><path id="tx-agua2" fill="none" stroke="#b08c62" stroke-width="5" stroke-linecap="round"/>
      <g>${Array.from({ length: 8 }, (_, i) => `<path id="tx-ag${i}" d="M0 0 q5 -7 10 0 t10 0 t10 0" fill="none" stroke="#f2d64b" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>`,
    atualizar: (raiz, t) => {
      const onda = (y0, a, fase) => { let d = `M0 ${y0}`; for (let x = 0; x <= 800; x += 40) d += ` L${x} ${(y0 + Math.sin(x / 60 + fase) * a).toFixed(1)}`; return d; };
      const fase = t / 400;
      $(raiz, '#tx-agua')?.setAttribute('d', `${onda(505, 8, fase)} V600 H0Z`); $(raiz, '#tx-agua2')?.setAttribute('d', onda(532, 6, fase + 1.5));
      const andou = Math.min(120, t / 40); const bob = Math.sin(t / 220) * 3;
      $(raiz, '#tx-pac')?.parentElement.setAttribute('transform', `translate(${260 + andou} ${556 + bob}) scale(.85 .85)`);
      $(raiz, '#tx-chuva')?.setAttribute('transform', `translate(${-(t / 8) % 40} ${(t / 3) % 60})`);
      for (let i = 0; i < 8; i++) {
        const el = $(raiz, `#tx-ag${i}`); if (!el) continue;
        const p = ((t + i * 700) % 2800) / 2800; const x = 40 + i * 30 + p * (236 + andou - 40 - i * 30), y = 528 + (i % 3) * 18 + Math.sin(p * 9 + i) * 6;
        el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); el.setAttribute('opacity', (p > .9 ? (1 - p) * 10 : 1).toFixed(2));
      }
    },
  };
  if (via === 'carrapato') return {
    svg: `${ceu('#bfe6f5', '#a8d8ea', '#d8f0c8')}
      <circle cx="120" cy="100" r="44" fill="#fff3b0"/><g fill="#fff" opacity=".9"><ellipse cx="520" cy="110" rx="70" ry="24"/><ellipse cx="575" cy="96" rx="46" ry="26"/></g>
      <path d="M0 420 Q200 380 400 410 T800 400 V600 H0Z" fill="#8fd17a"/><rect y="470" width="800" height="130" fill="#77c36a"/>
      ${pessoa('tx-pac', { x: 380, y: 520, camisa: '#3f72af', calca: '#7a5a3a' })}
      <g id="tx-capim">${Array.from({ length: 34 }, (_, i) => { const x = 60 + i * 21, h = 50 + (i * 37) % 40; return `<path d="M${x} 540 Q${x + 4} ${540 - h / 2} ${x + (i % 2 ? 10 : -6)} ${540 - h}" fill="none" stroke="#3f8f3a" stroke-width="6" stroke-linecap="round"/>`; }).join('')}</g>
      <circle id="tx-picada" cx="396" cy="472" r="0" fill="#ff4d4d" opacity=".85"/>
      <g id="tx-carrapato"><path d="M-8 -4 l-10 -8M-8 0 l-12 0M-8 4 l-10 8M-3 6 l-6 12M8 -4 l10 -8M8 0 l12 0M8 4 l10 8M3 6 l6 12" stroke="${TRACO}" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="0" cy="0" rx="13" ry="10" fill="#6b4226" stroke="${TRACO}" stroke-width="3"/><ellipse cx="0" cy="-3" rx="7" ry="5" fill="#c9a46a"/><circle cx="0" cy="-12" r="4" fill="#3b2416"/></g>`,
    atualizar: (raiz, t) => {
      const de = { x: 610, y: 470 }, ate = { x: 402, y: 470 }; const p = suave(Math.min(1, t / 3200));
      const x = de.x + (ate.x - de.x) * p, y = de.y - Math.sin(p * Math.PI) * 30 + (t > 3200 ? 0 : Math.sin(t / 70) * 1.5);
      $(raiz, '#tx-carrapato')?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${p < 1 ? -90 : -60}) scale(1.6)`);
      $(raiz, '#tx-capim')?.setAttribute('transform', `skewX(${(Math.sin(t / 600) * 2).toFixed(2)})`);
      $(raiz, '#tx-picada')?.setAttribute('r', t > 3400 ? Math.min(6, (t - 3400) / 120).toFixed(1) : '0');
    },
  };
  return {
    svg: `${ceu('#f8e7cd', '#f6e3c6', '#f0d9b5')}
      <rect x="500" y="60" width="200" height="150" rx="14" fill="#eef3f8" stroke="${TRACO}" stroke-width="4"/><rect x="514" y="74" width="172" height="122" rx="8" fill="#9fd3e8"/><path d="M600 74 V196" stroke="#eef3f8" stroke-width="6"/>
      <path d="M490 56 q30 80 0 160 h-20 v-160z" fill="#e8a77c" stroke="${TRACO}" stroke-width="3"/><path d="M710 56 q-30 80 0 160 h20 v-160z" fill="#e8a77c" stroke="${TRACO}" stroke-width="3"/>
      <rect x="80" y="110" width="220" height="14" rx="6" fill="#b07a4f"/><circle cx="120" cy="96" r="14" fill="#7cc4ff" stroke="${TRACO}" stroke-width="3"/><rect x="160" y="80" width="26" height="30" rx="6" fill="#e5484d" stroke="${TRACO}" stroke-width="3"/>
      ${pessoa('tx-pac', { x: 260, y: 560, camisa: '#8e5ea2' })}${pessoa('tx-fam', { x: 560, y: 560, camisa: '#5f9e6e', cabelo: '#8a8f99', espelho: true })}
      <rect x="70" y="440" width="660" height="30" rx="12" fill="#b07a4f" stroke="${TRACO}" stroke-width="4"/><rect x="90" y="466" width="620" height="134" fill="#9a6640" stroke="${TRACO}" stroke-width="4"/>
      <ellipse cx="430" cy="436" rx="56" ry="12" fill="#fff" stroke="${TRACO}" stroke-width="3"/><ellipse cx="430" cy="430" rx="34" ry="8" fill="#6b2f7a"/>
      <g id="tx-copo"><path d="M-20 -60 h40 l-5 60 h-30z" fill="#eef3f8" stroke="${TRACO}" stroke-width="4" stroke-linejoin="round"/><path d="M-16 -46 h32 l-4 42 h-24z" fill="#5b2a6e"/></g>
      <g>${Array.from({ length: 6 }, (_, i) => `<circle id="tx-sj${i}" r="4" fill="#2a1a10" opacity="0"/>`).join('')}</g>`,
    atualizar: (raiz, t) => {
      const bebe = t > 2800 && t < 4400;
      giro($(raiz, '#tx-pac-braco'), bebe ? -125 : 0, 17, -186);
      $(raiz, '#tx-copo')?.setAttribute('transform', bebe ? 'translate(318 372) rotate(-40)' : 'translate(340 440)');
      for (let i = 0; i < 6; i++) {
        const c = $(raiz, `#tx-sj${i}`); if (!c) continue;
        const p = ((t + i * 380) % 2400) / 2400;
        if (t > 2600) { c.setAttribute('opacity', '0'); continue; }
        c.setAttribute('cx', (334 + (i % 3) * 6).toFixed(1)); c.setAttribute('cy', (330 + p * 80).toFixed(1)); c.setAttribute('opacity', (p > .9 ? 0 : .85).toFixed(2));
      }
    },
  };
}
