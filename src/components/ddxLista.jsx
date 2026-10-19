import { Lock, Ticket } from 'lucide-react';

// Lista de casos de um modo do DDX, agrupada por tema. Caso sem revisão clínica só aparece travado para
// jogadores comuns; o administrador abre todos. Abrir um caso novo custa 1 ticket; retomar não custa.
export function ListaCasos({ itens, abertaId, admin, tickets, aoEscolher }) {
  const visiveis = itens.filter(c => c.revisado || admin);
  const temas = [...new Set(visiveis.map(c => c.tema))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  if (!visiveis.length) return <p className="muted" style={{ padding: 18 }}>Nenhum caso liberado ainda.</p>;
  let n = 0;
  return <div className="dx-lista">
    {tickets < 1 && <p className="muted" role="status" style={{ padding: '4px 18px 10px' }}>
      Sem tickets para abrir um caso novo. Ganhe tickets concluindo cruzadinhas (2 por grade), missões do dia (1 ou 2 cada),
      duas rodadas de Quiz ou Verdade ou mentira com acerto (1) e subindo de nível.</p>}
    {temas.map(tema => <div key={tema} style={{ display: 'contents' }}>
      <div className="dx-grupo">{tema}</div>
      {visiveis.filter(c => c.tema === tema).map(c => {
        n++;
        const semTicket = tickets < 1 && abertaId !== c.id;
        const estado = abertaId === c.id ? ['Retomar', 'go'] : c.concluido ? ['Concluído', 'ok'] : !c.revisado ? ['Em revisão', ''] : null;
        return <button key={c.id} className="dx-item" disabled={semTicket} onClick={() => aoEscolher(c.id)}>
          <span className="n">{n}</span>
          <span><b>{c.titulo}</b><small>{c.tema}{c.concluido ? ' · repetir não dá XP' : ''}{semTicket ? ' · sem tickets' : ''}</small></span>
          <span className={`st ${estado?.[1] || ''}`}>{estado ? estado[0] : abertaId === c.id ? '' : <><Ticket size={12} style={{ verticalAlign: '-2px' }} /> 1</>}</span>
          {!c.revisado && !admin && <Lock size={14} />}
        </button>;
      })}
    </div>)}
  </div>;
}
