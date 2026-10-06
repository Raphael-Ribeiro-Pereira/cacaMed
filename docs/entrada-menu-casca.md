# Entrada, menu e casca

Portados em 06/10/2026 do "cacoMed Protótipo de Movimento" (artefato de 02/10/2026), com o mesmo design e as mesmas animações, no celular e na web. Completam o port de [Coroas, Estatísticas e Crachá](coroas-estatisticas-cracha.md).

## Telas

| Tela | O que mudou |
| --- | --- |
| Abertura (`App.jsx`) | Logo, ECG e três etapas reais no lugar de "Acessando prontuários...": conectando (sessão), validando credencial (usuário recebido) e carregando missões do dia (perfil). "Plantão liberado" aparece por 350 ms antes do menu. |
| Login (`Login.jsx`) | Celular em coluna única; web com a marca e os recursos ao lado. Erro de credencial com tremor do cartão, folha "Recuperar acesso" e folha "Vincular conta antiga" quando o Google encontra uma conta por senha. Mesma lógica de antes (Firebase ou Supabase). |
| Cadastro (`Cadastro.jsx`) | Prévia do crachá ao vivo (mini no celular, crachá inteiro ao lado na web), título, matéria com o título épico, foto e senha com conferência. Depois de criar a credencial, o crachá sai da impressora enquanto o servidor grava; se falhar, "Tentar de novo" ou "Revisar dados" com o formulário preenchido. |
| Cadastro 2.0 (`Cadastro2.jsx`) | Para conta já autenticada sem perfil (Google ou e-mail confirmado). Username conferido no servidor, sugestões livres quando o escolhido está em uso, a mesma impressão do crachá e a senha só quando a conta ainda não tem. |
| Menu (`MenuPrincipal.jsx`) | Celular com crachá, nível, estudo rápido, casos clínicos, missões e prévia do ranking; web em grade com cabeçalho. O crachá do topo abre o cartão de progresso (folha no celular, ao passar o mouse na web). Anéis das missões enchem do valor da última visita ao menu até o atual. |
| Casca (`cascaUi.jsx`) | Web: barra lateral fixa no menu, ranking, estatísticas, crachá e seleção de cruzadinhas, recolhida em ícones entre 960 e 1099 px. Celular: barra de abas Início, Ranking, Estatísticas e Perfil. Passar o mouse em Ranking já busca a lista. |

Peças: `entradaUi.jsx` (campos, casca da entrada, escolhas e impressão), `crachaUi.jsx` (frente do crachá e status do username), `cascaUi.jsx` (barra lateral, crachá do usuário, cartão de progresso, missões e prévia do ranking), `utils/entrada.js`, `utils/cracha.js`, `utils/modosPerfil.js`, `services/entradaConta.js` e `services/rankingSessao.js`. Estilos em `src/prototipo.css`, agora com a barra lateral e o layout da casca.

## Dados e servidor

- Nenhuma mudança na API. O cadastro usa `verificarUsername` (depois de criar a credencial, porque a conferência precisa de sessão), `cadastrar` e, se a foto escolhida não for a padrão, `editarPerfil` com a foto.
- O cadastro por e-mail escolhe o primeiro username livre entre as sugestões do nome (nome.sobrenome, nome.iniciais, inicial+sobrenome e nome com número). No Cadastro 2.0, o username vai explícito: o que aparece na tela é o que fica salvo.
- Enquanto o crachá é impresso, o App não troca de tela com a sessão nova (`cadastroEmAndamento`). Voltar ao login depois de criar a credencial encerra a sessão; o cadastro termina no próximo login, pelo Cadastro 2.0.
- Firebase e Supabase das telas de entrada carregam sob demanda (`entradaConta.js`), o que permite montá-las na homologação sem configuração.

## Diferenças em relação ao protótipo

- Sem XP de boas-vindas: o jogo não dá XP no cadastro. A impressão termina com "Crachá emitido · missões do dia liberadas".
- Sem ofensiva de login e sem os avisos de login diário, subida de nível e marco de ofensiva: o chip de chama mostra a sequência de cruzadinhas, como no crachá.
- O cartão de progresso mostra o título épico no lugar da patente e não tem os pontinhos do medidor de tickets (a cruzadinha dá 2 tickets direto).
- Recursos da tela de login: "Batalha diagnóstica" virou "Quiz e Verdade ou mentira", porque a Batalha ainda é piloto do administrador. "Temporada 3" virou "nova temporada".
- Menu: Quiz médico e Verdade ou mentira com as regras do jogo (5 itens por rodada); "cada cruzadinha rende 2 tickets"; Batalha e Revisão Inteligente só para o administrador (pilotos); o caso do DDX vem de `CASOS_PLANTAO`. Sem "Sair" no menu: fica no crachá.
- Barra lateral: Quiz médico e Verdade ou mentira com os nomes do jogo; Batalha e Revisão só para o administrador. Ela não aparece nas telas de jogo (cruzadinha, Quiz, DDX, Batalha, Revisão), que continuam com as confirmações de progresso não salvo nos próprios botões de voltar.
- Ranking e Estatísticas perderam o botão de voltar, como no protótipo; o Crachá mantém o voltar só na web.
- O botão de ferramentas do administrador sobe no celular para não cobrir a barra de abas.
- A tela "Vincular Google" depois do login antigo (`VincularGoogle.jsx`) não foi portada, como no protótipo.

## Homologação

`scripts/homologacao.jsx` ganhou Testar menu, Testar login, Testar cadastro, Testar Cadastro 2.0, Simular falha no cadastro e Google com conta antiga, com conta fictícia (senha "plantao2026"; o e-mail homologacao@exemplo.com já tem conta) e a barra lateral nas telas da casca.

Conferido em 06/10/2026, no celular (375 px) e na web (1280 e 1024 px): login com erro e tremor, entrada no menu, menu nos dois layouts, folha e cartão de progresso, abas e barra lateral (inteira e recolhida), Ranking e Crachá sem voltar, cadastro com impressão completa, falha com "Tentar de novo", Cadastro 2.0 com username em uso e sugestões livres conferidas. A abertura e os fluxos com Firebase e Supabase reais não rodam na homologação.

## Publicação

A pedido do usuário, a branch entrou na `main` (fast-forward) e o frontend foi publicado em produção na Vercel em 06/10/2026: deploy `dpl_BGGkokiUtgDNhNoHQLmSPuARv8T4`, commit d0bd23e, em https://caca-med.vercel.app. Conferido no site público: tela de login nova, sem erros no console, e banco de palavras carregado da API (HTTP 200). O login com a conta real ainda não foi testado por mim. Para voltar à versão anterior, promover o deploy `dpl_WYPpugy7pqFLvchJvouCW3nCkb8c` (commit 297fdb7).
