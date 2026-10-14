# Histórico

Documentos que **não valem mais** como especificação e ficam guardados para consulta. Quando algum deles disser algo diferente dos documentos vigentes, valem os vigentes: [[pendencias|Pendências]], [[ddx|DDX]] e os índices do [[Inicio|Início]]. Arquivado em 13/10/2026.

> [!warning] Caminhos antigos
> Os textos abaixo citam caminhos da época, como `docs/plantao-motor.gs`. Esses arquivos agora ficam em `docs/historico/apps-script/`.

## DDX da época do Apps Script e do Paciente DDX

- [[historico/ddx-antigo/plantao-apps-script|Plantão médico (27/09)]]: o piloto de asma no Apps Script.
- [[historico/ddx-antigo/erro-medico-apps-script|Erro médico (27/09)]]: 4 etapas, dependia de um caso do Plantão.
- [[historico/ddx-antigo/causa-efeito-apps-script|Causa e efeito (28/09)]]: 4 etapas com alternativas.
- [[historico/ddx-antigo/paciente-ddx|Paciente DDX (06/10)]]: modo fundido no Plantão em 13/10. O código (tela, motor e ação do servidor) foi removido em 13/10; sobrou só `pacienteDdxConteudo.js`, a origem dos casos `pdx-*`.
- [[historico/ddx-antigo/prompt-paciente-ddx-casos|Prompt do ChatGPT para o Paciente DDX]]: aposentado. Os lotes agora seguem o [[Fluxo de conteúdo]].

## Registros datados (setembro e outubro de 2026)

- [[historico/registros/auditoria-modos-2026-09-29|Auditoria do Quiz, do V ou M e da Revisão (29/09)]], com as capturas em `registros/evidencias/`.
- [[historico/registros/auditoria-supabase-2026-09-30|Homologação do Supabase (30/09)]].
- [[historico/registros/homologacao-final-2026-09-30|Homologação final do Supabase (30/09)]].
- [[historico/registros/reconciliacao-producao-2026-09-30|Reconciliação e medição de produção (30/09)]], com os dados em `medicao-producao-2026-09-30.json` e `evidencias-homologacao-2026-09-30.json`.
- [[historico/registros/incidente-quiz-rodada-mudou|Incidente do Quiz]].
- [[historico/registros/incidente-cadastro-google|Incidente do cadastro Google]].

## Backend antigo: Apps Script e planilhas

Ficam em `historico/apps-script/`: `apps-script-ranking.gs`, `plantao-motor.gs`, `treinos-api.gs`, `revisao-api.gs` e `treinos-motor.gs`. O backend atual é a Edge Function do Supabase. Estes arquivos **continuam sendo lidos** pelo teste `src/utils/appsScriptRanking.test.js` e por `npm run sync:plantao`, que só regenera o `treinos-motor.gs`; o `plantao-motor.gs` está congelado desde 13/10. Aposentá-los é o item da arrumação técnica sobre o Apps Script, em [[pendencias|Pendências]].

## Cofre antigo do Obsidian

`historico/vault-antigo/` era um cofre aninhado, criado antes de `docs/` virar o cofre. Fica guardado só por causa das configurações. Abra sempre a pasta `docs/` como cofre.
