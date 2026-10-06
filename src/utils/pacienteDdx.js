// Motor do Paciente DDX (casos em consulta). O navegador mostra o resultado na hora com este motor;
// o servidor recalcula a nota a partir das escolhas e guarda a melhor nota de cada caso.
import { AVISO_PACIENTE, CASOS_PACIENTE, FONTES_PACIENTE, MODULOS_PACIENTE } from './pacienteDdxConteudo.js';

export const AVISO = AVISO_PACIENTE;
export const FONTES = FONTES_PACIENTE;
export const MODULOS = [...MODULOS_PACIENTE].sort((a, b) => a.ordem - b.ordem);
export const CASOS = CASOS_PACIENTE;
export const casosDe = modulo => CASOS.filter(c => c.modulo === modulo).sort((a, b) => a.ordem - b.ordem);
export const casoPorId = id => CASOS.find(c => c.id === id);
export const ORDEM_CASOS = MODULOS.flatMap(m => casosDe(m.id));
export const proximoCaso = id => {
  const i = ORDEM_CASOS.findIndex(c => c.id === id);
  return i >= 0 ? ORDEM_CASOS[i + 1] : undefined;
};
export const casosPorFonte = fonte => CASOS.filter(c => c.citacoes.some(x => x.fonte === fonte));

export function obterCaso(id) {
  const caso = casoPorId(id);
  if (!caso) throw new Error('Caso não encontrado.');
  return caso;
}

// Índices distintos, inteiros e dentro da lista.
function indices(lista, total, rotulo) {
  if (!Array.isArray(lista) || lista.length > total) throw new Error(`${rotulo} inválidas.`);
  if (lista.some(i => !Number.isInteger(i) || i < 0 || i >= total) || new Set(lista).size !== lista.length) throw new Error(`${rotulo} inválidas.`);
  return lista;
}

// Nota de 0 a 100: 40 pela investigação (itens-chave pedidos), 25 pela hipótese e 35 pela conduta
// (cada item certo marcado ou errado deixado de fora conta; erros descontam).
export function avaliarCaso(caso, respostas) {
  const r = respostas || {};
  const perguntas = indices(r.perguntas, caso.perguntas.length, 'Perguntas');
  const exames = indices(r.exames, caso.exames.length, 'Exames');
  const conduta = indices(r.conduta, caso.conduta.length, 'Escolhas de conduta');
  if (!conduta.length) throw new Error('Escolha ao menos um item da conduta.');
  if (!Number.isInteger(r.hipotese) || r.hipotese < 0 || r.hipotese >= caso.hipoteses.length) throw new Error('Hipótese inválida.');
  const chaveTotal = caso.perguntas.filter(q => q.chave).length + caso.exames.filter(e => e.chave).length;
  const chaveFeitas = caso.perguntas.filter((q, i) => q.chave && perguntas.includes(i)).length + caso.exames.filter((e, i) => e.chave && exames.includes(i)).length;
  const hipoteseCerta = Boolean(caso.hipoteses[r.hipotese].certa);
  const acertosConduta = caso.conduta.filter((x, i) => conduta.includes(i) === Boolean(x.certa)).length;
  const nota = Math.round(40 * (chaveTotal ? chaveFeitas / chaveTotal : 1) + 25 * Number(hipoteseCerta) + 35 * (acertosConduta / caso.conduta.length));
  return { nota, chaveFeitas, chaveTotal, hipoteseCerta, acertosConduta, totalConduta: caso.conduta.length };
}

// Mapa da História: um módulo abre com 2 casos feitos no anterior; dentro do módulo, um caso por vez.
// revisao libera tudo (modo de conferência do conteúdo).
export function estadoMapa(feitos, revisao) {
  const mapa = {};
  let achouAtual = false;
  MODULOS.forEach((m, mi) => {
    const lista = casosDe(m.id);
    const anterior = mi === 0 ? null : casosDe(MODULOS[mi - 1].id);
    const moduloAberto = revisao || !anterior || anterior.filter(c => feitos[c.id] != null).length >= 2;
    lista.forEach((c, i) => {
      if (feitos[c.id] != null) { mapa[c.id] = 'done'; return; }
      const aberto = moduloAberto && (revisao || i === 0 || feitos[lista[i - 1].id] != null);
      if (!aberto) { mapa[c.id] = 'lock'; return; }
      if (!achouAtual) { mapa[c.id] = 'cur'; achouAtual = true; } else mapa[c.id] = 'open';
    });
  });
  return mapa;
}
