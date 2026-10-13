# DDX — Erro médico

Piloto respiratório fictício reutilizando paciente, sinais vitais e fonte do Plantão. O atendimento auditado é uma variante própria e não presume dano a partir de um desfecho desconhecido. Permanece restrito ao administrador até revisão clínica independente do caso-base do Plantão; ambas as aprovações são necessárias.

## Regras aprovadas nesta conversa

- Um ticket por análise; retomada e reenvio não cobram novamente.
- Quatro etapas: falha, evidência, correção e justificativa de segurança.
- 25 XP por etapa correta, até 100 XP. Sem bônus de tempo.
- Somente a primeira conclusão de cada versão concede XP; repetir serve para revisão.

## Implementação

- Cada resposta confirmada é gravada na planilha antes da próxima etapa; respostas anteriores são imutáveis. O relatório aparece apenas ao concluir as quatro etapas.
- Perfil separado em `erroMedico`, preservando `ddx` do Plantão. Histórico recente limitado a 30 análises; versões concluídas permanecem registradas para impedir XP repetido.
- Apps Script valida alternativas, ordem, versão e identidade da entrada, calcula o resultado e atualiza o ranking. Reenvio após falha na atualização do ranking recupera o resultado sem repetir XP.
- XP entra em `DDX-ERRO-MEDICO-RESPIRATORIO` e no total global; estatísticas têm uma aba própria.
- Mesmo arquivo gerado `Plantao.gs` contém os motores de Plantão e Erro médico. Executar `npm run sync:plantao` após alterar qualquer motor.
- Backend publicado na implantação existente, versão 11, em 27/09/2026 às 23:44, mantendo URL e permissões. Frontend disponível localmente; publicação Vercel pendente.

## Validação

42 testes, lint e build passaram. Testes verificam alternativas inválidas, retomada, alteração de respostas anteriores, cobrança idempotente, repetição sem XP, estatísticas separadas, bloqueio do piloto para conta comum e recuperação após resposta perdida.

Validação real com admin: um ticket consumido (1 → 0); primeira resposta salva; após recarregar, retomada na segunda etapa mesmo sem tickets; conclusão com 4/4 e 100 XP, levando o total de 5.222 para 5.322. Relatório reaberto com respostas e explicações persistidas. Repetição sem XP validada em testes automatizados; não iniciada novamente na conta real por falta de tickets. A revisão clínica deve conferir todos os registros, alternativas, justificativas e critérios antes de liberar para jogadores.

