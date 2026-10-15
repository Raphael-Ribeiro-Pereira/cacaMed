# DDX: Plantão, Erro médico e Causa e efeito

Estado em **13/10/2026**. Este é o documento vigente do DDX. As versões da época do Apps Script estão no [[historico/Histórico|histórico]].

> [!info] Decisões de 13/10/2026
> - O DDX tem **3 modos**: Plantão, Erro médico e Causa e efeito. A [[ddx-batalha-diagnostica|Batalha]] **não é DDX** e continua desligada para jogadores.
> - O **Paciente DDX foi fundido no Plantão**: os 17 casos viraram casos `pdx-*` do Plantão ([[historico/ddx-antigo/paciente-ddx|registro antigo]]).
> - Liberação para jogadores na **quinta 15/10**, só com o conteúdo aprovado. Metas: 25 Plantão, 25 Erro médico e 50 Causa e efeito. Bater a meta não é obrigatório.
> - O tempo é um **bônus de desempenho escondido**, sem cronômetro na tela.
> - **Doses** só aparecem quando a fonte brasileira citar a quantidade.
> - O conteúdo usa **fontes brasileiras primeiro**. CDC e NIH entram só para doenças que não existem no Brasil. Ver [[Fluxo de conteúdo]].

## Arquitetura comum

- Backend: Edge Function `cacamed-api` no Supabase. A Edge Function recalcula XP e resultado, e o XP enviado pelo cliente é ignorado. O motor fica em `src/utils` e `src/shared` e é copiado para a função com `node scripts/sincronizar-supabase.mjs`. Um teste compara as cópias.
- Cada entrada custa 1 ticket e é identificada por UUID. Retomar ou reenviar a mesma entrada não cobra de novo. Só a **primeira conclusão de cada versão** dá XP; as repetições servem para estudo.
- Caso com `revisado: false` só abre para administrador, tanto na tela quanto no servidor.
- Telas: o hub fica em `src/components/PlantaoMedico.jsx`, com os 3 modos e a lista de casos por tema (`ddxLista.jsx`). A tela de caso fica em `ddxTela.jsx`, e o estilo nas classes `.dx-*` de `src/prototipo.css`. Os vitais e a cadeia vêm de `src/utils/ddxVisual.js`.
- Temas: lista fixa `TEMAS_DDX` (14 temas) em `scripts/validar-conteudo.mjs`.

## Plantão (v2)

Motor em `src/utils/plantao.js`; banco em `plantaoBanco.js`, gerado por `scripts/integrar-ddx.mjs`.

- Fluxo: admissão, ações por grupo (Avaliação, Anamnese, Exame físico, Exames, Hipóteses, Conduta, Evolução, Encerramento), hipótese final e destino.
- **4 destinos** (`DESTINOS`): alta, UTI, encaminhamento e retorno/observação. Uma alta indevida desconta 80 pontos e outro destino errado desconta 20.
- **Agravamentos:** quando o jogador demora a fazer uma ação essencial, os vitais pioram e aparecem em vermelho (`.state.bad`).
- **Bônus de desempenho:** até 50 XP, só em atendimento seguro, conforme o tempo simulado até o marco do caso.
- Pontuação em raciocínio, segurança e eficiência. O relatório mostra o bônus, o destino, o aprendizado, o alerta, a notificação e as referências.
- Banco: 33 casos (o piloto asma, os 15 do lote 1 aprovado e os 17 `pdx-*` convertidos do Paciente DDX).

## Erro médico (v2)

Motor em `src/utils/erroMedico.js`; banco em `erroMedicoBanco.js`.

- O jogador recebe um prontuário em papel (`registros`) e responde três etapas: **a linha** onde o cuidado falhou, a **categoria** da falha e a **correção** (3 ou 4 opções).
- **6 categorias** (`CATEGORIAS_FALHA`): omissão, atraso, conduta inadequada, falha de registro, erro grande de medicação e erro lógico de causa e efeito. Documentos antigos falam em 7: vale esta lista.
- Os casos são independentes do Plantão (não dependem mais de `casoId`).
- Cada etapa certa vale 25 XP. O servidor aceita as respostas em lote, que é como as telas enviam.

## Causa e efeito (v2)

Motor em `src/utils/causaEfeito.js`; banco em `causaEfeitoBanco.js`.

- O jogador parte de um **estímulo** e monta um circuito de **4 elos**: mecanismo, consequência, compensação e intervenção. Escolhe entre **6 cartas**, das quais 2 são distratoras.
- Cada elo certo vale 25 XP, com as respostas enviadas em lote, como no Erro médico.

## Conteúdo (15/10/2026)

Os lotes do Erro médico (1 e 2) e do Causa e efeito (1 a 3) foram **aprovados pela diretoria em 15/10/2026** e integrados. O pacote do site só leva os itens revisados ([[seguranca|S-05]]): os três pilotos de asma ficam só no servidor.

| Modo | No banco | Aguardando revisão | Meta |
| --- | --- | --- | --- |
| Plantão | 33 (32 revisados e o piloto) | 0 | 25 ✔ |
| Erro médico | 28 (27 revisados e o piloto) | 0 | 25 ✔ |
| Causa e efeito | 36 (35 revisados e o piloto) | 0 | 50 (meta, não obrigatória) |

Os dossiês de revisão ficam em `content/review/` e os lotes em `content/inbox/`. Depois da aprovação, rodar `node scripts/integrar-ddx.mjs erro|causa` e `node scripts/sincronizar-supabase.mjs`.

## Antes de liberar (quinta 15/10)

Checklist em [[pendencias#5. Trabalho do agente, na ordem decidida|Pendências]]: integrar o aprovado, tirar a restrição de administrador do conteúdo revisado, testar com conta comum e rodar testes, lint e build. Depois, publicar a Edge Function e a Vercel, só com o "sim" do usuário no dia.
