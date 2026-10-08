// Regras puras sobre o usuário do Supabase Auth, usadas pelo login e pelo cadastro.

// Provedores no formato do Firebase (password, google.com), que as telas de cadastro e perfil já usam.
// Senha criada pelo app numa conta Google não gera identidade "email"; senha_migrada é a marca dela.
// Sem isso, o Cadastro 2.0 pedia a senha de novo a cada tentativa.
export function provedoresDaConta(user) {
  const provedores = (user?.identities || []).filter(i => i.provider !== 'email' || !user.app_metadata?.firebase_uid || user.app_metadata?.senha_migrada)
    .map(i => ({ providerId: i.provider === 'email' ? 'password' : i.provider + '.com' }));
  if (user?.app_metadata?.senha_migrada && !provedores.some(p => p.providerId === 'password')) provedores.push({ providerId: 'password' });
  return provedores;
}

// No signUp com e-mail já cadastrado, o Supabase responde como sucesso, mas devolve o usuário
// sem identidades e não envia o e-mail de confirmação.
export const emailJaCadastrado = data => Array.isArray(data?.user?.identities) && data.user.identities.length === 0;
