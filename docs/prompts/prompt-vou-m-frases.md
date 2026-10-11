# Prompt para o ChatGPT: banco novo de Verdade ou mentira (em duas partes)

Por que um banco novo: as frases antigas do V ou M são a versão verdadeira e a falsa dos mesmos 16 conceitos das perguntas do Quiz, então o mesmo assunto aparece nos dois modos. O banco novo usa **conceitos diferentes** dos do Quiz.

Por que duas partes (decisão de 11/10/2026): no primeiro lote, o ChatGPT inventou pelo menos 12 de 36 fontes ([triagem](../../content/review/vm-lote-001-triagem.md)). Agora ele primeiro **busca as fontes e copia um trecho de cada uma**; o script `npm run content:fontes` abre cada página e confere se o trecho está lá. Só com as fontes aprovadas ele escreve as frases.

**Como usar:**
1. Cole a **Parte 1** no ChatGPT, com a navegação na web ligada. Salve a resposta em `content/inbox/vm-lote-NNN-fontes.json` e rode `npm run content:fontes -- content/inbox/vm-lote-NNN-fontes.json`. Fontes que falharem voltam para o ChatGPT corrigir ou trocar o conceito.
2. Na mesma conversa, cole a **Parte 2** e, logo abaixo dela, o JSON de fontes aprovado. Salve a resposta em `content/inbox/vm-lote-NNN.json` e rode `npm run content:validate -- frases content/inbox/vm-lote-NNN.json --ready`.
3. Traga os dois arquivos aqui para a conferência das frases contra os trechos. Depois vem a sua revisão médica. Todo conteúdo novo entra como **não revisado**.

O agente também pode fazer o lote inteiro sozinho, com o mesmo fluxo; o lote `vm-lote-002` foi feito assim.

## Parte 1: fontes

=====

Você é professor de medicina e vai preparar o material de um jogo de estudo, o **Verdade ou mentira**, para estudantes de medicina no Brasil. Nesta primeira parte você **não escreve frases**: só escolhe os conceitos e encontra a fonte de cada um.

### Tarefa
Escolha **40 conceitos** de graduação em medicina, do ciclo básico ao clínico, e para cada um encontre **uma página da web** que afirme o fato com clareza. Distribua de 2 a 4 conceitos por área, usando exatamente estas áreas: Anatomia, Fisiologia, Histologia, Embriologia, Bioquímica, Microbiologia, Imunologia, Parasitologia, Farmacologia, Patologia, Semiologia, Clínica médica, Pediatria, Ginecologia e obstetrícia, Saúde coletiva.

### Onde buscar (só estes sites)
Use **apenas** páginas destes domínios, que são de governo ou de domínio público:
- `cdc.gov`;
- sites do NIH: `cancer.gov`, `niddk.nih.gov`, `nichd.nih.gov`, `nida.nih.gov`, `training.seer.cancer.gov`, `medlineplus.gov/genetics`;
- `gov.br`: Ministério da Saúde, INCA e departamentos do Ministério;
- `planalto.gov.br` e `bvsms.saude.gov.br`, para leis e portarias do SUS.

**Não use** NCBI, PubMed, PMC, StatPearls, OpenStax, Wikipédia, blogs, livros nem sites de sociedades. Se não achar uma página desses domínios para um conceito, troque o conceito.

### Não repita estes assuntos (já estão no jogo)
- **Quiz:**
  - antibiótico não trata vírus; cor do muco e antibiótico; uso responsável de antibióticos;
  - rim e bexiga; néfron; reabsorção tubular de água; rins regulam água, sais e ácidos;
  - eritropoietina e anemia na doença renal; hemácia madura sem núcleo; plaquetas e megacariócitos;
  - endolinfa rica em potássio; potencial endococlear;
  - primeiros socorros em crise convulsiva; cronometrar a crise convulsiva;
  - diabetes tipo 1 e insulina; vacinas e memória imunológica.
- **Lote anterior do V ou M:**
  - artérias pulmonares; vesícula biliar e bile; árvore brônquica; nó sinoatrial; ocitocina e prolactina; diafragma na inspiração;
  - músculo liso; epitélio alveolar; origem embrionária da adrenal;
  - fenilcetonúria; ciclo da ureia; intolerância à lactose;
  - Legionella; tétano; transmissão da tuberculose; HIV e linfócitos T CD4+; timo;
  - oxiúro; malária e Anopheles; esquistossomose; doença de Chagas;
  - metformina; naloxona; tumor benigno e maligno; carcinoma; nome da metástase;
  - sinais de AVC; trombose venosa e embolia pulmonar; hipertensão sem sintomas; doença falciforme;
  - sono seguro do bebê; aleitamento exclusivo; teste do pezinho; ácido fólico; pré-eclâmpsia; rastreamento do colo do útero;
  - vigilância epidemiológica; Conselho de Saúde; Atenção Básica coordenadora do cuidado.

### O trecho
Para cada conceito, **copie da página**, sem mudar nenhuma palavra, de 1 a 2 frases (até 60 palavras) que afirmem o fato. Um script vai abrir a URL e procurar esse texto exato, então:
- não resuma, não traduza e não corrija o texto;
- não junte frases distantes; se precisar pular um pedaço, use `...` entre as partes;
- não use texto de imagem nem de PDF.

### Formato da resposta
Responda **só com um objeto JSON**, sem texto fora dele:

```json
{"fontes": [
  {
    "conceito": "tetano-esporos",
    "area": "Microbiologia",
    "url": "https://www.cdc.gov/tetanus/causes/index.html",
    "titulo": "Tetanus: Causes and How It Spreads",
    "orgao": "CDC",
    "trecho": "Tetanus spores from the environment enter the body through cuts or wounds. Tetanus doesn't spread from person to person."
  }
]}
```

- `conceito`: identificador curto, minúsculas, sem acento nem espaço (use hífen), único.
- `area`: uma das áreas da lista, escrita igual.

=====

## Parte 2: frases

=====

Agora escreva as frases do **Verdade ou mentira** usando **somente** as fontes do JSON que colei abaixo. Nada de conhecimento de fora: se o trecho não sustenta uma frase, não escreva essa frase.

### Como o jogo funciona
- Cada conceito tem **2 frases**: uma verdadeira e uma falsa sobre o mesmo assunto.
- Cada rodada sorteia 5 frases de conceitos diferentes. O jogador marca quais são verdadeiras e depois lê a explicação e a fonte.
- O jogo é em português do Brasil.

### Regras
1. A **verdadeira** diz, com suas palavras, o que o trecho afirma. Não acrescente fato que não está no trecho.
2. A **falsa** é contradita pelo trecho: troque a estrutura, o mecanismo, o local ou a classificação que o trecho afirma. Ela deve ser plausível, um erro que um estudante cometeria; nada de absurdo ou piada.
3. As duas frases têm estrutura e tamanho parecidos, entre 8 e 25 palavras, com uma afirmação cada.
4. Evite "sempre" e "nunca" quando não forem essenciais. Use números só quando estiverem no trecho.
5. A **explicação** (1 a 2 frases) diz por que a verdadeira é verdadeira e qual é o erro da falsa, também só com o que está na fonte. É a mesma para as duas frases do conceito.
6. Não copie o trecho palavra por palavra na frase; escreva em português, com suas palavras.

### Formato da resposta
Responda **só com um objeto JSON** com `frases` e `pontos_revisor`. Em `frases`, coloque a verdadeira e depois a falsa de cada conceito.

```json
{"frases": [
  {
    "id": "frase-tetano-esporos-v",
    "conceito": "tetano-esporos",
    "versao": 1,
    "tema": "Microbiologia",
    "texto": "Os esporos do Clostridium tetani vêm do ambiente, como solo e poeira, e entram no corpo por ferimentos na pele.",
    "verdadeira": true,
    "explicacao": "O tétano não é transmitido entre pessoas: esporos do ambiente entram por pele lesada, em geral por ferimentos.",
    "fonte": "https://www.cdc.gov/tetanus/causes/index.html"
  },
  {
    "id": "frase-tetano-esporos-f",
    "conceito": "tetano-esporos",
    "versao": 1,
    "tema": "Microbiologia",
    "texto": "O tétano passa de pessoa para pessoa pelo contato com secreções respiratórias de quem está doente.",
    "verdadeira": false,
    "explicacao": "O tétano não é transmitido entre pessoas: esporos do ambiente entram por pele lesada, em geral por ferimentos.",
    "fonte": "https://www.cdc.gov/tetanus/causes/index.html"
  }
], "pontos_revisor": []}
```

- `conceito` e `fonte` iguais aos do JSON de fontes; `tema` igual à `area`.
- `id`: `frase-` + conceito + `-v` ou `-f`. `versao`: sempre `1`. `verdadeira`: `true` ou `false`, sem aspas.
- Em `pontos_revisor`, liste o que merece conferência: orientação dos EUA que pode diferir da brasileira, número, diretriz recente. Use `[]` se não houver.

=====
