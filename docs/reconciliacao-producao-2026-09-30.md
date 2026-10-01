# Reconciliação e medição de produção — 30/09/2026

## Resultado da reconciliação

A produção já havia sido ativada antes desta conferência. Esta auditoria compara a origem congelada na prática com o destino atual; não é uma conferência anterior à ativação. Origem: planilha cacoMed - Ranking Global, abas PerfisGoogle, RespostasTreino, RevisoesTreino e Partidas, consultadas pelo conector autenticado. Destino: projeto Supabase lruzndfqfivlvcckvgbw, excluindo perfis de homologação.

- Dois perfis: comparação recursiva de todos os campos do JSON, sem divergências. Conta principal: 6.117 XP e seis tickets nos dois sistemas; segundo perfil: zero XP/tickets.
- 35 respostas: conferência por rodada e item, incluindo escolha, gabarito, acerto, versão, estado e data. Nenhuma ausente ou divergente.
- Quatro revisões: conferência por sessão, modo, item e versão; escolhas, sequência e próxima revisão preservadas. O campo legado `estado` da planilha não faz parte do evento de revisão no destino.
- 16 recibos: todos os IDs de partida presentes no destino. Total de 55 eventos reais, sem extras nesta captura.
- Banco de palavras: um registro de conteúdo, versão 1; a importação anterior registrou 1.939 linhas. O CSV não foi novamente comparado nesta auditoria.

Nenhuma escrita, ajuste de saldo, reaplicação de recompensa ou substituição de perfil foi necessária. Comparar a origem novamente antes de uma futura importação; nunca sobrescrever o destino com um retrato antigo. Uma aba antiga ainda aberta pode gravar no backend legado: se aparecer evento novo lá, reconciliar por ID e transação, com revisão de conflito de perfil.

## Medição controlada

Script reproduzível: `node scripts/medir-producao.mjs`. Amostras em `medicao-producao-2026-09-30.json`. Leituras públicas de ranking, sem autenticação nem gravação; execução no computador do usuário, pela rede disponível, com timeout de 20 s.

| Leituras simultâneas | Média | p95 | Falhas |
| --- | --- | --- | --- |
| 1 | 243 ms | 243 ms | 0 |
| 10 | 286 ms | 305 ms | 0 |
| 25 | 299 ms | 361 ms | 0 |
| 50 | 639 ms | 819 ms | 0 |
| 100 | 395 ms | 507 ms | 0 |

Primeiro HTML: 143 ms, HTTP 200, 1.186 bytes. Primeira API: 917 ms, dos quais 591 ms no `Server-Timing` da função. O HTML não inclui download de módulos, execução React nem renderização. Primeira requisição deste processo não prova cold start da Edge Function: o serviço poderia estar aquecido por outros acessos. A variação entre os lotes e a amostra única por lote impedem extrapolar capacidade sustentada. Esses números não representam 100 jogadores autenticados respondendo ao mesmo tempo.

No navegador integrado, login público carregou corretamente nas larguras 360 e 390 px. Largura do documento igual à viewport, sem transbordamento horizontal. Em 390 px, botão principal com aproximadamente 43 px de altura e Google com 49 px; ações de recuperação/cadastro têm área visual pequena (aproximadamente 15 px), oportunidade de melhoria para toque. Esta é emulação de tamanho no desktop, sem CPU ou rede móvel simuladas; não comprova iOS/Android reais.

A leitura de `performance` pela avaliação isolada do navegador não está disponível. Não foi possível obter FCP/LCP/cache frio por essa ferramenta. Permanecem pendentes: abertura completa com cache vazio, tempo até painel autenticado, aparelho físico em Wi-Fi e 4G/5G, e carga de gravações autenticadas com contas isoladas. Não usar o tempo de HTTP como tempo de abertura da interface.

## Decisão sobre a ponte Firebase

Manter por enquanto. Consulta de identidade confirmou um perfil vinculado ao Supabase com provedores email/Google, porém `senha_migrada=false`; o segundo perfil não tem `auth_user_id`. Desligar agora pode impedir acesso pela senha antiga ou à conta não vinculada.

Critérios de retirada, nesta ordem:

1. Vincular os dois perfis existentes por login comprovado e testar a senha antiga da conta que a utiliza; Google sozinho não confirma migração de senha.
2. Homologar cadastro, login email/senha, Google, recuperação, criação/troca de senha e logout no domínio público, com conta comum; conferir que progresso e vínculo permanecem íntegros.
3. Validar aparelho móvel real e gravações simultâneas isoladas, incluindo conflito/reenvio sem XP ou ticket duplicado.
4. Observar sete dias de uso público após essas validações, sem falha de autenticação/migração nem escrita nova na origem. A janela é critério operacional escolhido, não garantia e não uma automação criada.
5. Remover primeiro o fallback Firebase do frontend e a aceitação de tokens legados na API, publicando e testando. Preservar exportação/backup e instruções de retorno. Depois retirar migração de senha e o secret correspondente; avaliar desativação do Firebase Auth só após confirmar nenhuma dependência restante.

Não existe data garantida de desligamento: o prazo depende desses critérios. Não houve reset de senha, exclusão de usuário nem desligamento do provedor nesta rodada.
