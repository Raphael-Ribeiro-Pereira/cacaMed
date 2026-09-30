// Não conhece Firebase, React ou armazenamento do navegador: o cliente fornece
// uma credencial vigente. Nunca recebe uma chave service_role.
export function criarTransporteSupabase({ url, chavePublica, obterToken, fetchImpl = globalThis.fetch }) {
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.supabase.co')) {
    throw new Error('URL Supabase inválida.');
  }
  if (!chavePublica || typeof obterToken !== 'function') throw new Error('Configuração Supabase incompleta.');
  return async (acao, dados = {}, timeoutMs = 15000) => {
    const token = await obterToken();
    if (!token) throw new Error('Entre na conta para continuar.');
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
    try {
      const resposta = await fetchImpl(new URL('/functions/v1/cacamed-api', endpoint), {
        method: 'POST', signal: controlador.signal,
        headers: { 'Content-Type': 'application/json', apikey: chavePublica, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...dados, acao }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok || corpo.erro) throw new Error(corpo.erro || `Falha no serviço (HTTP ${resposta.status}).`);
      return corpo.resultado;
    } catch (erro) {
      if (erro.name === 'AbortError') throw new Error('O servidor demorou a responder. Consulte o progresso salvo antes de reenviar.');
      throw erro;
    } finally {
      clearTimeout(temporizador);
    }
  };
}

