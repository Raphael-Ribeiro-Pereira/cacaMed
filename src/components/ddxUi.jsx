import { HeartPulse } from 'lucide-react';

// Peças do DDX do protótipo de movimento: monitor com sinais vitais e ECG, e a cadeia do Causa e efeito.
const formatar = (valor, casas = 0) => valor == null ? '--' : casas ? valor.toFixed(casas).replace('.', ',') : String(valor);

export function Vitais({ v, mudou }) {
  const c = mudou ? 'changed' : '';
  return <>
    <div className="vitals">
      <div className="vital hr"><small>FC</small><b className={c} key={'fc' + v.fc}>{formatar(v.fc)}</b></div>
      <div className="vital rr"><small>FR</small><b className={c} key={'fr' + v.fr}>{formatar(v.fr)}</b></div>
      <div className="vital sp"><small>SpO₂</small><b className={c} key={'sp' + v.spo2}>{v.spo2 == null ? '--' : `${v.spo2}%`}</b></div>
      <div className="vital"><small>PA</small><b style={{ fontSize: 13 }}>{v.pa || '--'}</b></div>
      <div className="vital"><small>T °C</small><b style={{ fontSize: 13 }}>{formatar(v.t, 1)}</b></div>
    </div>
    <div className="mon-ecg" style={{ '--beat': `${(60 / (v.fc || 80)) * 1.6}s` }} aria-hidden="true"><svg viewBox="0 0 280 40" preserveAspectRatio="none"><path d="M0 24h60l8-3 6 3h16l7-20 8 34 7-24 5 10h24l10-6 8 6h101" /></svg></div>
  </>;
}

// respondidas: quantas etapas já foram respondidas; resultados: acertos por etapa, no relatório.
export function Cadeia({ nos, respondidas, resultados }) {
  return <div className="chain" aria-label="Cadeia causal">
    {nos.map((t, k) => <span key={t} style={{ display: 'contents' }}>
      {k > 0 && <span className={`link ${k <= respondidas ? 'lit' : ''}`} />}
      <span className={`node ${k === 0 || k <= respondidas ? (resultados ? (k === 0 || resultados[k - 1] ? 'good' : 'miss') : 'lit') : ''}`}><i>{k === 0 ? <HeartPulse size={15} /> : k}</i><span>{k === 0 || k <= respondidas ? t : '?'}</span></span>
    </span>)}
  </div>;
}
