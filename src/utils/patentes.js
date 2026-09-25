export const obterPatente = nivel => {
  if (nivel <= 5) return { titulo: 'Estudante (Básico)', cor: '#b9cac4' };
  if (nivel <= 15) return { titulo: 'Estudante (Clínico)', cor: '#00f5d4' };
  if (nivel <= 30) return { titulo: 'Interno', cor: '#8b5cf6' };
  if (nivel <= 50) return { titulo: 'Residente (R1)', cor: '#ffb95f' };
  if (nivel <= 80) return { titulo: 'Médico Especialista', cor: '#d4004b' };
  return { titulo: 'Chefe de Plantão', cor: '#00f5d4' };
};
