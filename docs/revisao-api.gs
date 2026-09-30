// Piloto conforme roteiro: liberar após validar o modo de revisão.
const REVISAO_LIBERADA = false;

function abaRevisoesTreino() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName('RevisoesTreino');
  if (!aba) {
    aba = planilha.insertSheet('RevisoesTreino');
    aba.getRange(1, 1, 1, 13).setValues([['uid', 'revisaoId', 'itemId', 'versao', 'modo', 'tema', 'escolha', 'correta', 'acertou', 'data', 'sequencia', 'proximaRevisao', 'estado']]);
  }
  return aba;
}

function lerHistoricoRevisao(uid) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RevisoesTreino');
  const ultima = aba ? aba.getLastRow() : 0;
  return (ultima > 1 ? aba.getRange(2, 1, ultima - 1, 13).getValues() : [])
    .filter(r => String(r[0]) === uid).map(r => ({ revisaoId: String(r[1]), itemId: String(r[2]), versao: Number(r[3]),
      modo: String(r[4]), tema: String(r[5]), acertou: r[8] === true || r[8] === 'TRUE', data: String(r[9]), sequencia: Number(r[10]), proximaRevisao: String(r[11]) }));
}

function lerErrosParaRevisao(uid) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RespostasTreino');
  const ultima = aba ? aba.getLastRow() : 0;
  return (ultima > 1 ? aba.getRange(2, 1, ultima - 1, 12).getValues() : [])
    .filter(r => String(r[0]) === uid).map(r => ({ rodadaId: String(r[1]), itemId: String(r[2]), versao: Number(r[3]),
      modo: String(r[4]), tema: String(r[6]), acertou: r[9] === true || r[9] === 'TRUE', data: String(r[10]) }));
}

function repararHistoricoRevisao(abaPerfil, local) {
  const perfil = local.perfil;
  const entrada = perfil?.revisao?.entrada;
  if (!entrada || entrada.historicoConfirmado) return perfil;
  if (entrada.resultados.length) {
    const aba = abaRevisoesTreino();
    const historico = lerHistoricoRevisao(perfil.uid);
    const gravados = new Set(historico.filter(r => r.revisaoId === entrada.id).map(chaveItemRevisao));
    const linhas = entrada.resultados.filter(r => !gravados.has(chaveItemRevisao(r))).map(r => [perfil.uid, entrada.id, r.itemId, r.versao,
      r.modo, r.tema, JSON.stringify(r.escolha), JSON.stringify(r.correta), r.acertou, r.data, r.sequencia, r.proximaRevisao, 'confirmada']);
    if (linhas.length) aba.getRange(aba.getLastRow() + 1, 1, linhas.length, 13).setValues(linhas);
  }
  if (entrada.encerrada) reciboTreino(perfil, entrada);
  const atualizado = { ...perfil, revisao: { ...perfil.revisao, entrada: { ...entrada, historicoConfirmado: true } } };
  salvarPerfil(abaPerfil, local.linha, atualizado);
  return atualizado;
}

function consultarFilaRevisao(perfil) {
  // Repara respostas do último treino, inclusive rodadas interrompidas, somente
  // ao abrir a revisão. Evita acrescentar consultas de histórico a cada clique.
  for (const stats of Object.values(perfil.treinos || {})) {
    if (stats.entrada?.resultados?.length) registrarRespostasTreino(perfil, stats.entrada);
  }
  const reinicio = Date.parse(perfil.revisao?.reiniciadoEm) || 0;
  return selecionarFilaRevisao(lerErrosParaRevisao(perfil.uid).filter(r => Date.parse(r.data) > reinicio),
    lerHistoricoRevisao(perfil.uid).filter(r => Date.parse(r.data) > reinicio));
}

function operarRevisao(aba, local, pedido) {
  if (!REVISAO_LIBERADA && local.perfil.role !== 'admin') throw new Error('Revisão inteligente em piloto para administrador.');
  let perfil = repararHistoricoRevisao(aba, local);
  const entrada = perfil.revisao?.entrada;
  if (pedido.acao === 'consultarRevisao' || pedido.acao === 'iniciarRevisao') {
    if (pedido.acao === 'iniciarRevisao' && entrada && !entrada.encerrada) return perfil;
    if (pedido.acao === 'iniciarRevisao' && entrada?.id === pedido.revisaoId) return perfil;
    const fila = consultarFilaRevisao(perfil);
    let nova = entrada;
    if (pedido.acao === 'iniciarRevisao') {
      const id = String(pedido.revisaoId || '');
      if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador de revisão inválido.');
      if (reciboTreino(perfil, { id }, true)) throw new Error('Esta sessão já foi encerrada.');
      nova = criarEntradaRevisao(fila, id);
    }
    perfil = { ...perfil, revisao: { ...perfil.revisao, resumo: fila.resumo, ...(nova ? { entrada: nova } : {}) } };
    salvarPerfil(aba, local.linha, perfil);
    return perfil;
  }
  const anterior = perfil;
  perfil = pedido.acao === 'encerrarRevisao' ? encerrarRevisaoPerfil(perfil, pedido.revisaoId)
    : responderRevisaoPerfil(perfil, pedido.revisaoId, { itemId: pedido.itemId, versao: pedido.versao, escolha: pedido.escolha }, lerHistoricoRevisao(perfil.uid));
  if (perfil === anterior) return perfil;
  salvarPerfil(aba, local.linha, perfil);
  perfil = repararHistoricoRevisao(aba, { ...local, perfil });
  if (perfil.revisao.entrada.encerrada) {
    perfil = { ...perfil, revisao: { ...perfil.revisao, resumo: consultarFilaRevisao(perfil).resumo } };
    salvarPerfil(aba, local.linha, perfil);
  }
  return perfil;
}
