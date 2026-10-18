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
- [ ] **Revisão médica** dos lotes pendentes: plantão lote 1 (15 casos), erro médico (lotes 1 e 2), causa e efeito (lotes 1 a 3), e a lista de [[decisoes-para-responder|decisões para responder]].
- [ ] **Testar em aparelho real** (iPhone e Android) seguindo o [roteiro](roteiro-smartphone.md).

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

## Depois de 22/10

- Editar perfil (etapa, faculdade, matéria) e crachá, se aprovado.
- Revisão Inteligente v2, app offline e demais itens do [cronograma de 09/10](cronograma-recuperacao-caca-med.md) continuam na fila, sem data.
