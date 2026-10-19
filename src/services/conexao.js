import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarConteudoSupabase, chamarPerfilSupabase } from './perfilSupabase';
import { filaDoAparelho } from './filaOffline';

// Detecção de rede do app offline (docs/app-offline.md#1-detecção-de-rede): `navigator.onLine`, os eventos online e
// offline e uma checagem na API com limite de 3 s.
export async function temInternet(timeoutMs = 3000) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  try { await buscarConteudoSupabase('ping', { signal: AbortSignal.timeout(timeoutMs) }); return true; } catch { return false; }
}

// Estado da conexão e da fila, e o envio automático: ao abrir, quando a rede volta e ao voltar para a aba.
// `estado`: 'online' | 'offline' | 'sincronizando'; `pendentes` e `recusados` vêm da fila do aparelho.
export function useConexao(usuario, aoConfirmar) {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [fila, setFila] = useState({ pendentes: 0, recusados: [] });
  const [sincronizando, setSincronizando] = useState(false);
  const rodando = useRef(false);
  const timer = useRef(null);
  const uid = usuario?.uid;

  const atualizarFila = useCallback(async () => { if (uid) setFila(await filaDoAparelho().resumo(uid)); }, [uid]);

  const sincronizar = useCallback(async () => {
    if (!uid || rodando.current) return;
    rodando.current = true;
    clearTimeout(timer.current);
    try {
      const conectado = await temInternet();
      setOnline(conectado);
      if (!conectado) return;
      const { pendentes } = await filaDoAparelho().resumo(uid);
      if (!pendentes) return;
      setSincronizando(true);
      const r = await filaDoAparelho().sincronizar(uid, item => chamarPerfilSupabase(usuario, 'sincronizarFila', { item }),
        { aoAceitar: perfil => aoConfirmar?.(perfil) });
      if (r.parou) timer.current = setTimeout(() => sincronizar(), r.esperarMs);
    } finally {
      rodando.current = false;
      setSincronizando(false);
      atualizarFila();
    }
  }, [uid, usuario, aoConfirmar, atualizarFila]);

  useEffect(() => {
    if (!uid) return undefined;
    const voltou = () => { setOnline(true); sincronizar(); };
    const caiu = () => setOnline(false);
    const visivel = () => { if (document.visibilityState === 'visible') sincronizar(); };
    window.addEventListener('online', voltou);
    window.addEventListener('offline', caiu);
    document.addEventListener('visibilitychange', visivel);
    window.addEventListener('cacomed-fila', atualizarFila);
    const inicio = setTimeout(sincronizar, 0);
    return () => {
      clearTimeout(inicio); clearTimeout(timer.current);
      window.removeEventListener('online', voltou);
      window.removeEventListener('offline', caiu);
      document.removeEventListener('visibilitychange', visivel);
      window.removeEventListener('cacomed-fila', atualizarFila);
    };
  }, [uid, sincronizar, atualizarFila]);

  return { estado: sincronizando ? 'sincronizando' : online ? 'online' : 'offline', online, ...fila, sincronizar };
}

// Guarda uma partida jogada sem rede e avisa o indicador.
export async function guardarNaFila(usuario, tipo, dados, id) {
  const item = await filaDoAparelho().enfileirar(usuario.uid, tipo, dados, id);
  window.dispatchEvent(new Event('cacomed-fila'));
  return item;
}
