import { supabase } from '../supabase';

export async function sairDaConta() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
}
