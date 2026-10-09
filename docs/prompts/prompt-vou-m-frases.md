# Prompt para o ChatGPT: banco novo de Verdade ou mentira

Como usar: copie tudo o que está entre as linhas `=====` e cole no ChatGPT. Peça em lotes de 40 conceitos (80 frases) por conversa. Depois, cole o JSON de volta aqui; eu valido o formato, confiro duplicatas com o Quiz e o banco antigo e preparo a publicação. Todo conteúdo novo entra como **não revisado** e só vai para os jogadores depois da sua revisão médica.

Por que um banco novo: as frases atuais do V ou M são a versão verdadeira e a falsa dos mesmos 16 conceitos das perguntas do Quiz, então o mesmo assunto aparece nos dois modos. O banco novo usa **conceitos diferentes** dos do Quiz.

=====

Você é professor de medicina e elaborador de questões de provas de graduação no Brasil. Vai escrever o conteúdo de um modo de jogo chamado **Verdade ou mentira**, para estudantes de medicina.

## Como o jogo funciona
- Cada **conceito** tem exatamente **2 frases**: uma verdadeira e uma falsa sobre o mesmo assunto.
- Cada rodada sorteia 5 frases de conceitos diferentes. O jogador marca quais são verdadeiras e depois lê a explicação e a fonte de cada uma.
- O jogo é só em português do Brasil.

## Sua tarefa
Escreva **40 conceitos novos** (80 frases no total).

### Cobertura
Distribua os conceitos entre estas áreas, mais ou menos igualmente (de 3 a 4 por área): anatomia, fisiologia, histologia e embriologia, bioquímica, microbiologia, imunologia, parasitologia, farmacologia, patologia, semiologia e propedêutica, clínica médica, pediatria, ginecologia e obstetrícia, saúde coletiva e SUS. Nível: graduação, do ciclo básico ao clínico.

### Não repita estes assuntos (já estão no jogo)
Antibiótico não trata vírus; cor do muco e antibiótico; rim e bexiga; néfron (glomérulo e túbulo); reabsorção tubular de água; eritropoietina e anemia na doença renal; hemácia madura sem núcleo; plaquetas e megacariócitos; endolinfa rica em potássio; potencial endococlear; primeiros socorros em crise convulsiva; cronometrar a crise convulsiva (5 minutos); diabetes tipo 1 e insulina; vacinas e memória imunológica; rins regulam água, sais e ácidos; uso responsável de antibióticos.

### Regras de qualidade
1. **A frase falsa deve ser plausível**: um erro que um estudante realmente cometeria (trocar um mecanismo, uma estrutura, uma conduta, uma classificação). Nada de absurdo ou piada.
2. As duas frases têm **estrutura e tamanho parecidos**, para o jogador não adivinhar só pela redação.
3. **Uma afirmação por frase.** Evite "sempre" e "nunca" quando não forem essenciais, e evite pegadinha de redação.
4. Só use assuntos com **consenso estável** nas fontes. Se houver controvérsia ou a conduta mudou nos últimos anos, escolha outro assunto.
5. Use números só quando forem estáveis e de ampla aceitação (valores de referência, prazos de diretrizes vigentes).
6. Não copie trechos de livros nem de sites. Escreva com suas palavras.
7. Frases entre 8 e 25 palavras.

### Explicação
Escreva 1 a 2 frases que expliquem **por que a frase verdadeira é verdadeira e qual é o erro da falsa**. A explicação é a mesma para as duas frases do conceito.

### Fonte
Uma URL `https://` de fonte pública e estável (Ministério da Saúde, OMS, CDC, NIH/NCBI Bookshelf, PubMed, sociedades médicas brasileiras). **Não invente URLs.** Se não tiver certeza de uma URL real, escreva `null` em `fonte` e liste o conceito no final, em "pontos para o revisor".

## Formato da resposta
Responda **só com um array JSON** (sem comentários dentro dele), uma linha por frase, nesta ordem: a verdadeira e depois a falsa de cada conceito.

No exemplo, `https://URL-REAL-DA-FONTE` é um marcador: troque pela URL real de cada fonte.

```json
[
  {
    "id": "frase-pressao-pulso-v",
    "conceito": "pressao-pulso",
    "versao": 1,
    "tema": "Fisiologia cardiovascular",
    "texto": "A pressão de pulso é a diferença entre a pressão arterial sistólica e a diastólica.",
    "verdadeira": true,
    "explicacao": "A pressão de pulso é sistólica menos diastólica; confundi-la com a pressão arterial média é um erro comum.",
    "fonte": "https://URL-REAL-DA-FONTE"
  },
  {
    "id": "frase-pressao-pulso-f",
    "conceito": "pressao-pulso",
    "versao": 1,
    "tema": "Fisiologia cardiovascular",
    "texto": "A pressão de pulso é a média entre a pressão arterial sistólica e a diastólica.",
    "verdadeira": false,
    "explicacao": "A pressão de pulso é sistólica menos diastólica; confundi-la com a pressão arterial média é um erro comum.",
    "fonte": "https://URL-REAL-DA-FONTE"
  }
]
```

Regras do formato:
- `conceito`: identificador curto, em minúsculas, sem acento nem espaço (use hífen), **único** e igual nas duas frases.
- `id`: `frase-` + conceito + `-v` (verdadeira) ou `-f` (falsa).
- `tema`: nome da área ou do assunto, curto, em português. **Não** coloque no tema a resposta nem o nome do diagnóstico.
- `versao`: sempre `1`.
- `verdadeira`: `true` ou `false`, sem aspas.

## Depois do JSON
Escreva a seção **"Pontos para o revisor"**: liste os conceitos em que você tem alguma dúvida (conduta que muda entre diretrizes, número que varia, fonte que não pôde confirmar). Se não houver, diga "nenhum".

=====
