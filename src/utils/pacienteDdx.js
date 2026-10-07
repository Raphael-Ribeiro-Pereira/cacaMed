// Motor do Paciente DDX (casos em consulta). O navegador mostra o resultado na hora com este motor;
// o servidor recalcula a nota com o gabarito (pacienteDdxNota.js) e guarda a melhor nota de cada caso.
import { AVISO_PACIENTE, CASOS_PACIENTE, FONTES_PACIENTE, MODULOS_PACIENTE } from './pacienteDdxConteudo.js';
import { avaliarRespostas, gabaritoDe } from './pacienteDdxNota.js';

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

// Mesmo cálculo da API, sobre o gabarito tirado do próprio caso.
export const avaliarCaso = (caso, respostas) => avaliarRespostas(gabaritoDe(caso), respostas);

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
