# Triagem do lote `vm-lote-001` (Verdade ou mentira)

Feita pelo agente em 10/10/2026, sobre `content/inbox/vm-lote-001.json`. É uma triagem de formato, de duplicatas e de fontes. **Não é revisão médica.** O lote continua na caixa de entrada e **não está pronto**.

## Resumo

| Ponto | Resultado |
| --- | --- |
| Formato (`npm run content:validate`) | 0 erros |
| Conceitos | 39 (o prompt pede 40) |
| Conceito repetido do Quiz | nenhum. Os 12 avisos de tema da versão anterior do validador eram falsos alarmes: tema igual é permitido, conceito igual não. O validador agora confere o conceito |
| Conceito repetido dentro do lote | nenhum |
| `pontos_revisor` | vazio, embora várias fontes estejam erradas (ver abaixo) |
| Fontes | **pelo menos 12 de 36 URLs apontam para capítulos de outro assunto** |

## Fontes

Conferência automática pelo título do capítulo do NCBI Bookshelf registrado no PubMed (busca pelo número NBK na API oficial E-utilities; o site do NCBI pede captcha e não foi aberto). O título indica o assunto do capítulo. A conferência final continua sendo abrir a página.

### Fonte de outro assunto (trocar)

| Conceito | URL citada | Capítulo real |
| --- | --- | --- |
| triade-cervical | NBK538324 | Pulmonary Compliance |
| canal-carpal | NBK470244 | Uhthoff Phenomenon |
| triangulo-femoral | NBK547703 | Female External Genitalia |
| pneumocito-tipo-dois | NBK470599 | Sick Sinus Syndrome |
| epitelio-transicional | NBK541051 | Estrogen Therapy |
| fechamento-tubo-neural | NBK542191 | Breast Fat Necrosis |
| gram-positiva-parede | NBK7619 | Legionella |
| hipersensibilidade-tipo-i | NBK546606 | Gout |
| inibidor-eca-tosse | NBK482435 | Cystitis |
| apoptose-caspases | NBK499949 | Functional Asplenism |
| dpoctrombose | NBK441847 | Acute Myocarditis |
| necrose-coagulativa | NBK430935 | Liquefactive Necrosis (a necrose do capítulo é outra) |

### Assunto vizinho (conferir se cobre a frase)

| Conceito | URL citada | Capítulo real |
| --- | --- | --- |
| surfactante-pulmonar | NBK538324 | Pulmonary Compliance |
| pressao-pulso | NBK538226 | Mean Arterial Pressure |
| pressao-jugular, fremito-vocal | NBK553213 | Vital Sign Assessment |

### Assunto compatível (falta abrir a página)

`sistema-renina` (Renin Angiotensin System), `mycobacterium-acido-resistente` e `granuloma-tuberculose` (Tuberculosis Overview), `heparina-antitrombina` (Heparin), `metformina-gliconeogenese` (Metformin), `sinal-murphy` (Acute Cholecystitis), `hiponatremia-sintomas` (Hyponatremia), `asma-obstrucao-reversivel` (Pathophysiology of Asthma), `placenta-previa` (Placenta Previa).

### Sem registro no PubMed (conferir à mão)

- `glicolise-citoplasmatica`, `ciclo-ureia` e `hemoglobina-cooperativa` (NBK22593, NBK22589, NBK22580): parecem seções de livro-texto antigo de bioquímica.
- `complemento-inato` e `ig-mucosa` (NBK27100, NBK27144): parecem seções de livro-texto de imunologia.
- `esporos-bacterianos` (NBK562938) e `febre-lactente-jovem` (NBK551604).
- Fora do NCBI: `esquistossomose-cercaria` e `malaria-plasmodium` (gov.br), `oxiuro-prurido` (CDC), `reidratacao-oral` (OMS), `pr-eclampsia` (ACOG), `atencao-primaria-coordenacao` (portaria no BVS). A URL de `vigilancia-epidemiologica` fica numa página de **saúde do trabalhador** do gov.br, o que é suspeito.

## Outros pontos

1. **Falta um conceito** para fechar 40.
2. **IDs estranhos:**
   - `dpoctrombose` trata de trombose venosa e embolia pulmonar, não de DPOC (sugestão: `tvp-embolia`);
   - `pr-eclampsia` perdeu o "e" (sugestão: `pre-eclampsia`).

   Trocar o conceito troca também os IDs das frases.
3. **Temas sem padrão:** "Fisiologia", "Fisiologia cardiovascular" e "Fisiologia respiratória"; "Semiologia", "Semiologia respiratória" e "Semiologia abdominal". O Quiz usa "Fisiologia renal". A Revisão v2 completa as sessões por tema, então temas fragmentados rendem menos itens parecidos. É uma decisão do usuário: padronizar por área ampla ou manter o subtema.
4. **Um par por conceito:** a Revisão v2 pede vários itens por conceito ([regra](../../docs/jogos-e-economia-v2.md#bancos-separados-quiz-e-verdade-ou-mentira-09102026)). Este lote tem só o par verdadeiro/falso de cada conceito.
5. **Para a revisão médica:** frases cuja redação pode confundir, sem juízo clínico do agente:
   - `sinal-murphy` (verdadeira): "durante a inspiração" sem citar a palpação nem a interrupção da inspiração;
   - `pressao-jugular` (falsa): falsa só pelo "necessariamente", o que fica fácil demais.

## Próximo passo

Corrigir as fontes antes da revisão médica. Duas saídas, a escolher pelo usuário:

- **(a)** pedir ao ChatGPT que refaça só as fontes, sem inventar e marcando `null` quando não tiver certeza;
- **(b)** buscar as fontes à mão.

O prompt já proíbe inventar URLs e mesmo assim o lote veio com URLs inventadas e `pontos_revisor` vazio. Vale considerar pedir `fonte: null` sempre e conferir as fontes à parte.
