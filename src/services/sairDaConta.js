import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { supabase } from '../supabase';

export async function sairDaConta() {
  await signOut(auth);
  if (supabase) {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
  }
}
