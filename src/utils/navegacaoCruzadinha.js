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
