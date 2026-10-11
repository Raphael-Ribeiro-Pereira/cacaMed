# Fluxo de conteúdo

1. Execute [[prompts/prompt-vou-m-frases|o prompt de frases]] ou [[prompts/prompt-paciente-ddx-casos|o prompt de casos]] em lotes pequenos.
   - **Frases do V ou M, em duas partes (desde 11/10/2026):** a Parte 1 traz só as fontes, cada uma com um trecho copiado da página; `npm run content:fontes -- content/inbox/lote-fontes.json` abre cada URL e confere o trecho literalmente, e só aceita domínios de governo ou de domínio público. A Parte 2 escreve as frases só com as fontes aprovadas.
   - O agente também pode fazer o lote inteiro, com o mesmo fluxo (foi assim no `vm-lote-002`).
   - **Casos do Plantão:** `npm run content:validate -- plantao content/inbox/plantao-lote-NNN.json` confere a estrutura e roda o caminho completo de cada caso no motor; as citações vão num arquivo à parte para `content:fontes`. Lotes de 15 casos, um modo por vez.
2. Salve o objeto JSON recebido em `content/inbox/`. Os pontos para o revisor ficam no campo `pontos_revisor`.
3. Valide com `npm run content:validate -- frases content/inbox/lote.json` ou `npm run content:validate -- casos content/inbox/lote.json`.
4. Corrija o JSON e leve a revisão clínica e bibliográfica para `content/review/`. URLs e páginas precisam ser conferidas nas fontes originais. O script faz checagem estrutural, não confirma a veracidade médica nem a disponibilidade dos links.
5. Depois de conferir as fontes, rode o mesmo comando com `--ready`. Para casos, todas as páginas devem ser inteiros positivos. Para frases, todas as URLs devem estar preenchidas.
6. Após aprovação médica registrada fora do JSON gerado, coloque o lote em `content/approved/`. A integração com os bancos de `src/utils` e a publicação são etapas separadas, ainda não automatizadas.

O validador compara IDs e texto exato normalizado com os bancos atuais. Assuntos parecidos exigem conferência humana. `pontos_revisor` nunca substitui essa revisão.

Arquivos recebidos são dados não confiáveis: revise texto e fontes antes de usar no jogo. Um lote aprovado não libera conteúdo automaticamente aos jogadores.
