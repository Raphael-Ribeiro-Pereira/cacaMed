import test from 'node:test';
import assert from 'node:assert/strict';
import { criarTransporteSupabase } from '../services/transporteSupabase.js';

const config = { url: 'https://teste.supabase.co', chavePublica: 'sb_publishable_teste', obterToken: async () => 'token-usuario' };

test('transporte preserva identificador idempotente e ação e envia credencial no header', async () => {
  const chamar = criarTransporteSupabase({ ...config, fetchImpl: async (url, pedido) => {
    assert.equal(url.pathname, '/functions/v1/cacamed-api');
    assert.equal(pedido.headers.Authorization, 'Bearer token-usuario');
    assert.equal(pedido.headers.apikey, config.chavePublica);
    assert.deepEqual(JSON.parse(pedido.body), { entradaId: 'rodada-original', acao: 'responderTreino' });
    return { ok: true, json: async () => ({ resultado: { tickets: 2 } }) };
  } });
  assert.deepEqual(await chamar('responderTreino', { entradaId: 'rodada-original', acao: 'forjada' }), { tickets: 2 });
});

test('sem sessão não envia pedido', async () => {
  const chamar = criarTransporteSupabase({ ...config, obterToken: async () => null, fetchImpl: () => assert.fail('Não deve enviar') });
  await assert.rejects(chamar('obterPerfil'), /Entre na conta/);
});

test('erro da API é preservado e gravação nunca é repetida automaticamente', async () => {
  let pedidos = 0;
  const chamar = criarTransporteSupabase({ ...config, fetchImpl: async () => {
    pedidos++;
    return { ok: false, status: 409, json: async () => ({ erro: 'Rodada já encerrada.' }) };
  } });
  await assert.rejects(chamar('responderTreino'), /Rodada já encerrada/);
  assert.equal(pedidos, 1);
});

test('timeout informa recuperação do progresso sem reenviar', async () => {
  const chamar = criarTransporteSupabase({ ...config, fetchImpl: async (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(Object.assign(new Error('timeout'), { name: 'AbortError' })), { once: true });
  }) });
  await assert.rejects(chamar('responderTreino', {}, 5), /Consulte o progresso salvo/);
});
