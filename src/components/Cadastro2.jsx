import { useState } from 'react';
import { EmailAuthProvider, linkWithCredential, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';

const MATERIAS = [
  ['anatomia', 'Anatomia'], ['neurologia', 'Neurologia'],
  ['farmaco', 'Farmacologia'], ['micro', 'Microbiologia'],
  ['clinica', 'Clínica Geral'], ['patologia', 'Patologia'],
];

export default function Cadastro2({ usuario, onConcluido }) {
  const [titulo, setTitulo] = useState('');
  const [materiaPreferida, setMateriaPreferida] = useState('');
  const [usarNomeGoogle, setUsarNomeGoogle] = useState(false);
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [senhaCriada, setSenhaCriada] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const precisaCriarSenha = !senhaCriada && !usuario.providerData.some(provedor => provedor.providerId === 'password');
  const senhaValida = !precisaCriarSenha || (senha.length >= 6 && senha === confirmacaoSenha);

  const concluir = async evento => {
    evento.preventDefault();
    if (!titulo || !materiaPreferida || (!usarNomeGoogle && username.trim().length < 2) || !senhaValida || salvando) return;
    setSalvando(true);
    setErro('');
    try {
      if (precisaCriarSenha) {
        await linkWithCredential(usuario, EmailAuthProvider.credential(usuario.email, senha));
        setSenhaCriada(true);
        setSenha('');
        setConfirmacaoSenha('');
      }
      const perfil = await chamarPerfilPlanilha(usuario, 'cadastrar', { titulo, materiaPreferida, usarNomeGoogle, username: username.trim() });
      onConcluido(perfil);
    } catch (falha) {
      const mensagens = {
        'auth/email-already-in-use': 'Este e-mail já tem senha em outra conta. Entre pela conta antiga e vincule o Google por lá.',
        'auth/credential-already-in-use': 'Esta credencial já pertence a outra conta. Entre pela conta antiga para vincular o Google.',
        'auth/weak-password': 'Escolha uma senha com pelo menos 6 caracteres.',
      };
      setErro(mensagens[falha.code] || falha.message || 'Não foi possível salvar o cadastro.');
    } finally {
      setSalvando(false);
    }
  };

  return <main className="stitch-integrated stitch-auth min-h-screen bg-[#0B1120] text-slate-300 flex items-center justify-center p-4">
    <form onSubmit={concluir} className="w-full max-w-[520px] bg-[#151F32] rounded-[24px] border border-cyan-500/20 p-8 space-y-5">
      <div>
        <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">cacoMed · Cadastro 2.0</span>
        <h1 className="text-white text-2xl font-bold mt-2">Vamos terminar seu cadastro</h1>
        <p className="text-slate-300 text-sm mt-2">Seu nome e e-mail já vieram da conta. Falta escolher como você aparecerá no plantão.</p>
      </div>
      <p className="text-slate-300 text-sm">{usuario.displayName || usuario.email} · {usuario.email}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm" htmlFor="cadastro-usar-google"><input id="cadastro-usar-google" type="checkbox" checked={usarNomeGoogle} onChange={evento => setUsarNomeGoogle(evento.target.checked)} /> Usar primeiro nome do Google como username</label>
        <label className="flex-1 min-w-[180px] text-sm" htmlFor="cadastro-username">Ou escolha seu username<input id="cadastro-username" value={username} onChange={evento => setUsername(evento.target.value)} disabled={usarNomeGoogle} minLength={2} maxLength={40} required={!usarNomeGoogle} className="mt-1 w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-3 text-white disabled:opacity-50" /></label>
      </div>
      <label className="block text-sm font-semibold" htmlFor="cadastro-titulo">Título</label>
      <select id="cadastro-titulo" required value={titulo} onChange={evento => setTitulo(evento.target.value)} className="w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-3 text-white">
        <option value="">Escolha seu título</option>
        <option value="Doutor">Dr.</option>
        <option value="Doutora">Dra.</option>
      </select>
      <label className="block text-sm font-semibold" htmlFor="cadastro-materia">Matéria preferida</label>
      <select id="cadastro-materia" required value={materiaPreferida} onChange={evento => setMateriaPreferida(evento.target.value)} className="w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-3 text-white">
        <option value="">Escolha uma matéria</option>
        {MATERIAS.map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}
      </select>
      {precisaCriarSenha && <div className="space-y-3">
        <p className="text-slate-300 text-sm">Crie uma senha para também entrar pelo formulário de e-mail. Ela fica somente no Firebase Authentication, não na planilha.</p>
        <label className="block text-sm font-semibold" htmlFor="cadastro2-senha">Senha</label>
        <input id="cadastro2-senha" type="password" autoComplete="new-password" minLength={6} required value={senha} onChange={evento => setSenha(evento.target.value)} className="w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-3 text-white" />
        <label className="block text-sm font-semibold" htmlFor="cadastro2-confirmacao">Confirmar senha</label>
        <input id="cadastro2-confirmacao" type="password" autoComplete="new-password" minLength={6} required value={confirmacaoSenha} onChange={evento => setConfirmacaoSenha(evento.target.value)} className="w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-3 text-white" />
        {confirmacaoSenha && senha !== confirmacaoSenha && <p role="alert" className="text-red-400 text-sm">As senhas não coincidem.</p>}
      </div>}
      {erro && <p role="alert" className="text-red-400 text-sm">{erro}</p>}
      <button type="submit" disabled={salvando || !titulo || !materiaPreferida || (!usarNomeGoogle && username.trim().length < 2) || !senhaValida} className="w-full rounded-xl bg-cyan-500 p-3 text-[#0B1120] font-bold disabled:opacity-50">
        {salvando ? 'Salvando...' : 'Concluir cadastro'}
      </button>
      <button type="button" onClick={() => signOut(auth)} className="w-full text-slate-300 text-sm underline">Sair da conta</button>
    </form>
  </main>;
}
