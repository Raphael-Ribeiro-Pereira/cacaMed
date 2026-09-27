import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function VincularGoogle({ usuario, onConfirmado }) {
  const [senha, setSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  const confirmar = async evento => {
    evento.preventDefault();
    if (!senha || ocupado) return;
    setOcupado(true);
    setErro('');
    try {
      await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, senha));
      setSenha('');
      onConfirmado();
    } catch {
      setErro('Não conseguimos confirmar a senha antiga. Confira e tente novamente.');
    } finally {
      setOcupado(false);
    }
  };

  return <main className="stitch-integrated stitch-auth min-h-screen bg-[#0B1120] text-slate-300 flex items-center justify-center p-4">
    <form onSubmit={confirmar} className="w-full max-w-[520px] bg-[#151F32] rounded-[24px] border border-cyan-500/20 p-8 space-y-5">
      <h1 className="text-white text-2xl font-bold">Conta existente encontrada</h1>
      <p>O e-mail {usuario.email} já tem uma conta antiga no cacoMed. Você autoriza vincular o login Google a ela?</p>
      <p>Confirme com a senha antiga. Sua pontuação começará do zero na nova temporada.</p>
      <label htmlFor="senha-vinculacao" className="block text-sm font-semibold">Senha da conta antiga</label>
      <input id="senha-vinculacao" type="password" autoComplete="current-password" required value={senha} onChange={evento => setSenha(evento.target.value)} className="w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-3 text-white" />
      {erro && <p role="alert" className="text-red-400 text-sm">{erro}</p>}
      <button type="submit" disabled={!senha || ocupado} className="w-full rounded-xl bg-cyan-500 p-3 text-[#0B1120] font-bold disabled:opacity-50">{ocupado ? 'Confirmando...' : 'Autorizo vincular as contas'}</button>
      <button type="button" onClick={() => signOut(auth)} className="w-full text-slate-300 text-sm underline">Agora não</button>
    </form>
  </main>;
}
