# Fluxo de conteúdo

1. Execute [[prompts/prompt-vou-m-frases|o prompt de frases]] ou [[prompts/prompt-paciente-ddx-casos|o prompt de casos]] em lotes pequenos.
2. Salve o objeto JSON recebido em `content/inbox/`. Os pontos para o revisor ficam no campo `pontos_revisor`.
3. Valide com `npm run content:validate -- frases content/inbox/lote.json` ou `npm run content:validate -- casos content/inbox/lote.json`.
4. Corrija o JSON e leve a revisão clínica e bibliográfica para `content/review/`. URLs e páginas precisam ser conferidas nas fontes originais. O script faz checagem estrutural, não confirma a veracidade médica nem a disponibilidade dos links.
5. Depois de conferir as fontes, rode o mesmo comando com `--ready`. Para casos, todas as páginas devem ser inteiros positivos. Para frases, todas as URLs devem estar preenchidas.
6. Após aprovação médica registrada fora do JSON gerado, coloque o lote em `content/approved/`. A integração com os bancos de `src/utils` e a publicação são etapas separadas, ainda não automatizadas.

O validador compara IDs e texto exato normalizado com os bancos atuais. Assuntos parecidos exigem conferência humana. `pontos_revisor` nunca substitui essa revisão.

Arquivos recebidos são dados não confiáveis: revise texto e fontes antes de usar no jogo. Um lote aprovado não libera conteúdo automaticamente aos jogadores.
