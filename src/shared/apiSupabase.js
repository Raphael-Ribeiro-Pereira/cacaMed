import { executarPedidoSupabase, ACOES_REVISAO, usernameValido } from './executarPedidoSupabase.js';
import { resumirHistorico } from '../utils/estatisticasPainel.js';
import { criarMissoesDiarias, dataLocalHoje } from '../utils/missoes.js';

export const ORIGENS_SUPABASE = new Set(['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'https://caca-med.vercel.app']);
async function lerPedido(req) {
  const reader = req.body?.getReader();
  if (!reader) throw Object.assign(new Error('Pedido inválido.'), { status: 400 });
  const partes = [];
  let tamanho = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    tamanho += value.byteLength;
    if (tamanho > 32768) { await reader.cancel(); throw Object.assign(new Error('Pedido muito grande.'), { status: 413 }); }
    partes.push(value);
  }
  const bytes = new Uint8Array(tamanho);
  let pos = 0;
  for (const parte of partes) { bytes.set(parte, pos); pos += parte.length; }
  try {
    const pedido = JSON.parse(new TextDecoder().decode(bytes));
    if (!pedido || typeof pedido !== 'object' || Array.isArray(pedido) || typeof pedido.acao !== 'string') throw new Error();
    return pedido;
  } catch { throw Object.assign(new Error('Pedido inválido.'), { status: 400 }); }
}

// Username comparado sem diferenciar maiúsculas; outro jogador (fora da homologação) já usando bloqueia a troca.
async function usernameEmUso(database, username, uid) {
  const padrao = username.replace(/[\\%_*]/g, c => '\\' + c);
  const rows = await database('cacamed_player_state?select=player_id&limit=5&profile->>username=ilike.' + encodeURIComponent(padrao));
  return rows.some(r => r.player_id !== uid && !String(r.player_id).startsWith('homologacao:'));
}

export function criarApiSupabase({ database, identity, migrateIdentity, migratePassword, definePassword, ranking, coroas, palavras, log = () => {} }) {
  return async req => {
    const inicio = performance.now();
    let acao = 'desconhecida';
    const origin = req.headers.get('origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', Vary: 'Origin' };
    if (origin && ORIGENS_SUPABASE.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const answer = (body, status = 200, extra = {}) => {
      const duracao = Math.round(performance.now() - inicio);
      log({ acao, status, duracaoMs: duracao });
      return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Server-Timing': `api;dur=${duracao}`, ...extra } });
    };
    if (origin && !ORIGENS_SUPABASE.has(origin)) return answer({ erro: 'Origem não autorizada.' }, 403);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    try {
      if (req.method === 'GET') {
        acao = new URL(req.url).searchParams.get('acao');
        if (acao === 'ranking') return answer({ sucesso: true, ranking: await ranking() });
        if (acao === 'coroas' && coroas) return answer({ sucesso: true, coroas: await coroas() });
        if (acao === 'palavras') return answer({ resultado: await palavras() }, 200, { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' });
        return answer({ erro: 'Consulta inválida.' }, 400);
      }
      if (req.method !== 'POST') return answer({ erro: 'Método inválido.' }, 405);
      const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
      if (!token) return answer({ erro: 'Entre na conta para continuar.' }, 401);
      let user = await identity(token);
      const pedido = await lerPedido(req);
      acao = pedido.acao;
      if (acao === 'migrarSenha') return answer({ resultado: await migratePassword(user, pedido) });
      if (acao === 'definirSenha') return answer({ resultado: await definePassword(user, pedido, token) });
      if (acao === 'migrarIdentidade') return answer({ resultado: await migrateIdentity(user, pedido) });
      if (pedido.ambiente === 'homologacao') {
        const real = await database('cacamed_player_state?player_id=eq.' + encodeURIComponent(user.uid) + '&select=profile,version');
        if (real[0]?.profile.role !== 'admin') return answer({ erro: 'Homologação restrita ao administrador.' }, 403);
        user = { ...user, uid: 'homologacao:' + user.uid, authId: undefined, nome: 'Homologação isolada' };
      } else if (acao === 'prepararHomologacao') return answer({ erro: 'Ambiente de homologação obrigatório.' }, 400);
      const filter = 'player_id=eq.' + encodeURIComponent(user.uid);
      // Leituras do painel e do crachá: não alteram o perfil.
      if (acao === 'obterEstatisticas') {
        const eventos = await database('cacamed_events?' + filter + '&kind=in.(resposta,recibo)&select=kind,data,created_at&order=created_at.desc&limit=1500');
        return answer({ resultado: resumirHistorico(eventos) });
      }
      if (acao === 'verificarUsername') {
        const username = String(pedido.username || '').trim();
        if (!usernameValido(username)) return answer({ resultado: { disponivel: false, motivo: 'invalido' } });
        return answer({ resultado: { disponivel: !(await usernameEmUso(database, username, user.uid)) } });
      }
      // Um conflito de versão pode ser reavaliado com o estado confirmado. O motor
      // rejeita edição de respostas e trata reenvio sem pagar novamente.
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        const rows = await database('cacamed_player_state?' + filter + '&select=profile,version,auth_user_id');
        let row = rows[0];
        if (acao === 'prepararHomologacao') {
          if (row) return answer({ resultado: row.profile });
          const perfil = { uid: user.uid, nome: 'Homologação isolada', username: 'homologacao', role: 'admin',
            pontuacaoTotal: 490, tickets: 10, xpTopicos: {}, estatisticas: {}, estatisticasGerais: {},
            economia: { versao: 2, ultimoNivelPremiado: 1 }, missoesDiarias: criarMissoesDiarias(), dataUltimoLogin: dataLocalHoje() };
          try {
            await database('rpc/cacamed_commit', { method: 'POST', body: JSON.stringify({ p_player_id: user.uid, p_expected_version: -1, p_profile: perfil }) });
            return answer({ resultado: perfil });
          } catch (erro) { if (['PT409', '40001'].includes(erro.code)) continue; throw erro; }
        }
        if (!row) {
          if (acao === 'obterPerfil') return answer({ resultado: null });
          if (acao !== 'cadastrar') return answer({ erro: 'Cadastro não concluído.' }, 409);
          const username = pedido.usarNomeGoogle ? user.nome.split(/\s+/)[0].toLocaleLowerCase('pt-BR') : String(pedido.username || '').trim();
          if (!['Doutor', 'Doutora'].includes(pedido.titulo) || !['anatomia', 'neurologia', 'farmaco', 'micro', 'clinica', 'patologia'].includes(pedido.materiaPreferida) ||
              username.length < 2 || username.length > 40 || /^[=+\-@]/.test(username)) return answer({ erro: 'Cadastro inválido.' }, 400);
          const perfil = { uid: user.uid, email: user.email, nome: user.nome || user.email.split('@')[0] || 'Plantonista', username, titulo: pedido.titulo, role: 'jogador',
            materiaPreferida: pedido.materiaPreferida, especialidade: pedido.materiaPreferida,
            pontuacaoTotal: 0, tickets: 0, xpTopicos: {}, estatisticas: {}, estatisticasGerais: {},
            economia: { versao: 2, ultimoNivelPremiado: 1 }, missoesDiarias: criarMissoesDiarias(),
            dataUltimoLogin: dataLocalHoje(), tutorialCruzadinhasConcluido: false, criadoEm: new Date().toISOString() };
          try {
            await database('rpc/cacamed_commit', { method: 'POST', body: JSON.stringify({ p_player_id: user.uid, p_expected_version: -1, p_profile: perfil }) });
            if (user.authId) await database('cacamed_player_state?' + filter + '&auth_user_id=is.null', { method: 'PATCH', body: JSON.stringify({ auth_user_id: user.authId }) });
            return answer({ resultado: perfil });
          } catch (erro) { if (['PT409', '40001'].includes(erro.code)) continue; throw erro; }
        }
        if (acao === 'cadastrar') return answer({ resultado: row.profile });
        const novoUsername = String(pedido.username || '').trim();
        if (acao === 'editarPerfil' && novoUsername !== row.profile.username && usernameValido(novoUsername)
            && await usernameEmUso(database, novoUsername, user.uid)) return answer({ erro: 'Este username já está em uso por outro plantonista.' }, 409);
        let historico = [];
        if (ACOES_REVISAO.includes(acao)) {
          if (row.profile.role !== 'admin') return answer({ erro: 'Revisão inteligente em piloto para administrador.' }, 403);
          for (let offset = 0; ; offset += 1000) {
            const page = await database('cacamed_events?' + filter + '&kind=in.(resposta,revisao)&select=data,kind&order=created_at.asc,event_id.asc&limit=1000&offset=' + offset);
            historico.push(...page);
            if (page.length < 1000) break;
          }
        }
        const id = pedido.entradaId || pedido.revisaoId || pedido.partida?.id;
        const recibo = id ? await database('cacamed_events?' + filter + '&event_id=eq.' + encodeURIComponent('recibo:' + id) + '&select=event_id') : [];
        // O recibo pode ter sido confirmado por outra chamada depois da leitura
        // acima. Nesse caso, devolve o perfil lido DEPOIS do recibo confirmado.
        if (recibo.length) row = (await database('cacamed_player_state?' + filter + '&select=profile,version,auth_user_id'))[0];
        let alteracao;
        try {
          alteracao = executarPedidoSupabase(row.profile, pedido, { recibos: recibo.length ? [id] : [],
            tentativas: historico.filter(r => r.kind === 'resposta').map(r => r.data), revisoes: historico.filter(r => r.kind === 'revisao').map(r => r.data) });
        } catch (erro) { return answer({ erro: erro.message }, 400); }
        if (alteracao.perfil === row.profile) return answer({ resultado: row.profile });
        try {
          await database('rpc/cacamed_commit', { method: 'POST', body: JSON.stringify({ p_player_id: user.uid, p_expected_version: row.version,
            p_profile: alteracao.perfil, p_events: alteracao.eventos }) });
          return answer({ resultado: alteracao.perfil });
        } catch (erro) { if (['PT409', '40001'].includes(erro.code)) continue; throw erro; }
      }
      return answer({ erro: 'Outro pedido atualizou o progresso. Consulte o progresso salvo antes de reenviar.' }, 409);
    } catch (erro) {
      return answer({ erro: erro.status ? erro.message : 'Não foi possível confirmar a operação. Consulte o progresso salvo.' }, erro.status || 503);
    }
  };
}
