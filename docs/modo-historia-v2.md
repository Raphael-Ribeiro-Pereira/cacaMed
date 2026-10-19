# Batalha diagnóstica: modo história v2 e texto estilo Pokémon

Decidido com o usuário em 09/10/2026. **Nada disto está implementado.** O modo atual (a "Road to Doctor" da tela de Batalha, o relatório e os "Diagnósticos descobertos") continua como descrito em [ddx-batalha-diagnostica.md](ddx-batalha-diagnostica.md) até cada etapa sair. O andamento fica no [cronograma](cronograma-recuperacao-caca-med.md#plano-de-09102026--cadastro-bancos-separados-batalha-e-ddx-público).

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

## Protótipo, parte 1: mapa, cutscene de entrada e transição (19/10/2026)

Arquivo: [`docs/prototipos/batalha-historia.html`](prototipos/batalha-historia.html). Abre direto no navegador, sem build. Os desenhos das 12 doenças e do médico vêm do app (`Species`, `Blob` e `Doctor` em `src/components/batalhaArte.jsx`), convertidos em SVG fixo; o resto da arte é original.

1. **Mapa estilo conquistas:** fundo escuro texturizado (ruído e grade leve), que se arrasta com o dedo, o mouse ou a roda. No centro da esquerda, o "Início" (o médico); dele saem os **3 ramos** (os capítulos atuais), com 4 pacientes cada, ligados por linhas em ângulo reto. Estados: **bloqueado** (silhueta escura, borda tracejada e cadeado), **disponível** (silhueta escura, borda que brilha e "?") e **descoberto** (colorido, com o nome e um certinho). A linha fica verde quando o caminho até o paciente está aberto. Botão para centralizar.
2. **Ficha do paciente:** ao tocar num ponto, a ficha mostra o caso no lugar do nome ("Febre depois da enchente", "Primeiro plantão · 3 de 4 · doença: ??") e "Atender paciente". Bloqueado diz qual paciente vencer antes; descoberto mostra o nome, o agente e "Rever o caso".
3. **Cutscene de entrada em pixel art (original):** a enfermaria vista de cima, com piso em xadrez, janela, monitor de ECG na parede, um leito com outro paciente dormindo, cortinas e o leito do paciente da batalha com o monitor ao lado. O médico entra pela porta, anda até o leito, aparece um "!", e duas falas no estilo Pokémon (letra por letra, seta piscando, toque para avançar): "Leito 4. Paciente com ..." e "Ninguém sabe ainda o que ele tem. Vamos investigar."
4. **Botão "Pular":** aparece da segunda vez em diante (ou sempre, no painel do protótipo).
5. **Transição** (duas opções originais para escolher): **batimento** (a linha do monitor cruza a tela com um pico e fecha em persianas, que abrem na batalha) ou **microscópio** (a tela fecha num círculo sobre o paciente e reabre como uma lente sobre a batalha).
6. **Início da batalha (simulado):** a doença desconhecida (o `Blob` com "?") e o médico de costas, com as duas primeiras falas. Botões "Simular vitória" e "Simular derrota".
7. **Volta ao mapa:** na vitória, a doença ganha cor, nome e certinho, a linha até o próximo paciente fica verde e ele abre com um salto; no fim do ramo, "Ramo completo". Na derrota, nada muda e a doença continua disponível.

**Regra de progressão usada no protótipo** (interpretação do agente a partir de "cada doença abre a próxima do mesmo ramo"): os três ramos começam abertos, com o primeiro paciente de cada um disponível. Hoje o jogo é linear nas 12 doenças.

**Fica para a parte 2:** cutscenes de transmissão, animação de descoberta, pergaminho e enciclopédia.

## Perguntas em aberto

1. **A silhueta revela demais?** Hoje o jogador só descobre o tipo do agente (vírus, bactéria etc.) pelas habilidades do pet. Uma silhueta com a forma real da doença já mostra o agente no mapa. Opções: forma real escurecida (como o usuário descreveu) ou uma forma genérica até a descoberta. **As duas estão no protótipo** (painel "Protótipo" → silhueta).
2. **Pular cutscenes:** sugestão de um botão "Pular" a partir da segunda vez, para não cansar quem repete uma doença. **No protótipo.** Confirmar.
3. **Doenças sem forma própria:** no `batalhaConteudo.js`, pneumonia, dengue e malária têm `arte: null`, mas já têm desenho próprio no app (`Pneumo`, `Dengue` e `Malaria` em `batalhaArte.jsx`); o protótipo usa os 12 desenhos.
4. **Transição entre cutscene e batalha:** batimento ou microscópio, **no protótipo**.
5. **Ramos em paralelo:** os três começam abertos, como no protótipo? (Hoje é linear.)
6. **Resumo do pergaminho:** o usuário ainda não detalhou o formato; a tabela acima é proposta (parte 2 do protótipo).
