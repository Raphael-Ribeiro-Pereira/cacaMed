// Auditorias do Erro médico (formato v2, 13/10/2026): cada uma tem o seu próprio caso. Novos lotes entram por
// `node scripts/integrar-ddx.mjs erro content/approved/lote.json`. Revisão clínica: `revisado` só vira true com a aprovação.
export const AUDITORIAS = [
  {
    "id": "aud-asma-alta-1",
    "versao": 2,
    "revisado": false,
    "tema": "Respiratório",
    "titulo": "Alta depois de crise de falta de ar",
    "paciente": "Marina, 28 anos",
    "cenario": "Crise de asma atendida no pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois da alta. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "08:10 — Paciente chegou com falta de ar e chiado. Sinais vitais registrados.",
      "08:12 — Estava consciente e falava frases completas, com esforço respiratório leve.",
      "08:15 — Relatou asma, interrupção do controlador e ausência de alergias conhecidas.",
      "08:18 — Ausculta com sibilos difusos; PFE de 65% do melhor valor pessoal.",
      "08:20 — Tratamento de alívio iniciado e corticoide sistêmico avaliado conforme protocolo.",
      "08:22 — Recebeu alta sem registro de resposta ao tratamento, reavaliação ou plano de ação."
    ],
    "falha": {
      "linha": 6,
      "categoria": "omissao",
      "correcao": "k1",
      "explicacoes": {
        "linha": "O registro das 08:22 mostra alta dois minutos depois de iniciar o tratamento, sem resposta documentada. As demais linhas estão dentro do esperado.",
        "categoria": "Faltou a reavaliação depois do tratamento e o plano de ação: é omissão de cuidado, não um erro de dose ou de horário.",
        "correcao": "A alta depende de observar a resposta, reavaliar a gravidade e registrar os critérios e as orientações."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Observar a resposta ao tratamento, reavaliar a gravidade e registrar os critérios de alta e as orientações"
      },
      {
        "id": "k2",
        "texto": "Pedir tomografia de tórax de rotina antes de qualquer alta"
      },
      {
        "id": "k3",
        "texto": "Suspender o tratamento para completar o registro"
      }
    ],
    "fonte": "https://ginasthma.org/reports/"
  },
  {
    "id": "aud-dengue-reavaliacao",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Hidratação sem reavaliação na dengue",
    "paciente": "Dona Marta, 47 anos",
    "cenario": "Dengue com sinal de alarme atendida no pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "08:10 — Chegou no 5º dia de febre, que cedeu ontem, com dor abdominal contínua e tontura ao levantar.",
      "08:15 — Hipotensão postural. Classificada como grupo C (sinal de alarme).",
      "08:20 — Iniciado soro fisiológico 0,9%, 10 mL/kg na primeira hora.",
      "08:30 — Solicitados hemograma completo, albumina e transaminases.",
      "08:45 — Amostras colhidas e enviadas ao laboratório.",
      "10:00 — Hemograma recebido e arquivado. Sem registro de sinais vitais, diurese ou novo hematócrito desde o início da hidratação."
    ],
    "falha": {
      "linha": 6,
      "categoria": "omissao",
      "correcao": "k1",
      "explicacoes": {
        "linha": "O registro das 10:00 mostra duas horas sem reavaliação depois de iniciar a reposição de volume. As linhas anteriores seguem o grupo C.",
        "categoria": "Faltou a reavaliação programada (sinais vitais, pressão, diurese e hematócrito): é omissão de cuidado, não erro de dose nem de horário.",
        "correcao": "No grupo C, reavalia-se após a primeira hora (sinais vitais, pressão e diurese) e o hematócrito em duas horas; sem melhora, repete-se a fase de expansão."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Reavaliar sinais vitais e diurese após a primeira hora e repetir o hematócrito em duas horas"
      },
      {
        "id": "k2",
        "texto": "Dar alta com hidratação oral em casa porque o hemograma já foi colhido"
      },
      {
        "id": "k3",
        "texto": "Suspender a hidratação até o hematócrito voltar ao normal"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-dengue-atraso-reposicao",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Espera pelo hemograma no grupo C",
    "paciente": "Seu Valter, 52 anos",
    "cenario": "Dengue com sinais de alarme no pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Chegou com vômitos persistentes, dor abdominal intensa e hipotensão postural.",
      "09:10 — Classificado como grupo C. Solicitados hemograma e albumina.",
      "09:20 — Mantido na maca, sem soro, aguardando o resultado do hemograma.",
      "10:40 — Hemograma com hematócrito em alta.",
      "10:45 — Iniciado soro fisiológico 0,9%, 10 mL/kg na primeira hora.",
      "11:45 — Reavaliado: pressão em melhora e diurese presente."
    ],
    "falha": {
      "linha": 3,
      "categoria": "atraso",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A linha das 09:20 mostra que a hidratação ficou parada mais de uma hora esperando exame. O restante da sequência está correto, mas começou tarde.",
        "categoria": "O cuidado correto foi feito, só que tarde: é atraso. A reposição só começou às 10:45, depois do resultado do exame.",
        "correcao": "No grupo C a reposição de volume é imediata, em qualquer ponto de atenção, mesmo sem exames complementares."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Trocar a reposição por hidratação oral até o exame ficar pronto"
      },
      {
        "id": "k2",
        "texto": "Iniciar a reposição volêmica imediata, sem esperar o resultado dos exames"
      },
      {
        "id": "k3",
        "texto": "Esperar o hematócrito e só então decidir se hidrata"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-dengue-aas",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Dengue leve com AAS na receita",
    "paciente": "Rafael, 26 anos",
    "cenario": "Dengue sem sinais de alarme atendida na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "08:20 — Chegou no 3º dia de febre alta, dor atrás dos olhos e dor no corpo.",
      "08:30 — Sem sinais de alarme e prova do laço negativa. Classificado como grupo A.",
      "08:40 — Prescrita hidratação oral e orientado repouso.",
      "08:45 — Prescrito AAS para a dor no corpo e a febre.",
      "08:50 — Orientado a procurar o serviço se surgirem sinais de alarme ou sangramento.",
      "08:55 — Caso suspeito notificado."
    ],
    "falha": {
      "linha": 4,
      "categoria": "conduta",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A prescrição das 08:45 é a única que foge do manual. As demais linhas seguem o grupo A.",
        "categoria": "O medicamento foi dado em dose e horário que não estão em questão: o erro é a escolha do fármaco, ou seja, conduta inadequada.",
        "correcao": "No grupo A usam-se paracetamol ou dipirona; salicilatos e anti-inflamatórios não esteroides ficam de fora, porque podem causar ou agravar sangramentos."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Manter o AAS e acrescentar corticoide"
      },
      {
        "id": "k2",
        "texto": "Trocar o AAS por ibuprofeno"
      },
      {
        "id": "k3",
        "texto": "Prescrever paracetamol ou dipirona e não usar salicilatos nem anti-inflamatórios"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-dengue-dipirona-adulto",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Dipirona em dose dez vezes maior",
    "paciente": "Dona Tereza, 39 anos",
    "cenario": "Dengue sem sinais de alarme atendida na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "14:00 — Chegou no 3º dia de febre, sem sinais de alarme. Classificada como grupo A.",
      "14:10 — Prescrita hidratação oral conforme o cartão de acompanhamento.",
      "14:15 — Prescrito: dipirona 500 mg, 10 comprimidos de 6/6 horas, se dor ou febre.",
      "14:20 — Orientações de retorno entregues.",
      "14:25 — Cartão de acompanhamento preenchido.",
      "14:30 — Notificação registrada."
    ],
    "falha": {
      "linha": 3,
      "categoria": "medicacao",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A prescrição das 14:15 traz 10 comprimidos por dose, quando o manual indica 1.",
        "categoria": "Dez vezes a dose é erro grande de medicação: o fármaco é o certo, a quantidade é que está errada.",
        "correcao": "A dipirona do adulto é 1 comprimido de 500 mg (ou 20 gotas) até de 6 em 6 horas."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Trocar a dipirona por AAS 500 mg de 6/6 horas"
      },
      {
        "id": "k2",
        "texto": "Dipirona 500 mg, 5 comprimidos de 6/6 horas, se dor ou febre"
      },
      {
        "id": "k3",
        "texto": "Dipirona 500 mg, 1 comprimido até de 6/6 horas, se dor ou febre"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-dengue-dipirona-crianca",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Vírgula errada na dose da criança",
    "paciente": "Alice, 4 anos",
    "cenario": "Dengue sem sinais de alarme atendida na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Menina de 4 anos, 2º dia de febre, sem sinais de alarme. Grupo A.",
      "09:10 — Peso registrado: 15 kg.",
      "09:15 — Prescrito: dipirona 100 mg/kg/dose de 6/6 horas, se febre.",
      "09:20 — Mãe orientada a oferecer hidratação oral, 100 mL/kg por dia.",
      "09:25 — Orientados sinais de alarme e retorno.",
      "09:30 — Caso suspeito notificado."
    ],
    "falha": {
      "linha": 3,
      "categoria": "medicacao",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A prescrição das 09:15 usa 100 mg/kg por dose; para 15 kg isso dá 1.500 mg de uma vez.",
        "categoria": "Dose dez vezes maior que a indicada: erro grande de medicação, não de conduta nem de registro.",
        "correcao": "A dipirona da criança é 10 mg/kg por dose, até de 6 em 6 horas, respeitando a dose máxima por peso e idade (150 mg por dose aos 15 kg)."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Dipirona 50 mg/kg/dose, até de 6/6 horas"
      },
      {
        "id": "k2",
        "texto": "Dipirona 10 mg/kg/dose, até de 6/6 horas, respeitando a dose máxima"
      },
      {
        "id": "k3",
        "texto": "Dipirona 100 mg/kg/dose, mas só uma vez por dia"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-dengue-furosemida",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Furosemida no choque da dengue",
    "paciente": "Seu Bento, 49 anos",
    "cenario": "Dengue com choque no pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "10:00 — 5º dia de dengue. PA 80/50, pele fria e enchimento capilar de 5 segundos.",
      "10:05 — Anotado: perda de plasma por extravasamento, com hipovolemia.",
      "10:10 — Acesso venoso obtido.",
      "10:15 — Prescrita furosemida venosa para melhorar a pressão.",
      "10:20 — Colhido hematócrito.",
      "10:30 — Paciente mais hipotenso, urina escassa."
    ],
    "falha": {
      "linha": 4,
      "categoria": "logica",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A prescrição das 10:15 contradiz o raciocínio anotado às 10:05: o problema é falta de volume, e a furosemida o tira ainda mais.",
        "categoria": "O erro está no raciocínio de causa e efeito: tratar hipovolemia com um diurético, que perde mais líquido.",
        "correcao": "No choque da dengue a causa é a perda de plasma, então o tratamento é repor volume com cristaloide, com reavaliação frequente."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Restringir líquidos para evitar edema pulmonar"
      },
      {
        "id": "k2",
        "texto": "Repor volume com soro fisiológico e reavaliar a perfusão"
      },
      {
        "id": "k3",
        "texto": "Manter a furosemida e acrescentar um vasodilatador"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-dengue-volume-hidratacao",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Hidratação oral sem o volume na receita",
    "paciente": "Joana, 31 anos",
    "cenario": "Dengue sem sinais de alarme atendida na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "15:00 — Chegou no 2º dia de febre, dor no corpo e dor atrás dos olhos.",
      "15:10 — Sem sinais de alarme, prova do laço negativa. Grupo A.",
      "15:15 — Prescrito paracetamol conforme o manual.",
      "15:20 — Registrado: \"beber bastante líquido\".",
      "15:25 — Orientados sinais de alarme e retorno.",
      "15:30 — Caso suspeito notificado."
    ],
    "falha": {
      "linha": 4,
      "categoria": "registro",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A linha das 15:20 é vaga: não diz quanto beber, nem como dividir o volume ao longo do dia.",
        "categoria": "O cuidado foi lembrado, mas o registro não dá a instrução que o manual pede: falha de registro.",
        "correcao": "O manual pede especificar, na receita ou no cartão de acompanhamento, o volume a ser ingerido (80 mL/kg por dia para adultos, com um terço em soro de reidratação nas primeiras horas)."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Registrar apenas \"hidratação oral\" para não confundir a paciente"
      },
      {
        "id": "k2",
        "texto": "Trocar a hidratação oral por soro venoso em casa"
      },
      {
        "id": "k3",
        "texto": "Registrar na receita ou no cartão o volume por dia (80 mL/kg/dia no adulto)"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-ieca-bra",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Dois bloqueadores do mesmo sistema",
    "paciente": "Seu Ademar, 62 anos",
    "cenario": "Hipertenso em acompanhamento na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Hipertenso há 8 anos. PA 158/96. Em uso de IECA.",
      "09:10 — Sem queixa de tosse. Creatinina anterior normal.",
      "09:15 — Orientadas dieta com menos sal e atividade física.",
      "09:20 — Prescrito, além do IECA, um bloqueador do receptor de angiotensina II.",
      "09:25 — Orientada adesão e retorno em 30 dias.",
      "09:30 — Solicitados creatinina e potássio."
    ],
    "falha": {
      "linha": 4,
      "categoria": "conduta",
      "correcao": "k1",
      "explicacoes": {
        "linha": "A associação prescrita às 09:20 é a que o caderno manda evitar. As outras linhas estão adequadas.",
        "categoria": "A dose e o registro estão certos; a escolha de juntar duas drogas do mesmo sistema é conduta inadequada.",
        "correcao": "A associação de IECA com bloqueador do receptor de angiotensina II deve ser evitada porque aumenta o risco de disfunção renal; associa-se, em vez disso, tiazídico ou bloqueador de canal de cálcio."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Evitar a associação e acrescentar um diurético tiazídico ou um bloqueador de canal de cálcio"
      },
      {
        "id": "k2",
        "texto": "Trocar o IECA por betabloqueador de primeira linha"
      },
      {
        "id": "k3",
        "texto": "Manter os dois e dobrar a dose de ambos"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "aud-ieca-creatinina-omissao",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "IECA mantido sem exames de controle",
    "paciente": "Dona Zilda, 68 anos",
    "cenario": "Hipertensa em retorno de seis meses na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "10:00 — Retorno após seis meses do início do IECA. PA 132/80.",
      "10:10 — Sem tosse nem edema. Adesão boa.",
      "10:15 — Peso estável.",
      "10:20 — Mantida a dose do IECA e renovada a receita.",
      "10:25 — Orientada dieta com menos sal.",
      "10:30 — Retorno agendado para seis meses."
    ],
    "falha": {
      "linha": 4,
      "categoria": "omissao",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A linha das 10:20 renova a receita sem ter pedido creatinina nem potássio, que não aparecem em nenhuma linha.",
        "categoria": "O que deveria ter sido feito não consta no atendimento: é omissão, não erro de dose nem de registro.",
        "correcao": "Ao usar IECA, a creatinina deve ser medida entre três e seis meses, junto com o potássio, para detectar queda da função renal ou hiperpotassemia."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Suspender o IECA por precaução"
      },
      {
        "id": "k2",
        "texto": "Renovar a receita e pedir os exames só se surgir sintoma"
      },
      {
        "id": "k3",
        "texto": "Solicitar creatinina e potássio antes de renovar a receita"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "aud-tontura-hipotensao",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Tontura tratada com mais remédio",
    "paciente": "Seu Raul, 71 anos",
    "cenario": "Hipertenso com tontura ao levantar, na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "08:30 — Hipertenso em uso de dois anti-hipertensivos. Queixa de tontura ao levantar da cama.",
      "08:40 — PA deitado 150/90.",
      "08:45 — PA em pé: 118/76, com tontura.",
      "08:50 — Anotado: queda de mais de 20 mmHg na sistólica ao levantar.",
      "08:55 — Aumentada a dose dos dois anti-hipertensivos para melhorar o controle.",
      "09:00 — Retorno marcado para 30 dias."
    ],
    "falha": {
      "linha": 5,
      "categoria": "logica",
      "correcao": "k1",
      "explicacoes": {
        "linha": "A linha das 08:55 aumenta o remédio justamente quando a medida das 08:50 mostrou que a pressão cai demais ao levantar.",
        "categoria": "O raciocínio de causa e efeito foi invertido: a tontura vem de excesso de efeito hipotensor, e aumentar a dose o piora.",
        "correcao": "Se há hipotensão postural real, titula-se a dose para baixo, evitando deixar a pressão descontrolada."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Titular as doses em uso para reduzir o efeito hipotensor e reavaliar"
      },
      {
        "id": "k2",
        "texto": "Manter as doses e orientar levantar mais depressa"
      },
      {
        "id": "k3",
        "texto": "Trocar por um vasodilatador direto"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "aud-lepto-doxiciclina-gestante",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Antibiótico da leptospirose na gestante",
    "paciente": "Márcia, 28 anos",
    "cenario": "Gestante de 20 semanas com suspeita de leptospirose após enchente.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Gestante de 20 semanas, com febre, dor nas panturrilhas e contato com água de enchente há 8 dias.",
      "09:10 — Sem icterícia, sem falta de ar, urina normal.",
      "09:20 — Caso suspeito de leptospirose. Hemograma, ureia, creatinina, bilirrubinas e transaminases solicitados.",
      "09:30 — Prescrita doxiciclina 100 mg por via oral de 12 em 12 horas por 7 dias.",
      "09:40 — Colhida amostra para sorologia, enviada ao Lacen.",
      "09:50 — Orientados sinais de gravidade e retorno imediato."
    ],
    "falha": {
      "linha": 4,
      "categoria": "conduta",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A prescrição das 09:30 é a única que contraria o roteiro: a doxiciclina não deve ser usada em gestantes.",
        "categoria": "A dose e a duração prescritas estão corretas para quem pode usar a doxiciclina: o erro é a escolha do fármaco para esta paciente, ou seja, conduta inadequada.",
        "correcao": "Na gestante, o tratamento é amoxicilina: 500 mg por via oral de 8 em 8 horas, por 5 a 7 dias."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Manter a doxiciclina e reduzir a dose pela metade"
      },
      {
        "id": "k2",
        "texto": "Trocar a doxiciclina por amoxicilina 500 mg por via oral de 8 em 8 horas, por 5 a 7 dias"
      },
      {
        "id": "k3",
        "texto": "Suspender o antibiótico e esperar a sorologia"
      }
    ],
    "fonte": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/l/leptospirose/publicacoes/roteiro-para-capacitacao-de-profissionais-medicos-no-diagnostico-e-tratamento-da-leptospirose-guia-do-aluno.pdf"
  },
  {
    "id": "aud-lepto-amoxicilina-dose",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Amoxicilina com um zero a mais",
    "paciente": "Seu Gilmar, 41 anos",
    "cenario": "Leptospirose sem sinais de gravidade, em unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "10:00 — Febre há 3 dias, dor muscular intensa e olhos vermelhos. Trabalha com limpeza de esgoto.",
      "10:10 — Sem icterícia, sem alteração da urina, sem falta de ar.",
      "10:15 — Caso suspeito de leptospirose. Hemograma e exames de função renal e hepática solicitados.",
      "10:25 — Prescrita amoxicilina 5.000 mg por via oral de 8 em 8 horas, por 7 dias.",
      "10:35 — Sorologia colhida e enviada ao laboratório de referência.",
      "10:45 — Caso notificado e orientados sinais de gravidade."
    ],
    "falha": {
      "linha": 4,
      "categoria": "medicacao",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A prescrição das 10:25 traz 5.000 mg por dose; o roteiro indica 500 mg.",
        "categoria": "Dez vezes a dose é erro grande de medicação: o antibiótico é o adequado, a quantidade é que está errada.",
        "correcao": "A amoxicilina do adulto é 500 mg por via oral de 8 em 8 horas, por 5 a 7 dias."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Amoxicilina 2.500 mg por via oral de 8 em 8 horas, por 7 dias"
      },
      {
        "id": "k2",
        "texto": "Amoxicilina 500 mg por via oral de 8 em 8 horas, por 5 a 7 dias"
      },
      {
        "id": "k3",
        "texto": "Amoxicilina 5.000 mg uma vez por dia, por 7 dias"
      }
    ],
    "fonte": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/l/leptospirose/publicacoes/roteiro-para-capacitacao-de-profissionais-medicos-no-diagnostico-e-tratamento-da-leptospirose-guia-do-aluno.pdf"
  },
  {
    "id": "aud-nifedipino-dose",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Nifedipino 100 mg na crise hipertensiva",
    "paciente": "Joana, 34 anos",
    "cenario": "Gestante com pressão muito alta no pronto atendimento obstétrico.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "14:00 — Gestante de 33 semanas, cefaleia e pressão 168/112 mmHg.",
      "14:10 — Segunda medida, 30 minutos depois: 164/110 mmHg. Confirmada hipertensão grave.",
      "14:15 — Edema de face e mãos, reflexos vivos, sem convulsão. Batimentos fetais 142.",
      "14:20 — Prescrito nifedipino 100 mg por via oral, dose única.",
      "14:30 — Em decúbito lateral esquerdo, acesso venoso obtido.",
      "14:40 — Solicitada vaga na emergência obstétrica."
    ],
    "falha": {
      "linha": 4,
      "categoria": "medicacao",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A prescrição das 14:20 traz 100 mg de nifedipino; a dose inicial indicada é 10 mg.",
        "categoria": "Dez vezes a dose é erro grande de medicação: o fármaco serve para a crise, a quantidade é que está errada.",
        "correcao": "O nifedipino oral começa com 10 mg e pode ser repetido a cada 20 a 30 minutos, até no máximo 30 mg."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Nifedipino 50 mg por via oral, repetindo a cada hora"
      },
      {
        "id": "k2",
        "texto": "Nifedipino 100 mg por via oral, mas só se a pressão não baixar em 24 horas"
      },
      {
        "id": "k3",
        "texto": "Nifedipino 10 mg por via oral, repetindo a cada 20 a 30 minutos se necessário, até 30 mg"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "aud-pe-sem-gravidade-casa",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Pré-eclâmpsia liberada no mesmo dia",
    "paciente": "Fernanda, 29 anos",
    "cenario": "Gestante de 36 semanas com pressão alta e proteína na urina.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Gestante de 36 semanas, sem queixas. PA 148/94 e fita de urina com 2+.",
      "09:10 — Sem cefaleia, sem alterações visuais, sem dor epigástrica.",
      "09:20 — Sem exames laboratoriais recentes. Movimentos fetais presentes.",
      "09:30 — Diagnóstico: pré-eclâmpsia sem sinais de gravidade.",
      "09:35 — Liberada para casa com repouso e retorno em uma semana, sem internação para avaliação.",
      "09:40 — Orientada a medir a pressão em casa."
    ],
    "falha": {
      "linha": 5,
      "categoria": "conduta",
      "correcao": "k1",
      "explicacoes": {
        "linha": "A decisão das 09:35 libera a gestante no dia do diagnóstico, sem avaliação hospitalar. As outras linhas descrevem uma avaliação adequada.",
        "categoria": "A decisão é de destino e de conduta, e não de dose, horário ou registro: é conduta inadequada.",
        "correcao": "No momento do diagnóstico, a gestante deve ser internada para aprofundar a avaliação; depois disso, o controle ambulatorial é uma opção."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Internar para avaliar sinais de gravidade e só então considerar o controle ambulatorial"
      },
      {
        "id": "k2",
        "texto": "Dar a alta com anti-hipertensivo e exames em uma semana"
      },
      {
        "id": "k3",
        "texto": "Manter a alta e antecipar o retorno para três dias"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "aud-sulfato-monitoramento",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Sulfato de magnésio sem vigilância",
    "paciente": "Larissa, 26 anos",
    "cenario": "Gestante de 30 semanas em trabalho de parto prematuro.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "16:00 — Gestante de 30 semanas, contrações regulares e colo com 5 cm.",
      "16:10 — Parto previsto para as próximas horas. Iniciada corticoterapia para maturação fetal.",
      "16:15 — Iniciado sulfato de magnésio para neuroproteção do feto.",
      "16:30 — Dose de ataque concluída. Mantida infusão de manutenção.",
      "18:30 — Sem registro de diurese, reflexo patelar ou frequência respiratória desde o início da infusão.",
      "18:40 — Gestante sonolenta e com reflexos diminuídos."
    ],
    "falha": {
      "linha": 5,
      "categoria": "omissao",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A linha das 18:30 mostra duas horas de infusão sem nenhum registro de vigilância da mãe.",
        "categoria": "O cuidado que faltou é o monitoramento exigido durante o uso: é omissão, não erro de dose nem de conduta.",
        "correcao": "Durante a administração, controlam-se a diurese, o reflexo patelar e a frequência respiratória, além do monitoramento fetal."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Registrar apenas a pressão arterial a cada 4 horas"
      },
      {
        "id": "k2",
        "texto": "Controlar diurese, reflexo patelar e frequência respiratória durante toda a infusão"
      },
      {
        "id": "k3",
        "texto": "Suspender o sulfato de magnésio por precaução"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "aud-ieca-gestante",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "IECA para a gestante hipertensa",
    "paciente": "Patrícia, 33 anos",
    "cenario": "Gestante de 12 semanas com hipertensão crônica na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "08:30 — Gestante de 12 semanas com hipertensão crônica. PA 156/98.",
      "08:40 — Em uso de enalapril antes da gestação, mantido por conta própria.",
      "08:45 — Sem proteinúria na fita. Sem sintomas.",
      "08:50 — Prescrito aumento da dose de enalapril.",
      "08:55 — Orientada dieta com menos sal e repouso relativo.",
      "09:00 — Retorno agendado em 15 dias."
    ],
    "falha": {
      "linha": 4,
      "categoria": "conduta",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A linha das 08:50 aumenta um IECA em gestante. O resto do atendimento é adequado.",
        "categoria": "O fármaco foi prescrito em dose coerente: o erro é a escolha de uma classe que não se usa na gravidez, ou seja, conduta inadequada.",
        "correcao": "Na gestação, IECA e bloqueadores da angiotensina II são evitados pelos efeitos teratogênicos; usam-se anti-hipertensivos considerados seguros."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Manter o enalapril e reduzir a dose pela metade"
      },
      {
        "id": "k2",
        "texto": "Associar um bloqueador do receptor de angiotensina II"
      },
      {
        "id": "k3",
        "texto": "Suspender o enalapril e trocar por um anti-hipertensivo seguro na gestação"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf"
  },
  {
    "id": "aud-metformina-dose",
    "versao": 2,
    "revisado": true,
    "tema": "Endócrino e metabólico",
    "titulo": "Metformina com dose dez vezes maior",
    "paciente": "Seu Valmir, 52 anos",
    "cenario": "Diabetes tipo 2 recém-diagnosticado, na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Diabetes tipo 2 recém-diagnosticado. Obeso, glicemia de jejum 210 mg/dL.",
      "09:10 — Sem sinais de complicação aguda. Creatinina normal.",
      "09:20 — Orientadas alimentação e atividade física.",
      "09:30 — Prescrita metformina 5.000 mg por dia, em dose única.",
      "09:40 — Solicitada HbA1c e retorno em 3 meses.",
      "09:50 — Orientados sinais de hipoglicemia e hiperglicemia."
    ],
    "falha": {
      "linha": 4,
      "categoria": "medicacao",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A prescrição das 09:30 traz 5.000 mg por dia; o protocolo manda começar com 500 mg ou 850 mg.",
        "categoria": "Dez vezes a dose inicial é erro grande de medicação: o fármaco é o de primeira escolha, a quantidade é que está errada.",
        "correcao": "A metformina começa com dose baixa (500 mg ou 850 mg), em dose única diária, durante ou depois da refeição, para evitar sintomas gastrointestinais."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Metformina 2.500 mg por dia em duas tomadas"
      },
      {
        "id": "k2",
        "texto": "Glibenclamida 20 mg por dia como primeira escolha"
      },
      {
        "id": "k3",
        "texto": "Metformina 500 mg ou 850 mg em dose única diária, durante ou após a refeição"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2/@@display-file/file"
  },
  {
    "id": "aud-sulfonilureia-idosa",
    "versao": 2,
    "revisado": true,
    "tema": "Endócrino e metabólico",
    "titulo": "Mais sulfonilureia depois da hipoglicemia",
    "paciente": "Dona Neusa, 72 anos",
    "cenario": "Diabética tipo 2 em retorno na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "08:30 — Diabética tipo 2, 72 anos, em uso de glibenclamida. Retorna de um pronto atendimento.",
      "08:40 — Relata dois episódios de hipoglicemia na semana, com suor, tremor e confusão.",
      "08:45 — Glicemia de jejum de hoje: 150 mg/dL.",
      "08:50 — Prescrito aumento da dose de glibenclamida para baixar a glicemia de jejum.",
      "08:55 — Orientada a manter a alimentação.",
      "09:00 — Retorno em 3 meses."
    ],
    "falha": {
      "linha": 4,
      "categoria": "logica",
      "correcao": "k1",
      "explicacoes": {
        "linha": "A linha das 08:50 aumenta o medicamento que acabou de causar duas hipoglicemias.",
        "categoria": "O raciocínio de causa e efeito foi invertido: a hipoglicemia vem do próprio medicamento, e aumentar a dose aumenta o risco.",
        "correcao": "Em quem tem hipoglicemia recorrente, prefere-se a gliclazida de liberação prolongada, de menor taxa de hipoglicemia, ou reduz-se a dose."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Trocar por gliclazida de liberação prolongada, de menor risco de hipoglicemia"
      },
      {
        "id": "k2",
        "texto": "Acrescentar um segundo hipoglicemiante oral sem mudar o primeiro"
      },
      {
        "id": "k3",
        "texto": "Manter o aumento e orientar comer mais doce"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2/@@display-file/file"
  },
  {
    "id": "aud-dmg-insulina-peso",
    "versao": 2,
    "revisado": true,
    "tema": "Obstétrico",
    "titulo": "Insulina na gestante sem peso registrado",
    "paciente": "Priscila, 31 anos",
    "cenario": "Gestante com diabetes gestacional que precisa de insulina.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "10:00 — Gestante de 30 semanas, diabetes gestacional, em dieta e exercício há três semanas.",
      "10:10 — Perfil glicêmico: mais de 30% dos valores acima da meta.",
      "10:15 — Indicada insulina, porque as medidas não medicamentosas não bastaram.",
      "10:20 — Prescrita insulina NPH 30 UI por dia, em duas aplicações.",
      "10:30 — Orientadas técnica de aplicação e automonitorização da glicemia.",
      "10:40 — Retorno em 7 dias com o caderno de glicemias."
    ],
    "falha": {
      "linha": 4,
      "categoria": "registro",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A prescrição das 10:20 traz uma dose pronta, sem peso atual registrado nem o cálculo por quilo.",
        "categoria": "A indicação e o esquema estão certos: o que falta é o registro do peso e do cálculo que justificam a dose, ou seja, falha de registro.",
        "correcao": "A dose inicial é calculada pelo peso atual (0,5 UI/kg/dia), dividida em duas ou três aplicações, e registrada com esse cálculo."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Registrar apenas \"insulina NPH, dose habitual\""
      },
      {
        "id": "k2",
        "texto": "Calcular a dose pela idade gestacional"
      },
      {
        "id": "k3",
        "texto": "Registrar o peso atual e calcular a dose inicial em 0,5 UI/kg/dia, dividida em 2 a 3 aplicações"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/manual_gestacao_alto_risco.pdf"
  },
  {
    "id": "aud-dpoc-sem-espirometria",
    "versao": 2,
    "revisado": true,
    "tema": "Respiratório",
    "titulo": "DPOC diagnosticada sem espirometria",
    "paciente": "Seu Altair, 63 anos",
    "cenario": "Tabagista com tosse crônica atendido na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "08:00 — Tabagista de 40 anos-maço, tosse com catarro todos os dias e falta de ar aos esforços.",
      "08:10 — Ausculta com sibilos esparsos. SpO₂ 95% em ar ambiente.",
      "08:15 — Radiografia de tórax sem outras alterações.",
      "08:20 — Diagnóstico registrado: DPOC.",
      "08:25 — Iniciado broncodilatador e orientada cessação do tabagismo.",
      "08:30 — Retorno em 3 meses."
    ],
    "falha": {
      "linha": 4,
      "categoria": "omissao",
      "correcao": "k1",
      "explicacoes": {
        "linha": "A linha das 08:20 fecha o diagnóstico sem nenhuma espirometria, que não aparece em nenhum registro.",
        "categoria": "O exame que confirma o diagnóstico não foi pedido: é omissão, não erro de conduta nem de registro.",
        "correcao": "O diagnóstico clínico exige espirometria pós-broncodilatador, que confirma a obstrução persistente (relação VEF1/CVF abaixo de 0,7)."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Solicitar espirometria pós-broncodilatador antes de confirmar o diagnóstico"
      },
      {
        "id": "k2",
        "texto": "Confirmar o diagnóstico pela radiografia de tórax"
      },
      {
        "id": "k3",
        "texto": "Manter o diagnóstico e repetir a ausculta em 3 meses"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/pcdt-da-doenca-pulmonar-obstrutiva-cronica/@@display-file/file"
  },
  {
    "id": "aud-dengue-notificacao",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Caso de dengue sem notificação",
    "paciente": "Seu Rogério, 36 anos",
    "cenario": "Dengue sem sinais de alarme na unidade básica, em época de epidemia.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "11:00 — Febre há 2 dias, dor no corpo e atrás dos olhos. Vizinhos com o mesmo quadro.",
      "11:10 — Sem sinais de alarme. Classificado como grupo A.",
      "11:15 — Prescritos paracetamol e hidratação oral com o volume por dia.",
      "11:20 — Entregue o cartão de acompanhamento com os sinais de alarme.",
      "11:25 — Prontuário encerrado sem a ficha de notificação.",
      "11:30 — Paciente liberado."
    ],
    "falha": {
      "linha": 5,
      "categoria": "registro",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A linha das 11:25 encerra o atendimento sem a ficha de notificação, que não aparece em nenhum registro.",
        "categoria": "O atendimento clínico está correto; o que falta é o registro obrigatório do caso: é falha de registro.",
        "correcao": "A dengue é de notificação compulsória: todo caso suspeito ou confirmado deve ser comunicado à vigilância local."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Notificar só se o exame confirmar a dengue"
      },
      {
        "id": "k2",
        "texto": "Registrar a dengue apenas no prontuário"
      },
      {
        "id": "k3",
        "texto": "Preencher e enviar a ficha de notificação do caso suspeito"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-dengue-idoso-edema",
    "versao": 2,
    "revisado": true,
    "tema": "Infeccioso",
    "titulo": "Hidratação em idoso sem olhar o pulmão",
    "paciente": "Seu Eurico, 78 anos",
    "cenario": "Dengue com sinais de alarme em idoso hipertenso e cardiopata.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "13:00 — Dengue no 5º dia, dor abdominal e hipotensão postural. Hipertenso e com insuficiência cardíaca.",
      "13:10 — Classificado como grupo C. Iniciado soro fisiológico, 10 mL/kg na primeira hora.",
      "14:10 — Reavaliado: pressão em melhora.",
      "14:15 — Mantida a hidratação venosa em ritmo contínuo.",
      "16:30 — Paciente com tosse e falta de ar. Sem registro de ausculta pulmonar desde a admissão.",
      "16:40 — SpO₂ de 90%."
    ],
    "falha": {
      "linha": 5,
      "categoria": "omissao",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A linha das 16:30 mostra falta de ar e tosse em idoso cardiopata em hidratação, sem ausculta pulmonar registrada desde a chegada.",
        "categoria": "Faltou a vigilância que o manual pede em idosos hidratados: é omissão de monitoramento.",
        "correcao": "Nos idosos, a hidratação deve ser acompanhada de perto, procurando sinais de edema pulmonar, como crepitações à ausculta, por causa do risco de sobrecarga de líquidos."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Dobrar o volume de soro para melhorar a oxigenação"
      },
      {
        "id": "k2",
        "texto": "Ausculta pulmonar periódica durante a hidratação, procurando crepitações, e reduzir o volume se houver sobrecarga"
      },
      {
        "id": "k3",
        "texto": "Suspender qualquer hidratação, mesmo com sinais de alarme"
      }
    ],
    "fonte": "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf"
  },
  {
    "id": "aud-asma-so-saba",
    "versao": 2,
    "revisado": true,
    "tema": "Respiratório",
    "titulo": "Asma tratada só com broncodilatador de resgate",
    "paciente": "Bruna, 22 anos",
    "cenario": "Asma com sintomas várias vezes por semana, na unidade básica.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Asma desde a infância. Chiado e falta de ar três vezes por semana e acorda à noite.",
      "09:10 — Usa salbutamol de resgate quase todos os dias. Duas crises no último mês.",
      "09:15 — Ausculta com sibilos. SpO₂ 97%. Técnica inalatória revisada.",
      "09:20 — Mantido apenas o broncodilatador de curta ação (SABA) sob demanda.",
      "09:25 — Orientados fatores desencadeantes.",
      "09:30 — Retorno em 3 meses."
    ],
    "falha": {
      "linha": 4,
      "categoria": "conduta",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A decisão das 09:20 mantém o SABA sozinho em quem tem sintomas frequentes e crises.",
        "categoria": "A técnica e as orientações estão certas; o erro é o esquema de tratamento escolhido, ou seja, conduta inadequada.",
        "correcao": "Todos os pacientes com asma devem receber tratamento com corticoide inalatório; tratar só com SABA aumenta o risco de exacerbações graves e de morte."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Trocar o SABA por corticoide oral contínuo"
      },
      {
        "id": "k2",
        "texto": "Aumentar a frequência do SABA"
      },
      {
        "id": "k3",
        "texto": "Acrescentar corticoide inalatório ao tratamento (por exemplo, corticoide inalatório com formoterol)"
      }
    ],
    "fonte": "https://www.gov.br/conitec/pt-br/midias/protocolos/2026/asma-portaria-conjunta-saes-sctie-no-43.pdf/@@display-file/file"
  },
  {
    "id": "aud-sca-ecg-atraso",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Eletrocardiograma meia hora depois",
    "paciente": "Seu Antônio, 58 anos",
    "cenario": "Dor no peito em unidade de pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "10:00 — Chegou com dor em aperto no peito há 40 minutos, suor frio e náusea.",
      "10:05 — Hipertenso e tabagista. PA 150/90, FC 96, SpO₂ 96%.",
      "10:10 — Colocado na fila de atendimento para consulta.",
      "10:35 — Eletrocardiograma realizado: supradesnivelamento do ST em parede anterior.",
      "10:40 — Iniciado ácido acetilsalicílico mastigável e solicitada transferência.",
      "10:50 — Eletrocardiograma enviado à central de regulação."
    ],
    "falha": {
      "linha": 3,
      "categoria": "atraso",
      "correcao": "k2",
      "explicacoes": {
        "linha": "A linha das 10:10 mostra um paciente com dor típica aguardando consulta; o eletrocardiograma só saiu às 10:35, 35 minutos depois da chegada.",
        "categoria": "Os cuidados foram corretos, mas começaram tarde: é atraso. O tempo entre a chegada e o ECG foi bem acima do limite.",
        "correcao": "Na dor torácica com suspeita de síndrome coronariana aguda, o ECG deve ser feito e interpretado em até 10 minutos da chegada."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Esperar a troponina para decidir sobre o ECG"
      },
      {
        "id": "k2",
        "texto": "Realizar e interpretar o ECG em até 10 minutos da chegada, antes da consulta"
      },
      {
        "id": "k3",
        "texto": "Fazer o ECG apenas se a dor durar mais de uma hora"
      }
    ],
    "fonte": "https://saude.es.gov.br/Media/sesa/Protocolo/Diretriz%20Estadual%20de%20S%C3%ADndromes%20Coronarianas%20Agudas%20%E2%80%93%202025.pdf"
  },
  {
    "id": "aud-sca-aas-dose",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "AAS dez vezes acima da dose",
    "paciente": "Seu Edson, 61 anos",
    "cenario": "Dor no peito com supradesnível do ST em pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "15:00 — Dor no peito há 30 minutos. PA 148/92, FC 100.",
      "15:05 — ECG em 8 minutos: supradesnivelamento do ST em V2 a V5.",
      "15:10 — Monitorização cardíaca, acesso venoso e repouso.",
      "15:15 — Prescrito ácido acetilsalicílico 3.000 mg, mastigado.",
      "15:20 — ECG enviado à central de regulação de leitos.",
      "15:30 — Aguardando transferência."
    ],
    "falha": {
      "linha": 4,
      "categoria": "medicacao",
      "correcao": "k1",
      "explicacoes": {
        "linha": "A prescrição das 15:15 traz 3.000 mg de AAS; o protocolo indica 160 a 320 mg.",
        "categoria": "Dez vezes a dose é erro grande de medicação: o fármaco é o indicado, a quantidade é que está errada.",
        "correcao": "O AAS da síndrome coronariana aguda é 300 mg (160 a 320 mg), mastigado, por via oral, o mais cedo possível."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "AAS 300 mg (160 a 320 mg), mastigado, por via oral"
      },
      {
        "id": "k2",
        "texto": "AAS 1.000 mg, mastigado, por via oral"
      },
      {
        "id": "k3",
        "texto": "AAS 100 mg por via intravenosa"
      }
    ],
    "fonte": "https://saude.es.gov.br/Media/sesa/Protocolo/Diretriz%20Estadual%20de%20S%C3%ADndromes%20Coronarianas%20Agudas%20%E2%80%93%202025.pdf"
  },
  {
    "id": "aud-sca-oxigenio",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Oxigênio para quem não precisa",
    "paciente": "Seu Leandro, 55 anos",
    "cenario": "Dor no peito em pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "09:00 — Dor no peito há 1 hora. SpO₂ 98% em ar ambiente, sem falta de ar.",
      "09:05 — ECG com supra de ST. Monitorização cardíaca instalada.",
      "09:10 — AAS 300 mg mastigado administrado.",
      "09:15 — Iniciado oxigênio por máscara, 8 L/min, para todos os casos de dor torácica.",
      "09:20 — ECG enviado à central de regulação.",
      "09:30 — Aguardando transferência."
    ],
    "falha": {
      "linha": 4,
      "categoria": "conduta",
      "correcao": "k1",
      "explicacoes": {
        "linha": "A prescrição das 09:15 dá oxigênio a quem tem SpO₂ de 98% e nenhum sinal de congestão.",
        "categoria": "Há dose e horário aceitáveis: o erro é indicar uma medida sem indicação, ou seja, conduta inadequada.",
        "correcao": "O oxigênio fica reservado para SpO₂ abaixo de 90%, dispneia relevante ou congestão pulmonar."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Reservar o oxigênio para SpO₂ abaixo de 90%, dispneia relevante ou congestão pulmonar"
      },
      {
        "id": "k2",
        "texto": "Aumentar o fluxo de oxigênio para 15 L/min"
      },
      {
        "id": "k3",
        "texto": "Manter o oxigênio até a chegada ao hospital, sem reavaliar"
      }
    ],
    "fonte": "https://saude.es.gov.br/Media/sesa/Protocolo/Diretriz%20Estadual%20de%20S%C3%ADndromes%20Coronarianas%20Agudas%20%E2%80%93%202025.pdf"
  },
  {
    "id": "aud-sca-nitrato-vd",
    "versao": 2,
    "revisado": true,
    "tema": "Cardiovascular",
    "titulo": "Nitrato num infarto que pede cuidado",
    "paciente": "Seu Orlando, 66 anos",
    "cenario": "Dor no peito com pressão baixa em pronto atendimento.",
    "contexto": "Não há informação sobre a evolução depois. Analise o processo documentado: um resultado ruim, sozinho, não prova erro.",
    "registros": [
      "11:00 — Dor no peito há 50 minutos. PA 82/50, FC 58, veias do pescoço distendidas.",
      "11:05 — ECG: supra de ST em parede inferior. Suspeita de comprometimento do ventrículo direito.",
      "11:10 — Monitorização cardíaca e acesso venoso. AAS mastigado administrado.",
      "11:15 — Prescrito nitrato sublingual, 0,4 mg a cada 5 minutos, até 3 doses.",
      "11:20 — Pressão cai para 66/40, paciente mais sonolento.",
      "11:30 — ECG enviado à central de regulação."
    ],
    "falha": {
      "linha": 4,
      "categoria": "logica",
      "correcao": "k3",
      "explicacoes": {
        "linha": "A prescrição das 11:15 dá um vasodilatador a quem tem pressão baixa e suspeita de infarto de ventrículo direito, que depende do volume do sangue que chega ao coração.",
        "categoria": "O raciocínio de causa e efeito falhou: o nitrato reduz o retorno de sangue ao coração e derruba ainda mais a pressão.",
        "correcao": "O nitrato só entra com pressão sistólica adequada e sem suspeita de infarto do ventrículo direito; neste caso, o tratamento é repor volume e transferir."
      }
    },
    "correcoes": [
      {
        "id": "k1",
        "texto": "Dobrar a dose do nitrato para o efeito ser mais rápido"
      },
      {
        "id": "k2",
        "texto": "Repetir o nitrato a cada 5 minutos até a dor passar"
      },
      {
        "id": "k3",
        "texto": "Não usar nitrato; repor volume com cautela e transferir"
      }
    ],
    "fonte": "https://saude.es.gov.br/Media/sesa/Protocolo/Diretriz%20Estadual%20de%20S%C3%ADndromes%20Coronarianas%20Agudas%20%E2%80%93%202025.pdf"
  }
];
