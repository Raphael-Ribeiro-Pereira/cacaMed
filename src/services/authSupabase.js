import { provedoresDaConta } from '../utils/contaSupabase';
import { escolhasDoCadastro } from '../utils/entrada';

export function usuarioSupabase(user) {
  if (!user) return null;
  return { uid: user.app_metadata?.firebase_uid || user.id, authId: user.id, source: 'supabase',
    email: user.email, displayName: user.user_metadata?.name || user.user_metadata?.full_name || '',
    escolhas: escolhasDoCadastro(user.user_metadata),
    metadata: { creationTime: user.created_at }, providerData: provedoresDaConta(user) };
}

