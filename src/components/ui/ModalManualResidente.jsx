import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, BookOpen, LayoutGrid, HeartPulse, AlertTriangle, Ticket } from 'lucide-react';

export default function ModalManualResidente({ showHelp, setShowHelp }) {
  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-[#151F32] border border-cyan-500/20 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header do Modal */}
            <div className="p-6 border-b border-white/[0.05] bg-[#0F172A] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Manual do Residente</h2>
                  <p className="text-xs text-cyan-500 uppercase tracking-widest font-bold mt-0.5">Como sobreviver no Caça-Med</p>
                </div>
              </div>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white bg-[#1e293b] hover:bg-rose-500/20 hover:border-rose-500/50 border border-white/[0.05] p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Modal (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar">
              
              {/* Secção: Sistema de Progressão */}
              <section>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-cyan-400" /> O Sistema de XP e Patentes
                </h3>
                <div className="bg-[#0B1120] p-5 rounded-2xl border border-white/[0.02]">
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    A sua evolução no hospital mede-se em <strong className="text-cyan-400">Pontos de Experiência (XP)</strong>. 
                    Ganhe pontos acertando termos médicos ou salvando vidas. O seu XP define o seu Nível e, consequentemente, a sua <strong className="text-white">Patente Médica</strong>.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-2 mt-4 font-medium">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Estudante Básico (Níveis Iniciais)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Interno & Residente (Níveis Médios)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Chefe de Plantão (Elite)</li>
                  </ul>
                </div>
              </section>

              {/* Secção: Cruzadinhas vs DDX */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-[#0B1120] p-5 rounded-2xl border border-white/[0.02]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-blue-400" /> Estudos Teóricos
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    As <strong className="text-blue-400">Cruzadinhas Médicas</strong> são o seu campo de treino. Não há risco de vida. 
                    Jogue para memorizar anatomia e farmacologia. Cada partida gera XP base, bónus por tempo, e preenche o seu <strong className="text-orange-400">Cartão Fidelidade</strong> para ganhar Tickets.
                  </p>
                </section>

                <section className="bg-[#0B1120] p-5 rounded-2xl border border-white/[0.02]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-400" /> UTI (Simulador DDX)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Onde as coisas ficam sérias. Analise o Prontuário, peça exames e dê o diagnóstico correto antes que o paciente venha a óbito. 
                    <strong className="text-rose-400"> Custa 1 Ticket por caso.</strong> Erros médicos podem resultar em processos judiciais!
                  </p>
                </section>
              </div>

              {/* Secção: Modo Hardcore & Tickets */}
              <section className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-rose-950/20 p-5 rounded-2xl border border-rose-500/20">
                  <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Modo Hardcore
                  </h3>
                  <p className="text-xs text-rose-200/70 leading-relaxed">
                    Ative a alavanca no menu principal para enfrentar casos complexos e raros no DDX, com um <strong className="text-rose-400">cronómetro implacável</strong>. Exclusivo para quem já domina a UTI.
                  </p>
                </div>
                <div className="flex-1 bg-orange-950/20 p-5 rounded-2xl border border-orange-500/20">
                  <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Ticket className="w-4 h-4" /> Gestão de Tickets
                  </h3>
                  <p className="text-xs text-orange-200/70 leading-relaxed">
                    Os Tickets de UTI são o seu passe para o Simulador DDX. Pode ganhá-los completando <strong className="text-orange-400">Missões Diárias</strong> ou jogando várias Cruzadinhas.
                  </p>
                </div>
              </section>

            </div>
            
            {/* Footer do Modal */}
            <div className="p-4 border-t border-white/[0.05] bg-[#0F172A] text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">O conhecimento é a sua melhor ferramenta.</p>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
