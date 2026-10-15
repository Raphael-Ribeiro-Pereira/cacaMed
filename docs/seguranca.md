# Segurança do app: vulnerabilidades e plano de correção

Auditoria de **14/10/2026**, pedida pelo usuário. Voltar ao [[Inicio|Início]] e ao [[Desenvolvimento e operação]]. As correções entram na `main` em commits comuns e só vão para produção **numa quinta-feira, com o "sim" do usuário** ([[Desenvolvimento e operação#Arquitetura e publicação|regra de deploy]]). O andamento de cada item fica em [[pendencias|Pendências]].

> [!warning] Como ler
> A gravidade segue a escala crítica, alta, média e baixa, pensada para este app: um jogo de estudo com contas reais, ranking público e conteúdo médico. Cada achado traz a evidência no código (`arquivo:linha`), como explorar, a fonte do Google que sustenta a correção e a correção proposta. O que foi **testado na produção** está marcado.

## Método

1. **Leitura do código** pela equipe do projeto, com `arquivo:linha` como evidência.
2. **Checagens passivas na produção**, com poucas requisições simples: cabeçalhos do site, respostas da API sem login, origem não autorizada e o relatório de segurança do Supabase. **Nenhum teste ativo foi feito com contas reais.**
3. **Auditoria independente:** um segundo agente fez a mesma revisão sem ver esta. Os resultados foram comparados na seção [[seguranca#Comparação com a auditoria independente|Comparação]].
4. **Fontes do Google**, lidas na página, com o trecho conferido literalmente (seção [[seguranca#Fontes|Fontes]]).

## Resumo

Dois auditores trabalharam **separados**: a equipe do projeto (achados marcados **E**) e um agente independente (**A**). Os que aparecem nos dois têm mais confiança. A comparação está no fim do documento.

| ID | Gravidade | Achado | Quem achou | Esforço |
| --- | --- | --- | --- | --- |
| S-01 | **Crítica** | Chave de API do Google escrita no código, no histórico **público** do GitHub | E | Você + 30 min |
| S-02 | **Alta** | Qualquer jogador cria XP e tickets à vontade pela cruzadinha | E e A | 1 dia |
| S-03 | **Alta** | Sem limite de frequência nem teto diário; robôs farmam XP em Quiz, V ou M e Batalha | E e A | 1 dia |
| S-04 | **Alta** | Faltam cabeçalhos de segurança no site (CSP, anti-frame, nosniff) | E e A | 2 h |
| S-05 | **Alta (latente)** | Gabaritos e casos **não revisados** vão no pacote público do site | A | 0,5 a 2 dias |
| S-06 | Média | Aprovação de migração permite pré-sequestro de conta | A | 0,5 dia |
| S-07 | Média | Trocar senha só com o token; senha de 6 caracteres; fallback para a chave mestra | E e A | 2 h + painel |
| S-08 | Média | Ranking e coroas sem cache, com nome real do Google (LGPD) e hash sem sal | E e A | 0,5 dia |
| S-09 | Média | Cadastro sem validar username e nome, sem unicidade | A | 2 h |
| S-10 | Baixa | Firebase legado: regras do Firestore frouxas, qualquer provedor, sem revogação | E e A | Decisão |
| S-11 | Baixa | Apps Script antigo ainda público | E e A | Decisão |
| S-12 | Baixa | Mensagens de erro internas devolvidas ao cliente | A | 1 h |
| S-13 | Baixa | CORS com localhost em produção e `/api/ia` sem login | A | 1 h |
| S-14 | Baixa | Perfil e eventos crescem sem teto | A | 2 h |
| S-15 | Baixa | Link da fonte sem checar `https` | E e A | 30 min |
| S-16 | Info | 16 vulnerabilidades em dependências, **nenhuma no site publicado** | E e A | 1 h |

## Andamento (14/10/2026)

Correções na `main`, **ainda não publicadas**. A API e o site vão juntos na quinta 15/10, com o "sim" do usuário. Os testes, o lint e o build passaram em todos os commits.

| ID | Estado | Commit | O que falta |
| --- | --- | --- | --- |
| S-01 | Aguarda você | — | Revogar a chave no Google Cloud Console |
| S-02 | **Contido** | `d1d4ba9` | A partida precisa caber no tópico do banco do servidor (até 20 palavras, letras somadas das maiores e maior palavra); tempo impossível não ganha bônus; até 12 por hora e 40 por dia. Falta a cruzadinha emitida pelo servidor (22/10) |
| S-03 | **Feito (por instância)** | `d1d4ba9` | Limite em memória por IP e por jogador, com 429 e `Retry-After`; ranking e coroas com cache de 60 s. Falta um limite global no banco e o teto diário de XP do Quiz e do V ou M (decisão da [[economia-v3\|economia v3]]) |
| S-04 | **Feito (CSP em teste)** | `0aeda3d` | Anti-frame, `nosniff`, `Referrer-Policy` e `Permissions-Policy` valem já. O CSP vai em `Report-Only`: aplicado localmente, não houve bloqueio em 13 telas, num caso do Plantão, na Batalha e no Quiz. Falta conferir o login Google e Supabase na produção e então aplicar |
| S-05 | **Feito para o DDX** | `4da1957` | O build só leva os casos revisados do Plantão, do Erro médico e do Causa e efeito, e o `postbuild` falha se um não revisado vazar. Os 3 pilotos saem do site, inclusive para o administrador. Falta: a Batalha (as 12 doenças, todas sem revisão) e tirar o gabarito dos casos revisados (22/10) |
| S-06 | **Feito no código** | este | A aprovação vale só para o e-mail gravado em `migracaoAprovadaEmail` (instrução em [[migracao-supabase]]); e-mail antigo não verificado não reserva o endereço; busca por e-mail sem diferenciar maiúsculas. O cadastro novo no Firebase foi desligado pelo usuário em 14/10 |
| S-07 | **Feito no código** | `69de946` | Senha nova com 8 caracteres em todas as telas e na API, sem o fallback para a `service_role`. **No painel:** mínimo 8 e reautenticação para trocar a senha |
| S-08 | **Feito em parte** | `d1d4ba9` e este | Cache feito; o ranking e as Coroas públicos mostram o **username** do crachá, nunca o nome da conta Google (decidido em 14/10/2026). Falta o HMAC no `idPublico` |
| S-09 | **Feito** | `69de946` e este | Índice único de username pronto na migração `20261015000000_limites_perfil_e_username.sql` (sem repetidos na produção em 15/10); a corrida vira 409. **Aplicar numa quinta** |
| S-10 | **Travado pelo usuário** (14/10) | — | Firestore e Storage fechados, cadastro novo desligado, backup das contas feito. **O projeto não pode ser apagado:** a credencial do login Google do Supabase foi criada nele (conferido em 15/10). Mantê-lo (sem custo) ou criar a credencial num projeto novo antes. Todas as contas vindas do Firebase já têm a senha no Supabase; tirar do código a aceitação de login do Firebase fica para depois da publicação do site novo |
| S-11 | **Fechado pelo usuário** (14/10) | — | A implantação passou para "Somente eu" (conferido: o endereço agora pede login do Google). Arquivar depois da semana estável |
| S-12 | **Feito** | `9ad1526` | — |
| S-13 | Aceito por ora | — | O `localhost` fica na lista porque o desenvolvimento local usa a API de produção; o token não é cookie, então o risco é pequeno. `/api/ia` só é tratado quando a dica de IA for para a Edge Function |
| S-14 | **Feito em parte** | este | Teto de 256 KB por perfil e 200 eventos por gravação na mesma migração (o maior perfil hoje tem 24 KB); as chaves de `xpTopicos` já ficam presas aos tópicos do banco (S-02). **Aplicar numa quinta** |
| S-15 | **Feito** | `9ad1526` | — |
| S-16 | **Feito em parte** | este | `npm audit fix` (15/10): de 16 avisos para 4, todos do `@grpc/grpc-js` que vem do Firebase por caminho do Node (fora do site). Somem quando o código do Firebase sair (S-10); `--force` não, porque troca a versão do Firebase |

## Achados

### S-01 · Crítica · Chave de API do Google no histórico público

- **Evidência:** o repositório `Raphael-Ribeiro-Pereira/cacaMed` é **público** (a API do GitHub responde 200 sem login). O histórico contém uma chave `AIzaSyCu…` (mascarada aqui) em `src/utils/motorDDX.js` e em `src/components/Jogo.jsx`, de 24/03/2026 até a remoção em 24/09/2026 (commit `cd8dd63`). Ela não está mais no código atual, mas continua em 4 commits antigos. Há também a chave web do Firebase `AIzaSyAwIllm…` em `src/firebase.js`, no histórico.
- **Como explorar:** qualquer pessoa clona o repositório, procura no histórico e usa a chave. Há robôs que varrem o GitHub atrás disso. A consequência é uso da API Gemini na conta do usuário, com cobrança e esgotamento de cota.
- **Fonte:** o guia de chaves de API do Google Cloud diz que expor uma chave publicamente "can lead to unexpected charges on your account or unauthorized access to your data" e manda "rotate" as chaves e removê-las do código e dos repositórios.
- **Correção:**
  1. **Você, no Google Cloud Console** (APIs e serviços → Credenciais): revogar ou apagar a chave `AIzaSyCu…`, conferir o uso e a cobrança dos últimos meses e criar uma chave nova **restrita** (por API e, se for navegador, por site), se algum dia for preciso. Eu não uso a chave nem a testo.
  2. Para a chave do Firebase: conferir que está restrita aos serviços do Firebase e ao domínio do app. A documentação do Firebase diz que, assim, ela não precisa ser tratada como segredo, mas recomenda chaves separadas e restritas para as outras APIs do Google.
  3. Reescrever o histórico do Git é opcional e traz riscos. Revogar a chave é o que resolve; reescrever só esconde o que já foi copiado.
  4. Evitar repetir: um verificador de segredos antes do commit (`gitleaks`, por exemplo) e a chave da OpenRouter só nos segredos do servidor.

### S-02 · Alta · XP e tickets forjáveis pela cruzadinha

- **Evidência:** `registrarPartidaSupabase` (`src/shared/operarJogosSupabase.js:9`) calcula o XP a partir de números que o **navegador** informa: `palavras` (até 40), `letras` (até 400), `tempo` (aceita 0), `erros` e `chaveXP` (qualquer texto de 3 a 80 letras maiúsculas, números, espaço ou hífen). O servidor só confere limites e se o `id` é um UUID novo. Não há partida emitida pelo servidor, nem custo em ticket, nem tempo mínimo, nem teto por dia.
- **Como explorar:** um jogador logado envia, em laço, partidas com `palavras: 40`, `letras: 400`, `tempo: 0`, cada uma com um UUID novo. Cada uma rende cerca de 2.400 XP ou mais, 2 tickets e progresso de missões. O ranking e as Coroas são públicos, então basta isso para chegar ao topo. Os tickets pagam o DDX, o Quiz e a Batalha, e as chaves `chaveXP` novas incham o perfil.
- **Correção:**
  1. A cruzadinha passa a ter início emitido pelo servidor (devolve um `partidaId` e as palavras sorteadas no servidor), e a conclusão manda só as respostas.
  2. Limites plausíveis: tempo mínimo por letra, no máximo N partidas por hora e teto de XP por dia.
  3. `chaveXP` só entre as chaves que existem no banco de palavras.
  4. Um teste que tente o laço acima e falhe.
- **Contenção rápida, antes da correção completa:** baixar os limites de `palavras` e `letras`, exigir `tempo` mínimo proporcional às letras e limitar o ganho por hora.

### S-03 · Alta · Sem limite de frequência nem teto diário

- **Evidência:** `src/shared/apiSupabase.js` não conta requisições por jogador nem por IP, e não há teto de XP ou de tickets por dia. Testado na produção: `GET ?acao=ranking` responde 200 (1.398 bytes) sem login e dispara uma consulta no banco a cada chamada. `verificarUsername` diz se um nome existe, o que permite listar usernames. A função roda no plano Free do Supabase.
- **Como explorar:**
  - Um robô autenticado joga Quiz, V ou M e Batalha o dia inteiro: um acerto basta para andar o medidor de ticket (`treinos.js:90-105`) e os tickets viram XP na Batalha. As rodadas são emitidas pelo servidor, mas nada limita quantas por hora.
  - Inundar a API para derrubar o app (negação de serviço) ou esgotar a cota.
  - Tentar senhas pela ação `migrarSenha`, que repassa o login ao Firebase, só para o e-mail do próprio token, o que limita o dano.
- **Fonte:** o Google Cloud explica que picos de carga podem vir de "malicious requests" e recomenda "rate-limiting mechanisms".
- **Correção:** contador por jogador (tabela com janela de tempo) nas ações de escrita, em `verificarUsername` e em `migrarSenha`; tempo mínimo por rodada; teto diário de XP e de tickets por modo; cache do ranking (ver S-08). Considerar o Vercel Firewall ou o Cloudflare na frente.

### S-04 · Alta · Sem cabeçalhos de segurança

- **Evidência (testado na produção, `curl -I https://caca-med.vercel.app`):** só vêm o `strict-transport-security` e os cabeçalhos da Vercel. **Faltam:** `Content-Security-Policy`, `X-Frame-Options` ou `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`. O `vercel.json` só define cabeçalhos do `sw.js` e do manifest.
- **Como explorar:** sem CSP, qualquer falha de XSS rouba a sessão (o token fica no `sessionStorage`, legível por script). Sem anti-frame, outro site embute o app para enganar o clique (clickjacking).
- **Fontes (web.dev):** o CSP "provides an added layer to mitigate XSS attacks by restricting which scripts can be executed"; `frame-ancestors` "protects your site from clickjacking"; `X-Content-Type-Options: nosniff` é "recommended for all of your resources".
- **Correção:** acrescentar ao `vercel.json` os cabeçalhos abaixo, testar com o app e a homologação e só então publicar. O CSP precisa liberar o Supabase, o Firebase, o Google (login) e as fontes do Google Fonts. Começar em `Content-Security-Policy-Report-Only` e depois ativar.
  - `Content-Security-Policy` (restrito a `self` mais os domínios acima), com `frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` desligando câmera, microfone e geolocalização

### S-05 · Alta (latente) · Gabaritos e casos não revisados no pacote público

- **Evidência (conferida em `dist/assets`):** o chunk principal, servido **antes do login**, contém `CASOS_PLANTAO` inteiro, com `revisado:false`, `hipoteseCorreta`, `criteriosAlta`, `essenciais` e os pontos de cada ação. Os bancos de Erro médico e de Causa e efeito (com `correta`, `falha`, `elos[].correta`) e as 12 doenças da Batalha (com a cura e o porquê) também estão lá. A regra "caso não revisado é só do administrador" vale no servidor (`operarJogosSupabase.js:113,163,216,302`) e na lista da tela (`ddxLista.jsx:6`), mas o **conteúdo** continua legível por qualquer visitante.
- **Por que importa na quinta:** os lotes dos dossiês entram no banco do cliente. Hoje há só pilotos; depois de integrar, o pacote público leva o gabarito de tudo.
- **Impacto:** (a) cola: os quatro modos se resolvem por script; (b) conteúdo clínico ainda não revisado fica publicado e indexável; (c) subir a `versao` de um caso reabre o XP dele.
- **Correto, para não mexer:** o Quiz e o V ou M **não** estão no pacote: `bancoTreinos.js` só é usado no servidor (conferido: um trecho do banco não aparece em nenhum arquivo de `dist/`).
- **Correção:** seguir o modelo do Quiz. O cliente recebe só o que a etapa atual precisa (texto das ações e das opções) e o servidor devolve o resultado. No Plantão, tirar do cliente `pontos`, `essenciais`, `hipoteseCorreta`, `criteriosAlta`, `agravamentos` e `desempenho`; no Erro médico e no Causa e efeito, `correta` e `falha`; na Batalha, `cura`, `porque` e `chave`. Até lá, **não colocar casos `revisado:false` no cliente** (um módulo só com os revisados para o pacote). Isso conflita com o [[app-offline|app offline]], que quer o conteúdo no aparelho: decidir junto.

### S-06 · Média · Pré-sequestro de conta pela aprovação de migração

- **Evidência:** `index.js:57-65`: a aprovação é um booleano `profile.migracaoAprovada`, que nunca é limpo depois do uso e não registra **qual e-mail** foi aprovado. `index.js:74-75` cria o usuário no Supabase com o e-mail do token do Firebase e `email_confirm: true`, mesmo que o e-mail não tenha sido verificado. `cadastrar` (`apiSupabase.js:105`) grava `email` do token sem exigir `email_verified`.
- **Cenários:** (1) o atacante cria uma conta no Firebase com o e-mail da vítima (não verificado) e pede ao administrador para aprovar a migração; o Supabase cria o usuário confirmado com a **senha do atacante**, e a vítima, ao entrar com o Google, pode ter a identidade ligada a essa conta. (2) Sem aprovação alguma, basta um perfil cadastrado com o e-mail da vítima para bloquear o login Google dela (`index.js:45-47`, resposta 409).
- **Correção:** gravar `migracaoAprovadaEmail` (minúsculo) e exigir que seja igual ao e-mail do token; limpar a aprovação depois do vínculo; criar o usuário com `email_confirm:false` quando o e-mail não foi verificado; em `cadastrar`, só gravar `email` se estiver verificado; comparar e-mails sempre em minúsculas; **desligar o cadastro novo no Firebase** (a migração é só para contas existentes). **No painel do Firebase:** conferir se "criar conta" (sign-up) está ligado.

### S-07 · Média · Senha: troca só com o token, mínimo de 6, fallback para a chave mestra

- **Evidência:** `definirSenha` (`index.js:150-170`) troca a senha só com o access token do jogador, que fica no `sessionStorage`. O código já trata `reauthentication_needed`, mas nada no repositório prova que a opção está ligada. A API aceita 6 a 4.096 caracteres (`index.js:152`, `migrarSenhaSupabase.js:10`). O relatório do Supabase (lido hoje) mostra `auth_leaked_password_protection`: a checagem contra o HaveIBeenPwned está **desligada**. Na linha 154, `apikey: Deno.env.get('SUPABASE_ANON_KEY') || secret` envia a **service_role** como `apikey` se a variável da chave pública faltar.
- **Cenário:** um token roubado (XSS ou extensão) permite definir uma senha e manter acesso mesmo depois de o token expirar e do logout.
- **Correção:** **no painel do Supabase:** ligar a reautenticação para trocar a senha e o mínimo de 8 caracteres. Remover o `|| secret` (falhar fechado). Exigir sessão recente antes de definir a senha. A proteção contra senhas vazadas pode exigir plano pago: **não contratar sem decisão do usuário**.

### S-08 · Média · Ranking e Coroas: custo, nome real e hash sem sal

- **Evidência:** `GET ?acao=ranking|coroas` (`apiSupabase.js:52-56`) é público e responde `Cache-Control: no-store`. O ranking percorre todos os jogadores e só aplica `limit 100` depois de ordenar; `coroas()` (`index.js:104-112`) traz **todos** os perfis da semana, sem `limit`. O `nome` é, por padrão, o nome completo da conta Google e sai público com `atualizadoEm` (**LGPD**). O `idPublico` é um SHA-256 puro do `player_id` (`index.js:97` e `:109`): quem já conhece um `uid` do Firebase confirma se ele está no ranking.
- **Correção:** `Cache-Control: public, max-age=60` e uma visão materializada atualizada em intervalo; `limit` e paginação nas coroas; mostrar o `username` (ou um apelido opcional) no lugar do nome da conta; HMAC com segredo do servidor no `idPublico`.

### S-09 · Média · Cadastro sem validar username e nome

- **Evidência:** `cadastrar` (`apiSupabase.js:102-109`) aceita username de 2 a 40 caracteres e **não** passa por `usernameValido` nem por `usernameEmUso` (só `editarPerfil` passa). O `nome` vem de `user_metadata`, que o próprio usuário escreve no Supabase Auth e não tem limite.
- **Cenário:** username repetido (se passar por outro jogador), nome com 100 KB ou parecido com "Administrador" no ranking, e corrida entre duas contas.
- **Correção:** aplicar no cadastro as regras de `editarPerfil`, limitar o nome a 2 a 80 caracteres e criar um índice único em `lower(profile->>'username')`.

### S-10 · Baixa · Firebase legado

- **Evidência:** `firestore.rules:4-6` deixa o dono de `usuarios/{uid}` gravar qualquer campo do próprio documento (inclusive `role`, `tickets`, `pontuacaoTotal`). Hoje a função lê o `role` do Supabase, então não dá privilégio, mas qualquer código futuro que confie no Firestore herdaria o buraco. `src/firebase.js` ainda inicia o Firestore e o Storage, e não há `storage.rules` no repositório. `index.js:22-38` aceita **qualquer provedor** do Firebase (inclusive anônimo) e não checa revogação (uma conta apagada continua valendo por até 1 hora).
- **Correção:** publicar `allow read, write: if false;` no Firestore **e no Storage** (a ponte só precisa do Firebase Auth); restringir os provedores a `google.com` e `password`; desligar o login anônimo e o cadastro novo. **No painel:** conferir as regras do Storage (o padrão aberto é um risco clássico). Fecha junto com o desligamento do Firebase (item 10 das [[pendencias|Pendências]]).

### S-11 · Baixa · Apps Script antigo ainda público

- **Evidência:** `src/services/perfilPlanilha.js:5` e `rankingPublico.js:5` guardam a URL `…/exec` da implantação. No código arquivado em [[historico/Histórico|`docs/historico/apps-script/`]]: o perfil vira `admin` quando o e-mail é o do dono, **sem exigir e-mail verificado** (`apps-script-ranking.gs:93`, `:438-441`); a verificação do token usa uma `apiKey` enviada pelo cliente (`:427`, `:508-526`); a partida da cruzadinha também confia no cliente. Não há falha explorável concreta confirmada, mas é um segundo backend com as regras antigas.
- **Correção:** **no Apps Script:** "Gerenciar implantações" e arquivar o app da web se nada mais o usa (pendência 7 da arrumação técnica); depois remover `perfilPlanilha.js`, `rankingPublico.js` e as referências. Se ficar, exigir `email_verified` e ignorar a `apiKey` do cliente.

### S-12 · Baixa · Erros internos devolvidos ao cliente

`apiSupabase.js:138` devolve `erro.message` de qualquer exceção do motor com HTTP 400. Hoje são quase todas mensagens em português controladas, mas um `TypeError` inesperado vazaria detalhes. Correção: uma classe `ErroDeNegocio` para os erros esperados e resposta genérica para o resto, com o detalhe só no `log`.

### S-13 · Baixa · CORS com localhost e `/api/ia` sem login

- `ORIGENS_SUPABASE` (`apiSupabase.js:5`) inclui `localhost` e `127.0.0.1` em produção. Como a autenticação é por token (sem cookies), o risco é pequeno; ler a lista de uma variável de ambiente e tirar as origens locais do deploy.
- `server/index.js:14-52` (`/api/ia`) não tem login nem limite e usa a chave da OpenRouter. **Não está publicado** (confirmado: a Vercel não tem pasta `api/`), mas, ao mover as dicas de IA da cruzadinha para a Edge Function, exigir o token do jogador, validar `temperature` e o tamanho do `prompt`, e limitar o uso por jogador. A chave da OpenRouter **não** aparece no histórico (`git log -S'sk-or-v1-'` vazio).

### S-14 · Baixa · Dados sem teto

`xpTopicos` aceita chaves arbitrárias (S-02), `cacamed_events` ganha linhas a cada resposta e `obterEstatisticas` lê até 1.500 eventos por pedido. Um jogador pode inflar o próprio perfil. Correção: limitar o número de chaves de `xpTopicos`, o tamanho do `profile` na função do banco e arquivar eventos antigos.

### S-15 · Baixa · Link da fonte sem checar `https`

`ErroMedico.jsx:67` e `CausaEfeito.jsx:71` abrem `href={…fonte}` sem checar o protocolo (o Plantão já checa `https?:`). O conteúdo é nosso, mas um item com `javascript:` viraria XSS. Correção: validar `https:` no validador de conteúdo e no componente.

### S-16 · Informativo · Dependências

`npm audit` aponta 16 avisos (1 baixo, 3 moderados, 10 altos e 2 críticos). **Nenhum está no site publicado:** `protobufjs`, `@grpc/grpc-js` e `websocket-driver` vêm do Firebase por caminhos do Node, e uma busca no `dist/` não encontra nenhum deles; o resto é ferramenta de build e lint. A Edge Function usa `jose` e `supabase-js` com versões fixadas, que o `npm audit` não cobre. Correção: `npm audit fix` numa janela de manutenção, sem urgência; manter o `vite` só em `localhost`.

## O que foi conferido e está bem

- **Banco:** as 3 tabelas têm RLS ligado e acesso direto revogado para `anon` e `authenticated`; só a função (`service_role`) lê e grava. O relatório de segurança do Supabase só aponta `rls_enabled_no_policy` como informação, e é intencional. A `cacamed_commit` revoga a execução para o público.
- **Identidade:** o token do Firebase é verificado com chave pública, `issuer`, `audience` e algoritmo RS256 (`index.js:19-23`). O do Supabase passa por `auth.getUser`. Testado: POST sem token, com token lixo e com origem estranha respondem 401 e 403.
- **Autorização:** o papel `admin` só vem do banco e é conferido no servidor (`executarPedidoSupabase.js`); o cadastro sempre cria `jogador`. A homologação é restrita ao administrador.
- **Servidor como fonte da verdade:** Quiz, V ou M, Revisão, Plantão, Erro médico, Causa e efeito e Batalha usam rodadas emitidas pelo servidor, e o XP é recalculado ali. A data usada é a do servidor.
- **Idempotência:** recibos por `event_id` e versão do perfil na gravação (`cacamed_commit`) evitam XP duplicado e corrida entre abas.
- **Corpo da requisição** limitado a 32 kB; **CORS** com lista fixa de origens.
- **Frontend:** sem `dangerouslySetInnerHTML`, `eval` ou `innerHTML`; token da sessão no `sessionStorage`; links externos com `rel="noreferrer"`. O service worker não guarda a API.
- **Segredos:** `.env` está no `.gitignore` e só o `.env.example` (sem valores) é versionado. A chave da OpenRouter e a `service_role` não aparecem no código nem no histórico.
- **Sem IDOR:** o `uid` vem sempre do token verificado, nunca do corpo do pedido; ninguém lê nem grava o perfil de outro jogador. A escalada para `admin` não é possível pelo cliente.
- **Injeção no banco:** todos os valores que vão para a URL do PostgREST passam por `encodeURIComponent`, e o username é validado antes de entrar em `ilike`.
- **Edge Function sincronizada** com `src/utils` e `src/shared` (sem divergência).

## Fontes

Todas lidas em 14/10/2026; os trechos entre aspas foram conferidos literalmente no texto da página.

- [Content Security Policy, web.dev](https://web.dev/articles/csp): o CSP "lets you create an allowlist of sources of trusted content"; usado em S-04.
- [Security headers quick reference, web.dev](https://web.dev/articles/security-headers): CSP, `frame-ancestors`, `X-Content-Type-Options`, HSTS; usado em S-04.
- [API key best practices, Google Cloud](https://cloud.google.com/docs/authentication/api-keys-best-practices): chaves expostas, restrição, rotação e "Don't include API keys in client code or commit them to code repositories"; usado em S-01.
- [Firebase API keys](https://firebase.google.com/docs/projects/api-keys): chaves do Firebase restritas "do not need to be treated as secrets"; para as outras APIs do Google, chaves separadas e restritas; usado em S-01.
- [Rate-limiting strategies, Google Cloud](https://cloud.google.com/architecture/rate-limiting-strategies-techniques): usado em S-03.
- [Secret Manager best practices, Google Cloud](https://cloud.google.com/secret-manager/docs/best-practices): "Periodically rotate your secrets" para limitar o impacto de um segredo vazado; usado em S-01.

## Plano de correção, por quinta

**Hoje, você (não depende de deploy):** revogar a chave do Google do histórico (S-01) e conferir os painéis (abaixo).

**Quinta 15/10, na publicação:**
1. Publicar a Edge Function (traz S-02, S-03, S-07, S-09 e S-12) e, na mesma janela, apagar da função `pacienteDdxNota.js` e `pacienteDdxGabarito.js`.
2. Publicar o site (traz S-04 em `Report-Only`, S-05 e S-15).
3. No site publicado: abrir o console, entrar com o Google e com e-mail e procurar avisos `[Report Only]` do CSP. Sem avisos, trocar `Content-Security-Policy-Report-Only` por `Content-Security-Policy` numa quinta seguinte.
4. Conferir que o hub do DDX abre para o administrador (a entrada antiga do piloto fica de fora sem quebrar a tela).

**Quinta 22/10, junto do design web:** cruzadinha emitida pelo servidor (S-02 e S-14), gabarito fora do pacote (S-05, decidido com o app offline), S-06, o restante da S-08 e o índice único de username.

**Decisões suas:** plano pago do Supabase para a proteção de senhas vazadas (S-07), arquivar o Apps Script (S-11), prazo para desligar o Firebase (S-10), nome real ou apelido no ranking (S-08, LGPD), conteúdo da Batalha no pacote (S-05).

### Verificar no painel (só você alcança)

- **Google Cloud:** a chave do S-01 (revogar), as restrições da chave web do Firebase e o uso e a cobrança dos últimos meses.
- **Firebase:** "criar conta" ligado? Login anônimo ligado? Regras do Storage.
- **Supabase Auth:** reautenticação para trocar a senha, mínimo de senha, login anônimo e confirmação de e-mail no cadastro.
- **Apps Script:** a implantação ainda está como "Qualquer pessoa"?

## Comparação com a auditoria independente

O agente independente leu o repositório **sem ver** esta auditoria. Resultado: 17 achados, nenhum crítico.

- **Os dois acharam (maior confiança):** a cruzadinha forjável (S-02), a falta de limite de frequência (S-03), os cabeçalhos (S-04), a troca de senha (S-07), o custo e o nome real no ranking (S-08), o Firebase legado (S-10), o Apps Script (S-11) e os links de fonte (S-15).
- **Só o agente achou:** os gabaritos e casos não revisados no pacote (S-05), o pré-sequestro por aprovação de migração (S-06), o cadastro sem validação (S-09), os erros internos (S-12), o CORS e a rota de IA (S-13), o crescimento de dados (S-14) e o alcance das dependências (S-16). Eu conferi o S-05 e o S-16 no `dist/`.
- **Só a equipe achou:** a chave do Google no histórico público (S-01). O agente procurou no histórico e achou só a chave web do Firebase; **a chave do Gemini passou despercebida** e eu a confirmei lendo os commits (4 commits, chamada a `generativelanguage.googleapis.com`).
- **Onde o agente corrigiu a equipe:** o rascunho dizia que o banco do Quiz e do V ou M ia no pacote do site. Não vai (conferido no `dist/`): o problema é dos outros quatro modos.
- **Limites dos dois:** nenhum dos dois viu os painéis do Supabase, do Firebase, do Google Cloud e do Apps Script, nem testou com conta real. Os itens marcados "verificar no painel" dependem disso.
