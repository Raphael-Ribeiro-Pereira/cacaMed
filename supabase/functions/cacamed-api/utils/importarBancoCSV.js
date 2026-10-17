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

// Colunas pelo nome do cabeçalho (sem acento e sem maiúsculas). Desde 16/10/2026 o nível mínimo é opcional: as
// planilhas novas de dicas têm só Palavra, Área, Subárea e Descrição. Cabeçalho desconhecido usa a ordem antiga.
const COLUNAS = { palavra: ['PALAVRA'], materia: ['AREA', 'MATERIA'], subMateria: ['SUBAREA', 'SUBMATERIA'],
  dificuldade: ['NIVELMINIMO', 'DIFICULDADE'], dica: ['DESCRICAO', 'DICA'] };
function posicoes(cabecalho) {
  const nomes = cabecalho.map(c => normalizar(c).replace(/[^A-Z]/g, ''));
  const achar = chave => nomes.findIndex(n => COLUNAS[chave].includes(n));
  const pos = Object.fromEntries(Object.keys(COLUNAS).map(chave => [chave, achar(chave)]));
  if (pos.palavra < 0 || pos.materia < 0 || pos.dica < 0) return { palavra: 0, materia: 1, subMateria: 2, dificuldade: 3, dica: 4 };
  return pos;
}

// Linhas válidas de uma planilha, já com o tópico e a resposta normalizados.
function lerEntradas(texto) {
  const [cabecalho = [], ...linhas] = lerLinhasCSV(texto);
  const pos = posicoes(cabecalho);
  const coluna = (colunas, chave) => (pos[chave] >= 0 ? colunas[pos[chave]] : '');
  const entradas = [];
  for (const colunas of linhas) {
    const original = String(coluna(colunas, 'palavra') || '').trim();
    const materia = normalizar(coluna(colunas, 'materia'));
    const subMateria = normalizar(coluna(colunas, 'subMateria')) || 'GERAL';
    const palavra = normalizar(original).replace(/-/g, ' ').replace(/s+/g, ' ');
    if (!original || !materia || !/^[A-Z0-9 ]+$/.test(palavra) || palavra.length < 2) continue;
    const dificuldadeBruta = Number.parseInt(String(coluna(colunas, 'dificuldade') || '0').trim(), 10);
    entradas.push({ chave: `${materia}-${subMateria}`, palavra, original,
      dificuldade: Number.isInteger(dificuldadeBruta) && dificuldadeBruta >= 0 ? dificuldadeBruta : 0,
      dica: String(coluna(colunas, 'dica') || '').trim() });
  }
  return entradas;
}

// Banco das cruzadinhas a partir de uma ou mais planilhas (a primeira é a principal). Cada palavra guarda em `dicas`
// a dica de cada planilha, na ordem das planilhas ('' quando a planilha não tem a palavra); `dicaBasica` é a primeira
// que existe. Resposta repetida no mesmo tópico de uma planilha fica com a primeira dica.
export function montarBanco(textos) {
  const banco = {};
  const porChave = new Map();
  let numero = 1;
  textos.forEach((texto, indice) => {
    const vistas = new Set();
    for (const e of lerEntradas(texto)) {
      const id = `${e.chave}|${e.palavra}`;
      if (vistas.has(id)) continue;
      vistas.add(id);
      let item = porChave.get(id);
      if (!item) {
        item = { palavra: e.palavra, numero: numero++, palavraComEspaco: e.original, dificuldade: e.dificuldade, dicaBasica: '', dicas: [] };
        porChave.set(id, item);
        (banco[e.chave] ||= []).push(item);
      }
      item.dicas[indice] = e.dica;
      if (!item.dicaBasica) item.dicaBasica = e.dica;
    }
  });
  for (const item of porChave.values()) item.dicas = Array.from({ length: textos.length }, (_, i) => item.dicas[i] || '');
  return banco;
}

// Banco da planilha principal, sem as variações de dica (formato de antes, usado pelo app e pelos testes antigos).
export const importarBancoCSV = texto => bancoPublico(montarBanco([texto]));

// O que vai para o aparelho: uma dica por palavra. As outras ficam no servidor, que as escolhe ao emitir a grade.
export function bancoPublico(banco) {
  return Object.fromEntries(Object.entries(banco || {}).map(([chave, itens]) => [chave, itens.map(item => { const copia = { ...item }; delete copia.dicas; return copia; })]));
}
