import { readdir, readFile } from 'node:fs/promises';
import { BANCOS_DDX, lerBanco } from './pacoteRevisado.mjs';

// Roda depois de `npm run build` (postbuild): falha se algum caso do DDX sem revisão clínica
// chegou ao pacote do navegador (S-05 da auditoria de segurança, docs/seguranca.md).
const raiz = new URL('../', import.meta.url);
const pendentes = [];
for (const [arquivo, exporta] of Object.entries(BANCOS_DDX)) {
  const banco = lerBanco(await readFile(new URL(`src/utils/${arquivo}`, raiz), 'utf8'), exporta);
  pendentes.push(...banco.filter(item => item.revisado !== true).map(item => item.id));
}
const pasta = new URL('dist/assets/', raiz);
const arquivos = (await readdir(pasta)).filter(nome => nome.endsWith('.js'));
const vazados = [];
for (const nome of arquivos) {
  const texto = await readFile(new URL(nome, pasta), 'utf8');
  for (const id of pendentes) if (texto.includes(`"${id}"`) || texto.includes(`'${id}'`)) vazados.push(`${id} em ${nome}`);
}
if (vazados.length) {
  console.error(`Conteúdo sem revisão clínica no pacote do navegador:\n- ${vazados.join('\n- ')}`);
  process.exitCode = 1;
} else console.log(`Pacote conferido: ${pendentes.length} itens sem revisão ficaram fora de ${arquivos.length} arquivos.`);
