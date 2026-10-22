# Batalha diagnóstica: modo história v2 e texto estilo Pokémon

Decidido com o usuário em 09/10/2026. **Portado para o código em 22/10/2026** (branch `feat/economia-v3`, sem deploy; ver [o porte](#porte-para-o-código-22102026)). O modo atual (a "Road to Doctor" da tela de Batalha, o relatório e os "Diagnósticos descobertos") continua como descrito em [ddx-batalha-diagnostica.md](ddx-batalha-diagnostica.md) até cada etapa sair. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-09102026--cadastro-bancos-separados-batalha-e-ddx-público).

## Referências e regra de arte

O usuário mandou duas referências de estilo:
- **Tela de conquistas do Minecraft:** mapa que se arrasta, fundo escuro texturizado, quadradinhos ligados por linhas, e linha verde quando o caminho está aberto.
- **Centro Pokémon em pixel art:** visão de cima, personagens pequenos andando pelo cenário.

São **só referência**. Toda a arte do jogo é **original**, sem imagens, sprites, sons nem nomes das duas franquias, e sem tentar ficar igual a elas.

**Como a arte será feita:** o usuário escolheu que eu gere a arte e os protótipos, e ele valida. O processo é o mesmo das telas já portadas: protótipo navegável (celular e web) → aprovação do usuário → porte para o app com as regras reais. Cada etapa visual (mapa, cenário e cutscene de entrada, cutscenes de transmissão, pergaminho) passa por esse ciclo.

## Fluxo de uma batalha da história

1. O jogador toca no ícone da doença no **mapa**.
2. **Cutscene de entrada:** visão de cima, o boneco do jogador anda até a cama do paciente.
3. **Transição** para a batalha (efeito original, definido depois com o protótipo).
4. **Batalha** como é hoje. No primeiro acesso, o tutorial; depois, o jogador joga sozinho.
5. **Descoberta:** o jogador acerta o diagnóstico.
6. **Cutscene de transmissão** dessa doença (abaixo).
7. **Animação de descoberta:** a doença se colore, como hoje.
8. A batalha **continua**.
9. **Vitória** → **relatório** → **resumo da doença** (o "pergaminho") → fim.

**Derrota:** só o relatório. Sem resumo e sem avançar na história. A doença continua disponível para tentar de novo.

## Mapa estilo conquistas

- Tela própria que o botão "Modo história" abre. Mapa que se arrasta (celular e web), com fundo escuro texturizado.
- Cada **ponto** é um paciente novo. No lugar dos ícones de itens do Minecraft, entra a imagem escura da doença ainda não descoberta, com o nome escondido ("??").
- **Estrutura:** os 3 capítulos atuais viram 3 ramos de 4 doenças cada. Cada doença abre a próxima do mesmo ramo. Linha entre pontos fica verde quando o caminho está aberto.

| Ramo (capítulo atual) | Doenças, na ordem |
| --- | --- |
| Primeiro plantão | pneumonia, dengue, malária, leptospirose |
| Vigilância no território | tuberculose, hanseníase, esquistossomose, Chagas |
| Do mato ao pronto-socorro | febre maculosa, leishmaniose visceral, febre amarela, doença meningocócica |

- **Estados de cada ponto:** bloqueado (silhueta escura e cadeado), disponível (silhueta escura e "?"), concluído (colorido, com o nome).
- O que já existe fica: a ordem das doenças, o tutorial no primeiro acesso, o desbloqueio por vitória e a lista "Diagnósticos descobertos".

## Cutscenes de transmissão

A cena mostra **como a doença chega ao paciente**. Em vez de 12 cenas, são **5**, reaproveitadas por via de transmissão:

| Cutscene | Doenças | Cena |
| --- | --- | --- |
| Ar ou gotículas | pneumonia, tuberculose, hanseníase, doença meningocócica | alguém tosse perto do paciente e partículas grudam nele |
| Inseto vetor | dengue, malária, leishmaniose visceral, febre amarela | um inseto pica o paciente (mosquito ou flebótomo, só muda o desenho) |
| Água ou lama | leptospirose, esquistossomose | pés na água de enchente ou de açude |
| Carrapato | febre maculosa | carrapato se fixa na pele |
| Alimento | Chagas aguda | alimento contaminado na mesa da família |

O tom é de aprendizado: a cena é rápida e **não revela o nome da doença** (o diagnóstico acabou de ser confirmado, mas o jogador ainda lê o nome só na animação seguinte).

## Pergaminho: resumo da doença

Aparece no fim da vitória e na enciclopédia. Reaproveita o JSON que já guarda cada doença (`batalhaConteudo.js`) e ganha um bloco novo de resumo. Campos propostos:

| Campo | Conteúdo |
| --- | --- |
| Resumo | 2 a 3 frases sobre a doença |
| Pontos fracos | o que a combate (vacina, terapia, medida de saúde pública) |
| Transmissão | via (uma das 5 acima) e como ocorre |
| Sintomas principais | até 5 |
| Sintoma marcante | o achado que destoa e ajuda a lembrar (por exemplo, manchas pelo corpo) |
| Profilaxia | quando existir |
| Tratamento recomendado | o mais comum (por exemplo, antibacteriano para bactéria) |
| Notificação | já existe em `notificar` |
| Fontes | já existem em `fontes`, com a página |

O texto parte dos campos que já existem (`aprendizado`, `conduta`, `buff.explica`, `notificar`, `fontes`) e entra como **não revisado**. Só vai para os jogadores depois da revisão médica do usuário.

## Enciclopédia

A lista "Diagnósticos descobertos" (hoje só mostra a ficha e o nome) passa a abrir o pergaminho ao tocar numa doença já descoberta. Doença não descoberta continua "???" e não abre.

## Texto da batalha estilo Pokémon

Hoje a batalha toca as falas em sequência, rápido demais. O comportamento novo:

1. Cada fala aparece **letra por letra** (efeito de digitação).
2. Com o texto completo, ele **fica parado** na tela, com uma seta piscando, **esperando um toque**.
3. Ao tocar, o texto some e a próxima fala começa, com a mesma animação.
4. **Tocar durante a digitação completa o texto na hora**, e um novo toque avança. É o comportamento do Pokémon.
5. Na web, a tecla Enter ou a barra de espaço faz o mesmo que o toque.
6. Eventos sem texto (só efeito visual ou mudança de barra) não esperam toque: tocam no ritmo normal.
7. A velocidade da digitação vale para todas as falas. O ajuste de velocidade pelo jogador fica para depois.
8. Quem usa "reduzir movimento" no aparelho vê o texto inteiro de uma vez, mas **continua tocando para avançar**.
9. Vale para o treinamento, a história e o Duelo (X1).

Nada muda no servidor: a lista de ações e os eventos são os mesmos.

## Protótipo (19/10/2026): partes 1 e 2

Arquivo: [`docs/prototipos/batalha-historia.html`](prototipos/batalha-historia.html). Abre direto no navegador, sem build. Os desenhos das 12 doenças e do médico vêm do app (`Species`, `Blob` e `Doctor` em `src/components/batalhaArte.jsx`), convertidos em SVG fixo; o resto da arte é original.

### Decidido pelo usuário em 19/10/2026 (parte 1)

1. **Silhueta:** forma real escurecida.
2. **Ramos em paralelo:** os três começam abertos, e cada vitória abre o próximo paciente do mesmo ramo (por serem da mesma área).
3. **Transição:** microscópio (a tela fecha num círculo sobre o paciente e reabre como uma lente sobre a batalha). A do batimento saiu.
4. **Cutscene de entrada e "Pular" da segunda vez em diante:** aprovados.
5. **Sem brilho piscando nos pacientes disponíveis.** Fica só a animação do caminho: ao abrir o mapa, a linha verde se desenha da raiz até a última "folha" aberta de cada ramo, uma vez.
6. **Padronizar os ramos**, para poder abrir ramos em todas as direções, e um **botão-guia para a próxima doença**.
7. **Celular na horizontal:** no celular em pé, a Batalha mostra um aviso para virar o aparelho.

### Decidido pelo usuário em 19/10/2026 (parte 2)

1. **Estilo das cenas: desenho animado, não pixel art.** A cutscene de entrada e as 5 de transmissão foram refeitas em vetor, no mesmo estilo dos desenhos das doenças (contorno escuro, formas arredondadas, cores chapadas com luz).
2. **Ramos:** aprovados como estão. Mais ramificações (ramos que se dividem) ficam para quando houver mais doenças.
3. **"Próximo paciente"** e o **aviso de virar o celular** (sem "continuar na vertical"): aprovados.
4. **Cenas de transmissão:** aprovadas, com mais informação no **texto**. O começo da cadeia de transmissão não precisa aparecer na cena, mas precisa ser dito na fala. Por exemplo: na malária, o mosquito picou antes uma pessoa doente e levou o parasita.
5. **Profilaxia e sintoma marcante:** o usuário coloca nos próximos lotes de conteúdo; os campos novos no conteúdo e a exibição no pergaminho ficam com o agente.

**Correção registrada:** o usuário lembrou da malária como "um inseto que picou um macaco com o vírus" (e avisou que podia estar errado). A malária é causada por um protozoário (*Plasmodium*); quem transmite é a fêmea do mosquito *Anopheles*, que pica antes uma pessoa doente. O macaco entra na cadeia da **febre amarela**, no ciclo da mata.

### O que o protótipo mostra agora

1. **Mapa com ramos padronizados (proposta do agente):** o "Início" fica no centro e cada ramo é uma **área**, com **cor, emblema e direção** próprios. Hoje: "Primeiro plantão" (febre aguda no plantão, âmbar, para a direita), "Vigilância no território" (atenção primária, azul, para cima) e "Do mato ao pronto-socorro" (zoonoses, verde, para baixo). Um ramo tracejado à esquerda mostra onde uma área nova entraria. Cada paciente tem uma faixa na cor do ramo. Dentro do ramo, a ordem vai do mais comum ao mais raro.
2. **"Próximo paciente":** botão que leva o mapa até o próximo paciente aberto, ramo por ramo, e abre a ficha dele.
3. **Ficha do paciente:** o caso no lugar do nome ("Febre depois da enchente · doença: ??") e "Atender paciente"; descoberto mostra o nome, o agente, "Rever o caso" e o pergaminho.
4. **Cutscene de entrada em desenho animado (original):** a enfermaria vista de cima, com janela, monitor de ECG animado, relógio, planta, um leito com outro paciente dormindo ("z" flutuando), cortina e o leito do paciente com o monitor. O médico entra pela porta e anda até o leito, virado para onde vai e balançando os braços; aparece um balão com "!", e vêm duas falas no estilo Pokémon.
5. **Transição em microscópio** para a batalha.
6. **Batalha (simulada):** "Simular: acertar o diagnóstico" leva à parte 2.
7. **Cutscene de transmissão (parte 2), em desenho animado original:** uma das 5 cenas, conforme a via, sem dizer o nome da doença. A cena se repete enquanto o texto está na tela e mostra só o último passo; as duas falas contam a cadeia inteira: primeiro como o agente chegou ali (só no texto), depois como chegou ao paciente (o que se vê). As cenas:
   - **Ar ou gotículas:** sala de espera; alguém tosse e as gotículas chegam ao rosto do paciente.
   - **Inseto vetor:** fim de tarde; um inseto pousa no braço e pica. Na leishmaniose, o inseto é menor e cor de areia (flebótomo).
   - **Água ou lama:** rua alagada; o paciente anda com os pés na água e os agentes chegam às pernas.
   - **Carrapato:** mato alto; o carrapato sobe do capim e se prende à perna.
   - **Alimento:** mesa da família; partículas caem na bebida e o paciente bebe.
8. **Descoberta:** a doença desconhecida encolhe e some; a forma real aparece escura, uma onda de luz sai dela, ela ganha cor, e o nome entra na barra e na fala ("É Leptospirose!"). A batalha continua.
9. **Relatório:** vitória (diagnóstico, turnos, +500 XP e "Ver o pergaminho") ou derrota (só o relatório e a volta ao mapa).
10. **Pergaminho:** papel envelhecido com dois rolos, que se desenrola. Rascunho montado **só com campos que já existem no app**, marcado "Rascunho · aguarda revisão médica":
    - resumo (`aprendizado`);
    - como chega ao paciente (a via, a cadeia de transmissão completa e a história do caso, `exames.anamnese`);
    - sintomas principais (`golpes`);
    - complicação a vigiar (`buff.nome` e `buff.explica`);
    - ponto fraco (`cura`);
    - tratamento recomendado (`conduta`);
    - notificação;
    - fontes com a página.

    **Profilaxia** e **sintoma marcante** não existem no conteúdo: o usuário vai colocá-los nos próximos lotes. Os campos novos no conteúdo da Batalha e a exibição no pergaminho ficam com o agente, no código.
11. **Enciclopédia:** botão do livro no mapa; as 12 doenças por ramo; descoberta abre o pergaminho, não descoberta mostra "???" e não abre.
12. **Volta ao mapa na vitória:** a doença ganha cor, nome e certinho, a linha até o próximo paciente fica verde e ele abre com um salto.
13. **Celular em pé:** aviso "Vire o celular" (com um celular girando), que bloqueia a Batalha até virar. O botão "Girar a tela" tenta girar sozinho no Android (tela cheia e trava de orientação). No iPhone o navegador não deixa forçar a orientação, então o aviso pede para virar e, se não girar, desligar o bloqueio de rotação. No celular deitado, as cenas em pixel art se ajustam à altura.

**Para o código (quando aprovar):** a orientação não dá para forçar por tela num site; o manifesto do app instalável vale para o app inteiro. Por isso o aviso fica na entrada da Batalha (e o botão de girar no Android). O padrão dos ramos vira dados no conteúdo: cada capítulo ganha cor, emblema e direção.

## Porte para o código (22/10/2026)

**Conteúdo e regras:**
- `src/utils/batalhaConteudo.js`: cada doença ganhou `via` (uma das 5 cenas) e `cadeia` (as duas falas abaixo); cada capítulo, `cor`, `icone`, `direcao` e `area`. São só apresentação, então a `versao` das doenças não mudou. No pacote do site, saem com o resto do conteúdo clínico ainda não revisado.
- **Ramos em paralelo** (`historiaLiberada` e `estadoNaHistoria` em `src/utils/batalha.js`, conferidos também no servidor): os três ramos começam abertos, e cada vitória abre o próximo paciente do mesmo ramo. As vitórias ficam em `concluidos`. O campo `historia` (progresso linear antigo) fica congelado e ainda conta como vitória.
- Campos opcionais `profilaxia` e `marcante` (texto) em cada doença: o pergaminho já mostra quando existirem. Enquanto não existem, a profilaxia aparece como "ainda não escrita".

**Tela:**
- `src/components/batalhaHistoria.jsx`: mapa, ficha, cena de entrada, microscópio, cena de transmissão, pergaminho, enciclopédia e aviso de virar o celular.
- `src/utils/batalhaCenasSvg.js`: as cenas em desenho animado, portadas do protótipo.
- `src/batalhaHistoria.css`: os estilos.
- **Ligação:** `BatalhaDiagnostica.jsx` liga tudo; `BatalhaArena.jsx` toca a cena de transmissão e a descoberta nova.
- **Fluxo:**
  1. No mapa, o jogador abre a ficha do paciente e toca em "Atender paciente".
  2. Escolhe o pet.
  3. Cena de entrada.
  4. Microscópio.
  5. Arena. Ao acertar o diagnóstico: "Mas como isso chegou até o paciente?", depois a cena de transmissão e a descoberta.
  6. Relatório. Na vitória, "Ver o pergaminho"; dele, a volta ao mapa, onde o paciente ganha cor e o próximo do ramo abre com um salto.
  7. Na derrota, "Voltar ao mapa".
- **Conferido na homologação local (computador, celular em pé e deitado):**
  - mapa e ficha;
  - cena de entrada, com o "Pular" na segunda visita;
  - microscópio e a cena de transmissão do inseto (malária);
  - descoberta, vitória, pergaminho e a volta ao mapa com o próximo paciente;
  - enciclopédia e o aviso de virar o celular.

**Escolhas do agente onde o protótipo não dizia** (o usuário pode trocar):
1. **O pet é escolhido antes da cena de entrada:** o servidor precisa do pet para abrir a batalha.
2. **"Pular" da segunda vez em diante**, contado por aparelho.
3. **A descoberta nova vale em todos os modos:** a doença desconhecida encolhe, a forma real aparece escura, sai a onda de luz e ela ganha cor, também no treino e no Duelo. A cena de transmissão é só da história.
4. **Botão de revisão do admin no mapa** ("liberar todos os pacientes"), como o mapa antigo tinha, para conferir as 12 doenças.
5. **A enciclopédia e a lista "Diagnósticos descobertos" do hub abrem o pergaminho** de toda doença descoberta, inclusive pelo Duelo.
6. **A "Road to Doctor" e o mapa antigo saíram.** A biblioteca de fontes fica na enciclopédia.
7. **O aviso de virar o celular vale para toda a Batalha** quando o celular está em pé (largura abaixo de 600 px).

## Cadeias de transmissão (rascunho para revisão médica)

Texto das duas falas da cutscene de transmissão e do pergaminho. Nenhuma fala diz o nome da doença, porque o jogador só lê o nome na animação de descoberta, logo depois. Escritas pelo agente em 19/10/2026; entram como **não revisadas**.

| Doença | Começo da cadeia (só no texto) | Último passo (na cena) |
| --- | --- | --- |
| Pneumonia pneumocócica | A bactéria vive no nariz e na garganta de muita gente saudável, sem causar doença. | Alguém tossiu perto do paciente e as gotículas chegaram até ele. Às vezes, depois de uma gripe, a bactéria desce para o pulmão. |
| Tuberculose pulmonar | Uma pessoa doente, ainda sem tratamento, solta o bacilo ao tossir, falar ou espirrar, e ele fica no ar de lugares fechados. | O paciente passou muito tempo nesse ambiente e respirou o bacilo. |
| Hanseníase | A bactéria passa pelas gotículas do nariz e da boca de uma pessoa doente que ainda não se trata. Com o tratamento, ela para de transmitir. | O paciente conviveu de perto, por muito tempo, com essa pessoa. |
| Doença meningocócica | A bactéria vive na garganta de pessoas saudáveis, que a carregam sem saber. | Num contato próximo, as gotículas e a saliva passaram para o paciente. |
| Dengue | Antes, uma fêmea do mosquito Aedes aegypti picou uma pessoa doente e levou o vírus. Depois de alguns dias, o mosquito ficou pronto para transmitir. | Agora, ela picou o paciente. |
| Malária por P. vivax | Antes, uma fêmea do mosquito Anopheles picou uma pessoa doente e levou o parasita, um protozoário, que amadureceu dentro dela. | Agora, ela picou o paciente. |
| Leishmaniose visceral | Antes, um mosquito-palha (flebótomo) picou um cão infectado, o principal reservatório na cidade, e levou o parasita. | Agora, ele picou o paciente. |
| Febre amarela | Na mata, mosquitos silvestres picam macacos infectados e levam o vírus. Os macacos adoecem como nós: eles avisam que o vírus está por perto e não devem ser mortos. | O paciente, sem vacina, foi picado perto da mata. |
| Leptospirose | Ratos e outros animais soltam a bactéria na urina. Na enchente, ela se mistura à água e à lama. | O paciente andou na água e na lama, e a bactéria entrou pela pele e pelas mucosas. |
| Esquistossomose mansônica | Fezes de pessoas infectadas chegam à água doce. As larvas crescem dentro de um caramujo e saem dele prontas para atravessar a pele. | O paciente entrou no açude, e as larvas atravessaram a pele das pernas. |
| Febre maculosa brasileira | O carrapato-estrela se infecta ao picar animais como capivaras e cavalos. | No mato, um carrapato se prendeu à pele do paciente e ficou ali por horas, tempo para passar a bactéria. |
| Doença de Chagas aguda | O barbeiro infectado pode ser moído junto com frutas, como o açaí, ou sujar o alimento com as fezes. | A família tomou o alimento contaminado, e o parasita entrou pela boca. |

## Perguntas em aberto

1. **Revisão médica** das cadeias de transmissão acima.
2. **Mais ramificações** no mapa, quando houver mais doenças (ideia do usuário, sem pressa).
