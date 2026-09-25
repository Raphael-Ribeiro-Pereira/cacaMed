const podeColocarPalavra = (matriz, palavra, linhaInicial, colunaInicial, direcao) => {
  const tamanhoMatriz = matriz.length;
  if (linhaInicial < 0 || colunaInicial < 0) return false;
  if (direcao === 'horizontal' && colunaInicial + palavra.length > tamanhoMatriz) return false;
  if (direcao === 'vertical' && linhaInicial + palavra.length > tamanhoMatriz) return false;
  const inicio = matriz[linhaInicial][colunaInicial];
  if (inicio.palavraInicialHorizontal === palavra || inicio.palavraInicialVertical === palavra) return false;

  const antes = direcao === 'horizontal' ? matriz[linhaInicial]?.[colunaInicial - 1] : matriz[linhaInicial - 1]?.[colunaInicial];
  const depois = direcao === 'horizontal' ? matriz[linhaInicial]?.[colunaInicial + palavra.length] : matriz[linhaInicial + palavra.length]?.[colunaInicial];
  if ((antes && !antes.vazia) || (depois && !depois.vazia)) return false;

  for (let i = 0; i < palavra.length; i++) {
    const l = direcao === 'vertical' ? linhaInicial + i : linhaInicial;
    const c = direcao === 'horizontal' ? colunaInicial + i : colunaInicial;
    const celula = matriz[l][c];
    if (!celula.vazia) {
      if (celula.letraCerta !== palavra[i] || celula.letraCerta === ' ') return false;
      if (direcao === 'horizontal' ? celula.pertenceHorizontal : celula.pertenceVertical) return false;
    } else {
      const vizinhos = direcao === 'horizontal' ? [matriz[l - 1]?.[c], matriz[l + 1]?.[c]] : [matriz[l]?.[c - 1], matriz[l]?.[c + 1]];
      if (vizinhos.some(vizinho => vizinho && !vizinho.vazia)) return false;
    }
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
  const vistos = new Set();
  return possiveisEncaixes.filter(encaixe => {
    const chave = `${encaixe.linha}-${encaixe.coluna}-${encaixe.direcao}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
};

const pontuarEncaixe = (matriz, palavra, encaixe) => {
  const ocupadas = matriz.flat().filter(c => !c.vazia);
  let minL = Math.min(...ocupadas.map(c => c.linha), encaixe.linha);
  let minC = Math.min(...ocupadas.map(c => c.coluna), encaixe.coluna);
  let maxL = Math.max(...ocupadas.map(c => c.linha), encaixe.linha + (encaixe.direcao === 'vertical' ? palavra.length - 1 : 0));
  let maxC = Math.max(...ocupadas.map(c => c.coluna), encaixe.coluna + (encaixe.direcao === 'horizontal' ? palavra.length - 1 : 0));
  let cruzamentos = 0;
  for (let i = 0; i < palavra.length; i++) {
    const l = encaixe.direcao === 'vertical' ? encaixe.linha + i : encaixe.linha;
    const c = encaixe.direcao === 'horizontal' ? encaixe.coluna + i : encaixe.coluna;
    if (!matriz[l][c].vazia) cruzamentos++;
  }
  return cruzamentos * 30 - (maxL - minL + 1) * (maxC - minC + 1) - Math.abs((maxL - minL) - (maxC - minC)) * 2;
};

export const medirGrade = matriz => {
  const casas = matriz.flat().filter(c => !c.vazia);
  if (!casas.length) return { palavras: 0, intersecoes: 0, largura: 0, altura: 0, area: 0, densidade: 0 };
  const largura = Math.max(...casas.map(c => c.coluna)) - Math.min(...casas.map(c => c.coluna)) + 1;
  const altura = Math.max(...casas.map(c => c.linha)) - Math.min(...casas.map(c => c.linha)) + 1;
  return { palavras: casas.reduce((n, c) => n + Number(!!c.inicioHorizontal) + Number(!!c.inicioVertical), 0), intersecoes: casas.filter(c => c.pertenceHorizontal && c.pertenceVertical).length, largura, altura, area: largura * altura, densidade: casas.length / (largura * altura) };
};

const tentarPosicionar = (matrizAtual, palavras, indexAtual) => {
  if (indexAtual === palavras.length) return matrizAtual;
  const itemAtual = palavras[indexAtual];
  const palavra = itemAtual.palavra.toUpperCase();
  let encaixesTestar = [];

  if (indexAtual === 0) {
    encaixesTestar.push({ linha: Math.floor(matrizAtual.length / 2), coluna: Math.floor((matrizAtual.length - palavra.length) / 2), direcao: 'horizontal' });
  } else {
    encaixesTestar = encontrarIntersecoes(matrizAtual, palavra);
  }

  encaixesTestar = encaixesTestar.filter(e => podeColocarPalavra(matrizAtual, palavra, e.linha, e.coluna, e.direcao));
  encaixesTestar = encaixesTestar.map(e => ({ ...e, score: pontuarEncaixe(matrizAtual, palavra, e) })).sort((a, b) => b.score - a.score);

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
          numero: i === 0 && !novaMatriz[lAtual][cAtual].numero ? itemAtual.numero : novaMatriz[lAtual][cAtual].numero,
          
          // 🔥 MUDANÇA: Memória dividida em Horizontal e Vertical!
          palavraInicialHorizontal: (i === 0 && encaixe.direcao === 'horizontal') ? palavra : novaMatriz[lAtual][cAtual].palavraInicialHorizontal,
          palavraInicialVertical: (i === 0 && encaixe.direcao === 'vertical') ? palavra : novaMatriz[lAtual][cAtual].palavraInicialVertical,
          
          pertenceHorizontal: encaixe.direcao === 'horizontal' ? true : novaMatriz[lAtual][cAtual].pertenceHorizontal,
          pertenceVertical: encaixe.direcao === 'vertical' ? true : novaMatriz[lAtual][cAtual].pertenceVertical,
          inicioHorizontal: (i === 0 && encaixe.direcao === 'horizontal') ? true : novaMatriz[lAtual][cAtual].inicioHorizontal,
          inicioVertical: (i === 0 && encaixe.direcao === 'vertical') ? true : novaMatriz[lAtual][cAtual].inicioVertical,
          idHorizontal: encaixe.direcao === 'horizontal' ? idIdentificadorDaPalavra : novaMatriz[lAtual][cAtual].idHorizontal,
          idVertical: encaixe.direcao === 'vertical' ? idIdentificadorDaPalavra : novaMatriz[lAtual][cAtual].idVertical,
          
          // 🔥 MUDANÇA: Dicas e Dificuldades também ganham memórias separadas
          dicaBasicaHorizontal: (i === 0 && encaixe.direcao === 'horizontal') ? itemAtual.dicaBasica : novaMatriz[lAtual][cAtual].dicaBasicaHorizontal,
          dicaBasicaVertical: (i === 0 && encaixe.direcao === 'vertical') ? itemAtual.dicaBasica : novaMatriz[lAtual][cAtual].dicaBasicaVertical,
          dificuldade: i === 0 ? itemAtual.dificuldade : novaMatriz[lAtual][cAtual].dificuldade
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

export const gerarTabuleiro = (bancoDePalavras, materia, nivelAtual = 0, { tentativas = 20 } = {}) => {
  let tamanhoMatriz = 16;
  if (bancoDePalavras && materia) {
    const palavrasOriginais = bancoDePalavras[materia];
    if (palavrasOriginais && palavrasOriginais.length > 0) {
      
      const limiteDificuldade = nivelAtual + 1;
      const palavrasFiltradas = palavrasOriginais.filter(p => p.dificuldade <= limiteDificuldade);
      const bancoParaSortear = palavrasFiltradas.length >= 6 ? palavrasFiltradas : palavrasOriginais;

      const palavrasDaFase = [...bancoParaSortear].sort(() => Math.random() - 0.5).slice(0, 15);
      
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
      
      let matrizFinal = matrizVazia;
      let melhor = medirGrade(matrizFinal);
      for (let tentativa = 0; tentativa < Math.max(1, Math.min(30, tentativas)); tentativa++) {
        const ordem = [...palavrasDaFase];
        if (tentativa > 0) {
          for (let i = ordem.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
          }
        }
        const candidata = tentarPosicionar(matrizVazia, ordem, 0) || matrizVazia;
        const metrica = medirGrade(candidata);
        const qualidade = m => m.densidade * 100 + m.intersecoes * 3 - m.area * 0.1;
        if (metrica.palavras > melhor.palavras || (metrica.palavras === melhor.palavras && qualidade(metrica) > qualidade(melhor))) {
          matrizFinal = candidata;
          melhor = metrica;
        }
      }
      
      let contadorSequencial = 1;
      for (let l = 0; l < tamanhoMatriz; l++) {
        for (let c = 0; c < tamanhoMatriz; c++) {
          let celula = matrizFinal[l][c];
          if (!celula.vazia) {
            if (celula.inicioHorizontal || celula.inicioVertical) {
              celula.numero = contadorSequencial;
              contadorSequencial++;
            } else {
              celula.numero = null; 
            }
          }
        }
      }
      
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

      return { gradePronta: matrizFinal, limites: { minRow, maxRow, minCol, maxCol }, metricas: medirGrade(matrizFinal) };
    }
  }
  return { gradePronta: [], limites: { minRow: 0, maxRow: 10, minCol: 0, maxCol: 10 } };
};
