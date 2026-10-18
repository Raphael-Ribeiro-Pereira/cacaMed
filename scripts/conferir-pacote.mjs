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
// Batalha (S-05, 17/10/2026): das doenças sem revisão, só os dados públicos podem chegar ao pacote. Procura trechos
// da conduta, do aprendizado e da primeira pista de cada uma.
// Trechos que também estão em casos revisados do DDX (o Plantão reaproveita textos da Batalha) podem estar no pacote.
const revisados = [];
for (const [arquivo, exporta] of Object.entries(BANCOS_DDX)) {
  revisados.push(...lerBanco(await readFile(new URL(`src/utils/${arquivo}`, raiz), 'utf8'), exporta).filter(item => item.revisado === true));
}
const textoRevisado = JSON.stringify(revisados);
const { DOENCAS_BATALHA } = await import(new URL('src/utils/batalhaConteudo.js', raiz));
const trechos = DOENCAS_BATALHA.filter(d => d.revisado !== true)
  .flatMap(d => [d.conduta, d.aprendizado, d.golpes?.[0]?.pista].filter(Boolean).map(t => ({ id: d.id, t: t.slice(0, 40) })))
  .filter(({ t }) => !textoRevisado.includes(t));
for (const nome of arquivos) {
  const texto = await readFile(new URL(nome, pasta), 'utf8');
  for (const { id, t } of trechos) if (texto.includes(t)) vazados.push(`conteúdo clínico da doença ${id} em ${nome}`);
}
if (vazados.length) {
  console.error(`Conteúdo sem revisão clínica no pacote do navegador:\n- ${vazados.join('\n- ')}`);
  process.exitCode = 1;
} else console.log(`Pacote conferido: ${pendentes.length} itens do DDX e o conteúdo clínico de ${new Set(trechos.map(x => x.id)).size} doenças da Batalha, sem revisão, ficaram fora de ${arquivos.length} arquivos.`);
