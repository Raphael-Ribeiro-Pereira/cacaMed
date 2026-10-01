import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';

// Usa somente a chave publicável; não lê nem imprime credenciais administrativas.
const { VITE_SUPABASE_URL: base, VITE_SUPABASE_PUBLISHABLE_KEY: key } = parse(readFileSync('.env'));
if (!base || !key) throw new Error('Configuração pública Supabase ausente.');
for (const table of ['cacamed_player_state', 'cacamed_events', 'cacamed_content']) {
  const r = await fetch(`${base}/rest/v1/${table}?select=*&limit=1`, { headers: { apikey: key } });
  const body = await r.json();
  const protegido = [401, 403].includes(r.status) && body.code === '42501';
  console.log(JSON.stringify({ table, status: r.status, protegido }));
  if (!protegido) process.exitCode = 1;
}
const r = await fetch(`${base}/functions/v1/cacamed-api`, {
  method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'obterPerfil' }),
});
console.log(JSON.stringify({ teste: 'API sem sessão', status: r.status, protegido: r.status === 401 }));
if (r.status !== 401) process.exitCode = 1;
