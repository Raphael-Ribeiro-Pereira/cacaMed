# Fluxo de conteúdo

Voltar a [[Prompts e conteúdo]]. Vale para o V ou M, o Quiz e os 3 modos do [[ddx|DDX]].

## Regras

- **Fontes brasileiras primeiro:** Ministério da Saúde, Conitec, Fiocruz, sociedades médicas e revistas da SciELO. CDC e NIH entram só para doenças que não existem no Brasil. O NCBI (PubMed, StatPearls) não é aceito, porque o texto é das editoras.
- **Nada inventado:** cada item tem pelo menos 2 citações, cada uma com trecho de até 60 palavras copiado da fonte. `npm run content:fontes` abre cada URL (HTML ou PDF) e procura o trecho literalmente.
- **Doses** só entram quando a fonte brasileira citar a quantidade.
- **Revisão em lotes de 15**, um modo por vez. Nenhum lote entra no jogo sem a aprovação do usuário.

## Passo a passo

1. **Gerar** o lote em `content/inbox/<modo>-lote-NNN.json`, com as citações em `…-fontes.json`. O agente faz os lotes a partir das fontes lidas. Para o V ou M também existe [[prompts/prompt-vou-m-frases|o prompt de duas partes]] para o ChatGPT.
2. **Conferir as fontes:** `npm run content:fontes -- content/inbox/<lote>-fontes.json`. Só domínios da lista em `scripts/conferir-fontes.mjs`, sempre com `https`.
3. **Validar a estrutura:** `npm run content:validate -- <frases|casos|plantao|erro|causa> content/inbox/<lote>.json`. No Plantão, o validador também roda o caminho completo do caso no motor.
4. **Dossiê** em `content/review/<lote>.md`: cada item com as cartas ou etapas, as fontes, os trechos e os pontos para o revisor (campo `pontos_revisor`).
5. **Revisão do usuário.** Depois da aprovação, o lote vai para `content/approved/`.
6. **Integrar:** `node scripts/integrar-ddx.mjs <plantao|erro|causa>` ou `node scripts/integrar-frases.mjs`, com `revisado: true`. Depois, `node scripts/sincronizar-supabase.mjs` e os testes.
7. **Publicar** numa quinta-feira, com o "sim" do usuário ([[Desenvolvimento e operação]]).

Arquivos recebidos são dados não confiáveis: revise o texto e as fontes antes de usar no jogo. O validador confere a estrutura, não a veracidade médica.
