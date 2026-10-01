# Proposta de e-mail para autenticação

Recomendação: registrar um domínio próprio da marca e usar Resend Free para mensagens de confirmação de conta e recuperação de senha do Supabase. O app pode continuar em caca-med.vercel.app: o domínio próprio pode inicialmente servir só como remetente, sem trocar a URL do site ou do Google OAuth.

Em consulta de 30/09/2026, [Resend Free](https://resend.com/pricing) custa US$ 0/mês, inclui 3.000 emails/mês e limita 100/dia. Para 50–100 jogadores, o volume provável de confirmação/recuperação cabe nesse plano, desde que não haja pico acima de 100 emails/dia; isso é uma estimativa de uso, não garantia de capacidade. O custo adicional inicial é registro/renovação do domínio, cujo preço depende do nome/extensão/registrador e deve ser confirmado antes da compra. Não é necessário contratar uma caixa postal paga só para enviar via SMTP. Se quiser receber respostas dos jogadores, configurar também uma caixa ou encaminhamento.

O envio padrão [Supabase](https://supabase.com/docs/guides/auth/auth-smtp) está restrito a endereços da equipe e dois emails/hora; não é suficiente para cadastro/recuperação de público externo. Não desabilitar confirmação de email para contornar isso.

## Implantação após escolha do domínio

1. Usuário escolhe nome e aprova custo de registro; conferir disponibilidade antes da compra. `cacamed.com.br` e `cacomed.com.br` são apenas sugestões, sem disponibilidade consultada ou reserva.
2. Usuário registra domínio e cria conta Resend Free. Nenhuma compra/assinatura foi feita pelo agente.
3. Adicionar domínio ou subdomínio de envio no Resend e copiar os registros DNS de verificação apresentados por ele para o registrador. Preservar registros existentes; aguardar status Verified. Configurar SPF/DKIM/DMARC de acordo com o provedor.
4. Escolher remetente, por exemplo `acesso@dominio-escolhido`, com nome cacoMed. Obter parâmetros SMTP oficiais e credencial de envio restrita ao domínio, quando suportado.
5. No Supabase → Authentication → Emails → SMTP Settings, habilitar custom SMTP e inserir parâmetros do Resend. O usuário insere/salva a nova credencial diretamente; não enviar chave no chat nem colocar na build, repositório ou VITE_ env.
6. Conferir limites de envio do Supabase, templates com idioma/branding e URLs de retorno já aprovadas. Testar confirmação e recuperação com um email externo à equipe, inclusive spam, expiração e uso do link uma única vez.
7. Usuário cria/atualiza a senha no fluxo de recuperação, faz logout e entra com a nova senha. Agente confere preservação do vínculo/progresso no backend.

Não ativar plano pago, cobranças por excedente ou mudar DNS/credenciais antes da aprovação dos detalhes correspondentes. Se o domínio ainda não for decidido, Google e a ponte atual continuam disponíveis, com email público pendente.
