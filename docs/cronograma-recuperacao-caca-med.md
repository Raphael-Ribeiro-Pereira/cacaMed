# Caça-Med — diagnóstico e cronograma de recuperação

## Plano de 07/10/2026 — economia v3, Revisão Inteligente v2 e app offline

Em produção desde 07/10/2026: telas do protótipo em todos os modos e app instalável (deploy `dpl_C3Ni3PRx3askHXKa7Wrmbnv9hsPa`, API v12). Nesse dia o usuário tomou as decisões abaixo e pediu que fossem só documentadas e colocadas no cronograma, **sem código**.

Decisões e especificações (perguntas respondidas pelo usuário no mesmo dia, em duas rodadas):
- [Economia v3](economia-v3.md):
  - cruzadinha, Quiz e V ou M pagam 100 XP fixos (mesmo com zero acerto) + bônus de até 50;
  - no Quiz e no V ou M, o tempo é contado em segundo plano, sem aparecer na tela nem no relatório;
  - missão de login paga 25 × dias de ofensiva, sem teto; pular um dia volta o multiplicador a 1;
  - mais 4 missões por dia, de níveis 1 a 5, de 50 a 400 XP;
  - a curva de nível continua `500 × (N − 1)²`, que já é escalonada;
  - todos os modos do DDX pagam 300 XP + bônus de até 100, inclusive o Paciente DDX, que continua sem cobrar ticket e sem multiplicador por nível;
  - a Batalha paga 500 XP fixos na vitória e nada na derrota;
  - tickets nunca ficam negativos: com saldo zero, os modos do DDX que cobram ticket ficam indisponíveis.
- [Revisão Inteligente v2](revisao-inteligente.md#versão-2-decidida-em-07102026-ainda-não-implementada):
  - cartas de quatro modos (Quiz, V ou M, Erro médico e Paciente DDX), sem os erros da cruzadinha; mais de 7 erros viram mais cartas;
  - sessões de 7 itens (os erros mais itens parecidos por conceito, tema ou palavras iguais);
  - Paciente DDX entra na Revisão por erro grave, não pela nota;
  - liberada a partir do nível 10;
  - tela de revisão com as duas respostas do jogador e a explicação;
  - refazer casos do Erro médico e do Paciente DDX;
  - a explicação é escrita na hora por uma LLM gratuita (Qwen pela OpenRouter, por API), com cache e fallback para a explicação revisada.
- [App offline](app-offline.md):
  - todo o conteúdo funciona offline;
  - detecção de rede e fila que sincroniza quando a rede volta;
  - tickets do DDX consumidos offline, sem saldo negativo;
  - sessão de 15 dias sem rede.

A ordem segue as dependências:
- a economia vem antes do offline, porque o aparelho calcula o XP com os mesmos motores do servidor;
- a rota de IA e o conteúdo da Revisão podem começar em paralelo;
- a Revisão v2 vem antes do offline, porque também precisa funcionar sem rede.

### Fase 0 — Arrumação

- [ ] **Dicas de IA da cruzadinha quebradas em produção:**
  - `/api/ia` só existe no servidor local (`server/index.js`) e respondeu 404 em `https://caca-med.vercel.app` em 07/10/2026;
  - mover a chamada à OpenRouter para a Edge Function, com a chave nos segredos do Supabase;
  - a mesma rota atende a Revisão v2.
- [ ] Juntar a limpeza de CSS da outra sessão:
  - commit `4c7f0b8` na branch `claude/vigorous-vaughan-957477`, ainda não enviado;
  - remove os estilos `stitch-*` e `treino-*` sem uso e reduz `src/index.css` de 414 para 168 linhas;
  - sem diferença de estilo calculado nas telas conferidas;
  - foi feita sobre o commit `2679e9f`, antes do PWA, mas `git merge-tree` não mostrou conflito com `9a7396a` em 07/10/2026;
  - antes de juntar, conferir que `color-scheme: dark` e o fundo de `html, body` continuam em `src/index.css`.
- [ ] Apagar `src/components/ui/StitchBrand.jsx`, que não é importado, junto com os estilos `stitch-header` e `stitch-brand`, que só ele usa.

### Fase 1 — Economia v3

- [ ] Responder as 2 [perguntas em aberto](economia-v3.md#perguntas-em-aberto): limite contra abuso dos 100 XP fixos, e a tabela de missões.
- [ ] 100 XP fixos + bônus de até 50 na cruzadinha, no Quiz e no V ou M; tempo do Quiz e do V ou M medido pelo servidor, fora da tela e do relatório.
- [ ] 300 XP + bônus em Plantão, Erro médico, Causa e efeito e Paciente DDX (este sem ticket).
- [ ] Batalha: 500 XP fixos na vitória e zero na derrota.
- [ ] Bloquear os modos do DDX que cobram ticket quando o saldo é zero.
- [ ] Criar o contador de ofensiva de login, no fuso America/Sao_Paulo, e a missão de login sem teto; pular um dia volta o multiplicador a 1.
- [ ] Criar as missões de níveis 1 a 5 e o sorteio diário (níveis 1, 2 e 3, mais um de nível 4 ou 5).
- [ ] Implementar `VERSAO_ECONOMIA = 3` nos motores compartilhados, com migração sem recompensa retroativa. Partidas iniciadas na v2 terminam na v2.
- [ ] Publicar a Edge Function em versão nova e atualizar os textos de XP e tickets nas telas.
- [ ] Testes de economia, migração e idempotência; homologação com dados fictícios.

### Fase 2 — LLM e conteúdo da Revisão v2 (em paralelo à Fase 1)

- [ ] Ação na Edge Function que pede a explicação à OpenRouter (`qwen/qwen3.8-27b:free`, o modelo já usado nas dicas):
  - prompt ancorado no item, no gabarito, na explicação revisada e nas respostas do jogador;
  - sem dados pessoais e sem citar fontes.
- [ ] Cache das explicações por item, versão e escolha; fallback para a explicação revisada sem rede, sem cota ou com falha.
- [ ] Aviso "Explicação gerada por IA. Confira a fonte." e botão para reportar erro, que leva à revisão médica.
- [ ] Medir o limite da cota gratuita da OpenRouter com o cache, antes de liberar para todos.
- [ ] Conteúdo:
  - marcação de conceito para escolher itens parecidos;
  - perguntas e frases suficientes por conceito para completar sessões de 7;
  - conferir a explicação revisada dos casos do Erro médico.

### Fase 3 — Revisão Inteligente v2

- [ ] Escolher o [XP da Revisão](revisao-inteligente.md#xp-da-revisão-opções-para-o-usuário-escolher) (recomendação: XP por item dominado + missão) e confirmar a definição de erro grave.
- [ ] **Pendência registrada: itens da Batalha na Revisão.** Continuam sendo gerados e guardados, mas ficam fora das cartas até a decisão: cartas do Quiz, carta própria ou deixar de gerar.
- [ ] Liberar a Revisão a partir do nível 10 (administrador sempre), registrando os erros desde o nível 1.
- [ ] Registrar os erros do Erro médico e do Paciente DDX como itens da Revisão. No Paciente DDX, só os casos com erro grave: hipótese errada, conduta perigosa marcada ou conduta essencial esquecida.
- [ ] Marcação `grave` nas condutas do gabarito do Paciente DDX, com revisão médica.
- [ ] Tela de cartas: cada carta com o ícone do modo e a quantidade de erros; no Quiz e no V ou M, uma carta a cada 7 erros.
- [ ] Sessões de 7 itens no Quiz e no V ou M, completadas por conceito, tema e, na falta, palavras iguais; tela de revisão com as duas respostas (mostrando uma só se forem iguais), a correta e a explicação.
- [ ] Erro médico: refazer o mesmo caso e, se errar de novo, mostrar a explicação completa.
- [ ] Paciente DDX: refazer os casos errados, mostrar a revisão detalhada e indicar a fonte da biblioteca do caso.
- [ ] Manter a repetição espaçada (1, 3 e 7 dias; teto de duas por semana) para todos os modos.

### Fase 4 — App offline

- [ ] Detecção de rede, fila em IndexedDB e ação `sincronizarFila` idempotente na Edge Function, começando pelo Quiz.
- [ ] Pacote de conteúdo versionado no aparelho, incluindo o cache das explicações da LLM, medindo o tamanho antes de escolher entre baixar tudo de uma vez ou por modo.
- [ ] V ou M e Revisão offline; depois a cruzadinha (sem dicas de IA offline); depois o DDX.
- [ ] Tickets do DDX offline:
  - saldo local igual ao confirmado menos os consumos na fila, sem contar ganhos provisórios;
  - bloqueio com saldo zero;
  - recusa da admissão que chegar ao servidor com saldo zero, sem saldo negativo.
- [ ] Sessão válida por 15 dias sem rede; fila presa ao UID; aviso ao sair com itens pendentes.
- [ ] Regras de data e de conflito entre aparelhos; pedir armazenamento persistente.

### Fase 5 — Validação e publicação

- [ ] Testes automatizados de fila, ordem, reenvio, recusa, saldo e datas.
- [ ] iPhone e Android reais: modo avião, partidas de todos os modos, rede de volta, sincronização com o app aberto e com o app fechado.
- [ ] Publicar a Edge Function e o frontend; registrar deploy e rollback.

### Pendências anteriores que continuam

- Testar em aparelho físico e rede celular ([roteiro](roteiro-smartphone.md)), inclusive a instalação do app e o login com conta real.
- SMTP público, vínculo do segundo perfil e a ponte Firebase (ver o bloco de 30/09 abaixo).
- Revisão clínica de Batalha, Paciente DDX e dos casos do DDX.

## Estado atual — 30/09/2026, produção Supabase

Este bloco substitui pendências históricas abaixo. Produção Vercel ativada com fonte e autenticação Supabase; login Google no domínio público validado pelo agente e pelo usuário.

- [x] Reconciliação final: dois perfis integralmente iguais, 35 respostas, quatro revisões e 16 recibos presentes sem divergências; nenhuma importação adicional necessária.
- [x] Medição pública de leituras: lotes de 1/10/25/50/100 chamadas simultâneas, zero falhas; evidências e limites no [relatório](reconciliacao-producao-2026-09-30.md).
- [x] Login em viewport de 360/390 px sem transbordamento horizontal.
- [x] Instrumentar abertura completa e chamadas API com diagnóstico opcional local. Build otimizada em desktop: primeira abertura autenticada 2.006 ms, recarga 1.968 ms; medição pública e celular ainda necessários.
- [x] Homologar gravações autenticadas concorrentes no perfil isolado: 2/5/10 reenvios do mesmo recibo e cinco da resposta final do Quiz, sem recompensa duplicada. API v10 e RPC PT409 corrigem timeout e resposta desatualizada.
- [x] Homologação completa dos seis modos: 48 chamadas, média 415 ms, p95 572 ms, perfil real preservado; 88 testes/lint/build aprovados.
- [x] Deploy frontend 297fdb7 validado no domínio público; três recargas autenticadas até menu em 937/511/508 ms, sem falhas; Google e logout conferidos. Configuração versionada restaura deploy automático desativado para próximos pushes.
- [ ] Testar aparelho físico/rede celular seguindo [roteiro](roteiro-smartphone.md); carga sustentada de usuários distintos requer contas de teste adicionais.
- [ ] Configurar SMTP público após escolher domínio: [proposta Resend Free](proposta-email-autenticacao.md); padrão atual só envia à equipe, dois emails/hora.
- [ ] Concluir vínculo do segundo perfil e migração/teste de senhas antigas, cadastro, recuperação e logout públicos.
- [x] Definir retirada do Firebase por critérios: concluir as validações, observar sete dias estáveis e retirar fallback antes de desligar o serviço. Ponte mantida porque há conta não vinculada e senha ainda não migrada.

Revisão clínica, Batalha diagnóstica e mobile Expo continuam na sequência. Não tratar as medições HTTP como aprovação de desempenho em celular real.

[Relatório final, falhas reproduzidas e correções](homologacao-final-2026-09-30.md). Ponte Firebase permanece até as provas de identidade/senha e a janela de homologação; não há data automática de desligamento.

## Estado atual em 28/09/2026 — Revisão inteligente

Implementada como piloto para administrador: gratuita, até cinco itens dos próprios erros de Quiz/Verdade ou mentira, feedback e fontes, retomada, encerramento parcial e agendamento 1/3/7 dias com teto de duas revisões por item em sete dias. Não concede XP/tickets nem modifica missões. Histórico privado em `RevisoesTreino`, isolado por autenticação. Reset reinicia a fila sem apagar a auditoria. [Decisões e roteiro do piloto](revisao-inteligente.md).

72 testes, lint e build passaram. Navegador com dados fictícios confirmou sessão mista 4/5, falha após gravação, reenvio/recarga sem duplicar, retorno apenas do erro e limite semanal; XP 490 e saldo zero preservados. Motor gerado coberto por teste de equivalência. API versão 19 publicada às 23:24, mesma URL e permissões; Código.gs e Treinos.gs conferidos integralmente com as fontes locais.

Quiz e Verdade ou mentira já foram validados pelo usuário e liberados na API versão 18. Frontend atualizado permanece local; próxima parada é validar a revisão autenticada antes de liberar para jogadores e publicar no Vercel. Deploy automático continua desativado. Nenhum dado real foi alterado para os testes. As seções seguintes registram o histórico de entregas anteriores.

## Retomada em 28/09/2026 — novos jogos e economia v2

Quiz (Teoria e Casos clínicos) e Verdade ou mentira implementados, com salvamento por resposta, explicações/fontes, retomada, relatórios, estatísticas e registro permanente para revisão futura. Economia central: nível global pelo XP total, dois tickets por cruzadinha, um a cada duas rodadas válidas de cada novo modo, um por missão e N por novo nível N. Migração preserva saldos, sem bônus retroativos. [Decisões e roteiro completo](jogos-e-economia-v2.md).

60 testes passaram; lint sem erros e build concluída. Navegador validou interface com serviço isolado: Quiz Teoria 4/5, Casos 5/5, Verdade ou mentira 3/5, 5/5 e 0/5, contadores de tickets, missões, nível e recarga. Login Google não concluiu neste navegador; validação autenticada dos novos jogos com dados reais permanece pendente. Nenhum saldo real foi alterado para testar.

Correção posterior do Quiz publicada na versão 17: comparação por conteúdo elimina falso conflito por ordem dos campos. Duas rodadas 5/5 e recarga passaram na homologação com reordenação de objetos. A versão 16 corrigiu trabalho redundante e revelou o erro, mas não resolveu o conflito. [Registro das tentativas, causa reproduzida e prevenção](incidente-quiz-rodada-mudou.md).

API publicada na versão 15 da implantação existente, preservando URL e permissões. Frontend em localhost:5173; Vercel, liberação para jogadores comuns e validação de conteúdo aguardam o usuário. Deploy automático permanece desativado. Revisão inteligente fica para a última fase; respostas já ficam registradas.

## Retomada em 28/09/2026 — Causa e efeito

28/09 às 12:07: backend versão 13 publicado na mesma implantação, autorizando localhost e 127.0.0.1 nas portas 5173 e 5174. Domínio https://caca-med.vercel.app já estava permitido e foi preservado sem barra final. 46 testes e lint passaram, incluindo aceitação das origens previstas e rejeição de 5175 e domínio desconhecido. GET da ponte publicada confirmou resposta HTML nas origens 5174 e Vercel. Isso resolve a recusa por origem 5174; não elimina falhas transitórias de rede.

Homologação real dos três modos: conexão, login, catálogo, restrição de revisão clínica e navegação para Plantão, Erro médico e Causa e efeito conferidos no navegador. A partida completa de Causa e efeito permanece pendente porque o perfil admin está com zero tickets; o saldo não foi alterado artificialmente. Testes automatizados cobrem início, retomada, cobrança única, reenvio, respostas inválidas, repetição sem XP e recuperação de ranking.

Parecer de conteúdo: os três pilotos têm escopo claro, fontes e gabaritos determinísticos; as alternativas evitam tratar desfecho desconhecido como prova de erro e evitam prometer segurança clínica a partir de um único sinal. O ponto que ainda exige validação externa é a revisão médica formal dos gabaritos e da redação, especialmente as relações fisiológicas de Causa e efeito. A aprovação de gameplay do usuário não substitui essa revisão clínica.

Conexão local: usuário relatou timeout de abertura da ponte sem mensagens no console. A tentativa pelo botão carregou o perfil admin (5.322 XP, zero tickets); GET da ponte publicada retornou HTTP 200 com motor Causa e efeito disponível e origem localhost autorizada. A causa da intermitência não foi identificada. Frontend agora recria a ponte uma vez após falha de abertura, antes de enviar qualquer pedido, e registra aviso sem tokens no console. A mensagem final deixa de atribuir a falha à URL autorizada sem evidência.

Usuário aprovou o caso respiratório compartilhado, quatro etapas (mecanismo, consequência, compensação e intervenção), um ticket e 25 XP por acerto, até 100 XP somente na primeira conclusão por versão. Implementados motor, salvamento por etapa, retomada, relatório e estatísticas próprios em `causaEfeito`. Admin pode validar; jogadores comuns permanecem bloqueados até revisão clínica independente e aprovação do caso-base.

Backend versão 13 publicado às 12:07 na implantação existente; editor remoto comparado integralmente com API e motor locais. 46 testes, lint e build passaram. Frontend em localhost; publicação Vercel permanece pendente. Validação real autenticada depende de login admin, solicitado ao usuário. As seções anteriores descrevem o histórico; o estado atual dos três modos está nos roteiros `ddx-plantao-medico.md`, `ddx-erro-medico.md` e `ddx-causa-efeito.md`.

Decisões técnicas: gabarito próprio revisável; uma confirmação salva por etapa; sequência causal como alternativa completa; nenhuma recompensa de tempo; desempenho separado dos demais modos; mesmas proteções contra reenvio, alteração de respostas e duplicação de XP. O saldo real de tickets não foi modificado para viabilizar testes.

## Implantação DDX — retomada após desligamento em 27/09/2026

- [x] Remover Hardcore e o antigo fluxo DDX da navegação e do código ativo; arquivos antigos removidos permanecem recuperáveis no Git.
- [x] Implementar Plantão médico determinístico: avaliação, anamnese, exame físico, exames, hipótese, conduta, reavaliação, encerramento e relatório.
- [x] Implementar contrato local Apps Script para ticket idempotente, retomada, pontuação calculada no servidor e repetição sem novo XP.
- [x] Integrar perfil, estatísticas e nível global à informação DDX da planilha.
- [x] Documentar decisões, publicação e roteiro em `docs/ddx-plantao-medico.md`.
- [x] Verificação após recuperação: 36 testes passaram, ESLint sem erros e build concluída. Inclui resposta perdida no ranking do Plantão sem duplicar recompensa; permanece aviso de bundle acima de 500 kB.
- [x] Conferir Código.gs e Plantao.gs no editor: ambos coincidem integralmente com os arquivos locais (comparação SHA-256 após normalizar quebras de linha). Gerenciar implantações confirmou versão 9, de 27/09/2026 às 22:50, descrição "Plantão medico sem IA", na mesma URL e com as permissões existentes.
- [x] Retomada nesta sessão: 36 testes e ESLint passaram; build Vite concluída após liberar escrita na pasta do projeto. GET público da nova temporada retornou HTTP 200 com ranking; isso confirma disponibilidade, mas não comprova a versão do motor Plantão.
- [x] Frontend local iniciado em `http://localhost:5173/`; tela de login carregou no navegador integrado.
- [x] Usuário abriu sessão e editor Apps Script no navegador integrado; projeto conferido em `1LXJXeYi9wTav0XFwozJuqFbp0EZ6XPM2QZbkOri8QwDyPtfdxpzKuNQd`.
- [x] Ampliar espera inicial da ponte de 15 para 60 segundos. Após a alteração, o perfil carregou no navegador integrado e novamente após recarregar; chamadas de início, salvamento, reavaliação e encerramento funcionaram. O usuário havia relatado o timeout também no Chrome. A causa exata da intermitência anterior não foi determinada; estabilidade no Chrome após a alteração ainda precisa de confirmação.
- [x] Validar uma partida real do piloto com admin e backend versão 9: tickets 3 → 2, retomada sem nova cobrança, seis ações salvas preservadas após recarregar, atendimento seguro sem omissões e 250 XP confirmados. Menu mostrou XP 4.972 → 5.222 e um plantão seguro. Repetição, falhas de escrita e bloqueio de conta comum continuam cobertos pelos testes automatizados; esses cenários não foram repetidos com contas reais nesta rodada.
- [ ] Revisar clinicamente o caso respiratório piloto com a consultora; acesso continua exclusivo do admin.
- [ ] Validar visualmente e executar o roteiro de ponta a ponta com o backend publicado.
- [ ] Encerrar a entrega do Plantão médico antes de iniciar Erro médico e Causa e efeito.

O fechamento web anterior continua válido para cruzadinhas. A nova entrega DDX não foi homologada nem publicada. Não houve ativação de plano pago.

## Estado atual — 27/09/2026 — versão web homologada

A versão web padrão está homologada. Cruzadinhas, tutorial, missões, perfil, estatísticas e ranking usam a nova temporada na planilha via Apps Script **versão 8** quando `VITE_FONTE_DADOS=planilha`; Firebase Authentication permanece para login. O produto seguirá com um único modo de casos, chamado DDX. Hardcore será removido e a IA será desvinculada do modo antes da escolha e implementação dos novos jogos.

- [x] Corrigir geração, feedback e relatório das cruzadinhas; criar controles admin no FAB e validar seu funcionamento básico com o usuário.
- [x] Tratar CSV com campos citados e quebras de linha; exibir carregamento, vazio e falha com nova tentativa.
- [x] Evitar retorno tardio de perfil após troca de sessão; oferecer nova tentativa de carregar perfil.
- [x] Alinhar nível 0 do perfil ao ranking, impedir reutilizar a senha atual e ocultar troca de senha em conta somente Google.
- [x] Ranking em modo planilha sem espera de sincronização legada, com botão de nova tentativa após erro.
- [x] Diálogo de senha identificado para leitores de tela, foco inicial no campo atual e fechamento por Esc; limpeza de comentários obsoletos sem alterar as regras do jogo.
- [x] Verificação local de 28 testes automatizados, ESLint sem erros e build Vite concluída em 27/09/2026. A build ainda aponta pacote JavaScript acima de 500 kB, sem falha de compilação; otimização de bundle fica após a homologação funcional.
- [x] O usuário aceitou os testes de cadastro/login, tutorial, geração de grade, abandono, recompensa, perfil, ranking, FAB e responsividade. A conta de teste já tinha perfil e, por isso, abriu o menu em vez de repetir o Cadastro 2.0.
- [x] Cadastro 2.0 de conta Google inédita cria também credencial de e-mail/senha no Firebase Authentication, sem guardar senha na planilha. Contas Google com perfil anterior recebem **Criar Senha** no Perfil. Contas antigas que já têm senha mantêm a credencial atual.
- [x] Gerador da cruzadinha passou de meta 10 para 12 palavras e tenta até 20 termos por ordem numa matriz ampliada. Teste automatizado com oito sementes de um tópico respiratório sintético passou; conteúdo real ainda precisa ser conferido no nível 2.
- [x] O usuário confirmou a revalidação do login comum e da geração das grades de Sistema Respiratório após as correções.
- [x] Reaberta a falha C11 após o usuário relatar que a letra repetida da interseção caía na próxima casa vazia. O input agora guarda as casas preenchidas puladas, aceita a repetição sem gravá-la de novo e permite substituir a letra de uma casa preenchida selecionada diretamente. Teste automatizado cobre os três casos.
- [x] Usuário validou em partida real a repetição da letra numa interseção, sem deslocar a próxima letra.
- [x] Apps Script versão 8 publicado na implantação existente: GET público usa `RankingNovaTemporada` por padrão, a sincronização legada é rejeitada e `https://caca-med.vercel.app` está entre as origens permitidas (sem barra final). Após atualizar a implantação, o perfil carregou no Centro de Comando da versão publicada em 27/09/2026.
- [x] Removida somente a aba legada `Ranking` da planilha autorizada; `PerfisGoogle`, `RankingNovaTemporada` e `Partidas` permanecem.
- [x] Simulação automatizada de resposta perdida após gravar perfil, ranking ou recibo: o reenvio da mesma partida mantém XP, missões, tickets e contadores sem duplicação (29 testes). A tela agora distingue prévia de recompensa confirmada e orienta a manter o relatório aberto após erro.
- [x] Usuário validou no Chrome uma falha de rede real no salvamento e o reenvio pelo botão da tela de resultado, sem duplicação relatada.
- [x] Auditoria estrutural do CSV público em 27/09: HTTP 200, 1.940 linhas contando o cabeçalho, 1.937 entradas jogáveis em 28 tópicos, nenhuma dica vazia ou linha com quantidade de campos incorreta. `T` e `B` (linhas 1423–1424) são ignorados por terem uma letra; Histologia–Matriz tem apenas 10 termos, abaixo da meta de 12. Seis respostas se repetem em Patologia–Doenças: ISQUEMIA (1523/1668), CANDIDIASE (1574/1773), BÓCIO (1588/1837), HIPERPLASIA (1655/1685), ADENOCARCINOMA (1656/1748), RABDOMIÓLISE (1681/1821). Não foi alterada nenhuma outra planilha.
- [x] Importador agora preserva somente a primeira ocorrência de cada resposta normalizada por tópico. As seis duplicatas exatas do CSV público deixam de entrar no jogo, sem editar a planilha de origem; o banco passa a ter 1.931 entradas jogáveis distintas na leitura atual.
- [ ] Revisão clínica das dicas e respostas pelo usuário. O tópico Histologia–Matriz tem 10 termos; manter a meta limitada ao disponível até que o usuário decida adicionar conteúdo. Auditoria estrutural não confirma correção médica.
- [x] Incluir domínio de produção em `ORIGENS_APP`, atualizar a implantação do Apps Script e restaurar carregamento do perfil no Vercel; erro de origem fazia a ponte aguardar 60 segundos e mostrar timeout.
- [x] Homologar no endereço publicado login a partir de sessão encerrada, salvamento de perfil, conclusão de partida e ranking. O usuário confirmou que todos os fluxos ocorreram como esperado após a correção da ponte HTML.
- [x] Após confirmação específica, a coleção Firestore `usuarios` foi excluída permanentemente; o console mostrou o banco vazio. As contas no Firebase Authentication foram mantidas. A remoção da aba `Ranking` também é permanente; as três abas atuais foram preservadas.
- [x] Publicação web final homologada. A revisão clínica de dicas e respostas permanece como manutenção de conteúdo; DDX, Hardcore e IA seguem para fase separada.

### Fechamento da versão web

Em 27/09/2026, o usuário confirmou a homologação dos fluxos web padrão: autenticação, Cadastro 2.0, tutorial, geração e preenchimento de cruzadinhas, interseções, relatório pós-partida, XP, missões, tickets, perfil, estatísticas, ranking global, conta admin, conta comum, responsividade, acessibilidade básica, reenvio após falha e persistência na planilha. A ponte Apps Script/Vercel também foi validada após a correção da origem de produção e da reutilização da conexão.

Próxima fase: simplificar o DDX, remover Hardcore e desvincular a IA; depois escolher e implementar os novos jogos com a consultora.

### Nova direção do modo de casos — decisão de 27/09/2026

- [x] Decidir a unificação do DDX e Hardcore em uma seção DDX; implementação ainda pendente.
- [ ] Remover do código, navegação, estatísticas, recompensas, textos e documentação tudo que for específico do Hardcore.
- [ ] Mapear e remover a dependência obrigatória da IA no DDX, preservando o funcionamento do modo sem chamadas ao OpenRouter.
- [ ] Definir o novo contrato do DDX sem IA: seleção de sistema, estrutura de partida, tipos de pergunta, pontuação, tickets, XP e relatório.
- [x] Escolher os três formatos e seus nomes: **Plantão médico**, **Erro médico** e **Causa e efeito**.
- [ ] Implementar os jogos escolhidos dentro do DDX e atualizar tutorial, estatísticas, missões e ranking.
- [ ] Homologar o DDX reformulado antes de reabrir qualquer modo clínico adicional.

### Implantação da nova seção DDX

Os três modos compartilham uma base de casos roteirizados e revisados, separados por sistema, sem IA em tempo de execução. Respostas, resultados e consequências devem estar cadastrados; cada modo mantém fluxo e desempenho próprios. Os nomes definitivos são Plantão médico, Erro médico e Causa e efeito.

1. **Plantão médico (primeira entrega):** acompanhar o paciente desde a chegada até o encerramento; escolher perguntas, exame físico, exames complementares, hipóteses e condutas; acompanhar evolução e reavaliar. Prontuário e linha do tempo registram informações descobertas e decisões. Relatório explica acertos, omissões e consequências. A evolução é roteirizada e não exige esperar vários minutos por exames reais.
2. **Erro médico (segunda entrega):** analisar um atendimento já realizado; identificar falhas ou omissões, justificar o problema e escolher a correção. Usar versões próprias dos atendimentos, sem presumir que todo resultado desfavorável comprova erro.
3. **Causa e efeito (terceira entrega):** interpretar mecanismos fisiológicos, respostas compensatórias e efeitos de intervenções em situações clínicas; responder relações e sequências com gabarito previamente revisado.

- [ ] Definir com o usuário o primeiro sistema/caso, a cobrança de tickets e as recompensas reais. Essas escolhas ainda não foram aprovadas; a economia antiga não é uma especificação do novo modo.
- [ ] Remover o Hardcore e substituir os fluxos DDX antigos; eliminar chamadas de IA da experiência clínica e referências específicas do Hardcore.
- [ ] Criar contrato de conteúdo compartilhado com IDs, versões, fontes, respostas, ações, consequências, explicações e estado de revisão clínica.
- [ ] Implementar motor determinístico do Plantão médico e interface com prontuário, ações, evolução, confirmação de abandono e relatório.
- [ ] Integrar progresso e recompensas à planilha/Apps Script com recibos idempotentes e reenvio após falha. O serviço antigo de tickets DDX usa Firestore e precisa ser substituído.
- [ ] Verificar motor, ramificações, permissões e recompensas com testes relevantes; conferir teclado, foco, desktop/notebook e ausência de chamadas de IA.
- [ ] Entregar um Plantão médico completo e roteiro de validação antes de iniciar Erro médico.
- [ ] Implementar e entregar Erro médico; depois implementar e entregar Causa e efeito.

Regra de execução: continuar até concluir um modo completo ou encontrar uma decisão necessária do usuário. O redesign web/mobile será planejado sobre os fluxos definidos, seguindo a paleta aprovada.

Data da revisão: 24/09/2026. Base: arquivos locais e histórico até `81cad1e`.

Este documento é o roteiro de trabalho para recuperar o ambiente, corrigir o jogo e implementar o layout parcialmente criado no Google Stitch. As caixas representam trabalho futuro, não correções já executadas.

## Direção atual (24/09/2026)

Atualização da correção C13: gerador compara até 20 ordens da mesma seleção de palavras, pontua encaixes por cruzamentos e área ocupada e escolhe a grade priorizando o número de entradas. Retorna métricas de palavras, cruzamentos, largura, altura, área e densidade. O feedback mais recente do usuário confirmou que não havia palavras isoladas; o problema é a distribuição espalhada e os corredores vazios. Compactação implementada, ainda aguardando avaliação visual de três novas partidas no mesmo tópico.

Validação revisada: letras recebem feedback imediato (menta para correta, âmbar para letra presente em outra posição, vermelho para incorreta). A conclusão continua dependente do preenchimento correto da grade. Uma combinação casa/letra errada é contada uma vez por partida, sem nova penalidade ao apagar e repetir a mesma tentativa e sem somar novamente um erro de palavra. Nove testes e build passaram; lint permanece com zero erros e quatro avisos existentes.

- Prioridade de experiência: tela web padrão em desktop/notebook. Responsividade para outros tamanhos fica após a homologação desse fluxo.
- Cruzadinhas: partidas interrompidas são descartadas; não haverá retomada automática.
- Ranking: público e global. A consulta ainda precisa limitar os dados expostos aos campos públicos necessários.
- DDX, Hardcore e integrações de IA: reformulação posterior; não usar o cronograma antigo desses modos como especificação definitiva.
- Etapa em execução: corrigir grade, digitação, validação e onboarding da cruzadinha; depois verificar o fluxo completo, lint, acessibilidade e limpeza gradual.

## Escopo e limites da revisão

Revisão estática dos fluxos de autenticação, dados, cruzadinhas, DDX, Hardcore, perfil, ranking, estilos e configuração. Build e lint tentados na leitura inicial não executaram porque as dependências locais estão ausentes. Não foram acessados Firebase, Gemini, planilha publicada nem Stitch. Não foi feita validação clínica dos casos ou auditoria de dependências instaladas.

O inventário reúne os problemas identificados nesta revisão; testes em execução podem revelar outros. **C** significa comportamento ou ausência confirmado no código; **R** significa risco inferido que precisa de reprodução; **V** significa verificação externa pendente. P0 bloqueia uma publicação segura; P1 compromete funcionamento ou progresso; P2 compromete consistência/manutenção; P3 é acabamento. Prioridade não significa que um incidente já ocorreu.

## Arquitetura observada

- React 19, Vite 8, Tailwind 4, Framer Motion, Lucide, Firebase e Gemini.
- `App.jsx` controla telas por estado, sessão, documento do usuário e importação do CSV.
- Cruzadinhas: CSV público → normalização → `motorTabuleiro.js` → `Jogo.jsx`/`Tabuleiro.jsx` → recompensa e Firestore.
- DDX acessível pelo menu: `SelecaoDDX.jsx` desconta ticket e sorteia `data/casos.json`; Gemini processa os turnos. A geração House dinâmica é um caminho alternativo, não o fluxo padrão atual.
- Hardcore: caso gerado por `services/geradorCasos.js`, turnos via Gemini e relatório final.
- Perfil, ranking e estatísticas compartilham dados com formatos e fórmulas parcialmente duplicados.

## Inventário de problemas

### Ambiente, segurança e acesso

| ID | Prioridade / evidência | Problema e localização | Ação prevista |
|---|---|---|---|
| A01 | P1 · C | Sem `node_modules` e sem `.env` na raiz; build/lint não executam e configuração Firebase/Gemini está ausente. | Restaurar ambiente a partir do lockfile e credenciais fornecidas por canal adequado. |
| A02 | P2 · C | README padrão, sem `.env.example`, versão de Node definida ou guia de recuperação. | Documentar instalação, variáveis sem valores reais, comandos e arquitetura. |
| A03 | P0 · C | Chave Gemini literal em `src/utils/motorDDX.js`, aparentemente legado sem importadores ativos. | Revogar/rotacionar a chave no provedor; remover literal e avaliar exposição no histórico. Não reproduzir a chave em documentação. |
| A04 | P0 · C | Chamadas Gemini em componentes e serviço usam chave `VITE_*`, entregue ao navegador. | Introduzir serviço autenticado no servidor com segredo, cotas e validação; somente mover para `.env` não protege uma chave do frontend. |
| A05 | P0 · V | Não há regras Firestore/Storage nem configuração de emuladores versionadas. Regras efetivas da nuvem desconhecidas. | Obter e auditar regras reais; versionar e testar isolamento entre usuários. |
| A06 | P0 · C/R | XP, tickets e resultados são calculados e gravados pelo cliente; integridade competitiva depende de regras externas não verificadas. | Tornar conclusão de partidas e recompensas autoritativas no servidor, com identificador único. |
| A07 | P1 · C/V | `Ranking.jsx` lê documentos inteiros de `usuarios`, que contêm e-mail. Se as regras permitem a consulta, o cliente recebe também campos privados. | Criar projeção pública mínima de ranking e verificar permissões reais. |
| A08 | P2 · C | `firebase.js` imprime configuração; Hardcore imprime caso completo com gabarito. | Remover logs desnecessários e ocultar gabaritos do cliente na arquitetura competitiva. Configuração pública Firebase não equivale, por si, a segredo administrativo. |
| A09 | P2 · C | `.gitignore` ignora `.env`, mas não todos os variantes como `.env.production`. | Definir padrão para arquivos de segredo, preservando `.env.example`. |
| A10 | P1 · C | Recuperação de senha em `Login.jsx` só executa `setForgotSent(true)`; nenhum e-mail é enviado. | Integrar recuperação real e estados de envio/erro. |
| A11 | P1 · R | Cadastro cria Auth antes do documento; observador em `App.jsx` pode buscar perfil ainda inexistente. | Coordenar criação/carregamento e recuperar conta sem documento. |
| A12 | P1 · C | Leitura inicial do Firestore sem tratamento de falha; perfil ausente não recebe recuperação explícita. | Estados de erro, nova tentativa e perfil incompleto; finalizar loading mesmo em falha. |

### Persistência e progressão

| ID | Prioridade / evidência | Problema e localização | Ação prevista |
|---|---|---|---|
| D01 | P1 · C | `Jogo.jsx` guarda XP em memória e só grava em `avancarParaProximoNivel`; voltar aos tópicos ou recarregar após vitória perde prêmio. | Salvar conclusão antes de liberar navegação, sem regenerar o tabuleiro ao atualizar XP. |
| D02 | P1 · C | Se salvar XP falha, a próxima fase limpa `xpPendente` mesmo assim. | Preservar pendência e permitir nova tentativa sem duplicar prêmio. |
| D03 | P1 · C/R | `salvarDadosUsuario` absorve erros; DDX/Hardcore marcam estatísticas salvas antes da confirmação e não aguardam resultado. | Propagar falha e confirmar persistência antes do estado de sucesso. |
| D04 | P1 · R | XP/tickets/estatísticas são sobrescritos com snapshots locais; concorrência entre abas pode perder atualizações. | Transações/atualizações atômicas e conclusão idempotente. |
| D05 | P1 · C | `vencer_ddx` e `jogar_hardcore` existem no banco de missões, mas seus modos não atualizam missões. | Centralizar eventos de progresso e recompensas. |
| D06 | P1 · C | Cadastro usa objeto de missões, `App` usa array e perfil procura `.streak` no objeto antigo. | Modelo único versionado com migração compatível. |
| D07 | P1 · R | Reset diário concede bônus também quando quantidade de missões difere de três; catch devolve XP local mesmo se gravação falha. | Reset transacional e uma concessão por dia, com estado consistente. |
| D08 | P2 · C | Datas locais `pt-BR` e UTC via `toISOString` coexistem em missões/histórico. | Escolher fuso de negócio e chave de dia única. |
| D09 | P1 · C/R | Ticket debitado antes da partida; reembolso só cobre falhas na seleção e pode falhar sem tratamento. Não cobre erros posteriores da IA. | Reserva/consumo/reembolso por partida, sem restaurar saldo antigo inteiro. |
| D10 | P2 · C | `estatisticas` mistura subobjetos de cruzadinha e contadores DDX/Hardcore; modos clínicos compartilham totais. | Separar namespaces por modo e preservar dados existentes na migração. |
| D11 | P2 · C | Perfil mostra vitórias DDX fixas em zero, plantões pelo histórico limitado a 30 e streak no campo incompatível. | Ligar cartões a contadores reais e definir significado das métricas. |
| D12 | P1 · C | Ranking compara `dadosUsuario.uid`, mas cadastro não grava UID e `App` não o injeta ao ler o documento. | Carregar identidade canônica junto do perfil. |
| D13 | P2 · C | Menu nunca recebe `top3Semana`; exibe Dr.A/Dr.B/Dr.C como fallback. | Implementar período e dados reais ou estado vazio claramente identificado. |
| D14 | P2 · C | Nível global soma níveis dos tópicos, barra usa XP total módulo 1000; fórmulas/patentes duplicadas. DDX dá XP sem elevar níveis de tópicos. | Definir regra de produto, centralizar cálculo e alinhar rótulos/barras. |
| D15 | P2 · C/R | Ranking busca toda coleção e ordena no cliente; erro resulta em lista vazia sem distinção. | Consulta limitada/paginada, ordenação adequada e erro recuperável. |

### Cruzadinhas e conteúdo

| ID | Prioridade / evidência | Problema e localização | Ação prevista |
|---|---|---|---|
| C01 | P1 · C | Falha ao carregar CSV mantém `bancoDePalavras` nulo e bloqueia todas as telas autenticadas, inclusive modos independentes. | Carregamento isolado da cruzadinha, retry e fallback definido. |
| C02 | P1 · C | CSV separado por linha/regex, sem validação HTTP; aspas não são removidas consistentemente da palavra e categorias. | Parser CSV robusto, contrato de colunas e normalização compartilhada. |
| C03 | P1 · R | Seleção oferece tópicos fixos sem consultar disponibilidade; tópico ausente produz grade vazia sem início da partida. | Desabilitar tópicos sem conteúdo e oferecer saída/estado vazio. |
| C04 | P1 · C | Botão de autocompletar preenche respostas e segue fluxo normal de recompensa. | Restringir ferramenta ao desenvolvimento ou treino sem recompensa. |
| C05 | P1 · R | Motor permite sobreposição na mesma direção e não valida adjacências/inícios/finais; metadados podem ser sobrescritos. | Definir invariantes de cruzadinha e verificar grades com sementes reproduzíveis. |
| C06 | P2 · C | Número de palavras é contado por células numeradas; dois inícios na mesma célula contam uma vez. | Contar entradas horizontais e verticais separadamente para XP/missões/tempo. |
| C07 | P2 · C | Se há menos de seis palavras elegíveis, motor usa todas as dificuldades; palavras sem encaixe são descartadas. | Definir mínimo de conteúdo e fallback que respeite a progressão. |
| C08 | P2 · C | Censura de resposta aplicada às dicas estáticas, mas não às geradas por IA; termo composto não é bem coberto pelo filtro por palavra. | Validar dicas geradas e testar termos compostos/radicais. |
| C09 | P2 · R | Geração aleatória dentro de `useMemo` e efeitos assíncronos sem cancelamento podem trocar grade/dicas ou duplicar chamadas, especialmente em StrictMode. | Identidade de partida, seed, cancelamento e descarte de respostas antigas. |
| C10 | P1 · C | Itens 8 e 10 exigem a mesma resposta (`TÁLUS`), mas a grade/layout atual não representa corretamente os dois espaços; a palavra não pode ser preenchida e validada simultaneamente. | Corrigir a construção da grade e os metadados de entradas para permitir respostas iguais em posições distintas, preservando cruzamentos e validação independente. |
| C11 | P1 · C | Ao digitar em uma palavra que cruza uma letra já preenchida, o foco/cursor trava e exige clique manual no próximo quadrado vazio. | Corrigir a navegação automática entre células, pulando células ocupadas quando necessário e mantendo a direção ativa após interseções. |
| C12 | P1 · C | Validação acusa falso negativo durante o preenchimento parcial; no item 2, `ATLAS` é marcada como errada assim que a letra inicial `A` é digitada. | Separar estado parcial de resposta incorreta e validar a palavra somente quando completa, sem marcar prefixos válidos como erro. |
| C13 | P1 · C | As grades geradas têm poucas interseções e muitas palavras ficam isoladas; o tabuleiro ocupa uma área grande, reduz a densidade visual e prejudica a jogabilidade. | Melhorar a seleção e o encaixe para priorizar grades compactas e com mais cruzamentos, sem sobreposição inválida ou perda de entradas. Medir densidade e bounding box. |

### Simuladores e IA

| ID | Prioridade / evidência | Problema e localização | Ação prevista |
|---|---|---|---|
| I01 | P1 · C | JSON de geração/turnos não passa por schema; campos, valores e estados são aceitos parcialmente ou acessados diretamente. | Contratos e validação de entrada/saída, limites e fallback. |
| I02 | P1 · C | Chamadas dispersas sem política comum de timeout, cancelamento, retry ou tratamento de quota. | Serviço único com erros classificados e repetição limitada. |
| I03 | P1 · R | Timers continuam durante chamadas; respostas tardias podem alterar partida já perdida. Trava por estado não assegura gravação única. | Estado terminal definitivo, token de requisição e conclusão idempotente. |
| I04 | P1 · C | Hardcore abre relatório sem sair de `playing`; tempo continua correndo durante preenchimento e avaliação. | Estado próprio de avaliação e regra explícita de cronômetro. |
| I05 | P1 · C | Bônus de 60 segundos no Hardcore pode ocorrer toda vez que IA retorna `estabilizou_iatrogenia`. | Registrar estabilização consumida e conceder bônus uma única vez. |
| I06 | P1 · C | Prompt Hardcore manda vencer ao reverter erro e também exige depois curar doença; pedir exame é descrito como morte imediata e como piora. | Unificar regras com briefing, estados e resultado final. |
| I07 | P1 · C | Caminho House descarta `mecanicas_ocultas`; pergunta de anamnese vira “Exame Ouro”; três condições de vitória não são controladas explicitamente. | Preservar blueprint e acompanhar condições de vitória como estado. |
| I08 | P1 · R | `casoPreCarregado || {}` cria nova referência quando ausente; efeito depende dela e atualiza estado, podendo repetir geração no caminho dinâmico. | Referência estável e inicialização vinculada à partida. |
| I09 | P1 · C | Erro na geração House mantém `gameState='loading'`; tela de loading oculta mensagem de falha. | Estado de erro com tentar novamente/voltar. |
| I10 | P2 · C | Passivas e custo de equipe anunciados na seleção não são aplicados como regras: prompt de turno envia nomes; não debita custo de House. | Especificar habilidades/custos e implementar ou ajustar descrição. |
| I11 | P1 · C/R | Ação livre é interpolada no mesmo prompt das regras e IA decide resultado; manipulação de instruções pode adulterar avaliação. | Separar dados/instruções, validar resultado e manter regras competitivas no servidor. |
| I12 | P2 · C | Turno não inclui integralmente HMA/paciente; House começa com relato truncado, caso local só com entrada/queixa no chat. | Enviar contexto clínico estruturado persistente em todos os turnos. |
| I13 | P2 · C | Tempo estatístico começa antes de fechar briefing; cronômetro visível começa depois. | Uma referência de tempo ativo e regra para pausas/latência. |
| I14 | P2 · C | `opcoesIniciais` dos casos locais não é usado; residente exige chamada extra para opções. | Usar opções validadas ou remover campo obsoleto após decisão. |
| I15 | P1 · V | Casos locais/prompts não apresentam revisão clínica, fontes ou versão de conteúdo; probabilidades descritas em prompt não são garantidas por código. | Revisão por responsável clínico e rastreabilidade; definir o que precisa ser sorteio determinístico. Não presumir precisão clínica por JSON válido. |

### Layout, acessibilidade e manutenção

| ID | Prioridade / evidência | Problema e localização | Ação prevista |
|---|---|---|---|
| U01 | P1 · V | Layout novo está parcialmente no Google Stitch e ainda não foi recebido. | Receber projeto, inventariar telas prontas/faltantes e integrar conforme cronograma. |
| U02 | P2 · C/R | Fonte global 24px, alterada para 16px pela cruzadinha; telas com `h-screen`/overflow oculto podem cortar conteúdo. | Escala tipográfica única e testes com teclado virtual, zoom e telas pequenas. |
| U03 | P2 · C | Cartões clicáveis em `div`, inputs de grade sem nome acessível e campos com labels sem associação explícita. | Semântica de controles, teclado, labels e foco. |
| U04 | P2 · C/R | Animações contínuas e muitas partículas sem tratamento explícito de movimento reduzido nas telas revisadas. | Respeitar preferência e medir desempenho em dispositivo modesto. |
| U05 | P2 · C | Vermelho usado fora de UTI/risco (saída, patentes), contrariando diretriz; paletas e painéis duplicados. | Tokens visuais compartilhados, conciliados com Stitch. |
| U06 | P2 · C | 48 arquivos em `src/ui` incluem imports de pacotes ausentes, como Radix e `class-variance-authority`; conjunto não está conectado ao app atual. | Selecionar componentes úteis; instalar só dependências necessárias ou remover legado com revisão. Não afirmar que isso quebra o build ativo sem executar. |
| U07 | P2 · C | TS/TSX coexistem com JS, sem configuração TypeScript; ESLint cobre apenas JS/JSX. | Definir estratégia de tipos e verificar arquivos efetivamente utilizados. |
| U08 | P2 · C | Componentes grandes misturam persistência, regras, IA e apresentação; monitores/patentes/lógica clínica duplicados. | Extrair gradualmente serviços, regras e componentes durante as correções. |
| U09 | P2 · C | Flashcards, banco local de palavras e motor DDX antigo sem ligação ao fluxo principal; skill de equipe vazia e `App.css` vazio. | Inventariar e decidir manter/retomar/remover; não descartar trabalho automaticamente. |
| U10 | P2 · C | Navegação por estado perde tela/partida em reload e não integra histórico do navegador. | Definir rotas e política de retomada/abandono por modo. |
| U11 | P1 · C | Sem suíte de testes, scripts de testes ou CI no repositório inspecionado. | Cobrir regras críticas e fluxos de integração; automatizar build/lint/testes. |
| U12 | P3 · C | `index.html` usa `lang='en'` para aplicação em português; título genérico. | Ajustar metadados e idioma. |

## Cronograma proposto

Estimativa inicial: **26–34 dias úteis de trabalho**, organizada em seis semanas de referência e reserva final. Dias relativos ao início acordado; não são datas prometidas. Depende de acesso ao ambiente, decisões de produto, revisão clínica e envio do Stitch. Reestimar após ambiente funcionando e inventário visual recebido.

| Etapa | Janela / esforço | Dependência | Entrega e critério de conclusão |
|---|---|---|---|
| 0 — Retomar ambiente | Semana 1 · 1–2 dias | Configuração Firebase/Gemini disponível | Instalação reproduzível, `.env.example`, diagnóstico real de build/lint e app abrindo localmente. A01–A02; iniciar U07/U11. |
| 1 — Segurança e contratos | Semanas 1–2 · 4–5 dias | Etapa 0; acesso às regras/provedor | Chave exposta invalidada, serviço autenticado para IA, regras testadas e ranking público mínimo. A03–A09, I01–I02/I11. |
| 2 — Conta e progresso | Semana 2 · 4–5 dias | Contratos da etapa 1 | Cadastro/login/recuperação confiáveis; vitória salva uma vez; missões e tickets consistentes. A10–A12, D01–D09/D12. |
| 3 — Motores de jogo | Semana 3 · 4–5 dias | Persistência estável | Cruzadinha válida e resiliente; DDX/Hardcore sem alterações após fim e com vitória coerente. C01–C09, I03–I10/I12–I14. |
| 4 — Novo layout Stitch | Semanas 4–5 · 6–8 dias | Projeto recebido; regras/telas estabilizadas | Telas recebidas implementadas, faltantes completadas segundo referência, estados reais e responsividade verificados. U01–U05/U12; inventário pode começar na semana 1. |
| 5 — Dados e manutenção | Semana 5 · 3–4 dias | Modelos consolidados; componentes do layout definidos | Perfil/ranking/estatísticas fiéis, regras de nível únicas, legado decidido e navegação definida. D10–D11/D13–D15, U06–U10. |
| 6 — Homologação | Semana 6 · 4–5 dias | Etapas anteriores; revisão clínica | Build/lint/testes passando, revisão clínica registrada, fluxos de falha testados e procedimento de publicação/recuperação documentado. I15/U11 e regressão do inventário inteiro. |

A revisão clínica pode iniciar na semana 1 em paralelo; não deve ser deixada para o último dia. Migrações devem preservar usuários e progresso, ter ensaio em ambiente de teste e possibilidade de recuperação. Implementar o serviço de IA e mudar regras de nuvem exigirá definir onde serão hospedados; este documento não executa publicação nem altera serviços externos.

## Checklist de execução por plantão

### Etapa 0 — ambiente

- [ ] Instalar dependências com lockfile, conferir compatibilidade do Node e registrar versões.
- [ ] Recuperar variáveis de ambiente; nunca colocar chaves reais no cronograma ou no Git.
- [ ] Executar build/lint e anexar diagnóstico; ampliar inventário com falhas reproduzidas.
- [ ] Atualizar README e `.env.example`.

### Etapas 1 e 2 — segurança, conta e dados

- [ ] Rotacionar chave exposta e verificar restrições/uso no provedor.
- [ ] Definir serviço de IA, autenticação, cotas e contratos de resposta.
- [ ] Revisar regras reais Firebase e criar testes com dois usuários.
- [ ] Definir modelo versionado de usuário, partida, recompensa, missão e estatísticas.
- [ ] Ensaiar migração de perfis antigos sem perda de progresso.
- [ ] Corrigir criação de perfil, carregamento com falha e recuperação de senha.
- [ ] Tornar recompensas, consumo e restituição de tickets idempotentes.
- [ ] Corrigir missões clínicas e fronteiras de dia/fuso.

### Etapa 3 — jogabilidade

- [ ] Isolar importação de palavras e validar CSV/tópicos vazios.
- [ ] Corrigir motor, contagem de palavras, dificuldade e autocompletar.
- [x] Corrigir respostas duplicadas em posições distintas e validar cada entrada de forma independente (C10; teste automatizado; validação visual em conta autenticada pendente).
- [x] Corrigir avanço de foco/cursor em interseções e células já preenchidas (C11; teste automatizado; validação visual em conta autenticada pendente).
- [x] Corrigir falso negativo durante o preenchimento parcial das palavras (C12; teste automatizado; validação visual em conta autenticada pendente).
- [ ] Aumentar a densidade de interseções e compactar o tabuleiro sem quebrar entradas, respostas iguais ou validação (C13).
- [ ] Validar/censurar dicas e tratar falha de geração.
- [ ] Definir máquina de estados das partidas e descartar respostas atrasadas.
- [ ] Corrigir relatório, bônus de tempo e prompts contraditórios do Hardcore.
- [ ] Corrigir caminho dinâmico House, preservação do caso e condições de vitória.
- [ ] Alinhar habilidades da equipe, briefings e regras efetivamente executadas.

### Etapa 4 — implementação do layout do Google Stitch

**Referência recebida:** `docs/stitch-reference/stitch_redesign_visual_do_jogo/` contém o HTML, as capturas e o guia `cyber_clinical_arcade/DESIGN.md` fornecidos pelo usuário. As capturas de perfil e estatísticas registraram sobretudo a animação de fundo; o HTML complementa a referência.

- [x] Receber o projeto e registrar referência em `docs/`; manter arquivos de origem identificáveis.
- [x] Comparar as telas disponíveis com o Stitch e mapear os fluxos reais do projeto. As referências completas cobrem menu, seleção de cruzadinhas, perfil e estatísticas; as demais seguem a paleta e os componentes extraídos.
- [ ] Marcar cada tela como pronta no Stitch, parcial ou ausente; registrar decisões sobre faltantes.
- [x] Extrair cores, tipografia, espaçamento, bordas, ícones e componentes reutilizáveis.
- [ ] Conciliar o design enviado com tema Dark/Cyber-Médico e regras de cor existentes; registrar divergências.
- [x] Implementar base visual e componentes, depois acesso/menu/seleções, jogos e painéis. Menu, seleção de cruzadinhas e estatísticas foram refeitos; os demais fluxos foram alinhados por tema e escala preservando sua lógica.
- [ ] Conectar dados reais, eventos, dicas, tickets, temporizadores e recompensas ao layout.
- [ ] Implementar loading, vazio, erro, sem conexão, sem ticket, sucesso e derrota em cada fluxo aplicável. O DDX agora informa quando a IA não forneceu opções; falta decidir e implementar a regra de reembolso/abandono técnico.
- [x] Comparar as telas principais implementadas às referências recebidas; centro de comando, seleção de cruzadinhas, perfil e estatísticas foram conferidos em navegador autenticado.
- [ ] Validar celular, tablet e desktop, zoom 200%, teclado virtual, foco e movimento reduzido.
- [ ] Fazer revisão visual com o usuário e registrar pendências antes de fechar a etapa.

O material visual já foi recebido. A homologação final ainda depende da revisão do usuário e dos fluxos clínicos de DDX/Hardcore, que consomem tickets e não foram iniciados nesta conferência.

### Etapas 5 e 6 — consolidação e homologação

- [ ] Corrigir indicadores reais do perfil, UID do ranking, top 3 e cálculo de nível/progresso.
- [x] Separar estatísticas por modo (DDX/Hardcore); [ ] limitar consultas do ranking.
- [ ] Revisar arquivos legados e dependências com base no layout integrado.
- [ ] Definir navegação/retomada e documentar abandono de partida.
- [ ] Concluir revisão clínica com responsável e registrar versão/fontes do conteúdo.
- [ ] Automatizar build/lint/testes e documentar publicação/recuperação.
- [ ] Atualizar inventário com evidências de encerramento, não apenas marcar tarefas concluídas.

## Verificações para aceitar as correções

| Cenário | Resultado esperado |
|---|---|
| Cadastro novo, perfil atrasado ou ausente | Sessão carrega perfil válido ou mostra recuperação, sem loading infinito. |
| Recuperação de senha | Requisição real ao provedor e retorno coerente na interface. |
| Vitória na cruzadinha → voltar ou recarregar | Recompensa confirmada e mantida exatamente uma vez. |
| Firestore indisponível ao salvar | Falha visível, pendência preservada e nova tentativa segura. |
| Duas abas tentando consumir último ticket | Somente uma entrada autorizada; saldo não negativo. |
| Finalizar DDX/Hardcore | Missão correta atualizada uma vez; estatísticas do modo corretas. |
| Virada de dia e perfil legado | Reset coerente com fuso, sem bônus duplicado nem perda de dados. |
| CSV inválido, indisponível ou tópico vazio | Erro recuperável local; restante do app utilizável. |
| Grades com cruzamentos e palavras compostas | Letras/metadados consistentes e número correto de entradas. |
| Duas entradas distintas com a mesma resposta (`TÁLUS`) | Ambas podem ser preenchidas, mantêm seus próprios números e são validadas sem conflito. |
| Digitação atravessando uma interseção preenchida | O cursor avança para a próxima célula editável sem exigir clique manual. |
| Prefixo válido de uma resposta (`A` em `ATLAS`) | O estado permanece parcial/neutro até a palavra ser concluída; não há falso erro. |
| Grade com 15 entradas | Há cruzamentos suficientes para formar um conjunto compacto; entradas isoladas e grandes vazios são exceção, não o padrão. |
| Grade compacta | O bounding box das casas ocupadas não cresce por causa de palavras espalhadas sem necessidade; a leitura e a digitação permanecem confortáveis. |
| IA responde após término | Resultado final e recompensa permanecem inalterados. |
| Hardcore estabiliza repetidamente | Bônus único; relatório segue a política de tempo definida. |
| JSON incompleto, quota ou timeout | Estado recuperável, sem débito indevido nem tela travada. |
| Acesso cruzado entre usuários | Campos privados isolados; ranking só entrega dados públicos. |
| Layout enviado, teclado, zoom e mobile | Correspondência visual e controles acessíveis sem cortes críticos. |
| Primeiro acesso à cruzadinha | Tutorial abre antes do jogo, cronômetro permanece parado e a conclusão grava `tutorialCruzadinhasConcluido` no perfil. Ao voltar, não abre automaticamente; botão Tutorial reabre. Perfis antigos com partidas não são tratados como novos. |
| Abandono da cruzadinha | Aparece confirmação com perda do progresso; cancelar mantém letras e tempo; confirmar volta aos tópicos. Durante salvamento da vitória, saída fica bloqueada. |
| Relatório pós-partida da cruzadinha | Toda vitória, inclusive a primeira, apresenta XP de letras e palavras, multiplicadores, dedução por dicas, piso de 10 XP, missões e tickets, coerentes com o saldo salvo. |

## Decisões pendentes

- Melhoria futura da recuperação de senha: a página padrão do Firebase aceitou definir uma senha igual à anterior em teste real. Avaliar um fluxo próprio de redefinição com validação da senha anterior ou política de histórico, sem presumir que o Firebase ofereça essa regra nativamente. Personalizar também nome/idioma do e-mail (o teste ainda mostra `caca-med` em inglês). Não bloquear as correções de missões por isso.

- Projeto/versão do Google Stitch e quais telas ainda faltam.
- Firebase atual: acesso, regras e possibilidade de ambiente de teste.
- Destino do serviço de IA e orçamento/cotas de uso.
- Regra oficial de nível global e XP, custos/passivas de equipe, modo casual versus ranqueado e política de abandono.
- Condição oficial de vitória Hardcore e pausa durante IA/relatório.
- Manter flashcards no escopo futuro ou arquivar os componentes.
- Responsável pela validação clínica dos casos.
- Estatísticas clínicas antigas misturadas: decidido pelo usuário descartar, sem exibir "Clínico (legado)". A limpeza ocorre no login ou ao registrar uma partida; os dados de cruzadinha são preservados.

## Registro de andamento

| Data | Etapa | Situação | Evidência / próximo passo |
|---|---|---|---|
| 24/09/2026 | Diagnóstico e planejamento | Concluído para revisão estática | Cronograma criado; execução das correções ainda não iniciada; aguardando projeto Stitch. |
| 24/09/2026 | Recuperação de senha | Validado pelo usuário | E-mail recebido e senha trocada; melhoria de senha anterior e personalização do e-mail ficam para depois. |
| 24/09/2026 | Missões diárias e modos clínicos | Implementado, aguardando teste integrado | Reset transacional; missões DDX/Hardcore no registro da partida; teste das regras e build passaram. Falta validar com conta de teste no Firebase. |
| 24/09/2026 | Recompensa da cruzadinha | Implementado, aguardando teste integrado | XP, tickets, missões e estatísticas são gravados ao vencer por transação identificada; falhas permitem repetir o salvamento. Falta validar vitória e saída com conta de teste. |
| 24/09/2026 | Entrada DDX | Falha inicial tratada e testada | A entrada registra cobrança identificada e o reembolso transacional é idempotente. Se a IA falhar antes de fornecer opções clínicas, devolve o ticket e não registra partida/XP; teste em conta autenticada confirmou saldo 64 → 63 → 64 e zero derrotas. O teste anterior foi revertido na conta, com XP 177.174 → 177.074 e estatísticas DDX zeradas. |
| 24/09/2026 | Estatísticas DDX/Hardcore | Implementado, aguardando teste integrado | Campos separados por modo, abas próprias e limpeza dos contadores clínicos antigos no login. Testes unitários verificam isolamento e preservação das cruzadinhas; falta confirmar com conta de teste no Firebase. |
| 24/09/2026 | Layout Stitch | Implementação integrada, homologação visual parcial | Referência recebida. Centro de comando, seleção de cruzadinhas e estatísticas refeitos com a paleta documentada. Login/cadastro, menu, seleção de cruzadinhas, estatísticas, perfil e seleção DDX foram inspecionados em desktop/celular; a entrada na cruzadinha também foi conferida. A admissão e os painéis do DDX foram inspecionados com 1 ticket; o erro da IA impediu verificar opções e desfecho. O painel vazio passou a explicar essa situação e o indicador de satisfação não exibe sorriso com FC zero. Ficaram pendentes zoom/teclado, desfecho DDX e execução Hardcore. |
| 24/09/2026 | Animações Stitch | Implementação parcial | Cards principais entram suavemente, botões respondem a hover/press, barras têm brilho em movimento e o avatar pulsa com a paleta recebida. `prefers-reduced-motion` desativa esses efeitos. Ainda falta comparar microinterações finas e transições completas com o material de referência em todas as telas. |
| 24/09/2026 | Entrada Hardcore | Bloqueada pela IA | Tela de briefing e erro conferida em navegador autenticado. A geração do paciente falhou antes do início; nenhuma partida foi registrada. A mensagem de erro agora orienta voltar ao centro de comando. Falta teste de caso e desfecho quando o serviço de IA estiver funcional. |
| 24/09/2026 | Cruzadinhas C10–C12 | Código corrigido; homologação visual pendente | O motor impede sobreposição na mesma direção e conserva duas entradas com resposta igual; cursor pula interseção preenchida; feedback de erro aguarda a palavra completa. Guia rápido incluído. Oito testes e build passaram. |
| 24/09/2026 | Feedback visual das cruzadinhas | Novo problema registrado | A imagem enviada mostra baixa densidade de interseções e muitas entradas isoladas. C13 entrou como prioridade P1; antes de alterar o algoritmo, será feita validação visual com testes de compactação e cruzamentos. |
| 24/09/2026 | Lint, acessibilidade e limpeza da cruzadinha | Revisado em 25/09 | ESLint agora termina sem erros nem avisos. As células da grade têm nomes acessíveis; clique e foco compartilham a seleção de palavra/dica. Teclado, foco de diálogos e rótulos foram ampliados na revisão web. |
| 25/09/2026 | Tutorial, abandono e relatório da cruzadinha | Validado em conta existente | Tutorial de seis etapas reaberto na partida, confirmação de saída validada e relatório conferido com o XP salvo. Ainda falta testar primeira entrada em conta nova e recuperação de falha de rede. |
| 25/09/2026 | Fluxo web padrão da cruzadinha | Validado em conta autenticada | Partida de Anatomia/Sistema Circulatório concluída via teclado: 7 palavras, 32 letras, cruzamentos preenchidos automaticamente, relatório de 134 XP da grade + 150 XP de missão; saldo global 177.704 → 177.988 e XP do tópico 135 → 269. Tutorial reaberto, foco preso no diálogo; cancelamento preservou letras; abandono confirmado retornou aos tópicos sem recompensa. O teste alterou somente os dados desta conta, conforme autorização anterior do usuário. |
| 25/09/2026 | Web desktop/notebook e acessibilidade básica | Implementado e conferido | Tabuleiro sem overflow horizontal em viewports de 1024×768 e 1366×768; em 683×384 há rolagem vertical. Saída ganhou nome acessível, setas navegam pela grade, Enter/Espaço alternam interseção, diálogos prendem foco, barra de XP expõe valor, campos de perfil têm rótulos e texto secundário usa a paleta com contraste maior. Teste completo com leitor de tela e zoom real de 200% ainda não executado. |
| 25/09/2026 | Qualidade do código e dados de progresso | Implementado e conferido | ESLint sem erros/avisos; 13 testes passaram; build passou. Removido payload de recompensa que já não era utilizado. Patentes e contadores de cruzadinhas compartilham utilitários. Histórico recente é limitado a 30; menu, perfil e estatísticas agora exibem 49 partidas acumuladas após a vitória de teste. Ranking global foi aberto (#2 por nível, #1 por letras, #2 por tempo), com ordenação e ausência de tempo verificadas. |
| 25/09/2026 | Sincronização do ranking público | Validada em navegador e planilha | Apps Script versão 4 recebeu a conta de teste por token Firebase, leu as métricas oficiais e criou a linha correspondente. A linha `Jogador Teste` foi removida da aba `Ranking` e a conta real passou a aparecer em #1 no jogo. Reexecução não criou linha duplicada. Uma primeira abertura do ranking expirou no navegador integrado; o endpoint respondeu HTTP 200 com JSON correto e a segunda abertura carregou normalmente. Lint, 13 testes e build passaram; o build ainda avisa sobre tamanho do bundle. |
| 25/09/2026 | Auditoria das regras reais do Firestore | Isolamento entre contas publicado e verificado | A regra pública `allow read, write: if true` foi substituída por acesso ao próprio `usuarios/{uid}`. Leitura anônima de documento inexistente retornou HTTP 403; a conta de teste autenticada continuou carregando o menu e o próprio perfil. Ainda é possível ao dono adulterar seu XP: **não considerar o ranking antifraude** até validar recompensas em servidor e restringir campos. |
| 25/09/2026 | Limite de gasto e contrato de pontuação | Limite aplicado; fórmula isolada em teste | No console Firebase, `Cloud Run Functions (Functions)` recebeu limite mensal de R$15, abaixo do teto desejado de R$20. O limite é por serviço, não cobre Firestore e pode ser ultrapassado por atraso de medição; monitorar faturamento e configurar alertas. `pontuacaoCruzadinha.js` extraiu a fórmula atual e a conferência de respostas para uso futuro no serviço; 16 testes, lint e build passaram. Ainda não há Cloud Function publicada nem mudança de fluxo de jogo. |
| 25/09/2026 | Bloqueio temporário DDX/Hardcore | Aplicado no acesso web | Os dois modos ficaram indisponíveis no menu e as rotas retornam ao centro de comando. As telas e serviços foram preservados para a reformulação posterior; nenhum ticket ou recompensa clínica é consumido durante o bloqueio. |
| 26/09/2026 | Cruzadinha seguinte com grade pequena | Corrigido no gerador; validação visual pendente | O sorteio agora varia o grupo de até 15 palavras em cada tentativa. Se a grade ficar abaixo da meta de até 10 entradas, tenta também a dificuldade imediatamente superior e, por último, o restante do tópico. Retorna métricas de seleção/posicionamento para diagnóstico. Teste de regressão confirmou expansão de 6 para pelo menos 10 entradas em banco com palavras adicionais; 22 testes, lint e build passaram. Quando o tópico inteiro contém poucas palavras ou não oferece cruzamentos possíveis, a grade ainda pode ficar pequena. |
| 26/09/2026 | Loop ao passar sobre Hardcore bloqueado | Corrigido; validação visual pendente | O handler não agenda mais a entrada no modo Hardcore quando o acesso está bloqueado e cancela qualquer temporizador pendente. O ciclo ocorria porque a rota bloqueada voltava ao menu enquanto o ponteiro permanecia sobre o card. Lint, 22 testes e build passaram. |

### Plano anterior arquivado — pontuação em Cloud Functions

> Esta seção registra decisões antigas e **não deve ser executada**. A arquitetura vigente está em “Mudança de arquitetura em 25/09/2026 — custo obrigatório de R$0”, mais abaixo. Nenhuma Cloud Function deve ser publicada nem o faturamento reativado.

**Objetivo.** O navegador envia ações ou respostas da partida; um serviço confiável identifica o usuário, confere a partida e calcula XP, tickets, missões e estatísticas. A planilha `Ranking` passa a ser somente uma projeção pública desses resultados. O código atual envia ao Firestore o XP calculado em `Jogo.jsx` por `registrarCruzadinha.js`; o Apps Script atual lê esse mesmo valor e, portanto, ainda não impede que o próprio usuário o altere.

**Arquitetura definida.** Usar uma função autenticada do Firebase para iniciar e concluir partidas, com credenciais de servidor mantidas fora do navegador. Firebase será a fonte oficial de XP, tickets, missões e estatísticas; Apps Script/Google Sheets será somente uma projeção pública da temporada do ranking. Não vamos gravar o mesmo resultado de partida nos dois serviços: isso evitará duplicidade, divergência e partidas salvas em um serviço e perdidas no outro. O projeto Firebase já mostra plano Blaze; o uso pode ficar na faixa sem cobrança, mas não há garantia de custo zero. Antes de publicar, conferir a cota aplicável e configurar limite de gasto para Functions, além de monitorar Firestore. [Functions callable e autenticação](https://firebase.google.com/docs/functions/callable), [limites de gasto](https://firebase.google.com/docs/projects/billing/spend-caps), [cotas do Apps Script](https://developers.google.com/apps-script/guides/services/quotas).

| Ordem | Entrega | Trabalho previsto | Critério de aceite |
|---|---|---|---|
| 1 — Contrato e inventário | Definir o que entra no placar e congelar a fórmula atual de XP. | Mapear todas as escritas em `usuarios/{uid}`: cadastro, bônus diário, cruzadinha, dicas, missões, tickets DDX, DDX/Hardcore, perfil e ranking. Separar campos de perfil editáveis dos campos de progresso. Registrar exemplos reais de partidas, incluindo primeira vitória, dica, missão e ticket. A temporada nova começa com placar público zerado, preservando o histórico privado e os saldos atuais até a política de migração ser implementada. | Fórmula e origem de cada campo documentadas; mesmos casos produzem os mesmos valores antes e depois da migração. |
| 2 — Partida emitida pelo servidor | Criar `iniciarPartida` com autenticação, ID único, tópico, versão do banco, grade/desafio e horário do servidor. | Guardar em área não editável pelo jogador o gabarito e o estado mínimo da partida. O cliente recebe somente o necessário para desenhar a grade; não aceitar IDs, nível, tempo ou gabarito inventados pelo cliente. Decidir como manter o feedback de letra sem expor respostas. | Outro usuário não consegue usar a partida; reabrir ou tentar reutilizar o ID não cria uma segunda recompensa. |
| 3 — Conclusão autoritativa | Criar `concluirPartida` que confere respostas e estado, calcula XP e aplica o resultado numa transação. | Mover a fórmula de `Jogo.jsx` e a lógica de `registrarCruzadinha.js` para código compartilhado testável no servidor. Usar horário do servidor para limites de tempo, validar uso de dicas, calcular missões e tickets, registrar recibo por ID em coleção separada. DDX e Hardcore também deixam de gravar resultado diretamente pelo cliente; suas conclusões serão protegidas pelo mesmo contrato, mesmo que a reformulação de IA e gameplay venha depois. Devolver ao cliente o relatório oficial; repetir uma requisição deve devolver o mesmo recibo. | Vitória, XP, missões, tickets e estatísticas batem com o recibo; duas abas e reenvios não duplicam nem perdem prêmio. |
| 4 — Telas e ranking | Substituir a gravação direta do progresso no cliente; mostrar salvamento pendente, erro e nova tentativa. | Perfil, estatísticas e relatório leem o resultado confirmado. O Apps Script publica apenas o placar da temporada nova derivado do resultado oficial; não usa uma pontuação que o cliente ainda possa alterar. Sincronização do ranking tem confirmação ou reconciliação, sem depender apenas de POST `no-cors`. | Jogador vê o mesmo XP no relatório, perfil, Firestore e planilha; falha de rede mantém a tentativa segura. |
| 5 — Regras e migração | Publicar regras do Firestore depois que todos os fluxos dependentes estiverem prontos. | Permitir ao cliente ler o próprio perfil e editar somente campos de apresentação/tutoriais permitidos; negar escrita direta em XP, tickets, missões, estatísticas, recibos e partidas. Preservar saldos antigos num marco de migração, sem concedê-los de novo. Implantar em sequência verificável, com versão anterior guardada para retorno. | Sem login ou com outra conta, não é possível ler/escrever perfis alheios; o dono também não consegue aumentar o próprio XP diretamente; cadastro, login e tutorial continuam operando. |
| 6 — Homologação | Testar serviço, interface e dados reais de teste antes de considerar o placar confiável. | Casos: respostas erradas, payload adulterado, ID repetido, duas abas, relógio local alterado, falha de rede, quota excedida, partida interrompida e ranking desatualizado. Verificar custos/cotas e alertas. | Testes automatizados e fluxo web passam; gasto observado e risco residual registrados; publicação e procedimento de retorno documentados. |

**Sequência de implantação.** O isolamento entre contas já foi publicado sem bloquear as escritas atuais. Próximo: serviço de teste e migração da cruzadinha; depois cliente atualizado; só então restringir *campos* de progresso e ativar o placar oficial. Uma publicação parcial que bloqueie as escritas atuais pode impedir cadastro, login, missões ou recompensas. A regra `firestore.rules` ainda permite ao dono editar o próprio XP. DDX/Hardcore e IA permanecem fora da migração de jogabilidade até decisão sobre a política de recompensas clínicas: o desfecho deles é informado pelo cliente e não pode ser verificado por simples regra do Firestore.

**Controle de gastos.** O limite mensal de R$15 foi criado para Cloud Run Functions, mas não é um teto global rígido de R$20. O Firestore pode gerar cobrança separada e o próprio limite da Functions pode exceder por atraso da contabilização. Antes de implantar: conferir alertas de orçamento do projeto, cota por função, região e volume de chamadas; manter o endpoint com autenticação e `maxInstances` baixo. Não ativar sincronização periódica desnecessária para a planilha.

**Decisão bloqueante para proteger DDX/Hardcore.** O código clínico atual aceita vitória/derrota calculada no navegador. Para negar escrita direta em XP sem quebrar esses modos, escolher entre (A) antecipar a migração completa do estado/desfecho clínico para o servidor, incluindo a IA, ou (B) manter os modos jogáveis temporariamente sem prêmios oficiais na nova temporada. Nenhuma das opções deve ser aplicada sem confirmação.

**Decisão aplicada.** Por solicitação do usuário, DDX e Hardcore foram bloqueados temporariamente. A retomada fica para a reformulação de gameplay/IA e validação autoritativa no servidor.

### Mudança de arquitetura em 25/09/2026 — custo obrigatório de R$0

O plano integrado com Cloud Functions foi **cancelado antes de qualquer função ser implantada**. O faturamento do projeto `caca-med` foi desvinculado no Google Cloud; o console Firebase confirmou o plano **Spark / Sem custos**. A conta de faturamento do proprietário não foi encerrada nem alterada para os outros projetos vinculados. Cobranças já incorridas antes do desligamento, se existirem, ainda podem ser lançadas. Enquanto a migração não termina, Authentication e o banco Firestore padrão continuam disponíveis nas cotas gratuitas do Spark para que os perfis existentes não sejam perdidos. Manter a regra de acesso apenas ao próprio documento; nunca restaurar `allow read, write: if true`.

**Destino aprovado:** uma única planilha cacoMed autorizada, com Apps Script para dados privados, partidas e ranking; login com Google. A senha antiga do Firebase não é transferível. Cada jogador deverá entrar na conta antiga e na conta Google uma vez para vincular seu perfil; um e-mail igual sozinho não autoriza a migração. O identificador estável da conta nova será o `sub` retornado por um token Google verificado no Apps Script.

**Sequência de migração sem perda de progresso:**

1. Configurar cliente OAuth do cacoMed com escopos básicos de identidade, origem local e, antes da publicação, origem web definitiva. Guardar o ID do cliente no projeto e nas propriedades do Apps Script; não colocar segredos no Vite.
2. Criar abas privadas de perfis, partidas e recibos **na planilha cacoMed autorizada**. Registrar versão de esquema, UID Firebase legado e Google `sub`; a aba pública `Ranking` conterá só a projeção necessária. A planilha não será compartilhada com jogadores.
3. Implementar no Apps Script a verificação dos dois tokens para a vinculação. Ler o perfil Firestore usando o token Firebase do próprio jogador e copiar os campos permitidos em operação idempotente, com travamento. Repetir a migração não soma XP nem cria outra conta. Perfis sem acesso à conta antiga exigem recuperação/manual, nunca associação só por e-mail.
4. Implementar partidas identificadas pelo servidor, resultado calculado no Apps Script, recibos imutáveis, limites de tamanho/tempo e frequência, bloqueio de reenvios e proteção contra nomes que virem fórmula. A planilha será a fonte de XP da temporada nova. Os gabaritos visíveis ao navegador ainda podem ser usados para jogar automaticamente; registrar esse risco aceito.
5. Adaptar o frontend para entrar com Google e usar o Apps Script para perfil, cruzadinhas, missões, tickets e ranking. Preservar um caminho temporário de login antigo para vinculação enquanto houver usuários pendentes. DDX/Hardcore continuam bloqueados.
6. Testar com a conta de teste e depois migrar os demais usuários. Conferir saldos, histórico, tutorial, recuperação de rede, idempotência e limite de cotas. Somente depois retirar as referências ao Firebase do aplicativo. Não excluir o projeto ou os dados antigos antes de validar a migração e uma cópia de segurança.

**Proteções possíveis no Apps Script:** validar identidade e público do token Google; limitar chamadas por usuário; recusar corpos grandes, IDs repetidos, respostas fora da partida e parâmetros fora do intervalo; definir tempo mínimo plausível; calcular XP no script; usar `LockService` nas gravações; manter recibo por partida; separar leitura pública dos dados privados; limitar e sanitizar o ranking. Essas medidas reduzem adulteração casual e abuso. Como o banco de palavras e o código do jogo são públicos, não comprovam que uma pessoa jogou honestamente. Apps Script também tem cotas e pode interromper chamadas sem cobrar quando são excedidas.

**Ponto de atenção:** o endpoint publicado atualmente ainda usa token Firebase, lê `pontuacaoTotal` do Firestore e aceita a sincronização antiga. Ele é transitório e não implementa a arquitetura acima. Não anunciar a migração como concluída até substituir e testar o deployment.

**Andamento do piloto local (25/09).** Cliente OAuth web `cacoMed web local` criado com origem `http://localhost:5173` e somente identidade básica; `gfire0009@gmail.com` consta como usuário de teste. A autorização de origem `127.0.0.1` não foi aceita nesse cadastro: testar com `localhost`. O código local do Apps Script ganhou ação `migrarPerfil`, que exige simultaneamente token Firebase válido da conta antiga e token Google válido do cliente cacoMed, impede que uma identidade já vinculada seja associada a outra e grava uma única cópia do perfil numa aba privada. A implementação foi verificada em testes automatizados, mas **não foi publicada nem chamada pelo frontend**; não houve migração real de conta. O endpoint Google `tokeninfo` usado nesse piloto é documentado para desenvolvimento/depuração, sujeito a throttling, e deverá ser substituído por verificação criptográfica de assinatura antes de publicar para jogadores. Também falta transporte bidirecional confiável entre o SPA e o Apps Script: o POST atual `no-cors` não permite ler recibos. Não expor botão de migração enquanto essas duas pendências não estiverem resolvidas. [Verificação de ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token), [ContentService e redirecionamento](https://developers.google.com/apps-script/guides/content).

**Decisão posterior que substitui a migração acima.** O usuário decidiu reiniciar todas as contas com XP, tickets, missões concluídas, estatísticas e ranking zerados; o progresso do Firestore não será copiado. Login e cadastro antigos por e-mail/senha permanecem como opção. Firebase Authentication permanece no plano Spark como serviço gratuito de identidade para esses logins e para vincular Google à mesma identidade; os perfis passam para a planilha. Se o Google encontrar uma conta antiga, o app pede autorização e a senha antiga antes de liberar o novo perfil. Contas Google inéditas recebem nome/e-mail da identidade e completam somente título (Dr./Dra.) e matéria preferida no Cadastro 2.0. Depois do teste integral, os documentos antigos do Firestore e a aba antiga de ranking podem ser removidos; manter as contas de Authentication enquanto o login antigo existir. Não manter cópia local dos dados descartados.

**Implementação em andamento.** Na única planilha autorizada, foram criadas as abas vazias `PerfisGoogle`, `RankingNovaTemporada` e `Partidas`, com cabeçalhos; `Ranking` antiga ainda está intacta. O provedor Google foi ativado no Firebase Authentication e o projeto continuou no plano Spark. O Apps Script local agora tem API autenticada por token Firebase e uma página de ponte para devolver respostas ao navegador, cadastro com pontuação zero, edição de perfil, tutorial, recompensa de cruzadinha calculada no script, recibos e ranking da nova temporada. A ponte permite explicitamente `localhost:5173` e `127.0.0.1:5173`; outras origens exigem atualização consciente da lista. O frontend tem fluxos locais de Google, confirmação com senha, Cadastro 2.0 e leituras/escritas pela planilha sob `VITE_FONTE_DADOS=planilha`. O script e o modo novo ainda precisam ser publicados e validados no navegador com a conta de teste. A pontuação calculada no Apps Script limita entradas e impede duplicação por ID, mas **não comprova o jogo honesto**, pois as métricas enviadas pelo navegador podem ser falsificadas. O cliente OAuth direto criado anteriormente pode não ser necessário, pois o Firebase Authentication gerencia o provedor Google; decidir removê-lo apenas após a validação, sem expor o client secret.

**Portão antes da limpeza definitiva.** Publicar `docs/apps-script-ranking.gs` na implantação web vinculada à planilha autorizada; testar a ponte, Google inédito, conta antiga por senha, vinculação Google com senha antiga, tutorial, vitória, relatório de XP, perfil, estatísticas, ranking e reenvio de partida. Só então ativar `VITE_FONTE_DADOS=planilha` para todos e remover os documentos de progresso do Firestore e a aba antiga `Ranking`; as contas de Authentication permanecem. Nenhum passo desse portão exige faturamento.

**Validação parcial (25/09, versão 5).** O usuário colou o script no editor vinculado à planilha e a implantação web existente foi atualizada para a versão 5, mantendo a mesma URL. A leitura pública da nova temporada retornou HTTP 200 com `ranking: []`. No Chrome normal, o login antigo por e-mail abriu o Cadastro 2.0; o login Google funcionou em `http://localhost:5173/`, exibiu o aviso de vínculo e concluiu o cadastro. Dois perfis novos, com XP e tickets zerados, apareceram na aba privada. O login Google falhou em `127.0.0.1`; essa origem não foi configurada para OAuth, portanto usar `localhost` no desenvolvimento. O navegador integrado não conseguiu carregar a ponte; o teste de partida, relatório, perfil e ranking segue pendente no Chrome normal. **Não apagar Firestore ou `Ranking` antiga antes desses testes.**

**Estimativa de esforço.** Contrato e protótipo verificável da cruzadinha: cerca de 3–5 dias de trabalho. Migração das telas, proteção de DDX/Hardcore, regras, temporada nova, testes de fraude e homologação: mais 3–5 dias. As durações são estimativas, não prazos de calendário.

**Decisões antes de implementar.**

1. Serviço: decidido usar Firebase como fonte oficial e Apps Script/Sheets apenas como projeção do ranking.
2. Escopo: decidido proteger cruzadinhas, DDX e Hardcore; a reformulação de gameplay e IA continua em fase posterior.
3. Feedback: decidido validar somente a palavra e a partida no servidor; o feedback imediato pode continuar local, sem tratar a célula como recompensa confirmada.
4. Histórico: decidido iniciar uma temporada nova no ranking, preservando os dados privados atuais até definir a política de migração.

### Pendências para homologação final web

**26/09 — ferramentas de teste e cadastro (código local).** A conta com e-mail administrador verificado pelo Firebase recebe `role: "admin"` no perfil da planilha; outros perfis com essa role também podem usar as ferramentas. O Apps Script confere a role no servidor antes de definir XP global, nível global, nível de tópico ou zerar progresso. A interface oferece preenchimento da palavra selecionada, conclusão da grade e geração de nova grade; concluir a grade usa a recompensa normal da partida. Essas ações mexem em dados reais. O Cadastro 2.0 agora pede username: caixa “usar primeiro nome do Google” desmarcada por padrão ou campo de texto próprio. Em interseções, a palavra com mais casas vazias ganha prioridade; Enter/Espaço troca a direção. O cursor continua indo à próxima casa vazia. O modo alternativo de avanço célula por célula está comentado junto ao input para futura troca.

**Ajuste visual admin (26/09).** Após a validação dos controles e da seleção de dicas pelo usuário, os controles admin foram movidos para um Speed Dial/FAB fixo no canto inferior direito do Centro de Comando, da seleção de tópicos e da partida. O painel é exclusivo de `role: "admin"`, fecha por botão ou Escape e fica oculto durante os diálogos da partida. Nenhuma ação, permissão ou cor da paleta foi alterada. `npm test` (24 casos), `npm run lint` e `npm run build` passaram. Falta conferir visualmente o FAB com sessão admin no Chrome normal; o navegador integrado em `127.0.0.1` não conseguiu carregar o perfil pela ponte do Apps Script.

- [x] Código local das ferramentas admin, seleção de dica e username; testes automatizados, lint e build.
- [x] Publicar nova versão de `docs/apps-script-ranking.gs` na implantação web existente. Em 26/09, o conteúdo integral do editor foi comparado com o arquivo local e salvo; a implantação ativa passou da versão 5 para a **versão 6**, preservando o mesmo código de implantação/URL e as permissões anteriores. A chamada GET pública não pôde ser repetida neste ambiente porque o navegador integrado bloqueou `script.google.com/macros` e o terminal não teve acesso de rede externo; ainda falta a homologação real no Chrome.
- [ ] Homologar no Chrome em `http://localhost:5173/` com a conta admin: role, preenchimento de uma palavra, finalizador, nova grade, XP/níveis/reset, relatório e atualização do ranking. Testar conta comum sem acesso admin.
- [ ] Verificar Cadastro 2.0 com conta Google nova: username próprio e opção de primeiro nome, incluindo persistência após sair e entrar.

- [ ] Testar primeira entrada do tutorial em conta realmente nova e persistência após novo login. A conta de teste usada para o ranking abriu diretamente o tabuleiro; isso é compatível com histórico de uso ou com a marca de tutorial já concluído. Não foi tratada como conta inédita nem alterada apenas para simular esse cenário.
- [ ] Simular falha de rede no salvamento e confirmar tentativa de novo envio sem duplicar recompensa.
- [ ] Conferir foco e leitura do relatório em leitor de tela e zoom real de 200%.
- [x] Definir fonte pública do ranking global e substituir a leitura de `usuarios` pelo Apps Script. Código do endpoint de leitura versionado em `docs/apps-script-ranking.gs`; implantação existente atualizada para a versão 3. Com a conta de teste autenticada, a tela mostrou `Jogador Teste` (4 níveis, 120 acertos) e os filtros global, mesma patente e Hall da Fama funcionaram. A planilha ainda contém só essa linha de teste.
- [x] Sincronizar automaticamente a pontuação da conta autenticada para a planilha: Apps Script valida token Firebase, lê o documento oficial do usuário, atualiza a linha por UID e publica apenas hash de identificação e métricas. Conta de teste apareceu com 50 XP, nível 0 e contadores zerados; a UI mostrou #2 com `Jogador Teste` ainda presente. Tempo médio é calculado das cruzadinhas. Usuários inativos aparecem quando voltarem a entrar.
- [x] Remover a linha manual `Jogador Teste` da aba `Ranking` da planilha autorizada e confirmar que a linha real permaneceu.
- [x] Publicar isolamento entre contas no Firestore. Leitura anônima negada (HTTP 403) e perfil próprio acessível na conta de teste. [ ] Restringir escrita de pontuação e demais campos de progresso quando o backend autoritativo estiver pronto; testar cadastro, tutorial, partida, recompensa e ranking após isso.
- [x] Escolher a versão integrada com pontuação calculada e validada em serviço confiável. Implementação detalhada na seção acima; ainda pendem serviço, escopo, feedback e tratamento do histórico.
- [x] Definir a arquitetura da versão integrada: Firebase como fonte oficial; Apps Script/Sheets apenas como projeção pública; validação no nível de palavra/partida; proteção de cruzadinhas, DDX e Hardcore; temporada nova no ranking.
- [ ] Revisar publicação web e dados de produção após os itens acima. A reformulação de DDX, Hardcore e IA vem depois dessa homologação.

Para cada correção, registrar ID, commit no padrão Conventional Commits, verificação realizada e risco remanescente. Preservar alterações existentes do usuário, inclusive `docs/guia_conventional_commits.md`.

### 27/09 — Erro médico concluído como piloto

Regras aprovadas: um ticket por análise, quatro etapas, 25 XP por acerto (até 100 XP), recompensa somente na primeira conclusão de cada versão. Progresso e estatísticas próprios, salvos na planilha; servidor valida cada resposta e calcula XP. A auditoria exige revisão clínica própria, além da aprovação do caso-base do Plantão.

Backend publicado na versão 11 da implantação existente às 23:44, preservando URL e permissões. Validação real: ticket 1 → 0, retomada após recarga na segunda etapa, conclusão 4/4, +100 XP, total 5.322 e relatório persistido. 42 testes, lint e build passaram; testes cobrem repetição, reenvio e ausência de duplicação. Frontend atualizado disponível em localhost; Vercel e revisão clínica continuam pendentes. Esta entrega encerra o segundo modo conforme o modelo de parada combinado; Causa e efeito ainda não foi iniciado. Detalhes em `ddx-erro-medico.md`.

## Atualização de 30/09/2026 — novo modo secreto do DDX

Foi aprovado o conceito do novo modo **Batalha diagnóstica**, uma batalha 2D arcade didática em que o médico enfrenta uma doença inicialmente oculta e usa habilidades médicas para investigá-la, reconhecê-la e controlá-la. A especificação completa está em [ddx-batalha-diagnostica.md](ddx-batalha-diagnostica.md).

Decisões registradas:

- haverá dois formatos: **História — Road to Doctor** e um modo aleatório X1, ainda sem nome definitivo;
- o jogador controla apenas o médico e escolhe um companheiro auxiliar com especialidade própria;
- cada companheiro terá uma habilidade de emergência que aparece em momentos críticos;
- as batalhas serão baseadas em casos parciais, suficientes para ensinar como raciocinar contra doenças bacterianas, virais, protozoárias e outros agentes;
- na História, as doenças serão apresentadas em progressão pedagógica; no X1, serão sorteadas;
- a doença começa sem cores e sem identificação; quando o jogador a descobre, ela se revela;
- uma habilidade diretamente adequada pode reduzir a vida da doença antes da revelação;
- habilidades terão apenas tempo de recarga, sem custo de energia na primeira versão;
- o médico nunca causa dano ao paciente; escolhas inadequadas fortalecem a doença ou ativam buffs que indiretamente aumentam o risco;
- após a revelação, a doença terá uma evolução visual moderada e poderá ganhar resistência ou novas complicações;
- nomes de habilidades serão lúdicos, com trocadilhos baseados em termos médicos;
- o modo será desenvolvido depois da Revisão Inteligente e ainda depende de definição de economia e revisão clínica.

### Cronograma atualizado

#### Fase A — Pendências herdadas antes do novo modo

- [ ] Validar a Revisão Inteligente com sessão autenticada e dados reais, sem alterar o saldo definitivo.
- [ ] Revisar clinicamente os gabaritos e explicações de Quiz, Verdade ou mentira, Plantão, Erro médico e Causa e efeito.
- [ ] Homologar o frontend publicado após a validação local dos modos.
- [ ] Reavaliar a migração de Apps Script/Sheets para Supabase; medir latência real antes de decidir uma migração estrutural.
- [ ] Otimizar o bundle e investigar a lentidão percebida de abertura e login depois da medição de API.
- [ ] Manter o deploy automático da Vercel desativado até o fluxo de publicação ser aprovado.

#### Fase B — Fechamento da Revisão Inteligente

- [ ] Confirmar fila, repetição, feedback, fontes e registro dos erros no navegador autenticado.
- [ ] Confirmar que a revisão continua gratuita e não concede XP, tickets ou missões.
- [ ] Atualizar a documentação com o resultado da validação real.

#### Fase C — Entrevista e pré-produção da Batalha diagnóstica

- [ ] Escolher o nome final do Modo X1.
- [ ] Definir tickets, XP, repetição e demais regras de economia.
- [ ] Selecionar os três primeiros agentes/doenças e revisar fontes clínicas.
- [ ] Definir os pets iniciais, especialidades e habilidades de emergência.
- [ ] Fechar regras de recarga, descoberta, dano, buff, evolução e vitória.
- [ ] Criar contrato de conteúdo versionado para doenças, pistas, habilidades, consequências e explicações.
- [ ] Criar protótipo visual 2D sem assets derivados de franquias existentes.

#### Fase D — Protótipo implementável

- [ ] Implementar motor determinístico da batalha.
- [ ] Implementar a História com uma sequência curta de encontros.
- [ ] Implementar o Modo X1 aleatório.
- [ ] Integrar escolha do pet e habilidades auxiliares.
- [ ] Implementar recarga, revelação, evolução visual e buffs.
- [ ] Implementar relatório final e registro dos erros para a Revisão Inteligente.
- [ ] Integrar persistência, retomada, tickets e recompensas idempotentes.

#### Fase E — Validação e liberação

- [ ] Testar partidas interrompidas, recarga, reenvio e ausência de duplicação.
- [ ] Testar teclado, foco, responsividade e desempenho.
- [ ] Revisar clinicamente todos os casos e explicações.
- [ ] Validar História e X1 com o usuário no navegador.
- [ ] Só depois liberar o modo para jogadores comuns e atualizar o cronograma com a data de publicação.

A ordem oficial passa a ser: concluir e validar a Revisão Inteligente, fechar o contrato clínico e econômico da Batalha diagnóstica, construir o protótipo da História, construir o X1, testar os dois e então liberar o modo.

## Prioridade de 30/09/2026 — preparação para Supabase e mobile

Esta frente passa para primeiro plano e deve começar hoje. A decisão arquitetural é manter JavaScript e evitar uma migração simultânea para TypeScript ou Next.js.

- [ ] Mapear os dados atuais do Apps Script/Sheets: usuários, autenticação, progresso, XP, tickets, partidas, estatísticas, ranking e erros para revisão.
- [ ] Desenhar o schema inicial do Supabase e as relações entre usuário, partida, recompensa, estatística e conteúdo clínico.
- [ ] Definir as políticas RLS por tabela antes de expor dados pelo Data API; nenhum cliente poderá receber a chave `service_role`.
- [ ] Criar uma camada JavaScript compartilhada para regras de XP, tickets, validação, jogos e revisão inteligente, reutilizável pelo web e pelo futuro app mobile.
- [ ] Fazer um primeiro vertical slice: autenticação, leitura do perfil e gravação idempotente de uma partida de teste no Supabase.
- [ ] Medir latência e comparar a experiência com o fluxo atual antes de migrar os demais modos.
- [ ] Registrar plano de rollback e manter Apps Script/Sheets como fonte de retorno até a homologação.
- [ ] Depois da validação web, iniciar o app mobile com React Native + Expo reutilizando a camada JavaScript compartilhada.

Fora do escopo de hoje: reescrever o frontend em Next.js, converter o projeto para TypeScript, migrar todos os modos de uma vez ou desligar o backend atual antes da homologação.

### Início da implementação — 30/09

Mapeamento inicial registrado em [migracao-supabase.md](migracao-supabase.md). Criada entrada compartilhada JavaScript para os motores existentes e transporte HTTP independente da interface, com timeout e sem repetição automática de gravações. 76 testes passaram; lint e build passaram. Permanece o aviso de bundle acima de 500 kB.

O único projeto Supabase conectado é `eu-jogo-tu-jogas` e contém dados de outro jogo. A definição do projeto destino está pendente com o usuário antes de qualquer alteração remota. Auth, schema remoto, API, importação e validação no navegador ainda pendentes; o transporte novo ainda não foi ativado.

### Projeto separado criado e primeira API publicada — 30/09

Usuário confirmou criação em `Raphael-Ribeiro-Pereira's Org`, com custo informado de US$ 0/mês. Projeto `caca-med` (`lruzndfqfivlvcckvgbw`) criado e ativo em São Paulo. Schema inicial e API de perfil/treinos publicados. RLS e permissões diretas conferidos, persistência atômica/deduplicação/conflito testados no banco com rollback, endpoint sem credencial retornou HTTP 401. 77 testes locais passaram. Transferência de contas e histórico, demais modos e homologação no navegador continuam pendentes. Detalhes em [migracao-supabase.md](migracao-supabase.md).

### Estado consolidado — 30/09, após homologação remota

Este bloco substitui o status das etapas anteriores. Usuário autorizou continuação sem paradas de checkpoint.

- [x] Mapear dados, criar projeto separado em São Paulo e schema privado com RLS.
- [x] Criar camada JavaScript compartilhada, API protegida e confirmação atômica de perfil, histórico e recibos.
- [x] Importar dois perfis, 35 respostas de treino, quatro revisões, 16 recibos e banco de palavras.
- [x] Integrar todos os modos no frontend local, ranking e edição do perfil.
- [x] Vincular a identidade real ao Supabase preservando progresso; manter login Firebase como ponte nesta etapa.
- [x] Homologar todos os motores pela API real, incluindo duas rodadas de Quiz, repetição DDX, reenvio, cruzadinha e revisão sem recompensa.
- [x] Medir 50 chamadas no navegador: média 410 ms, mediana 398 ms, p95 560 ms. Perfil real preservado.
- [x] Iniciar otimização de abertura com carregamento das telas sob demanda; lint, build e 82 testes passaram.
- [x] Documentar evidências, limitações, tentativas e rollback em [auditoria-supabase-2026-09-30.md](auditoria-supabase-2026-09-30.md).
- [x] Concluir estratégia de senhas antigas e configurar Google OAuth no Supabase antes de retirar a ponte Firebase. Senhas antigas têm migração por login válido; o Google OAuth foi configurado, os retornos autorizados foram registrados e o login real local foi validado preservando XP, tickets e histórico. A ponte Firebase continua ativa como fallback até a homologação pública.
- [ ] Reconciliar a origem imediatamente antes da troca de produção, publicar manualmente na Vercel e homologar o domínio público.
- [ ] Medir abertura a frio/mobile e carga concorrente.
- [ ] Manter revisão clínica do conteúdo, piloto atual, pendências da Batalha diagnóstica e futuro mobile após esta migração.

Não considerar a migração integral concluída enquanto login nativo e produção não estiverem validados. Nenhum reset de senha, desligamento do Firebase ou publicação automática foi feito.
