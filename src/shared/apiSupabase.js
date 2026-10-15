import { executarPedidoSupabase, ACOES_REVISAO, usernameValido } from './executarPedidoSupabase.js';
import { resumirHistorico } from '../utils/estatisticasPainel.js';
import { criarMissoesDiarias, dataLocalHoje } from '../utils/missoes.js';
import { validarPartidaNoBanco } from './operarJogosSupabase.js';
import { criarLimitador, ipDoPedido, LIMITES_API } from './limitador.js';
import { materiaValida, validarCurso } from '../utils/curso.js';

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

// Cadastro (S-09 de docs/seguranca.md): o nome vem do Auth, que o próprio jogador pode editar; sem controles,
// no máximo 80 caracteres e sem começar por =, +, - ou @ (fórmula de planilha).
const erroDePrograma = erro => [TypeError, ReferenceError, RangeError, SyntaxError].some(tipo => erro instanceof tipo);

export const limparNome = texto => String(texto || '').replace(/\p{Cc}/gu, '').replace(/\s+/g, ' ').trim()
  .replace(/^[=+\-@]+/, '').trim().slice(0, 80);
// Apps antigos pedem o primeiro nome do Google como username: vira um username válido pela regra do crachá.
export const usernameDoNome = nome => {
  const base = String(nome || '').split(/\s+/)[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 20);
  return usernameValido(base) ? base : 'plantonista';
};

export function criarApiSupabase({ database, identity, migrateIdentity, migratePassword, definePassword, ranking, coroas, palavras, log = () => {},
  limitador = criarLimitador(), limites = LIMITES_API }) {
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
    // Limite de frequência (S-03 de docs/seguranca.md): responde 429 com Retry-After.
    const ip = ipDoPedido(req);
    const barrar = (chave, [maximo, janelaMs]) => {
      const segundos = limitador(chave, maximo, janelaMs);
      return segundos ? answer({ erro: 'Muitas requisições em pouco tempo. Aguarde um pouco e tente de novo.' }, 429, { 'Retry-After': String(segundos) }) : null;
    };
    try {
      if (req.method === 'GET') {
        acao = new URL(req.url).searchParams.get('acao');
        const barrado = ip && barrar('get:' + ip, limites.publico);
        if (barrado) return barrado;
        const publico = { 'Cache-Control': 'public, max-age=60' };
        if (acao === 'ranking') return answer({ sucesso: true, ranking: await ranking() }, 200, publico);
        if (acao === 'coroas' && coroas) return answer({ sucesso: true, coroas: await coroas() }, 200, publico);
        if (acao === 'palavras') return answer({ resultado: await palavras() }, 200, { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' });
        return answer({ erro: 'Consulta inválida.' }, 400);
      }
      if (req.method !== 'POST') return answer({ erro: 'Método inválido.' }, 405);
      const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
      if (!token) return answer({ erro: 'Entre na conta para continuar.' }, 401);
      const barradoIp = ip && barrar('ip:' + ip, limites.ip);
      if (barradoIp) return barradoIp;
      let user = await identity(token);
      const pedido = await lerPedido(req);
      acao = pedido.acao;
      const barrado = barrar('jogador:' + user.uid, limites.jogador)
        || (['migrarSenha', 'definirSenha'].includes(acao) && barrar('senha:' + user.uid, limites.senha))
        || (acao === 'verificarUsername' && barrar('username:' + user.uid, limites.username));
      if (barrado) return barrado;
      // Cruzadinha (S-02): a partida tem que caber no tópico do banco de palavras do servidor.
      if (acao === 'registrarPartida' && palavras) {
        try { validarPartidaNoBanco(pedido.partida, (await palavras()).banco); } catch (erro) { return answer({ erro: erro.message }, 400); }
      }
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
          let username = pedido.usarNomeGoogle ? usernameDoNome(user.nome) : String(pedido.username || '').trim();
          // curso (etapa, faculdade, não sou de Medicina) chegou em 15/10/2026: app antigo ainda sem ele cadastra como antes.
          const curso = pedido.curso === undefined ? {} : validarCurso(pedido.curso);
          if (!['Doutor', 'Doutora'].includes(pedido.titulo) || !materiaValida(pedido.materiaPreferida) || !curso ||
              !usernameValido(username)) return answer({ erro: 'Cadastro inválido.' }, 400);
          if (await usernameEmUso(database, username, user.uid)) {
            if (!pedido.usarNomeGoogle) return answer({ erro: 'Este username já está em uso por outro plantonista.' }, 409);
            username = `${username.slice(0, 16)}${Math.floor(Math.random() * 9000) + 1000}`;
          }
          const nome = limparNome(user.nome) || limparNome(String(user.email || '').split('@')[0]) || 'Plantonista';
          // S-06: e-mail ainda não verificado de conta antiga do Firebase não vira `email` do perfil (esse campo
          // reserva o endereço e bloquearia o login Google de quem é dono dele).
          const contato = user.source === 'firebase' && user.emailVerified === false ? { emailNaoVerificado: user.email } : { email: user.email };
          const perfil = { uid: user.uid, ...contato, nome, username, titulo: pedido.titulo, role: 'jogador',
            materiaPreferida: pedido.materiaPreferida, especialidade: pedido.materiaPreferida, ...curso,
            pontuacaoTotal: 0, tickets: 0, xpTopicos: {}, estatisticas: {}, estatisticasGerais: {},
            economia: { versao: 2, ultimoNivelPremiado: 1 }, missoesDiarias: criarMissoesDiarias(),
            dataUltimoLogin: dataLocalHoje(), tutorialCruzadinhasConcluido: false, criadoEm: new Date().toISOString() };
          try {
            await database('rpc/cacamed_commit', { method: 'POST', body: JSON.stringify({ p_player_id: user.uid, p_expected_version: -1, p_profile: perfil }) });
            if (user.authId) await database('cacamed_player_state?' + filter + '&auth_user_id=is.null', { method: 'PATCH', body: JSON.stringify({ auth_user_id: user.authId }) });
            return answer({ resultado: perfil });
          } catch (erro) { if (['PT409', '40001'].includes(erro.code)) continue; if (erro.code === '23505') return answer({ erro: 'Este username já está em uso por outro plantonista.' }, 409); throw erro; }
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
        } catch (erro) {
          // S-12: erro de programa (TypeError e afins) não vai para o cliente; o detalhe fica só no log.
          if (erroDePrograma(erro)) { log({ acao, erroInterno: String(erro.stack || erro).slice(0, 500) }); return answer({ erro: 'Pedido inválido.' }, 400); }
          return answer({ erro: erro.message }, 400);
        }
        if (alteracao.perfil === row.profile) return answer({ resultado: row.profile });
        try {
          await database('rpc/cacamed_commit', { method: 'POST', body: JSON.stringify({ p_player_id: user.uid, p_expected_version: row.version,
            p_profile: alteracao.perfil, p_events: alteracao.eventos }) });
          return answer({ resultado: alteracao.perfil });
        } catch (erro) { if (['PT409', '40001'].includes(erro.code)) continue; if (erro.code === '23505') return answer({ erro: 'Este username já está em uso por outro plantonista.' }, 409); throw erro; }
      }
      return answer({ erro: 'Outro pedido atualizou o progresso. Consulte o progresso salvo antes de reenviar.' }, 409);
    } catch (erro) {
      return answer({ erro: erro.status ? erro.message : 'Não foi possível confirmar a operação. Consulte o progresso salvo.' }, erro.status || 503);
    }
  };
}
