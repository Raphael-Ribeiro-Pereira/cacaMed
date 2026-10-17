import { chamarPerfilPlanilha } from './perfilPlanilha';
import { emailJaCadastrado } from '../utils/contaSupabase';

// Ações de conta das telas de entrada (login, cadastro e Cadastro 2.0), só com o Supabase desde 17/10/2026 (o Firebase
// saiu do app). O cliente carrega sob demanda: a homologação monta as mesmas telas com uma conta fictícia.
const clienteSupabase = async () => (await import('../supabase')).supabase;
const sair = async () => (await import('./sairDaConta')).sairDaConta();

export const contaPadrao = {
  async entrarComSenha(email, senha) {
    const supabase = await clienteSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) throw error;
    return data;
  },
  // O Google volta para o site com a sessão no endereço; o App a recebe pelo onAuthStateChange.
  async entrarComGoogle() {
    const supabase = await clienteSupabase();
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } });
    if (error) throw error;
    return { redirecionando: true };
  },
  async recuperarSenha(email) {
    const supabase = await clienteSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/?recuperar=1' });
    if (error) throw error;
  },
  // O Supabase manda um código de 6 números para confirmar o e-mail: devolve { confirmarEmail }. Desde 15/10/2026 o
  // cadastro não manda escolhas; o Cadastro 2.0 ainda lê as de contas antigas.
  async criarConta({ nome, email, senha, escolhas = {} }) {
    const supabase = await clienteSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: window.location.origin + '/', data: { name: nome, ...escolhas } } });
    if (error) throw error;
    if (emailJaCadastrado(data)) throw Object.assign(new Error('E-mail já cadastrado.'), { code: 'auth/email-already-in-use' });
    return { confirmarEmail: true };
  },
  // Confirma o cadastro com o código do e-mail ({{ .Token }} no modelo "Confirm signup" do Supabase). Ao acertar,
  // a sessão nova chega ao App pelo onAuthStateChange. O erro leva o code do Supabase (otp_expired e afins).
  async confirmarCodigo(email, codigo) {
    const supabase = await clienteSupabase();
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });
    if (error) throw error;
  },
  // Reenvia o e-mail de confirmação do cadastro, com um código novo.
  async reenviarConfirmacao(email) {
    const supabase = await clienteSupabase();
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin + '/' } });
    if (error) throw error;
  },
  // Conta do Google sem senha: cria a senha para também entrar pelo formulário de e-mail.
  async criarSenha(usuario, senha) {
    return chamarPerfilPlanilha(usuario, 'definirSenha', { senha });
  },
  sair,
};
