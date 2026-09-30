// A senha nunca é persistida pelo jogo nem incluída em logs. O Firebase é a
// autoridade para a primeira migração; senhas já migradas não são sobrescritas.
export function criarMigracaoSenha({ verificarSenha, vincular, obterConta, atualizarConta }) {
  return async (user, pedido) => {
    if (user.source !== 'firebase') {
      throw Object.assign(new Error('Esta conta já usa o Supabase.'), { status: 400 });
    }
    const senha = pedido.senha;
    if (typeof senha !== 'string' || senha.length < 6 || senha.length > 4096) {
      throw Object.assign(new Error('Senha inválida.'), { status: 400 });
    }
    const identidade = await verificarSenha(user.email, senha);
    if (identidade.uid !== user.uid) throw Object.assign(new Error('Credenciais inválidas.'), { status: 401 });
    if (!user.emailVerified || !identidade.emailVerified) return { migrada: false, motivo: 'email_nao_verificado' };
    const vinculo = await vincular(user);
    if (!vinculo.migrada) return vinculo;
    const conta = await obterConta(user);
    if (conta.app_metadata?.firebase_uid !== user.uid || conta.email !== user.email) {
      throw Object.assign(new Error('Vínculo de identidade inconsistente.'), { status: 409 });
    }
    if (conta.app_metadata?.senha_migrada) {
      throw Object.assign(new Error('A senha já foi migrada. Use a senha atual do Supabase.'), { status: 409 });
    }
    await atualizarConta(conta.id, { password: senha,
      app_metadata: { ...conta.app_metadata, senha_migrada: true } });
    return vinculo;
  };
}
