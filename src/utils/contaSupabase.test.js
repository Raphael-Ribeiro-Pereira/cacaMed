import test from 'node:test';
import assert from 'node:assert/strict';
import { provedoresDaConta, emailJaCadastrado } from './contaSupabase.js';

const ids = user => provedoresDaConta(user).map(p => p.providerId);

test('conta Google sem senha não tem provedor de senha', () => {
  assert.deepEqual(ids({ identities: [{ provider: 'google' }], app_metadata: { provider: 'google' } }), ['google.com']);
});

test('senha criada pelo app numa conta Google conta como provedor de senha', () => {
  // Caso do incidente de 07/10/2026: a senha já estava gravada, mas o cadastro a pedia de novo.
  assert.deepEqual(ids({ identities: [{ provider: 'google' }], app_metadata: { provider: 'google', senha_migrada: true } }), ['google.com', 'password']);
});

test('conta por e-mail não duplica o provedor de senha', () => {
  assert.deepEqual(ids({ identities: [{ provider: 'email' }], app_metadata: { senha_migrada: true } }), ['password']);
  assert.deepEqual(ids({ identities: [{ provider: 'email' }], app_metadata: {} }), ['password']);
});

test('conta migrada do Firebase só tem senha depois da migração da senha', () => {
  assert.deepEqual(ids({ identities: [{ provider: 'email' }], app_metadata: { firebase_uid: 'f1' } }), []);
  assert.deepEqual(ids({ identities: [{ provider: 'email' }], app_metadata: { firebase_uid: 'f1', senha_migrada: true } }), ['password']);
});

test('sem usuário não há provedores', () => {
  assert.deepEqual(ids(null), []);
});

test('cadastro com e-mail já existente é reconhecido pela ausência de identidades', () => {
  assert.equal(emailJaCadastrado({ user: { id: 'x', identities: [] } }), true);
  assert.equal(emailJaCadastrado({ user: { id: 'x', identities: [{ provider: 'email' }] } }), false);
  assert.equal(emailJaCadastrado({ user: null, session: null }), false);
  assert.equal(emailJaCadastrado(undefined), false);
});
