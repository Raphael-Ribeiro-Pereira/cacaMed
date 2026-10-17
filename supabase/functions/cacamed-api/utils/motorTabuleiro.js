import { palavraDaMemoria } from './memoriaPalavras.js';

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

// Escreve a palavra a partir do encaixe (linha, coluna e direção) numa cópia da matriz.
const colocarPalavra = (matrizAtual, itemAtual, encaixe) => {
  const palavra = itemAtual.palavra.toUpperCase();
  // Cópia rasa: as casas nunca são alteradas no lugar (cada casa escrita vira um objeto novo), então basta copiar as linhas.
  const novaMatriz = matrizAtual.map(linha => linha.slice());
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
  return novaMatriz;
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
      const novaMatriz = colocarPalavra(matrizAtual, itemAtual, encaixe);
      let resultadoFuturo = tentarPosicionar(novaMatriz, palavras, indexAtual + 1);
      if (resultadoFuturo !== false) return resultadoFuturo;
    }
  }
  
  if (indexAtual !== 0) {
      return tentarPosicionar(matrizAtual, palavras, indexAtual + 1);
  }
  return false; 
};

const embaralhar = itens => {
  const resultado = [...itens];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
};

const matrizVaziaDe = tamanho => Array.from({ length: tamanho }, (_, l) => Array.from({ length: tamanho }, (__, c) => ({ linha: l, coluna: c, vazia: true })));

// Numera as palavras na ordem de leitura e calcula a área ocupada (com uma casa de folga).
function finalizarGrade(matriz) {
  const tamanho = matriz.length;
  let contador = 1;
  for (const linha of matriz) for (const celula of linha) {
    if (celula.vazia) continue;
    celula.numero = celula.inicioHorizontal || celula.inicioVertical ? contador++ : null;
  }
  const ocupadas = matriz.flat().filter(c => !c.vazia);
  if (!ocupadas.length) return { gradePronta: matriz, limites: { minRow: 0, maxRow: 10, minCol: 0, maxCol: 10 } };
  const linhas = ocupadas.map(c => c.linha), colunas = ocupadas.map(c => c.coluna);
  return { gradePronta: matriz, limites: {
    minRow: Math.max(0, Math.min(...linhas) - 1), maxRow: Math.min(tamanho - 1, Math.max(...linhas) + 1),
    minCol: Math.max(0, Math.min(...colunas) - 1), maxCol: Math.min(tamanho - 1, Math.max(...colunas) + 1),
  } };
}

// Palavras posicionadas na grade, na ordem de leitura: o que o servidor guarda e devolve ao emitir a cruzadinha.
export const entradasDaGrade = gradePronta => gradePronta.flat().flatMap(c => [
  ...(c.inicioHorizontal ? [{ palavra: c.palavraInicialHorizontal, linha: c.linha, coluna: c.coluna, d: 'horizontal', dica: c.dicaBasicaHorizontal || '' }] : []),
  ...(c.inicioVertical ? [{ palavra: c.palavraInicialVertical, linha: c.linha, coluna: c.coluna, d: 'vertical', dica: c.dicaBasicaVertical || '' }] : []),
]);

// Remonta a grade a partir das entradas emitidas pelo servidor, com as mesmas casas que gerarTabuleiro produz.
export function montarGrade(entradas, tamanho) {
  let matriz = matrizVaziaDe(tamanho);
  for (const e of entradas) matriz = colocarPalavra(matriz, { palavra: e.palavra, dicaBasica: e.dica, dificuldade: 0 }, { linha: e.linha, coluna: e.coluna, direcao: e.d });
  return { ...finalizarGrade(matriz), metricas: medirGrade(matriz) };
}

// `respondidas`: palavras do tópico que o jogador já respondeu, da mais antiga para a mais recente (memoriaPalavras.js).
// Desde 16/10/2026 o nível não filtra mais as palavras (tópicos pequenos ficavam repetitivos): `_nivelAtual` fica na
// assinatura por compatibilidade. A grade usa primeiro as palavras novas, embaralhadas; as já respondidas só
// completam a grade quando faltam novas, das mais antigas para as mais recentes.
export const gerarTabuleiro = (bancoDePalavras, materia, _nivelAtual, { tentativas = 20, respondidas = [] } = {}) => {
  const palavrasOriginais = bancoDePalavras && materia ? bancoDePalavras[materia] : null;
  if (!palavrasOriginais?.length) return { gradePronta: [], limites: { minRow: 0, maxRow: 10, minCol: 0, maxCol: 10 } };
  const ordemResposta = new Map((Array.isArray(respondidas) ? respondidas : []).map((p, i) => [palavraDaMemoria(p), i]));
  const respondida = p => ordemResposta.has(palavraDaMemoria(p.palavra));
  const novas = palavrasOriginais.filter(p => !respondida(p));
  const repetidas = palavrasOriginais.filter(respondida).sort((a, b) => ordemResposta.get(palavraDaMemoria(a.palavra)) - ordemResposta.get(palavraDaMemoria(b.palavra)));
  const bancos = [[novas], [novas, repetidas]].filter((camadas, i) => camadas[i].length);
  const metaPalavras = Math.min(12, palavrasOriginais.length);
  const tamanhoMatriz = Math.max(20, Math.max(...palavrasOriginais.map(item => item.palavra.length)) + 10);
  const matrizVazia = matrizVaziaDe(tamanhoMatriz);

  let matrizFinal = matrizVazia;
  let melhor = medirGrade(matrizFinal);
  let selecionadas = 0;
  const totalTentativas = Math.max(1, Math.min(40, tentativas));
  const qualidade = m => m.densidade * 100 + m.intersecoes * 3 - m.area * 0.1;
  for (const banco of bancos) {
    for (let tentativa = 0; tentativa < totalTentativas; tentativa++) {
      const ordem = banco.flatMap((camada, i) => (i === 1 ? camada : embaralhar(camada))).slice(0, 20);
      const candidata = tentarPosicionar(matrizVazia, ordem, 0) || matrizVazia;
      const metrica = medirGrade(candidata);
      if (metrica.palavras > melhor.palavras || (metrica.palavras === melhor.palavras && qualidade(metrica) > qualidade(melhor))) {
        matrizFinal = candidata;
        melhor = metrica;
        selecionadas = ordem.length;
      }
    }
    if (melhor.palavras >= metaPalavras) break;
  }

  const pronta = finalizarGrade(matrizFinal);
  const naGrade = entradasDaGrade(pronta.gradePronta).map(e => e.palavra);
  return { ...pronta, metricas: medirGrade(matrizFinal), tamanho: tamanhoMatriz,
    selecao: { disponiveis: palavrasOriginais.length, novas: novas.length, selecionadas, posicionadas: melhor.palavras,
      repetidas: naGrade.filter(p => ordemResposta.has(palavraDaMemoria(p))).length, meta: metaPalavras } };
};
