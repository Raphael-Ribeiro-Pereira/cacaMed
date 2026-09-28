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

