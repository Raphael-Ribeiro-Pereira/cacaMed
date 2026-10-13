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
      { "id": "k1", "texto": "Observar a resposta ao tratamento, reavaliar a gravidade e registrar os critérios de alta e as orientações" },
      { "id": "k2", "texto": "Pedir tomografia de tórax de rotina antes de qualquer alta" },
      { "id": "k3", "texto": "Suspender o tratamento para completar o registro" }
    ],
    "fonte": "https://ginasthma.org/reports/"
  }
];
