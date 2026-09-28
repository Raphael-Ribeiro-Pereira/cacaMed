// GERADO por node scripts/sincronizar-plantao.mjs. Não editar manualmente.
const VERSAO_ECONOMIA = 2;
const nivelPorXP = xp => Math.floor(Math.sqrt(Math.max(0, Number(xp) || 0) / 500)) + 1;
const xpParaNivel = nivel => 500 * (Math.max(1, nivel) - 1) ** 2;
function progressoGlobal(perfil) {
  const xp = Math.max(0, Number(perfil?.pontuacaoTotal) || 0);
  const nivel = nivelPorXP(xp);
  const base = xpParaNivel(nivel);
  const proximo = xpParaNivel(nivel + 1);
  return { nivel, xp, base, proximo, percentual: (xp - base) / (proximo - base) * 100 };
}
function migrarEconomia(perfil) {
  if (perfil.economia?.versao === VERSAO_ECONOMIA) return perfil;
  return { ...perfil, economia: { versao: VERSAO_ECONOMIA, ultimoNivelPremiado: nivelPorXP(perfil.pontuacaoTotal) } };
}
function concederRecompensa(perfil, xp, tickets = 0) {
  if (!Number.isInteger(xp) || xp < 0 || !Number.isInteger(tickets) || tickets < 0) throw new Error('Recompensa inválida.');
  const base = migrarEconomia(perfil);
  const pontuacaoTotal = (Number(base.pontuacaoTotal) || 0) + xp;
  const anterior = Math.max(base.economia.ultimoNivelPremiado, nivelPorXP(base.pontuacaoTotal));
  const nivel = nivelPorXP(pontuacaoTotal);
  const ticketsNivel = nivel > anterior ? (nivel * (nivel + 1) - anterior * (anterior + 1)) / 2 : 0;
  return { ...base, pontuacaoTotal, tickets: (Number(base.tickets) || 0) + tickets + ticketsNivel,
    economia: { ...base.economia, ultimoNivelPremiado: Math.max(anterior, nivel) } };
}

const dataLocalHoje = (agora = new Date()) =>
  agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

const lerMissoes = dados =>
  Array.isArray(dados?.missoesDiarias) ? dados.missoesDiarias :
    Array.isArray(dados?.missoesDiarias?.missoes) ? dados.missoesDiarias.missoes : [];

const criarMissoesDiarias = () => [
 { id: 'jogar_cruzadinha', titulo: 'Palavras em dia', subtitulo: 'Concluir 1 cruzadinha', meta: 1, recompensaXP: 50, recompensaTicket: 1, progresso: 0, concluida: false },
 { id: 'rodadas_validas', titulo: 'Dose de conhecimento', subtitulo: 'Concluir 2 rodadas de Quiz ou Verdade ou mentira com pelo menos 1 acerto', meta: 2, recompensaXP: 50, recompensaTicket: 1, progresso: 0, concluida: false },
 { id: 'acertos_treino', titulo: 'Conexões corretas', subtitulo: 'Acertar 5 itens nos novos jogos', meta: 5, recompensaXP: 50, recompensaTicket: 1, progresso: 0, concluida: false },
];

const prepararMissoesDoDia = (dados, hoje = dataLocalHoje()) => {
  const atuais = lerMissoes(dados);
  const [ano, mes, dia] = hoje.split('-');
  const mesmoDia = dados.dataUltimoLogin === hoje || dados.dataUltimoLogin === `${dia}/${mes}/${ano}`;
  if (mesmoDia && atuais.length === 3) return null;
  return {
    dataUltimoLogin: hoje,
    missoesDiarias: criarMissoesDiarias(),
    // Documentos antigos podem ter recebido o bônus antes de migrar o formato.
    xpLogin: 0
  };
};

const aplicarProgressoMissoes = (missoes, evento) => {
  let xp = 0;
  let tickets = 0;
  const atualizadas = missoes.map(missao => {
    if (missao.concluida || !evento[missao.id]) return missao;
    const progresso = Math.min(missao.meta, (missao.progresso || 0) + evento[missao.id]);
    const concluida = progresso >= missao.meta;
    if (concluida) {
      xp += missao.recompensaXP || 0;
      tickets += missao.recompensaTicket || 0;
    }
    return { ...missao, progresso, concluida };
  });
  return { missoes: atualizadas, xp, tickets };
};

// Conteúdo piloto com fontes; liberação clínica separada da homologação de gameplay.
const BANCO_QUIZ = [
  {
    "id": "quiz-teoria-antivirus",
    "versao": 1,
    "tema": "Microbiologia",
    "variante": "teoria",
    "enunciado": "Qual agente não é tratado por antibióticos antibacterianos?",
    "opcoes": [
      {
        "id": "4c16ba70d353",
        "texto": "Vírus"
      },
      {
        "id": "2e0aee7375c6",
        "texto": "Bactéria sensível"
      },
      {
        "id": "c5d2fd321803",
        "texto": "Bactéria suscetível em uma infecção indicada"
      },
      {
        "id": "998141371926",
        "texto": "Algumas bactérias causadoras de infecção urinária"
      }
    ],
    "correta": "4c16ba70d353",
    "explicacao": "Antibióticos antibacterianos não tratam vírus; seu uso precisa de indicação.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "quiz-casos-antivirus",
    "versao": 1,
    "tema": "Microbiologia",
    "variante": "casos",
    "enunciado": "Um adulto com resfriado viral pede antibiótico para eliminar o vírus. Qual explicação corresponde ao mecanismo desses medicamentos?",
    "opcoes": [
      {
        "id": "b9ebca1f98ed",
        "texto": "Eles não eliminam o vírus do resfriado"
      },
      {
        "id": "0cc88b2a7e03",
        "texto": "Eles eliminam qualquer vírus"
      },
      {
        "id": "e4f430b8bd00",
        "texto": "Eles substituem a resposta imune"
      },
      {
        "id": "8468a360bf3c",
        "texto": "Eles funcionam se o muco mudar de cor"
      }
    ],
    "correta": "b9ebca1f98ed",
    "explicacao": "Antibióticos antibacterianos não tratam vírus; seu uso precisa de indicação.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "quiz-teoria-muco",
    "versao": 1,
    "tema": "Mitos do dia a dia",
    "variante": "teoria",
    "enunciado": "Qual dado isolado não determina indicação de antibiótico no resfriado?",
    "opcoes": [
      {
        "id": "7241d9ed1384",
        "texto": "Cor do muco"
      },
      {
        "id": "18d49e544b80",
        "texto": "Identificação de bactéria suscetível em contexto indicado"
      },
      {
        "id": "f95311b133a0",
        "texto": "Diagnóstico de infecção bacteriana com indicação de tratamento"
      },
      {
        "id": "f4ee1456d337",
        "texto": "Avaliação clínica completa"
      }
    ],
    "correta": "7241d9ed1384",
    "explicacao": "A cor do muco, isoladamente, não determina necessidade de antibiótico.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "quiz-casos-muco",
    "versao": 1,
    "tema": "Mitos do dia a dia",
    "variante": "casos",
    "enunciado": "Durante um resfriado, o muco ficou verde. Qual conclusão é adequada a partir apenas dessa informação?",
    "opcoes": [
      {
        "id": "c086eec367b1",
        "texto": "A cor sozinha não define indicação"
      },
      {
        "id": "6aada29b7105",
        "texto": "A cor confirma infecção bacteriana"
      },
      {
        "id": "5d55efbb9914",
        "texto": "A cor determina o antibiótico"
      },
      {
        "id": "d606266d6a0c",
        "texto": "A cor permite dispensar avaliação"
      }
    ],
    "correta": "c086eec367b1",
    "explicacao": "A cor do muco, isoladamente, não determina necessidade de antibiótico.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "quiz-teoria-rim",
    "versao": 1,
    "tema": "Fisiologia renal",
    "variante": "teoria",
    "enunciado": "Qual órgão armazena a urina?",
    "opcoes": [
      {
        "id": "789850ccb457",
        "texto": "Bexiga"
      },
      {
        "id": "14dc19f199a8",
        "texto": "Baço"
      },
      {
        "id": "0203a77a5fa3",
        "texto": "Vesícula biliar"
      },
      {
        "id": "0dc039fa8a4a",
        "texto": "Pâncreas"
      }
    ],
    "correta": "789850ccb457",
    "explicacao": "Os rins filtram o sangue e removem resíduos e excesso de água; a bexiga armazena urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-casos-rim",
    "versao": 1,
    "tema": "Fisiologia renal",
    "variante": "casos",
    "enunciado": "Um estudante atribui a filtração do sangue à bexiga. Qual correção deve fazer?",
    "opcoes": [
      {
        "id": "6b86e89f2879",
        "texto": "Os rins filtram; a bexiga armazena urina"
      },
      {
        "id": "a00dccdc4985",
        "texto": "O baço produz urina"
      },
      {
        "id": "611d4058e4ec",
        "texto": "A bexiga faz a filtração renal"
      },
      {
        "id": "9ee0a1b20a98",
        "texto": "O pâncreas armazena urina"
      }
    ],
    "correta": "6b86e89f2879",
    "explicacao": "Os rins filtram o sangue e removem resíduos e excesso de água; a bexiga armazena urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-teoria-nefron",
    "versao": 1,
    "tema": "Detalhes da medicina",
    "variante": "teoria",
    "enunciado": "Qual estrutura é uma unidade funcional de filtração e processamento renal?",
    "opcoes": [
      {
        "id": "a60d5fc9593c",
        "texto": "Néfron"
      },
      {
        "id": "278960bcadff",
        "texto": "Alvéolo"
      },
      {
        "id": "792649f2d1fe",
        "texto": "Osteona"
      },
      {
        "id": "570b6e105e63",
        "texto": "Sarcômero"
      }
    ],
    "correta": "a60d5fc9593c",
    "explicacao": "O néfron inclui glomérulo e túbulo: filtração e processamento tubular têm funções diferentes.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-casos-nefron",
    "versao": 1,
    "tema": "Detalhes da medicina",
    "variante": "casos",
    "enunciado": "Em um desenho renal, há um glomérulo conectado a um túbulo. Que unidade está representada?",
    "opcoes": [
      {
        "id": "b2a2dd19af88",
        "texto": "Néfron"
      },
      {
        "id": "dcc30c8618f5",
        "texto": "Sinapse"
      },
      {
        "id": "9034800dadc3",
        "texto": "Hemácia"
      },
      {
        "id": "1a33bfaa5f50",
        "texto": "Folículo piloso"
      }
    ],
    "correta": "b2a2dd19af88",
    "explicacao": "O néfron inclui glomérulo e túbulo: filtração e processamento tubular têm funções diferentes.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-teoria-reabsorcao",
    "versao": 1,
    "tema": "Fisiologia renal",
    "variante": "teoria",
    "enunciado": "O que ocorre com grande parte da água do filtrado glomerular?",
    "opcoes": [
      {
        "id": "7a13b69613b9",
        "texto": "Reabsorção tubular"
      },
      {
        "id": "bcafe16cf7ec",
        "texto": "Transformação em hemoglobina"
      },
      {
        "id": "95e5888ddf2c",
        "texto": "Armazenamento no baço"
      },
      {
        "id": "227b8be8a312",
        "texto": "Conversão integral em suor"
      }
    ],
    "correta": "7a13b69613b9",
    "explicacao": "Os túbulos retornam ao sangue grande parte da água e substâncias necessárias presentes no filtrado.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-casos-reabsorcao",
    "versao": 1,
    "tema": "Fisiologia renal",
    "variante": "casos",
    "enunciado": "Um aluno iguala volume filtrado ao volume urinário. Qual processo ele esqueceu?",
    "opcoes": [
      {
        "id": "a9ef4efa9a0a",
        "texto": "Reabsorção tubular de água"
      },
      {
        "id": "8b095b691bd2",
        "texto": "Produção de urina no baço"
      },
      {
        "id": "501199a382dd",
        "texto": "Conversão de água em plaquetas"
      },
      {
        "id": "2a5756f50589",
        "texto": "Filtração na bexiga"
      }
    ],
    "correta": "a9ef4efa9a0a",
    "explicacao": "Os túbulos retornam ao sangue grande parte da água e substâncias necessárias presentes no filtrado.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-teoria-epo",
    "versao": 1,
    "tema": "Hematologia",
    "variante": "teoria",
    "enunciado": "Qual hormônio renal estimula a produção de hemácias?",
    "opcoes": [
      {
        "id": "0d20c84c129c",
        "texto": "Eritropoietina"
      },
      {
        "id": "772d38456e0f",
        "texto": "Insulina"
      },
      {
        "id": "267dd34484e9",
        "texto": "Glucagon"
      },
      {
        "id": "eca73c9cbaec",
        "texto": "Melatonina"
      }
    ],
    "correta": "0d20c84c129c",
    "explicacao": "A eritropoietina renal sinaliza à medula óssea a produção de hemácias; sua redução pode contribuir para anemia na doença renal.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/anemia"
  },
  {
    "id": "quiz-casos-epo",
    "versao": 1,
    "tema": "Hematologia",
    "variante": "casos",
    "enunciado": "Uma pessoa com doença renal crônica tem anemia com menor produção de eritropoietina. Qual relação explica parte desse problema?",
    "opcoes": [
      {
        "id": "71016f468080",
        "texto": "Menor estímulo à produção medular de hemácias"
      },
      {
        "id": "28512afd58fb",
        "texto": "A bexiga deixou de produzir sangue"
      },
      {
        "id": "c5006aad7408",
        "texto": "Eritropoietina destrói hemácias"
      },
      {
        "id": "3d1a15a1660b",
        "texto": "Os rins transformam hemácias em urina normalmente"
      }
    ],
    "correta": "71016f468080",
    "explicacao": "A eritropoietina renal sinaliza à medula óssea a produção de hemácias; sua redução pode contribuir para anemia na doença renal.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/anemia"
  },
  {
    "id": "quiz-teoria-nucleo",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "variante": "teoria",
    "enunciado": "Qual característica descreve a hemácia humana madura?",
    "opcoes": [
      {
        "id": "2c027e2ebc14",
        "texto": "Ausência de núcleo"
      },
      {
        "id": "8d0425a57019",
        "texto": "Dois núcleos"
      },
      {
        "id": "172e3afeb346",
        "texto": "Núcleo multilobulado"
      },
      {
        "id": "5d74ff24cce3",
        "texto": "Núcleo volumoso central"
      }
    ],
    "correta": "2c027e2ebc14",
    "explicacao": "Hemácias humanas maduras não têm núcleo; não se deve generalizar isso para todas as células sanguíneas.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "quiz-casos-nucleo",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "variante": "casos",
    "enunciado": "Na lâmina de sangue humano, uma célula tem forma bicôncava e não apresenta núcleo. Qual identificação é compatível?",
    "opcoes": [
      {
        "id": "4b929621754d",
        "texto": "Hemácia madura"
      },
      {
        "id": "9b40e3b1830e",
        "texto": "Neutrófilo"
      },
      {
        "id": "e0ad68939418",
        "texto": "Linfócito"
      },
      {
        "id": "922d85730eda",
        "texto": "Monócito"
      }
    ],
    "correta": "4b929621754d",
    "explicacao": "Hemácias humanas maduras não têm núcleo; não se deve generalizar isso para todas as células sanguíneas.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "quiz-teoria-plaquetas",
    "versao": 1,
    "tema": "Hematologia",
    "variante": "teoria",
    "enunciado": "De quais células se originam as plaquetas?",
    "opcoes": [
      {
        "id": "17320ae83065",
        "texto": "Megacariócitos"
      },
      {
        "id": "12e8743f4f8c",
        "texto": "Neurônios"
      },
      {
        "id": "dde1a4c86779",
        "texto": "Adipócitos"
      },
      {
        "id": "31eee6e42e2c",
        "texto": "Melanócitos"
      }
    ],
    "correta": "17320ae83065",
    "explicacao": "Plaquetas são fragmentos celulares derivados de megacariócitos e participam da hemostasia.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "quiz-casos-plaquetas",
    "versao": 1,
    "tema": "Hematologia",
    "variante": "casos",
    "enunciado": "Ao explicar hemostasia, um aluno chama plaquetas de bactérias. Qual correção é adequada?",
    "opcoes": [
      {
        "id": "15cfc1cc3512",
        "texto": "São fragmentos celulares de megacariócitos"
      },
      {
        "id": "b6ba9b881db3",
        "texto": "São vírus com função de coagulação"
      },
      {
        "id": "00ab5305d5df",
        "texto": "São hemácias com núcleo"
      },
      {
        "id": "3d228e43f046",
        "texto": "São células ósseas circulantes"
      }
    ],
    "correta": "15cfc1cc3512",
    "explicacao": "Plaquetas são fragmentos celulares derivados de megacariócitos e participam da hemostasia.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "quiz-teoria-endolinfa",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "variante": "teoria",
    "enunciado": "Qual cátion predomina na endolinfa coclear?",
    "opcoes": [
      {
        "id": "5845f7fe44aa",
        "texto": "Potássio"
      },
      {
        "id": "d6da2b67a42a",
        "texto": "Ferro"
      },
      {
        "id": "9bfaa99dce31",
        "texto": "Magnésio"
      },
      {
        "id": "f26622fae721",
        "texto": "Sódio"
      }
    ],
    "correta": "5845f7fe44aa",
    "explicacao": "A endolinfa coclear é um fluido extracelular rico em potássio, com potencial endococlear positivo.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "quiz-casos-endolinfa",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "variante": "casos",
    "enunciado": "Uma amostra do fluido da escala média da cóclea tem alta concentração de potássio. Qual fluido é esperado?",
    "opcoes": [
      {
        "id": "91b1120e994e",
        "texto": "Endolinfa"
      },
      {
        "id": "0ae694bb4583",
        "texto": "Plasma sanguíneo"
      },
      {
        "id": "2cb429d39c5f",
        "texto": "Líquido sinovial"
      },
      {
        "id": "52f9506f2524",
        "texto": "Saliva"
      }
    ],
    "correta": "91b1120e994e",
    "explicacao": "A endolinfa coclear é um fluido extracelular rico em potássio, com potencial endococlear positivo.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "quiz-teoria-potencial",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "variante": "teoria",
    "enunciado": "Qual ordem de grandeza corresponde ao potencial endococlear normal?",
    "opcoes": [
      {
        "id": "b25e9e4fed75",
        "texto": "Dezenas de milivolts positivos"
      },
      {
        "id": "382606ffe9c9",
        "texto": "Centenas de volts"
      },
      {
        "id": "abfbd9bf2bb2",
        "texto": "Milhares de volts"
      },
      {
        "id": "47b46bafe7a5",
        "texto": "Exatamente zero em qualquer situação"
      }
    ],
    "correta": "b25e9e4fed75",
    "explicacao": "O potencial endococlear é aproximadamente +80 mV em relação aos espaços extracelulares vizinhos; esse ambiente sustenta a transdução auditiva.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "quiz-casos-potencial",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "variante": "casos",
    "enunciado": "Uma aula descreve um fluido coclear rico em potássio e potencial próximo de +80 mV. A que fenômeno a descrição se refere?",
    "opcoes": [
      {
        "id": "73e04906b6e0",
        "texto": "Potencial endococlear"
      },
      {
        "id": "a602c53da44d",
        "texto": "Pressão arterial sistólica"
      },
      {
        "id": "866eefe8fbdf",
        "texto": "Temperatura do ouvido"
      },
      {
        "id": "61f406cd1e44",
        "texto": "Potencial elétrico de uma tomada"
      }
    ],
    "correta": "73e04906b6e0",
    "explicacao": "O potencial endococlear é aproximadamente +80 mV em relação aos espaços extracelulares vizinhos; esse ambiente sustenta a transdução auditiva.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "quiz-teoria-convulsao",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "variante": "teoria",
    "enunciado": "Qual ação deve ser evitada durante uma crise convulsiva?",
    "opcoes": [
      {
        "id": "064fe0701e02",
        "texto": "Colocar um objeto na boca"
      },
      {
        "id": "9e2c319bff51",
        "texto": "Afastar objetos perigosos"
      },
      {
        "id": "2a14737d2d2f",
        "texto": "Cronometrar a crise"
      },
      {
        "id": "71951202ec1a",
        "texto": "Proteger a cabeça de impactos"
      }
    ],
    "correta": "064fe0701e02",
    "explicacao": "Durante uma crise convulsiva, não se deve colocar objetos na boca nem tentar conter os movimentos à força.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "quiz-casos-convulsao",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "variante": "casos",
    "enunciado": "Alguém quer colocar uma colher na boca de uma pessoa em convulsão. Qual orientação é adequada?",
    "opcoes": [
      {
        "id": "95d5645cf72f",
        "texto": "Evitar colocar objetos na boca"
      },
      {
        "id": "70e1fd787f3a",
        "texto": "Introduzir a colher entre os dentes"
      },
      {
        "id": "43a6b2147473",
        "texto": "Dar água durante a crise"
      },
      {
        "id": "dd8d02fb9099",
        "texto": "Imobilizar braços e pernas à força"
      }
    ],
    "correta": "95d5645cf72f",
    "explicacao": "Durante uma crise convulsiva, não se deve colocar objetos na boca nem tentar conter os movimentos à força.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "quiz-teoria-cronometro",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "variante": "teoria",
    "enunciado": "Qual duração de crise convulsiva é um critério de ajuda imediata?",
    "opcoes": [
      {
        "id": "605099a8e151",
        "texto": "Mais de cinco minutos"
      },
      {
        "id": "70d2b8ce6137",
        "texto": "Apenas mais de duas horas"
      },
      {
        "id": "6c5bccf685d9",
        "texto": "Apenas mais de trinta minutos"
      },
      {
        "id": "abf0bbd5039e",
        "texto": "A duração nunca importa"
      }
    ],
    "correta": "605099a8e151",
    "explicacao": "Cronometrar uma crise é relevante: duração superior a cinco minutos é um dos critérios para buscar ajuda imediata.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "quiz-casos-cronometro",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "variante": "casos",
    "enunciado": "Uma crise convulsiva continua por mais de cinco minutos. Qual atitude corresponde à orientação de primeiros cuidados?",
    "opcoes": [
      {
        "id": "edcbab858ab6",
        "texto": "Acionar ajuda de emergência"
      },
      {
        "id": "1bc0622bd1eb",
        "texto": "Aguardar mais vinte e cinco minutos"
      },
      {
        "id": "447a8b09cd83",
        "texto": "Oferecer alimento durante a crise"
      },
      {
        "id": "33f4ba8cffcc",
        "texto": "Colocar objeto na boca"
      }
    ],
    "correta": "edcbab858ab6",
    "explicacao": "Cronometrar uma crise é relevante: duração superior a cinco minutos é um dos critérios para buscar ajuda imediata.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "quiz-teoria-insulina",
    "versao": 1,
    "tema": "Endocrinologia",
    "variante": "teoria",
    "enunciado": "Qual alteração está ligada ao diabetes tipo 1?",
    "opcoes": [
      {
        "id": "881a9e9c51e4",
        "texto": "Deficiência de insulina"
      },
      {
        "id": "3dba9e9b18e2",
        "texto": "Excesso de eritropoietina como causa principal"
      },
      {
        "id": "bc614396eb1a",
        "texto": "Produção de insulina pela bexiga"
      },
      {
        "id": "d12ebd859718",
        "texto": "Excesso universal de plaquetas"
      }
    ],
    "correta": "881a9e9c51e4",
    "explicacao": "No diabetes tipo 1, a destruição autoimune de células beta reduz a produção de insulina.",
    "fonte": "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes"
  },
  {
    "id": "quiz-casos-insulina",
    "versao": 1,
    "tema": "Endocrinologia",
    "variante": "casos",
    "enunciado": "Um caso apresenta destruição autoimune de células beta pancreáticas. Qual consequência é esperada?",
    "opcoes": [
      {
        "id": "d8f5b3962cb9",
        "texto": "Menor produção de insulina"
      },
      {
        "id": "9929b76f111c",
        "texto": "Produção de insulina pela bexiga"
      },
      {
        "id": "70e6c0ddc68e",
        "texto": "Eliminação da necessidade de insulina"
      },
      {
        "id": "9ac06124fd1c",
        "texto": "Conversão de glicose em eritropoietina"
      }
    ],
    "correta": "d8f5b3962cb9",
    "explicacao": "No diabetes tipo 1, a destruição autoimune de células beta reduz a produção de insulina.",
    "fonte": "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes"
  },
  {
    "id": "quiz-teoria-vacina",
    "versao": 1,
    "tema": "Imunologia",
    "variante": "teoria",
    "enunciado": "Qual processo é promovido por vacinas?",
    "opcoes": [
      {
        "id": "c63d7cbdd969",
        "texto": "Memória imunológica"
      },
      {
        "id": "e99d1d9f353a",
        "texto": "Troca das células imunes por antibióticos"
      },
      {
        "id": "c1901f66e0bd",
        "texto": "Produção de urina na medula"
      },
      {
        "id": "e264505d03f2",
        "texto": "Desligamento definitivo da imunidade"
      }
    ],
    "correta": "c63d7cbdd969",
    "explicacao": "Vacinas mobilizam as defesas imunes e favorecem memória; mecanismos e componentes variam entre vacinas.",
    "fonte": "https://www.cdc.gov/vaccines/basics/explaining-how-vaccines-work.html"
  },
  {
    "id": "quiz-casos-vacina",
    "versao": 1,
    "tema": "Imunologia",
    "variante": "casos",
    "enunciado": "Após vacinação, o organismo reconhece melhor um antígeno em exposição futura. Qual mecanismo é compatível?",
    "opcoes": [
      {
        "id": "70e15b03dcae",
        "texto": "Memória imunológica"
      },
      {
        "id": "ed67507784d4",
        "texto": "Destruição de toda memória imune"
      },
      {
        "id": "59fab65db208",
        "texto": "Substituição do sistema imune por antibióticos"
      },
      {
        "id": "4575b4cd20d8",
        "texto": "Conversão de hemácias em antígenos"
      }
    ],
    "correta": "70e15b03dcae",
    "explicacao": "Vacinas mobilizam as defesas imunes e favorecem memória; mecanismos e componentes variam entre vacinas.",
    "fonte": "https://www.cdc.gov/vaccines/basics/explaining-how-vaccines-work.html"
  },
  {
    "id": "quiz-teoria-sal",
    "versao": 1,
    "tema": "Fisiologia renal",
    "variante": "teoria",
    "enunciado": "Qual função é atribuída aos rins?",
    "opcoes": [
      {
        "id": "b5a2ee299eda",
        "texto": "Regulação de água, sais e ácidos"
      },
      {
        "id": "e3f7412c340b",
        "texto": "Produção de bile"
      },
      {
        "id": "24d9458b95d5",
        "texto": "Armazenamento de memória auditiva"
      },
      {
        "id": "50332f176449",
        "texto": "Digestão de alimentos no estômago"
      }
    ],
    "correta": "b5a2ee299eda",
    "explicacao": "Os rins participam do equilíbrio de água, sais e ácidos; sua função vai além de produzir urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-casos-sal",
    "versao": 1,
    "tema": "Fisiologia renal",
    "variante": "casos",
    "enunciado": "Um aluno diz que os rins apenas produzem urina. Qual função adicional corrige a afirmação?",
    "opcoes": [
      {
        "id": "9dba9b03b323",
        "texto": "Regulação do equilíbrio hidroeletrolítico e ácido-base"
      },
      {
        "id": "7998b8b8b40c",
        "texto": "Produção de bile"
      },
      {
        "id": "eefed0177354",
        "texto": "Digestão no estômago"
      },
      {
        "id": "bab67bed7b3a",
        "texto": "Armazenamento de lembranças"
      }
    ],
    "correta": "9dba9b03b323",
    "explicacao": "Os rins participam do equilíbrio de água, sais e ácidos; sua função vai além de produzir urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "quiz-teoria-seguranca",
    "versao": 1,
    "tema": "Princípios de cuidado",
    "variante": "teoria",
    "enunciado": "Qual prática corresponde ao uso responsável de antibióticos?",
    "opcoes": [
      {
        "id": "2e786851f8e5",
        "texto": "Usar apenas com indicação e orientação específicas"
      },
      {
        "id": "bcfe16cc8e9c",
        "texto": "Compartilhar sobras"
      },
      {
        "id": "9f7beebb09f0",
        "texto": "Guardar sobras para qualquer febre futura"
      },
      {
        "id": "4cc94fd52bb1",
        "texto": "Escolher pela cor da embalagem"
      }
    ],
    "correta": "2e786851f8e5",
    "explicacao": "Medicamentos prescritos para outra pessoa não devem ser compartilhados; indicação, dose e duração precisam de orientação específica.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "quiz-casos-seguranca",
    "versao": 1,
    "tema": "Princípios de cuidado",
    "variante": "casos",
    "enunciado": "Uma pessoa oferece a sobra de seu antibiótico a um vizinho com febre, sem avaliação. Qual orientação é adequada?",
    "opcoes": [
      {
        "id": "c27cef2cab6b",
        "texto": "Não compartilhar e buscar avaliação da indicação"
      },
      {
        "id": "a13f150b398f",
        "texto": "Aceitar porque ambos tiveram febre"
      },
      {
        "id": "2de83b1157da",
        "texto": "Usar meia dose para evitar riscos"
      },
      {
        "id": "8487a7ab2645",
        "texto": "Misturar sobras de diferentes antibióticos"
      }
    ],
    "correta": "c27cef2cab6b",
    "explicacao": "Medicamentos prescritos para outra pessoa não devem ser compartilhados; indicação, dose e duração precisam de orientação específica.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  }
];
const BANCO_FRASES = [
  {
    "id": "frase-bcb1d6005def",
    "conceito": "antivirus",
    "versao": 1,
    "tema": "Microbiologia",
    "texto": "Antibióticos antibacterianos não curam um resfriado viral.",
    "verdadeira": true,
    "explicacao": "Antibióticos antibacterianos não tratam vírus; seu uso precisa de indicação.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "frase-1c10a720e530",
    "conceito": "antivirus",
    "versao": 1,
    "tema": "Microbiologia",
    "texto": "Antibióticos antibacterianos eliminam o vírus do resfriado.",
    "verdadeira": false,
    "explicacao": "Antibióticos antibacterianos não tratam vírus; seu uso precisa de indicação.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "frase-3f8833518f36",
    "conceito": "muco",
    "versao": 1,
    "tema": "Mitos do dia a dia",
    "texto": "Muco amarelo ou verde, sozinho, não comprova necessidade de antibiótico.",
    "verdadeira": true,
    "explicacao": "A cor do muco, isoladamente, não determina necessidade de antibiótico.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "frase-31fd42cef112",
    "conceito": "muco",
    "versao": 1,
    "tema": "Mitos do dia a dia",
    "texto": "Muco verde é uma receita automática de antibiótico: a cor fecha o diagnóstico.",
    "verdadeira": false,
    "explicacao": "A cor do muco, isoladamente, não determina necessidade de antibiótico.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "frase-3827cfe939fd",
    "conceito": "rim",
    "versao": 1,
    "tema": "Fisiologia renal",
    "texto": "A bexiga armazena a urina produzida pelos rins.",
    "verdadeira": true,
    "explicacao": "Os rins filtram o sangue e removem resíduos e excesso de água; a bexiga armazena urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-754652e55e04",
    "conceito": "rim",
    "versao": 1,
    "tema": "Fisiologia renal",
    "texto": "A bexiga filtra o sangue; os rins são apenas reservatórios de urina.",
    "verdadeira": false,
    "explicacao": "Os rins filtram o sangue e removem resíduos e excesso de água; a bexiga armazena urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-9ae42d8ab025",
    "conceito": "nefron",
    "versao": 1,
    "tema": "Detalhes da medicina",
    "texto": "O néfron tem um glomérulo e um túbulo.",
    "verdadeira": true,
    "explicacao": "O néfron inclui glomérulo e túbulo: filtração e processamento tubular têm funções diferentes.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-aaa9775568a9",
    "conceito": "nefron",
    "versao": 1,
    "tema": "Detalhes da medicina",
    "texto": "O néfron é o nome técnico de uma plaqueta gigante.",
    "verdadeira": false,
    "explicacao": "O néfron inclui glomérulo e túbulo: filtração e processamento tubular têm funções diferentes.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-f852bdc9bc7e",
    "conceito": "reabsorcao",
    "versao": 1,
    "tema": "Fisiologia renal",
    "texto": "Grande parte da água filtrada é reabsorvida pelos túbulos renais.",
    "verdadeira": true,
    "explicacao": "Os túbulos retornam ao sangue grande parte da água e substâncias necessárias presentes no filtrado.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-3a3280d35734",
    "conceito": "reabsorcao",
    "versao": 1,
    "tema": "Fisiologia renal",
    "texto": "Toda água que passa pelo glomérulo sai imediatamente como urina.",
    "verdadeira": false,
    "explicacao": "Os túbulos retornam ao sangue grande parte da água e substâncias necessárias presentes no filtrado.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-d5d7b7b41e62",
    "conceito": "epo",
    "versao": 1,
    "tema": "Hematologia",
    "texto": "A eritropoietina produzida pelos rins estimula a produção de hemácias na medula óssea.",
    "verdadeira": true,
    "explicacao": "A eritropoietina renal sinaliza à medula óssea a produção de hemácias; sua redução pode contribuir para anemia na doença renal.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/anemia"
  },
  {
    "id": "frase-63ba7c64ce6d",
    "conceito": "epo",
    "versao": 1,
    "tema": "Hematologia",
    "texto": "Hemácias nascem prontas dentro da bexiga e sobem pelo ureter para o sangue.",
    "verdadeira": false,
    "explicacao": "A eritropoietina renal sinaliza à medula óssea a produção de hemácias; sua redução pode contribuir para anemia na doença renal.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/anemia"
  },
  {
    "id": "frase-6d03641a5962",
    "conceito": "nucleo",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "texto": "A hemácia humana madura não possui núcleo.",
    "verdadeira": true,
    "explicacao": "Hemácias humanas maduras não têm núcleo; não se deve generalizar isso para todas as células sanguíneas.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "frase-0bc75c3d583b",
    "conceito": "nucleo",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "texto": "Toda hemácia humana madura tem um núcleo com dois nucléolos.",
    "verdadeira": false,
    "explicacao": "Hemácias humanas maduras não têm núcleo; não se deve generalizar isso para todas as células sanguíneas.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "frase-8625aa00d39d",
    "conceito": "plaquetas",
    "versao": 1,
    "tema": "Hematologia",
    "texto": "Plaquetas são fragmentos celulares derivados de megacariócitos.",
    "verdadeira": true,
    "explicacao": "Plaquetas são fragmentos celulares derivados de megacariócitos e participam da hemostasia.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "frase-0d5d00005153",
    "conceito": "plaquetas",
    "versao": 1,
    "tema": "Hematologia",
    "texto": "Plaquetas são bactérias domesticadas que costuram vasos sanguíneos.",
    "verdadeira": false,
    "explicacao": "Plaquetas são fragmentos celulares derivados de megacariócitos e participam da hemostasia.",
    "fonte": "https://www.ncbi.nlm.nih.gov/books/NBK2263/"
  },
  {
    "id": "frase-c545ffcfd72c",
    "conceito": "endolinfa",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "texto": "A endolinfa coclear é um fluido extracelular rico em potássio.",
    "verdadeira": true,
    "explicacao": "A endolinfa coclear é um fluido extracelular rico em potássio, com potencial endococlear positivo.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "frase-e99296a3f9f1",
    "conceito": "endolinfa",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "texto": "A endolinfa coclear tem sódio como seu principal cátion, exatamente como a perilinfa.",
    "verdadeira": false,
    "explicacao": "A endolinfa coclear é um fluido extracelular rico em potássio, com potencial endococlear positivo.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "frase-c5c066bbf6db",
    "conceito": "potencial",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "texto": "O potencial endococlear é aproximadamente +80 mV em relação aos espaços extracelulares vizinhos.",
    "verdadeira": true,
    "explicacao": "O potencial endococlear é aproximadamente +80 mV em relação aos espaços extracelulares vizinhos; esse ambiente sustenta a transdução auditiva.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "frase-e8c579cbd3c6",
    "conceito": "potencial",
    "versao": 1,
    "tema": "Curiosidades específicas",
    "texto": "O potencial endococlear normal é de 220 volts: a cóclea funciona como uma tomada.",
    "verdadeira": false,
    "explicacao": "O potencial endococlear é aproximadamente +80 mV em relação aos espaços extracelulares vizinhos; esse ambiente sustenta a transdução auditiva.",
    "fonte": "https://pubmed.ncbi.nlm.nih.gov/16990454/"
  },
  {
    "id": "frase-adcc773279a0",
    "conceito": "convulsao",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "texto": "Não se deve colocar objetos na boca de alguém durante uma crise convulsiva.",
    "verdadeira": true,
    "explicacao": "Durante uma crise convulsiva, não se deve colocar objetos na boca nem tentar conter os movimentos à força.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "frase-a8c8f45f59c6",
    "conceito": "convulsao",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "texto": "Durante uma crise convulsiva, colocar uma colher na boca protege dentes e mandíbula.",
    "verdadeira": false,
    "explicacao": "Durante uma crise convulsiva, não se deve colocar objetos na boca nem tentar conter os movimentos à força.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "frase-a2ab2422df7f",
    "conceito": "cronometro",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "texto": "Uma crise convulsiva com duração superior a cinco minutos exige ajuda imediata.",
    "verdadeira": true,
    "explicacao": "Cronometrar uma crise é relevante: duração superior a cinco minutos é um dos critérios para buscar ajuda imediata.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "frase-335c018f4fb6",
    "conceito": "cronometro",
    "versao": 1,
    "tema": "Primeiros cuidados",
    "texto": "O cronômetro só importa após trinta minutos de convulsão contínua.",
    "verdadeira": false,
    "explicacao": "Cronometrar uma crise é relevante: duração superior a cinco minutos é um dos critérios para buscar ajuda imediata.",
    "fonte": "https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html"
  },
  {
    "id": "frase-72d54fdb1a02",
    "conceito": "insulina",
    "versao": 1,
    "tema": "Endocrinologia",
    "texto": "No diabetes tipo 1, a destruição autoimune de células beta reduz a produção de insulina.",
    "verdadeira": true,
    "explicacao": "No diabetes tipo 1, a destruição autoimune de células beta reduz a produção de insulina.",
    "fonte": "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes"
  },
  {
    "id": "frase-658dee35d1db",
    "conceito": "insulina",
    "versao": 1,
    "tema": "Endocrinologia",
    "texto": "No diabetes tipo 1, a bexiga produz insulina em excesso e isso causa hiperglicemia.",
    "verdadeira": false,
    "explicacao": "No diabetes tipo 1, a destruição autoimune de células beta reduz a produção de insulina.",
    "fonte": "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes"
  },
  {
    "id": "frase-22574165ef47",
    "conceito": "vacina",
    "versao": 1,
    "tema": "Imunologia",
    "texto": "Vacinas podem estimular memória imunológica.",
    "verdadeira": true,
    "explicacao": "Vacinas mobilizam as defesas imunes e favorecem memória; mecanismos e componentes variam entre vacinas.",
    "fonte": "https://www.cdc.gov/vaccines/basics/explaining-how-vaccines-work.html"
  },
  {
    "id": "frase-c35fc31c9168",
    "conceito": "vacina",
    "versao": 1,
    "tema": "Imunologia",
    "texto": "Vacinas substituem todas as células imunes por antibióticos microscópicos.",
    "verdadeira": false,
    "explicacao": "Vacinas mobilizam as defesas imunes e favorecem memória; mecanismos e componentes variam entre vacinas.",
    "fonte": "https://www.cdc.gov/vaccines/basics/explaining-how-vaccines-work.html"
  },
  {
    "id": "frase-f619b80ece68",
    "conceito": "sal",
    "versao": 1,
    "tema": "Fisiologia renal",
    "texto": "Os rins ajudam a regular o equilíbrio de água, sais e ácidos do organismo.",
    "verdadeira": true,
    "explicacao": "Os rins participam do equilíbrio de água, sais e ácidos; sua função vai além de produzir urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-f463d0414e03",
    "conceito": "sal",
    "versao": 1,
    "tema": "Fisiologia renal",
    "texto": "O equilíbrio ácido-base depende apenas da vontade do paciente; os rins não participam.",
    "verdadeira": false,
    "explicacao": "Os rins participam do equilíbrio de água, sais e ácidos; sua função vai além de produzir urina.",
    "fonte": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
  },
  {
    "id": "frase-8f80bc121fb3",
    "conceito": "seguranca",
    "versao": 1,
    "tema": "Princípios de cuidado",
    "texto": "Não se deve compartilhar antibiótico prescrito para outra pessoa.",
    "verdadeira": true,
    "explicacao": "Medicamentos prescritos para outra pessoa não devem ser compartilhados; indicação, dose e duração precisam de orientação específica.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  },
  {
    "id": "frase-25f5e4085d5b",
    "conceito": "seguranca",
    "versao": 1,
    "tema": "Princípios de cuidado",
    "texto": "Compartilhar a sobra de antibiótico de um vizinho é uma forma segura de tratar qualquer febre.",
    "verdadeira": false,
    "explicacao": "Medicamentos prescritos para outra pessoa não devem ser compartilhados; indicação, dose e duração precisam de orientação específica.",
    "fonte": "https://www.cdc.gov/antibiotic-use/about/"
  }
];


function embaralhar(itens, sorteio) {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
function criarEntradaTreino(modo, variante, id, anterior, sorteio = Math.random) {
  if (!['quiz', 'verdadeMentira'].includes(modo) || (modo === 'quiz' && !['teoria', 'casos'].includes(variante))) throw new Error('Modo de treino inválido.');
  const anteriores = new Set((anterior?.itens || []).map(item => item.id));
  let itens;
  if (modo === 'quiz') {
    const banco = embaralhar(BANCO_QUIZ.filter(item => item.variante === variante), sorteio);
    itens = [...banco.filter(item => !anteriores.has(item.id)), ...banco.filter(item => anteriores.has(item.id))].slice(0, 5)
      .map(({ id, versao, tema, enunciado, opcoes }) => ({ id, versao, tema, enunciado, opcoes: embaralhar(opcoes, sorteio) }));
  } else {
    const verdades = 1 + Math.floor(sorteio() * 4);
    const conceitos = new Set();
    itens = [];
    for (const [valor, quantidade] of [[true, verdades], [false, 5 - verdades]]) {
      const banco = embaralhar(BANCO_FRASES.filter(item => item.verdadeira === valor), sorteio);
      const ordenado = [...banco.filter(item => !anteriores.has(item.id)), ...banco.filter(item => anteriores.has(item.id))];
      for (const item of ordenado) {
        if (conceitos.has(item.conceito)) continue;
        conceitos.add(item.conceito);
        itens.push({ id: item.id, versao: item.versao, tema: item.tema, texto: item.texto });
        if (itens.length === (valor ? verdades : 5)) break;
      }
      if (quantidade < 1) throw new Error('Distribuição inválida.');
    }
    itens = embaralhar(itens, sorteio);
  }
  return { id, modo, variante: modo === 'quiz' ? variante : 'misto', itens, respostas: [], resultados: [], encerrada: false, iniciadoEm: new Date().toISOString() };
}
function avaliarRespostaTreino(entrada, resposta, indice) {
  const item = entrada.itens[indice];
  if (!item || resposta?.itemId !== item.id) throw new Error('Item de resposta inválido.');
  const original = (entrada.modo === 'quiz' ? BANCO_QUIZ : BANCO_FRASES).find(q => q.id === item.id && q.versao === item.versao);
  if (!original) throw new Error('Conteúdo alterado. Atualize a rodada.');
  const escolha = resposta.escolha;
  if (entrada.modo === 'quiz' ? !item.opcoes.some(opcao => opcao.id === escolha) : typeof escolha !== 'boolean') throw new Error('Alternativa inválida.');
  const correta = entrada.modo === 'quiz' ? original.correta : original.verdadeira;
  return { itemId: item.id, versao: item.versao, tema: item.tema, escolha, correta, acertou: escolha === correta,
    explicacao: original.explicacao, fonte: original.fonte };
}
// A ponte pode reordenar propriedades de objetos. Compare os valores do domínio,
// preservando a ordem dos itens e o tipo da escolha (booleano ou ID de alternativa).
function mesmaRespostaTreino(a, b) {
  return Boolean(a && b && a.itemId === b.itemId && a.escolha === b.escolha);
}
function responderTreinoPerfil(perfil, modo, entradaId, respostas) {
  const stats = { partidas: 0, validas: 0, acertos: 0, itens: 0, xp: 0, medidor: 0, ...perfil.treinos?.[modo] };
  let entrada = stats.entrada;
  if (!entrada || entrada.id !== entradaId) throw new Error('Rodada não encontrada. Consulte o progresso salvo.');
  if (!Array.isArray(respostas)) throw new Error('Respostas inválidas.');
  if (respostas.length === entrada.respostas.length && entrada.respostas.every((r, i) => mesmaRespostaTreino(r, respostas[i]))) return perfil;
  if (entrada.encerrada || respostas.length > 5 || (modo === 'quiz' ? respostas.length !== entrada.respostas.length + 1 : respostas.length !== 5) ||
      entrada.respostas.some((resposta, i) => !mesmaRespostaTreino(resposta, respostas[i]))) throw new Error('A rodada mudou em outra aba. Consulte o progresso salvo.');
  if (modo === 'verdadeMentira' && (![1, 2, 3, 4].includes(respostas.filter(r => r.escolha === true).length))) throw new Error('Selecione de uma a quatro frases verdadeiras.');
  const resultados = respostas.map((r, i) => avaliarRespostaTreino(entrada, r, i));
  const terminou = respostas.length === 5;
  entrada = { ...entrada, respostas: respostas.map(({ itemId, escolha }) => ({ itemId, escolha })), resultados, encerrada: terminou };
  let base = perfil;
  let atualizado = { ...stats, entrada };
  if (terminou) {
    const acertos = resultados.filter(r => r.acertou).length;
    const valida = acertos >= 1;
    const medidor = stats.medidor + Number(valida);
    const ticketRodada = Math.floor(medidor / 2);
    const xp = acertos * (modo === 'quiz' && entrada.variante === 'casos' ? 25 : 20);
    const missoes = aplicarProgressoMissoes(lerMissoes(perfil), { rodadas_validas: Number(valida), acertos_treino: acertos });
    base = concederRecompensa(perfil, xp + missoes.xp, ticketRodada + missoes.tickets);
    entrada = { ...entrada, encerradoEm: new Date().toISOString(), relatorio: { acertos, total: 5, valida, xp, xpMissoes: missoes.xp,
      ticketsRodada: ticketRodada, ticketsMissoes: missoes.tickets, ticketsNivel: base.tickets - (Number(perfil.tickets) || 0) - ticketRodada - missoes.tickets,
      medidor: medidor % 2 } };
    atualizado = { ...stats, entrada, partidas: stats.partidas + 1, validas: stats.validas + Number(valida),
      acertos: stats.acertos + acertos, itens: stats.itens + 5, xp: stats.xp + xp, medidor: medidor % 2 };
    base.missoesDiarias = missoes.missoes;
  }
  return { ...base, treinos: { ...perfil.treinos, [modo]: atualizado } };
}

// Somente administrador durante a revisão do banco inicial.
const TREINOS_REVISADOS = false;

function abaRespostasTreino() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName('RespostasTreino');
  if (!aba) {
    aba = planilha.insertSheet('RespostasTreino');
    aba.getRange(1, 1, 1, 12).setValues([['uid', 'rodadaId', 'itemId', 'versao', 'modo', 'variante', 'tema', 'escolha', 'correta', 'acertou', 'data', 'estado']]);
  }
  return aba;
}

// Cada item é gravado uma vez. Reenvio também repara gravações interrompidas.
function registrarRespostasTreino(perfil, entrada) {
  const aba = abaRespostasTreino();
  const ultima = aba.getLastRow();
  const gravados = new Set((ultima > 1 ? aba.getRange(2, 1, ultima - 1, 3).getValues() : [])
    .filter(l => String(l[0]) === perfil.uid && String(l[1]) === entrada.id).map(l => String(l[2])));
  for (const resultado of entrada.resultados) {
    if (gravados.has(resultado.itemId)) continue;
    aba.getRange(aba.getLastRow() + 1, 1, 1, 12).setValues([[perfil.uid, entrada.id, resultado.itemId, resultado.versao,
      entrada.modo, entrada.variante, resultado.tema, JSON.stringify(resultado.escolha), JSON.stringify(resultado.correta), resultado.acertou,
      new Date().toISOString(), entrada.encerrada ? 'concluida' : 'respondida']]);
  }
}

function reciboTreino(perfil, entrada, consultar = false) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_PARTIDAS);
  if (!aba) throw new Error('Aba de recibos ausente.');
  const ultima = aba.getLastRow();
  const existe = ultima > 1 && aba.getRange(2, 1, ultima - 1, 2).getValues()
    .some(l => String(l[0]) === perfil.uid && String(l[1]) === entrada.id);
  if (!consultar && !existe) aba.getRange(ultima + 1, 1, 1, 4).setValues([[perfil.uid, entrada.id, new Date().toISOString(), entrada.relatorio?.xp || 0]]);
  return existe;
}

function operarTreino(aba, local, pedido) {
  const perfil = local.perfil;
  const modo = String(pedido.modo || '');
  if (!['quiz', 'verdadeMentira'].includes(modo)) throw new Error('Modo inválido.');
  const stats = perfil.treinos?.[modo] || {};
  const entrada = stats.entrada;
  if (pedido.acao === 'iniciarTreino') {
    if (!TREINOS_REVISADOS && perfil.role !== 'admin') throw new Error('Banco piloto aguardando validação de conteúdo.');
    if (entrada && !entrada.encerrada) return perfil;
    const id = String(pedido.entradaId || '');
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador inválido.');
    if (entrada?.id === id) return perfil;
    if (reciboTreino(perfil, { id }, true)) throw new Error('Esta rodada já foi encerrada.');
    if (entrada) { registrarRespostasTreino(perfil, entrada); if (entrada.encerrada) reciboTreino(perfil, entrada); }
    const nova = criarEntradaTreino(modo, String(pedido.variante || ''), id, entrada);
    const atualizado = { ...perfil, treinos: { ...perfil.treinos, [modo]: { ...stats, entrada: nova } } };
    salvarPerfil(aba, local.linha, atualizado);
    return atualizado;
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Rodada não encontrada. Consulte o progresso salvo.');
  let atualizado;
  if (pedido.acao === 'abandonarTreino') {
    if (entrada.encerrada) { registrarRespostasTreino(perfil, entrada); atualizarRankingNovo(perfil); reciboTreino(perfil, entrada); return perfil; }
    atualizado = { ...perfil, treinos: { ...perfil.treinos, [modo]: { ...stats, entrada: { ...entrada, encerrada: true, abandonada: true } } } };
  } else atualizado = responderTreinoPerfil(perfil, modo, entrada.id, pedido.respostas);
  salvarPerfil(aba, local.linha, atualizado);
  const salva = atualizado.treinos[modo].entrada;
  registrarRespostasTreino(atualizado, salva);
  if (salva.encerrada) { atualizarRankingNovo(atualizado); reciboTreino(atualizado, salva); }
  return atualizado;
}
