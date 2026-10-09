# Quiz, Verdade ou mentira e economia v2

Entrega de 28/09/2026. Quiz e Verdade ou mentira validados pelo usuário e liberados na versão 18; API atual na versão 19, incluindo o piloto da Revisão inteligente. Frontend local, aguardando validação do novo piloto e publicação Vercel. Deploy automático permanece desativado. [Histórico do incidente do Quiz, incluindo a tentativa anterior incompleta](incidente-quiz-rodada-mudou.md).

## Regras implementadas

| Atividade | XP | Tickets |
| --- | --- | --- |
| Quiz — Teoria | 20 por acerto, até 100 | 1 a cada 2 rodadas válidas |
| Quiz — Casos clínicos | 25 por acerto, até 125 | Mesmo contador de Teoria |
| Verdade ou mentira | 20 por classificação correta, até 100 | 1 a cada 2 rodadas válidas, contador próprio |
| Cruzadinha | Fórmula existente de letras, palavras, dificuldade, tempo e dicas | 2 por grade concluída |
| Missão diária | 50 por missão | 1 por missão |
| Subir de nível | Sem XP adicional | N tickets ao alcançar o novo nível N |
| Plantão médico | Regra existente, até 250 na primeira conclusão da versão | Custa 1 por atendimento |
| Erro médico / Causa e efeito | 25 por etapa, até 100 na primeira conclusão da versão | Custa 1 por análise |
| Revisão inteligente | Nenhum | Gratuita; não consome nem concede tickets |

Uma rodada válida tem cinco itens confirmados e pelo menos um acerto. Zero acertos não concede XP nem avança o contador. Os contadores sobrevivem à mudança de dia. Os dois novos jogos são gratuitos, sem bônus de tempo. Rodadas novas podem conceder XP novamente; reenvio da mesma rodada não duplica recompensas.

Quiz tem cinco questões por rodada, uma alternativa por questão. A confirmação salva a resposta e revela explicação e fonte. Após a quinta resposta, o servidor confirma relatório e recompensa.

Verdade ou mentira tem uma rodada com cinco frases. São sorteadas de uma a quatro verdades, sempre com pelo menos uma mentira. O usuário marca somente as verdadeiras e confirma o conjunto uma vez. Marcar uma verdade ou deixar uma mentira desmarcada conta como acerto; os opostos contam como erro. É necessário selecionar entre uma e quatro frases.

## Bancos separados: Quiz e Verdade ou mentira (09/10/2026)

**Problema** (relato de uma jogadora): o Quiz pergunta X e responde Y, e o Verdade ou mentira mostra a frase correspondente, então o aluno vê o mesmo assunto nos dois modos seguidos. Isso vem do banco atual: as 32 frases são a versão verdadeira e a falsa dos mesmos 16 conceitos das perguntas do Quiz.

**Decisão:** os dois modos passam a ter **bancos de conteúdo separados**, com conceitos diferentes.
- O Quiz mantém o banco atual.
- O Verdade ou mentira ganha um banco novo, com conceitos que **não** estão no Quiz. Cada conceito tem 2 frases (uma verdadeira e uma falsa), e a rodada só sorteia conceitos diferentes.
- O conteúdo novo é escrito por ChatGPT com o [prompt pronto](prompts/prompt-vou-m-frases.md) (40 conceitos por lote), entra como não revisado e só vai para os jogadores depois da revisão médica.
- As 32 frases antigas saem do sorteio quando o banco novo tiver conceitos suficientes. O histórico e a fila de revisão dos itens antigos ficam preservados (a regra de versão já tira itens removidos da fila sem apagar o histórico).
- Um teste passa a garantir que nenhum conceito do V ou M coincide com um assunto do Quiz.

**Depois:** a Revisão v2 completa sessões com itens parecidos por conceito, então cada banco precisa de vários itens por conceito.

## Nível e missões

O nível global considera todo o XP. Começa no nível 1, com zero XP. A dificuldade por tópico da cruzadinha continua separada, preservando o gerador.

XP total exigido para nível N: `500 × (N − 1)²`. Nível 2 em 500 XP, 3 em 2.000, 4 em 4.500 e 5 em 8.000. Menu, perfil e ranking usam a mesma fórmula. Barras mostram progresso entre o nível atual e o próximo.

Uma recompensa que cruza vários níveis concede tickets para todos os níveis alcançados. A migração preserva XP e saldo existentes, sem tickets retroativos. Ajustar XP/nível pelo admin atualiza o marco de recompensa, sem criar tickets de jogo. Não há XP por login nem ticket inicial de cadastro.

Três missões diárias: concluir uma cruzadinha, concluir duas rodadas válidas dos novos jogos e acertar cinco itens nos novos jogos. Cada uma concede 50 XP e um ticket uma vez por dia. O dia usa America/Sao_Paulo. A mudança de formato substitui missões antigas; saldos e XP recebidos permanecem.

## Banco e revisão inteligente

Banco inicial determinístico: 32 questões (16 Teoria, 16 Casos) e 32 frases (16 verdadeiras, 16 falsas), sobre 16 conceitos. Alternativas e ordem embaralhadas. A seleção prioriza itens ausentes da rodada anterior; versões opostas do mesmo conceito não aparecem juntas. Não usa geração por IA nem serviço pago. Fontes: CDC, NIDDK, NCBI e artigo sobre endolinfa coclear no PubMed, disponíveis após responder.

O banco foi validado pelo usuário e liberado para jogadores na API. As decisões e verificações do novo piloto estão em [Revisão Inteligente](revisao-inteligente.md).

Cada resposta confirmada registra na aba privada `RespostasTreino`: UID, rodada, item/versão, modo/variante, tema, escolha, gabarito, acerto, data e estado. Respostas de Quiz interrompido também são registradas. O perfil mantém somente a entrada mais recente de cada modo e totais acumulados; o histórico permanente não aumenta indefinidamente o JSON do perfil.

A revisão inteligente foi implementada como piloto admin: até cinco itens dos próprios erros, feedback com fontes, retomada e intervalos de 1/3/7 dias sujeitos ao teto de duas revisões do mesmo item em sete dias. Não altera XP, tickets ou missões. Histórico privado em `RevisoesTreino`; [regras, API e validação](revisao-inteligente.md).

## Salvamento e manutenção

Apps Script autentica a identidade Firebase, limita operações ao próprio perfil, valida item/versão e calcula resultado e recompensas. Quiz aceita acrescentar uma resposta, sem trocar respostas confirmadas. Verdade ou mentira aceita as cinco classificações juntas. Recibos em `Partidas` impedem reutilizar rodada encerrada; operações usam o lock existente.

Reenvio, consulta de perfil e início da rodada seguinte reparam registros de respostas/recibos que falharam após salvar o perfil. Não repetem recompensa. A interface oferece reenviar pedido ou consultar progresso salvo; bloqueia saída enquanto existe pedido sem resultado confirmado.

Fontes: `src/utils/economia.js`, `missoes.js`, `bancoTreinos.js`, `treinos.js`, `revisaoInteligente.js`, `docs/treinos-api.gs` e `docs/revisao-api.gs`. Execute `npm run sync:plantao` para gerar `docs/treinos-motor.gs`. Editor remoto: `Código.gs` (API), `Plantao.gs` (DDX) e `Treinos.gs` (economia, jogos e revisão). Salvar sozinho não atualiza `/exec`; atualizar a versão da implantação existente mantendo URL e permissões.

## Verificações

- 72 testes passaram após adicionar revisão, reset e equivalência do motor gerado. Os 60 anteriores cobrem banco, distribuição de verdades, XP, nível, migração, contadores, missões, zero acertos, respostas inválidas, recuperação de gravação interrompida, reenvio, recibos, campos reordenados pelo transporte e regressão de cruzadinhas/DDX.
- ESLint sem erros e build concluída; permanece o aviso de bundle JavaScript acima de 500 kB.
- Navegador: componente real `TreinoMedico`, serviço isolado e dados fictícios em `http://localhost:5173/homologacao.html`. Nenhum teste gravado no perfil real. Essa entrada não integra a build de produção.
- Quiz Teoria 4/5: +80 XP, 490 → 570, nível 2 e +2 tickets de nível. Recarga preservou a resposta anterior.
- Quiz Casos 5/5: +125 XP do jogo, +100 XP de duas missões, +3 tickets (um do jogo e dois das missões), total 795 XP e cinco tickets.
- Verdade ou mentira 3/5 e 5/5: +60 e +100 XP; ticket apenas na segunda rodada válida, total 955 XP e seis tickets. Cinco frases selecionadas bloquearam confirmação.
- Verdade ou mentira 0/5: XP, saldo e contador permaneceram iguais; explicações dos cinco erros exibidas.
- API/motor comparados no editor com arquivos locais, normalizando quebras de linha. Motor corrigido conferido e publicado na versão 17, mesma URL e permissões. GET público disponível na verificação anterior; isso não comprova fluxo autenticado completo.
- A versão 16 deixou de varrer e regravar rodadas ativas a cada resposta; a reparação automática agora ocorre somente em rodadas encerradas. A ponte também devolve a mensagem real do Apps Script quando disponível, em vez de mascarar todo erro como falha genérica.
- A versão 17 corrige o falso conflito causado por comparar respostas com `JSON.stringify`. Pergunta e escolha são comparadas por valor e tipo; mudanças reais continuam bloqueadas. Dois testes falharam antes da correção e passaram depois. Homologação agora reordena os campos do pedido; duas rodadas 5/5 e recarga foram verificadas no navegador, com dados fictícios (490 → 815 XP e 0 → 5 tickets).
- A build da correção passou com `npm run build -- --configLoader runner`, evitando o arquivo temporário de configuração bloqueado pelo Vite em execução.

O usuário validou os jogos existentes. Para a Revisão inteligente, o navegador conferiu cinco erros fictícios, reenvio, recarga, relatório e teto de frequência, sem gravar no perfil real. Fluxo autenticado do novo piloto com a planilha publicada permanece para validação do usuário; testes de backend usam simulação de planilha.

## Validação do usuário

1. Entrar como admin em localhost:5173; conferir menu, XP, nível e saldo preservados.
2. Jogar duas rodadas Quiz alternando variantes; conferir contador comum, XP, explicações e ticket. Recarregar após a primeira resposta para conferir retomada.
3. Jogar duas rodadas Verdade ou mentira; conferir conjunto, classificações, contador próprio e ticket na segunda rodada válida.
4. Conferir missões, uma cruzadinha (dois tickets do jogo e um da missão, quando aplicável), perfil, estatísticas e ranking.
5. Iniciar DDX e conferir consumo de um ticket, retomada sem nova cobrança e regra de XP preservada. Revisar conteúdo e ritmo antes de liberar banco e publicar frontend.
