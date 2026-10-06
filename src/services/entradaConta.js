import { USAR_AUTH_SUPABASE } from '../supabase';
import { chamarPerfilPlanilha } from './perfilPlanilha';

// Ações de conta das telas de entrada (login, cadastro e Cadastro 2.0). Firebase e Supabase
// carregam sob demanda: a homologação monta as mesmas telas com uma conta fictícia, sem o Firebase.
const firebase = async () => {
  const [{ auth }, modulo] = await Promise.all([import('../firebase'), import('firebase/auth')]);
  return { auth, ...modulo };
};
const clienteSupabase = async () => (await import('../supabase')).supabase;
const sair = async () => (await import('./sairDaConta')).sairDaConta();

export const contaPadrao = {
  async entrarComSenha(email, senha) {
    if (USAR_AUTH_SUPABASE) return (await import('./authSupabase')).entrarComSenhaPreservada(email, senha);
    const f = await firebase();
    return f.signInWithEmailAndPassword(f.auth, email, senha);
  },
  // Devolve { pendente } quando o e-mail já tem conta por senha e o Google precisa ser vinculado.
  async entrarComGoogle() {
    if (USAR_AUTH_SUPABASE) {
      const supabase = await clienteSupabase();
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } });
      if (error) throw error;
      return { redirecionando: true };
    }
    const f = await firebase();
    try {
      await f.signInWithPopup(f.auth, new f.GoogleAuthProvider());
      return {};
    } catch (falha) {
      if (falha.code !== 'auth/account-exists-with-different-credential') throw falha;
      return { pendente: { credencial: f.GoogleAuthProvider.credentialFromError(falha), email: falha.customData?.email || '' } };
    }
  },
  async vincularGoogle(email, senha, credencial) {
    const f = await firebase();
    try {
      const resultado = await f.signInWithEmailAndPassword(f.auth, email, senha);
      await f.linkWithCredential(resultado.user, credencial);
    } catch (falha) {
      await sair();
      throw falha;
    }
  },
  // antigo: conta que ainda não entrou depois da troca para o Supabase recupera pela senha do Firebase.
  async recuperarSenha(email, { antigo = false } = {}) {
    if (USAR_AUTH_SUPABASE && !antigo) {
      const supabase = await clienteSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/?recuperar=1' });
      if (error) throw error;
      return;
    }
    const f = await firebase();
    await f.sendPasswordResetEmail(f.auth, email);
  },
  // Supabase pede confirmação por e-mail: devolve { confirmarEmail }. Firebase devolve o usuário já com o nome no token.
  async criarConta({ nome, email, senha }) {
    if (USAR_AUTH_SUPABASE) {
      const supabase = await clienteSupabase();
      const { error } = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: window.location.origin + '/', data: { name: nome } } });
      if (error) throw error;
      return { confirmarEmail: true };
    }
    const f = await firebase();
    const { user } = await f.createUserWithEmailAndPassword(f.auth, email, senha);
    await f.updateProfile(user, { displayName: nome });
    await user.getIdToken(true);
    return { user };
  },
  // Conta do Google sem senha: cria a senha para também entrar pelo formulário de e-mail.
  async criarSenha(usuario, senha) {
    if (usuario.source === 'supabase') return chamarPerfilPlanilha(usuario, 'definirSenha', { senha });
    const f = await firebase();
    await f.linkWithCredential(usuario, f.EmailAuthProvider.credential(usuario.email, senha));
  },
  // Backend antigo (Firestore), usado só quando VITE_FONTE_DADOS não aponta para a API.
  async gravarPerfilAntigo(user, perfil) {
    const [{ db }, { doc, setDoc }] = await Promise.all([import('../firebase'), import('firebase/firestore')]);
    await setDoc(doc(db, 'usuarios', user.uid), perfil);
  },
  sair,
};
