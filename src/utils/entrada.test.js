import test from 'node:test';
import assert from 'node:assert/strict';
import { emailOk, fotoPadrao, primeiroNome, slug, sugestoes } from './entrada.js';
import { usernameValido } from './cracha.js';

test('sugestões de username saem do nome, sem acento, válidas e sem repetir', () => {
  const s = sugestoes('Ana Beatriz Souza');
  assert.deepEqual(s.slice(0, 3), ['ana.souza', 'ana.bs', 'asouza']);
  assert.ok(sugestoes('José Ávila').every(usernameValido));
  assert.equal(sugestoes('José Ávila')[0], 'jose.avila');
  assert.deepEqual(sugestoes('   '), []);
  const unico = sugestoes('Lu');
  assert.equal(unico.length, 1);
  assert.match(unico[0], /^lu\d{2}$/);
});

test('e-mail, primeiro nome e foto padrão do crachá', () => {
  assert.ok(emailOk(' ana@exemplo.com '));
  assert.ok(!emailOk('ana@exemplo'));
  assert.equal(primeiroNome('Ângela Maria'), 'angela');
  assert.equal(slug('Conceição-2'), 'conceicao2');
  assert.equal(fotoPadrao('Doutora'), 2);
  assert.equal(fotoPadrao('Doutor'), 0);
});
