/* global Deno */
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { criarApiSupabase } from './shared/apiSupabase.js';
import { criarMigracaoSenha } from './shared/migrarSenhaSupabase.js';
import { nivelPorXP } from './utils/economia.js';
import { importarBancoCSV } from './utils/importarBancoCSV.js';
import { montarCoroas, semanaCoroas } from './utils/coroas.js';

const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const base = Deno.env.get('SUPABASE_URL');
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const admin = createClient(base, secret, { auth: { persistSession: false, autoRefreshToken: false } });
async function database(path, options = {}) {
  const r = await fetch(base + '/rest/v1/' + path, { ...options, signal: AbortSignal.timeout(10000), headers: {
    apikey: secret, Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json', ...options.headers } });
  const body = await r.text();
  const data = body ? JSON.parse(body) : null;
  if (!r.ok) throw Object.assign(new Error(data?.message || 'Falha no banco.'), { code: data?.code });
  return data;
}
async function identity(token) {
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: 'https://securetoken.google.com/caca-med', audience: 'caca-med', algorithms: ['RS256'] });
    if (!payload.sub) throw new Error('Sessão inválida.');
    // Depois da migração da senha, a credencial antiga não pode contornar uma
    // troca ou recuperação feita no Supabase. O Google continua como ponte.
    if (payload.firebase?.sign_in_provider === 'password') {
      const linked = await database('cacamed_player_state?player_id=eq.' + encodeURIComponent(payload.sub) + '&select=auth_user_id');
      if (linked[0]?.auth_user_id) {
        const current = await admin.auth.admin.getUserById(linked[0].auth_user_id);
        if (current.error) throw new Error('Identidade indisponível.');
        if (current.data.user?.app_metadata?.senha_migrada) throw new Error('Use a senha atual do Supabase.');
      }
    }
    return { uid: payload.sub, email: payload.email || '', nome: payload.name || '', source: 'firebase',
      emailVerified: payload.email_verified === true, authTime: payload.auth_time };
  } catch {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) throw Object.assign(new Error('Entre novamente na conta.'), { status: 401 });
    const user = data.user;
    const rows = await database('cacamed_player_state?auth_user_id=eq.' + encodeURIComponent(user.id) + '&select=player_id');
    if (!rows.length && user.app_metadata?.firebase_uid) throw Object.assign(new Error('A vinculação da conta ainda não terminou. Entre novamente.'), { status: 409 });
    if (!rows.length && user.email) {
      const antigos = await database('cacamed_player_state?profile->>email=eq.' + encodeURIComponent(user.email) + '&select=player_id&limit=1');
      if (antigos.length) throw Object.assign(new Error('Seu progresso antigo está preservado. Entre uma vez com a senha antiga para concluir a migração dessa conta.'), { status: 409 });
    }
    return { uid: rows[0]?.player_id || user.id, authId: user.id, email: user.email || '',
      nome: user.user_metadata?.name || user.user_metadata?.full_name || '', source: 'supabase' };
  }
}
// Conversão gradual, somente após provar a identidade antiga. Não vincula por
// um email enviado pelo cliente e não envia email de login automaticamente.
async function migrateIdentity(user) {
  if (user.source !== 'firebase') throw Object.assign(new Error('Esta conta já está no Supabase.'), { status: 400 });
  if (!user.emailVerified) return { migrada: false, motivo: 'email_nao_verificado' };
  const filter = 'player_id=eq.' + encodeURIComponent(user.uid);
  const rows = await database('cacamed_player_state?' + filter + '&select=auth_user_id');
  if (!rows.length) return { migrada: false, motivo: 'cadastro_pendente' };
  let id = rows[0].auth_user_id;
  if (!id) {
    const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('caca-med:firebase:' + user.uid)));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const h = Array.from(bytes.slice(0,16), b => b.toString(16).padStart(2,'0')).join('');
    id = `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
    const created = await admin.auth.admin.createUser({ id, email: user.email, email_confirm: true,
      user_metadata: { name: user.nome }, app_metadata: { firebase_uid: user.uid } });
    if (created.error) {
      const existing = await admin.auth.admin.getUserById(id);
      if (existing.error || existing.data.user?.app_metadata?.firebase_uid !== user.uid || existing.data.user.email !== user.email) {
        throw Object.assign(new Error('Não foi possível vincular a conta. O progresso permanece preservado.'), { status: 409 });
      }
    }
    const updated = await database('cacamed_player_state?' + filter + '&or=(auth_user_id.is.null,auth_user_id.eq.' + id + ')', {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ auth_user_id: id }) });
    if (!updated.length) throw Object.assign(new Error('A conta mudou durante a vinculação. Entre novamente.'), { status: 409 });
  }
  const existing = await admin.auth.admin.getUserById(id);
  if (existing.error || existing.data.user?.app_metadata?.firebase_uid !== user.uid || existing.data.user.email !== user.email) {
    throw Object.assign(new Error('Vínculo de identidade inconsistente. O progresso está preservado.'), { status: 409 });
  }
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: user.email });
  if (error || data.user?.id !== id || !data.properties?.hashed_token) throw new Error('Falha ao criar sessão migrada.');
  return { migrada: true, tokenHash: data.properties.hashed_token };
}
async function ranking() {
  const rows = await database('rpc/cacamed_ranking', { method: 'POST', body: '{}' });
  return Promise.all(rows.map(async r => {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(r.player_id));
    return { idPublico: Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2,'0')).join(''), nome: r.nome,
      xpGlobal: Number(r.xp_global), nivelGlobal: nivelPorXP(r.xp_global), partidas: Number(r.partidas), letras: Number(r.letras),
      tempoMedio: r.tempo_medio == null ? null : Number(r.tempo_medio), atualizadoEm: r.atualizado_em };
  }));
}
// Coroas da semana: lê só o campo semanal dos perfis (sem tabela nova) e expõe o ID público, nunca o UID.
async function coroas() {
  const semana = semanaCoroas();
  const rows = await database('cacamed_player_state?select=player_id,nome:profile->>nome,username:profile->>username,coroas:profile->coroas'
    + '&profile->coroas->>semana=eq.' + encodeURIComponent(semana) + '&player_id=not.like.homologacao:*');
  return montarCoroas(await Promise.all(rows.map(async r => {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(r.player_id));
    return { idPublico: Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2,'0')).join(''), nome: r.nome || r.username || 'Plantonista', coroas: r.coroas };
  })));
}
let bancoCache;
async function palavras() {
  if (bancoCache && Date.now() - bancoCache.instante < 300000) return bancoCache.resultado;
  const rows = await database('cacamed_content?id=eq.palavras&select=data,version');
  if (!rows.length) throw new Error('Banco de palavras não importado.');
  const resultado = { banco: importarBancoCSV(rows[0].data.csv), versao: rows[0].version };
  bancoCache = { instante: Date.now(), resultado };
  return resultado;
}
const migratePassword = criarMigracaoSenha({
  vincular: migrateIdentity,
  verificarSenha: async (email, password) => {
    const key = Deno.env.get('FIREBASE_WEB_API_KEY');
    if (!key) throw new Error('Migração de senha ainda não configurada.');
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(key), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const body = await response.json();
    if (!response.ok || !body.idToken) throw Object.assign(new Error('Credenciais inválidas.'), { status: 401 });
    return identity(body.idToken);
  },
  obterConta: async user => {
    const rows = await database('cacamed_player_state?player_id=eq.' + encodeURIComponent(user.uid) + '&select=auth_user_id');
    const { data, error } = await admin.auth.admin.getUserById(rows[0]?.auth_user_id);
    if (error || !data.user) throw new Error('Conta migrada indisponível.');
    return data.user;
  },
  atualizarConta: async (id, attributes) => {
    const { error } = await admin.auth.admin.updateUserById(id, attributes);
    if (error) throw new Error('Não foi possível preservar a senha.');
  },
});
async function definePassword(user, pedido) {
  if (user.source !== 'supabase' || !user.authId) throw Object.assign(new Error('Entre novamente para atualizar a senha.'), { status: 401 });
  if (typeof pedido.senha !== 'string' || pedido.senha.length < 6 || pedido.senha.length > 4096) throw Object.assign(new Error('Senha inválida.'), { status: 400 });
  const existing = await admin.auth.admin.getUserById(user.authId);
  if (existing.error) throw new Error('Conta indisponível.');
  const { error } = await admin.auth.admin.updateUserById(user.authId, { password: pedido.senha,
    app_metadata: { ...existing.data.user.app_metadata, senha_migrada: true } });
  if (error) throw new Error('Não foi possível atualizar a senha.');
  return { sucesso: true };
}
Deno.serve(criarApiSupabase({ database, identity, migrateIdentity, migratePassword, definePassword, ranking, coroas, palavras,
  log: info => console.info(JSON.stringify(info)) }));
