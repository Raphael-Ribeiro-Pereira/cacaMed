# Economia v3

Decidida pelo usuário em 07/10/2026. **Implementada em 19/10/2026 no branch `feat/economia-v3`, ainda não publicada nem levada para a `main`.** Em produção continua a [economia v2](jogos-e-economia-v2.md) até a publicação, que é separada do pacote de 22/10 (API antes do site, numa quinta, com o "sim" do usuário). O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

## Fórmulas dos bônus (aprovadas pelo usuário em 19/10/2026)

Constantes em `src/utils/economia.js`.

- **Tempo:** paga o valor cheio até a metade do tempo esperado, cai em linha reta e zera em 1,5 vez o esperado. Tempo desconhecido ou impossível não paga.
- **Quiz e Verdade ou mentira (até +50):** 25 × acertos ÷ 5, mais até 25 pelo tempo. Tempo esperado da rodada: 60 s (teoria e V ou M) e 120 s (casos clínicos), medido pelo servidor do início à conclusão.
- **Cruzadinha (até +50):** até 50 pelo tempo, menos a penalidade das dicas extras (5 ou 15), sem passar de zero. Tempo esperado: 15 s por palavra. Com a grade emitida pelo servidor, o tempo é o da emissão até o registro; abaixo de 3 letras por segundo não ganha bônus.
- **Erro médico e Causa e efeito (até +100):** 100 × a fração de etapas certas; todas certas contam como caminho seguro, senão o bônus vale metade. Zero acerto não paga nada, como nos jogos.
- **Plantão (até +100):** o Plantão não tem "acerto de primeira", então foi adaptado: 300 ao encerrar, menos o desconto do destino (alta indevida 80, outro destino 20); no caminho seguro, +50 e mais até 50 pelo tempo da ação-marco (caso sem marco ganha os 50). Plantão com a pontuação clínica zerada (por exemplo, alta sem avaliar nada) não paga.
- **Batalha:** 500 fixos na vitória (primeira vitória de cada doença na História; toda vitória no Duelo); derrota não paga. O Treinamento continua com 50 na primeira vez.

## Missões e ofensiva como implementadas

- A missão de login entra já concluída no primeiro pedido do dia e paga 25 × dias de ofensiva, sem ticket. Conta nova já nasce com o primeiro dia pago.
- As 4 missões do dia são sorteadas com uma semente do jogador e do dia: pedir de novo no mesmo dia traz as mesmas.
- Só contam rodadas com pelo menos um acerto e casos do DDX que renderam XP (repetir um caso já concluído não conta).
- Catálogo: nível 1, uma rodada de qualquer jogo; nível 2, 3 rodadas ou 10 acertos no Quiz e no V ou M; nível 3, um caso do DDX, cruzadinha sem dica extra ou rodada perfeita; nível 4, 3 rodadas perfeitas ou caso do DDX sem erro e com bônus máximo; nível 5, os quatro jogos em menos de 30 minutos ou cruzadinha sem dica abaixo do tempo esperado.
- O Paciente DDX não existe mais (fundido no Plantão em 13/10), então a linha dele na tabela abaixo não se aplica.
- O motor de treino do Apps Script (`docs/historico/apps-script/treinos-motor.gs`) ficou congelado na v2: o site só usa a API do Supabase.

## Decisões

| Atividade | Hoje (v2) | Decidido (v3) | Ticket |
| --- | --- | --- | --- |
| Cruzadinha | Fórmula de letras, palavras, dificuldade, tempo e dicas | 100 XP fixos + bônus de tempo | Sem mudança (2 por grade) |
| Quiz | 20 ou 25 por acerto, até 100 ou 125 | 100 XP fixos + bônus de performance | Sem mudança |
| Verdade ou mentira | 20 por classificação correta, até 100 | 100 XP fixos + bônus de performance | Sem mudança |
| Missão de login diário | Não existe | 25 × dias de ofensiva, **sem teto** por enquanto | Não dá ticket |
| Outras missões | 3 missões fixas, 50 XP e 1 ticket cada | 4 por dia, de 50 a 400 XP conforme o nível da missão | 1 ou 2 por missão |
| Plantão, Erro médico e Causa e efeito | Plantão até 250; os outros dois até 100 | 300 XP + bônus | 1 por caso, como hoje |
| Paciente DDX | Sem XP e sem ticket | 300 XP + bônus, como os outros modos do DDX | **Não cobra** |
| Batalha diagnóstica | Fórmula aprovada em 06/10/2026 | **500 XP fixos na vitória; derrota não paga** | Sem mudança |
| Revisão Inteligente | Sem XP e sem ticket | Sem mudança decidida | Gratuita |

### 100 XP fixos e bônus

- Os 100 XP são pagos em toda rodada concluída com **pelo menos um acerto**. Rodada com zero acerto não paga XP nem conta para missões, como na v2. Decidido em 07/10/2026 como trava contra quem clica sem ler (ver [risco conhecido](#risco-conhecido)).
- Bônus aceitos como propostos:
  - **jogos:** até +50 XP. No Quiz e no V ou M, metade vem dos acertos e metade do tempo. Na cruzadinha, vem do tempo, com a penalidade de dicas;
  - **DDX:** até +100 XP, por acertar de primeira e seguir o caminho seguro.

### Bônus de performance e cronômetro escondido

- Quiz e Verdade ou mentira **continuam sem cronômetro na tela**.
- O tempo de cada rodada é contado em segundo plano e entra no bônus de performance, junto com os acertos.
- O tempo **não aparece na tela nem no relatório pós-jogo**. O relatório mostra só a linha "Bônus" com o valor.
- O servidor mede o tempo pela diferença entre o início e a conclusão da rodada, que ele já registra. Assim o aparelho não consegue inventar um tempo menor. No [app offline](app-offline.md), vale a data do aparelho dentro da janela permitida.

### Paciente DDX sem multiplicador

O usuário desistiu do XP progressivo por nível, porque o multiplicador deixaria o jogo fácil demais. O Paciente DDX segue a regra dos outros modos do DDX (300 + bônus) e não cobra ticket.

### Tickets nunca ficam negativos

Com saldo zero, os modos do DDX que cobram ticket ficam indisponíveis. A tela mostra como ganhar tickets. Isso vale também offline ([app offline](app-offline.md#tickets-do-ddx-offline)).

Interpretação registrada: o Paciente DDX e as partes gratuitas da Batalha (Treinamento e História) não cobram ticket, então continuam disponíveis com saldo zero.

### Missões diárias

São **5 por dia**: a de login e mais 4 novas, sorteadas assim:
- uma de nível 1;
- uma de nível 2;
- uma de nível 3;
- uma de nível 4 ou 5 (a de nível 5 sai em 1 a cada 3 dias).

Balanceamento proposto pelo agente e aprovado pelo usuário em 07/10/2026:

| Nível | Exemplos | XP | Ticket |
| --- | --- | --- | --- |
| 0 | Login diário | 25 × dias de ofensiva | — |
| 1 | Concluir 1 rodada de qualquer jogo | 50 | 1 |
| 2 | Concluir 3 rodadas; acertar 10 itens no Quiz ou no V ou M | 100 | 1 |
| 3 | Concluir 1 caso do DDX; cruzadinha sem dica; rodada perfeita | 150 | 1 |
| 4 | 3 rodadas perfeitas no dia; caso do DDX sem erro e com bônus máximo | 250 | 1 |
| 5 | Um jogo de cada (cruzadinha, Quiz, V ou M e caso do DDX) em menos de 30 min; cruzadinha sem dica abaixo do tempo esperado da grade | 400 | 2 |

Por dia, as missões somam 550 XP e 4 tickets, ou 700 XP e 5 tickets no dia de nível 5, além da ofensiva. Para comparar: um jogo paga de 100 a 150 XP, um caso do DDX de 300 a 400 e uma vitória na Batalha 500. A Batalha continua fora das missões, como na v2. Os tempos das missões de nível 5 usam o tempo medido pelo servidor. O tempo esperado da grade é a mesma referência do bônus de tempo da cruzadinha.

### Ofensiva

- A ofensiva é um contador novo: dias seguidos com login, no fuso America/Sao_Paulo. O jogo hoje só conta dias seguidos de cruzadinha (`diasSeguidos` em `src/shared/operarJogosSupabase.js`), e esse contador não serve para a missão de login.
- Quando o jogador pula um dia, o multiplicador volta a 1. **O resto continua normal:** XP, nível, tickets e as outras missões não mudam.

### Curva de nível

Mantida: `500 × (N − 1)²`. Ela já é escalonada, ou seja, cada nível pede mais XP que o anterior. O usuário considera que isso equilibra o XP maior da v3.

| Nível | XP total | XP para chegar desde o nível anterior |
| --- | --- | --- |
| 2 | 500 | 500 |
| 3 | 2.000 | 1.500 |
| 4 | 4.500 | 2.500 |
| 5 | 8.000 | 3.500 |
| 6 | 12.500 | 4.500 |
| 7 | 18.000 | 5.500 |
| 8 | 24.500 | 6.500 |
| 9 | 32.000 | 7.500 |
| 10 | 40.500 | 8.500 |

O nível 10 libera a Revisão Inteligente ([Revisão v2](revisao-inteligente.md#versão-2-decidida-em-07102026-ainda-não-implementada)). Estimativa para chegar lá jogando todo dia:
- **Rotina diária considerada:** 2 rodadas de Quiz, 1 de V ou M, 1 cruzadinha, 1 caso novo do DDX e as missões. Isso dá cerca de 1.450 XP por dia, mais a ofensiva.
- **Resultado:** cerca de **24 dias** até o nível 10.

### Regras mantidas da v2

As regras abaixo não foram discutidas e continuam como estão:
- Plantão, Erro médico e Causa e efeito pagam só na primeira conclusão de cada caso e versão. O Paciente DDX passa a seguir a mesma regra.
- A Batalha paga na História só a primeira vitória de cada doença e versão. O Duelo paga em toda vitória e cobra 1 ticket por partida. O Treinamento continua com 50 XP na primeira conclusão.
- Reenvio da mesma partida não paga duas vezes.
- Subir de nível dá N tickets ao chegar no nível N.

## Risco conhecido

Com 100 XP fixos por rodada e rodadas ilimitadas, quem clica sem ler ainda ganha XP: ao acaso, cerca de 3 em cada 4 rodadas do Quiz e quase todas as do V ou M têm pelo menos um acerto. O limite diário de rodadas com XP cheio foi oferecido e não foi adotado. Depois da publicação, vale acompanhar quanto tempo os jogadores levam até o nível 10 e rever o limite, se preciso.

## Implementação prevista

- Regras novas em `src/utils/economia.js`, `missoes.js`, `treinos.js`, `batalha.js` e `pacienteDdx.js`, com `VERSAO_ECONOMIA = 3`. Os motores são compartilhados, então a Edge Function `cacamed-api` usa o mesmo cálculo e precisa ser publicada em versão nova.
- A migração preserva XP, tickets e níveis já ganhos, sem recompensa retroativa. Partidas iniciadas na v2 terminam com a regra v2.
- Sorteio das 4 missões diárias e a ofensiva no servidor, com o dia no fuso America/Sao_Paulo.
- Atualizar os textos das telas que mostram valores:
  - XP estimado na seleção de tópicos;
  - regras dos cards do DDX;
  - HUD do Quiz;
  - recibo do resultado, com a linha "Bônus" sem o tempo;
  - bloqueio do DDX com saldo zero.
- O app offline calcula o XP provisório com estes mesmos motores, e o servidor confirma ao sincronizar ([app offline](app-offline.md)). Por isso esta economia vem antes do offline no cronograma.
