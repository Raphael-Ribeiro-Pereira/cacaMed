// Conteúdo piloto: revisar clinicamente antes de liberar para jogadores.
export const CASOS_PLANTAO = [{
  id: 'resp-asma-1', versao: 1, sistema: 'Respiratório', revisado: false,
  titulo: 'Falta de ar no pronto atendimento',
  paciente: 'Marina, 28 anos', queixa: 'Estou com falta de ar e chiado desde esta manhã.',
  fonte: 'https://ginasthma.org/reports/',
  vitais: 'FC 108 bpm · FR 26 irpm · SpO₂ 94% em ar ambiente · PA 120/80 mmHg · T 36,7°C',
  hipoteseCorreta: 'asma', destinoAdequado: 'alta',
  criteriosAlta: ['tratamento', 'antiinflamatorio', 'reavaliar', 'orientar'],
  estadoInicial: 'Sintomática; precisa de avaliação e conduta',
  acoes: [
    { id: 'gravidade', grupo: 'Avaliação', texto: 'Avaliar consciência, fala e esforço respiratório', resposta: 'Consciente, fala frases completas, com esforço respiratório leve. Sem sonolência ou confusão.', pontos: 25, criterio: 'seguranca', minutos: 1 },
    { id: 'inicio', grupo: 'Anamnese', texto: 'Quando começou? Houve algum desencadeante?', resposta: 'Começou após limpar um quarto empoeirado. A falta de ar aumentou ao longo da manhã.', pontos: 10, criterio: 'raciocinio', minutos: 1 },
    { id: 'antecedentes', grupo: 'Anamnese', texto: 'Já teve episódios assim ou internações?', resposta: 'Tenho asma desde criança. Nunca fui intubada; precisei de atendimento por crise no ano passado.', pontos: 15, criterio: 'raciocinio', minutos: 1 },
    { id: 'medicamentos', grupo: 'Anamnese', texto: 'Quais medicamentos usa? Usou algo hoje?', resposta: 'Parei o controlador inalatório há algumas semanas. Usei meu inalador de alívio uma vez, com melhora passageira.', pontos: 15, criterio: 'raciocinio', minutos: 1 },
    { id: 'alergias', grupo: 'Anamnese', texto: 'Tem alergias a medicamentos?', resposta: 'Não tenho alergias conhecidas a medicamentos.', pontos: 15, criterio: 'seguranca', minutos: 1 },
    { id: 'associados', grupo: 'Anamnese', texto: 'Tem febre, dor torácica ou outros sintomas?', resposta: 'Nego febre, dor no peito, desmaio e inchaço nas pernas. Tenho tosse seca.', pontos: 10, criterio: 'raciocinio', minutos: 1 },
    { id: 'ausculta', grupo: 'Exame físico', texto: 'Examinar o tórax e auscultar os pulmões', resposta: 'Sibilos difusos bilateralmente e expiração prolongada. Sem sinais focais ou tórax silencioso.', pontos: 15, criterio: 'raciocinio', minutos: 2 },
    { id: 'pfe', grupo: 'Exames', texto: 'Medir pico de fluxo expiratório, se possível', resposta: 'PFE inicial: 65% do melhor valor pessoal. A medida não deve atrasar o tratamento.', pontos: 10, criterio: 'raciocinio', minutos: 2 },
    { id: 'radiografia', grupo: 'Exames', texto: 'Solicitar radiografia de tórax de rotina', resposta: 'Sem achado agudo. Neste roteiro não havia indicação de rotina; reconsidere se houver suspeita alternativa ou evolução inesperada.', pontos: -10, criterio: 'eficiencia', minutos: 15 },
    { id: 'tomografia', grupo: 'Exames', texto: 'Solicitar tomografia de tórax de rotina', resposta: 'Sem alteração que explique a crise. O caso não apresentou indicação para este exame.', pontos: -20, criterio: 'eficiencia', minutos: 30 },
    { id: 'asma', grupo: 'Hipóteses', texto: 'Registrar exacerbação de asma como hipótese principal', resposta: 'Hipótese registrada. Fundamente-a na história, no exame e na evolução; permaneça atento a causas alternativas.', pontos: 20, criterio: 'raciocinio', minutos: 1 },
    { id: 'pneumonia', grupo: 'Hipóteses', texto: 'Registrar pneumonia como hipótese principal', resposta: 'Hipótese registrada, mas os dados deste caso não a sustentam como principal. Você pode revisá-la.', pontos: 0, criterio: 'raciocinio', minutos: 1 },
    { id: 'tratamento', grupo: 'Conduta', texto: 'Iniciar tratamento de alívio inalatório conforme protocolo', resposta: 'Tratamento iniciado sob supervisão. É necessário acompanhar a resposta e reavaliar a gravidade.', pontos: 25, criterio: 'seguranca', minutos: 2, exige: ['gravidade', 'alergias'], estadoPaciente: 'Em tratamento; aguarda reavaliação' },
    { id: 'antiinflamatorio', grupo: 'Conduta', texto: 'Avaliar corticoide sistêmico para a exacerbação', resposta: 'A equipe avalia e administra corticoide sistêmico conforme a gravidade e o protocolo local. O controle anti-inflamatório também será revisto.', pontos: 15, criterio: 'seguranca', minutos: 2, exige: ['gravidade', 'alergias'] },
    { id: 'oxigenio', grupo: 'Conduta', texto: 'Avaliar necessidade de oxigênio controlado', resposta: 'SpO₂ de 94% em ar ambiente: manter monitorização e titular oxigênio se necessário. Não aplicar fluxo alto indiscriminadamente.', pontos: 10, criterio: 'seguranca', minutos: 1 },
    { id: 'reavaliar', grupo: 'Evolução', texto: 'Reavaliar após o tratamento e observar resposta', resposta: 'Após observação: fala confortável, FR 18, FC 92, SpO₂ 97% em ar ambiente e PFE 85% do melhor pessoal. Sibilos diminuíram.', pontos: 25, criterio: 'seguranca', minutos: 60, exige: ['tratamento', 'antiinflamatorio'], estadoPaciente: 'Melhora após tratamento e observação' },
    { id: 'orientar', grupo: 'Conduta', texto: 'Rever controlador, técnica inalatória, plano de ação e retorno', resposta: 'Paciente demonstra a técnica. Registrados plano de ação, sinais de alarme, tratamento contendo corticoide inalatório e acompanhamento breve.', pontos: 20, criterio: 'seguranca', minutos: 3, exige: ['reavaliar'] },
    { id: 'alta', grupo: 'Encerramento', texto: 'Encerrar com alta orientada após melhora', resposta: 'Atendimento encerrado. Confira o relatório de decisões e pontos para revisão.', pontos: 0, criterio: 'seguranca', minutos: 1, terminal: true },
    { id: 'encaminhar', grupo: 'Encerramento', texto: 'Encaminhar para avaliação de maior complexidade', resposta: 'Encaminhamento registrado. Neste roteiro, confira se a evolução e os dados justificavam essa decisão.', pontos: 0, criterio: 'seguranca', minutos: 1, terminal: true },
  ],
  essenciais: ['gravidade', 'antecedentes', 'medicamentos', 'alergias', 'ausculta', 'asma', 'tratamento', 'antiinflamatorio', 'reavaliar', 'orientar'],
}];

export function obterCasoPlantao(id) {
  const caso = CASOS_PLANTAO.find(item => item.id === id);
  if (!caso) throw new Error('Caso não encontrado.');
  return caso;
}

export function executarPlantao(caso, escolhas = []) {
  if (!Array.isArray(escolhas) || escolhas.length > caso.acoes.length) throw new Error('Registro de ações inválido.');
  const feitas = new Set();
  const eventos = [];
  const pontos = { raciocinio: 0, seguranca: 0, eficiencia: 20 };
  let minutos = 0;
  let encerrado = false;
  let hipotese = '';
  let destino = '';
  let estadoPaciente = caso.estadoInicial;
  for (const id of escolhas) {
    const acao = caso.acoes.find(item => item.id === id);
    if (!acao || feitas.has(id) || encerrado) throw new Error('Ação inválida ou repetida.');
    if ((acao.exige || []).some(item => !feitas.has(item))) throw new Error('Complete as avaliações necessárias antes desta ação.');
    feitas.add(id);
    if (acao.grupo === 'Hipóteses') hipotese = id;
    if (acao.estadoPaciente) estadoPaciente = acao.estadoPaciente;
    pontos[acao.criterio] += acao.pontos;
    minutos += acao.minutos;
    eventos.push({ id, texto: acao.texto, resposta: acao.resposta, minutos });
    if (acao.terminal) { encerrado = true; destino = id; }
  }
  // Rever a hipótese é permitido, mas somente a hipótese final pontua.
  for (const acao of caso.acoes.filter(item => item.grupo === 'Hipóteses')) {
    if (feitas.has(acao.id) && hipotese !== acao.id) pontos[acao.criterio] -= acao.pontos;
  }
  const omissoes = caso.essenciais.filter(id => !feitas.has(id));
  if (hipotese !== caso.hipoteseCorreta && feitas.has(caso.hipoteseCorreta)) omissoes.push(caso.hipoteseCorreta);
  const altaInsegura = destino === 'alta' && caso.criteriosAlta.some(id => !feitas.has(id));
  const seguro = encerrado && destino === caso.destinoAdequado && !altaInsegura && hipotese === caso.hipoteseCorreta && !omissoes.length;
  const desconto = altaInsegura ? 80 : destino === 'encaminhar' ? 20 : 0;
  const xp = encerrado ? Math.max(0, pontos.raciocinio + pontos.seguranca + pontos.eficiencia - desconto) : 0;
  return { escolhas: [...escolhas], eventos, minutos, encerrado, hipotese, destino, seguro, altaInsegura, omissoes, pontos, desconto, xp,
    estadoPaciente };
}
