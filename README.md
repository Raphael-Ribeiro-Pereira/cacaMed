# cacoMed

Jogo web de treinamento médico com cruzadinhas, progresso por tópico, missões, tickets, perfil, estatísticas e ranking global. DDX, Hardcore e a integração de IA têm uma reformulação planejada separadamente.

## Executar localmente

Requisitos: Node.js compatível com Vite 8 e um projeto Firebase configurado. Instale as dependências com `npm install`, preencha as variáveis de ambiente locais sem versionar chaves e inicie a interface com `npm run dev`. Quando precisar do serviço de IA, inicie também `npm run server` em outro terminal. O endereço do Vite é exibido no terminal, normalmente `http://localhost:5173/`; o servidor de IA responde em `http://localhost:3001/health`.

## Verificações

- `npm test`: regras de missões, isolamento das estatísticas, geração/navegação da grade e contadores acumulados.
- `npm run lint`: análise estática de JavaScript e JSX.
- `npm run build`: compilação da versão de produção.

## Fluxo da cruzadinha

No primeiro acesso, o tutorial é exibido e sua conclusão fica registrada no perfil Firebase. O botão **Tutorial** permite reabri-lo. Durante a partida, clique ou use Tab para selecionar uma casa; as setas movem o foco entre casas vizinhas e Enter/Espaço alternam a direção numa interseção. O cursor pula letras já preenchidas. **Abandonar plantão** pede confirmação e descarta o progresso não concluído.

Ao completar a grade, o resultado mostra XP de letras e palavras, multiplicadores de nível e tempo, desconto de dicas, bônus de missões e tickets. A recompensa é registrada em uma transação identificada; enquanto o salvamento não terminar, a saída permanece bloqueada. O histórico recente contém no máximo 30 partidas; os totais do menu, perfil, estatísticas e ranking vêm dos contadores acumulados por tópico.

## Acompanhamento

O [cronograma de recuperação](docs/cronograma-recuperacao-caca-med.md) contém o inventário de problemas, o andamento e as verificações de aceitação. A referência visual enviada pelo usuário está em `docs/stitch-reference/`.
