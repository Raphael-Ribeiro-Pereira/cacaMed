// Dicas da cruzadinha, todas tiradas do banco de palavras (a IA saiu do jogo em 15/10/2026).
// Até o nível 2 do tópico, o laudo já traz a primeira letra. A partir do 3, o laudo vem sem ela e as dicas extras
// a revelam: a do residente dá a primeira letra (5 XP) e a do paciente, a última (mais 10 XP).
export const NIVEL_DICAS_EXTRAS = 3;
const DICA_SEM_TEXTO = 'Encontre esta estrutura.';
const normalizar = valor => String(valor || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

// Troca por *** as palavras da dica que contêm o radical da resposta.
export const aplicarCensura = (textoDica, palavraSecreta) => {
  if (!textoDica || !palavraSecreta) return textoDica;
  const palavraLimpa = normalizar(palavraSecreta);
  const radical = palavraLimpa.length > 4 ? palavraLimpa.substring(0, palavraLimpa.length - 2) : palavraLimpa;
  return textoDica.split(' ').map(palavra => {
    const pLimpa = normalizar(palavra).replace(/[^A-Z]/g, '');
    return pLimpa.includes(radical) && pLimpa.length >= radical.length ? '***' : palavra;
  }).join(' ');
};

// { [palavra]: { laudo, residente, paciente } } para as palavras da grade.
export function montarDicas(palavras, descricoes = {}, nivelTopico = 0) {
  const dicas = {};
  for (const palavra of new Set(palavras)) {
    const letras = palavra.replace(/\s/g, '');
    const laudo = aplicarCensura(descricoes[palavra] || DICA_SEM_TEXTO, palavra);
    dicas[palavra] = nivelTopico < NIVEL_DICAS_EXTRAS
      ? { laudo: `${laudo} (Começa com a letra ${letras[0]})`, residente: '', paciente: '' }
      : { laudo, residente: `Começa com a letra ${letras[0]}.`, paciente: `Termina com a letra ${letras[letras.length - 1]}.` };
  }
  return dicas;
}
