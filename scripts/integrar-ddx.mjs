import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { validarErroMedico, validarCausaEfeito } from './validar-conteudo.mjs';

// Última etapa do fluxo de conteúdo do DDX: um lote aprovado entra no banco com revisado: true.
//   node scripts/integrar-ddx.mjs erro  content/approved/erro-lote-001.json
//   node scripts/integrar-ddx.mjs causa content/approved/causa-lote-001.json
// As citações (url, trecho) ficam no dossiê e no arquivo de fontes; não vão para o banco do jogo.
// Depois: `node scripts/sincronizar-supabase.mjs` (a API recalcula o resultado).
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TIPOS = {
  erro: { arquivo: 'src/utils/erroMedicoBanco.js', exporta: 'AUDITORIAS', campo: 'auditorias', validar: validarErroMedico },
  causa: { arquivo: 'src/utils/causaEfeitoBanco.js', exporta: 'RELACOES', campo: 'relacoes', validar: validarCausaEfeito },
};

export const gerarBancoDdx = (cabecalho, nome, itens) => `${cabecalho}\nexport const ${nome} = ${JSON.stringify(itens, null, 2)};\n`;
export const paraBanco = ({ citacoes, ...item }) => ({ ...item, revisado: true });

async function main() {
  const [tipo, caminho] = process.argv.slice(2);
  const cfg = TIPOS[tipo];
  if (!cfg || !caminho) { console.error('Uso: node scripts/integrar-ddx.mjs <erro|causa> content/approved/lote.json'); process.exitCode = 2; return; }
  const lote = JSON.parse(await readFile(resolve(caminho), 'utf8'));
  const { errors } = cfg.validar(lote);
  if (errors.length) throw new Error(`Lote com erros; rode content:validate:\n${errors.join('\n')}`);
  const arquivo = resolve(RAIZ, cfg.arquivo);
  const modulo = await import(`${pathToFileURL(arquivo).href}?t=${Date.now()}`);
  const texto = await readFile(arquivo, 'utf8');
  const cabecalho = texto.split('export const')[0].trimEnd();
  const novos = lote[cfg.campo].map(paraBanco);
  await writeFile(arquivo, gerarBancoDdx(cabecalho, cfg.exporta, [...modulo[cfg.exporta], ...novos]));
  console.log(`${novos.length} itens integrados como revisados em ${cfg.arquivo}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
