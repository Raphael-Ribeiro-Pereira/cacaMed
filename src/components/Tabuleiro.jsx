import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Tabuleiro({ gradePronta, limites, valores, celulasDestacadas, bloqueado, handleInput, handleKeyDown, handleFocus, handleClick }) {
  const linhasRender = limites.maxRow - limites.minRow + 1;
  const colunasRender = limites.maxCol - limites.minCol + 1;

  return (
    <div className="w-full h-full cursor-grab">
      <TransformWrapper
        initialScale={1}
        minScale={0.3}       
        maxScale={3}         
        centerOnInit={true}  
        wheel={{ step: 0.1 }} 
        pinch={{ step: 5 }}   
        limitToBounds={false}
        panning={{ disabled: false, velocityDisabled: false, excluded: [] }} 
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          
          {/* Usamos padding fixo em px para não sofrer mutação com o zoom de 150% */}
          <div style={{ width: 'max-content', height: 'max-content', padding: '80px', margin: 'auto' }}>
            
            <div style={{
              display: 'grid',
              /* A CURA: Voltamos a usar 45px fixos. Imune ao index.css! */
              gridTemplateColumns: `repeat(${colunasRender}, 45px)`, 
              gridTemplateRows: `repeat(${linhasRender}, 45px)`,    
              gap: '4px', 
              opacity: bloqueado ? 0.6 : 1, 
              transition: 'opacity 0.3s ease-in-out'
            }}>
              {gradePronta.length > 0 && gradePronta.slice(limites.minRow, limites.maxRow + 1).map((linha) => (
                linha.slice(limites.minCol, limites.maxCol + 1).map((celula) => {
                  
                  if (celula.vazia) {
                    return <div key={`vazia-${celula.linha}-${celula.coluna}`} style={{ width: '100%', height: '100%' }} />;
                  }

                  if (celula.letraCerta === ' ') {
                    return (
                      <div key={`celula-${celula.linha}-${celula.coluna}`} style={{ width: '100%', height: '100%', padding: '2px' }}>
                        <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: '6px' }} />
                      </div>
                    );
                  }

                  const valorAtual = valores[`${celula.linha}-${celula.coluna}`] || '';
                  const estaCorreta = valorAtual.toUpperCase() === celula.letraCerta.toUpperCase();
                  const ehDestacada = celulasDestacadas.includes(`${celula.linha}-${celula.coluna}`);

                  let estiloCores = "bg-[#151F32] border-[#1e293b] text-white"; 
                  if (ehDestacada) {
                    estiloCores = "bg-[#1e293b] border-cyan-500/40 text-white shadow-[0_0_8px_rgba(56,189,248,0.1)]"; 
                  }
                  if (estaCorreta && bloqueado) {
                     estiloCores = "bg-emerald-900/40 border-emerald-500/50 text-emerald-400"; 
                  }

                  return (
                    <div key={`celula-${celula.linha}-${celula.coluna}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
                      
                      {celula.numero && (
                        <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px', color: '#64748b', fontWeight: 'bold', zIndex: 10, pointerEvents: 'none' }}>
                          {celula.numero}
                        </span>
                      )}
                      
                      <input 
                        id={`input-${celula.linha}-${celula.coluna}`} 
                        type="text" 
                        maxLength="1" 
                        value={valorAtual}
                        onChange={(e) => handleInput(e, celula.linha, celula.coluna)}
                        onKeyDown={(e) => handleKeyDown(e, celula.linha, celula.coluna)}
                        onFocus={() => handleFocus(celula)}
                        onClick={(e) => {
                          handleClick(celula);
                          setTimeout(() => e.target.focus(), 10);
                        }}
                        onTouchEnd={(e) => setTimeout(() => e.target.focus(), 10)}
                        disabled={bloqueado} 
                        autoComplete="off" 
                        spellCheck="false" 
                        /* Fonte fixada em 22px para evitar distorção do index.css */
                        style={{ fontSize: '22px' }}
                        className={`w-full h-full text-center uppercase m-0 p-0 rounded-md outline-none transition-all cursor-text border-2 font-bold
                          focus:bg-cyan-900/40 focus:border-cyan-400 focus:text-white focus:shadow-[0_0_12px_rgba(0,229,255,0.3)] focus:ring-1 focus:ring-cyan-400 
                          ${estiloCores}`} 
                      />
                    </div>
                  );
                })
              ))}
            </div>
          </div>

        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}