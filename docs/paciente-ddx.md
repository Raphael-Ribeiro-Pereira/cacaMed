# Paciente DDX

Casos em consulta para o que não cabe na Batalha (dor no peito, pré-natal, criança doente, acidentes por animais peçonhentos e outros). Portado em 06/10/2026 do "cacoMed Protótipo de Movimento" a pedido do usuário, como piloto do administrador, com o mesmo design e as mesmas animações no celular e na web.

## Como funciona

- **Mapa:** 5 módulos, um por ponto da rede de atenção do SUS (Atenção Primária, Urgência e Emergência, Materno-Infantil), com 17 casos. Um caso por vez dentro do módulo; o módulo seguinte abre com 2 casos feitos no anterior. O "Modo revisão" (ligado ao abrir) libera tudo para conferir o conteúdo.
- **Caso em cinco etapas:** apresentação (paciente, queixa, o que você nota), investigação (perguntas e exames revelados ao tocar), hipótese, conduta (marcar o que faria) e resultado.
- **Nota de 0 a 100:** 40 pela investigação (itens-chave pedidos), 25 pela hipótese e 35 pela conduta (cada item certo marcado ou errado deixado de fora). O resultado mostra o que levar do caso, o alerta, a notificação e as fontes com a página.
- **Biblioteca de fontes:** documentos oficiais, diretrizes e livros, com os casos que usam cada um.

## Dados e servidor

- Conteúdo em `src/utils/pacienteDdxConteudo.js`, gerado do `casos.json` do protótipo (versão 2026-10-01). Os trechos dos PDFs usados na conferência das citações ficaram fora do jogo; cada caso tem `versao: 1` e `revisado: false`.
- Motor do navegador em `src/utils/pacienteDdx.js` (mapa e nota). A nota usa `src/utils/pacienteDdxNota.js`, o mesmo cálculo da API, que só recebe o gabarito (`pacienteDdxGabarito.js`: versão, nome e as marcações de cada lista). O texto dos casos não vai para a Edge Function. Depois de mudar um caso, rodar `node scripts/gerar-gabarito-paciente.mjs`; o teste acusa gabarito desatualizado.
- Nova ação `concluirCasoPaciente` (só administrador): recebe `entradaId`, `casoId`, `versao` e as escolhas, recalcula a nota e guarda em `perfil.pacienteDdx` a melhor nota de cada caso, o número de partidas e os últimos 30 resultados. Reenvio com o mesmo `entradaId` não conta de novo. O recibo entra no histórico das Estatísticas como "Paciente DDX · nome do caso".
- Sem ticket e sem XP, como no protótipo.
- A tela grava ao abrir o resultado; se falhar, o selo vira "Não gravou. Toque para reenviar".

## Entrada

No hub do DDX (`PlantaoMedico.jsx`), para o administrador, ao lado da Batalha: "Abrir Paciente DDX · piloto".

## Antes de liberar para jogadores

1. Revisão médica dos 17 casos (hipóteses, condutas, exames ilustrativos e vigência das fontes). Depois da revisão, marcar `revisado: true` e aumentar `versao` quando o conteúdo mudar.
2. ~~Decidir a economia e se os erros entram na Revisão Inteligente~~: decidido em 07/10/2026, ainda não implementado.
   - **XP:** 300 + bônus, como os outros modos do DDX, sem multiplicador por nível. O caso não cobra ticket ([economia v3](economia-v3.md)).
   - **Revisão:** os erros entram na Revisão Inteligente. O jogador refaz os casos errados e depois recebe uma revisão detalhada escrita pela LLM, com a fonte da biblioteca do caso ([Revisão v2](revisao-inteligente.md#versão-2-decidida-em-07102026-ainda-não-implementada)).
3. ~~Publicar a Edge Function com `concluirCasoPaciente` e o frontend~~: feito em 06/10/2026, a pedido do usuário. Edge Function `cacamed-api` versão 12, com os 23 arquivos conferidos contra as cópias locais (só os escapes `\u` de `coroas.js` e `importarBancoCSV.js` chegaram decodificados, o que dá o mesmo resultado). Coroas, ranking e palavras responderam 200, e um POST sem login respondeu 401. Frontend na Vercel: deploy `dpl_3SHAdbbc2VasNiycApMEBExtFKeF`, commit d028855. Para voltar ao frontend anterior, promover `dpl_BGGkokiUtgDNhNoHQLmSPuARv8T4` (commit d0bd23e); a versão 12 da API continua compatível com ele.

## Liberação e novos casos (09/10/2026)

- O usuário informou que **já validou** os casos que existem hoje. A liberação para jogadores está no [cronograma](cronograma-recuperacao-caca-med.md#fase-c--ddx-para-o-público), com a lista de modos a confirmar e a dúvida sobre liberar antes ou depois da economia v3.
- Novos casos: use o [prompt para o ChatGPT](prompts/prompt-paciente-ddx-casos.md). O jogo exige o mesmo formato dos 17 casos atuais, com fontes da biblioteca e páginas conferidas (os testes recusam `pag` que não seja um inteiro). Por isso o ChatGPT devolve `"pag": 0` e eu confiro cada citação contra os PDFs antes de aceitar o caso.

## Homologação

`scripts/homologacao.jsx` ganhou Testar Paciente DDX e Simular falha ao gravar o caso. Conferido em 06/10/2026 no celular (375 px) e na web (1280 px): mapa, caso 1 completo (5/5 perguntas, 4/4 exames, hipótese, conduta 7/7, nota 100), falha simulada com reenvio e o caso marcado no mapa com 100%.
