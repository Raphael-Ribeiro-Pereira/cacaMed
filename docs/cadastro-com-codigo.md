# Cadastro com código do e-mail

Decidido com o usuário em 15/10/2026 a partir dos protótipos [`prototipos/cadastro-codigo.html`](../prototipos/cadastro-codigo.html) e [`prototipos/codigo-animacoes.html`](../prototipos/codigo-animacoes.html). Feito na `main` no mesmo dia; **ainda não publicado** (ver [[pendencias|Pendências]]). Regra do porte: do protótipo vieram **só as decisões** (campos e fluxo); o visual segue o das telas que já existiam. A exceção é a animação do acerto.

## Fluxo

1. **Cadastro** (`Cadastro.jsx`): nome, e-mail, senha e confirmação. Título, matéria e foto saíram daqui. O botão agora diz "Receber o código". O cadastro com Google continua.
2. **Código** (`CodigoEmail.jsx`): 6 casinhas, cola o código inteiro, sugestão do teclado do celular (`autocomplete="one-time-code"`), "Reenviar código" com espera de 60 s e "Usei o e-mail errado". Código errado: as casinhas tremem, ficam vermelhas e limpam.
3. **Acerto:** animação escolhida (variação D do protótipo, "redemoinho do C + boca do A", mais lenta, cerca de 4 s): as casinhas brilham, entram num redemoinho e se fundem num quadrado; os números vêm em espiral e o quadrado abre e fecha a boca para comer cada um; no fim ele tomba 45° e vira o visto. Com "reduzir movimento", aparece só o visto. Depois a tela segue sozinha.
4. **Crachá** (Cadastro 2.0, `Cadastro2.jsx`): username, título, **etapa do curso** (1 a 12, com − e +) e "Já sou formado(a)", **"Não sou de Medicina"**, **faculdade** (menu com busca embutida) e **matéria preferida** (18, numa caixa que rola com fade e a dica "role para ver as 18 matérias"), e as **fotos do crachá**.

## Regras

- **Supabase:** o código é o `{{ .Token }}` do e-mail "Confirm signup" e é conferido com `verifyOtp({ email, token, type: 'email' })` (`entradaConta.confirmarCodigo`). Enquanto a animação roda, a sessão nova não troca de tela; no fim o App recarrega a sessão e abre o Cadastro 2.0.
- **Não sou de Medicina:** sem etapa, faculdade opcional, e o título de visitante **🕵️ Infiltrado/Infiltrada no Plantão** no lugar de Dr./Dra. e do título épico (crachá, barra lateral, perfil e impressão). O título guardado continua Doutor/Doutora, que só escolhe o gênero do título e a foto padrão. O jogo é igual para todos (mesmo XP e mesmo ranking).
- **Matérias:** as 6 antigas mantêm o nome e o título; as 12 novas (Imunologia, Histologia, Fisiologia, Bioquímica, Cardiologia, Pediatria, Ginecologia e Obstetrícia, Cirurgia, Emergência, Psiquiatria, Saúde Coletiva e Semiologia) ganharam título épico próprio em `coroas.js`. As 6 coroas não mudam. Conferido no banco em 15/10: nenhum jogador tem XP em tema que mude de título.
- **Servidor** (`cadastrar` em `apiSupabase.js`): aceita as 18 matérias e valida o `curso` com a mesma regra da tela (`src/utils/curso.js`, copiado para a função). Medicina: etapa inteira de 1 a 12 ou formado, faculdade obrigatória. Fora da Medicina: sem etapa, faculdade opcional. A faculdade é texto livre limpo (até 120 caracteres, sem fórmula de planilha). App antigo que não manda `curso` continua cadastrando. O perfil ganha `naoMedicina`, `etapa`, `formado` e `faculdade`.
- **Lista de faculdades** (`src/utils/faculdadesMedicina.js`, 406 entradas, carregada só quando a tela abre): cursos com rótulo CINE "Medicina" dos microdados do **Censo da Educação Superior 2023 (INEP)**, que usa o mesmo cadastro do e-MEC. O site de dados abertos do MEC/e-MEC bloqueia acesso automatizado com verificação anti-robô, por isso a fonte é o INEP (baixado com autorização do usuário). Para atualizar: rodar o mesmo filtro num Censo mais novo.

## Antes de publicar (painel do Supabase, só o usuário)

**O e-mail próprio (SMTP) vem primeiro.** Visto em 15/10: sem SMTP próprio, o Supabase trava a edição dos modelos ("Set up custom SMTP to edit templates") e manda o modelo padrão, que só tem o link. E o envio padrão só entrega para a equipe do projeto ([documentação do Supabase](https://supabase.com/docs/guides/auth/auth-smtp)). Então o cadastro com código depende do SMTP.

1. **Authentication → Emails → SMTP Settings:** o usuário preenche e salva (a senha não passa pelo chat). Dois caminhos:
   - **Domínio + Resend** (o planejado, [proposta](proposta-email-autenticacao.md)): host `smtp.resend.com`, porta `465`, usuário `resend`, senha = chave da API do Resend, remetente no domínio verificado.
   - **Ponte sem domínio:** uma conta Gmail **só do jogo** (não a pessoal) com verificação em duas etapas e uma "senha de app": host `smtp.gmail.com`, porta `465`, usuário e remetente = esse Gmail, senha = a senha de app. O Google limita a cerca de 500 e-mails por dia. Depois dá para trocar pelo Resend só mudando esses campos.
2. **Authentication → Emails → "Confirm signup"** (destrava depois do SMTP): assunto `Seu código do cacoMed: {{ .Token }}` e o corpo abaixo. Sem `{{ .Token }}`, o e-mail chega só com o link e a tela do código fica sem uso.
3. **Authentication → Providers → Email:** conferir "Email OTP Length" = **6** (a tela tem 6 casinhas) e a validade do código.
4. Testar com um e-mail de fora da equipe (caixa de entrada e spam).

```html
<h2>Bem-vindo(a) ao plantão!</h2>
<p>Seu código de confirmação do cacoMed:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Digite os 6 números na tela do cadastro. O código vale por tempo limitado.</p>
<p>Prefere o link? <a href="{{ .ConfirmationURL }}">Confirmar meu e-mail</a></p>
<p>Se você não pediu este cadastro, ignore este e-mail.</p>
```

## Testes

- `src/utils/curso.test.js`: etapa, formado, faculdade, visitante, as 18 matérias e os títulos, e a lista de faculdades.
- `src/utils/apiSupabase.test.js`: `cadastrar` guarda o curso validado, recusa curso inválido e matéria desconhecida, e aceita o app antigo sem curso.
- Homologação (`/homologacao.html`, "Testar cadastro" com `confirmar@exemplo.com`; o código certo é `482913`): conferido em 15/10 na web e no celular (375 px), do formulário à impressão do crachá, com código errado, animação do acerto, busca de faculdade, matérias com fade e "Não sou de Medicina".

## Fica para depois

- Editar etapa, faculdade e matéria no perfil (a etapa muda a cada semestre).
- Mostrar etapa e faculdade no crachá, se o usuário quiser (o crachá não mudou).
