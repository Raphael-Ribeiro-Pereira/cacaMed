# Dossiê do lote `plantao-lote-001` (Plantão médico)

Feito pelo agente em 11/10/2026 com o mesmo método do V ou M: primeiro as fontes, depois os casos. São 15 casos, um modo por vez, como decidido. **Aguarda a sua revisão médica**; nada disso está no jogo ainda.

**Como ler:**
- Cada caso mostra a resposta certa (hipótese e destino), todas as ações com o que o jogador vê, os pontos e as fontes.
- As 66 citações foram conferidas literalmente nas páginas (`npm run content:fontes`, 66 de 66).
- O caminho completo de cada caso foi rodado no motor real: sai seguro e vale 250 XP. Destino errado e hipótese errada não saem seguros.
- Os detalhes de cada história (nomes, sinais vitais, falas, resultados) são fictícios, como no caso piloto. Pontos de atenção estão no fim.

## 1. Fala enrolada e fraqueza súbita · Neurológico

`neuro-avc-1` · **Sr. Antônio, 68 anos** · A esposa conta: "Ele começou a enrolar a fala e o braço direito ficou fraco."

- Sinais vitais: FC 88 bpm · FR 16 irpm · SpO₂ 97% em ar ambiente · PA 168/94 mmHg · T 36,5°C
- **Resposta certa:** AVC agudo como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, inicio, sinais, avc, acionar, registrar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar consciência, via aérea e respiração | Acordado, responde a perguntas com fala arrastada. Via aérea livre, respira sem esforço. | +30 |
| Anamnese | A que horas começou? Quando foi visto bem pela última vez? | A esposa conta que ele estava bem às 9h e às 9h20 começou com a fala enrolada. Agora são 10h. | +30 |
| Exame físico | Examinar face, força dos braços e pernas e fala | Boca desviada, fraqueza no braço e na perna direitos e fala arrastada. Tudo começou de repente. | +30 |
| Anamnese | Quais doenças tem e quais remédios usa? | Tem pressão alta e toma o remédio de forma irregular. Não usa anticoagulante. | +15 |
| Anamnese | Teve dor de cabeça forte e repentina? | Nega dor de cabeça. | +10 |
| Exames | Pedir tomografia de crânio aqui e esperar o laudo antes de acionar a transferência | A unidade não tem tomógrafo e a espera atrasou a transferência. O exame de imagem é feito no hospital de referência, sem atrasar o transporte. | -20 |
| Exames | Pedir radiografia de tórax de rotina | Sem achados. O exame não muda a conduta e consumiu tempo. | -10 |
| Hipóteses | Registrar AVC agudo como hipótese principal | Hipótese registrada: déficit súbito de um lado do corpo e alteração da fala. | +30 |
| Hipóteses | Registrar enxaqueca com aura como hipótese principal | Hipótese registrada, mas um déficit súbito de um lado do corpo, sem dor de cabeça, não deve ser atribuído a enxaqueca. | 0 |
| Hipóteses | Registrar crise de ansiedade como hipótese principal | Hipótese registrada, mas os sinais focais não se explicam por ansiedade. | 0 |
| Conduta | Acionar transporte de urgência para hospital com atendimento de AVC, informando o horário de início (depois de: gravidade, inicio) | Transporte acionado. A equipe de destino foi avisada do horário de início e se prepara para receber o paciente. | +40 |
| Evolução | Monitorar sinais vitais e nível de consciência até a chegada do transporte (depois de: acionar) | Sem piora neurológica durante a espera. FC 86 bpm, FR 16 irpm, SpO₂ 97% em ar ambiente, PA 164/92 mmHg, T 36,5°C. | +20 |
| Conduta | Registrar horário de início, achados e medidas para a equipe de destino (depois de: inicio, sinais) | Registro entregue à equipe do transporte. | +25 |
| Encerramento | Encerrar com alta orientada | Alta registrada. Em suspeita de AVC, a conduta é transferir com urgência: os tratamentos que mais ajudam dependem de reconhecer e diagnosticar o AVC em poucas horas. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente transferido para o hospital de referência em AVC, com o horário de início registrado. | encerra |

**Fontes**

- [Signs and Symptoms of Stroke](https://www.cdc.gov/stroke/signs-symptoms/index.html) (CDC): "Sudden numbness or weakness in the face, arm, or leg, especially on one side of the body." → Sinal típico de AVC: déficit súbito de um lado.
- [Signs and Symptoms of Stroke](https://www.cdc.gov/stroke/signs-symptoms/index.html) (CDC): "The stroke treatments that work best are available only if the stroke is recognized and diagnosed within 3 hours of the first symptoms" → O horário de início importa e a alta perde a janela.
- [Treatment and Intervention for Stroke](https://www.cdc.gov/stroke/treatment/index.html) (CDC): "At the hospital, health professionals will ask about your medical history and the time your symptoms started. Brain scans will show what type of stroke you had." → A imagem é feita no hospital; o horário de início guia o tratamento.
- [Treatment and Intervention for Stroke](https://www.cdc.gov/stroke/treatment/index.html) (CDC): "The emergency workers will also collect valuable information that guides treatment and alert hospital medical staff before you arrive at the emergency room" → Avisar a equipe de destino e registrar as informações.

## 2. Febre e confusão em idosa · Infeccioso

`infecto-sepse-1` · **Dona Cleide, 74 anos** · A filha conta: "Ela está com febre e confusa desde ontem, e quase não urinou."

- Sinais vitais: FC 124 bpm · FR 28 irpm · SpO₂ 93% em ar ambiente · PA 86/50 mmHg · T 38,9°C
- **Resposta certa:** sepse de provável foco urinário como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, foco, alergias, sepse, tratamento, reavaliar, comunicar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar consciência, perfusão e respiração | Sonolenta e desorientada, pele fria e úmida, respiração rápida. | +30 |
| Anamnese | Algum sintoma indica onde a infecção começou? | Há três dias tem ardência para urinar e urina com cheiro forte. | +25 |
| Anamnese | Quais doenças tem? Esteve internada recentemente? | É diabética e esteve internada há um mês. | +15 |
| Anamnese | Tem alergia a medicamentos? | Nega alergias. | +15 |
| Exame físico | Examinar tórax, abdome, região lombar e pele | Dor à punho-percussão lombar à direita. Pulmões sem ruídos anormais; pele sem lesões. | +15 |
| Exames | Colher exames de sangue e urina sem atrasar o tratamento | Amostras colhidas em poucos minutos. Os resultados não devem atrasar o tratamento. | +15 |
| Exames | Pedir tomografia de abdome antes de iniciar o tratamento | Exame demorado que atrasou o início do tratamento de uma paciente instável. | -20 |
| Hipóteses | Registrar sepse de provável foco urinário como hipótese principal | Hipótese registrada: infecção com confusão, hipotensão e taquicardia. | +30 |
| Hipóteses | Registrar infecção urinária simples como hipótese principal | Hipótese registrada, mas confusão e pressão baixa indicam uma resposta grave à infecção, não um quadro simples. | 0 |
| Hipóteses | Registrar apenas desidratação como hipótese principal | Hipótese registrada, mas febre e foco urinário apontam para infecção grave. | 0 |
| Conduta | Iniciar o protocolo de sepse da unidade, com antibiótico o quanto antes (depois de: gravidade, alergias) | Equipe inicia o protocolo de sepse, incluindo antibiótico, sem esperar os resultados. | +40 |
| Evolução | Reavaliar logo após as primeiras medidas (depois de: tratamento) | FC 112 bpm, FR 24 irpm, SpO₂ 95% com oxigênio, PA 98/60 mmHg, T 38,4°C. Ainda confusa. | +25 |
| Conduta | Comunicar a gravidade à equipe de destino e registrar o que foi feito (depois de: reavaliar) | Equipe do hospital de referência informada sobre o quadro e as medidas já tomadas. | +20 |
| Encerramento | Encerrar com alta orientada | Alta registrada. Sepse é emergência: sem tratamento rápido e continuado, evolui para lesão de órgãos e morte. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente transferida para unidade de maior complexidade, com o tratamento já iniciado. | encerra |

**Fontes**

- [About Sepsis](https://www.cdc.gov/sepsis/about/index.html) (CDC): "Without fast treatment, sepsis can quickly lead to tissue damage, organ failure, and death." → Sepse é emergência; a alta é insegura.
- [About Sepsis](https://www.cdc.gov/sepsis/about/index.html) (CDC): "Infections that lead to sepsis most often start in the Gastrointestinal tract Lung Skin or Urinary tract." → Procurar o foco, como o urinário.
- [About Sepsis](https://www.cdc.gov/sepsis/about/index.html) (CDC): "Most people who develop sepsis have at least one underlying medical condition or recent hospitalization." → Doença crônica e internação recente aumentam o risco.
- [Clinical Care of Sepsis](https://www.cdc.gov/sepsis/hcp/clinical-care/index.html) (CDC): "Start antibiotics as soon as possible in addition to other therapies appropriate for the patient." → Antibiótico o quanto antes.
- [Clinical Care of Sepsis](https://www.cdc.gov/sepsis/hcp/clinical-care/index.html) (CDC): "Early and frequent reassessment of patients with sepsis should be undertaken" → Reavaliar cedo e com frequência.

## 3. Suor frio e confusão antes do almoço · Endócrino

`endo-hipoglicemia-1` · **Seu Raimundo, 70 anos** · O filho conta: "Ele ficou suado, tremendo e confuso antes do almoço."

- Sinais vitais: FC 104 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 138/82 mmHg · T 36,4°C
- **Resposta certa:** hipoglicemia como hipótese principal; destino: **alta orientada**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, glicemia, medicamentos, hipoglicemia, carboidrato, reavaliar, orientar. Antes da alta: carboidrato, reavaliar, lanche, orientar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar consciência e se consegue engolir com segurança | Acordado e um pouco confuso, obedece a comandos e engole sem dificuldade. | +30 |
| Exames | Medir glicemia capilar | Glicemia capilar de 54 mg/dL. | +30 |
| Anamnese | Quais remédios usa para o diabetes? Comeu hoje? | Toma glibenclamida, uma sulfonilureia, pela manhã. Hoje tomou o remédio e não comeu nada. | +25 |
| Anamnese | Tem doença nos rins ou já teve episódios assim? | Tem doença renal crônica leve. Nunca teve um episódio parecido. | +15 |
| Exames | Pedir tomografia de crânio | Sem alterações. A confusão se explicava pela glicemia baixa. | -20 |
| Hipóteses | Registrar hipoglicemia como hipótese principal | Hipótese registrada: glicemia abaixo de 70 mg/dL com sintomas, em uso de sulfonilureia e sem comer. | +30 |
| Hipóteses | Registrar AVC como hipótese principal | Hipótese registrada, mas não há déficit de um lado do corpo e a glicemia está baixa. | 0 |
| Hipóteses | Registrar desmaio comum como hipótese principal | Hipótese registrada, mas ele não desmaiou e a glicemia explica os sintomas. | 0 |
| Conduta | Oferecer de 15 a 20 g de carboidrato de absorção rápida pela boca (depois de: gravidade, glicemia) | Toma meio copo de suco de fruta comum, sem ser diet. | +35 |
| Conduta | Aplicar glucagon | Não era necessário: ele está acordado e engole. O glucagon serve para a hipoglicemia grave, quando a pessoa não consegue se tratar. | -10 |
| Evolução | Medir a glicemia de novo depois de 15 minutos (depois de: carboidrato) | Glicemia de 98 mg/dL, lúcido e sem suor. FC 86 bpm, FR 16 irpm, SpO₂ 98% em ar ambiente, PA 132/80 mmHg, T 36,4°C. | +30 |
| Conduta | Oferecer um lanche, já que a próxima refeição está a mais de uma hora (depois de: reavaliar) | Come bolachas e uma fruta. | +15 |
| Conduta | Orientar sinais de hipoglicemia e como tratá-la e pedir revisão do remédio com a equipe que o acompanha (depois de: reavaliar) | Família orientada sobre os sinais e a regra dos 15. Registrado o pedido de revisão da sulfonilureia, pela idade e pela doença renal. | +20 |
| Encerramento | Encerrar com alta orientada | Alta com glicemia corrigida, lanche e orientação. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Encaminhamento registrado. Com a glicemia corrigida e o paciente lúcido, o caso podia ser resolvido aqui. | encerra |

**Fontes**

- [Low Blood Glucose (Hypoglycemia)](https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia) (NIDDK/NIH): "For many people with diabetes, this means a blood glucose reading lower than 70 milligrams per deciliter (mg/dL)." → Limite de 70 mg/dL.
- [Low Blood Glucose (Hypoglycemia)](https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia) (NIDDK/NIH): "Eat or drink 15 to 20 grams of glucose or carbohydrates right away." → Tratar com 15 a 20 g de carboidrato.
- [Low Blood Glucose (Hypoglycemia)](https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia) (NIDDK/NIH): "Wait 15 minutes and check your blood glucose level again." → Medir de novo em 15 minutos.
- [Low Blood Glucose (Hypoglycemia)](https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia) (NIDDK/NIH): "If your next meal is more than 1 hour away, have a snack" → Lanche se a refeição estiver longe.
- [Low Blood Glucose (Hypoglycemia)](https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia) (NIDDK/NIH): "Two types of diabetes pills can cause low blood glucose sulfonylureas" → Sulfonilureia causa hipoglicemia.
- [Low Blood Glucose (Hypoglycemia)](https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia) (NIDDK/NIH): "Glucagon —a hormone that raises blood glucose levels—is the best way to treat severely low blood glucose." → Glucagon é para a hipoglicemia grave.

## 4. Vômitos, sede e respiração rápida · Endócrino

`endo-cetoacidose-1` · **Júlia, 19 anos** · "Estou vomitando desde ontem, com muita sede e dor na barriga. Tenho diabetes tipo 1."

- Sinais vitais: FC 118 bpm · FR 30 irpm · SpO₂ 98% em ar ambiente · PA 104/66 mmHg · T 36,9°C
- **Resposta certa:** cetoacidose diabética como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, insulina, glicemia, cetonas, cetoacidose, comunicar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar consciência, respiração e hidratação | Consciente e muito cansada. Respiração rápida e profunda, boca e pele secas. | +30 |
| Anamnese | Como está usando a insulina? | Com o vômito, parou de aplicar a insulina porque não estava comendo. | +30 |
| Anamnese | Que outros sintomas teve nos últimos dias? | Urina muito e sente muita sede há dois dias. A mãe notou hálito com cheiro de fruta. | +25 |
| Exames | Medir glicemia capilar | Glicemia capilar de 412 mg/dL. | +25 |
| Exames | Pesquisar cetonas no sangue ou na urina | Cetonas elevadas. | +25 |
| Exames | Pedir radiografia de abdome | Sem achados. O exame não ajuda no diagnóstico e atrasa a transferência. | -10 |
| Hipóteses | Registrar cetoacidose diabética como hipótese principal | Hipótese registrada: diabetes tipo 1, insulina suspensa, glicemia muito alta, cetonas elevadas e respiração rápida e profunda. | +45 |
| Hipóteses | Registrar gastroenterite como hipótese principal | Hipótese registrada, mas a glicemia alta com cetonas indica cetoacidose; a doença que causa vômitos pode ter sido o gatilho. | 0 |
| Hipóteses | Registrar apendicite como hipótese principal | Hipótese registrada, mas a dor abdominal aqui acompanha a cetoacidose, que explica o quadro. | 0 |
| Conduta | Orientar a voltar a aplicar a insulina em casa e beber água | Inseguro: cetonas elevadas com vômitos são emergência e precisam de tratamento hospitalar. | -20 |
| Conduta | Comunicar ao hospital de destino a glicemia, as cetonas e o quadro (depois de: glicemia, cetonas) | Equipe de destino avisada; vai repor líquidos, eletrólitos e insulina. | +30 |
| Evolução | Monitorar sinais vitais e consciência até a transferência (depois de: gravidade) | Sem piora durante a espera. FC 116 bpm, FR 28 irpm, SpO₂ 98% em ar ambiente, PA 106/66 mmHg, T 36,9°C. | +20 |
| Encerramento | Encerrar com alta orientada | Alta registrada. Cetonas elevadas com vômitos e respiração difícil são emergência; o tratamento é hospitalar. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente transferida para tratamento de emergência da cetoacidose. | encerra |

**Fontes**

- [Diabetic Ketoacidosis](https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html) (CDC): "The two most common causes are: Illness. You may not be able to eat or drink as much as usual, which can make blood sugar hard to manage. Missing insulin shots" → Doença e insulina suspensa são as causas mais comuns.
- [Diabetic Ketoacidosis](https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html) (CDC): "Fast, deep breathing. Dry skin and mouth. Flushed face. Fruity-smelling breath." → Sinais de cetoacidose.
- [Diabetic Ketoacidosis](https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html) (CDC): "Elevated ketones are a sign of DKA. This is a medical emergency that needs to be treated immediately" → Cetonas elevadas são emergência.
- [Diabetic Ketoacidosis](https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html) (CDC): "If you have DKA, you'll be treated in the emergency room or admitted to the hospital." → Tratamento hospitalar: encaminhar.

## 5. Não acorda depois de usar comprimidos · Toxicológico

`tox-opioide-1` · **Homem de cerca de 30 anos** · Os amigos contam: "Ele tomou uns comprimidos de remédio forte para dor com bebida e não acorda direito."

- Sinais vitais: FC 58 bpm · FR 6 irpm · SpO₂ 84% em ar ambiente · PA 100/60 mmHg · T 36,0°C
- **Resposta certa:** overdose de opioide como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, historia, overdose, naloxona, reavaliar, vigiar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar resposta, respiração, pupilas e cor dos lábios | Só responde à dor. Respiração lenta e superficial, pupilas muito pequenas, lábios arroxeados. | +30 |
| Anamnese | Perguntar aos amigos o que ele usou e quando | Comprimidos de um opioide receitado ao avô, com cerveja, há cerca de uma hora. | +30 |
| Exames | Monitorar saturação e frequência respiratória | SpO₂ de 84% e FR de 6 irpm. | +15 |
| Exames | Pedir tomografia de crânio antes de qualquer medida | O exame atrasou o tratamento de um paciente que mal respirava. | -20 |
| Hipóteses | Registrar overdose de opioide como hipótese principal | Hipótese registrada: pupilas muito pequenas, respiração lenta e uso de opioide. | +50 |
| Hipóteses | Registrar só intoxicação alcoólica como hipótese principal | Hipótese registrada, mas pupilas muito pequenas e respiração tão lenta apontam para o opioide. | 0 |
| Hipóteses | Registrar AVC como hipótese principal | Hipótese registrada, mas a história e os sinais apontam para overdose de opioide. | 0 |
| Conduta | Administrar naloxona (depois de: gravidade) | Em poucos minutos volta a respirar melhor e abre os olhos. | +40 |
| Evolução | Reavaliar respiração e consciência depois da naloxona (depois de: naloxona) | Acordado e confuso. FC 76 bpm, FR 14 irpm, SpO₂ 95% em ar ambiente, PA 112/70 mmHg, T 36,2°C. | +30 |
| Conduta | Manter observação contínua, porque o efeito da naloxona pode acabar antes do opioide (depois de: reavaliar) | Equipe mantém vigilância. A naloxona age por 30 a 90 minutos, e muitos opioides duram mais. | +35 |
| Conduta | Liberar com os amigos logo que acordar | Inseguro: o efeito da naloxona pode acabar antes do efeito do opioide, e a respiração pode voltar a ficar lenta. | -20 |
| Encerramento | Encerrar com alta orientada | Alta registrada. Depois da naloxona, a pessoa precisa de observação contínua: a overdose pode voltar quando o efeito da naloxona passa. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente transferido para observação em serviço de maior complexidade. | encerra |

**Fontes**

- [Naloxone DrugFacts](https://nida.nih.gov/publications/drugfacts/naloxone) (NIDA/NIH): "very small pupils slow or shallow breathing" → Sinais de overdose de opioide.
- [Naloxone DrugFacts](https://nida.nih.gov/publications/drugfacts/naloxone) (NIDA/NIH): "Naloxone is a medicine that rapidly reverses an opioid overdose." → Naloxona reverte a overdose.
- [Naloxone DrugFacts](https://nida.nih.gov/publications/drugfacts/naloxone) (NIDA/NIH): "Naloxone works to reverse opioid overdose in the body for only 30 to 90 minutes. But many opioids remain in the body longer than that." → O efeito acaba antes; não liberar logo.
- [Naloxone DrugFacts](https://nida.nih.gov/publications/drugfacts/naloxone) (NIDA/NIH): "People who are given naloxone should be observed constantly until emergency care arrives." → Observação contínua.

## 6. Desmaio no canteiro de obras · Ambiental

`amb-intermacao-1` · **Carlos, 41 anos, pedreiro** · O colega conta: "Ele estava trabalhando no sol, começou a falar enrolado e caiu."

- Sinais vitais: FC 132 bpm · FR 26 irpm · SpO₂ 96% em ar ambiente · PA 98/58 mmHg · T 41,0°C
- **Resposta certa:** intermação (golpe de calor) como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, temperatura, resfriar, intermacao, reavaliar, comunicar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar consciência, respiração e pele | Confuso, fala arrastada. Pele muito quente. Respira rápido, sem obstrução. | +30 |
| Anamnese | Perguntar ao colega como foi o dia de trabalho | Trabalhou desde cedo no sol forte, bebeu pouca água e não parou para descansar. | +20 |
| Exame físico | Confirmar a temperatura corporal | Temperatura de 41,0°C. | +15 |
| Conduta | Levar para local fresco, tirar a roupa de cima e resfriar rápido com água fria, panos molhados e ventilação (depois de: gravidade) | Resfriamento iniciado com água fria e ventilador. | +45 |
| Conduta | Colocar panos frios ou gelo na cabeça, no pescoço, nas axilas e na virilha (depois de: resfriar) | Compressas frias posicionadas. | +20 |
| Exames | Pedir tomografia de crânio antes de resfriar | O exame atrasou o resfriamento, que é a medida urgente. | -20 |
| Hipóteses | Registrar intermação (golpe de calor) como hipótese principal | Hipótese registrada: calor intenso, confusão e temperatura muito alta. | +50 |
| Hipóteses | Registrar exaustão pelo calor como hipótese principal | Hipótese registrada, mas confusão mental e temperatura tão alta indicam o quadro mais grave, a intermação. | 0 |
| Hipóteses | Registrar meningite como hipótese principal | Hipótese registrada, mas a exposição ao calor no trabalho explica o quadro. | 0 |
| Evolução | Reavaliar depois do resfriamento (depois de: resfriar) | Mais acordado. FC 112 bpm, FR 22 irpm, SpO₂ 97% em ar ambiente, PA 106/64 mmHg, T 39,0°C. | +25 |
| Conduta | Acionar o atendimento de emergência e ficar com o paciente até a chegada da equipe (depois de: gravidade) | Equipe de transporte acionada; o resfriamento continua até a chegada. | +25 |
| Encerramento | Encerrar com alta orientada | Alta registrada. A intermação pode causar incapacidade permanente ou morte sem tratamento de emergência. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente transferido para tratamento de emergência, com resfriamento mantido. | encerra |

**Fontes**

- [Heat-related Illnesses](https://www.cdc.gov/niosh/heat-stress/about/illnesses.html) (NIOSH/CDC): "Heat stroke is the most serious heat-related illness." → É o quadro mais grave ligado ao calor.
- [Heat-related Illnesses](https://www.cdc.gov/niosh/heat-stress/about/illnesses.html) (NIOSH/CDC): "Heat stroke can cause permanent disability or death if the person does not receive emergency treatment." → Precisa de tratamento de emergência.
- [Heat-related Illnesses](https://www.cdc.gov/niosh/heat-stress/about/illnesses.html) (NIOSH/CDC): "Confusion, altered mental status, slurred speech" → Sintomas.
- [Heat-related Illnesses](https://www.cdc.gov/niosh/heat-stress/about/illnesses.html) (NIOSH/CDC): "Move the worker to a shaded, cool area and remove outer clothing. Cool the worker quickly" → Resfriar rápido.
- [Heat-related Illnesses](https://www.cdc.gov/niosh/heat-stress/about/illnesses.html) (NIOSH/CDC): "Place cold wet cloths or ice on the head, neck, armpits, and groin" → Compressas frias.
- [Heat-related Illnesses](https://www.cdc.gov/niosh/heat-stress/about/illnesses.html) (NIOSH/CDC): "Call 911 for emergency medical care. Stay with the worker until emergency medical services arrive." → Acionar emergência e ficar junto.

## 7. Família inteira com dor de cabeça · Toxicológico

`tox-monoxido-1` · **Fernanda, 34 anos** · "Eu, meu marido e meu filho acordamos com dor de cabeça e tontura."

- Sinais vitais: FC 104 bpm · FR 20 irpm · SpO₂ 99% em ar ambiente · PA 122/78 mmHg · T 36,6°C
- **Resposta certa:** intoxicação por monóxido de carbono como hipótese principal; destino: **alta orientada**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, exposicao, gravidez, cohb, monoxido, oxigenio, reavaliar, orientar. Antes da alta: oxigenio, reavaliar, orientar, gravidez.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar consciência, respiração e dor no peito | Consciente e orientada, com dor de cabeça e náusea. Nega dor no peito e desmaio. | +25 |
| Anamnese | Perguntar sobre a casa, outras pessoas com sintomas e febre | Ligaram um aquecedor a gás com as janelas fechadas. Todos em casa têm os mesmos sintomas, e ninguém tem febre. | +30 |
| Exames | Fazer teste de gravidez | Teste negativo. | +15 |
| Exame físico | Fazer exame neurológico com avaliação cognitiva | Sem déficits; memória e atenção preservadas. | +15 |
| Exames | Dosar a carboxi-hemoglobina | Carboxi-hemoglobina de 18%. Ela não fuma. | +20 |
| Exames | Descartar a intoxicação porque a SpO₂ está em 99% | Erro: o oxímetro de pulso não é preciso quando há carboxi-hemoglobina; a saturação normal não descarta a intoxicação. | -10 |
| Exames | Fazer eletrocardiograma | Ritmo sinusal, sem sinais de isquemia. | +10 |
| Hipóteses | Registrar intoxicação por monóxido de carbono como hipótese principal | Hipótese registrada: exposição a aquecedor a gás, sem febre, várias pessoas com os mesmos sintomas. | +20 |
| Hipóteses | Registrar síndrome gripal como hipótese principal | Hipótese registrada, mas sem febre e com toda a família doente após o aquecedor, a intoxicação é mais provável. | 0 |
| Conduta | Iniciar oxigênio a 100% por máscara (depois de: gravidade) | Oxigênio a 100% iniciado. | +40 |
| Evolução | Reavaliar depois de cerca de 4 horas de oxigênio (depois de: oxigenio) | Sem sintomas e com exame neurológico normal. FC 84 bpm, FR 16 irpm, SpO₂ 99%, PA 118/76 mmHg, T 36,6°C. | +30 |
| Conduta | Orientar a não voltar para casa até o aquecedor ser revisto e garantir a avaliação da família (depois de: reavaliar) | Marido e filho também em atendimento. Orientada a não usar o aparelho até a revisão e a ter detector de monóxido. | +25 |
| Encerramento | Encerrar com alta orientada | Alta sem sintomas, após o oxigênio, com orientação sobre a fonte do gás. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Encaminhamento registrado. Sem desmaio, sem alteração cardíaca ou neurológica, sem gravidez e com carboxi-hemoglobina abaixo de 25%, não havia critério para oxigênio hiperbárico. | encerra |

**Fontes**

- [Clinical Guidance for Carbon Monoxide (CO) Poisoning](https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html) (CDC): "Consider CO poisoning especially in these situations: No fever associated with symptoms, history of exposure, multiple patients with similar complaints." → Quando suspeitar.
- [Clinical Guidance for Carbon Monoxide (CO) Poisoning](https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html) (CDC): "All women of childbearing age who are suspected of having CO poisoning should have a pregnancy test." → Teste de gravidez.
- [Clinical Guidance for Carbon Monoxide (CO) Poisoning](https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html) (CDC): "pulse oximeter is not accurate when COHgb is present." → A oximetria normal não descarta.
- [Clinical Guidance for Carbon Monoxide (CO) Poisoning](https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html) (CDC): "Administer 100% oxygen until the patient is symptom-free, usually about 4-5 hours." → Oxigênio a 100% até ficar sem sintomas.
- [Clinical Guidance for Carbon Monoxide (CO) Poisoning](https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html) (CDC): "Consider hyperbaric oxygen therapy (HBO) therapy when the patient has a COHgb level of more than 25- 30%, there is evidence of cardiac involvement, severe acidosis, transient or prolonged unconsciousness, neurological impairment, or abnormal neuropsychiatric testing." → Critérios para hiperbárica, ausentes aqui.

## 8. Pisou num prego na obra · Pele e partes moles

`pele-tetano-1` · **Paulo, 45 anos** · "Pisei num prego enferrujado há duas horas, quando estava trabalhando."

- Sinais vitais: FC 82 bpm · FR 16 irpm · SpO₂ 98% em ar ambiente · PA 126/80 mmHg · T 36,5°C
- **Resposta certa:** ferimento sujo, com risco aumentado de tétano; destino: **alta orientada**.
- Essenciais (se faltar, o plantão não sai seguro): ferimento, vacina, ferimento-sujo, limpar, reforco. Antes da alta: limpar, reforco, reavaliar, orientar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Exame físico | Examinar o ferimento | Ferimento perfurante na sola do pé, com terra. Sem sangramento ativo; sente e mexe os dedos normalmente. | +30 |
| Anamnese | Conferir a vacinação contra o tétano | Pela carteira, tem o esquema completo; o último reforço foi há 7 anos. | +35 |
| Anamnese | Tem alergia a vacinas ou medicamentos? | Nega alergias. | +10 |
| Exames | Pedir hemograma e cultura de rotina | Exames sem utilidade neste caso; não mudam a conduta. | -10 |
| Hipóteses | Classificar como ferimento sujo, com risco aumentado de tétano | Classificação registrada: ferimento perfurante com terra. | +55 |
| Hipóteses | Classificar como ferimento limpo e pequeno, sem risco relevante | Classificação registrada, mas ferimento perfurante com terra é sujo e tem risco maior. | 0 |
| Conduta | Limpar o ferimento e remover a sujeira (depois de: ferimento) | Ferimento lavado e limpo. | +30 |
| Conduta | Aplicar reforço da vacina contra o tétano (depois de: vacina, alergias) | Reforço aplicado: esquema completo, mas o último reforço foi há 5 anos ou mais, e o ferimento é sujo. | +35 |
| Conduta | Aplicar imunoglobulina antitetânica | Não indicada: ele tem o esquema completo. A imunoglobulina fica para quem tem vacinação desconhecida ou incompleta, ou imunodeficiência. | -10 |
| Conduta | Prescrever antibiótico para prevenir o tétano | Não recomendado: antibiótico não é usado para prevenir tétano no cuidado do ferimento. | -10 |
| Evolução | Reavaliar o pé depois da limpeza (depois de: limpar) | Ferimento limpo. FC 78 bpm, FR 16 irpm, SpO₂ 98% em ar ambiente, PA 124/80 mmHg, T 36,5°C. | +20 |
| Conduta | Orientar cuidados com o ferimento e retorno se houver sinais de infecção (depois de: reavaliar) | Orientado a manter o ferimento limpo e voltar se surgir vermelhidão, pus, febre ou dor que aumenta. | +15 |
| Encerramento | Encerrar com alta orientada | Alta com ferimento limpo, reforço aplicado e orientações. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Encaminhamento registrado. O caso podia ser resolvido aqui, com limpeza e vacina. | encerra |

**Fontes**

- [Clinical Guidance for Wound Management to Prevent Tetanus](https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html) (CDC): "Penetrating or puncture wounds Wounds containing dirt, soil, feces, or saliva" → Perfurante com terra é ferimento sujo.
- [Clinical Guidance for Wound Management to Prevent Tetanus](https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html) (CDC): "For dirty or major wounds People with a complete tetanus primary series who received their last tetanus vaccine 5 or more years ago." → Indica o reforço.
- [Clinical Guidance for Wound Management to Prevent Tetanus](https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html) (CDC): "For dirty or major wounds People with an unknown tetanus vaccination history People who have never received tetanus vaccines People with an incomplete tetanus vaccine primary series" → Quem recebe imunoglobulina; não é o caso.
- [Clinical Guidance for Wound Management to Prevent Tetanus](https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html) (CDC): "Antibiotics (topical or systemic) aren't recommended during wound care to protect against tetanus." → Sem antibiótico para prevenir tétano.

## 9. Mordida de cachorro na perna · Zoonoses

`zoo-raiva-1` · **Lucas, 12 anos** · A mãe conta: "O cachorro do vizinho mordeu a perna dele há uma hora."

- Sinais vitais: FC 96 bpm · FR 18 irpm · SpO₂ 99% em ar ambiente · PA 108/68 mmHg · T 36,6°C
- **Resposta certa:** exposição ao vírus da raiva por mordedura de cão; destino: **alta orientada**.
- Essenciais (se faltar, o plantão não sai seguro): ferimento, animal, exposicao-raiva, lavar, profilaxia, observar. Antes da alta: lavar, profilaxia, observar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Exame físico | Examinar o ferimento | Duas perfurações e uma escoriação na panturrilha, sem sangramento ativo. | +25 |
| Anamnese | Perguntar sobre o cachorro: é conhecido? Pode ser observado? | É o cachorro do vizinho, que mora ao lado e pode ser observado. O dono diz que ele está saudável. | +30 |
| Anamnese | Conferir a vacinação contra o tétano | Carteira de vacinação em dia. | +15 |
| Exames | Pedir radiografia da perna | Sem alterações. O ferimento é superficial e o exame não muda a conduta. | -10 |
| Hipóteses | Registrar exposição ao vírus da raiva por mordedura de cão | Hipótese registrada: agressão por animal exige avaliação da profilaxia antirrábica. | +45 |
| Hipóteses | Registrar ferimento sem risco de raiva, porque o cão parece saudável | Hipótese registrada, mas toda agressão por animal precisa da avaliação da profilaxia, e o cão deve ser observado. | 0 |
| Conduta | Lavar o ferimento com bastante água e sabão e aplicar antisséptico (depois de: ferimento) | Ferimento lavado com cuidado e antisséptico aplicado. | +35 |
| Conduta | Avaliar e prescrever a profilaxia antirrábica conforme o protocolo do Ministério da Saúde (depois de: ferimento, animal) | Esquema definido pelo fluxograma, considerando o ferimento e a possibilidade de observar o animal. | +35 |
| Evolução | Reavaliar o menino depois do atendimento (depois de: lavar) | Tranquilo e sem sangramento. FC 90 bpm, FR 18 irpm, SpO₂ 99% em ar ambiente, PA 106/68 mmHg, T 36,6°C. | +15 |
| Conduta | Orientar observar o cão por 10 dias e avisar o serviço se ele adoecer, sumir ou morrer (depois de: animal) | Mãe e vizinho orientados a observar o cão e a avisar a unidade se houver qualquer mudança. | +30 |
| Encerramento | Encerrar com alta orientada | Alta com ferimento tratado, profilaxia definida e observação do cão orientada. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Encaminhamento registrado. O atendimento antirrábico podia ser feito aqui. | encerra |

**Fontes**

- [Raiva](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/r/raiva) (Ministério da Saúde): "Quanto ao ferimento, deve-se lavar abundantemente com água e sabão, o mais rápido possível, e aplicar produto antisséptico." → Lavar e aplicar antisséptico.
- [Raiva](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/r/raiva) (Ministério da Saúde): "O esquema de profilaxia da raiva humana deve ser prescrito pelo médico ou enfermeiro, que avaliará o caso indicando a aplicação de vacina e/ou soro." → Profilaxia definida após avaliação.
- [Raiva](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/r/raiva) (Ministério da Saúde): "Nos casos de agressão por cães e gatos, quando possível, observar o animal por 10 dias para ver se ele manifesta doença ou morre." → Observar o cão por 10 dias.
- [Clinical Guidance for Wound Management to Prevent Tetanus](https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html) (CDC): "Wounds containing dirt, soil, feces, or saliva (e.g., animal or human bites)" → Mordedura é ferimento de risco para tétano: conferir a vacina.

## 10. Febre e tosse na gravidez · Respiratório

`resp-gripe-gestante-1` · **Aline, 27 anos, grávida de 24 semanas** · "Comecei ontem à tarde com febre, tosse e dor no corpo."

- Sinais vitais: FC 98 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 112/70 mmHg · T 38,3°C
- **Resposta certa:** síndrome gripal (influenza) como hipótese principal; destino: **alta orientada**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, inicio, gestacao, influenza, antiviral, orientar. Antes da alta: antiviral, reavaliar, orientar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar respiração, fala e sinais de gravidade | Fala frases completas, sem falta de ar. Sem confusão. | +25 |
| Anamnese | Quando começaram os sintomas? | Ontem à tarde, há menos de 48 horas. | +25 |
| Anamnese | Que sintomas tem? | Febre, tosse, dor de garganta, dor no corpo e dor de cabeça, de início repentino. | +20 |
| Anamnese | Como está a gestação e o pré-natal? | 24 semanas, pré-natal em dia, sem intercorrências. O bebê está se mexendo. | +20 |
| Exame físico | Auscultar os pulmões | Murmúrio vesicular presente, sem ruídos anormais. | +20 |
| Exames | Pedir radiografia de tórax de rotina | Sem achados. O exame não muda a conduta neste quadro sem sinais pulmonares. | -10 |
| Hipóteses | Registrar síndrome gripal (influenza) como hipótese principal | Hipótese registrada: febre, tosse e dor no corpo de início súbito, sem sinais de gravidade. | +40 |
| Hipóteses | Registrar pneumonia como hipótese principal | Hipótese registrada, mas sem falta de ar e com ausculta normal o quadro é de síndrome gripal. | 0 |
| Conduta | Prescrever o antiviral do protocolo de influenza, por ser gestante (depois de: gravidade, inicio, gestacao) | Antiviral prescrito. A gestação é fator de risco para complicações, e o tratamento deve começar de preferência nas primeiras 48 horas. | +35 |
| Conduta | Não prescrever antiviral porque não há sinais de gravidade | Inseguro: em gestantes com síndrome gripal o antiviral é indicado mesmo sem gravidade. | -15 |
| Evolução | Rever sinais vitais e saturação antes de liberar (depois de: antiviral) | Estável. FC 92 bpm, FR 18 irpm, SpO₂ 98% em ar ambiente, PA 110/70 mmHg, T 37,6°C. | +20 |
| Conduta | Orientar ficar em casa, afastamento e retorno se surgir falta de ar (depois de: reavaliar) | Orientada a ficar em casa e a se afastar até 24 horas sem febre, sem usar antitérmico, e a voltar se tiver falta de ar ou piora. | +25 |
| Encerramento | Encerrar com alta orientada | Alta com antiviral, orientações e sinais para retorno. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Encaminhamento registrado. Sem sinais de gravidade, o caso podia ser resolvido aqui, com o antiviral. | encerra |

**Fontes**

- [Gripe (influenza)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gripe-influenza) (Ministério da Saúde): "o uso do antiviral Fosfato de Oseltamivir está indicado para todos os casos de Síndrome Respiratória Aguda Grave (SRAG) e casos de Síndrome Gripal (SG) com condições ou fatores de risco para complicações." → Antiviral para síndrome gripal com fator de risco.
- [Gripe (influenza)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gripe-influenza) (Ministério da Saúde): "O início do tratamento deve ocorrer preferencialmente nas primeiras 48 horas após o início dos sintomas." → Janela de 48 horas.
- [Gripe (influenza)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gripe-influenza) (Ministério da Saúde): "Grávidas em qualquer idade gestacional" → Gestante é fator de risco.
- [Gripe (influenza)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gripe-influenza) (Ministério da Saúde): "Orientar o afastamento temporário (trabalho, escola etc.) até 24 horas após cessar a febre sem a utilização de medicamento antitérmico." → Afastamento.

## 11. Ardência para urinar · Urinário

`uro-cistite-1` · **Bianca, 24 anos** · "Estou com ardência para urinar e indo ao banheiro toda hora desde ontem."

- Sinais vitais: FC 84 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 116/74 mmHg · T 36,8°C
- **Resposta certa:** infecção da bexiga (cistite) como hipótese principal; destino: **alta orientada**.
- Essenciais (se faltar, o plantão não sai seguro): sintomas, rim, gravidez, cistite, antibiotico, orientar. Antes da alta: antibiotico, reavaliar, orientar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar estado geral | Bom estado geral, sem sinais de gravidade. | +15 |
| Anamnese | Detalhar os sintomas urinários | Ardência ao urinar, vontade de urinar toda hora mesmo com a bexiga vazia e pressão no pé da barriga. | +25 |
| Anamnese | Tem febre, calafrios, dor nas costas, náusea ou vômitos? | Nega febre, calafrios, dor nas costas, náusea e vômitos. | +30 |
| Anamnese | Pode estar grávida? | Menstruou há duas semanas; teste de gravidez negativo. | +20 |
| Anamnese | Tem alergia a medicamentos? | Nega alergias. | +10 |
| Exame físico | Examinar abdome e região lombar | Dor leve acima do púbis. Punho-percussão lombar negativa. | +15 |
| Exames | Pedir tomografia de abdome | Sem achados. O exame não estava indicado para este quadro. | -20 |
| Hipóteses | Registrar infecção da bexiga (cistite) como hipótese principal | Hipótese registrada: sintomas urinários baixos, sem febre nem dor nas costas. | +55 |
| Hipóteses | Registrar infecção do rim (pielonefrite) como hipótese principal | Hipótese registrada, mas sem febre, calafrios, dor nas costas ou vômitos o quadro é de cistite. | 0 |
| Hipóteses | Registrar infecção sexualmente transmissível como hipótese principal | Hipótese registrada, mas o quadro é de infecção urinária, que não é uma IST. | 0 |
| Conduta | Prescrever o antibiótico do protocolo para cistite (depois de: alergias, gravidez) | Antibiótico prescrito conforme o protocolo da unidade. | +30 |
| Evolução | Rever sinais vitais antes de liberar (depois de: antibiotico) | Estável. FC 80 bpm, FR 16 irpm, SpO₂ 99% em ar ambiente, PA 114/72 mmHg, T 36,7°C. | +10 |
| Conduta | Orientar hidratação, prevenção e retorno se surgir febre ou dor nas costas (depois de: reavaliar) | Orientada a beber água, urinar depois das relações e voltar se tiver febre, calafrios ou dor nas costas. | +20 |
| Encerramento | Encerrar com alta orientada | Alta com antibiótico e orientações. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Encaminhamento registrado. Uma cistite sem sinais de infecção renal podia ser tratada aqui. | encerra |

**Fontes**

- [About Urinary Tract Infections](https://www.cdc.gov/uti/about/index.html) (CDC): "A bladder infection (cystitis) is the most common type of UTI." → A cistite é a mais comum.
- [About Urinary Tract Infections](https://www.cdc.gov/uti/about/index.html) (CDC): "Symptoms of a kidney infection can include: Fever Chills Lower back pain or pain in the side of your back Nausea or vomiting" → Sinais que apontariam para pielonefrite.
- [About Urinary Tract Infections](https://www.cdc.gov/uti/about/index.html) (CDC): "a UTI is not a sexually transmitted infection" → Não é IST.
- [About Urinary Tract Infections](https://www.cdc.gov/uti/about/index.html) (CDC): "Urinate after sexual activity Stay well hydrated" → Prevenção.

## 12. Diarreia desde ontem · Gastrointestinal

`gi-diarreia-1` · **Roberto, 38 anos** · "Estou com diarreia desde ontem, umas cinco vezes, e um pouco de cólica."

- Sinais vitais: FC 88 bpm · FR 16 irpm · SpO₂ 99% em ar ambiente · PA 124/78 mmHg · T 37,2°C
- **Resposta certa:** diarreia aguda sem desidratação como hipótese principal; destino: **alta orientada**.
- Essenciais (se faltar, o plantão não sai seguro): caracteristicas, hidratacao, dda, plano-a, orientar. Antes da alta: plano-a, reavaliar, orientar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar estado geral e consciência | Consciente, bom estado geral, engole sem dificuldade. | +15 |
| Anamnese | Tem sangue ou muco nas fezes, febre ou vômitos? | Fezes líquidas, sem sangue nem muco. Sem vômitos; febre baixa ontem. | +25 |
| Anamnese | Alguém próximo adoeceu igual? Comeu algo diferente? | Ninguém da família adoeceu. Comeu em um restaurante novo anteontem. | +15 |
| Exame físico | Avaliar o estado de hidratação e pesar o paciente | Sem sinais de desidratação: mucosas úmidas, sem sede intensa, urinando normalmente. Peso registrado. | +30 |
| Exames | Pedir coprocultura de rotina | Sem indicação neste caso: a coleta é importante em surtos, desidratação grave, sangue nas fezes ou suspeita de cólera. | -10 |
| Hipóteses | Registrar diarreia aguda sem desidratação como hipótese principal | Hipótese registrada: diarreia aguda, paciente hidratado. | +60 |
| Hipóteses | Registrar cólera como hipótese principal | Hipótese registrada, mas não há desidratação grave nem contexto que sustente essa suspeita. | 0 |
| Hipóteses | Registrar apendicite como hipótese principal | Hipótese registrada, mas a cólica difusa com diarreia e abdome sem dor localizada não sustentam essa hipótese. | 0 |
| Conduta | Prescrever antibiótico | Sem indicação: o antibiótico fica reservado para diarreia com sangue ou muco e comprometimento do estado geral, ou cólera com desidratação grave. | -15 |
| Conduta | Orientar o Plano A: mais líquidos e soro de reidratação oral após cada evacuação, mantendo a alimentação habitual (depois de: hidratacao) | Orientado a beber mais água e soro de reidratação oral após cada evacuação e a comer normalmente. | +35 |
| Evolução | Observar se tolera o soro de reidratação oral (depois de: plano-a) | Tomou o soro sem vomitar. FC 84 bpm, FR 16 irpm, SpO₂ 99% em ar ambiente, PA 122/78 mmHg, T 37,0°C. | +20 |
| Conduta | Orientar os sinais para voltar ao serviço (depois de: reavaliar) | Voltar se não melhorar em 2 dias ou se tiver piora da diarreia, vômitos repetidos, muita sede, recusa de alimentos, sangue nas fezes ou menos urina. | +30 |
| Encerramento | Encerrar com alta orientada | Alta com o Plano A e os sinais de retorno. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Encaminhamento registrado. Um paciente hidratado segue o Plano A em casa. | encerra |

**Fontes**

- [Doenças diarreicas agudas (DDA)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dda) (Ministério da Saúde): "O exame físico, com enfoque na avaliação do estado de hidratação, é importante para avaliar a presença de desidratação e a instituição do tratamento adequado, além disso, o paciente deve ser pesado, sempre que possível." → Avaliar hidratação e pesar.
- [Doenças diarreicas agudas (DDA)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dda) (Ministério da Saúde): "Aumento da ingestão de água e outros líquidos incluindo solução de SRO principalmente após cada episódio de diarreia" → Plano A.
- [Doenças diarreicas agudas (DDA)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dda) (Ministério da Saúde): "O Tratamento com antibiótico deve ser reservado apenas para os casos de DDA com sangue ou muco nas fezes (disenteria) e comprometimento do estado geral ou em caso de cólera com desidratação grave" → Sem antibiótico aqui.
- [Doenças diarreicas agudas (DDA)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dda) (Ministério da Saúde): "Retorno do paciente ao serviço, caso não melhore em 2 dias ou apresente piora da diarreia, vômitos repetidos, muita sede, recusa de alimentos, sangue nas fezes ou diminuição da diurese" → Sinais de retorno.

## 13. Perna inchada depois de cirurgia · Vascular

`vasc-tvp-1` · **Dona Marta, 58 anos** · "Fiz cirurgia no joelho há dez dias e agora a perna esquerda está inchada e doendo."

- Sinais vitais: FC 92 bpm · FR 16 irpm · SpO₂ 97% em ar ambiente · PA 132/84 mmHg · T 36,9°C
- **Resposta certa:** trombose venosa profunda como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): risco, sinais-tep, exame, tvp, comunicar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar respiração e estado geral | Respira sem esforço, bom estado geral. | +20 |
| Anamnese | Desde quando a perna está assim? | Há dois dias a panturrilha esquerda incha e dói, pior ao andar. | +20 |
| Anamnese | Como tem sido a mobilidade depois da cirurgia? | Tem ficado quase todo o tempo sentada ou deitada desde a cirurgia. | +25 |
| Anamnese | Tem falta de ar, dor no peito ao respirar, tosse com sangue ou desmaio? | Nega falta de ar, dor no peito, tosse com sangue e desmaio. | +30 |
| Exame físico | Examinar as duas pernas | Perna esquerda inchada, quente, avermelhada e dolorosa na panturrilha. Perna direita normal. | +25 |
| Exames | Pedir radiografia da perna | Sem alterações ósseas. O exame não avalia as veias. | -10 |
| Hipóteses | Registrar trombose venosa profunda como hipótese principal | Hipótese registrada: inchaço, dor, calor e vermelhidão em uma perna, após cirurgia e com pouca mobilidade. | +55 |
| Hipóteses | Registrar celulite como hipótese principal | Hipótese registrada, mas o contexto pós-operatório com pouca mobilidade torna a trombose a principal suspeita. | 0 |
| Hipóteses | Registrar distensão muscular como hipótese principal | Hipótese registrada, mas não houve esforço e o quadro combina com trombose. | 0 |
| Conduta | Explicar os sinais de embolia pulmonar e procurar ajuda imediata se surgirem (depois de: sinais-tep) | Orientada sobre falta de ar, dor no peito e desmaio. | +20 |
| Conduta | Registrar e comunicar à equipe de destino a suspeita de trombose (depois de: exame) | Equipe de referência avisada para avaliação e exame das veias. | +20 |
| Evolução | Rever sinais vitais antes da transferência (depois de: gravidade) | Estável. FC 90 bpm, FR 16 irpm, SpO₂ 97% em ar ambiente, PA 130/84 mmHg, T 36,9°C. | +15 |
| Encerramento | Encerrar com alta orientada | Alta registrada. A suspeita de trombose precisa de avaliação médica rápida, porque parte do coágulo pode se soltar e ir para os pulmões. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente encaminhada para avaliação e confirmação da trombose. | encerra |

**Fontes**

- [About Venous Thromboembolism (Blood Clots)](https://www.cdc.gov/blood-clots/about/index.html) (CDC): "Swelling Pain or tenderness Warmth Redness or discoloration" → Sinais de TVP.
- [About Venous Thromboembolism (Blood Clots)](https://www.cdc.gov/blood-clots/about/index.html) (CDC): "Slow blood flow caused by limited movement" → Fator de risco: pouca mobilidade.
- [About Venous Thromboembolism (Blood Clots)](https://www.cdc.gov/blood-clots/about/index.html) (CDC): "Difficulty breathing Faster than normal or irregular heartbeat Chest pain or discomfort, which usually worsens with a deep breath or coughing" → Sinais de embolia pulmonar.
- [About Venous Thromboembolism (Blood Clots)](https://www.cdc.gov/blood-clots/about/index.html) (CDC): "The most serious complication of DVT happens when a part of the clot breaks off and travels through the bloodstream to the lungs" → Por que não dar alta.

## 14. Dor que começou no umbigo · Gastrointestinal

`gi-apendicite-1` · **Larissa, 23 anos** · "A dor começou perto do umbigo ontem à noite e agora está do lado direito, embaixo."

- Sinais vitais: FC 102 bpm · FR 18 irpm · SpO₂ 98% em ar ambiente · PA 118/76 mmHg · T 37,9°C
- **Resposta certa:** apendicite aguda como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): dor, abdome, gravidez, apendicite, cirurgiao.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar estado geral e intensidade da dor | Dor forte, prefere ficar parada. Consciente e orientada. | +25 |
| Anamnese | Como a dor começou e o que a piora? | Começou de repente perto do umbigo, desceu para o lado direito e piora ao andar, tossir e respirar fundo. | +30 |
| Anamnese | Tem outros sintomas? | Perdeu o apetite e teve náusea. | +20 |
| Exame físico | Examinar o abdome | Dor no quadrante inferior direito, que piora ao tossir. | +25 |
| Exames | Fazer teste de gravidez | Teste negativo. | +20 |
| Exames | Fazer exame de urina | Sem sinais de infecção urinária. | +15 |
| Exames | Pedir tomografia antes do teste de gravidez | Erro de sequência: em mulher em idade fértil, o teste de gravidez vem antes da tomografia, porque a radiação pode prejudicar o feto. | -20 |
| Hipóteses | Registrar apendicite aguda como hipótese principal | Hipótese registrada: dor que começa no umbigo e migra para a direita, com perda de apetite e náusea. | +40 |
| Hipóteses | Registrar gastroenterite como hipótese principal | Hipótese registrada, mas a dor localizada que migrou não combina com gastroenterite. | 0 |
| Hipóteses | Registrar infecção urinária como hipótese principal | Hipótese registrada, mas o exame de urina não mostrou infecção. | 0 |
| Conduta | Solicitar avaliação do cirurgião no hospital de referência (depois de: abdome) | Avaliação cirúrgica solicitada. | +35 |
| Evolução | Rever sinais vitais e dor antes da transferência (depois de: gravidade) | Dor mantida. FC 100 bpm, FR 18 irpm, SpO₂ 98% em ar ambiente, PA 118/76 mmHg, T 37,9°C. | +20 |
| Encerramento | Encerrar com alta orientada | Alta registrada. Apendicite é emergência e precisa de avaliação e tratamento imediatos. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente encaminhada ao hospital de referência para avaliação cirúrgica. | encerra |

**Fontes**

- [Symptoms & Causes of Appendicitis](https://www.niddk.nih.gov/health-information/digestive-diseases/appendicitis/symptoms-causes) (NIDDK/NIH): "begin near your belly button and move lower and to your right" → Migração da dor.
- [Symptoms & Causes of Appendicitis](https://www.niddk.nih.gov/health-information/digestive-diseases/appendicitis/symptoms-causes) (NIDDK/NIH): "Appendicitis is a medical emergency that requires immediate care." → Emergência: encaminhar.
- [Diagnosis of Appendicitis](https://www.niddk.nih.gov/health-information/digestive-diseases/appendicitis/diagnosis) (NIDDK/NIH): "If you're a woman of childbearing age, you should have a pregnancy test before having a CT scan." → Teste de gravidez antes da tomografia.
- [Treatment for Appendicitis](https://www.niddk.nih.gov/health-information/digestive-diseases/appendicitis/treatment) (NIDDK/NIH): "Doctors typically treat appendicitis by removing the appendix. This surgery is called an appendectomy." → Tratamento cirúrgico.

## 15. Febre alta e dor de cabeça forte · Neurológico

`neuro-meningite-1` · **Gabriel, 19 anos** · "Estou com febre alta, uma dor de cabeça muito forte e vomitei desde a madrugada."

- Sinais vitais: FC 118 bpm · FR 22 irpm · SpO₂ 97% em ar ambiente · PA 108/66 mmHg · T 39,4°C
- **Resposta certa:** meningite (provável bacteriana) como hipótese principal; destino: **encaminhar para maior complexidade**.
- Essenciais (se faltar, o plantão não sai seguro): gravidade, meningeo, pele, meningite, tratamento, comunicar.

| Grupo | Ação | O que o jogador vê | Pontos |
| --- | --- | --- | --- |
| Avaliação | Avaliar consciência e sinais de gravidade | Sonolento, mas responde. Sem convulsões. | +25 |
| Exame físico | Examinar pescoço e sensibilidade à luz | Rigidez de nuca e incômodo com a luz. | +25 |
| Exame físico | Procurar manchas na pele | Manchas vermelho-arroxeadas no tronco e nas pernas. | +25 |
| Anamnese | Com quem mora e teve contato próximo? | Mora numa república com outros quatro estudantes. | +15 |
| Anamnese | Tem alergia a medicamentos? | Nega alergias. | +10 |
| Exames | Aguardar a punção lombar e o resultado do líquor antes de tratar | Inseguro: o início do tratamento não deve ser atrasado pelos exames que identificam o agente. | -20 |
| Hipóteses | Registrar meningite (provável bacteriana) como hipótese principal | Hipótese registrada: febre, dor de cabeça forte, vômitos, rigidez de nuca e manchas na pele. | +50 |
| Hipóteses | Registrar enxaqueca como hipótese principal | Hipótese registrada, mas febre, rigidez de nuca e manchas na pele não são de enxaqueca. | 0 |
| Hipóteses | Registrar dengue como hipótese principal | Hipótese registrada, mas rigidez de nuca com sonolência aponta para meningite. | 0 |
| Conduta | Iniciar o tratamento da meningite conforme protocolo, sem esperar os exames (depois de: gravidade, alergias) | Equipe inicia o tratamento com antibiótico e cuidados de suporte. | +40 |
| Evolução | Reavaliar depois das primeiras medidas (depois de: tratamento) | Mantém-se sonolento, sem convulsões. FC 112 bpm, FR 22 irpm, SpO₂ 97% em ar ambiente, PA 110/68 mmHg, T 38,8°C. | +20 |
| Conduta | Comunicar ao hospital de destino e registrar os contatos próximos (depois de: contatos) | Hospital avisado. Contatos da república registrados para as ações de vigilância. | +20 |
| Encerramento | Encerrar com alta orientada | Alta registrada. A meningite é emergência médica: todo caso suspeito deve ser internado. | encerra |
| Encerramento | Encaminhar para serviço de maior complexidade | Paciente transferido para internação, com o tratamento já iniciado. | encerra |

**Fontes**

- [Meningite](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/m/meningite) (Ministério da Saúde): "febre, dor de cabeça intensa, rigidez no pescoço, náuseas, vômitos e sensibilidade à luz" → Sintomas.
- [Meningite](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/m/meningite) (Ministério da Saúde): "Sinais de gravidade incluem confusão mental, convulsões, dificuldade para acordar e manchas vermelhas ou arroxeadas na pele." → Sinais de gravidade.
- [Meningite](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/m/meningite) (Ministério da Saúde): "Todos os casos suspeitos devem ser internados para avaliação e tratamento. O início do tratamento não deve ser atrasado por conta da realização de exames laboratoriais para identificação do agente causador." → Internar e não atrasar o tratamento.
- [Meningite](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/m/meningite) (Ministério da Saúde): "As meningites bacterianas e virais são geralmente transmitidas de pessoa para pessoa por contato próximo, por meio de gotículas respiratórias" → Contatos próximos.

## Pontos de atenção para a revisão

- Os detalhes de cada história (nomes, sinais vitais, falas, resultados de exames) são fictícios, como no caso piloto. As fontes sustentam as decisões centrais: diagnóstico, sinais de alarme, conduta essencial e destino.
- Exames marcados como desnecessários (radiografia, tomografia, hemograma de rotina) são julgamento clínico do roteiro, não estão nas fontes. Conferir caso a caso.
- Os casos não trazem doses. Onde há medicamento, a ação diz "conforme protocolo" (antibiótico na sepse, na cistite e na meningite; antiviral na gestante; profilaxia antirrábica).
- Fontes dos EUA (CDC, NIH) em AVC, sepse, hipoglicemia, cetoacidose, overdose, intermação, monóxido, tétano, cistite, trombose e apendicite: conferir se a conduta brasileira é a mesma.
- Em casos de encaminhamento, o motor atual desconta 20 XP mesmo quando encaminhar é o certo, e não desconta a alta indevida se os critérios de alta estiverem cumpridos. Corrigir o motor antes de liberar estes casos.
