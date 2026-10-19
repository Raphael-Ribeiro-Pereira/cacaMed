import { useState } from 'react';
import { CloudOff, RefreshCw, TriangleAlert, X } from 'lucide-react';
import { filaDoAparelho } from '../services/filaOffline';

// Indicador discreto do app offline (docs/app-offline.md#1-detecção-de-rede): sem internet, enviando a fila ou itens
// recusados (toque mostra o motivo). Online e com a fila vazia, não aparece.
const ROTULO = { rodadaTreino: 'Rodada de treino' };
export default function IndicadorConexao({ conexao }) {
  const [aberto, setAberto] = useState(false);
  const { estado, pendentes, recusados } = conexao;
  if (estado === 'online' && !pendentes && !recusados.length) return null;
  const estilo = { position: 'fixed', right: 12, bottom: 'calc(84px + env(safe-area-inset-bottom))', zIndex: 60, display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, border: '1px solid var(--line, #2a3550)', background: 'var(--card, #0f1830)', color: 'var(--ink, #e8eefc)' };
  const texto = estado === 'offline' ? `Sem internet${pendentes ? ` · ${pendentes} na fila` : ''}`
    : estado === 'sincronizando' ? `Enviando ${pendentes} ${pendentes === 1 ? 'item' : 'itens'}`
      : recusados.length ? `${recusados.length} não ${recusados.length === 1 ? 'enviado' : 'enviados'}` : `${pendentes} na fila`;
  const Icone = estado === 'offline' ? CloudOff : estado === 'sincronizando' ? RefreshCw : recusados.length ? TriangleAlert : RefreshCw;
  return <>
    <button style={estilo} role="status" aria-live="polite" onClick={() => (recusados.length ? setAberto(true) : conexao.sincronizar())}><Icone size={14} />{texto}</button>
    {aberto && <div role="dialog" aria-label="Itens não enviados" style={{ ...estilo, borderRadius: 14, bottom: 'calc(130px + env(safe-area-inset-bottom))', display: 'grid', gap: 8, maxWidth: 320, fontWeight: 400 }}>
      <b style={{ display: 'flex', justifyContent: 'space-between' }}>Não enviados <button className="icon-btn" aria-label="Fechar" onClick={() => setAberto(false)}><X size={14} /></button></b>
      {recusados.map(i => <div key={i.id} style={{ display: 'grid', gap: 4 }}>
        <span>{ROTULO[i.tipo] || i.tipo} de {new Date(i.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        <small style={{ opacity: .8 }}>{i.motivo}</small>
        <button className="w-link" style={{ justifySelf: 'start', fontSize: 12 }} onClick={async () => { await filaDoAparelho().descartar(i.id); window.dispatchEvent(new Event('cacomed-fila')); }}>Entendi, remover</button>
      </div>)}
    </div>}
  </>;
}
