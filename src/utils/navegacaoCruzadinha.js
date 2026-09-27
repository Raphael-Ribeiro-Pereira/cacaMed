export function proximaCelulaDaEntrada(grade, valores, linha, coluna, direcao, passo = 1, pularPreenchidas = true) {
  const atual = grade[linha]?.[coluna];
  if (!atual) return null;
  const campoId = direcao === 'vertical' ? 'idVertical' : 'idHorizontal';
  const id = atual[campoId];
  if (!id) return null;

  let l = linha;
  let c = coluna;
  while (true) {
    if (direcao === 'vertical') l += passo;
    else c += passo;
    const celula = grade[l]?.[c];
    if (!celula || celula.vazia || celula[campoId] !== id) return null;
    if (celula.letraCerta === ' ') continue;
    if (pularPreenchidas && valores[`${l}-${c}`]) continue;
    return { linha: l, coluna: c };
  }
}

export function celulasPreenchidasAteProximaVazia(grade, valores, linha, coluna, direcao) {
  const ignoradas = [];
  let atual = { linha, coluna };
  while (true) {
    atual = proximaCelulaDaEntrada(grade, valores, atual.linha, atual.coluna, direcao, 1, false);
    if (!atual || !valores[`${atual.linha}-${atual.coluna}`]) return ignoradas;
    ignoradas.push({ ...atual, letra: String(valores[`${atual.linha}-${atual.coluna}`]).toUpperCase() });
  }
}

export function resolverLetraRepetida(letra, ignoradas, valorAtual = '') {
  const digitada = String(letra).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (!/^[A-Z]$/.test(digitada)) return { acao: 'ignorar' };
  if (ignoradas[0]?.letra === digitada) return { acao: 'consumir', restantes: ignoradas.slice(1) };
  if (valorAtual) return { acao: 'substituir', letra: digitada };
  return { acao: 'digitar', letra: digitada };
}

export function escolherDirecaoDaEntrada(grade, valores, celula, direcaoAnterior = 'horizontal') {
  if (!celula.pertenceHorizontal) return 'vertical';
  if (!celula.pertenceVertical) return 'horizontal';
  const vazias = direcao => {
    const campo = direcao === 'horizontal' ? 'idHorizontal' : 'idVertical';
    return grade.flat().filter(item => !item.vazia && item.letraCerta !== ' ' &&
      item[campo] === celula[campo] && !valores[`${item.linha}-${item.coluna}`]).length;
  };
  const horizontal = vazias('horizontal');
  const vertical = vazias('vertical');
  return horizontal === vertical ? direcaoAnterior : horizontal > vertical ? 'horizontal' : 'vertical';
}
