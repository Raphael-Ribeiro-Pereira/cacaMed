import test from 'node:test';
import assert from 'node:assert/strict';
import { criarFila, armazemMemoria } from '../services/filaOffline.js';

const relogio = () => { let t = 0; return () => new Date(Date.UTC(2026, 9, 19, 12, 0, t++)).toISOString(); };
const recusa = msg => Object.assign(new Error(msg), { status: 400 });

test('fila do aparelho: envia em ordem, um por vez; aceito sai, recusado fica com o motivo', async () => {
  const fila = criarFila(armazemMemoria(), { agora: relogio() });
  for (const n of [1, 2, 3]) await fila.enfileirar('u', 'rodadaTreino', { n });
  await fila.enfileirar('outra', 'rodadaTreino', { n: 9 });
  const enviados = [];
  const r = await fila.sincronizar('u', async item => { enviados.push(item.dados.n); if (item.dados.n === 2) throw recusa('Conteúdo desatualizado.'); return { ok: true }; });
  assert.deepEqual(enviados, [1, 2, 3], 'na ordem e só da própria conta');
  assert.equal(r.aceitos, 2);
  const resumo = await fila.resumo('u');
  assert.equal(resumo.pendentes, 0);
  assert.equal(resumo.recusados[0].motivo, 'Conteúdo desatualizado.');
  assert.equal((await fila.resumo('outra')).pendentes, 1, 'a fila de outra conta não é enviada');
});

test('fila do aparelho: sem rede, para no primeiro item e tenta de novo depois, sem perder nada', async () => {
  const fila = criarFila(armazemMemoria(), { agora: relogio() });
  await fila.enfileirar('u', 'rodadaTreino', { n: 1 });
  await fila.enfileirar('u', 'rodadaTreino', { n: 2 });
  let rede = false;
  const enviados = [];
  const enviar = async item => { if (!rede) throw new TypeError('Failed to fetch'); enviados.push(item.dados.n); return {}; };
  const primeira = await fila.sincronizar('u', enviar);
  assert.equal(primeira.parou, true);
  assert.equal(primeira.esperarMs, 2000);
  assert.equal((await fila.resumo('u')).pendentes, 2);
  rede = true;
  await fila.sincronizar('u', enviar);
  assert.deepEqual(enviados, [1, 2]);
  assert.equal((await fila.resumo('u')).pendentes, 0);
});

test('fila do aparelho: sessão vencida (401) e limite (429) não viram recusa', async () => {
  for (const status of [401, 429, 503]) {
    const fila = criarFila(armazemMemoria(), { agora: relogio() });
    await fila.enfileirar('u', 'rodadaTreino', {});
    await fila.sincronizar('u', async () => { throw Object.assign(new Error('x'), { status }); });
    const resumo = await fila.resumo('u');
    assert.equal(resumo.pendentes, 1, String(status));
    assert.equal(resumo.recusados.length, 0);
  }
});

test('treino offline: rodada jogada sem rede fica provisória, vai para a fila e o servidor confirma o mesmo XP', async () => {
  const { servicoTreinoComOffline } = await import('../services/treinoOffline.js');
  const { executarPedidoSupabase } = await import('../shared/executarPedidoSupabase.js');
  const { BANCO_QUIZ } = await import('./bancoTreinos.js');
  const { missaoDeLogin } = await import('./missoes.js');
  const hoje = '2026-10-19';
  let perfil = { uid: 'u', pontuacaoTotal: 0, tickets: 0, dataUltimoLogin: hoje, ofensiva: { dias: 1, ultimoDia: hoje }, missoesDiarias: [missaoDeLogin(1)] };
  const servidor = structuredClone(perfil);
  const fila = criarFila(armazemMemoria(), { agora: relogio() });
  let t = Date.parse('2026-10-19T14:00:00Z');
  const servico = servicoTreinoComOffline(async () => { throw new TypeError('Failed to fetch'); }, {
    perfilAtual: () => perfil, online: () => false, agora: () => new Date(t += 4000).toISOString(),
    guardarNaFila: (usuario, tipo, dados, id) => fila.enfileirar(usuario.uid, tipo, dados, id) });
  const entradaId = crypto.randomUUID();
  perfil = await servico({ uid: 'u' }, 'iniciarTreino', { modo: 'quiz', variante: 'teoria', entradaId });
  const respostas = [];
  for (const item of perfil.treinos.quiz.entrada.itens) {
    respostas.push({ itemId: item.id, escolha: BANCO_QUIZ.find(q => q.id === item.id).correta });
    perfil = await servico({ uid: 'u' }, 'responderTreino', { modo: 'quiz', entradaId, respostas: [...respostas] });
  }
  assert.equal(perfil.treinos.quiz.entrada.provisoria, true);
  const provisorio = perfil.pontuacaoTotal;
  assert.ok(provisorio >= 125);
  let confirmado;
  await fila.sincronizar('u', async item => {
    confirmado = executarPedidoSupabase(servidor, { acao: 'sincronizarFila', item }, { agora: new Date('2026-10-19T15:00:00Z') }).perfil;
    return confirmado;
  });
  assert.equal(confirmado.pontuacaoTotal, provisorio, 'o servidor chega ao mesmo XP');
  assert.equal((await fila.resumo('u')).pendentes, 0);
});

test('sessão offline: o perfil guardado vale por 15 dias desde o último contato confirmado', async () => {
  const { guardarPerfil, perfilGuardado, sessaoOfflineValida } = await import('../services/perfilOffline.js');
  const armazem = armazemMemoria();
  await guardarPerfil('u', { pontuacaoTotal: 10 }, { confirmado: true, armazem });
  assert.equal((await perfilGuardado('u', { armazem })).perfil.pontuacaoTotal, 10);
  // Guardar sem confirmação (XP provisório) não renova a validade.
  const { validadoEm } = await perfilGuardado('u', { armazem });
  await guardarPerfil('u', { pontuacaoTotal: 160 }, { armazem });
  assert.equal((await perfilGuardado('u', { armazem })).validadoEm, validadoEm);
  const depois = Date.parse(validadoEm) + 15 * 86400000;
  assert.deepEqual(await perfilGuardado('u', { armazem, agora: depois }), { vencida: true });
  assert.equal(await perfilGuardado('outra', { armazem }), null);
  assert.equal(sessaoOfflineValida(null), false);
});
