# Desenvolvimento e operação

Voltar ao [[Inicio|Início]].

## Retomar

- [[pendencias|Pendências]]: a lista mestra, com o estado de produção.
- [[decisoes-para-responder|Decisões para responder]]: o questionário do usuário.
- [[cronograma-recuperacao-caca-med|Cronograma]]: o histórico das decisões.
- [[guia_conventional_commits|Commits]].

## Arquitetura e publicação

- Backend: Edge Function `cacamed-api` no Supabase. As regras compartilhadas ficam em `src/utils` e `src/shared`, copiadas com `node scripts/sincronizar-supabase.mjs` ([[migracao-supabase|Migração Supabase]]).
- **Deploy só às quintas-feiras**, com o "sim" do usuário no dia. Nos outros dias, as mudanças ficam prontas na `main` e entram na lista "Código ainda não publicado" das [[pendencias|Pendências]].
- O Firebase ainda funciona como ponte de login e o Apps Script é legado ([[historico/Histórico|Histórico]]).

## App

- [[app-instalavel|PWA]], já publicado.
- [[app-offline|Plano offline]]: é o próximo passo depois do DDX. Depois vem a escolha entre Capacitor e React Native e, por fim, as lojas.
- [[roteiro-smartphone|Roteiro de teste no celular]].
- [[proposta-email-autenticacao|E-mail de autenticação]]: depende de um domínio próprio.

## Registros antigos

Homologações, auditorias e incidentes de setembro e outubro estão no [[historico/Histórico|Histórico]].
