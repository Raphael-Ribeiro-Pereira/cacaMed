// Service worker do cacoMed: deixa o app instalável, abre a última versão guardada quando não há rede
// e se atualiza sozinho a cada publicação. Só entram no cache arquivos do próprio site; API, Supabase,
// Firebase e IA sempre vão à rede (o progresso nunca sai de um cache antigo).
const VERSAO = 'cacomed-v1';
const PAGINAS = `${VERSAO}-paginas`;
const ARQUIVOS = `${VERSAO}-arquivos`;
const ESSENCIAIS = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icone-192.png', '/icons/icone-512.png', '/apple-touch-icon.png'];
const MAXIMO_ARQUIVOS = 120;

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(PAGINAS).then(cache => cache.addAll(ESSENCIAIS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', evento => {
  evento.waitUntil(caches.keys()
    .then(chaves => Promise.all(chaves.filter(chave => !chave.startsWith(VERSAO)).map(chave => caches.delete(chave))))
    .then(() => self.clients.claim()));
});

// Os arquivos de /assets/ têm hash no nome; guarda os mais recentes e descarta os mais antigos.
async function guardarArquivo(pedido, resposta) {
  const cache = await caches.open(ARQUIVOS);
  await cache.put(pedido, resposta);
  const chaves = await cache.keys();
  await Promise.all(chaves.slice(0, Math.max(0, chaves.length - MAXIMO_ARQUIVOS)).map(chave => cache.delete(chave)));
}

self.addEventListener('fetch', evento => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Páginas: rede primeiro, para sempre abrir a versão publicada; sem rede, a última página guardada.
  if (pedido.mode === 'navigate') {
    evento.respondWith(fetch(pedido)
      .then(resposta => {
        if (resposta.ok && url.pathname === '/') { const copia = resposta.clone(); caches.open(PAGINAS).then(cache => cache.put('/', copia)); }
        return resposta;
      })
      .catch(() => caches.match('/', { cacheName: PAGINAS }).then(guardada => guardada || Response.error())));
    return;
  }

  // Arquivos da build: não mudam depois de publicados, então o cache vem primeiro.
  if (url.pathname.startsWith('/assets/')) {
    evento.respondWith(caches.match(pedido).then(guardado => guardado || fetch(pedido).then(resposta => {
      if (resposta.ok) { const copia = resposta.clone(); evento.waitUntil(guardarArquivo(pedido, copia)); }
      return resposta;
    })));
    return;
  }

  // Demais arquivos do site (ícones, fotos do crachá): rede primeiro e o cache como reserva.
  evento.respondWith(fetch(pedido)
    .then(resposta => {
      if (resposta.ok) { const copia = resposta.clone(); evento.waitUntil(caches.open(ARQUIVOS).then(cache => cache.put(pedido, copia))); }
      return resposta;
    })
    .catch(() => caches.match(pedido).then(guardado => guardado || Response.error())));
});
