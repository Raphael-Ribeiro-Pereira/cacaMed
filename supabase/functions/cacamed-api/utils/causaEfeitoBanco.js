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
      { "id": "mecanismo", "correta": "c1", "explicacao": "O broncoespasmo reduz o calibre das vias aéreas. Edema e secreções também contribuem; o estreitamento não tem uma única causa." },
      { "id": "consequencia", "correta": "c2", "explicacao": "O estreitamento aumenta a resistência e dificulta a saída de ar. A intensidade do chiado não mede sozinha a obstrução." },
      { "id": "compensacao", "correta": "c3", "explicacao": "A maior carga exige mais trabalho respiratório. Essa resposta pode ser insuficiente e evoluir com fadiga." },
      { "id": "intervencao", "correta": "c4", "explicacao": "A broncodilatação melhora o fluxo. Ela não elimina toda a inflamação nem substitui a reavaliação da resposta." }
    ],
    "cartas": [
      { "id": "c1", "texto": "Contração do músculo liso brônquico" },
      { "id": "c2", "texto": "Menor calibre, maior resistência e fluxo expiratório limitado" },
      { "id": "c3", "texto": "Aumento do esforço e da frequência respiratória para manter a ventilação" },
      { "id": "c4", "texto": "Broncodilatador: relaxa o músculo liso e reduz a resistência" },
      { "id": "c5", "texto": "Garantir ventilação alveolar adequada em qualquer situação" },
      { "id": "c6", "texto": "Eliminar definitivamente toda a inflamação da asma" }
    ],
    "fonte": "https://ginasthma.org/reports/"
  }
];
