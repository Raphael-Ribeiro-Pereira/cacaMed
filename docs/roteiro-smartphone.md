# Teste físico do cacoMed — roteiro de 15 a 25 minutos

Objetivo: conferir velocidade, login, toque e retomada em um aparelho real. O agente não tem um smartphone conectado; emulação de largura no desktop não substitui este teste. Fazer após o deploy que inclui o painel de diagnóstico.

## Preparação

1. Anote modelo do celular, Android/iOS, navegador e versão se souber. Use Chrome no Android e Safari no iPhone; não abra dentro de Instagram/WhatsApp.
2. Comece conectado ao Wi-Fi. Desative VPN apenas se já costuma testar sem ela; caso use VPN, anote isso. Feche downloads pesados durante o teste.
3. Abra https://caca-med.vercel.app/?diagnostico=1. Um controle de diagnóstico aparecerá no rodapé. Ele mostra só tempos e contadores; não publica nada.
4. As partidas normais alteram seu progresso. Para testar só velocidade/navegação sem ganhar XP ou gastar tickets, não confirme respostas nem inicie DDX. Para o teste de gameplay abaixo, use uma conta de teste própria ou aceite os ganhos normais da sua conta; nunca ajuste saldos artificialmente.

## Abertura inicial — Wi-Fi

1. Para reduzir reutilização de cache, feche TODAS as abas anônimas/privadas anteriores. Abra uma nova sessão privada: Chrome → menu de três pontos → Nova guia anônima; Safari → botão de abas → Privado → nova aba. Não apague senhas ou histórico do aparelho.
2. Digite o link com `?diagnostico=1`. Espere a tela de login aparecer completa, incluindo botão Google.
3. Abra Diagnóstico de desempenho no rodapé, toque Atualizar medição e depois Baixar relatório. No iPhone, se o arquivo abrir em vez de baixar, use Compartilhar → Salvar em Arquivos; no Android, procure em Downloads. Se não conseguir salvar, tire captura do painel.
4. Anote os valores `interfaceMs.login`, `fcpMs`, `recursos.comTransferencia` e `recursos.semTransferencia`. São milissegundos: 2000 ms = 2 s. Cache vazio não é provado só por abrir nova aba; informe exatamente como abriu.
5. Feche todas as abas privadas e repita três vezes, preservando os três arquivos como `wifi-inicial-1`, `wifi-inicial-2` e `wifi-inicial-3`.

## Login e retomada — Wi-Fi

1. Na aba do último teste, recolha o painel para liberar espaço e toque Entrar com Google. Entre com sua conta; não envie senha/código no chat.
2. Confirme que o menu mostra o perfil, XP e tickets esperados. No retorno Google, o tempo até menu mede a página de retorno; não inclui toda a navegação externa do Google. Se quiser medir o login completo, use o cronômetro de outro aparelho desde o toque até o menu e anote separadamente.
3. Na MESMA aba autenticada, atualize a página três vezes. Depois de cada abertura completa, abra o diagnóstico, toque Atualizar medição e salve o relatório como `wifi-sessao-1/2/3`.
4. Anote `interfaceMs.menu`, `api.mediaMs`, `api.p95Ms` e `api.falhas`. Este teste não deve pedir login de novo a cada atualização. Uma nova aba pode pedir login porque a sessão usa armazenamento por aba.
5. Confira menu, perfil, estatísticas e ranking. Vire o celular para paisagem e volte. Verifique se há corte, rolagem horizontal, botão inacessível ou texto sobreposto pelo teclado.

## Gameplay e perda breve de rede

1. Com conta de teste, faça duas rodadas seguidas de Quiz (cinco perguntas cada) e uma de Verdade ou mentira. Aguarde a confirmação de cada resposta. Anote XP/tickets antes e depois.
2. Após salvar uma resposta intermediária do Quiz, recarregue a mesma aba e volte ao modo. Deve retomar a rodada e as respostas salvas.
3. Antes da próxima resposta, ative modo avião, tente responder e observe a mensagem. Desative modo avião, aguarde a rede voltar e consulte/retome o progresso. Reenvie apenas a mesma resposta se ela não foi confirmada; não clique várias vezes nem altere a resposta para tentar forçar o salvamento.
4. A mesma resposta pode ter sido salva antes de a conexão cair. Verifique o relatório final: um encerramento e uma recompensa, sem tickets duplicados. Registre o texto exato de qualquer erro.
5. Revisão inteligente segue piloto para administrador: com admin, abra a revisão e confira retomada sem XP/tickets. Conta comum deve ver a restrição prevista.
6. Confira Sair da conta e entre novamente. Antes de compartilhar captura, oculte email e outras informações que não queira divulgar; não compartilhe tokens ou links completos de recuperação.

## Rede celular

1. Desligue o Wi-Fi e confirme 4G/5G ativo. Anote o tipo de sinal.
2. Repita os três testes de abertura inicial e os três de retomada autenticada, nomeando `celular-inicial-1/2/3` e `celular-sessao-1/2/3`.
3. Se só tiver um aparelho, teste nele. Um segundo modelo/sistema ajuda, mas não é obrigatório para enviar os primeiros resultados.

## O que devolver

Envie modelo/sistema/navegador, rede, relatórios ou capturas e observações. Não precisa calcular médias: o agente fará isso. Modelo de mensagem:

```
Aparelho: ... | Sistema/navegador: ...
Wi-Fi: login .../.../... ms | menu .../.../... ms
4G/5G: login .../.../... ms | menu .../.../... ms
Quiz duas rodadas: passou/falhou, mensagem ...
Verdade ou mentira: ...
Retomada após recarga: ...
Perda de rede/reenvio: ...
Google/logout: ...
Layout/teclado/toque: ...
```

Meta provisória de triagem, não promessa: login até 3 s no Wi-Fi e 5 s em celular; retomada do menu até 3/5 s; gravação p95 até 1,5/3 s, respectivamente. Três amostras servem para detectar problemas, não estimar percentis confiáveis. Login externo do Google e espera humana ficam fora dessas metas. Falha de salvamento, perda de progresso ou recompensa duplicada reprova funcionalmente mesmo com tempos bons.

Ao terminar, toque Desativar no painel ou abra https://caca-med.vercel.app/?diagnostico=0.
