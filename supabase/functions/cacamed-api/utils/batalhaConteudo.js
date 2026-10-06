// Conteúdo da Batalha diagnóstica (modo História). Cada fato aponta para uma fonte e a página do PDF
// (não a página impressa). As citações foram conferidas em 02/10/2026 contra o texto dos arquivos recebidos.
// Exames numéricos são ilustrativos. Nada foi revisado por médico: `revisado: false` mantém o modo
// restrito ao administrador. Ao mudar uma doença, aumente a `versao` dela.
export const VERSAO_CONTEUDO_BATALHA = '2026-10-02';

export const FONTES_BATALHA = {
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
 "harrison": {
  "curto": "Harrison's Manual, 20ª ed.",
  "titulo": "Harrison's Manual of Medicine",
  "orgao": "McGraw-Hill",
  "ano": 2020,
  "ed": "20th ed.",
  "tipo": "livro",
  "nota": "Livro protegido por direitos autorais: usado só para conferir fatos; o texto dos casos é nosso."
 }
};

export const CAPITULOS_BATALHA = [
 {
  "id": "c1",
  "ordem": 1,
  "nome": "Primeiro plantão",
  "sub": "Febre e dor no corpo",
  "rede": "Atenção Primária e Urgência",
  "ids": [
   "pneumo",
   "dengue",
   "malaria",
   "lepto"
  ],
  "resumo": "Quatro quadros febris que chegam todo dia ao plantão: aprenda a separar pelo exame certo."
 },
 {
  "id": "c2",
  "ordem": 2,
  "nome": "Vigilância no território",
  "sub": "Doenças que a unidade básica acompanha",
  "rede": "Atenção Primária",
  "ids": [
   "tb",
   "hanse",
   "esquisto",
   "chagas"
  ],
  "resumo": "Doenças de notificação que se tratam por meses e se descobrem no território."
 },
 {
  "id": "c3",
  "ordem": 3,
  "nome": "Do mato ao pronto-socorro",
  "sub": "Zoonoses e urgências infecciosas",
  "rede": "Urgência e Emergência",
  "ids": [
   "maculosa",
   "leish",
   "amarela",
   "meningo"
  ],
  "resumo": "Carrapato, flebótomo, mosquito silvestre e contato próximo: quadros que pedem pressa."
 }
];

// Hipóteses que só aparecem como alternativas (não são batalhas).
export const EXTRAS_BATALHA = [
 {
  "id": "influenza",
  "nome": "Influenza"
 },
 {
  "id": "bronquite",
  "nome": "Bronquite aguda"
 },
 {
  "id": "cancer-pulmao",
  "nome": "Neoplasia pulmonar"
 },
 {
  "id": "histoplasmose",
  "nome": "Histoplasmose"
 },
 {
  "id": "vitiligo",
  "nome": "Vitiligo"
 },
 {
  "id": "pitiriase",
  "nome": "Pitiríase versicolor"
 },
 {
  "id": "tinha",
  "nome": "Dermatofitose"
 },
 {
  "id": "sifilis",
  "nome": "Sífilis secundária"
 },
 {
  "id": "tifoide",
  "nome": "Febre tifoide"
 },
 {
  "id": "hepatite",
  "nome": "Hepatite viral aguda"
 },
 {
  "id": "toxoplasmose",
  "nome": "Toxoplasmose"
 },
 {
  "id": "sarampo",
  "nome": "Sarampo"
 },
 {
  "id": "meningite-viral",
  "nome": "Meningite viral"
 },
 {
  "id": "fpb",
  "nome": "Febre purpúrica brasileira"
 },
 {
  "id": "cirrose",
  "nome": "Cirrose hepática"
 }
];

export const DOENCAS_BATALHA = [
 {
  "id": "pneumo",
  "versao": 1,
  "revisado": false,
  "nome": "Pneumonia pneumocócica",
  "agente": "bacteria",
  "tipo": "Streptococcus pneumoniae",
  "capitulo": "Tosse, febre e dor ao respirar",
  "paciente": "Seu Joaquim, 67",
  "queixa": "Febre há 3 dias, tosse e dor do lado direito ao respirar fundo.",
  "ataque": 8,
  "golpes": [
   {
    "nome": "Febre alta",
    "pista": "Febre de 39,4 °C com calafrios.",
    "extra": 0
   },
   {
    "nome": "Tosse produtiva",
    "pista": "Tosse com escarro purulento, com fio de sangue.",
    "extra": 0
   },
   {
    "nome": "Dor pleurítica",
    "pista": "Dor em pontada no hemitórax direito, pior ao inspirar.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Idoso, alcoolista e tabagista. Na ausculta: crepitações, sopro tubário e macicez à percussão na base direita.",
   "hemograma": "Leucocitose de 18 mil com desvio à esquerda.",
   "rx": "Consolidação lobar no lobo inferior direito.",
   "ns1": "NS1 não reagente.",
   "gota": "Gota espessa negativa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "rx",
   "ns1",
   "gota"
  ],
  "chave": "rx",
  "dif": [
   "influenza",
   "tb",
   "bronquite",
   "dengue"
  ],
  "cura": "bacti",
  "porque": {
   "proto": "Antiparasitários não agem sobre bactérias."
  },
  "buff": {
   "kind": "forca",
   "nome": "Hipoxemia",
   "neutra": "neutralizada",
   "desc": "SpO₂ caiu para 90%. Os golpes da doença tiram 50% a mais de estabilidade.",
   "resposta": "Oxigênio e reavaliar gravidade",
   "explica": "Oxigênio para a hipoxemia e reavaliação da gravidade (CURB-65: confusão, ureia, frequência respiratória, pressão e idade ≥ 65) para decidir o local de tratamento."
  },
  "gram": {
   "clue": "Gram: cocos Gram-positivos aos pares (diplococos).",
   "boost": "Cocos Gram-positivos! O próximo BactiBaque causa o dobro."
  },
  "conduta": "Avaliar a gravidade pelo CURB-65 (0 pode tratar em casa; 1 ou 2 internar; 3 ou mais pode exigir UTI), iniciar antibiótico empírico que cubra pneumococo e atípicos conforme a gravidade e as comorbidades, oxigênio se houver hipoxemia e reavaliar.",
  "aprendizado": "Febre com calafrios, tosse produtiva, dor pleurítica e consolidação lobar apontam para pneumonia bacteriana típica. A gravidade (CURB-65) define onde tratar.",
  "notificar": null,
  "arte": null,
  "fontes": [
   {
    "fonte": "harrison",
    "pag": 767,
    "sobre": "Pneumonia típica por pneumococo tem padrão lobar."
   },
   {
    "fonte": "harrison",
    "pag": 768,
    "sobre": "Achados do exame físico."
   },
   {
    "fonte": "harrison",
    "pag": 769,
    "sobre": "CURB-65 define o local de tratamento."
   },
   {
    "fonte": "harrison",
    "pag": 770,
    "sobre": "Antibiótico empírico por gravidade."
   }
  ]
 },
 {
  "id": "dengue",
  "versao": 1,
  "revisado": false,
  "nome": "Dengue",
  "agente": "virus",
  "tipo": "Vírus da dengue (Flavivírus)",
  "capitulo": "Febre e dor no corpo",
  "paciente": "Luana, 24",
  "queixa": "Febre alta há 4 dias, dor no corpo e atrás dos olhos.",
  "ataque": 7,
  "golpes": [
   {
    "nome": "Mialgia intensa",
    "pista": "Dor muscular forte, ‘dor nos ossos’.",
    "extra": 0
   },
   {
    "nome": "Dor retro-orbitária",
    "pista": "Dor atrás dos olhos, pior ao movê-los.",
    "extra": 0
   },
   {
    "nome": "Exantema",
    "pista": "Manchas vermelhas pelo tronco, com coceira.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Dois vizinhos com o mesmo quadro. Muita água parada no quintal.",
   "hemograma": "Plaquetas em 68 mil e hematócrito subindo.",
   "rx": "Sem consolidações.",
   "ns1": "NS1 reagente.",
   "gota": "Gota espessa negativa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "rx",
   "ns1",
   "gota"
  ],
  "chave": "ns1",
  "dif": [
   "malaria",
   "lepto",
   "influenza",
   "amarela"
  ],
  "cura": "suporte",
  "porque": {
   "bacti": "Antibióticos não agem sobre vírus. Usá-los sem indicação ainda favorece resistência bacteriana.",
   "proto": "Antiparasitários não agem sobre vírus."
  },
  "buff": {
   "kind": "sangria",
   "nome": "Fase crítica",
   "neutra": "neutralizada",
   "desc": "A febre cedeu, mas pode haver extravasamento plasmático. A estabilidade cai 6 a mais por turno.",
   "resposta": "Hidratação venosa e sinais de alarme",
   "explica": "Na defervescência, vigiar sinais de alarme (dor abdominal, vômitos, sangramento, queda de pressão) e hidratar conforme a classificação de risco.",
   "turno": "Fase crítica: extravasamento plasmático. Estabilidade −6."
  },
  "gram": null,
  "conduta": "Não há antiviral específico. Hidratação conforme a classificação de risco (A a D), paracetamol ou dipirona sem AAS nem anti-inflamatórios, vigilância dos sinais de alarme na fase crítica e notificação.",
  "aprendizado": "Febre com mialgia, dor retro-orbitária e plaquetopenia em área com casos sugerem dengue. O tratamento é suporte, e antibiótico não ajuda.",
  "notificar": "Notificação de caso suspeito.",
  "arte": null,
  "fontes": [
   {
    "fonte": "dengue",
    "pag": 15,
    "sobre": "Definição de caso suspeito."
   },
   {
    "fonte": "dengue",
    "pag": 24,
    "sobre": "Alarme na fase de remissão da febre."
   },
   {
    "fonte": "dengue",
    "pag": 25,
    "sobre": "Queda de plaquetas como alarme."
   },
   {
    "fonte": "dengue",
    "pag": 28,
    "sobre": "AAS contraindicado."
   },
   {
    "fonte": "dengue",
    "pag": 33,
    "sobre": "Sinais de alarme."
   },
   {
    "fonte": "dengue",
    "pag": 34,
    "sobre": "Hidratação venosa no grupo C."
   },
   {
    "fonte": "dengue",
    "pag": 46,
    "sobre": "NS1 negativo não exclui."
   }
  ]
 },
 {
  "id": "malaria",
  "versao": 1,
  "revisado": false,
  "nome": "Malária por P. vivax",
  "agente": "protozoario",
  "tipo": "Plasmodium vivax",
  "capitulo": "Febre que vai e volta",
  "paciente": "Tiago, 35",
  "queixa": "Febre com calafrios que vem e volta, cansaço e dor de cabeça.",
  "ataque": 7,
  "golpes": [
   {
    "nome": "Calafrio intenso",
    "pista": "Tremores fortes antes do pico de febre.",
    "extra": 0
   },
   {
    "nome": "Paroxismo febril",
    "pista": "Picos de febre a cada 48 horas, com suor intenso depois.",
    "extra": 5
   },
   {
    "nome": "Sudorese",
    "pista": "Suor profuso quando a febre cai.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Voltou há 15 dias de uma comunidade ribeirinha no Amazonas.",
   "hemograma": "Anemia leve e plaquetas em 110 mil.",
   "rx": "Sem alterações.",
   "ns1": "NS1 não reagente.",
   "gota": "Trofozoítos de Plasmodium vivax na gota espessa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "rx",
   "ns1",
   "gota"
  ],
  "chave": "gota",
  "dif": [
   "dengue",
   "lepto",
   "tifoide",
   "leish"
  ],
  "cura": "proto",
  "porque": {
   "bacti": "Antibacterianos não agem sobre protozoários como o plasmódio."
  },
  "buff": {
   "kind": "escudo",
   "nome": "Hipnozoítos",
   "neutra": "neutralizados",
   "desc": "Formas dormentes no fígado seguram a doença em 25% e podem causar recaída.",
   "resposta": "Primaquina · cura radical",
   "explica": "No P. vivax, a primaquina elimina os hipnozoítos do fígado e evita as recaídas. Ela não se usa em gestantes nem em menores de 6 meses.",
   "escudo": "Os hipnozoítos seguram a doença no fígado! A carga não passa de 25%."
  },
  "gram": null,
  "conduta": "Confirmar pela gota espessa, tratar com cloroquina por 3 dias e primaquina por 7 dias (cura radical), exceto gestantes e menores de 6 meses, e notificar.",
  "aprendizado": "Febre com calafrios em ciclos de 48 horas depois de viagem à Amazônia exige gota espessa. No vivax, tratar só o sangue deixa os hipnozoítos e a recaída.",
  "notificar": "Notificação compulsória de malária.",
  "arte": null,
  "fontes": [
   {
    "fonte": "cab21",
    "pag": 101,
    "sobre": "Quadro clássico em ciclos."
   },
   {
    "fonte": "cab21",
    "pag": 103,
    "sobre": "Incubação do P. vivax."
   },
   {
    "fonte": "cab21",
    "pag": 105,
    "sobre": "Gota espessa é o método oficial."
   },
   {
    "fonte": "cab21",
    "pag": 106,
    "sobre": "Eliminar hipnozoítos."
   },
   {
    "fonte": "cab21",
    "pag": 108,
    "sobre": "Cloroquina 3 dias e primaquina 7 dias."
   },
   {
    "fonte": "cab21",
    "pag": 108,
    "sobre": "Primaquina não se dá a gestantes."
   }
  ]
 },
 {
  "id": "lepto",
  "versao": 1,
  "revisado": false,
  "nome": "Leptospirose",
  "agente": "bacteria",
  "tipo": "Leptospira interrogans",
  "capitulo": "Febre depois da enchente",
  "paciente": "Seu Jorge, 44",
  "queixa": "Febre há 8 dias, dor muscular forte e olhos amarelados depois da enchente.",
  "ataque": 7,
  "golpes": [
   {
    "nome": "Febre abrupta",
    "pista": "Começou de repente, com dor de cabeça.",
    "extra": 0
   },
   {
    "nome": "Mialgia intensa",
    "pista": "Dor muscular forte, que dificulta andar.",
    "extra": 0
   },
   {
    "nome": "Sufusão conjuntival",
    "pista": "Olhos vermelhos e levemente amarelados.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Limpou a casa depois da enchente e pisou em lama sem botas. Cata material reciclável perto de um córrego.",
   "hemograma": "Leucocitose com neutrofilia e plaquetas em 98 mil.",
   "bioquimica": "Bilirrubina direta elevada, CPK alta, creatinina subindo e potássio baixo (3,3).",
   "sorologia": "ELISA-IgM reagente, colhido após o 7º dia.",
   "ns1": "NS1 não reagente."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "bioquimica",
   "sorologia",
   "ns1"
  ],
  "chave": "sorologia",
  "dif": [
   "dengue",
   "hepatite",
   "malaria",
   "maculosa"
  ],
  "cura": "bacti",
  "porque": {
   "proto": "Antiparasitários não agem sobre bactérias como a leptospira."
  },
  "buff": {
   "kind": "sangria",
   "nome": "Síndrome de Weil",
   "neutra": "neutralizada",
   "desc": "Icterícia, lesão renal e hemorragia. A estabilidade cai 6 a mais por turno.",
   "resposta": "Hidratação e diálise precoce",
   "explica": "Na forma grave, repor líquidos, acompanhar a urina e a função renal e indicar diálise precoce quando necessário reduz a letalidade.",
   "turno": "Síndrome de Weil: lesão renal e hepática. Estabilidade −6."
  },
  "gram": {
   "clue": "Bactéria helicoidal (espiroqueta), pouco visível ao Gram.",
   "boost": "Espiroqueta! O próximo BactiBaque causa o dobro."
  },
  "conduta": "Na fase precoce, doxiciclina ou amoxicilina por 5 a 7 dias sem esperar a sorologia; na fase tardia, penicilina cristalina IV por pelo menos 7 dias, suporte e diálise precoce se preciso. Notificar.",
  "aprendizado": "Febre abrupta, mialgia e sufusão conjuntival depois de contato com lama de enchente são leptospirose até prova em contrário. Hipocalemia e CPK alta ajudam a diferenciar de hepatite.",
  "notificar": "Notificação compulsória de leptospirose.",
  "arte": {
   "forma": "espiral",
   "cor": "#f2c14e",
   "cor2": "#a0761a",
   "traco": "nenhum"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 284,
    "sobre": "Síndrome de Weil."
   },
   {
    "fonte": "bolso",
    "pag": 284,
    "sobre": "Agente helicoidal."
   },
   {
    "fonte": "bolso",
    "pag": 287,
    "sobre": "Hipocalemia ajuda no diferencial."
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
    "sobre": "Diálise precoce."
   },
   {
    "fonte": "bolso",
    "pag": 289,
    "sobre": "Exposição a enchentes."
   },
   {
    "fonte": "bolso",
    "pag": 290,
    "sobre": "Sorologia só vale a partir do 7º dia."
   }
  ]
 },
 {
  "id": "tb",
  "versao": 1,
  "revisado": false,
  "nome": "Tuberculose pulmonar",
  "agente": "bacteria",
  "tipo": "Mycobacterium tuberculosis",
  "capitulo": "Tosse que não passa",
  "paciente": "Seu Carlos, 38",
  "queixa": "Tosse com catarro há 4 semanas, febre à tarde e emagrecimento.",
  "ataque": 7,
  "golpes": [
   {
    "nome": "Tosse produtiva",
    "pista": "Tosse com catarro há quatro semanas, pior de manhã.",
    "extra": 0
   },
   {
    "nome": "Febre vespertina",
    "pista": "Febre baixa no fim da tarde, com suor à noite.",
    "extra": 0
   },
   {
    "nome": "Emagrecimento",
    "pista": "Perdeu 6 kg em 2 meses, com pouca fome.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Tosse há 4 semanas. Um colega de trabalho foi diagnosticado há dois meses.",
   "hemograma": "Anemia leve e leucocitose discreta.",
   "rx": "Infiltrado com cavidade no ápice direito.",
   "escarro": "Baciloscopia positiva em duas amostras: bacilos álcool-ácido resistentes.",
   "gota": "Gota espessa negativa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "rx",
   "escarro",
   "gota"
  ],
  "chave": "escarro",
  "dif": [
   "pneumo",
   "cancer-pulmao",
   "histoplasmose",
   "influenza"
  ],
  "cura": "bacti",
  "porque": {
   "proto": "Antiparasitários não agem sobre o bacilo da tuberculose."
  },
  "buff": {
   "kind": "escudo",
   "nome": "Bacilos persistentes",
   "neutra": "neutralizados",
   "desc": "Parte dos bacilos resiste no início e segura a doença em 25% até o tratamento ser completado.",
   "resposta": "Tratamento diretamente observado",
   "explica": "O esquema dura 6 meses: 2 de RHZE e 4 de RH. Com o tratamento diretamente observado, o paciente completa o esquema e cai o risco de abandono e de recaída.",
   "escudo": "Os bacilos persistentes seguram a doença! A carga não passa de 25%."
  },
  "gram": {
   "clue": "O bacilo é álcool-ácido resistente: o Gram ajuda pouco.",
   "boost": "Bacilo identificado! O próximo BactiBaque causa o dobro."
  },
  "conduta": "Baciloscopia de duas amostras de escarro, esquema básico de 2 meses de RHZE seguidos de 4 de RH, tratamento diretamente observado, exame dos contatos e notificação.",
  "aprendizado": "Tosse por 3 semanas ou mais é sintomático respiratório: baciloscopia. O esquema é RHZE por 2 meses e RH por 4, observado, e a transmissão cai em poucos dias ou semanas de tratamento.",
  "notificar": "Notificação compulsória de tuberculose.",
  "arte": {
   "forma": "bacilo",
   "cor": "#7bd88f",
   "cor2": "#2f7d46",
   "traco": "nenhum"
  },
  "fontes": [
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
    "sobre": "Sintomático respiratório."
   },
   {
    "fonte": "bolso",
    "pag": 413,
    "sobre": "Contatos de bacilíferos."
   },
   {
    "fonte": "bolso",
    "pag": 414,
    "sobre": "Duas amostras de escarro."
   },
   {
    "fonte": "bolso",
    "pag": 417,
    "sobre": "Tratamento diretamente observado."
   },
   {
    "fonte": "bolso",
    "pag": 418,
    "sobre": "Esquema básico."
   }
  ]
 },
 {
  "id": "hanse",
  "versao": 1,
  "revisado": false,
  "nome": "Hanseníase",
  "agente": "bacteria",
  "tipo": "Mycobacterium leprae",
  "capitulo": "A mancha que não coça",
  "paciente": "Dona Neide, 52",
  "queixa": "Mancha clara no braço que não coça, com a pele ‘dormente’.",
  "ataque": 6,
  "golpes": [
   {
    "nome": "Mancha hipocrômica",
    "pista": "Mancha mais clara que a pele ao redor, há 8 meses.",
    "extra": 0
   },
   {
    "nome": "Perda de sensibilidade",
    "pista": "Não sente calor nem a ponta da agulha sobre a mancha.",
    "extra": 0
   },
   {
    "nome": "Formigamento",
    "pista": "Formigamento e fraqueza leve na mão do mesmo lado.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Trabalha na roça. Um cunhado que morou na casa dela tratou hanseníase anos atrás.",
   "hemograma": "Sem alterações.",
   "dermato": "Três lesões hipocrômicas com perda da sensibilidade térmica e dolorosa. Nervo ulnar direito espessado.",
   "bacilo": "Baciloscopia de pele negativa. Não exclui hanseníase.",
   "gota": "Gota espessa negativa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "dermato",
   "bacilo",
   "gota"
  ],
  "chave": "dermato",
  "dif": [
   "vitiligo",
   "pitiriase",
   "tinha",
   "sifilis"
  ],
  "cura": "bacti",
  "porque": {
   "proto": "Antiparasitários não agem sobre o bacilo da hanseníase."
  },
  "buff": {
   "kind": "forca",
   "nome": "Reação hansênica",
   "neutra": "neutralizada",
   "desc": "Novas lesões e neurite. Os golpes da doença tiram 50% a mais de estabilidade.",
   "resposta": "Prednisona e manter a PQT",
   "explica": "A reação hansênica é a principal causa de incapacidades. Trata-se com prednisona (1 a 2 mg/kg/dia) sem interromper a poliquimioterapia."
  },
  "gram": {
   "clue": "Bacilo álcool-ácido resistente que infecta nervos periféricos.",
   "boost": "Bacilo identificado! O próximo BactiBaque causa o dobro."
  },
  "conduta": "Classificar como paucibacilar (até 5 lesões) e iniciar a poliquimioterapia (6 cartelas) na unidade básica, examinar os contatos, avaliar incapacidades e notificar. Em reação, prednisona sem parar a PQT.",
  "aprendizado": "Mancha com perda de sensibilidade e nervo espessado é hanseníase: o diagnóstico é clínico e a baciloscopia negativa não exclui. Até 5 lesões é paucibacilar.",
  "notificar": "Notificação compulsória de hanseníase.",
  "arte": {
   "forma": "bacilo",
   "cor": "#d9a47f",
   "cor2": "#8a5a3a",
   "traco": "manchas"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 209,
    "sobre": "Critério: lesão com alteração de sensibilidade."
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
    "pag": 210,
    "sobre": "Tratamento ambulatorial."
   },
   {
    "fonte": "bolso",
    "pag": 210,
    "sobre": "Reação é a principal causa de incapacidade."
   },
   {
    "fonte": "bolso",
    "pag": 211,
    "sobre": "Esquema PB: 6 cartelas."
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
  "id": "esquisto",
  "versao": 1,
  "revisado": false,
  "nome": "Esquistossomose mansônica",
  "agente": "helminto",
  "tipo": "Schistosoma mansoni",
  "capitulo": "Fígado grande e diarreia",
  "paciente": "Seu Raimundo, 38",
  "queixa": "Diarreia e dor no estômago há meses, com a barriga mais volumosa.",
  "ataque": 6,
  "golpes": [
   {
    "nome": "Diarreia recorrente",
    "pista": "Diarreia há meses, com cólica.",
    "extra": 0
   },
   {
    "nome": "Epigastralgia",
    "pista": "Dor no estômago, pior em jejum.",
    "extra": 0
   },
   {
    "nome": "Fígado palpável",
    "pista": "Fígado aumentado e endurecido, com nódulos.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Mora em área endêmica de Pernambuco e pesca em açudes desde criança.",
   "hemograma": "Anemia leve.",
   "fezes": "Kato-Katz: ovos viáveis de Schistosoma mansoni.",
   "usg": "Fibrose periportal e baço no limite superior.",
   "gota": "Gota espessa negativa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "fezes",
   "usg",
   "gota"
  ],
  "chave": "fezes",
  "dif": [
   "leish",
   "cirrose",
   "tifoide",
   "hepatite"
  ],
  "cura": "proto",
  "porque": {
   "bacti": "Antibacterianos não agem sobre helmintos como o esquistossomo."
  },
  "buff": {
   "kind": "sangria",
   "nome": "Hipertensão portal",
   "neutra": "neutralizada",
   "desc": "Fibrose do fígado e varizes de esôfago. A estabilidade cai 6 a mais por turno.",
   "resposta": "Referenciar para avaliar varizes",
   "explica": "Na forma hepatoesplênica, o primeiro sinal de descompensação pode ser hemorragia digestiva (hematêmese ou melena). É preciso vigiar e referenciar.",
   "turno": "Hipertensão portal: risco de hemorragia digestiva. Estabilidade −6."
  },
  "gram": null,
  "conduta": "Confirmar com exame parasitológico de fezes (Kato-Katz), tratar com praziquantel em dose única (50 mg/kg em adultos) avaliando contraindicações como gestação e insuficiência hepática grave, e notificar formas graves.",
  "aprendizado": "Morador de área endêmica com diarreia, epigastralgia e fígado palpável deve fazer exame de fezes (Kato-Katz). O praziquantel é o tratamento, e a forma hepatoesplênica pode sangrar.",
  "notificar": "Notificação das formas graves em área endêmica.",
  "arte": {
   "forma": "verme",
   "cor": "#e29b6b",
   "cor2": "#8f4f2a",
   "traco": "nenhum"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 171,
    "sobre": "Forma hepatointestinal."
   },
   {
    "fonte": "bolso",
    "pag": 171,
    "sobre": "Hemorragia digestiva como primeiro sinal."
   },
   {
    "fonte": "bolso",
    "pag": 172,
    "sobre": "Diagnóstico por exame coprológico (Kato-Katz)."
   },
   {
    "fonte": "bolso",
    "pag": 173,
    "sobre": "Praziquantel em dose única."
   },
   {
    "fonte": "bolso",
    "pag": 173,
    "sobre": "Diagnóstico diferencial da forma crônica."
   },
   {
    "fonte": "bolso",
    "pag": 174,
    "sobre": "Notificação das formas graves."
   }
  ]
 },
 {
  "id": "chagas",
  "versao": 1,
  "revisado": false,
  "nome": "Doença de Chagas aguda",
  "agente": "protozoario",
  "tipo": "Trypanosoma cruzi",
  "capitulo": "Febre depois do almoço de família",
  "paciente": "Dona Lúcia, 41",
  "queixa": "Febre há 10 dias com o rosto inchado, depois de um encontro de família.",
  "ataque": 7,
  "golpes": [
   {
    "nome": "Febre prolongada",
    "pista": "Febre há 10 dias, que vai e volta.",
    "extra": 0
   },
   {
    "nome": "Edema de face",
    "pista": "Rosto e pernas inchados.",
    "extra": 0
   },
   {
    "nome": "Mal-estar digestivo",
    "pista": "Vômitos e dor forte no estômago.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Vários familiares adoeceram depois de comer o mesmo alimento num encontro de família, na Amazônia.",
   "hemograma": "Anemia, linfocitose e enzimas do fígado elevadas.",
   "gota": "Tripomastigotas de T. cruzi no sangue, ao exame direto.",
   "sorologia": "IgM anti-T. cruzi reagente.",
   "ecg": "Taquicardia sinusal e alteração da repolarização ventricular."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "gota",
   "sorologia",
   "ecg"
  ],
  "chave": "gota",
  "dif": [
   "leish",
   "toxoplasmose",
   "tifoide",
   "lepto"
  ],
  "cura": "proto",
  "porque": {
   "bacti": "Antibacterianos não agem sobre protozoários como o T. cruzi."
  },
  "buff": {
   "kind": "sangria",
   "nome": "Miocardite aguda",
   "neutra": "neutralizada",
   "desc": "Inflamação do coração, com arritmias. A estabilidade cai 6 a mais por turno.",
   "resposta": "ECG, ecocardiograma e suporte cardiológico",
   "explica": "Na fase aguda pode haver miocardite difusa, às vezes só vista no ECG ou no eco. O paciente exige monitorização e suporte, além do tratamento específico.",
   "turno": "Miocardite: arritmias e falência cardíaca. Estabilidade −6."
  },
  "gram": null,
  "conduta": "Exame parasitológico direto do sangue, tratar o mais cedo possível com benznidazol (5 mg/kg/dia por 60 dias em adultos, contraindicado na gestação), cuidar da miocardite e notificar imediatamente, com investigação do surto.",
  "aprendizado": "Febre prolongada com edema de face e vários doentes depois do mesmo alimento sugere Chagas aguda por via oral. A gota espessa ou o esfregaço mostram o parasito, e o benznidazol deve vir cedo.",
  "notificar": "Notificação imediata de caso agudo.",
  "arte": {
   "forma": "flagelado",
   "cor": "#d07a7a",
   "cor2": "#7a2f3a",
   "traco": "nenhum"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 145,
    "sobre": "Manifestações da fase aguda."
   },
   {
    "fonte": "bolso",
    "pag": 145,
    "sobre": "Alterações laboratoriais da fase aguda."
   },
   {
    "fonte": "bolso",
    "pag": 147,
    "sobre": "Transmissão oral e surtos familiares."
   },
   {
    "fonte": "bolso",
    "pag": 148,
    "sobre": "Diagnóstico parasitológico direto."
   },
   {
    "fonte": "bolso",
    "pag": 148,
    "sobre": "Benznidazol o mais cedo possível."
   },
   {
    "fonte": "bolso",
    "pag": 149,
    "sobre": "Benznidazol por 60 dias; contraindicado em gestantes."
   },
   {
    "fonte": "bolso",
    "pag": 149,
    "sobre": "Notificação imediata."
   }
  ]
 },
 {
  "id": "maculosa",
  "versao": 1,
  "revisado": false,
  "nome": "Febre maculosa brasileira",
  "agente": "bacteria",
  "tipo": "Rickettsia rickettsii",
  "capitulo": "Febre depois da fazenda",
  "paciente": "Seu Edson, 33",
  "queixa": "Febre alta, dor de cabeça e no corpo, e manchas que começaram nos punhos e nas palmas.",
  "ataque": 8,
  "golpes": [
   {
    "nome": "Febre alta e cefaleia",
    "pista": "Febre de início súbito com dor de cabeça forte.",
    "extra": 0
   },
   {
    "nome": "Mialgia intensa",
    "pista": "Dor muscular forte e mal-estar geral.",
    "extra": 0
   },
   {
    "nome": "Exantema palmoplantar",
    "pista": "Manchas vermelhas nos pulsos, palmas e plantas dos pés.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Esteve numa fazenda com capivaras e cavalos há 6 dias e tirou carrapatos do corpo. O exantema surgiu no 4º dia.",
   "hemograma": "Plaquetas em 70 mil.",
   "sorologia": "RIFI da 1ª amostra ainda sem título. Aumento de 4 vezes na 2ª amostra confirma.",
   "ns1": "NS1 não reagente.",
   "gota": "Gota espessa negativa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "sorologia",
   "ns1",
   "gota"
  ],
  "chave": "anamnese",
  "dif": [
   "lepto",
   "dengue",
   "meningo",
   "sarampo"
  ],
  "cura": "bacti",
  "porque": {
   "proto": "Antiparasitários não agem sobre a riquétsia."
  },
  "buff": {
   "kind": "forca",
   "nome": "Forma grave",
   "neutra": "neutralizada",
   "desc": "Hemorragias e falência de órgãos. Os golpes da doença tiram 50% a mais de estabilidade.",
   "resposta": "Cloranfenicol IV",
   "explica": "Nos casos graves, a droga de escolha é o cloranfenicol venoso. Pacientes não tratados cedo podem evoluir para forma grave e óbito."
  },
  "gram": {
   "clue": "Riquétsia: bactéria Gram-negativa, parasita intracelular obrigatório.",
   "boost": "Bactéria identificada! O próximo BactiBaque causa o dobro."
  },
  "conduta": "Tratar já na suspeita, antes da confirmação: doxiciclina 100 mg 12/12 h ou cloranfenicol, até 3 dias depois da febre; nos casos graves, cloranfenicol IV. Coletar sorologia, retirar carrapatos com luvas e notificar.",
  "aprendizado": "Febre abrupta com exantema nos punhos e palmas e contato com carrapato é febre maculosa até prova em contrário. O antibiótico começa na suspeita, sem esperar o exame.",
  "notificar": "Notificação compulsória, pelo meio mais rápido.",
  "arte": {
   "forma": "bacilo",
   "cor": "#e05a6d",
   "cor2": "#7d1f33",
   "traco": "manchas"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 184,
    "sobre": "Exantema palmoplantar entre o 2º e o 6º dia."
   },
   {
    "fonte": "bolso",
    "pag": 184,
    "sobre": "Agente: bactéria Gram-negativa intracelular."
   },
   {
    "fonte": "bolso",
    "pag": 185,
    "sobre": "Picada de carrapato por 4 a 6 horas."
   },
   {
    "fonte": "bolso",
    "pag": 185,
    "sobre": "Tratar na suspeita."
   },
   {
    "fonte": "bolso",
    "pag": 185,
    "sobre": "Doxiciclina 100 mg 12/12 h."
   },
   {
    "fonte": "bolso",
    "pag": 185,
    "sobre": "Casos graves: cloranfenicol IV."
   },
   {
    "fonte": "bolso",
    "pag": 186,
    "sobre": "Notificação compulsória."
   },
   {
    "fonte": "bolso",
    "pag": 187,
    "sobre": "Retirar carrapatos com luvas."
   }
  ]
 },
 {
  "id": "leish",
  "versao": 1,
  "revisado": false,
  "nome": "Leishmaniose visceral",
  "agente": "protozoario",
  "tipo": "Leishmania chagasi",
  "capitulo": "Febre longa e barriga grande",
  "paciente": "Heitor, 5",
  "queixa": "Febre há dois meses, muito pálido, emagrecendo e com a barriga crescendo.",
  "ataque": 7,
  "golpes": [
   {
    "nome": "Febre irregular",
    "pista": "Febre há mais de dois meses, que não cede.",
    "extra": 0
   },
   {
    "nome": "Palidez",
    "pista": "Pele e mucosas muito pálidas.",
    "extra": 0
   },
   {
    "nome": "Barriga crescendo",
    "pista": "Aumento do fígado e do baço.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Mora na periferia de uma cidade do Nordeste, com cães no quintal. Emagreceu e está sem apetite.",
   "hemograma": "Pancitopenia: anemia, leucopenia e plaquetopenia.",
   "sorologia": "Imunofluorescência para Leishmania reagente em título alto.",
   "medula": "Formas amastigotas de Leishmania no aspirado de medula óssea.",
   "gota": "Gota espessa negativa para plasmódio."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "sorologia",
   "medula",
   "gota"
  ],
  "chave": "medula",
  "dif": [
   "malaria",
   "tifoide",
   "esquisto",
   "chagas"
  ],
  "cura": "proto",
  "porque": {
   "bacti": "Antibacterianos não agem sobre protozoários como a leishmânia."
  },
  "buff": {
   "kind": "sangria",
   "nome": "Infecção e sangramento",
   "neutra": "neutralizada",
   "desc": "Infecção bacteriana secundária e sangramento. A estabilidade cai 6 a mais por turno.",
   "resposta": "Antibiótico e controle do sangramento",
   "explica": "Nos casos graves, o óbito costuma vir de infecções bacterianas ou de sangramentos. Trata-se a infecção e acompanham-se as plaquetas e as hemorragias.",
   "turno": "Infecção bacteriana e sangramento. Estabilidade −6."
  },
  "gram": null,
  "conduta": "Confirmar com parasitológico de medula óssea e sorologia, tratar com antimonial pentavalente (20 mg/kg/dia de Sb⁵⁺ por 20 dias) ou anfotericina B em gestantes e risco aumentado, monitorar ECG, função renal e hepática, e notificar.",
  "aprendizado": "Febre longa, palidez e hepatoesplenomegalia em criança de área endêmica com cães sugerem calazar. A medula mostra o parasito. Sem tratamento, a mortalidade passa de 90%.",
  "notificar": "Notificação compulsória de leishmaniose visceral.",
  "arte": {
   "forma": "flagelado",
   "cor": "#d6b13a",
   "cor2": "#7a6014",
   "traco": "manchas"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 277,
    "sobre": "Febre longa, perda de peso e anemia; letalidade sem tratamento."
   },
   {
    "fonte": "bolso",
    "pag": 278,
    "sobre": "Cão como fonte de infecção urbana."
   },
   {
    "fonte": "bolso",
    "pag": 279,
    "sobre": "Parasitológico: amastigotas na medula."
   },
   {
    "fonte": "bolso",
    "pag": 279,
    "sobre": "Sorologia: IFI a partir de 1:80."
   },
   {
    "fonte": "bolso",
    "pag": 280,
    "sobre": "Hemograma com pancitopenia."
   },
   {
    "fonte": "bolso",
    "pag": 280,
    "sobre": "Antimonial 20 mg/kg/dia por 20 dias."
   },
   {
    "fonte": "bolso",
    "pag": 279,
    "sobre": "Complicações bacterianas e hemorragias."
   }
  ]
 },
 {
  "id": "amarela",
  "versao": 1,
  "revisado": false,
  "nome": "Febre amarela",
  "agente": "virus",
  "tipo": "Vírus amarílico (Flavivírus)",
  "capitulo": "Febre, vômitos e olhos amarelos",
  "paciente": "Seu Osvaldo, 45",
  "queixa": "Febre alta, dor de cabeça, vômitos e agora a pele e os olhos amarelos.",
  "ataque": 8,
  "golpes": [
   {
    "nome": "Febre com pulso lento",
    "pista": "Febre alta com pulso lento para a temperatura.",
    "extra": 0
   },
   {
    "nome": "Cefaleia e mialgia",
    "pista": "Dor de cabeça forte e dor no corpo.",
    "extra": 0
   },
   {
    "nome": "Vômitos escuros",
    "pista": "Vômitos com aspecto de borra de café.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Não vacinado. Esteve numa área de mata onde macacos apareceram mortos, seis dias atrás.",
   "hemograma": "Leucopenia e plaquetopenia.",
   "bioquimica": "Transaminases muito altas, com TGO acima da TGP, e bilirrubina direta elevada.",
   "sorologia": "MAC-ELISA para febre amarela reagente.",
   "gota": "Gota espessa negativa."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "bioquimica",
   "sorologia",
   "gota"
  ],
  "chave": "sorologia",
  "dif": [
   "hepatite",
   "lepto",
   "malaria",
   "dengue"
  ],
  "cura": "suporte",
  "porque": {
   "bacti": "Antibióticos não agem sobre vírus.",
   "proto": "Antiparasitários não agem sobre vírus."
  },
  "buff": {
   "kind": "sangria",
   "nome": "Período de intoxicação",
   "neutra": "neutralizado",
   "desc": "Insuficiência do fígado e dos rins, com hemorragias. A estabilidade cai 6 a mais por turno.",
   "resposta": "Reposição de líquidos em cuidados intensivos",
   "explica": "Na forma grave, o paciente precisa de hospitalização, repouso e reposição de líquidos e das perdas, com assistência cuidadosa.",
   "turno": "Insuficiência hepática e renal. Estabilidade −6."
  },
  "gram": null,
  "conduta": "Não existe antiviral específico: hospitalização, repouso, reposição de líquidos e das perdas e tratamento dos sintomas. Notificação compulsória com investigação de todos os casos. A vacina previne.",
  "aprendizado": "Febre com pulso lento, icterícia e vômitos escuros em não vacinado que esteve em mata com macacos mortos é febre amarela silvestre. O tratamento é de suporte, e a vacina é a prevenção.",
  "notificar": "Notificação compulsória e investigação obrigatória.",
  "arte": {
   "forma": "virus",
   "cor": "#ffd84a",
   "cor2": "#b8860b",
   "traco": "espinhos"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 179,
    "sobre": "Sinal de Faget: pulso lento para a febre."
   },
   {
    "fonte": "bolso",
    "pag": 179,
    "sobre": "Período de intoxicação: vômitos em borra de café."
   },
   {
    "fonte": "bolso",
    "pag": 180,
    "sobre": "Transaminases altas, AST acima da ALT."
   },
   {
    "fonte": "bolso",
    "pag": 180,
    "sobre": "MAC-ELISA permite diagnóstico presuntivo."
   },
   {
    "fonte": "bolso",
    "pag": 180,
    "sobre": "Sem antiviral específico."
   },
   {
    "fonte": "bolso",
    "pag": 182,
    "sobre": "Notificação compulsória."
   }
  ]
 },
 {
  "id": "meningo",
  "versao": 1,
  "revisado": false,
  "nome": "Doença meningocócica",
  "agente": "bacteria",
  "tipo": "Neisseria meningitidis",
  "capitulo": "Febre e manchas roxas",
  "paciente": "Júlia, 19",
  "queixa": "Febre alta, dor de cabeça intensa, vômitos e manchas roxas pelo corpo, em 12 horas.",
  "ataque": 9,
  "golpes": [
   {
    "nome": "Febre alta e calafrios",
    "pista": "Mal-estar súbito, febre alta e calafrios.",
    "extra": 0
   },
   {
    "nome": "Rigidez de nuca",
    "pista": "Dor e dificuldade para dobrar o pescoço, com vômitos em jato.",
    "extra": 0
   },
   {
    "nome": "Petéquias e equimoses",
    "pista": "Manchas roxas que aumentam pela pele.",
    "extra": 0
   }
  ],
  "exames": {
   "anamnese": "Mora em alojamento universitário. Os sintomas começaram de repente, há 12 horas.",
   "hemograma": "Leucocitose com desvio à esquerda.",
   "liquor": "Líquor turvo, glicose baixa, proteínas elevadas e neutrófilos. Diplococos Gram-negativos.",
   "hemocultura": "Positiva para Neisseria meningitidis.",
   "rx": "Sem alterações."
  },
  "kit": [
   "anamnese",
   "hemograma",
   "liquor",
   "hemocultura",
   "rx"
  ],
  "chave": "liquor",
  "dif": [
   "maculosa",
   "meningite-viral",
   "fpb",
   "dengue"
  ],
  "cura": "bacti",
  "porque": {
   "proto": "Antiparasitários não agem sobre bactérias."
  },
  "buff": {
   "kind": "forca",
   "nome": "Choque séptico",
   "neutra": "neutralizado",
   "desc": "Forma fulminante, com queda da pressão. Os golpes da doença tiram 50% a mais de estabilidade.",
   "resposta": "Reposição de volume e suporte de choque",
   "explica": "Nas formas fulminantes há sinais de choque. Repõe-se volume e dá-se suporte intensivo enquanto o antibiótico faz efeito."
  },
  "gram": {
   "clue": "Gram: diplococos Gram-negativos.",
   "boost": "Diplococos Gram-negativos! O próximo BactiBaque causa o dobro."
  },
  "conduta": "Antibiótico venoso imediato (penicilina cristalina por 7 a 10 dias), suporte do choque, notificação compulsória com investigação imediata e quimioprofilaxia com rifampicina para os contatos íntimos.",
  "aprendizado": "Febre, rigidez de nuca e petéquias formam o quadro clássico de meningococcemia. O líquor mostra diplococos Gram-negativos. O tratamento é urgente, e os contatos íntimos recebem rifampicina.",
  "notificar": "Notificação compulsória e investigação imediata.",
  "arte": {
   "forma": "diplo",
   "cor": "#ff7ab6",
   "cor2": "#9c2c66",
   "traco": "nenhum"
  },
  "fontes": [
   {
    "fonte": "bolso",
    "pag": 158,
    "sobre": "Meningococcemia: febre, petéquias e equimoses."
   },
   {
    "fonte": "bolso",
    "pag": 158,
    "sobre": "Diplococos Gram-negativos."
   },
   {
    "fonte": "bolso",
    "pag": 158,
    "sobre": "Formas fulminantes com choque."
   },
   {
    "fonte": "bolso",
    "pag": 159,
    "sobre": "Líquor: glicose baixa e neutrófilos."
   },
   {
    "fonte": "bolso",
    "pag": 159,
    "sobre": "Penicilina cristalina IV por 7 a 10 dias."
   },
   {
    "fonte": "bolso",
    "pag": 160,
    "sobre": "Notificação compulsória e investigação imediata."
   },
   {
    "fonte": "bolso",
    "pag": 160,
    "sobre": "Quimioprofilaxia com rifampicina."
   }
  ]
 }
];
