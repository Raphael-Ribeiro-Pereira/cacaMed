import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { supabase, SUPABASE_URL, SUPABASE_CHAVE_PUBLICA } from '../supabase';
import { criarTransporteSupabase } from './transporteSupabase';

export function usuarioSupabase(user) {
  if (!user) return null;
  return { uid: user.app_metadata?.firebase_uid || user.id, authId: user.id, source: 'supabase',
    email: user.email, displayName: user.user_metadata?.name || user.user_metadata?.full_name || '',
    metadata: { creationTime: user.created_at },
    providerData: (user.identities || []).filter(i => i.provider !== 'email' || !user.app_metadata?.firebase_uid || user.app_metadata?.senha_migrada)
      .map(i => ({ providerId: i.provider === 'email' ? 'password' : i.provider + '.com' })),
  };
}

export async function entrarComSenhaPreservada(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (!error) return data;
  // Só credenciais rejeitadas justificam consultar o provedor antigo. Falhas de
  // rede e limite de tentativas não iniciam outra tentativa de autenticação.
  if (error.code !== 'invalid_credentials') throw error;
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), senha);
  const transporte = criarTransporteSupabase({ url: SUPABASE_URL, chavePublica: SUPABASE_CHAVE_PUBLICA,
    obterToken: () => user.getIdToken(true) });
  const resultado = await transporte('migrarSenha', { senha });
  if (!resultado.migrada) return { user };
  const resposta = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (resposta.error) throw resposta.error;
  return resposta.data;
}
