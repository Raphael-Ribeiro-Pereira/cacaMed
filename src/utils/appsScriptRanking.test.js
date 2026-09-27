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
  return { contexto, linhas, abas, idToken };
}

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
