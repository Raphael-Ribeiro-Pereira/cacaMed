// Conteúdo do Paciente DDX (casos em consulta), portado do protótipo de movimento (versão 2026-10-01).
// Cada fato aponta para uma fonte e a página do PDF; os trechos usados na conferência ficaram fora do jogo.
// Exames numéricos são ilustrativos. Nada foi revisado por médico: `revisado: false` mantém o modo
// restrito ao administrador. Ao mudar um caso, aumente a `versao` dele.
export const VERSAO_CONTEUDO_PACIENTE = '2026-10-01';
export const AVISO_PACIENTE = "Casos escritos a partir das fontes listadas. Exames numéricos são ilustrativos. Nada aqui foi revisado por médico.";

export const FONTES_PACIENTE = {
 "dengue": {
  "curto": "Manual de dengue (MS, 2013)",
  "titulo": "Dengue: diagnóstico e manejo clínico, adulto e criança",
  "orgao": "Ministério da Saúde",
  "ano": 2013,
  "ed": "4ª ed.",
  "tipo": "oficial"
 },
 "cab21": {
  "curto": "Caderno de Atenção Básica nº 21 (MS, 2008)",
  "titulo": "Cadernos de Atenção Básica nº 21: Vigilância em Saúde (dengue, esquistossomose, hanseníase, malária, tracoma e tuberculose)",
  "orgao": "Ministério da Saúde",
  "ano": 2008,
  "ed": "2ª ed. rev.",
  "tipo": "oficial",
  "nota": "Arquivo recebido tem só a parte 1 (119 de 197 páginas)."
 },
 "bolso": {
  "curto": "Guia de bolso de doenças infecciosas (MS, 2010)",
  "titulo": "Doenças infecciosas e parasitárias: guia de bolso",
  "orgao": "Ministério da Saúde",
  "ano": 2010,
  "ed": "8ª ed. rev.",
  "tipo": "oficial",
  "nota": "Edição de 2010: usar para quadro clínico e vigilância; conferir conduta na versão mais atual."
 },
 "guiavig": {
  "curto": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
  "titulo": "Guia de Vigilância em Saúde, volume 3",
  "orgao": "Ministério da Saúde",
  "ano": 2024,
  "ed": "6ª ed. rev.",
  "tipo": "oficial",
  "nota": "Arquivo recebido traz só os capítulos 10 a 12."
 },
 "escorp": {
  "curto": "Boletim de escorpionismo (MS, 2025)",
  "titulo": "Boletim Epidemiológico: epidemiologia dos acidentes escorpiônicos no Brasil em 2023",
  "orgao": "Ministério da Saúde",
  "ano": 2025,
  "ed": "vol. 56, 15 abr.",
  "tipo": "oficial"
 },
 "rs": {
  "curto": "Guia do pré-natal (SES-RS, 2024)",
  "titulo": "Guia do Pré-natal e Puerpério na Atenção Primária à Saúde",
  "orgao": "Secretaria de Estado da Saúde do RS",
  "ano": 2024,
  "ed": "",
  "tipo": "oficial",
  "nota": "Guia estadual (RS), adaptado de normas do Ministério da Saúde."
 },
 "aidpi": {
  "curto": "AIDPI Criança (MS, 2017)",
  "titulo": "AIDPI Criança, 2 meses a 5 anos: manual de quadros de procedimentos",
  "orgao": "Ministério da Saúde / OPAS / UNICEF",
  "ano": 2017,
  "ed": "",
  "tipo": "oficial"
 },
 "neonat": {
  "curto": "AIDPI Neonatal (MS, 2014)",
  "titulo": "Manual AIDPI Neonatal",
  "orgao": "Ministério da Saúde / OPAS",
  "ano": 2014,
  "ed": "5ª ed.",
  "tipo": "oficial"
 },
 "sbc": {
  "curto": "Diretriz de dor torácica (SBC, 2025)",
  "titulo": "Diretriz Brasileira de Atendimento à Dor Torácica na Unidade de Emergência",
  "orgao": "Sociedade Brasileira de Cardiologia",
  "ano": 2025,
  "ed": "Arq Bras Cardiol 122(9):e20250620",
  "tipo": "diretriz"
 },
 "harrison": {
  "curto": "Harrison's Manual, 20ª ed.",
  "titulo": "Harrison's Manual of Medicine",
  "orgao": "McGraw-Hill",
  "ano": 2020,
  "ed": "20th ed.",
  "tipo": "livro",
  "nota": "Livro protegido por direitos autorais: usado só para conferir fatos; o texto dos casos é nosso."
 },
 "portaria": {
  "curto": "Portaria Inep 478/2025",
  "titulo": "Portaria Inep nº 478/2025: Matriz de Referência Comum para a Avaliação da Formação Médica",
  "orgao": "Inep / MEC",
  "ano": 2025,
  "ed": "",
  "tipo": "oficial"
 },
 "dcn": {
  "curto": "DCN de Medicina (2025)",
  "titulo": "Resolução CNE/CES nº 3/2025: Diretrizes Curriculares Nacionais do Curso de Medicina",
  "orgao": "CNE / MEC",
  "ano": 2025,
  "ed": "",
  "tipo": "oficial"
 }
};

export const MODULOS_PACIENTE = [
 {
  "id": "febre-ubs",
  "ordem": 1,
  "nome": "Febre na Unidade Básica",
  "rede": "Rede de Atenção Primária",
  "icone": "stethoscope",
  "resumo": "Febre, mancha na pele e tosse que não passa: o que a vigilância não pode deixar escapar.",
  "base": [
   {
    "fonte": "portaria",
    "pag": 3,
    "sobre": "Cenário I: Rede de Atenção Primária e seu território."
   }
  ]
 },
 {
  "id": "dor-toracica",
  "ordem": 2,
  "nome": "Dor no peito na emergência",
  "rede": "Rede de Atenção a Urgência e Emergência",
  "icone": "heart-pulse",
  "resumo": "Três causas de dor torácica que não esperam: infarto, embolia e dissecção de aorta.",
  "base": [
   {
    "fonte": "portaria",
    "pag": 3,
    "sobre": "Cenário II: Rede de Atenção a Urgência e Emergência."
   }
  ]
 },
 {
  "id": "urgencia-horas",
  "ordem": 3,
  "nome": "Quadros que mudam em horas",
  "rede": "Rede de Atenção a Urgência e Emergência",
  "icone": "siren",
  "resumo": "Dengue com sinais de alarme, escorpião e serpente: a primeira impressão engana e o tempo conta.",
  "base": [
   {
    "fonte": "dcn",
    "pag": 9,
    "sobre": "Priorização de doenças cardiovasculares, infecciosas e agravos externos na prática."
   }
  ]
 },
 {
  "id": "pre-natal",
  "ordem": 4,
  "nome": "Pré-natal na Unidade Básica",
  "rede": "Rede Materno-Infantil",
  "icone": "baby",
  "resumo": "Hipertensão, sífilis e infecção urinária na gestação: o que tratar agora e o que encaminhar.",
  "base": [
   {
    "fonte": "portaria",
    "pag": 3,
    "sobre": "Cenário III: Rede Materno-Infantil."
   }
  ]
 },
 {
  "id": "crianca",
  "ordem": 5,
  "nome": "Criança doente",
  "rede": "Rede Materno-Infantil",
  "icone": "smile",
  "resumo": "Avaliar, classificar e tratar pelas cores de risco do AIDPI, do lactente ao recém-nascido.",
  "base": [
   {
    "fonte": "portaria",
    "pag": 3,
    "sobre": "Cenário III: Rede Materno-Infantil."
   }
  ]
 }
];

export const CASOS_PACIENTE = [
 {
  "id": "dengue-a",
  "versao": 1,
  "revisado": false,
  "modulo": "febre-ubs",
  "ordem": 1,
  "nivel": 1,
  "nome": "Dengue sem sinais de alarme (grupo A)",
  "categoria": "Arbovirose",
  "paciente": {
   "nome": "Rafael",
   "idade": "26 anos",
   "cenario": "Unidade Básica de Saúde, período de muitos casos no bairro"
  },
  "queixa": "Febre alta há 3 dias, dor atrás dos olhos e o corpo todo doendo.",
  "pistas": [
   {
    "nome": "Febre alta",
    "texto": "Febre de 39 °C há 3 dias, que cede pouco com paracetamol."
   },
   {
    "nome": "Dor retro-orbitária",
    "texto": "Dor atrás dos olhos, pior ao movimentá-los."
   },
   {
    "nome": "Prostração",
    "texto": "Dor no corpo e cansaço intenso, sem tosse nem coriza."
   }
  ],
  "perguntas": [
   {
    "p": "Quantos dias de febre e como foi a curva?",
    "r": "Três dias, sempre alta, sem períodos sem febre.",
    "chave": true
   },
   {
    "p": "Tem sangramento no nariz, gengiva ou nas fezes?",
    "r": "Nenhum sangramento.",
    "chave": true
   },
   {
    "p": "Alguém perto de você está com o mesmo quadro?",
    "r": "Dois vizinhos e uma colega do curso.",
    "chave": true
   },
   {
    "p": "Sente dor forte na barriga, vomita muito ou fica tonto ao levantar?",
    "r": "Nada disso. Só enjoo leve.",
    "chave": true
   },
   {
    "p": "Tem doença crônica ou usa AAS, anticoagulante ou anti-inflamatório?",
    "r": "Nega doenças. Tomou só paracetamol.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Sinais vitais",
    "resultado": "PA 118×76 mmHg sem queda ao levantar, FC 88, T 38,6 °C. Sem hipotensão postural.",
    "chave": false
   },
   {
    "id": "laco",
    "nome": "Prova do laço",
    "resultado": "Negativa. Sem petéquias nem sangramento espontâneo.",
    "chave": true
   },
   {
    "id": "hemo",
    "nome": "Hemograma (valores ilustrativos)",
    "resultado": "Hematócrito 43%, plaquetas 168 mil, leucócitos 3.800. Sem hemoconcentração.",
    "chave": true
   },
   {
    "id": "sorol",
    "nome": "Sorologia / isolamento viral",
    "resultado": "Coletada. Resultado sai em alguns dias; não muda a conduta de hoje.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Dengue",
    "certa": true,
    "porque": "Febre aguda de até 7 dias com 2 ou mais sintomas inespecíficos e vínculo epidemiológico."
   },
   {
    "nome": "Influenza",
    "certa": false,
    "porque": "Sem sintomas respiratórios. Influenza está entre os diferenciais, mas o contexto aponta para dengue."
   },
   {
    "nome": "Malária",
    "certa": false,
    "porque": "Sem passagem por área de transmissão e sem febre em ciclos."
   },
   {
    "nome": "Leptospirose",
    "certa": false,
    "porque": "Sem exposição a enchente, lama ou esgoto nos últimos 30 dias."
   }
  ],
  "conduta": [
   {
    "texto": "Classificar como grupo A e tratar em ambulatório",
    "certa": true,
    "porque": "Sem sinais de alarme, prova do laço negativa e sem condição especial."
   },
   {
    "texto": "Hidratação oral: 80 ml/kg/dia, com 1/3 de soro de reidratação",
    "certa": true,
    "porque": "É a conduta do grupo A."
   },
   {
    "texto": "Paracetamol ou dipirona para febre e dor",
    "certa": true,
    "porque": "Sintomáticos recomendados."
   },
   {
    "texto": "Ibuprofeno ou AAS para a dor no corpo",
    "certa": false,
    "porque": "Salicilatos e anti-inflamatórios podem causar ou agravar sangramentos."
   },
   {
    "texto": "Orientar sinais de alarme e retorno entre o 3º e o 6º dia",
    "certa": true,
    "porque": "A febre ceder marca o início da fase crítica."
   },
   {
    "texto": "Internar para hidratação venosa",
    "certa": false,
    "porque": "Sem sinal de alarme, não há indicação."
   },
   {
    "texto": "Notificar o caso suspeito",
    "certa": true,
    "porque": "Todo caso suspeito é de notificação."
   }
  ],
  "alerta": {
   "nome": "Fase crítica",
   "quando": "Quando a febre cede, entre o 3º e o 6º dia",
   "resposta": "Retorno imediato se surgir sinal de alarme",
   "porque": "Os sinais de alarme costumam aparecer na remissão da febre, por isso o paciente precisa saber reconhecê-los."
  },
  "notificar": "Notificação de caso suspeito de dengue.",
  "aprendizado": "Febre de até 7 dias com dor retro-orbitária, mialgia e vínculo epidemiológico sugere dengue. Sem alarme e sem risco, o tratamento é hidratação, paracetamol ou dipirona e retorno atento na hora em que a febre cede. AAS e anti-inflamatórios ficam de fora.",
  "citacoes": [
   {
    "fonte": "dengue",
    "pag": 15,
    "sobre": "Definição de caso suspeito."
   },
   {
    "fonte": "dengue",
    "pag": 21,
    "sobre": "Diagnósticos diferenciais da síndrome febril."
   },
   {
    "fonte": "dengue",
    "pag": 24,
    "sobre": "Critérios do grupo A."
   },
   {
    "fonte": "dengue",
    "pag": 24,
    "sobre": "Alarme na fase de remissão da febre."
   },
   {
    "fonte": "dengue",
    "pag": 27,
    "sobre": "Hidratação oral de adultos."
   },
   {
    "fonte": "dengue",
    "pag": 28,
    "sobre": "AAS contraindicado."
   },
   {
    "fonte": "dengue",
    "pag": 30,
    "sobre": "Retorno entre o 3º e o 6º dia."
   }
  ]
 },
 {
  "id": "malaria-vivax",
  "versao": 1,
  "revisado": false,
  "modulo": "febre-ubs",
  "ordem": 2,
  "nivel": 2,
  "nome": "Malária por Plasmodium vivax",
  "categoria": "Protozoose",
  "paciente": {
   "nome": "Tiago",
   "idade": "35 anos",
   "cenario": "Unidade Básica de Saúde em cidade da Amazônia"
  },
  "queixa": "Calafrios, febre e suor que vêm e vão, com muita dor de cabeça.",
  "pistas": [
   {
    "nome": "Calafrio intenso",
    "texto": "Tremores fortes antes do pico de febre."
   },
   {
    "nome": "Febre a cada 48 horas",
    "texto": "Picos de febre em dias alternados, com suor intenso depois."
   },
   {
    "nome": "Fraqueza",
    "texto": "Cansaço importante depois de cada acesso."
   }
  ],
  "perguntas": [
   {
    "p": "De onde o senhor voltou ou onde trabalha?",
    "r": "Voltou há 15 dias de uma comunidade ribeirinha, onde pescava.",
    "chave": true
   },
   {
    "p": "Como é a febre?",
    "r": "Vem com calafrio, sobe muito e depois dá um suor profuso. Dia sim, dia não.",
    "chave": true
   },
   {
    "p": "Já teve malária antes?",
    "r": "Teve uma vez, há dois anos.",
    "chave": false
   },
   {
    "p": "Tem vômitos, sonolência, convulsão ou urina escura?",
    "r": "Nada disso. Come e bebe normalmente.",
    "chave": true
   },
   {
    "p": "Pode estar grávido ou tomando algum remédio de uso contínuo?",
    "r": "Paciente do sexo masculino, sem remédios.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "gota",
    "nome": "Gota espessa",
    "resultado": "Trofozoítos de Plasmodium vivax. Parasitemia baixa.",
    "chave": true
   },
   {
    "id": "tr",
    "nome": "Teste rápido",
    "resultado": "Positivo para outra espécie que não P. falciparum.",
    "chave": false
   },
   {
    "id": "hemo",
    "nome": "Hemograma (valores ilustrativos)",
    "resultado": "Anemia leve e plaquetas em 110 mil.",
    "chave": false
   },
   {
    "id": "sv",
    "nome": "Exame físico",
    "resultado": "T 39,2 °C, esplenomegalia palpável, sem icterícia.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Malária por P. vivax",
    "certa": true,
    "porque": "Febre em ciclos de 48 h, exposição na Amazônia, gota espessa positiva e incubação compatível."
   },
   {
    "nome": "Dengue",
    "certa": false,
    "porque": "Febre sem periodicidade típica; a gota espessa fecha o diagnóstico de malária."
   },
   {
    "nome": "Leptospirose",
    "certa": false,
    "porque": "Sem enchente ou contato com urina de roedor; sem icterícia nem sufusão conjuntival."
   },
   {
    "nome": "Febre tifoide",
    "certa": false,
    "porque": "Sem diarreia nem história que sustente; o parasito na gota espessa resolve."
   }
  ],
  "conduta": [
   {
    "texto": "Confirmar pela gota espessa antes de tratar",
    "certa": true,
    "porque": "É o método oficial de diagnóstico no Brasil."
   },
   {
    "texto": "Cloroquina por 3 dias e primaquina por 7 dias",
    "certa": true,
    "porque": "É o esquema para P. vivax: a cloroquina age no sangue e a primaquina nos hipnozoítos."
   },
   {
    "texto": "Só cloroquina e dar alta",
    "certa": false,
    "porque": "Sem a primaquina, os hipnozoítos no fígado causam recaídas."
   },
   {
    "texto": "Artemeter + lumefantrina",
    "certa": false,
    "porque": "É o esquema de primeira escolha para P. falciparum."
   },
   {
    "texto": "Suspender a primaquina se surgir icterícia",
    "certa": true,
    "porque": "Orientação de segurança do esquema."
   },
   {
    "texto": "Notificar o caso",
    "certa": true,
    "porque": "Malária é de notificação."
   }
  ],
  "alerta": {
   "nome": "Hipnozoítos",
   "quando": "Depois que o sangue já foi tratado",
   "resposta": "Primaquina: cura radical",
   "porque": "No P. vivax, formas dormentes no fígado causam recaídas tardias; o tratamento precisa atingi-las."
  },
  "notificar": "Notificação compulsória de malária.",
  "aprendizado": "Febre com calafrios em ciclos de 48 horas depois de estadia na Amazônia exige gota espessa. No P. vivax, tratar só o sangue deixa os hipnozoítos e a recaída: o esquema completo une cloroquina e primaquina.",
  "citacoes": [
   {
    "fonte": "cab21",
    "pag": 101,
    "sobre": "Quadro clássico: calafrio, febre, suor, cefaleia em ciclos."
   },
   {
    "fonte": "cab21",
    "pag": 101,
    "sobre": "Ciclo de 48 h em P. vivax e P. falciparum."
   },
   {
    "fonte": "cab21",
    "pag": 103,
    "sobre": "Incubação do P. vivax: 13 a 17 dias."
   },
   {
    "fonte": "cab21",
    "pag": 105,
    "sobre": "Gota espessa é o método oficial."
   },
   {
    "fonte": "cab21",
    "pag": 106,
    "sobre": "Objetivo de eliminar hipnozoítos do P. vivax."
   },
   {
    "fonte": "cab21",
    "pag": 108,
    "sobre": "Esquema cloroquina 3 dias + primaquina 7 dias."
   },
   {
    "fonte": "cab21",
    "pag": 108,
    "sobre": "Primaquina contraindicada em gestantes e menores de 6 meses."
   },
   {
    "fonte": "cab21",
    "pag": 109,
    "sobre": "Artemeter + lumefantrina é para P. falciparum."
   }
  ]
 },
 {
  "id": "leptospirose",
  "versao": 1,
  "revisado": false,
  "modulo": "febre-ubs",
  "ordem": 3,
  "nivel": 2,
  "nome": "Leptospirose",
  "categoria": "Zoonose",
  "paciente": {
   "nome": "Seu Jorge",
   "idade": "44 anos",
   "cenario": "UBS de bairro alagado há uma semana; trabalha catando material reciclável"
  },
  "queixa": "Febre de início brusco, dor muscular forte e olhos muito vermelhos.",
  "pistas": [
   {
    "nome": "Febre de início abrupto",
    "texto": "Começou de repente, há 4 dias, com dor de cabeça."
   },
   {
    "nome": "Mialgia intensa",
    "texto": "Dor muscular forte, que dificulta andar."
   },
   {
    "nome": "Sufusão conjuntival",
    "texto": "Olhos vermelhos, sem secreção."
   }
  ],
  "perguntas": [
   {
    "p": "Teve contato com água de enchente, lama ou esgoto?",
    "r": "Limpou a casa depois da cheia e pisou em lama sem botas.",
    "chave": true
   },
   {
    "p": "Trabalha com lixo ou entulho?",
    "r": "Cata material reciclável perto de um córrego.",
    "chave": true
   },
   {
    "p": "Notou a pele ou os olhos amarelados?",
    "r": "Ainda não.",
    "chave": true
   },
   {
    "p": "Mudou a quantidade de urina? Tem falta de ar ou tosse com sangue?",
    "r": "Urina normal. Sem falta de ar.",
    "chave": true
   },
   {
    "p": "Já tomou algum antibiótico?",
    "r": "Não.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Sinais vitais",
    "resultado": "T 38,9 °C, FC 98, PA 120×80. Sem icterícia.",
    "chave": false
   },
   {
    "id": "hemo",
    "nome": "Hemograma (valores ilustrativos)",
    "resultado": "Leucocitose com neutrofilia e plaquetas em 98 mil.",
    "chave": false
   },
   {
    "id": "bioq",
    "nome": "Ureia, creatinina, bilirrubina, CPK, K⁺",
    "resultado": "Ureia e creatinina no limite superior, bilirrubina normal, CPK elevada, potássio 3,3 mEq/L.",
    "chave": true
   },
   {
    "id": "elisa",
    "nome": "ELISA-IgM (coletado hoje, 4º dia)",
    "resultado": "Não reagente. Amostra colhida antes do 7º dia não descarta o caso.",
    "chave": true
   }
  ],
  "hipoteses": [
   {
    "nome": "Leptospirose (fase precoce)",
    "certa": true,
    "porque": "Febre, mialgia e sufusão conjuntival com exposição a lama de enchente."
   },
   {
    "nome": "Dengue",
    "certa": false,
    "porque": "Também causa febre e dor no corpo, mas a exposição de risco aponta para lepto; ambas entram no diferencial."
   },
   {
    "nome": "Hepatite viral aguda",
    "certa": false,
    "porque": "Ainda sem icterícia; mesmo depois dela, CPK elevada e hipocalemia ajudam a diferenciar."
   },
   {
    "nome": "Malária",
    "certa": false,
    "porque": "Sem passagem por área de transmissão."
   }
  ],
  "conduta": [
   {
    "texto": "Iniciar antibiótico oral já: doxiciclina 100 mg de 12/12 h por 5 a 7 dias ou amoxicilina",
    "certa": true,
    "porque": "Na fase precoce, o tratamento não espera a sorologia."
   },
   {
    "texto": "Aguardar o ELISA positivo para tratar",
    "certa": false,
    "porque": "Resultado negativo antes do 7º dia não descarta e atrasa o tratamento."
   },
   {
    "texto": "Colher nova amostra a partir do 7º dia",
    "certa": true,
    "porque": "Para interpretar a sorologia."
   },
   {
    "texto": "Notificar o caso suspeito",
    "certa": true,
    "porque": "Doença de notificação compulsória."
   },
   {
    "texto": "Orientar sinais de gravidade e retorno: icterícia, diminuição da urina, falta de ar",
    "certa": true,
    "porque": "Cerca de 15% evoluem para forma grave após a primeira semana."
   },
   {
    "texto": "Prescrever só sintomáticos e liberar",
    "certa": false,
    "porque": "Perde a janela do tratamento precoce."
   }
  ],
  "alerta": {
   "nome": "Síndrome de Weil",
   "quando": "Depois da primeira semana, em cerca de 15% dos casos",
   "resposta": "Penicilina cristalina IV, hidratação e diálise precoce se preciso",
   "porque": "Icterícia rubínica, insuficiência renal e hemorragia (às vezes pulmonar) exigem internação e antibiótico venoso por pelo menos 7 dias."
  },
  "notificar": "Notificação compulsória de leptospirose.",
  "aprendizado": "Febre abrupta, mialgia e sufusão conjuntival depois de contato com lama de enchente são leptospirose até prova em contrário. Trata-se já, sem esperar a sorologia, e orienta-se a procurar o serviço se surgir icterícia, redução da urina ou falta de ar.",
  "citacoes": [
   {
    "fonte": "bolso",
    "pag": 284,
    "sobre": "Fase tardia: síndrome de Weil."
   },
   {
    "fonte": "bolso",
    "pag": 284,
    "sobre": "Icterícia rubínica."
   },
   {
    "fonte": "bolso",
    "pag": 286,
    "sobre": "IRA não oligúrica e hipocalêmica."
   },
   {
    "fonte": "bolso",
    "pag": 287,
    "sobre": "Hipocalemia ajuda no diagnóstico diferencial."
   },
   {
    "fonte": "bolso",
    "pag": 288,
    "sobre": "Doxiciclina na fase precoce."
   },
   {
    "fonte": "bolso",
    "pag": 288,
    "sobre": "Penicilina cristalina na fase tardia."
   },
   {
    "fonte": "bolso",
    "pag": 288,
    "sobre": "Diálise peritoneal precoce."
   },
   {
    "fonte": "bolso",
    "pag": 289,
    "sobre": "Antecedentes epidemiológicos: enchentes e lama."
   },
   {
    "fonte": "bolso",
    "pag": 289,
    "sobre": "Sufusão conjuntival como critério clínico."
   },
   {
    "fonte": "bolso",
    "pag": 289,
    "sobre": "Notificação compulsória."
   },
   {
    "fonte": "bolso",
    "pag": 290,
    "sobre": "Sorologia negativa antes do 7º dia não descarta."
   }
  ]
 },
 {
  "id": "hanseniase",
  "versao": 1,
  "revisado": false,
  "modulo": "febre-ubs",
  "ordem": 4,
  "nivel": 2,
  "nome": "Hanseníase paucibacilar",
  "categoria": "Doença crônica transmissível",
  "paciente": {
   "nome": "Dona Neide",
   "idade": "52 anos",
   "cenario": "UBS rural; trabalha na roça"
  },
  "queixa": "Mancha clara no braço que não coça, com a pele ‘dormente’.",
  "pistas": [
   {
    "nome": "Mancha hipocrômica",
    "texto": "Mancha mais clara que a pele ao redor, no antebraço direito, há 8 meses."
   },
   {
    "nome": "Perda de sensibilidade",
    "texto": "Não sente calor nem a ponta da agulha sobre a mancha."
   },
   {
    "nome": "Formigamento",
    "texto": "Formigamento na mão do mesmo lado."
   }
  ],
  "perguntas": [
   {
    "p": "Quanto tempo tem a mancha e ela coça ou dói?",
    "r": "Oito meses. Não coça, não dói.",
    "chave": true
   },
   {
    "p": "Sente a pele da mancha igual à pele normal?",
    "r": "Parece dormente, não sente quente nem frio ali.",
    "chave": true
   },
   {
    "p": "Alguém na família ou na vizinhança teve doença parecida?",
    "r": "Um cunhado que morou na casa dela fez tratamento longo anos atrás.",
    "chave": true
   },
   {
    "p": "Tem fraqueza na mão, dor nos nervos ou feridas sem dor?",
    "r": "Fraqueza leve para segurar a enxada.",
    "chave": false
   },
   {
    "p": "Já usou algum remédio para a mancha?",
    "r": "Pomada de fungo, sem melhora.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "dermato",
    "nome": "Exame dermatoneurológico",
    "resultado": "Três lesões hipocrômicas com perda da sensibilidade térmica e dolorosa. Nervo ulnar direito espessado e doloroso à palpação.",
    "chave": true
   },
   {
    "id": "bacilo",
    "nome": "Baciloscopia de pele",
    "resultado": "Negativa. Não exclui hanseníase.",
    "chave": true
   },
   {
    "id": "incap",
    "nome": "Avaliação de incapacidades",
    "resultado": "Força da mão preservada, grau 0, sensibilidade alterada na área da lesão.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Hanseníase",
    "certa": true,
    "porque": "Lesões com alteração de sensibilidade e nervo periférico espessado: critérios clínicos."
   },
   {
    "nome": "Vitiligo",
    "certa": false,
    "porque": "Mancha clara sem alteração de sensibilidade; está entre os diferenciais."
   },
   {
    "nome": "Pitiríase versicolor",
    "certa": false,
    "porque": "Descamação fina e sem perda de sensibilidade."
   },
   {
    "nome": "Dermatofitose (tinha)",
    "certa": false,
    "porque": "Costuma coçar e tem borda ativa; não explica nervo espessado."
   }
  ],
  "conduta": [
   {
    "texto": "Classificar como paucibacilar (até 5 lesões) e iniciar poliquimioterapia",
    "certa": true,
    "porque": "Classificação operacional pelo número de lesões: 6 cartelas no esquema PB."
   },
   {
    "texto": "Esperar baciloscopia positiva para tratar",
    "certa": false,
    "porque": "O diagnóstico é clínico, e baciloscopia negativa não exclui."
   },
   {
    "texto": "Tratar na unidade básica, em regime ambulatorial",
    "certa": true,
    "porque": "O tratamento é ambulatorial."
   },
   {
    "texto": "Examinar os contatos domiciliares",
    "certa": true,
    "porque": "Investigação de contatos é parte da descoberta de casos."
   },
   {
    "texto": "Afastar a paciente do convívio e do trabalho",
    "certa": false,
    "porque": "Não é necessário e alimenta estigma; a transmissão cai com o início do tratamento."
   },
   {
    "texto": "Notificar e acompanhar a prevenção de incapacidades",
    "certa": true,
    "porque": "Notificação e avaliação neurológica fazem parte do cuidado."
   }
  ],
  "alerta": {
   "nome": "Reação hansênica",
   "quando": "Antes, durante ou depois da poliquimioterapia",
   "resposta": "Prednisona 1 a 2 mg/kg/dia e manter a PQT",
   "porque": "Novas lesões, dor e espessamento de nervo indicam reação. Ela não interrompe a PQT e é a principal causa de incapacidades."
  },
  "notificar": "Notificação compulsória de hanseníase.",
  "aprendizado": "Mancha com perda de sensibilidade e nervo espessado é hanseníase: o diagnóstico é clínico e a baciloscopia negativa não exclui. Até 5 lesões é paucibacilar. Trata-se na unidade básica, examina-se os contatos e fica-se atento às reações, que causam as incapacidades.",
  "citacoes": [
   {
    "fonte": "bolso",
    "pag": 209,
    "sobre": "Critério: lesão de pele com alteração de sensibilidade."
   },
   {
    "fonte": "bolso",
    "pag": 209,
    "sobre": "Paucibacilar: até 5 lesões."
   },
   {
    "fonte": "bolso",
    "pag": 209,
    "sobre": "Baciloscopia negativa não exclui."
   },
   {
    "fonte": "bolso",
    "pag": 209,
    "sobre": "Vitiligo no diagnóstico diferencial."
   },
   {
    "fonte": "bolso",
    "pag": 210,
    "sobre": "Tratamento ambulatorial."
   },
   {
    "fonte": "bolso",
    "pag": 210,
    "sobre": "Reações causam incapacidades."
   },
   {
    "fonte": "bolso",
    "pag": 211,
    "sobre": "Esquema PB: 6 cartelas."
   },
   {
    "fonte": "bolso",
    "pag": 213,
    "sobre": "Reação não contraindica a PQT."
   },
   {
    "fonte": "bolso",
    "pag": 214,
    "sobre": "Prednisona na reação tipo 1."
   },
   {
    "fonte": "cab21",
    "pag": 92,
    "sobre": "Investigação de contatos."
   }
  ]
 },
 {
  "id": "tuberculose",
  "versao": 1,
  "revisado": false,
  "modulo": "febre-ubs",
  "ordem": 5,
  "nivel": 3,
  "nome": "Tuberculose pulmonar",
  "categoria": "Micobacteriose",
  "paciente": {
   "nome": "Seu Carlos",
   "idade": "38 anos",
   "cenario": "UBS; vive com esposa e dois filhos pequenos"
  },
  "queixa": "Tosse com catarro há 4 semanas, febrícula à tarde e emagrecimento.",
  "pistas": [
   {
    "nome": "Tosse produtiva",
    "texto": "Tosse com catarro há quatro semanas, pior de manhã."
   },
   {
    "nome": "Febre vespertina",
    "texto": "Febre baixa no fim da tarde, com suor à noite."
   },
   {
    "nome": "Emagrecimento",
    "texto": "Perdeu 6 kg em 2 meses, com pouca fome."
   }
  ],
  "perguntas": [
   {
    "p": "Há quanto tempo tosse e expectora?",
    "r": "Quatro semanas, sem melhora com xarope.",
    "chave": true
   },
   {
    "p": "Tem febre, suor noturno ou perdeu peso?",
    "r": "Febre baixa à tarde, suor à noite e 6 kg a menos.",
    "chave": true
   },
   {
    "p": "Já teve sangue no catarro?",
    "r": "Uma vez, em fio.",
    "chave": false
   },
   {
    "p": "Alguém em casa ou no trabalho tem tosse prolongada ou tratou tuberculose?",
    "r": "Um colega de trabalho foi diagnosticado há dois meses.",
    "chave": true
   },
   {
    "p": "Já fez tratamento para tuberculose?",
    "r": "Nunca.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Exame físico",
    "resultado": "T 37,8 °C, emagrecido, estertores em ápice direito.",
    "chave": false
   },
   {
    "id": "baar",
    "nome": "Baciloscopia de escarro (2 amostras)",
    "resultado": "Positiva em ambas: bacilos álcool-ácido resistentes.",
    "chave": true
   },
   {
    "id": "rx",
    "nome": "Radiografia de tórax",
    "resultado": "Infiltrado com cavidade em ápice direito (ilustrativo).",
    "chave": false
   },
   {
    "id": "cult",
    "nome": "Cultura de escarro",
    "resultado": "Colhida. Indicada em suspeita de resistência ou baciloscopia negativa.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Tuberculose pulmonar",
    "certa": true,
    "porque": "Sintomático respiratório (tosse por 3 semanas ou mais), sintomas gerais e baciloscopia positiva."
   },
   {
    "nome": "Pneumonia bacteriana comum",
    "certa": false,
    "porque": "Início agudo e resposta a antibiótico; aqui são 4 semanas sem melhora e sintomas constitucionais."
   },
   {
    "nome": "Neoplasia pulmonar",
    "certa": false,
    "porque": "Entra no diferencial, mas a baciloscopia positiva confirma tuberculose."
   },
   {
    "nome": "Bronquite aguda",
    "certa": false,
    "porque": "Não dura 4 semanas com febre vespertina e emagrecimento."
   }
  ],
  "conduta": [
   {
    "texto": "Pedir baciloscopia de 2 amostras: uma na consulta e outra na manhã seguinte",
    "certa": true,
    "porque": "É o método prioritário para todo sintomático respiratório."
   },
   {
    "texto": "Esquema básico: 2 meses de RHZE seguidos de 4 meses de RH",
    "certa": true,
    "porque": "Para adultos e adolescentes."
   },
   {
    "texto": "Tratamento diretamente observado",
    "certa": true,
    "porque": "Aumenta a adesão e a cura."
   },
   {
    "texto": "Examinar os contatos",
    "certa": true,
    "porque": "Contatos de TB bacilífera devem ser investigados."
   },
   {
    "texto": "Esquema com 3 drogas (RHZ) por ser a primeira vez",
    "certa": false,
    "porque": "Esse é o esquema de crianças menores de 10 anos."
   },
   {
    "texto": "Antibiótico comum por 2 semanas e reavaliar",
    "certa": false,
    "porque": "Atrasa o diagnóstico e mantém a transmissão."
   }
  ],
  "alerta": {
   "nome": "Abandono do tratamento",
   "quando": "Quando os sintomas melhoram, em 2 a 4 semanas",
   "resposta": "Tratamento diretamente observado",
   "porque": "Melhorar não significa curar. Interromper antes de 6 meses favorece recaída e resistência."
  },
  "notificar": "Notificação compulsória de tuberculose.",
  "aprendizado": "Tosse por 3 semanas ou mais obriga a pensar em tuberculose: duas baciloscopias, esquema RHZE por 2 meses e RH por 4, tratamento observado e exame dos contatos. A transmissão cai em poucos dias ou semanas de tratamento.",
  "citacoes": [
   {
    "fonte": "bolso",
    "pag": 412,
    "sobre": "Tosse produtiva é o sintoma mais frequente."
   },
   {
    "fonte": "bolso",
    "pag": 412,
    "sobre": "Febre vespertina, sudorese, emagrecimento."
   },
   {
    "fonte": "bolso",
    "pag": 413,
    "sobre": "Sintomático respiratório: tosse por três semanas ou mais."
   },
   {
    "fonte": "bolso",
    "pag": 413,
    "sobre": "Baciloscopia também nos contatos de bacilíferos."
   },
   {
    "fonte": "bolso",
    "pag": 414,
    "sobre": "Duas amostras de escarro."
   },
   {
    "fonte": "bolso",
    "pag": 417,
    "sobre": "DOTS."
   },
   {
    "fonte": "bolso",
    "pag": 417,
    "sobre": "RHZE por 2 meses, RH por 4."
   },
   {
    "fonte": "bolso",
    "pag": 417,
    "sobre": "Crianças: RHZ na 1ª fase."
   },
   {
    "fonte": "bolso",
    "pag": 418,
    "sobre": "Esquema básico 2RHZE/4RH."
   }
  ]
 },
 {
  "id": "iamcsst",
  "versao": 1,
  "revisado": false,
  "modulo": "dor-toracica",
  "ordem": 1,
  "nivel": 2,
  "nome": "Infarto com supra de ST (IAMCSST)",
  "categoria": "Síndrome coronariana aguda",
  "paciente": {
   "nome": "Seu Antônio",
   "idade": "58 anos",
   "cenario": "Pronto-socorro; hipertenso e tabagista"
  },
  "queixa": "Dor em aperto no meio do peito há 40 minutos, com suor frio.",
  "pistas": [
   {
    "nome": "Dor opressiva",
    "texto": "Aperto retroesternal que irradia para o braço esquerdo."
   },
   {
    "nome": "Sudorese fria",
    "texto": "Pele pálida e suor frio desde o início da dor."
   },
   {
    "nome": "Náusea",
    "texto": "Enjoo e mal-estar intenso."
   }
  ],
  "perguntas": [
   {
    "p": "A dor muda ao respirar ou ao mexer o tronco?",
    "r": "Não. É um aperto constante, que não alivia em repouso.",
    "chave": true
   },
   {
    "p": "Começou quando e o que fazia?",
    "r": "Há 40 minutos, subindo escada.",
    "chave": true
   },
   {
    "p": "Tem hipertensão, diabetes, cigarro ou familiar com infarto?",
    "r": "Hipertenso, fuma 20 cigarros por dia, pai morreu de infarto.",
    "chave": true
   },
   {
    "p": "A dor é rasgante, de início súbito em dorso, ou a pressão difere entre os braços?",
    "r": "Pressão igual nos dois braços. Não é rasgante.",
    "chave": true
   },
   {
    "p": "Usou algum anticoagulante ou teve sangramento recente?",
    "r": "Nega.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Sinais vitais",
    "resultado": "PA 150×90 mmHg, FC 96, SpO₂ 96% em ar ambiente.",
    "chave": false
   },
   {
    "id": "ecg",
    "nome": "ECG em até 10 minutos",
    "resultado": "Supradesnivelamento do ST em V2 a V5, em pelo menos duas derivações contíguas.",
    "chave": true
   },
   {
    "id": "trop",
    "nome": "Troponina",
    "resultado": "Colhida. Não se espera o resultado para decidir a reperfusão.",
    "chave": false
   },
   {
    "id": "rx",
    "nome": "Radiografia de tórax",
    "resultado": "Mediastino de contorno normal. Sem sinais de congestão.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Infarto com supra de ST",
    "certa": true,
    "porque": "Dor típica com supradesnivelamento do ST em derivações contíguas."
   },
   {
    "nome": "Dissecção de aorta",
    "certa": false,
    "porque": "Sem dor rasgante, sem assimetria de pulso nem de pressão."
   },
   {
    "nome": "Embolia pulmonar",
    "certa": false,
    "porque": "Sem dor pleurítica nem fator de risco para trombose."
   },
   {
    "nome": "Pericardite",
    "certa": false,
    "porque": "A dor da pericardite é pleurítica e posicional."
   }
  ],
  "conduta": [
   {
    "texto": "Fazer o ECG em até 10 minutos da chegada",
    "certa": true,
    "porque": "Meta da diretriz para dor torácica."
   },
   {
    "texto": "Dar AAS mastigado imediatamente",
    "certa": true,
    "porque": "162 a 325 mg na apresentação."
   },
   {
    "texto": "Reperfusão: ICP primária se disponível no tempo; senão fibrinólise em até 30 min",
    "certa": true,
    "porque": "O tempo de contato até a reperfusão define a estratégia."
   },
   {
    "texto": "Aguardar a troponina para decidir o tratamento",
    "certa": false,
    "porque": "Com ECG diagnóstico, segue-se direto a rota terapêutica."
   },
   {
    "texto": "Analgesia com morfina IV em pequenas doses",
    "certa": true,
    "porque": "2 a 4 mg, repetidas conforme a dor."
   },
   {
    "texto": "Pedir teste ergométrico para estratificar",
    "certa": false,
    "porque": "Teste de esforço é para casos de baixo risco, não para infarto em curso."
   }
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
   {
    "fonte": "sbc",
    "pag": 10,
    "sobre": "Passo 1: ECG até 10 minutos; ECG diagnóstico leva à rota terapêutica."
   },
   {
    "fonte": "sbc",
    "pag": 13,
    "sobre": "ECG nos primeiros 10 minutos."
   },
   {
    "fonte": "sbc",
    "pag": 13,
    "sobre": "Evitar ancoramento em uma única doença."
   },
   {
    "fonte": "harrison",
    "pag": 705,
    "sobre": "Critério de ECG para IAMCSST."
   },
   {
    "fonte": "harrison",
    "pag": 706,
    "sobre": "AAS imediato."
   },
   {
    "fonte": "harrison",
    "pag": 707,
    "sobre": "Fibrinolítico em até 30 min se ICP demorar."
   },
   {
    "fonte": "harrison",
    "pag": 708,
    "sobre": "Analgesia com morfina."
   },
   {
    "fonte": "harrison",
    "pag": 714,
    "sobre": "IAM de VD: derivações direitas e volume."
   }
  ]
 },
 {
  "id": "tep",
  "versao": 1,
  "revisado": false,
  "modulo": "dor-toracica",
  "ordem": 2,
  "nivel": 2,
  "nome": "Tromboembolismo pulmonar",
  "categoria": "Doença tromboembólica",
  "paciente": {
   "nome": "Marina",
   "idade": "38 anos",
   "cenario": "Pronto-socorro; 10 dias de imobilização do tornozelo após fratura"
  },
  "queixa": "Dor no peito que piora ao respirar e falta de ar de início súbito.",
  "pistas": [
   {
    "nome": "Dor pleurítica",
    "texto": "Dor em pontada, que aumenta ao inspirar."
   },
   {
    "nome": "Dispneia súbita",
    "texto": "Falta de ar que começou de repente, em repouso."
   },
   {
    "nome": "Taquicardia",
    "texto": "Coração acelerado, sem febre."
   }
  ],
  "perguntas": [
   {
    "p": "A dor piora ao respirar fundo?",
    "r": "Sim. Piora ao inspirar.",
    "chave": true
   },
   {
    "p": "Começou de repente?",
    "r": "Foi de uma hora para outra, ao levantar da cama.",
    "chave": true
   },
   {
    "p": "Fez cirurgia, ficou imobilizada ou teve trombose antes?",
    "r": "Imobilizou o tornozelo há 10 dias, com gesso.",
    "chave": true
   },
   {
    "p": "A perna está inchada ou dolorosa?",
    "r": "A panturrilha da perna imobilizada está mais inchada.",
    "chave": true
   },
   {
    "p": "Tem sangramento ativo ou tomou anticoagulante?",
    "r": "Nega.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Sinais vitais",
    "resultado": "FC 112, FR 24, SpO₂ 91% em ar ambiente, PA 118×74 mmHg.",
    "chave": false
   },
   {
    "id": "ecg",
    "nome": "ECG",
    "resultado": "Taquicardia sinusal, inespecífica.",
    "chave": false
   },
   {
    "id": "rx",
    "nome": "Radiografia de tórax",
    "resultado": "Pequena atelectasia à direita. Sem pneumotórax.",
    "chave": false
   },
   {
    "id": "wells",
    "nome": "Escore de Wells",
    "resultado": "Probabilidade clínica: TEP provável (5 pontos ou mais).",
    "chave": true
   },
   {
    "id": "angio",
    "nome": "Angiotomografia de artérias pulmonares",
    "resultado": "Falha de enchimento no ramo lobar inferior direito.",
    "chave": true
   }
  ],
  "hipoteses": [
   {
    "nome": "Tromboembolismo pulmonar",
    "certa": true,
    "porque": "Dor pleurítica súbita, dispneia, fator de risco (imobilização) e Wells alto."
   },
   {
    "nome": "Infarto agudo do miocárdio",
    "certa": false,
    "porque": "A dor é pleurítica e há fator de risco para trombose."
   },
   {
    "nome": "Dissecção de aorta",
    "certa": false,
    "porque": "Sem dor rasgante nem assimetria de pulsos."
   },
   {
    "nome": "Pneumotórax",
    "certa": false,
    "porque": "O Rx não mostra pneumotórax."
   }
  ],
  "conduta": [
   {
    "texto": "Estratificar com Wells antes de decidir os exames",
    "certa": true,
    "porque": "Os escores orientam o fluxograma diagnóstico."
   },
   {
    "texto": "Com probabilidade alta, sem sangramento: iniciar anticoagulação plena já",
    "certa": true,
    "porque": "Em média ou alta probabilidade, a primeira dose pode ser dada antes da imagem."
   },
   {
    "texto": "Angiotomografia de artérias pulmonares",
    "certa": true,
    "porque": "É o exame de imagem mais usado."
   },
   {
    "texto": "Descartar TEP porque o ECG só mostra taquicardia",
    "certa": false,
    "porque": "Taquicardia sinusal, inespecífica, só aparece em cerca de 40% dos casos."
   },
   {
    "texto": "Dar alta com D-dímero e analgésico",
    "certa": false,
    "porque": "Com alta probabilidade o D-dímero não é o caminho; a imagem é necessária."
   }
  ],
  "alerta": {
   "nome": "Instabilidade",
   "quando": "Hipotensão ou choque",
   "resposta": "Ecocardiograma à beira-leito; suspeitar de sobrecarga de VD",
   "porque": "Se a angiotomografia não puder ser feita, sobrecarga de VD ao eco serve de evidência indireta."
  },
  "notificar": null,
  "aprendizado": "Dor pleurítica súbita com dispneia e imobilização recente pensa em TEP. O ECG pode ser só taquicardia. O Wells define a probabilidade, a anticoagulação pode começar antes da imagem quando a probabilidade é média ou alta e não há sangramento, e a angiotomografia confirma.",
  "citacoes": [
   {
    "fonte": "sbc",
    "pag": 14,
    "sobre": "Dor do TEP: pleurítica e súbita."
   },
   {
    "fonte": "sbc",
    "pag": 14,
    "sobre": "Anticoagulação plena em probabilidade média ou alta, sem sangramento."
   },
   {
    "fonte": "sbc",
    "pag": 14,
    "sobre": "D-dímero: corte de 500 ng/mL."
   },
   {
    "fonte": "sbc",
    "pag": 31,
    "sobre": "ECG: taquicardia sinusal em cerca de 40%."
   },
   {
    "fonte": "sbc",
    "pag": 32,
    "sobre": "TEP provável com Wells de 5 ou mais."
   },
   {
    "fonte": "sbc",
    "pag": 34,
    "sobre": "Angiotomografia é o exame mais usado."
   },
   {
    "fonte": "sbc",
    "pag": 27,
    "sobre": "Eco com sobrecarga de VD em instáveis sem angio."
   }
  ]
 },
 {
  "id": "dissecao-aorta",
  "versao": 1,
  "revisado": false,
  "modulo": "dor-toracica",
  "ordem": 3,
  "nivel": 3,
  "nome": "Dissecção aguda de aorta",
  "categoria": "Síndrome aórtica aguda",
  "paciente": {
   "nome": "Seu Raimundo",
   "idade": "63 anos",
   "cenario": "Pronto-socorro; hipertenso sem tratamento regular"
  },
  "queixa": "Dor insuportável no peito que foi para as costas, começou de repente.",
  "pistas": [
   {
    "nome": "Dor abrupta e intensa",
    "texto": "Dor torácica que irradia para o dorso, ‘rasgando’."
   },
   {
    "nome": "Assimetria de pressão",
    "texto": "Pressão diferente entre os dois braços."
   },
   {
    "nome": "Sudorese",
    "texto": "Pálido, suando, muito agitado."
   }
  ],
  "perguntas": [
   {
    "p": "Como começou a dor?",
    "r": "De repente, no auge, há 1 hora.",
    "chave": true
   },
   {
    "p": "Como é a dor?",
    "r": "Rasgante, vai do peito para as costas.",
    "chave": true
   },
   {
    "p": "Tem doenças da aorta ou na família?",
    "r": "O irmão operou aneurisma de aorta.",
    "chave": true
   },
   {
    "p": "Sente fraqueza em um braço, perna ou fala enrolada?",
    "r": "Nada.",
    "chave": false
   },
   {
    "p": "Usa AAS ou anticoagulante?",
    "r": "Não.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Pressão nos dois braços",
    "resultado": "Braço direito 180×100; braço esquerdo 140×80. Pulso radial esquerdo mais fraco.",
    "chave": true
   },
   {
    "id": "ecg",
    "nome": "ECG",
    "resultado": "Sem supradesnivelamento de ST.",
    "chave": false
   },
   {
    "id": "rx",
    "nome": "Radiografia de tórax",
    "resultado": "Alargamento do mediastino.",
    "chave": true
   },
   {
    "id": "pocus",
    "nome": "POCUS à beira-leito",
    "resultado": "Flap intimal em raiz de aorta e pequeno derrame pericárdico.",
    "chave": true
   }
  ],
  "hipoteses": [
   {
    "nome": "Dissecção aguda de aorta",
    "certa": true,
    "porque": "Dor abrupta, intensa e rasgante, assimetria de pulso e pressão, alargamento de mediastino."
   },
   {
    "nome": "Infarto com supra de ST",
    "certa": false,
    "porque": "O ECG não tem supra, e a assimetria de pressão muda o raciocínio."
   },
   {
    "nome": "Embolia pulmonar",
    "certa": false,
    "porque": "Não é pleurítica nem há fator de risco."
   },
   {
    "nome": "Pericardite",
    "certa": false,
    "porque": "Dor da pericardite é pleurítica e posicional."
   }
  ],
  "conduta": [
   {
    "texto": "Aplicar o escore ADD-RS: mais de 1 ponto ou sinais no POCUS/Rx leva à angiotomografia de aorta",
    "certa": true,
    "porque": "O fluxograma de síndrome aórtica aguda."
   },
   {
    "texto": "Não dar antiagregante nem anticoagulante até confirmar ou descartar",
    "certa": true,
    "porque": "Tratar como SCA seria deletério na dissecção."
   },
   {
    "texto": "Realizar angiotomografia de aorta torácica e abdominal",
    "certa": true,
    "porque": "Exame de imagem mais usado."
   },
   {
    "texto": "Dar AAS e heparina como ‘infarto presumido’",
    "certa": false,
    "porque": "Antiagregante e anticoagulante estão contraindicados enquanto a dissecção não é descartada."
   },
   {
    "texto": "Descartar dissecção com D-dímero isolado",
    "certa": false,
    "porque": "O D-dímero só entra no fluxo de baixa probabilidade; aqui a probabilidade é alta."
   }
  ],
  "alerta": {
   "nome": "Letalidade precoce",
   "quando": "Sem diagnóstico",
   "resposta": "Raciocinar sobre a hipótese antes do tratamento padrão",
   "porque": "A letalidade estimada é de cerca de 50% em 48 horas, e uma conduta de SCA pode piorar o quadro."
  },
  "notificar": null,
  "aprendizado": "Dor abrupta, intensa e rasgante, com assimetria de pulso ou pressão, não é para tratar como infarto. A dissecção é rara perto do IAM, mas se não for pensada, não será diagnosticada: ADD-RS, POCUS e angiotomografia, e nada de antiagregante até descartar.",
  "citacoes": [
   {
    "fonte": "sbc",
    "pag": 13,
    "sobre": "Letalidade em torno de 50% em 48 horas."
   },
   {
    "fonte": "sbc",
    "pag": 14,
    "sobre": "Adiar antiagregante e anticoagulante."
   },
   {
    "fonte": "sbc",
    "pag": 32,
    "sobre": "Dor de alto risco: abrupta, intensa, rasgante."
   },
   {
    "fonte": "sbc",
    "pag": 32,
    "sobre": "Assimetria de pulso e de pressão."
   },
   {
    "fonte": "sbc",
    "pag": 32,
    "sobre": "Alta probabilidade: angiotomografia."
   },
   {
    "fonte": "sbc",
    "pag": 31,
    "sobre": "ADD-RS e AORTA não bastam sozinhos."
   },
   {
    "fonte": "sbc",
    "pag": 30,
    "sobre": "Angiotomografia como exame mais usado."
   }
  ]
 },
 {
  "id": "dengue-c",
  "versao": 1,
  "revisado": false,
  "modulo": "urgencia-horas",
  "ordem": 1,
  "nivel": 2,
  "nome": "Dengue com sinais de alarme (grupo C)",
  "categoria": "Arbovirose",
  "paciente": {
   "nome": "Dona Marta",
   "idade": "47 anos",
   "cenario": "Pronto atendimento; 5º dia de doença, a febre sumiu ontem"
  },
  "queixa": "A febre passou, mas agora tem dor forte na barriga e vomita sem parar.",
  "pistas": [
   {
    "nome": "Dor abdominal intensa e contínua",
    "texto": "Dor no abdome desde a madrugada, que não alivia."
   },
   {
    "nome": "Vômitos persistentes",
    "texto": "Não consegue manter nem água."
   },
   {
    "nome": "Tontura ao levantar",
    "texto": "Quase desmaiou ao ir ao banheiro."
   }
  ],
  "perguntas": [
   {
    "p": "Quando acabou a febre e como vinha o quadro?",
    "r": "Febre alta por 4 dias, parou ontem. Hoje piorou.",
    "chave": true
   },
   {
    "p": "Tem sangramento de gengiva, nariz ou fezes escuras?",
    "r": "Um pouco de sangramento na gengiva.",
    "chave": true
   },
   {
    "p": "Quantas vezes urinou hoje?",
    "r": "Duas vezes, pouca quantidade.",
    "chave": true
   },
   {
    "p": "Usou algum anti-inflamatório ou AAS?",
    "r": "Tomou um comprimido de ibuprofeno ontem.",
    "chave": false
   },
   {
    "p": "Alguém com dengue na casa?",
    "r": "O filho teve dengue há uma semana.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Pressão deitada e em pé",
    "resultado": "Deitada 110×70; em pé 90×60 com tontura. FC 108. Hipotensão postural.",
    "chave": true
   },
   {
    "id": "hemo",
    "nome": "Hemograma (valores ilustrativos)",
    "resultado": "Hematócrito 49% (mulher, acima de 44%) e plaquetas 42 mil, queda abrupta.",
    "chave": true
   },
   {
    "id": "usg",
    "nome": "Ultrassonografia de abdome",
    "resultado": "Pequena quantidade de líquido livre e espessamento da parede da vesícula.",
    "chave": true
   },
   {
    "id": "lab",
    "nome": "Albumina e transaminases",
    "resultado": "Albumina baixa e transaminases elevadas.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Dengue com sinais de alarme (grupo C)",
    "certa": true,
    "porque": "Alarme na fase de remissão da febre, hemoconcentração e plaquetopenia progressiva."
   },
   {
    "nome": "Abdome agudo cirúrgico",
    "certa": false,
    "porque": "Faz parte do diferencial de dor abdominal na dengue, mas hemoconcentração e plaquetas em queda apontam para dengue."
   },
   {
    "nome": "Gastroenterite viral",
    "certa": false,
    "porque": "Não explicaria hemoconcentração e queda abrupta de plaquetas."
   },
   {
    "nome": "Leptospirose",
    "certa": false,
    "porque": "Sem exposição de risco; o contexto epidemiológico é de dengue."
   }
  ],
  "conduta": [
   {
    "texto": "Hidratação venosa imediata: 20 ml/kg/h por 2 horas, soro fisiológico ou Ringer",
    "certa": true,
    "porque": "Fase de expansão do grupo C."
   },
   {
    "texto": "Reavaliar clínica e hematócrito após 2 horas",
    "certa": true,
    "porque": "Define se repete a expansão."
   },
   {
    "texto": "Manter em leito de internação por pelo menos 48 horas",
    "certa": true,
    "porque": "Para o grupo C."
   },
   {
    "texto": "Notificar imediatamente",
    "certa": true,
    "porque": "Forma com sinal de alarme exige notificação imediata."
   },
   {
    "texto": "Prescrever anti-inflamatório para a dor abdominal",
    "certa": false,
    "porque": "AINEs aumentam o risco de sangramento."
   },
   {
    "texto": "Dar soro oral e liberar para casa",
    "certa": false,
    "porque": "Com alarme, hidratação oral domiciliar é insuficiente."
   }
  ],
  "alerta": {
   "nome": "Resposta inadequada",
   "quando": "Sem melhora depois de 3 fases de expansão",
   "resposta": "Conduzir como grupo D",
   "porque": "Persistindo choque ou hematócrito em ascensão, passa-se à conduta do grupo D, em terapia intensiva."
  },
  "notificar": "Notificação imediata.",
  "aprendizado": "Na dengue, o alarme costuma aparecer quando a febre cede. Dor abdominal intensa, vômitos persistentes, hipotensão postural, hematócrito subindo e plaquetas caindo pedem hidratação venosa rápida, reavaliação em 2 horas e internação. Nada de anti-inflamatório.",
  "citacoes": [
   {
    "fonte": "dengue",
    "pag": 21,
    "sobre": "Dor abdominal entra no diferencial da dengue."
   },
   {
    "fonte": "dengue",
    "pag": 25,
    "sobre": "Queda progressiva de plaquetas como alarme."
   },
   {
    "fonte": "dengue",
    "pag": 31,
    "sobre": "Hematócrito para mulheres: acima de 44%."
   },
   {
    "fonte": "dengue",
    "pag": 32,
    "sobre": "Grupo C: presença de algum sinal de alarme."
   },
   {
    "fonte": "dengue",
    "pag": 33,
    "sobre": "Lista de sinais de alarme."
   },
   {
    "fonte": "dengue",
    "pag": 34,
    "sobre": "Expansão: 20 ml/kg/h por 2 h."
   },
   {
    "fonte": "dengue",
    "pag": 34,
    "sobre": "Internação por no mínimo 48 h."
   },
   {
    "fonte": "dengue",
    "pag": 34,
    "sobre": "Resposta inadequada: conduzir como grupo D."
   },
   {
    "fonte": "dengue",
    "pag": 34,
    "sobre": "Notificar imediatamente."
   }
  ]
 },
 {
  "id": "escorpionismo",
  "versao": 1,
  "revisado": false,
  "modulo": "urgencia-horas",
  "ordem": 2,
  "nivel": 2,
  "nome": "Escorpionismo moderado",
  "categoria": "Acidente por animal peçonhento",
  "paciente": {
   "nome": "Lucas",
   "idade": "5 anos",
   "cenario": "Pronto atendimento; picado na mão há 2 horas, ao pegar um calçado"
  },
  "queixa": "Foi picado por escorpião, com dor forte e agora vomita e está agitado.",
  "pistas": [
   {
    "nome": "Dor local imediata",
    "texto": "Dor intensa na mão, com formigamento."
   },
   {
    "nome": "Sudorese profusa",
    "texto": "Suor frio pelo corpo todo."
   },
   {
    "nome": "Agitação e vômitos",
    "texto": "Inquieto, com vômitos e salivação."
   }
  ],
  "perguntas": [
   {
    "p": "Viu o animal ou onde foi a picada?",
    "r": "Estava dentro de um tênis, no quintal. Era amarelo.",
    "chave": true
   },
   {
    "p": "Há quanto tempo foi?",
    "r": "Duas horas.",
    "chave": true
   },
   {
    "p": "Quais sintomas apareceram depois?",
    "r": "Vômitos, suor, babando mais que o normal e muito agitado.",
    "chave": true
   },
   {
    "p": "Falta de ar, tosse ou rebaixamento da consciência?",
    "r": "Sem falta de ar. Acordado e agitado.",
    "chave": true
   },
   {
    "p": "Tem alergia a soros ou algum problema de saúde?",
    "r": "Nenhum.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Sinais vitais",
    "resultado": "FC 138, FR 32, PA 100×60, T 36,8 °C. Sudorese, sialorreia.",
    "chave": false
   },
   {
    "id": "ecg",
    "nome": "ECG",
    "resultado": "Taquicardia sinusal com alteração de repolarização ventricular.",
    "chave": true
   },
   {
    "id": "rx",
    "nome": "Radiografia de tórax",
    "resultado": "Área cardíaca normal, sem edema pulmonar.",
    "chave": false
   },
   {
    "id": "lab",
    "nome": "Glicemia, CPK-MB, eletrólitos",
    "resultado": "Hiperglicemia leve e CPK-MB discretamente elevada.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Escorpionismo moderado",
    "certa": true,
    "porque": "Dor local intensa com manifestações sistêmicas: vômitos, sudorese, sialorreia, agitação, taquicardia."
   },
   {
    "nome": "Acidente por aranha-armadeira (Phoneutria)",
    "certa": false,
    "porque": "Provoca quadro parecido, mas o animal foi visto: era um escorpião."
   },
   {
    "nome": "Gastroenterite com desidratação",
    "certa": false,
    "porque": "Não explicaria a picada, a sudorese e as alterações cardíacas."
   },
   {
    "nome": "Intoxicação medicamentosa",
    "certa": false,
    "porque": "Sem exposição; o evento tem causa identificada."
   }
  ],
  "conduta": [
   {
    "texto": "Analgesia: lidocaína 2% sem vasoconstritor ou dipirona 10 mg/kg",
    "certa": true,
    "porque": "A dor é o principal sintoma."
   },
   {
    "texto": "Soro antiescorpiônico, 2 a 3 ampolas IV",
    "certa": true,
    "porque": "É o específico para o quadro moderado."
   },
   {
    "texto": "Monitorar por horas: pode virar grave",
    "certa": true,
    "porque": "Em crianças, a evolução é rápida."
   },
   {
    "texto": "Fazer teste cutâneo de sensibilidade antes do soro",
    "certa": false,
    "porque": "Não é recomendado: tem baixo valor preditivo e atrasa a soroterapia."
   },
   {
    "texto": "Só analgésico, porque ‘é só uma picada’",
    "certa": false,
    "porque": "O quadro é moderado e a criança tem maior risco de gravidade."
   },
   {
    "texto": "Notificar o acidente",
    "certa": true,
    "porque": "Escorpionismo é de notificação."
   }
  ],
  "alerta": {
   "nome": "Evolução para grave",
   "quando": "Em poucas horas, sobretudo em menores de 7 anos",
   "resposta": "Mais ampolas (4 a 6) e suporte vital",
   "porque": "Vômitos profusos, prostração, convulsão, bradicardia, edema pulmonar ou choque classificam como grave."
  },
  "notificar": "Notificação de acidente por animal peçonhento.",
  "aprendizado": "Em criança, picada de escorpião com sinais sistêmicos é quadro moderado ou grave e não é ‘só dor’. Trata-se a dor, classifica-se pela gravidade e dá-se o soro específico, sem teste cutâneo. A evolução pode ser rápida.",
  "citacoes": [
   {
    "fonte": "escorp",
    "pag": 1,
    "sobre": "Crianças são as principais vítimas."
   },
   {
    "fonte": "guiavig",
    "pag": 120,
    "sobre": "Crianças até 9 anos têm maior risco."
   },
   {
    "fonte": "guiavig",
    "pag": 120,
    "sobre": "Dor local imediata."
   },
   {
    "fonte": "guiavig",
    "pag": 120,
    "sobre": "Manifestações sistêmicas."
   },
   {
    "fonte": "guiavig",
    "pag": 121,
    "sobre": "Diagnóstico clínico-epidemiológico."
   },
   {
    "fonte": "guiavig",
    "pag": 122,
    "sobre": "Diferencial: aranha-armadeira."
   },
   {
    "fonte": "guiavig",
    "pag": 122,
    "sobre": "Analgesia: lidocaína 2% e dipirona."
   },
   {
    "fonte": "guiavig",
    "pag": 122,
    "sobre": "Classificação moderada: 2 a 3 ampolas."
   },
   {
    "fonte": "guiavig",
    "pag": 118,
    "sobre": "Teste de sensibilidade não recomendado."
   }
  ]
 },
 {
  "id": "botropico",
  "versao": 1,
  "revisado": false,
  "modulo": "urgencia-horas",
  "ordem": 3,
  "nivel": 3,
  "nome": "Acidente botrópico moderado",
  "categoria": "Acidente por animal peçonhento",
  "paciente": {
   "nome": "Seu Valdir",
   "idade": "36 anos",
   "cenario": "Pronto atendimento; picado no pé direito há 3 horas, ao roçar mato"
  },
  "queixa": "Picada de cobra no pé, que está inchando e com a pele roxa.",
  "pistas": [
   {
    "nome": "Dor e edema",
    "texto": "Dor forte e inchaço que sobe pela perna."
   },
   {
    "nome": "Equimose",
    "texto": "Mancha roxa que se estende além da picada."
   },
   {
    "nome": "Sangramento",
    "texto": "Sangra pela gengiva e pelo local da picada."
   }
  ],
  "perguntas": [
   {
    "p": "Viu a cobra? Como era?",
    "r": "Marrom com desenho em V invertido, cabeça triangular.",
    "chave": true
   },
   {
    "p": "Há quanto tempo foi a picada?",
    "r": "Três horas.",
    "chave": true
   },
   {
    "p": "Fez torniquete ou colocou alguma coisa no local?",
    "r": "Amarrou uma corda acima do joelho e passou pó de café.",
    "chave": true
   },
   {
    "p": "Tem urina escura, falta de força ou dificuldade para abrir os olhos?",
    "r": "Nada disso.",
    "chave": true
   },
   {
    "p": "Tem alergia ou doença nos rins?",
    "r": "Não.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "fisico",
    "nome": "Exame do membro",
    "resultado": "Duas marcas de presa, edema até o joelho com equimose, bolhas serosas. Pulso pedioso presente.",
    "chave": true
   },
   {
    "id": "tc",
    "nome": "Tempo de coagulação",
    "resultado": "Incoagulável (ilustrativo).",
    "chave": true
   },
   {
    "id": "hemo",
    "nome": "Hemograma, ureia e creatinina",
    "resultado": "Plaquetas 120 mil; função renal normal.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Acidente botrópico",
    "certa": true,
    "porque": "Dor, edema, equimose e sangramento no local de uma picada de jararaca."
   },
   {
    "nome": "Acidente crotálico",
    "certa": false,
    "porque": "Teria alterações neuroparalíticas e urina escura, sem edema importante."
   },
   {
    "nome": "Acidente elapídico",
    "certa": false,
    "porque": "Teria paralisia flácida e risco respiratório, sem edema nem equimose."
   },
   {
    "nome": "Serpente não peçonhenta",
    "certa": false,
    "porque": "Não explica o sangramento nem a coagulopatia."
   }
  ],
  "conduta": [
   {
    "texto": "Soro antibotrópico (pentavalente), 4 a 8 ampolas IV",
    "certa": true,
    "porque": "Quadro moderado: edema e equimose evidentes, sangramento sem comprometimento do estado geral."
   },
   {
    "texto": "Retirar o torniquete e não usar substâncias no local",
    "certa": true,
    "porque": "O torniquete agrava isquemia e necrose."
   },
   {
    "texto": "Manter o torniquete até o fim do soro",
    "certa": false,
    "porque": "O uso indevido de torniquete contribui para necrose."
   },
   {
    "texto": "Fazer teste de sensibilidade antes do soro",
    "certa": false,
    "porque": "Não é recomendado: atrasa a soroterapia."
   },
   {
    "texto": "Pedir exame de coagulação para acompanhar a resposta",
    "certa": true,
    "porque": "Confirma o quadro e a eficácia do soro."
   },
   {
    "texto": "Vigiar síndrome compartimental, abscesso, necrose e lesão renal",
    "certa": true,
    "porque": "Complicações do botrópico."
   }
  ],
  "alerta": {
   "nome": "Síndrome compartimental",
   "quando": "Quando o edema comprime o feixe vásculo-nervoso",
   "resposta": "Reavaliar perfusão do membro e agir",
   "porque": "O edema extenso pode causar isquemia de extremidades; é uma das complicações locais do botrópico."
  },
  "notificar": "Notificação de acidente por animal peçonhento.",
  "aprendizado": "Dor, edema progressivo, equimose e sangramento depois de picada de serpente apontam para o gênero Bothrops. Classificado como moderado, recebe soro antibotrópico 4 a 8 ampolas. Torniquete e teste cutâneo estão fora, e o seguimento procura complicações.",
  "citacoes": [
   {
    "fonte": "guiavig",
    "pag": 114,
    "sobre": "Botrópico: serpentes Bothrops, o mais importante."
   },
   {
    "fonte": "guiavig",
    "pag": 114,
    "sobre": "Manifestações locais."
   },
   {
    "fonte": "guiavig",
    "pag": 116,
    "sobre": "Torniquete e necrose."
   },
   {
    "fonte": "guiavig",
    "pag": 116,
    "sobre": "Complicações: síndrome compartimental."
   },
   {
    "fonte": "guiavig",
    "pag": 116,
    "sobre": "Exames de coagulação."
   },
   {
    "fonte": "guiavig",
    "pag": 117,
    "sobre": "Moderado: 4 a 8 ampolas."
   },
   {
    "fonte": "guiavig",
    "pag": 118,
    "sobre": "Soro antibotrópico (pentavalente) prioritário."
   },
   {
    "fonte": "guiavig",
    "pag": 118,
    "sobre": "Sem teste cutâneo."
   }
  ]
 },
 {
  "id": "bacteriuria",
  "versao": 1,
  "revisado": false,
  "modulo": "pre-natal",
  "ordem": 1,
  "nivel": 1,
  "nome": "Bacteriúria assintomática na gestação",
  "categoria": "Infecção do trato urinário",
  "paciente": {
   "nome": "Aline",
   "idade": "27 anos, 16 semanas",
   "cenario": "Consulta de pré-natal na UBS; sem queixas"
  },
  "queixa": "Veio à consulta de rotina, sem sintomas, com o resultado da urocultura.",
  "pistas": [
   {
    "nome": "Sem sintomas",
    "texto": "Nega disúria, polaciúria, febre ou dor lombar."
   },
   {
    "nome": "Urocultura positiva",
    "texto": "Cultura com crescimento de bactéria acima do ponto de corte."
   },
   {
    "nome": "Gestação saudável",
    "texto": "Pressão normal e sem outras queixas."
   }
  ],
  "perguntas": [
   {
    "p": "Tem ardência ao urinar, vontade frequente ou dor na barriga?",
    "r": "Nada disso.",
    "chave": true
   },
   {
    "p": "Teve febre, calafrios ou dor nas costas?",
    "r": "Não.",
    "chave": true
   },
   {
    "p": "Já teve infecção urinária antes ou durante esta gestação?",
    "r": "Uma vez, na adolescência.",
    "chave": false
   },
   {
    "p": "Tem alergia a antibiótico?",
    "r": "Não.",
    "chave": true
   },
   {
    "p": "Tem outras doenças, como diabetes?",
    "r": "Nenhuma.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "sv",
    "nome": "Sinais vitais",
    "resultado": "PA 110×70, afebril, giordano negativo.",
    "chave": false
   },
   {
    "id": "uro",
    "nome": "Urocultura",
    "resultado": "Positiva, bactéria em contagem alta. Antibiograma com sensibilidade à nitrofurantoína e à cefalexina.",
    "chave": true
   },
   {
    "id": "equ",
    "nome": "EQU",
    "resultado": "Leucocitúria discreta, nitrito positivo.",
    "chave": false
   },
   {
    "id": "us",
    "nome": "Ultrassonografia obstétrica",
    "resultado": "Feto único, vivo, idade gestacional compatível.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Bacteriúria assintomática",
    "certa": true,
    "porque": "Urocultura positiva na gestante sem sintomas."
   },
   {
    "nome": "Cistite",
    "certa": false,
    "porque": "Cistite tem disúria, polaciúria e urgência; ela não tem."
   },
   {
    "nome": "Pielonefrite",
    "certa": false,
    "porque": "Sem febre, calafrios nem dor lombar."
   },
   {
    "nome": "Exame normal da gestação",
    "certa": false,
    "porque": "Bacteriúria na gestação deve ser tratada."
   }
  ],
  "conduta": [
   {
    "texto": "Tratar com nitrofurantoína 100 mg de 6/6 h por 5 dias ou cefalexina 500 mg de 6/6 h por 7 dias",
    "certa": true,
    "porque": "Segundo o antibiograma."
   },
   {
    "texto": "Repetir a urocultura após 2 semanas de tratamento",
    "certa": true,
    "porque": "Controle de cura."
   },
   {
    "texto": "Não tratar porque ela não tem sintomas",
    "certa": false,
    "porque": "Cerca de 30% não tratadas evoluem para formas graves de ITU."
   },
   {
    "texto": "Orientar sinais de pielonefrite: febre, calafrios e dor lombar",
    "certa": true,
    "porque": "Se surgirem, internação e antibiótico venoso."
   },
   {
    "texto": "Antibiótico em dose única e sem controle",
    "certa": false,
    "porque": "A duração é de 5 a 7 dias e exige urocultura de controle."
   }
  ],
  "alerta": {
   "nome": "Pielonefrite",
   "quando": "Calafrios, dor lombar, febre",
   "resposta": "Hospitalização e antibiótico venoso",
   "porque": "Na gestação, a pielonefrite exige internação e profilaxia antibiótica depois do tratamento."
  },
  "notificar": null,
  "aprendizado": "Na gestação, bacteriúria sem sintomas deve ser tratada: cerca de 30% evoluem para formas graves. Antibiótico conforme o antibiograma por 5 a 7 dias e urocultura de controle em 2 semanas.",
  "citacoes": [
   {
    "fonte": "rs",
    "pag": 51,
    "sobre": "ITU na gestação acomete 10 a 12%."
   },
   {
    "fonte": "rs",
    "pag": 51,
    "sobre": "Cerca de 30% não tratadas evoluem."
   },
   {
    "fonte": "rs",
    "pag": 51,
    "sobre": "Nitrofurantoína 5 dias."
   },
   {
    "fonte": "rs",
    "pag": 51,
    "sobre": "Cefalexina 7 dias."
   },
   {
    "fonte": "rs",
    "pag": 51,
    "sobre": "Pielonefrite: sinais."
   }
  ]
 },
 {
  "id": "sifilis-gestacao",
  "versao": 1,
  "revisado": false,
  "modulo": "pre-natal",
  "ordem": 2,
  "nivel": 2,
  "nome": "Sífilis na gestação",
  "categoria": "Infecção sexualmente transmissível",
  "paciente": {
   "nome": "Camila",
   "idade": "22 anos, 14 semanas",
   "cenario": "Primeira consulta de pré-natal; teste rápido na unidade"
  },
  "queixa": "Primeira consulta de pré-natal. O teste rápido de sífilis deu positivo.",
  "pistas": [
   {
    "nome": "Teste rápido positivo",
    "texto": "Reagente na primeira consulta."
   },
   {
    "nome": "Sem lesões",
    "texto": "Sem úlcera genital ou lesão de pele atual."
   },
   {
    "nome": "Tempo de infecção ignorado",
    "texto": "Não sabe quando pode ter se infectado."
   }
  ],
  "perguntas": [
   {
    "p": "Teve ferida na genitália ou manchas no corpo nos últimos meses?",
    "r": "Não que ela lembre.",
    "chave": true
   },
   {
    "p": "Já fez tratamento para sífilis?",
    "r": "Nunca.",
    "chave": true
   },
   {
    "p": "O parceiro foi tratado ou tem sintomas?",
    "r": "O parceiro não foi avaliado.",
    "chave": true
   },
   {
    "p": "Tem alergia à penicilina?",
    "r": "Não.",
    "chave": true
   },
   {
    "p": "Usa preservativo?",
    "r": "Às vezes.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "tr",
    "nome": "Teste rápido para sífilis",
    "resultado": "Reagente.",
    "chave": true
   },
   {
    "id": "vdrl",
    "nome": "VDRL",
    "resultado": "Reagente, titulação 1:16. Colhido para monitorar a resposta.",
    "chave": true
   },
   {
    "id": "exf",
    "nome": "Exame físico",
    "resultado": "Sem lesões mucocutâneas, sem linfadenopatia.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Sífilis latente de duração ignorada",
    "certa": true,
    "porque": "Teste reagente, sem sintomas e sem saber quando infectou; é tratada como latente tardia."
   },
   {
    "nome": "Sífilis primária",
    "certa": false,
    "porque": "Sem cancro; e o tempo de infecção é ignorado."
   },
   {
    "nome": "Falso-positivo: repetir só no 3º trimestre",
    "certa": false,
    "porque": "O teste reagente na gestação é tratado, não se espera."
   },
   {
    "nome": "Sífilis congênita",
    "certa": false,
    "porque": "É o desfecho que se quer evitar no feto, não o diagnóstico da gestante."
   }
  ],
  "conduta": [
   {
    "texto": "Penicilina G benzatina 2,4 milhões UI IM semanal por 3 semanas (total 7,2 milhões UI)",
    "certa": true,
    "porque": "Estadiamento latente tardio ou ignorado."
   },
   {
    "texto": "Dose única de 2,4 milhões UI",
    "certa": false,
    "porque": "A dose única é para sífilis primária, secundária ou latente recente (menos de 1 ano)."
   },
   {
    "texto": "Tratar ou oferecer tratamento presuntivo ao parceiro",
    "certa": true,
    "porque": "Para quem teve exposição até 90 dias."
   },
   {
    "texto": "VDRL mensal até o parto",
    "certa": true,
    "porque": "Monitorar a resposta."
   },
   {
    "texto": "Notificar o caso",
    "certa": true,
    "porque": "A notificação é obrigatória."
   },
   {
    "texto": "Aguardar o 3º trimestre para tratar",
    "certa": false,
    "porque": "O risco de desfecho adverso é alto sem tratamento."
   }
  ],
  "alerta": {
   "nome": "Atraso entre as doses",
   "quando": "Intervalo de mais de 9 dias entre as aplicações",
   "resposta": "Reiniciar o esquema",
   "porque": "O esquema semanal perde a eficácia se o intervalo passa de 9 dias."
  },
  "notificar": "Notificação obrigatória de sífilis.",
  "aprendizado": "Na gestante com teste rápido reagente, trata-se na hora, com a penicilina benzatina escolhida pelo estadiamento. Se a duração é ignorada, são 3 doses semanais. Parceiro, VDRL mensal e notificação completam a conduta.",
  "citacoes": [
   {
    "fonte": "rs",
    "pag": 52,
    "sobre": "Até 50% de desfecho adverso sem tratamento."
   },
   {
    "fonte": "rs",
    "pag": 52,
    "sobre": "Penicilina benzatina em dose única para sífilis recente."
   },
   {
    "fonte": "rs",
    "pag": 52,
    "sobre": "Esquema de 3 semanas: 7,2 milhões UI."
   },
   {
    "fonte": "rs",
    "pag": 52,
    "sobre": "Reiniciar se intervalo passar de 9 dias."
   },
   {
    "fonte": "rs",
    "pag": 52,
    "sobre": "Notificação obrigatória."
   },
   {
    "fonte": "rs",
    "pag": 52,
    "sobre": "Tratamento presuntivo do parceiro."
   },
   {
    "fonte": "rs",
    "pag": 52,
    "sobre": "VDRL mensal até o parto."
   }
  ]
 },
 {
  "id": "pre-eclampsia",
  "versao": 1,
  "revisado": false,
  "modulo": "pre-natal",
  "ordem": 3,
  "nivel": 3,
  "nome": "Pré-eclâmpsia com sinais de gravidade",
  "categoria": "Síndrome hipertensiva da gestação",
  "paciente": {
   "nome": "Joana",
   "idade": "34 anos, 33 semanas",
   "cenario": "Consulta de pré-natal na UBS; faltou às duas últimas consultas"
  },
  "queixa": "Dor de cabeça forte que não passa, vista turva e dor na boca do estômago.",
  "pistas": [
   {
    "nome": "Cefaleia persistente",
    "texto": "Dor de cabeça há dois dias, sem alívio com analgésico."
   },
   {
    "nome": "Escotomas",
    "texto": "Pontos brilhantes na visão."
   },
   {
    "nome": "Epigastralgia",
    "texto": "Dor em barra no epigástrio, com náuseas."
   }
  ],
  "perguntas": [
   {
    "p": "Quando começou a dor de cabeça e a alteração visual?",
    "r": "Há dois dias, com piora hoje.",
    "chave": true
   },
   {
    "p": "Notou inchaço no rosto e nas mãos ou ganho rápido de peso?",
    "r": "Mãos e rosto inchados, subiu 3 kg em duas semanas.",
    "chave": true
   },
   {
    "p": "Teve pressão alta antes de engravidar ou em gestação anterior?",
    "r": "Pré-eclâmpsia na primeira gravidez.",
    "chave": true
   },
   {
    "p": "Já teve convulsão?",
    "r": "Não.",
    "chave": true
   },
   {
    "p": "O bebê tem se mexido?",
    "r": "Mexe, mas menos que o habitual.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "pa",
    "nome": "Pressão arterial (2 medidas)",
    "resultado": "168×112 mmHg e 164×110 mmHg, com 30 minutos de intervalo.",
    "chave": true
   },
   {
    "id": "fita",
    "nome": "Proteinúria na fita urinária",
    "resultado": "2+.",
    "chave": true
   },
   {
    "id": "exf",
    "nome": "Exame físico",
    "resultado": "Edema de face e mãos, reflexos vivos, sem convulsão.",
    "chave": false
   },
   {
    "id": "bcf",
    "nome": "Ausculta fetal",
    "resultado": "BCF 142 bpm.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Pré-eclâmpsia com sinais de gravidade",
    "certa": true,
    "porque": "Hipertensão após 20 semanas com proteinúria, cefaleia, escotomas e epigastralgia."
   },
   {
    "nome": "Hipertensão gestacional",
    "certa": false,
    "porque": "Não teria proteinúria nem lesão de órgão-alvo."
   },
   {
    "nome": "Hipertensão crônica",
    "certa": false,
    "porque": "Pressão elevada só após a 20ª semana."
   },
   {
    "nome": "Eclâmpsia",
    "certa": false,
    "porque": "Ainda não houve convulsão, mas é o risco."
   }
  ],
  "conduta": [
   {
    "texto": "Nifedipino por via oral para a hipertensão grave, repetindo em 30 min se necessário",
    "certa": true,
    "porque": "PA acima de 160/110 é hipertensão grave."
   },
   {
    "texto": "Sulfato de magnésio: dose de ataque de 4 g IV em 5 a 10 minutos, em decúbito lateral esquerdo",
    "certa": true,
    "porque": "Pode ser feito já na unidade básica, antes do transporte."
   },
   {
    "texto": "Encaminhar imediatamente à emergência obstétrica",
    "certa": true,
    "porque": "Avaliação materna e fetal imediata."
   },
   {
    "texto": "Marcar retorno em uma semana e orientar repouso",
    "certa": false,
    "porque": "Pré-eclâmpsia com gravidade é emergência obstétrica."
   },
   {
    "texto": "Iniciar AAS 100 mg agora para prevenir",
    "certa": false,
    "porque": "O AAS é profilaxia a partir do início da gestação, antes de 16 semanas; não trata o quadro."
   },
   {
    "texto": "Esperar mais uma medida da pressão na próxima consulta",
    "certa": false,
    "porque": "Atrasa um tratamento que reduz o risco de eclâmpsia e de morte materna."
   }
  ],
  "alerta": {
   "nome": "Eclâmpsia",
   "quando": "Convulsão",
   "resposta": "Sulfato de magnésio e transporte imediato",
   "porque": "O sulfato reduz em 57% o risco de eclâmpsia e diminui o risco de morte materna."
  },
  "notificar": null,
  "aprendizado": "Hipertensão após a 20ª semana com proteinúria e sinais como cefaleia, escotomas e epigastralgia é pré-eclâmpsia com gravidade. Trata-se a pressão, dá-se o sulfato de magnésio já na unidade e transporta-se imediatamente à emergência obstétrica.",
  "citacoes": [
   {
    "fonte": "rs",
    "pag": 44,
    "sobre": "Definição de pré-eclâmpsia."
   },
   {
    "fonte": "rs",
    "pag": 44,
    "sobre": "Sinais que levam à emergência obstétrica."
   },
   {
    "fonte": "rs",
    "pag": 44,
    "sobre": "AAS é profilaxia iniciada antes de 16 semanas."
   },
   {
    "fonte": "rs",
    "pag": 48,
    "sobre": "Hipertensão grave: PA ≥ 160/110."
   },
   {
    "fonte": "rs",
    "pag": 48,
    "sobre": "Sulfato de magnésio 4 g IV."
   },
   {
    "fonte": "rs",
    "pag": 48,
    "sobre": "Decúbito lateral."
   },
   {
    "fonte": "rs",
    "pag": 48,
    "sobre": "Sulfatação possível na APS."
   },
   {
    "fonte": "rs",
    "pag": 48,
    "sobre": "Redução de 57% de eclâmpsia."
   },
   {
    "fonte": "rs",
    "pag": 48,
    "sobre": "Encaminhamento imediato."
   }
  ]
 },
 {
  "id": "pneumonia-crianca",
  "versao": 1,
  "revisado": false,
  "modulo": "crianca",
  "ordem": 1,
  "nivel": 1,
  "nome": "Pneumonia na criança (AIDPI)",
  "categoria": "Infecção respiratória",
  "paciente": {
   "nome": "Beatriz",
   "idade": "14 meses",
   "cenario": "Unidade Básica de Saúde; levada pela mãe"
  },
  "queixa": "Tosse e febre há 3 dias, e a mãe acha que está respirando mais rápido.",
  "pistas": [
   {
    "nome": "Tosse",
    "texto": "Tosse há 3 dias, com febre."
   },
   {
    "nome": "Respiração rápida",
    "texto": "Respira mais depressa que o normal quando está tranquila."
   },
   {
    "nome": "Come menos",
    "texto": "Aceita menos leite e papa, mas bebe."
   }
  ],
  "perguntas": [
   {
    "p": "A criança consegue mamar ou beber?",
    "r": "Bebe e mama, só menos que o normal.",
    "chave": true
   },
   {
    "p": "Vomita tudo o que ingere ou teve convulsão?",
    "r": "Não vomita tudo. Nenhuma convulsão.",
    "chave": true
   },
   {
    "p": "Há quanto tempo tem tosse e tem sibilância?",
    "r": "Três dias. Sem chiado.",
    "chave": true
   },
   {
    "p": "Está letárgica ou muito sonolenta?",
    "r": "Está acordada e interessada.",
    "chave": true
   },
   {
    "p": "Já tomou antibiótico?",
    "r": "Não.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "geral",
    "nome": "Sinais gerais de perigo",
    "resultado": "Sem sinais gerais de perigo: bebe, não vomita tudo, sem convulsão, sem letargia, enchimento capilar ≤ 2 s.",
    "chave": true
   },
   {
    "id": "fr",
    "nome": "Frequência respiratória (criança tranquila, 1 minuto)",
    "resultado": "46 irpm. Respiração rápida para a idade (40 ou mais).",
    "chave": true
   },
   {
    "id": "tira",
    "nome": "Tiragem subcostal e estridor",
    "resultado": "Ausentes.",
    "chave": false
   },
   {
    "id": "ausc",
    "nome": "Ausculta",
    "resultado": "Estertores na base direita.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Pneumonia",
    "certa": true,
    "porque": "Tosse com respiração rápida e sem sinal de perigo, sem tiragem."
   },
   {
    "nome": "Pneumonia grave ou doença muito grave",
    "certa": false,
    "porque": "Exigiria sinal geral de perigo, tiragem subcostal ou estridor em repouso."
   },
   {
    "nome": "Não é pneumonia (resfriado)",
    "certa": false,
    "porque": "Há respiração rápida: esse é o critério de pneumonia."
   },
   {
    "nome": "Sibilância moderada",
    "certa": false,
    "porque": "Sem chiado nem tiragem."
   }
  ],
  "conduta": [
   {
    "texto": "Contar a frequência respiratória com a criança tranquila",
    "certa": true,
    "porque": "Chorando, o número não é confiável."
   },
   {
    "texto": "Antibiótico recomendado por 7 dias",
    "certa": true,
    "porque": "Tratamento da pneumonia."
   },
   {
    "texto": "Aliviar a tosse com medidas caseiras e orientar sinais de retorno imediato",
    "certa": true,
    "porque": "Orientação à mãe."
   },
   {
    "texto": "Marcar retorno em 2 dias",
    "certa": true,
    "porque": "Seguimento da pneumonia."
   },
   {
    "texto": "Referir urgentemente ao hospital",
    "certa": false,
    "porque": "Reservado a pneumonia grave ou doença muito grave."
   },
   {
    "texto": "Só orientar e ver em 5 dias",
    "certa": false,
    "porque": "É a conduta de ‘não é pneumonia’."
   }
  ],
  "alerta": {
   "nome": "Tiragem subcostal",
   "quando": "Aparece tiragem, estridor em repouso ou sinal geral de perigo",
   "resposta": "1ª dose de antibiótico e referência urgente",
   "porque": "Passa a pneumonia grave ou doença muito grave: antibiótico, evitar hipoglicemia, oxigênio e hospital."
  },
  "notificar": null,
  "aprendizado": "Na criança de 1 a 5 anos, tosse com 40 ou mais respirações por minuto (criança tranquila) e sem sinal de perigo é pneumonia: antibiótico por 7 dias e retorno em 2 dias. Tiragem subcostal ou sinal geral de perigo muda para pneumonia grave.",
  "citacoes": [
   {
    "fonte": "aidpi",
    "pag": 8,
    "sobre": "Perguntar sobre beber/mamar."
   },
   {
    "fonte": "aidpi",
    "pag": 8,
    "sobre": "Enchimento capilar > 2 s é sinal de perigo."
   },
   {
    "fonte": "aidpi",
    "pag": 9,
    "sobre": "Respiração rápida: 40 ou mais (1 a 5 anos)."
   },
   {
    "fonte": "aidpi",
    "pag": 9,
    "sobre": "Criança deve estar tranquila."
   },
   {
    "fonte": "aidpi",
    "pag": 9,
    "sobre": "Pneumonia grave: tiragem subcostal."
   },
   {
    "fonte": "aidpi",
    "pag": 9,
    "sobre": "Pneumonia: antibiótico por 7 dias."
   },
   {
    "fonte": "aidpi",
    "pag": 9,
    "sobre": "Retorno em 2 dias."
   }
  ]
 },
 {
  "id": "desidratacao",
  "versao": 1,
  "revisado": false,
  "modulo": "crianca",
  "ordem": 2,
  "nivel": 2,
  "nome": "Diarreia com desidratação (Plano B)",
  "categoria": "Doença diarreica aguda",
  "paciente": {
   "nome": "Pedro",
   "idade": "2 anos",
   "cenario": "Unidade Básica de Saúde; levado pela mãe"
  },
  "queixa": "Diarreia aquosa há 2 dias, com sede e irritação.",
  "pistas": [
   {
    "nome": "Diarreia aquosa",
    "texto": "Mais de seis evacuações líquidas por dia."
   },
   {
    "nome": "Sede intensa",
    "texto": "Bebe o copo todo avidamente."
   },
   {
    "nome": "Inquietação",
    "texto": "Chora e fica irritado."
   }
  ],
  "perguntas": [
   {
    "p": "Há quanto tempo a diarreia e tem sangue nas fezes?",
    "r": "Dois dias, aquosa, sem sangue.",
    "chave": true
   },
   {
    "p": "Ele consegue beber ou vomita tudo?",
    "r": "Bebe com muita sede. Vomitou só uma vez.",
    "chave": true
   },
   {
    "p": "Está sonolento ou mole?",
    "r": "Está irritado, mas reage.",
    "chave": true
   },
   {
    "p": "Usou algum remédio ou antibiótico em casa?",
    "r": "Não.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "geral",
    "nome": "Sinais gerais de perigo",
    "resultado": "Sem letargia, sem convulsão; bebe.",
    "chave": false
   },
   {
    "id": "olhos",
    "nome": "Olhos",
    "resultado": "Fundos.",
    "chave": true
   },
   {
    "id": "prega",
    "nome": "Sinal da prega",
    "resultado": "A pele volta lentamente ao estado anterior.",
    "chave": true
   },
   {
    "id": "sede",
    "nome": "Sede",
    "resultado": "Bebe avidamente, com sede.",
    "chave": true
   }
  ],
  "hipoteses": [
   {
    "nome": "Diarreia com desidratação",
    "certa": true,
    "porque": "Inquieto, olhos fundos, sede e prega lenta: dois ou mais sinais."
   },
   {
    "nome": "Desidratação grave",
    "certa": false,
    "porque": "Exigiria letargia, não beber ou beber mal e prega muito lenta."
   },
   {
    "nome": "Sem desidratação",
    "certa": false,
    "porque": "Há dois ou mais sinais de desidratação."
   },
   {
    "nome": "Disenteria",
    "certa": false,
    "porque": "Sem sangue nas fezes."
   }
  ],
  "conduta": [
   {
    "texto": "Plano B: SRO na unidade de saúde até hidratar",
    "certa": true,
    "porque": "Conduta da classificação desidratação."
   },
   {
    "texto": "Zinco oral por 10 dias",
    "certa": true,
    "porque": "Incluído em todas as classificações de diarreia."
   },
   {
    "texto": "Continuar a alimentação e informar sinais de retorno imediato",
    "certa": true,
    "porque": "Orientações à mãe."
   },
   {
    "texto": "Seguimento em 5 dias se não melhorar",
    "certa": true,
    "porque": "Retorno programado."
   },
   {
    "texto": "Terapia endovenosa (Plano C)",
    "certa": false,
    "porque": "É para desidratação grave."
   },
   {
    "texto": "Antibiótico de rotina",
    "certa": false,
    "porque": "Só se indica antibiótico na disenteria com comprometimento do estado geral ou na suspeita de cólera."
   }
  ],
  "alerta": {
   "nome": "Desidratação grave",
   "quando": "Letargia, olhos fundos, não bebe, prega muito lenta",
   "resposta": "Plano C (terapia endovenosa) ou referência urgente",
   "porque": "Dois ou mais desses sinais classificam desidratação grave."
  },
  "notificar": null,
  "aprendizado": "Criança com diarreia, inquieta, olhos fundos, sedenta e com prega lenta tem desidratação: Plano B com SRO na unidade, zinco por 10 dias, alimentação mantida e retorno em 5 dias. Antibiótico só se houver sangue nas fezes e comprometimento.",
  "citacoes": [
   {
    "fonte": "aidpi",
    "pag": 13,
    "sobre": "Critérios de desidratação."
   },
   {
    "fonte": "aidpi",
    "pag": 13,
    "sobre": "Sinal da prega lenta."
   },
   {
    "fonte": "aidpi",
    "pag": 13,
    "sobre": "Plano B: SRO na unidade."
   },
   {
    "fonte": "aidpi",
    "pag": 13,
    "sobre": "Zinco por 10 dias."
   },
   {
    "fonte": "aidpi",
    "pag": 13,
    "sobre": "Plano C para desidratação grave."
   },
   {
    "fonte": "aidpi",
    "pag": 13,
    "sobre": "Antibiótico na disenteria."
   }
  ]
 },
 {
  "id": "rn-doenca-grave",
  "versao": 1,
  "revisado": false,
  "modulo": "crianca",
  "ordem": 3,
  "nivel": 3,
  "nome": "Recém-nascido com doença grave",
  "categoria": "Infecção neonatal",
  "paciente": {
   "nome": "Davi",
   "idade": "18 dias",
   "cenario": "Unidade Básica de Saúde; levado pela mãe"
  },
  "queixa": "Não quer mais mamar, está molinho e quente.",
  "pistas": [
   {
    "nome": "Não suga",
    "texto": "Recusa o peito desde ontem."
   },
   {
    "nome": "Febre",
    "texto": "Temperatura axilar de 37,8 °C."
   },
   {
    "nome": "Hipoatividade",
    "texto": "Mole, com pouca reação ao manuseio."
   }
  ],
  "perguntas": [
   {
    "p": "Ele consegue mamar no peito ou tomar leite?",
    "r": "Não pega o peito nem aceita o copinho.",
    "chave": true
   },
   {
    "p": "Tem tido vômitos, febre ou frio?",
    "r": "Febre hoje. Sem vômitos.",
    "chave": true
   },
   {
    "p": "Teve convulsões ou tremores?",
    "r": "Um tremor fino no braço.",
    "chave": true
   },
   {
    "p": "Como estava o umbigo e a pele?",
    "r": "Umbigo seco, sem secreção.",
    "chave": false
   },
   {
    "p": "Como foi o parto e o peso ao nascer?",
    "r": "Parto normal, 3.150 g.",
    "chave": false
   }
  ],
  "exames": [
   {
    "id": "temp",
    "nome": "Temperatura axilar",
    "resultado": "37,8 °C: febre em menor de 2 meses.",
    "chave": true
   },
   {
    "id": "fr",
    "nome": "Frequência respiratória (em repouso)",
    "resultado": "64 irpm. Respiração rápida.",
    "chave": true
   },
   {
    "id": "obs",
    "nome": "Observação",
    "resultado": "Letárgico, hipotônico, sem tiragem importante, sem cianose central.",
    "chave": true
   },
   {
    "id": "umb",
    "nome": "Umbigo e pele",
    "resultado": "Sem secreção purulenta nem pústulas.",
    "chave": false
   }
  ],
  "hipoteses": [
   {
    "nome": "Doença grave (sepse ou meningite)",
    "certa": true,
    "porque": "Não suga, febre, respiração rápida, letargia: sinal da coluna vermelha."
   },
   {
    "nome": "Infecção localizada",
    "certa": false,
    "porque": "Seria secreção purulenta em olhos ou umbigo, pústulas localizadas, sem sinais gerais."
   },
   {
    "nome": "Cólica do lactente",
    "certa": false,
    "porque": "Não explica febre, letargia e recusa de mamar."
   },
   {
    "nome": "Resfriado comum",
    "certa": false,
    "porque": "Em menor de 2 meses, febre e hipoatividade indicam gravidade."
   }
  ],
  "conduta": [
   {
    "texto": "Classificar como doença grave e transferir com urgência a um hospital",
    "certa": true,
    "porque": "Muito difícil distinguir sepse de meningite nessa idade."
   },
   {
    "texto": "Administrar a dose de dois antibióticos recomendados antes da transferência",
    "certa": true,
    "porque": "Conduta antes da referência."
   },
   {
    "texto": "Seguir as normas de estabilização e transporte",
    "certa": true,
    "porque": "A criança precisa chegar estável."
   },
   {
    "texto": "Orientar manter a amamentação e voltar em 48 horas",
    "certa": false,
    "porque": "É conduta de ‘sem doença grave’."
   },
   {
    "texto": "Dar antitérmico e acompanhar em casa",
    "certa": false,
    "porque": "Febre em menor de 2 meses significa problema grave."
   }
  ],
  "alerta": {
   "nome": "Deterioração",
   "quando": "Cianose central, apneia ou tiragem grave",
   "resposta": "Suporte respiratório durante a transferência",
   "porque": "Respiração rápida (60 ou mais) é sinal de dificuldade respiratória; apneia e cianose central são gravidade extrema."
  },
  "notificar": null,
  "aprendizado": "Em menor de 2 meses, não conseguir mamar, febre ou hipotermia, respiração rápida e letargia são doença grave: antibióticos e transferência urgentes. A criança muito pequena não ‘acompanha em casa’.",
  "citacoes": [
   {
    "fonte": "neonat",
    "pag": 119,
    "sobre": "Não sugar o peito é sinal inicial de gravidade."
   },
   {
    "fonte": "neonat",
    "pag": 119,
    "sobre": "Respiração rápida: 60 ou mais."
   },
   {
    "fonte": "neonat",
    "pag": 120,
    "sobre": "Febre ou hipotermia em menor de 2 meses."
   },
   {
    "fonte": "neonat",
    "pag": 120,
    "sobre": "Significa problema grave, geralmente sepse."
   },
   {
    "fonte": "neonat",
    "pag": 126,
    "sobre": "Transferência com urgência."
   },
   {
    "fonte": "neonat",
    "pag": 126,
    "sobre": "Dose de dois antibióticos antes de sair."
   }
  ]
 }
];
