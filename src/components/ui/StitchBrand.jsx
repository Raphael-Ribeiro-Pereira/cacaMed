import { Stethoscope, Ticket } from 'lucide-react';

export default function StitchBrand({ secao, tickets }) {
  return <div className="stitch-header stitch-legacy-header">
    <div className="stitch-brand"><span className="stitch-brand-icon"><Stethoscope size={22} /></span><span><strong>cacoMed</strong><small>TERMINAL DE PLANTÃO</small></span></div>
    <span className="stitch-header-label">{secao}</span>
    {tickets != null && <span className="stitch-header-ticket"><Ticket size={17} /> {Number(tickets) || 0} tickets</span>}
  </div>;
}
