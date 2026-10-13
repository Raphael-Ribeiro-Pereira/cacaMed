# Incidente: Quiz bloqueado por falso conflito de rodada

Data: 28/09/2026. Sintoma relatado: ao avançar no Quiz, especialmente na segunda rodada, a interface exibia primeiro `Falha ao consultar o servidor.` e, após a versão 16, `Error: A rodada mudou em outra aba. Consulte o progresso salvo.`

## Tentativas e o que aprendemos

| Etapa | Mudança ou verificação | Resultado e limite |
| --- | --- | --- |
| Entrega inicial, versão 15 | Testes do motor/API com planilha simulada e duas rodadas na interface isolada | Regras e recompensas funcionaram. Os objetos mantinham a mesma ordem de propriedades; a simulação não exercitava essa variação do transporte. O fluxo autenticado real não foi validado. |
| Primeira correção, versão 16 | Retirar reparação de rodadas ativas de cada chamada e devolver `erro.message` na ponte | Removeu trabalho redundante e revelou a mensagem real. Não corrigiu a comparação das respostas; o usuário confirmou que o travamento continuou. Não havia medição suficiente para atribuir o conflito à lentidão. |
| Reprodução dirigida | Salvar `{ itemId, escolha }` e reenviar a mesma resposta como `{ escolha, itemId }`, acrescentando o próximo item | Reproduziu exatamente `A rodada mudou em outra aba`, sem outra aba e sem modificar pergunta ou escolha. Dois testes novos falharam antes da correção. |
| Correção por conteúdo | Comparar `itemId` e `escolha` com igualdade estrita, conservar ordem dos itens e normalizar campos ao salvar | Aceita objetos equivalentes com propriedades reordenadas; continua rejeitando alteração de resposta confirmada, rodada diferente e escolhas inválidas. Reenvio não repete pagamento. |

## Causa comprovada e limites da evidência

`src/utils/treinos.js` usava `JSON.stringify` para comparar listas de respostas e cada resposta confirmada. A serialização inclui a ordem de inserção das propriedades: `{ itemId: 'q', escolha: 'a' }` e `{ escolha: 'a', itemId: 'q' }` geram textos diferentes, embora representem a mesma resposta. Objetos passam por postMessage, google.script.run e JSON na planilha; não há motivo para exigir que essa ordem seja preservada.

O defeito na comparação foi comprovado pela reprodução e pelos testes antes/depois. A sequência exata de reordenação no navegador habitual do usuário não foi capturada; não se deve apresentar o teste isolado como prova de integração autenticada completa. Verdade ou mentira usa o mesmo motor e também era vulnerável ao reenviar um conjunto já concluído.

## Correção e verificação

- `mesmaRespostaTreino` compara somente os valores de `itemId` e `escolha`. Não converte tipos: `false` difere de `'false'`.
- A identidade da rodada, quantidade de respostas, ordem dos itens, gabarito e proteção contra editar histórico continuam sendo validados.
- `docs/treinos-motor.gs` é regenerado por `npm run sync:plantao`; a correção deve ser publicada em `Treinos.gs`. Alterar somente o frontend ou salvar o editor remoto sem atualizar a implantação não corrige `/exec`.
- 60 testes passaram, incluindo duas rodadas Teoria/Casos com propriedades reordenadas, consulta de progresso, reenvio de cada resposta, rejeição de conflito real e dez registros de respostas/dois recibos sem duplicações.
- Os dois testes dirigidos falharam antes da correção e passaram depois; ESLint passou.
- Build passou com `npm run build -- --configLoader runner`. Esse carregador evita o arquivo temporário de configuração bloqueado pelo Vite em execução; não foi necessário encerrar o servidor do usuário. Permanece o aviso de bundle acima de 500 kB.
- Navegador, serviço isolado com reordenação de campos: duas rodadas 5/5 concluídas; recarga após a primeira resposta retomou o progresso. Perfil fictício: 490 → 815 XP, nível 2 e 0 → 5 tickets (inclui missões e nível). Nenhuma gravação no perfil real.

## Como evitar repetição

1. Para comparar objetos recebidos pela API, comparar campos de negócio com seus tipos. Usar JSON como formato de armazenamento/transporte, sem presumir igualdade textual entre objetos.
2. Ao reproduzir bugs de integração, simular também reconstrução de objetos, tipos, reenvio e persistência entre chamadas. Um teste que invoca diretamente o motor não cobre o transporte real.
3. Distinguir desempenho de correção funcional. Mensagem genérica e lentidão não demonstram a causa do conflito. Expor a mensagem real antes de atribuir a falha a um gargalo.
4. Só declarar resolução no ambiente remoto depois de conferir arquivo salvo e versão implantada. Registrar separadamente testes isolados, API simulada e validação autenticada real.
5. Nunca resolver esse erro removendo a proteção contra alterar respostas antigas ou apagando o histórico do jogador. A rodada salva permanece retomável por `Consultar progresso salvo`.

## Situação da publicação

Motor local corrigido e conferido integralmente com `Treinos.gs` no editor remoto, normalizando quebras de linha. A interface confirmou `Implantação atualizada. Versão 17 em 28 de set. de 2026, 16:39`, mantendo URL e permissões existentes. A publicação inclui o `Código.gs` da versão 16 e o motor corrigido.

Para retomar uma tela que já estava aberta na versão anterior: recarregar o aplicativo para recriar a ponte e usar `Consultar progresso salvo`, caso haja pedido pendente. O progresso já confirmado é preservado. A validação final com o login e a planilha reais do usuário permanece pendente; testes desta correção não alteraram seu saldo.
