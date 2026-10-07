# App offline

Decidido pelo usuário em 07/10/2026. **Ainda não implementado.** Hoje o [app instalável](app-instalavel.md) só abre a casca sem rede: login, conteúdo e gravações dependem da internet. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-07102026--economia-v3-revisão-inteligente-v2-e-app-offline).

## Decisões

- **Todo o conteúdo funciona offline:** cruzadinhas, Quiz, Verdade ou mentira, Revisão Inteligente e todos os modos do DDX.
- O app **detecta** que está sem rede e avisa o jogador.
- O que for jogado offline fica numa **fila no aparelho** e é enviado sozinho quando a rede voltar.
- **Tickets do DDX são consumidos mesmo offline.**
- **A sessão vale 15 dias sem rede.** Depois disso, é preciso entrar de novo com internet.
- **Aceito pelo usuário:** os gabaritos ficam guardados no aparelho, porque a correção precisa acontecer sem servidor. Quem abrir as ferramentas do navegador consegue lê-los. O servidor revalida tudo ao sincronizar, então a pontuação oficial continua protegida.

## Como funciona

### 1. Detecção de rede

O hook `useConexao()` combina `navigator.onLine`, os eventos `online` e `offline` e uma checagem leve na API com tempo limite de 3 s. A checagem é necessária porque `onLine` diz "conectado" quando há Wi-Fi sem internet.

Um indicador discreto mostra quatro estados:
- online;
- offline;
- sincronizando N itens;
- N itens recusados, com toque para ver o motivo.

### 2. Fila de envio

Toda gravação passa por uma fila em IndexedDB, mesmo com rede. Assim existe um único caminho para salvar.

Cada item guarda:
- um ID gerado no aparelho;
- o UID do dono;
- o tipo (partida de cruzadinha, resposta de Quiz, rodada de V ou M, etapa de DDX, admissão, resposta de revisão etc.);
- os dados;
- a data local do evento;
- o número de tentativas;
- o estado: pendente, enviando, aceito ou recusado.

Itens aceitos saem da fila. Itens recusados ficam visíveis com o motivo e nunca somem calados.

### 3. Pacote de conteúdo

Com rede, o app baixa e guarda em IndexedDB:
- banco de palavras;
- perguntas e frases com gabarito, explicações e fontes;
- casos do Plantão, Erro médico, Causa e efeito, Paciente DDX e Batalha;
- a fila e o histórico da Revisão;
- a última foto do perfil e do ranking.

Cada parte tem um hash de versão. Ao abrir com rede, o app compara os hashes e baixa só o que mudou. O service worker continua cuidando só da casca e dos arquivos da build (`public/sw.js`); os dados de jogo não vão para o cache do navegador.

### 4. Sincronização

A sincronização começa:
- quando a rede volta;
- ao abrir o app;
- ao voltar para a aba;
- pela Background Sync API, onde ela existir (Android). O iPhone não tem essa API, então lá a fila só sai com o app aberto.

Os itens vão em ordem, um por vez, com novas tentativas e espera crescente. A Edge Function ganha a ação `sincronizarFila`, que, para cada item:
- ignora IDs já processados (idempotência, como o `entradaId` do DDX já faz);
- revalida a resposta contra o gabarito do servidor;
- recalcula XP, nível, tickets, missões e ofensiva com os motores compartilhados;
- devolve aceito, ou recusado com o motivo.

O valor que vale é sempre o do servidor. Enquanto a confirmação não chega, a tela mostra o XP como "provisório".

### 5. Telas offline

Cada modo corrige e pontua no aparelho com os motores de `src/utils` e `src/shared`, os mesmos da API, e grava na fila.

- **Dicas de IA da cruzadinha (nível 3 em diante):** ficam indisponíveis offline. Só as dicas estáticas funcionam.
- **Ranking:** mostra a última versão guardada, com a data.
- **Explicações por IA da Revisão Inteligente:** dependem de rede. Offline, a tela de revisão mostra a explicação guardada de cada item, que é revisada. Ao voltar a rede, o jogador pode pedir a explicação da IA ([Revisão v2](revisao-inteligente.md#llm-na-tela-de-revisão)).

### Tickets do DDX offline

Decidido em 07/10/2026: **o saldo nunca fica negativo.** Com saldo zero, os modos do DDX que cobram ticket ficam indisponíveis, online ou offline.

- O aparelho guarda o saldo confirmado pelo servidor e calcula o saldo local: o confirmado menos os consumos que estão na fila.
- **Tickets ganhos offline não entram nessa conta** até o servidor confirmar. Um ganho provisório pode ser recusado, e contar com ele faria o saldo ficar negativo.
- A admissão offline só é permitida com saldo local de pelo menos 1. Ela usa o `entradaId` de sempre, então o reenvio não cobra duas vezes.
- Com saldo local zero, o hub mostra os modos que cobram ticket como bloqueados. Se houver tickets ganhos offline esperando confirmação, avisa que eles liberam o modo quando a rede voltar.
- **Dois aparelhos offline gastando o último ticket:** o servidor processa a fila na ordem. Se o saldo já estiver em zero quando a admissão chegar, ela é recusada: o caso não paga XP e aparece em "não enviados" com o motivo "sem ticket na sincronização". O saldo nunca vai abaixo de zero. Esse é o único caso de recusa por ticket, porque o aparelho já bloqueia sozinho com saldo zero.

### Sessão de 15 dias

- Cada contato bem-sucedido com o servidor renova a "última validação". Sem rede, o app aceita a sessão guardada por até 15 dias desde essa data.
- Passados os 15 dias, o app pede login com internet. A fila não é apagada.
- A fila é presa ao UID. Se outra conta entrar no mesmo aparelho, os itens da conta anterior não são enviados em nome dela.
- Ao sair da conta com itens pendentes, o app avisa e oferece sincronizar antes.

## Regras contra fraude e conflitos

- **Data dos eventos:** missões, ofensiva e "primeira conclusão" usam a data local do evento. O servidor só aceita datas entre a última sincronização e o momento do envio. Datas no futuro ou anteriores à última sincronização são ajustadas para o envio.
- **Vários aparelhos:** cada item é independente e idempotente. Se dois aparelhos concluírem o mesmo caso pela primeira vez, só o primeiro processado recebe o XP de primeira conclusão.
- **Conteúdo desatualizado:** se o item foi jogado com uma versão antiga de pergunta ou caso, o servidor aplica a regra que vale hoje para versões antigas, que é não pontuar. O app avisa ao sincronizar.

## Limites conhecidos

- O iPhone e o Android podem apagar os dados do site quando falta espaço. O app instalado na tela de início é mais estável que uma aba, mas não é imune. O app deve pedir `navigator.storage.persist()` e avisar quando a fila não puder ser guardada.
- O tamanho do pacote de conteúdo precisa ser medido antes de fechar a forma de download (de uma vez ou por modo).

## Ordem de entrega

1. Detecção, fila e `sincronizarFila` com um tipo de item (resposta de Quiz), com testes de reenvio, ordem e recusa.
2. Pacote de conteúdo versionado.
3. Verdade ou mentira e Revisão Inteligente.
4. Cruzadinha.
5. DDX, com o consumo de tickets offline.
6. Sessão de 15 dias.
7. Teste em iPhone e Android reais: modo avião, voltar a rede e sincronizar com o app aberto e com o app fechado.
