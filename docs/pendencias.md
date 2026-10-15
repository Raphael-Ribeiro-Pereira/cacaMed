# Pendências: lista mestra

Atualizada em **13/10/2026**, na arrumação dos documentos. É o ponto de partida para retomar o trabalho e **vale sobre qualquer outro documento**. Índice geral no [[Inicio|Início]]; o DDX vigente está em [[ddx|DDX]]; o que saiu de uso está no [[historico/Histórico|Histórico]]. O [cronograma](cronograma-recuperacao-caca-med.md) guarda o histórico das decisões.

Legenda: **[U]** com o usuário, **[A]** com o agente, **[U+A]** precisa dos dois.

## 1. Retomar o trabalho

- **Código:** tudo está no GitHub, `Raphael-Ribeiro-Pereira/cacaMed`, branch `main`. A pasta de trabalho atual é `/home/raphael/Documents/cacaMed` (Linux). As pastas antigas no Windows (`C:\Users\Rapha\Documents\cacaMed` e o worktree `game-prototyping-c1a9d2`) ficaram para trás.
- **Cofre do Obsidian:** a pasta `docs/`. Todo documento novo entra num índice com link `[[...]]`.
- **Em outra máquina:**
  1. `git clone` do repositório e `npm ci`.
  2. Copie `.env.example` para `.env.local` e preencha os valores. As chaves **não estão no Git**: pegue no console do Firebase, no painel do Supabase (URL e chave publicável) e na Vercel. Para o modo atual, `VITE_FONTE_DADOS=supabase` e `VITE_AUTH_SUPABASE=true`.
  3. `npm run dev` abre o app; `homologacao.html` abre o ambiente de testes com dados fictícios; `npm test`, `npm run lint` e `npm run build -- --configLoader runner` conferem tudo.
- **Mexeu em regras compartilhadas (`src/utils`, `src/shared`)?** Rode `node scripts/sincronizar-supabase.mjs`: ele copia os arquivos para `supabase/functions/cacamed-api`, e um teste compara as cópias.
- **Publicar** (sempre manual; o deploy automático da Vercel está desligado de propósito):
  - API: publicar os 24 arquivos de `supabase/functions/cacamed-api` na função `cacamed-api` (feito até agora pelo conector do Supabase; a CLI do Supabase não está instalada), depois conferir os arquivos publicados contra os locais.
  - Frontend: deploy de produção na Vercel a partir do commit da `main`, e conferir o site.
  - Registrar cada deploy e o ponto de volta nos docs.
- **Convenções:** commits no padrão [Conventional Commits](guia_conventional_commits.md); nenhuma chave real no Git nem nos docs.
- **Protótipo de movimento em risco:** o projeto do protótipo (`cacomed-v2`, usado como referência de design) está só numa pasta temporária desta máquina, fora do repositório. Falta decidir se ele entra no Git (ver decisão 8).
- **Arquivo local não versionado:** `.claude/launch.json` (configurações dos servidores de teste) não está no Git e aponta para essa pasta temporária.

## 2. Estado de produção (09/10/2026)

| Item | Estado |
| --- | --- |
| Site | https://caca-med.vercel.app, deploy `dpl_GCgrwufvuGTgMoJLs5xcyAvgLzPx` (commit `75a82fa`) |
| Código ainda **não publicado** (deploy às quintas) | **Cadastro com código do e-mail** (15/10/2026, [[cadastro-com-codigo|detalhes]]): tela de cadastro só com nome, e-mail e senha; código de 6 números com a animação escolhida; Cadastro 2.0 com etapa, "não sou de Medicina", faculdade (lista do INEP) e 18 matérias. Mexe na API (`cadastrar` e `utils/curso.js` novo) e no site. **Adiado pelo usuário em 15/10** (o Supabase só libera o modelo do e-mail com SMTP próprio; tarefa 10 da seção 4). **Cruzadinha** (15/10/2026, [[cruzadinha-palavras-e-dicas|detalhes]]): dicas sem IA e memória das palavras respondidas; mexe na API (`registrarPartida` e `utils/memoriaPalavras.js` novo) e no site. **Atenção:** os dois estão na `main`; publicar a cruzadinha sem o cadastro com código exige separar os dois antes da quinta. O resto da `main` até `bcbb482` foi publicado em 15/10 |
| Publicação de 15/10/2026 | Migrações `ranking_so_username` e `limites_perfil_e_username` aplicadas no banco. API `cacamed-api` **v15** (publicada pela CLI do Supabase, 24 arquivos, sem os dois do Paciente DDX; ranking, coroas e palavras 200, POST sem login 401). Frontend `dpl_Ak8wHt3EzusRgHXh4ZPKoy3nsjNu` (commit `bcbb482`). Ponto de volta do frontend: `dpl_GCgrwufvuGTgMoJLs5xcyAvgLzPx` |
| API | Edge Function `cacamed-api`, **versão 14**, no projeto Supabase `lruzndfqfivlvcckvgbw` (São Paulo, plano Free). Inclui a correção da senha no cadastro Google e a aprovação de migração |
| Vercel | equipe `team_nkI26shDp4jqQSE5MaIZduEE`, projeto `prj_XAluhsTRRiiEuiGabCvqNzaVrWsv` |
| Voltar o site | promover `dpl_C3Ni3PRx3askHXKa7Wrmbnv9hsPa` (commit `9a7396a`); a API v14 é compatível |
| Contas | 7 usuários no Supabase Auth e 6 perfis de jogadores, **todos vinculados** ao Supabase (nenhum só no Firebase). A conta de teste `gfire0009@gmail.com` está confirmada e **sem perfil** |
| Firebase | ponte ainda ativa (ver item 6 da seção 6) |
| App instalável (PWA) | publicado em 07/10/2026; falta teste em aparelho real |

Registros: [PWA](app-instalavel.md), [cadastro Google e e-mail](historico/registros/incidente-cadastro-google.md), [migração de contas](migracao-supabase.md#contas-firebase-com-e-mail-não-verificado-08102026).

## 3. Decisões que dependem do usuário

**Respondidas em 13/10/2026** (detalhe no [cronograma](cronograma-recuperacao-caca-med.md#decisões-de-13102026--ddx-completo-e-liberado-na-quinta-1510)):
- **DDX liberado na quinta 15/10**, com a cara nova. Metas: 25 Plantão, 25 Erro médico e 50 Causa e efeito, que são meta e não obrigação. **Só a Batalha fica desligada** para jogadores.
- **Tempo = bônus de desempenho, sem cronômetro na tela.** Doses só quando a fonte brasileira citar a quantidade.
- **App:** offline primeiro; depois Capacitor x React Native; as duas lojas. Quinta de 22/10: design web.
- **O DDX tem 3 modos** (Plantão, Erro médico, Causa e efeito); a **Batalha não é DDX**. O **Paciente DDX foi fundido no Plantão** (confirmado): os 17 casos viraram `pdx-*` e o Plantão ficou com 33.
- B2 (os 3 no desenho novo), B5 (destinos: alta, UTI, encaminhamento, retorno/observação), B6 (**6 categorias** de falha: omissão, atraso, conduta inadequada, falha de registro, erro grande de medicação e erro lógico de causa e efeito) e B7 (casos independentes) respondidas.
- Ainda abertas, assumindo o recomendado: B1, B8, B9, A2, A3, A5, D e E do [questionário](decisoes-para-responder.md).


1. **Domínio para o e-mail do app** (cadastro e recuperação de senha). Sem ele, só a equipe do projeto recebe e-mail. `cacomed.com.br` e `cacamed.com.br` são só sugestões, sem disponibilidade consultada. Ver [proposta](proposta-email-autenticacao.md).
2. ~~**Liberar o DDX para o público**~~ **liberação decidida para 15/10** (a de 11/10, de adiar, foi trocada em 13/10). Histórico: adiado em 11/10. Antes, arrumar os modos, principalmente os casos, que hoje são poucos. Decidido: **um modo por vez, 15 casos por lote**, para a revisão não ficar grande. Plantão, Erro médico e Causa e efeito têm 1 caso cada; o Erro médico e o Causa e efeito dependem de um caso do Plantão (`casoId`), então a ordem é Plantão → Erro médico → Causa e efeito. O Paciente DDX tem 17.
3. **Silhueta no mapa da história:** forma real da doença escurecida (revela o tipo de agente) ou forma genérica até a descoberta.
4. **Botão "Pular" nas cutscenes** a partir da segunda vez: sim ou não.
5. **Itens da Batalha na Revisão:** entram nas cartas do Quiz, ganham carta própria ou deixam de ser gerados.
6. **Formato do pergaminho** (resumo da doença): confirmar ou ajustar a [tabela proposta](modo-historia-v2.md#pergaminho-resumo-da-doença).
7. **Modo bio:** só uma ideia (liga/desliga no Quiz e no V ou M para um modo de biologia direto). Falta definir conteúdo, regras e economia, depois das outras fases.
8. **Salvar o protótipo de movimento no repositório?** São cerca de 1 MB de código-fonte, sem as dependências. Sugestão: sim, numa pasta própria, para não depender de uma pasta temporária.
9. **Cruzadinha: o que fazer quando as palavras do tópico acabam** (pedido de 15/10/2026). Hoje, provisoriamente, as respondidas há mais tempo voltam primeiro; no Digestório isso acontece na 5ª grade. Ideias na [[cruzadinha-palavras-e-dicas#Pendência: quando as palavras do tópico acabam|doc]].
9. **Publicar o frontend** (decidido em 11/10/2026: **deploys sempre às quintas-feiras**, com confirmação no dia; nos outros dias, só arrumar o jogo) (só Vercel; a API v14 não muda): tela "Confirme seu e-mail", Cadastro 2.0 com as escolhas guardadas e texto da Batalha estilo Pokémon. Os três foram conferidos na homologação. O sorteio dos bancos separados também está na `main`, mas não muda nada até haver frases revisadas, e mora na API, que não precisa ser publicada agora.
10. **Firebase (15/10/2026):** travado pelo usuário em 14/10 (Firestore e Storage fechados, cadastro novo desligado, backup das contas feito). **Não apagar o projeto:** a credencial do login Google do Supabase foi criada nele. Mantê-lo sem custo, ou criar a credencial num projeto novo antes de apagar. Todas as contas vindas do Firebase já têm a senha no Supabase; o código que ainda aceita login do Firebase sai depois da publicação do site novo ([[seguranca|S-10]]).
11. ~~Fontes do lote `vm-lote-001`~~ **resolvido** (11/10/2026): o agente refez o lote como `vm-lote-002`, com 40 conceitos e os trechos conferidos literalmente nas fontes ([dossiê](../content/review/vm-lote-002-fontes.md)). O prompt do ChatGPT passou a ter duas partes, fontes e depois frases, e `npm run content:fontes` confere os trechos.
12. ~~Mínimo para trocar o banco do V ou M~~ **ampliado para 40 conceitos revisados** (11/10/2026).
13. ~~Temas do V ou M e do Quiz~~ **por área ampla** (11/10/2026): lista fixa de 15 áreas em `TEMAS_TREINO`, conferida pelo validador e pelos testes. O Quiz e as 32 frases antigas também foram padronizados ([mapa](jogos-e-economia-v2.md#bancos-separados-quiz-e-verdade-ou-mentira-09102026)).
14. ~~Versionar o fluxo de conteúdo~~ **feito** (commit `d5c871b`, 11/10/2026).

## 4. Tarefas do usuário (fora do código)

1. ~~Revisão médica do lote `vm-lote-002`~~ **aprovada em 11/10/2026** e integrada ao banco ([dossiê](../content/review/vm-lote-002-fontes.md)).
2. **Revisão médica do lote 1 do Plantão** (15 casos): [dossiê com cada caso, pontos e fontes](../content/review/plantao-lote-001.md). Depois da aprovação, o agente integra os casos e faz a tela de escolha de caso (hoje a tela abre sempre o caso piloto).
3. **Rodar os prompts no ChatGPT** (opcional; o agente também faz os lotes) e trazer o JSON de volta:
   - [frases do Verdade ou mentira](prompts/prompt-vou-m-frases.md), agora em duas partes;
   - (o prompt do Paciente DDX foi aposentado; os casos do DDX são feitos pelo agente a partir das fontes lidas).
4. **Enviar os PDFs das fontes** que os novos casos citarem, para eu conferir as páginas.
5. **Revisão médica** do conteúdo novo e do que ainda está marcado como não revisado:
   - frases novas do V ou M e lotes novos do DDX;
   - as 12 doenças da Batalha (e, quando existir, o pergaminho de cada uma);
   - as marcações `grave` das condutas dos casos `pdx-*` do Plantão, que vieram do Paciente DDX (a [regra de erro grave](revisao-inteligente.md#o-que-é-erro-grave-no-paciente-ddx) já foi aprovada; faltam as marcações caso a caso);
   - explicações completas do Erro médico e do Plantão para a Revisão v2.
6. **Console do Firebase:** apagar a conta de login `gfire0009@gmail.com` (o perfil dela no Supabase já foi apagado) e conferir a lista de usuários, para achar quem criou conta mas nunca terminou o cadastro (essas contas não aparecem no banco).
7. **Testar em aparelho real** (iPhone e Android) seguindo o [roteiro](roteiro-smartphone.md): instalar o app, entrar com a conta real e jogar uma cruzadinha. Depois, testar o cadastro por e-mail de ponta a ponta (a conta de teste `gfire0009` já está confirmada: ao entrar, ela cai no Cadastro 2.0).
8. **E-mail próprio (quando houver domínio):** registrar o domínio, criar a conta no Resend e colar a credencial **você mesmo** no painel do Supabase (a credencial não passa pelo chat).
9. **Acessibilidade** (opcional): foco, leitor de tela e zoom de 200% nas telas principais.
10. **Painel do Supabase, antes de publicar o cadastro com código:** primeiro o e-mail próprio (tarefa 8, ou a ponte com um Gmail só do jogo), porque sem SMTP próprio o Supabase trava a edição dos modelos (visto em 15/10). Depois, em Authentication → Emails → "Confirm signup", colar o modelo com `{{ .Token }}`; em Authentication → Providers → Email, conferir "Email OTP Length" = 6. Passo a passo e modelo pronto em [[cadastro-com-codigo#Antes de publicar (painel do Supabase, só o usuário)|Cadastro com código]].

## 5. Trabalho do agente, na ordem decidida

Detalhe e caixas de seleção no [cronograma de 09/10](cronograma-recuperacao-caca-med.md#plano-de-09102026--cadastro-bancos-separados-batalha-e-ddx-público) e no [de 07/10](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

1. **Cadastro:** ~~tela de confirmação e Cadastro 2.0 com as escolhas guardadas~~ publicados em 15/10. **Cadastro com código** feito na `main` em 15/10 ([[cadastro-com-codigo|detalhes]]): publicar depois da tarefa 10 da seção 4; depois, editar etapa, faculdade e matéria no perfil. Configurar o e-mail próprio quando houver domínio.
2. **Ajustes rápidos:**
   - bancos separados do Quiz e do V ou M ([regra](jogos-e-economia-v2.md#bancos-separados-quiz-e-verdade-ou-mentira-09102026)): sorteio pronto e testado; lote `vm-lote-002` pronto para a revisão médica (11/10). Depois da aprovação: integrar com `revisado: true` e publicar numa quinta;
   - ~~texto da Batalha estilo Pokémon~~: feito na `main` em 10/10, falta publicar ([especificação](modo-historia-v2.md#texto-da-batalha-estilo-pokémon)).
3. **Mais casos nos modos** (prioridade decidida em 11/10/2026, antes de liberar o DDX): um modo por vez, 15 casos por lote, com o mesmo método do V ou M (fontes lidas e trechos conferidos).
   - **Plantão:** lote 1 aprovado e integrado; 33 casos no banco (piloto, lote 1 e os 17 `pdx-*`).
   - Corrigido no motor (11/10/2026, falta publicar a API): a alta indevida num caso que pedia encaminhamento rendia mais XP que o encaminhamento correto. Agora a alta indevida desconta 80, o encaminhamento desnecessário 20 e o destino certo nada; o piloto não muda.
   - **Erro médico:** lote 1 (10) e lote 2 (17) aguardando revisão: [dossiê 1](../content/review/erro-lote-001.md) e [dossiê 2](../content/review/erro-lote-002.md).
   - **Causa e efeito:** lotes 1 a 3 (14 + 9 + 12) aguardando revisão: [1](../content/review/causa-lote-001.md), [2](../content/review/causa-lote-002.md) e [3](../content/review/causa-lote-003.md). Com o piloto são 36; para chegar a 50 falta um lote 4, que é opcional.
   - **Remoção do Paciente DDX (13/10, na `main`):** saíram a tela, o motor, a ação `concluirCasoPaciente` e os arquivos `pacienteDdxNota.js` e `pacienteDdxGabarito.js` da função. **Ao publicar a API, apague esses dois arquivos da função `cacamed-api` também.** Ficaram `pacienteDdxConteudo.js` (origem dos casos `pdx-*`) e o rótulo "Paciente DDX" nas Estatísticas, por causa dos recibos antigos.
   - **Liberar na quinta 15/10:** integrar o aprovado (`integrar-ddx.mjs`), sincronizar com o Supabase, testar com conta comum, rodar testes, lint e build e publicar com o "sim" do usuário. Ponto de volta da Vercel: `dpl_GCgrwufvuGTgMoJLs5xcyAvgLzPx`. Detalhe em [[ddx|DDX]].
4. **Economia v3** ([especificação](economia-v3.md)): 100 XP fixos nos jogos, bônus de tempo escondido, ofensiva de login, 4 missões novas por dia, DDX com 300 XP, Batalha com 500 XP, tickets sem saldo negativo, `VERSAO_ECONOMIA = 3`.
5. **Revisão Inteligente v2** ([especificação](revisao-inteligente.md)): quatro cartas, sessões de 7 itens, erro grave no Paciente DDX, liberação no nível 10, +40 XP por item dominado, explicações da LLM.
6. **Modo história v2 da Batalha** ([especificação](modo-historia-v2.md)): protótipos (mapa, cutscene de entrada, transição) → aprovação → porte; 5 cutscenes de transmissão; pergaminho; enciclopédia.
7. **App offline** ([especificação](app-offline.md)).
8. **Modo bio**, por último.

## 6. Arrumação técnica

0. **Segurança (14/10/2026):** [[seguranca|auditoria completa]] com 16 achados. **Do usuário:** revogar a chave do Google do histórico do GitHub (S-01) e conferir os painéis (lista na doc). **Do agente, já na `main`:** casos não revisados fora do pacote do site, cabeçalhos (CSP em `Report-Only`), limite de frequência, contenção da cruzadinha, senha de 8 caracteres, cadastro validado, erros internos escondidos e links só `https`. O andamento de cada item está na [[seguranca#Andamento (14/10/2026)|tabela de andamento]].

1. ~~**Dicas de IA da cruzadinha quebradas em produção**~~ **resolvido na `main` em 15/10/2026, falta publicar:** as dicas saem do banco, sem IA, e a grade lembra as palavras já respondidas ([[cruzadinha-palavras-e-dicas|detalhes]]). A Revisão v2 ainda precisa de uma rota de IA no servidor, se mantiver a explicação da LLM.
2. ~~Limpeza de CSS~~ **feita em 13/10/2026 na `main`**: um script achou as classes sem uso em `src/index.css` (410 → 160 linhas, quase tudo do visual antigo `stitch-*` e `treino-*`) e em `src/prototipo.css` (1.705 → 1.524 linhas). Sobraram só as classes `stitch-page`, `stitch-loading`, `stitch-primary`, `stitch-integrated` e `stitch-auth` (telas de carregamento, login Google e admin) e as variáveis `--stitch-*`. Conferido no build e nas telas da homologação; vale uma passada visual no celular antes de publicar.
3. ~~Apagar `StitchBrand.jsx` e os estilos `stitch-header` e `stitch-brand`~~ **feito** em 13/10/2026.
4. **Teste que falha há tempos:** "artefato Apps Script é idêntico ao motor do navegador" (diferença de quebra de linha). Não vem das mudanças recentes. Consertar ou aposentar junto com o Apps Script.
5. **Segurança das dependências:** a auditoria de 30/09 apontou 15 vulnerabilidades em dependências (duas críticas, transitivas). Reavaliar com `npm audit`.
6. **Retirar o Firebase:** depois da decisão 10, remover o fallback Firebase do frontend e a aceitação de tokens legados na API, publicar, testar e só então desligar o serviço. Preservar backup. Ver [reconciliação](historico/registros/reconciliacao-producao-2026-09-30.md).
7. **Apps Script e planilhas:** reavaliar se ainda servem como fonte de retorno ou podem ser desligados.
8. **Desempenho:** aviso de bundle acima de 500 kB; medir abertura a frio no celular e carga com usuários distintos (precisa de contas de teste).
9. ~~**Cadastro:** o Cadastro 2.0 pede título e matéria de novo depois da confirmação do e-mail.~~ Resolvido em 10/10/2026 (falta publicar).

## 7. Backlog histórico: triagem necessária

Os blocos antigos do [cronograma](cronograma-recuperacao-caca-med.md) (do plano de 24/09 e de 27 a 30/09) ainda trazem caixas abertas. Muitas parecem superadas pelo código atual: o Hardcore só sobra como chaves antigas em `estatisticasClinicas.js` e `progressoCruzadinha.js` (limpeza pendente), a IA saiu do DDX (hoje só as dicas da cruzadinha chamam a OpenRouter), e o layout do Stitch foi trocado pelo protótipo de movimento. **Mesmo assim, nenhuma delas foi conferida uma a uma nesta rodada.** Pedem uma passada de triagem; as que parecem ainda relevantes são:

- **Segurança:** rotacionar a chave exposta e conferir restrições e uso no provedor (item do plano de 24/09). Conferir se já foi feito.
- **Homologação com a conta administradora:** cruzadinha completa, XP e níveis, reset, relatório e ranking; teste com conta comum sem acesso administrativo.
- **Tutorial em conta realmente nova** e persistência depois de sair e entrar; falha de rede no salvamento com reenvio sem duplicar recompensa.
- **Cruzadinhas:** revisão clínica das dicas e respostas; o tópico Histologia–Matriz tem só 10 termos.
- **Plantão, Erro médico e Causa e efeito:** revisão clínica do caso respiratório piloto com a consultora.
- **Batalha diagnóstica:** conferir quais das "pendências para a entrevista de design" ainda estão abertas ([documento](ddx-batalha-diagnostica.md#pendências-para-a-entrevista-de-design)), por exemplo o nome definitivo do modo Duelo.
- **App mobile** (React Native com Expo, reaproveitando a camada JavaScript compartilhada): continua como meta de longo prazo.

## 8. Resolvido nesta rodada (para não reabrir)

- Cadastro com Google parava em "Entre novamente na conta": corrigido e publicado (API v13, depois v14) em 07 e 08/10.
- Cadastro por e-mail parecia cancelar: era só a tela; corrigida em 09/10 (falta publicar).
- Conta da Caroline migrada para o Supabase com os dados preservados; migração por aprovação do administrador criada (API v14).
- Conta `gfire0009@gmail.com` apagada do Supabase, com cópia de segurança (a conta de login no Firebase continua).
- "A Batalha não aparece no PC": não era defeito, a conta de teste não era administradora.
- Decisões fechadas e documentadas: [economia v3](economia-v3.md), [Revisão v2](revisao-inteligente.md), [app offline](app-offline.md) e [modo história v2](modo-historia-v2.md).
