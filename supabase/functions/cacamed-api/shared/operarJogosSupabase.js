import { concederRecompensa, nivelPorXP, xpParaNivel, VERSAO_ECONOMIA } from '../utils/economia.js';
import { aplicarProgressoMissoes, lerMissoes, criarMissoesDiarias, dataLocalHoje } from '../utils/missoes.js';
import { obterCasoPlantao, executarPlantao } from '../utils/plantao.js';
import { obterAuditoria, avaliarAuditoria } from '../utils/erroMedico.js';
import { obterRelacao, avaliarRelacao } from '../utils/causaEfeito.js';
import { DOENCAS, executarBatalha, obterDoenca, obterPet, recompensaBatalha, relatorioBatalha } from '../utils/batalha.js';
const criarMissoesCruzadinha = criarMissoesDiarias;

export function registrarPartidaSupabase(perfil, partida, recibos = [], agora = new Date().toISOString()) {
  const id = String(partida?.id || '');
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador de partida inválido.');
  if (recibos.includes(id) || (perfil.cruzadinhasRegistradas || []).includes(id)) return perfil;
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
  const dia = dataLocalHoje(new Date(agora));
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

  return atualizado;
}

export function operarAdminSupabase(perfil, pedido) {
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
      estatisticas: {}, estatisticasGerais: {}, cruzadinhasRegistradas: [], treinos: {}, revisao: { reiniciadoEm: new Date().toISOString() }, erroMedico: {}, causaEfeito: {}, ddx: { concluidos: [], historico: [], partidas: 0 } };
    delete atualizado.nivelGlobalAdmin;
  } else {
    throw new Error('Operação administrativa desconhecida.');
  }

  return atualizado;
}

export function operarPlantaoSupabase(perfil, pedido, recibos = []) {
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
    if ((recibos.includes(id) || ddx.historico.some(item => item.id === id))) throw new Error('Entrada já encerrada.');
    if ((Number(perfil.tickets) || 0) < 1) throw new Error('Tickets insuficientes. Conclua Cruzadinhas, Quiz ou Verdade ou mentira para ganhar tickets.');
    entrada = { id, casoId: caso.id, versao: caso.versao, iniciadoEm: new Date().toISOString(), relatorio: executarPlantao(caso, []) };
    const atualizado = { ...perfil, tickets: perfil.tickets - 1, ddx: { ...ddx, entrada } };

    return atualizado;
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Plantão não encontrado. Atualize o perfil.');
  const caso = obterCasoPlantao(entrada.casoId);
  if (caso.versao !== entrada.versao) throw new Error('A versão deste caso mudou. Solicite revisão da entrada ao administrador.');
  const anteriores = entrada.relatorio.escolhas;
  const passos = pedido.escolhas;
  if (!Array.isArray(passos)) throw new Error('Registro de ações inválido.');
  if (JSON.stringify(passos) === JSON.stringify(anteriores)) {

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

  return atualizado;
}

export function operarAuditoriaSupabase(perfil, pedido, recibos = []) {
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
    if ((recibos.includes(id) || stats.historico.some(item => item.id === id))) throw new Error('Entrada já encerrada.');
    if ((Number(perfil.tickets) || 0) < 1) throw new Error('Tickets insuficientes.');
    entrada = { id, auditoriaId: auditoria.id, versao: auditoria.versao, respostas: [], iniciadoEm: new Date().toISOString() };
    const atualizado = { ...perfil, tickets: perfil.tickets - 1, erroMedico: { ...stats, entrada } };

    return atualizado;
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Análise não encontrada. Atualize o perfil.');
  const auditoria = obterAuditoria(entrada.auditoriaId);
  if (auditoria.versao !== entrada.versao) throw new Error('A versão da análise mudou. Solicite revisão ao administrador.');
  const respostas = pedido.respostas;
  if (!Array.isArray(respostas)) throw new Error('Respostas inválidas.');
  if (JSON.stringify(respostas) === JSON.stringify(entrada.respostas)) {

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

  return atualizado;
}

export function operarRelacaoSupabase(perfil, pedido, recibos = []) {
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
    if ((recibos.includes(id) || stats.historico.some(item => item.id === id))) throw new Error('Entrada já encerrada.');
    if ((Number(perfil.tickets) || 0) < 1) throw new Error('Tickets insuficientes.');
    entrada = { id, relacaoId: auditoria.id, versao: auditoria.versao, respostas: [], iniciadoEm: new Date().toISOString() };
    const atualizado = { ...perfil, tickets: perfil.tickets - 1, causaEfeito: { ...stats, entrada } };

    return atualizado;
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Análise não encontrada. Atualize o perfil.');
  const auditoria = obterRelacao(entrada.relacaoId);
  if (auditoria.versao !== entrada.versao) throw new Error('A versão da análise mudou. Solicite revisão ao administrador.');
  const respostas = pedido.respostas;
  if (!Array.isArray(respostas)) throw new Error('Respostas inválidas.');
  if (JSON.stringify(respostas) === JSON.stringify(entrada.respostas)) {

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

  return atualizado;
}

// Batalha diagnóstica: piloto do administrador enquanto o conteúdo não tiver revisão clínica.
// O cliente envia apenas a lista de ações; o servidor reexecuta o motor e calcula o resultado e o XP.
export function operarBatalhaSupabase(perfil, pedido, recibos = [], aleatorio = Math.random) {
  const stats = { tutorial: false, historia: 0, descobertas: [], concluidos: [], partidas: 0, vitorias: 0, xp: 0, historico: [], ...perfil.batalha };
  const admin = perfil.role === 'admin';
  let entrada = stats.entrada;
  const aberta = Boolean(entrada && !entrada.relatorio);
  if (pedido.acao === 'pularTutorialBatalha') {
    if (!admin) throw new Error('Batalha diagnóstica em piloto para administrador.');
    return stats.tutorial ? perfil : { ...perfil, batalha: { ...stats, tutorial: true } };
  }
  if (pedido.acao === 'iniciarBatalha') {
    const modo = String(pedido.modo || '');
    if (!['tutorial', 'historia', 'x1'].includes(modo)) throw new Error('Modo de batalha inválido.');
    const pet = obterPet(String(pedido.pet || '')).id;
    const id = String(pedido.entradaId || '');
    if (aberta) {
      if (entrada.id === id) return perfil;
      throw new Error('Conclua ou abandone a batalha atual antes de iniciar outra.');
    }
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Identificador de entrada inválido.');
    if (entrada?.id === id) return perfil;
    if (recibos.includes(id) || stats.historico.some(item => item.id === id)) throw new Error('Entrada já encerrada.');
    let doenca;
    if (modo === 'tutorial') {
      if (pet !== 'cocobi') throw new Error('O treinamento usa o Cocobi.');
      doenca = obterDoenca('pneumo');
    } else {
      if (!stats.tutorial) throw new Error('Conclua o treinamento antes.');
      if (modo === 'historia') {
        doenca = obterDoenca(String(pedido.doencaId || ''));
        if (DOENCAS.indexOf(doenca) > stats.historia && !admin) throw new Error('Esta batalha ainda está bloqueada.');
      } else {
        if ((Number(perfil.tickets) || 0) < 1) throw new Error('Tickets insuficientes. Conclua Cruzadinhas, Quiz ou Verdade ou mentira para ganhar tickets.');
        // Sorteada no servidor: o jogador escolhe o pet sem saber a doença.
        doenca = DOENCAS[Math.floor(aleatorio() * DOENCAS.length) % DOENCAS.length];
      }
    }
    if (!doenca.revisado && !admin) throw new Error('Batalha diagnóstica em piloto para administrador.');
    entrada = { id, modo, doencaId: doenca.id, versao: doenca.versao, pet, acoes: [], iniciadoEm: new Date().toISOString() };
    return { ...perfil, ...(modo === 'x1' ? { tickets: perfil.tickets - 1 } : {}), batalha: { ...stats, entrada } };
  }
  if (!entrada || entrada.id !== pedido.entradaId) throw new Error('Batalha não encontrada. Atualize o perfil.');
  const doenca = obterDoenca(entrada.doencaId);
  if (pedido.acao === 'abandonarBatalha') {
    if (!aberta) return perfil;
    const encerradoEm = new Date().toISOString();
    entrada = { ...entrada, relatorio: { resultado: 'abandono', doencaId: doenca.id, pet: entrada.pet }, linhas: [], xpConcedido: 0, encerradoEm };
    return { ...perfil, batalha: { ...stats, entrada,
      historico: [...stats.historico, { id: entrada.id, modo: entrada.modo, doencaId: doenca.id, versao: entrada.versao, resultado: 'abandono', xp: 0, data: encerradoEm }].slice(-30) } };
  }
  if (doenca.versao !== entrada.versao) throw new Error('O conteúdo desta batalha mudou. Abandone a partida e comece outra.');
  const anteriores = entrada.acoes;
  const acoes = pedido.acoes;
  if (!Array.isArray(acoes)) throw new Error('Registro de ações inválido.');
  if (JSON.stringify(acoes) === JSON.stringify(anteriores)) return perfil;
  if (!aberta || acoes.length <= anteriores.length || anteriores.some((acao, i) => JSON.stringify(acoes[i]) !== JSON.stringify(acao))) {
    throw new Error('A batalha mudou em outra aba. Atualize o perfil antes de continuar.');
  }
  const estado = executarBatalha(doenca, entrada.pet, acoes);
  const descobertas = estado.revealed ? [...new Set([...stats.descobertas, doenca.id])] : stats.descobertas;
  if (!estado.fim) return { ...perfil, batalha: { ...stats, descobertas, entrada: { ...entrada, acoes } } };
  const chave = doenca.id + ':' + doenca.versao;
  const primeiraVez = entrada.modo === 'tutorial' ? !stats.tutorial : entrada.modo === 'historia' ? !stats.concluidos.includes(chave) : true;
  const { linhas, xp } = recompensaBatalha(estado, { modo: entrada.modo, primeiraVez });
  const venceu = estado.fim === 'vitoria';
  const encerradoEm = new Date().toISOString();
  entrada = { ...entrada, acoes, relatorio: relatorioBatalha(estado, doenca, entrada.pet), linhas, xpConcedido: xp, encerradoEm };
  const indice = DOENCAS.indexOf(doenca);
  return { ...concederRecompensa(perfil, xp),
    xpTopicos: { ...perfil.xpTopicos, 'DDX-BATALHA': (Number(perfil.xpTopicos?.['DDX-BATALHA']) || 0) + xp },
    batalha: { ...stats, entrada, descobertas,
      tutorial: stats.tutorial || entrada.modo === 'tutorial',
      historia: entrada.modo === 'historia' && venceu && indice === stats.historia ? stats.historia + 1 : stats.historia,
      concluidos: entrada.modo === 'historia' && venceu ? [...new Set([...stats.concluidos, chave])] : stats.concluidos,
      partidas: stats.partidas + 1, vitorias: stats.vitorias + Number(venceu), xp: stats.xp + xp,
      historico: [...stats.historico, { id: entrada.id, modo: entrada.modo, doencaId: doenca.id, versao: doenca.versao, resultado: estado.fim, xp, data: encerradoEm }].slice(-30),
    } };
}
