# Revisão Inteligente

Implementada em 28/09/2026, como piloto para administrador. Backend publicado na **versão 19** da implantação existente, mantendo URL e permissões. Código.gs e Treinos.gs comparados integralmente com os arquivos locais, normalizando quebras de linha. Interface local em http://localhost:5173/; publicação no Vercel depende da validação do piloto. Deploy automático continua desativado.

## Versão 2: decidida em 07/10/2026, implementada em 19/10/2026 (branch `feat/economia-v3`, sem publicar)

O usuário redefiniu o modo. Em produção continua o piloto do administrador até a publicação. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

### Como ficou implementada

- **Motor:** `src/utils/revisaoInteligente.js` (cartas, sessão de 7, parecidas, domínio) e `src/utils/erroMedicoRevisao.js` (casos do Erro médico). Servidor em `src/shared/operarRevisaoSupabase.js`; tela em `src/components/RevisaoInteligente.jsx`.
- **Cartas:** Quiz, Verdade ou mentira e Erro médico. A do Paciente DDX ficou de fora: o modo foi fundido no Plantão em 13/10 (ver pendência abaixo). Os itens da Batalha continuam guardados, sem carta.
- **Perguntas parecidas:** pontuação por mesmo conceito, mesmo tema e palavras iguais no enunciado. Com o banco atual, algumas cartas ficam com menos de 7 itens, porque não há parecidas suficientes; a sessão fica menor, sem repetir item.
- **Fila:** pergunta parecida errada na revisão entra na fila como erro. O caso do Erro médico entra quando alguma das três etapas errou e só se o caso estiver revisado.
- **Tela de revisão no fim da sessão:** mostra a pergunta, a escolha da partida e a da revisão (uma só se forem iguais), a correta e a explicação. No Erro médico, mostra cada etapa.
- **Explicação da IA:** ação `explicarRevisao` na Edge Function. A chave fica só no segredo `OPENROUTER_API_KEY`; o modelo pode ser trocado pelo segredo `OPENROUTER_MODELO` (padrão `qwen/qwen3.8-27b:free`). Cache na tabela `cacamed_explicacoes`, reportes em `cacamed_explicacoes_reportes` (migração `20261019000000_explicacoes_revisao.sql`). Limite de 30 pedidos por hora por jogador. Sem chave, com falha ou com texto inválido (vazio, com link ou longo demais), aparece a explicação revisada do banco.
- **XP:** +40 por item dominado (terceiro acerto seguido), uma vez por item e versão, sem ticket e fora das missões.
- **Liberação:** nível 10 (o administrador sempre entra). O menu mostra a Revisão para todos, com "Libera no nível 10" abaixo disso.
- **Apps Script:** não recebeu a v2 (motor congelado).

### Pendências da v2 para o usuário

1. **Carta do Paciente DDX:** o Paciente DDX virou os casos `pdx-*` do Plantão. Falta decidir se o Plantão (ou só os `pdx-*`) ganha a carta, com a regra de erro grave abaixo. As marcações `grave` ainda dependem de revisão médica.
2. **Conteúdo:** mais perguntas por conceito no Quiz e no V ou M, para as cartas completarem 7 itens.

### Entrada por cartas

A Revisão reúne todos os erros do jogador num só lugar. A tela inicial mostra cartas de **quatro modos**, cada uma com o ícone do modo e quantos erros estão pendentes:
- Quiz;
- Verdade ou mentira;
- DDX Erro médico;
- Paciente DDX.

**Os erros da cruzadinha ficam de fora.** Plantão e Causa e efeito também não têm carta.

**Mais de 7 erros viram mais cartas.** No Quiz e no V ou M, cada carta leva até 7 erros. Exemplo: com 10 erros no Quiz, aparecem duas cartas com o ícone do Quiz. A primeira tem os 7 erros de maior prioridade. A segunda tem os 3 restantes e mais 4 perguntas parecidas.

No Erro médico e no Paciente DDX, a proposta é uma carta por modo, com os casos errados em sequência.

**Liberação no nível 10.** A Revisão só abre a partir do nível 10, para filtrar quem está só testando o jogo. Abaixo disso, a entrada aparece bloqueada com "Libera no nível 10". O administrador continua com acesso. Os erros são registrados desde o nível 1, então a fila já está pronta quando o jogador chega ao nível 10.

Exemplo do usuário: o jogador errou as perguntas alfa, beta e gama do Quiz, o caso teta do Erro médico, o caso tau do Paciente DDX e uma frase do V ou M. A carta do Quiz abre uma sessão com alfa, beta e gama mais quatro perguntas parecidas.

### Quiz

- **Sessão de 7 perguntas:** os erros da carta, completados com perguntas parecidas até chegar a 7. As parecidas são escolhidas nesta ordem:
  1. mesmo conceito;
  2. mesmo tema;
  3. **palavras iguais** no enunciado, quando faltam perguntas dos dois critérios anteriores. A comparação ignora palavras curtas e comuns ("de", "o", "com" etc.).
- **Acertou tudo:** volta para as cartas.
- **Errou alguma:** abre a tela de revisão. Para cada pergunta errada, ela mostra:
  - a pergunta;
  - a alternativa que ele marcou na partida e a que marcou na revisão. Se as duas forem iguais, aparece só uma. Numa pergunta parecida, que não veio de partida, aparece só a da revisão;
  - a alternativa correta;
  - abaixo das alternativas, a explicação de por que cada alternativa marcada não é a resposta. Essa explicação é escrita pela LLM ([abaixo](#llm-na-tela-de-revisão)).
- **Repetição espaçada:** a pergunta errada continua guardada para repetir. Vale a regra atual de 1, 3 e 7 dias, com teto de duas revisões por semana. Uma pergunta parecida que ele errar também entra na fila.

### Verdade ou mentira

Igual ao Quiz: cartas de até 7 frases (os erros mais frases parecidas, escolhidas pelos mesmos critérios) e a mesma tela de revisão, com a explicação da LLM para cada frase errada.

### DDX Erro médico

- O jogador refaz **o mesmo caso**.
- Se errar de novo, recebe a explicação completa do caso, escrita pela LLM a partir do conteúdo do caso, dizendo por que a alternativa escolhida estava errada em cada etapa.

### Paciente DDX

É o mais complexo.
- O jogador refaz os casos em que cometeu **erro grave** (definição abaixo).
- Depois, recebe uma revisão detalhada de cada caso, escrita pela LLM a partir do conteúdo e do gabarito: o que deixou de investigar, a hipótese e a conduta, com o que marcou de errado e o que deixou de marcar.
- Por fim, recebe a indicação de uma fonte para estudar, com a página. A fonte vem da biblioteca do caso, nunca da LLM, para não citar uma fonte inventada.

#### O que é erro grave no Paciente DDX

Decidido em 07/10/2026: o caso entra na Revisão quando o jogador comete um **erro grave**, e não por causa da nota. Uma nota alta não livra o caso de um erro grave, e uma nota baixa sem erro grave não entra.

Definição confirmada pelo usuário em 07/10/2026; as marcações de cada caso ainda dependem de revisão médica. É erro grave:
1. escolher a **hipótese errada**;
2. marcar uma **conduta errada que causa dano ou atraso**;
3. deixar de marcar uma **conduta essencial**.

Não é erro grave:
- deixar de fazer uma pergunta ou pedir um exame-chave;
- deixar de marcar uma conduta complementar.

Esses itens continuam baixando a nota, como hoje, e aparecem no resultado do caso.

Exemplo com o caso real "Infarto com supra de ST" (`iamcsst`). As notas foram calculadas com `avaliarRespostas`:

| Jogador | O que fez | Nota | Entra na Revisão? |
| --- | --- | --- | --- |
| A | Pulou 2 das 4 perguntas-chave (fatores de risco e se a dor muda ao respirar). Hipótese certa. Marcou ECG, AAS e reperfusão, mas não marcou a morfina | 78 | **Não**: os erros dele são de investigação e de conduta complementar |
| B | Investigação completa, hipótese certa, todas as condutas certas, mas marcou também "Aguardar a troponina para decidir o tratamento" | 94 | **Sim**: esperar a troponina atrasa a reperfusão do infarto |
| C | Investigação completa e todas as condutas certas, mas escolheu "Dissecção de aorta" como hipótese | 75 | **Sim**: hipótese errada |

Para isso funcionar, cada conduta do gabarito ganha a marcação `grave`:
- conduta certa e essencial: deixar de marcar é grave. No exemplo: ECG em 10 minutos, AAS e reperfusão;
- conduta errada e perigosa: marcar é grave. No exemplo: aguardar a troponina e o teste ergométrico.

Essas marcações entram em `pacienteDdxGabarito.js`, gerado por `scripts/gerar-gabarito-paciente.mjs`, e precisam de revisão médica caso a caso.

### Itens da Batalha: decidido em 19/10/2026

Os erros da Batalha **não entram na Revisão**. Desde 06/10/2026 eles geravam itens de múltipla escolha; esse gerador (`src/utils/batalhaRevisao.js`, `eventosBatalha`) deve ser desligado na próxima rodada de código, sem apagar o histórico já guardado. O aprendizado da Batalha fica no pergaminho e na enciclopédia do [modo história v2](modo-historia-v2.md).

### LLM na tela de revisão

Decidido em 07/10/2026: a LLM **escreve a revisão para o jogador dentro do app**, por API. Não é usada para escrever rascunhos de conteúdo.

Até 15/10/2026 o projeto usava a OpenRouter com o modelo `qwen/qwen3.8-27b:free` nas dicas de IA da cruzadinha, via `server/index.js` (rota `/api/ia`); as dicas passaram a sair do banco e o servidor local foi removido em 17/10/2026. **Essa rota só existe no servidor local:** em produção, `https://caca-med.vercel.app/api/ia` respondeu 404 em 07/10/2026. As dicas de IA não funcionam no site publicado, e a revisão não pode usar essa rota como está.

Como deve funcionar:
- **Chamada pelo servidor.** O pedido vai para a Edge Function `cacamed-api` (por exemplo, a ação `explicarRevisao`), e a chave da OpenRouter fica nos segredos do Supabase. Nunca no aparelho. A mesma rota passa a atender as dicas da cruzadinha.
- **Ancorada no conteúdo.** O prompt leva o enunciado, as alternativas, o gabarito, a explicação revisada do banco, a fonte e as respostas do jogador. A LLM é instruída a explicar só com base nisso e a não citar fontes.
- **Nada pessoal.** Vão só o item e as escolhas, nunca nome, e-mail ou UID.
- **Cache.** A resposta é guardada por item, versão e escolha. Dois jogadores que erraram a mesma alternativa recebem a mesma explicação, o que poupa a cota gratuita e deixa o texto consistente. O cache também vai para o pacote offline.
- **Sem rede, sem cota ou com falha:** a tela mostra a explicação revisada do banco, e a da LLM aparece quando estiver disponível.
- **Aviso na tela:** "Explicação gerada por IA. Confira a fonte." e um botão para reportar erro. Os reportes vão para revisão médica e podem apagar a explicação do cache.
- **Limites:** o plano gratuito da OpenRouter tem limite de pedidos. Com o cache por item, a escolha e o limite devem ser medidos antes de liberar para todos.

### Conteúdo necessário

- **Perguntas e frases parecidas:** uma marcação de conceito ou tema para escolhê-las, e perguntas suficientes por conceito para completar sessões de 7.
- **Explicação revisada de cada item e de cada caso:** a base que ancora a LLM e o texto que aparece quando ela não está disponível. Quiz, V ou M e Paciente DDX já têm explicação e fonte; falta conferir o Erro médico.
- **Erros do Erro médico e do Paciente DDX:** passam a ser registrados como itens da Revisão. Hoje só Quiz, V ou M e a Batalha alimentam a fila.
- **Marcação `grave`** nas condutas do Paciente DDX, com revisão médica.

### XP da Revisão

Decidido em 07/10/2026: **+40 XP por item dominado.**
- Um item fica dominado quando completa o ciclo de repetição: o terceiro acerto seguido, já no intervalo de 7 dias.
- Paga uma vez por item e versão. Se o jogador errar o item de novo e voltar a dominá-lo, não ganha outra vez, para não valer a pena errar de propósito.
- Itens parecidos que entram na fila também pagam quando são dominados.
- Concluir uma carta não paga XP direto, e a Revisão não entra nas missões diárias.
- Ticket continua sem ganho e sem custo.
- O teto de duas revisões por item na semana impede acumular XP depressa.

Opções descartadas: sem XP, XP fixo por carta, XP por erro recuperado e missão da Revisão.

### Decisões de 19/10/2026 e o que sai da pendência

- **Paciente DDX (casos `pdx-*` do Plantão):** ganham carta na Revisão. Depende das marcações `grave` revisadas e de uma nova carta no motor (hoje só Quiz, V ou M e Erro médico).
- **Batalha:** fora da Revisão (ver acima).
- **Conteúdo:** meta de no mínimo 150 itens por lote de cada modo. A [lista de prioridade de coleta](prioridade-conteudo.md) guia a ordem.

### Defeito achado na homologação de 19/10/2026: a entrada da Revisão

A captura do usuário mostra a Revisão abrindo no relatório da última sessão ("Revisão salva · 2/5 respostas corretas"), com o texto antigo "Até cinco itens". Duas causas:

1. **O que o usuário viu é o código da `main` (v1).** O texto "Até cinco itens dos seus erros" só existe lá; a v2 está só no branch `feat/economia-v3`.
2. **A v2 tem um defeito parecido.** `RevisaoInteligente.jsx` abre no relatório sempre que a última sessão está encerrada com relatório e o estado `listar` está `false` (valor inicial). Reabrir a Revisão depois de terminar uma sessão mostra o relatório de novo, em vez das cartas.

Regra decidida: **a entrada da Revisão é sempre o hub**, com as cartas disponíveis, o resumo (itens revisados, dominados, próxima revisão) e a opção de rever o último relatório. O relatório só aparece logo ao terminar uma sessão. Antes de mexer no código, o hub é prototipado (ver [plano de protótipos](#prototipo-do-hub-da-revisão)).

### Protótipo do hub da Revisão

Protótipo em [`docs/prototipos/revisao-hub.html`](prototipos/revisao-hub.html), para aprovação antes do código. Abre direto no navegador, sem build. Conteúdo das perguntas é fictício.

**Versão 2 (19/10/2026, depois da primeira rodada com o usuário).** A versão do celular com a abertura em furacão foi aprovada; esta versão acrescenta o **modo foco** pedido pelo usuário:
1. **Hub:** "Comece sua revisão", quatro estatísticas (itens na fila hoje, itens revisados, taxa de acerto e dominados com o XP) e o baralho fechado no centro da mesa.
2. **Modo foco:** ao tocar em "Começar revisão" (ou no baralho), o entorno some e ficam só as cartas, na tela inteira. O baralho vai para o centro girando em espiral ("furacão", com um redemoinho de luz atrás) e se abre num leque de pôquer; cada carta vira de costas para frente ao chegar. Sobram só um X discreto para sair (ou Esc) e uma dica que some em 3,5 s.
3. **Cartas:** uma por modo (Quiz, Verdade ou mentira, Erro médico e Paciente DDX), no estilo de carta de baralho: número de erros no canto, ícone do modo, tempo estimado e temas. Ao passar o mouse, a carta sobe, endireita e cresce para leitura. Carta em espera aparece no leque, apagada, com o horário em que volta.
4. **Escolha:** a carta tocada ganha um brilho discreto na cor do modo, vai para o centro, e as outras voltam em espiral para trás dela, formando um bloco. O bloco cresce até ocupar a tela e vira a sessão.
5. **Fim da carta:** a tela encolhe de volta até o baralho, o leque reabre no modo foco e a carta feita fica verde, com um certinho (e "2/3 certas" no lugar do tempo). O jogador escolhe a próxima entre as que faltam. **Não há mais relatório depois de cada modo** (decidido em 19/10).
6. **Sair no meio:** a carta fica "Em andamento" no leque; as outras esperam ela terminar (regra do servidor hoje: uma sessão aberta por vez). Aprovado pelo usuário em 19/10.

**Versões 3 a 5 (19/10/2026, segunda a quarta rodadas):**
7. **Aviso ao começar e trava.** "Começar revisão" abre o aviso: depois de começar, o jogador só sai da revisão quando **terminar todas as cartas da semana**, e até lá os outros modos do jogo ficam bloqueados, **mesmo fechando e abrindo o app** (o app reabre direto nas cartas). No modo foco, o X dá lugar a "Termine as cartas da semana para sair · faltam N". A última carta destrava tudo.
8. **Relatório geral, só no fim** (referência: vídeo do usuário de 19/10, um anel de imagens com título no centro). Ao terminar a última carta, as cartas feitas saem do leque e formam um **anel** com "Seu relatório" no centro; o anel tem 8 vagas, e as que sobram ficam como contorno vazio. **As cartas ficam em pé** no anel (só a posição gira), como o usuário pediu.
9. **Relatório de uma carta.** Ao tocar numa carta, o anel gira até ela parar à direita, maior; dela nasce o painel do relatório completo (no celular, quase a tela inteira; no computador, à direita, com o nome da carta grande à esquerda e o anel apagado ao fundo). O painel tem:
   - acertos, tempo médio por item, **ritmo de leitura e raciocínio** (segundos por palavra) e **indecisão** (segundos e % do tempo), ver a [métrica](#métrica-de-ritmo-e-indecisão-decidida-em-19102026);
   - o ritmo item a item (barra cheia: tempo para ler e pensar, verde ou vermelho; listrado em âmbar: indecisão);
   - **"O que pode estar influenciando seus erros"**: análise a partir dos dados do jogador (pressa, dúvida entre alternativas, conceito ainda não firme, acerto com dúvida, tema dos erros). No protótipo é por regras; no app, a IA escreve a partir dos mesmos dados, com o aviso de IA;
   - **cada alternativa explicada**: por que cada uma está certa ou errada, com a fonte revisada do item.
10. **"Entendi":** o painel volta para a carta, o anel dá uma volta inteira e para no lugar; no meio da carta um certinho se completa, a carta pisca, fica verde e apaga devagar até um verde escuro, saindo de foco.
11. **Fim: o monstro do cérebro** (descrito pelo usuário em 19/10, com uma imagem de referência de um polvo roxo com o cérebro numa cúpula de vidro; o usuário liberou usá-la como inspiração, sem licença atrelada. O protótipo segue a referência: corpo em forma de copo com contorno escuro, tentáculos enrolados, cúpula de vidro com o cérebro, sobrancelhas bravas e presas). Ele aparece no centro com cara de fome e devora as cartas uma a uma (a boca abre, morde, o corpo amassa). A cada carta comida, **o verde sobe de baixo para cima** no corpo e nos tentáculos. Totalmente verde, os dois tentáculos de fora sobem e **formam um coração** em volta da cabeça, e ele sorri satisfeito. Depois: "Parabéns! Você concluiu sua revisão da semana", o placar da semana e o **prêmio** (35 XP por item, até 1000, e 1 ticket a cada 7 itens, até 4), com "Voltar ao hub". O hub passa a "Tudo revisado nesta semana" com "Ver seu relatório da semana" (o anel com as cartas já vistas, sem o monstro de novo).

O botão "Protótipo" (canto inferior esquerdo) troca a situação do jogador (com cartas, carta em andamento, em dia, sem erros, abaixo do nível 10), a abertura (furacão ou leque simples) e a tela (cheia ou celular), e tem dois atalhos: **simular fechar e abrir o app** (para ver a trava) e **ir direto ao relatório geral**.

#### Métrica de ritmo e indecisão (decidida em 19/10/2026)

Ideia do usuário: o tempo que a pessoa leva por palavra nas perguntas que **acerta** é o seu tempo de leitura e raciocínio; o que passa disso numa pergunta é indecisão.
- **Ritmo da pessoa** = média de (tempo até responder ÷ número de palavras) nas respostas **certas**, com o histórico dela. Em segundos por palavra.
- **Tempo esperado de um item** = ritmo × palavras do item.
- **Indecisão do item** = tempo até responder − tempo esperado (zero se for menor).
- **Palavras:** contam o enunciado e as alternativas, porque a leitura inclui as duas (decidido em 19/10).
- **Métricas que saem disso:** ritmo de leitura e raciocínio; indecisão total e em % do tempo; o item com mais dúvida; **pressa** (respondeu em menos de 70% do tempo esperado e errou); **dúvida** (indecisão de pelo menos 3 s e 40% do esperado); **acerto com dúvida** (acertou, mas com indecisão alta: conceito ainda não automático); **conceito não firme** (errou no tempo normal). A análise da IA recebe esses números por item.
- **Cuidados:** o ritmo só fica confiável depois de algumas respostas certas (o protótipo usa um histórico de exemplo de 12 respostas); casos longos (Erro médico, Paciente DDX) têm prontuário, e o tempo de cada etapa precisa ser medido por etapa; o aparelho mede do item aparecer até o toque, e a fila offline guarda esse tempo junto da resposta.

Movimento reduzido (preferência do sistema): as cartas vão direto para o lugar, sem espiral.

**Decidido pelo usuário em 19/10/2026:**
1. **Várias cartas por visita, uma de cada vez:** ao terminar a carta escolhida, o jogador volta às cartas para escolher entre as que faltam. (Substitui a ideia de juntar várias cartas numa sessão só.)
2. **Cartas em espera** aparecem no leque.
3. **Estatísticas do hub:** boas no celular. No PC sobra um espaço vazio enorme, o que entra na reformulação geral da versão PC ([pendências](pendencias.md#5-trabalho-do-agente-na-ordem-decidida)).
4. **Paciente DDX:** nome e cor aprovados.
5. **Furacão:** aprovado no celular.
6. **Direto às cartas** ao terminar um modo, sem relatório no meio; **relatório geral** só depois de todas as cartas.
7. **Aviso e trava** ao começar, que sobrevive a fechar o app; **outros modos bloqueados até terminar todas as cartas da semana**.
8. **Carta em andamento:** aprovada.
9. **Indecisão pelo ritmo por palavra** ([métrica](#métrica-de-ritmo-e-indecisão-decidida-em-19102026)).
10. **Cartas em pé no anel** e o anel, o giro e o certinho que apaga aprovados ("quase perfeito").
11. **Fim com o monstro do cérebro**, que fica verde, faz um coração e sorri, seguido de parabéns e um prêmio. A imagem de referência do polvo pode ser usada como inspiração.
12. **Prêmio de conclusão proporcional** (sugestão do agente aprovada): 35 XP por item revisado, até 1000, e 1 ticket a cada 7 itens, até 4, uma vez por semana. Ver [economia v3](economia-v3.md#decisões).
13. **Palavras do ritmo:** enunciado e alternativas.
14. **Revisão semanal**, não diária, sem dia fixo (o jogador escolhe), com a fila limitada a **~10 minutos estimados** pelo ritmo, repetição em semanas e lembrete por missão diária e aviso na quarta (ver abaixo).

#### Revisão semanal (decidida em 19/10/2026)

O usuário pensou a Revisão como um **modo semanal**, não diário.
- **Semana:** a mesma das Coroas, de segunda a domingo, fechando no domingo às 23:59 de Brasília (`semanaCoroas` e `fimDaSemana` em `src/utils/coroas.js`).
- **Sem dia fixo:** o jogador escolhe o dia da semana em que faz a revisão (decidido).
- **Tamanho pela duração, não pelo número de cartas:** a fila da semana vai até **cerca de 10 minutos estimados** pelo ritmo da pessoa (palavras de cada item × segundos por palavra, ver a [métrica](#métrica-de-ritmo-e-indecisão-decidida-em-19102026)). Isso substitui o limite de 4 cartas. Para quem ainda não tem ritmo medido, vale um ritmo padrão até juntar respostas certas suficientes.
- **Fila cheia:** quando a fila chega aos 10 minutos, o jogador recebe o aviso e a missão na hora (ver abaixo), e cada erro novo tira o mais antigo da fila (decidido). Em aberto: o mais antigo é apagado ou vai para uma reserva?
- **Lembrete:** a **missão do dia "revisão da semana"** com bônus alto, mais um **aviso (pop-up)** na quarta-feira, para quem abrir o app na quarta ver a missão e o aviso juntos (decidido). Proposta do agente:
  - **Valor da missão:** +400 XP e 2 tickets, o mesmo da maior missão diária (nível 5). Ela não ocupa uma das 4 vagas sorteadas.
  - **Quando aparece:** na quarta, ou antes se a fila encher, e fica todo dia até a revisão da semana ser feita.
  - **Aviso:** uma vez por semana, na quarta ou quando a fila encher, o que vier primeiro.
- **Trava:** do aviso de início até terminar as cartas da semana; com a fila limitada a ~10 minutos, o tempo preso fica limitado.
- **Prêmio e relatório:** uma vez por semana, ao terminar ([prêmio proporcional](economia-v3.md#decisões)).
- **Repetição espaçada em semanas** (decidido; substitui os intervalos de 1, 3 e 7 dias): acertou, o item volta em 1 semana; acertou de novo, em 2 semanas; no terceiro acerto seguido, está dominado (+40 XP, uma vez por item e versão). Errou, volta na semana seguinte.
- **Hub fora da revisão:** "Revisão em dia · a próxima fica disponível na segunda".

**Parecer do agente sobre "o mais antigo sai da fila"** (pedido do usuário):
- **Concordo** com a fila limitada por tempo e com o aviso na hora em que ela enche.
- **Sugiro não apagar o erro mais antigo:** ele vai para uma **reserva** e volta numa semana com espaço na fila. Apagar perde justamente os erros mais antigos, que são os mais esquecidos e os que o jogador nunca reviu. A reserva não cresce sem fim: um item que passar 8 semanas nela sai de vez.
- **Prioridade dentro dos 10 minutos:** primeiro os itens que voltam pela repetição (já revistos, a caminho do domínio), depois os erros novos, do mais recente ao mais antigo. Erros repetidos do mesmo item contam uma vez só.

**Ainda em aberto (no painel do protótipo):**
1. **Fila cheia:** apagar o mais antigo ou mandar para a reserva?
2. **Missão:** +400 XP e 2 tickets, aparecendo na quarta (ou antes, se a fila encher) até a revisão ser feita?
3. **Aviso:** uma vez por semana, na quarta ou quando a fila encher, o que vier primeiro?
4. **Semana que acaba com a revisão começada e não terminada:** as cartas que faltam passam para a semana seguinte e a trava continua? (Sugestão: sim; o prêmio é pago quando terminar.)

**Para o código (quando aprovar):**
- **Servidor:** guardar a revisão da semana (começada, cartas da semana, feitas, trava e relatório visto), para a trava valer em qualquer aparelho e depois de fechar o app; o menu consulta essa trava para bloquear os outros modos. O prêmio de conclusão é pago pelo servidor, uma vez por semana.
- **Motor:** fila limitada por tempo estimado (~10 min) com a prioridade acima; reserva (se aprovada); intervalos em semanas no lugar de 1, 3 e 7 dias; o domínio continua no terceiro acerto seguido.
- **Missões:** a missão especial "revisão da semana" fora do sorteio das 4 (em `src/utils/missoes.js`), com o evento de conclusão da revisão da semana.
- **Aviso:** marca no perfil de "aviso da semana mostrado", para aparecer uma vez só.
- **Dados por resposta:** tempo até responder, gravado junto da tentativa (hoje só vão a escolha e o acerto); o ritmo e a indecisão são calculados no servidor a partir dele.
- **Relatório:** uma ação nova que junta as cartas da semana e pede à IA a análise, com cache; a explicação de cada alternativa precisa existir no banco. Hoje o Quiz tem uma explicação por pergunta (a da resposta certa); o V ou M, uma por frase (que já cobre as duas opções); o Erro médico, uma por etapa (linha, categoria e correção certas). **O "porquê" de cada alternativa errada é conteúdo novo**, com fonte e revisão médica, sobretudo no Quiz e no Erro médico.

Regra da memória do projeto: o protótipo traz as decisões de fluxo; no código, o visual segue os componentes atuais do app.

### Pendências

1. **Marcações `grave`:** revisão médica caso a caso no gabarito do Paciente DDX.
2. **Carta do Paciente DDX:** implementar no motor depois das marcações.
3. **Hub da Revisão:** protótipo v5 (modo foco, trava até o fim, relatório geral em anel, o monstro e o modo semanal) feito; faltam as quatro respostas sobre o modo semanal (fila cheia, missão, aviso e semana que acaba no meio) para portar ao código.
4. **Explicação por alternativa:** conteúdo novo, sobretudo no Quiz e no Erro médico, com fonte e revisão médica (pré-requisito do relatório geral).

## Experiência e decisões

O modo é gratuito e não consome nem concede tickets. Não concede XP, não avança missões e não modifica nível ou ranking. O benefício é responder novamente, receber correção com explicação e fonte e acompanhar o próprio progresso.

A fila é automática, sem filtro por tema nesta versão. Cada sessão tem até cinco itens diferentes dos erros do próprio jogador em Quiz ou Verdade ou mentira. Quiz mantém alternativas; frases erradas são revisadas individualmente como verdadeira ou falsa, para recuperar exatamente o conceito errado.

O gabarito só aparece depois de confirmar a resposta. Durante a sessão, a tela mostra o feedback anterior; ao terminar, mostra o relatório completo. É possível sair e retomar, ou encerrar antes do final; itens não respondidos continuam na fila. Sem erros, a tela orienta jogar. Sem itens disponíveis agora, informa a próxima data. O menu mostra sessão em andamento ou quantidade da última consulta, sem varrer o histórico ao entrar no app.

## Itens da Batalha diagnóstica (06/10/2026)

Os erros da Batalha também entram na fila: diagnóstico, conduta e complicação de cada doença, revisados como pergunta de quatro (ou três) alternativas. O banco é gerado das 12 doenças em `src/utils/batalhaRevisao.js` e só existe na API Supabase. Regras, critérios de acerto e versão estão em [ddx-batalha-diagnostica.md](ddx-batalha-diagnostica.md#erros-da-batalha-na-revisão-inteligente-pendência-12-06102026).

## Seleção e frequência

Cada unidade é identificada por `uid + modo + itemId + versao`. Edições de enunciado ou gabarito precisam incrementar a versão. Itens removidos ou versões ausentes do banco atual ficam fora da fila, preservando o histórico.

As tentativas são agrupadas por unidade e deduplicadas por rodada. Prioridade: nunca revisadas, mais erros, primeiro erro mais antigo. A tentativa mais recente no jogo também influencia a frequência.

| Resultado confirmado | Intervalo nominal |
| --- | --- |
| Erro no jogo principal | próxima sessão elegível |
| Primeiro acerto seguido na revisão | 1 dia |
| Segundo acerto seguido | 3 dias |
| Terceiro e demais acertos seguidos | 7 dias |
| Erro na revisão | próxima sessão elegível; sequência volta a zero |

**Teto de duas revisões respondidas do mesmo item em sete dias corridos.** O teto prevalece sobre os intervalos nominais, inclusive após novo erro no jogo. Exemplo: acertos no dia 0 e no dia 1 adiam a terceira revisão até o dia 7, em vez do dia 4. Dois erros no mesmo dia só permitem nova revisão sete dias depois. O item não se repete dentro da mesma sessão.

Um erro no jogo após a última revisão reinicia a sequência e devolve o item à fila, respeitando o teto. Um acerto posterior no jogo adia a apresentação por pelo menos um dia. Datas são calculadas no servidor em UTC e exibidas no horário local. Sete dias correspondem a sete períodos de 24 horas.

## Dados e API

A aba privada `RespostasTreino` fornece o histórico de Quiz e Verdade ou mentira, incluindo rodadas interrompidas. Ao consultar a revisão, a API repara registros pendentes das últimas rodadas antes de selecionar a fila.

`RevisoesTreino` nasce na primeira resposta salva. Seus 13 campos são `uid, revisaoId, itemId, versao, modo, tema, escolha, correta, acertou, data, sequencia, proximaRevisao, estado`. Cada resposta confirmada ocupa uma linha. UID vem da autenticação Firebase; enviar outro UID no corpo não muda o usuário consultado.

O perfil conserva apenas a sessão mais recente, contadores de itens/acertos/sessões/encerramentos antecipados e resumo da fila. O histórico permanente não cresce no JSON do perfil. Reset administrativo reinicia fila e contadores pelo marco `reiniciadoEm`, preservando as linhas de auditoria.

| Ação | Comportamento |
| --- | --- |
| `consultarRevisao` | Repara pendências e atualiza o resumo |
| `iniciarRevisao` | Seleciona até cinco itens; retoma sessão ativa sem criar outra |
| `responderRevisao` | Valida sessão, item, versão e escolha; calcula resultado e intervalo |
| `encerrarRevisao` | Fecha sessão parcial preservando respostas, sem agendar itens não respondidos |

O cliente envia ação, `revisaoId`, `itemId`, `versao` e escolha. Gabarito, datas, sequências e recompensas são calculados pelo servidor. Quiz exige ID de alternativa; frases exigem booleano, incluindo `false` como resposta válida.

As operações usam autenticação e lock existentes. Primeiro salvam o perfil, depois completam log e recibo. `historicoConfirmado` permite reparar interrupções por consulta ou reenvio. O recibo da sessão encerrada em `Partidas` tem XP zero. Repetir uma resposta devolve o estado salvo; alterá-la é rejeitado. A comparação usa valores e tipos, independentemente da ordem dos campos JSON, preservando a prevenção do [incidente do Quiz](historico/registros/incidente-quiz-rodada-mudou.md).

A leitura completa ocorre ao consultar/iniciar e atualizar a fila no encerramento. Login e consultas gerais só reparam uma revisão com gravação pendente. Não existe nova varredura completa em todo login. Grandes volumes ainda podem exigir indexação ou outra fonte de dados; o piloto usa as planilhas existentes.

## Arquivos e publicação

- `src/utils/revisaoInteligente.js`: seleção, intervalos, respostas e relatório.
- `src/components/RevisaoInteligente.jsx`: tela, retomada e recuperação de falhas.
- `docs/historico/apps-script/revisao-api.gs`: histórico privado e operações autenticadas.
- `docs/historico/apps-script/apps-script-ranking.gs`: rotas, reparação e reset administrativo.
- `scripts/homologacao.jsx`: dados fictícios locais e falha simulada.

Execute `npm run sync:plantao` após modificar regras ou APIs. O gerador incorpora a revisão em `docs/historico/apps-script/treinos-motor.gs`. Atualize Código.gs e Treinos.gs no editor remoto, compare com fontes locais e atualize a implantação existente. Salvar sozinho não atualiza /exec.

O piloto usa `REVISAO_LIBERADA = false` no backend e restrição correspondente no menu/tela. Após aprovação, atualizar ambos, gerar o artefato e publicar API e frontend.

## Verificações e prevenção

72 testes passaram: prioridade, versões removidas, gabarito oculto, intervalos, teto, novo erro, booleanos, reenvio reordenado, sessão parcial, isolamento por UID, acesso ao piloto, economia preservada e recuperação de escrita interrompida no perfil/log/recibo. Um teste compara fontes e artefato gerado para impedir publicação de motor desatualizado. Reset preserva histórico e só considera novas tentativas.

ESLint sem erros. Build concluída com `npm run build -- --configLoader runner`; permanece aviso existente de bundle JavaScript acima de 500 kB.

No navegador, homologacao.html usou cinco erros fictícios locais, sem alterar perfil real. Conferidos: estado vazio, sessão mista, resposta false, relatório 4/5, falha após gravação, reenvio e recarga sem duplicar. Só o erro retornou na próxima sessão; após a segunda resposta errada, todos aguardaram seus intervalos. XP permaneceu 490 e saldo zero. A entrada de homologação não integra a build de produção.

O teste do segundo acerto inicialmente esperava três dias mesmo com duas revisões na semana. O teto produziu seis dias de espera: corrigimos a expectativa e adicionamos cenário que comprova três dias quando o teto não se aplica. O gerador passou a não regravar artefatos inalterados, evitando uma falha de escrita desnecessária no motor DDX.

## Validação do piloto

1. Entrar como admin em http://localhost:5173/, abrir Revisão inteligente e conferir os erros registrados.
2. Responder, sair e voltar; recarregar após uma resposta e conferir retomada.
3. Conferir explicações, fontes e relatório; observar XP, saldo e missões preservados.
4. Conferir reapresentação do erro, adiamento dos acertos, sessão parcial e clareza da próxima data.
5. Aprovar o fluxo antes de liberar para jogadores e publicar o frontend no Vercel.

Testes locais validam interface/regras; testes de API simulam planilha. O fluxo autenticado com a planilha publicada foi conferido na auditoria de 28–30/09/2026: sessão real de quatro itens, retomada após interrupção, relatório 4/4 e preservação de XP/tickets. A aprovação do produto e a liberação para jogadores continuam pendentes. Veja os positivos, limitações e propostas na [auditoria dos modos](historico/registros/auditoria-modos-2026-09-29.md). Duração de sessão não é registrada nesta versão; o histórico permite comparar acertos e reapresentações sem alterar a economia.
