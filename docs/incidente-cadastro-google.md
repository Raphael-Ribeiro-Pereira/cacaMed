# Incidente: cadastro com Google parava em "Entre novamente na conta"

Relatado em 07/10/2026 (por volta das 22:20, horário de Brasília) por um jogador novo, num iPhone, em produção (API v12). O cadastro não terminava nem pelo Google nem pelo formulário de e-mail.

## O que o jogador viu

- **Pelo Google:** no Cadastro 2.0, a tela "A impressora parou" marcava "Vinculando senha à conta Google" como feito e "Registrando no prontuário" como falha, com a mensagem "Entre novamente na conta.".
- **Pelo formulário:** o app pedia para confirmar o e-mail, mas nenhum e-mail chegava.

## Causa

Logs do Supabase Auth (UTC):

| Hora | Evento |
| --- | --- |
| 01:16:59 | Conta criada pelo Google (`user_signedup`) |
| 01:17:46 | A Edge Function grava a senha pelo admin (`PUT /admin/users/…`, 200) |
| 01:17:46 | No mesmo segundo, `GET /user` com o token do jogador: 403 `session_not_found` |
| 01:19:34 e 01:22:35 | A mesma sequência, em novas tentativas pelo Google |
| 01:21 a 01:29 | Cinco cadastros pelo formulário: `user_repeated_signup` (o e-mail já existia) |

1. **A senha derrubava a sessão.** A ação `definirSenha` trocava a senha com `admin.auth.admin.updateUserById(id, { password })`. Nessa rota, o Supabase Auth encerra **todas** as sessões do usuário, inclusive a do cadastro em andamento. A chamada seguinte (`cadastrar`) chegava com uma sessão que não existia mais, e a API respondia 401 "Entre novamente na conta.". A troca de senha no Perfil tinha o mesmo efeito.
2. **O app pedia a senha de novo a cada tentativa.** A senha criada pelo app numa conta Google não gera identidade "email" no Supabase, então `providerData` não mostrava a senha, e o Cadastro 2.0 voltava a gravá-la (e a derrubar a sessão).
3. **O formulário escondia o e-mail já cadastrado.** Com e-mail existente, o `signUp` do Supabase responde como sucesso, sem identidades e sem enviar e-mail, para não revelar quem tem conta. O app mostrava "confira seu e-mail" e o jogador esperava um e-mail que não viria.

Estado da conta depois das tentativas: e-mail confirmado, senha gravada, `senha_migrada: true`, nenhuma sessão ativa e nenhum perfil.

## Correção

- **`definirSenha`** (`supabase/functions/cacamed-api/index.js`): a senha passa a ser trocada pela sessão do próprio jogador (`PUT /auth/v1/user` com o token do pedido). Assim o Auth encerra só as outras sessões e mantém a atual. O admin só grava `senha_migrada`, sem senha, o que não encerra sessões. `same_password` conta como sucesso; `weak_password` e `reauthentication_needed` têm mensagens próprias. `src/shared/apiSupabase.js` repassa o token.
- **`provedoresDaConta`** (`src/utils/contaSupabase.js`): `senha_migrada` passa a contar como provedor de senha. O Cadastro 2.0 não pede a senha de novo, e o Perfil oferece "Mudar senha" em vez de "Criar senha".
- **`emailJaCadastrado`** (mesmo arquivo): o cadastro por formulário reconhece o e-mail já existente e mostra "Este e-mail já está escalado para outro plantão. Entre pela tela de login ou com o Google.".
- Testes em `src/utils/contaSupabase.test.js` e `src/utils/apiSupabase.test.js`.

## Limites

- A troca de senha pelo Supabase Auth não foi exercitada de ponta a ponta antes da publicação: isso exigiria criar uma conta real em produção. A confirmação é o jogador concluir o cadastro depois do deploy.
- O cadastro por formulário de **qualquer jogador novo** depende do e-mail de confirmação. O SMTP padrão do Supabase só entrega para a equipe do projeto e tem limite baixo. Até configurar o SMTP público (pendência no [cronograma](cronograma-recuperacao-caca-med.md)), o caminho que funciona para jogadores de fora é o Google.
- O jogador afetado tem uma senha gravada numa das tentativas. Se não lembrar qual foi, a recuperação por e-mail também depende do SMTP público.

## Publicação (07/10/2026)

- **Edge Function `cacamed-api` versão 13.** Os 23 arquivos publicados foram comparados com as cópias locais e são idênticos. Só os escapes `\u` de `coroas.js` e `importarBancoCSV.js` chegaram decodificados, o que dá o mesmo resultado (igual à v12). Ranking, coroas e palavras responderam 200. POST sem login e POST com token inválido responderam 401.
- **Frontend na Vercel:** deploy `dpl_GCgrwufvuGTgMoJLs5xcyAvgLzPx`, commit `75a82fa`.
- **Para voltar atrás:**
  - frontend: promover `dpl_C3Ni3PRx3askHXKa7Wrmbnv9hsPa` (commit `9a7396a`);
  - API: a v12 tem a mesma interface, então o frontend anterior funciona com a v13.
- **Confirmação final:** o jogador afetado entrar com o Google e concluir o cadastro. Como a conta dele já tem `senha_migrada`, o Cadastro 2.0 publicado não pede a senha de novo e segue direto para o registro.
