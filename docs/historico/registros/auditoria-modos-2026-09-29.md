# Auditoria de Quiz, Verdade ou mentira e Revisão inteligente

Testes iniciados em 28/09, continuados em 29/09 e encerrados em 30/09/2026. Escopo: interface local em `localhost:5173`, backend Apps Script v19, conta admin autenticada e ambiente isolado `homologacao.html`. O pedido foi testar e registrar positivos, negativos e uma correção recomendada por modo. As recomendações abaixo não são mudanças já aplicadas.

## Método e limites

- Partidas reais pela interface, sem editar XP ou tickets por ferramenta administrativa.
- Falhas e resultados extremos no ambiente fictício, sem interromper o serviço real.
- 72 testes automatizados passaram nesta auditoria. Cobrem economia, transporte, reenvio, isolamento de usuário, intervalos, versões, recuperação e regressões de DDX/cruzadinhas.
- Avaliação de funcionamento e experiência. Não é uma nova validação médica independente dos gabaritos nem um estudo de eficácia pedagógica.
- Não foi feito benchmark de carga. Esperas observadas no navegador incluem a interação com a ferramenta; não atribuir tempos imprecisos exclusivamente à API.

## Registro dos testes

| ID | Ambiente | Cenário | Resultado observado |
| --- | --- | --- | --- |
| Q01 | Real | Quiz Teoria com um erro intencional | 4/5, +80 XP, medidor 0/2 → 1/2; nenhum ticket do jogo |
| Q02 | Real | Recarregar após a primeira resposta | Perfil retornou ao menu; abrir Quiz retomou pergunta 2/5 e feedback da primeira |
| Q03 | Real | Segunda rodada consecutiva, variante Casos | 5/5, +125 XP, medidor 1/2 → 0/2, +1 ticket; erro antigo de conflito não apareceu |
| Q04 | Real | Voltar ao menu após as duas rodadas | Contador passou de zero para duas rodadas; XP 5.632 → 5.837; tickets 2 → 3 |
| V01 | Isolado | Zero frases selecionadas | Confirmação bloqueada |
| V02 | Isolado | Todas as cinco frases selecionadas | Confirmação bloqueada, instrução de selecionar de uma a quatro |
| V03 | Isolado | Inverter as cinco classificações | 0/5; XP permaneceu 490, saldo zero, medidor zero; cinco correções exibidas |
| V04 | Isolado | Sair e retornar antes de confirmar | Mesmas frases retomadas, seleções não enviadas descartadas |
| V05 | Real | Primeira rodada da auditoria, quatro verdades no conjunto, uma deixada falsa intencionalmente | 4/5; +80 XP, medidor 0/2 → 1/2; XP 5.837 → 5.917, três tickets preservados |
| V06 | Real | Segunda rodada, conjunto com três verdades, todas as classificações corretas | 5/5; +100 XP do jogo e +100 de duas missões; +1 ticket do jogo e +2 de missões; total 6.117 XP e seis tickets |
| V07 | Real | Verificar retorno ao menu após duas rodadas | Verdade ou mentira passou de duas para quatro rodadas; missões 2/3; medidor do modo voltou a 0/2 |
| R01 | Isolado | Abrir revisão após V03 | Os cinco novos erros apareceram como disponíveis |
| R02 | Isolado | Falha simulada após gravar resposta falsa, seguida de reenvio | Uma única resposta contabilizada; total 6 → 7, acertos 4 → 5; avanço para item 2/5 |
| R03 | Isolado | Recarregar após R02 | Item 2/5, contadores e feedback preservados |
| R04 | Isolado | Encerrar sessão após uma resposta | Relatório 1/1 de cinco itens, marcado como encerrado antes do final; quatro itens continuaram disponíveis |
| R05 | Real | Consultar e iniciar revisão dos erros existentes | Quatro itens disponíveis, sessão iniciada com quatro itens misturando os modos |
| R06 | Real | Responder a primeira frase como falsa | Resposta confirmada como correta; contador 1/1, item 2/4 exibido, próxima revisão em 30/09 |
| R07 | Real | Retomar após indisponibilidade do Vite | Item 2/4 e primeira resposta correta preservados; as respostas seguintes avançaram normalmente |
| R08 | Real | Concluir e consultar após novo login | Relatório salvo com 4/4 acertos, quatro respostas e fontes; XP 6.117 e seis tickets preservados |
| R09 | Real | Ver próxima revisão | Fila em dia, aguardando intervalo; relatório indica 30/09 23:16 e fila 30/09 23:14, diferença de escopo/data a esclarecer |
| G01 | Real | Novo login após mudança de dia | XP 5.837 e três tickets preservados; missões diárias reiniciaram para 0/3 |

Os três modos tiveram o fluxo real concluído. A conferência final em 30/09 mostrou 6.117 XP e seis tickets, sem recompensa adicional pela revisão. As missões estavam em 0/3 após a mudança do dia, portanto não se deve atribuir esse reset à revisão. A auditoria acrescentou 485 XP e quatro tickets pelas partidas e missões, sem edição administrativa do saldo.

## Quiz médico

### Positivos

- Cinco perguntas mantêm a rodada curta e previsível.
- Teoria e Casos compartilham corretamente o contador de tickets, com 20/25 XP por acerto.
- Salvamento real por resposta e retomada após recarga funcionaram.
- As duas rodadas consecutivas terminaram; não reproduzimos o falso conflito de ordem de campos JSON.
- Resultado separa XP do jogo, missões e tickets; medidor corresponde ao saldo observado.
- Feedback e links de referência aparecem durante a rodada e no relatório final.
- Controles ficaram desabilitados durante a gravação e nenhuma escolha vazia foi confirmada.

### Negativos e evidências

| Prioridade | Achado | Evidência e impacto |
| --- | --- | --- |
| Alta | A próxima pergunta precede o feedback anterior | Após errar a hemácia, a pergunta seguinte apareceu acima da explicação. É fácil continuar sem ler o motivo do erro, especialmente em tela estreita. |
| Média | Casos ainda se aproximam de perguntas teóricas | A rodada trouxe situações de aluno/aula/lâmina, sem evolução de um paciente. O nome cria uma expectativa maior de interpretação clínica. |
| Média | Concentração de assuntos dentro da rodada | Na rodada Casos, dois dos cinco itens envolveram endolinfa/potencial endococlear, além de hemácia e plaquetas. Os IDs são diferentes, mas a variedade percebida é menor. |
| Baixa | Texto de revisão ficou desatualizado | O relatório diz “revisão futura” mesmo com o piloto já implementado. |
| Baixa | Resultado antigo reaparece sem data ao reabrir o modo | O relatório salvo pode parecer uma recompensa recém-concedida. O saldo não duplicou; falta contexto visual de “última rodada”. |

### Correção prioritária recomendada: feedback antes da próxima pergunta

Após confirmação pelo servidor, mostrar a pergunta respondida, escolha, gabarito, explicação e fonte, com botão **Próxima pergunta**. A pergunta seguinte só aparece após esse botão. Na quinta resposta, o relatório já cumpre essa função. O salvamento continua imediato, sem criar um segundo pedido de API apenas para avançar visualmente.

Aceitação: acertar e errar deixam a explicação visível; teclado chega ao botão de continuação; recarregar preserva a resposta já salva; a segunda rodada continua funcionando; nenhuma mudança em XP/tickets.

## Verdade ou mentira

### Positivos

- Cinco frases simultâneas e número variável de verdades preservam a proposta do modo.
- O texto explica que não selecionar equivale a classificar como falsa.
- Bloqueios para zero/cinco seleções funcionaram.
- O relatório corrige cada frase, incluindo as deixadas desmarcadas.
- Zero acertos não adiantou tickets ou XP no teste isolado.
- Duas rodadas reais seguidas (4/5 e 5/5) confirmaram o ticket do modo, duas missões do novo dia e os totais no menu.
- Os erros alimentaram a revisão, inclusive a frase verdadeira deixada desmarcada.

### Negativos e evidências

| Prioridade | Achado | Evidência e impacto |
| --- | --- | --- |
| Média | “Falsa” permanece uma classificação implícita durante a rodada | As caixas vazias não mostram um rótulo de resposta. Um jogador pode confundir item não avaliado com resposta falsa, apesar da instrução. |
| Média | Há rodadas com concentração de absurdos facilmente descartáveis | A amostra isolada incluiu “néfron é uma plaqueta gigante” e “bexiga produz insulina”. O humor é parte da proposta; a concentração pode reduzir o desafio em algumas rodadas. |
| Baixa | Seleções não confirmadas se perdem ao sair | Mesmas frases reapareceram sem as marcações anteriores. Isso está de acordo com o aviso atual, mas exige reler todas as frases. |
| Baixa | “Revisão futura” e histórico sem data | Mesmos problemas de apresentação do relatório do Quiz. |

### Correção prioritária recomendada: explicitar a classificação de cada frase

Manter o gesto de selecionar somente as verdadeiras, mas exibir junto de cada frase **Marcada como verdadeira** ou **Será considerada falsa**. O rótulo deve acompanhar a mudança da caixa e ser compreensível por leitor de tela. Não revelar gabarito, não exigir confirmação extra por frase e manter o envio único do conjunto.

Aceitação: ao selecionar/desmarcar, o estado textual muda; cinco frases mostram a classificação que será enviada; zero/cinco seleções continuam bloqueadas; gabaritos e recompensas permanecem iguais.

## Revisão inteligente

### Positivos

- A fila recebeu os erros produzidos no teste, sem preparação manual desses novos itens.
- Revisar uma frase individualmente torna explícita a escolha verdadeira/falsa.
- Reenvio após falha de gravação simulada e recarga preservaram uma única resposta.
- Encerramento parcial guardou o que foi respondido e devolveu os demais itens à fila.
- Feedback reúne resposta dada, correção, explicação, referência e próxima data.
- Os testes automatizados cobrem UID, versões ausentes, teto de frequência, comparação por valores e preservação da economia.

### Negativos e evidências

| Prioridade | Achado | Evidência e impacto |
| --- | --- | --- |
| Alta de produto | Dois erros podem afastar o item por sete dias | A regra atual limita a duas revisões em sete dias, mesmo quando ambas estão erradas. Está implementada e testada conforme a regra; a preocupação é afastar justamente o item ainda não assimilado. |
| Média | Feedback fica abaixo do próximo item | Mesmo problema de atenção observado no Quiz. |
| Média | Pouca explicação do agendamento | A tela mostra a data, mas não diferencia “acerto espaçado” de “limite semanal atingido”. O intervalo nominal de três dias pode virar seis por causa do teto. |
| Baixa | Contadores são cumulativos, não itens únicos dominados | “7 itens revisados” representa sete respostas, incluindo repetições. Convém rotular como “respostas de revisão” e distinguir domínio de volume. |
| Baixa | Resumo do menu é da última consulta | Não se atualiza com o passar do tempo ou após todo jogo; o texto é honesto, mas requer abrir o modo para conhecer a fila atual. |

### Correção prioritária recomendada: separar reaprendizagem de espaçamento

Recomendo que um erro volte no dia seguinte e zere a sequência de acertos; o teto semanal não deve impedir essa reaprendizagem. Acertos continuariam seguindo os intervalos definidos, sem XP ou tickets. A tela deve explicar o motivo da próxima data. É uma proposta de ajuste da regra do produto, não um defeito de implementação nem uma mudança já aplicada.

Aceitação proposta: dois erros no mesmo dia não criam repetição ilimitada e não afastam o item por sete dias; próximo retorno ocorre no dia seguinte; acertos preservam espaçamento; reenvio não altera data/contadores; testes de intervalo e documentação são atualizados juntos.

### Divergência de data a esclarecer

O relatório da sessão mostra próxima reapresentação em 30/09 às 23:16, enquanto a fila seguinte mostra 23:14. A fila pode incluir itens fora da sessão; a interface não explica essa diferença. Recomenda-se distinguir “próximo item desta sessão” de “próximo item da sua fila” e conferir o cálculo antes de classificar como falha de agendamento.

## Desempenho, acessibilidade e limitações

- A interface local respondeu às seleções; cada confirmação real dependeu da planilha e exibiu estado de espera. Não houve timeout de aplicação nas duas rodadas reais do Quiz.
- Rádios, caixas e botões foram operados pelo teclado. Algumas ações de clique da ferramenta não produziram navegação, enquanto Enter funcionou; não há evidência suficiente para atribuir isso a um defeito do app.
- Alguns diálogos nativos não puderam ser observados de forma consistente pela automação. O resultado do encerramento parcial foi conferido; não classificar isso como validação completa de todos os diálogos.
- Na continuação, a recarga da revisão encontrou `ERR_CONNECTION_REFUSED` porque o Vite não estava atendendo. O servidor foi iniciado novamente na porta 5173. Isso ocorreu na abertura do frontend, depois de confirmar a primeira resposta na API; não é evidência de falha do salvamento da revisão. A tela de erro também impediu a automação de retomar a aba original, exigindo navegação manual do usuário.
- A aba isolada não tinha rolagem horizontal na largura observada de 1265 px. Isso não equivale a testar todos os celulares.
- O banco inicial é pequeno. Rodadas diferentes podem compartilhar assunto mesmo evitando IDs imediatamente repetidos; ampliar diversidade exige curadoria de conteúdo.
- As leituras de histórico na planilha podem se tornar um limite de escala. Esta auditoria não mediu latência por operação nem usuários concorrentes; uma correção de desempenho deve começar por medição, não por promessa de ganho.
- DDX e cruzadinhas receberam cobertura da suíte automatizada; não foram jogados novamente nesta auditoria dos três modos.

## Ordem recomendada

1. Quiz: dar prioridade visual ao feedback, benefício que também serve à revisão.
2. Revisão: decidir o retorno após erro e explicar o agendamento.
3. Verdade ou mentira: explicitar classificações sem mudar a mecânica.
4. Atualizar textos de “revisão futura”, identificar “última rodada” com data e ampliar diversidade editorial.

Não foram alteradas regras, código de produção ou implantação como parte deste parecer. Alterações locais anteriores à auditoria foram preservadas.

## Evidências preservadas

- [Quiz Teoria real, 4/5](evidencias/auditoria-modos/quiz-teoria-real.png).
- [Segunda rodada real de Quiz, 5/5](evidencias/auditoria-modos/quiz-segunda-rodada-real.png).
- [Verdade ou mentira real, 5/5 e recompensas](evidencias/auditoria-modos/verdade-mentira-real.png).
- [Fila isolada com quatro itens após encerramento parcial](evidencias/auditoria-modos/revisao-parcial-isolada.png).

- [Revisão real concluída, 4/4](evidencias/auditoria-modos/revisao-real.png).
