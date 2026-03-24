const podeColocarPalavra = (matriz, palavra, linhaInicial, colunaInicial, direcao) => {
  const tamanhoMatriz = matriz.length;
  if (direcao === 'horizontal' && colunaInicial + palavra.length > tamanhoMatriz) return false;
  if (direcao === 'vertical' && linhaInicial + palavra.length > tamanhoMatriz) return false;

  for (let i = 0; i < palavra.length; i++) {
    let l = direcao === 'vertical' ? linhaInicial + i : linhaInicial;
    let c = direcao === 'horizontal' ? colunaInicial + i : colunaInicial;
    if (!matriz[l][c].vazia && matriz[l][c].letraCerta !== palavra[i]) return false;
  }
  return true; 
};

const encontrarIntersecoes = (matriz, palavra) => {
  let possiveisEncaixes = [];
  const tamanhoMatriz = matriz.length;
  for (let i = 0; i < palavra.length; i++) {
    let letra = palavra[i];
    
    if (letra === ' ') continue;

    for (let l = 0; l < tamanhoMatriz; l++) {
      for (let c = 0; c < tamanhoMatriz; c++) {
        if (!matriz[l][c].vazia && matriz[l][c].letraCerta === letra) {
          let colInic = c - i; 
          if (colInic >= 0) possiveisEncaixes.push({ linha: l, coluna: colInic, direcao: 'horizontal' });
          let linInic = l - i;
          if (linInic >= 0) possiveisEncaixes.push({ linha: linInic, coluna: c, direcao: 'vertical' });
        }
      }
    }
  }
  return possiveisEncaixes;
};

const tentarPosicionar = (matrizAtual, palavras, indexAtual) => {
  if (indexAtual === palavras.length) return matrizAtual;
  const itemAtual = palavras[indexAtual];
  const palavra = itemAtual.palavra.toUpperCase();
  let encaixesTestar = [];

  if (indexAtual === 0) {
    encaixesTestar.push({ linha: Math.floor(matrizAtual.length / 2), coluna: 2, direcao: 'horizontal' });
  } else {
    encaixesTestar = encontrarIntersecoes(matrizAtual, palavra);
  }

  encaixesTestar.sort(() => Math.random() - 0.5);

  for (let encaixe of encaixesTestar) {
    if (podeColocarPalavra(matrizAtual, palavra, encaixe.linha, encaixe.coluna, encaixe.direcao)) {
      let novaMatriz = JSON.parse(JSON.stringify(matrizAtual)); 
      let lAtual = encaixe.linha;
      let cAtual = encaixe.coluna;
      
      const idIdentificadorDaPalavra = `${encaixe.linha}-${encaixe.coluna}`;

      for (let i = 0; i < palavra.length; i++) {
        novaMatriz[lAtual][cAtual] = {
          ...novaMatriz[lAtual][cAtual],
          vazia: false,
          letraCerta: palavra[i],
          // A numeração provisória ainda fica aqui, mas será sobrescrita no final
          numero: i === 0 && !novaMatriz[lAtual][cAtual].numero ? itemAtual.numero : novaMatriz[lAtual][cAtual].numero,
          palavraInicial: i === 0 ? palavra : novaMatriz[lAtual][cAtual].palavraInicial,
          pertenceHorizontal: encaixe.direcao === 'horizontal' ? true : novaMatriz[lAtual][cAtual].pertenceHorizontal,
          pertenceVertical: encaixe.direcao === 'vertical' ? true : novaMatriz[lAtual][cAtual].pertenceVertical,
          inicioHorizontal: (i === 0 && encaixe.direcao === 'horizontal') ? true : novaMatriz[lAtual][cAtual].inicioHorizontal,
          inicioVertical: (i === 0 && encaixe.direcao === 'vertical') ? true : novaMatriz[lAtual][cAtual].inicioVertical,
          idHorizontal: encaixe.direcao === 'horizontal' ? idIdentificadorDaPalavra : novaMatriz[lAtual][cAtual].idHorizontal,
          idVertical: encaixe.direcao === 'vertical' ? idIdentificadorDaPalavra : novaMatriz[lAtual][cAtual].idVertical,
        };
        if (encaixe.direcao === 'horizontal') cAtual++; else lAtual++;
      }
      let resultadoFuturo = tentarPosicionar(novaMatriz, palavras, indexAtual + 1);
      if (resultadoFuturo !== false) return resultadoFuturo;
    }
  }
  
  if (indexAtual !== 0) {
      return tentarPosicionar(matrizAtual, palavras, indexAtual + 1);
  }
  return false; 
};

export const gerarTabuleiro = (bancoDePalavras, materia) => {
  let tamanhoMatriz = 16;
  if (bancoDePalavras && materia) {
    const palavrasOriginais = bancoDePalavras[materia];
    if (palavrasOriginais && palavrasOriginais.length > 0) {
      const palavrasDaFase = [...palavrasOriginais].sort(() => Math.random() - 0.5).slice(0, 15);
      let tamanhoMaiorPalavra = 0;
      palavrasDaFase.forEach(item => {
        if (item.palavra.length > tamanhoMaiorPalavra) tamanhoMaiorPalavra = item.palavra.length;
      });
      tamanhoMatriz = Math.max(16, tamanhoMaiorPalavra + 8);
      
      let matrizVazia = [];
      for (let l = 0; l < tamanhoMatriz; l++) {
        let linha = [];
        for (let c = 0; c < tamanhoMatriz; c++) {
          linha.push({ linha: l, coluna: c, vazia: true });
        }
        matrizVazia.push(linha);
      }
      
      const matrizFinal = tentarPosicionar(matrizVazia, palavrasDaFase, 0) || matrizVazia;
      
      // ==========================================
      // A MÁGICA NOVA: RENNUMERAÇÃO SEQUENCIAL
      // Varremos a matriz de cima pra baixo, da esquerda pra direita.
      // Se a célula for o Início de alguma palavra, ela ganha um número novo e perfeito!
      // ==========================================
      let contadorSequencial = 1;
      for (let l = 0; l < tamanhoMatriz; l++) {
        for (let c = 0; c < tamanhoMatriz; c++) {
          let celula = matrizFinal[l][c];
          if (!celula.vazia) {
            if (celula.inicioHorizontal || celula.inicioVertical) {
              celula.numero = contadorSequencial;
              contadorSequencial++;
            } else {
              // Limpa números velhos de letras do meio da palavra
              celula.numero = null; 
            }
          }
        }
      }
      
      // Calculando os limites para renderização
      let minRow = tamanhoMatriz, maxRow = 0;
      let minCol = tamanhoMatriz, maxCol = 0;
      let temPalavra = false;

      matrizFinal.forEach(linha => {
        linha.forEach(celula => {
          if (!celula.vazia) {
            temPalavra = true;
            if (celula.linha < minRow) minRow = celula.linha;
            if (celula.linha > maxRow) maxRow = celula.linha;
            if (celula.coluna < minCol) minCol = celula.coluna;
            if (celula.coluna > maxCol) maxCol = celula.coluna;
          }
        });
      });

      if (temPalavra) {
        minRow = Math.max(0, minRow - 1);
        maxRow = Math.min(tamanhoMatriz - 1, maxRow + 1);
        minCol = Math.max(0, minCol - 1);
        maxCol = Math.min(tamanhoMatriz - 1, maxCol + 1);
      } else {
        minRow = 0; maxRow = 10; minCol = 0; maxCol = 10; 
      }

      return { gradePronta: matrizFinal, limites: { minRow, maxRow, minCol, maxCol } };
    }
  }
  return { gradePronta: [], limites: { minRow: 0, maxRow: 10, minCol: 0, maxCol: 10 } };
};