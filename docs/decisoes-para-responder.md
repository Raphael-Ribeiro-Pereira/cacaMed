# Decisões para responder (11/10/2026)

Responda pelo número (por exemplo, "B3: opção 2"). Em cada pergunta há o contexto, as opções com o que cada uma custa e a minha recomendação. O que você responder vira o plano e é registrado em [pendências](pendencias.md).

Hoje é domingo, 11/10. A próxima quinta-feira é **15/10**.

> **Respondidas em 13/10 (e B2, B5, B6 e B7 mais tarde):** A1 (DDX completo na quinta), A4 (libera o DDX, menos a Batalha), B3 (tempo como bônus, sem cronômetro na tela), B4 (doses quando a fonte citar), C1 (o PWA ficou como web app), C2 (as duas lojas) e a ordem do app (offline, depois Capacitor x React Native). O restante continua aberto; onde preciso decidir, uso a opção recomendada e registro.

---

## A. O deploy de quinta (15/10)

Você pediu: terminar o que está no cronograma e acrescentar pelo menos 50 casos no DDX, 50 no Quiz e 50 no V ou M. Antes de prometer a data, preciso do tamanho real do que falta.

**O que o cronograma ainda tem em aberto** (cada item é grande):

| Item | O que envolve |
| --- | --- |
| Economia v3 | 100 XP fixos nos jogos, bônus de tempo escondido, ofensiva de login, 4 missões novas por dia, DDX com 300 XP, Batalha com 500 XP, tickets sem saldo negativo |
| Revisão Inteligente v2 | 4 cartas, sessões de 7 itens, erro grave no Paciente DDX, liberação no nível 10, +40 XP por item dominado, explicações por IA |
| Modo história da Batalha | mapa, cutscenes, pergaminho, enciclopédia (cada tela passa por protótipo e aprovação sua) |
| App offline | fila de sincronização, pacote de conteúdo no aparelho, tickets offline |
| Novo desenho do DDX | seção B abaixo |
| App de verdade | seção C abaixo |
| Conteúdo | 50 casos de DDX, 50 de Quiz e 50 de V ou M, cada um com a sua revisão médica |

**A1. O que é "terminar o cronograma" para quinta?**
1. **Tudo** (economia v3, Revisão v2, história da Batalha, offline e o novo DDX). Não cabe em 4 dias, nem em 4 semanas se cada tela esperar a sua aprovação. Eu não recomendo prometer isso.
2. **Só o que já está pronto e testado** (cadastro, texto da Batalha, banco novo do V ou M, temas, correção do Plantão) **mais o conteúdo novo que você conseguir revisar**. Dá para publicar com segurança.
3. **O que já está pronto, o conteúdo e a economia v3** (ela mexe no XP de todos os modos e precisa de testes pesados).
4. Outra combinação (diga qual).

Recomendação: **2 na quinta**, e a economia v3 na quinta seguinte (22/10), porque o dado de XP é o mais difícil de desfazer depois de publicado.

**A2. O que significa "50 casos totais no DDX"?**
1. 50 no **total** dos modos do DDX. Hoje há 17 do Paciente DDX; com os 15 do Plantão já aprovados e os 2 pilotos (Erro médico e Causa e efeito) são 35. Faltam 15.
2. 50 **por modo** (Plantão, Erro médico, Causa e efeito, Paciente DDX). São 200 casos.
3. Outro número.

Observação: o Erro médico e o Causa e efeito usam um caso do Plantão, então 15 auditorias e 15 relações (uma para cada caso aprovado) já levariam o total a 65.

**A3. E "50 no Quiz e 50 no V ou M"?**
1. 50 **a mais** em cada um. O Quiz passaria de 32 perguntas para 82 e o V ou M de 40 conceitos para 90.
2. 50 **no total**. O Quiz passaria de 32 para 50, e o V ou M de 40 para 50.
3. 50 conceitos no Quiz (cada um com uma pergunta de teoria e uma de caso clínico, ou seja, 100 perguntas) e 50 no V ou M.

**A4. Os casos novos do DDX vão aparecer para os jogadores na quinta?**
Hoje o DDX é restrito a administradores e você decidiu adiar a liberação. Casos novos só chegam aos jogadores se o DDX for liberado.
1. **Não libera na quinta.** Os casos entram no código e continuam só para administradores. Você testa e o público vê depois.
2. **Libera só o Plantão** (o modo com mais casos aprovados).
3. **Libera todo o DDX** quando houver 50 casos.

**A5. Quanta revisão médica cabe até quinta?**
Você revisa em lotes de 15. Cada lote leva de 1 a 2 horas, na minha estimativa.
1. Até 3 lotes (45 itens).
2. Até 6 lotes (90 itens).
3. Posso rodar a revisão em mais de um dia, então o limite é só o meu tempo de escrever. Diga quantos lotes por dia.

Hoje a fila é: Erro médico (15), Causa e efeito (15), Quiz (50), V ou M (50) e mais casos do Plantão ou do Paciente DDX.

**A6. Nos modos antigos de DDX, o conteúdo novo já nasce com fonte brasileira?**
Você disse: fontes brasileiras sempre que a doença existir no Brasil; estrangeiras só para o que não existe aqui. Os 15 casos do Plantão aprovados ficam como estão.
1. Concordo com a regra para tudo que vier daqui em diante.
2. Quero **refazer** com fonte brasileira os 11 casos do Plantão que usam CDC ou NIH (eles foram aprovados, mas ficariam mais alinhados).
3. Quero refazer só os que você achou divergentes (diga quais).

---

## B. O novo desenho do DDX (protótipo)

Você citou `protótipos/modos-DDX.html`. O arquivo no repositório é **`prototipos/ddx-modos.html`** (sem acento). Também há duas pastas de variações em `docs/prototipos/` (`ddx-selecao-variacoes.html`, com 3 desenhos de seleção, e `ddx-caso-investigacao-variacoes.html`, com 6 desenhos de investigação). Não está claro se você já escolheu entre elas.

### O que o protótipo propõe

| Modo | Hoje no jogo | No protótipo |
| --- | --- | --- |
| Plantão | lista de ações com pontos e minutos; só a reavaliação muda o monitor | relógio e "hora de ouro" (60 min até o antibiótico); cada ação custa minutos e muda os sinais vitais na hora; errar é demorar (TC antes do antibiótico custa 40 min e o alarme dispara); destino Alta, Enfermaria ou UTI; relatório compara o seu tempo com a meta |
| Erro médico | 4 perguntas de múltipla escolha sobre o registro | o prontuário vira um papel: tocar na linha onde o cuidado falhou, escolher a categoria da falha e arrastar o horário correto; erro gentil, só com dica |
| Causa e efeito | 4 perguntas em sequência | 5 slots (estímulo, mecanismo, consequência, compensação, intervenção) preenchidos com cartas e distratores; "Testar circuito" mostra em que elo a corrente quebra |

### Minha avaliação

Os três são muito melhores do que o que temos: deixam de parecer quiz e cada um ganha uma ação própria. O visual usa as mesmas cores e fontes do app, então a portagem é de estrutura, não de estilo.

**O que vale muito e é barato de instalar:**
- **Causa e efeito** é o mais fácil. Cada pergunta atual já tem uma alternativa certa e distratores plausíveis, e isso vira "cartas em slots" quase direto. Só falta o texto do teste do circuito (onde a corrente quebra).
- **Erro médico** reaproveita o que já existe: os registros já são linhas com horário ("08:10 — ..."). Falta definir, para cada auditoria, qual linha é a falha, a categoria e a janela de horário correta.

**O que muda regra de jogo e exige decisão sua (seção B abaixo):**
- **Plantão**: o relógio e a hora de ouro tornam o tempo parte da nota. Hoje a regra aprovada diz que o tempo simulado **não** altera o XP. O monitor reagindo a cada ação exige que cada ação tenha efeitos nos sinais vitais (dados novos nos 16 casos) e uma regra de piora por demora, calculada igual no navegador e no servidor, que é quem concede o XP.
- O protótipo mostra **doses** ("Ceftriaxona 2 g IV", "30 mL/kg"). Hoje nenhum caso traz dose.
- O destino do protótipo tem três opções (alta, enfermaria, UTI). Nos casos de hoje há duas (alta e encaminhar).

**Riscos que eu vejo:**
- O monitor dinâmico dobra o trabalho de conteúdo do Plantão: cada ação precisa de efeito, e cada caso de uma meta de tempo e uma regra de piora, com revisão médica.
- A pontuação por tempo favorece quem joga rápido e pode desestimular a leitura. O protótipo já mitiga ("o erro aparece como consequência"), mas vale decidir se o relógio é bônus ou regra.
- Em celular pequeno, monitor + relógio + bandeja de ações + evolução competem por espaço. O protótipo foi pensado em uma coluna de 420 px; preciso testar em 375 px.

### Como eu instalaria no código

1. **Ordem:** Causa e efeito → Erro médico → Plantão. O Plantão por último, porque depende das decisões B2 a B5.
2. **Sem mexer no servidor primeiro:** cada modo ganha uma tela nova (`CausaEfeito.jsx`, `ErroMedico.jsx` e `PlantaoMedico.jsx` são reescritos) que fala com o mesmo motor. O XP continua sendo calculado no servidor, com as mesmas regras de hoje, até a economia v3.
3. **Conteúdo versionado:** os formatos novos entram como `versao: 2` nos dados, e quem está no meio de uma partida termina na versão antiga (a regra já existe).
4. **Teste:** cada modo entra na homologação com dados fictícios antes de qualquer publicação, e a validação de conteúdo ganha um modo para os formatos novos (o do Plantão já roda o caminho completo no motor).
5. **Protótipos antigos:** os protótipos entram no Git em `prototipos/` e `docs/prototipos/`, como o de movimento (pergunta E8).

### Perguntas

**B1. Qual direção de seleção e de investigação você escolheu nas variações de `docs/prototipos/`?**
Seleção: 01 Clínica, 02 Monitor ou 03 Trilhas. Investigação: 3A Ficha, 3B Painel, 3C Imersiva, 4A Abas, 4B Estações ou 4C Prontuário. Ou ainda não escolheu (nesse caso eu comparo e recomendo).

**B2. Os três modos entram como no protótipo?**
1. Sim, os três como estão no protótipo.
2. Sim, mas o Plantão fica como hoje (lista de ações) e só Erro médico e Causa e efeito mudam. É o caminho mais rápido.
3. Sim aos três, mas o Plantão em uma versão simplificada (relógio e monitor reativo só nos casos novos; o piloto fica como está).
4. Quero ajustar o protótipo antes (diga o que mudar).

**B3. No Plantão, o tempo conta para a nota?**
1. **Sim, como regra:** passar da hora de ouro tira pontos, e o alarme do monitor pune a demora.
2. **Sim, como bônus:** a nota base não depende do tempo; ser rápido acrescenta até 100 XP (combina com a economia v3, que já prevê "bônus de até 100" no DDX).
3. **Não:** o relógio só mostra o efeito no monitor, e a nota continua sem tempo (regra atual).

**B4. Doses de medicamento aparecem nos casos?**
1. Não, como hoje: "conforme protocolo".
2. Sim, só as doses de manual conhecidas (por exemplo, volume de cristaloide por kg), com a fonte brasileira, e o revisor confere cada uma.
3. Sim, sem restrição.

**B5. Quais destinos existem no fim do Plantão?**
1. Dois, como hoje: alta ou encaminhar.
2. Três, como no protótipo: alta, enfermaria ou UTI.
3. Quatro, com "observação" no pronto atendimento.

**B6. No Erro médico, o jogador toca na linha, escolhe a categoria e acerta o horário. Quais categorias de falha?**
Proposta: omissão, atraso, conduta inadequada, falha de registro e falha de comunicação. Aceita, corta ou acrescenta alguma?

**B7. O Erro médico e o Causa e efeito continuam presos a um caso do Plantão?**
1. Sim: cada auditoria e cada relação nascem do mesmo caso do Plantão, e o jogador vê "o caso que você atendeu".
2. Não: podem ser casos independentes, para eu poder escrever lotes sem esperar o Plantão.

**B8. O relatório do Plantão compara o seu tempo com a meta. Mostra o tempo dos outros jogadores?**
1. Não, só a meta clínica.
2. Sim, a média de todos (anônima).
3. Sim, o seu melhor tempo anterior.

**B9. O mais difícil do protótipo é a tela do celular de 375 px. Posso testar e ajustar sozinho?**
1. Sim, adapto o que for preciso sem perguntar.
2. Me mostre uma captura de cada ajuste importante antes de seguir.

---

## C. Transformar o web app em app de verdade

O que existe hoje é um **PWA**: ele já abre em tela cheia, com ícone próprio e a última versão guardada para sem rede. Mas, instalado, ele continua sendo "o site em tela cheia". O Android mostra "Instalar app" no menu do Chrome; o iPhone só tem "Adicionar à Tela de Início" no Safari. Se não foi isso que apareceu, ou se o objetivo é aparecer na Play Store e na App Store, precisamos de outro caminho.

**C1. O que aconteceu quando você tentou instalar?**
1. Não achei a opção "Instalar app" (qual aparelho e navegador?).
2. Instalou, mas abre como site e eu quero um app de loja.
3. Instalou e funcionou, mas quero estar na loja.
4. Outro caso (descreva).

**C2. Por qual loja começar?**
1. **Android (Play Store).** Custa uma taxa única de US$ 25 para a conta de desenvolvedor. Contas pessoais novas costumam exigir um teste fechado com 12 pessoas durante 14 dias antes de publicar (confirmo a regra vigente antes de você pagar).
2. **iPhone (App Store).** US$ 99 por ano. A Apple recusa com frequência apps que são só um site embrulhado, então precisaria de recursos próprios (por exemplo, avisos no celular). Compilar exige um Mac, ou um serviço de compilação na nuvem.
3. **Os dois**, nessa ordem, começando pelo Android.
4. **Nenhum agora:** quero só um arquivo de instalação (APK) para distribuir direto, sem loja. É grátis e rápido, mas cada pessoa precisa permitir a instalação de fora da loja.

**C3. Como construir o app?**
1. **Android embrulhando o site** (TWA, com o PWABuilder ou o Bubblewrap): sai em dias, o app é o próprio site, e o endereço (`caca-med.vercel.app`) vira um domínio verificado.
2. **Capacitor:** embrulha o site num app Android e iPhone, com acesso a recursos do celular (avisos, vibração, armazenamento). É o caminho de equilíbrio e reaproveita 100% do código.
3. **React Native com Expo**, reaproveitando as regras de jogo. É a meta de longo prazo do documento, mas reescreve todas as telas.

Recomendação: **C2 = 1 e C3 = 1 ou 2.** Primeiro um APK de teste (C2 = 4) para você usar no dia a dia, depois a Play Store.

**C4. Em que quinta isso entra?**
1. Não precisa ser quinta: é uma frente à parte, que eu avanço quando não estou no conteúdo.
2. Quero o APK de teste já na quinta de 15/10.
3. Quero a Play Store publicada até uma data (diga qual).

**C5. Quem cria as contas de loja e paga as taxas?**
Eu não crio contas nem pago nada: é você. Quando você escolher, eu preparo o pacote, as imagens exigidas (ícone, capturas de tela) e o texto da loja, e te passo cada passo do cadastro.

**C6. Nome e identidade na loja.**
Nome do app (hoje "cacoMed · Treinamento Médico"), descrição curta, ícone e classificação de idade (conteúdo médico). Mantém como está ou quer mudar?

---

## D. Conteúdo: o que escrever primeiro

**D1. Qual é a ordem dos lotes de 15?**
1. Erro médico (15 auditorias dos casos aprovados do Plantão) → Causa e efeito (15) → Quiz → V ou M.
2. Quiz → V ou M → Erro médico → Causa e efeito (mais rápido para o público, já que o Quiz e o V ou M já estão liberados).
3. Mais casos do Plantão antes de tudo (outro lote de 15 casos novos).
4. Outra ordem (diga).

Observação: o Quiz e o V ou M já estão liberados para os jogadores, e o DDX não. Se o objetivo é o que os jogadores veem na quinta, a opção 2 entrega mais.

**D2. O Quiz mantém as duas variantes (teoria e caso clínico) para cada conceito?**
1. Sim, sempre o par teoria e caso.
2. Não, pode haver conceito só com a pergunta de teoria.

**D3. Temas dos casos do DDX.**
Os sistemas dos casos (Respiratório, Neurológico, Endócrino...) são diferentes dos 15 temas do Quiz e do V ou M. Mantenho assim ou quer uma lista única de áreas?

**D4. Qual domínio brasileiro eu posso aceitar além do Ministério da Saúde?**
Hoje o conferidor de fontes aceita gov.br, planalto.gov.br e os sites do CDC e do NIH. Proposta para a lista brasileira: Fiocruz, Conitec, Anvisa, INCA, Sociedade Brasileira de Cardiologia, de Pediatria, de Diabetes, de Infectologia, e a Biblioteca Virtual em Saúde. Aceita? Algum a tirar ou acrescentar?

---

## E. As decisões que já estavam abertas, expandidas

**E1. Domínio para o e-mail do app** (cadastro e recuperação de senha).
Sem domínio, só a equipe do projeto recebe e-mail, então nenhum jogador de fora consegue confirmar o cadastro por e-mail nem recuperar a senha. Entrar com o Google funciona sem isso.
1. Já tenho ou vou registrar um domínio (qual?). Depois você cria a conta no Resend (grátis até 3.000 e-mails por mês) e cola a credencial no painel do Supabase, sem passar pelo chat.
2. Prefiro não ter domínio agora: o app aceita só o login com Google por enquanto.
3. Quero que o app tenha um domínio próprio também no site, não só para o e-mail (nesse caso, ele também serve para a Play Store e para a verificação do app).

**E2. Liberar o DDX para o público.** (Adiado por você; falta definir o critério.)
1. Quando o Plantão tiver 30 casos revisados.
2. Quando todos os quatro modos tiverem pelo menos 15 casos revisados.
3. Quando o novo desenho (seção B) estiver publicado, independente da quantidade.
4. Outra regra.

Antes ou depois da economia v3? A v3 define 300 XP para cada modo do DDX; sem ela, o Paciente DDX não paga XP e os outros pagam o que está no código.

**E3. A Batalha entra na lista do DDX público ou continua restrita a administradores?**
1. Continua restrita (modo secreto) até o modo história novo ficar pronto.
2. Entra junto com o resto do DDX.
3. Entra só o modo treinamento, sem a história.

**E4. Silhueta da doença no mapa da história.**
A Batalha esconde qual doença é até o jogador descobrir. Uma silhueta com a forma real escurecida já revela o tipo do agente (vírus, bactéria etc.) antes da hora.
1. Forma real escurecida (como você descreveu; revela o tipo).
2. Forma genérica até a descoberta (preserva o mistério, mas é menos bonito).
3. Forma genérica por tipo de agente, que só aparece depois do primeiro exame.

**E5. Botão "Pular" nas cutscenes.**
1. Sim, a partir da segunda vez que o jogador vê aquela cena.
2. Sim, desde a primeira.
3. Não, as cenas são curtas e fazem parte do jogo.

**E6. Itens da Batalha na Revisão Inteligente.**
A Batalha gera itens para revisar, mas eles ainda ficam de fora das cartas.
1. Entram nas cartas do Quiz (sem carta própria).
2. Ganham uma carta própria ("Batalha").
3. Deixam de ser gerados.

**E7. Formato do pergaminho (resumo da doença).**
Proposta: Resumo, Pontos fracos, Transmissão, Sintomas principais (até 5), Sintoma marcante, Profilaxia, Tratamento recomendado, Notificação e Fontes.
1. Aceito como está.
2. Aceito, mas tiro: ______ e acrescento: ______.
3. Quero ver um rascunho de uma doença antes de decidir.

**E8. Salvar o protótipo de movimento no repositório.**
Hoje ele está só numa pasta temporária desta máquina (cerca de 1 MB, sem dependências) e o repositório já tem outros protótipos em `prototipos/`.
1. Sim, em `prototipos/movimento/`.
2. Sim, mas só o que está em uso como referência de design.
3. Não, fica fora do Git.

**E9. Modo bio.**
Um liga e desliga no Quiz e no V ou M para um modo de biologia direto. Faltam conteúdo, regras e economia.
1. Entra depois de tudo (como está no cronograma).
2. Quero começar a definir já, em paralelo (me faça perguntas).
3. Desisti da ideia.

**E10. Quando desligar o Firebase.**
Nenhuma conta do jogo depende só dele. O critério registrado é: sete dias estáveis, cadastro, recuperação e logout públicos testados, e o código antigo removido antes de desligar o serviço.
1. Mantém o critério, e eu aviso quando os sete dias passarem.
2. Quero desligar logo depois do deploy de quinta, se o teste de cadastro passar.
3. Mantém o Firebase por mais tempo (diga até quando).

**E11. Conta de teste.**
Apagar a conta de login `gfire0009@gmail.com` do Firebase é uma tarefa sua (o perfil dela no Supabase já foi apagado). Você faz esta semana, ou eu deixo registrado como pendência?

---

## F. Antes de quinta, o que depende só de você

1. Responder as seções A, B e C (as demais podem esperar).
2. Revisar os lotes que eu entregar.
3. Testar o app no celular (hoje o teste é instalar o PWA; depois, o APK).
4. Confirmar, na quinta, que posso publicar (eu não publico sem o seu "sim" no dia).
