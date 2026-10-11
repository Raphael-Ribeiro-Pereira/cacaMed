import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { validarFrases } from './validar-conteudo.mjs';

// Última etapa do fluxo de conteúdo: um lote do V ou M com revisão médica aprovada entra em
// BANCO_FRASES com revisado: true. Depois, rode `node scripts/sincronizar-supabase.mjs`
// (a API sorteia as frases) e `npm run sync:plantao` (motor do Apps Script).
const BANCO = resolve(dirname(fileURLToPath(import.meta.url)), '../src/utils/bancoTreinos.js');

// O arquivo é um comentário seguido dos dois bancos em JSON; regravá-lo sem mudança dá o mesmo texto.
export function gerarBanco(cabecalho, quiz, frases) {
  return `${cabecalho}\nexport const BANCO_QUIZ = ${JSON.stringify(quiz, null, 2)};\nexport const BANCO_FRASES = ${JSON.stringify(frases, null, 2)};\n`;
}

export function frasesAprovadas(lote) {
  const { errors } = validarFrases(lote, { pronto: true });
  if (errors.length) throw new Error(`Lote com erros; rode content:validate:\n${errors.join('\n')}`);
  return lote.frases.map(({ id, conceito, versao, tema, texto, verdadeira, explicacao, fonte }) =>
    ({ id, conceito, versao, tema, texto, verdadeira, explicacao, fonte, revisado: true }));
}

async function main() {
  const caminho = process.argv[2];
  if (!caminho) { console.error('Uso: node scripts/integrar-frases.mjs content/approved/lote.json'); process.exitCode = 2; return; }
  const lote = JSON.parse(await readFile(resolve(caminho), 'utf8'));
  const novas = frasesAprovadas(lote);
  const { BANCO_QUIZ, BANCO_FRASES } = await import(pathToFileURL(BANCO).href);
  const cabecalho = (await readFile(BANCO, 'utf8')).split('\n')[0];
  await writeFile(BANCO, gerarBanco(cabecalho, BANCO_QUIZ, [...BANCO_FRASES, ...novas]));
  console.log(`${novas.length} frases (${novas.length / 2} conceitos) integradas como revisadas.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
