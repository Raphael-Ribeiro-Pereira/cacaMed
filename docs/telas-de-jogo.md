# Telas de jogo no visual do protótipo

Portadas em 07/10/2026 do "cacoMed Protótipo de Movimento" a pedido do usuário ("Pode implementar todas as telas"), com o mesmo design e as mesmas animações no celular e na web. As regras, o conteúdo e a gravação continuam os do jogo; o que o protótipo inventou e não existe no jogo foi adaptado e está descrito abaixo.

Peças compartilhadas: `src/components/resultadoUi.jsx` (resultado com extrato linha a linha, total contando, selo de gravação e reenvio; subida de nível global) e os estilos de `src/prototipo.css`.

## Cruzadinhas

Arquivos: `SelecaoTopicos.jsx`, `Jogo.jsx` e `src/utils/cruzadinha.js` (palavras da grade, estado das casas, palavras resolvidas e estimativa de XP, com testes). O antigo `Tabuleiro.jsx` saiu.

- **Seleção:** alas e tópicos vêm do banco de palavras. Nível e progresso de cada tópico saem de `xpTopicos`; na web, a "maestria" da ala é a média dos tópicos. A escolha fica guardada no aparelho.
- **Recompensa estimada:** o protótipo mostrava um valor fixo. Aqui ela usa a conta do jogo: até 12 palavras do tópico, cerca de 15% das letras nos cruzamentos, o multiplicador do nível e o bônus de tempo de 1,2. Os tickets mostram a regra real: +2 por plantão.
- **Tabuleiro:** a grade real é bem maior que a do protótipo (mediana de 23×23 casas, contra 7×7), então ele mantém zoom e arrasto. O zoom inicial cabe a grade na área disponível, com um piso para as casas não ficarem minúsculas. As casas têm o visual e as animações do protótipo: entrada em cascata, verde para letra certa, amarelo para letra de outra posição da palavra, vermelho para letra que não existe nela, e palavra acesa quando fica toda certa.
- **Digitação:** no celular, o teclado da tela do protótipo; na web, o teclado físico (letras, apagar, Enter ou espaço para trocar a direção, setas para andar). As regras de navegação são as do jogo (`navegacaoCruzadinha.js`): pular letras preenchidas e aceitar a letra repetida de um cruzamento. Do protótipo veio a passagem para a próxima palavra quando a atual fica toda certa.
- **Dicas:** o protótipo tinha "revelar letra · −15 XP", que não existe no jogo. Ficaram as dicas reais: laudo (do banco até o nível 2 do tópico, da IA a partir do 3) e, a partir do nível 3, as dicas extras do residente (−5 XP) e do paciente (mais −10 XP). No celular, a tecla "?" abre uma folha de confirmação; na web, os botões ficam na lista de dicas.
- **Correção de regra:** antes, cada dica extra cobrava por palavra e a soma podia passar de 15 XP, que o servidor recusa (`penalidadeXP` só pode ser 0, 5 ou 15). A partida não gravava nunca. Agora as dicas extras valem para a partida toda: 5 ou 15 XP.
- **Gravação:** a partida vai pela API com a sessão do usuário (`registrarPartida`), também para quem entra pelo Supabase. Antes dependia da sessão do Firebase. O Firestore antigo só carrega sob demanda.
- **Tutorial, saída e admin:** o tutorial de 6 passos (com texto atualizado para os controles novos), a confirmação de abandono e as ferramentas de admin (preencher palavra, finalizar, nova grade e nível do tópico) viraram folhas do protótipo.
- **Resultado:** o extrato do protótipo com as parcelas reais (letras, palavras, multiplicador do nível, bônus de tempo e dicas extras). Missões e tickets entram quando o servidor confirma. Se a gravação falhar, "Tentar salvar de novo" reenvia a mesma partida, sem contar duas vezes. A subida de nível global mostra os tickets do nível novo; o protótipo tinha patentes nomeadas, que o jogo não usa.

Homologação: "Testar cruzadinhas" usa um banco fictício pequeno e grava com a regra do servidor (`executarPedidoSupabase`). Também há "Simular falha ao gravar a cruzadinha" e "Rever tutorial da cruzadinha". A faixa da homologação agora recolhe, para caber no celular. Conferido em 07/10/2026 no celular (375 px) e na web (1280 px):
- tutorial;
- digitação pelos dois teclados, com letra errada, correção e palavra acesa;
- folha de dicas no nível 0;
- dicas da IA e extras no nível 3, com o servidor aceitando −15 XP;
- resultado com falha e reenvio;
- subida de nível;
- abandono com confirmação;
- nível do tópico pelo admin.

## Quiz e Verdade ou mentira

Arquivo: `TreinoMedico.jsx`. No protótipo, os dois modos eram sugestões de regra (relógio por pergunta, combo, 8 perguntas, 12 cartões em 60 segundos). O jogo já tem regras próprias, conferidas pelo servidor, e elas ficaram; o visual é o do protótipo. Em 07/10/2026 o usuário confirmou que os dois modos continuam sem cronômetro. O XP muda na [economia v3](economia-v3.md).

- **Abertura:** ícone, regras numeradas e o botão que enche no tempo previsto. A previsão aprende com a latência real das respostas da API nesta sessão (`registrarLatencia` em `utils/prototipo.js`). O protótipo carregava a rodada ao abrir a tela; aqui ela só é criada ao tocar em "Começar", porque `iniciarTreino` grava a rodada (e, no Quiz, depende da escolha entre Teoria, 20 XP, e Casos clínicos, 25 XP). Depois vem a contagem 3, 2, 1.
- **Quiz:** sem relógio e sem multiplicador de combo, que não existem no jogo. O HUD mostra acertos seguidos e o XP da rodada (20 ou 25 por acerto). Tocar na alternativa responde, como no protótipo; o gabarito fica no servidor, então a cor certa/errada aparece quando ele confere. Depois vêm a explicação e a fonte. "Próxima pergunta" (ou Enter) avança em vez do avanço automático do protótipo, para dar tempo de ler. Na web, as teclas 1 a 4 respondem.
- **Verdade ou mentira:** os cartões de arrastar do protótipo (direita é verdade, esquerda é mentira, setas do teclado também) para as 5 frases reais, sem relógio. A correção não vem a cada cartão, porque o servidor confere as cinco juntas. No fim há uma tela de revisão para trocar marcações e confirmar; ela exige de 1 a 4 verdades, como a regra do jogo.
- **Resultado:** o extrato do protótipo com XP por acerto, missões, medidor de tickets (2 rodadas válidas valem 1 ticket) e tickets de missões e nível. Abaixo, ou ao lado na web, vem a revisão de cada item, com a resposta, o gabarito, a explicação e a fonte.
- **Sair:** uma folha substitui o `window.confirm`, com três opções: continuar, sair e retomar depois, ou abandonar a rodada sem recompensa.

## Revisão Inteligente

Arquivo: `RevisaoInteligente.jsx`. O protótipo não tinha tela própria ("Revisar agora" abria o Quiz), então ela usa o layout do Quiz. As regras não mudaram: só para administrador, até cinco itens dos erros (Quiz, Verdade ou mentira e Batalha), intervalos de 1, 3 e 7 dias, sem XP e sem ticket.

- A abertura mostra a situação da fila (itens disponíveis, revisão em dia ou sem erros ainda) e as regras.
- Itens de Verdade ou mentira aparecem com duas alternativas.
- O resultado conta acertos em vez de XP (`unidade` no `Resultado`) e diz quando cada item volta.
- Sair pela folha: continuar, sair e retomar depois, ou encerrar a sessão.

Conferido em 07/10/2026 na homologação, no celular e na web:
- Quiz completo nas duas variantes, com as teclas 1 a 4 e Enter, e o abandono pela folha;
- Verdade ou mentira com cartões, revisão das marcações e resultado 5/5 com missões;
- Revisão com cinco erros fictícios e a falha simulada, que retoma do item seguinte depois de consultar a revisão salva.

## DDX: hub, admissão, Plantão, Erro médico e Causa e efeito

Arquivos: `PlantaoMedico.jsx` (hub, admissão, Plantão e resultado), `EtapasDdx.jsx` (Erro médico e Causa e efeito, que viraram invólucros dele), `ddxUi.jsx` (monitor e cadeia) e `src/utils/ddxVisual.js` (com testes).

- **Hub:** o monitor da paciente com os sinais vitais lidos do texto do caso e os três modos. As regras vêm dos dados: o caminho completo do Plantão é calculado com o motor real (250 XP), e Erro médico e Causa e efeito valem até 100 XP. Cada modo mostra se já foi concluído (repetir não dá XP) e se há uma partida em andamento ("Retomar", sem cobrar ticket). Para quem não é administrador, os botões ficam travados "Em revisão clínica" enquanto o conteúdo não tiver revisão. Batalha e Paciente DDX aparecem como os cartões "secretos" do protótipo, só para o administrador.
- **Admissão:** o ticket é cobrado em `iniciarPlantao`, `iniciarAuditoria` ou `iniciarRelacao` enquanto o monitor liga, por pelo menos 1,7 s. Se falhar, "Tentar de novo" reenvia o mesmo id, sem cobrar outro ticket. Corrigido em relação ao protótipo: lá a temperatura nunca acendia, porque a contagem parava antes do quinto valor.
- **Plantão:** as três colunas do protótipo na web (monitor, ações por grupo e prontuário); no celular, uma coluna. As ações respondem no aparelho com o mesmo motor do servidor. A reavaliação e o encerramento gravam com um selo ("Salvando", "Salvo", "Falhou. Toque para reenviar") em vez de travar a tela. Depois de reavaliar, o monitor mostra os sinais novos. Sair com ações não gravadas abre uma folha com três opções: salvar e sair, sair sem salvar ou continuar. O antigo botão "Salvar progresso" saiu.
- **Erro médico e Causa e efeito:** o prontuário auditado (com a hora de cada registro) ou o cenário com a cadeia causal fica ao lado da etapa na web. A etapa seguinte abre na hora e as alternativas entram no ritmo previsto da gravação. A confirmação seguinte espera a anterior gravar; se ela falhar, aparece "Etapa N não gravou. Toque para reenviar". Os nomes curtos das etapas e os rótulos da cadeia ("Poeira", "Broncoespasmo"...) são só de exibição e resumem as perguntas, sem gabarito.
- **Resultado:** o extrato do protótipo. No Plantão: raciocínio, segurança, eficiência e desconto, com o relatório de segurança, as omissões e a referência. Nas etapas: uma linha por etapa, a cadeia colorida e a explicação de cada uma. O XP mostrado é o confirmado pelo servidor; a repetição aparece como ×0.

Homologação: "Testar DDX", "Garantir 3 tickets" e "Simular falha no próximo pedido". Conferido em 07/10/2026 no celular e na web:
- Plantão completo e seguro (210 XP), com a reavaliação gravando e o monitor trocando os sinais;
- confirmação de alta e saída com "Salvar e sair";
- Erro médico com falha e reenvio na etapa 2;
- Causa e efeito com a cadeia acendendo;
- hub com "Concluído" e "Retomar".

## Publicação

Publicado em produção em 07/10/2026 junto com o app instalável: deploy `dpl_C3Ni3PRx3askHXKa7Wrmbnv9hsPa`, commit 8e08a63. A API não mudou (Edge Function continua na versão 12).
