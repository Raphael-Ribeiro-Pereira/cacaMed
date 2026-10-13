# Dossiê: Erro médico, lote 1

Feito pelo agente em 13/10/2026. Cada trecho citado foi conferido literalmente na página ou no PDF indicado (`npm run content:fontes`). **Aguarda a sua revisão médica**; nada disso está no jogo ainda.

Os nomes, os sinais vitais e os detalhes das histórias são fictícios. As decisões centrais seguem as fontes brasileiras citadas. Pontos de atenção estão no fim.

## 1. Hidratação sem reavaliação na dengue · Infeccioso

`aud-dengue-reavaliacao` · **Dona Marta, 47 anos** · Dengue com sinal de alarme atendida no pronto atendimento.

**Prontuário** (a falha está marcada):

- 08:10 — Chegou no 5º dia de febre, que cedeu ontem, com dor abdominal contínua e tontura ao levantar.
- 08:15 — Hipotensão postural. Classificada como grupo C (sinal de alarme).
- 08:20 — Iniciado soro fisiológico 0,9%, 10 mL/kg na primeira hora.
- 08:30 — Solicitados hemograma completo, albumina e transaminases.
- 08:45 — Amostras colhidas e enviadas ao laboratório.
- **FALHA →** 10:00 — Hemograma recebido e arquivado. Sem registro de sinais vitais, diurese ou novo hematócrito desde o início da hidratação.

- **Categoria certa:** Omissão
- **Correção certa:** Reavaliar sinais vitais e diurese após a primeira hora e repetir o hematócrito em duas horas
- Outras correções oferecidas: "Dar alta com hidratação oral em casa porque o hemograma já foi colhido"; "Suspender a hidratação até o hematócrito voltar ao normal"
- Por que a linha: O registro das 10:00 mostra duas horas sem reavaliação depois de iniciar a reposição de volume. As linhas anteriores seguem o grupo C.
- Por que a categoria: Faltou a reavaliação programada (sinais vitais, pressão, diurese e hematócrito): é omissão de cuidado, não erro de dose nem de horário.
- Por que a correção: No grupo C, reavalia-se após a primeira hora (sinais vitais, pressão e diurese) e o hematócrito em duas horas; sem melhora, repete-se a fase de expansão.

**Fontes**

- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Reavaliação Alta Após uma hora: reavaliar o paciente (sinais vitais, PA, avaliar diurese – desejável 1 mL/kg/h)" → Reavaliação após a primeira hora.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Manter a hidratação de 10 mL/kg/hora na segunda hora até a avaliação do hematócrito, que deverá ocorrer em duas horas após a etapa de reposição volêmica." → Hematócrito duas horas depois da reposição.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Se não houver melhora do hematócrito ou dos sinais hemo­ dinâmicos, repetir a fase de expansão até três vezes." → Repetir a expansão sem melhora.

## 2. Espera pelo hemograma no grupo C · Infeccioso

`aud-dengue-atraso-reposicao` · **Seu Valter, 52 anos** · Dengue com sinais de alarme no pronto atendimento.

**Prontuário** (a falha está marcada):

- 09:00 — Chegou com vômitos persistentes, dor abdominal intensa e hipotensão postural.
- 09:10 — Classificado como grupo C. Solicitados hemograma e albumina.
- **FALHA →** 09:20 — Mantido na maca, sem soro, aguardando o resultado do hemograma.
- 10:40 — Hemograma com hematócrito em alta.
- 10:45 — Iniciado soro fisiológico 0,9%, 10 mL/kg na primeira hora.
- 11:45 — Reavaliado: pressão em melhora e diurese presente.

- **Categoria certa:** Atraso
- **Correção certa:** Iniciar a reposição volêmica imediata, sem esperar o resultado dos exames
- Outras correções oferecidas: "Trocar a reposição por hidratação oral até o exame ficar pronto"; "Esperar o hematócrito e só então decidir se hidrata"
- Por que a linha: A linha das 09:20 mostra que a hidratação ficou parada mais de uma hora esperando exame. O restante da sequência está correto, mas começou tarde.
- Por que a categoria: O cuidado correto foi feito, só que tarde: é atraso. A reposição só começou às 10:45, depois do resultado do exame.
- Por que a correção: No grupo C a reposição de volume é imediata, em qualquer ponto de atenção, mesmo sem exames complementares.

**Fontes**

- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Iniciar a reposição volêmica imediata, em qualquer ponto de atenção, independentemente do nível de complexidade, inclusive durante eventual transferência para uma unidade de referência (mesmo na ausência de exames complementares)" → Reposição imediata, mesmo sem exames.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Hemoconcentração ou sinais de alarme Conduzir como grupo C." → Sinais de alarme levam ao grupo C.

## 3. Dengue leve com AAS na receita · Infeccioso

`aud-dengue-aas` · **Rafael, 26 anos** · Dengue sem sinais de alarme atendida na unidade básica.

**Prontuário** (a falha está marcada):

- 08:20 — Chegou no 3º dia de febre alta, dor atrás dos olhos e dor no corpo.
- 08:30 — Sem sinais de alarme e prova do laço negativa. Classificado como grupo A.
- 08:40 — Prescrita hidratação oral e orientado repouso.
- **FALHA →** 08:45 — Prescrito AAS para a dor no corpo e a febre.
- 08:50 — Orientado a procurar o serviço se surgirem sinais de alarme ou sangramento.
- 08:55 — Caso suspeito notificado.

- **Categoria certa:** Conduta inadequada
- **Correção certa:** Prescrever paracetamol ou dipirona e não usar salicilatos nem anti-inflamatórios
- Outras correções oferecidas: "Manter o AAS e acrescentar corticoide"; "Trocar o AAS por ibuprofeno"
- Por que a linha: A prescrição das 08:45 é a única que foge do manual. As demais linhas seguem o grupo A.
- Por que a categoria: O medicamento foi dado em dose e horário que não estão em questão: o erro é a escolha do fármaco, ou seja, conduta inadequada.
- Por que a correção: No grupo A usam-se paracetamol ou dipirona; salicilatos e anti-inflamatórios não esteroides ficam de fora, porque podem causar ou agravar sangramentos.

**Fontes**

- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Prescrever paracetamol e/ou dipirona, conforme orientações do Apêndice H. c. Não utilizar salicilatos ou anti-inflamatórios não esteroides e corticosteroides." → Sem salicilatos nem Aine no grupo A.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Se for no aparelho digestivo, será mais frequente seu surgimento em pacientes com histórico de úlcera péptica ou gastrites, assim como da ingestão de ácido acetilsalicílico (AAS), anti-inflamatórios não esteroides (Aine) e anticoagulantes." → Hemorragia digestiva com AAS, Aine e anticoagulantes.

## 4. Dipirona em dose dez vezes maior · Infeccioso

`aud-dengue-dipirona-adulto` · **Dona Tereza, 39 anos** · Dengue sem sinais de alarme atendida na unidade básica.

**Prontuário** (a falha está marcada):

- 14:00 — Chegou no 3º dia de febre, sem sinais de alarme. Classificada como grupo A.
- 14:10 — Prescrita hidratação oral conforme o cartão de acompanhamento.
- **FALHA →** 14:15 — Prescrito: dipirona 500 mg, 10 comprimidos de 6/6 horas, se dor ou febre.
- 14:20 — Orientações de retorno entregues.
- 14:25 — Cartão de acompanhamento preenchido.
- 14:30 — Notificação registrada.

- **Categoria certa:** Erro grande de medicação
- **Correção certa:** Dipirona 500 mg, 1 comprimido até de 6/6 horas, se dor ou febre
- Outras correções oferecidas: "Trocar a dipirona por AAS 500 mg de 6/6 horas"; "Dipirona 500 mg, 5 comprimidos de 6/6 horas, se dor ou febre"
- Por que a linha: A prescrição das 14:15 traz 10 comprimidos por dose, quando o manual indica 1.
- Por que a categoria: Dez vezes a dose é erro grande de medicação: o fármaco é o certo, a quantidade é que está errada.
- Por que a correção: A dipirona do adulto é 1 comprimido de 500 mg (ou 20 gotas) até de 6 em 6 horas.

**Fontes**

- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "20 gotas ou 1 comprimido (500 mg) até de 6/6 horas." → Dose da dipirona no adulto.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Não utilizar doses maiores que a recomendada, considerando que doses elevadas são hepatotóxicas." → Doses acima da recomendada não devem ser usadas.

## 5. Vírgula errada na dose da criança · Infeccioso

`aud-dengue-dipirona-crianca` · **Alice, 4 anos** · Dengue sem sinais de alarme atendida na unidade básica.

**Prontuário** (a falha está marcada):

- 09:00 — Menina de 4 anos, 2º dia de febre, sem sinais de alarme. Grupo A.
- 09:10 — Peso registrado: 15 kg.
- **FALHA →** 09:15 — Prescrito: dipirona 100 mg/kg/dose de 6/6 horas, se febre.
- 09:20 — Mãe orientada a oferecer hidratação oral, 100 mL/kg por dia.
- 09:25 — Orientados sinais de alarme e retorno.
- 09:30 — Caso suspeito notificado.

- **Categoria certa:** Erro grande de medicação
- **Correção certa:** Dipirona 10 mg/kg/dose, até de 6/6 horas, respeitando a dose máxima
- Outras correções oferecidas: "Dipirona 50 mg/kg/dose, até de 6/6 horas"; "Dipirona 100 mg/kg/dose, mas só uma vez por dia"
- Por que a linha: A prescrição das 09:15 usa 100 mg/kg por dose; para 15 kg isso dá 1.500 mg de uma vez.
- Por que a categoria: Dose dez vezes maior que a indicada: erro grande de medicação, não de conduta nem de registro.
- Por que a correção: A dipirona da criança é 10 mg/kg por dose, até de 6 em 6 horas, respeitando a dose máxima por peso e idade (150 mg por dose aos 15 kg).

**Fontes**

- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "10 mg/kg/dose até de 6/6 horas (respeitar a dose máxima por peso e idade)." → Dose da dipirona na criança.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Acima de 10 kg a 20 kg: 100 mL/kg/dia" → Hidratação oral de 100 mL/kg/dia para 10 a 20 kg.

## 6. Furosemida no choque da dengue · Infeccioso

`aud-dengue-furosemida` · **Seu Bento, 49 anos** · Dengue com choque no pronto atendimento.

**Prontuário** (a falha está marcada):

- 10:00 — 5º dia de dengue. PA 80/50, pele fria e enchimento capilar de 5 segundos.
- 10:05 — Anotado: perda de plasma por extravasamento, com hipovolemia.
- 10:10 — Acesso venoso obtido.
- **FALHA →** 10:15 — Prescrita furosemida venosa para melhorar a pressão.
- 10:20 — Colhido hematócrito.
- 10:30 — Paciente mais hipotenso, urina escassa.

- **Categoria certa:** Erro lógico de causa e efeito
- **Correção certa:** Repor volume com soro fisiológico e reavaliar a perfusão
- Outras correções oferecidas: "Restringir líquidos para evitar edema pulmonar"; "Manter a furosemida e acrescentar um vasodilatador"
- Por que a linha: A prescrição das 10:15 contradiz o raciocínio anotado às 10:05: o problema é falta de volume, e a furosemida o tira ainda mais.
- Por que a categoria: O erro está no raciocínio de causa e efeito: tratar hipovolemia com um diurético, que perde mais líquido.
- Por que a correção: No choque da dengue a causa é a perda de plasma, então o tratamento é repor volume com cristaloide, com reavaliação frequente.

**Fontes**

- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "De um modo geral, os óbitos por dengue ocorrem em pacientes com dengue grave em que o choque está presente. Este, por sua vez, é resultante do extravasamento plasmático, complicado por sangramento e/ou sobrecarga hídrica." → Choque pelo extravasamento de plasma.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Ocorre quando um volume crítico de plasma é perdido por meio do extravasamento ou sangramento" → Choque pela perda de volume de plasma.

## 7. Hidratação oral sem o volume na receita · Infeccioso

`aud-dengue-volume-hidratacao` · **Joana, 31 anos** · Dengue sem sinais de alarme atendida na unidade básica.

**Prontuário** (a falha está marcada):

- 15:00 — Chegou no 2º dia de febre, dor no corpo e dor atrás dos olhos.
- 15:10 — Sem sinais de alarme, prova do laço negativa. Grupo A.
- 15:15 — Prescrito paracetamol conforme o manual.
- **FALHA →** 15:20 — Registrado: "beber bastante líquido".
- 15:25 — Orientados sinais de alarme e retorno.
- 15:30 — Caso suspeito notificado.

- **Categoria certa:** Falha de registro
- **Correção certa:** Registrar na receita ou no cartão o volume por dia (80 mL/kg/dia no adulto)
- Outras correções oferecidas: "Registrar apenas "hidratação oral" para não confundir a paciente"; "Trocar a hidratação oral por soro venoso em casa"
- Por que a linha: A linha das 15:20 é vaga: não diz quanto beber, nem como dividir o volume ao longo do dia.
- Por que a categoria: O cuidado foi lembrado, mas o registro não dá a instrução que o manual pede: falha de registro.
- Por que a correção: O manual pede especificar, na receita ou no cartão de acompanhamento, o volume a ser ingerido (80 mL/kg por dia para adultos, com um terço em soro de reidratação nas primeiras horas).

**Fontes**

- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Especificar, em receita médica ou no cartão de acompanhamento da dengue, o volume a ser ingerido." → Registro do volume a ser ingerido.
- [Dengue: diagnóstico e manejo clínico, adulto e criança (6ª ed.)](https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf) (Ministério da Saúde): "Nas primeiras 4 a 6 horas do atendimento, considerar a oferta de 1/3 do volume." → Um terço do volume nas primeiras horas.

## 8. Dois bloqueadores do mesmo sistema · Cardiovascular

`aud-ieca-bra` · **Seu Ademar, 62 anos** · Hipertenso em acompanhamento na unidade básica.

**Prontuário** (a falha está marcada):

- 09:00 — Hipertenso há 8 anos. PA 158/96. Em uso de IECA.
- 09:10 — Sem queixa de tosse. Creatinina anterior normal.
- 09:15 — Orientadas dieta com menos sal e atividade física.
- **FALHA →** 09:20 — Prescrito, além do IECA, um bloqueador do receptor de angiotensina II.
- 09:25 — Orientada adesão e retorno em 30 dias.
- 09:30 — Solicitados creatinina e potássio.

- **Categoria certa:** Conduta inadequada
- **Correção certa:** Evitar a associação e acrescentar um diurético tiazídico ou um bloqueador de canal de cálcio
- Outras correções oferecidas: "Trocar o IECA por betabloqueador de primeira linha"; "Manter os dois e dobrar a dose de ambos"
- Por que a linha: A associação prescrita às 09:20 é a que o caderno manda evitar. As outras linhas estão adequadas.
- Por que a categoria: A dose e o registro estão certos; a escolha de juntar duas drogas do mesmo sistema é conduta inadequada.
- Por que a correção: A associação de IECA com bloqueador do receptor de angiotensina II deve ser evitada porque aumenta o risco de disfunção renal; associa-se, em vez disso, tiazídico ou bloqueador de canal de cálcio.

**Fontes**

- [Cadernos de Atenção Básica nº 37: Estratégias para o cuidado da pessoa com doença crônica, hipertensão arterial sistêmica](https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf) (Ministério da Saúde): "A associação da Ieca com antagonistas da angiotensina II, defendida com base em estudos distorcidos pelo viés corporativo e pela propaganda, deve ser evitada, pois aumenta o risco de disfunção renal" → Evitar IECA com antagonista da angiotensina II.
- [Cadernos de Atenção Básica nº 37: Estratégias para o cuidado da pessoa com doença crônica, hipertensão arterial sistêmica](https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf) (Ministério da Saúde): "A associação entre diuréticos tiazídicos (ou ACC) e Ieca (ou antagonistas da angiotensina II, ou betabloqueadores) é extremamente racional" → Associação racional com tiazídico ou bloqueador de cálcio.

## 9. IECA mantido sem exames de controle · Cardiovascular

`aud-ieca-creatinina-omissao` · **Dona Zilda, 68 anos** · Hipertensa em retorno de seis meses na unidade básica.

**Prontuário** (a falha está marcada):

- 10:00 — Retorno após seis meses do início do IECA. PA 132/80.
- 10:10 — Sem tosse nem edema. Adesão boa.
- 10:15 — Peso estável.
- **FALHA →** 10:20 — Mantida a dose do IECA e renovada a receita.
- 10:25 — Orientada dieta com menos sal.
- 10:30 — Retorno agendado para seis meses.

- **Categoria certa:** Omissão
- **Correção certa:** Solicitar creatinina e potássio antes de renovar a receita
- Outras correções oferecidas: "Suspender o IECA por precaução"; "Renovar a receita e pedir os exames só se surgir sintoma"
- Por que a linha: A linha das 10:20 renova a receita sem ter pedido creatinina nem potássio, que não aparecem em nenhuma linha.
- Por que a categoria: O que deveria ter sido feito não consta no atendimento: é omissão, não erro de dose nem de registro.
- Por que a correção: Ao usar IECA, a creatinina deve ser medida entre três e seis meses, junto com o potássio, para detectar queda da função renal ou hiperpotassemia.

**Fontes**

- [Cadernos de Atenção Básica nº 37: Estratégias para o cuidado da pessoa com doença crônica, hipertensão arterial sistêmica](https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf) (Ministério da Saúde): "Quando do emprego de Ieca e antagonistas da angiotensina II ou de seu aumento de dose, deve-se aferir creatinina após três a seis meses." → Medir a creatinina entre três e seis meses.
- [Cadernos de Atenção Básica nº 37: Estratégias para o cuidado da pessoa com doença crônica, hipertensão arterial sistêmica](https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf) (Ministério da Saúde): "Hiperpotassemia pode decorrer de associação de agentes poupadores de potássio (Ieca ou diuréticos poupadores) ou de insuficiência renal." → Risco de hiperpotassemia com IECA.

## 10. Tontura tratada com mais remédio · Cardiovascular

`aud-tontura-hipotensao` · **Seu Raul, 71 anos** · Hipertenso com tontura ao levantar, na unidade básica.

**Prontuário** (a falha está marcada):

- 08:30 — Hipertenso em uso de dois anti-hipertensivos. Queixa de tontura ao levantar da cama.
- 08:40 — PA deitado 150/90.
- 08:45 — PA em pé: 118/76, com tontura.
- 08:50 — Anotado: queda de mais de 20 mmHg na sistólica ao levantar.
- **FALHA →** 08:55 — Aumentada a dose dos dois anti-hipertensivos para melhorar o controle.
- 09:00 — Retorno marcado para 30 dias.

- **Categoria certa:** Erro lógico de causa e efeito
- **Correção certa:** Titular as doses em uso para reduzir o efeito hipotensor e reavaliar
- Outras correções oferecidas: "Manter as doses e orientar levantar mais depressa"; "Trocar por um vasodilatador direto"
- Por que a linha: A linha das 08:55 aumenta o remédio justamente quando a medida das 08:50 mostrou que a pressão cai demais ao levantar.
- Por que a categoria: O raciocínio de causa e efeito foi invertido: a tontura vem de excesso de efeito hipotensor, e aumentar a dose o piora.
- Por que a correção: Se há hipotensão postural real, titula-se a dose para baixo, evitando deixar a pressão descontrolada.

**Fontes**

- [Cadernos de Atenção Básica nº 37: Estratégias para o cuidado da pessoa com doença crônica, hipertensão arterial sistêmica](https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf) (Ministério da Saúde): "A pesquisa de hipotensão postural (queda de mais de 20 mmHg na pressão sistólica ao levantar da posição deitada) deve ser feita nesses casos" → Pesquisar a hipotensão postural diante da tontura.
- [Cadernos de Atenção Básica nº 37: Estratégias para o cuidado da pessoa com doença crônica, hipertensão arterial sistêmica](https://bvsms.saude.gov.br/bvs/publicacoes/hipertensao_arterial_sistemica_cab37.pdf) (Ministério da Saúde): "Se houver real hipotensão postural, deve-se titular as doses em uso" → Titular as doses se a hipotensão for real.

## Pontos de atenção para a revisão

- Todas as histórias são fictícias. As decisões centrais (a falha, a categoria e a correção) seguem os trechos citados; os horários e os detalhes do atendimento são do roteiro.
- Doses: só aparecem as que o manual do Ministério da Saúde traz (dipirona 500 mg até 6/6 h no adulto, 10 mg/kg/dose na criança, 10 mL/kg de soro fisiológico na primeira hora, 80 e 100 mL/kg/dia de hidratação oral).
- aud-dengue-dipirona-adulto e aud-dengue-dipirona-crianca: o erro de dez vezes é a "ordem de grandeza" pedida; confira se a quantidade absurda de comprimidos (10 de 500 mg) é suficientemente óbvia para o aluno.
- aud-ieca-bra: a fonte manda evitar a associação IECA + antagonista da angiotensina II; "acrescentar tiazídico ou bloqueador de cálcio" vem do mesmo caderno, que chama essa associação de racional.
- aud-dengue-furosemida: o caderno descreve o choque como perda de plasma; "repor volume" é a conduta do mesmo manual. A furosemida como erro é raciocínio fisiológico, sem trecho que a cite.
