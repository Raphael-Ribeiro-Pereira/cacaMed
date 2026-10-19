import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// A Edge Function publica as cópias em supabase/functions/cacamed-api. Uma cópia velha publicaria regras antigas:
// rode `node scripts/sincronizar-supabase.mjs` depois de mudar qualquer módulo da lista.
test('as cópias da API Supabase são iguais aos módulos de src', () => {
  const script = readFileSync(new URL('../../scripts/sincronizar-supabase.mjs', import.meta.url), 'utf8');
  const lista = script.slice(script.indexOf('const modules = ['), script.indexOf('];'));
  const modulos = [...lista.matchAll(/'([a-z]+\/[A-Za-z]+\.js)'/g)].map(m => m[1]);
  assert.ok(modulos.length > 20);
  const normal = texto => texto.replace(/\r\n/g, '\n');
  for (const modulo of modulos) {
    const fonte = readFileSync(new URL(`../${modulo}`, import.meta.url), 'utf8');
    const copia = readFileSync(new URL(`../../supabase/functions/cacamed-api/${modulo}`, import.meta.url), 'utf8');
    assert.equal(normal(copia), normal(fonte), `${modulo} desatualizado: rode node scripts/sincronizar-supabase.mjs`);
  }
});
