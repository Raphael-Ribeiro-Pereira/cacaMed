import test from 'node:test';
import assert from 'node:assert/strict';
import { limparTokenVencido } from './tokenUrl.js';

const historico = () => ({ state: { a: 1 }, chamadas: [], replaceState(estado, titulo, url) { this.chamadas.push([estado, url]); } });
const agora = Date.UTC(2026, 9, 17, 17, 0, 0);
const segundos = ms => Math.floor(ms / 1000);

test('tira do endereço o token de login vencido e deixa o válido para o Supabase', () => {
  const h1 = historico();
  const vencido = { hash: `#access_token=abc&expires_at=${segundos(agora) - 53732}&refresh_token=x`, pathname: '/', search: '?aba=1' };
  assert.equal(limparTokenVencido(vencido, h1, agora), true);
  assert.deepEqual(h1.chamadas, [[{ a: 1 }, '/?aba=1']]);

  const h2 = historico();
  assert.equal(limparTokenVencido({ hash: `#access_token=abc&expires_at=${segundos(agora) + 3600}`, pathname: '/', search: '' }, h2, agora), false);
  assert.equal(h2.chamadas.length, 0);

  const h3 = historico();
  assert.equal(limparTokenVencido({ hash: '#access_token=abc', pathname: '/', search: '' }, h3, agora), true, 'sem validade: trata como vencido');
  assert.equal(limparTokenVencido({ hash: '#secao', pathname: '/', search: '' }, h3, agora), false);
  assert.equal(limparTokenVencido(undefined, h3, agora), false);
});
