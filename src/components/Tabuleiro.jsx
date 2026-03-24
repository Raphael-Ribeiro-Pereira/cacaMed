import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Tabuleiro({ gradePronta, limites, valores, celulasDestacadas, bloqueado, handleInput, handleKeyDown, handleFocus, handleClick }) {
  const linhasRender = limites.maxRow - limites.minRow + 1;
  const colunasRender = limites.maxCol - limites.minCol + 1;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#2f3542', 
      borderRadius: '20px',
      overflow: 'hidden',          
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)', 
      cursor: 'grab'               
    }}>
      
      <TransformWrapper
        initialScale={1}
        minScale={0.3}       
        maxScale={3}         
        centerOnInit={true}  
        wheel={{ step: 0.1 }} 
        pinch={{ step: 5 }}   
        limitToBounds={false}
        // 🔥 TRATADO DE PAZ 1: A biblioteca de arrastar agora tem permissão total!
        panning={{ disabled: false, velocityDisabled: false, excluded: [] }} 
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          
          <div style={{
            width: 'max-content',
            height: 'max-content',
            padding: '120px',
            margin: 'auto' 
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${colunasRender}, 45px)`, 
              gridTemplateRows: `repeat(${linhasRender}, 45px)`,    
              gap: '4px', 
              opacity: bloqueado ? 0.6 : 1, 
              transition: 'opacity 0.3s ease-in-out'
            }}>
              {gradePronta.length > 0 && gradePronta.slice(limites.minRow, limites.maxRow + 1).map((linha) => (
                linha.slice(limites.minCol, limites.maxCol + 1).map((celula) => {
                  
                  if (celula.vazia) {
                    return <div key={`vazia-${celula.linha}-${celula.coluna}`} style={{ width: '100%', height: '100%' }}></div>;
                  }

                  if (celula.letraCerta === ' ') {
                    return (
                      <div key={`celula-${celula.linha}-${celula.coluna}`} style={{ width: '100%', height: '100%', padding: '2px' }}>
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#1e272e', borderRadius: '6px' }}></div>
                      </div>
                    );
                  }

                  const valorAtual = valores[`${celula.linha}-${celula.coluna}`] || '';
                  const estaCorreta = valorAtual.toUpperCase() === celula.letraCerta.toUpperCase();
                  const ehDestacada = celulasDestacadas.includes(`${celula.linha}-${celula.coluna}`);

                  return (
                    <div key={`celula-${celula.linha}-${celula.coluna}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
                      
                      {celula.numero && (
                        <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '11px', fontWeight: 'bold', color: '#64748b', zIndex: 5, pointerEvents: 'none' }}>
                          {celula.numero}
                        </span>
                      )}
                      
                      <input 
                        id={`input-${celula.linha}-${celula.coluna}`} 
                        type="text" 
                        className={`celula ${estaCorreta ? 'correta' : ''} ${ehDestacada ? 'destacada' : ''}`} 
                        maxLength="1" 
                        value={valorAtual}
                        onChange={(e) => handleInput(e, celula.linha, celula.coluna)}
                        onKeyDown={(e) => handleKeyDown(e, celula.linha, celula.coluna)}
                        onFocus={() => handleFocus(celula)}
                        
                        // 🔥 TRATADO DE PAZ 2: O setTimeout burla a trava e força o cursor a piscar
                        onClick={(e) => {
                          handleClick(celula);
                          setTimeout(() => e.target.focus(), 10);
                        }}
                        onTouchEnd={(e) => {
                          setTimeout(() => e.target.focus(), 10);
                        }}

                        disabled={bloqueado} 
                        autoComplete="off" 
                        spellCheck="false" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          textAlign: 'center', 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold',
                          margin: 0, 
                          padding: 0,
                          borderRadius: '8px',
                          border: 'none',
                          boxSizing: 'border-box',
                          cursor: 'text' 
                        }} 
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