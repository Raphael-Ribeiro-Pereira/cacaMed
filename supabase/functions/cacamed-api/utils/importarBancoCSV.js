export function lerLinhasCSV(texto) {
  const linhas = [];
  let linha = [];
  let campo = '';
  let entreAspas = false;
  const entrada = String(texto || '').replace(/^\uFEFF/, '');

  for (let i = 0; i < entrada.length; i++) {
    const caractere = entrada[i];
    if (caractere === '"') {
      if (entreAspas && entrada[i + 1] === '"') { campo += '"'; i++; }
      else entreAspas = !entreAspas;
    } else if (caractere === ',' && !entreAspas) {
      linha.push(campo);
      campo = '';
    } else if ((caractere === '\n' || caractere === '\r') && !entreAspas) {
      linha.push(campo);
      if (linha.some(valor => valor.trim())) linhas.push(linha);
      linha = [];
      campo = '';
      if (caractere === '\r' && entrada[i + 1] === '\n') i++;
    } else {
      campo += caractere;
    }
  }
  if (entreAspas) throw new Error('O banco de palavras contém aspas sem fechamento.');
  linha.push(campo);
  if (linha.some(valor => valor.trim())) linhas.push(linha);
  return linhas;
}

const normalizar = texto => String(texto || '').trim().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toUpperCase();

// Colunas pelo nome do cabeçalho (sem acento, sem maiúsculas e sem números). Desde 16/10/2026 o nível mínimo é
// opcional. Uma planilha pode ter várias colunas de dica ("Descrição 1" a "Descrição 5", decidido em 18/10/2026):
// cada coluna conta como uma variação da dica. Cabeçalho desconhecido usa a ordem antiga.
const COLUNAS = { palavra: ['PALAVRA'], materia: ['AREA', 'MATERIA'], subMateria: ['SUBAREA', 'SUBMATERIA'],
  dificuldade: ['NIVELMINIMO', 'DIFICULDADE'] };
const DICA = ['DESCRICAO', 'DICA'];
export function posicoesDasColunas(cabecalho) {
  const nomes = cabecalho.map(c => normalizar(c).replace(/[^A-Z]/g, ''));
  const achar = chave => nomes.findIndex(n => COLUNAS[chave].includes(n));
  const pos = Object.fromEntries(Object.keys(COLUNAS).map(chave => [chave, achar(chave)]));
  pos.dicas = nomes.flatMap((n, i) => (DICA.includes(n) ? [i] : []));
  if (pos.palavra < 0 || pos.materia < 0 || !pos.dicas.length) return { palavra: 0, materia: 1, subMateria: 2, dificuldade: 3, dicas: [4] };
  return pos;
}

// Linhas válidas de uma planilha, já com o tópico e a resposta normalizados, e quantas colunas de dica ela tem.
function lerEntradas(texto) {
  const [cabecalho = [], ...linhas] = lerLinhasCSV(texto);
  const pos = posicoesDasColunas(cabecalho);
  const coluna = (colunas, chave) => (pos[chave] >= 0 ? colunas[pos[chave]] : '');
  const entradas = [];
  for (const colunas of linhas) {
    const original = String(coluna(colunas, 'palavra') || '').trim();
    const materia = normalizar(coluna(colunas, 'materia'));
    const subMateria = normalizar(coluna(colunas, 'subMateria')) || 'GERAL';
    const palavra = normalizar(original).replace(/-/g, ' ').replace(/\s+/g, ' ');
    if (!original || !materia || !/^[A-Z0-9 ]+$/.test(palavra) || palavra.length < 2) continue;
    const dificuldadeBruta = Number.parseInt(String(coluna(colunas, 'dificuldade') || '0').trim(), 10);
    entradas.push({ chave: `${materia}-${subMateria}`, palavra, original,
      dificuldade: Number.isInteger(dificuldadeBruta) && dificuldadeBruta >= 0 ? dificuldadeBruta : 0,
      dicas: pos.dicas.map(i => String(colunas[i] || '').trim()) });
  }
  return { entradas, colunasDeDica: pos.dicas.length };
}

// Banco das cruzadinhas a partir de uma ou mais planilhas (a primeira é a principal). Cada palavra guarda em `dicas`
// uma dica por coluna de dica, na ordem das planilhas e, dentro de cada uma, na ordem das colunas ('' quando falta);
// `dicaBasica` é a primeira que existe. Resposta repetida no mesmo tópico de uma planilha fica com a primeira linha.
export function montarBanco(textos) {
  const banco = {};
  const porChave = new Map();
  let numero = 1;
  let inicio = 0;
  textos.forEach(texto => {
    const { entradas, colunasDeDica } = lerEntradas(texto);
    const vistas = new Set();
    for (const e of entradas) {
      const id = `${e.chave}|${e.palavra}`;
      if (vistas.has(id)) continue;
      vistas.add(id);
      let item = porChave.get(id);
      if (!item) {
        item = { palavra: e.palavra, numero: numero++, palavraComEspaco: e.original, dificuldade: e.dificuldade, dicaBasica: '', dicas: [] };
        porChave.set(id, item);
        (banco[e.chave] ||= []).push(item);
      }
      e.dicas.forEach((dica, i) => { item.dicas[inicio + i] = dica; });
      if (!item.dicaBasica) item.dicaBasica = e.dicas.find(Boolean) || '';
    }
    inicio += colunasDeDica;
  });
  for (const item of porChave.values()) item.dicas = Array.from({ length: inicio }, (_, i) => item.dicas[i] || '');
  return banco;
}

// Banco da planilha principal, sem as variações de dica (formato de antes, usado pelo app e pelos testes antigos).
export const importarBancoCSV = texto => bancoPublico(montarBanco([texto]));

// O que vai para o aparelho: uma dica por palavra. As outras ficam no servidor, que as escolhe ao emitir a grade.
export function bancoPublico(banco) {
  return Object.fromEntries(Object.entries(banco || {}).map(([chave, itens]) => [chave, itens.map(item => { const copia = { ...item }; delete copia.dicas; return copia; })]));
}
