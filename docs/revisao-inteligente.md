# Revisão Inteligente

Documento de produto e implementação para a próxima fase do cacoMed. A revisão será gratuita, baseada nos erros registrados em Quiz e Verdade ou mentira, e não consumirá tickets.

## Objetivo

Transformar erros recentes em sessões curtas de recuperação. O usuário deve rever o raciocínio, responder novamente e receber uma explicação clara. A sessão não deve substituir os jogos principais.

## Fonte de dados

A aba privada `RespostasTreino` já registra uma linha por item confirmado: UID, rodada, item/versão, modo, variante, tema, escolha, gabarito, acerto, data e estado. O servidor deve usar esse histórico como fonte de verdade.

O perfil mantém apenas totais e a entrada mais recente de cada modo. O histórico permanente não deve crescer indefinidamente dentro do JSON do perfil.

## Unidade de revisão

Cada cartão é identificado por `uid + modo + itemId + versao`. A versão é obrigatória: se o enunciado ou gabarito mudar, nasce uma unidade nova.

O cartão carrega enunciado ou frase, alternativas quando houver, tema, explicação e fonte. O gabarito não é enviado antes da resposta.

## Seleção e frequência

1. Buscar os erros do jogador.
2. Agrupar por `itemId + versao`, mantendo a tentativa mais recente e o total de erros.
3. Priorizar itens nunca revisados; depois os que têm mais erros; em empate, o mais antigo.
4. Limitar a sessão a cinco cartões sem repetir o mesmo item.
5. Aplicar intervalo após cada revisão.

Progressão inicial:

| Resultado | Próxima apresentação |
| --- | --- |
| Primeiro erro | próxima sessão elegível |
| Acerto após erro | +1 dia |
| Dois acertos seguidos | +3 dias |
| Três acertos seguidos | +7 dias |
| Novo erro | próxima sessão |

Recomenda-se no máximo duas aparições do mesmo item em sete dias, salvo revisão específica do tema.

## Sessão e recompensa

O modo é gratuito e não concede tickets. A primeira versão também não concede XP global, para evitar farm indireto de recompensas. O benefício é feedback, histórico de domínio e indicação de progresso.

Uma sessão tem até cinco cartões. O usuário pode sair e retomar a sessão salva. O resultado só é confirmado depois da gravação; reenvio não duplica tentativas nem altera o histórico.

Ao terminar, mostrar acertos, temas revisados, explicações, próxima data aproximada e botão para voltar aos jogos.

## Contrato de segurança

O cliente envia apenas `revisaoId`, `itemId`, `versao` e escolha. O servidor confere UID, item, versão e gabarito, calcula o resultado e grava a tentativa. XP, tickets e datas não são aceitos do cliente.

Manter lock, idempotência, reenvio seguro, rejeição de item alterado e comparação por valores de domínio, sem depender da ordem das propriedades JSON.

## Tela proposta

No menu, um card “Revisão inteligente” mostra quantos itens estão disponíveis. A tela explica o objetivo, apresenta cinco cartões, dá feedback imediato e mostra fonte. Sem erros, mostrar: “Você ainda não tem itens para revisar. Jogue uma rodada para criar sua primeira revisão.”

## Fases de implementação

1. Criar `RevisoesTreino`, leitura de erros, seleção, início, resposta, encerramento e recuperação.
2. Implementar `src/utils/revisaoInteligente.js` com testes de prioridade, intervalos, versões e reenvio.
3. Adicionar card do menu, sessão, feedback e estado vazio.
4. Gerar o motor Apps Script, publicar a API e validar com dados fictícios.
5. Liberar primeiro para administrador, medir repetição e clareza, e então liberar para todos.

## Métricas do piloto

Medir conclusão de sessões, acerto na primeira revisão, acerto na reapresentação, cartões por sessão, itens persistentes, duração e falhas de salvamento. Usar as métricas para ajustar intervalos e conteúdo, nunca para punir ou bloquear o usuário.

## Decisões ainda abertas

- Filtro por tema já na primeira versão ou somente fila automática.
- Reapresentação imediata após o erro ou retorno apenas à fila.
- Possível XP diário limitado após o piloto. A primeira versão permanece com XP e tickets zerados.
