# cacoMed

Jogo web de treinamento médico com cruzadinhas, Quiz (Teoria e Casos clínicos), Verdade ou mentira, Revisão inteligente, missões, tickets, perfil, estatísticas e ranking global. Quiz e Verdade ou mentira foram validados pelo usuário e liberados na API; Revisão inteligente e os três modos DDX mantêm acesso piloto para administrador. O antigo Hardcore foi retirado do código ativo.

Quiz, Verdade ou mentira e economia v2 implementados em 28/09/2026. [Regras e verificações](docs/jogos-e-economia-v2.md). Revisão inteligente gratuita baseada nos erros, com sessões de até cinco itens, retomada e intervalos de repetição. [Decisões e validação do piloto](docs/revisao-inteligente.md). API versão 19 na implantação existente; frontend atualizado local, aguardando validação do piloto e publicação Vercel. Deploy automático permanece desativado. A API compara respostas por conteúdo, sem depender da ordem dos campos. [Incidente do Quiz: tentativas, causa, correção e prevenção](docs/incidente-quiz-rodada-mudou.md).

## Executar localmente

Requisitos: Node.js compatível com Vite 8 e um projeto Firebase configurado. Instale as dependências com `npm install`, preencha as variáveis de ambiente locais sem versionar chaves e inicie a interface com `npm run dev`. Quando precisar do serviço de IA, inicie também `npm run server` em outro terminal. O endereço do Vite é exibido no terminal, normalmente `http://localhost:5173/`; o servidor de IA responde em `http://localhost:3001/health`.

**Backend em migração:** o ambiente local agora usa `VITE_FONTE_DADOS=supabase`, com banco e API no projeto Supabase separado `caca-med`, plano Free e região São Paulo. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`; a chave privilegiada fica somente na função protegida. Firebase Authentication continua servindo a entrada por email/senha e Google enquanto concluímos a transferência das credenciais. O backend anterior pode ser selecionado com `VITE_FONTE_DADOS=planilha`, respeitando a reconciliação do progresso. Produção Vercel ainda não foi trocada. Consulte [migração e rollback](docs/migracao-supabase.md), [homologação da API](docs/auditoria-supabase-2026-09-30.md) e [cronograma](docs/cronograma-recuperacao-caca-med.md).

Para login Google local, use **`http://localhost:5173/`**. O domínio Vercel e localhost 5173/5174 estão permitidos na nova API. Os casos DDX e a Revisão Inteligente mantêm as restrições de piloto atuais. O comando `node scripts/sincronizar-supabase.mjs` gera as cópias dos motores para publicar a Edge Function; edite os arquivos originais em `src`. `/homologacao-supabase.html` permite validar a API real com dados separados, somente como administrador, e não integra a build de produção.

No Cadastro 2.0, contas Google sem senha criam uma senha para também entrar pelo formulário de e-mail. A senha é vinculada à **mesma conta Firebase Authentication**; nunca é enviada ao Apps Script ou gravada na planilha. Se a conta Google já tinha perfil antes dessa mudança, use **Perfil → Criar Senha**. Contas com senha antiga preservam essa credencial.

## Verificações

- `npm test`: 72 testes de economia, revisão, treinos, DDX, missões, Apps Script, CSV, grade e contadores, incluindo equivalência dos motores gerados.
- `npm run lint`: análise estática de JavaScript e JSX.
- `npm run build`: compilação da versão de produção.

## Fluxo da cruzadinha

No primeiro acesso, o tutorial é exibido e sua conclusão fica registrada no perfil da fonte de dados ativa (Firestore antigo ou planilha nova). O botão **Tutorial** permite reabri-lo. Durante a partida, clique ou use Tab para selecionar uma casa; as setas movem o foco entre casas vizinhas e Enter/Espaço alternam a direção numa interseção. O cursor pula letras já preenchidas. **Abandonar plantão** pede confirmação e descarta o progresso não concluído.

O banco de palavras é lido de um CSV público. No mesmo tópico, o importador mantém a primeira ocorrência de cada resposta normalizada e ignora cópias da mesma palavra; a planilha de origem não é modificada. A revisão médica das dicas cabe ao usuário antes da homologação de conteúdo.

Ao completar a grade, o resultado mostra XP de letras e palavras, multiplicadores de nível e tempo, desconto de dicas, bônus de missões e tickets. A recompensa tem ID único e reenvio idempotente; enquanto o salvamento não terminar, a saída permanece bloqueada. No modo planilha, o Apps Script recalcula XP a partir de métricas limitadas, mas **não comprova que a partida foi jogada honestamente**. O histórico recente contém no máximo 30 partidas; os totais do menu, perfil, estatísticas e ranking vêm dos contadores acumulados por tópico.

## Ranking público

A tela de ranking lê a implantação pública do Google Apps Script. Ela não consulta a coleção privada `usuarios` inteira. O código da implantação está em [docs/apps-script-ranking.gs](docs/apps-script-ranking.gs). A temporada ativa usa `RankingNovaTemporada`; a aba legada `Ranking` foi removida. O UID fica na planilha e a resposta pública traz apenas um hash para identificar a posição do próprio jogador. O navegador recebe somente os dados públicos por JSONP.

O Apps Script vinculado à planilha `cacoMed - Ranking Global` está na implantação existente (versão 19), com a mesma URL `/exec`. No modo novo, o cliente envia o token Firebase à API privada do Apps Script por uma ponte HTML, e o script armazena perfis em `PerfisGoogle`, recibos em `Partidas`, respostas em `RespostasTreino` e `RevisoesTreino`, e o placar em `RankingNovaTemporada`. O Firestore antigo não é usado nesse caminho. A resposta pública inclui nome e métricas, sem e-mail ou perfil privado. A sincronização antiga de ranking é rejeitada. A ponte HTML é reutilizada nas chamadas seguintes da mesma aba para evitar uma nova abertura a cada leitura ou salvamento.

A interface está publicada em `https://caca-med.vercel.app/` e a versão web padrão foi homologada em 27/09/2026. Esse endereço, **sem barra final**, deve permanecer em `ORIGENS_APP` no Apps Script e nos domínios autorizados do Firebase Authentication. Alterações no Apps Script exigem atualizar a implantação web existente; salvar o editor sozinho não atualiza `/exec`. O primeiro acesso pode levar mais tempo por iniciar a ponte e executar a chamada no Apps Script; os acessos seguintes reutilizam a ponte na aba aberta.

## Segurança do Firestore

As regras atuais do Firestore permitem a cada usuário autenticado ler e editar apenas o próprio documento `usuarios/{uid}`; a leitura anônima foi negada no teste. [firestore.rules](firestore.rules) documenta a regra proposta para o repositório. A coleção `usuarios` legada foi excluída após a homologação; as contas no Firebase Authentication permaneceram. O Apps Script aplica limites, calcula XP e impede ID de partida repetido, mas as métricas enviadas pelo navegador ainda podem ser falsificadas. O ranking, portanto, não é antifraude.

## Acompanhamento

Causa e efeito relaciona mecanismo, consequência, compensação e intervenção em quatro etapas. Custa um ticket e concede até 100 XP somente na primeira conclusão por versão; progresso próprio em `causaEfeito`. Backend versão 13 publicado na implantação existente; frontend atualizado local. Consulte [o roteiro de Causa e efeito](docs/ddx-causa-efeito.md).

Erro médico usa o mesmo paciente do Plantão numa variante de atendimento auditado. Cada análise custa um ticket e tem quatro etapas, com até 100 XP apenas na primeira conclusão de cada versão. O progresso fica separado em `erroMedico` na planilha. A API está publicada na versão 13 da implantação existente; consulte [o roteiro de Erro médico](docs/ddx-erro-medico.md). O frontend atualizado segue local enquanto a revisão do fluxo é concluída.

**Pendências e como retomar o trabalho:** [docs/pendencias.md](docs/pendencias.md).

O [cronograma de recuperação](docs/cronograma-recuperacao-caca-med.md) contém o inventário de problemas, o andamento e as verificações de aceitação. A referência visual enviada pelo usuário está em `docs/stitch-reference/`.
