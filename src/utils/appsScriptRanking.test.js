import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import vm from 'node:vm';

const codigo = readFileSync(new URL('../../docs/apps-script-ranking.gs', import.meta.url), 'utf8');

function prepararScript({ projeto = 'caca-med', uid = 'jogador-1', email = 'jogador@gmail.com' } = {}) {
  const linhas = [['uid', 'nome', 'xpGlobal', 'nivelGlobal', 'partidas', 'letras', 'atualizadoEm']];
  const abas = new Map();
  function criarAba(nome, registros) {
    const aba = {
      getDataRange: () => ({ getValues: () => registros }),
      getLastRow: () => registros.length,
      getRange: (row, col, count = 1, width = 1) => ({
        getValues: () => registros.slice(row - 1, row - 1 + count)
          .map(item => item.slice(col - 1, col - 1 + width)),
        setValue: value => { registros[row - 1][col - 1] = value; },
        setValues: values => { values.forEach((value, index) => { registros[row - 1 + index] = [...value]; }); },
      }),
    };
    abas.set(nome, { aba, registros });
    return aba;
  }
  criarAba('RankingNovaTemporada', linhas);
  criarAba('Partidas', [['firebaseUid', 'partidaId', 'registradaEm', 'xpConcedido']]);
  const campos = {
    nome: { stringValue: 'Jogador Um' },
    pontuacaoTotal: { integerValue: '480' },
    xpTopicos: { mapValue: { fields: { anatomia: { integerValue: '1000' } } } },
    estatisticas: { mapValue: { fields: {
      anatomia: { mapValue: { fields: {
        partidas: { integerValue: '2' }, letras: { integerValue: '35' }, tempo: { integerValue: '160' },
      } } },
      ddx: { mapValue: { fields: { partidas: { integerValue: '9' } } } },
    } } },
  };
  const claims = Buffer.from(JSON.stringify({ aud: projeto, sub: uid })).toString('base64url');
  const idToken = `cabecalho.${claims}.assinatura`;
  const contexto = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => ({
      getSheetByName: nome => abas.get(nome)?.aba || null,
      insertSheet: nome => criarAba(nome, []),
    }) },
    ContentService: {
      MimeType: { JSON: 'json', JAVASCRIPT: 'javascript' },
      createTextOutput: texto => ({ texto, setMimeType(tipo) { this.tipo = tipo; return this; } }),
    },
    HtmlService: {
      XFrameOptionsMode: { ALLOWALL: 'allowall' },
      createHtmlOutput: html => ({ html, setXFrameOptionsMode() { return this; } }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      computeDigest: (_, value) => [...createHash('sha256').update(value).digest()],
      base64DecodeWebSafe: value => Buffer.from(value, 'base64url'),
      newBlob: value => ({ getDataAsString: () => value.toString('utf8') }),
      formatDate: () => '2026-09-25',
    },
    UrlFetchApp: { fetch: url => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify(url.includes('accounts:lookup')
        ? { users: [{ localId: uid, email, displayName: 'Jogador Um' }] }
        : { fields: campos }),
    }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  });
  vm.runInContext(codigo, contexto);
  vm.runInContext(readFileSync(new URL('../../docs/plantao-motor.gs', import.meta.url), 'utf8'), contexto);
  return { contexto, linhas, abas, idToken };
}

test('plantão cobra um ticket, retoma entrada e rejeita caso não revisado para jogador comum', () => {
  const comum = prepararScript();
  comum.contexto.api({ idToken: comum.idToken, apiKey: 'chave-publica', acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'teste' });
  assert.throws(() => comum.contexto.api({ idToken: comum.idToken, apiKey: 'chave-publica', acao: 'iniciarPlantao', casoId: 'resp-asma-1', entradaId: '12345678-1234-4123-8123-123456789abc' }), /revisão clínica/);
  const { contexto, abas, idToken } = prepararScript({ email: 'raphaelrpereira.rp@gmail.com' });
  const credenciais = { idToken, apiKey: 'chave-publica' };
  contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'admin' });
  const registros = abas.get('PerfisGoogle').registros;
  const perfil = JSON.parse(registros[1][2]); perfil.tickets = 2; registros[1][2] = JSON.stringify(perfil);
  const pedido = { ...credenciais, acao: 'iniciarPlantao', casoId: 'resp-asma-1', entradaId: '12345678-1234-4123-8123-123456789abc' };
  assert.equal(contexto.api(pedido).tickets, 1);
  assert.equal(contexto.api(pedido).tickets, 1);
  assert.equal(contexto.api({ ...pedido, entradaId: '12345678-1234-4123-8123-123456789abd' }).tickets, 1);
});

test('plantão recalcula XP, rejeita reescrita de histórico e não recompensa repetição', () => {
  const { contexto, abas, idToken } = prepararScript({ email: 'raphaelrpereira.rp@gmail.com' });
  const credenciais = { idToken, apiKey: 'chave-publica' };
  contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'admin' });
  const registros = abas.get('PerfisGoogle').registros;
  const perfil = JSON.parse(registros[1][2]); perfil.tickets = 2; registros[1][2] = JSON.stringify(perfil);
  const entradaId = '12345678-1234-4123-8123-123456789abc';
  contexto.api({ ...credenciais, acao: 'iniciarPlantao', casoId: 'resp-asma-1', entradaId });
  const pedido = { ...credenciais, acao: 'acaoPlantao', entradaId, escolhas: ['gravidade'] };
  contexto.api(pedido);
  assert.throws(() => contexto.api({ ...pedido, escolhas: ['alergias', 'gravidade'] }), /outra aba/);
  const escolhas = ['gravidade', 'inicio', 'antecedentes', 'medicamentos', 'alergias', 'associados', 'ausculta', 'pfe', 'asma', 'tratamento', 'antiinflamatorio', 'oxigenio', 'reavaliar', 'orientar', 'alta'];
  const final = contexto.api({ ...pedido, escolhas, xp: 999999 });
  assert.equal(final.ddx.entrada.relatorio.seguro, true);
  assert.equal(final.ddx.entrada.xpConcedido, 250);
  assert.equal(contexto.api({ ...pedido, escolhas }).pontuacaoTotal, 250);
  const segundoId = '12345678-1234-4123-8123-123456789abd';
  contexto.api({ ...credenciais, acao: 'iniciarPlantao', casoId: 'resp-asma-1', entradaId: segundoId });
  const repetido = contexto.api({ ...pedido, entradaId: segundoId, escolhas });
  assert.equal(repetido.pontuacaoTotal, 250);
  assert.equal(repetido.ddx.partidas, 2);
  assert.equal(repetido.ddx.entrada.xpConcedido, 0);
});

test('plantão recupera resposta perdida no ranking sem duplicar recompensa', () => {
  const { contexto, abas, idToken } = prepararScript({ email: 'raphaelrpereira.rp@gmail.com' });
  const credenciais = { idToken, apiKey: 'chave-publica' };
  contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'admin' });
  const registros = abas.get('PerfisGoogle').registros;
  const perfil = JSON.parse(registros[1][2]); perfil.tickets = 1; registros[1][2] = JSON.stringify(perfil);
  const entradaId = '12345678-1234-4123-8123-123456789abc';
  contexto.api({ ...credenciais, acao: 'iniciarPlantao', casoId: 'resp-asma-1', entradaId });
  const aba = abas.get('RankingNovaTemporada').aba;
  const original = aba.getRange;
  let falhou = false;
  aba.getRange = (...args) => {
    const range = original(...args);
    const gravar = range.setValues;
    range.setValues = values => { gravar(values); if (!falhou) { falhou = true; throw new Error('Resposta perdida'); } };
    return range;
  };
  const pedido = { ...credenciais, acao: 'acaoPlantao', entradaId, escolhas: ['gravidade', 'inicio', 'antecedentes', 'medicamentos', 'alergias', 'associados', 'ausculta', 'pfe', 'asma', 'tratamento', 'antiinflamatorio', 'oxigenio', 'reavaliar', 'orientar', 'alta'] };
  assert.throws(() => contexto.api(pedido), /Resposta perdida/);
  const recuperado = contexto.api(pedido);
  assert.equal(recuperado.pontuacaoTotal, 250);
  assert.equal(recuperado.xpTopicos['DDX-RESPIRATORIO'], 250);
  assert.equal(recuperado.ddx.partidas, 1);
  assert.equal(recuperado.tickets, 0);
});

test('Erro médico salva cada etapa, não duplica ticket ou XP e mantém Plantão separado', () => {
  const { contexto, abas, idToken } = prepararScript({ email: 'raphaelrpereira.rp@gmail.com' });
  const credenciais = { idToken, apiKey: 'chave-publica' };
  contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'admin' });
  const registros = abas.get('PerfisGoogle').registros;
  const perfil = JSON.parse(registros[1][2]); perfil.tickets = 2; perfil.ddx = { partidas: 3, xp: 500 }; registros[1][2] = JSON.stringify(perfil);
  const entradaId = '12345678-1234-4123-8123-123456789abc';
  const inicio = { ...credenciais, acao: 'iniciarAuditoria', auditoriaId: 'resp-asma-auditoria-1', entradaId };
  assert.equal(contexto.api(inicio).tickets, 1);
  assert.equal(contexto.api(inicio).tickets, 1);
  assert.equal(contexto.api({ ...inicio, entradaId: '12345678-1234-4123-8123-123456789abd' }).tickets, 1);
  const responder = respostas => contexto.api({ ...credenciais, acao: 'responderAuditoria', entradaId, respostas, xp: 99999 });
  assert.throws(() => responder(['alta', 'resposta']), /outra aba/);
  assert.throws(() => responder(['inventada']), /inválida/);
  responder(['alta']);
  assert.deepEqual(JSON.parse(JSON.stringify(contexto.api({ ...credenciais, acao: 'obterPerfil' }).erroMedico.entrada.respostas)), ['alta']);
  assert.throws(() => responder(['pfe', 'resposta']), /outra aba/);
  responder(['alta', 'resposta']); responder(['alta', 'resposta', 'reavaliar']);
  const respostas = ['alta', 'resposta', 'reavaliar', 'criterios'];
  const final = responder(respostas);
  assert.equal(final.erroMedico.entrada.xpConcedido, 100);
  assert.equal(final.erroMedico.entrada.relatorio.acertos, 4);
  assert.equal(final.ddx.partidas, 3);
  assert.equal(final.ddx.xp, 500);
  assert.equal(responder(respostas).pontuacaoTotal, 100);
  assert.equal(responder(respostas).erroMedico.partidas, 1);
  assert.throws(() => responder(['alta', 'resposta', 'reavaliar', 'certeza']), /outra aba/);
  const repeticao = contexto.api({ ...inicio, entradaId: '12345678-1234-4123-8123-123456789abd' });
  assert.equal(repeticao.tickets, 0);
  let repetido;
  for (let i = 1; i <= 4; i++) repetido = contexto.api({ ...credenciais, acao: 'responderAuditoria', entradaId: repeticao.erroMedico.entrada.id, respostas: respostas.slice(0, i) });
  assert.equal(repetido.pontuacaoTotal, 100);
  assert.equal(repetido.erroMedico.entrada.xpConcedido, 0);
  assert.equal(repetido.erroMedico.entrada.repeticao, true);
});

test('Erro médico bloqueia piloto não revisado e recupera resposta perdida no ranking', () => {
  const comum = prepararScript();
  comum.contexto.api({ idToken: comum.idToken, apiKey: 'chave-publica', acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'teste' });
  assert.throws(() => comum.contexto.api({ idToken: comum.idToken, apiKey: 'chave-publica', acao: 'iniciarAuditoria', auditoriaId: 'resp-asma-auditoria-1' }), /revisão clínica/);
  const { contexto, abas, idToken } = prepararScript({ email: 'raphaelrpereira.rp@gmail.com' });
  const credenciais = { idToken, apiKey: 'chave-publica' };
  contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'clinica', username: 'admin' });
  const registros = abas.get('PerfisGoogle').registros;
  const perfil = JSON.parse(registros[1][2]); perfil.tickets = 1; registros[1][2] = JSON.stringify(perfil);
  const entradaId = '12345678-1234-4123-8123-123456789abc';
  contexto.api({ ...credenciais, acao: 'iniciarAuditoria', auditoriaId: 'resp-asma-auditoria-1', entradaId });
  const respostas = ['alta', 'resposta', 'reavaliar', 'criterios'];
  for (let i = 1; i < 4; i++) contexto.api({ ...credenciais, acao: 'responderAuditoria', entradaId, respostas: respostas.slice(0, i) });
  const ranking = abas.get('RankingNovaTemporada').aba;
  const original = ranking.getRange;
  let falhou = false;
  ranking.getRange = (...args) => {
    const range = original(...args); const gravar = range.setValues;
    range.setValues = valores => { gravar(valores); if (!falhou) { falhou = true; throw new Error('Resposta perdida'); } };
    return range;
  };
  const pedido = { ...credenciais, acao: 'responderAuditoria', entradaId, respostas };
  assert.throws(() => contexto.api(pedido), /Resposta perdida/);
  const recuperado = contexto.api(pedido);
  assert.equal(recuperado.pontuacaoTotal, 100);
  assert.equal(recuperado.erroMedico.partidas, 1);
  assert.equal(recuperado.tickets, 0);
  assert.equal(recuperado.xpTopicos['DDX-ERRO-MEDICO-RESPIRATORIO'], 100);
});

test('ranking público usa sempre a nova temporada e a rota antiga não grava', () => {
  const { contexto, linhas, idToken } = prepararScript();
  linhas.push(['jogador-1', 'Jogador Um', 480, 2, 2, 35, 'hoje', 80]);
  assert.equal(JSON.parse(contexto.doGet({ parameter: {} }).texto).ranking[0].xpGlobal, 480);
  assert.equal(JSON.parse(contexto.doGet({ parameter: { temporada: 'antiga' } }).texto).ranking[0].xpGlobal, 480);
  const antigo = contexto.doPost({ postData: { contents: JSON.stringify({ idToken, apiKey: 'chave-publica' }) } });
  assert.equal(JSON.parse(antigo.texto).sucesso, false);
  assert.equal(linhas.length, 2);
});

test('rejeita token de outro projeto e omite UID da resposta pública', () => {
  const { contexto, linhas, idToken } = prepararScript({ projeto: 'outro-projeto' });
  assert.throws(() => contexto.api({ acao: 'obterPerfil', idToken, apiKey: 'chave-publica' }), /Projeto ou usuário incorreto/);
  assert.equal(linhas.length, 1);

  linhas.push(['jogador-1', 'Jogador Um', 480, 2, 2, 35, 'hoje', 80]);
  const publico = JSON.parse(contexto.doGet({ parameter: {} }).texto).ranking[0];
  assert.equal(publico.nome, 'Jogador Um');
  assert.equal(publico.uid, undefined);
  assert.equal(publico.idPublico, createHash('sha256').update('jogador-1').digest('hex'));
});

test('cadastro da nova temporada zera progresso e só aceita título e matéria permitidos', () => {
  const { contexto, abas, idToken } = prepararScript();
  const pedido = { acao: 'cadastrar', idToken, apiKey: 'chave-publica', titulo: 'Doutora', materiaPreferida: 'anatomia', username: 'jogador', pontuacaoTotal: 999999 };
  const perfil = contexto.api(pedido);
  assert.equal(perfil.pontuacaoTotal, 0);
  assert.equal(perfil.tickets, 0);
  assert.equal(perfil.nome, 'Jogador Um');
  assert.equal(contexto.api(pedido).pontuacaoTotal, 0);
  const registros = abas.get('PerfisGoogle').registros;
  assert.equal(registros.length, 2);
  assert.equal(registros[1][0], 'jogador-1');
  assert.equal(JSON.parse(registros[1][2]).pontuacaoTotal, 0);
  assert.equal(contexto.doGet({ parameter: {} }).texto.includes('pontuacaoTotal'), false);
});

test('recusa cadastro inválido e requisição excessiva', () => {
  const { contexto, abas, idToken } = prepararScript();
  assert.throws(() => contexto.api({ acao: 'cadastrar', idToken, apiKey: 'chave-publica', titulo: 'X', materiaPreferida: 'anatomia' }));
  assert.equal(abas.get('PerfisGoogle').registros.length, 1);
  assert.equal(JSON.parse(contexto.doPost({ postData: { contents: 'x'.repeat(32769) } }).texto).sucesso, false);
});

test('somente admin autenticado altera XP, nível e progresso reais', () => {
  const jogador = prepararScript();
  const credenciais = { idToken: jogador.idToken, apiKey: 'chave-publica' };
  jogador.contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'anatomia', username: 'jogador' });
  assert.throws(() => jogador.contexto.api({ ...credenciais, acao: 'admin', operacao: 'setXP', valor: 500, role: 'admin' }), /restrito/);

  const admin = prepararScript({ email: 'raphaelrpereira.rp@gmail.com' });
  const chave = { idToken: admin.idToken, apiKey: 'chave-publica' };
  const perfil = admin.contexto.api({ ...chave, acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'anatomia', usarNomeGoogle: true });
  assert.equal(perfil.role, 'admin');
  assert.equal(perfil.username, 'jogador');
  assert.equal(admin.contexto.api({ ...chave, acao: 'admin', operacao: 'setXP', valor: 500 }).pontuacaoTotal, 500);
  assert.equal(admin.contexto.api({ ...chave, acao: 'admin', operacao: 'setNivelGlobal', valor: 7 }).nivelGlobalAdmin, 7);
  assert.equal(admin.contexto.api({ ...chave, acao: 'admin', operacao: 'setNivelCruzadinha', chaveXP: 'ANATOMIA-GERAL', valor: 3 }).xpTopicos['ANATOMIA-GERAL'], 4000);
  assert.equal(admin.abas.get('RankingNovaTemporada').registros[1][3], 7);
  assert.throws(() => admin.contexto.api({ ...chave, acao: 'admin', operacao: 'setXP', valor: -1 }), /limites/);
  assert.equal(admin.contexto.api({ ...chave, acao: 'admin', operacao: 'resetarProgresso' }).pontuacaoTotal, 0);
});

test('partida da nova temporada calcula XP no servidor e não duplica no reenvio', () => {
  const { contexto, abas, idToken } = prepararScript();
  const credenciais = { idToken, apiKey: 'chave-publica' };
  contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'anatomia', username: 'jogador' });
  const partida = {
    id: '12345678-1234-4123-8123-123456789abc', chaveXP: 'ANATOMIA-GERAL', subMateria: 'Geral',
    palavras: 7, letras: 32, tempo: 120, erros: 0, maiorPalavra: 9,
    penalidadeXP: 0, xp: 999999,
  };
  const primeiro = contexto.api({ ...credenciais, acao: 'registrarPartida', partida });
  assert.equal(primeiro.pontuacaoTotal, 384); // 134 XP da grade + 250 XP das duas missões
  assert.equal(primeiro.xpTopicos['ANATOMIA-GERAL'], 134);
  assert.equal(contexto.api({ ...credenciais, acao: 'registrarPartida', partida }).pontuacaoTotal, 384);
  assert.equal(abas.get('Partidas').registros.length, 2);
  assert.equal(abas.get('RankingNovaTemporada').registros.length, 2);
  const publico = JSON.parse(contexto.doGet({ parameter: { temporada: 'nova' } }).texto).ranking;
  assert.equal(publico[0].xpGlobal, 384);
  assert.equal(publico[0].uid, undefined);
});

test('reenvio recupera gravações interrompidas sem duplicar XP, missões ou tickets', () => {
  for (const nomeAba of ['PerfisGoogle', 'RankingNovaTemporada', 'Partidas']) {
    const { contexto, abas, idToken } = prepararScript();
    const credenciais = { idToken, apiKey: 'chave-publica' };
    contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutora', materiaPreferida: 'anatomia', username: 'jogador' });
    const partida = {
      id: '12345678-1234-4123-8123-123456789abc', chaveXP: 'ANATOMIA-GERAL', subMateria: 'Geral',
      palavras: 7, letras: 32, tempo: 120, erros: 0, maiorPalavra: 9, penalidadeXP: 0,
    };
    const aba = abas.get(nomeAba).aba;
    const getRangeOriginal = aba.getRange;
    let falhou = false;
    aba.getRange = (...args) => {
      const range = getRangeOriginal(...args);
      const setValuesOriginal = range.setValues;
      range.setValues = values => {
        setValuesOriginal(values);
        if (!falhou) {
          falhou = true;
          throw new Error(`Resposta perdida após gravar ${nomeAba}`);
        }
      };
      return range;
    };
    assert.throws(() => contexto.api({ ...credenciais, acao: 'registrarPartida', partida }), /Resposta perdida/);
    const recuperado = contexto.api({ ...credenciais, acao: 'registrarPartida', partida });
    assert.equal(recuperado.pontuacaoTotal, 384, nomeAba);
    assert.equal(recuperado.xpTopicos['ANATOMIA-GERAL'], 134, nomeAba);
    assert.equal(recuperado.tickets, 0, nomeAba);
    assert.equal(recuperado.estatisticas['ANATOMIA-GERAL'].partidas, 1, nomeAba);
    assert.equal(recuperado.missoesDiarias.filter(missao => missao.concluida).length, 2, nomeAba);
    assert.equal(abas.get('Partidas').registros.length, 2, nomeAba);
    assert.equal(abas.get('RankingNovaTemporada').registros.length, 2, nomeAba);
  }
});

test('ponte só envia respostas para a origem local autorizada', () => {
  const { contexto } = prepararScript();
  const nonce = '0123456789abcdef0123456789abcdef';
  const resposta = contexto.doGet({ parameter: { ponte: nonce, origem: 'http://127.0.0.1:5173' } });
  assert.match(resposta.html, /http:\/\/127\.0\.0\.1:5173/);
  assert.throws(() => contexto.doGet({ parameter: { ponte: nonce, origem: 'https://site-desconhecido.example' } }));
});

test('missões concluídas recomeçam no dia seguinte sem apagar XP', () => {
  const { contexto, abas, idToken } = prepararScript();
  const credenciais = { idToken, apiKey: 'chave-publica' };
  contexto.api({ ...credenciais, acao: 'cadastrar', titulo: 'Doutor', materiaPreferida: 'anatomia', username: 'jogador' });
  const registros = abas.get('PerfisGoogle').registros;
  const perfil = JSON.parse(registros[1][2]);
  perfil.dataUltimoLogin = '2026-09-24';
  perfil.pontuacaoTotal = 250;
  perfil.missoesDiarias[0].concluida = true;
  registros[1][2] = JSON.stringify(perfil);

  const atualizado = contexto.api({ ...credenciais, acao: 'obterPerfil' });
  assert.equal(atualizado.pontuacaoTotal, 250);
  assert.equal(atualizado.dataUltimoLogin, '2026-09-25');
  assert.equal(atualizado.missoesDiarias[0].concluida, false);
  assert.equal(contexto.api({ ...credenciais, acao: 'obterPerfil' }).pontuacaoTotal, 250);
});
