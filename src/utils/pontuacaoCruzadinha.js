export function resumirGrade(grade) {
  if (!Array.isArray(grade) || grade.length === 0) throw new Error('Grade vazia.');
  let letras = 0;
  let palavras = 0;
  let maiorPalavra = 0;
  for (const linha of grade) {
    if (!Array.isArray(linha)) throw new Error('Grade inválida.');
    for (const celula of linha) {
      if (celula.vazia) continue;
      if (celula.letraCerta !== ' ') letras++;
      if (celula.inicioHorizontal) palavras++;
      if (celula.inicioVertical) palavras++;
      maiorPalavra = Math.max(maiorPalavra, celula.palavraInicialHorizontal?.length || 0, celula.palavraInicialVertical?.length || 0);
    }
  }
  if (!letras || !palavras) throw new Error('Grade sem palavras.');
  return { letras, palavras, maiorPalavra };
}

export function conferirGrade(grade, respostas) {
  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) return false;
  let total = 0;
  for (const linha of grade) {
    for (const celula of linha) {
      if (celula.vazia || celula.letraCerta === ' ') continue;
      const resposta = respostas[`${celula.linha}-${celula.coluna}`];
      if (typeof resposta !== 'string' || resposta.toUpperCase() !== celula.letraCerta.toUpperCase()) return false;
      total++;
    }
  }
  return total > 0;
}

export function calcularPontuacaoCruzadinha({ grade, nivel, segundos, dicas = 0 }) {
  if (!Number.isInteger(nivel) || nivel < 0 || nivel > 100 || !Number.isInteger(segundos) || segundos < 0 || !Number.isInteger(dicas) || dicas < 0 || dicas > 2) {
    throw new Error('Parâmetros de pontuação inválidos.');
  }
  const { letras, palavras, maiorPalavra } = resumirGrade(grade);
  const xpLetras = letras * 2;
  const xpPalavras = palavras * 10;
  const base = xpLetras + xpPalavras;
  const multNivel = 1 + (Math.max(1, nivel) - 1) * 0.1;
  const tempoIdeal = palavras * 15;
  const multTempo = segundos <= tempoIdeal * 0.25 ? 2 : segundos <= tempoIdeal * 0.5 ? 1.5 : segundos <= tempoIdeal ? 1.2 : 1;
  const penalidade = dicas === 2 ? 15 : dicas === 1 ? 5 : 0;
  const xpCalculado = Math.floor(base * multNivel * multTempo) - penalidade;
  return { letras, palavras, maiorPalavra, xpLetras, xpPalavras, base, multNivel, multTempo, penalidade, xpCalculado, ganho: Math.max(10, xpCalculado) };
}
