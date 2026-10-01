# Homologação final Supabase — 30/09/2026

## Entregas verificadas

API remota `cacamed-api` versão 10 ativa. Conflito de versão do RPC usa `PT409`; a API relê o estado e repete no máximo três tentativas. Nenhum perfil real foi sobrescrito, resetado ou usado para jogar nos testes.

Homologação completa autenticada, iniciada pelo navegador com login Google nativo Supabase: duas rodadas consecutivas de Quiz, Verdade ou mentira 4/5, revisão dos erros gerados, Plantão, Erro médico, Causa e efeito, repetição dos DDX sem XP novo e cruzadinha com recibo permanente. Perfil real comparado integralmente antes/depois, sem diferença.

48 chamadas bem-sucedidas: média 415 ms, mediana 410 ms, p95 572 ms. Essa amostra foi sequencial no computador atual, após aquecimento; não representa celular nem capacidade sustentada de múltiplos jogadores.

Concorrência autenticada no mesmo perfil isolado: grupos de 2, 5 e 10 pedidos do mesmo recibo, todos confirmados; cinco pedidos simultâneos da quinta resposta do Quiz, todos confirmados. Uma tentativa de trocar resposta já confirmada foi recusada como esperado. Reenvios posteriores preservaram XP/tickets. Não equivale a usuários distintos autenticados em carga sustentada.

Verificação de acesso público: as três tabelas retornaram HTTP 401/42501 ao cliente com chave publicável; a API recusou POST sem sessão com HTTP 401. O RPC continua sem permissão EXECUTE para anon/authenticated. RLS sem políticas é intencional nessas tabelas privadas: o acesso passa pela Edge Function, que autoriza a identidade antes de usar service_role. Advisor também aponta proteção contra senhas vazadas desabilitada; não foi alterada nesta rodada.

88 testes automatizados passaram, incluindo regressão da leitura de recibo entre dois estados. Lint e build passaram.

## Falhas encontradas e correções

1. **Timeout ao concorrer:** o RPC usava `40001` para conflito de versão do aplicativo. Logs registraram milhares de `STATE_CONFLICT`, e a API devolvia HTTP 503 após aproximadamente 10 s. PostgREST repetia a mesma transação, mantendo a versão antiga. Correção: `PT409`, conforme [artigo oficial do Supabase](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b). API versão 9 passou a aceitar o novo código; depois o RPC foi atualizado. Conferência de pg_stat_activity não encontrou chamadas penduradas; não houve término de sessão ou reinício do projeto.
2. **Perfil desatualizado na resposta de reenvio:** outra chamada podia gravar entre a leitura do perfil e a consulta do recibo. O reenvio via recibo evitava recompensa duplicada, mas devolvia o perfil anterior. Correção na versão 10: reler o perfil após encontrar recibo confirmado; teste automatizado reproduz a ordem das leituras.
3. **Erro no próprio roteiro do Quiz:** primeira tentativa do teste enviou cinco respostas novas de uma vez, embora o motor aceite uma nova pergunta por pedido. Roteiro corrigido: confirma as quatro primeiras sequencialmente e concorre só na quinta. Quando há rodada pendente, usa o ID devolvido pelo servidor. Não flexibilizar a regra do jogo para adaptar um teste incorreto.
4. **Consulta duplicada na volta OAuth:** INITIAL_SESSION e SIGNED_IN podiam consultar o mesmo perfil duas vezes. Frontend agora deduplica eventos da mesma identidade dentro da assinatura. Mudança de conta, logout e retry explícito continuam com nova consulta.

## Instrumentos reproduzíveis

- `npm run dev -- --port 5174 --strictPort`, login admin na página principal e, na mesma aba, `/homologacao-supabase.html`: testes completos e concorrência, exclusivamente `ambiente: homologacao`. Página não incluída na build pública. Os testes deixam auditoria e recompensas fictícias no perfil isolado.
- `node scripts/verificar-acesso-publico.mjs`: usa apenas URL/chave publicável local; imprime status das verificações, sem credenciais ou dados de perfil.
- `node scripts/medir-producao.mjs`: somente leituras públicas; resultados anteriores continuam preservados.
- `/?diagnostico=1`: painel opcional, local ao navegador, com tempos de interface, FCP/LCP observado e chamadas API. Não envia telemetria para terceiros nem contém email, UID, respostas, senha, token ou URLs OAuth. Ativação fica na mesma sessão do navegador; `/?diagnostico=0` ou Desativar a encerra.

O marco menu após login manual inclui espera humana até o clique. Para medir retomada da sessão, recarregar a mesma aba já autenticada. Painel de diagnóstico adiciona uma pequena sobrecarga; FCP/LCP são auxiliares e podem incluir o painel. Comparar marcos de interface junto com transferência/cache. Medidas locais de build não substituem medição de Vercel/rede celular.

## Pendências que exigem acesso humano

Build otimizada local no navegador integrado, sessão já autenticada: primeira abertura até menu 2.006 ms, FCP/LCP observado 1.976 ms, nove assets com 313.713 bytes transferidos. Reabertura na mesma aba: menu 1.968 ms, FCP/LCP 1.960 ms, nove assets com só 2.700 bytes transferidos (cabeçalhos/revalidação, compatível com cache). Uma chamada de obterPerfil por abertura, sem duplicação. Não houve login manual nessas amostras. São duas medições locais, sem latência CDN, sem garantia de cold start da função e sem CPU/rede móvel; FCP no navegador integrado pode ser afetado pela execução em segundo plano. Medição da primeira tela de login em outra origem local ficou em 2.064 ms, antes do ajuste do filtro de assets; não usar o contador parcial antigo como evidência de cache frio.

- Teste físico Android/iOS, Wi-Fi e 4G/5G: [roteiro detalhado](roteiro-smartphone.md).
- Provar login do perfil ainda não vinculado e a senha antiga. Credenciais não devem ser enviadas no chat.
- E-mail público: custom SMTP ainda desligado. Envio padrão restringe destinatários à equipe e permite dois emails/hora, [conforme Supabase](https://supabase.com/docs/guides/auth/auth-smtp). Cadastro e recuperação externos não estão homologados.
- Proposta: [domínio próprio e Resend](proposta-email-autenticacao.md). Nenhum domínio comprado nem serviço contratado.
- Sete dias reais de uso estável depois dessas validações; não antecipar a retirada da ponte Firebase. Nenhuma automação de observação foi criada.

## Retirada e recuperação

Retirar Firebase só quando os dois perfis tiverem vínculo comprovado, as senhas funcionarem no Supabase, cadastro/recuperação/logout públicos passarem e a janela de uso for cumprida. Exportar perfil/eventos e inventariar dependências antes da alteração. Fazer a remoção do fallback frontend e da aceitação legada no backend como entrega própria, verificar login/progresso e só então remover código/secrets legados. Não voltar a copiar a planilha inteira sobre os perfis Supabase; reconciliar eventos por ID.

Se esta correção de API precisar ser revertida, manter o RPC com PT409 e uma versão da API que o aceite (versão 9 ou posterior); não reintroduzir o loop 40001. Reverter frontend pelo deploy anterior não reverte o banco nem desliga a ponte.
