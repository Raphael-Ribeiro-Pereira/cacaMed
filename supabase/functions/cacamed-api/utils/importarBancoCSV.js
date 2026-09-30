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

export function importarBancoCSV(texto) {
  const banco = {};
  const respostasPorTopico = new Map();
  const linhas = lerLinhasCSV(texto);
  let numero = 1;
  for (const colunas of linhas.slice(1)) {
    const original = String(colunas[0] || '').trim();
    const materia = normalizar(colunas[1]);
    const subMateria = normalizar(colunas[2]) || 'GERAL';
    const palavra = normalizar(original).replace(/-/g, ' ').replace(/\s+/g, ' ');
    if (!original || !materia || !/^[A-Z0-9 ]+$/.test(palavra) || palavra.length < 2) continue;
    const dificuldadeBruta = Number.parseInt(String(colunas[3] || '0').trim(), 10);
    const dificuldade = Number.isInteger(dificuldadeBruta) && dificuldadeBruta >= 0 ? dificuldadeBruta : 0;
    const chave = `${materia}-${subMateria}`;
    if (!respostasPorTopico.has(chave)) respostasPorTopico.set(chave, new Set());
    const respostas = respostasPorTopico.get(chave);
    if (respostas.has(palavra)) continue;
    respostas.add(palavra);
    (banco[chave] ||= []).push({
      palavra,
      numero: numero++,
      palavraComEspaco: original,
      dificuldade,
      dicaBasica: String(colunas[4] || '').trim(),
    });
  }
  return banco;
}
