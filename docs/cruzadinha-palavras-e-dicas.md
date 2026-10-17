# Cruzadinha: memória de palavras e dicas sem IA

Pedido do usuário em 15/10/2026, feito na `main` no mesmo dia. **Site publicado em 15/10** (`dpl_2rrQWaNcimhRyv46t6KNeS2FKUSv`, branch `release/cruzadinha-1510`, sem o cadastro com código). **Falta publicar a API:** até lá, a memória só vale dentro da mesma visita (a API v15 ignora as `respostas`). Ver [[pendencias|Pendências]].

## Dicas por planilha e grade no servidor (17/10/2026)

Decidido com o usuário em 17/10/2026, feito na `main`; **publica na quinta 22/10** (API antes do site). Respostas dele:

1. **Várias planilhas de dicas, sem ordem de dificuldade.** O usuário cria mais 5 ou 6 planilhas no formato da atual; cada palavra pode ter uma dica por planilha. A grade sorteia, para cada palavra, uma dica que o jogador **ainda não viu naquela palavra**; quando ele já viu todas, volta a vista há mais tempo.
2. **O nível não filtra mais as palavras.** Num tópico pequeno o jogador decorava rápido as palavras do nível (retorno de um jogador). Agora qualquer palavra do tópico pode cair em qualquer nível; o nível só muda o multiplicador de XP e, até o 2, a primeira letra no laudo.
3. **Sai a coluna `nivelMinimo`.** As planilhas novas têm só **Palavra, Área, Subárea e Descrição**; o importador lê as colunas pelo nome do cabeçalho (com ou sem acento) e aceita a planilha antiga.
4. **Os links das planilhas** o usuário manda quando terminar (ver "Importar as planilhas", abaixo).
5. **A memória das palavras continua** (as respondidas só voltam quando faltam novas); a memória das dicas entra por cima.
6. **Dicas extras** (residente e paciente): ficaram como estavam, para decidir depois.
7. **As dicas novas entram direto no jogo**, sem revisão médica antes.

**Como funciona:**
- **Banco** (`montarBanco` em `importarBancoCSV.js`): junta a planilha principal e as de dicas pela palavra e pelo tópico (Área + Subárea). Cada palavra guarda `dicas` (uma por planilha, '' quando a planilha não tem a palavra). Palavra que só existe numa planilha de dicas também entra. A consulta pública `palavras` (lista de tópicos e jogo antigo) leva só uma dica por palavra.
- **Grade no servidor** (`emitirCruzadinha`, S-02): o app pede a grade do tópico; a API monta com o banco completo, a memória de palavras (`palavrasRespondidas`) e a memória de dicas (`dicasVistas[tópico][palavra]`, índices das planilhas já mostradas, do mais antigo para o mais recente) e guarda no perfil só as entradas (`cruzadinha.entrada`: palavra, posição, direção e dica). O app remonta a grade com `montarGrade`. A dica conta como vista quando a grade é emitida, mesmo que o jogador abandone.
- **Partida** (`registrarPartida` com `cruzadinhaId`): tópico, número de palavras, letras, maior palavra e respostas saem da grade emitida, não do app; a grade fecha ao gravar. O app antigo, sem `cruzadinhaId`, continua pelo caminho de antes (até sair).
- **Sem a ação no servidor** (API antiga) ou sem a API (Firestore antigo), o app monta a grade sozinho, como antes.
- **Custo:** cerca de 210 ms por grade no maior tópico (Patologia · Doenças, ~400 palavras), medido no computador; a cópia da matriz passou a ser rasa.

**Importar as planilhas (quando o usuário mandar os links):** baixar o CSV publicado de cada uma, conferir cabeçalho e quantas palavras casam com a planilha principal, e gravar em `cacamed_content` (`id = palavras`), no campo `data.dicas` como `[{ source, csv, rows }]`, na ordem das planilhas. A API lê esse campo a cada 5 minutos; não precisa publicar código.

## Dicas sem IA

**Problema:** do nível 3 do tópico em diante, as dicas pediam à IA (rota `/api/ia`, que só existe no servidor local). No site, o pedido falhava e a dica virava "Sem conexão com a IA".

**Agora** todas as dicas saem do banco de palavras (`src/utils/dicasCruzadinha.js`), que só tem uma descrição por palavra:

| Nível do tópico | Laudo | Dica do residente (−5 XP) | Relato do paciente (mais −10 XP) |
| --- | --- | --- | --- |
| 0 a 2 | descrição do banco + "Começa com a letra X" | não abre | não abre |
| 3 em diante | descrição do banco, sem a letra | "Começa com a letra X." | "Termina com a letra Y." |

- Os custos (5 e 15 XP) e o servidor não mudaram.
- A censura do radical da resposta na descrição continua igual.
- O nível usado é o da grade montada (não muda no meio da partida).
- O app não chama mais IA nenhuma: saiu `src/services/openrouter.js`. O `server/index.js` (rota `/api/ia`, só local) ficou para a decisão da Revisão v2.
- **Decisão do agente, para o usuário confirmar:** as dicas extras revelam letras porque o banco não tem as três camadas de texto que a IA escrevia. Se quiser outro conteúdo (por exemplo, uma segunda descrição no banco), é preciso uma coluna nova na planilha.

## Memória das palavras respondidas

**Problema:** no Sistema digestório, três cruzadinhas seguidas tiveram as mesmas palavras. No nível 0 há só 11 palavras de dificuldade até 1 (18 até 2), e cada grade usa até 20 palavras, então o sorteio caía sempre nas mesmas.

**Regra:**
1. Ao vencer, a partida manda as palavras da grade (`respostas`). O servidor confere se são do tópico e guarda no perfil, em `palavrasRespondidas[tópico]`, da mais antiga para a mais recente (`src/utils/memoriaPalavras.js`, até 600 por tópico). Partida abandonada não conta.
2. A próxima grade (`gerarTabuleiro`, opção `respondidas`) usa primeiro as palavras **novas**, embaralhadas, de qualquer nível (desde 17/10/2026; antes preferia as do nível do jogador) e, só quando faltam novas, as já respondidas, das **mais antigas** para as mais recentes.
3. Na mesma visita, o app também lembra as palavras das partidas vencidas, para valer mesmo antes de a API nova ser publicada.
4. O app antigo, que não manda `respostas`, continua gravando normalmente.

**Simulação com o Digestório real** (86 palavras, nível 0): as grades 1 a 4 não repetem nada (17 a 20 palavras cada, subindo a dificuldade aos poucos). Na 5ª, as novas acabam e voltam as mais antigas.

## Pendência: quando as palavras do tópico acabam

Hoje, de forma provisória, as respondidas há mais tempo voltam primeiro. Falta o usuário decidir o que acontece (ver a decisão na [[pendencias|lista de pendências]]). Ideias:
- recomeçar o ciclo com um aviso ("você viu todas as palavras do tópico");
- mostrar no tópico quantas palavras faltam e premiar quem completar;
- priorizar as palavras em que o jogador mais errou;
- pedir mais palavras para os tópicos pequenos.

## Testes

- `src/utils/memoriaPalavras.test.js`: ordem e limite da memória, três grades seguidas sem repetir, novas de outros níveis antes das repetidas, as mais antigas voltando primeiro, e as dicas por nível.
- `src/utils/apiSupabase.test.js`: o servidor guarda as respostas, recusa palavra fora do tópico e aceita o app antigo.
- Homologação: botões "Esquelético no nível 3 (dicas extras)" e "Esquecer palavras respondidas"; o banco fictício do esquelético passou para 24 palavras. Conferido em 15/10: dicas do nível 3 e as duas extras (−15 XP); a segunda grade trouxe as palavras novas, e as respondidas mais recentes ficaram de fora.
