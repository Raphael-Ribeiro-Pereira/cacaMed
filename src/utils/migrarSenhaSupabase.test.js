import test from 'node:test';
import assert from 'node:assert/strict';
import { criarMigracaoSenha } from '../shared/migrarSenhaSupabase.js';

const user = { uid: 'antigo', email: 'teste@example.com', source: 'firebase', emailVerified: true };
function preparar(overrides = {}) {
  const atualizacoes = [];
  const migrar = criarMigracaoSenha({
    verificarSenha: async () => user,
    vincular: async () => ({ migrada: true, tokenHash: 'sessao' }),
    obterConta: async () => ({ id: 'novo', email: user.email, app_metadata: { firebase_uid: user.uid, outro: true } }),
    atualizarConta: async (...args) => atualizacoes.push(args), ...overrides,
  });
  return { migrar, atualizacoes };
}
test('preserva a senha somente após validação antiga e vínculo da identidade', async () => {
  const { migrar, atualizacoes } = preparar();
  assert.equal((await migrar(user, { senha: 'senha-de-teste' })).migrada, true);
  assert.deepEqual(atualizacoes, [['novo', { password: 'senha-de-teste', app_metadata: { firebase_uid: user.uid, outro: true, senha_migrada: true } }]]);
});
test('não sobrescreve senha migrada com uma senha antiga', async () => {
  const { migrar, atualizacoes } = preparar({ obterConta: async () => ({ email: user.email, app_metadata: { firebase_uid: user.uid, senha_migrada: true } }) });
  await assert.rejects(migrar(user, { senha: 'antiga-valida' }), { status: 409 });
  assert.equal(atualizacoes.length, 0);
});
test('não aceita senha válida de outra conta nem vínculo inconsistente', async () => {
  for (const overrides of [
    { verificarSenha: async () => ({ uid: 'outra' }) },
    { obterConta: async () => ({ email: 'outra@example.com', app_metadata: { firebase_uid: user.uid } }) },
  ]) {
    const { migrar, atualizacoes } = preparar(overrides);
    await assert.rejects(migrar(user, { senha: 'senha-de-teste' }));
    assert.equal(atualizacoes.length, 0);
  }
});
test('não migra e-mail não verificado, identidade nativa ou credencial incorreta', async () => {
  for (const entrada of [{ ...user, source: 'supabase' }]) {
    const { migrar, atualizacoes } = preparar();
    await assert.rejects(migrar(entrada, { senha: 'senha-de-teste' }), { status: 400 });
    assert.equal(atualizacoes.length, 0);
  }
  const { migrar, atualizacoes } = preparar({ verificarSenha: async () => { throw Object.assign(new Error('Inválida'), { status: 401 }); } });
  await assert.rejects(migrar(user, { senha: 'senha-de-teste' }), { status: 401 });
  assert.equal(atualizacoes.length, 0);
});
test('conta antiga não verificada continua no provedor antigo sem confirmar e-mail à força', async () => {
  const { migrar, atualizacoes } = preparar();
  assert.deepEqual(await migrar({ ...user, emailVerified: false }, { senha: 'senha-de-teste' }), { migrada: false, motivo: 'email_nao_verificado' });
  assert.equal(atualizacoes.length, 0);
});
test('conta não verificada migra com a senha quando o administrador aprova', async () => {
  const consultas = [];
  const { migrar, atualizacoes } = preparar({ aprovada: async u => { consultas.push(u.uid); return true; } });
  assert.equal((await migrar({ ...user, emailVerified: false }, { senha: 'senha-de-teste' })).migrada, true);
  assert.deepEqual(consultas, [user.uid]);
  assert.equal(atualizacoes.length, 1);
});
