# Revisão Inteligente

Implementada em 28/09/2026, como piloto para administrador. Backend publicado na **versão 19** da implantação existente, mantendo URL e permissões. Código.gs e Treinos.gs comparados integralmente com os arquivos locais, normalizando quebras de linha. Interface local em http://localhost:5173/; publicação no Vercel depende da validação do piloto. Deploy automático continua desativado.

## Versão 2: decidida em 07/10/2026, ainda não implementada

O usuário redefiniu o modo. As seções seguintes descrevem o piloto em vigor, que continua valendo até esta versão ser construída. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

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

### Itens da Batalha: pendência

Desde 06/10/2026, os erros da Batalha diagnóstica geram itens de revisão de múltipla escolha no piloto atual. A Revisão v2 não tem carta para eles, e o usuário decidiu em 07/10/2026 **deixar isso como pendência**.

Até a decisão:
- os itens continuam sendo gerados e guardados, sem perder histórico;
- eles não aparecem nas cartas da v2.

Opções para decidir depois:
- entrar nas cartas do Quiz;
- ganhar uma carta própria;
- deixar de ser gerados.

### LLM na tela de revisão

Decidido em 07/10/2026: a LLM **escreve a revisão para o jogador dentro do app**, por API. Não é usada para escrever rascunhos de conteúdo.

O projeto já usa a OpenRouter com o modelo `qwen/qwen3.8-27b:free` nas dicas de IA da cruzadinha, via `server/index.js` (rota `/api/ia`). **Essa rota só existe no servidor local:** em produção, `https://caca-med.vercel.app/api/ia` respondeu 404 em 07/10/2026. As dicas de IA não funcionam no site publicado, e a revisão não pode usar essa rota como está.

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

### Pendências

1. **Itens da Batalha:** ver acima.
2. **Marcações `grave`:** revisão médica caso a caso no gabarito do Paciente DDX.

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

As operações usam autenticação e lock existentes. Primeiro salvam o perfil, depois completam log e recibo. `historicoConfirmado` permite reparar interrupções por consulta ou reenvio. O recibo da sessão encerrada em `Partidas` tem XP zero. Repetir uma resposta devolve o estado salvo; alterá-la é rejeitado. A comparação usa valores e tipos, independentemente da ordem dos campos JSON, preservando a prevenção do [incidente do Quiz](incidente-quiz-rodada-mudou.md).

A leitura completa ocorre ao consultar/iniciar e atualizar a fila no encerramento. Login e consultas gerais só reparam uma revisão com gravação pendente. Não existe nova varredura completa em todo login. Grandes volumes ainda podem exigir indexação ou outra fonte de dados; o piloto usa as planilhas existentes.

## Arquivos e publicação

- `src/utils/revisaoInteligente.js`: seleção, intervalos, respostas e relatório.
- `src/components/RevisaoInteligente.jsx`: tela, retomada e recuperação de falhas.
- `docs/revisao-api.gs`: histórico privado e operações autenticadas.
- `docs/apps-script-ranking.gs`: rotas, reparação e reset administrativo.
- `scripts/homologacao.jsx`: dados fictícios locais e falha simulada.

Execute `npm run sync:plantao` após modificar regras ou APIs. O gerador incorpora a revisão em `docs/treinos-motor.gs`. Atualize Código.gs e Treinos.gs no editor remoto, compare com fontes locais e atualize a implantação existente. Salvar sozinho não atualiza /exec.

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

Testes locais validam interface/regras; testes de API simulam planilha. O fluxo autenticado com a planilha publicada foi conferido na auditoria de 28–30/09/2026: sessão real de quatro itens, retomada após interrupção, relatório 4/4 e preservação de XP/tickets. A aprovação do produto e a liberação para jogadores continuam pendentes. Veja os positivos, limitações e propostas na [auditoria dos modos](auditoria-modos-2026-09-29.md). Duração de sessão não é registrada nesta versão; o histórico permite comparar acertos e reapresentações sem alterar a economia.
