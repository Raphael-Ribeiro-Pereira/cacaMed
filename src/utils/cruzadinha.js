// Regras de apresentação da cruzadinha no visual do protótipo: palavras da grade gerada pelo motor,
// estado de cada casa, palavras resolvidas e estimativa de XP da seleção de tópicos.
export const chaveCasa = (linha, coluna) => `${linha}-${coluna}`;
export const nivelDoTopico = xp => {
  const total = Number(xp) || 0;
  if (!total) return { nivel: 0, pct: 0 };
  const nivel = Math.floor(Math.sqrt(total / 1000)) + 1;
  const piso = (nivel - 1) ** 2 * 1000, teto = nivel ** 2 * 1000;
  return { nivel, pct: Math.round((total - piso) / (teto - piso) * 100) };
};

// Palavras na ordem dos números (horizontal antes da vertical no mesmo número), com as casas de letra.
export function palavrasDaGrade(grade) {
  const casas = grade.flat().filter(c => !c.vazia);
  const palavras = [];
  for (const c of casas) {
    if (c.inicioHorizontal) palavras.push({ chave: `h:${c.idHorizontal}`, id: c.idHorizontal, d: 'horizontal', numero: c.numero, palavra: c.palavraInicialHorizontal });
    if (c.inicioVertical) palavras.push({ chave: `v:${c.idVertical}`, id: c.idVertical, d: 'vertical', numero: c.numero, palavra: c.palavraInicialVertical });
  }
  for (const p of palavras) {
    const campo = p.d === 'horizontal' ? 'idHorizontal' : 'idVertical';
    p.casas = casas.filter(c => c[campo] === p.id && c.letraCerta !== ' ').map(c => chaveCasa(c.linha, c.coluna));
  }
  return palavras.sort((a, b) => a.numero - b.numero || (a.d === 'horizontal' ? -1 : 1));
}

// Palavra de uma casa na direção pedida (ou na outra, se a casa não pertence a ela).
export function palavraDaCasa(palavras, celula, direcao) {
  const h = celula.pertenceHorizontal ? palavras.find(p => p.d === 'horizontal' && p.id === celula.idHorizontal) : null;
  const v = celula.pertenceVertical ? palavras.find(p => p.d === 'vertical' && p.id === celula.idVertical) : null;
  return direcao === 'vertical' ? v || h : h || v;
}

// ok: letra certa; near: a letra existe em uma das palavras da casa; bad: não existe.
export function estadoDaCasa(grade, valores, celula) {
  const valor = String(valores[chaveCasa(celula.linha, celula.coluna)] || '').toUpperCase();
  if (!valor) return '';
  if (valor === celula.letraCerta.toUpperCase()) return 'ok';
  const naPalavra = (campo, id) => id && grade.some(linha => linha.some(c => !c.vazia && c[campo] === id && c.letraCerta.toUpperCase() === valor));
  if ((celula.pertenceHorizontal && naPalavra('idHorizontal', celula.idHorizontal)) || (celula.pertenceVertical && naPalavra('idVertical', celula.idVertical))) return 'near';
  return 'bad';
}

export function palavrasResolvidas(palavras, grade, valores) {
  const certa = chave => {
    const [l, c] = chave.split('-').map(Number);
    return String(valores[chave] || '').toUpperCase() === grade[l][c].letraCerta.toUpperCase();
  };
  return palavras.filter(p => p.casas.length && p.casas.every(certa));
}

// Tamanho da palavra para a dica: "(9)" ou "(4, 4)" quando o termo tem mais de uma palavra.
export const tamanhoDaPalavra = palavra => String(palavra || '').trim().split(/\s+/).map(p => p.length).join(', ');

// Estimativa da seleção de tópicos com a mesma conta do jogo: até 12 palavras por grade, letras
// compartilhadas nos cruzamentos (cerca de 15%), multiplicador do nível e o bônus de tempo de 1,2.
export function estimarXpCruzadinha(palavrasDoTopico, nivel) {
  const lista = (palavrasDoTopico || []).filter(p => p?.palavra);
  if (!lista.length) return 0;
  const n = Math.min(12, lista.length);
  const media = lista.reduce((t, p) => t + p.palavra.replace(/\s/g, '').length, 0) / lista.length;
  const base = Math.round(n * media * 0.85) * 2 + n * 10;
  const multNivel = 1 + (Math.max(1, nivel) - 1) * 0.1;
  return Math.max(10, Math.round(base * multNivel * 1.2 / 10) * 10);
}
