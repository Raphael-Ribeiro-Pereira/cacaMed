# Pendências: lista mestra

Atualizada em **09/10/2026**, antes de uma viagem do usuário. É o ponto de partida para retomar o trabalho. O detalhe de cada fase está no [cronograma](cronograma-recuperacao-caca-med.md) (blocos de 09/10 e de 07/10), e a lista abaixo aponta para ele. Quando esta lista e um bloco antigo do cronograma discordarem, **vale esta lista**.

Legenda: **[U]** com o usuário, **[A]** com o agente, **[U+A]** precisa dos dois.

## 1. Retomar o trabalho

- **Código:** tudo está no GitHub, `Raphael-Ribeiro-Pereira/cacaMed`, branch `main`. A pasta de trabalho é `C:\Users\Rapha\Documents\cacaMed\.claude\worktrees\game-prototyping-c1a9d2` (branch `claude/game-prototyping-c1a9d2`, igual à `main`).
- **Atenção:** o checkout principal (`C:\Users\Rapha\Documents\cacaMed`) está **desatualizado** (commit `fe9a83e`). Rode `git pull` nele antes de trabalhar lá. Ele tem o `.env` com as chaves; a pasta de trabalho acima **não tem `.env`**, por isso a página de homologação mostra um erro de Firebase no console. É esperado e não afeta os testes.
- **Em outra máquina:**
  1. `git clone` do repositório e `npm ci`.
  2. Copie `.env.example` para `.env.local` e preencha os valores. As chaves **não estão no Git**: pegue no console do Firebase, no painel do Supabase (URL e chave publicável) e na Vercel. Para o modo atual, `VITE_FONTE_DADOS=supabase` e `VITE_AUTH_SUPABASE=true`.
  3. `npm run dev` abre o app; `homologacao.html` abre o ambiente de testes com dados fictícios; `npm test`, `npm run lint` e `npm run build -- --configLoader runner` conferem tudo.
- **Mexeu em regras compartilhadas (`src/utils`, `src/shared`)?** Rode `node scripts/sincronizar-supabase.mjs`: ele copia os arquivos para `supabase/functions/cacamed-api`, e um teste compara as cópias.
- **Publicar** (sempre manual; o deploy automático da Vercel está desligado de propósito):
  - API: publicar os 23 arquivos de `supabase/functions/cacamed-api` na função `cacamed-api` (feito até agora pelo conector do Supabase; a CLI do Supabase não está instalada), depois conferir os arquivos publicados contra os locais.
  - Frontend: deploy de produção na Vercel a partir do commit da `main`, e conferir o site.
  - Registrar cada deploy e o ponto de volta nos docs.
- **Convenções:** commits no padrão [Conventional Commits](guia_conventional_commits.md); nenhuma chave real no Git nem nos docs.
- **Protótipo de movimento em risco:** o projeto do protótipo (`cacomed-v2`, usado como referência de design) está só numa pasta temporária desta máquina, fora do repositório. Falta decidir se ele entra no Git (ver decisão 8).
- **Arquivo local não versionado:** `.claude/launch.json` (configurações dos servidores de teste) não está no Git e aponta para essa pasta temporária.

## 2. Estado de produção (09/10/2026)

| Item | Estado |
| --- | --- |
| Site | https://caca-med.vercel.app, deploy `dpl_GCgrwufvuGTgMoJLs5xcyAvgLzPx` (commit `75a82fa`) |
| Código ainda **não publicado** | tela "Confirme seu e-mail" do cadastro por e-mail (commit `824c8e2` na `main`) |
| API | Edge Function `cacamed-api`, **versão 14**, no projeto Supabase `lruzndfqfivlvcckvgbw` (São Paulo, plano Free). Inclui a correção da senha no cadastro Google e a aprovação de migração |
| Vercel | equipe `team_nkI26shDp4jqQSE5MaIZduEE`, projeto `prj_XAluhsTRRiiEuiGabCvqNzaVrWsv` |
| Voltar o site | promover `dpl_C3Ni3PRx3askHXKa7Wrmbnv9hsPa` (commit `9a7396a`); a API v14 é compatível |
| Contas | 7 usuários no Supabase Auth e 6 perfis de jogadores, **todos vinculados** ao Supabase (nenhum só no Firebase). A conta de teste `gfire0009@gmail.com` está confirmada e **sem perfil** |
| Firebase | ponte ainda ativa (ver item 6 da seção 6) |
| App instalável (PWA) | publicado em 07/10/2026; falta teste em aparelho real |

Registros: [PWA](app-instalavel.md), [cadastro Google e e-mail](incidente-cadastro-google.md), [migração de contas](migracao-supabase.md#contas-firebase-com-e-mail-não-verificado-08102026).

## 3. Decisões que dependem do usuário

1. **Domínio para o e-mail do app** (cadastro e recuperação de senha). Sem ele, só a equipe do projeto recebe e-mail. `cacomed.com.br` e `cacamed.com.br` são só sugestões, sem disponibilidade consultada. Ver [proposta](proposta-email-autenticacao.md).
2. **Liberar o DDX para o público:** confirmar a lista (Plantão, Erro médico, Causa e efeito, Paciente DDX; e a Batalha?) e se libera **antes ou depois da economia v3**. O usuário já disse que validou o conteúdo que existe.
3. **Silhueta no mapa da história:** forma real da doença escurecida (revela o tipo de agente) ou forma genérica até a descoberta.
4. **Botão "Pular" nas cutscenes** a partir da segunda vez: sim ou não.
5. **Itens da Batalha na Revisão:** entram nas cartas do Quiz, ganham carta própria ou deixam de ser gerados.
6. **Formato do pergaminho** (resumo da doença): confirmar ou ajustar a [tabela proposta](modo-historia-v2.md#pergaminho-resumo-da-doença).
7. **Modo bio:** só uma ideia (liga/desliga no Quiz e no V ou M para um modo de biologia direto). Falta definir conteúdo, regras e economia, depois das outras fases.
8. **Salvar o protótipo de movimento no repositório?** São cerca de 1 MB de código-fonte, sem as dependências. Sugestão: sim, numa pasta própria, para não depender de uma pasta temporária.
9. **Publicar a tela nova do cadastro por e-mail** (já testada na homologação).
10. **Quando desligar o Firebase.** Hoje nenhuma conta do jogo depende só dele. Critério já registrado: sete dias estáveis, cadastro, recuperação e logout públicos testados, fallback removido do código **antes** de desligar o serviço. Sem data automática.

## 4. Tarefas do usuário (fora do código)

1. **Rodar os prompts no ChatGPT** e trazer o JSON de volta:
   - [frases do Verdade ou mentira](prompts/prompt-vou-m-frases.md) (40 conceitos por lote);
   - [casos do Paciente DDX](prompts/prompt-paciente-ddx-casos.md) (de 4 a 6 por conversa).
2. **Enviar os PDFs das fontes** que os novos casos citarem, para eu conferir as páginas.
3. **Revisão médica** do conteúdo novo e do que ainda está marcado como não revisado:
   - frases novas do V ou M e casos novos do Paciente DDX;
   - as 12 doenças da Batalha (e, quando existir, o pergaminho de cada uma);
   - as marcações `grave` das condutas do Paciente DDX (a [regra de erro grave](revisao-inteligente.md#o-que-é-erro-grave-no-paciente-ddx) já foi aprovada; faltam as marcações caso a caso);
   - explicações completas do Erro médico e do Paciente DDX para a Revisão v2.
4. **Console do Firebase:** apagar a conta de login `gfire0009@gmail.com` (o perfil dela no Supabase já foi apagado) e conferir a lista de usuários, para achar quem criou conta mas nunca terminou o cadastro (essas contas não aparecem no banco).
5. **Testar em aparelho real** (iPhone e Android) seguindo o [roteiro](roteiro-smartphone.md): instalar o app, entrar com a conta real e jogar uma cruzadinha. Depois, testar o cadastro por e-mail de ponta a ponta (a conta de teste `gfire0009` já está confirmada: ao entrar, ela cai no Cadastro 2.0).
6. **E-mail próprio (quando houver domínio):** registrar o domínio, criar a conta no Resend e colar a credencial **você mesmo** no painel do Supabase (a credencial não passa pelo chat).
7. **Acessibilidade** (opcional): foco, leitor de tela e zoom de 200% nas telas principais.

## 5. Trabalho do agente, na ordem decidida

Detalhe e caixas de seleção no [cronograma de 09/10](cronograma-recuperacao-caca-med.md#plano-de-09102026--cadastro-bancos-separados-batalha-e-ddx-público) e no [de 07/10](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

1. **Cadastro:** publicar a tela de confirmação; guardar título e matéria já escolhidos para o Cadastro 2.0; configurar o e-mail próprio quando houver domínio.
2. **Ajustes rápidos:**
   - bancos separados do Quiz e do V ou M ([regra](jogos-e-economia-v2.md#bancos-separados-quiz-e-verdade-ou-mentira-09102026)), validando o JSON do ChatGPT e checando duplicatas;
   - texto da Batalha estilo Pokémon ([especificação](modo-historia-v2.md#texto-da-batalha-estilo-pokémon)).
3. **DDX para o público:** liberar o conteúdo validado (marcar `revisado`, tirar a restrição de administrador, ajustar o teste que exige `revisado: false` nos 17 casos, publicar) e incorporar os casos novos depois da conferência.
4. **Economia v3** ([especificação](economia-v3.md)): 100 XP fixos nos jogos, bônus de tempo escondido, ofensiva de login, 4 missões novas por dia, DDX com 300 XP, Batalha com 500 XP, tickets sem saldo negativo, `VERSAO_ECONOMIA = 3`.
5. **Revisão Inteligente v2** ([especificação](revisao-inteligente.md)): quatro cartas, sessões de 7 itens, erro grave no Paciente DDX, liberação no nível 10, +40 XP por item dominado, explicações da LLM.
6. **Modo história v2 da Batalha** ([especificação](modo-historia-v2.md)): protótipos (mapa, cutscene de entrada, transição) → aprovação → porte; 5 cutscenes de transmissão; pergaminho; enciclopédia.
7. **App offline** ([especificação](app-offline.md)).
8. **Modo bio**, por último.

## 6. Arrumação técnica

1. **Dicas de IA da cruzadinha quebradas em produção:** a rota `/api/ia` só existe no servidor local (responde 404 no site). Mover a chamada à OpenRouter para a Edge Function, com a chave nos segredos do Supabase. A Revisão v2 usa a mesma rota.
2. **Limpeza de CSS** (commit `4c7f0b8` na branch `claude/vigorous-vaughan-957477`, **não enviado ao GitHub nem na `main`**): remove estilos sem uso e reduz `src/index.css` de 414 para 168 linhas. Juntar com cuidado e conferir que `color-scheme: dark` e o fundo de `html, body` continuam.
3. **Apagar `src/components/ui/StitchBrand.jsx`** (não é importado) e os estilos `stitch-header` e `stitch-brand`, que só ele usa.
4. **Teste que falha há tempos:** "artefato Apps Script é idêntico ao motor do navegador" (diferença de quebra de linha). Não vem das mudanças recentes. Consertar ou aposentar junto com o Apps Script.
5. **Segurança das dependências:** a auditoria de 30/09 apontou 15 vulnerabilidades em dependências (duas críticas, transitivas). Reavaliar com `npm audit`.
6. **Retirar o Firebase:** depois da decisão 10, remover o fallback Firebase do frontend e a aceitação de tokens legados na API, publicar, testar e só então desligar o serviço. Preservar backup. Ver [reconciliação](reconciliacao-producao-2026-09-30.md).
7. **Apps Script e planilhas:** reavaliar se ainda servem como fonte de retorno ou podem ser desligados.
8. **Desempenho:** aviso de bundle acima de 500 kB; medir abertura a frio no celular e carga com usuários distintos (precisa de contas de teste).
9. **Cadastro:** o Cadastro 2.0 pede título e matéria de novo depois da confirmação do e-mail.

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
