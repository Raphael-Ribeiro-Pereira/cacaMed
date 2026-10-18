// Confere as planilhas de dicas da cruzadinha antes de gravar no banco (17 e 18/10/2026).
// Uso: node scripts/conferir-planilhas-dicas.mjs principal.csv [dicas1.csv ...]
// A primeira é a planilha principal; as demais, se houver, entram depois, na ordem. Cada coluna "Descrição"
// (ou "Descrição 1" a "Descrição 5") conta como uma variação de dica. Não grava nada: só mostra o resultado.
import { readFile } from 'node:fs/promises';
import { lerLinhasCSV, montarBanco, posicoesDasColunas } from '../src/utils/importarBancoCSV.js';

const arquivos = process.argv.slice(2);
if (!arquivos.length) {
  console.error('Uso: node scripts/conferir-planilhas-dicas.mjs principal.csv [dicas1.csv ...]');
  process.exit(1);
}

const textos = [];
const rotulos = [];
for (const arquivo of arquivos) {
  const texto = await readFile(arquivo, 'utf8');
  textos.push(texto);
  const [cabecalho = [], ...linhas] = lerLinhasCSV(texto);
  const pos = posicoesDasColunas(cabecalho);
  // Sem cabeçalho reconhecido, o importador cai na ordem antiga (palavra na 1ª coluna, dica na 5ª).
  const reconhecido = String(cabecalho[pos.palavra] || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase() === 'PALAVRA';
  console.log(`\n${arquivo}`);
  console.log(`  linhas de dados: ${linhas.length}`);
  console.log(`  colunas: palavra = "${cabecalho[pos.palavra] ?? '?'}", área = "${cabecalho[pos.materia] ?? '?'}", subárea = "${cabecalho[pos.subMateria] ?? '(sem; vira GERAL)'}"`);
  console.log(`  colunas de dica (${pos.dicas.length}): ${pos.dicas.map(i => `"${cabecalho[i] ?? `coluna ${i + 1}`}"`).join(', ')}`);
  if (!reconhecido) console.log('  ATENÇÃO: o cabeçalho não foi reconhecido; o importador usou a ordem antiga das colunas');
  if (pos.dificuldade >= 0) console.log('  nota: a coluna de nível mínimo existe, mas o jogo não a usa mais');
  const vazias = linhas.filter(l => !String(l[pos.palavra] || '').trim()).length;
  if (vazias) console.log(`  linhas sem palavra: ${vazias} (serão ignoradas)`);
  pos.dicas.forEach(i => rotulos.push(`${arquivo} · ${cabecalho[i] ?? `coluna ${i + 1}`}`));
}

const banco = montarBanco(textos);
const topicos = Object.entries(banco);
const itens = topicos.flatMap(([chave, lista]) => lista.map(item => ({ chave, item })));
const principal = montarBanco([textos[0]]);
const naPrincipal = new Set(Object.entries(principal).flatMap(([chave, lista]) => lista.map(p => `${chave}|${p.palavra}`)));

console.log('\nResultado no banco:');
console.log(`  tópicos: ${topicos.length}`);
console.log(`  palavras no total: ${itens.length}`);
const maior = topicos.reduce((m, [nome, lista]) => (lista.length > m.n ? { nome, n: lista.length } : m), { nome: '-', n: 0 });
console.log(`  maior tópico: ${maior.nome} (${maior.n} palavras)`);
console.log(`  tamanho do banco no servidor: ~${Math.round(Buffer.byteLength(JSON.stringify(banco), 'utf8') / 1024)} KB`);
console.log(`  palavras sem nenhuma dica: ${itens.filter(({ item }) => !item.dicas.some(Boolean)).length}`);
console.log('  palavras com dica em cada coluna:');
rotulos.forEach((rotulo, k) => console.log(`    ${rotulo}: ${itens.filter(({ item }) => item.dicas[k]).length}`));
const variacoes = itens.map(({ item }) => item.dicas.filter(Boolean).length);
console.log(`  variações por palavra: mínimo ${Math.min(...variacoes)}, máximo ${Math.max(...variacoes)}`);

const orfas = itens.filter(({ chave, item }) => !naPrincipal.has(`${chave}|${item.palavra}`));
if (arquivos.length > 1) {
  console.log(`  palavras que só existem nas planilhas seguintes (hoje entram no jogo): ${orfas.length}`);
  orfas.slice(0, 15).forEach(({ chave, item }) => console.log(`    - ${chave}: ${item.palavra}`));
  if (orfas.length > 15) console.log(`    ... e mais ${orfas.length - 15}`);
}
