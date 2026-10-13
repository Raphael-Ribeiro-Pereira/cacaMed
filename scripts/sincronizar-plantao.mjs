import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const gravarSeAlterado = (arquivo, conteudo) => { if (!existsSync(arquivo) || readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n') !== conteudo.replace(/\r\n/g, '\n')) writeFileSync(arquivo, conteudo); };
// docs/plantao-motor.gs (Plantão, Erro médico e Causa e efeito no Apps Script) ficou **congelado** em 13/10/2026:
// o Apps Script é o backend antigo e o DDX novo roda só na Edge Function do Supabase.

const extras = ['economia', 'missoes', 'bancoTreinos', 'treinos', 'revisaoInteligente'].map(nome => readFileSync(new URL('../src/utils/' + nome + '.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
gravarSeAlterado(new URL('../docs/treinos-motor.gs', import.meta.url), '// GERADO por node scripts/sincronizar-plantao.mjs. Não editar manualmente.\n' + extras + '\n' + readFileSync(new URL('../docs/treinos-api.gs', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../docs/revisao-api.gs', import.meta.url), 'utf8'));
