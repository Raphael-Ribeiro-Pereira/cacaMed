# Prompt para o ChatGPT: novos casos do Paciente DDX

Como usar: copie tudo o que está entre as linhas `=====` e cole no ChatGPT. Peça poucos casos por conversa (de 4 a 6) para a qualidade não cair. Depois, cole o JSON de volta aqui.

O que acontece com o que o ChatGPT devolver:
1. **Formato:** eu valido o JSON contra as mesmas regras dos 17 casos atuais (testes do projeto).
2. **Páginas das fontes:** o ChatGPT não consegue conferir páginas de PDF. O prompt pede `"pag": 0` como marcador. Eu confiro cada citação contra os PDFs que você me enviar (como fizemos nos casos atuais) e troco o 0 pelo número certo. Fonte nova que ainda não temos em PDF precisa ser baixada por você.
3. **Revisão médica:** todo caso entra com `"revisado": false`. Só depois da sua revisão ele vira `true`.

=====

Você é médico e professor de medicina, com experiência em elaborar casos clínicos para a prova nacional dos estudantes de medicina do Brasil (Enamed) e em educação baseada em casos. Vai escrever casos para um jogo chamado **Paciente DDX**.

## Como o jogo funciona
O jogador atende um paciente em 5 etapas: **(1) apresentação** (paciente, queixa e o que se nota), **(2) investigação** (toca nas perguntas e nos exames para ver as respostas), **(3) hipótese** (escolhe uma entre 4), **(4) conduta** (marca tudo o que faria) e **(5) resultado**, com a nota, o que levar do caso, o alerta, a notificação e as fontes.

Nota de 0 a 100: 40 pela investigação (perguntas e exames-chave pedidos), 25 pela hipótese e 35 pela conduta (cada item certo marcado ou item errado deixado de fora conta). O jogo é só em português do Brasil, em tom claro e direto.

## Estrutura da rede de atenção
Os casos pertencem a módulos que seguem a Portaria Inep 478/2025 (Enamed) e as Diretrizes Curriculares Nacionais de Medicina (2025):
- `febre-ubs`: Rede de Atenção Primária (febre, mancha na pele, tosse que não passa).
- `dor-toracica`: Rede de Urgência e Emergência (dor no peito).
- `urgencia-horas`: Rede de Urgência e Emergência (quadros que mudam em horas).
- `pre-natal`: Rede Materno-Infantil (pré-natal na Unidade Básica).
- `crianca`: Rede Materno-Infantil (criança doente, do lactente ao recém-nascido).

Você também pode propor **módulos novos** da Atenção Primária (por exemplo, doenças crônicas, saúde mental e cuidado continuado). Quando propuser, inclua `modulo_novo` (veja o formato abaixo).

## Casos que já existem (não repita)
dengue sem sinais de alarme (grupo A); malária por *P. vivax*; leptospirose; hanseníase paucibacilar; tuberculose pulmonar; infarto com supra de ST; tromboembolismo pulmonar; dissecção aguda de aorta; dengue com sinais de alarme (grupo C); escorpionismo moderado; acidente botrópico moderado; bacteriúria assintomática na gestação; sífilis na gestação; pré-eclâmpsia com sinais de gravidade; pneumonia na criança (AIDPI); diarreia com desidratação (Plano B); recém-nascido com doença grave.

## O que escrever
Escreva **{N} casos novos** (use N = 5 se eu não disser outro número), distribuídos entre os módulos de forma equilibrada. Sugestões de assuntos para escolher (use a sua avaliação clínica):
- Atenção Primária: hipertensão arterial, diabetes tipo 2 (primeira consulta e complicação aguda), depressão, asma/DPOC, infecção urinária baixa na mulher, lombalgia, planejamento familiar.
- Urgência e emergência: AVC isquêmico, sepse, abdome agudo (apendicite), cetoacidose diabética, anafilaxia, crise asmática grave, trauma.
- Materno-infantil: hemorragia pós-parto, diabetes gestacional, trabalho de parto prematuro, bronquiolite, convulsão febril, crescimento e desenvolvimento.

### Regras de conteúdo (todas valem)
1. O paciente é **fictício**. Exames numéricos são **ilustrativos**, mas coerentes com o quadro.
2. Cada caso tem **exatamente 1 hipótese certa** entre 4, e as outras 3 são diagnósticos diferenciais plausíveis.
3. A **conduta** tem de 5 a 7 itens, com **pelo menos 1 certo e 1 errado**. Os errados devem ser erros comuns ou perigosos (atraso, exame desnecessário, medicamento contraindicado), não absurdos.
4. A investigação tem **5 perguntas** e de **3 a 5 exames**. Marque `"chave": true` nas perguntas e exames **essenciais** para chegar ao diagnóstico (em geral 4 perguntas e 1 a 2 exames); o restante é `false`.
5. **Tudo precisa estar de acordo com diretrizes brasileiras vigentes** (Ministério da Saúde, sociedades médicas brasileiras) ou com literatura de referência. Se o consenso mudou nos últimos anos ou varia entre diretrizes, **escolha outro assunto**.
6. Cada `porque` explica o motivo clínico em 1 frase.
7. **Não invente fontes.** Use as fontes da nossa biblioteca (abaixo) quando o assunto estiver coberto por elas. Se precisar de fonte nova, descreva-a em `fontes_novas` com dados reais e verificáveis (título, órgão ou editora, ano, endereço oficial). **Não escreva número de página que você não conseguiu verificar:** use `"pag": 0`.
8. Não copie trechos de livros nem de diretrizes. Escreva com suas palavras.

### Biblioteca de fontes (use estes ids em `citacoes[].fonte`)
- `dengue`: Manual de dengue (MS, 2013)
- `cab21`: Caderno de Atenção Básica nº 21 (MS, 2008)
- `bolso`: Guia de bolso de doenças infecciosas (MS, 2010)
- `guiavig`: Guia de Vigilância em Saúde, vol. 3 (MS, 2024)
- `escorp`: Boletim de escorpionismo (MS, 2025)
- `rs`: Guia do pré-natal (SES-RS, 2024)
- `aidpi`: AIDPI Criança (MS, 2017)
- `neonat`: AIDPI Neonatal (MS, 2014)
- `sbc`: Diretriz de dor torácica (SBC, 2025)
- `harrison`: Harrison's Manual, 20ª ed.
- `portaria`: Portaria Inep 478/2025
- `dcn`: DCN de Medicina (2025)

## Formato da resposta
Responda **só com um objeto JSON** com os campos `casos` (array), `fontes_novas` (array, pode ser vazio) e `modulos_novos` (array, pode ser vazio). Sem comentários dentro do JSON.

Exemplo completo de **um** caso (siga exatamente esta estrutura e os nomes dos campos):

```json
{
  "id": "iamcsst",
  "versao": 1,
  "revisado": false,
  "modulo": "dor-toracica",
  "ordem": 1,
  "nivel": 2,
  "nome": "Infarto com supra de ST (IAMCSST)",
  "categoria": "Síndrome coronariana aguda",
  "paciente": { "nome": "Seu Antônio", "idade": "58 anos", "cenario": "Pronto-socorro; hipertenso e tabagista" },
  "queixa": "Dor em aperto no meio do peito há 40 minutos, com suor frio.",
  "pistas": [
    { "nome": "Dor opressiva", "texto": "Aperto retroesternal que irradia para o braço esquerdo." },
    { "nome": "Sudorese fria", "texto": "Pele pálida e suor frio desde o início da dor." },
    { "nome": "Náusea", "texto": "Enjoo e mal-estar intenso." }
  ],
  "perguntas": [
    { "p": "A dor muda ao respirar ou ao mexer o tronco?", "r": "Não. É um aperto constante, que não alivia em repouso.", "chave": true },
    { "p": "Começou quando e o que fazia?", "r": "Há 40 minutos, subindo escada.", "chave": true },
    { "p": "Tem hipertensão, diabetes, cigarro ou familiar com infarto?", "r": "Hipertenso, fuma 20 cigarros por dia, pai morreu de infarto.", "chave": true },
    { "p": "A dor é rasgante, de início súbito em dorso, ou a pressão difere entre os braços?", "r": "Pressão igual nos dois braços. Não é rasgante.", "chave": true },
    { "p": "Usou algum anticoagulante ou teve sangramento recente?", "r": "Nega.", "chave": false }
  ],
  "exames": [
    { "id": "sv", "nome": "Sinais vitais", "resultado": "PA 150×90 mmHg, FC 96, SpO₂ 96% em ar ambiente.", "chave": false },
    { "id": "ecg", "nome": "ECG em até 10 minutos", "resultado": "Supradesnivelamento do ST em V2 a V5, em pelo menos duas derivações contíguas.", "chave": true },
    { "id": "trop", "nome": "Troponina", "resultado": "Colhida. Não se espera o resultado para decidir a reperfusão.", "chave": false },
    { "id": "rx", "nome": "Radiografia de tórax", "resultado": "Mediastino de contorno normal. Sem sinais de congestão.", "chave": false }
  ],
  "hipoteses": [
    { "nome": "Infarto com supra de ST", "certa": true, "porque": "Dor típica com supradesnivelamento do ST em derivações contíguas." },
    { "nome": "Dissecção de aorta", "certa": false, "porque": "Sem dor rasgante, sem assimetria de pulso nem de pressão." },
    { "nome": "Embolia pulmonar", "certa": false, "porque": "Sem dor pleurítica nem fator de risco para trombose." },
    { "nome": "Pericardite", "certa": false, "porque": "A dor da pericardite é pleurítica e posicional." }
  ],
  "conduta": [
    { "texto": "Fazer o ECG em até 10 minutos da chegada", "certa": true, "porque": "Meta da diretriz para dor torácica." },
    { "texto": "Dar AAS mastigado imediatamente", "certa": true, "porque": "162 a 325 mg na apresentação." },
    { "texto": "Reperfusão: ICP primária se disponível no tempo; senão fibrinólise em até 30 min", "certa": true, "porque": "O tempo de contato até a reperfusão define a estratégia." },
    { "texto": "Aguardar a troponina para decidir o tratamento", "certa": false, "porque": "Com ECG diagnóstico, segue-se direto a rota terapêutica." },
    { "texto": "Analgesia com morfina IV em pequenas doses", "certa": true, "porque": "2 a 4 mg, repetidas conforme a dor." },
    { "texto": "Pedir teste ergométrico para estratificar", "certa": false, "porque": "Teste de esforço é para casos de baixo risco, não para infarto em curso." }
  ],
  "alerta": {
    "nome": "Hipotensão no infarto inferior",
    "quando": "IAM de parede inferior com veias do pescoço distendidas e pulmões limpos",
    "resposta": "ECG de derivações direitas e infusão de volume",
    "porque": "Pode ser infarto de ventrículo direito, e o tratamento é volume."
  },
  "notificar": null,
  "aprendizado": "Dor típica, ECG com supradesnivelamento em derivações contíguas feito em até 10 minutos: é infarto com supra. A decisão de reperfusão não espera troponina. Dar AAS e escolher a reperfusão de acordo com o tempo até o dispositivo.",
  "citacoes": [
    { "fonte": "sbc", "pag": 0, "sobre": "Passo 1: ECG até 10 minutos; ECG diagnóstico leva à rota terapêutica." },
    { "fonte": "harrison", "pag": 0, "sobre": "AAS imediato." }
  ]
}
```

Regras do formato:
- `id`: curto, minúsculo, sem acento, com hífen, **único** e não igual aos existentes.
- `versao`: sempre `1`. `revisado`: sempre `false`.
- `modulo`: um dos ids de módulo acima (ou o id de um `modulos_novos`).
- `ordem`: posição do caso no módulo (comece depois dos casos atuais: `febre-ubs` tem 5, `dor-toracica` 3, `urgencia-horas` 3, `pre-natal` 3, `crianca` 3).
- `nivel`: 1 (fácil), 2 (médio) ou 3 (difícil).
- `exames[].id`: curto e único dentro do caso.
- `notificar`: texto curto quando o agravo é de notificação compulsória; senão `null`.
- `citacoes`: de 4 a 9 itens; cada um cita **uma ideia** do caso. `pag` sempre `0`.
- `perguntas[].r` e `exames[].resultado` não podem entregar o diagnóstico pelo nome.

Formato de `fontes_novas` (só para fontes que não estão na biblioteca):

```json
{ "id": "has2020", "curto": "Diretriz de hipertensão (SBC, 2020)", "titulo": "...", "orgao": "...", "ano": 2020, "endereco": "https://..." }
```

Formato de `modulos_novos`:

```json
{ "id": "cronicos-aps", "nome": "Doenças crônicas na Unidade Básica", "rede": "Rede de Atenção Primária", "resumo": "Frase curta, no estilo dos módulos existentes." }
```

## Depois do JSON
Escreva a seção **"Pontos para o revisor"**: para cada caso, liste o que mais merece conferência (conduta que varia entre diretrizes, dose, número de referência, fonte que você não pôde confirmar). Se não houver, diga "nenhum".

=====
