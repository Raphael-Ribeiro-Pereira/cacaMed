// Diagnóstico opt-in, local ao navegador. Não coleta identidade, credenciais,
// conteúdo de respostas ou URLs de recursos/retorno OAuth.
const KEY = 'cacamed-diagnostico';
let ativo = false;
try {
  if (typeof window !== 'undefined') {
    const opcao = new URLSearchParams(window.location.search).get('diagnostico');
    if (opcao === '1') sessionStorage.setItem(KEY, '1');
    if (opcao === '0') sessionStorage.removeItem(KEY);
    ativo = sessionStorage.getItem(KEY) === '1';
  }
} catch { /* Armazenamento indisponível: diagnóstico permanece desativado. */ }

const marcos = {};
const chamadas = [];
let ultimoLCP = null;
if (ativo && typeof PerformanceObserver !== 'undefined') {
  try {
    new PerformanceObserver(lista => {
      for (const entrada of lista.getEntries()) ultimoLCP = Math.round(entrada.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* Navegadores sem LCP continuam com os outros marcos. */ }
}

export function marcarInterfacePronta(tela) {
  if (!ativo || !['login', 'menu', 'erroPerfil'].includes(tela) || marcos[tela] !== undefined) return;
  // Dá à tela renderizada a oportunidade de pintar antes de registrar o marco.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (marcos[tela] === undefined) marcos[tela] = Math.round(performance.now());
  }));
}

export function registrarTempoAPI(acao, inicio, sucesso) {
  if (!ativo) return;
  chamadas.push({ acao, ms: Math.round(performance.now() - inicio), sucesso });
  if (chamadas.length > 200) chamadas.shift();
}

export function obterDiagnostico() {
  const nav = performance.getEntriesByType('navigation')[0];
  const recursos = performance.getEntriesByType('resource').filter(r => {
    const url = new URL(r.name);
    return url.origin === location.origin && /\.(?:[cm]?js|css)$/.test(url.pathname);
  });
  const tempos = chamadas.filter(c => c.sucesso).map(c => c.ms).sort((a, b) => a - b);
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  return {
    data: new Date().toISOString(), ambiente: ['localhost', '127.0.0.1'].includes(location.hostname) ? 'local' : 'publico',
    viewport: { largura: innerWidth, altura: innerHeight, conteudo: document.documentElement.scrollWidth },
    navegacao: nav ? { tipo: nav.type, respostaMs: Math.round(nav.responseEnd),
      domMs: Math.round(nav.domContentLoadedEventEnd), loadMs: Math.round(nav.loadEventEnd) } : null,
    fcpMs: fcp ? Math.round(fcp.startTime) : null, lcpObservadoMs: ultimoLCP,
    interfaceMs: { ...marcos },
    recursos: { total: recursos.length, bytesTransferidos: recursos.reduce((s, r) => s + r.transferSize, 0),
      comTransferencia: recursos.filter(r => r.transferSize > 0).length,
      semTransferencia: recursos.filter(r => r.transferSize === 0).length },
    api: { amostras: tempos.length, falhas: chamadas.filter(c => !c.sucesso).length,
      mediaMs: tempos.length ? Math.round(tempos.reduce((s, t) => s + t, 0) / tempos.length) : null,
      p95Ms: tempos.length ? tempos[Math.ceil(tempos.length * 0.95) - 1] : null, chamadas: [...chamadas] },
    limites: 'Tempo até menu inclui espera humana se houver login. LCP observado pode mudar. Transferência zero sugere cache, mas não prova cache frio. Sem simulação de CPU/rede móvel.',
  };
}

export function iniciarDiagnostico() {
  if (!ativo || document.getElementById('cacamed-diagnostico')) return;
  const painel = document.createElement('details');
  painel.id = 'cacamed-diagnostico';
  Object.assign(painel.style, { position: 'fixed', bottom: '8px', left: '8px', right: '8px',
    zIndex: '9999', background: '#101b2d', color: '#fff', padding: '10px', border: '1px solid #22d3ee',
    borderRadius: '10px', maxHeight: '45vh', overflow: 'auto', fontSize: '12px' });
  const resumo = document.createElement('summary');
  resumo.textContent = 'Diagnóstico de desempenho (somente neste navegador)';
  const texto = document.createElement('pre');
  texto.style.whiteSpace = 'pre-wrap';
  const atualizar = () => { texto.textContent = JSON.stringify(obterDiagnostico(), null, 2); };
  for (const [nome, executar] of [
    ['Atualizar medição', atualizar],
    ['Baixar relatório', () => {
      atualizar();
      const url = URL.createObjectURL(new Blob([texto.textContent], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'cacamed-desempenho.json';
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }],
    ['Desativar', () => { sessionStorage.removeItem(KEY); ativo = false; painel.remove(); }],
  ]) {
    const botao = document.createElement('button'); botao.type = 'button'; botao.textContent = nome;
    Object.assign(botao.style, { minHeight: '44px', marginRight: '8px', textDecoration: 'underline' });
    botao.addEventListener('click', executar); painel.append(botao);
  }
  painel.prepend(resumo); painel.append(texto); painel.addEventListener('toggle', atualizar);
  document.body.append(painel); atualizar();
}
