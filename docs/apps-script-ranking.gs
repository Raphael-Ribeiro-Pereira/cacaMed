const NOME_ABA = 'Ranking';
const FIREBASE_PROJECT_ID = 'caca-med';
const NOME_ABA_PERFIS = 'PerfisGoogle';
const LIMITE_CORPO_BYTES = 32768;
const NOME_ABA_TEMPORADA = 'RankingNovaTemporada';
const NOME_ABA_PARTIDAS = 'Partidas';
const ORIGENS_APP = ['http://localhost:5173', 'http://127.0.0.1:5173'];
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
    + '.withFailureHandler(function(){window.top.postMessage({cacoMed:"resposta",nonce:cfg.nonce,erro:"Falha ao consultar o servidor."},destino)})'
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

function numero(valor) {
  const n = Number(valor && (valor.integerValue || valor.doubleValue || valor.stringValue));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function hashUid(uid) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, uid)
    .map(byte => ((byte + 256) % 256).toString(16).padStart(2, '0')).join('');
}

function doGet(e) {
  if (e?.parameter?.ponte) return paginaPonte(String(e.parameter.ponte), String(e.parameter.origem || ''));
  const nomeAba = e?.parameter?.temporada === 'nova' ? NOME_ABA_TEMPORADA : NOME_ABA;
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nomeAba);
  if (!aba) throw new Error('A aba Ranking não foi encontrada.');

  const ranking = aba.getDataRange().getValues().slice(1)
    .filter(linha => linha[0] && linha[1])
    .map(linha => ({
      idPublico: hashUid(String(linha[0])),
      nome: String(linha[1]),
      xpGlobal: Number(linha[2]) || 0,
      nivelGlobal: Number(linha[3]) || 0,
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
    medidorTicketsCruzadinha: 0, missoesDiarias: criarMissoesCruzadinha(),
    dataUltimoLogin: hoje, tutorialCruzadinhasConcluido: false,
    estatisticas: {}, estatisticasGerais: {}, criadoEm: new Date().toISOString(),
  };
}

function criarMissoesCruzadinha() {
  return [
    { id: 'jogar_cruzadinha', titulo: 'Rato de Biblioteca', subtitulo: 'Jogar 1 Cruzadinha', meta: 1, recompensaXP: 100, recompensaTicket: 0, progresso: 0, concluida: false },
    { id: 'acertar_palavras', titulo: 'Mão Firme', subtitulo: 'Acertar 5 palavras', meta: 5, recompensaXP: 150, recompensaTicket: 0, progresso: 0, concluida: false },
  ];
}

function salvarPerfil(aba, linha, perfil) {
  const destino = linha || aba.getLastRow() + 1;
  aba.getRange(destino, 1, 1, 4).setValues([[
    perfil.uid, perfil.email, JSON.stringify(perfil), new Date().toISOString(),
  ]]);
}

function atualizarMissoesDoDia(aba, local) {
  if (!local.perfil) return null;
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  if (local.perfil.dataUltimoLogin === hoje) return local.perfil;
  const perfil = { ...local.perfil, dataUltimoLogin: hoje, missoesDiarias: criarMissoesCruzadinha() };
  salvarPerfil(aba, local.linha, perfil);
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
  const medidorAnterior = Number(perfil.medidorTicketsCruzadinha) || 0;
  const ganhouTicket = medidorAnterior + 1 >= 2;
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
  const missoes = (perfil.missoesDiarias || []).map(missao => {
    if (missao.concluida || !['jogar_cruzadinha', 'acertar_palavras'].includes(missao.id)) return missao;
    const adicional = missao.id === 'jogar_cruzadinha' ? 1 : palavras;
    const progresso = Math.min(missao.meta, (missao.progresso || 0) + adicional);
    return { ...missao, progresso, concluida: progresso >= missao.meta };
  });
  const xpMissoes = missoes.reduce((total, missao, indice) =>
    total + (missao.concluida && !perfil.missoesDiarias[indice].concluida ? Number(missao.recompensaXP) || 0 : 0), 0);
  const atualizado = {
    ...perfil, pontuacaoTotal: (Number(perfil.pontuacaoTotal) || 0) + xp + xpMissoes,
    xpTopicos: { ...perfil.xpTopicos, [chaveXP]: xpAnterior + xp },
    tickets: (Number(perfil.tickets) || 0) + Number(ganhouTicket),
    medidorTicketsCruzadinha: ganhouTicket ? 0 : medidorAnterior + 1,
    missoesDiarias: missoes, estatisticas: stats, estatisticasGerais: gerais,
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
  const nivelCalculado = Object.values(perfil.xpTopicos || {}).reduce((total, xp) =>
    total + (Number(xp) > 0 ? Math.floor(Math.sqrt(Number(xp) / 1000)) + 1 : 0), 0);
  const nivel = Number.isInteger(perfil.nivelGlobalAdmin) ? perfil.nivelGlobalAdmin : nivelCalculado;
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
    atualizado = { ...perfil, pontuacaoTotal: valor };
  } else if (operacao === 'setNivelGlobal') {
    inteiro(0, 1000);
    atualizado = { ...perfil, nivelGlobalAdmin: valor };
  } else if (operacao === 'setNivelCruzadinha') {
    inteiro(0, 100);
    const chaveXP = String(pedido.chaveXP || '');
    if (!/^[A-Z0-9 -]{3,80}$/.test(chaveXP)) throw new Error('Tópico inválido.');
    const xp = valor === 0 ? 0 : valor === 1 ? 1 : (valor - 1) ** 2 * 1000;
    atualizado = { ...perfil, xpTopicos: { ...perfil.xpTopicos, [chaveXP]: xp } };
  } else if (operacao === 'resetarProgresso') {
    atualizado = { ...perfil, pontuacaoTotal: 0, xpTopicos: {}, tickets: 0,
      medidorTicketsCruzadinha: 0, missoesDiarias: criarMissoesCruzadinha(),
      estatisticas: {}, estatisticasGerais: {}, cruzadinhasRegistradas: [] };
    delete atualizado.nivelGlobalAdmin;
  } else {
    throw new Error('Operação administrativa desconhecida.');
  }
  salvarPerfil(aba, linha, atualizado);
  atualizarRankingNovo(atualizado);
  return atualizado;
}

function api(pedido) {
  if (!pedido || JSON.stringify(pedido).length > LIMITE_CORPO_BYTES) throw new Error('Pedido inválido.');
  const token = String(pedido.idToken || '');
  const apiKey = String(pedido.apiKey || '');
  const uid = verificarToken(token, apiKey);
  const acao = String(pedido.acao || '');
  const aba = abaPerfis();
  if (!['obterPerfil', 'cadastrar', 'tutorial', 'editarPerfil', 'registrarPartida', 'admin'].includes(acao)) throw new Error('Ação desconhecida.');

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

function buscarDadosOficiais(uid, idToken) {
  const url = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT_ID
    + '/databases/(default)/documents/usuarios/' + encodeURIComponent(uid);
  const resposta = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + idToken },
    muteHttpExceptions: true,
  });
  if (resposta.getResponseCode() !== 200) throw new Error('Leitura do Firestore negada.');
  return JSON.parse(resposta.getContentText()).fields || {};
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

function resumirUsuario(uid, campos) {
  const xpTopicos = campos.xpTopicos?.mapValue?.fields || {};
  const nivel = Object.values(xpTopicos).reduce((total, valor) => {
    const xp = numero(valor);
    return total + (xp > 0 ? Math.floor(Math.sqrt(xp / 1000)) + 1 : 0);
  }, 0);
  const estatisticas = campos.estatisticas?.mapValue?.fields || {};
  let partidas = 0;
  let letras = 0;
  let tempo = 0;
  Object.entries(estatisticas).forEach(([chave, valor]) => {
    if (chave === 'ddx' || chave === 'hardcore') return;
    const item = valor.mapValue?.fields;
    if (!item || !item.partidas) return;
    partidas += numero(item.partidas);
    letras += numero(item.letras);
    tempo += numero(item.tempo);
  });
  let nome = String(campos.nome?.stringValue || campos.username?.stringValue || 'Doutor(a)')
    .trim().slice(0, 80);
  if (!nome) nome = 'Doutor(a)';
  if (/^[=+\-@]/.test(nome)) nome = "'" + nome;
  return [
    uid,
    nome,
    numero(campos.pontuacaoTotal),
    nivel,
    partidas,
    letras,
    new Date().toISOString(),
    partidas ? Math.floor(tempo / partidas) : '',
  ];
}

function doPost(e) {
  try {
    const conteudo = e?.postData?.contents || '';
    if (conteudo.length > LIMITE_CORPO_BYTES) throw new Error('Requisição acima do limite.');
    const corpo = JSON.parse(conteudo || '{}');
    if (corpo.acao && corpo.acao !== 'sincronizarRanking') throw new Error('Ação desconhecida.');
    const idToken = String(corpo.idToken || '');
    const apiKey = String(corpo.apiKey || '');
    if (!idToken || !apiKey) throw new Error('Credenciais ausentes.');

    const uid = verificarToken(idToken, apiKey);
    const campos = buscarDadosOficiais(uid, idToken);
    const linha = resumirUsuario(uid, campos);
    const bloqueio = LockService.getScriptLock();
    bloqueio.waitLock(10000);
    try {
      const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_ABA);
      if (!aba) throw new Error('A aba Ranking não foi encontrada.');
      aba.getRange(1, 8).setValue('tempoMedio');
      const ultimaLinha = aba.getLastRow();
      const uids = ultimaLinha > 1
        ? aba.getRange(2, 1, ultimaLinha - 1, 1).getValues().map(item => String(item[0]))
        : [];
      const indice = uids.indexOf(uid);
      const destino = indice >= 0 ? indice + 2 : ultimaLinha + 1;
      aba.getRange(destino, 1, 1, linha.length).setValues([linha]);
    } finally {
      bloqueio.releaseLock();
    }
    return respostaJson({ sucesso: true });
  } catch (erro) {
    return respostaJson({ sucesso: false, erro: String(erro.message || erro) });
  }
}

function verificarAcessoFirebase() {
  return UrlFetchApp.fetch('https://firestore.googleapis.com/', {
    muteHttpExceptions: true,
  }).getResponseCode();
}
