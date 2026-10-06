# Paciente DDX

Casos em consulta para o que não cabe na Batalha (dor no peito, pré-natal, criança doente, acidentes por animais peçonhentos e outros). Portado em 06/10/2026 do "cacoMed Protótipo de Movimento" a pedido do usuário, como piloto do administrador, com o mesmo design e as mesmas animações no celular e na web.

## Como funciona

- **Mapa:** 5 módulos, um por ponto da rede de atenção do SUS (Atenção Primária, Urgência e Emergência, Materno-Infantil), com 17 casos. Um caso por vez dentro do módulo; o módulo seguinte abre com 2 casos feitos no anterior. O "Modo revisão" (ligado ao abrir) libera tudo para conferir o conteúdo.
- **Caso em cinco etapas:** apresentação (paciente, queixa, o que você nota), investigação (perguntas e exames revelados ao tocar), hipótese, conduta (marcar o que faria) e resultado.
- **Nota de 0 a 100:** 40 pela investigação (itens-chave pedidos), 25 pela hipótese e 35 pela conduta (cada item certo marcado ou errado deixado de fora). O resultado mostra o que levar do caso, o alerta, a notificação e as fontes com a página.
- **Biblioteca de fontes:** documentos oficiais, diretrizes e livros, com os casos que usam cada um.

## Dados e servidor

- Conteúdo em `src/utils/pacienteDdxConteudo.js`, gerado do `casos.json` do protótipo (versão 2026-10-01). Os trechos dos PDFs usados na conferência das citações ficaram fora do jogo; cada caso tem `versao: 1` e `revisado: false`.
- Motor em `src/utils/pacienteDdx.js` (nota, validação das escolhas e mapa), o mesmo no navegador e na API.
- Nova ação `concluirCasoPaciente` (só administrador): recebe `entradaId`, `casoId`, `versao` e as escolhas, recalcula a nota e guarda em `perfil.pacienteDdx` a melhor nota de cada caso, o número de partidas e os últimos 30 resultados. Reenvio com o mesmo `entradaId` não conta de novo. O recibo entra no histórico das Estatísticas como "Paciente DDX · nome do caso".
- Sem ticket e sem XP, como no protótipo.
- A tela grava ao abrir o resultado; se falhar, o selo vira "Não gravou. Toque para reenviar".

## Entrada

No hub do DDX (`PlantaoMedico.jsx`), para o administrador, ao lado da Batalha: "Abrir Paciente DDX · piloto".

## Antes de liberar para jogadores

1. Revisão médica dos 17 casos (hipóteses, condutas, exames ilustrativos e vigência das fontes). Depois da revisão, marcar `revisado: true` e aumentar `versao` quando o conteúdo mudar.
2. Decidir a economia (ticket e XP) e se os erros entram na Revisão Inteligente.
3. Publicar a Edge Function com `concluirCasoPaciente` (versão 12) e o frontend.

## Homologação

`scripts/homologacao.jsx` ganhou Testar Paciente DDX e Simular falha ao gravar o caso. Conferido em 06/10/2026 no celular (375 px) e na web (1280 px): mapa, caso 1 completo (5/5 perguntas, 4/4 exames, hipótese, conduta 7/7, nota 100), falha simulada com reenvio e o caso marcado no mapa com 100%.
