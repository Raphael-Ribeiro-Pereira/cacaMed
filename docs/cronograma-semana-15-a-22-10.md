# Cronograma da semana (15/10 a 22/10/2026)

Atualizado em 15/10/2026, depois da publicação da API v16 (cruzadinha) e do site `dpl_2rrQWaNcimhRyv46t6KNeS2FKUSv`. Regra: deploy só às quintas, com o "sim" do usuário no dia. Índice de pendências: [[pendencias|Pendências]].

## Hoje, quinta 15/10 (já feito)

- [x] API `cacamed-api` **v16** publicada a partir do branch `release/cruzadinha-1510` (memória de palavras e dicas sem IA). Conferido: `palavras` e `ranking` 200, `registrarPartida` sem login 401.
- [x] Site com as dicas sem IA e a memória de palavras (`dpl_2rrQWaNcimhRyv46t6KNeS2FKUSv`). Ponto de volta: `dpl_Ak8wHt3EzusRgHXh4ZPKoy3nsjNu`.
- [ ] **Conferir no celular** uma cruzadinha completa de um tópico de nível 3 e, numa segunda partida, se as palavras mudam. (Fazer a qualquer hora, sem deploy.)

## Sexta 16 a quarta 21/10: trabalho sem deploy

**Usuário**
- [ ] **Painel do Supabase (S-10/S-11):** responder a pergunta do Client ID do Google x número do projeto Firebase, para atualizar a [[seguranca|auditoria]].
- [ ] **Teste de login real** no site: conta comum e Google. Conferir os avisos CSP `[Report Only]` no console.
- [ ] **Decidir o fim do tópico** (pendência 9): recomeçar o ciclo com aviso, mostrar quantas faltam, priorizar erros ou pedir mais palavras.
- [ ] **Domínio e Resend (ou Gmail só do jogo como ponte):** para o e-mail do cadastro e da recuperação de senha. Sem isso não há cadastro com código.
- [x] **Revisão médica dos lotes** (aprovada pelo usuário, conferida em 19/10/2026): Plantão lote 1, Erro médico lotes 1 e 2, Causa e efeito lotes 1 a 3 e `vm-lote-002`. Já integrados com `revisado: true` (Plantão 32 de 33, Erro médico 27 de 28, Causa e efeito 35 de 36; só o caso piloto de cada um segue sem revisão). Resta a lista de [[decisoes-para-responder|decisões para responder]] e a revisão do que vier em lotes novos.
- [x] **Testar em aparelho real** (iPhone e Android): passou tudo normal, informado pelo usuário em 19/10/2026.

**Agente (branch de trabalho, sem publicar)**
- [x] **Edição de etapa, faculdade e matéria no perfil** (feita na `main` em 16/10; publica junto do cadastro com código, API antes do site).
- [x] **Mostrar etapa e faculdade no crachá** (frente do crachá, feito na `main` em 16/10; se ficar poluído, passar para o verso).
- [ ] **Cadastro com código:** deixar pronto para a quinta, desde que o SMTP esteja configurado (ver [[cadastro-com-codigo|cadastro com código]]). Sem SMTP, não publicar.
- [ ] **Preparar o pacote de quinta** dos itens de segurança do dia 22 (abaixo), sem publicar antes.

## Quinta 22/10: publicação (com o "sim" do usuário)

Pauta do dia, na ordem:
1. **Web design:** revisão da versão web (decisões de design do usuário). Já decidido: o cartão do jogador no rodapé da barra lateral vira o botão do Perfil; saem o item "Perfil" da lista e o cartão do canto superior direito ([[entrada-menu-casca#Alteração pedida em 16/10/2026 (web, feita na `main`, falta publicar)|detalhe]]).
2. **Cruzadinha emitida pelo servidor (S-02 e S-14)**, já feita na `main` em 17/10 junto com as **dicas por planilha** e o fim do filtro de palavras por nível ([[cruzadinha-palavras-e-dicas#Dicas por planilha e grade no servidor (17/10/2026)|detalhe]]). Publicar a API antes do site. As planilhas de dicas entram quando o usuário mandar os links (só dados, sem publicar código).
3. **Batalha fora do pacote (S-05)**, feito na `main` em 18/10: o conteúdo clínico das doenças sem revisão vem da API (`conteudoBatalha`). Os gabaritos dos casos revisados ficam no aparelho, como decidido no app offline.
4. **S-06** (já no código e na API desde 15/10) e o restante da **S-08**: HMAC do `idPublico` feito na `main` em 17/10; na publicação, criar o segredo `CACAMED_ID_PUBLICO_SEGREDO` **depois** de a API e o site estarem no ar.
5. ~~**Índice único de username** e **limite de tamanho do perfil**~~ já aplicados em 15/10 (conferido em 17/10).
6. **CSP:** sair do `Report-Only` só se o console não tiver avisos do dia anterior.
7. **Dois títulos para quem não é de Medicina** (Infiltrado/Infiltrada + título épico da matéria; commit `2acd519`, só site).
8. **Ponto de volta:** anotar o deploy anterior antes de publicar.

Publicação: migrações primeiro, API depois, site por último, cada um com conferência. Registrar nas pendências ao final.

## Roteiro do pacote de quinta (preparado em 18/10/2026)

O que entra, desde a publicação de 16/10 (site `fc202a0`, API v18). A limpeza das contas sem confirmação já foi aplicada no banco em 17/10.

**API** (tudo compatível com o site de hoje, que continua funcionando se só a API subir):
- cruzadinha emitida pelo servidor, dicas por planilha com memória por palavra, sem filtro de palavras por nível e com várias colunas de dica (`emitirCruzadinha`, `dbc0bff`, `40fb1a9`);
- ID público com HMAC e a ação `meuIdPublico` (S-08, `491af65`);
- conteúdo da Batalha só pela API (`conteudoBatalha`, S-05, `51a5fd9`);
- CORS das pré-visualizações deste projeto na Vercel (`1be5494`).

**Site** (depende da API nova para a grade no servidor e para a Batalha; sem ela, a cruzadinha monta a grade sozinha):
- Firebase fora do app e CSP aplicado (S-04, S-10, S-16, `af74fb3`); token vencido fora do endereço (`3a72c9d`);
- dois títulos para quem não é de Medicina (`2acd519`); cruzadinha, perfil e Batalha da API nova.

**Antes da quinta:** testar na pré-visualização da Vercel (depois dos dois ajustes do usuário nos painéis): entrar com senha e com Google, cadastro com código, troca de senha, cruzadinha completa, ranking (ver se o jogador aparece marcado) e Batalha do administrador. Conferir o console (CSP aplicado).

**Na quinta, nesta ordem, com o "sim" do usuário:**
1. Anotar os pontos de volta: site `dpl_41ThD325jEAAgQRK3DhhKhzfMKiC`, API v18.
2. `npm test`, `npm run lint` e `npm run build` (o `postbuild` confere o pacote).
3. Publicar a API (`npx supabase functions deploy cacamed-api --project-ref lruzndfqfivlvcckvgbw --no-verify-jwt --use-api`) e conferir: `palavras`, `ranking` e `coroas` 200, POST sem login 401, CORS de `cacamed.com`.
4. Publicar o site (Vercel, produção, commit da `main`) e conferir o pacote (sem Firebase, sem conteúdo clínico da Batalha) e o login.
5. Criar o segredo `CACAMED_ID_PUBLICO_SEGREDO` (valor aleatório, gerado e gravado pelo agente com `supabase secrets set`, sem passar pelo chat) e conferir que o jogador continua se achando no ranking.
6. Registrar nas pendências.

## Depois de 22/10

- Editar perfil (etapa, faculdade, matéria) e crachá, se aprovado.
- Revisão Inteligente v2, app offline e demais itens do [cronograma de 09/10](cronograma-recuperacao-caca-med.md) continuam na fila, sem data.
