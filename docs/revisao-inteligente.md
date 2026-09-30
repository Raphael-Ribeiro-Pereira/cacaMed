# Revisão Inteligente

Implementada em 28/09/2026, como piloto para administrador. Backend publicado na **versão 19** da implantação existente, mantendo URL e permissões. Código.gs e Treinos.gs comparados integralmente com os arquivos locais, normalizando quebras de linha. Interface local em http://localhost:5173/; publicação no Vercel depende da validação do piloto. Deploy automático continua desativado.

## Experiência e decisões

O modo é gratuito e não consome nem concede tickets. Não concede XP, não avança missões e não modifica nível ou ranking. O benefício é responder novamente, receber correção com explicação e fonte e acompanhar o próprio progresso.

A fila é automática, sem filtro por tema nesta versão. Cada sessão tem até cinco itens diferentes dos erros do próprio jogador em Quiz ou Verdade ou mentira. Quiz mantém alternativas; frases erradas são revisadas individualmente como verdadeira ou falsa, para recuperar exatamente o conceito errado.

O gabarito só aparece depois de confirmar a resposta. Durante a sessão, a tela mostra o feedback anterior; ao terminar, mostra o relatório completo. É possível sair e retomar, ou encerrar antes do final; itens não respondidos continuam na fila. Sem erros, a tela orienta jogar. Sem itens disponíveis agora, informa a próxima data. O menu mostra sessão em andamento ou quantidade da última consulta, sem varrer o histórico ao entrar no app.

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
