# App instalável (PWA)

Desde 07/10/2026 o cacoMed pode ser instalado na tela inicial do celular, sem loja. Ele abre em tela cheia, com ícone próprio, e abre a última versão guardada quando está sem rede. Entrar e jogar continuam exigindo internet: o progresso nunca sai do cache.

## Como instalar

- **Android (Chrome):** abrir https://caca-med.vercel.app, tocar nos três pontos e em "Instalar app" (ou aceitar o aviso de instalação).
- **iPhone (Safari):** abrir https://caca-med.vercel.app no Safari, tocar em Compartilhar e em "Adicionar à Tela de Início". No iPhone, o Chrome e outros navegadores também usam esse menu desde o iOS 16.4, mas o Safari é o caminho garantido.
- **Computador (Chrome ou Edge):** o ícone de instalar aparece na barra de endereço.

## Arquivos

- `public/manifest.webmanifest`: nome, cores (#0b0f19) e ícones.
- `public/icons/`: 192 e 512 px. O ícone "maskable" ocupa o quadro inteiro, para o Android recortar.
- `public/apple-touch-icon.png`: 180 px, para o iPhone.
- `public/favicon.svg`: o ECG verde-menta do protótipo; substituiu o logotipo do Vite que tinha ficado do modelo.
- `public/sw.js`: service worker. Regras:
  - páginas vêm da rede primeiro, então cada publicação aparece na hora; sem rede, abre a última página guardada;
  - arquivos de `/assets/` (com hash no nome) vêm do cache primeiro, com no máximo 120 guardados;
  - API, Supabase, Firebase e `/api/ia` nunca passam pelo cache.

  Mudar a lógica do service worker exige subir `VERSAO`, o que apaga os caches antigos.
- `src/main.jsx` registra o service worker só na build de produção.
- `index.html` traz o manifesto, a cor do tema e as tags do iPhone. A barra de status fica translúcida e o conteúdo vai até as bordas (`viewport-fit=cover`); as telas do protótipo já respeitam as áreas seguras.
- `vercel.json` serve `sw.js` e o manifesto sem cache, para as atualizações chegarem.

## Conferido

Em 07/10/2026, na build de produção servida localmente: service worker ativo e controlando a página, manifesto válido, ícones nos tamanhos certos, 16 arquivos da build guardados e o app abrindo a tela de login com o servidor desligado. A instalação num aparelho real depende da publicação.

## Publicação

Publicado em produção em 07/10/2026, a pedido do usuário: deploy `dpl_C3Ni3PRx3askHXKa7Wrmbnv9hsPa`, commit 8e08a63, em https://caca-med.vercel.app. Esse deploy também levou as telas de jogo portadas (ver `docs/telas-de-jogo.md`). Conferido no site público:
- manifesto, `sw.js` e ícones respondendo 200, com os tipos certos;
- `sw.js` com `Cache-Control: no-cache`;
- service worker ativo e controlando a página;
- tela de login abrindo, sem erros no console.

A instalação num aparelho real e o login com a conta real ainda não foram testados por mim. Para voltar à versão anterior, promover `dpl_3SHAdbbc2VasNiycApMEBExtFKeF` (commit d028855). O service worker continua instalado nos aparelhos, mas as páginas vêm da rede primeiro, então a versão promovida aparece normalmente.
