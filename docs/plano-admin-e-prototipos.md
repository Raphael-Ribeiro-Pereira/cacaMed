# Plano: ferramentas de admin e protótipos (19/10/2026)

Resultado da homologação do módulo 2 de [validacao-19-10.md](validacao-19-10.md): o módulo está quase aprovado. O usuário não conseguiu testar várias coisas porque faltam atalhos de admin, e a entrada da Revisão está errada. Este plano organiza o que fazer, na ordem. **Os itens 1 e 2 foram feitos em 20/10/2026** (branch `feat/economia-v3`, sem deploy); o resto segue a ordem do fim.

## 1. Botões de admin para testar (código)

Hoje `src/components/FerramentasAdmin.jsx` só tem três operações (definir XP global, definir nível global, zerar progresso), que passam pela ação `admin` (`operarAdminSupabase`). O painel já existe no Centro de Comando do menu, só para `role: 'admin'`.

O que falta, cada um como operação nova do `operarAdminSupabase` (só admin, validada no servidor, com teste):

| Ferramenta | O que faz | Para validar |
| --- | --- | --- |
| **Tickets do DDX** | Define os tickets (0 a 20). Hoje só dá para zerar no "Zerar progresso". | Zero ticket, saldo offline, gasto no Plantão |
| **Missões do dia** | Sortear de novo as missões; escolher o nível do sorteio; completar a missão N; voltar o dia (para o login e a ofensiva de amanhã) | Missões v3, ofensiva e XP do login |
| **Nível** | Já existe (global). Acrescentar "subir 1 nível" com a premiação de ticket, que hoje só a jogada de XP aciona, e o nível por matéria na cruzadinha, que já existe no servidor mas não tem tela | Prêmio de nível, liberação da Revisão no nível 10 |
| **Revisão** | Criar erros fictícios (Quiz, V ou M, Erro médico) no perfil real do admin; adiantar o relógio das reapresentações; marcar um item como "quase dominado" | Cartas, intervalos e XP de domínio, sem esperar 1, 3 e 7 dias |
| **DDX** | Liberar/zerar casos concluídos; abrir um caso específico mesmo não revisado (já existe `admin` ignorando `revisado`) | Variedade de casos, repetição |

Regras: nenhuma ferramenta aparece para quem não é admin; todas gravam no perfil real do admin (por isso o painel avisa "salvas nos dados reais"); `resetarProgresso` continua separado e com confirmação.

Na homologação local (`scripts/homologacao.jsx`) as mesmas operações também ganham botão, com dados fictícios.

### Feito em 20/10/2026

O painel do admin (botão no Menu, só para `role: 'admin'`) agora tem grupos, e cada botão é uma operação do `operarAdminSupabase`, validada no servidor e com teste (`src/utils/ferramentasAdmin.test.js`):

| Grupo | Botões |
| --- | --- |
| **Nível e XP** | Subir 1 nível (paga os tickets do nível, como numa partida); definir XP global; definir nível global; nível de um tópico da cruzadinha (a operação já existia no servidor, agora tem tela) |
| **Tickets** | Definir o saldo, de 0 a 100 |
| **Missões do dia** | Completar cada missão (paga a recompensa); sortear de novo (normal, com nível 4 ou com nível 5); simular o dia seguinte (ofensiva +1, login pago, missões novas); simular 2 dias sem entrar (ofensiva volta a 1) |
| **Revisão** | Criar 6 erros fictícios (3 do Quiz, 2 do V ou M e 1 caso do Erro médico, sorteados no banco, gravados como respostas erradas); relógio da Revisão +1, +3 ou +7 dias, e "Real" para voltar |
| **Casos (DDX)** | Liberar os casos concluídos do DDX, do Erro médico e do Causa e efeito, que voltam a pagar XP |
| **Zerar progresso** | Pede um segundo toque para confirmar |

Diferenças do plano:
- **Relógio da Revisão** no lugar de "adiantar as reapresentações": o admin adianta o relógio só da própria Revisão, em dias. Com ele, um item chega a dominado em três sessões (acerta, +1 dia, acerta, +3 dias, acerta), por isso **"marcar como quase dominado" não foi feito**. As respostas dadas com o relógio adiantado ficam com a data adiantada; jogador nunca é afetado.
- **Abrir um caso não revisado** já existia: o admin vê os casos em revisão na lista do DDX.
- Na homologação, as mesmas ferramentas ficam no botão do Menu (à direita), rodando o motor do servidor sobre o perfil fictício; o relógio também vale para a Revisão local.

## 2. Corrigir a entrada da Revisão

Defeito e regra estão em [revisao-inteligente.md](revisao-inteligente.md#defeito-achado-na-homologação-de-19102026-a-entrada-da-revisão). Resumo: a Revisão abre no hub; o relatório só aparece ao terminar a sessão ou em "Ver última revisão". **Corrigido em 20/10/2026** na tela atual (a v2 do hub, já aprovada no protótipo, vem no item 5).

## 3. Protótipos antes do código

**Parecer do agente: sim, prototipar os dois antes de mexer no código.** A Revisão e a Batalha têm várias telas e estados que dependem de decisão de experiência, e o código já foi refeito uma vez por essa razão. Regra da memória do projeto: o protótipo traz **decisões**, não o design final.

### Protótipo A: hub da Revisão
- Arquivo: `docs/prototipos/revisao-hub.html` (abre no navegador, sem build).
- Conteúdo: ver [revisao-inteligente.md](revisao-inteligente.md#protótipo-do-hub-da-revisão).

### Protótipo B: Batalha, modo história v2
- Arquivo: `docs/prototipos/batalha-historia.html` (partes 1 e 2, feitas em 19/10).
- Conteúdo: mapa estilo conquistas, cutscene de entrada, transição para a batalha, pergaminho e enciclopédia, texto estilo Pokémon. Tudo em [modo-historia-v2.md](modo-historia-v2.md).
- Perguntas em aberto que o protótipo responde: silhueta (forma real escurecida ou genérica), botão "Pular", doenças sem forma (pneumonia, dengue e malária) e a transição.
- Os itens da Batalha **saem** da Revisão (decidido em 19/10).

## Ordem de execução proposta

1. Atualizar as docs (feito em 19/10).
2. Protótipo A (hub da Revisão): v1 a v6 feitos em 19/10 (modo foco, trava até o fim, relatório geral em anel, o monstro do cérebro, o modo semanal com fila de ~10 min, missão e aviso de quarta); tudo decidido; pronto para o código.
3. Protótipo B (Batalha): partes 1 e 2 aprovadas em 19/10, com as cenas refeitas em desenho animado; falta só a revisão médica das cadeias de transmissão.
4. Código: ferramentas de admin e correção da entrada da Revisão: **feito em 20/10/2026**.
5. Código: hub da Revisão aprovado (**portado em 20/10/2026**, ver [o porte](revisao-inteligente.md#porte-para-o-código-20102026-branch-feateconomia-v3-sem-deploy)); carta do Paciente DDX (espera as marcações `grave` com revisão médica); Batalha v2.
6. Nova rodada de homologação (módulo 2), agora com os botões de admin.

Nada disso muda o pacote de quinta, 22/10.
