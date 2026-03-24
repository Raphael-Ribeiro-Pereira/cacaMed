export default function PainelVitoria({ relatorioXP, avancarParaProximoNivel }) {
  if (!relatorioXP) return null;

  return (
    <div id="mensagem-vitoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f1f2f6', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '2px solid #2ed573' }}>
        <h2>🎉 Fase Concluída! 🎉</h2>
        
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', width: '100%', maxWidth: '400px', textAlign: 'center', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '5px 0', color: '#7f8fa6', fontWeight: 'bold' }}>XP do Tabuleiro: <span style={{ color: '#2f3542' }}>{relatorioXP.base}</span></p>
          <p style={{ margin: '5px 0', color: '#7f8fa6', fontWeight: 'bold' }}>Multiplicador Dificuldade: <span style={{ color: '#eccc68' }}>x{relatorioXP.multNivel}</span></p>
          <p style={{ margin: '5px 0', color: '#7f8fa6', fontWeight: 'bold' }}>Bônus de Velocidade: <span style={{ color: '#ff4757' }}>x{relatorioXP.multTempo}</span></p>
          <hr style={{ border: '0', borderTop: '1px solid #dfe4ea', margin: '10px 0' }} />
          <h3 style={{ margin: 0, color: '#2ed573', fontSize: '2rem' }}>+{relatorioXP.ganho} XP!</h3>
        </div>

        <button className="botao-menu" style={{ backgroundColor: '#ff9f43', color: 'white', border: 'none' }} onClick={avancarParaProximoNivel}>
          ▶ Jogar Próximo Nível
        </button>
    </div>
  );
}