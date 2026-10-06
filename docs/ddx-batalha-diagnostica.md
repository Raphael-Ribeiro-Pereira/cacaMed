# Modo secreto DDX — Batalha diagnóstica

## Status

Documento de concepção aprovado em 30/09/2026. Implementação local em 02/10/2026, a pedido do usuário, como piloto do administrador: frontend, motor, operação da API e testes. A API ainda não foi publicada na Edge Function e o conteúdo ainda não tem revisão médica.

## Implementação de 02/10/2026

### Escopo decidido com o usuário

- A Batalha só recebe doenças que cabem no duelo: agente infeccioso (bactéria, vírus, protozoário ou helminto) e uma terapia que o controla (antibacteriano, antiparasitário ou suporte). Casos que pedem consulta completa (dor torácica, pré-natal, AIDPI, animais peçonhentos) ficam para o futuro modo Paciente DDX, avaliado à parte.
- História com 12 doenças em 3 capítulos, organizados por tema: Primeiro plantão (pneumonia pneumocócica, dengue, malária vivax, leptospirose), Vigilância no território (tuberculose, hanseníase, esquistossomose, Chagas aguda) e Do mato ao pronto-socorro (febre maculosa, leishmaniose visceral, febre amarela, doença meningocócica).
- Respostas às pendências de design: Duelo clínico como nome provisório do X1; três pets (Cocobi, Capsi, Pulsa) escolhidos antes da doença; quatro habilidades com recarga em turnos; diagnóstico informado em uma lista de 5 hipóteses (a certa e 4 diferenciais da fonte); vitória quando a carga da doença chega a zero; derrota quando a estabilidade do paciente chega a zero; evolução com buff de um de três efeitos (golpes 50% mais fortes, −6 de estabilidade por turno ou escudo que segura a carga em 25%).

### Arquivos

| Arquivo | Papel |
| --- | --- |
| `src/utils/batalhaConteudo.js` | 12 doenças, capítulos, hipóteses extras e fontes. Cada fato tem fonte e página do PDF, conferidas contra o texto dos arquivos em 02/10/2026. `versao` por doença; `revisado: false` mantém o modo restrito ao administrador. |
| `src/utils/batalha.js` | Motor determinístico: `aplicarAcao`, `executarBatalha`, `recompensaBatalha`. O navegador usa para a resposta imediata; o servidor reexecuta a lista de ações para validar. |
| `src/shared/operarJogosSupabase.js` | `operarBatalhaSupabase`: `iniciarBatalha`, `acaoBatalha`, `abandonarBatalha` e `pularTutorialBatalha`. Recibo ao encerrar, na mesma transação do XP. |
| `src/components/BatalhaDiagnostica.jsx`, `BatalhaArena.jsx`, `batalhaArte.jsx`, `src/batalha.css` | Hub, mapa, fontes, escolha do pet, arena, treinamento guiado e relatório. Estilos isolados sob `.cbt`. |
| `scripts/homologacao.jsx` | Botões Testar Batalha, Reiniciar Batalha e Simular falha no próximo turno. Usa `executarPedidoSupabase` local sobre dados fictícios. |

### Contrato com o servidor

- O cliente envia somente a lista de ações (`{ t: 'exame' | 'hipotese' | 'golpe' | 'pet', id }`). O servidor reexecuta o motor, aceita apenas listas que estendem a anterior e calcula resultado e XP. Reenvio idêntico devolve o perfil sem pagar de novo.
- A doença do Duelo é sorteada no servidor, depois da escolha do pet. O treinamento usa pneumonia e Cocobi.
- Os turnos são gravados em segundo plano; o relatório só aparece depois que o servidor confirma o encerramento. A batalha aberta é retomada após recarregar a página.
- A Batalha usa só a API Supabase. Com `VITE_FONTE_DADOS=planilha` a tela informa que o modo depende do Supabase; o Apps Script não recebeu essas operações.

### Economia: proposta do protótipo, aguardando aprovação

| Situação | XP | Tickets |
| --- | --- | --- |
| Treinamento | 50 na primeira conclusão | Gratuito |
| História: vitória | 60 + diagnóstico (20 na primeira hipótese, 10 com hipóteses erradas) + 20 se neutralizar o buff − 5 por terapia ineficaz; só na primeira vitória de cada doença e versão | Gratuita |
| História: derrota ou repetição | 0 | Gratuita |
| Duelo: vitória | Mesma fórmula da História, em toda partida | 1 por partida |
| Duelo: derrota | 10, mais 10 se o diagnóstico foi confirmado | 1 por partida |
| Abandono | 0 | O ticket do Duelo não volta |

O XP soma em `xpTopicos['DDX-BATALHA']`. Missões diárias não contam a Batalha. Antes de liberar para jogadores, o usuário precisa aprovar ou ajustar estes valores.

### Antes de liberar para jogadores

1. Revisão médica das 12 doenças (exames, diferenciais, terapia, buff, conduta). Várias fontes são de 2008 a 2013; a conduta precisa ser conferida com os protocolos atuais. Exames numéricos são ilustrativos. Depois da revisão, marcar `revisado: true` e aumentar `versao` quando o conteúdo mudar.
2. Aprovar a economia acima.
3. Executar `node scripts/sincronizar-supabase.mjs` (já executado nesta etapa) e publicar a Edge Function `cacamed-api`. Até a publicação, a API remota responde "Ação desconhecida" para as operações da Batalha.
4. Validar no navegador com o administrador: treinamento, uma batalha de cada capítulo, Duelo, retomada após recarga, falha de rede e reenvio.
5. Pendência 12 continua aberta: os erros da Batalha ainda não alimentam a Revisão Inteligente.

### Verificação

- 9 testes novos em `src/utils/batalha.test.js`: conteúdo, vitória possível nas 12 doenças, determinismo, ações inválidas, buffs, recompensas, restrição ao administrador, idempotência, recibo único, repetição sem XP, ticket do Duelo e abandono.
- Lint e build passaram. Homologação local (navegador, dados fictícios): treinamento completo (+50 XP), História com Chagas (+90 XP confirmado), Duelo com cobrança de ticket, falha simulada com reenvio e retomada após recarga.

## Visão do modo

O jogador assume o papel de um médico que enfrenta uma doença em uma batalha 2D inspirada em jogos de criaturas, sem copiar personagens, nomes, artes ou elementos protegidos de outras franquias.

A doença aparece inicialmente como uma criatura monocromática, sem identificação, com um símbolo de interrogação. O jogador usa habilidades médicas para investigar, reconhecer e controlar a doença. O objetivo didático é ensinar como raciocinar e agir diante de diferentes agentes e síndromes: bacterianos, virais, protozoários e outros grupos que forem incluídos no banco revisado.

A batalha representa o controle da doença e a proteção do paciente. O médico nunca causa dano ao paciente. Uma escolha inadequada pode fortalecer a doença, aumentar sua resistência ou acelerar a deterioração do quadro, mas não deve ser apresentada como um ataque direto ao paciente.

## Modos de jogo

### História — Road to Doctor

Campanha progressiva que apresenta doenças em uma ordem pedagógica. Cada capítulo introduz uma família de agentes, sinais importantes, exames, tratamento e erros comuns.

A campanha deve ensinar o conteúdo antes de exigir domínio. Um capítulo pode conter uma ou várias batalhas curtas, com explicações após as decisões e desbloqueio gradual de habilidades e companheiros auxiliares.

A progressão planejada é:

1. reconhecer o tipo de doença;
2. investigar por pistas e exames;
3. escolher uma resposta adequada;
4. observar a reação da doença;
5. lidar com a revelação e o aumento de resistência;
6. concluir com um relatório didático.

### Modo X1 — nome provisório

Partida aleatória contra uma doença sorteada. O jogador não segue a ordem da campanha e recebe uma combinação variável de doença, pistas, habilidades e condições de batalha.

O nome final deve ser escolhido antes da implementação da interface. Sugestões iniciais: **Duelo Clínico**, **Confronto DDX**, **Plantão Surpresa** ou **Arena Diagnóstica**.

Esse modo deve ser mais rejogável que a História e pode usar tickets do DDX quando a economia for definida para ele.

## Personagem e companheiros

O jogador controla somente o médico. Antes da partida, escolhe um companheiro auxiliar, chamado provisoriamente de **pet clínico**. Esses companheiros terão identidade visual própria, sem referência direta a Pokémon ou outras franquias.

Cada companheiro possui uma especialidade e uma habilidade de emergência. A habilidade não fica disponível o tempo todo: ela pode aparecer em momentos críticos, como resistência alta, vida do paciente em risco ou após uma sequência de escolhas difíceis.

Exemplos de especialidades:

- **Bacteriologia:** aumenta a eficiência de uma habilidade contra bactérias.
- **Virologia:** revela uma pista sobre padrão de transmissão ou replicação.
- **Parasitologia:** reduz a resistência de doenças protozoárias.
- **Imunologia:** protege contra um buff defensivo da doença.
- **Terapia intensiva:** estabiliza a situação quando a doença acelera.
- **Farmacologia:** reduz a penalidade de uma escolha terapêutica adequada.

Esses exemplos são conceitos, não nomes ou habilidades finais. Os efeitos devem ser balanceados para ajudar o raciocínio, sem permitir que o pet resolva a partida sozinho.

## Fluxo de uma batalha

### 1. Apresentação

A doença surge sem cores e sem nome. O jogador recebe uma descrição curta, os sinais já conhecidos e as habilidades disponíveis.

### 2. Investigação

O jogador escolhe habilidades de investigação, suporte ou tratamento. Cada habilidade possui tempo de recarga. Não haverá custo de energia nesta primeira versão.

As habilidades podem:

- revelar uma pista;
- testar uma hipótese;
- diferenciar agentes parecidos;
- proteger o paciente;
- reduzir a resistência da doença;
- causar dano à doença quando a escolha for diretamente adequada.

### 3. Descoberta

O diagnóstico não é revelado automaticamente por um percentual fixo de vida. Quando o jogador identifica corretamente a doença, ela se revela visualmente e passa a mostrar seu nome, tipo, fraquezas e conduta principal.

Se, durante a fase oculta, o jogador escolher uma habilidade diretamente eficaz contra aquela doença, a doença perde vida mesmo antes de ser revelada. Isso recompensa conhecimento sem obrigar o jogador a esperar a revelação.

### 4. Evolução da doença

Após a revelação, a criatura muda de forma de maneira moderada, recebe cores e apresenta uma evolução visual. A evolução deve comunicar que a doença se adaptou, sem ser uma transformação exagerada.

A doença pode ganhar:

- resistência aumentada;
- novo padrão de comportamento;
- uma habilidade defensiva;
- uma complicação que exige nova decisão.

O buff deve ser legível e explicado ao jogador. Ele representa progressão do desafio, não uma punição escondida.

### 5. Controle e encerramento

A batalha termina quando a doença é controlada segundo o objetivo daquele encontro. O jogo não precisa simular o tratamento completo do paciente nem substituir uma aula ou protocolo clínico.

O relatório deve mostrar:

- doença enfrentada;
- pistas que levaram ao diagnóstico;
- decisões corretas;
- escolhas ineficazes;
- buffs ativados;
- habilidade do pet utilizada;
- conduta esperada em um cenário real;
- resumo do aprendizado.

## Categorias de habilidades

| Categoria | Função didática |
| --- | --- |
| Investigação | Revelar sintomas, exames e características do agente |
| Diferenciação | Separar doenças com apresentação semelhante |
| Terapia | Aplicar a intervenção adequada |
| Suporte | Proteger o paciente e conter a deterioração |
| Prevenção | Interromper transmissão ou complicações |
| Resposta crítica | Reagir a um buff ou evento especial |

Os nomes iniciais devem ser trocadilhos baseados em termos reais. Exemplos de direção: **BactiBaque**, **ViroVisão**, **ProtoPista**, **ImunoEscudo** e **Dose Certa**. Os nomes definitivos dependem da revisão de conteúdo e da identidade visual.

## Regras de segurança pedagógica

- O jogo deve deixar claro que é uma simulação educacional.
- Uma única decisão nunca deve ser apresentada como protocolo universal.
- A explicação pós-batalha deve indicar quando uma conduta depende de contexto, gravidade ou protocolo local.
- O conteúdo precisa de revisão clínica antes de ser liberado para jogadores comuns.
- O modo deve ensinar o processo de raciocínio, não apenas decorar fraquezas.
- Doenças, exames e tratamentos devem ter fontes registradas no banco de conteúdo.

## Recompensas e economia

Ainda não há regra aprovada para XP, tickets ou custo de entrada desse modo. A decisão deve respeitar a economia já documentada em `docs/jogos-e-economia-v2.md` e ser tomada antes da implementação do backend.

A princípio, o Modo X1 poderá consumir tickets por ser uma variação do DDX. A História pode ser gratuita durante a fase de ensino ou cobrar tickets somente em capítulos repetíveis. Essa é uma hipótese de design, não uma decisão aprovada.

## Escopo da primeira versão

A primeira versão deve conter:

- uma arena 2D simples;
- uma doença bacteriana, uma viral e uma protozoária;
- fase oculta e revelação por descoberta;
- pelo menos quatro habilidades por batalha;
- um pet para cada uma de três especialidades;
- recarga das habilidades;
- buff visível após a evolução;
- relatório final com explicações;
- História com uma sequência curta;
- Modo X1 com sorteio de uma batalha;
- persistência, retomada e proteção contra recompensas duplicadas.

Animações avançadas, PvP real, ranking exclusivo, grande coleção de pets e dezenas de doenças ficam fora do primeiro protótipo.

## Pendências para a entrevista de design

1. Escolher o nome definitivo do Modo X1.
2. Definir se a História será gratuita ou consumirá tickets.
3. Definir o custo de entrada e as recompensas do X1.
4. Escolher os três primeiros casos e revisar suas fontes.
5. Definir quantos pets estarão disponíveis no protótipo.
6. Definir se o jogador escolhe o pet antes da doença ser sorteada ou depois.
7. Definir o número máximo de habilidades equipadas por batalha.
8. Definir a duração da recarga e se ela passa em turnos ou em tempo real.
9. Definir como o jogador informa que descobriu a doença.
10. Definir a condição objetiva de vitória de cada caso.
11. Definir o tom visual da evolução da doença.
12. Definir como os erros deste modo alimentarão a Revisão Inteligente.

## Critério de conclusão

O modo será considerado pronto quando a História e o Modo X1 tiverem partidas jogáveis, conteúdo revisado, salvamento idempotente, retomada após recarga, relatório compreensível, recompensas confirmadas no servidor e validação do usuário no navegador.
