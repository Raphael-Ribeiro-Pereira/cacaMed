// S-03 da auditoria de segurança (docs/seguranca.md): limite de frequência em memória, por janela fixa.
// Cada instância da Edge Function tem o próprio contador. Não é um limite global, mas barra a enxurrada
// de um mesmo cliente, que costuma cair na mesma instância. Um limite no banco fica para depois.
export function criarLimitador({ agora = () => Date.now(), maximoChaves = 20000 } = {}) {
  const contadores = new Map();
  // Devolve 0 quando o pedido passa; senão, os segundos até a janela recomeçar.
  return (chave, maximo, janelaMs) => {
    const t = agora();
    let contador = contadores.get(chave);
    if (!contador || t - contador.inicio >= contador.janelaMs) {
      contador = { inicio: t, janelaMs, total: 0 };
      contadores.set(chave, contador);
    }
    contador.total++;
    if (contadores.size > maximoChaves) {
      for (const [k, c] of contadores) if (t - c.inicio >= c.janelaMs) contadores.delete(k);
    }
    return contador.total <= maximo ? 0 : Math.max(1, Math.ceil((contador.inicio + contador.janelaMs - t) / 1000));
  };
}

// Limites por janela: [máximo de pedidos, janela em milissegundos].
export const LIMITES_API = {
  publico: [60, 60000],    // GET sem login (ranking, coroas, palavras), por IP
  ip: [300, 60000],        // POST por IP, antes de verificar o token (escolas e redes compartilham IP)
  jogador: [60, 60000],    // POST por jogador
  username: [20, 60000],   // verificarUsername, por jogador
  senha: [5, 900000],      // migrarSenha e definirSenha, por jogador
};

// IP do cliente: o Cloudflare na frente do Supabase grava cf-connecting-ip. O primeiro endereço do x-forwarded-for
// pode ser forjado para escapar do limite, mas não prejudica outros jogadores (o último pode ser de um proxy
// compartilhado por todos). Sem IP conhecido, a API não aplica o limite por IP.
export const ipDoPedido = req => req.headers.get('cf-connecting-ip')
  || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
