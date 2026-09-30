import { createClient } from '@supabase/supabase-js';

export const USAR_SUPABASE = import.meta.env.VITE_FONTE_DADOS === 'supabase';
// Só ativa a troca completa de login quando cadastro, recuperação e Google
// tiverem sido validados. O armazenamento dos jogos já usa Supabase.
export const USAR_AUTH_SUPABASE = USAR_SUPABASE && import.meta.env.VITE_AUTH_SUPABASE === 'true';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_CHAVE_PUBLICA = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = USAR_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
  auth: { storage: sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
