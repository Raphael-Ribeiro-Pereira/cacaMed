import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function MonitorVital({ bpm }) {
  const controls = useAnimation();

  // Define a cor baseada na gravidade do BPM
  let corSinal = "#22c55e"; // Verde (Normal: 60 - 100)
  let statusTexto = "ESTÁVEL";

  if (bpm > 100 || bpm < 60) {
    corSinal = "#eab308"; // Amarelo (Alerta)
    statusTexto = "ALERTA";
  }
  if (bpm > 140 || bpm < 40) {
    corSinal = "#ef4444"; // Vermelho (Crítico)
    statusTexto = "CRÍTICO";
  }
  if (bpm === 0) {
    corSinal = "#ef4444"; 
    statusTexto = "FLATLINE";
  }

  useEffect(() => {
    let isMounted = true;

    const animateEcg = async () => {
      while (isMounted) {
        if (bpm <= 0) {
          // Paciente em parada (Flatline)
          await controls.start({
            d: "M 0 12 L 40 12",
            transition: { duration: 1, ease: "linear" }
          });
          await new Promise(r => setTimeout(r, 100));
          continue;
        }

        // A Matemática Mágica: Converte BPM para Segundos
        const tempoCiclo = 60 / bpm; 
        
        // O "pico" do coração dura sempre um tempo rápido, o resto é descanso
        const tempoBatimento = Math.min(0.2, tempoCiclo * 0.4); 
        const tempoDescanso = tempoCiclo - tempoBatimento;

        // Gera picos orgânicos com tamanhos levemente aleatórios
        const topY = Math.random() * -10 + 2; 
        const botY = Math.random() * 5 + 18;  

        // Desenho do vetor do ECG (Complexo QRS)
        const beatPath = `M 0 12 L 8 12 L 10 10 L 12 12 L 15 ${topY} L 18 ${botY} L 21 12 L 25 10 L 28 12 L 40 12`;
        const flatPath = `M 0 12 L 40 12`;

        if (!isMounted) break;

        // Toca a animação do pulso
        await controls.start({
          d: beatPath,
          transition: { duration: tempoBatimento, ease: "easeOut" }
        });

        if (!isMounted) break;

        // Toca a animação do descanso (linha reta entre as batidas)
        await controls.start({
          d: flatPath,
          transition: { duration: tempoDescanso, ease: "linear" }
        });
      }
    };

    animateEcg();

    return () => { isMounted = false; };
  }, [bpm, controls]);

  return (
    <div className="bg-[#0B1120] border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-center shadow-inner relative overflow-hidden h-32 w-full max-w-sm">
      {/* Efeito de Scanline (Linhas de Monitor CRT) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none"></div>
      
      {/* Luz de emergência no fundo */}
      <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 transition-colors duration-1000" style={{ backgroundColor: corSinal }}></div>

      <div className="flex justify-between w-full mb-1 z-10">
        <span className="text-slate-500 font-bold text-xs tracking-widest uppercase">FC (BPM)</span>
        <span className="text-[10px] font-black uppercase tracking-widest transition-colors duration-1000" style={{ color: corSinal }}>
          {statusTexto}
        </span>
      </div>

      <div className="flex items-end gap-6 w-full z-10 flex-1">
        {/* Número do BPM que "pula" quando o valor muda */}
        <motion.span
          key={bpm} 
          initial={{ scale: 1.2, color: '#fff' }}
          animate={{ scale: 1, color: corSinal }}
          className="text-5xl md:text-6xl font-black font-mono leading-none tracking-tighter w-24"
        >
          {bpm}
        </motion.span>

        {/* Linha do ECG */}
        <div className="flex-1 h-16 relative flex items-center">
          <svg viewBox="0 0 40 24" className="w-full h-full transition-colors duration-1000" style={{ color: corSinal, filter: `drop-shadow(0 0 8px ${corSinal}80)` }} preserveAspectRatio="none">
            <motion.path
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              animate={controls}
              initial={{ d: "M 0 12 L 40 12" }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}