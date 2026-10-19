// Fila do app offline (docs/app-offline.md#2-fila-de-envio): o que foi jogado sem rede fica guardado no aparelho e sai
// em ordem, um item por vez, quando a rede volta. Item aceito sai da fila; recusado fica visível com o motivo.
// `armazem` é o IndexedDB no navegador e um Map nos testes.

export const ESPERAS_REENVIO = [2000, 5000, 15000, 60000, 300000];

export function criarFila(armazem, { agora = () => new Date().toISOString(), novoId = () => crypto.randomUUID() } = {}) {
  const daConta = async uid => (await armazem.todos()).filter(i => i.uid === uid).sort((a, b) => a.criadoEm.localeCompare(b.criadoEm) || a.ordem - b.ordem);
  let ordem = 0;
  return {
    async enfileirar(uid, tipo, dados, id = novoId()) {
      if (!uid) throw new Error('Entre na conta para guardar a partida.');
      const item = { id, uid, tipo, dados, criadoEm: agora(), ordem: ordem++, tentativas: 0, estado: 'pendente' };
      await armazem.guardar(item);
      return item;
    },
    daConta,
    async resumo(uid) {
      const itens = await daConta(uid);
      return { pendentes: itens.filter(i => i.estado !== 'recusado').length, recusados: itens.filter(i => i.estado === 'recusado') };
    },
    async descartar(id) { await armazem.apagar(id); },
    // Envia os pendentes em ordem. Recusa (erro com status 4xx) marca o item e segue; falta de rede ou erro do servidor
    // para a fila e devolve quando tentar de novo. `enviar(item)` devolve o perfil confirmado pelo servidor.
    async sincronizar(uid, enviar, { aoAceitar } = {}) {
      let aceitos = 0;
      for (const item of await daConta(uid)) {
        if (item.estado === 'recusado') continue;
        try {
          const perfil = await enviar(item);
          await armazem.apagar(item.id);
          aceitos++;
          aoAceitar?.(perfil, item);
        } catch (erro) {
          const tentativas = item.tentativas + 1;
          if (erro.status >= 400 && erro.status < 500 && erro.status !== 401 && erro.status !== 408 && erro.status !== 429) {
            await armazem.guardar({ ...item, tentativas, estado: 'recusado', motivo: erro.message });
            continue;
          }
          await armazem.guardar({ ...item, tentativas, estado: 'pendente', ultimoErro: erro.message });
          return { aceitos, parou: true, esperarMs: ESPERAS_REENVIO[Math.min(tentativas, ESPERAS_REENVIO.length) - 1] };
        }
      }
      return { aceitos, parou: false };
    },
  };
}

// Armazém em IndexedDB (banco `cacomed-offline`, tabela `fila`). Pede armazenamento persistente quando o navegador permite.
export function armazemIndexedDB(nome = 'cacomed-offline') {
  const abrir = () => new Promise((resolve, reject) => {
    // Versão 2: além da fila, a tabela `dados` guarda o último perfil confirmado e o banco de palavras.
    const pedido = indexedDB.open(nome, 2);
    pedido.onupgradeneeded = () => {
      if (!pedido.result.objectStoreNames.contains('fila')) pedido.result.createObjectStore('fila', { keyPath: 'id' });
      if (!pedido.result.objectStoreNames.contains('dados')) pedido.result.createObjectStore('dados');
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
  let banco;
  const transacao = async (modo, fazer, tabela = 'fila') => {
    banco ||= abrir();
    const db = await banco;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(tabela, modo);
      const r = fazer(tx.objectStore(tabela));
      tx.oncomplete = () => resolve(r?.result);
      tx.onerror = () => reject(tx.error);
    });
  };
  navigator.storage?.persist?.().catch(() => {});
  return {
    todos: () => transacao('readonly', s => s.getAll()),
    guardar: item => transacao('readwrite', s => s.put(item)),
    apagar: id => transacao('readwrite', s => s.delete(id)),
    ler: chave => transacao('readonly', s => s.get(chave), 'dados'),
    gravar: (chave, valor) => transacao('readwrite', s => s.put(valor, chave), 'dados'),
  };
}

export const armazemMemoria = () => {
  const m = new Map();
  const d = new Map();
  return { todos: async () => [...m.values()].map(v => structuredClone(v)), guardar: async i => { m.set(i.id, structuredClone(i)); }, apagar: async id => { m.delete(id); },
    ler: async k => structuredClone(d.get(k)), gravar: async (k, v) => { d.set(k, structuredClone(v)); } };
};

let armazemPadrao;
let filaPadrao;
export const armazemDoAparelho = () => (armazemPadrao ||= typeof indexedDB === 'undefined' ? armazemMemoria() : armazemIndexedDB());
export const filaDoAparelho = () => (filaPadrao ||= criarFila(armazemDoAparelho()));
