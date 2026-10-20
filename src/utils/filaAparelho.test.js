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

test('DDX offline: caso jogado sem rede vai para a fila e o servidor refaz com o mesmo XP; só gasta ticket confirmado', async () => {
  const { servicoDdxComOffline, saldoOffline } = await import('../services/ddxOffline.js');
  const { executarPedidoSupabase } = await import('../shared/executarPedidoSupabase.js');
  const { obterAuditoria, AUDITORIAS } = await import('./erroMedico.js');
  const { missaoDeLogin, dataLocalHoje } = await import('./missoes.js');
  const hoje = dataLocalHoje();
  const armazem = armazemMemoria();
  const fila = criarFila(armazem, { agora: relogio() });
  let perfil = { uid: 'u', pontuacaoTotal: 0, tickets: 1, dataUltimoLogin: hoje, ofensiva: { dias: 1, ultimoDia: hoje }, missoesDiarias: [missaoDeLogin(1)] };
  const servidor = structuredClone(perfil);
  await armazem.gravar('confirmado:u', { tickets: 1 });
  const servico = servicoDdxComOffline(async () => { throw new TypeError('Failed to fetch'); }, { perfilAtual: () => perfil, armazem, fila, online: () => false });
  const a = obterAuditoria(AUDITORIAS.find(x => x.revisado).id);
  const entradaId = crypto.randomUUID();
  perfil = await servico({ uid: 'u' }, 'iniciarAuditoria', { auditoriaId: a.id, entradaId });
  assert.equal(perfil.tickets, 0);
  assert.equal(await saldoOffline('u', { armazem, fila }), 0, 'o caso aberto já conta como gasto');
  await assert.rejects(servico({ uid: 'u' }, 'iniciarRelacao', { relacaoId: 'x', entradaId: crypto.randomUUID() }), /sem ticket confirmado/);
  perfil = await servico({ uid: 'u' }, 'responderAuditoria', { entradaId, respostas: a.perguntas.map(p => p.correta) });
  assert.equal(perfil.erroMedico.entrada.provisoria, true);
  assert.equal(perfil.pontuacaoTotal, 400);
  let confirmado;
  await fila.sincronizar('u', async item => (confirmado = executarPedidoSupabase(servidor, { acao: 'sincronizarFila', item }).perfil));
  assert.equal(confirmado.pontuacaoTotal, 400);
  assert.equal(confirmado.tickets, 0);
  // Outro aparelho gastou o último ticket antes: o caso é recusado com o motivo e não paga.
  const fila2 = criarFila(armazemMemoria(), { agora: relogio() });
  await fila2.enfileirar('u', 'pedidosDdx', { pedidos: [{ acao: 'iniciarAuditoria', auditoriaId: a.id, entradaId: crypto.randomUUID() }] });
  const item = (await fila2.daConta('u'))[0];
  item.dados.pedidos[0].entradaId = item.id;
  assert.throws(() => executarPedidoSupabase({ ...servidor, tickets: 0 }, { acao: 'sincronizarFila', item }), /Sem ticket na sincronização/);
});

test('perfil confirmado pela fila mantém as rodadas e os casos provisórios abertos', async () => {
  const { manterProvisorias } = await import('../services/perfilOffline.js');
  const local = { treinos: { quiz: { entrada: { id: 'q', provisoria: true, encerrada: false } } }, erroMedico: { entrada: { id: 'e', provisoria: true } },
    causaEfeito: { entrada: { id: 'c', provisoria: true, relatorio: {} } } };
  const servidor = { pontuacaoTotal: 9, treinos: { quiz: { partidas: 3 } }, causaEfeito: { entrada: { id: 'srv' } } };
  const r = manterProvisorias(servidor, local);
  assert.equal(r.pontuacaoTotal, 9);
  assert.equal(r.treinos.quiz.entrada.id, 'q');
  assert.equal(r.treinos.quiz.partidas, 3);
  assert.equal(r.erroMedico.entrada.id, 'e');
  assert.equal(r.causaEfeito.entrada.id, 'srv', 'o caso já encerrado fica com a versão do servidor');
});

test('Revisão offline: a carta abre da reserva do servidor, vai para a fila e o servidor refaz com a sequência dele', async () => {
  const { servicoRevisaoComOffline } = await import('../services/revisaoOffline.js');
  const { operarRevisaoSupabase } = await import('../shared/operarRevisaoSupabase.js');
  const { executarPedidoSupabase } = await import('../shared/executarPedidoSupabase.js');
  const { BANCO_QUIZ } = await import('./bancoTreinos.js');
  const { xpParaNivel } = await import('./economia.js');
  const q = BANCO_QUIZ[0];
  const tentativas = [{ modo: 'quiz', itemId: q.id, versao: q.versao, tema: q.tema, acertou: false, escolha: 'x', rodadaId: 'r1', data: '2026-10-18T10:00:00Z' }];
  const agora = '2026-10-19T12:00:00.000Z';
  const base = { uid: 'u', role: 'jogador', pontuacaoTotal: xpParaNivel(10), tickets: 0, dataUltimoLogin: '2026-10-19', ofensiva: { dias: 1, ultimoDia: '2026-10-19' }, missoesDiarias: [{ id: 'login' }] };
  // Com rede: a revisão da semana começa e a consulta prepara a reserva de cada carta que falta.
  const semana = operarRevisaoSupabase(base, { acao: 'iniciarSemanaRevisao' }, tentativas, [], [], agora);
  let perfil = operarRevisaoSupabase(semana, { acao: 'consultarRevisao' }, tentativas, [], [], agora);
  assert.ok(perfil.revisao.offline.sessoes['quiz-1'].itens.every(i => !('correta' in i)), 'reserva sem gabarito');
  const fila = criarFila(armazemMemoria(), { agora: relogio() });
  const servico = servicoRevisaoComOffline(async () => { throw new TypeError('Failed to fetch'); }, { perfilAtual: () => perfil, online: () => false, agora: () => agora,
    guardarNaFila: (usuario, tipo, dados, id) => fila.enfileirar(usuario.uid, tipo, dados, id) });
  const revisaoId = crypto.randomUUID();
  perfil = await servico({ uid: 'u' }, 'iniciarRevisao', { carta: 'quiz-1', revisaoId });
  assert.equal(perfil.revisao.entrada.provisoria, true);
  for (const item of perfil.revisao.entrada.itens) {
    const original = BANCO_QUIZ.find(x => x.id === item.id);
    perfil = await servico({ uid: 'u' }, 'responderRevisao', { revisaoId, itemId: item.id, versao: item.versao, escolha: original.correta });
  }
  assert.equal(perfil.revisao.entrada.encerrada, true);
  await assert.rejects(servico({ uid: 'u' }, 'explicarRevisao', {}), /precisa de internet/);
  // O aparelho não decide a sequência: mesmo com um item "adulterado", o servidor usa o histórico dele.
  const [item] = await fila.daConta('u');
  item.dados.itens[0].sequenciaAnterior = 2;
  const { perfil: confirmado, eventos } = executarPedidoSupabase(semana, { acao: 'sincronizarFila', item }, { tentativas, revisoes: [], agora: new Date(agora) });
  assert.equal(confirmado.revisao.entrada.resultados[0].sequencia, 1);
  // Sem XP de domínio no primeiro acerto; a única carta da semana fecha a revisão e paga o prêmio (35 XP por item).
  assert.ok(confirmado.revisao.semana.concluidaEm);
  assert.equal(confirmado.pontuacaoTotal, base.pontuacaoTotal + confirmado.revisao.entrada.resultados.length * 35);
  assert.ok(eventos.some(e => e.id === `recibo:${revisaoId}`));
});
