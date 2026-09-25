const CAMPOS_CLINICOS_ANTIGOS = [
  'partidas_ganhas', 'ddx_vitorias', 'hardcore_vitorias', 'partidas_perdidas',
  'mortes_por_erro', 'mortes_por_tempo', 'processos_judiciais',
  'tempo_total_jogado', 'especialidades', 'medicos_recrutados'
];

export const possuiEstatisticasClinicasAntigas = estatisticas =>
  CAMPOS_CLINICOS_ANTIGOS.some(campo => Object.hasOwn(estatisticas || {}, campo));

export const limparEstatisticasClinicasAntigas = estatisticas => {
  const limpas = { ...(estatisticas || {}) };
  CAMPOS_CLINICOS_ANTIGOS.forEach(campo => delete limpas[campo]);
  return limpas;
};

export const atualizarEstatisticasClinicas = (estatisticas, partida) => {
  const { modo, resultado, motivoDerrota, teveProcesso, tempoSegundos, especialidade, equipe } = partida;
  if (modo !== 'ddx' && modo !== 'hardcore') throw new Error('Modo clínico inválido.');
  const stats = limparEstatisticasClinicasAntigas(estatisticas);
  const modoStats = { ...(stats[modo] || {}) };
  modoStats.partidas_ganhas = (Number(modoStats.partidas_ganhas) || 0) + Number(resultado === 'vitoria');
  modoStats.partidas_perdidas = (Number(modoStats.partidas_perdidas) || 0) + Number(resultado === 'derrota');
  modoStats.mortes_por_erro = (Number(modoStats.mortes_por_erro) || 0) + Number(resultado === 'derrota' && motivoDerrota === 'erro');
  modoStats.mortes_por_tempo = (Number(modoStats.mortes_por_tempo) || 0) + Number(resultado === 'derrota' && motivoDerrota === 'tempo');
  modoStats.processos_judiciais = (Number(modoStats.processos_judiciais) || 0) + Number(Boolean(teveProcesso));
  modoStats.tempo_total_jogado = (Number(modoStats.tempo_total_jogado) || 0) + Math.max(0, Number(tempoSegundos) || 0);
  if (especialidade) {
    modoStats.especialidades = { ...(modoStats.especialidades || {}) };
    modoStats.especialidades[especialidade] = (Number(modoStats.especialidades[especialidade]) || 0) + 1;
  }
  if (modo === 'ddx') {
    modoStats.medicos_recrutados = { ...(modoStats.medicos_recrutados || {}) };
    (equipe || []).forEach(id => {
      modoStats.medicos_recrutados[id] = (Number(modoStats.medicos_recrutados[id]) || 0) + 1;
    });
  }
  stats[modo] = modoStats;
  return stats;
};
