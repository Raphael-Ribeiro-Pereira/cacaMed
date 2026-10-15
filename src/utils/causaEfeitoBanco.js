// Relações do Causa e efeito (formato v2, 13/10/2026): cada uma tem o seu próprio caso, quatro elos (mecanismo,
// consequência, compensação e intervenção) e seis cartas, das quais duas são distratores. Novos lotes entram por
// `node scripts/integrar-ddx.mjs causa content/approved/lote.json`. `revisado` só vira true com a aprovação clínica.
export const RELACOES = [
  {
    "id": "ce-asma-1",
    "versao": 2,
    "revisado": false,
    "tema": "Respiratório",
    "titulo": "Mecanismos da falta de ar na asma",
    "paciente": "Marina, 28 anos",
    "cenario": "Chiado e falta de ar depois de limpar um quarto empoeirado.",
    "vitais": "FC 108 bpm · FR 26 irpm · SpO₂ 94% em ar ambiente · PA 120/80 mmHg · T 36,7°C",
    "estimulo": "Poeira em paciente com asma",
    "contexto": "Monte o circuito, do estímulo ao tratamento. A frequência respiratória isolada não informa a ventilação alveolar.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c1",
        "explicacao": "O broncoespasmo reduz o calibre das vias aéreas. Edema e secreções também contribuem; o estreitamento não tem uma única causa."
      },
      {
        "id": "consequencia",
        "correta": "c2",
        "explicacao": "O estreitamento aumenta a resistência e dificulta a saída de ar. A intensidade do chiado não mede sozinha a obstrução."
      },
      {
        "id": "compensacao",
        "correta": "c3",
        "explicacao": "A maior carga exige mais trabalho respiratório. Essa resposta pode ser insuficiente e evoluir com fadiga."
      },
      {
        "id": "intervencao",
        "correta": "c4",
        "explicacao": "A broncodilatação melhora o fluxo. Ela não elimina toda a inflamação nem substitui a reavaliação da resposta."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Contração do músculo liso brônquico"
      },
      {
        "id": "c2",
        "texto": "Menor calibre, maior resistência e fluxo expiratório limitado"
      },
      {
        "id": "c3",
        "texto": "Aumento do esforço e da frequência respiratória para manter a ventilação"
      },
      {
        "id": "c4",
        "texto": "Broncodilatador: relaxa o músculo liso e reduz a resistência"
      },
      {
        "id": "c5",
        "texto": "Garantir ventilação alveolar adequada em qualquer situação"
      },
      {
        "id": "c6",
        "texto": "Eliminar definitivamente toda a inflamação da asma"
      }
    ],
    "fonte": "https://ginasthma.org/reports/"
  },
  {
    "id": "ce-dengue-extravasamento",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Dengue: a febre cede e o paciente piora",
    "paciente": "Dona Marta, 47 anos",
    "cenario": "Quinto dia de dengue. A febre sumiu ontem, mas ela está com dor abdominal e tontura ao levantar.",
    "vitais": "FC 108 bpm · FR 22 irpm · SpO₂ 97% em ar ambiente · PA 100/70 mmHg · T 36,8°C",
    "estimulo": "Dengue: a febre cede entre o 3º e o 7º dia",
    "contexto": "Monte o circuito, do estímulo ao tratamento. Pense no que acontece com o plasma nesta fase.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "Os sinais de alarme resultam, na maioria, do aumento da permeabilidade vascular, que marca o início da deterioração clínica."
      },
      {
        "id": "consequencia",
        "correta": "c5",
        "explicacao": "O choque ocorre quando um volume crítico de plasma é perdido por extravasamento ou sangramento."
      },
      {
        "id": "compensacao",
        "correta": "c1",
        "explicacao": "O corpo tenta manter a pressão com taquicardia; pressão de pulso baixa e queda ao levantar mostram que a perda de volume está evoluindo."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "Com sinais de alarme, a conduta é iniciar a reposição de volume já, em qualquer ponto de atenção, mesmo sem exames."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Taquicardia, queda da pressão de pulso e hipotensão postural"
      },
      {
        "id": "c2",
        "texto": "Reposição volêmica imediata com soro fisiológico, sem esperar exames"
      },
      {
        "id": "c3",
        "texto": "Antibiótico venoso de amplo espectro para um foco bacteriano"
      },
      {
        "id": "c4",
        "texto": "Aumento da permeabilidade vascular, com saída de plasma dos vasos"
      },
      {
        "id": "c5",
        "texto": "Perda de plasma e hemoconcentração, com risco de choque"
      },
      {
        "id": "c6",
        "texto": "Anti-inflamatório não esteroide para controlar a febre e a dor"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "ce-dengue-aine",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Dengue e o comprimido para a dor no corpo",
    "paciente": "Rafael, 26 anos",
    "cenario": "Terceiro dia de dengue. Tomou ácido acetilsalicílico por conta própria para a dor no corpo e agora vomita com sangue.",
    "vitais": "FC 112 bpm · FR 22 irpm · SpO₂ 98% em ar ambiente · PA 104/66 mmHg · T 37,9°C",
    "estimulo": "Uso de AAS durante a dengue",
    "contexto": "Monte o circuito. Pense no que o AAS faz com a coagulação e o que o manual orienta usar no lugar.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "Na dengue, AAS e anti-inflamatórios somam-se às alterações da coagulação e aumentam o risco de hemorragia."
      },
      {
        "id": "consequencia",
        "correta": "c6",
        "explicacao": "A hemorragia no aparelho digestivo é mais frequente em quem tem úlcera ou gastrite e toma AAS, anti-inflamatórios ou anticoagulantes."
      },
      {
        "id": "compensacao",
        "correta": "c2",
        "explicacao": "A perda de sangue reduz o volume circulante e o hematócrito, e o corpo responde com taquicardia; a pressão cai se a perda continua."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "Salicilatos e anti-inflamatórios não devem ser usados; paracetamol ou dipirona controlam a dor e a febre, e o sangramento com choque exige terapia antichoque."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Associar um anticoagulante para evitar a trombose"
      },
      {
        "id": "c2",
        "texto": "Queda do hematócrito, taquicardia e hipotensão"
      },
      {
        "id": "c3",
        "texto": "Manter o AAS porque protege o coração"
      },
      {
        "id": "c4",
        "texto": "AAS e anti-inflamatórios agravam a tendência a sangramento"
      },
      {
        "id": "c5",
        "texto": "Suspender o AAS, tratar o choque e usar paracetamol ou dipirona para dor e febre"
      },
      {
        "id": "c6",
        "texto": "Sangramento digestivo, principalmente em quem tem gastrite ou úlcera"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "ce-dengue-choque-prolongado",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Dengue: choque que dura demais",
    "paciente": "Seu Valter, 52 anos",
    "cenario": "Dengue grave com choque há horas. Pele fria, urina escassa e pontos de sangramento nas punções.",
    "vitais": "FC 124 bpm · FR 28 irpm · SpO₂ 94% em ar ambiente · PA 78/52 mmHg · T 36,2°C",
    "estimulo": "Choque da dengue sem terapia adequada",
    "contexto": "Monte o circuito. Siga o que acontece com os órgãos quando a perfusão fica ruim por muito tempo.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c2",
        "explicacao": "Quando o choque se prolonga, os órgãos recebem pouco sangue e passam a produzir ácidos, gerando acidose metabólica."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "A hipoperfusão leva a acidose e CIVD, que causam hemorragias graves e agravam o choque."
      },
      {
        "id": "compensacao",
        "correta": "c1",
        "explicacao": "A respiração rápida e profunda é a tentativa do corpo de compensar a acidose metabólica eliminando gás carbônico."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "O choque da dengue é de rápida instalação e curta duração: pode levar à morte em 12 a 24 horas ou à recuperação rápida com a terapia antichoque."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Taquipneia e respiração de Kussmaul para eliminar ácido"
      },
      {
        "id": "c2",
        "texto": "Hipoperfusão dos órgãos, com acidose metabólica"
      },
      {
        "id": "c3",
        "texto": "Coagulação intravascular disseminada e hemorragias graves"
      },
      {
        "id": "c4",
        "texto": "Restrição de líquidos para evitar edema"
      },
      {
        "id": "c5",
        "texto": "Terapia antichoque apropriada, com recuperação rápida"
      },
      {
        "id": "c6",
        "texto": "Corticoide em dose alta para conter a inflamação"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "ce-ieca-estenose-renal",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Creatinina que sobe depois do IECA",
    "paciente": "Seu Osvaldo, 66 anos",
    "cenario": "Hipertenso, começou um inibidor da ECA há duas semanas. A creatinina subiu bem acima da basal. Tem estenose de artéria renal.",
    "vitais": "FC 84 bpm · FR 16 irpm · SpO₂ 97% em ar ambiente · PA 150/90 mmHg · T 36,6°C",
    "estimulo": "IECA em paciente com obstrução das artérias renais",
    "contexto": "Monte o circuito. Pense em como o rim mantém a filtração quando a artéria renal está estreitada.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c3",
        "explicacao": "O IECA dilata as arteríolas eferentes, o que reduz a pressão que mantém a filtração glomerular."
      },
      {
        "id": "consequencia",
        "correta": "c4",
        "explicacao": "Em hipertensão renovascular, a redução da filtração aumenta os níveis de ureia e creatinina."
      },
      {
        "id": "compensacao",
        "correta": "c1",
        "explicacao": "Com a artéria renal obstruída, o fluxo não aumenta para compensar a dilatação das arteríolas eferentes."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "Elevação abrupta da creatinina (mais de 50% do basal) pede suspensão e encaminhamento ao especialista."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "A dilatação não é compensada por mais fluxo de sangue renal"
      },
      {
        "id": "c2",
        "texto": "Dobrar a dose do IECA para controlar melhor a pressão"
      },
      {
        "id": "c3",
        "texto": "Dilatação das arteríolas eferentes pelo IECA"
      },
      {
        "id": "c4",
        "texto": "Queda da filtração glomerular, com ureia e creatinina em alta"
      },
      {
        "id": "c5",
        "texto": "Suspender o medicamento se a creatinina subir mais de 50% e investigar"
      },
      {
        "id": "c6",
        "texto": "Associar um bloqueador do receptor de angiotensina ao IECA"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "ce-tiazidico-hipocalemia",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Diurético tiazídico e o potássio",
    "paciente": "Dona Lúcia, 61 anos",
    "cenario": "Hipertensa, usa hidroclorotiazida há dois meses. Tem câimbras e o exame mostra potássio baixo.",
    "vitais": "FC 88 bpm · FR 16 irpm · SpO₂ 98% em ar ambiente · PA 132/84 mmHg · T 36,5°C",
    "estimulo": "Uso de diurético tiazídico",
    "contexto": "Monte o circuito. Siga o potássio, do efeito do remédio ao que fazer.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c2",
        "explicacao": "Os diuréticos tiazídicos podem espoliar potássio e acentuar a hiperuricemia."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "A perda de potássio leva à hipopotassemia, que por sua vez reduz a eficácia do tratamento."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "A hipopotassemia reduz a eficácia da terapia provavelmente porque aumenta o risco de arritmias, e é o provável mecanismo da hiperglicemia."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "O potássio deve ser medido após três a seis meses do início, e IECA ou diurético poupador de potássio corrige a perda."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Aferir o potássio e associar IECA ou poupador de potássio"
      },
      {
        "id": "c2",
        "texto": "O tiazídico espolia potássio na urina"
      },
      {
        "id": "c3",
        "texto": "Hipopotassemia, mesmo discreta"
      },
      {
        "id": "c4",
        "texto": "Maior risco de arritmias e de hiperglicemia"
      },
      {
        "id": "c5",
        "texto": "Dar um betabloqueador para proteger o coração das arritmias"
      },
      {
        "id": "c6",
        "texto": "Suspender todo líquido para reduzir a diurese"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "ce-ieca-hipercalemia",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "IECA, espironolactona e o potássio alto",
    "paciente": "Seu Nelson, 70 anos",
    "cenario": "Hipertenso e com insuficiência renal. Usa IECA e espironolactona. Chegou fraco e o exame mostra potássio elevado.",
    "vitais": "FC 52 bpm · FR 16 irpm · SpO₂ 97% em ar ambiente · PA 128/80 mmHg · T 36,4°C",
    "estimulo": "IECA somado a diurético poupador de potássio",
    "contexto": "Monte o circuito. Pense em quem excreta o potássio e no que cada remédio retém.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "Ieca e diuréticos poupadores de potássio retêm potássio; a insuficiência renal piora a retenção."
      },
      {
        "id": "consequencia",
        "correta": "c6",
        "explicacao": "A associação de agentes poupadores de potássio, ou a insuficiência renal, pode causar hiperpotassemia."
      },
      {
        "id": "compensacao",
        "correta": "c3",
        "explicacao": "O excesso de potássio altera a condução elétrica do coração, o que explica a fraqueza e o pulso lento."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "Ao usar IECA ou aumentar a dose, deve-se medir a creatinina entre três e seis meses."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Oferecer suplemento de potássio por via oral"
      },
      {
        "id": "c2",
        "texto": "Aferir a creatinina e o potássio ao iniciar ou aumentar a dose"
      },
      {
        "id": "c3",
        "texto": "Fraqueza e bradicardia pelo efeito do potássio sobre a condução cardíaca"
      },
      {
        "id": "c4",
        "texto": "Os dois medicamentos reduzem a perda de potássio na urina"
      },
      {
        "id": "c5",
        "texto": "Aumentar a dose da espironolactona para tratar a fraqueza"
      },
      {
        "id": "c6",
        "texto": "Hiperpotassemia"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "ce-betabloqueador-diabetes1",
    "versao": 2,
    "revisado": true,
    "tema": "Endócrino e metabólico",
    "titulo": "Betabloqueador e hipoglicemia que não avisa",
    "paciente": "Bruno, 34 anos",
    "cenario": "Diabético tipo 1 em uso de betabloqueador. Chegou confuso e suado, e a glicemia está muito baixa, mas ele diz que não sentiu nada antes.",
    "vitais": "FC 76 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 124/78 mmHg · T 36,4°C",
    "estimulo": "Betabloqueador em paciente com diabetes tipo 1",
    "contexto": "Monte o circuito. Pense no que a hipoglicemia faz com o corpo e no que o betabloqueador bloqueia.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "Parte dos sinais de alerta da hipoglicemia, como o coração acelerado e o tremor, vem da resposta adrenérgica, que o betabloqueador esconde."
      },
      {
        "id": "consequencia",
        "correta": "c1",
        "explicacao": "Sem os sinais de alerta, o paciente só percebe a queda quando já está confuso."
      },
      {
        "id": "compensacao",
        "correta": "c5",
        "explicacao": "O betabloqueador também bloqueia a glicogenólise, que é uma das formas de o corpo subir a glicemia."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "A contraindicação relativa em diabéticos do tipo 1 decorre de mascarar os sinais de hipoglicemia e bloquear a glicogenólise."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "A hipoglicemia passa sem aviso e chega à confusão"
      },
      {
        "id": "c2",
        "texto": "Evitar o betabloqueador em diabético tipo 1 e preferir outra classe"
      },
      {
        "id": "c3",
        "texto": "Dar insulina em dose maior para corrigir a glicemia"
      },
      {
        "id": "c4",
        "texto": "Aumentar a dose do betabloqueador para controlar os tremores"
      },
      {
        "id": "c5",
        "texto": "O bloqueio da glicogenólise atrasa a recuperação da glicose"
      },
      {
        "id": "c6",
        "texto": "O betabloqueador mascara os sinais de hipoglicemia"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "ce-betabloqueador-dpoc",
    "versao": 2,
    "revisado": true,
    "tema": "Respiratório",
    "titulo": "Betabloqueador na DPOC",
    "paciente": "Seu Armando, 64 anos",
    "cenario": "Tabagista com DPOC. Começou um betabloqueador para a pressão e há dois dias tem mais chiado e falta de ar.",
    "vitais": "FC 58 bpm · FR 24 irpm · SpO₂ 91% em ar ambiente · PA 134/82 mmHg · T 36,7°C",
    "estimulo": "Betabloqueador em paciente com doença pulmonar obstrutiva crônica",
    "contexto": "Monte o circuito. Pense no que acontece com o calibre dos brônquios.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "O betabloqueador atua nos receptores beta, que mantêm os brônquios dilatados."
      },
      {
        "id": "consequencia",
        "correta": "c5",
        "explicacao": "Os betabloqueadores podem exacerbar a doença pulmonar obstrutiva crônica e causam broncoespasmo."
      },
      {
        "id": "compensacao",
        "correta": "c3",
        "explicacao": "A obstrução maior faz o paciente respirar com mais esforço e mais rápido para manter a ventilação."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "Como o betabloqueador agrava a DPOC, o tratamento da pressão passa para uma classe sem esse efeito."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Aumentar a dose do betabloqueador, que também trata a falta de ar"
      },
      {
        "id": "c2",
        "texto": "Suspender o betabloqueador e escolher outra classe para a pressão"
      },
      {
        "id": "c3",
        "texto": "Aumento do esforço respiratório e da frequência respiratória"
      },
      {
        "id": "c4",
        "texto": "O bloqueio dos receptores beta nos brônquios favorece a broncoconstrição"
      },
      {
        "id": "c5",
        "texto": "Broncoespasmo e piora da obstrução ao fluxo de ar"
      },
      {
        "id": "c6",
        "texto": "Associar outro betabloqueador"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "ce-vasodilatador-direto",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Vasodilatador direto e o coração acelerado",
    "paciente": "Dona Rita, 58 anos",
    "cenario": "Hipertensa grave, começou um vasodilatador arterial direto. Agora tem palpitações e as pernas incharam.",
    "vitais": "FC 112 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 126/78 mmHg · T 36,5°C",
    "estimulo": "Vasodilatação arterial direta",
    "contexto": "Monte o circuito. Siga a reação do corpo à queda da resistência arterial.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c5",
        "explicacao": "O medicamento age relaxando diretamente o músculo liso arteriolar."
      },
      {
        "id": "consequencia",
        "correta": "c2",
        "explicacao": "A vasodilatação arterial direta promove retenção hídrica e taquicardia reflexa."
      },
      {
        "id": "compensacao",
        "correta": "c3",
        "explicacao": "A queda da pressão ativa mecanismos que retêm líquido e aumentam a frequência cardíaca."
      },
      {
        "id": "intervencao",
        "correta": "c4",
        "explicacao": "Diurético corrige a retenção de líquido e betabloqueador reduz a taquicardia reflexa."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Restringir o potássio da dieta"
      },
      {
        "id": "c2",
        "texto": "Retenção hídrica e taquicardia reflexa"
      },
      {
        "id": "c3",
        "texto": "O corpo retém sal e água e acelera o coração para compensar a queda da pressão"
      },
      {
        "id": "c4",
        "texto": "Associar um diurético e um betabloqueador para conter os efeitos"
      },
      {
        "id": "c5",
        "texto": "Relaxamento direto do músculo liso das arteríolas"
      },
      {
        "id": "c6",
        "texto": "Dobrar a dose do vasodilatador para controlar a pressão"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "ce-sepse-lesao-endotelial",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Sepse que evolui para choque",
    "paciente": "Dona Cleide, 74 anos",
    "cenario": "Infecção urinária que piorou: confusa, febril, com pressão baixa e pele fria.",
    "vitais": "FC 124 bpm · FR 28 irpm · SpO₂ 93% em ar ambiente · PA 86/50 mmHg · T 38,9°C",
    "estimulo": "Infecção grave com resposta inflamatória sistêmica",
    "contexto": "Monte o circuito. Siga o que a inflamação faz com o endotélio e com o volume.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "O mecanismo provável da progressão da sepse é a lesão endotelial disseminada."
      },
      {
        "id": "consequencia",
        "correta": "c4",
        "explicacao": "O extravasamento causa edema e hipovolemia, e os microtrombos reduzem o aporte de oxigênio aos tecidos."
      },
      {
        "id": "compensacao",
        "correta": "c2",
        "explicacao": "Esses mecanismos juntos levam à hipóxia tissular, à acidose láctica e à morte celular."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "O tratamento baseia-se em reposição volêmica e antibioticoterapia, e a reavaliação orienta a terapia."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Anticoagulante em dose alta como tratamento principal"
      },
      {
        "id": "c2",
        "texto": "Hipóxia tecidual, com acidose láctica e lactato elevado"
      },
      {
        "id": "c3",
        "texto": "Restrição de líquidos para evitar edema"
      },
      {
        "id": "c4",
        "texto": "Edema intersticial, hipovolemia e microtrombos"
      },
      {
        "id": "c5",
        "texto": "Reposição volêmica e antibiótico precoces, com reavaliação frequente"
      },
      {
        "id": "c6",
        "texto": "Lesão endotelial disseminada, com extravasamento de líquido"
      }
    ],
    "fonte": "https://www.scielo.br/j/rbti/a/gdrF6hVjgcxfYc3LWNxxCQS/?lang=pt"
  },
  {
    "id": "ce-sepse-lactato",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Lactato alto na sepse",
    "paciente": "Seu Eduardo, 59 anos",
    "cenario": "Pneumonia grave com choque séptico. O lactato de entrada está elevado e a pele está mosqueada.",
    "vitais": "FC 128 bpm · FR 30 irpm · SpO₂ 90% em ar ambiente · PA 82/48 mmHg · T 39,2°C",
    "estimulo": "Choque séptico com baixa perfusão",
    "contexto": "Monte o circuito. Siga a origem do lactato e o que ele mostra sobre o paciente.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "A hipóxia tecidual global vem da distribuição heterogênea do fluxo microvascular, do baixo fluxo sistêmico e da falência do metabolismo celular."
      },
      {
        "id": "consequencia",
        "correta": "c6",
        "explicacao": "Sem oxigênio, as células produzem energia por via anaeróbia e liberam lactato."
      },
      {
        "id": "compensacao",
        "correta": "c2",
        "explicacao": "O aumento do lactato é muito rápido e proporcional ao defeito oxidativo e à gravidade do choque."
      },
      {
        "id": "intervencao",
        "correta": "c3",
        "explicacao": "A medida seriada do lactato tem valor prognóstico bem estabelecido e mostra se a perfusão melhora."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Dosar o lactato apenas uma vez, na entrada"
      },
      {
        "id": "c2",
        "texto": "O lactato sobe depressa e acompanha a gravidade do choque"
      },
      {
        "id": "c3",
        "texto": "Dosar o lactato em série para avaliar a resposta ao tratamento"
      },
      {
        "id": "c4",
        "texto": "Distribuição irregular do fluxo na microcirculação e baixo fluxo sistêmico"
      },
      {
        "id": "c5",
        "texto": "Lactato alto significa que a perfusão está normal"
      },
      {
        "id": "c6",
        "texto": "Anaerobiose, com aumento do lactato sérico"
      }
    ],
    "fonte": "https://www.scielo.br/j/rbti/a/JSCFFZXBbwP68TxR75GmQdv/?lang=pt"
  },
  {
    "id": "ce-ic-congestao-diuretico",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Insuficiência cardíaca com falta de ar e inchaço",
    "paciente": "Seu Domingos, 72 anos",
    "cenario": "Insuficiência cardíaca. Ganhou 4 kg em uma semana, tem falta de ar deitado e as pernas estão inchadas.",
    "vitais": "FC 104 bpm · FR 26 irpm · SpO₂ 91% em ar ambiente · PA 118/74 mmHg · T 36,5°C",
    "estimulo": "Insuficiência cardíaca descompensada",
    "contexto": "Monte o circuito. Pense no rim, no sal e na água quando o débito cardíaco cai.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "A redução do débito cardíaco leva à retenção de sódio e água pelos rins, o que aumenta a volemia e as pressões de enchimento."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "O excesso de volume e as pressões altas congestionam os pulmões e o corpo."
      },
      {
        "id": "compensacao",
        "correta": "c5",
        "explicacao": "O corpo ativa o sistema renina-angiotensina-aldosterona e o sistema simpático para manter a perfusão."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "Os diuréticos de alça promovem natriurese e diurese, o que alivia a congestão e os sintomas."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Diurético de alça, que inibe o transporte de sódio e cloro na alça de Henle"
      },
      {
        "id": "c2",
        "texto": "Aumentar a ingestão de líquidos para melhorar a circulação"
      },
      {
        "id": "c3",
        "texto": "Congestão pulmonar e sistêmica, com falta de ar e edema"
      },
      {
        "id": "c4",
        "texto": "A queda do débito cardíaco faz o rim reter sódio e água"
      },
      {
        "id": "c5",
        "texto": "A ativação neuro-hormonal e a taquicardia tentam sustentar o débito"
      },
      {
        "id": "c6",
        "texto": "Betabloqueador em dose alta para tirar o líquido dos pulmões"
      }
    ],
    "fonte": "https://scielo.br/j/abc/a/6CWscRNFQdbmnHBVMqjBtfC/?lang=pt"
  },
  {
    "id": "ce-choque-hemorragico",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Trauma com hemorragia e choque",
    "paciente": "Sr. Antônio, 34 anos",
    "cenario": "Ferimento na coxa em acidente de moto, sangramento intenso, pele fria e pálida.",
    "vitais": "FC 128 bpm · FR 24 irpm · SpO₂ 94% em ar ambiente · PA 86/58 mmHg · T 36,0°C",
    "estimulo": "Hemorragia aguda por trauma",
    "contexto": "Monte o circuito. Siga a perda de sangue até o que se deve controlar primeiro.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c2",
        "explicacao": "A perda de sangue reduz o volume dentro dos vasos e a perfusão dos tecidos."
      },
      {
        "id": "consequencia",
        "correta": "c5",
        "explicacao": "Sem perfusão, os tecidos passam a metabolismo anaeróbio e acidose, e a coagulação piora com a perda de fatores e a hipotermia."
      },
      {
        "id": "compensacao",
        "correta": "c6",
        "explicacao": "O corpo acelera o coração e contrai os vasos para sustentar a perfusão; um índice de choque acima de 1 mostra a falha da compensação."
      },
      {
        "id": "intervencao",
        "correta": "c4",
        "explicacao": "A reanimação com controle de danos busca controlar a fonte do sangramento e repor o volume, revertendo hipotermia, hipocalcemia, acidose e coagulopatia."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Aquecer só o membro ferido com compressas quentes"
      },
      {
        "id": "c2",
        "texto": "Queda do volume circulante e da perfusão dos tecidos"
      },
      {
        "id": "c3",
        "texto": "Dar apenas analgésico e observar a evolução"
      },
      {
        "id": "c4",
        "texto": "Controlar o sangramento e repor volume, revertendo hipotermia, acidose e coagulopatia"
      },
      {
        "id": "c5",
        "texto": "Metabolismo anaeróbio, acidose e coagulopatia"
      },
      {
        "id": "c6",
        "texto": "Taquicardia e vasoconstrição tentam manter a pressão"
      }
    ],
    "fonte": "https://www.scielo.br/j/rcbc/a/gsycGkbjmHYMWG8b5CJ4cbR/?lang=pt"
  },
  {
    "id": "ce-diidropiridinico-curta",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Bloqueador de canal de cálcio de ação curta",
    "paciente": "Seu Júlio, 63 anos",
    "cenario": "Hipertenso que usa nifedipino de ação curta. Refere palpitações e dor no peito logo depois das doses.",
    "vitais": "FC 102 bpm · FR 16 irpm · SpO₂ 98% em ar ambiente · PA 138/84 mmHg · T 36,5°C",
    "estimulo": "Diidropiridínico de ação curta",
    "contexto": "Monte o circuito. Pense na queda rápida da pressão e na reação do sistema simpático.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "O diidropiridínico de curta duração dilata as artérias de modo rápido e intenso."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "Os diidropiridínicos de ação curta provocam importante estimulação simpática reflexa."
      },
      {
        "id": "compensacao",
        "correta": "c5",
        "explicacao": "O reflexo acelera o coração e aumenta o trabalho cardíaco, o que explica as palpitações e a dor no peito."
      },
      {
        "id": "intervencao",
        "correta": "c6",
        "explicacao": "Formulações de ação longa evitam picos e reduzem a estimulação simpática reflexa."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Aumentar a dose do nifedipino de ação curta"
      },
      {
        "id": "c2",
        "texto": "Associar um vasodilatador direto"
      },
      {
        "id": "c3",
        "texto": "Estimulação simpática reflexa, deletéria para o sistema cardiovascular"
      },
      {
        "id": "c4",
        "texto": "Vasodilatação rápida pelo bloqueio dos canais de cálcio"
      },
      {
        "id": "c5",
        "texto": "Taquicardia e aumento do consumo de oxigênio do coração"
      },
      {
        "id": "c6",
        "texto": "Trocar por um fármaco de ação longa"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "ce-dm2-resistencia-insulina",
    "versao": 2,
    "revisado": true,
    "tema": "Endócrino e metabólico",
    "titulo": "Diabetes tipo 2: da resistência à hiperglicemia",
    "paciente": "Seu Marcos, 54 anos",
    "cenario": "Obeso, com glicemia de jejum persistentemente alta. Está começando o tratamento do diabetes tipo 2.",
    "vitais": "FC 82 bpm · FR 16 irpm · SpO₂ 98% em ar ambiente · PA 136/84 mmHg · T 36,6°C",
    "estimulo": "Resistência à insulina no diabetes tipo 2",
    "contexto": "Monte o circuito. Siga a insulina, da demanda aumentada ao medicamento de primeira escolha.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "Na resistência insulínica, há aumento da demanda por insulina, e as células beta tentam compensar."
      },
      {
        "id": "consequencia",
        "correta": "c5",
        "explicacao": "O esforço secretor contínuo leva à exaustão funcional e à apoptose das células beta, e o controle glicêmico se perde."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "As células beta conseguem compensar a demanda por adaptações funcionais, até que falham."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "A metformina é a primeira opção e reduz a glicose por vários mecanismos, entre eles diminuir a produção hepática de glicose e aumentar a captação muscular."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Dieta sem carboidrato como único tratamento medicamentoso"
      },
      {
        "id": "c2",
        "texto": "Metformina: reduz a produção hepática de glicose e aumenta a captação muscular"
      },
      {
        "id": "c3",
        "texto": "Sulfonilureia isolada em dose máxima como primeira escolha"
      },
      {
        "id": "c4",
        "texto": "No início, as células beta aumentam a secreção para compensar"
      },
      {
        "id": "c5",
        "texto": "As células beta se esgotam e a insulina deixa de bastar: hiperglicemia persistente"
      },
      {
        "id": "c6",
        "texto": "A resistência à insulina aumenta a demanda por insulina"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2/@@display-file/file"
  },
  {
    "id": "ce-sulfonilureia-hipoglicemia",
    "versao": 2,
    "revisado": true,
    "tema": "Endócrino e metabólico",
    "titulo": "Sulfonilureia e hipoglicemia",
    "paciente": "Dona Neusa, 72 anos",
    "cenario": "Diabética tipo 2 em uso de glibenclamida. Pulou o almoço e chegou suada, tremendo e confusa.",
    "vitais": "FC 100 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 130/80 mmHg · T 36,3°C",
    "estimulo": "Sulfonilureia em idosa que não almoçou",
    "contexto": "Monte o circuito. Siga o que o medicamento faz com a insulina e como evitar.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c5",
        "explicacao": "Esta classe promove a liberação de insulina a partir das células beta pancreáticas."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "A liberação de insulina aumenta o risco de hipoglicemia."
      },
      {
        "id": "compensacao",
        "correta": "c2",
        "explicacao": "O corpo reage à queda da glicose com sinais de alerta do sistema adrenérgico, que antecedem a confusão."
      },
      {
        "id": "intervencao",
        "correta": "c4",
        "explicacao": "A gliclazida de liberação prolongada associa-se a menor taxa de hipoglicemia e é preferível em quem já teve episódios recorrentes."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Aumentar a dose da glibenclamida para melhorar o controle"
      },
      {
        "id": "c2",
        "texto": "Sudorese, tremor e taquicardia por descarga adrenérgica diante da queda da glicose"
      },
      {
        "id": "c3",
        "texto": "Com pouco alimento, o excesso de insulina derruba a glicemia: hipoglicemia"
      },
      {
        "id": "c4",
        "texto": "Preferir a gliclazida de liberação prolongada, de menor taxa de hipoglicemia"
      },
      {
        "id": "c5",
        "texto": "A sulfonilureia estimula as células beta a liberar insulina, com ou sem alimento"
      },
      {
        "id": "c6",
        "texto": "Trocar por insulina em dose alta pela manhã sem monitorar"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2/@@display-file/file"
  },
  {
    "id": "ce-dpoc-tabagismo",
    "versao": 2,
    "revisado": true,
    "tema": "Respiratório",
    "titulo": "Tabagismo e falta de ar crônica",
    "paciente": "Seu Alcides, 66 anos",
    "cenario": "Fuma há 40 anos. Tosse com catarro todo dia e falta de ar ao subir escada. Tórax em barril.",
    "vitais": "FC 88 bpm · FR 22 irpm · SpO₂ 92% em ar ambiente · PA 138/84 mmHg · T 36,7°C",
    "estimulo": "Exposição prolongada à fumaça do cigarro",
    "contexto": "Monte o circuito, do tabaco ao que se faz para frear a doença.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "A DPOC é uma resposta inflamatória anormal, geralmente causada por inalação significativa de partículas ou gases nocivos."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "As alterações nas vias respiratórias e nos alvéolos causam obstrução persistente, confirmada pela espirometria pós-broncodilatador."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "O ar fica retido: a hiperinsuflação e o tórax em barril sinalizam doença em fase avançada."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "O aconselhamento para cessação do tabagismo tem papel fundamental, porque continuar fumando piora o prognóstico e reduz o efeito da medicação."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Cessação do tabagismo, com tratamento broncodilatador"
      },
      {
        "id": "c2",
        "texto": "Corticoide oral contínuo como tratamento de manutenção"
      },
      {
        "id": "c3",
        "texto": "Obstrução crônica ao fluxo de ar, não totalmente reversível (VEF1/CVF abaixo de 0,7)"
      },
      {
        "id": "c4",
        "texto": "Hiperinsuflação pulmonar, tórax em barril e dispneia aos esforços"
      },
      {
        "id": "c5",
        "texto": "Antibiótico contínuo para evitar a inflamação"
      },
      {
        "id": "c6",
        "texto": "Resposta inflamatória anormal nas vias aéreas e nos alvéolos"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/pcdt-da-doenca-pulmonar-obstrutiva-cronica/@@display-file/file"
  },
  {
    "id": "ce-dpoc-hipoxemia-cor-pulmonale",
    "versao": 2,
    "revisado": true,
    "tema": "Respiratório",
    "titulo": "DPOC avançada com inchaço nas pernas",
    "paciente": "Seu Ivo, 70 anos",
    "cenario": "DPOC grave. SpO₂ baixa em repouso, pernas inchadas e veias do pescoço distendidas.",
    "vitais": "FC 96 bpm · FR 24 irpm · SpO₂ 87% em ar ambiente · PA 124/76 mmHg · T 36,5°C",
    "estimulo": "Hipoxemia crônica na DPOC avançada",
    "contexto": "Monte o circuito. Siga o que a falta de oxigênio faz com a circulação do pulmão e com o lado direito do coração.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c1",
        "explicacao": "A DPOC compromete a função pulmonar de forma persistente e progressiva, com queda da oxigenação."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "A hipoxemia crônica eleva a pressão nas artérias do pulmão e sobrecarrega o ventrículo direito."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "O ventrículo direito falha em esvaziar o sangue que volta, e o líquido se acumula nas pernas."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "Com SpO₂ abaixo de 92% indica-se a gasometria, e a hipoxemia com cor pulmonale indica oxigenoterapia."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Obstrução e destruição dos alvéolos reduzem a troca gasosa e causam hipoxemia"
      },
      {
        "id": "c2",
        "texto": "Gasometria e oxigenoterapia crônica quando a SpO₂ está abaixo de 92%"
      },
      {
        "id": "c3",
        "texto": "Hipertensão pulmonar e cor pulmonale, com sobrecarga do coração direito"
      },
      {
        "id": "c4",
        "texto": "Edema de pernas e distensão das veias do pescoço"
      },
      {
        "id": "c5",
        "texto": "Sedativo para reduzir a sensação de falta de ar"
      },
      {
        "id": "c6",
        "texto": "Diurético em dose alta como único tratamento"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/pcdt-da-doenca-pulmonar-obstrutiva-cronica/@@display-file/file"
  },
  {
    "id": "ce-dmg-hiperglicemia-fetal",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Diabetes na gravidez e o bebê grande",
    "paciente": "Priscila, 31 anos",
    "cenario": "Gestante de 28 semanas, com glicemia de jejum alterada e feto acima do percentil esperado para a idade gestacional.",
    "vitais": "FC 88 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 118/76 mmHg · T 36,6°C",
    "estimulo": "Gestação com resistência à insulina crescente",
    "contexto": "Monte o circuito. Siga a glicose da mãe até o feto e o tratamento.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c5",
        "explicacao": "O aporte de nutrientes ao feto é garantido por hormônios placentários diabetogênicos, e a resistência à insulina evolui com a gestação."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "Se o pâncreas materno não consegue produzir a insulina necessária, instala-se a hiperglicemia materna."
      },
      {
        "id": "compensacao",
        "correta": "c2",
        "explicacao": "A hiperglicemia aumenta o risco de crescimento fetal excessivo, distocia de ombros, hipóxia intrauterina e outras repercussões nos filhos."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "O objetivo é manter a normoglicemia, e a insulina é a primeira escolha quando as medidas não medicamentosas não bastam."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Metas de glicemia, dieta e exercício; insulina se as metas não forem atingidas"
      },
      {
        "id": "c2",
        "texto": "O excesso de glicose chega ao feto: crescimento fetal excessivo e risco de distocia de ombros"
      },
      {
        "id": "c3",
        "texto": "Se o pâncreas materno não responde à demanda, instala-se a hiperglicemia"
      },
      {
        "id": "c4",
        "texto": "Suspender o exercício e o monitoramento da glicemia"
      },
      {
        "id": "c5",
        "texto": "Hormônios placentários aumentam a resistência à insulina, que cresce até a 24ª semana"
      },
      {
        "id": "c6",
        "texto": "Dieta com mais carboidratos para ganhar peso fetal"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "ce-sifilis-gestacao",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Sífilis na gestação sem tratamento",
    "paciente": "Camila, 22 anos",
    "cenario": "Gestante de 14 semanas, com teste rápido de sífilis reagente e sem tratamento até agora.",
    "vitais": "FC 80 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 110/70 mmHg · T 36,5°C",
    "estimulo": "Sífilis materna não tratada",
    "contexto": "Monte o circuito. Siga o treponema até o feto e o tratamento que o impede.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "A principal via de transmissão é a transplacentária."
      },
      {
        "id": "consequencia",
        "correta": "c1",
        "explicacao": "A transmissão pode causar abortos, óbitos fetais e neonatais, prematuridade e recém-nascidos com sequelas."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "No primeiro trimestre o feto ainda não desenvolveu a reação inflamatória ao T. pallidum que causa as lesões, por isso tratar cedo previne a infecção fetal."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "A penicilina é o único tratamento comprovado para o feto; na fase primária, secundária e latência recente, a dose é única de 2.400.000 UI."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Aborto, óbito fetal, prematuridade ou sífilis congênita"
      },
      {
        "id": "c2",
        "texto": "Penicilina benzatina 2.400.000 UI (duas injeções de 1.200.000 UI) na fase recente"
      },
      {
        "id": "c3",
        "texto": "Azitromicina em dose única, porque a penicilina não atravessa a placenta"
      },
      {
        "id": "c4",
        "texto": "A reação inflamatória fetal ao treponema, que só se forma mais tarde, causa as lesões"
      },
      {
        "id": "c5",
        "texto": "Aguardar o parto para tratar o recém-nascido"
      },
      {
        "id": "c6",
        "texto": "Passagem do treponema pela placenta (transmissão transplacentária)"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "ce-anemia-ferropriva-gestacao",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Anemia por falta de ferro na gravidez",
    "paciente": "Débora, 25 anos",
    "cenario": "Gestante de 20 semanas, pálida, cansada, com sopro sistólico suave. Hemograma com VCM baixo.",
    "vitais": "FC 96 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 108/66 mmHg · T 36,5°C",
    "estimulo": "Gestação com pouca oferta de ferro",
    "contexto": "Monte o circuito. Siga o ferro, do déficit ao hemograma e à suplementação.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c2",
        "explicacao": "Sem ferro, a medula produz menos hemoglobina e hemácias menores."
      },
      {
        "id": "consequencia",
        "correta": "c4",
        "explicacao": "A anemia por deficiência de ferro manifesta-se, via de regra, com microcitose e hipocromia."
      },
      {
        "id": "compensacao",
        "correta": "c6",
        "explicacao": "O sangue leva menos oxigênio e o coração aumenta o fluxo, o que explica os sintomas e o sopro."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "A suplementação rotineira de 30 a 40 mg/dia é recomendada para praticamente todas as gestantes, de preferência entre as refeições ou ao deitar."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Suplementação de ferro elementar de 30 a 40 mg/dia, longe das refeições"
      },
      {
        "id": "c2",
        "texto": "Deficiência de ferro, que reduz a produção de hemoglobina"
      },
      {
        "id": "c3",
        "texto": "Ferro junto de polivitamínicos para absorver melhor"
      },
      {
        "id": "c4",
        "texto": "Anemia ferropriva com microcitose e hipocromia (VCM abaixo de 80 fL e HCM abaixo de 26 pg)"
      },
      {
        "id": "c5",
        "texto": "Transfusão de sangue na primeira consulta com anemia leve"
      },
      {
        "id": "c6",
        "texto": "Palidez, astenia, cansaço fácil e sopro sistólico suave"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "ce-hellp",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Pré-eclâmpsia grave com plaquetas baixas",
    "paciente": "Joana, 34 anos",
    "cenario": "Gestante de 33 semanas com pré-eclâmpsia. Dor no alto da barriga, náusea e plaquetas de 80.000/mm³.",
    "vitais": "FC 104 bpm · FR 20 irpm · SpO₂ 97% em ar ambiente · PA 164/108 mmHg · T 36,8°C",
    "estimulo": "Pré-eclâmpsia grave",
    "contexto": "Monte o circuito. Siga o comprometimento do fígado e do sangue até o que muda o desfecho.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "A síndrome HELLP é o comprometimento hépato-hematológico da pré-eclâmpsia, ligada à anemia hemolítica microangiopática e ao vasoespasmo no fígado."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "O nome resume os três achados: hemólise, aumento de enzimas hepáticas e plaquetopenia."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "A clínica costuma ser pobre, com mal-estar, epigastralgia, náuseas e cefaleia."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "O fator mais importante para reduzir a morbimortalidade materna é o diagnóstico precoce, que antecipa as complicações."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Tratar como hepatite aguda comum, sem avaliar a pré-eclâmpsia"
      },
      {
        "id": "c2",
        "texto": "Liberar a gestante com anti-hipertensivo oral e retorno em uma semana"
      },
      {
        "id": "c3",
        "texto": "Hemólise, enzimas hepáticas elevadas e plaquetas baixas (HELLP)"
      },
      {
        "id": "c4",
        "texto": "Epigastralgia, mal-estar e náuseas, sintomas pobres que levantam a suspeita"
      },
      {
        "id": "c5",
        "texto": "Diagnóstico precoce, antes das complicações"
      },
      {
        "id": "c6",
        "texto": "Anemia hemolítica microangiopática e vasoespasmo no fígado materno"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "ce-sepse-civd",
    "versao": 2,
    "revisado": true,
    "tema": "Hematológico",
    "titulo": "Sepse com sangramento nas punções",
    "paciente": "Seu Alberto, 63 anos",
    "cenario": "Choque séptico há horas. Plaquetas baixas e sangramento nos locais de punção.",
    "vitais": "FC 122 bpm · FR 28 irpm · SpO₂ 92% em ar ambiente · PA 84/48 mmHg · T 38,7°C",
    "estimulo": "Sepse grave com ativação intensa da coagulação",
    "contexto": "Monte o circuito. Siga a coagulação, do estímulo ao tratamento.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c2",
        "explicacao": "A coagulação é ativada pelo fator tecidual, e a antitrombina III e a proteína C, que a freiam, são inibidas."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "Surge a CIVD, com formação de fibrina na microvasculatura e consumo de plaquetas."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "O fluxo para os tecidos piora e o consumo de plaquetas e fibrina causa sangramento."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "As medidas se baseiam em reposição volêmica, antibioticoterapia e tratamento anticoagulante, entre outras."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Tratar o foco com antibiótico e reposição volêmica, e considerar o tratamento anticoagulante"
      },
      {
        "id": "c2",
        "texto": "Ativação do fator tecidual e perda dos anticoagulantes naturais"
      },
      {
        "id": "c3",
        "texto": "CIVD: fibrina na microcirculação e consumo de plaquetas"
      },
      {
        "id": "c4",
        "texto": "Obstrução do fluxo para os órgãos e hemorragias graves por consumo de plaquetas e fibrina"
      },
      {
        "id": "c5",
        "texto": "Dar plaquetas e suspender o antibiótico"
      },
      {
        "id": "c6",
        "texto": "Corticoide isolado para parar o sangramento"
      }
    ],
    "fonte": "https://www.scielo.br/j/rbti/a/gdrF6hVjgcxfYc3LWNxxCQS/?lang=pt"
  },
  {
    "id": "ce-cad-cetose",
    "versao": 2,
    "revisado": true,
    "tema": "Endócrino e metabólico",
    "titulo": "Cetoacidose: da falta de insulina à desidratação",
    "paciente": "Gabriel, 19 anos",
    "cenario": "Diabético tipo 1 que parou a insulina. Vômitos, dor abdominal, respiração profunda e hálito cetônico.",
    "vitais": "FC 118 bpm · FR 28 irpm · SpO₂ 98% em ar ambiente · PA 98/60 mmHg · T 36,8°C",
    "estimulo": "Falta de insulina no diabetes tipo 1",
    "contexto": "Monte o circuito. Siga a insulina que falta, o que o corpo queima no lugar da glicose e como se trata.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c5",
        "explicacao": "Sem insulina, o organismo favorece processos catabólicos: lipólise, proteólise e glicogenólise."
      },
      {
        "id": "consequencia",
        "correta": "c4",
        "explicacao": "A lipólise libera ácidos graxos livres, oxidados no fígado, e o excesso gera cetoácidos e acidose."
      },
      {
        "id": "compensacao",
        "correta": "c1",
        "explicacao": "A glicose acima do limiar renal arrasta água na urina; é a principal causa de perda de fluidos na CAD."
      },
      {
        "id": "intervencao",
        "correta": "c3",
        "explicacao": "O tratamento tem três pilares: repor volume, dar insulina e corrigir os eletrólitos."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Glicosúria e diurese osmótica: perda de volume e desidratação"
      },
      {
        "id": "c2",
        "texto": "Bicarbonato em bolus como primeira medida, sem hidratar"
      },
      {
        "id": "c3",
        "texto": "Hidratação, insulinoterapia e correção dos distúrbios hidroeletrolíticos"
      },
      {
        "id": "c4",
        "texto": "Ácidos graxos livres são oxidados no fígado e geram cetonas: acidose metabólica"
      },
      {
        "id": "c5",
        "texto": "Insulinopenia: o corpo entra em estado catabólico, com lipólise e glicogenólise"
      },
      {
        "id": "c6",
        "texto": "Restrição de líquidos para evitar edema"
      }
    ],
    "fonte": "https://www.scielo.br/j/abem/a/yk7dNDjrkBbBcjvq8C8TFLv/?lang=pt"
  },
  {
    "id": "ce-cad-potassio",
    "versao": 2,
    "revisado": true,
    "tema": "Endócrino e metabólico",
    "titulo": "Cetoacidose e o potássio",
    "paciente": "Letícia, 24 anos",
    "cenario": "Cetoacidose em tratamento. O potássio inicial veio normal, mas a insulina acabou de começar.",
    "vitais": "FC 110 bpm · FR 24 irpm · SpO₂ 99% em ar ambiente · PA 104/62 mmHg · T 36,7°C",
    "estimulo": "Início da insulinoterapia na cetoacidose",
    "contexto": "Monte o circuito. Siga o potássio do sangue para dentro da célula e o que fazer.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "Sem insulina, o potássio permanece no meio extracelular, e o valor sérico não mostra o déficit total do corpo."
      },
      {
        "id": "consequencia",
        "correta": "c5",
        "explicacao": "A insulinoterapia desloca o potássio do meio extracelular para o intracelular."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "Com o potássio caindo no sangue, a hipocalemia grave pode provocar arritmias."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "A reposição começa na primeira diurese, guiada pelo nível sérico, com ECG durante a infusão."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Repor potássio assim que houver diurese, com monitorização eletrocardiográfica"
      },
      {
        "id": "c2",
        "texto": "Dar potássio apenas depois de normalizar o pH"
      },
      {
        "id": "c3",
        "texto": "Suspender a insulina e repor volume até a diurese cessar"
      },
      {
        "id": "c4",
        "texto": "Risco de hipocalemia grave e de arritmia"
      },
      {
        "id": "c5",
        "texto": "A insulina leva o potássio de volta para dentro das células"
      },
      {
        "id": "c6",
        "texto": "A insulinopenia mantém o potássio fora das células e o potássio sérico engana"
      }
    ],
    "fonte": "https://www.scielo.br/j/abem/a/yk7dNDjrkBbBcjvq8C8TFLv/?lang=pt"
  },
  {
    "id": "ce-tep-ventriculo-direito",
    "versao": 2,
    "revisado": true,
    "tema": "Respiratório",
    "titulo": "Embolia pulmonar com choque",
    "paciente": "Dona Rita, 58 anos",
    "cenario": "Pós-operatório de quadril. Dispneia súbita, hipotensão e veias do pescoço distendidas.",
    "vitais": "FC 126 bpm · FR 30 irpm · SpO₂ 86% em ar ambiente · PA 82/50 mmHg · T 36,9°C",
    "estimulo": "Êmbolo obstruindo a artéria pulmonar",
    "contexto": "Monte o circuito. Siga a resistência do pulmão, o coração direito e a reperfusão.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c1",
        "explicacao": "A obstrução e a vasoconstrição por disfunção endotelial aumentam de súbito a pós-carga do ventrículo direito."
      },
      {
        "id": "consequencia",
        "correta": "c2",
        "explicacao": "A pressão pulmonar alta é transmitida à parede do VD, que dilata e contrai pior (Frank-Starling)."
      },
      {
        "id": "compensacao",
        "correta": "c5",
        "explicacao": "O VD falho não envia sangue suficiente ao lado esquerdo, e a pressão arterial cai."
      },
      {
        "id": "intervencao",
        "correta": "c6",
        "explicacao": "No TEP com hipotensão, desobstruir o pulmão alivia o VD e restaura a hemodinâmica."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Obstrução da artéria e vasoconstrição elevam de repente a resistência vascular pulmonar"
      },
      {
        "id": "c2",
        "texto": "O ventrículo direito se dilata e perde eficiência contrátil"
      },
      {
        "id": "c3",
        "texto": "Volume em grande quantidade para distender o ventrículo direito"
      },
      {
        "id": "c4",
        "texto": "Apenas oxigênio e observação até o resultado da cintilografia"
      },
      {
        "id": "c5",
        "texto": "Débito cardíaco cai: hipotensão e choque obstrutivo"
      },
      {
        "id": "c6",
        "texto": "Reperfusão pulmonar imediata para reduzir a pós-carga do VD"
      }
    ],
    "fonte": "https://www.scielo.br/j/jbpneu/a/KfVmdJn7P393GhnWkZmkrtf/?lang=pt"
  },
  {
    "id": "ce-falciforme-vasoclusao",
    "versao": 2,
    "revisado": true,
    "tema": "Hematológico",
    "titulo": "Anemia falciforme e a crise de dor",
    "paciente": "Joana, 12 anos",
    "cenario": "Anemia falciforme. Dor intensa nos ossos e nas costas após dia frio e pouca água.",
    "vitais": "FC 112 bpm · FR 24 irpm · SpO₂ 95% em ar ambiente · PA 104/64 mmHg · T 37,8°C",
    "estimulo": "Hemoglobina S em baixa oxigenação",
    "contexto": "Monte o circuito. Siga a hemoglobina anormal até a dor.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "Após a queda do oxigênio tecidual, a HbS polimeriza e distorce a membrana do glóbulo vermelho."
      },
      {
        "id": "consequencia",
        "correta": "c1",
        "explicacao": "Perdem a capacidade de deformar para fluir pelos vasos pequenos."
      },
      {
        "id": "compensacao",
        "correta": "c3",
        "explicacao": "O bloqueio do fluxo causa isquemia, inflamação e dor."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "O manejo da crise combate a polimerização: repor líquidos, tratar a dor e evitar a hipóxia."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "As hemácias ficam densas e rígidas e não passam pela microcirculação"
      },
      {
        "id": "c2",
        "texto": "Restringir líquidos e aplicar compressa fria no local da dor"
      },
      {
        "id": "c3",
        "texto": "Vaso-oclusão, isquemia e dano tecidual: a crise álgica"
      },
      {
        "id": "c4",
        "texto": "Com pouco oxigênio, a hemoglobina S polimeriza e deforma a hemácia em foice"
      },
      {
        "id": "c5",
        "texto": "Hidratação, analgesia e oxigênio quando houver hipoxemia"
      },
      {
        "id": "c6",
        "texto": "Transfusão de plaquetas como tratamento da dor"
      }
    ],
    "fonte": "https://www.scielo.br/j/jvb/a/SVCg83xq3YYZx8SYxGBQL5G/?lang=pt"
  },
  {
    "id": "ce-falciforme-hemolise-no",
    "versao": 2,
    "revisado": true,
    "tema": "Hematológico",
    "titulo": "Hemólise e perda de óxido nítrico",
    "paciente": "Seu Vicente, 30 anos",
    "cenario": "Anemia falciforme com icterícia, hipertensão pulmonar e uma úlcera de perna que não cicatriza.",
    "vitais": "FC 96 bpm · FR 20 irpm · SpO₂ 94% em ar ambiente · PA 112/70 mmHg · T 36,8°C",
    "estimulo": "Hemólise intravascular crônica",
    "contexto": "Monte o circuito. Siga a hemoglobina livre no plasma e o que ela faz com o vaso.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c2",
        "explicacao": "A destruição das hemácias dentro dos vasos joga hemoglobina livre na circulação."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "Sem o ON, o vaso perde a ação vasodilatadora."
      },
      {
        "id": "compensacao",
        "correta": "c6",
        "explicacao": "A perda do ON intensifica a vasoconstrição, a hipóxia e a dor."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "A vasculopatia da doença falciforme explica complicações em vários órgãos."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Vasculopatia: hipertensão pulmonar, AVC isquêmico, priapismo e úlcera de perna"
      },
      {
        "id": "c2",
        "texto": "A hemólise intravascular libera hemoglobina livre no plasma"
      },
      {
        "id": "c3",
        "texto": "A hemoglobina livre sequestra o óxido nítrico, vasodilatador do endotélio"
      },
      {
        "id": "c4",
        "texto": "Anticoagulação plena para impedir a hemólise"
      },
      {
        "id": "c5",
        "texto": "Aumentar a oferta de ferro para repor a hemoglobina perdida"
      },
      {
        "id": "c6",
        "texto": "Vasoconstrição crônica, hipóxia e dor"
      }
    ],
    "fonte": "https://www.scielo.br/j/jvb/a/SVCg83xq3YYZx8SYxGBQL5G/?lang=pt"
  },
  {
    "id": "ce-ascite-vasodilatacao",
    "versao": 2,
    "revisado": true,
    "tema": "Gastrointestinal",
    "titulo": "Cirrose e a barriga d'água",
    "paciente": "Seu Osvaldo, 57 anos",
    "cenario": "Cirrótico com abdome distendido e macicez móvel. Edema nas pernas.",
    "vitais": "FC 92 bpm · FR 18 irpm · SpO₂ 97% em ar ambiente · PA 104/62 mmHg · T 36,6°C",
    "estimulo": "Cirrose com hipertensão portal",
    "contexto": "Monte o circuito. Siga a circulação do cirrótico até o tratamento.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c1",
        "explicacao": "A vasodilatação esplâncnica reduz o volume circulante efetivo desde o início da doença."
      },
      {
        "id": "consequencia",
        "correta": "c6",
        "explicacao": "O balanço positivo de sódio vira ascite e edema periférico."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "O ADH alto prejudica a excreção de água livre e derruba o sódio."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "A remoção da ascite exige balanço negativo de sódio; na fase inicial a espironolactona basta."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "A teoria da vasodilatação: a circulação arterial se dilata desde a fase pré-ascítica"
      },
      {
        "id": "c2",
        "texto": "Restringir o sódio e dar soro glicosado em grande volume"
      },
      {
        "id": "c3",
        "texto": "Tratar com betabloqueador em dose alta para reduzir a pressão arterial"
      },
      {
        "id": "c4",
        "texto": "Surge o excesso de ADH, que retém água livre: hiponatremia"
      },
      {
        "id": "c5",
        "texto": "Restrição de sódio e espironolactona; alça de furosemida na ascite mais antiga"
      },
      {
        "id": "c6",
        "texto": "O rim retém sódio e água e o líquido se acumula na cavidade peritoneal: ascite"
      }
    ],
    "fonte": "https://www.scielo.br/j/ramb/a/bhH9F9xSpJfDD9NXdTRg59L/?lang=pt"
  },
  {
    "id": "ce-ascite-hiponatremia",
    "versao": 2,
    "revisado": true,
    "tema": "Gastrointestinal",
    "titulo": "Ascite com sódio baixo",
    "paciente": "Dona Zilda, 62 anos",
    "cenario": "Cirrose com ascite, em uso de diurético. Sódio sérico baixo, mas sem edema novo.",
    "vitais": "FC 88 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 100/60 mmHg · T 36,5°C",
    "estimulo": "Cirrose com ascite e uso de diurético",
    "contexto": "Monte o circuito. Siga o hormônio que retém água e a conduta.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "O ADH está elevado na cirrose com ascite."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "O rim passa a reter água livre."
      },
      {
        "id": "compensacao",
        "correta": "c1",
        "explicacao": "Com mais água do que sal, o sódio sérico cai."
      },
      {
        "id": "intervencao",
        "correta": "c4",
        "explicacao": "A restrição hídrica orienta o tratamento, e o diurético é suspenso se houver hiponatremia grave."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Hiponatremia por diluição"
      },
      {
        "id": "c2",
        "texto": "Soro fisiológico em grande volume para corrigir o sódio"
      },
      {
        "id": "c3",
        "texto": "Queda na excreção de água livre"
      },
      {
        "id": "c4",
        "texto": "Restrição de água livre; suspender o diurético se o sódio cair muito"
      },
      {
        "id": "c5",
        "texto": "Aumentar a dose de espironolactona e liberar líquidos"
      },
      {
        "id": "c6",
        "texto": "Níveis altos de ADH"
      }
    ],
    "fonte": "https://www.scielo.br/j/ramb/a/bhH9F9xSpJfDD9NXdTRg59L/?lang=pt"
  },
  {
    "id": "ce-ira-hipovolemia-nta",
    "versao": 2,
    "revisado": true,
    "tema": "Renal e urinário",
    "titulo": "Hipovolemia que vira lesão renal",
    "paciente": "Seu Raul, 71 anos",
    "cenario": "Séptico na UTI, com urina escassa e creatinina subindo a cada dia.",
    "vitais": "FC 118 bpm · FR 26 irpm · SpO₂ 94% em ar ambiente · PA 88/50 mmHg · T 38,4°C",
    "estimulo": "Hipovolemia e hipoperfusão na sepse",
    "contexto": "Monte o circuito. Siga o rim, do fluxo reduzido à necrose.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "Sepse, cirurgia e trauma causam hipovolemia e hipoperfusão."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "No início o dano é funcional e reversível."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "A azotemia pré-renal se torna constante, e a lesão evolui para NTA."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "O choque séptico é o fator que mais contribui para a IRA em UTI."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Restringir o volume para preservar o rim"
      },
      {
        "id": "c2",
        "texto": "Tratar o choque séptico e restabelecer a perfusão renal"
      },
      {
        "id": "c3",
        "texto": "Azotemia pré-renal transitória"
      },
      {
        "id": "c4",
        "texto": "Se a hipoperfusão persiste: lesão celular isquêmica e necrose tubular aguda"
      },
      {
        "id": "c5",
        "texto": "Dar anti-inflamatório não esteroide para reduzir a febre"
      },
      {
        "id": "c6",
        "texto": "Hipovolemia gera hipoperfusão de vários órgãos, inclusive dos rins"
      }
    ],
    "fonte": "https://www.scielo.br/j/jbn/a/8X55FWkGzxNH4s3nchLgYbh/?lang=pt"
  },
  {
    "id": "ce-malaria-citoaderencia",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Malária grave e a microcirculação",
    "paciente": "Seu Adão, 40 anos",
    "cenario": "Garimpeiro com febre há dias em área endêmica, agora confuso e com icterícia.",
    "vitais": "FC 112 bpm · FR 26 irpm · SpO₂ 93% em ar ambiente · PA 96/58 mmHg · T 39,4°C",
    "estimulo": "Infecção grave por Plasmodium falciparum",
    "contexto": "Monte o circuito. Siga a aderência das hemácias até o tratamento.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c1",
        "explicacao": "Proteínas do parasita na superfície das hemácias promovem a citoaderência e as rosetas."
      },
      {
        "id": "consequencia",
        "correta": "c3",
        "explicacao": "Os agregados interferem na microcirculação e as hemácias rígidas dificultam o fluxo."
      },
      {
        "id": "compensacao",
        "correta": "c4",
        "explicacao": "A má perfusão gera as manifestações da malária grave."
      },
      {
        "id": "intervencao",
        "correta": "c5",
        "explicacao": "O artesunato é o esquizonticida mais rápido e o tratamento precoce impacta a sobrevida."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Hemácias infectadas aderem ao endotélio (citoaderência) e a outras hemácias, formando rosetas"
      },
      {
        "id": "c2",
        "texto": "Antibiótico de amplo espectro isolado, sem antimalárico"
      },
      {
        "id": "c3",
        "texto": "Agregados celulares e hemácias rígidas obstruem a microcirculação"
      },
      {
        "id": "c4",
        "texto": "Disfunção de vários órgãos: malária cerebral, insuficiência renal e choque"
      },
      {
        "id": "c5",
        "texto": "Derivados da artemisinina (artesunato) por via venosa, com suporte intensivo"
      },
      {
        "id": "c6",
        "texto": "Cloroquina por via oral e alta no mesmo dia"
      }
    ],
    "fonte": "https://www.scielo.br/j/rbti/a/fF8CRKZ9TBX6X8MD4WvVTqS/?lang=pt"
  },
  {
    "id": "ce-malaria-anemia",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Malária e anemia",
    "paciente": "Maria, 8 anos",
    "cenario": "Febre intermitente em área endêmica. Muito pálida, taquicárdica, hematócrito baixo.",
    "vitais": "FC 130 bpm · FR 28 irpm · SpO₂ 96% em ar ambiente · PA 90/54 mmHg · T 39,0°C",
    "estimulo": "Parasitemia por P. falciparum",
    "contexto": "Monte o circuito. Siga a destruição das hemácias.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c3",
        "explicacao": "A anemia grave da malária decorre da destruição ou sequestro das hemácias."
      },
      {
        "id": "consequencia",
        "correta": "c5",
        "explicacao": "As citocinas pioram a produção de novas hemácias."
      },
      {
        "id": "compensacao",
        "correta": "c6",
        "explicacao": "A anemia é uma das manifestações mais frequentes e precoces da malária grave."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "A conduta combina antimalárico e suporte."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Tratar o parasita e dar suporte, inclusive transfusão quando indicada"
      },
      {
        "id": "c2",
        "texto": "Esplenectomia imediata para controlar a anemia"
      },
      {
        "id": "c3",
        "texto": "O parasita destrói e sequestra os eritrócitos"
      },
      {
        "id": "c4",
        "texto": "Suplementação de ferro isolada como único tratamento"
      },
      {
        "id": "c5",
        "texto": "A inflamação (IL-6, TNF) reduz o ferro disponível e inibe a eritropoese"
      },
      {
        "id": "c6",
        "texto": "Anemia grave, precoce e frequente"
      }
    ],
    "fonte": "https://www.scielo.br/j/rbti/a/fF8CRKZ9TBX6X8MD4WvVTqS/?lang=pt"
  },
  {
    "id": "ce-chagas-miocardiopatia",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Chagas crônica e o coração aumentado",
    "paciente": "Seu Nilton, 55 anos",
    "cenario": "Veio do interior da Bahia, com cansaço aos esforços e palpitações. Raio X com coração grande.",
    "vitais": "FC 104 bpm · FR 20 irpm · SpO₂ 95% em ar ambiente · PA 108/70 mmHg · T 36,6°C",
    "estimulo": "Infecção chagásica de longa data",
    "contexto": "Monte o circuito. Siga a inflamação, a fibrose e a falência.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c4",
        "explicacao": "A persistência parasitária mantém uma reação imunopatológica contínua."
      },
      {
        "id": "consequencia",
        "correta": "c6",
        "explicacao": "A cardiopatia chagásica crônica é essencialmente uma miocardiopatia dilatada."
      },
      {
        "id": "compensacao",
        "correta": "c3",
        "explicacao": "O dano miocárdico progressivo leva à falência de ambos os ventrículos e às arritmias."
      },
      {
        "id": "intervencao",
        "correta": "c1",
        "explicacao": "O benznidazol é um dos dois fármacos comprovadamente tripanosomicidas."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Tratamento da insuficiência cardíaca e do parasita (benznidazol)"
      },
      {
        "id": "c2",
        "texto": "Corticoide em dose imunossupressora para conter a inflamação"
      },
      {
        "id": "c3",
        "texto": "Insuficiência cardíaca dilatada, biventricular, e risco de arritmia ventricular e morte súbita"
      },
      {
        "id": "c4",
        "texto": "Inflamação crônica, de baixa intensidade mas incessante, mantida pelo parasita"
      },
      {
        "id": "c5",
        "texto": "Anticoagulação plena como único tratamento"
      },
      {
        "id": "c6",
        "texto": "Destruição tecidual progressiva e fibrose extensa do miocárdio"
      }
    ],
    "fonte": "https://www.scielo.br/j/abc/a/pMFYVgNkwkgDMPbyrhZmZKR/"
  },
  {
    "id": "ce-avc-penumbra",
    "versao": 2,
    "revisado": true,
    "tema": "Neurológico",
    "titulo": "AVC isquêmico e a janela de tempo",
    "paciente": "Dona Cida, 66 anos",
    "cenario": "Fraqueza súbita no braço direito e fala arrastada há uma hora. Chegou de ambulância, TC sem sangramento.",
    "vitais": "FC 88 bpm · FR 18 irpm · SpO₂ 97% em ar ambiente · PA 168/94 mmHg · T 36,6°C",
    "estimulo": "Oclusão arterial cerebral",
    "contexto": "Monte o circuito. Siga a falta de fluxo, a área em risco e o tempo.",
    "elos": [
      {
        "id": "mecanismo",
        "correta": "c6",
        "explicacao": "As consequências celulares ocorrem em rápida sequência."
      },
      {
        "id": "consequencia",
        "correta": "c1",
        "explicacao": "A penumbra mantém viabilidade por tempo limitado."
      },
      {
        "id": "compensacao",
        "correta": "c3",
        "explicacao": "Cada minuto sem reperfusão reduz a área salvável."
      },
      {
        "id": "intervencao",
        "correta": "c2",
        "explicacao": "O rtPA nas primeiras três horas reduziu a incapacidade funcional."
      }
    ],
    "cartas": [
      {
        "id": "c1",
        "texto": "Morte celular no centro do infarto, com área de penumbra ainda viável ao redor"
      },
      {
        "id": "c2",
        "texto": "rtPA venoso dentro de 3 horas do início, após TC sem hemorragia"
      },
      {
        "id": "c3",
        "texto": "O tempo conta: o déficit piora conforme a penumbra se perde"
      },
      {
        "id": "c4",
        "texto": "Anti-hipertensivo em dose alta para normalizar a pressão de imediato"
      },
      {
        "id": "c5",
        "texto": "Aguardar 24 horas para iniciar tratamento"
      },
      {
        "id": "c6",
        "texto": "A isquemia causa falência energética, liberação de aminoácidos excitatórios e radicais livres"
      }
    ],
    "fonte": "https://scielo.br/j/anp/a/kYmfDTsc3bYT48sgNCQ8gVR/?lang=pt"
  }
];
