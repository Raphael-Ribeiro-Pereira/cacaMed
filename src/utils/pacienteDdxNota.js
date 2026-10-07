// Nota do Paciente DDX a partir do gabarito (só as marcações de itens-chave e respostas certas, sem o
// texto dos casos). A API usa só este módulo; o navegador usa o mesmo cálculo sobre o conteúdo completo.
import { GABARITO_PACIENTE } from './pacienteDdxGabarito.js';

// Gabarito de um caso: versão, nome e, por posição, quais perguntas e exames são chave e quais hipóteses e condutas são certas.
export const gabaritoDe = caso => ({
  versao: caso.versao, nome: caso.nome,
  perguntas: caso.perguntas.map(q => Boolean(q.chave)), exames: caso.exames.map(e => Boolean(e.chave)),
  hipoteses: caso.hipoteses.map(h => Boolean(h.certa)), conduta: caso.conduta.map(x => Boolean(x.certa)),
});

export function obterGabarito(id) {
  const gabarito = Object.hasOwn(GABARITO_PACIENTE, id) ? GABARITO_PACIENTE[id] : null;
  if (!gabarito) throw new Error('Caso não encontrado.');
  return gabarito;
}
export const nomeDoCaso = id => (Object.hasOwn(GABARITO_PACIENTE, id) ? GABARITO_PACIENTE[id].nome : undefined);

// Índices distintos, inteiros e dentro da lista.
function indices(lista, total, rotulo) {
  if (!Array.isArray(lista) || lista.length > total) throw new Error(`${rotulo} inválidas.`);
  if (lista.some(i => !Number.isInteger(i) || i < 0 || i >= total) || new Set(lista).size !== lista.length) throw new Error(`${rotulo} inválidas.`);
  return lista;
}

// Nota de 0 a 100: 40 pela investigação (itens-chave pedidos), 25 pela hipótese e 35 pela conduta
// (cada item certo marcado ou errado deixado de fora conta; erros descontam).
export function avaliarRespostas(g, respostas) {
  const r = respostas || {};
  const perguntas = indices(r.perguntas, g.perguntas.length, 'Perguntas');
  const exames = indices(r.exames, g.exames.length, 'Exames');
  const conduta = indices(r.conduta, g.conduta.length, 'Escolhas de conduta');
  if (!conduta.length) throw new Error('Escolha ao menos um item da conduta.');
  if (!Number.isInteger(r.hipotese) || r.hipotese < 0 || r.hipotese >= g.hipoteses.length) throw new Error('Hipótese inválida.');
  const chaveTotal = g.perguntas.filter(Boolean).length + g.exames.filter(Boolean).length;
  const chaveFeitas = g.perguntas.filter((c, i) => c && perguntas.includes(i)).length + g.exames.filter((c, i) => c && exames.includes(i)).length;
  const hipoteseCerta = g.hipoteses[r.hipotese];
  const acertosConduta = g.conduta.filter((certa, i) => conduta.includes(i) === certa).length;
  const nota = Math.round(40 * (chaveTotal ? chaveFeitas / chaveTotal : 1) + 25 * Number(hipoteseCerta) + 35 * (acertosConduta / g.conduta.length));
  return { nota, chaveFeitas, chaveTotal, hipoteseCerta, acertosConduta, totalConduta: g.conduta.length };
}
