# cacoMed

Jogo web de treinamento médico com cruzadinhas, progresso por tópico, missões, tickets, perfil, estatísticas e ranking global. DDX, Hardcore e a integração de IA têm uma reformulação planejada separadamente.

## Executar localmente

Requisitos: Node.js compatível com Vite 8 e um projeto Firebase configurado. Instale as dependências com `npm install`, preencha as variáveis de ambiente locais sem versionar chaves e inicie a interface com `npm run dev`. Quando precisar do serviço de IA, inicie também `npm run server` em outro terminal. O endereço do Vite é exibido no terminal, normalmente `http://localhost:5173/`; o servidor de IA responde em `http://localhost:3001/health`.

**Transição para custo zero:** o projeto `caca-med` está no plano Firebase Spark, sem faturamento vinculado. Firebase Authentication continua servindo login antigo por e-mail/senha e Google. O modo `VITE_FONTE_DADOS=planilha` grava perfis e progresso na planilha cacoMed via Apps Script; a migração ainda está em homologação. Para login Google local, use **`http://localhost:5173/`** (não `127.0.0.1`). Não apague o Firestore antigo antes de testar partida, recompensa, perfil e ranking. DDX e Hardcore seguem temporariamente bloqueados. Consulte [o cronograma](docs/cronograma-recuperacao-caca-med.md).

No Cadastro 2.0, contas Google sem senha criam uma senha para também entrar pelo formulário de e-mail. A senha é vinculada à **mesma conta Firebase Authentication**; nunca é enviada ao Apps Script ou gravada na planilha. Se a conta Google já tinha perfil antes dessa mudança, use **Perfil → Criar Senha**. Contas com senha antiga preservam essa credencial.

## Verificações

- `npm test`: regras de missões, Apps Script, importação CSV, geração/navegação da grade e contadores acumulados.
- `npm run lint`: análise estática de JavaScript e JSX.
- `npm run build`: compilação da versão de produção.

## Fluxo da cruzadinha

No primeiro acesso, o tutorial é exibido e sua conclusão fica registrada no perfil da fonte de dados ativa (Firestore antigo ou planilha nova). O botão **Tutorial** permite reabri-lo. Durante a partida, clique ou use Tab para selecionar uma casa; as setas movem o foco entre casas vizinhas e Enter/Espaço alternam a direção numa interseção. O cursor pula letras já preenchidas. **Abandonar plantão** pede confirmação e descarta o progresso não concluído.

Ao completar a grade, o resultado mostra XP de letras e palavras, multiplicadores de nível e tempo, desconto de dicas, bônus de missões e tickets. A recompensa tem ID único e reenvio idempotente; enquanto o salvamento não terminar, a saída permanece bloqueada. No modo planilha, o Apps Script recalcula XP a partir de métricas limitadas, mas **não comprova que a partida foi jogada honestamente**. O histórico recente contém no máximo 30 partidas; os totais do menu, perfil, estatísticas e ranking vêm dos contadores acumulados por tópico.

## Ranking público

A tela de ranking lê a implantação pública do Google Apps Script. Ela não consulta a coleção privada `usuarios` inteira. O código da implantação está em [docs/apps-script-ranking.gs](docs/apps-script-ranking.gs). A aba antiga `Ranking` foi preservada durante a transição; a nova temporada usa `RankingNovaTemporada`. O UID fica na planilha e a resposta pública traz apenas um hash para identificar a posição do próprio jogador. O navegador recebe somente os dados públicos por JSONP.

O Apps Script vinculado à planilha `cacoMed - Ranking Global` está na implantação existente (versão 6), com a mesma URL `/exec`. No modo novo, o cliente envia o token Firebase à API privada do Apps Script por uma ponte HTML, e o script armazena perfis em `PerfisGoogle`, recibos em `Partidas` e o placar em `RankingNovaTemporada`. O Firestore antigo não é usado nesse caminho. A resposta pública inclui nome e métricas, sem e-mail ou perfil privado. O caminho antigo de sincronização ainda existe apenas até a homologação e limpeza final.

## Segurança do Firestore

As regras atuais do Firestore permitem a cada usuário autenticado ler e editar apenas o próprio documento `usuarios/{uid}`; a leitura anônima foi negada no teste. [firestore.rules](firestore.rules) documenta a regra proposta para o repositório. No fluxo antigo, isso ainda não impede que o próprio usuário modifique sua pontuação. No fluxo novo, o Apps Script aplica limites, calcula XP e impede ID de partida repetido, mas as métricas enviadas pelo navegador ainda podem ser falsificadas. O ranking, portanto, não é antifraude. Após a homologação, os documentos antigos do Firestore serão removidos; as contas no Firebase Authentication permanecerão.

## Acompanhamento

O [cronograma de recuperação](docs/cronograma-recuperacao-caca-med.md) contém o inventário de problemas, o andamento e as verificações de aceitação. A referência visual enviada pelo usuário está em `docs/stitch-reference/`.
