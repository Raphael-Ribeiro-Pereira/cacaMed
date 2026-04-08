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
          
          <div style={{ width: 'max-content', height: 'max-content', padding: '80px', margin: 'auto' }}>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${colunasRender}, max-content)`, 
              gridTemplateRows: `repeat(${linhasRender}, max-content)`,    
              gap: '4px', 
              opacity: bloqueado ? 0.6 : 1, 
              transition: 'opacity 0.3s ease-in-out'
            }}>
              {gradePronta.length > 0 && gradePronta.slice(limites.minRow, limites.maxRow + 1).map((linha) => (
                linha.slice(limites.minCol, limites.maxCol + 1).map((celula) => {
                  
                  if (celula.vazia) {
                    return <div key={`vazia-${celula.linha}-${celula.coluna}`} className="w-10 h-10 sm:w-12 sm:h-12 aspect-square flex-shrink-0" />;
                  }

                  if (celula.letraCerta === ' ') {
                    return (
                      <div key={`celula-${celula.linha}-${celula.coluna}`} className="w-10 h-10 sm:w-12 sm:h-12 aspect-square flex-shrink-0 p-[2px]">
                        <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: '6px' }} />
                      </div>
                    );
                  }

                  const valorAtual = valores[`${celula.linha}-${celula.coluna}`] || '';
                  const valUpper = valorAtual.toUpperCase();
                  const letraCertaUpper = celula.letraCerta.toUpperCase();
                  
                  const estaPreenchida = valUpper !== '';
                  const estaCorreta = estaPreenchida && valUpper === letraCertaUpper;
                  const ehDestacada = celulasDestacadas.includes(`${celula.linha}-${celula.coluna}`);

                  // 🔥 O NOVO RADAR DO AMARELO
                  let lugarErrado = false;
                  if (estaPreenchida && !estaCorreta) {
                    
                    // Varre a linha inteira procurando se a letra pertence à palavra Horizontal
                    if (celula.pertenceHorizontal && celula.idHorizontal) {
                      const linhaCompleta = gradePronta[celula.linha];
                      for (let col = 0; col < linhaCompleta.length; col++) {
                        const celBusca = linhaCompleta[col];
                        if (celBusca && celBusca.idHorizontal === celula.idHorizontal && celBusca.letraCerta.toUpperCase() === valUpper) {
                          lugarErrado = true;
                          break;
                        }
                      }
                    }

                    // Se não achou na horizontal, varre a coluna inteira procurando na Vertical
                    if (!lugarErrado && celula.pertenceVertical && celula.idVertical) {
                      for (let row = 0; row < gradePronta.length; row++) {
                        const celBusca = gradePronta[row][celula.coluna];
                        if (celBusca && celBusca.idVertical === celula.idVertical && celBusca.letraCerta.toUpperCase() === valUpper) {
                          lugarErrado = true;
                          break;
                        }
                      }
                    }
                  }

                  // 1. Cor padrão (Azul/Cinza escuro)
                  let estiloCores = "bg-[#151F32] border-[#1e293b] text-white"; 
                  
                  // 2. Se estiver destacada pelo jogador (Azul Ciano brilhante)
                  if (ehDestacada) {
                    estiloCores = "bg-[#1e293b] border-cyan-500/40 text-white shadow-[0_0_8px_rgba(56,189,248,0.1)]"; 
                  }

                  // 3. Feedback visual (Verde e Amarelo!)
                  if (estaCorreta) {
                     estiloCores = "bg-emerald-900/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"; 
                  } else if (lugarErrado) {
                     estiloCores = "bg-amber-900/40 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
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
                        style={{ fontSize: '22px' }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 aspect-square flex-shrink-0 flex items-center justify-center text-center uppercase m-0 p-0 rounded-md outline-none transition-all duration-300 cursor-text border-2 font-bold
                          focus:bg-cyan-900/40 focus:border-cyan-400 focus:text-white focus:shadow-[0_0_12px_rgba(0,229,255,0.4)] focus:ring-1 focus:ring-cyan-400 
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