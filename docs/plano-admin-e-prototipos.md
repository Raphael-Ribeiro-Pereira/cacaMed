# Plano: ferramentas de admin e protótipos (19/10/2026)

Resultado da homologação do módulo 2 de [validacao-19-10.md](validacao-19-10.md): o módulo está quase aprovado. O usuário não conseguiu testar várias coisas porque faltam atalhos de admin, e a entrada da Revisão está errada. Este plano organiza o que fazer, na ordem. **Nada aqui foi implementado ainda.**

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

## 2. Corrigir a entrada da Revisão

Defeito e regra estão em [revisao-inteligente.md](revisao-inteligente.md#defeito-achado-na-homologação-de-19102026-a-entrada-da-revisão). Resumo: a Revisão abre no hub; o relatório só aparece ao terminar a sessão ou em "Ver última revisão".

## 3. Protótipos antes do código

**Parecer do agente: sim, prototipar os dois antes de mexer no código.** A Revisão e a Batalha têm várias telas e estados que dependem de decisão de experiência, e o código já foi refeito uma vez por essa razão. Regra da memória do projeto: o protótipo traz **decisões**, não o design final.

### Protótipo A: hub da Revisão
- Arquivo: `docs/prototipos/revisao-hub.html` (abre no navegador, sem build).
- Conteúdo: ver [revisao-inteligente.md](revisao-inteligente.md#protótipo-do-hub-da-revisão).

### Protótipo B: Batalha, modo história v2
- Arquivos: `docs/prototipos/batalha-mapa.html`, `batalha-cutscene.html`, `batalha-transicao.html`.
- Conteúdo: mapa estilo conquistas, cutscene de entrada, transição para a batalha, pergaminho e enciclopédia, texto estilo Pokémon. Tudo em [modo-historia-v2.md](modo-historia-v2.md).
- Perguntas em aberto que o protótipo responde: silhueta (forma real escurecida ou genérica), botão "Pular", doenças sem forma (pneumonia, dengue e malária) e a transição.
- Os itens da Batalha **saem** da Revisão (decidido em 19/10).

## Ordem de execução proposta

1. Atualizar as docs (feito em 19/10).
2. Protótipo A (hub da Revisão): **feito em 19/10**, aguardando aprovação.
3. Protótipo B (Batalha) e aprovação, por partes: mapa, cutscene, transição.
4. Código: ferramentas de admin e correção da entrada da Revisão (podem andar já, sem esperar o protótipo B).
5. Código: hub da Revisão aprovado; carta do Paciente DDX; Batalha v2.
6. Nova rodada de homologação (módulo 2), agora com os botões de admin.

Nada disso muda o pacote de quinta, 22/10.
