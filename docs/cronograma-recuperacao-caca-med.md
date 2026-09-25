# Caça-Med — diagnóstico e cronograma de recuperação

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
| 25/09/2026 | Qualidade do código e dados de progresso | Implementado e conferido | ESLint sem erros/avisos; 11 testes passaram; build passou. Removido payload de recompensa que já não era utilizado. Patentes e contadores de cruzadinhas compartilham utilitários. Histórico recente é limitado a 30; menu, perfil e estatísticas agora exibem 49 partidas acumuladas após a vitória de teste. Ranking global foi aberto (#2 por nível, #1 por letras, #2 por tempo), com ordenação e ausência de tempo verificadas. |

### Pendências para homologação final web

- [ ] Testar primeira entrada do tutorial em conta realmente nova e persistência após novo login; a conta autenticada usada hoje já possuía partidas.
- [ ] Simular falha de rede no salvamento e confirmar tentativa de novo envio sem duplicar recompensa.
- [ ] Conferir foco e leitura do relatório em leitor de tela e zoom real de 200%.
- [ ] Definir e implementar a fonte pública do ranking global e as regras do Firestore: a consulta atual lê a coleção `usuarios` inteira para montar a lista, incluindo documentos que contêm campos privados. A interface só exibe nome e métricas, mas a consulta do cliente ainda recebe o documento completo.
- [ ] Revisar publicação web e dados de produção após os itens acima. A reformulação de DDX, Hardcore e IA vem depois dessa homologação.

Para cada correção, registrar ID, commit no padrão Conventional Commits, verificação realizada e risco remanescente. Preservar alterações existentes do usuário, inclusive `docs/guia_conventional_commits.md`.
