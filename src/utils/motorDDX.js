const API_KEY = 'AIzaSyCuBiqm9Gv9s7VM5FpEtLtRpdu_JdPE2is'; // Usando a mesma chave das cruzadinhas

// Dicionário para a IA entender quem está na equipe
const LORE_EQUIPE = {
  house: "Dr. House (Especialista Master: Pode dar dicas cruciais e ácidas, mas custa caro)",
  cameron: "Dra. Cameron (Imunologista: Intervém em alergias graves ou choques anafiláticos)",
  foreman: "Dr. Foreman (Neurologista: Salva o paciente de danos cerebrais severos)",
  chase: "Dr. Chase (Cirurgião/Intensivista: Intervém em paradas cardiorrespiratórias ou cirurgias de emergência)",
  treze: "Treze (Medicina Interna: Ajuda com doenças genéticas obscuras)",
  wilson: "Dr. Wilson (Oncologista: Intervém se o usuário tratar um tumor de forma irresponsável)",
  taub: "Dr. Taub (Cirurgião Plástico: Observa sintomas cutâneos ignorados)",
  kutner: "Dr. Kutner (Trauma/Medicina Esportiva: Age em envenenamentos ou traumas)",
  cuddy: "Dra. Cuddy (Diretora: Intervém e bloqueia exames/cirurgias caros e desnecessários logo no início)"
};

export const gerarPacienteInicial = async (nivelGlobal, dificuldade) => {
  const prompt = `Você é um simulador médico de alto realismo para treinamento de residentes.
  O jogador está no Nível Global ${nivelGlobal}.
  A dificuldade selecionada é: ${dificuldade}.
  
  Crie um caso clínico INICIAL de um paciente que acaba de dar entrada no Pronto-Socorro. 
  A doença (diagnosticoOculto) deve ser realista e adequada a um médico de nível ${nivelGlobal} (níveis altos = doenças mais raras ou apresentações atípicas). Os sintomas iniciais devem ser um pouco enganosos para exigir investigação.

  Retorne APENAS um JSON válido (sem formatação markdown, sem crases) com a exata estrutura abaixo:
  {
    "nome": "Nome Completo Fictício",
    "idade": 45,
    "queixaPrincipal": "Frase curta do sintoma principal",
    "historico": "Breve histórico médico ou de estilo de vida",
    "sinaisVitais": { "pa": "120/80", "fc": "85", "fr": "16", "temp": "37.2", "sat": "98%" },
    "diagnosticoOculto": "NOME EXATO DA DOENÇA (O jogador não pode ver isso ainda)",
    "opcoes": [
      "Pedir Exame de Sangue e Urina",
      "Solicitar Raio-X de Tórax",
      "Administrar Analgésico e Observar",
      "Pedir Tomografia Craniana"
    ]
  }
  As 'opcoes' devem ser 4 ações médicas plausíveis para o primeiro contato com esse paciente.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    let texto = data.candidates[0].content.parts[0].text;
    texto = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(texto);
  } catch (error) {
    console.error("Erro ao gerar paciente:", error);
    throw new Error("O pager quebrou. Não conseguimos bipar a emergência.");
  }
};

export const processarTurno = async (estadoPaciente, acaoEscolhida, equipeIds, dificuldade) => {
  const membrosEquipe = equipeIds.map(id => LORE_EQUIPE[id]).join(' | ');
  
  const prompt = `Você é o mestre de um RPG de simulação médica.
  DADOS DO PACIENTE:
  Nome: ${estadoPaciente.nome} (${estadoPaciente.idade} anos)
  Doença Real (Oculta): ${estadoPaciente.diagnosticoOculto}
  Sinais Vitais Atuais: ${JSON.stringify(estadoPaciente.sinaisVitais)}
  
  AÇÃO TOMADA PELO MÉDICO JOGADOR: "${acaoEscolhida}"
  
  EQUIPE DE APOIO DISPONÍVEL NA SALA: [${membrosEquipe || "Nenhum. O jogador está sozinho."}]

  REGRAS DE AVALIAÇÃO:
  1. Avalie se a ação ajuda a descobrir/tratar a doença ou piora o quadro.
  2. Se a ação for um ERRO FATAL (ex: dar anticoagulante para alguém com hemorragia interna), verifique se há alguém na EQUIPE DE APOIO capaz de intervir e salvar o paciente. Se houver, a equipe intervém, o paciente não morre, mas narre a bronca. Se não houver, o status é "GAME_OVER_MORTE".
  3. Se a ação for um exame caríssimo ou cirurgia desnecessária logo de cara, e a 'Cuddy' estiver na equipe, ela deve bloquear a ação.
  4. Se a ação resolve o caso ou se o jogador deu o diagnóstico final correto, o status é "VITORIA".
  5. Se a ação revelou resultados de exames, descreva os resultados na narrativa e altere os sinais vitais conforme a evolução da doença.

  Retorne APENAS um JSON válido (sem markdown) com a exata estrutura:
  {
    "narrativa": "Texto dramático ou clínico descrevendo o resultado da ação, resultados de exames ou intervenções da equipe.",
    "sinaisVitais": { "pa": "...", "fc": "...", "fr": "...", "temp": "...", "sat": "..." },
    "status": "CONTINUA" ou "VITORIA" ou "GAME_OVER_MORTE" ou "GAME_OVER_DEMISSAO",
    "opcoes": ["Próxima Ação 1", "Próxima Ação 2", "Próxima Ação 3", "Dar Diagnóstico Final"]
  }
  Se o status for VITORIA ou GAME_OVER, deixe o array 'opcoes' vazio [].
  Se a dificuldade for "formado", deixe o array 'opcoes' vazio [] (pois o jogador terá que digitar a resposta). Dificuldade atual: ${dificuldade}.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    let texto = data.candidates[0].content.parts[0].text;
    texto = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(texto);
  } catch (error) {
    console.error("Erro ao processar turno:", error);
    throw new Error("O paciente teve uma instabilidade, tente novamente.");
  }
};