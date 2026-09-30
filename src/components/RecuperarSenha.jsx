import { useState } from 'react';
import { supabase } from '../supabase';
import { sairDaConta } from '../services/sairDaConta';
import { usuarioSupabase } from '../services/authSupabase';
import { chamarPerfilSupabase } from '../services/perfilSupabase';

export default function RecuperarSenha() {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  async function salvar(evento) {
    evento.preventDefault();
    if (salvando || senha.length < 6 || senha !== confirmacao) return;
    setSalvando(true); setErro('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada.');
      await chamarPerfilSupabase(usuarioSupabase(session.user), 'definirSenha', { senha });
      await sairDaConta();
      window.location.replace(window.location.origin + '/');
    } catch {
      setErro('Não foi possível atualizar a senha. Solicite outro link e tente novamente.');
      setSalvando(false);
    }
  }
  return <main className="min-h-screen bg-[#0B1120] text-white grid place-items-center p-6">
    <form onSubmit={salvar} className="max-w-md w-full space-y-4">
      <h1 className="text-2xl font-bold">Recuperar acesso</h1>
      <label className="block">Nova senha<input type="password" autoComplete="new-password" minLength={6} required value={senha} onChange={e => setSenha(e.target.value)} className="block w-full p-3 bg-slate-800 rounded-xl" /></label>
      <label className="block">Confirmar senha<input type="password" autoComplete="new-password" required value={confirmacao} onChange={e => setConfirmacao(e.target.value)} className="block w-full p-3 bg-slate-800 rounded-xl" /></label>
      {erro && <p role="alert">{erro}</p>}
      <button disabled={salvando || senha.length < 6 || senha !== confirmacao} className="bg-cyan-600 p-3 rounded-xl disabled:opacity-50">{salvando ? 'Salvando…' : 'Salvar nova senha'}</button>
    </form>
  </main>;
}
