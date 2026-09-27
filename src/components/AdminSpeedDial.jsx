import { useEffect, useId, useRef, useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function AdminSpeedDial({ children, titulo = 'Ferramentas admin' }) {
  const [aberto, setAberto] = useState(false);
  const idPainel = useId();
  const botaoRef = useRef(null);
  const painelRef = useRef(null);
  const reduzirMovimento = useReducedMotion();

  useEffect(() => {
    if (aberto) painelRef.current?.querySelector('button, select, input')?.focus();
  }, [aberto]);

  const fechar = () => {
    setAberto(false);
    botaoRef.current?.focus();
  };

  return <div className="admin-speed-dial fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3" onKeyDown={evento => { if (evento.key === 'Escape' && aberto) { evento.stopPropagation(); fechar(); } }}>
    {aberto && <motion.div
      id={idPainel}
      ref={painelRef}
      role="region"
      aria-label={titulo}
      initial={reduzirMovimento ? false : { opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="w-[min(24rem,calc(100vw-2rem))] max-h-[min(70vh,36rem)] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#151F32] p-4 text-white shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-cyan-400">{titulo}</h2>
        <button type="button" onClick={fechar} aria-label="Fechar ferramentas admin" className="rounded-full p-2 text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400"><X size={18} /></button>
      </div>
      {children}
    </motion.div>}
    <button
      ref={botaoRef}
      type="button"
      aria-label={aberto ? 'Fechar ferramentas admin' : 'Abrir ferramentas admin'}
      aria-expanded={aberto}
      aria-controls={aberto ? idPainel : undefined}
      onClick={() => setAberto(atual => !atual)}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400 bg-[#0B1120] text-cyan-400 shadow-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-cyan-400"
    >{aberto ? <X size={24} /> : <Settings2 size={24} />}</button>
  </div>;
}
