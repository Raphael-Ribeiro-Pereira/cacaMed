import test from 'node:test';
import assert from 'node:assert/strict';
import { CAPITULOS, DOENCAS, EXAMES, HIPOTESES, aplicarAcao, criarEstado, executarBatalha, hipotesesDe, obterDoenca, recompensaBatalha } from './batalha.js';
import { FONTES_BATALHA } from './batalhaConteudo.js';
import { executarPedidoSupabase } from '../shared/executarPedidoSupabase.js';

const ID = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';
const admin = (extra = {}) => ({ uid: 'a', role: 'admin', pontuacaoTotal: 0, tickets: 2, xpTopicos: {}, economia: { versao: 2, ultimoNivelPremiado: 1 }, ...extra });
const pedir = (perfil, pedido) => executarPedidoSupabase(perfil, pedido).perfil;

// Partida vencedora: exame-chave, diagnóstico, resposta ao buff e terapia até controlar.
function vencer(doenca) {
  const acoes = [{ t: 'exame', id: doenca.chave }, { t: 'hipotese', id: doenca.id }, { t: 'golpe', id: 'critica' }];
  let estado = executarBatalha(doenca, 'pulsa', acoes);
  while (!estado.fim) {
    // Com a terapia em recarga, o jogador ganha tempo com suporte, exames ou o pet.
    const livres = [doenca.cura, 'suporte'].filter(id => estado.cd[id] === 0).map(id => ({ t: 'golpe', id }));
    const exame = doenca.kit.find(id => !estado.exams.includes(id));
    const opcoes = [...livres, ...(estado.petReady && !estado.petUsed ? [{ t: 'pet' }] : []), ...(exame ? [{ t: 'exame', id: exame }] : [])];
    acoes.push(opcoes[0]);
    estado = executarBatalha(doenca, 'pulsa', acoes);
  }
  return { acoes, estado };
}

test('conteúdo: 12 doenças em 3 capítulos, kits, diferenciais e fontes válidos', () => {
  assert.equal(DOENCAS.length, 12);
  assert.equal(CAPITULOS.length, 3);
  for (const d of DOENCAS) {
    assert.equal(d.kit.length, 5, d.id);
    assert.ok(d.kit.includes(d.chave), d.id);
    d.kit.forEach(e => assert.ok(EXAMES.some(x => x.id === e) && d.exames[e], `${d.id}:${e}`));
    assert.equal(hipotesesDe(d).length, 5, d.id);
    hipotesesDe(d).forEach(h => assert.ok(h && HIPOTESES.includes(h), d.id));
    assert.ok(d.fontes.length >= 4 && d.fontes.every(f => FONTES_BATALHA[f.fonte] && f.pag > 0), d.id);
    assert.equal(d.revisado, false, 'sem revisão médica, a doença fica restrita ao administrador');
  }
});

test('todas as doenças podem ser vencidas com a conduta certa', () => {
  for (const d of DOENCAS) {
    const { estado } = vencer(d);
    assert.equal(estado.fim, 'vitoria', d.id);
    assert.ok(estado.revealed && estado.neutral, d.id);
  }
});

test('motor é determinístico e rejeita ações inválidas', () => {
  const d = obterDoenca('malaria');
  const acoes = [{ t: 'exame', id: 'gota' }, { t: 'golpe', id: 'bacti' }];
  assert.deepEqual(executarBatalha(d, 'cocobi', acoes), executarBatalha(d, 'cocobi', acoes));
  assert.throws(() => executarBatalha(d, 'cocobi', [{ t: 'exame', id: 'liquor' }]), /indisponível/);
  assert.throws(() => executarBatalha(d, 'cocobi', [{ t: 'exame', id: 'gota' }, { t: 'exame', id: 'gota' }]), /já realizado/);
  assert.throws(() => executarBatalha(d, 'cocobi', [{ t: 'golpe', id: 'critica' }]), /buff/);
  assert.throws(() => executarBatalha(d, 'cocobi', [{ t: 'golpe', id: 'proto' }, { t: 'golpe', id: 'proto' }]), /recarga/);
  assert.throws(() => executarBatalha(d, 'cocobi', [{ t: 'pet' }]), /pet/);
  assert.throws(() => executarBatalha(d, 'cocobi', [{ t: 'golpe', id: 'proto', xp: 999 }]), /inválida/);
});

test('terapia errada fortalece a doença e vira pista antes do diagnóstico', () => {
  const d = obterDoenca('dengue');
  const { estado, eventos } = aplicarAcao(criarEstado(), { t: 'golpe', id: 'bacti' }, d, 'capsi');
  assert.equal(estado.ineff, 1);
  assert.equal(estado.hp, 100);
  assert.ok(estado.clues.some(c => c.src === 'Tentativa'));
  assert.ok(eventos.some(e => e.fx === 'miss:bacti'));
});

test('buffs: escudo segura a carga em 25% até a resposta crítica', () => {
  const d = obterDoenca('tb');
  let estado = executarBatalha(d, 'pulsa', [{ t: 'hipotese', id: 'tb' }, { t: 'golpe', id: 'bacti' }, { t: 'golpe', id: 'suporte' }, { t: 'golpe', id: 'bacti' }, { t: 'golpe', id: 'suporte' }, { t: 'golpe', id: 'bacti' }]);
  assert.equal(estado.hp, 25);
  assert.equal(estado.fim, null);
  estado = aplicarAcao(estado, { t: 'golpe', id: 'critica' }, d, 'pulsa').estado;
  assert.equal(estado.neutral, true);
});

test('recompensa: tutorial uma vez, História só na primeira vitória, duelo sempre', () => {
  const { estado } = vencer(obterDoenca('pneumo'));
  assert.equal(recompensaBatalha(estado, { modo: 'tutorial', primeiraVez: true }).xp, 50);
  assert.equal(recompensaBatalha(estado, { modo: 'tutorial', primeiraVez: false }).xp, 0);
  assert.equal(recompensaBatalha(estado, { modo: 'historia', primeiraVez: true }).xp, 100);
  assert.equal(recompensaBatalha(estado, { modo: 'historia', primeiraVez: false }).xp, 0);
  assert.equal(recompensaBatalha({ ...estado, fim: 'derrota' }, { modo: 'historia', primeiraVez: true }).xp, 0);
  assert.equal(recompensaBatalha({ ...estado, fim: 'derrota' }, { modo: 'x1' }).xp, 20);
});

test('servidor: piloto do administrador e treinamento obrigatório', () => {
  assert.throws(() => pedir(admin({ role: 'jogador' }), { acao: 'iniciarBatalha', modo: 'tutorial', pet: 'cocobi', entradaId: ID }), /administrador/);
  assert.throws(() => pedir(admin(), { acao: 'iniciarBatalha', modo: 'historia', doencaId: 'pneumo', pet: 'cocobi', entradaId: ID }), /treinamento/);
  assert.throws(() => pedir(admin(), { acao: 'iniciarBatalha', modo: 'tutorial', pet: 'capsi', entradaId: ID }), /Cocobi/);
});

test('servidor: História grava ações, confirma XP uma vez e emite recibo', () => {
  let perfil = admin({ batalha: { tutorial: true } });
  perfil = pedir(perfil, { acao: 'iniciarBatalha', modo: 'historia', doencaId: 'dengue', pet: 'pulsa', entradaId: ID });
  assert.equal(perfil.tickets, 2, 'História é gratuita');
  assert.equal(pedir(perfil, { acao: 'iniciarBatalha', modo: 'historia', doencaId: 'dengue', pet: 'pulsa', entradaId: ID }), perfil, 'reenvio do início é idempotente');
  assert.throws(() => pedir(perfil, { acao: 'iniciarBatalha', modo: 'historia', doencaId: 'malaria', pet: 'pulsa', entradaId: ID2 }), /atual/);
  const { acoes } = vencer(obterDoenca('dengue'));
  const parcial = pedir(perfil, { acao: 'acaoBatalha', entradaId: ID, acoes: acoes.slice(0, 2) });
  assert.equal(parcial.batalha.entrada.acoes.length, 2);
  assert.ok(parcial.batalha.descobertas.includes('dengue'));
  assert.throws(() => pedir(parcial, { acao: 'acaoBatalha', entradaId: ID, acoes: acoes.slice(1, 3) }), /outra aba/);
  const { perfil: final, eventos } = executarPedidoSupabase(parcial, { acao: 'acaoBatalha', entradaId: ID, acoes });
  assert.equal(final.batalha.entrada.relatorio.resultado, 'vitoria');
  assert.ok(final.batalha.entrada.xpConcedido > 0);
  assert.equal(final.pontuacaoTotal, final.batalha.entrada.xpConcedido);
  assert.equal(final.batalha.concluidos.includes('dengue:1'), true);
  assert.deepEqual(eventos.map(e => e.id), [`recibo:${ID}`]);
  assert.equal(pedir(final, { acao: 'acaoBatalha', entradaId: ID, acoes }), final, 'reenvio do final não paga de novo');
  // Repetir a mesma doença não concede XP de novo.
  let repetido = pedir(final, { acao: 'iniciarBatalha', modo: 'historia', doencaId: 'dengue', pet: 'pulsa', entradaId: ID2 });
  repetido = pedir(repetido, { acao: 'acaoBatalha', entradaId: ID2, acoes });
  assert.equal(repetido.batalha.entrada.xpConcedido, 0);
  assert.equal(repetido.pontuacaoTotal, final.pontuacaoTotal);
});

test('servidor: duelo cobra um ticket, sorteia a doença e permite abandonar sem XP', () => {
  let perfil = pedir(admin({ batalha: { tutorial: true } }), { acao: 'iniciarBatalha', modo: 'x1', pet: 'capsi', entradaId: ID });
  assert.equal(perfil.tickets, 1);
  assert.ok(DOENCAS.some(d => d.id === perfil.batalha.entrada.doencaId));
  perfil = pedir(perfil, { acao: 'abandonarBatalha', entradaId: ID });
  assert.equal(perfil.batalha.entrada.relatorio.resultado, 'abandono');
  assert.equal(perfil.pontuacaoTotal, 0);
  assert.throws(() => pedir(admin({ tickets: 0, batalha: { tutorial: true } }), { acao: 'iniciarBatalha', modo: 'x1', pet: 'capsi', entradaId: ID }), /Tickets/);
});
