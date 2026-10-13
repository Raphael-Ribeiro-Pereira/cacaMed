// Casos do Plantão médico (formato v2, 13/10/2026). Novos lotes entram por `node scripts/integrar-ddx.mjs plantao content/approved/lote.json`.
// O primeiro caso é o piloto respiratório; `revisado` só vira true com a aprovação clínica.
export const CASOS_PLANTAO = [
  {
    "id": "resp-asma-1",
    "versao": 1,
    "sistema": "Respiratório",
    "revisado": false,
    "titulo": "Falta de ar no pronto atendimento",
    "paciente": "Marina, 28 anos",
    "queixa": "Estou com falta de ar e chiado desde esta manhã.",
    "fonte": "https://ginasthma.org/reports/",
    "vitais": "FC 108 bpm · FR 26 irpm · SpO₂ 94% em ar ambiente · PA 120/80 mmHg · T 36,7°C",
    "hipoteseCorreta": "asma",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "tratamento",
      "antiinflamatorio",
      "reavaliar",
      "orientar"
    ],
    "estadoInicial": "Sintomática; precisa de avaliação e conduta",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência, fala e esforço respiratório",
        "resposta": "Consciente, fala frases completas, com esforço respiratório leve. Sem sonolência ou confusão.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "inicio",
        "grupo": "Anamnese",
        "texto": "Quando começou? Houve algum desencadeante?",
        "resposta": "Começou após limpar um quarto empoeirado. A falta de ar aumentou ao longo da manhã.",
        "pontos": 10,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "antecedentes",
        "grupo": "Anamnese",
        "texto": "Já teve episódios assim ou internações?",
        "resposta": "Tenho asma desde criança. Nunca fui intubada; precisei de atendimento por crise no ano passado.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "medicamentos",
        "grupo": "Anamnese",
        "texto": "Quais medicamentos usa? Usou algo hoje?",
        "resposta": "Parei o controlador inalatório há algumas semanas. Usei meu inalador de alívio uma vez, com melhora passageira.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "alergias",
        "grupo": "Anamnese",
        "texto": "Tem alergias a medicamentos?",
        "resposta": "Não tenho alergias conhecidas a medicamentos.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "associados",
        "grupo": "Anamnese",
        "texto": "Tem febre, dor torácica ou outros sintomas?",
        "resposta": "Nego febre, dor no peito, desmaio e inchaço nas pernas. Tenho tosse seca.",
        "pontos": 10,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "ausculta",
        "grupo": "Exame físico",
        "texto": "Examinar o tórax e auscultar os pulmões",
        "resposta": "Sibilos difusos bilateralmente e expiração prolongada. Sem sinais focais ou tórax silencioso.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "pfe",
        "grupo": "Exames",
        "texto": "Medir pico de fluxo expiratório, se possível",
        "resposta": "PFE inicial: 65% do melhor valor pessoal. A medida não deve atrasar o tratamento.",
        "pontos": 10,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "radiografia",
        "grupo": "Exames",
        "texto": "Solicitar radiografia de tórax de rotina",
        "resposta": "Sem achado agudo. Neste roteiro não havia indicação de rotina; reconsidere se houver suspeita alternativa ou evolução inesperada.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 15
      },
      {
        "id": "tomografia",
        "grupo": "Exames",
        "texto": "Solicitar tomografia de tórax de rotina",
        "resposta": "Sem alteração que explique a crise. O caso não apresentou indicação para este exame.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 30
      },
      {
        "id": "asma",
        "grupo": "Hipóteses",
        "texto": "Registrar exacerbação de asma como hipótese principal",
        "resposta": "Hipótese registrada. Fundamente-a na história, no exame e na evolução; permaneça atento a causas alternativas.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "pneumonia",
        "grupo": "Hipóteses",
        "texto": "Registrar pneumonia como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados deste caso não a sustentam como principal. Você pode revisá-la.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "tratamento",
        "grupo": "Conduta",
        "texto": "Iniciar tratamento de alívio inalatório conforme protocolo",
        "resposta": "Tratamento iniciado sob supervisão. É necessário acompanhar a resposta e reavaliar a gravidade.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "gravidade",
          "alergias"
        ],
        "estadoPaciente": "Em tratamento; aguarda reavaliação"
      },
      {
        "id": "antiinflamatorio",
        "grupo": "Conduta",
        "texto": "Avaliar corticoide sistêmico para a exacerbação",
        "resposta": "A equipe avalia e administra corticoide sistêmico conforme a gravidade e o protocolo local. O controle anti-inflamatório também será revisto.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "gravidade",
          "alergias"
        ]
      },
      {
        "id": "oxigenio",
        "grupo": "Conduta",
        "texto": "Avaliar necessidade de oxigênio controlado",
        "resposta": "SpO₂ de 94% em ar ambiente: manter monitorização e titular oxigênio se necessário. Não aplicar fluxo alto indiscriminadamente.",
        "pontos": 10,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar após o tratamento e observar resposta",
        "resposta": "Após observação: fala confortável, FR 18, FC 92, SpO₂ 97% em ar ambiente e PFE 85% do melhor pessoal. Sibilos diminuíram.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 60,
        "exige": [
          "tratamento",
          "antiinflamatorio"
        ],
        "estadoPaciente": "Melhora após tratamento e observação"
      },
      {
        "id": "orientar",
        "grupo": "Conduta",
        "texto": "Rever controlador, técnica inalatória, plano de ação e retorno",
        "resposta": "Paciente demonstra a técnica. Registrados plano de ação, sinais de alarme, tratamento contendo corticoide inalatório e acompanhamento breve.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada após melhora",
        "resposta": "Atendimento encerrado. Confira o relatório de decisões e pontos para revisão.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para avaliação de maior complexidade",
        "resposta": "Encaminhamento registrado. Neste roteiro, confira se a evolução e os dados justificavam essa decisão.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "antecedentes",
      "medicamentos",
      "alergias",
      "ausculta",
      "asma",
      "tratamento",
      "antiinflamatorio",
      "reavaliar",
      "orientar"
    ]
  },
  {
    "id": "neuro-avc-1",
    "versao": 1,
    "sistema": "Neurológico",
    "revisado": true,
    "titulo": "Fala enrolada e fraqueza súbita",
    "paciente": "Sr. Antônio, 68 anos",
    "queixa": "A esposa conta: \"Ele começou a enrolar a fala e o braço direito ficou fraco.\"",
    "fonte": "https://www.cdc.gov/stroke/signs-symptoms/index.html",
    "vitais": "FC 88 bpm · FR 16 irpm · SpO₂ 97% em ar ambiente · PA 168/94 mmHg · T 36,5°C",
    "hipoteseCorreta": "avc",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Déficit neurológico súbito; o tempo é decisivo",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência, via aérea e respiração",
        "resposta": "Acordado, responde a perguntas com fala arrastada. Via aérea livre, respira sem esforço.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "inicio",
        "grupo": "Anamnese",
        "texto": "A que horas começou? Quando foi visto bem pela última vez?",
        "resposta": "A esposa conta que ele estava bem às 9h e às 9h20 começou com a fala enrolada. Agora são 10h.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sinais",
        "grupo": "Exame físico",
        "texto": "Examinar face, força dos braços e pernas e fala",
        "resposta": "Boca desviada, fraqueza no braço e na perna direitos e fala arrastada. Tudo começou de repente.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "antecedentes",
        "grupo": "Anamnese",
        "texto": "Quais doenças tem e quais remédios usa?",
        "resposta": "Tem pressão alta e toma o remédio de forma irregular. Não usa anticoagulante.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "cefaleia",
        "grupo": "Anamnese",
        "texto": "Teve dor de cabeça forte e repentina?",
        "resposta": "Nega dor de cabeça.",
        "pontos": 10,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "tomografia",
        "grupo": "Exames",
        "texto": "Pedir tomografia de crânio aqui e esperar o laudo antes de acionar a transferência",
        "resposta": "A unidade não tem tomógrafo e a espera atrasou a transferência. O exame de imagem é feito no hospital de referência, sem atrasar o transporte.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 60
      },
      {
        "id": "radiografia",
        "grupo": "Exames",
        "texto": "Pedir radiografia de tórax de rotina",
        "resposta": "Sem achados. O exame não muda a conduta e consumiu tempo.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 15
      },
      {
        "id": "avc",
        "grupo": "Hipóteses",
        "texto": "Registrar AVC agudo como hipótese principal",
        "resposta": "Hipótese registrada: déficit súbito de um lado do corpo e alteração da fala.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "enxaqueca",
        "grupo": "Hipóteses",
        "texto": "Registrar enxaqueca com aura como hipótese principal",
        "resposta": "Hipótese registrada, mas um déficit súbito de um lado do corpo, sem dor de cabeça, não deve ser atribuído a enxaqueca.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "ansiedade",
        "grupo": "Hipóteses",
        "texto": "Registrar crise de ansiedade como hipótese principal",
        "resposta": "Hipótese registrada, mas os sinais focais não se explicam por ansiedade.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "acionar",
        "grupo": "Conduta",
        "texto": "Acionar transporte de urgência para hospital com atendimento de AVC, informando o horário de início",
        "resposta": "Transporte acionado. A equipe de destino foi avisada do horário de início e se prepara para receber o paciente.",
        "pontos": 40,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "gravidade",
          "inicio"
        ]
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Monitorar sinais vitais e nível de consciência até a chegada do transporte",
        "resposta": "Sem piora neurológica durante a espera. FC 86 bpm, FR 16 irpm, SpO₂ 97% em ar ambiente, PA 164/92 mmHg, T 36,5°C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 10,
        "exige": [
          "acionar"
        ],
        "estadoPaciente": "Aguardando transporte, sem piora"
      },
      {
        "id": "registrar",
        "grupo": "Conduta",
        "texto": "Registrar horário de início, achados e medidas para a equipe de destino",
        "resposta": "Registro entregue à equipe do transporte.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "inicio",
          "sinais"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. Em suspeita de AVC, a conduta é transferir com urgência: os tratamentos que mais ajudam dependem de reconhecer e diagnosticar o AVC em poucas horas.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente transferido para o hospital de referência em AVC, com o horário de início registrado.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "inicio",
      "sinais",
      "avc",
      "acionar",
      "registrar"
    ]
  },
  {
    "id": "infecto-sepse-1",
    "versao": 1,
    "sistema": "Infeccioso",
    "revisado": true,
    "titulo": "Febre e confusão em idosa",
    "paciente": "Dona Cleide, 74 anos",
    "queixa": "A filha conta: \"Ela está com febre e confusa desde ontem, e quase não urinou.\"",
    "fonte": "https://www.cdc.gov/sepsis/about/index.html",
    "vitais": "FC 124 bpm · FR 28 irpm · SpO₂ 93% em ar ambiente · PA 86/50 mmHg · T 38,9°C",
    "hipoteseCorreta": "sepse",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Grave: sinais de infecção com hipotensão e confusão",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência, perfusão e respiração",
        "resposta": "Sonolenta e desorientada, pele fria e úmida, respiração rápida.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "foco",
        "grupo": "Anamnese",
        "texto": "Algum sintoma indica onde a infecção começou?",
        "resposta": "Há três dias tem ardência para urinar e urina com cheiro forte.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "antecedentes",
        "grupo": "Anamnese",
        "texto": "Quais doenças tem? Esteve internada recentemente?",
        "resposta": "É diabética e esteve internada há um mês.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "alergias",
        "grupo": "Anamnese",
        "texto": "Tem alergia a medicamentos?",
        "resposta": "Nega alergias.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "exame",
        "grupo": "Exame físico",
        "texto": "Examinar tórax, abdome, região lombar e pele",
        "resposta": "Dor à punho-percussão lombar à direita. Pulmões sem ruídos anormais; pele sem lesões.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "coleta",
        "grupo": "Exames",
        "texto": "Colher exames de sangue e urina sem atrasar o tratamento",
        "resposta": "Amostras colhidas em poucos minutos. Os resultados não devem atrasar o tratamento.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "tomografia",
        "grupo": "Exames",
        "texto": "Pedir tomografia de abdome antes de iniciar o tratamento",
        "resposta": "Exame demorado que atrasou o início do tratamento de uma paciente instável.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 40
      },
      {
        "id": "sepse",
        "grupo": "Hipóteses",
        "texto": "Registrar sepse de provável foco urinário como hipótese principal",
        "resposta": "Hipótese registrada: infecção com confusão, hipotensão e taquicardia.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "cistite",
        "grupo": "Hipóteses",
        "texto": "Registrar infecção urinária simples como hipótese principal",
        "resposta": "Hipótese registrada, mas confusão e pressão baixa indicam uma resposta grave à infecção, não um quadro simples.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "desidratacao",
        "grupo": "Hipóteses",
        "texto": "Registrar apenas desidratação como hipótese principal",
        "resposta": "Hipótese registrada, mas febre e foco urinário apontam para infecção grave.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "tratamento",
        "grupo": "Conduta",
        "texto": "Iniciar o protocolo de sepse da unidade, com antibiótico o quanto antes",
        "resposta": "Equipe inicia o protocolo de sepse, incluindo antibiótico, sem esperar os resultados.",
        "pontos": 40,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "gravidade",
          "alergias"
        ],
        "estadoPaciente": "Em tratamento; aguarda reavaliação"
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar logo após as primeiras medidas",
        "resposta": "FC 112 bpm, FR 24 irpm, SpO₂ 95% com oxigênio, PA 98/60 mmHg, T 38,4°C. Ainda confusa.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 30,
        "exige": [
          "tratamento"
        ],
        "estadoPaciente": "Ainda grave após as primeiras medidas"
      },
      {
        "id": "comunicar",
        "grupo": "Conduta",
        "texto": "Comunicar a gravidade à equipe de destino e registrar o que foi feito",
        "resposta": "Equipe do hospital de referência informada sobre o quadro e as medidas já tomadas.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. Sepse é emergência: sem tratamento rápido e continuado, evolui para lesão de órgãos e morte.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente transferida para unidade de maior complexidade, com o tratamento já iniciado.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "foco",
      "alergias",
      "sepse",
      "tratamento",
      "reavaliar",
      "comunicar"
    ]
  },
  {
    "id": "endo-hipoglicemia-1",
    "versao": 1,
    "sistema": "Endócrino e metabólico",
    "revisado": true,
    "titulo": "Suor frio e confusão antes do almoço",
    "paciente": "Seu Raimundo, 70 anos",
    "queixa": "O filho conta: \"Ele ficou suado, tremendo e confuso antes do almoço.\"",
    "fonte": "https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia",
    "vitais": "FC 104 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 138/82 mmHg · T 36,4°C",
    "hipoteseCorreta": "hipoglicemia",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "carboidrato",
      "reavaliar",
      "lanche",
      "orientar"
    ],
    "estadoInicial": "Confuso, mas acordado e engolindo",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência e se consegue engolir com segurança",
        "resposta": "Acordado e um pouco confuso, obedece a comandos e engole sem dificuldade.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "glicemia",
        "grupo": "Exames",
        "texto": "Medir glicemia capilar",
        "resposta": "Glicemia capilar de 54 mg/dL.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "medicamentos",
        "grupo": "Anamnese",
        "texto": "Quais remédios usa para o diabetes? Comeu hoje?",
        "resposta": "Toma glibenclamida, uma sulfonilureia, pela manhã. Hoje tomou o remédio e não comeu nada.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "antecedentes",
        "grupo": "Anamnese",
        "texto": "Tem doença nos rins ou já teve episódios assim?",
        "resposta": "Tem doença renal crônica leve. Nunca teve um episódio parecido.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "tomografia",
        "grupo": "Exames",
        "texto": "Pedir tomografia de crânio",
        "resposta": "Sem alterações. A confusão se explicava pela glicemia baixa.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 40
      },
      {
        "id": "hipoglicemia",
        "grupo": "Hipóteses",
        "texto": "Registrar hipoglicemia como hipótese principal",
        "resposta": "Hipótese registrada: glicemia abaixo de 70 mg/dL com sintomas, em uso de sulfonilureia e sem comer.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "avc",
        "grupo": "Hipóteses",
        "texto": "Registrar AVC como hipótese principal",
        "resposta": "Hipótese registrada, mas não há déficit de um lado do corpo e a glicemia está baixa.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sincope",
        "grupo": "Hipóteses",
        "texto": "Registrar desmaio comum como hipótese principal",
        "resposta": "Hipótese registrada, mas ele não desmaiou e a glicemia explica os sintomas.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "carboidrato",
        "grupo": "Conduta",
        "texto": "Oferecer de 15 a 20 g de carboidrato de absorção rápida pela boca",
        "resposta": "Toma meio copo de suco de fruta comum, sem ser diet.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "gravidade",
          "glicemia"
        ]
      },
      {
        "id": "glucagon",
        "grupo": "Conduta",
        "texto": "Aplicar glucagon",
        "resposta": "Não era necessário: ele está acordado e engole. O glucagon serve para a hipoglicemia grave, quando a pessoa não consegue se tratar.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 2
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Medir a glicemia de novo depois de 15 minutos",
        "resposta": "Glicemia de 98 mg/dL, lúcido e sem suor. FC 86 bpm, FR 16 irpm, SpO₂ 98% em ar ambiente, PA 132/80 mmHg, T 36,4°C.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 15,
        "exige": [
          "carboidrato"
        ],
        "estadoPaciente": "Glicemia corrigida, lúcido"
      },
      {
        "id": "lanche",
        "grupo": "Conduta",
        "texto": "Oferecer um lanche, já que a próxima refeição está a mais de uma hora",
        "resposta": "Come bolachas e uma fruta.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "orientar",
        "grupo": "Conduta",
        "texto": "Orientar sinais de hipoglicemia e como tratá-la e pedir revisão do remédio com a equipe que o acompanha",
        "resposta": "Família orientada sobre os sinais e a regra dos 15. Registrado o pedido de revisão da sulfonilureia, pela idade e pela doença renal.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta com glicemia corrigida, lanche e orientação.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Com a glicemia corrigida e o paciente lúcido, o caso podia ser resolvido aqui.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "glicemia",
      "medicamentos",
      "hipoglicemia",
      "carboidrato",
      "reavaliar",
      "orientar"
    ]
  },
  {
    "id": "endo-cetoacidose-1",
    "versao": 1,
    "sistema": "Endócrino e metabólico",
    "revisado": true,
    "titulo": "Vômitos, sede e respiração rápida",
    "paciente": "Júlia, 19 anos",
    "queixa": "\"Estou vomitando desde ontem, com muita sede e dor na barriga. Tenho diabetes tipo 1.\"",
    "fonte": "https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html",
    "vitais": "FC 118 bpm · FR 30 irpm · SpO₂ 98% em ar ambiente · PA 104/66 mmHg · T 36,9°C",
    "hipoteseCorreta": "cetoacidose",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Desidratada, com respiração rápida e profunda",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência, respiração e hidratação",
        "resposta": "Consciente e muito cansada. Respiração rápida e profunda, boca e pele secas.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "insulina",
        "grupo": "Anamnese",
        "texto": "Como está usando a insulina?",
        "resposta": "Com o vômito, parou de aplicar a insulina porque não estava comendo.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sintomas",
        "grupo": "Anamnese",
        "texto": "Que outros sintomas teve nos últimos dias?",
        "resposta": "Urina muito e sente muita sede há dois dias. A mãe notou hálito com cheiro de fruta.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "glicemia",
        "grupo": "Exames",
        "texto": "Medir glicemia capilar",
        "resposta": "Glicemia capilar de 412 mg/dL.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "cetonas",
        "grupo": "Exames",
        "texto": "Pesquisar cetonas no sangue ou na urina",
        "resposta": "Cetonas elevadas.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "radiografia",
        "grupo": "Exames",
        "texto": "Pedir radiografia de abdome",
        "resposta": "Sem achados. O exame não ajuda no diagnóstico e atrasa a transferência.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 20
      },
      {
        "id": "cetoacidose",
        "grupo": "Hipóteses",
        "texto": "Registrar cetoacidose diabética como hipótese principal",
        "resposta": "Hipótese registrada: diabetes tipo 1, insulina suspensa, glicemia muito alta, cetonas elevadas e respiração rápida e profunda.",
        "pontos": 45,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "gastroenterite",
        "grupo": "Hipóteses",
        "texto": "Registrar gastroenterite como hipótese principal",
        "resposta": "Hipótese registrada, mas a glicemia alta com cetonas indica cetoacidose; a doença que causa vômitos pode ter sido o gatilho.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "apendicite",
        "grupo": "Hipóteses",
        "texto": "Registrar apendicite como hipótese principal",
        "resposta": "Hipótese registrada, mas a dor abdominal aqui acompanha a cetoacidose, que explica o quadro.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "insulina-casa",
        "grupo": "Conduta",
        "texto": "Orientar a voltar a aplicar a insulina em casa e beber água",
        "resposta": "Inseguro: cetonas elevadas com vômitos são emergência e precisam de tratamento hospitalar.",
        "pontos": -20,
        "criterio": "seguranca",
        "minutos": 2
      },
      {
        "id": "comunicar",
        "grupo": "Conduta",
        "texto": "Comunicar ao hospital de destino a glicemia, as cetonas e o quadro",
        "resposta": "Equipe de destino avisada; vai repor líquidos, eletrólitos e insulina.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "glicemia",
          "cetonas"
        ]
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Monitorar sinais vitais e consciência até a transferência",
        "resposta": "Sem piora durante a espera. FC 116 bpm, FR 28 irpm, SpO₂ 98% em ar ambiente, PA 106/66 mmHg, T 36,9°C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 15,
        "exige": [
          "gravidade"
        ],
        "estadoPaciente": "Aguardando transferência"
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. Cetonas elevadas com vômitos e respiração difícil são emergência; o tratamento é hospitalar.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente transferida para tratamento de emergência da cetoacidose.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "insulina",
      "glicemia",
      "cetonas",
      "cetoacidose",
      "comunicar"
    ]
  },
  {
    "id": "tox-opioide-1",
    "versao": 1,
    "sistema": "Toxicológico e ambiental",
    "revisado": true,
    "titulo": "Não acorda depois de usar comprimidos",
    "paciente": "Homem de cerca de 30 anos",
    "queixa": "Os amigos contam: \"Ele tomou uns comprimidos de remédio forte para dor com bebida e não acorda direito.\"",
    "fonte": "https://nida.nih.gov/publications/drugfacts/naloxone",
    "vitais": "FC 58 bpm · FR 6 irpm · SpO₂ 84% em ar ambiente · PA 100/60 mmHg · T 36,0°C",
    "hipoteseCorreta": "overdose",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Grave: respiração lenta e superficial",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar resposta, respiração, pupilas e cor dos lábios",
        "resposta": "Só responde à dor. Respiração lenta e superficial, pupilas muito pequenas, lábios arroxeados.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "historia",
        "grupo": "Anamnese",
        "texto": "Perguntar aos amigos o que ele usou e quando",
        "resposta": "Comprimidos de um opioide receitado ao avô, com cerveja, há cerca de uma hora.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "monitor",
        "grupo": "Exames",
        "texto": "Monitorar saturação e frequência respiratória",
        "resposta": "SpO₂ de 84% e FR de 6 irpm.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "tomografia",
        "grupo": "Exames",
        "texto": "Pedir tomografia de crânio antes de qualquer medida",
        "resposta": "O exame atrasou o tratamento de um paciente que mal respirava.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 40
      },
      {
        "id": "overdose",
        "grupo": "Hipóteses",
        "texto": "Registrar overdose de opioide como hipótese principal",
        "resposta": "Hipótese registrada: pupilas muito pequenas, respiração lenta e uso de opioide.",
        "pontos": 50,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "alcool",
        "grupo": "Hipóteses",
        "texto": "Registrar só intoxicação alcoólica como hipótese principal",
        "resposta": "Hipótese registrada, mas pupilas muito pequenas e respiração tão lenta apontam para o opioide.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "ave",
        "grupo": "Hipóteses",
        "texto": "Registrar AVC como hipótese principal",
        "resposta": "Hipótese registrada, mas a história e os sinais apontam para overdose de opioide.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "naloxona",
        "grupo": "Conduta",
        "texto": "Administrar naloxona",
        "resposta": "Em poucos minutos volta a respirar melhor e abre os olhos.",
        "pontos": 40,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "gravidade"
        ],
        "estadoPaciente": "Respondeu à naloxona"
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar respiração e consciência depois da naloxona",
        "resposta": "Acordado e confuso. FC 76 bpm, FR 14 irpm, SpO₂ 95% em ar ambiente, PA 112/70 mmHg, T 36,2°C.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 10,
        "exige": [
          "naloxona"
        ],
        "estadoPaciente": "Melhorou, mas pode voltar a piorar"
      },
      {
        "id": "vigiar",
        "grupo": "Conduta",
        "texto": "Manter observação contínua, porque o efeito da naloxona pode acabar antes do opioide",
        "resposta": "Equipe mantém vigilância. A naloxona age por 30 a 90 minutos, e muitos opioides duram mais.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "liberar-amigos",
        "grupo": "Conduta",
        "texto": "Liberar com os amigos logo que acordar",
        "resposta": "Inseguro: o efeito da naloxona pode acabar antes do efeito do opioide, e a respiração pode voltar a ficar lenta.",
        "pontos": -20,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. Depois da naloxona, a pessoa precisa de observação contínua: a overdose pode voltar quando o efeito da naloxona passa.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente transferido para observação em serviço de maior complexidade.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "historia",
      "overdose",
      "naloxona",
      "reavaliar",
      "vigiar"
    ]
  },
  {
    "id": "amb-intermacao-1",
    "versao": 1,
    "sistema": "Toxicológico e ambiental",
    "revisado": true,
    "titulo": "Desmaio no canteiro de obras",
    "paciente": "Carlos, 41 anos, pedreiro",
    "queixa": "O colega conta: \"Ele estava trabalhando no sol, começou a falar enrolado e caiu.\"",
    "fonte": "https://www.cdc.gov/niosh/heat-stress/about/illnesses.html",
    "vitais": "FC 132 bpm · FR 26 irpm · SpO₂ 96% em ar ambiente · PA 98/58 mmHg · T 41,0°C",
    "hipoteseCorreta": "intermacao",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Grave: muito quente e confuso",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência, respiração e pele",
        "resposta": "Confuso, fala arrastada. Pele muito quente. Respira rápido, sem obstrução.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "contexto",
        "grupo": "Anamnese",
        "texto": "Perguntar ao colega como foi o dia de trabalho",
        "resposta": "Trabalhou desde cedo no sol forte, bebeu pouca água e não parou para descansar.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "temperatura",
        "grupo": "Exame físico",
        "texto": "Confirmar a temperatura corporal",
        "resposta": "Temperatura de 41,0°C.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "resfriar",
        "grupo": "Conduta",
        "texto": "Levar para local fresco, tirar a roupa de cima e resfriar rápido com água fria, panos molhados e ventilação",
        "resposta": "Resfriamento iniciado com água fria e ventilador.",
        "pontos": 45,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "gravidade"
        ],
        "estadoPaciente": "Em resfriamento"
      },
      {
        "id": "gelo",
        "grupo": "Conduta",
        "texto": "Colocar panos frios ou gelo na cabeça, no pescoço, nas axilas e na virilha",
        "resposta": "Compressas frias posicionadas.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "resfriar"
        ]
      },
      {
        "id": "tomografia",
        "grupo": "Exames",
        "texto": "Pedir tomografia de crânio antes de resfriar",
        "resposta": "O exame atrasou o resfriamento, que é a medida urgente.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 40
      },
      {
        "id": "intermacao",
        "grupo": "Hipóteses",
        "texto": "Registrar intermação (golpe de calor) como hipótese principal",
        "resposta": "Hipótese registrada: calor intenso, confusão e temperatura muito alta.",
        "pontos": 50,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "exaustao",
        "grupo": "Hipóteses",
        "texto": "Registrar exaustão pelo calor como hipótese principal",
        "resposta": "Hipótese registrada, mas confusão mental e temperatura tão alta indicam o quadro mais grave, a intermação.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "meningite",
        "grupo": "Hipóteses",
        "texto": "Registrar meningite como hipótese principal",
        "resposta": "Hipótese registrada, mas a exposição ao calor no trabalho explica o quadro.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar depois do resfriamento",
        "resposta": "Mais acordado. FC 112 bpm, FR 22 irpm, SpO₂ 97% em ar ambiente, PA 106/64 mmHg, T 39,0°C.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 20,
        "exige": [
          "resfriar"
        ],
        "estadoPaciente": "Melhorando com o resfriamento"
      },
      {
        "id": "comunicar",
        "grupo": "Conduta",
        "texto": "Acionar o atendimento de emergência e ficar com o paciente até a chegada da equipe",
        "resposta": "Equipe de transporte acionada; o resfriamento continua até a chegada.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "gravidade"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. A intermação pode causar incapacidade permanente ou morte sem tratamento de emergência.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente transferido para tratamento de emergência, com resfriamento mantido.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "temperatura",
      "resfriar",
      "intermacao",
      "reavaliar",
      "comunicar"
    ]
  },
  {
    "id": "tox-monoxido-1",
    "versao": 1,
    "sistema": "Toxicológico e ambiental",
    "revisado": true,
    "titulo": "Família inteira com dor de cabeça",
    "paciente": "Fernanda, 34 anos",
    "queixa": "\"Eu, meu marido e meu filho acordamos com dor de cabeça e tontura.\"",
    "fonte": "https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html",
    "vitais": "FC 104 bpm · FR 20 irpm · SpO₂ 99% em ar ambiente · PA 122/78 mmHg · T 36,6°C",
    "hipoteseCorreta": "monoxido",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "oxigenio",
      "reavaliar",
      "orientar",
      "gravidez"
    ],
    "estadoInicial": "Sintomática, com oximetria normal",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência, respiração e dor no peito",
        "resposta": "Consciente e orientada, com dor de cabeça e náusea. Nega dor no peito e desmaio.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "exposicao",
        "grupo": "Anamnese",
        "texto": "Perguntar sobre a casa, outras pessoas com sintomas e febre",
        "resposta": "Ligaram um aquecedor a gás com as janelas fechadas. Todos em casa têm os mesmos sintomas, e ninguém tem febre.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "gravidez",
        "grupo": "Exames",
        "texto": "Fazer teste de gravidez",
        "resposta": "Teste negativo.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 5
      },
      {
        "id": "neuro",
        "grupo": "Exame físico",
        "texto": "Fazer exame neurológico com avaliação cognitiva",
        "resposta": "Sem déficits; memória e atenção preservadas.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "cohb",
        "grupo": "Exames",
        "texto": "Dosar a carboxi-hemoglobina",
        "resposta": "Carboxi-hemoglobina de 18%. Ela não fuma.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 20
      },
      {
        "id": "oximetria",
        "grupo": "Exames",
        "texto": "Descartar a intoxicação porque a SpO₂ está em 99%",
        "resposta": "Erro: o oxímetro de pulso não é preciso quando há carboxi-hemoglobina; a saturação normal não descarta a intoxicação.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 1
      },
      {
        "id": "ecg",
        "grupo": "Exames",
        "texto": "Fazer eletrocardiograma",
        "resposta": "Ritmo sinusal, sem sinais de isquemia.",
        "pontos": 10,
        "criterio": "raciocinio",
        "minutos": 10
      },
      {
        "id": "monoxido",
        "grupo": "Hipóteses",
        "texto": "Registrar intoxicação por monóxido de carbono como hipótese principal",
        "resposta": "Hipótese registrada: exposição a aquecedor a gás, sem febre, várias pessoas com os mesmos sintomas.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "gripe",
        "grupo": "Hipóteses",
        "texto": "Registrar síndrome gripal como hipótese principal",
        "resposta": "Hipótese registrada, mas sem febre e com toda a família doente após o aquecedor, a intoxicação é mais provável.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "oxigenio",
        "grupo": "Conduta",
        "texto": "Iniciar oxigênio a 100% por máscara",
        "resposta": "Oxigênio a 100% iniciado.",
        "pontos": 40,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "gravidade"
        ],
        "estadoPaciente": "Em oxigênio a 100%"
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar depois de cerca de 4 horas de oxigênio",
        "resposta": "Sem sintomas e com exame neurológico normal. FC 84 bpm, FR 16 irpm, SpO₂ 99%, PA 118/76 mmHg, T 36,6°C.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 240,
        "exige": [
          "oxigenio"
        ],
        "estadoPaciente": "Sem sintomas após o oxigênio"
      },
      {
        "id": "orientar",
        "grupo": "Conduta",
        "texto": "Orientar a não voltar para casa até o aquecedor ser revisto e garantir a avaliação da família",
        "resposta": "Marido e filho também em atendimento. Orientada a não usar o aparelho até a revisão e a ter detector de monóxido.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta sem sintomas, após o oxigênio, com orientação sobre a fonte do gás.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Sem desmaio, sem alteração cardíaca ou neurológica, sem gravidez e com carboxi-hemoglobina abaixo de 25%, não havia critério para oxigênio hiperbárico.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "exposicao",
      "gravidez",
      "cohb",
      "monoxido",
      "oxigenio",
      "reavaliar",
      "orientar"
    ]
  },
  {
    "id": "pele-tetano-1",
    "versao": 1,
    "sistema": "Pele e partes moles",
    "revisado": true,
    "titulo": "Pisou num prego na obra",
    "paciente": "Paulo, 45 anos",
    "queixa": "\"Pisei num prego enferrujado há duas horas, quando estava trabalhando.\"",
    "fonte": "https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html",
    "vitais": "FC 82 bpm · FR 16 irpm · SpO₂ 98% em ar ambiente · PA 126/80 mmHg · T 36,5°C",
    "hipoteseCorreta": "ferimento-sujo",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "limpar",
      "reforco",
      "reavaliar",
      "orientar"
    ],
    "estadoInicial": "Estável, com ferimento perfurante",
    "acoes": [
      {
        "id": "ferimento",
        "grupo": "Exame físico",
        "texto": "Examinar o ferimento",
        "resposta": "Ferimento perfurante na sola do pé, com terra. Sem sangramento ativo; sente e mexe os dedos normalmente.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "vacina",
        "grupo": "Anamnese",
        "texto": "Conferir a vacinação contra o tétano",
        "resposta": "Pela carteira, tem o esquema completo; o último reforço foi há 7 anos.",
        "pontos": 35,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "alergias",
        "grupo": "Anamnese",
        "texto": "Tem alergia a vacinas ou medicamentos?",
        "resposta": "Nega alergias.",
        "pontos": 10,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "rotina",
        "grupo": "Exames",
        "texto": "Pedir hemograma e cultura de rotina",
        "resposta": "Exames sem utilidade neste caso; não mudam a conduta.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 30
      },
      {
        "id": "ferimento-sujo",
        "grupo": "Hipóteses",
        "texto": "Classificar como ferimento sujo, com risco aumentado de tétano",
        "resposta": "Classificação registrada: ferimento perfurante com terra.",
        "pontos": 55,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "ferimento-limpo",
        "grupo": "Hipóteses",
        "texto": "Classificar como ferimento limpo e pequeno, sem risco relevante",
        "resposta": "Classificação registrada, mas ferimento perfurante com terra é sujo e tem risco maior.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "limpar",
        "grupo": "Conduta",
        "texto": "Limpar o ferimento e remover a sujeira",
        "resposta": "Ferimento lavado e limpo.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 10,
        "exige": [
          "ferimento"
        ]
      },
      {
        "id": "reforco",
        "grupo": "Conduta",
        "texto": "Aplicar reforço da vacina contra o tétano",
        "resposta": "Reforço aplicado: esquema completo, mas o último reforço foi há 5 anos ou mais, e o ferimento é sujo.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "vacina",
          "alergias"
        ]
      },
      {
        "id": "imunoglobulina",
        "grupo": "Conduta",
        "texto": "Aplicar imunoglobulina antitetânica",
        "resposta": "Não indicada: ele tem o esquema completo. A imunoglobulina fica para quem tem vacinação desconhecida ou incompleta, ou imunodeficiência.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 5
      },
      {
        "id": "antibiotico",
        "grupo": "Conduta",
        "texto": "Prescrever antibiótico para prevenir o tétano",
        "resposta": "Não recomendado: antibiótico não é usado para prevenir tétano no cuidado do ferimento.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 2
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar o pé depois da limpeza",
        "resposta": "Ferimento limpo. FC 78 bpm, FR 16 irpm, SpO₂ 98% em ar ambiente, PA 124/80 mmHg, T 36,5°C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "limpar"
        ]
      },
      {
        "id": "orientar",
        "grupo": "Conduta",
        "texto": "Orientar cuidados com o ferimento e retorno se houver sinais de infecção",
        "resposta": "Orientado a manter o ferimento limpo e voltar se surgir vermelhidão, pus, febre ou dor que aumenta.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta com ferimento limpo, reforço aplicado e orientações.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. O caso podia ser resolvido aqui, com limpeza e vacina.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "ferimento",
      "vacina",
      "ferimento-sujo",
      "limpar",
      "reforco"
    ]
  },
  {
    "id": "zoo-raiva-1",
    "versao": 1,
    "sistema": "Zoonoses e acidentes por animais",
    "revisado": true,
    "titulo": "Mordida de cachorro na perna",
    "paciente": "Lucas, 12 anos",
    "queixa": "A mãe conta: \"O cachorro do vizinho mordeu a perna dele há uma hora.\"",
    "fonte": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/r/raiva",
    "vitais": "FC 96 bpm · FR 18 irpm · SpO₂ 99% em ar ambiente · PA 108/68 mmHg · T 36,6°C",
    "hipoteseCorreta": "exposicao-raiva",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "lavar",
      "profilaxia",
      "observar"
    ],
    "estadoInicial": "Estável, com mordedura recente",
    "acoes": [
      {
        "id": "ferimento",
        "grupo": "Exame físico",
        "texto": "Examinar o ferimento",
        "resposta": "Duas perfurações e uma escoriação na panturrilha, sem sangramento ativo.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "animal",
        "grupo": "Anamnese",
        "texto": "Perguntar sobre o cachorro: é conhecido? Pode ser observado?",
        "resposta": "É o cachorro do vizinho, que mora ao lado e pode ser observado. O dono diz que ele está saudável.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "vacina-tetano",
        "grupo": "Anamnese",
        "texto": "Conferir a vacinação contra o tétano",
        "resposta": "Carteira de vacinação em dia.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 2
      },
      {
        "id": "radiografia",
        "grupo": "Exames",
        "texto": "Pedir radiografia da perna",
        "resposta": "Sem alterações. O ferimento é superficial e o exame não muda a conduta.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 20
      },
      {
        "id": "exposicao-raiva",
        "grupo": "Hipóteses",
        "texto": "Registrar exposição ao vírus da raiva por mordedura de cão",
        "resposta": "Hipótese registrada: agressão por animal exige avaliação da profilaxia antirrábica.",
        "pontos": 45,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sem-risco",
        "grupo": "Hipóteses",
        "texto": "Registrar ferimento sem risco de raiva, porque o cão parece saudável",
        "resposta": "Hipótese registrada, mas toda agressão por animal precisa da avaliação da profilaxia, e o cão deve ser observado.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "lavar",
        "grupo": "Conduta",
        "texto": "Lavar o ferimento com bastante água e sabão e aplicar antisséptico",
        "resposta": "Ferimento lavado com cuidado e antisséptico aplicado.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 10,
        "exige": [
          "ferimento"
        ]
      },
      {
        "id": "profilaxia",
        "grupo": "Conduta",
        "texto": "Avaliar e prescrever a profilaxia antirrábica conforme o protocolo do Ministério da Saúde",
        "resposta": "Esquema definido pelo fluxograma, considerando o ferimento e a possibilidade de observar o animal.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "ferimento",
          "animal"
        ]
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar o menino depois do atendimento",
        "resposta": "Tranquilo e sem sangramento. FC 90 bpm, FR 18 irpm, SpO₂ 99% em ar ambiente, PA 106/68 mmHg, T 36,6°C.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "lavar"
        ]
      },
      {
        "id": "observar",
        "grupo": "Conduta",
        "texto": "Orientar observar o cão por 10 dias e avisar o serviço se ele adoecer, sumir ou morrer",
        "resposta": "Mãe e vizinho orientados a observar o cão e a avisar a unidade se houver qualquer mudança.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "animal"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta com ferimento tratado, profilaxia definida e observação do cão orientada.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. O atendimento antirrábico podia ser feito aqui.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "ferimento",
      "animal",
      "exposicao-raiva",
      "lavar",
      "profilaxia",
      "observar"
    ]
  },
  {
    "id": "resp-gripe-gestante-1",
    "versao": 1,
    "sistema": "Respiratório",
    "revisado": true,
    "titulo": "Febre e tosse na gravidez",
    "paciente": "Aline, 27 anos, grávida de 24 semanas",
    "queixa": "\"Comecei ontem à tarde com febre, tosse e dor no corpo.\"",
    "fonte": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gripe-influenza",
    "vitais": "FC 98 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 112/70 mmHg · T 38,3°C",
    "hipoteseCorreta": "influenza",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "antiviral",
      "reavaliar",
      "orientar"
    ],
    "estadoInicial": "Síndrome gripal sem sinais de gravidade",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar respiração, fala e sinais de gravidade",
        "resposta": "Fala frases completas, sem falta de ar. Sem confusão.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "inicio",
        "grupo": "Anamnese",
        "texto": "Quando começaram os sintomas?",
        "resposta": "Ontem à tarde, há menos de 48 horas.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sintomas",
        "grupo": "Anamnese",
        "texto": "Que sintomas tem?",
        "resposta": "Febre, tosse, dor de garganta, dor no corpo e dor de cabeça, de início repentino.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "gestacao",
        "grupo": "Anamnese",
        "texto": "Como está a gestação e o pré-natal?",
        "resposta": "24 semanas, pré-natal em dia, sem intercorrências. O bebê está se mexendo.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "ausculta",
        "grupo": "Exame físico",
        "texto": "Auscultar os pulmões",
        "resposta": "Murmúrio vesicular presente, sem ruídos anormais.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "radiografia",
        "grupo": "Exames",
        "texto": "Pedir radiografia de tórax de rotina",
        "resposta": "Sem achados. O exame não muda a conduta neste quadro sem sinais pulmonares.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 20
      },
      {
        "id": "influenza",
        "grupo": "Hipóteses",
        "texto": "Registrar síndrome gripal (influenza) como hipótese principal",
        "resposta": "Hipótese registrada: febre, tosse e dor no corpo de início súbito, sem sinais de gravidade.",
        "pontos": 40,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "pneumonia",
        "grupo": "Hipóteses",
        "texto": "Registrar pneumonia como hipótese principal",
        "resposta": "Hipótese registrada, mas sem falta de ar e com ausculta normal o quadro é de síndrome gripal.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "antiviral",
        "grupo": "Conduta",
        "texto": "Prescrever o antiviral do protocolo de influenza, por ser gestante",
        "resposta": "Antiviral prescrito. A gestação é fator de risco para complicações, e o tratamento deve começar de preferência nas primeiras 48 horas.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "gravidade",
          "inicio",
          "gestacao"
        ]
      },
      {
        "id": "sem-antiviral",
        "grupo": "Conduta",
        "texto": "Não prescrever antiviral porque não há sinais de gravidade",
        "resposta": "Inseguro: em gestantes com síndrome gripal o antiviral é indicado mesmo sem gravidade.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Rever sinais vitais e saturação antes de liberar",
        "resposta": "Estável. FC 92 bpm, FR 18 irpm, SpO₂ 98% em ar ambiente, PA 110/70 mmHg, T 37,6°C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 30,
        "exige": [
          "antiviral"
        ]
      },
      {
        "id": "orientar",
        "grupo": "Conduta",
        "texto": "Orientar ficar em casa, afastamento e retorno se surgir falta de ar",
        "resposta": "Orientada a ficar em casa e a se afastar até 24 horas sem febre, sem usar antitérmico, e a voltar se tiver falta de ar ou piora.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta com antiviral, orientações e sinais para retorno.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Sem sinais de gravidade, o caso podia ser resolvido aqui, com o antiviral.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "inicio",
      "gestacao",
      "influenza",
      "antiviral",
      "orientar"
    ]
  },
  {
    "id": "uro-cistite-1",
    "versao": 1,
    "sistema": "Renal e urinário",
    "revisado": true,
    "titulo": "Ardência para urinar",
    "paciente": "Bianca, 24 anos",
    "queixa": "\"Estou com ardência para urinar e indo ao banheiro toda hora desde ontem.\"",
    "fonte": "https://www.cdc.gov/uti/about/index.html",
    "vitais": "FC 84 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 116/74 mmHg · T 36,8°C",
    "hipoteseCorreta": "cistite",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "antibiotico",
      "reavaliar",
      "orientar"
    ],
    "estadoInicial": "Estável, com sintomas urinários",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar estado geral",
        "resposta": "Bom estado geral, sem sinais de gravidade.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "sintomas",
        "grupo": "Anamnese",
        "texto": "Detalhar os sintomas urinários",
        "resposta": "Ardência ao urinar, vontade de urinar toda hora mesmo com a bexiga vazia e pressão no pé da barriga.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "rim",
        "grupo": "Anamnese",
        "texto": "Tem febre, calafrios, dor nas costas, náusea ou vômitos?",
        "resposta": "Nega febre, calafrios, dor nas costas, náusea e vômitos.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "gravidez",
        "grupo": "Anamnese",
        "texto": "Pode estar grávida?",
        "resposta": "Menstruou há duas semanas; teste de gravidez negativo.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 5
      },
      {
        "id": "alergias",
        "grupo": "Anamnese",
        "texto": "Tem alergia a medicamentos?",
        "resposta": "Nega alergias.",
        "pontos": 10,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "exame",
        "grupo": "Exame físico",
        "texto": "Examinar abdome e região lombar",
        "resposta": "Dor leve acima do púbis. Punho-percussão lombar negativa.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "tomografia",
        "grupo": "Exames",
        "texto": "Pedir tomografia de abdome",
        "resposta": "Sem achados. O exame não estava indicado para este quadro.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 40
      },
      {
        "id": "cistite",
        "grupo": "Hipóteses",
        "texto": "Registrar infecção da bexiga (cistite) como hipótese principal",
        "resposta": "Hipótese registrada: sintomas urinários baixos, sem febre nem dor nas costas.",
        "pontos": 55,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "pielonefrite",
        "grupo": "Hipóteses",
        "texto": "Registrar infecção do rim (pielonefrite) como hipótese principal",
        "resposta": "Hipótese registrada, mas sem febre, calafrios, dor nas costas ou vômitos o quadro é de cistite.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "ist",
        "grupo": "Hipóteses",
        "texto": "Registrar infecção sexualmente transmissível como hipótese principal",
        "resposta": "Hipótese registrada, mas o quadro é de infecção urinária, que não é uma IST.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "antibiotico",
        "grupo": "Conduta",
        "texto": "Prescrever o antibiótico do protocolo para cistite",
        "resposta": "Antibiótico prescrito conforme o protocolo da unidade.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "alergias",
          "gravidez"
        ]
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Rever sinais vitais antes de liberar",
        "resposta": "Estável. FC 80 bpm, FR 16 irpm, SpO₂ 99% em ar ambiente, PA 114/72 mmHg, T 36,7°C.",
        "pontos": 10,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "antibiotico"
        ]
      },
      {
        "id": "orientar",
        "grupo": "Conduta",
        "texto": "Orientar hidratação, prevenção e retorno se surgir febre ou dor nas costas",
        "resposta": "Orientada a beber água, urinar depois das relações e voltar se tiver febre, calafrios ou dor nas costas.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta com antibiótico e orientações.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Uma cistite sem sinais de infecção renal podia ser tratada aqui.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "sintomas",
      "rim",
      "gravidez",
      "cistite",
      "antibiotico",
      "orientar"
    ]
  },
  {
    "id": "gi-diarreia-1",
    "versao": 1,
    "sistema": "Gastrointestinal",
    "revisado": true,
    "titulo": "Diarreia desde ontem",
    "paciente": "Roberto, 38 anos",
    "queixa": "\"Estou com diarreia desde ontem, umas cinco vezes, e um pouco de cólica.\"",
    "fonte": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dda",
    "vitais": "FC 88 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 124/78 mmHg · T 37,2°C",
    "hipoteseCorreta": "dda",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "plano-a",
      "reavaliar",
      "orientar"
    ],
    "estadoInicial": "Hidratado, com diarreia aguda",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar estado geral e consciência",
        "resposta": "Consciente, bom estado geral, engole sem dificuldade.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "caracteristicas",
        "grupo": "Anamnese",
        "texto": "Tem sangue ou muco nas fezes, febre ou vômitos?",
        "resposta": "Fezes líquidas, sem sangue nem muco. Sem vômitos; febre baixa ontem.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "contatos",
        "grupo": "Anamnese",
        "texto": "Alguém próximo adoeceu igual? Comeu algo diferente?",
        "resposta": "Ninguém da família adoeceu. Comeu em um restaurante novo anteontem.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "hidratacao",
        "grupo": "Exame físico",
        "texto": "Avaliar o estado de hidratação e pesar o paciente",
        "resposta": "Sem sinais de desidratação: mucosas úmidas, sem sede intensa, urinando normalmente. Peso registrado.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "coprocultura",
        "grupo": "Exames",
        "texto": "Pedir coprocultura de rotina",
        "resposta": "Sem indicação neste caso: a coleta é importante em surtos, desidratação grave, sangue nas fezes ou suspeita de cólera.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 15
      },
      {
        "id": "dda",
        "grupo": "Hipóteses",
        "texto": "Registrar diarreia aguda sem desidratação como hipótese principal",
        "resposta": "Hipótese registrada: diarreia aguda, paciente hidratado.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "colera",
        "grupo": "Hipóteses",
        "texto": "Registrar cólera como hipótese principal",
        "resposta": "Hipótese registrada, mas não há desidratação grave nem contexto que sustente essa suspeita.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "apendicite",
        "grupo": "Hipóteses",
        "texto": "Registrar apendicite como hipótese principal",
        "resposta": "Hipótese registrada, mas a cólica difusa com diarreia e abdome sem dor localizada não sustentam essa hipótese.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "antibiotico",
        "grupo": "Conduta",
        "texto": "Prescrever antibiótico",
        "resposta": "Sem indicação: o antibiótico fica reservado para diarreia com sangue ou muco e comprometimento do estado geral, ou cólera com desidratação grave.",
        "pontos": -15,
        "criterio": "eficiencia",
        "minutos": 2
      },
      {
        "id": "plano-a",
        "grupo": "Conduta",
        "texto": "Orientar o Plano A: mais líquidos e soro de reidratação oral após cada evacuação, mantendo a alimentação habitual",
        "resposta": "Orientado a beber mais água e soro de reidratação oral após cada evacuação e a comer normalmente.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "hidratacao"
        ]
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Observar se tolera o soro de reidratação oral",
        "resposta": "Tomou o soro sem vomitar. FC 84 bpm, FR 16 irpm, SpO₂ 99% em ar ambiente, PA 122/78 mmHg, T 37,0°C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 30,
        "exige": [
          "plano-a"
        ]
      },
      {
        "id": "orientar",
        "grupo": "Conduta",
        "texto": "Orientar os sinais para voltar ao serviço",
        "resposta": "Voltar se não melhorar em 2 dias ou se tiver piora da diarreia, vômitos repetidos, muita sede, recusa de alimentos, sangue nas fezes ou menos urina.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "reavaliar"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta com o Plano A e os sinais de retorno.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Um paciente hidratado segue o Plano A em casa.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "caracteristicas",
      "hidratacao",
      "dda",
      "plano-a",
      "orientar"
    ]
  },
  {
    "id": "vasc-tvp-1",
    "versao": 1,
    "sistema": "Vascular",
    "revisado": true,
    "titulo": "Perna inchada depois de cirurgia",
    "paciente": "Dona Marta, 58 anos",
    "queixa": "\"Fiz cirurgia no joelho há dez dias e agora a perna esquerda está inchada e doendo.\"",
    "fonte": "https://www.cdc.gov/blood-clots/about/index.html",
    "vitais": "FC 92 bpm · FR 16 irpm · SpO₂ 97% em ar ambiente · PA 132/84 mmHg · T 36,9°C",
    "hipoteseCorreta": "tvp",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Estável, com perna inchada",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar respiração e estado geral",
        "resposta": "Respira sem esforço, bom estado geral.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "pernas",
        "grupo": "Anamnese",
        "texto": "Desde quando a perna está assim?",
        "resposta": "Há dois dias a panturrilha esquerda incha e dói, pior ao andar.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "risco",
        "grupo": "Anamnese",
        "texto": "Como tem sido a mobilidade depois da cirurgia?",
        "resposta": "Tem ficado quase todo o tempo sentada ou deitada desde a cirurgia.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sinais-tep",
        "grupo": "Anamnese",
        "texto": "Tem falta de ar, dor no peito ao respirar, tosse com sangue ou desmaio?",
        "resposta": "Nega falta de ar, dor no peito, tosse com sangue e desmaio.",
        "pontos": 30,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "exame",
        "grupo": "Exame físico",
        "texto": "Examinar as duas pernas",
        "resposta": "Perna esquerda inchada, quente, avermelhada e dolorosa na panturrilha. Perna direita normal.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "radiografia",
        "grupo": "Exames",
        "texto": "Pedir radiografia da perna",
        "resposta": "Sem alterações ósseas. O exame não avalia as veias.",
        "pontos": -10,
        "criterio": "eficiencia",
        "minutos": 20
      },
      {
        "id": "tvp",
        "grupo": "Hipóteses",
        "texto": "Registrar trombose venosa profunda como hipótese principal",
        "resposta": "Hipótese registrada: inchaço, dor, calor e vermelhidão em uma perna, após cirurgia e com pouca mobilidade.",
        "pontos": 55,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "celulite",
        "grupo": "Hipóteses",
        "texto": "Registrar celulite como hipótese principal",
        "resposta": "Hipótese registrada, mas o contexto pós-operatório com pouca mobilidade torna a trombose a principal suspeita.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "distensao",
        "grupo": "Hipóteses",
        "texto": "Registrar distensão muscular como hipótese principal",
        "resposta": "Hipótese registrada, mas não houve esforço e o quadro combina com trombose.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "orientar-tep",
        "grupo": "Conduta",
        "texto": "Explicar os sinais de embolia pulmonar e procurar ajuda imediata se surgirem",
        "resposta": "Orientada sobre falta de ar, dor no peito e desmaio.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "sinais-tep"
        ]
      },
      {
        "id": "comunicar",
        "grupo": "Conduta",
        "texto": "Registrar e comunicar à equipe de destino a suspeita de trombose",
        "resposta": "Equipe de referência avisada para avaliação e exame das veias.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "exame"
        ]
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Rever sinais vitais antes da transferência",
        "resposta": "Estável. FC 90 bpm, FR 16 irpm, SpO₂ 97% em ar ambiente, PA 130/84 mmHg, T 36,9°C.",
        "pontos": 15,
        "criterio": "seguranca",
        "minutos": 10,
        "exige": [
          "gravidade"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. A suspeita de trombose precisa de avaliação médica rápida, porque parte do coágulo pode se soltar e ir para os pulmões.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente encaminhada para avaliação e confirmação da trombose.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "risco",
      "sinais-tep",
      "exame",
      "tvp",
      "comunicar"
    ]
  },
  {
    "id": "gi-apendicite-1",
    "versao": 1,
    "sistema": "Gastrointestinal",
    "revisado": true,
    "titulo": "Dor que começou no umbigo",
    "paciente": "Larissa, 23 anos",
    "queixa": "\"A dor começou perto do umbigo ontem à noite e agora está do lado direito, embaixo.\"",
    "fonte": "https://www.niddk.nih.gov/health-information/digestive-diseases/appendicitis/symptoms-causes",
    "vitais": "FC 102 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 118/76 mmHg · T 37,9°C",
    "hipoteseCorreta": "apendicite",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Dor abdominal que piora",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar estado geral e intensidade da dor",
        "resposta": "Dor forte, prefere ficar parada. Consciente e orientada.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "dor",
        "grupo": "Anamnese",
        "texto": "Como a dor começou e o que a piora?",
        "resposta": "Começou de repente perto do umbigo, desceu para o lado direito e piora ao andar, tossir e respirar fundo.",
        "pontos": 30,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sintomas",
        "grupo": "Anamnese",
        "texto": "Tem outros sintomas?",
        "resposta": "Perdeu o apetite e teve náusea.",
        "pontos": 20,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "abdome",
        "grupo": "Exame físico",
        "texto": "Examinar o abdome",
        "resposta": "Dor no quadrante inferior direito, que piora ao tossir.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "gravidez",
        "grupo": "Exames",
        "texto": "Fazer teste de gravidez",
        "resposta": "Teste negativo.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 5
      },
      {
        "id": "urina",
        "grupo": "Exames",
        "texto": "Fazer exame de urina",
        "resposta": "Sem sinais de infecção urinária.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 15
      },
      {
        "id": "tomografia-direta",
        "grupo": "Exames",
        "texto": "Pedir tomografia antes do teste de gravidez",
        "resposta": "Erro de sequência: em mulher em idade fértil, o teste de gravidez vem antes da tomografia, porque a radiação pode prejudicar o feto.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 30
      },
      {
        "id": "apendicite",
        "grupo": "Hipóteses",
        "texto": "Registrar apendicite aguda como hipótese principal",
        "resposta": "Hipótese registrada: dor que começa no umbigo e migra para a direita, com perda de apetite e náusea.",
        "pontos": 40,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "gastroenterite",
        "grupo": "Hipóteses",
        "texto": "Registrar gastroenterite como hipótese principal",
        "resposta": "Hipótese registrada, mas a dor localizada que migrou não combina com gastroenterite.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "itu",
        "grupo": "Hipóteses",
        "texto": "Registrar infecção urinária como hipótese principal",
        "resposta": "Hipótese registrada, mas o exame de urina não mostrou infecção.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "cirurgiao",
        "grupo": "Conduta",
        "texto": "Solicitar avaliação do cirurgião no hospital de referência",
        "resposta": "Avaliação cirúrgica solicitada.",
        "pontos": 35,
        "criterio": "seguranca",
        "minutos": 2,
        "exige": [
          "abdome"
        ]
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Rever sinais vitais e dor antes da transferência",
        "resposta": "Dor mantida. FC 100 bpm, FR 18 irpm, SpO₂ 98% em ar ambiente, PA 118/76 mmHg, T 37,9°C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 10,
        "exige": [
          "gravidade"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. Apendicite é emergência e precisa de avaliação e tratamento imediatos.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente encaminhada ao hospital de referência para avaliação cirúrgica.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "dor",
      "abdome",
      "gravidez",
      "apendicite",
      "cirurgiao"
    ]
  },
  {
    "id": "neuro-meningite-1",
    "versao": 1,
    "sistema": "Neurológico",
    "revisado": true,
    "titulo": "Febre alta e dor de cabeça forte",
    "paciente": "Gabriel, 19 anos",
    "queixa": "\"Estou com febre alta, uma dor de cabeça muito forte e vomitei desde a madrugada.\"",
    "fonte": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/m/meningite",
    "vitais": "FC 118 bpm · FR 22 irpm · SpO₂ 97% em ar ambiente · PA 108/66 mmHg · T 39,4°C",
    "hipoteseCorreta": "meningite",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Grave: suspeita de infecção do sistema nervoso",
    "acoes": [
      {
        "id": "gravidade",
        "grupo": "Avaliação",
        "texto": "Avaliar consciência e sinais de gravidade",
        "resposta": "Sonolento, mas responde. Sem convulsões.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "meningeo",
        "grupo": "Exame físico",
        "texto": "Examinar pescoço e sensibilidade à luz",
        "resposta": "Rigidez de nuca e incômodo com a luz.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "pele",
        "grupo": "Exame físico",
        "texto": "Procurar manchas na pele",
        "resposta": "Manchas vermelho-arroxeadas no tronco e nas pernas.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "contatos",
        "grupo": "Anamnese",
        "texto": "Com quem mora e teve contato próximo?",
        "resposta": "Mora numa república com outros quatro estudantes.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "alergias",
        "grupo": "Anamnese",
        "texto": "Tem alergia a medicamentos?",
        "resposta": "Nega alergias.",
        "pontos": 10,
        "criterio": "seguranca",
        "minutos": 1
      },
      {
        "id": "esperar-liquor",
        "grupo": "Exames",
        "texto": "Aguardar a punção lombar e o resultado do líquor antes de tratar",
        "resposta": "Inseguro: o início do tratamento não deve ser atrasado pelos exames que identificam o agente.",
        "pontos": -20,
        "criterio": "eficiencia",
        "minutos": 60
      },
      {
        "id": "meningite",
        "grupo": "Hipóteses",
        "texto": "Registrar meningite (provável bacteriana) como hipótese principal",
        "resposta": "Hipótese registrada: febre, dor de cabeça forte, vômitos, rigidez de nuca e manchas na pele.",
        "pontos": 50,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "enxaqueca",
        "grupo": "Hipóteses",
        "texto": "Registrar enxaqueca como hipótese principal",
        "resposta": "Hipótese registrada, mas febre, rigidez de nuca e manchas na pele não são de enxaqueca.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "dengue",
        "grupo": "Hipóteses",
        "texto": "Registrar dengue como hipótese principal",
        "resposta": "Hipótese registrada, mas rigidez de nuca com sonolência aponta para meningite.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "tratamento",
        "grupo": "Conduta",
        "texto": "Iniciar o tratamento da meningite conforme protocolo, sem esperar os exames",
        "resposta": "Equipe inicia o tratamento com antibiótico e cuidados de suporte.",
        "pontos": 40,
        "criterio": "seguranca",
        "minutos": 5,
        "exige": [
          "gravidade",
          "alergias"
        ],
        "estadoPaciente": "Em tratamento, aguarda transferência"
      },
      {
        "id": "reavaliar",
        "grupo": "Evolução",
        "texto": "Reavaliar depois das primeiras medidas",
        "resposta": "Mantém-se sonolento, sem convulsões. FC 112 bpm, FR 22 irpm, SpO₂ 97% em ar ambiente, PA 110/68 mmHg, T 38,8°C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 20,
        "exige": [
          "tratamento"
        ]
      },
      {
        "id": "comunicar",
        "grupo": "Conduta",
        "texto": "Comunicar ao hospital de destino e registrar os contatos próximos",
        "resposta": "Hospital avisado. Contatos da república registrados para as ações de vigilância.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "contatos"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Alta registrada. A meningite é emergência médica: todo caso suspeito deve ser internado.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Paciente transferido para internação, com o tratamento já iniciado.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "gravidade",
      "meningeo",
      "pele",
      "meningite",
      "tratamento",
      "comunicar"
    ]
  },
  {
    "id": "pdx-dengue-a",
    "versao": 1,
    "revisado": true,
    "sistema": "Infeccioso",
    "titulo": "Dengue sem sinais de alarme (grupo A)",
    "paciente": "Rafael, 26 anos",
    "queixa": "Febre alta há 3 dias, dor atrás dos olhos e o corpo todo doendo.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 88 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 118/76 mmHg · T 38,6°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c2",
      "c3",
      "c5",
      "c7"
    ],
    "estadoInicial": "Febril, em atendimento ambulatorial",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Quantos dias de febre e como foi a curva?",
        "resposta": "Três dias, sempre alta, sem períodos sem febre.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Tem sangramento no nariz, gengiva ou nas fezes?",
        "resposta": "Nenhum sangramento.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Alguém perto de você está com o mesmo quadro?",
        "resposta": "Dois vizinhos e uma colega do curso.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Sente dor forte na barriga, vomita muito ou fica tonto ao levantar?",
        "resposta": "Nada disso. Só enjoo leve.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Tem doença crônica ou usa AAS, anticoagulante ou anti-inflamatório?",
        "resposta": "Nega doenças. Tomou só paracetamol.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Sinais vitais",
        "resposta": "PA 118×76 mmHg sem queda ao levantar, FC 88, T 38,6 °C. Sem hipotensão postural.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "laco",
        "grupo": "Exames",
        "texto": "Prova do laço",
        "resposta": "Negativa. Sem petéquias nem sangramento espontâneo.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "hemo",
        "grupo": "Exames",
        "texto": "Hemograma (valores ilustrativos)",
        "resposta": "Hematócrito 43%, plaquetas 168 mil, leucócitos 3.800. Sem hemoconcentração.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "sorol",
        "grupo": "Exames",
        "texto": "Sorologia / isolamento viral",
        "resposta": "Coletada. Resultado sai em alguns dias; não muda a conduta de hoje.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Dengue como hipótese principal",
        "resposta": "Hipótese registrada: Febre aguda de até 7 dias com 2 ou mais sintomas inespecíficos e vínculo epidemiológico.",
        "pontos": 25,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Influenza como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem sintomas respiratórios. Influenza está entre os diferenciais, mas o contexto aponta para dengue.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Malária como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem passagem por área de transmissão e sem febre em ciclos.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Leptospirose como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem exposição a enchente, lama ou esgoto nos últimos 30 dias.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Classificar como grupo A e tratar em ambulatório",
        "resposta": "Sem sinais de alarme, prova do laço negativa e sem condição especial.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Hidratação oral: 80 ml/kg/dia, com 1/3 de soro de reidratação",
        "resposta": "É a conduta do grupo A.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Paracetamol ou dipirona para febre e dor",
        "resposta": "Sintomáticos recomendados.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Ibuprofeno ou AAS para a dor no corpo",
        "resposta": "Salicilatos e anti-inflamatórios podem causar ou agravar sangramentos.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Orientar sinais de alarme e retorno entre o 3º e o 6º dia",
        "resposta": "A febre ceder marca o início da fase crítica.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Internar para hidratação venosa",
        "resposta": "Sem sinal de alarme, não há indicação.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c7",
        "grupo": "Conduta",
        "texto": "Notificar o caso suspeito",
        "resposta": "Todo caso suspeito é de notificação.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "laco",
      "hemo",
      "c1",
      "c2",
      "c3",
      "c5",
      "c7",
      "h1"
    ],
    "aprendizado": "Febre de até 7 dias com dor retro-orbitária, mialgia e vínculo epidemiológico sugere dengue. Sem alarme e sem risco, o tratamento é hidratação, paracetamol ou dipirona e retorno atento na hora em que a febre cede. AAS e anti-inflamatórios ficam de fora.",
    "alerta": {
      "nome": "Fase crítica",
      "quando": "Quando a febre cede, entre o 3º e o 6º dia",
      "resposta": "Retorno imediato se surgir sinal de alarme",
      "porque": "Os sinais de alarme costumam aparecer na remissão da febre, por isso o paciente precisa saber reconhecê-los."
    },
    "notificar": "Notificação de caso suspeito de dengue.",
    "referencias": [
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 15,
        "sobre": "Definição de caso suspeito."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 21,
        "sobre": "Diagnósticos diferenciais da síndrome febril."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 24,
        "sobre": "Critérios do grupo A."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 24,
        "sobre": "Alarme na fase de remissão da febre."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 27,
        "sobre": "Hidratação oral de adultos."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 28,
        "sobre": "AAS contraindicado."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 30,
        "sobre": "Retorno entre o 3º e o 6º dia."
      }
    ]
  },
  {
    "id": "pdx-malaria-vivax",
    "versao": 1,
    "revisado": true,
    "sistema": "Infeccioso",
    "titulo": "Malária por Plasmodium vivax",
    "paciente": "Tiago, 35 anos",
    "queixa": "Calafrios, febre e suor que vêm e vão, com muita dor de cabeça.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 104 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 110/70 mmHg · T 39,2°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c2",
      "c5",
      "c6"
    ],
    "estadoInicial": "Febril, com baço palpável",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "De onde o senhor voltou ou onde trabalha?",
        "resposta": "Voltou há 15 dias de uma comunidade ribeirinha, onde pescava.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Como é a febre?",
        "resposta": "Vem com calafrio, sobe muito e depois dá um suor profuso. Dia sim, dia não.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Já teve malária antes?",
        "resposta": "Teve uma vez, há dois anos.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Tem vômitos, sonolência, convulsão ou urina escura?",
        "resposta": "Nada disso. Come e bebe normalmente.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Pode estar grávido ou tomando algum remédio de uso contínuo?",
        "resposta": "Paciente do sexo masculino, sem remédios.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "gota",
        "grupo": "Exames",
        "texto": "Gota espessa",
        "resposta": "Trofozoítos de Plasmodium vivax. Parasitemia baixa.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "tr",
        "grupo": "Exames",
        "texto": "Teste rápido",
        "resposta": "Positivo para outra espécie que não P. falciparum.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "hemo",
        "grupo": "Exames",
        "texto": "Hemograma (valores ilustrativos)",
        "resposta": "Anemia leve e plaquetas em 110 mil.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Exame físico",
        "resposta": "T 39,2 °C, esplenomegalia palpável, sem icterícia.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Malária por P. vivax como hipótese principal",
        "resposta": "Hipótese registrada: Febre em ciclos de 48 h, exposição na Amazônia, gota espessa positiva e incubação compatível.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Dengue como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Febre sem periodicidade típica; a gota espessa fecha o diagnóstico de malária.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Leptospirose como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem enchente ou contato com urina de roedor; sem icterícia nem sufusão conjuntival.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Febre tifoide como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem diarreia nem história que sustente; o parasito na gota espessa resolve.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Confirmar pela gota espessa antes de tratar",
        "resposta": "É o método oficial de diagnóstico no Brasil.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Cloroquina por 3 dias e primaquina por 7 dias",
        "resposta": "É o esquema para P. vivax: a cloroquina age no sangue e a primaquina nos hipnozoítos.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Só cloroquina e dar alta",
        "resposta": "Sem a primaquina, os hipnozoítos no fígado causam recaídas.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Artemeter + lumefantrina",
        "resposta": "É o esquema de primeira escolha para P. falciparum.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Suspender a primaquina se surgir icterícia",
        "resposta": "Orientação de segurança do esquema.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Notificar o caso",
        "resposta": "Malária é de notificação.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p4",
      "gota",
      "c1",
      "c2",
      "c5",
      "c6",
      "h1"
    ],
    "aprendizado": "Febre com calafrios em ciclos de 48 horas depois de estadia na Amazônia exige gota espessa. No P. vivax, tratar só o sangue deixa os hipnozoítos e a recaída: o esquema completo une cloroquina e primaquina.",
    "alerta": {
      "nome": "Hipnozoítos",
      "quando": "Depois que o sangue já foi tratado",
      "resposta": "Primaquina: cura radical",
      "porque": "No P. vivax, formas dormentes no fígado causam recaídas tardias; o tratamento precisa atingi-las."
    },
    "notificar": "Notificação compulsória de malária.",
    "referencias": [
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 101,
        "sobre": "Quadro clássico: calafrio, febre, suor, cefaleia em ciclos."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 101,
        "sobre": "Ciclo de 48 h em P. vivax e P. falciparum."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 103,
        "sobre": "Incubação do P. vivax: 13 a 17 dias."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 105,
        "sobre": "Gota espessa é o método oficial."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 106,
        "sobre": "Objetivo de eliminar hipnozoítos do P. vivax."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 108,
        "sobre": "Esquema cloroquina 3 dias + primaquina 7 dias."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 108,
        "sobre": "Primaquina contraindicada em gestantes e menores de 6 meses."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 109,
        "sobre": "Artemeter + lumefantrina é para P. falciparum."
      }
    ]
  },
  {
    "id": "pdx-leptospirose",
    "versao": 1,
    "revisado": true,
    "sistema": "Infeccioso",
    "titulo": "Leptospirose",
    "paciente": "Seu Jorge, 44 anos",
    "queixa": "Febre de início brusco, dor muscular forte e olhos muito vermelhos.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 98 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 120/80 mmHg · T 38,9°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c3",
      "c4",
      "c5"
    ],
    "estadoInicial": "Febril, sem icterícia",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Teve contato com água de enchente, lama ou esgoto?",
        "resposta": "Limpou a casa depois da cheia e pisou em lama sem botas.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Trabalha com lixo ou entulho?",
        "resposta": "Cata material reciclável perto de um córrego.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Notou a pele ou os olhos amarelados?",
        "resposta": "Ainda não.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Mudou a quantidade de urina? Tem falta de ar ou tosse com sangue?",
        "resposta": "Urina normal. Sem falta de ar.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Já tomou algum antibiótico?",
        "resposta": "Não.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Sinais vitais",
        "resposta": "T 38,9 °C, FC 98, PA 120×80. Sem icterícia.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "hemo",
        "grupo": "Exames",
        "texto": "Hemograma (valores ilustrativos)",
        "resposta": "Leucocitose com neutrofilia e plaquetas em 98 mil.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "bioq",
        "grupo": "Exames",
        "texto": "Ureia, creatinina, bilirrubina, CPK, K⁺",
        "resposta": "Ureia e creatinina no limite superior, bilirrubina normal, CPK elevada, potássio 3,3 mEq/L.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "elisa",
        "grupo": "Exames",
        "texto": "ELISA-IgM (coletado hoje, 4º dia)",
        "resposta": "Não reagente. Amostra colhida antes do 7º dia não descarta o caso.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Leptospirose (fase precoce) como hipótese principal",
        "resposta": "Hipótese registrada: Febre, mialgia e sufusão conjuntival com exposição a lama de enchente.",
        "pontos": 45,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Dengue como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Também causa febre e dor no corpo, mas a exposição de risco aponta para lepto; ambas entram no diferencial.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Hepatite viral aguda como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Ainda sem icterícia; mesmo depois dela, CPK elevada e hipocalemia ajudam a diferenciar.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Malária como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem passagem por área de transmissão.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Iniciar antibiótico oral já: doxiciclina 100 mg de 12/12 h por 5 a 7 dias ou amoxicilina",
        "resposta": "Na fase precoce, o tratamento não espera a sorologia.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Aguardar o ELISA positivo para tratar",
        "resposta": "Resultado negativo antes do 7º dia não descarta e atrasa o tratamento.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Colher nova amostra a partir do 7º dia",
        "resposta": "Para interpretar a sorologia.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Notificar o caso suspeito",
        "resposta": "Doença de notificação compulsória.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Orientar sinais de gravidade e retorno: icterícia, diminuição da urina, falta de ar",
        "resposta": "Cerca de 15% evoluem para forma grave após a primeira semana.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Prescrever só sintomáticos e liberar",
        "resposta": "Perde a janela do tratamento precoce.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "bioq",
      "elisa",
      "c1",
      "c3",
      "c4",
      "c5",
      "h1"
    ],
    "aprendizado": "Febre abrupta, mialgia e sufusão conjuntival depois de contato com lama de enchente são leptospirose até prova em contrário. Trata-se já, sem esperar a sorologia, e orienta-se a procurar o serviço se surgir icterícia, redução da urina ou falta de ar.",
    "alerta": {
      "nome": "Síndrome de Weil",
      "quando": "Depois da primeira semana, em cerca de 15% dos casos",
      "resposta": "Penicilina cristalina IV, hidratação e diálise precoce se preciso",
      "porque": "Icterícia rubínica, insuficiência renal e hemorragia (às vezes pulmonar) exigem internação e antibiótico venoso por pelo menos 7 dias."
    },
    "notificar": "Notificação compulsória de leptospirose.",
    "referencias": [
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 284,
        "sobre": "Fase tardia: síndrome de Weil."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 284,
        "sobre": "Icterícia rubínica."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 286,
        "sobre": "IRA não oligúrica e hipocalêmica."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 287,
        "sobre": "Hipocalemia ajuda no diagnóstico diferencial."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 288,
        "sobre": "Doxiciclina na fase precoce."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 288,
        "sobre": "Penicilina cristalina na fase tardia."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 288,
        "sobre": "Diálise peritoneal precoce."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 289,
        "sobre": "Antecedentes epidemiológicos: enchentes e lama."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 289,
        "sobre": "Sufusão conjuntival como critério clínico."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 289,
        "sobre": "Notificação compulsória."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 290,
        "sobre": "Sorologia negativa antes do 7º dia não descarta."
      }
    ]
  },
  {
    "id": "pdx-hanseniase",
    "versao": 1,
    "revisado": true,
    "sistema": "Infeccioso",
    "titulo": "Hanseníase paucibacilar",
    "paciente": "Dona Neide, 52 anos",
    "queixa": "Mancha clara no braço que não coça, com a pele ‘dormente’.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 76 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 126/80 mmHg · T 36,5°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c3",
      "c4",
      "c6"
    ],
    "estadoInicial": "Estável, com lesões na pele",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Quanto tempo tem a mancha e ela coça ou dói?",
        "resposta": "Oito meses. Não coça, não dói.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Sente a pele da mancha igual à pele normal?",
        "resposta": "Parece dormente, não sente quente nem frio ali.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Alguém na família ou na vizinhança teve doença parecida?",
        "resposta": "Um cunhado que morou na casa dela fez tratamento longo anos atrás.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Tem fraqueza na mão, dor nos nervos ou feridas sem dor?",
        "resposta": "Fraqueza leve para segurar a enxada.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Já usou algum remédio para a mancha?",
        "resposta": "Pomada de fungo, sem melhora.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "dermato",
        "grupo": "Exame físico",
        "texto": "Exame dermatoneurológico",
        "resposta": "Três lesões hipocrômicas com perda da sensibilidade térmica e dolorosa. Nervo ulnar direito espessado e doloroso à palpação.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "bacilo",
        "grupo": "Exames",
        "texto": "Baciloscopia de pele",
        "resposta": "Negativa. Não exclui hanseníase.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "incap",
        "grupo": "Exame físico",
        "texto": "Avaliação de incapacidades",
        "resposta": "Força da mão preservada, grau 0, sensibilidade alterada na área da lesão.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Hanseníase como hipótese principal",
        "resposta": "Hipótese registrada: Lesões com alteração de sensibilidade e nervo periférico espessado: critérios clínicos.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Vitiligo como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Mancha clara sem alteração de sensibilidade; está entre os diferenciais.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Pitiríase versicolor como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Descamação fina e sem perda de sensibilidade.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Dermatofitose (tinha) como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Costuma coçar e tem borda ativa; não explica nervo espessado.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Classificar como paucibacilar (até 5 lesões) e iniciar poliquimioterapia",
        "resposta": "Classificação operacional pelo número de lesões: 6 cartelas no esquema PB.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Esperar baciloscopia positiva para tratar",
        "resposta": "O diagnóstico é clínico, e baciloscopia negativa não exclui.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Tratar na unidade básica, em regime ambulatorial",
        "resposta": "O tratamento é ambulatorial.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Examinar os contatos domiciliares",
        "resposta": "Investigação de contatos é parte da descoberta de casos.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Afastar a paciente do convívio e do trabalho",
        "resposta": "Não é necessário e alimenta estigma; a transmissão cai com o início do tratamento.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Notificar e acompanhar a prevenção de incapacidades",
        "resposta": "Notificação e avaliação neurológica fazem parte do cuidado.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "dermato",
      "bacilo",
      "c1",
      "c3",
      "c4",
      "c6",
      "h1"
    ],
    "aprendizado": "Mancha com perda de sensibilidade e nervo espessado é hanseníase: o diagnóstico é clínico e a baciloscopia negativa não exclui. Até 5 lesões é paucibacilar. Trata-se na unidade básica, examina-se os contatos e fica-se atento às reações, que causam as incapacidades.",
    "alerta": {
      "nome": "Reação hansênica",
      "quando": "Antes, durante ou depois da poliquimioterapia",
      "resposta": "Prednisona 1 a 2 mg/kg/dia e manter a PQT",
      "porque": "Novas lesões, dor e espessamento de nervo indicam reação. Ela não interrompe a PQT e é a principal causa de incapacidades."
    },
    "notificar": "Notificação compulsória de hanseníase.",
    "referencias": [
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 209,
        "sobre": "Critério: lesão de pele com alteração de sensibilidade."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 209,
        "sobre": "Paucibacilar: até 5 lesões."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 209,
        "sobre": "Baciloscopia negativa não exclui."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 209,
        "sobre": "Vitiligo no diagnóstico diferencial."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 210,
        "sobre": "Tratamento ambulatorial."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 210,
        "sobre": "Reações causam incapacidades."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 211,
        "sobre": "Esquema PB: 6 cartelas."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 213,
        "sobre": "Reação não contraindica a PQT."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 214,
        "sobre": "Prednisona na reação tipo 1."
      },
      {
        "fonte": "Caderno de Atenção Básica nº 21 (MS, 2008)",
        "pag": 92,
        "sobre": "Investigação de contatos."
      }
    ]
  },
  {
    "id": "pdx-tuberculose",
    "versao": 1,
    "revisado": true,
    "sistema": "Respiratório",
    "titulo": "Tuberculose pulmonar",
    "paciente": "Seu Carlos, 38 anos",
    "queixa": "Tosse com catarro há 4 semanas, febrícula à tarde e emagrecimento.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 92 bpm · FR 20 irpm · SpO₂ 95% em ar ambiente · PA 110/70 mmHg · T 37,8°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c2",
      "c3",
      "c4"
    ],
    "estadoInicial": "Emagrecido, com tosse persistente",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Há quanto tempo tosse e expectora?",
        "resposta": "Quatro semanas, sem melhora com xarope.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Tem febre, suor noturno ou perdeu peso?",
        "resposta": "Febre baixa à tarde, suor à noite e 6 kg a menos.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Já teve sangue no catarro?",
        "resposta": "Uma vez, em fio.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Alguém em casa ou no trabalho tem tosse prolongada ou tratou tuberculose?",
        "resposta": "Um colega de trabalho foi diagnosticado há dois meses.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Já fez tratamento para tuberculose?",
        "resposta": "Nunca.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Exame físico",
        "resposta": "T 37,8 °C, emagrecido, estertores em ápice direito.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "baar",
        "grupo": "Exames",
        "texto": "Baciloscopia de escarro (2 amostras)",
        "resposta": "Positiva em ambas: bacilos álcool-ácido resistentes.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "rx",
        "grupo": "Exames",
        "texto": "Radiografia de tórax",
        "resposta": "Infiltrado com cavidade em ápice direito (ilustrativo).",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "cult",
        "grupo": "Exames",
        "texto": "Cultura de escarro",
        "resposta": "Colhida. Indicada em suspeita de resistência ou baciloscopia negativa.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Tuberculose pulmonar como hipótese principal",
        "resposta": "Hipótese registrada: Sintomático respiratório (tosse por 3 semanas ou mais), sintomas gerais e baciloscopia positiva.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Pneumonia bacteriana comum como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Início agudo e resposta a antibiótico; aqui são 4 semanas sem melhora e sintomas constitucionais.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Neoplasia pulmonar como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Entra no diferencial, mas a baciloscopia positiva confirma tuberculose.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Bronquite aguda como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Não dura 4 semanas com febre vespertina e emagrecimento.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Pedir baciloscopia de 2 amostras: uma na consulta e outra na manhã seguinte",
        "resposta": "É o método prioritário para todo sintomático respiratório.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Esquema básico: 2 meses de RHZE seguidos de 4 meses de RH",
        "resposta": "Para adultos e adolescentes.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Tratamento diretamente observado",
        "resposta": "Aumenta a adesão e a cura.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Examinar os contatos",
        "resposta": "Contatos de TB bacilífera devem ser investigados.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Esquema com 3 drogas (RHZ) por ser a primeira vez",
        "resposta": "Esse é o esquema de crianças menores de 10 anos.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Antibiótico comum por 2 semanas e reavaliar",
        "resposta": "Atrasa o diagnóstico e mantém a transmissão.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p4",
      "baar",
      "c1",
      "c2",
      "c3",
      "c4",
      "h1"
    ],
    "aprendizado": "Tosse por 3 semanas ou mais obriga a pensar em tuberculose: duas baciloscopias, esquema RHZE por 2 meses e RH por 4, tratamento observado e exame dos contatos. A transmissão cai em poucos dias ou semanas de tratamento.",
    "alerta": {
      "nome": "Abandono do tratamento",
      "quando": "Quando os sintomas melhoram, em 2 a 4 semanas",
      "resposta": "Tratamento diretamente observado",
      "porque": "Melhorar não significa curar. Interromper antes de 6 meses favorece recaída e resistência."
    },
    "notificar": "Notificação compulsória de tuberculose.",
    "referencias": [
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 412,
        "sobre": "Tosse produtiva é o sintoma mais frequente."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 412,
        "sobre": "Febre vespertina, sudorese, emagrecimento."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 413,
        "sobre": "Sintomático respiratório: tosse por três semanas ou mais."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 413,
        "sobre": "Baciloscopia também nos contatos de bacilíferos."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 414,
        "sobre": "Duas amostras de escarro."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 417,
        "sobre": "DOTS."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 417,
        "sobre": "RHZE por 2 meses, RH por 4."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 417,
        "sobre": "Crianças: RHZ na 1ª fase."
      },
      {
        "fonte": "Guia de bolso de doenças infecciosas (MS, 2010)",
        "pag": 418,
        "sobre": "Esquema básico 2RHZE/4RH."
      }
    ]
  },
  {
    "id": "pdx-iamcsst",
    "versao": 1,
    "revisado": true,
    "sistema": "Cardiovascular",
    "titulo": "Infarto com supra de ST (IAMCSST)",
    "paciente": "Seu Antônio, 58 anos",
    "queixa": "Dor em aperto no meio do peito há 40 minutos, com suor frio.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 96 bpm · FR 20 irpm · SpO₂ 96% em ar ambiente · PA 150/90 mmHg · T 36,6°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Com dor no peito; o tempo é decisivo",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "A dor muda ao respirar ou ao mexer o tronco?",
        "resposta": "Não. É um aperto constante, que não alivia em repouso.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Começou quando e o que fazia?",
        "resposta": "Há 40 minutos, subindo escada.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Tem hipertensão, diabetes, cigarro ou familiar com infarto?",
        "resposta": "Hipertenso, fuma 20 cigarros por dia, pai morreu de infarto.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "A dor é rasgante, de início súbito em dorso, ou a pressão difere entre os braços?",
        "resposta": "Pressão igual nos dois braços. Não é rasgante.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Usou algum anticoagulante ou teve sangramento recente?",
        "resposta": "Nega.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Sinais vitais",
        "resposta": "PA 150×90 mmHg, FC 96, SpO₂ 96% em ar ambiente.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "ecg",
        "grupo": "Exames",
        "texto": "ECG em até 10 minutos",
        "resposta": "Supradesnivelamento do ST em V2 a V5, em pelo menos duas derivações contíguas.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "trop",
        "grupo": "Exames",
        "texto": "Troponina",
        "resposta": "Colhida. Não se espera o resultado para decidir a reperfusão.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "rx",
        "grupo": "Exames",
        "texto": "Radiografia de tórax",
        "resposta": "Mediastino de contorno normal. Sem sinais de congestão.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Infarto com supra de ST como hipótese principal",
        "resposta": "Hipótese registrada: Dor típica com supradesnivelamento do ST em derivações contíguas.",
        "pontos": 55,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Dissecção de aorta como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem dor rasgante, sem assimetria de pulso nem de pressão.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Embolia pulmonar como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem dor pleurítica nem fator de risco para trombose.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Pericardite como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. A dor da pericardite é pleurítica e posicional.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Fazer o ECG em até 10 minutos da chegada",
        "resposta": "Meta da diretriz para dor torácica.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Dar AAS mastigado imediatamente",
        "resposta": "162 a 325 mg na apresentação.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Reperfusão: ICP primária se disponível no tempo; senão fibrinólise em até 30 min",
        "resposta": "O tempo de contato até a reperfusão define a estratégia.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Aguardar a troponina para decidir o tratamento",
        "resposta": "Com ECG diagnóstico, segue-se direto a rota terapêutica.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Analgesia com morfina IV em pequenas doses",
        "resposta": "2 a 4 mg, repetidas conforme a dor.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Pedir teste ergométrico para estratificar",
        "resposta": "Teste de esforço é para casos de baixo risco, não para infarto em curso.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "ecg",
      "c1",
      "c2",
      "c3",
      "c5",
      "h1"
    ],
    "aprendizado": "Dor típica, ECG com supradesnivelamento em derivações contíguas feito em até 10 minutos: é infarto com supra. A decisão de reperfusão não espera troponina. Dar AAS e escolher a reperfusão de acordo com o tempo até o dispositivo.",
    "alerta": {
      "nome": "Hipotensão no infarto inferior",
      "quando": "IAM de parede inferior com veias do pescoço distendidas e pulmões limpos",
      "resposta": "ECG de derivações direitas e infusão de volume",
      "porque": "Pode ser infarto de ventrículo direito, e o tratamento é volume."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 10,
        "sobre": "Passo 1: ECG até 10 minutos; ECG diagnóstico leva à rota terapêutica."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 13,
        "sobre": "ECG nos primeiros 10 minutos."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 13,
        "sobre": "Evitar ancoramento em uma única doença."
      },
      {
        "fonte": "Harrison's Manual, 20ª ed.",
        "pag": 705,
        "sobre": "Critério de ECG para IAMCSST."
      },
      {
        "fonte": "Harrison's Manual, 20ª ed.",
        "pag": 706,
        "sobre": "AAS imediato."
      },
      {
        "fonte": "Harrison's Manual, 20ª ed.",
        "pag": 707,
        "sobre": "Fibrinolítico em até 30 min se ICP demorar."
      },
      {
        "fonte": "Harrison's Manual, 20ª ed.",
        "pag": 708,
        "sobre": "Analgesia com morfina."
      },
      {
        "fonte": "Harrison's Manual, 20ª ed.",
        "pag": 714,
        "sobre": "IAM de VD: derivações direitas e volume."
      }
    ],
    "desempenho": {
      "acao": "c1",
      "limite": 15
    },
    "agravamentos": [
      {
        "apos": 15,
        "antes": "c1",
        "vitais": {
          "fc": 112,
          "pa": "96/60",
          "spo2": 93
        },
        "estado": "Piorando: dor persistente e suor frio"
      }
    ]
  },
  {
    "id": "pdx-tep",
    "versao": 1,
    "revisado": true,
    "sistema": "Cardiovascular",
    "titulo": "Tromboembolismo pulmonar",
    "paciente": "Marina, 38 anos",
    "queixa": "Dor no peito que piora ao respirar e falta de ar de início súbito.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 112 bpm · FR 24 irpm · SpO₂ 91% em ar ambiente · PA 118/74 mmHg · T 36,9°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Com falta de ar e taquicardia",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "A dor piora ao respirar fundo?",
        "resposta": "Sim. Piora ao inspirar.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Começou de repente?",
        "resposta": "Foi de uma hora para outra, ao levantar da cama.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Fez cirurgia, ficou imobilizada ou teve trombose antes?",
        "resposta": "Imobilizou o tornozelo há 10 dias, com gesso.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "A perna está inchada ou dolorosa?",
        "resposta": "A panturrilha da perna imobilizada está mais inchada.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Tem sangramento ativo ou tomou anticoagulante?",
        "resposta": "Nega.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Sinais vitais",
        "resposta": "FC 112, FR 24, SpO₂ 91% em ar ambiente, PA 118×74 mmHg.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "ecg",
        "grupo": "Exames",
        "texto": "ECG",
        "resposta": "Taquicardia sinusal, inespecífica.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "rx",
        "grupo": "Exames",
        "texto": "Radiografia de tórax",
        "resposta": "Pequena atelectasia à direita. Sem pneumotórax.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "wells",
        "grupo": "Exames",
        "texto": "Escore de Wells",
        "resposta": "Probabilidade clínica: TEP provável (5 pontos ou mais).",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "angio",
        "grupo": "Exames",
        "texto": "Angiotomografia de artérias pulmonares",
        "resposta": "Falha de enchimento no ramo lobar inferior direito.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Tromboembolismo pulmonar como hipótese principal",
        "resposta": "Hipótese registrada: Dor pleurítica súbita, dispneia, fator de risco (imobilização) e Wells alto.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Infarto agudo do miocárdio como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. A dor é pleurítica e há fator de risco para trombose.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Dissecção de aorta como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem dor rasgante nem assimetria de pulsos.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Pneumotórax como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. O Rx não mostra pneumotórax.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Estratificar com Wells antes de decidir os exames",
        "resposta": "Os escores orientam o fluxograma diagnóstico.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Com probabilidade alta, sem sangramento: iniciar anticoagulação plena já",
        "resposta": "Em média ou alta probabilidade, a primeira dose pode ser dada antes da imagem.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Angiotomografia de artérias pulmonares",
        "resposta": "É o exame de imagem mais usado.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Descartar TEP porque o ECG só mostra taquicardia",
        "resposta": "Taquicardia sinusal, inespecífica, só aparece em cerca de 40% dos casos.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Dar alta com D-dímero e analgésico",
        "resposta": "Com alta probabilidade o D-dímero não é o caminho; a imagem é necessária.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "wells",
      "angio",
      "c1",
      "c2",
      "c3",
      "h1"
    ],
    "aprendizado": "Dor pleurítica súbita com dispneia e imobilização recente pensa em TEP. O ECG pode ser só taquicardia. O Wells define a probabilidade, a anticoagulação pode começar antes da imagem quando a probabilidade é média ou alta e não há sangramento, e a angiotomografia confirma.",
    "alerta": {
      "nome": "Instabilidade",
      "quando": "Hipotensão ou choque",
      "resposta": "Ecocardiograma à beira-leito; suspeitar de sobrecarga de VD",
      "porque": "Se a angiotomografia não puder ser feita, sobrecarga de VD ao eco serve de evidência indireta."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 14,
        "sobre": "Dor do TEP: pleurítica e súbita."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 14,
        "sobre": "Anticoagulação plena em probabilidade média ou alta, sem sangramento."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 14,
        "sobre": "D-dímero: corte de 500 ng/mL."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 31,
        "sobre": "ECG: taquicardia sinusal em cerca de 40%."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 32,
        "sobre": "TEP provável com Wells de 5 ou mais."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 34,
        "sobre": "Angiotomografia é o exame mais usado."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 27,
        "sobre": "Eco com sobrecarga de VD em instáveis sem angio."
      }
    ]
  },
  {
    "id": "pdx-dissecao-aorta",
    "versao": 1,
    "revisado": true,
    "sistema": "Cardiovascular",
    "titulo": "Dissecção aguda de aorta",
    "paciente": "Seu Raimundo, 63 anos",
    "queixa": "Dor insuportável no peito que foi para as costas, começou de repente.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 98 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 180/100 mmHg · T 36,5°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "uti",
    "criteriosAlta": [],
    "estadoInicial": "Com dor intensa e pressão diferente nos braços",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Como começou a dor?",
        "resposta": "De repente, no auge, há 1 hora.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Como é a dor?",
        "resposta": "Rasgante, vai do peito para as costas.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Tem doenças da aorta ou na família?",
        "resposta": "O irmão operou aneurisma de aorta.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Sente fraqueza em um braço, perna ou fala enrolada?",
        "resposta": "Nada.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Usa AAS ou anticoagulante?",
        "resposta": "Não.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Pressão nos dois braços",
        "resposta": "Braço direito 180×100; braço esquerdo 140×80. Pulso radial esquerdo mais fraco.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "ecg",
        "grupo": "Exames",
        "texto": "ECG",
        "resposta": "Sem supradesnivelamento de ST.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "rx",
        "grupo": "Exames",
        "texto": "Radiografia de tórax",
        "resposta": "Alargamento do mediastino.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "pocus",
        "grupo": "Exame físico",
        "texto": "POCUS à beira-leito",
        "resposta": "Flap intimal em raiz de aorta e pequeno derrame pericárdico.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Dissecção aguda de aorta como hipótese principal",
        "resposta": "Hipótese registrada: Dor abrupta, intensa e rasgante, assimetria de pulso e pressão, alargamento de mediastino.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Infarto com supra de ST como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. O ECG não tem supra, e a assimetria de pressão muda o raciocínio.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Embolia pulmonar como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Não é pleurítica nem há fator de risco.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Pericardite como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Dor da pericardite é pleurítica e posicional.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Aplicar o escore ADD-RS: mais de 1 ponto ou sinais no POCUS/Rx leva à angiotomografia de aorta",
        "resposta": "O fluxograma de síndrome aórtica aguda.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Não dar antiagregante nem anticoagulante até confirmar ou descartar",
        "resposta": "Tratar como SCA seria deletério na dissecção.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Realizar angiotomografia de aorta torácica e abdominal",
        "resposta": "Exame de imagem mais usado.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Dar AAS e heparina como ‘infarto presumido’",
        "resposta": "Antiagregante e anticoagulante estão contraindicados enquanto a dissecção não é descartada.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Descartar dissecção com D-dímero isolado",
        "resposta": "O D-dímero só entra no fluxo de baixa probabilidade; aqui a probabilidade é alta.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "sv",
      "rx",
      "pocus",
      "c1",
      "c2",
      "c3",
      "h1"
    ],
    "aprendizado": "Dor abrupta, intensa e rasgante, com assimetria de pulso ou pressão, não é para tratar como infarto. A dissecção é rara perto do IAM, mas se não for pensada, não será diagnosticada: ADD-RS, POCUS e angiotomografia, e nada de antiagregante até descartar.",
    "alerta": {
      "nome": "Letalidade precoce",
      "quando": "Sem diagnóstico",
      "resposta": "Raciocinar sobre a hipótese antes do tratamento padrão",
      "porque": "A letalidade estimada é de cerca de 50% em 48 horas, e uma conduta de SCA pode piorar o quadro."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 13,
        "sobre": "Letalidade em torno de 50% em 48 horas."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 14,
        "sobre": "Adiar antiagregante e anticoagulante."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 32,
        "sobre": "Dor de alto risco: abrupta, intensa, rasgante."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 32,
        "sobre": "Assimetria de pulso e de pressão."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 32,
        "sobre": "Alta probabilidade: angiotomografia."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 31,
        "sobre": "ADD-RS e AORTA não bastam sozinhos."
      },
      {
        "fonte": "Diretriz de dor torácica (SBC, 2025)",
        "pag": 30,
        "sobre": "Angiotomografia como exame mais usado."
      }
    ]
  },
  {
    "id": "pdx-dengue-c",
    "versao": 1,
    "revisado": true,
    "sistema": "Infeccioso",
    "titulo": "Dengue com sinais de alarme (grupo C)",
    "paciente": "Dona Marta, 47 anos",
    "queixa": "A febre passou, mas agora tem dor forte na barriga e vomita sem parar.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 108 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 110/70 mmHg · T 36,4°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Com sinais de alarme na fase crítica",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Quando acabou a febre e como vinha o quadro?",
        "resposta": "Febre alta por 4 dias, parou ontem. Hoje piorou.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Tem sangramento de gengiva, nariz ou fezes escuras?",
        "resposta": "Um pouco de sangramento na gengiva.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Quantas vezes urinou hoje?",
        "resposta": "Duas vezes, pouca quantidade.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Usou algum anti-inflamatório ou AAS?",
        "resposta": "Tomou um comprimido de ibuprofeno ontem.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Alguém com dengue na casa?",
        "resposta": "O filho teve dengue há uma semana.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Pressão deitada e em pé",
        "resposta": "Deitada 110×70; em pé 90×60 com tontura. FC 108. Hipotensão postural.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "hemo",
        "grupo": "Exames",
        "texto": "Hemograma (valores ilustrativos)",
        "resposta": "Hematócrito 49% (mulher, acima de 44%) e plaquetas 42 mil, queda abrupta.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "usg",
        "grupo": "Exames",
        "texto": "Ultrassonografia de abdome",
        "resposta": "Pequena quantidade de líquido livre e espessamento da parede da vesícula.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "lab",
        "grupo": "Exames",
        "texto": "Albumina e transaminases",
        "resposta": "Albumina baixa e transaminases elevadas.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Dengue com sinais de alarme (grupo C) como hipótese principal",
        "resposta": "Hipótese registrada: Alarme na fase de remissão da febre, hemoconcentração e plaquetopenia progressiva.",
        "pontos": 45,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Abdome agudo cirúrgico como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Faz parte do diferencial de dor abdominal na dengue, mas hemoconcentração e plaquetas em queda apontam para dengue.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Gastroenterite viral como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Não explicaria hemoconcentração e queda abrupta de plaquetas.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Leptospirose como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem exposição de risco; o contexto epidemiológico é de dengue.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Hidratação venosa imediata: 20 ml/kg/h por 2 horas, soro fisiológico ou Ringer",
        "resposta": "Fase de expansão do grupo C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Reavaliar clínica e hematócrito após 2 horas",
        "resposta": "Define se repete a expansão.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Manter em leito de internação por pelo menos 48 horas",
        "resposta": "Para o grupo C.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Notificar imediatamente",
        "resposta": "Forma com sinal de alarme exige notificação imediata.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Prescrever anti-inflamatório para a dor abdominal",
        "resposta": "AINEs aumentam o risco de sangramento.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Dar soro oral e liberar para casa",
        "resposta": "Com alarme, hidratação oral domiciliar é insuficiente.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "sv",
      "hemo",
      "usg",
      "c1",
      "c2",
      "c3",
      "c4",
      "h1"
    ],
    "aprendizado": "Na dengue, o alarme costuma aparecer quando a febre cede. Dor abdominal intensa, vômitos persistentes, hipotensão postural, hematócrito subindo e plaquetas caindo pedem hidratação venosa rápida, reavaliação em 2 horas e internação. Nada de anti-inflamatório.",
    "alerta": {
      "nome": "Resposta inadequada",
      "quando": "Sem melhora depois de 3 fases de expansão",
      "resposta": "Conduzir como grupo D",
      "porque": "Persistindo choque ou hematócrito em ascensão, passa-se à conduta do grupo D, em terapia intensiva."
    },
    "notificar": "Notificação imediata.",
    "referencias": [
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 21,
        "sobre": "Dor abdominal entra no diferencial da dengue."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 25,
        "sobre": "Queda progressiva de plaquetas como alarme."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 31,
        "sobre": "Hematócrito para mulheres: acima de 44%."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 32,
        "sobre": "Grupo C: presença de algum sinal de alarme."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 33,
        "sobre": "Lista de sinais de alarme."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 34,
        "sobre": "Expansão: 20 ml/kg/h por 2 h."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 34,
        "sobre": "Internação por no mínimo 48 h."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 34,
        "sobre": "Resposta inadequada: conduzir como grupo D."
      },
      {
        "fonte": "Manual de dengue (MS, 2013)",
        "pag": 34,
        "sobre": "Notificar imediatamente."
      }
    ],
    "desempenho": {
      "acao": "c1",
      "limite": 40
    },
    "agravamentos": [
      {
        "apos": 30,
        "antes": "c1",
        "vitais": {
          "fc": 124,
          "pa": "90/60"
        },
        "estado": "Piorando: queda da pressão"
      }
    ]
  },
  {
    "id": "pdx-escorpionismo",
    "versao": 1,
    "revisado": true,
    "sistema": "Zoonoses e acidentes por animais",
    "titulo": "Escorpionismo moderado",
    "paciente": "Lucas, 5 anos",
    "queixa": "Foi picado por escorpião, com dor forte e agora vomita e está agitado.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 138 bpm · FR 32 irpm · SpO₂ 96% em ar ambiente · PA 100/60 mmHg · T 36,8°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "observacao",
    "criteriosAlta": [],
    "estadoInicial": "Com sudorese e salivação",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Viu o animal ou onde foi a picada?",
        "resposta": "Estava dentro de um tênis, no quintal. Era amarelo.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Há quanto tempo foi?",
        "resposta": "Duas horas.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Quais sintomas apareceram depois?",
        "resposta": "Vômitos, suor, babando mais que o normal e muito agitado.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Falta de ar, tosse ou rebaixamento da consciência?",
        "resposta": "Sem falta de ar. Acordado e agitado.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Tem alergia a soros ou algum problema de saúde?",
        "resposta": "Nenhum.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Sinais vitais",
        "resposta": "FC 138, FR 32, PA 100×60, T 36,8 °C. Sudorese, sialorreia.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "ecg",
        "grupo": "Exames",
        "texto": "ECG",
        "resposta": "Taquicardia sinusal com alteração de repolarização ventricular.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "rx",
        "grupo": "Exames",
        "texto": "Radiografia de tórax",
        "resposta": "Área cardíaca normal, sem edema pulmonar.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "lab",
        "grupo": "Exames",
        "texto": "Glicemia, CPK-MB, eletrólitos",
        "resposta": "Hiperglicemia leve e CPK-MB discretamente elevada.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Escorpionismo moderado como hipótese principal",
        "resposta": "Hipótese registrada: Dor local intensa com manifestações sistêmicas: vômitos, sudorese, sialorreia, agitação, taquicardia.",
        "pontos": 55,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Acidente por aranha-armadeira (Phoneutria) como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Provoca quadro parecido, mas o animal foi visto: era um escorpião.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Gastroenterite com desidratação como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Não explicaria a picada, a sudorese e as alterações cardíacas.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Intoxicação medicamentosa como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem exposição; o evento tem causa identificada.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Analgesia: lidocaína 2% sem vasoconstritor ou dipirona 10 mg/kg",
        "resposta": "A dor é o principal sintoma.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Soro antiescorpiônico, 2 a 3 ampolas IV",
        "resposta": "É o específico para o quadro moderado.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Monitorar por horas: pode virar grave",
        "resposta": "Em crianças, a evolução é rápida.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Fazer teste cutâneo de sensibilidade antes do soro",
        "resposta": "Não é recomendado: tem baixo valor preditivo e atrasa a soroterapia.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Só analgésico, porque ‘é só uma picada’",
        "resposta": "O quadro é moderado e a criança tem maior risco de gravidade.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Notificar o acidente",
        "resposta": "Escorpionismo é de notificação.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "ecg",
      "c1",
      "c2",
      "c3",
      "c6",
      "h1"
    ],
    "aprendizado": "Em criança, picada de escorpião com sinais sistêmicos é quadro moderado ou grave e não é ‘só dor’. Trata-se a dor, classifica-se pela gravidade e dá-se o soro específico, sem teste cutâneo. A evolução pode ser rápida.",
    "alerta": {
      "nome": "Evolução para grave",
      "quando": "Em poucas horas, sobretudo em menores de 7 anos",
      "resposta": "Mais ampolas (4 a 6) e suporte vital",
      "porque": "Vômitos profusos, prostração, convulsão, bradicardia, edema pulmonar ou choque classificam como grave."
    },
    "notificar": "Notificação de acidente por animal peçonhento.",
    "referencias": [
      {
        "fonte": "Boletim de escorpionismo (MS, 2025)",
        "pag": 1,
        "sobre": "Crianças são as principais vítimas."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 120,
        "sobre": "Crianças até 9 anos têm maior risco."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 120,
        "sobre": "Dor local imediata."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 120,
        "sobre": "Manifestações sistêmicas."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 121,
        "sobre": "Diagnóstico clínico-epidemiológico."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 122,
        "sobre": "Diferencial: aranha-armadeira."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 122,
        "sobre": "Analgesia: lidocaína 2% e dipirona."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 122,
        "sobre": "Classificação moderada: 2 a 3 ampolas."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 118,
        "sobre": "Teste de sensibilidade não recomendado."
      }
    ]
  },
  {
    "id": "pdx-botropico",
    "versao": 1,
    "revisado": true,
    "sistema": "Zoonoses e acidentes por animais",
    "titulo": "Acidente botrópico moderado",
    "paciente": "Seu Valdir, 36 anos",
    "queixa": "Picada de cobra no pé, que está inchando e com a pele roxa.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 92 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 130/80 mmHg · T 36,8°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "observacao",
    "criteriosAlta": [],
    "estadoInicial": "Com edema crescente no pé e na perna",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Viu a cobra? Como era?",
        "resposta": "Marrom com desenho em V invertido, cabeça triangular.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Há quanto tempo foi a picada?",
        "resposta": "Três horas.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Fez torniquete ou colocou alguma coisa no local?",
        "resposta": "Amarrou uma corda acima do joelho e passou pó de café.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Tem urina escura, falta de força ou dificuldade para abrir os olhos?",
        "resposta": "Nada disso.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Tem alergia ou doença nos rins?",
        "resposta": "Não.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "fisico",
        "grupo": "Exame físico",
        "texto": "Exame do membro",
        "resposta": "Duas marcas de presa, edema até o joelho com equimose, bolhas serosas. Pulso pedioso presente.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "tc",
        "grupo": "Exames",
        "texto": "Tempo de coagulação",
        "resposta": "Incoagulável (ilustrativo).",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "hemo",
        "grupo": "Exames",
        "texto": "Hemograma, ureia e creatinina",
        "resposta": "Plaquetas 120 mil; função renal normal.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Acidente botrópico como hipótese principal",
        "resposta": "Hipótese registrada: Dor, edema, equimose e sangramento no local de uma picada de jararaca.",
        "pontos": 50,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Acidente crotálico como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Teria alterações neuroparalíticas e urina escura, sem edema importante.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Acidente elapídico como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Teria paralisia flácida e risco respiratório, sem edema nem equimose.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Serpente não peçonhenta como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Não explica o sangramento nem a coagulopatia.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Soro antibotrópico (pentavalente), 4 a 8 ampolas IV",
        "resposta": "Quadro moderado: edema e equimose evidentes, sangramento sem comprometimento do estado geral.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Retirar o torniquete e não usar substâncias no local",
        "resposta": "O torniquete agrava isquemia e necrose.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Manter o torniquete até o fim do soro",
        "resposta": "O uso indevido de torniquete contribui para necrose.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Fazer teste de sensibilidade antes do soro",
        "resposta": "Não é recomendado: atrasa a soroterapia.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Pedir exame de coagulação para acompanhar a resposta",
        "resposta": "Confirma o quadro e a eficácia do soro.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Vigiar síndrome compartimental, abscesso, necrose e lesão renal",
        "resposta": "Complicações do botrópico.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "fisico",
      "tc",
      "c1",
      "c2",
      "c5",
      "c6",
      "h1"
    ],
    "aprendizado": "Dor, edema progressivo, equimose e sangramento depois de picada de serpente apontam para o gênero Bothrops. Classificado como moderado, recebe soro antibotrópico 4 a 8 ampolas. Torniquete e teste cutâneo estão fora, e o seguimento procura complicações.",
    "alerta": {
      "nome": "Síndrome compartimental",
      "quando": "Quando o edema comprime o feixe vásculo-nervoso",
      "resposta": "Reavaliar perfusão do membro e agir",
      "porque": "O edema extenso pode causar isquemia de extremidades; é uma das complicações locais do botrópico."
    },
    "notificar": "Notificação de acidente por animal peçonhento.",
    "referencias": [
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 114,
        "sobre": "Botrópico: serpentes Bothrops, o mais importante."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 114,
        "sobre": "Manifestações locais."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 116,
        "sobre": "Torniquete e necrose."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 116,
        "sobre": "Complicações: síndrome compartimental."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 116,
        "sobre": "Exames de coagulação."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 117,
        "sobre": "Moderado: 4 a 8 ampolas."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 118,
        "sobre": "Soro antibotrópico (pentavalente) prioritário."
      },
      {
        "fonte": "Guia de Vigilância em Saúde, vol. 3 (MS, 2024)",
        "pag": 118,
        "sobre": "Sem teste cutâneo."
      }
    ]
  },
  {
    "id": "pdx-bacteriuria",
    "versao": 1,
    "revisado": true,
    "sistema": "Obstétrico",
    "titulo": "Bacteriúria assintomática na gestação",
    "paciente": "Aline, 27 anos, 16 semanas",
    "queixa": "Veio à consulta de rotina, sem sintomas, com o resultado da urocultura.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 82 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 110/70 mmHg · T 36,6°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c2",
      "c4"
    ],
    "estadoInicial": "Gestante sem queixas, em consulta de pré-natal",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Tem ardência ao urinar, vontade frequente ou dor na barriga?",
        "resposta": "Nada disso.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Teve febre, calafrios ou dor nas costas?",
        "resposta": "Não.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Já teve infecção urinária antes ou durante esta gestação?",
        "resposta": "Uma vez, na adolescência.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Tem alergia a antibiótico?",
        "resposta": "Não.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Tem outras doenças, como diabetes?",
        "resposta": "Nenhuma.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "sv",
        "grupo": "Exame físico",
        "texto": "Sinais vitais",
        "resposta": "PA 110×70, afebril, giordano negativo.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "uro",
        "grupo": "Exames",
        "texto": "Urocultura",
        "resposta": "Positiva, bactéria em contagem alta. Antibiograma com sensibilidade à nitrofurantoína e à cefalexina.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "equ",
        "grupo": "Exames",
        "texto": "EQU",
        "resposta": "Leucocitúria discreta, nitrito positivo.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "us",
        "grupo": "Exames",
        "texto": "Ultrassonografia obstétrica",
        "resposta": "Feto único, vivo, idade gestacional compatível.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 3
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Bacteriúria assintomática como hipótese principal",
        "resposta": "Hipótese registrada: Urocultura positiva na gestante sem sintomas.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Cistite como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Cistite tem disúria, polaciúria e urgência; ela não tem.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Pielonefrite como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem febre, calafrios nem dor lombar.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Exame normal da gestação como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Bacteriúria na gestação deve ser tratada.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Tratar com nitrofurantoína 100 mg de 6/6 h por 5 dias ou cefalexina 500 mg de 6/6 h por 7 dias",
        "resposta": "Segundo o antibiograma.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Repetir a urocultura após 2 semanas de tratamento",
        "resposta": "Controle de cura.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Não tratar porque ela não tem sintomas",
        "resposta": "Cerca de 30% não tratadas evoluem para formas graves de ITU.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Orientar sinais de pielonefrite: febre, calafrios e dor lombar",
        "resposta": "Se surgirem, internação e antibiótico venoso.",
        "pontos": 45,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Antibiótico em dose única e sem controle",
        "resposta": "A duração é de 5 a 7 dias e exige urocultura de controle.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p4",
      "uro",
      "c1",
      "c2",
      "c4",
      "h1"
    ],
    "aprendizado": "Na gestação, bacteriúria sem sintomas deve ser tratada: cerca de 30% evoluem para formas graves. Antibiótico conforme o antibiograma por 5 a 7 dias e urocultura de controle em 2 semanas.",
    "alerta": {
      "nome": "Pielonefrite",
      "quando": "Calafrios, dor lombar, febre",
      "resposta": "Hospitalização e antibiótico venoso",
      "porque": "Na gestação, a pielonefrite exige internação e profilaxia antibiótica depois do tratamento."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 51,
        "sobre": "ITU na gestação acomete 10 a 12%."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 51,
        "sobre": "Cerca de 30% não tratadas evoluem."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 51,
        "sobre": "Nitrofurantoína 5 dias."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 51,
        "sobre": "Cefalexina 7 dias."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 51,
        "sobre": "Pielonefrite: sinais."
      }
    ]
  },
  {
    "id": "pdx-sifilis-gestacao",
    "versao": 1,
    "revisado": true,
    "sistema": "Obstétrico",
    "titulo": "Sífilis na gestação",
    "paciente": "Camila, 22 anos, 14 semanas",
    "queixa": "Primeira consulta de pré-natal. O teste rápido de sífilis deu positivo.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 78 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 108/68 mmHg · T 36,5°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c3",
      "c4",
      "c5"
    ],
    "estadoInicial": "Gestante em primeira consulta de pré-natal",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Teve ferida na genitália ou manchas no corpo nos últimos meses?",
        "resposta": "Não que ela lembre.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Já fez tratamento para sífilis?",
        "resposta": "Nunca.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "O parceiro foi tratado ou tem sintomas?",
        "resposta": "O parceiro não foi avaliado.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Tem alergia à penicilina?",
        "resposta": "Não.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Usa preservativo?",
        "resposta": "Às vezes.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "tr",
        "grupo": "Exames",
        "texto": "Teste rápido para sífilis",
        "resposta": "Reagente.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "vdrl",
        "grupo": "Exames",
        "texto": "VDRL",
        "resposta": "Reagente, titulação 1:16. Colhido para monitorar a resposta.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "exf",
        "grupo": "Exame físico",
        "texto": "Exame físico",
        "resposta": "Sem lesões mucocutâneas, sem linfadenopatia.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Sífilis latente de duração ignorada como hipótese principal",
        "resposta": "Hipótese registrada: Teste reagente, sem sintomas e sem saber quando infectou; é tratada como latente tardia.",
        "pontos": 50,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Sífilis primária como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem cancro; e o tempo de infecção é ignorado.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Falso-positivo: repetir só no 3º trimestre como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. O teste reagente na gestação é tratado, não se espera.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Sífilis congênita como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. É o desfecho que se quer evitar no feto, não o diagnóstico da gestante.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Penicilina G benzatina 2,4 milhões UI IM semanal por 3 semanas (total 7,2 milhões UI)",
        "resposta": "Estadiamento latente tardio ou ignorado.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Dose única de 2,4 milhões UI",
        "resposta": "A dose única é para sífilis primária, secundária ou latente recente (menos de 1 ano).",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Tratar ou oferecer tratamento presuntivo ao parceiro",
        "resposta": "Para quem teve exposição até 90 dias.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "VDRL mensal até o parto",
        "resposta": "Monitorar a resposta.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Notificar o caso",
        "resposta": "A notificação é obrigatória.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Aguardar o 3º trimestre para tratar",
        "resposta": "O risco de desfecho adverso é alto sem tratamento.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "tr",
      "vdrl",
      "c1",
      "c3",
      "c4",
      "c5",
      "h1"
    ],
    "aprendizado": "Na gestante com teste rápido reagente, trata-se na hora, com a penicilina benzatina escolhida pelo estadiamento. Se a duração é ignorada, são 3 doses semanais. Parceiro, VDRL mensal e notificação completam a conduta.",
    "alerta": {
      "nome": "Atraso entre as doses",
      "quando": "Intervalo de mais de 9 dias entre as aplicações",
      "resposta": "Reiniciar o esquema",
      "porque": "O esquema semanal perde a eficácia se o intervalo passa de 9 dias."
    },
    "notificar": "Notificação obrigatória de sífilis.",
    "referencias": [
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 52,
        "sobre": "Até 50% de desfecho adverso sem tratamento."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 52,
        "sobre": "Penicilina benzatina em dose única para sífilis recente."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 52,
        "sobre": "Esquema de 3 semanas: 7,2 milhões UI."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 52,
        "sobre": "Reiniciar se intervalo passar de 9 dias."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 52,
        "sobre": "Notificação obrigatória."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 52,
        "sobre": "Tratamento presuntivo do parceiro."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 52,
        "sobre": "VDRL mensal até o parto."
      }
    ]
  },
  {
    "id": "pdx-pre-eclampsia",
    "versao": 1,
    "revisado": true,
    "sistema": "Obstétrico",
    "titulo": "Pré-eclâmpsia com sinais de gravidade",
    "paciente": "Joana, 34 anos, 33 semanas",
    "queixa": "Dor de cabeça forte que não passa, vista turva e dor na boca do estômago.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 96 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 168/112 mmHg · T 36,7°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Gestante hipertensa, com edema de face e mãos",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Quando começou a dor de cabeça e a alteração visual?",
        "resposta": "Há dois dias, com piora hoje.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Notou inchaço no rosto e nas mãos ou ganho rápido de peso?",
        "resposta": "Mãos e rosto inchados, subiu 3 kg em duas semanas.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Teve pressão alta antes de engravidar ou em gestação anterior?",
        "resposta": "Pré-eclâmpsia na primeira gravidez.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Já teve convulsão?",
        "resposta": "Não.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "O bebê tem se mexido?",
        "resposta": "Mexe, mas menos que o habitual.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "pa",
        "grupo": "Exame físico",
        "texto": "Pressão arterial (2 medidas)",
        "resposta": "168×112 mmHg e 164×110 mmHg, com 30 minutos de intervalo.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "fita",
        "grupo": "Exames",
        "texto": "Proteinúria na fita urinária",
        "resposta": "2+.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 5
      },
      {
        "id": "exf",
        "grupo": "Exame físico",
        "texto": "Exame físico",
        "resposta": "Edema de face e mãos, reflexos vivos, sem convulsão.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "bcf",
        "grupo": "Exame físico",
        "texto": "Ausculta fetal",
        "resposta": "BCF 142 bpm.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Pré-eclâmpsia com sinais de gravidade como hipótese principal",
        "resposta": "Hipótese registrada: Hipertensão após 20 semanas com proteinúria, cefaleia, escotomas e epigastralgia.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Hipertensão gestacional como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Não teria proteinúria nem lesão de órgão-alvo.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Hipertensão crônica como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Pressão elevada só após a 20ª semana.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Eclâmpsia como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Ainda não houve convulsão, mas é o risco.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Nifedipino por via oral para a hipertensão grave, repetindo em 30 min se necessário",
        "resposta": "PA acima de 160/110 é hipertensão grave.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Sulfato de magnésio: dose de ataque de 4 g IV em 5 a 10 minutos, em decúbito lateral esquerdo",
        "resposta": "Pode ser feito já na unidade básica, antes do transporte.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Encaminhar imediatamente à emergência obstétrica",
        "resposta": "Avaliação materna e fetal imediata.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Marcar retorno em uma semana e orientar repouso",
        "resposta": "Pré-eclâmpsia com gravidade é emergência obstétrica.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Iniciar AAS 100 mg agora para prevenir",
        "resposta": "O AAS é profilaxia a partir do início da gestação, antes de 16 semanas; não trata o quadro.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Esperar mais uma medida da pressão na próxima consulta",
        "resposta": "Atrasa um tratamento que reduz o risco de eclâmpsia e de morte materna.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "pa",
      "fita",
      "c1",
      "c2",
      "c3",
      "h1"
    ],
    "aprendizado": "Hipertensão após a 20ª semana com proteinúria e sinais como cefaleia, escotomas e epigastralgia é pré-eclâmpsia com gravidade. Trata-se a pressão, dá-se o sulfato de magnésio já na unidade e transporta-se imediatamente à emergência obstétrica.",
    "alerta": {
      "nome": "Eclâmpsia",
      "quando": "Convulsão",
      "resposta": "Sulfato de magnésio e transporte imediato",
      "porque": "O sulfato reduz em 57% o risco de eclâmpsia e diminui o risco de morte materna."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 44,
        "sobre": "Definição de pré-eclâmpsia."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 44,
        "sobre": "Sinais que levam à emergência obstétrica."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 44,
        "sobre": "AAS é profilaxia iniciada antes de 16 semanas."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 48,
        "sobre": "Hipertensão grave: PA ≥ 160/110."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 48,
        "sobre": "Sulfato de magnésio 4 g IV."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 48,
        "sobre": "Decúbito lateral."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 48,
        "sobre": "Sulfatação possível na APS."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 48,
        "sobre": "Redução de 57% de eclâmpsia."
      },
      {
        "fonte": "Guia do pré-natal (SES-RS, 2024)",
        "pag": 48,
        "sobre": "Encaminhamento imediato."
      }
    ]
  },
  {
    "id": "pdx-pneumonia-crianca",
    "versao": 1,
    "revisado": true,
    "sistema": "Pediátrico",
    "titulo": "Pneumonia na criança (AIDPI)",
    "paciente": "Beatriz, 14 meses",
    "queixa": "Tosse e febre há 3 dias, e a mãe acha que está respirando mais rápido.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 134 bpm · FR 46 irpm · SpO₂ 96% em ar ambiente · PA 92/58 mmHg · T 37,9°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "alta",
    "criteriosAlta": [
      "c1",
      "c2",
      "c3",
      "c4"
    ],
    "estadoInicial": "Criança ativa, com respiração rápida",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "A criança consegue mamar ou beber?",
        "resposta": "Bebe e mama, só menos que o normal.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Vomita tudo o que ingere ou teve convulsão?",
        "resposta": "Não vomita tudo. Nenhuma convulsão.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Há quanto tempo tem tosse e tem sibilância?",
        "resposta": "Três dias. Sem chiado.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Está letárgica ou muito sonolenta?",
        "resposta": "Está acordada e interessada.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Já tomou antibiótico?",
        "resposta": "Não.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "geral",
        "grupo": "Exame físico",
        "texto": "Sinais gerais de perigo",
        "resposta": "Sem sinais gerais de perigo: bebe, não vomita tudo, sem convulsão, sem letargia, enchimento capilar ≤ 2 s.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "fr",
        "grupo": "Exame físico",
        "texto": "Frequência respiratória (criança tranquila, 1 minuto)",
        "resposta": "46 irpm. Respiração rápida para a idade (40 ou mais).",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "tira",
        "grupo": "Exame físico",
        "texto": "Tiragem subcostal e estridor",
        "resposta": "Ausentes.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "ausc",
        "grupo": "Exame físico",
        "texto": "Ausculta",
        "resposta": "Estertores na base direita.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Pneumonia como hipótese principal",
        "resposta": "Hipótese registrada: Tosse com respiração rápida e sem sinal de perigo, sem tiragem.",
        "pontos": 45,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Pneumonia grave ou doença muito grave como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Exigiria sinal geral de perigo, tiragem subcostal ou estridor em repouso.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Não é pneumonia (resfriado) como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Há respiração rápida: esse é o critério de pneumonia.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Sibilância moderada como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem chiado nem tiragem.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Contar a frequência respiratória com a criança tranquila",
        "resposta": "Chorando, o número não é confiável.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Antibiótico recomendado por 7 dias",
        "resposta": "Tratamento da pneumonia.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Aliviar a tosse com medidas caseiras e orientar sinais de retorno imediato",
        "resposta": "Orientação à mãe.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Marcar retorno em 2 dias",
        "resposta": "Seguimento da pneumonia.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Referir urgentemente ao hospital",
        "resposta": "Reservado a pneumonia grave ou doença muito grave.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Só orientar e ver em 5 dias",
        "resposta": "É a conduta de ‘não é pneumonia’.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "p4",
      "geral",
      "fr",
      "c1",
      "c2",
      "c3",
      "c4",
      "h1"
    ],
    "aprendizado": "Na criança de 1 a 5 anos, tosse com 40 ou mais respirações por minuto (criança tranquila) e sem sinal de perigo é pneumonia: antibiótico por 7 dias e retorno em 2 dias. Tiragem subcostal ou sinal geral de perigo muda para pneumonia grave.",
    "alerta": {
      "nome": "Tiragem subcostal",
      "quando": "Aparece tiragem, estridor em repouso ou sinal geral de perigo",
      "resposta": "1ª dose de antibiótico e referência urgente",
      "porque": "Passa a pneumonia grave ou doença muito grave: antibiótico, evitar hipoglicemia, oxigênio e hospital."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 8,
        "sobre": "Perguntar sobre beber/mamar."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 8,
        "sobre": "Enchimento capilar > 2 s é sinal de perigo."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 9,
        "sobre": "Respiração rápida: 40 ou mais (1 a 5 anos)."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 9,
        "sobre": "Criança deve estar tranquila."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 9,
        "sobre": "Pneumonia grave: tiragem subcostal."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 9,
        "sobre": "Pneumonia: antibiótico por 7 dias."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 9,
        "sobre": "Retorno em 2 dias."
      }
    ]
  },
  {
    "id": "pdx-desidratacao",
    "versao": 1,
    "revisado": true,
    "sistema": "Pediátrico",
    "titulo": "Diarreia com desidratação (Plano B)",
    "paciente": "Pedro, 2 anos",
    "queixa": "Diarreia aquosa há 2 dias, com sede e irritação.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 130 bpm · FR 28 irpm · SpO₂ 98% em ar ambiente · PA 88/54 mmHg · T 37,2°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "observacao",
    "criteriosAlta": [],
    "estadoInicial": "Criança com sede e olhos fundos",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Há quanto tempo a diarreia e tem sangue nas fezes?",
        "resposta": "Dois dias, aquosa, sem sangue.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Ele consegue beber ou vomita tudo?",
        "resposta": "Bebe com muita sede. Vomitou só uma vez.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Está sonolento ou mole?",
        "resposta": "Está irritado, mas reage.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Usou algum remédio ou antibiótico em casa?",
        "resposta": "Não.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "geral",
        "grupo": "Exame físico",
        "texto": "Sinais gerais de perigo",
        "resposta": "Sem letargia, sem convulsão; bebe.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "olhos",
        "grupo": "Exame físico",
        "texto": "Olhos",
        "resposta": "Fundos.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "prega",
        "grupo": "Exame físico",
        "texto": "Sinal da prega",
        "resposta": "A pele volta lentamente ao estado anterior.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "sede",
        "grupo": "Exame físico",
        "texto": "Sede",
        "resposta": "Bebe avidamente, com sede.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Diarreia com desidratação como hipótese principal",
        "resposta": "Hipótese registrada: Inquieto, olhos fundos, sede e prega lenta: dois ou mais sinais.",
        "pontos": 50,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Desidratação grave como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Exigiria letargia, não beber ou beber mal e prega muito lenta.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Sem desidratação como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Há dois ou mais sinais de desidratação.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Disenteria como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Sem sangue nas fezes.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Plano B: SRO na unidade de saúde até hidratar",
        "resposta": "Conduta da classificação desidratação.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Zinco oral por 10 dias",
        "resposta": "Incluído em todas as classificações de diarreia.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Continuar a alimentação e informar sinais de retorno imediato",
        "resposta": "Orientações à mãe.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Seguimento em 5 dias se não melhorar",
        "resposta": "Retorno programado.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Terapia endovenosa (Plano C)",
        "resposta": "É para desidratação grave.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c6",
        "grupo": "Conduta",
        "texto": "Antibiótico de rotina",
        "resposta": "Só se indica antibiótico na disenteria com comprometimento do estado geral ou na suspeita de cólera.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "olhos",
      "prega",
      "sede",
      "c1",
      "c2",
      "c3",
      "c4",
      "h1"
    ],
    "aprendizado": "Criança com diarreia, inquieta, olhos fundos, sedenta e com prega lenta tem desidratação: Plano B com SRO na unidade, zinco por 10 dias, alimentação mantida e retorno em 5 dias. Antibiótico só se houver sangue nas fezes e comprometimento.",
    "alerta": {
      "nome": "Desidratação grave",
      "quando": "Letargia, olhos fundos, não bebe, prega muito lenta",
      "resposta": "Plano C (terapia endovenosa) ou referência urgente",
      "porque": "Dois ou mais desses sinais classificam desidratação grave."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 13,
        "sobre": "Critérios de desidratação."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 13,
        "sobre": "Sinal da prega lenta."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 13,
        "sobre": "Plano B: SRO na unidade."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 13,
        "sobre": "Zinco por 10 dias."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 13,
        "sobre": "Plano C para desidratação grave."
      },
      {
        "fonte": "AIDPI Criança (MS, 2017)",
        "pag": 13,
        "sobre": "Antibiótico na disenteria."
      }
    ]
  },
  {
    "id": "pdx-rn-doenca-grave",
    "versao": 1,
    "revisado": true,
    "sistema": "Pediátrico",
    "titulo": "Recém-nascido com doença grave",
    "paciente": "Davi, 18 dias",
    "queixa": "Não quer mais mamar, está molinho e quente.",
    "fonte": "Biblioteca do caso (ver referências no relatório)",
    "vitais": "FC 170 bpm · FR 64 irpm · SpO₂ 95% em ar ambiente · PA 70/40 mmHg · T 37,8°C",
    "hipoteseCorreta": "h1",
    "destinoAdequado": "encaminhar",
    "criteriosAlta": [],
    "estadoInicial": "Recém-nascido letárgico, com febre",
    "acoes": [
      {
        "id": "p1",
        "grupo": "Anamnese",
        "texto": "Ele consegue mamar no peito ou tomar leite?",
        "resposta": "Não pega o peito nem aceita o copinho.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p2",
        "grupo": "Anamnese",
        "texto": "Tem tido vômitos, febre ou frio?",
        "resposta": "Febre hoje. Sem vômitos.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p3",
        "grupo": "Anamnese",
        "texto": "Teve convulsões ou tremores?",
        "resposta": "Um tremor fino no braço.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p4",
        "grupo": "Anamnese",
        "texto": "Como estava o umbigo e a pele?",
        "resposta": "Umbigo seco, sem secreção.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "p5",
        "grupo": "Anamnese",
        "texto": "Como foi o parto e o peso ao nascer?",
        "resposta": "Parto normal, 3.150 g.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "temp",
        "grupo": "Exame físico",
        "texto": "Temperatura axilar",
        "resposta": "37,8 °C: febre em menor de 2 meses.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "fr",
        "grupo": "Exame físico",
        "texto": "Frequência respiratória (em repouso)",
        "resposta": "64 irpm. Respiração rápida.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "obs",
        "grupo": "Exame físico",
        "texto": "Observação",
        "resposta": "Letárgico, hipotônico, sem tiragem importante, sem cianose central.",
        "pontos": 15,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "umb",
        "grupo": "Exame físico",
        "texto": "Umbigo e pele",
        "resposta": "Sem secreção purulenta nem pústulas.",
        "pontos": 5,
        "criterio": "raciocinio",
        "minutos": 2
      },
      {
        "id": "h1",
        "grupo": "Hipóteses",
        "texto": "Registrar Doença grave (sepse ou meningite) como hipótese principal",
        "resposta": "Hipótese registrada: Não suga, febre, respiração rápida, letargia: sinal da coluna vermelha.",
        "pontos": 60,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h2",
        "grupo": "Hipóteses",
        "texto": "Registrar Infecção localizada como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Seria secreção purulenta em olhos ou umbigo, pústulas localizadas, sem sinais gerais.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h3",
        "grupo": "Hipóteses",
        "texto": "Registrar Cólica do lactente como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Não explica febre, letargia e recusa de mamar.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "h4",
        "grupo": "Hipóteses",
        "texto": "Registrar Resfriado comum como hipótese principal",
        "resposta": "Hipótese registrada, mas os dados do caso não a sustentam como principal. Em menor de 2 meses, febre e hipoatividade indicam gravidade.",
        "pontos": 0,
        "criterio": "raciocinio",
        "minutos": 1
      },
      {
        "id": "c1",
        "grupo": "Conduta",
        "texto": "Classificar como doença grave e transferir com urgência a um hospital",
        "resposta": "Muito difícil distinguir sepse de meningite nessa idade.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c2",
        "grupo": "Conduta",
        "texto": "Administrar a dose de dois antibióticos recomendados antes da transferência",
        "resposta": "Conduta antes da referência.",
        "pontos": 20,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c3",
        "grupo": "Conduta",
        "texto": "Seguir as normas de estabilização e transporte",
        "resposta": "A criança precisa chegar estável.",
        "pontos": 25,
        "criterio": "seguranca",
        "minutos": 3,
        "exige": [
          "h1"
        ]
      },
      {
        "id": "c4",
        "grupo": "Conduta",
        "texto": "Orientar manter a amamentação e voltar em 48 horas",
        "resposta": "É conduta de ‘sem doença grave’.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "c5",
        "grupo": "Conduta",
        "texto": "Dar antitérmico e acompanhar em casa",
        "resposta": "Febre em menor de 2 meses significa problema grave.",
        "pontos": -15,
        "criterio": "seguranca",
        "minutos": 3
      },
      {
        "id": "alta",
        "grupo": "Encerramento",
        "texto": "Encerrar com alta orientada",
        "resposta": "Atendimento encerrado com alta orientada. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "observacao",
        "grupo": "Encerramento",
        "texto": "Manter em observação, com retorno programado",
        "resposta": "Paciente fica em observação, com retorno marcado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "encaminhar",
        "grupo": "Encerramento",
        "texto": "Encaminhar para serviço de maior complexidade",
        "resposta": "Encaminhamento registrado. Confira no relatório se o caso pedia esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      },
      {
        "id": "uti",
        "grupo": "Encerramento",
        "texto": "Transferir para a UTI",
        "resposta": "Paciente encaminhado à UTI. Confira no relatório se a gravidade justificava esse destino.",
        "pontos": 0,
        "criterio": "seguranca",
        "minutos": 1,
        "terminal": true
      }
    ],
    "essenciais": [
      "p1",
      "p2",
      "p3",
      "temp",
      "fr",
      "obs",
      "c1",
      "c2",
      "c3",
      "h1"
    ],
    "aprendizado": "Em menor de 2 meses, não conseguir mamar, febre ou hipotermia, respiração rápida e letargia são doença grave: antibióticos e transferência urgentes. A criança muito pequena não ‘acompanha em casa’.",
    "alerta": {
      "nome": "Deterioração",
      "quando": "Cianose central, apneia ou tiragem grave",
      "resposta": "Suporte respiratório durante a transferência",
      "porque": "Respiração rápida (60 ou mais) é sinal de dificuldade respiratória; apneia e cianose central são gravidade extrema."
    },
    "notificar": null,
    "referencias": [
      {
        "fonte": "AIDPI Neonatal (MS, 2014)",
        "pag": 119,
        "sobre": "Não sugar o peito é sinal inicial de gravidade."
      },
      {
        "fonte": "AIDPI Neonatal (MS, 2014)",
        "pag": 119,
        "sobre": "Respiração rápida: 60 ou mais."
      },
      {
        "fonte": "AIDPI Neonatal (MS, 2014)",
        "pag": 120,
        "sobre": "Febre ou hipotermia em menor de 2 meses."
      },
      {
        "fonte": "AIDPI Neonatal (MS, 2014)",
        "pag": 120,
        "sobre": "Significa problema grave, geralmente sepse."
      },
      {
        "fonte": "AIDPI Neonatal (MS, 2014)",
        "pag": 126,
        "sobre": "Transferência com urgência."
      },
      {
        "fonte": "AIDPI Neonatal (MS, 2014)",
        "pag": 126,
        "sobre": "Dose de dois antibióticos antes de sair."
      }
    ]
  }
];
