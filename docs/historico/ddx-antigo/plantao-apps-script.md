# DDX — Plantão médico

## Entrega local de 27/09/2026

Primeiro modo implementado com um caso respiratório piloto, sem IA. Hardcore e o antigo fluxo DDX foram retirados. Erro médico e Causa e efeito ainda não são jogáveis.

O piloto é fictício e educativo, sem doses prescritas. Permanece restrito a administradores (`revisado: false`) até revisão clínica. Não representa uma simulação fisiológica completa: as respostas e a evolução são determinadas pelo roteiro.

## Decisões técnicas

- Motor compartilhado entre navegador e Apps Script; o servidor recalcula o resultado, sem aceitar XP enviado pelo cliente.
- Um ticket por entrada identificada por UUID; retomada e reenvio da mesma entrada não cobram outro ticket.
- Perguntas e exames respondem localmente. Salvar progresso, reavaliar e encerrar enviam o histórico completo à planilha; sair com ações não salvas exige confirmação.
- Tempo simulado por ação, sem cronômetro real nem bônus de velocidade.
- Pontos separados em raciocínio, segurança e eficiência; caminho completo do piloto concede 250 XP. Exames desnecessários e encerramento inadequado reduzem a pontuação.
- Apenas a primeira conclusão de cada versão de caso concede XP. Repetições servem para estudo.
- Progresso em `perfil.ddx` na aba PerfisGoogle, sem nova aba nem Firestore. XP também entra em `xpTopicos.DDX-RESPIRATORIO` para compor o nível global.
- Histórico recente limitado a 30 atendimentos; identificadores de casos concluídos preservados para evitar novo XP em repetições.
- Consulta do progresso salvo permite recuperar uma aba desatualizada ou um pedido com falha; descarta ações locais mediante confirmação.

## Publicação pendente

Na retomada, a publicação foi confirmada no editor: Código.gs e Plantao.gs são idênticos aos arquivos locais e a implantação existente está na versão 9, de 27/09/2026 às 22:50, "Plantão medico sem IA". Os 36 testes, lint e build locais passaram. Ranking e ponte publicados responderam HTTP 200. A espera inicial da ponte passou de 15 para 60 segundos após timeout também relatado no Chrome; o app carregou e recarregou corretamente no navegador integrado após a mudança. A causa exata da intermitência anterior ainda não foi determinada.

Uma partida real do piloto admin foi validada: início consumiu um ticket (3 → 2), retomada não cobrou novamente, seis ações salvas reapareceram após recarregar e o relatório confirmou 250 XP sem omissões essenciais. O menu exibiu 5.222 XP (antes: 4.972) e um plantão seguro. Repetição sem XP, idempotência e bloqueio de caso não revisado seguem verificados por testes automatizados; não foram testados novamente com contas reais nesta rodada. Falta revisão clínica, conferência visual mobile e publicação do frontend atualizado.

1. Execute `npm run sync:plantao` após alterar o catálogo/motor.
2. No projeto Apps Script da planilha autorizada, substitua Código.gs pelo conteúdo integral de `docs/apps-script-ranking.gs`.
3. Crie um arquivo de script chamado Plantao.gs e cole `docs/plantao-motor.gs`. Não cole o motor duas vezes.
4. Salve e atualize a implantação existente escolhendo uma nova versão; mantenha URL, origens autorizadas e permissões atuais. Não habilite faturamento.
5. Publique o frontend somente com o backend atualizado. A versão 9 do backend foi confirmada nesta retomada; a homologação de ponta a ponta e a publicação do novo frontend continuam pendentes.

## Roteiro de validação

1. Admin com ticket: iniciar o piloto; voltar e retomar. Esperado: exatamente um ticket consumido.
2. Avaliar gravidade; perguntar início, antecedentes, medicamentos, alergias e associados; realizar ausculta e medir pico de fluxo. Esperado: respostas imediatamente, sem recarregar a página.
3. Salvar progresso, sair e retornar. Esperado: ações salvas preservadas, sem cobrar novo ticket.
4. Registrar asma; selecionar broncodilatador e anti-inflamatório; reavaliar, orientar e dar alta. Esperado: melhora roteirizada, nenhuma omissão essencial e 250 XP confirmado.
5. Conferir perfil, nível global e ranking; repetir o caso. Esperado: novo ticket consumido e nenhum XP adicional.
6. Encerrar precocemente em nova repetição. Esperado: relatório de omissões e penalidade; sem XP de repetição.
7. Interromper rede no salvamento; restaurar e reenviar. Esperado: sem duplicar XP ou tickets. Consultar progresso salvo deve recuperar o estado confirmado.
8. Conta comum: piloto indisponível enquanto não revisado; tentativa direta também rejeitada pelo backend.

## Revisão clínica antes da liberação

Revisar apresentação, gravidade, respostas, exames, condutas, evolução, critérios de alta/encaminhamento e rubrica de pontos. Referência inicial: https://ginasthma.org/reports/. Marcar o caso como revisado somente após aprovação da consultora, regenerar o motor e atualizar as duas entregas.
