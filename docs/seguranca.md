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

| ID | Gravidade | Achado | Onde | Esforço |
| --- | --- | --- | --- | --- |
| S-01 | **Crítica** | Chave de API do Google escrita no código, no histórico **público** do GitHub | `motorDDX.js` e `Jogo.jsx` (histórico) | Você + 30 min |
| S-02 | **Alta** | Qualquer jogador cria XP e tickets à vontade pela cruzadinha | `operarJogosSupabase.js:9` | 1 dia |
| S-03 | **Alta** | Nenhum limite de frequência em nenhuma rota da API | `apiSupabase.js` | 0,5 dia |
| S-04 | **Alta** | Faltam cabeçalhos de segurança no site (CSP, anti-frame, nosniff) | `vercel.json` | 2 h |
| S-05 | Média | Senha mínima de 6 caracteres e proteção contra senhas vazadas desligada | `index.js:152`, Auth do Supabase | 30 min + decisão |
| S-06 | Média | Respostas e casos vão no pacote do navegador | `bancoTreinos.js`, `plantaoBanco.js` | Decisão de produto |
| S-07 | Média | Apps Script antigo ainda público, com regras antigas | `perfilPlanilha.js:5`, `rankingPublico.js:5` | Decisão |
| S-08 | Média | Duas identidades ao mesmo tempo (Firebase e Supabase) e regras do Firestore frouxas | `index.js:16`, `firestore.rules` | Decisão |
| S-09 | Baixa | `idPublico` do ranking é um hash sem sal | `index.js:97` e `:109` | 30 min |
| S-10 | Baixa | Link da fonte do caso sem checar `https` | `ErroMedico.jsx:67`, `CausaEfeito.jsx:71` | 30 min |
| S-11 | Info | 16 vulnerabilidades em dependências (2 críticas) | `package.json` | A analisar |

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
- **Como explorar:** um jogador logado envia, em laço, partidas com `palavras: 40`, `letras: 400`, `tempo: 0`, cada uma com um UUID novo. Cada uma rende cerca de 2.400 XP ou mais, 2 tickets e progresso de missões. O ranking é público, então basta isso para chegar ao topo. Os tickets pagam o DDX, o Quiz e a Batalha, e as chaves `chaveXP` novas incham o perfil do jogador.
- **Por que só aqui:** o Quiz, o V ou M, o DDX e a Batalha usam rodadas **emitidas pelo servidor**, e o XP sai das respostas conferidas no servidor. A cruzadinha é a exceção.
- **Correção:**
  1. A cruzadinha passa a ter início emitido pelo servidor (`iniciarCruzadinha` devolve um `partidaId` e as palavras sorteadas no servidor) e a conclusão manda só as respostas.
  2. Limites plausíveis: tempo mínimo por letra, no máximo N partidas por hora e teto de XP por dia.
  3. `chaveXP` só entre as chaves que existem no banco de palavras.
  4. Um teste que tente o laço acima e falhe.
- **Fonte:** o guia de segurança de aplicações do Google Cloud para OWASP e a regra de não confiar no cliente (ver [[seguranca#Fontes|Fontes]]).

### S-03 · Alta · Sem limite de frequência

- **Evidência:** `src/shared/apiSupabase.js` não conta requisições por jogador nem por IP. Testado na produção: `GET ?acao=ranking` responde 200 (1.398 bytes) sem login e dispara uma consulta no banco a cada chamada. `verificarUsername` diz se um nome existe, o que permite listar usernames. A função roda no plano Free do Supabase.
- **Como explorar:** inundar a API para derrubar o app (negação de serviço) ou esgotar a cota; listar todos os usernames; tentar senhas pela ação `migrarSenha`, que repassa o login ao Firebase (só para o e-mail do próprio token, o que limita o dano).
- **Fonte:** o Google Cloud explica que picos de carga podem vir de "malicious requests" e recomenda "rate-limiting mechanisms".
- **Correção:** contador por jogador (tabela com janela de tempo, ou o limitador do Supabase) nas ações de escrita e em `verificarUsername` e `migrarSenha`. Cache de alguns segundos do ranking e das coroas na própria função e `Cache-Control` público nesse `GET`. Considerar o Cloudflare ou o Vercel Firewall na frente.

### S-04 · Alta · Sem cabeçalhos de segurança

- **Evidência (testado na produção, `curl -I https://caca-med.vercel.app`):** só vêm o `strict-transport-security` e os cabeçalhos da Vercel. **Faltam:** `Content-Security-Policy`, `X-Frame-Options` ou `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`. O `vercel.json` só define cabeçalhos do `sw.js` e do manifest.
- **Como explorar:** sem CSP, qualquer falha de XSS rouba a sessão (o token fica no `sessionStorage`, legível por script). Sem anti-frame, outro site embute o app para enganar o clique (clickjacking).
- **Fontes (web.dev):** o CSP "provides an added layer to mitigate XSS attacks by restricting which scripts can be executed"; `frame-ancestors` "protects your site from clickjacking"; `X-Content-Type-Options: nosniff` é "recommended for all of your resources".
- **Correção:** acrescentar ao `vercel.json` os cabeçalhos abaixo, testar com o app e a homologação e só então publicar. O CSP precisa liberar o Supabase, o Firebase, o Google (login) e as fontes do Google Fonts. Começar em `Content-Security-Policy-Report-Only` e depois ativar.
  - `Content-Security-Policy` (restrito a `self` mais os domínios acima), com `frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` desligando câmera, microfone e geolocalização

### S-05 · Média · Senhas fracas

- **Evidência:** a API aceita senha de 6 a 4.096 caracteres (`index.js` e `migrarSenhaSupabase.js`). O relatório de segurança do Supabase (lido hoje) aponta `auth_leaked_password_protection`: a checagem contra o HaveIBeenPwned está **desligada**.
- **Correção:** subir o mínimo para 8 caracteres no frontend e no Supabase Auth. A proteção contra senhas vazadas pode exigir plano pago do Supabase; **não contratar sem decisão do usuário** (já anotado na [[historico/registros/auditoria-supabase-2026-09-30|homologação de 30/09]]).

### S-06 · Média · Respostas e casos no pacote do navegador

- **Evidência:** os bancos do Quiz e do V ou M (`bancoTreinos.js`), os casos do DDX e as relações vão no JavaScript do site, com os gabaritos. O servidor sorteia a rodada e confere as respostas, mas um robô lê o pacote e responde sempre certo.
- **Impacto:** a integridade do XP e do ranking, limitada pelos tickets. Para estudar, não há dano; para o ranking competitivo, há.
- **Correção:** depende do produto. Para a rede, mover os bancos para a função e entregar só a pergunta de cada rodada. **Isso entra em conflito com o plano do [[app-offline|app offline]]**, que precisa do conteúdo no aparelho. Decidir junto com o offline, por exemplo: o gabarito sai do pacote e o servidor valida quando houver rede.

### S-07 · Média · Apps Script antigo ainda público

- **Evidência:** `src/services/perfilPlanilha.js:5` e `src/services/rankingPublico.js:5` chamam uma implantação `script.google.com/macros/s/…/exec`. Código e regras antigas estão em [[historico/Histórico|`docs/historico/apps-script/`]]. Essa implantação é um segundo backend, com suas próprias regras.
- **Correção:** decidir se o app ainda precisa dele (a pendência 7 da arrumação técnica). Se não, desligar a implantação e remover os serviços do frontend; se sim, auditá-lo com o mesmo rigor (esta auditoria **não** leu o código do Apps Script a fundo).

### S-08 · Média · Duas identidades e as regras do Firestore

- **Evidência:** `index.js:16-37` aceita tokens do Firebase **e** do Supabase. As regras (`firestore.rules`) deixam o dono de `usuarios/{uid}` gravar qualquer campo do próprio documento, inclusive um `role` falso. Hoje a função lê o papel (`role`) do banco do Supabase, e não do Firestore, então isso não dá privilégio. Mas qualquer código futuro que confie no Firestore herdaria o buraco.
- **Correção:** concluir o desligamento do Firebase (critério já definido nas [[pendencias|Pendências]], item 10) ou, até lá, trocar as regras por `allow read, write: if false` no que o app não usa mais.

### S-09 · Baixa · `idPublico` sem sal

`ranking()` e `coroas()` (`index.js:97` e `:109`) publicam o SHA-256 do `player_id`. Quem já conhece um `uid` do Firebase confirma se ele está no ranking. Correção: HMAC com um segredo do servidor, em vez de SHA-256 puro.

### S-10 · Baixa · Links de fonte

`ErroMedico.jsx:67` e `CausaEfeito.jsx:71` abrem `href={…fonte}` sem checar o protocolo (o Plantão já checa `https?:`). O conteúdo é nosso, mas um item com `javascript:` viraria XSS. Correção: validar `https:` no validador de conteúdo e no componente.

### S-11 · Informativo · Dependências

`npm audit` aponta 16 vulnerabilidades (1 baixa, 3 moderadas, 10 altas e 2 críticas). A análise de **alcance** (o que roda no navegador ou na função, e não só no desenvolvimento) está na [[seguranca#Comparação com a auditoria independente|comparação]] e numa tarefa à parte.

## O que foi conferido e está bem

- **Banco:** as 3 tabelas têm RLS ligado e acesso direto revogado para `anon` e `authenticated`; só a função (`service_role`) lê e grava. O relatório de segurança do Supabase só aponta `rls_enabled_no_policy` como informação, e é intencional. A `cacamed_commit` revoga a execução para o público.
- **Identidade:** o token do Firebase é verificado com chave pública, `issuer`, `audience` e algoritmo RS256 (`index.js:19-23`). O do Supabase passa por `auth.getUser`. Testado: POST sem token, com token lixo e com origem estranha respondem 401 e 403.
- **Autorização:** o papel `admin` só vem do banco e é conferido no servidor (`executarPedidoSupabase.js`); o cadastro sempre cria `jogador`. A homologação é restrita ao administrador.
- **Servidor como fonte da verdade:** Quiz, V ou M, Revisão, Plantão, Erro médico, Causa e efeito e Batalha usam rodadas emitidas pelo servidor, e o XP é recalculado ali. A data usada é a do servidor.
- **Idempotência:** recibos por `event_id` e versão do perfil na gravação (`cacamed_commit`) evitam XP duplicado e corrida entre abas.
- **Corpo da requisição** limitado a 32 kB; **CORS** com lista fixa de origens.
- **Frontend:** sem `dangerouslySetInnerHTML`, `eval` ou `innerHTML`; token da sessão no `sessionStorage`; links externos com `rel="noreferrer"`. O service worker não guarda a API.
- **Segredos:** `.env` está no `.gitignore` e só o `.env.example` (sem valores) é versionado.

## Fontes

Todas lidas em 14/10/2026; os trechos entre aspas foram conferidos literalmente no texto da página.

- [Content Security Policy, web.dev](https://web.dev/articles/csp): o CSP "lets you create an allowlist of sources of trusted content"; usado em S-04.
- [Security headers quick reference, web.dev](https://web.dev/articles/security-headers): CSP, `frame-ancestors`, `X-Content-Type-Options`, HSTS; usado em S-04.
- [API key best practices, Google Cloud](https://cloud.google.com/docs/authentication/api-keys-best-practices): chaves expostas, restrição, rotação e "Don't include API keys in client code or commit them to code repositories"; usado em S-01.
- [Firebase API keys](https://firebase.google.com/docs/projects/api-keys): chaves do Firebase restritas "do not need to be treated as secrets"; para as outras APIs do Google, chaves separadas e restritas; usado em S-01.
- [Rate-limiting strategies, Google Cloud](https://cloud.google.com/architecture/rate-limiting-strategies-techniques): usado em S-03.
- [Secret Manager best practices, Google Cloud](https://cloud.google.com/secret-manager/docs/best-practices): "Periodically rotate your secrets" para limitar o impacto de um segredo vazado; usado em S-01.

## Plano de correção, por quinta

1. **Hoje (você):** revogar a chave do Google (S-01). Não depende de deploy.
2. **Na `main` antes da quinta 15/10:** cabeçalhos em modo `Report-Only` (S-04), limite de frequência (S-03), validações de S-09 e S-10. A cruzadinha (S-02) é a maior e pode ficar para a quinta de 22/10, e até lá dá para reduzir o estrago baixando os limites de `palavras` e `letras` e exigindo `tempo` plausível.
3. **Decisões suas:** S-05 (plano pago), S-06 (junto do app offline), S-07 e S-08 (desligar o Apps Script e o Firebase).
4. **Depois:** CSP ativo, verificador de segredos no commit e uma nova rodada desta auditoria.

## Comparação com a auditoria independente

*(a preencher quando o segundo agente terminar)*
