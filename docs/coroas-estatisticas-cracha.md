# Coroas, Estatísticas e Crachá

Portados em 06/10/2026 do "cacoMed Protótipo de Movimento" (artefato de 02/10/2026), com o mesmo design e as mesmas animações, no celular e na web. A API foi publicada na Edge Function `cacamed-api` (versão 11) e o frontend em produção na Vercel (deploy `dpl_BGGkokiUtgDNhNoHQLmSPuARv8T4`, commit d0bd23e), ambos em 06/10/2026.

## Telas

| Tela | O que mudou |
| --- | --- |
| Ranking (`Ranking.jsx`) | Abas Temporada e Coroas por matéria. Temporada: pódio com coroas, lista com tags de coroa, movimento da posição desde a última visita e distância para o próximo. Mantidos do ranking antigo: ordenar por XP, letras certas ou tempo médio, e o 🌻 (easter egg R ❤️ C). A lista abre na hora na segunda visita e atualiza por trás. |
| Coroas (`CoroasMateria.jsx`) | Um trono por matéria, com contagem até domingo 23:59 (horário de Brasília), cartão com dono, barra do jogador e folha com a corrida. A aba abre com a última visita guardada no aparelho; se o jogador tomou uma coroa desde então, o cartão troca de dono com animação e aparece o aviso "Coroa tomada!", uma vez, quando a aba aparece. |
| Estatísticas (`Estatisticas.jsx`) | Dossiê em 8 seções com navegação fixa: parecer, KPIs, notas por modo, DDX (por doença, por agente e XP por matéria), Batalha (Dex, buffs, habilidades), pets, aprendizado (erros por tema e Revisão) e histórico (gráfico semanal e partidas recentes), mais conquistas. |
| Crachá (`PerfilUsuario.jsx`) | Crachá com cordão, frente e verso, inclinação no mouse na web, prévia ao vivo, foto escolhida entre 6 retratos, username conferido no servidor e salvamento otimista que volta atrás se falhar. Troca de senha e saída usam a mesma lógica de antes (Supabase ou Firebase), agora em folhas do protótipo. |

Estilos: `src/prototipo.css`, gerado a partir de todos os CSS do protótipo e isolado sob `.cbt` (substituiu `src/batalha.css`). Peças compartilhadas em `src/components/prototipoUi.jsx` (avatar, coroa, pódio, contador animado) e `src/utils/prototipo.js`. Com `prefers-reduced-motion`, as animações são desligadas.

## Dados e servidor

- **XP semanal por matéria (Coroas).** A cada pedido que aumenta `xpTopicos`, o servidor soma o ganho em `perfil.coroas = { semana: 'AAAA-Snn', xp: { materia: n } }` e zera quando a semana vira. A matéria sai do tema: cruzadinhas pela chave (Anatomia, Neurologia, Farmacologia, Microbiologia, Patologia; o resto conta como Clínica Geral), Plantão, Erro médico e Causa e efeito como Clínica Geral, Batalha como Microbiologia. Quiz e Verdade ou mentira não somam XP por tema e ficam fora. Ajustes do administrador não contam.
- **`GET ?acao=coroas`** (público): lê só `coroas` e `nome` dos perfis da semana atual, sem tabela nova, e devolve os dez primeiros de cada matéria com o ID público (hash do UID), nunca o UID.
- **`obterEstatisticas`** (autenticado, só leitura): lê os eventos de resposta e recibo do próprio jogador e devolve erros por tema, oito semanas (XP, partidas e % de acerto), partidas recentes e taxa de conclusão. Os recibos passaram a gravar XP e data; cruzadinhas gravam também o título com matéria e tópico, e a Batalha grava resultado, doença e se foi revelada. Recibos antigos aparecem com a data do registro e sem XP.
- **`verificarUsername`** e **`editarPerfil`**: username novo segue a regra do crachá (3 a 20 letras minúsculas, números, ponto ou _) e não pode repetir outro jogador, sem diferenciar maiúsculas; usernames antigos continuam válidos enquanto não mudam. `editarPerfil` aceita `foto` de 0 a 5.
- **Batalha**: ao encerrar, o perfil soma habilidades usadas, escolhas e ativações de cada pet e buffs enfrentados, para o painel.
- O reset administrativo também zera Batalha e Coroas.

## Diferenças em relação ao protótipo

- Sem patentes nomeadas: o jogo usa "Nível N" desde a nova economia; o crachá mostra só o nível.
- Sem ofensiva de login diária: o jogo não registra isso. O painel e o verso do crachá mostram a sequência de cruzadinhas (`streakAtual`, recorde `maiorStreak`).
- Conquistas trocadas por dados que existem: "Mão firme" virou 50 acertos no Quiz, "Plantão perfeito" virou um Plantão seguro e a ofensiva de 7 dias virou 7 cruzadinhas seguidas.
- Autorizações do verso refletem o acesso real (Batalha e Revisão só para administrador). A "UTI de simulação" do protótipo não existe no jogo e saiu.
- Barra de abas do celular e barra lateral da web entraram depois, com o menu: ver [Entrada, menu e casca](entrada-menu-casca.md).
- Corrigida uma colisão de CSS do protótipo: a legenda dos gráficos (`.lg`) deixava o pódio grande em `inline-flex`, desalinhado. No jogo a legenda ficou restrita aos títulos dos gráficos e o pódio fica centralizado, como o CSS dele pretendia.

## Homologação

`scripts/homologacao.jsx` ganhou os botões Testar Ranking e Coroas, Testar Estatísticas, Testar Crachá, Semear painel, coroas e histórico e Simular falha ao salvar o crachá. Usam dados fictícios e o mesmo `executarPedidoSupabase` do servidor.

Conferido em 06/10/2026, no celular (375 px) e na web (1280 px): pódio e lista, coroa tomada com aviso e animação, folha do trono, dossiê completo com histórico, username já usado e disponível, falha ao salvar com reversão, reenvio salvo (username e foto), verso do crachá e folha de senha. Também foi conferido que a Batalha continua igual com a folha de estilos unificada.

## Antes de liberar

1. ~~Publicar a Edge Function `cacamed-api`~~: versão 11 publicada em 06/10/2026. Os 21 arquivos foram conferidos contra as cópias locais; `?acao=coroas` respondeu a semana 2026-S41 e o ranking seguiu igual. A versão 11 continua compatível com o frontend atual de produção.
2. Conferir no navegador com a conta real: ranking, coroas depois de uma cruzadinha, histórico das estatísticas e troca de username.
3. As Coroas começam a contar a partir da publicação; a primeira semana fica parcial.
