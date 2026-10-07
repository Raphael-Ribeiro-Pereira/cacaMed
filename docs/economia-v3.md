# Economia v3

Decidida pelo usuário em 07/10/2026. **Ainda não implementada.** A regra em vigor continua a da [economia v2](jogos-e-economia-v2.md) (`VERSAO_ECONOMIA = 2` em `src/utils/economia.js`) até esta versão ser construída, testada e publicada. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

## Decisões

| Atividade | Hoje (v2) | Decidido (v3) |
| --- | --- | --- |
| Cruzadinha | Fórmula de letras, palavras, dificuldade, tempo e dicas | 100 XP + bônus de tempo |
| Quiz | 20 ou 25 por acerto, até 100 ou 125 | 100 XP + bônus |
| Verdade ou mentira | 20 por classificação correta, até 100 | 100 XP + bônus |
| Missão de login diário | Não existe | 25 × dias de ofensiva |
| Outras missões | 3 missões fixas, 50 XP e 1 ticket cada | Missões classificadas de 0 a 5 por dificuldade |
| DDX | Plantão até 250; Erro médico e Causa e efeito até 100 | 300 XP + bônus |
| Paciente DDX | Sem XP e sem ticket | XP progressivo: cada nível vencido paga mais que o anterior |
| Revisão Inteligente | Sem XP e sem ticket | Sem mudança decidida |

Também decidido: **Quiz e Verdade ou mentira continuam sem cronômetro** e sem o combo do protótipo.

### Missões classificadas de 0 a 5

- **0:** login diário. Paga 25 XP × dias de ofensiva.
- **5:** as mais difíceis, como concluir uma partida dentro de um tempo específico, ou concluir um jogo de cada modo em menos de X tempo.
- **1 a 4:** níveis intermediários, ainda a definir.

A ofensiva é um contador novo: dias seguidos com login, no fuso America/Sao_Paulo. O jogo hoje só conta dias seguidos de cruzadinha (`diasSeguidos` em `src/shared/operarJogosSupabase.js`), e esse contador não serve para a missão de login.

## Perguntas em aberto

Cada uma muda o cálculo no servidor e precisa de resposta antes da implementação.

1. **Os 100 XP dos jogos são fixos ou proporcionais?** Hoje o Quiz paga por acerto. Proposta: proporcionais aos acertos (5 de 5 = 100, 3 de 5 = 60), mantendo a regra de que zero acerto não paga.
2. **Bônus do Quiz e do V ou M.** Sem cronômetro, o bônus não pode ser de tempo. Proposta: bônus por rodada perfeita (5 de 5).
3. **Valor do bônus de tempo da cruzadinha.** Proposta: até +50 XP, caindo conforme o tempo passa do esperado para o tamanho da grade. A penalidade de dicas continua.
4. **Teto da missão de login.** Sem teto, no dia 100 a missão paga 2.500 XP, mais que qualquer jogo. Proposta: teto em 7 dias (175 XP), que se mantém enquanto a ofensiva continuar.
5. **O que fazer quando a ofensiva quebra.** Proposta: volta a 1. Alternativa: um "congelamento" de ofensiva comprado com ticket.
6. **XP e tickets por nível de missão (1 a 5).** Proposta para discutir: 1 = 50, 2 = 75, 3 = 100, 4 = 150 e 5 = 200 XP, com 1 ticket nos níveis 1 a 3 e 2 tickets nos níveis 4 e 5. Também falta definir quantas missões aparecem por dia e de quais níveis.
7. **Quais modos entram nos "300 XP + bônus" do DDX.** Plantão, Erro médico e Causa e efeito com certeza? A Batalha diagnóstica tem economia própria, aprovada em 06/10/2026: ela muda também? E o bônus do DDX vem de quê (acertos de primeira, tempo ou caminho seguro)?
8. **O que é "nível" no Paciente DDX.** Pode ser o módulo do mapa (1 a 5) ou o nível global do jogador. Proposta: módulo do mapa, com 300 XP no módulo 1 e +25% por módulo (300, 375, 450, 525, 600), pagando só na primeira conclusão de cada caso e versão, como no Plantão.
9. **Ticket do Paciente DDX.** Hoje é gratuito. Passa a custar 1 ticket como os outros casos do DDX?
10. **Curva de nível.** Continua `500 × (N − 1)²`? Com mais XP por partida, o jogador sobe de nível bem mais rápido, e cada nível novo dá N tickets.

## Implementação prevista

- Regras novas em `src/utils/economia.js`, `missoes.js` e `treinos.js`, com `VERSAO_ECONOMIA = 3`. Os motores são compartilhados, então a Edge Function `cacamed-api` usa o mesmo cálculo e precisa ser publicada em versão nova.
- A migração preserva XP, tickets e níveis já ganhos, sem recompensa retroativa. Partidas iniciadas na v2 terminam com a regra v2.
- Atualizar os textos das telas que mostram valores: XP estimado na seleção de tópicos, "+2 tickets por plantão", regras dos cards do DDX, HUD do Quiz e o recibo do resultado.
- O app offline calcula o XP provisório com estes mesmos motores e o servidor confirma ao sincronizar ([app offline](app-offline.md)). Por isso esta economia vem antes do offline no cronograma.
