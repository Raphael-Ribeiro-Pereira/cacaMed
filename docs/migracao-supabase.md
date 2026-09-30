# Migração para Supabase — 30/09/2026

Status atual: banco e API versão 4 publicados no projeto separado `caca-med` (`lruzndfqfivlvcckvgbw`), região São Paulo (`sa-east-1`). Frontend local ativado e todos os modos homologados contra a API real. Custo de criação informado e confirmado: US$ 0/mês. Nenhuma tabela do projeto `eu-jogo-tu-jogas` foi modificada.

## Situação consolidada

- Dois perfis e 55 eventos importados e comparados com a origem. Banco de palavras importado: 1.939 linhas de conteúdo.
- Quiz, Verdade ou mentira, Revisão, Plantão, Erro médico, Causa e efeito e Cruzadinha usam persistência transacional, controle de versão e recibos permanentes.
- Login real abriu com 6.117 XP e seis tickets. Identidade vinculada ao Supabase Auth mediante token Firebase verificado; testes isolados não alteraram esse perfil.
- 82 testes locais, lint e build passaram. 50 chamadas reais no navegador: média 410 ms, mediana 398 ms, p95 560 ms. [Relatório completo](auditoria-supabase-2026-09-30.md).
- Telas carregadas sob demanda com React.lazy/Suspense. JavaScript, React e Vite preservados.
- Login inicial, Google e senhas ainda dependem da ponte Firebase. Não desligar Firebase Auth. A estratégia das senhas está aguardando decisão do usuário; o provedor Google do Supabase ainda está desativado e precisa de configuração OAuth.
- Produção Vercel ainda usa a implantação anterior. Publicação e reconciliação final pendentes; deploy automático continua fora deste fluxo.

### Operação local

Defina `VITE_FONTE_DADOS=supabase`, `VITE_SUPABASE_URL=https://lruzndfqfivlvcckvgbw.supabase.co` e `VITE_SUPABASE_PUBLISHABLE_KEY` com a chave pública do projeto. Mantenha a configuração Firebase enquanto a ponte de login estiver ativa. Nenhuma chave privilegiada é necessária no frontend.

Execute `node scripts/sincronizar-supabase.mjs` antes de publicar a Edge Function. Edite os motores originais em `src`; as cópias da função são geradas. A página `/homologacao-supabase.html` permite testar a API real com estado isolado, somente como administrador.

### Retorno ao backend anterior

Antes da primeira publicação Supabase, basta restaurar `VITE_FONTE_DADOS=planilha` e a configuração anterior, depois reconstruir o frontend. Após jogadores começarem a gravar no Supabase, isso exige reconciliação dos novos eventos e saldos: não fazer uma troca simples que perderia progresso. Não apagar os dados anteriores nem permitir gravações simultâneas nos dois backends durante a transição.

As seções abaixo registram a sequência histórica da implementação; descrições de pendências daquela etapa não substituem a situação consolidada acima.

## Arquitetura aprovada

Web com React + Vite e JavaScript; futuro mobile com React Native + Expo e JavaScript. Supabase para banco, autenticação e funções protegidas. `src/shared/index.js` disponibiliza as regras existentes para reutilização; não há conversão para TypeScript.

## Inventário e destino

| Origem atual | Conteúdo | Destino planejado |
| --- | --- | --- |
| Firebase Authentication | Identidade, senha, Google, vínculo de provedores | Supabase Auth, com estratégia explícita de transferência de identidade |
| Perfil na planilha | UID, nome, título, matéria, role e preferências | Perfil privado ligado à identidade; role definida apenas pelo backend |
| Perfil na planilha | XP, tickets, economia v2, missões e progresso de tópicos | Estado do jogador com versão para controle de concorrência |
| `Partidas` | Recibos e identificadores de partidas | Recibos permanentes com unicidade por usuário e partida |
| `RespostasTreino` | Respostas, versões, acertos e erros | Histórico privado indexado por usuário, item e data |
| `RevisoesTreino` | Histórico e intervalos de revisão | Histórico privado de revisões |
| Perfil na planilha | Rodadas ativas de treino, DDX e revisão | Estado persistido e retomável, atualizado atomicamente com recompensas |
| Ranking público | Projeção limitada de estatísticas | Projeção pública sem email, respostas ou dados privados |
| CSV público de palavras | Conteúdo das cruzadinhas | Conteúdo versionado após validar a importação |

O JSON do perfil será preservado na primeira etapa para manter compatibilidade com os componentes. Históricos e recibos ficam em tabelas separadas. A normalização adicional virá após confirmar a equivalência dos resultados.

## Contrato de segurança e concorrência

- O backend autentica a identidade e calcula XP, tickets, missões e respostas. O cliente envia escolhas e identificadores; não define recompensas ou role.
- Operações usam transação e controle de versão do estado. Se outra resposta já foi salva, o backend consulta o estado e trata reenvio pelo valor dos campos, preservando a correção do incidente do Quiz.
- Recibo, histórico e progresso devem ser confirmados na mesma transação: não repetir o modelo de salvar perfil e depois reparar linhas da planilha.
- RLS em tabelas expostas; leitura limitada ao proprietário. Nenhuma escrita direta de saldo pelo cliente.
- Chave pública no web/mobile; chave privilegiada somente no ambiente protegido.
- Não transferir senhas em texto puro. O vínculo com UID antigo deve ser verificado por credencial válida; email fornecido pelo cliente não comprova propriedade.

## Primeira implementação local

- Entrada compartilhada JavaScript para economia, missões, treinos e revisão.
- Transporte HTTP independente de Firebase e React, com token injetado, timeout e propagação de erro.
- Sem reenvio automático de gravações; conserva o ID original para recuperação idempotente.
- Transporte ainda não ativado no app: depende da API publicada e da validação das identidades e dados migrados.

## Sequência de ativação

1. Definir o projeto destino e conferir plano/região antes de criar recursos.
2. Criar schema, RLS, índices e operação atômica de persistência.
3. Publicar API reutilizando os motores JavaScript existentes e testar com conta fictícia.
4. Implementar transferência autenticada dos perfis e histórico, com comparação de contagem e saldos.
5. Integrar o frontend e testar login, retomada, duas rodadas consecutivas, reenvio e concorrência.
6. Testar todos os modos, missões, ranking e revisão; medir latência mediana e p95.
7. Ativar Supabase depois da validação; manter exportação e instruções de rollback do backend anterior.

## Pendências reais

Transferência dos usuários para Supabase Auth, demais modos, teste autenticado no navegador e troca da fonte oficial ainda pendentes. A primeira cópia de perfis/históricos foi importada; antes da ativação precisa ser reconciliada com alterações posteriores na planilha. Este documento não representa uma migração concluída.

Validação inicial: 76 testes passaram, incluindo quatro testes do transporte (identidade, preservação do pedido, ausência de reenvio e timeout). Lint e build passaram; permanece o aviso de bundle grande já existente.

## Etapa publicada no projeto novo

- Migration remota `cacamed_initial_state`: estado do jogador, histórico de eventos e RPC transacional `cacamed_commit` com controle de versão. O SQL de referência está em `supabase/schema.sql`.
- API `cacamed-api` versão 1: valida token Firebase com assinatura RS256, issuer e audience; também aceita identidade validada por Supabase Auth. Login Firebase continua no app nesta fase.
- Operações iniciais: consulta/cadastro de perfil, tutorial, início/resposta/abandono de Quiz e Verdade ou mentira. Operações restantes devolvem indisponibilidade explícita; frontend ainda usa o backend anterior.
- Cadastro novo não define administrador pelo email e não aceita saldo/role do cliente. Perfis existentes ainda precisam ser transferidos por caminho confiável, sem recriar conta zerada.
- JWT do gateway desativado porque a autenticação Firebase é verificada dentro da função. Pedidos sem credencial retornaram HTTP 401 no teste remoto.
- Tabelas com RLS e acesso direto revogado para `anon`/`authenticated`; somente a API privilegiada pode gravar. Advisor retornou apenas duas informações de RLS sem política, intencionais nesta fase de acesso exclusivo pelo backend: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy.
- Teste remoto em transação revertida confirmou evento único no reenvio, controle de versão e rejeição de escrita obsoleta. Não deixou perfil fictício no banco.
- 77 testes locais passaram após adicionar regressão de duas rodadas consecutivas e recibos permanentes.
- Execute `node scripts/sincronizar-supabase.mjs` antes de publicar para copiar os motores originais ao diretório da função. As cópias são artefatos gerados; edite os módulos em `src`.

## Continuação: revisão e cópia dos dados

- API versão 2 publicada e ativa: consultar/iniciar/responder/encerrar revisão, reutilizando o motor original, com piloto restrito ao administrador. Histórico paginado por usuário para não truncar depois de 1.000 eventos.
- Eventos de revisão e estado são confirmados na mesma RPC; confirmação de histórico não exige reparação posterior. Revisão mantém saldo e respostas idempotentes.
- Origem identificada por conector autenticado: `cacoMed - Ranking Global`, ID `1Le95pXCvvJpyJgjuwuIDFHGM7Hn0gs4qjblu8qKlH88`. Importação inicial preserva UID Firebase e JSON original; não cria usuários Auth nem muda senhas.
- Copiados dois perfis, 35 respostas de treino, quatro respostas de revisão e 16 recibos. Inserção transacional, sem sobrescrever perfis existentes e sem alterar a planilha. IDs de eventos seguem o mesmo contrato da API.
- Esta cópia é um retrato da origem; o app continua gravando na planilha até a troca. A reconciliação final é obrigatória antes da ativação.
- 78 testes passaram e lint passou. Novo teste confirma revisão baseada em erros, preservação de XP/tickets, relatório atualizado, bloqueio de piloto e reenvio sem incremento.
- Ainda falta testar a API com sessão real; publicação ativa não comprova o fluxo autenticado completo.
# Atualização de autenticação — 30/09/2026

O usuário decidiu preservar as senhas atuais. Implementado localmente o middleware `migrarSenha`, que confirma a senha no Firebase, compara o UID comprovado, confere o vínculo de identidade e marca a senha como migrada. Uma senha antiga não pode sobrescrever uma senha já migrada. Senhas não entram no perfil, histórico ou logs do jogo. A API requer `FIREBASE_WEB_API_KEY` no ambiente da função (chave pública de identificação do projeto Firebase).

Há um adaptador de usuário Supabase e um caminho de login nativo preparados. `VITE_AUTH_SUPABASE=false` mantém o login atual enquanto a troca completa não foi homologada. Os jogos continuam usando o Supabase. Esta etapa de autenticação ainda não foi publicada na função remota.

Validação: 86 testes passaram, incluindo quatro novos testes de migração de senha (senha correta, bloqueio de sobrescrita, identidade divergente, e-mail não verificado/credencial inválida). Pendente: configurar OAuth Google, concluir e testar cadastro e recuperação nativos, testar preservação de senha em conta de homologação e ativar a flag somente depois desses testes.

Google: no Google Cloud do projeto `caca-med`, abrir Google Auth Platform → Clients; usar/criar cliente do tipo Web application. Autorizar callback `https://lruzndfqfivlvcckvgbw.supabase.co/auth/v1/callback`; copiar Client ID e Client Secret diretamente para o provedor Google do Supabase. A entrada e o envio de credenciais pelo navegador são feitos pelo usuário. Não apagar os callbacks existentes do Firebase. Origens de desenvolvimento: `http://localhost:5173`, `http://localhost:5174`; produção: `https://caca-med.vercel.app`. Manter verificações de nonce e e-mail habilitadas.

Correção de segurança: a chave não é mais gerada nem versionada em `firebasePublic.js`. Ela foi cadastrada como segredo criptografado `FIREBASE_WEB_API_KEY` na Edge Function `cacamed-api`; o arquivo local foi removido e o sincronizador não copia valores do `.env` para o código publicado. A chave continua sendo uma chave Web pública do Firebase, sem privilégios administrativos, mas deve permanecer restrita no Google Cloud (APIs e origens autorizadas).

