# DDX — Causa e efeito

Terceiro modo, sem IA em tempo de execução, com o mesmo paciente respiratório fictício do Plantão. O desafio exige revisão clínica própria e aprovação do caso-base antes de liberar para jogadores; admin pode validar o piloto.

## Regras aprovadas em 28/09/2026

- Quatro etapas: mecanismo, consequência (sequência causal), compensação e efeito da intervenção.
- Um ticket por desafio. Retomada e reenvio não cobram novamente.
- 25 XP por etapa correta, até 100 XP; sem bônus de tempo.
- XP somente na primeira conclusão de cada versão. Repetição registra desempenho com zero XP.

## Implementação e validação

Respostas são confirmadas individualmente na planilha e tornam-se imutáveis. Relatório ao concluir mostra resposta escolhida, resposta esperada quando necessário e explicação de cada relação. Perfil `causaEfeito` e aba de estatísticas próprios preservam Plantão e Erro médico. XP entra no total e no tópico `DDX-CAUSA-EFEITO-RESPIRATORIO`.

API: `iniciarRelacao` recebe `relacaoId` e `entradaId`; `responderRelacao` recebe `entradaId` e a sequência cumulativa de respostas. Servidor valida versão, alternativas e continuidade; ignora XP informado pelo cliente. Reenvio da última etapa recupera a projeção do ranking sem nova recompensa. Histórico recente limitado a 30 entradas; versões concluídas permanecem para evitar novo XP.

Motor incluído em `docs/plantao-motor.gs`, gerado por `npm run sync:plantao`. API e motor foram comparados integralmente com o editor remoto. Backend publicado na versão 13 em 28/09/2026 às 12:07, mantendo URL e permissões. Frontend atualizado local; Vercel não foi publicado nesta etapa.

46 testes, lint e build passaram. Cobertura inclui bloqueio de conta comum, retomada, cobrança idempotente, respostas inválidas, reescrita rejeitada, repetição sem XP e resposta perdida no ranking. Validação visual autenticada pendente de login admin.

Roteiro: iniciar com ticket disponível; responder mecanismo; recarregar; retomar na consequência sem novo ticket; concluir demais etapas; verificar relatório, estatísticas próprias e ranking; repetir para conferir zero XP. Não alterar saldos reais apenas para simular o teste.

## Fontes para revisão clínica

- [NHLBI — fisiopatologia da asma](https://www.ncbi.nlm.nih.gov/books/NBK7223/).
- [Clinical Methods — Wheezing and Asthma](https://www.ncbi.nlm.nih.gov/books/NBK358/).
- [Estudo de resposta ao albuterol e mecânica respiratória](https://pubmed.ncbi.nlm.nih.gov/19669002/).

As fontes apoiam as relações; não substituem aprovação clínica do gabarito e das alternativas. O desafio não usa frequência respiratória ou chiado isolados como prova de ventilação adequada.
