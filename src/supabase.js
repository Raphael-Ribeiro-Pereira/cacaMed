import { createClient } from '@supabase/supabase-js';
import { limparTokenVencido } from './utils/tokenUrl';

// Login e dados ficam só no Supabase desde 17/10/2026 (o Firebase e a planilha do Google saíram do app).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_CHAVE_PUBLICA = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (SUPABASE_URL && typeof window !== 'undefined') limparTokenVencido();
// Sem a configuração (homologação local, que usa serviços fictícios), não há cliente.
export const supabase = SUPABASE_URL ? createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
  auth: { storage: sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
