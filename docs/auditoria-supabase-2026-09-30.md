# Homologação Supabase — 30/09/2026

## Resultado confirmado

API `cacamed-api` versão 4 no projeto separado `caca-med`, região São Paulo. O frontend local usa `VITE_FONTE_DADOS=supabase`. A publicação web ainda não foi trocada.

Em uma execução concluída no navegador às 15:03 UTC, 50 chamadas autenticadas reais deram média de **410 ms**, mediana de **398 ms** e p95 de **560 ms**. São tempos do transporte no navegador, incluindo rede, autenticação e persistência. A homologação acrescenta uma consulta de autorização do administrador em cada chamada. Esta medição sequencial de uma sessão não é teste de carga, não representa abertura inicial, nem comprova desempenho com 50/100 usuários simultâneos. Não há comparação controlada com Apps Script nesta execução.

| Operação | Resultado |
| --- | --- |
| Quiz | Duas rodadas consecutivas, Teoria e Casos; cinco respostas por rodada; reenvio sem duplicar partidas ou recompensa |
| Verdade ou mentira | Cinco frases, quatro classificações corretas e uma errada; confirmação e reenvio sem recompensa extra |
| Revisão | Quatro erros acumulados no ambiente de teste foram respondidos; encerramento preservou XP e tickets |
| Plantão | Caso seguro concluído duas vezes; segunda conclusão da mesma versão sem XP novo |
| Erro médico | Quatro etapas corretas; repetição sem XP novo |
| Causa e efeito | Quatro etapas corretas; repetição sem XP novo |
| Cruzadinha | XP enviado como 999999 foi ignorado e recalculado; recibo impediu pagamento repetido |
| Perfil real | Comparação integral antes/depois idêntica: 6.117 XP e seis tickets preservados |

Os testes gravaram apenas o perfil `homologacao:<uid>`, separado pelo servidor e restrito ao administrador. Ele não aparece no ranking. A página `homologacao-supabase.html` é uma entrada de desenvolvimento e não é incluída na build de produção.

Depois do roteiro automatizado, os componentes reais também foram operados pelo navegador: Quiz Teoria 5/5 (+100 XP), recarga no meio da rodada retomando a pergunta 2/5, segunda rodada Casos 5/5 (+125 XP e um ticket), Verdade ou mentira 5/5 (+100 XP e um ticket). A Revisão exibiu relatório 4/4, fontes e reapresentação programada para 01/10. Todos esses saldos pertencem apenas à homologação.

## Pontos positivos

- Estado, recibos e histórico são confirmados na mesma transação; não dependem de reparação posterior na planilha.
- O servidor reavalia conflitos com o estado confirmado e usa os mesmos motores JavaScript do app.
- Cadastro não aceita role ou saldo escolhidos pelo navegador. O ranking omite email, UID original e respostas privadas.
- Dois perfis, 35 respostas de treino, quatro revisões e 16 recibos foram copiados sem sobrescrever dados existentes. A cópia foi comparada campo a campo com a origem.
- Banco de palavras com 1.939 linhas de conteúdo foi importado; a mesma rotina de normalização/deduplicação é reutilizada.
- A conta real foi vinculada ao Supabase Auth por identidade Firebase verificada, mantendo o UID legado e seu perfil.
- 82 testes locais passaram; lint passou. Testes incluem concorrência, repetição, autorização, corpo excessivo e cálculo das recompensas no servidor.
- RLS habilitado nas três tabelas; consultas de privilégios confirmaram ausência de SELECT anônimo, UPDATE autenticado e EXECUTE direto das RPCs pelos clientes.
- Nova consulta autenticada à origem confirmou que perfis, respostas, revisões e recibos continuam iguais à cópia inicial. Repetir essa conferência imediatamente antes da publicação.

## Limitações e próximos cuidados

- O formulário de login, Google e gestão de senhas ainda usam Firebase como ponte de identidade. A sessão de acesso ao backend pode ser Supabase, mas o Firebase Authentication ainda não pode ser desligado.
- Antes da publicação web, reconciliar alterações posteriores na planilha e definir a transferência final das credenciais/provedor Google. Não mudar o backend de produção deixando dois gravadores ativos para o mesmo jogador.
- A medição usa chamadas sequenciais com serviço já acessado. Falta medir abertura a frio, rede mobile e carga concorrente.
- Cruzadinhas ainda recebem métricas do navegador: cálculo de XP no servidor não torna o ranking antifraude.
- Conteúdo clínico permanece em piloto conforme suas flags originais; passar testes técnicos não substitui revisão clínica.
- O advisor não apontou problemas de desempenho. Informações de RLS sem política são intencionais: acesso direto revogado e API exclusiva. [Explicação do advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Proteção contra senhas vazadas aparece desativada no Auth. Avaliar ao concluir o login nativo, sem contratar plano pago automaticamente. [Documentação](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- `npm audit` continua apontando 15 vulnerabilidades na árvore existente, incluindo duas críticas transitivas (`protobufjs` e `websocket-driver`). Nenhum pacote Supabase apareceu entre os afetados. A atualização das dependências legadas deve ser tratada antes de uma liberação ampla; não foi aplicado `audit fix` indiscriminado nesta migração.

## Tentativas e erros registrados

1. O roteiro de frases usava `correta`, campo do Quiz. As frases usam `verdadeira`. Isso enviou valor inválido; a API rejeitou sem concluir ou recompensar a rodada. Correção feita no roteiro, não no motor do jogo.
2. Ao retomar esse teste, o roteiro inventava outro ID para uma rodada ainda ativa. O servidor corretamente manteve a rodada salva e rejeitou o ID divergente. O roteiro passou a usar o ID retornado em `entrada.id`. Nunca corrigir esse erro trocando arbitrariamente o ID salvo ou afrouxando a validação do servidor.
3. Uma edição do roteiro durante a execução disparou atualização do Vite e interrompeu o teste. Gravações já confirmadas permaneceram salvas. Evitar editar a página de homologação durante uma execução.
4. A consulta inicial de privilégios usou assinatura SQL `jsonb[]`; a RPC recebe `jsonb` contendo um array JSON. A inspeção de `pg_proc` confirmou a assinatura real e o bloqueio de execução direta para `anon` e `authenticated`.

## Correções implementadas

Todas as operações de jogo passaram a usar a API Supabase com confirmação atômica, recibos permanentes e controle de versão. A interface conserva IDs e escolhas para recuperação, sem reenviar gravações automaticamente. A mensagem de salvamento deixou de mencionar planilha. Telas de jogo, perfil, ranking e estatísticas passaram a ser carregadas quando abertas, reduzindo o código necessário na entrada do app.

## Reprodução

Com o projeto local configurado para Supabase, iniciar Vite na porta 5173, entrar como administrador e abrir `/homologacao-supabase.html`. O botão de teste completo executa os motores contra a API real e exibe chamadas, média, mediana e p95. Os botões de modos permitem testar os componentes reais com o mesmo isolamento. Recarregar durante uma rodada deve retomar respostas já confirmadas.
