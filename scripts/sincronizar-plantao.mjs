import { readFileSync, writeFileSync } from 'node:fs';

// Artefato mecânico: a mesma regra roda no navegador e no Apps Script.
const origem = readFileSync(new URL('../src/utils/plantao.js', import.meta.url), 'utf8');
const auditoria = readFileSync(new URL('../src/utils/erroMedico.js', import.meta.url), 'utf8');
const relacao = readFileSync(new URL('../src/utils/causaEfeito.js', import.meta.url), 'utf8');
const destino = new URL('../docs/plantao-motor.gs', import.meta.url);
writeFileSync(destino, '// GERADO por node scripts/sincronizar-plantao.mjs. Não editar manualmente.\n' + origem.replace(/^export /gm, '') + '\n' + auditoria.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '') + '\n' + relacao.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, ''));
