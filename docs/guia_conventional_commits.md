# Guia de Conventional Commits (v1.0.0)

O **Conventional Commits** é uma convenção simples para utilizar nas mensagens de commit. Ele define um conjunto de regras para criar um histórico de commits explícito, o que facilita a criação de ferramentas automatizadas (como geração de CHANGELOG e versionamento semântico - SemVer).

---

## 🏗 Estrutura da Mensagem de Commit

A estrutura básica de uma mensagem de commit deve seguir o seguinte formato:

```text
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

---

## 🏷️ Tipos de Commit (`<tipo>`)

Os tipos são obrigatórios e indicam a intenção da sua mudança. Os dois principais são:

*   **`feat`**: Adiciona uma nova funcionalidade (feature) ao código. (Correlaciona-se com `MINOR` no versionamento semântico).
*   **`fix`**: Corrige um bug (falha) no código. (Correlaciona-se com `PATCH` no versionamento semântico).

Baseado na convenção do Angular, os seguintes tipos adicionais também são amplamente utilizados:

*   **`docs`**: Mudanças apenas na documentação (ex: `README.md`).
*   **`style`**: Mudanças que não afetam o significado do código (espaços em branco, formatação, ponto e vírgula ausente, etc).
*   **`refactor`**: Uma mudança de código que não corrige um bug nem adiciona uma funcionalidade (ex: renomear uma variável, extrair uma função).
*   **`perf`**: Uma mudança de código que melhora o desempenho.
*   **`test`**: Adiciona testes ausentes ou corrige testes existentes.
*   **`build`**: Mudanças que afetam o sistema de build ou dependências externas (escopos comuns: gulp, broccoli, npm).
*   **`ci`**: Mudanças nos arquivos de configuração e scripts de CI (escopos comuns: Travis, Circle, BrowserStack, SauceLabs).
*   **`chore`**: Atualizações de tarefas de rotina, etc; sem mudanças no código de produção.

---

## 📏 Regras e Conceitos Principais

1.  **Obrigatório começar com o tipo:** Todo commit deve ter um prefixo (`feat`, `fix`, etc.), seguido por um escopo opcional, um sinal de dois-pontos e um espaço.
2.  **Escopo (`[escopo opcional]`):** Pode ser adicionado após o tipo, entre parênteses, para fornecer contexto extra. Exemplo: `feat(parser):`.
3.  **Descrição (`<descrição>`):** É um breve resumo da mudança. Deve usar o modo imperativo, tempo presente (ex: "change" não "changed" ou "changes") e não deve terminar com ponto final.
4.  **Corpo (`[corpo opcional]`):** Deve vir após uma linha em branco abaixo da descrição. Fornece mais contexto, explicando a motivação da mudança e o contraste com o comportamento anterior.
5.  **Rodapé (`[rodapé(s) opcional(is)]`):** Deve vir após uma linha em branco após o corpo. É usado para metadados adicionais, como fechar issues (ex: `Closes #123`) ou declarar **BREAKING CHANGES**.

---

## 💥 Breaking Changes (Mudanças Quebradas)

Uma "Breaking Change" (mudança que quebra a compatibilidade, correlacionada com `MAJOR` no SemVer) pode ser indicada de duas formas:

1.  Adicionando um **`!`** logo antes dos dois-pontos: `feat(api)!: remover endpoint v1`.
2.  Iniciando um rodapé com **`BREAKING CHANGE:`** seguido de um espaço ou duas linhas em branco e o detalhamento da mudança.

---

## 📝 Exemplos Práticos

### Commit simples com um `tipo` e `descrição`
```text
feat: adicionar serviço de autenticação por e-mail
```

### Commit com `escopo`
```text
fix(login): corrigir erro de validação de senha nula
```

### Commit com `corpo` explicativo e fechamento de issue no `rodapé`
```text
refactor(banco): mudar de SQLite para PostgreSQL

Esta mudança foi necessária devido ao aumento no volume de dados 
esperado para o próximo semestre, já que o SQLite estava apresentando 
gargalos em testes de carga.

Closes #45
```

### Commit indicando uma `BREAKING CHANGE` (usando `!`)
```text
feat(api)!: remover suporte a senhas em texto puro
```

### Commit indicando uma `BREAKING CHANGE` (no rodapé)
```text
chore: atualizar versão do Node para v18

BREAKING CHANGE: o suporte para Node v16 foi totalmente removido.
```

---
*Para ler a especificação completa, acesse: [conventionalcommits.org](https://www.conventionalcommits.org/)*