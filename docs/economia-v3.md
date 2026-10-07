# Economia v3

Decidida pelo usuário em 07/10/2026. **Ainda não implementada.** A regra em vigor continua a da [economia v2](jogos-e-economia-v2.md) (`VERSAO_ECONOMIA = 2` em `src/utils/economia.js`) até esta versão ser construída, testada e publicada. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

## Decisões

| Atividade | Hoje (v2) | Decidido (v3) | Ticket |
| --- | --- | --- | --- |
| Cruzadinha | Fórmula de letras, palavras, dificuldade, tempo e dicas | 100 XP fixos + bônus de tempo | Sem mudança (2 por grade) |
| Quiz | 20 ou 25 por acerto, até 100 ou 125 | 100 XP fixos + bônus de performance | Sem mudança |
| Verdade ou mentira | 20 por classificação correta, até 100 | 100 XP fixos + bônus de performance | Sem mudança |
| Missão de login diário | Não existe | 25 × dias de ofensiva, **sem teto** por enquanto | A definir |
| Outras missões | 3 missões fixas, 50 XP e 1 ticket cada | Classificadas de 0 a 5 por dificuldade | A definir |
| Plantão, Erro médico e Causa e efeito | Plantão até 250; os outros dois até 100 | 300 XP + bônus | 1 por caso, como hoje |
| Paciente DDX | Sem XP e sem ticket | 300 XP + bônus, como os outros modos do DDX | **Não cobra** |
| Batalha diagnóstica | Fórmula aprovada em 06/10/2026 | **500 XP fixos na vitória; derrota não paga** | Sem mudança |
| Revisão Inteligente | Sem XP e sem ticket | Sem mudança decidida | Gratuita |

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

### Missões classificadas de 0 a 5

- **0:** login diário. Paga 25 XP × dias de ofensiva, sem teto.
- **5:** as mais difíceis, como concluir uma partida dentro de um tempo específico, ou concluir um jogo de cada modo em menos de X tempo.
- **1 a 4:** níveis intermediários, ainda a definir.

A ofensiva é um contador novo: dias seguidos com login, no fuso America/Sao_Paulo. O jogo hoje só conta dias seguidos de cruzadinha (`diasSeguidos` em `src/shared/operarJogosSupabase.js`), e esse contador não serve para a missão de login.

### Regras mantidas da v2

As regras abaixo não foram discutidas e continuam como estão:
- Plantão, Erro médico e Causa e efeito pagam só na primeira conclusão de cada caso e versão. O Paciente DDX passa a seguir a mesma regra.
- A Batalha paga na História só a primeira vitória de cada doença e versão. O Duelo paga em toda vitória e cobra 1 ticket por partida. O Treinamento continua com 50 XP na primeira conclusão.
- Reenvio da mesma partida não paga duas vezes.
- Subir de nível dá N tickets ao chegar no nível N.

## Perguntas em aberto

1. **Rodada com zero acerto paga os 100 fixos?** Proposta: não. Manter a regra de rodada válida (pelo menos um acerto), para ninguém acumular XP respondendo ao acaso.
2. **Valores dos bônus.** Proposta: até +50 XP nos jogos e até +100 no DDX. No Quiz e no V ou M, metade vem dos acertos e metade do tempo. Na cruzadinha, vem do tempo, com a penalidade de dicas. No DDX, vem de acertar de primeira e seguir o caminho seguro.
3. **Quebra da ofensiva.** Proposta: volta a 1. Alternativa: um "congelamento" de ofensiva comprado com ticket.
4. **XP e tickets por nível de missão (1 a 5)** e quantas missões aparecem por dia. Proposta para discutir: 1 = 50, 2 = 75, 3 = 100, 4 = 150 e 5 = 200 XP, com 1 ticket nos níveis 1 a 3 e 2 tickets nos níveis 4 e 5.
5. **Curva de nível.** Continua `500 × (N − 1)²`? Com mais XP por partida e a ofensiva sem teto, o jogador sobe de nível bem mais rápido, e cada nível novo dá N tickets.

## Implementação prevista

- Regras novas em `src/utils/economia.js`, `missoes.js`, `treinos.js`, `batalha.js` e `pacienteDdx.js`, com `VERSAO_ECONOMIA = 3`. Os motores são compartilhados, então a Edge Function `cacamed-api` usa o mesmo cálculo e precisa ser publicada em versão nova.
- A migração preserva XP, tickets e níveis já ganhos, sem recompensa retroativa. Partidas iniciadas na v2 terminam com a regra v2.
- Atualizar os textos das telas que mostram valores:
  - XP estimado na seleção de tópicos;
  - regras dos cards do DDX;
  - HUD do Quiz;
  - recibo do resultado, com a linha "Bônus" sem o tempo;
  - bloqueio do DDX com saldo zero.
- O app offline calcula o XP provisório com estes mesmos motores, e o servidor confirma ao sincronizar ([app offline](app-offline.md)). Por isso esta economia vem antes do offline no cronograma.
