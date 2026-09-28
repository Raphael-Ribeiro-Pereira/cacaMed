const FIREBASE_PROJECT_ID = 'caca-med';
const NOME_ABA_PERFIS = 'PerfisGoogle';
const LIMITE_CORPO_BYTES = 32768;
const NOME_ABA_TEMPORADA = 'RankingNovaTemporada';
const NOME_ABA_PARTIDAS = 'Partidas';
const ORIGENS_APP = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'https://caca-med.vercel.app'];
const EMAIL_ADMIN_INICIAL = 'raphaelrpereira.rp@gmail.com';

// O HTML fica em iframe do Google. Ele troca mensagens com o jogo e usa
// google.script.run para obter uma resposta legível às chamadas autenticadas.
function paginaPonte(nonce, origem) {
  if (!/^[a-f0-9]{32}$/.test(nonce)) throw new Error('Sessão da ponte inválida.');
  if (!ORIGENS_APP.includes(origem)) throw new Error('Origem não autorizada.');
  const configuracao = JSON.stringify({ nonce, origem });
  const html = '<!doctype html><meta charset="utf-8"><script>'
    + 'const cfg=' + configuracao + ';'
    + 'const destino=cfg.origem;'
    + 'window.top.postMessage({cacoMed:"pronto",nonce:cfg.nonce},destino);'
    + 'window.addEventListener("message",function(e){'
    + 'if(e.origin!==destino||e.data?.cacoMed!=="pedido"||e.data.nonce!==cfg.nonce)return;'
    + 'google.script.run.withSuccessHandler(function(r){window.top.postMessage({cacoMed:"resposta",nonce:cfg.nonce,resultado:r},destino)})'
    + '.withFailureHandler(function(erro){window.top.postMessage({cacoMed:"resposta",nonce:cfg.nonce,erro:(erro&&erro.message)||"Falha ao consultar o servidor."},destino)})'
    + '.api(e.data.pedido);'
    + '});</script>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function respostaJson(dados, callback) {
  const resposta = JSON.stringify(dados);
  if (callback) {
    if (!/^__cacoMedRanking\d+_\d+$/.test(callback)) {
      return ContentService.createTextOutput('Callback inválido.');
    }
    return ContentService.createTextOutput(callback + '(' + resposta + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(resposta)
    .setMimeType(ContentService.MimeType.JSON);
}

function hashUid(uid) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, uid)
    .map(byte => ((byte + 256) % 256).toString(16).padStart(2, '0')).join('');
}

function doGet(e) {
  if (e?.parameter?.ponte) return paginaPonte(String(e.parameter.ponte), String(e.parameter.origem || ''));
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_TEMPORADA);
  if (!aba) throw new Error('A aba da nova temporada não foi encontrada.');

  const ranking = aba.getDataRange().getValues().slice(1)
    .filter(linha => linha[0] && linha[1])
    .map(linha => ({
      idPublico: hashUid(String(linha[0])),
      nome: String(linha[1]),
      xpGlobal: Number(linha[2]) || 0,
      nivelGlobal: nivelPorXP(Number(linha[2]) || 0),
      partidas: Number(linha[4]) || 0,
      letras: Number(linha[5]) || 0,
      atualizadoEm: linha[6] ? String(linha[6]) : null,
      tempoMedio: linha[7] === '' || linha[7] == null ? null : Number(linha[7]),
    }))
    .sort((a, b) => b.xpGlobal - a.xpGlobal)
    .slice(0, 100);

  return respostaJson({ sucesso: true, ranking }, e && e.parameter && e.parameter.prefix);
}

function abaPerfis() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA_PERFIS);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA_PERFIS);
    aba.getRange(1, 1, 1, 4).setValues([['firebaseUid', 'email', 'perfilJson', 'atualizadoEm']]);
  }
  return aba;
}

function localizarPerfil(aba, uid) {
  const ultima = aba.getLastRow();
  if (ultima < 2) return { linha: 0, perfil: null };
  const linhas = aba.getRange(2, 1, ultima - 1, 3).getValues();
  const indice = linhas.findIndex(linha => String(linha[0]) === uid);
  if (indice < 0) return { linha: 0, perfil: null };
  return { linha: indice + 2, perfil: JSON.parse(String(linhas[indice][2])) };
}

function perfilNovo(uid, email, nome, username, titulo, materiaPreferida) {
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  return {
    uid, email, nome, username, titulo,
    role: email.toLowerCase() === EMAIL_ADMIN_INICIAL ? 'admin' : 'jogador',
    materiaPreferida, especialidade: materiaPreferida,
    pontuacaoTotal: 0, xpTopicos: {}, tickets: 0,
    economia: { versao: VERSAO_ECONOMIA, ultimoNivelPremiado: 1 }, medidorTicketsCruzadinha: 0, missoesDiarias: criarMissoesCruzadinha(),
    dataUltimoLogin: hoje, tutorialCruzadinhasConcluido: false,
    estatisticas: {}, estatisticasGerais: {}, criadoEm: new Date().toISOString(),
  };
}

function criarMissoesCruzadinha() { return criarMissoesDiarias(); }

function salvarPerfil(aba, linha, perfil) {
  const destino = linha || aba.getLastRow() + 1;
  aba.getRange(destino, 1, 1, 4).setValues([[
    perfil.uid, perfil.email, JSON.stringify(perfil), new Date().toISOString(),
  ]]);
}

function atualizarMissoesDoDia(aba, local) {
  if (!local.perfil) return null;
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  let perfil = migrarEconomia(local.perfil);
  if (perfil.dataUltimoLogin !== hoje || perfil.missoesDiarias?.length !== 3 || perfil.missoesDiarias.some(m => !['jogar_cruzadinha', 'rodadas_validas', 'acertos_treino'].includes(m.id))) {
    perfil = { ...perfil, dataUltimoLogin: hoje, missoesDiarias: criarMissoesDiarias() };
  }
  if (perfil !== local.perfil) salvarPerfil(aba, local.linha, perfil);
  // Rodadas ativas são gravadas pelo próprio operarTreino após cada resposta.
  // Reparar somente rodadas encerradas evita varrer a aba inteira a cada clique.
  for (const stats of Object.values(perfil.treinos || {})) {
    if (!stats.entrada?.encerrada) continue;
    registrarRespostasTreino(perfil, stats.entrada);
    reciboTreino(perfil, stats.entrada);
  }
  return perfil;
}

function registrarPartidaPlanilha(aba, local, partida) {
  if (!local.perfil) throw new Error('Cadastro não concluído.');
  const perfil = local.perfil;
  const id = String(partida?.id || '');
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador de partida inválido.');
  const recibos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA_PARTIDAS);
  if (!recibos) throw new Error('Aba de recibos ausente.');
  const ultimaLinhaRecibo = recibos.getLastRow();
  const reciboEncontrado = ultimaLinhaRecibo > 1 && recibos.getRange(2, 1, ultimaLinhaRecibo - 1, 2)
    .getValues().some(linha => String(linha[0]) === perfil.uid && String(linha[1]) === id);
  if (reciboEncontrado) return perfil;
  if ((perfil.cruzadinhasRegistradas || []).includes(id)) {
    atualizarRankingNovo(perfil);
    recibos.getRange(ultimaLinhaRecibo + 1, 1, 1, 4)
      .setValues([[perfil.uid, id, new Date().toISOString(), 0]]);
    return perfil;
  }
  const chaveXP = String(partida.chaveXP || '');
  const subMateria = String(partida.subMateria || '').slice(0, 80);
  const palavras = Number(partida.palavras);
  const letras = Number(partida.letras);
  const tempo = Number(partida.tempo);
  const erros = Number(partida.erros);
  const maiorPalavra = Number(partida.maiorPalavra);
  const penalidade = Number(partida.penalidadeXP || 0);
  if (!/^[A-Z0-9 -]{3,80}$/.test(chaveXP) || !subMateria
      || !Number.isInteger(palavras) || palavras < 1 || palavras > 40
      || !Number.isInteger(letras) || letras < palavras || letras > 400
      || !Number.isInteger(tempo) || tempo < 0 || tempo > 86400
      || !Number.isInteger(erros) || erros < 0 || erros > 1000
      || !Number.isInteger(maiorPalavra) || maiorPalavra < 1 || maiorPalavra > 40
      || ![0, 5, 15].includes(penalidade)) {
    throw new Error('Dados da partida fora dos limites.');
  }
  const xpAnterior = Number(perfil.xpTopicos?.[chaveXP]) || 0;
  const nivel = xpAnterior === 0 ? 0 : Math.floor(Math.sqrt(xpAnterior / 1000)) + 1;
  const base = letras * 2 + palavras * 10;
  const multNivel = 1 + (Math.max(1, nivel) - 1) * 0.1;
  const ideal = palavras * 15;
  const multTempo = tempo <= ideal * 0.25 ? 2 : tempo <= ideal * 0.5 ? 1.5 : tempo <= ideal ? 1.2 : 1;
  const xp = Math.max(10, Math.floor(base * multNivel * multTempo) - penalidade);
  const stats = { ...(perfil.estatisticas || {}) };
  const anterior = stats[chaveXP] || {};
  stats[chaveXP] = {
    ...anterior, partidas: (Number(anterior.partidas) || 0) + 1,
    tempo: (Number(anterior.tempo) || 0) + tempo,
    letras: (Number(anterior.letras) || 0) + letras,
    melhorTempo: anterior.melhorTempo ? Math.min(anterior.melhorTempo, tempo) : tempo,
  };
  const gerais = { ...(perfil.estatisticasGerais || {}) };
  gerais.errosTotais = (Number(gerais.errosTotais) || 0) + erros;
  gerais.maiorPalavra = Math.max(Number(gerais.maiorPalavra) || 0, maiorPalavra);
  gerais.streakAtual = (Number(gerais.streakAtual) || 0) + 1;
  gerais.maiorStreak = Math.max(Number(gerais.maiorStreak) || 0, gerais.streakAtual);
  const dia = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  if (gerais.ultimoDia !== dia) {
    gerais.diasSeguidos = (Number(gerais.diasSeguidos) || 0) + 1;
    gerais.ultimoDia = dia;
  }
  gerais.historico = [...(gerais.historico || []), {
    data: dia, materia: subMateria, tempo, erros, letrasCorretas: letras,
  }].slice(-30);
  const progresso = aplicarProgressoMissoes(lerMissoes(perfil), { jogar_cruzadinha: 1, acertar_palavras: palavras });
  const atualizado = {
    ...concederRecompensa(perfil, xp + progresso.xp, 2 + progresso.tickets),
    xpTopicos: { ...perfil.xpTopicos, [chaveXP]: xpAnterior + xp },
    medidorTicketsCruzadinha: 0,
    missoesDiarias: progresso.missoes, estatisticas: stats, estatisticasGerais: gerais,
    cruzadinhasRegistradas: [...(perfil.cruzadinhasRegistradas || []), id].slice(-100),
  };
  salvarPerfil(aba, local.linha, atualizado);
  atualizarRankingNovo(atualizado);
  recibos.getRange(ultimaLinhaRecibo + 1, 1, 1, 4)
    .setValues([[perfil.uid, id, new Date().toISOString(), xp]]);
  return atualizado;
}

function atualizarRankingNovo(perfil) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(NOME_ABA_TEMPORADA);
  if (!aba) throw new Error('Aba da nova temporada ausente.');
  const ultima = aba.getLastRow();
  const uids = ultima > 1 ? aba.getRange(2, 1, ultima - 1, 1).getValues().map(linha => String(linha[0])) : [];
  const indice = uids.indexOf(perfil.uid);
  const estatisticas = Object.values(perfil.estatisticas || {});
  const partidas = estatisticas.reduce((total, item) => total + (Number(item.partidas) || 0), 0);
  const letras = estatisticas.reduce((total, item) => total + (Number(item.letras) || 0), 0);
  const tempo = estatisticas.reduce((total, item) => total + (Number(item.tempo) || 0), 0);
  const nivel = nivelPorXP(perfil.pontuacaoTotal);
  aba.getRange(indice >= 0 ? indice + 2 : ultima + 1, 1, 1, 8).setValues([[
    perfil.uid, perfil.nome, perfil.pontuacaoTotal, nivel, partidas, letras,
    new Date().toISOString(), partidas ? Math.floor(tempo / partidas) : '',
  ]]);
}

function executarAcaoAdmin(aba, linha, perfil, pedido) {
  const operacao = String(pedido.operacao || '');
  const valor = Number(pedido.valor);
  const inteiro = (minimo, maximo) => {
    if (!Number.isInteger(valor) || valor < minimo || valor > maximo) throw new Error('Valor fora dos limites.');
  };
  let atualizado;
  if (operacao === 'setXP') {
    inteiro(0, 1000000000);
    atualizado = { ...perfil, pontuacaoTotal: valor, economia: { versao: VERSAO_ECONOMIA, ultimoNivelPremiado: nivelPorXP(valor) } };
    delete atualizado.nivelGlobalAdmin;
  } else if (operacao === 'setNivelGlobal') {
    inteiro(1, 1000);
    atualizado = { ...perfil, pontuacaoTotal: xpParaNivel(valor), economia: { versao: VERSAO_ECONOMIA, ultimoNivelPremiado: valor } };
    delete atualizado.nivelGlobalAdmin;
  } else if (operacao === 'setNivelCruzadinha') {
    inteiro(0, 100);
    const chaveXP = String(pedido.chaveXP || '');
    if (!/^[A-Z0-9 -]{3,80}$/.test(chaveXP)) throw new Error('Tópico inválido.');
    const xp = valor === 0 ? 0 : valor === 1 ? 1 : (valor - 1) ** 2 * 1000;
    atualizado = { ...perfil, xpTopicos: { ...perfil.xpTopicos, [chaveXP]: xp } };
  } else if (operacao === 'resetarProgresso') {
    atualizado = { ...perfil, pontuacaoTotal: 0, xpTopicos: {}, tickets: 0, economia: { versao: VERSAO_ECONOMIA, ultimoNivelPremiado: 1 },
      medidorTicketsCruzadinha: 0, missoesDiarias: criarMissoesCruzadinha(),
      estatisticas: {}, estatisticasGerais: {}, cruzadinhasRegistradas: [], treinos: {}, erroMedico: {}, causaEfeito: {}, ddx: { concluidos: [], historico: [], partidas: 0 } };
    delete atualizado.nivelGlobalAdmin;
  } else {
    throw new Error('Operação administrativa desconhecida.');
  }
  salvarPerfil(aba, linha, atualizado);
  atualizarRankingNovo(atualizado);
  return atualizado;
}

function operarPlantao(aba, local, pedido) {
  const perfil = local.perfil;
  const ddx = { concluidos: [], historico: [], partidas: 0, ...perfil.ddx };
  let entrada = ddx.entrada;
  if (pedido.acao === 'iniciarPlantao') {
    const caso = obterCasoPlantao(String(pedido.casoId || ''));
    if (!caso.revisado && perfil.role !== 'admin') throw new Error('Caso aguardando revisão clínica.');
    if (entrada && !entrada.relatorio.encerrado) {
      if (entrada.casoId !== caso.id) throw new Error('Conclua o plantão atual antes de iniciar outro.');
      return perfil;
    }
    const id = String(pedido.entradaId || '');
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador de entrada inválido.');
    if (entrada?.id === id) return perfil;
    if (ddx.historico.some(item => item.id === id)) throw new Error('Entrada já encerrada.');
    if ((Number(perfil.tickets) || 0) < 1) throw new Error('Tickets insuficientes. Conclua Cruzadinhas, Quiz ou Verdade ou mentira para ganhar tickets.');
    entrada = { id, casoId: caso.id, versao: caso.versao, iniciadoEm: new Date().toISOString(), relatorio: executarPlantao(caso, []) };
    const atualizado = { ...perfil, tickets: perfil.tickets - 1, ddx: { ...ddx, entrada } };
    salvarPerfil(aba, local.linha, atualizado);
    return atualizado;
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Plantão não encontrado. Atualize o perfil.');
  const caso = obterCasoPlantao(entrada.casoId);
  if (caso.versao !== entrada.versao) throw new Error('A versão deste caso mudou. Solicite revisão da entrada ao administrador.');
  const anteriores = entrada.relatorio.escolhas;
  const passos = pedido.escolhas;
  if (!Array.isArray(passos)) throw new Error('Registro de ações inválido.');
  if (JSON.stringify(passos) === JSON.stringify(anteriores)) {
    if (entrada.relatorio.encerrado) atualizarRankingNovo(perfil);
    return perfil;
  }
  if (entrada.relatorio.encerrado || passos.length <= anteriores.length || anteriores.some((id, indice) => passos[indice] !== id)) {
    throw new Error('O plantão mudou em outra aba. Atualize o perfil antes de continuar.');
  }
  const relatorio = executarPlantao(caso, passos);
  const chave = caso.id + ':' + caso.versao;
  const xp = relatorio.encerrado && !ddx.concluidos.includes(chave) ? relatorio.xp : 0;
  entrada = { ...entrada, relatorio, ...(relatorio.encerrado ? { xpConcedido: xp, encerradoEm: new Date().toISOString() } : {}) };
  const atualizado = { ...concederRecompensa(perfil, xp),
    xpTopicos: { ...perfil.xpTopicos, 'DDX-RESPIRATORIO': (Number(perfil.xpTopicos?.['DDX-RESPIRATORIO']) || 0) + xp },
    ddx: { ...ddx, entrada,
      concluidos: relatorio.encerrado ? [...new Set([...ddx.concluidos, chave])] : ddx.concluidos,
      partidas: ddx.partidas + Number(relatorio.encerrado),
      seguros: (Number(ddx.seguros) || 0) + Number(relatorio.seguro),
      xp: (Number(ddx.xp) || 0) + xp,
      historico: relatorio.encerrado ? [...ddx.historico, { id: entrada.id, casoId: caso.id, versao: caso.versao, xp, seguro: relatorio.seguro, data: entrada.encerradoEm }].slice(-30) : ddx.historico,
    } };
  salvarPerfil(aba, local.linha, atualizado);
  if (relatorio.encerrado) atualizarRankingNovo(atualizado);
  return atualizado;
}

function operarAuditoria(aba, local, pedido) {
  const perfil = local.perfil;
  const stats = { concluidos: [], historico: [], partidas: 0, acertos: 0, etapas: 0, xp: 0, ...perfil.erroMedico };
  let entrada = stats.entrada;
  if (pedido.acao === 'iniciarAuditoria') {
    const auditoria = obterAuditoria(String(pedido.auditoriaId || ''));
    if (!auditoria.caso.revisado && perfil.role !== 'admin') throw new Error('Caso aguardando revisão clínica.');
    if (entrada && !entrada.relatorio) {
      if (entrada.auditoriaId !== auditoria.id) throw new Error('Conclua a análise atual antes de iniciar outra.');
      return perfil;
    }
    const id = String(pedido.entradaId || '');
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador de entrada inválido.');
    if (entrada?.id === id) return perfil;
    if (stats.historico.some(item => item.id === id)) throw new Error('Entrada já encerrada.');
    if ((Number(perfil.tickets) || 0) < 1) throw new Error('Tickets insuficientes.');
    entrada = { id, auditoriaId: auditoria.id, versao: auditoria.versao, respostas: [], iniciadoEm: new Date().toISOString() };
    const atualizado = { ...perfil, tickets: perfil.tickets - 1, erroMedico: { ...stats, entrada } };
    salvarPerfil(aba, local.linha, atualizado);
    return atualizado;
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Análise não encontrada. Atualize o perfil.');
  const auditoria = obterAuditoria(entrada.auditoriaId);
  if (auditoria.versao !== entrada.versao) throw new Error('A versão da análise mudou. Solicite revisão ao administrador.');
  const respostas = pedido.respostas;
  if (!Array.isArray(respostas)) throw new Error('Respostas inválidas.');
  if (JSON.stringify(respostas) === JSON.stringify(entrada.respostas)) {
    if (entrada.relatorio) atualizarRankingNovo(perfil);
    return perfil;
  }
  if (entrada.relatorio || respostas.length !== entrada.respostas.length + 1 ||
      respostas.length > auditoria.perguntas.length || entrada.respostas.some((id, indice) => respostas[indice] !== id)) {
    throw new Error('A análise mudou em outra aba. Atualize o perfil antes de continuar.');
  }
  respostas.forEach((resposta, indice) => {
    if (!auditoria.perguntas[indice].alternativas.some(item => item.id === resposta)) throw new Error('Resposta inválida.');
  });
  const terminou = respostas.length === auditoria.perguntas.length;
  const relatorio = terminou ? avaliarAuditoria(auditoria, respostas) : null;
  const chave = auditoria.id + ':' + auditoria.versao;
  const repeticao = stats.concluidos.includes(chave);
  const xp = terminou && !repeticao ? relatorio.acertos * 25 : 0;
  entrada = { ...entrada, respostas: [...respostas], ...(terminou ? { relatorio, xpConcedido: xp, repeticao, encerradoEm: new Date().toISOString() } : {}) };
  const atualizado = { ...concederRecompensa(perfil, xp),
    xpTopicos: { ...perfil.xpTopicos, 'DDX-ERRO-MEDICO-RESPIRATORIO': (Number(perfil.xpTopicos?.['DDX-ERRO-MEDICO-RESPIRATORIO']) || 0) + xp },
    erroMedico: { ...stats, entrada, partidas: stats.partidas + Number(terminou),
      acertos: stats.acertos + (relatorio?.acertos || 0), etapas: stats.etapas + (relatorio?.total || 0), xp: stats.xp + xp,
      concluidos: terminou ? [...new Set([...stats.concluidos, chave])] : stats.concluidos,
      historico: terminou ? [...stats.historico, { id: entrada.id, auditoriaId: auditoria.id, versao: auditoria.versao, xp, acertos: relatorio.acertos, total: relatorio.total, data: entrada.encerradoEm }].slice(-30) : stats.historico,
    } };
  salvarPerfil(aba, local.linha, atualizado);
  if (terminou) atualizarRankingNovo(atualizado);
  return atualizado;
}

function operarRelacao(aba, local, pedido) {
  const perfil = local.perfil;
  const stats = { concluidos: [], historico: [], partidas: 0, acertos: 0, etapas: 0, xp: 0, ...perfil.causaEfeito };
  let entrada = stats.entrada;
  if (pedido.acao === 'iniciarRelacao') {
    const auditoria = obterRelacao(String(pedido.relacaoId || ''));
    if (!auditoria.caso.revisado && perfil.role !== 'admin') throw new Error('Caso aguardando revisão clínica.');
    if (entrada && !entrada.relatorio) {
      if (entrada.relacaoId !== auditoria.id) throw new Error('Conclua a análise atual antes de iniciar outra.');
      return perfil;
    }
    const id = String(pedido.entradaId || '');
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador de entrada inválido.');
    if (entrada?.id === id) return perfil;
    if (stats.historico.some(item => item.id === id)) throw new Error('Entrada já encerrada.');
    if ((Number(perfil.tickets) || 0) < 1) throw new Error('Tickets insuficientes.');
    entrada = { id, relacaoId: auditoria.id, versao: auditoria.versao, respostas: [], iniciadoEm: new Date().toISOString() };
    const atualizado = { ...perfil, tickets: perfil.tickets - 1, causaEfeito: { ...stats, entrada } };
    salvarPerfil(aba, local.linha, atualizado);
    return atualizado;
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Análise não encontrada. Atualize o perfil.');
  const auditoria = obterRelacao(entrada.relacaoId);
  if (auditoria.versao !== entrada.versao) throw new Error('A versão da análise mudou. Solicite revisão ao administrador.');
  const respostas = pedido.respostas;
  if (!Array.isArray(respostas)) throw new Error('Respostas inválidas.');
  if (JSON.stringify(respostas) === JSON.stringify(entrada.respostas)) {
    if (entrada.relatorio) atualizarRankingNovo(perfil);
    return perfil;
  }
  if (entrada.relatorio || respostas.length !== entrada.respostas.length + 1 ||
      respostas.length > auditoria.perguntas.length || entrada.respostas.some((id, indice) => respostas[indice] !== id)) {
    throw new Error('A análise mudou em outra aba. Atualize o perfil antes de continuar.');
  }
  respostas.forEach((resposta, indice) => {
    if (!auditoria.perguntas[indice].alternativas.some(item => item.id === resposta)) throw new Error('Resposta inválida.');
  });
  const terminou = respostas.length === auditoria.perguntas.length;
  const relatorio = terminou ? avaliarRelacao(auditoria, respostas) : null;
  const chave = auditoria.id + ':' + auditoria.versao;
  const repeticao = stats.concluidos.includes(chave);
  const xp = terminou && !repeticao ? relatorio.acertos * 25 : 0;
  entrada = { ...entrada, respostas: [...respostas], ...(terminou ? { relatorio, xpConcedido: xp, repeticao, encerradoEm: new Date().toISOString() } : {}) };
  const atualizado = { ...concederRecompensa(perfil, xp),
    xpTopicos: { ...perfil.xpTopicos, 'DDX-CAUSA-EFEITO-RESPIRATORIO': (Number(perfil.xpTopicos?.['DDX-CAUSA-EFEITO-RESPIRATORIO']) || 0) + xp },
    causaEfeito: { ...stats, entrada, partidas: stats.partidas + Number(terminou),
      acertos: stats.acertos + (relatorio?.acertos || 0), etapas: stats.etapas + (relatorio?.total || 0), xp: stats.xp + xp,
      concluidos: terminou ? [...new Set([...stats.concluidos, chave])] : stats.concluidos,
      historico: terminou ? [...stats.historico, { id: entrada.id, relacaoId: auditoria.id, versao: auditoria.versao, xp, acertos: relatorio.acertos, total: relatorio.total, data: entrada.encerradoEm }].slice(-30) : stats.historico,
    } };
  salvarPerfil(aba, local.linha, atualizado);
  if (terminou) atualizarRankingNovo(atualizado);
  return atualizado;
}

function api(pedido) {
  if (!pedido || JSON.stringify(pedido).length > LIMITE_CORPO_BYTES) throw new Error('Pedido inválido.');
  const token = String(pedido.idToken || '');
  const apiKey = String(pedido.apiKey || '');
  const uid = verificarToken(token, apiKey);
  const acao = String(pedido.acao || '');
  const aba = abaPerfis();
  if (!['obterPerfil', 'cadastrar', 'tutorial', 'editarPerfil', 'registrarPartida', 'admin', 'iniciarPlantao', 'acaoPlantao', 'iniciarAuditoria', 'responderAuditoria', 'iniciarRelacao', 'responderRelacao', 'iniciarTreino', 'responderTreino', 'abandonarTreino'].includes(acao)) throw new Error('Ação desconhecida.');

  const bloqueio = LockService.getScriptLock();
  bloqueio.waitLock(10000);
  try {
    const atual = localizarPerfil(aba, uid);
    if (acao === 'obterPerfil') {
      if (atual.perfil && atual.perfil.role !== 'admin') {
        const identidade = consultarContaFirebase(token, apiKey);
        if (String(identidade.email || '').toLowerCase() === EMAIL_ADMIN_INICIAL && identidade.localId === uid) {
          atual.perfil = { ...atual.perfil, role: 'admin' };
          salvarPerfil(aba, atual.linha, atual.perfil);
        }
      }
      return atualizarMissoesDoDia(aba, atual);
    }
    if (acao === 'cadastrar') {
      if (atual.perfil) return atual.perfil;
      const titulo = String(pedido.titulo || '');
      const materiaPreferida = String(pedido.materiaPreferida || '');
      if (!['Doutor', 'Doutora'].includes(titulo)
          || !['anatomia', 'neurologia', 'farmaco', 'micro', 'clinica', 'patologia'].includes(materiaPreferida)) {
        throw new Error('Dados de cadastro inválidos.');
      }
      const identidade = consultarContaFirebase(token, apiKey);
      const email = String(identidade.email || '');
      let nome = String(identidade.displayName || email.split('@')[0] || 'Plantonista').trim().slice(0, 80);
      if (!nome) nome = 'Plantonista';
      if (/^[=+\-@]/.test(nome)) nome = "'" + nome;
      const nomeGoogle = nome.split(/\s+/)[0].toLocaleLowerCase('pt-BR');
      const username = String(pedido.usarNomeGoogle === true ? nomeGoogle : pedido.username || '').trim();
      if (username.length < 2 || username.length > 40 || /^[=+\-@]/.test(username)) throw new Error('Username inválido. Escolha entre 2 e 40 caracteres.');
      const perfil = perfilNovo(uid, email, nome, username, titulo, materiaPreferida);
      salvarPerfil(aba, 0, perfil);
      return perfil;
    }
    if (!atual.perfil) throw new Error('Cadastro não concluído.');
    const perfilDoDia = atualizarMissoesDoDia(aba, atual);
    if (['iniciarTreino', 'responderTreino', 'abandonarTreino'].includes(acao)) return operarTreino(aba, { ...atual, perfil: perfilDoDia }, pedido);
    if (acao === 'iniciarPlantao' || acao === 'acaoPlantao') return operarPlantao(aba, { ...atual, perfil: perfilDoDia }, pedido);
    if (acao === 'iniciarAuditoria' || acao === 'responderAuditoria') return operarAuditoria(aba, { ...atual, perfil: perfilDoDia }, pedido);
    if (acao === 'iniciarRelacao' || acao === 'responderRelacao') return operarRelacao(aba, { ...atual, perfil: perfilDoDia }, pedido);
    if (acao === 'admin') {
      if (perfilDoDia.role !== 'admin') throw new Error('Acesso restrito ao administrador.');
      return executarAcaoAdmin(aba, atual.linha, perfilDoDia, pedido);
    }
    if (acao === 'registrarPartida') return registrarPartidaPlanilha(aba, { ...atual, perfil: perfilDoDia }, pedido.partida);
    if (acao === 'tutorial') {
      const perfil = { ...perfilDoDia, tutorialCruzadinhasConcluido: true };
      salvarPerfil(aba, atual.linha, perfil);
      return perfil;
    }
    const nome = String(pedido.nome || '').trim();
    const username = String(pedido.username || '').trim();
    if (nome.length < 2 || nome.length > 80 || username.length < 2 || username.length > 40
        || /^[=+\-@]/.test(nome) || /^[=+\-@]/.test(username)) {
      throw new Error('Nome inválido.');
    }
    const perfil = { ...perfilDoDia, nome, username };
    salvarPerfil(aba, atual.linha, perfil);
    return perfil;
  } finally {
    bloqueio.releaseLock();
  }
}

function consultarContaFirebase(idToken, apiKey) {
  const resposta = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(apiKey),
    { method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ idToken }), muteHttpExceptions: true }
  );
  if (resposta.getResponseCode() !== 200) throw new Error('Sessão expirada.');
  return JSON.parse(resposta.getContentText()).users?.[0] || {};
}

function verificarToken(idToken, apiKey) {
  const resposta = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(apiKey),
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ idToken }),
      muteHttpExceptions: true,
    }
  );
  if (resposta.getResponseCode() !== 200) throw new Error('Token inválido.');
  const uid = JSON.parse(resposta.getContentText()).users?.[0]?.localId;
  const claims = JSON.parse(Utilities.newBlob(
    Utilities.base64DecodeWebSafe(idToken.split('.')[1])
  ).getDataAsString());
  if (!uid || claims.aud !== FIREBASE_PROJECT_ID || claims.sub !== uid) {
    throw new Error('Projeto ou usuário incorreto.');
  }
  return uid;
}

function doPost() {
  return respostaJson({ sucesso: false, erro: 'A sincronização antiga foi desativada.' });
}
