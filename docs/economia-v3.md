# Economia v3

Decidida pelo usuário em 07/10/2026. **Ainda não implementada.** A regra em vigor continua a da [economia v2](jogos-e-economia-v2.md) (`VERSAO_ECONOMIA = 2` em `src/utils/economia.js`) até esta versão ser construída, testada e publicada. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

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

- Os 100 XP são pagos em toda rodada concluída, **mesmo com zero acerto**. O usuário respondeu "sim" em 07/10/2026; ver o risco de abuso em [perguntas em aberto](#perguntas-em-aberto).
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

O usuário deixou o balanceamento de XP comigo. Proposta:

| Nível | Exemplos | XP | Ticket |
| --- | --- | --- | --- |
| 0 | Login diário | 25 × dias de ofensiva | — |
| 1 | Concluir 1 rodada de qualquer jogo | 50 | 1 |
| 2 | Concluir 3 rodadas; acertar 10 itens no Quiz ou no V ou M | 100 | 1 |
| 3 | Concluir 1 caso do DDX; cruzadinha sem dica; rodada perfeita | 150 | 1 |
| 4 | 3 rodadas perfeitas no dia; caso do DDX sem erro e com bônus máximo | 250 | 1 |
| 5 | Um jogo de cada (cruzadinha, Quiz, V ou M e caso do DDX) em menos de 30 min; cruzadinha em menos de X minutos sem dica | 400 | 2 |

Por dia, as missões somam 550 XP e 4 tickets, ou 700 XP e 5 tickets no dia de nível 5, além da ofensiva. Para comparar: um jogo paga de 100 a 150 XP, um caso do DDX de 300 a 400 e uma vitória na Batalha 500. A Batalha continua fora das missões, como na v2. Os tempos das missões de nível 5 usam o tempo medido pelo servidor.

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

## Perguntas em aberto

1. **Limite contra abuso.** Com 100 XP fixos mesmo com zero acerto e rodadas ilimitadas, dá para clicar sem ler. Cada rodada leva uns 30 segundos, então dá para chegar ao nível 10 em cerca de 4 horas. Isso fura o filtro de "nível 10 para quem não está só testando". Opções:
   - os 100 fixos valem nas 5 primeiras rodadas de cada jogo por dia, e depois só o bônus;
   - rodada com zero acerto não paga, que era a proposta anterior.

   Recomendação: as duas juntas.
2. **Missões:** confirmar a tabela de XP e os exemplos acima, e o tempo X da cruzadinha no nível 5.

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
