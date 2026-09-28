export const entradasCruzadinha = estatisticas => Object.entries(estatisticas || {})
  .filter(([chave, valor]) => chave !== 'ddx' && chave !== 'hardcore' && valor && typeof valor === 'object' && Number.isFinite(Number(valor.partidas)));

export const resumirCruzadinhas = estatisticas => {
  const entradas = entradasCruzadinha(estatisticas);
  const partidas = entradas.reduce((total, [, valor]) => total + (Number(valor.partidas) || 0), 0);
  const letras = entradas.reduce((total, [, valor]) => total + (Number(valor.letras) || 0), 0);
  const tempo = entradas.reduce((total, [, valor]) => total + (Number(valor.tempo) || 0), 0);
  return { partidas, letras, tempo, tempoMedio: partidas ? Math.floor(tempo / partidas) : null };
};
