// Dados de curso do crachá, decididos em 15/10/2026: matéria preferida (18), etapa de 1 a 12 ou formado,
// "não sou de Medicina" (título de visitante no lugar de Dr./Dra.) e faculdade. Sem dependências: o servidor
// (supabase/functions/cacamed-api/utils) usa a mesma validação que a tela.
export const MATERIAS_CADASTRO = [
  ['anatomia', 'Anatomia', '🦴'], ['neurologia', 'Neurologia', '🧠'], ['farmaco', 'Farmacologia', '💊'],
  ['micro', 'Microbiologia', '🦠'], ['clinica', 'Clínica Geral', '🩺'], ['patologia', 'Patologia', '🔬'],
  ['imuno', 'Imunologia', '🛡️'], ['histo', 'Histologia', '🧬'], ['fisio', 'Fisiologia', '⚖️'],
  ['bioquimica', 'Bioquímica', '⚗️'], ['cardio', 'Cardiologia', '🫀'], ['pediatria', 'Pediatria', '🧸'],
  ['gineco', 'Ginecologia e Obstetrícia', '🤰'], ['cirurgia', 'Cirurgia', '🔪'], ['emergencia', 'Emergência', '🚑'],
  ['psiquiatria', 'Psiquiatria', '🌀'], ['coletiva', 'Saúde Coletiva', '🏥'], ['semiologia', 'Semiologia', '👂'],
];
// Nome da matéria em maiúsculas, como as chaves de XP: é o que o título épico (coroas.js) lê.
export const MATERIA_CADASTRO = Object.fromEntries(MATERIAS_CADASTRO.map(([id, nome]) => [id, nome.toUpperCase()]));
export const materiaValida = id => Object.hasOwn(MATERIA_CADASTRO, String(id));

export const ETAPA_MAXIMA = 12;
// Quem não é de Medicina: o título de visitante substitui o título épico, e o nome sai sem Dr./Dra.
export const TITULO_VISITANTE = { m: 'Infiltrado no Plantão', f: 'Infiltrada no Plantão', emoji: '🕵️', cor: '#ffb703' };
export const tituloVisitante = titulo => [TITULO_VISITANTE[String(titulo || '').toLowerCase().includes('doutora') ? 'f' : 'm'], TITULO_VISITANTE.emoji, TITULO_VISITANTE.cor];

// Faculdade: da lista do Censo/e-MEC ou digitada em "não achei". Texto livre, então só limpa: sem caracteres de
// controle, sem começar por =, +, - ou @ (fórmula de planilha) e no máximo 120 caracteres.
export const limparFaculdade = texto => String(texto || '').replace(/\p{Cc}/gu, '').replace(/\s+/g, ' ').trim()
  .replace(/^[=+\-@]+/, '').trim().slice(0, 120);

// Devolve o curso pronto para o perfil, ou null se o pedido não fecha. Medicina: etapa de 1 a 12 ou formado, e a
// faculdade é obrigatória. Fora da Medicina: sem etapa, e a faculdade é opcional.
export function validarCurso(curso) {
  if (!curso || typeof curso !== 'object' || Array.isArray(curso)) return null;
  const naoMedicina = curso.naoMedicina === true;
  const faculdade = limparFaculdade(curso.faculdade);
  if (naoMedicina) return { naoMedicina: true, etapa: null, formado: false, faculdade: faculdade || null };
  if (faculdade.length < 2) return null;
  const formado = curso.formado === true;
  const etapa = formado ? null : curso.etapa;
  if (!formado && !(Number.isInteger(etapa) && etapa >= 1 && etapa <= ETAPA_MAXIMA)) return null;
  return { naoMedicina: false, etapa, formado, faculdade };
}
