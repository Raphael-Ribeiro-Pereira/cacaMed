// Gera src/utils/pacienteDdxGabarito.js a partir do conteúdo do Paciente DDX.
// Rode depois de mudar um caso; o teste do Paciente DDX acusa gabarito desatualizado.
import { writeFile } from 'node:fs/promises';
import { CASOS_PACIENTE } from '../src/utils/pacienteDdxConteudo.js';
import { gabaritoDe } from '../src/utils/pacienteDdxNota.js';

const linhas = CASOS_PACIENTE.map(c => `  ${JSON.stringify(c.id)}: ${JSON.stringify(gabaritoDe(c))},`);
const texto = `// GERADO por node scripts/gerar-gabarito-paciente.mjs a partir de pacienteDdxConteudo.js. Não editar.
// Só o necessário para a API calcular a nota: versão, nome e as marcações de cada lista, na ordem do caso.
export const GABARITO_PACIENTE = {
${linhas.join('\n')}
};
`;
await writeFile(new URL('../src/utils/pacienteDdxGabarito.js', import.meta.url), texto);
console.log(`Gabarito do Paciente DDX gerado: ${CASOS_PACIENTE.length} casos.`);
