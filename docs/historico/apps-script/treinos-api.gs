// Banco inicial revisado pelo responsável do produto e liberado para jogadores.
const TREINOS_REVISADOS = true;

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
