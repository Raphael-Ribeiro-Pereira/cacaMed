import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// Artefato mecânico: a mesma regra roda no navegador e no Apps Script.
const origem = readFileSync(new URL('../src/utils/plantao.js', import.meta.url), 'utf8');
const auditoria = readFileSync(new URL('../src/utils/erroMedico.js', import.meta.url), 'utf8');
const relacao = readFileSync(new URL('../src/utils/causaEfeito.js', import.meta.url), 'utf8');
const destino = new URL('../docs/plantao-motor.gs', import.meta.url);
const gravarSeAlterado = (arquivo, conteudo) => { if (!existsSync(arquivo) || readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n') !== conteudo.replace(/\r\n/g, '\n')) writeFileSync(arquivo, conteudo); };
gravarSeAlterado(destino, '// GERADO por node scripts/sincronizar-plantao.mjs. Não editar manualmente.\n' + origem.replace(/^export /gm, '') + '\n' + auditoria.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '') + '\n' + relacao.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, ''));

const extras = ['economia', 'missoes', 'bancoTreinos', 'treinos', 'revisaoInteligente'].map(nome => readFileSync(new URL('../src/utils/' + nome + '.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
gravarSeAlterado(new URL('../docs/treinos-motor.gs', import.meta.url), '// GERADO por node scripts/sincronizar-plantao.mjs. Não editar manualmente.\n' + extras + '\n' + readFileSync(new URL('../docs/treinos-api.gs', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../docs/revisao-api.gs', import.meta.url), 'utf8'));
