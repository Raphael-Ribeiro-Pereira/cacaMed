# Validação do que foi construído em 19/10/2026

Este roteiro cobre o que o agente construiu em 19/10/2026 no branch `feat/economia-v3`:
- **Economia v3:** XP fixo, bônus escondidos, missões novas e ofensiva de login.
- **Revisão Inteligente v2:** cartas, sessões de 7, Erro médico, XP de domínio e explicação por IA.
- **App offline:** fila no aparelho, sincronização, abrir sem rede por 15 dias e todos os modos sem internet.

Nada disso está na `main` nem em produção. O pacote da quinta, 22/10 ([cronograma](cronograma-semana-15-a-22-10.md#roteiro-do-pacote-de-quinta-preparado-em-18102026)), continua separado e não muda.

O roteiro está dividido por plataforma. Faça um módulo de cada vez, na ordem.

## Visão geral

| # | Módulo | Quem faz | Precisa de deploy? |
| --- | --- | --- | --- |
| 1 | Decisões pendentes | Você | Não |
| 2 | Homologação local (no computador) | Você, com o agente ao lado | Não |
| 3 | OpenRouter (chave da IA) | Você | Não |
| 4 | Supabase (tabela nova e segredos) | Você no painel; o agente aplica a migração com o seu "sim" | Sim, numa quinta |
| 5 | Vercel (pré-visualização e produção) | O agente publica; você testa | Sim, numa quinta |
| 6 | Aparelho real (iPhone e Android) | Você | Depois do módulo 5 |
| 7 | Acompanhamento depois da publicação | Você e o agente | Não |

Regra de sempre: **deploy só às quintas, com o seu "sim" no dia.** Chaves e senhas você digita só nos painéis, nunca no chat.

---

## Módulo 1. Decisões (respondido em 19/10/2026)

O usuário validou o módulo 1. Respostas:
1. **Fórmulas dos bônus:** aprovadas e validadas.
2. **Catálogo de missões:** aprovado e validado.
3. **Paciente DDX na Revisão:** ganha carta. Ver [revisao-inteligente.md](revisao-inteligente.md#decisões-de-19102026-e-o-que-sai-da-pendência).
4. **Itens da Batalha:** não entram na Revisão.
5. **Conteúdo:** mínimo de 150 itens por lote de cada modo. Lista em [prioridade-conteudo.md](prioridade-conteudo.md).
6. **Modo história v2 da Batalha:** pode começar pelos protótipos.

O texto abaixo é o enunciado original, mantido para referência.

1. **Fórmulas dos bônus** (aprovadas em 19/10, vale reler): [docs/economia-v3.md](economia-v3.md#fórmulas-dos-bônus-aprovadas-pelo-usuário-em-19102026). Pontos que o agente adaptou:
   - **Plantão:** paga 300 menos o desconto do destino (alta indevida −80, outro destino −20). No caminho seguro, ganha +50 e mais até 50 pelo tempo da ação principal. Plantão com a pontuação clínica zerada não paga.
   - **Tempos esperados:** 60 s por rodada de Quiz teórico e de V ou M, 120 s nos casos clínicos e 15 s por palavra na cruzadinha.
2. **Catálogo de missões** (o agente escreveu as missões de cada nível a partir dos exemplos da doc): [docs/economia-v3.md](economia-v3.md#missões-e-ofensiva-como-implementadas).
3. **Carta do Paciente DDX na Revisão:** o Paciente DDX virou os casos `pdx-*` do Plantão. O Plantão (ou só os `pdx-*`) ganha uma carta na Revisão? Se sim, as marcações `grave` dos casos precisam de revisão médica.
4. **Itens da Batalha na Revisão** (pendência antiga): entram nas cartas do Quiz, ganham carta própria ou deixam de ser gerados?
5. **Conteúdo:** algumas cartas da Revisão ficam com menos de 7 itens, porque faltam perguntas parecidas por conceito no Quiz e no V ou M. Quer um lote novo de perguntas focado nisso?
6. **Modo história v2 da Batalha:** o próximo passo é o agente montar os protótipos (mapa, cutscene de entrada e transição) para a sua aprovação. Posso começar?

---

## Módulo 2. Homologação local (no computador, sem tocar em produção)

Usa dados fictícios no próprio navegador e não grava nada no perfil real. Peça ao agente para abrir, ou rode:

```bash
npm run dev
```

Depois abra `http://localhost:5173/homologacao.html`. A faixa laranja no topo tem os botões de teste.

### 2.1 Economia v3

1. **Testar menu:** o bloco "Missões de hoje" mostra 5 missões. A primeira é "Ofensiva: 1 dia seguido" (+25, já concluída). As outras 4 têm +50, +100, +150 e +250 (ou +400 no dia de nível 5).
2. **Testar Quiz:** jogue uma rodada.
   - Durante a rodada, o placar mostra "ACERTOS" (não mais XP).
   - No fim, o recibo mostra "Rodada concluída +100" e "Bônus +N", sem nenhum tempo à mostra.
   - Uma rodada com zero acerto paga 0.
3. **Testar Verdade ou mentira:** mesmo recibo do Quiz.
4. **Testar cruzadinhas:**
   - A seleção de tópico mostra "RECOMPENSA 100 A 150 XP".
   - No fim, o recibo mostra "Cruzadinha concluída +100" e "Bônus".
   - Com dica extra ("Esquelético no nível 3"), o desconto aparece na linha das dicas.
5. **Testar DDX** e depois **Garantir 3 tickets:**
   - **Erro médico:** o rodapé mostra "300 XP + BÔNUS". Com todas as etapas certas, o recibo dá 300 + 100. Com 1 de 3 certas, dá 300 + 17.
   - **Plantão:** o recibo tem "Plantão encerrado +300", "Destino" e "Bônus".
6. **DDX com zero ticket:** a lista de casos explica como ganhar tickets.

### 2.2 Revisão Inteligente v2

1. Clique em **Criar erros fictícios (Quiz, V ou M e Erro médico)**.
2. Devem aparecer 3 cartas: Quiz (3 erros), Verdade ou mentira (2) e Erro médico (1 caso).
3. **Carta do Quiz:** a sessão tem até 7 itens. As perguntas parecidas aparecem marcadas como "parecida" no topo.
4. No fim, com erros, a tela "REVEJA OS ERROS" mostra, para cada erro:
   - "Na partida" e "Na revisão", quando as escolhas forem diferentes;
   - a correta;
   - a explicação (na homologação, aparece "[Simulação da IA]"), o aviso "Explicação gerada por IA. Confira a fonte." e o botão "Reportar erro na explicação".
5. **Carta do Erro médico:** o prontuário aparece inteiro e você refaz as 3 etapas. O resultado mostra cada etapa.
6. "Voltar às cartas" volta para a lista.

### 2.3 Treino sem internet (simulado)

1. Clique em **Simular sem internet no treino (liga/desliga)** e depois em **Testar Verdade ou mentira**.
2. Jogue a rodada. No fim, o recibo mostra "Na fila do aparelho" e o aviso de XP provisório.
3. Clique de novo no botão para desligar a simulação.

O que a homologação **não** testa: a fila sendo enviada ao servidor, a abertura sem rede e o DDX sem rede. Isso fica para os módulos 5 e 6.

---

## Módulo 3. OpenRouter (a IA da tela de revisão)

A explicação por IA usa a OpenRouter. Sem a chave, tudo funciona, mas a tela mostra a explicação revisada do banco no lugar da IA.

1. Entre em `openrouter.ai` e crie uma conta (ou use a que o projeto já tinha para as dicas antigas da cruzadinha).
2. Em **Keys**, crie uma chave chamada `cacomed-revisao`. Se o site oferecer limite de gasto por chave, use um limite baixo.
3. Guarde a chave num lugar seguro. **Não cole no chat.** Ela vai só para o painel do Supabase (módulo 4).
4. **Modelo:** o padrão é `qwen/qwen3.8-27b:free`. Confira na página do modelo se ele continua gratuito e disponível. Se quiser outro, anote o nome exato para o segredo `OPENROUTER_MODELO`.
5. **Cota:** o plano gratuito tem limite de pedidos. O app guarda cada explicação em cache por item e escolha, e cada jogador pode pedir 30 por hora. Depois da publicação, acompanhe o uso no painel da OpenRouter (módulo 7).

---

## Módulo 4. Supabase (projeto `lruzndfqfivlvcckvgbw`)

### 4.1 Tabela nova (migração)

A migração `supabase/migrations/20261019000000_explicacoes_revisao.sql` cria duas tabelas, só acessíveis pela API:
- `cacamed_explicacoes`: cache das explicações;
- `cacamed_explicacoes_reportes`: os erros reportados pelos jogadores.

- **Quem aplica:** o agente, no dia da publicação, com o seu "sim".
- **Como conferir depois:** no painel, em **Table Editor**, as duas tabelas aparecem com RLS ligado (cadeado). Em **Authentication → Policies**, elas não têm nenhuma política. Isso é o certo: só a Edge Function lê e grava.

### 4.2 Segredos da Edge Function

No painel: **Edge Functions → cacamed-api → Secrets** (ou **Project Settings → Edge Functions → Secrets**).

| Nome | Valor | Obrigatório |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | a chave do módulo 3 | Não. Sem ela, aparece a explicação revisada |
| `OPENROUTER_MODELO` | o nome do modelo, só se quiser trocar o padrão | Não |

Você digita os valores no painel. A chave nunca vai para a Vercel, para o repositório, para variáveis `VITE_` nem para o chat.

### 4.3 O que muda na API na publicação

São ações novas, compatíveis com o site atual:
- `explicarRevisao` e `reportarExplicacao`;
- `sincronizarFila` (fila do app offline);
- `GET ?acao=ping`, a checagem de rede do app;
- carta escolhida em `iniciarRevisao`.

Mudam também as regras da economia (v3), da Revisão (v2, que passa a liberar no nível 10) e das missões.

**Ordem na publicação:** migração (4.1), depois a API, depois o site (módulo 5). Os segredos (4.2) podem entrar antes ou depois.

---

## Módulo 5. Vercel (pré-visualização e produção)

### 5.1 Por que a pré-visualização é diferente desta vez

A pré-visualização da Vercel usa a API de produção. O site novo depende da API nova (economia v3, Revisão v2, fila), e a API só sobe numa quinta. Há dois caminhos. **Escolha um e me diga:**

- **(a) Recomendado.** Valide primeiro na homologação local (módulo 2). Na quinta, publique API e site juntos e valide em produção logo depois (5.3), com os pontos de volta anotados.
- **(b)** O agente publica uma cópia da API com outro nome (por exemplo, `cacamed-api-previa`) no mesmo projeto Supabase e uma pré-visualização do site apontando para ela. Ela usaria o **mesmo banco**. Para não mexer nos perfis reais, só a sua conta de administrador entraria, no modo homologação (perfis `homologacao:`). Isso cria uma função a mais no projeto, e por isso precisa do seu "sim".

### 5.2 Antes de publicar (o agente faz, você acompanha)

1. Levar o branch `feat/economia-v3` para a `main`, depois do pacote de 22/10.
2. Rodar `npm test`, `npm run lint` e `npm run build`.
   - O build termina com "Pacote conferido": nenhum conteúdo sem revisão no site.
   - O teste "as cópias da API Supabase são iguais aos módulos de src" precisa passar.
3. Anotar os pontos de volta: o deploy do site e a versão da API em produção naquele dia.

### 5.3 Logo depois de publicar (você testa em `cacamed.com`)

1. **Login e menu:** as 5 missões aparecem, com a ofensiva no topo. No primeiro acesso do dia, você ganha +25 × dias seguidos.
2. **Uma rodada de Quiz:** o recibo mostra +100 + bônus, e o XP total confere.
3. **Uma cruzadinha:** o recibo mostra +100 + bônus, e o tópico ganha os mesmos pontos.
4. **Um caso do Erro médico** (com ticket): +300 + bônus.
5. **Revisão:**
   - abaixo do nível 10, aparece "Libera no nível 10";
   - com a conta de administrador, as cartas aparecem;
   - errando um item, no fim aparece a explicação (com a chave da OpenRouter) ou o texto revisado (sem ela);
   - reportar uma explicação cria uma linha em `cacamed_explicacoes_reportes`.
6. **Dia seguinte:** a ofensiva vai para 2 dias e o login paga +50. As missões do dia mudam.

---

## Módulo 6. Aparelho real (iPhone e Android, com o app instalado)

Faça depois da publicação. Siga com o app **instalado na tela de início**, que é mais estável que uma aba do navegador.

### 6.1 Preparar

1. Abra o app com internet e entre na conta.
2. Passeie por Cruzadinhas, Quiz, Verdade ou mentira, Revisão e DDX. Isso faz o app guardar as telas e as reservas da Revisão.
3. Confira o saldo de tickets (para testar o DDX sem rede, você precisa de pelo menos 1).

### 6.2 Jogar sem internet

1. Ligue o **modo avião**.
2. Um aviso "Sem internet" aparece no canto, acima da barra de baixo.
3. Jogue:
   - **Quiz e V ou M:** no fim, o recibo mostra "Na fila do aparelho" e "XP provisório";
   - **cruzadinha:** a grade abre com o banco guardado, e o recibo mostra o mesmo aviso;
   - **um caso do DDX:** gasta 1 ticket. Com saldo zero, aparece a mensagem de "sem ticket confirmado";
   - **uma carta da Revisão:** no fim, a explicação aparece no formato revisado, sem a IA.
4. O indicador mostra "Sem internet · N na fila".

### 6.3 Voltar a rede

1. Desligue o modo avião **com o app aberto**.
2. O indicador mostra "Enviando N itens" e depois some.
3. O XP e os tickets ficam iguais ou bem próximos do provisório. A diferença vem do tempo medido e das missões.
4. Repita com o **app fechado**: jogue sem rede, feche o app, ligue a rede e abra o app. A fila sai ao abrir.
   - No Android, ela pode sair até com o app fechado; no iPhone, não.

### 6.4 Abrir o app sem internet

1. Com o modo avião ligado, feche o app de vez e abra de novo.
2. **Esperado:** o app abre direto no menu, com o último perfil guardado.
3. **Se pedir login ou mostrar erro:** anote a mensagem e me mande. Esse é o ponto que só um aparelho real confirma: se o Supabase mantém a sessão guardada sem conseguir renová-la.

### 6.5 Casos de borda (opcional)

- **Item recusado:** jogue sem rede, peça ao agente para mudar a versão de uma pergunta e depois sincronize. O indicador mostra "1 não enviado", com o motivo e o botão "Entendi, remover".
- **Sair da conta com itens na fila:** o app pergunta antes de sair.
- **15 dias:** depois de 15 dias sem nenhum acesso com rede, o app pede internet para entrar. A fila continua guardada.

---

## Módulo 7. Acompanhamento depois da publicação

1. **OpenRouter:** no painel, veja o uso da chave na primeira semana. Se chegar ao limite gratuito, a tela mostra o texto revisado, sem quebrar.
2. **Reportes:** no Supabase, abra `cacamed_explicacoes_reportes` uma vez por semana. Para tirar uma explicação ruim do cache, apague a linha com a mesma `chave` em `cacamed_explicacoes`; o agente pode fazer isso com o seu "sim".
3. **Tempo até o nível 10:** a doc da economia estima cerca de 24 dias jogando todo dia. Depois de umas semanas, peça ao agente para medir. É o "risco conhecido" da [economia v3](economia-v3.md#risco-conhecido).
4. **Firebase:** uma semana estável depois de 22/10, o agente pode remover as rotas antigas (`migrarSenha` e `migrarIdentidade`). Não apague o projeto Firebase, porque a credencial do login Google do Supabase foi criada nele.

## Onde está cada coisa

- **Economia v3:** [docs/economia-v3.md](economia-v3.md).
- **Revisão v2:** [docs/revisao-inteligente.md](revisao-inteligente.md#versão-2-decidida-em-07102026-implementada-em-19102026-branch-feateconomia-v3-sem-publicar).
- **App offline:** [docs/app-offline.md](app-offline.md#andamento-19102026).
- **Branch:** `feat/economia-v3` (10 commits a partir da `main` de 19/10).
