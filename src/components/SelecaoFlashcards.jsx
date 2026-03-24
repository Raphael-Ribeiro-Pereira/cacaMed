import React, { useState, useEffect } from 'react';

const AREAS_OFICIAIS = [
  { id: 'Ossos', nome: 'Ossos', emoji: '🦴' },
  { id: 'Órgãos', nome: 'Órgãos', emoji: '🫀' },
  { id: 'Músculos', nome: 'Músculos', emoji: '💪' },
  { id: 'Radiologia', nome: 'Radiologia', emoji: '☢️' },
  { id: 'Tecidos', nome: 'Tecidos (Histologia)', emoji: '🔬' },
  { id: 'Neuro', nome: 'Neuro-modular', emoji: '🧠' }
];

export default function SelecaoFlashcards({ setTelaAtual, iniciarFlashcards }) {
  const [bancoFlashcards, setBancoFlashcards] = useState({});
  const [areaSelecionada, setAreaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  
  // 🔥 NOVO ESTADO: O nível de dificuldade
  const [dificuldade, setDificuldade] = useState('medio'); 

  useEffect(() => {
    const carregarFlashcards = async () => {
      try {
        const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgGXXMyR0TGNBXhfTpk22cdLtEOZvsCjSLXJRdBPPHPsEaXiby1NpJ9WoAOgKbZpjTKCbJdfG_LFvW/pub?output=csv";
        const resposta = await fetch(urlCSV + "&tempo=" + new Date().getTime());
        const texto = await resposta.text();
        const linhas = texto.replace(/\r/g, '').split('\n');
        
        const organizado = {};
        
        for (let i = 1; i < linhas.length; i++) {
          if (!linhas[i].trim()) continue;
          const separadorInteligente = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
          const colunas = linhas[i].split(separadorInteligente).map(item => item.replace(/^"|"$/g, '').trim());

          // 🔥 AGORA LEMOS 7 COLUNAS: Area, Subarea, Resposta, URL1, URL2, URL3, Descrição
          if (colunas.length >= 7) {
            const [area, subarea, resposta, url1, url2, url3, descricao] = colunas;
            
            const areaFormatada = AREAS_OFICIAIS.find(a => area.toUpperCase().includes(a.id.toUpperCase()))?.id || area;
            
            // Junta as URLs que não estiverem vazias
            const urls = [url1, url2, url3].filter(u => u && u.trim() !== '');

            if (areaFormatada && subarea && urls.length > 0) {
              if (!organizado[areaFormatada]) organizado[areaFormatada] = {};
              if (!organizado[areaFormatada][subarea]) organizado[areaFormatada][subarea] = [];
              organizado[areaFormatada][subarea].push({ resposta, urls, descricao });
            }
          }
        }
        setBancoFlashcards(organizado);
      } catch (e) { 
        console.error("Erro ao carregar flashcards", e); 
      } finally { 
        setCarregando(false); 
      }
    };
    carregarFlashcards();
  }, []);

  if (carregando) return <div className="tela-container"><h2 style={{color: '#1e293b'}}>Consultando Atlas Anatômico... 📖</h2></div>;

  const areaAtiva = AREAS_OFICIAIS.find(a => a.id === areaSelecionada);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', textAlign: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <button onClick={() => setTelaAtual('menu')} style={{ marginBottom: '20px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>⬅ Voltar ao Menu</button>
      
      <h1 style={{ color: '#1e293b', marginBottom: '30px', fontSize: '2.2rem' }}>Selecione a Área de Estudo</h1>

      {!areaSelecionada ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {AREAS_OFICIAIS.map(area => (
            <div key={area.id} onClick={() => setAreaSelecionada(area.id)} style={{ backgroundColor: 'white', padding: '30px 20px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', cursor: 'pointer', border: '2px solid #e2e8f0', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#1F6FEB'; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{area.emoji}</div>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>{area.nome}</h3>
              {bancoFlashcards[area.id] && (
                <div style={{ marginTop: '10px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>Baralhos Disponíveis</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{areaAtiva?.emoji}</div>
          <h2 style={{ color: '#1e293b', margin: '0 0 20px 0', fontSize: '1.8rem' }}>{areaAtiva?.nome}</h2>
          
          {/* 🔥 SELETOR DE DIFICULDADE */}
          {bancoFlashcards[areaSelecionada] && (
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '16px', display: 'inline-block' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Defina a Dificuldade:</h4>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setDificuldade('facil')} style={{ padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: dificuldade === 'facil' ? '2px solid #10b981' : '1px solid #cbd5e1', backgroundColor: dificuldade === 'facil' ? '#dcfce7' : 'white', color: dificuldade === 'facil' ? '#166534' : '#64748b' }}>🌱 Múltipla Escolha</button>
                <button onClick={() => setDificuldade('medio')} style={{ padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: dificuldade === 'medio' ? '2px solid #3b82f6' : '1px solid #cbd5e1', backgroundColor: dificuldade === 'medio' ? '#dbeafe' : 'white', color: dificuldade === 'medio' ? '#1e40af' : '#64748b' }}>🩺 Digitação (Com Dica)</button>
                <button onClick={() => setDificuldade('dificil')} style={{ padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: dificuldade === 'dificil' ? '2px solid #ef4444' : '1px solid #cbd5e1', backgroundColor: dificuldade === 'dificil' ? '#fee2e2' : 'white', color: dificuldade === 'dificil' ? '#991b1b' : '#64748b' }}>🔥 Insano</button>
              </div>
            </div>
          )}

          {bancoFlashcards[areaSelecionada] ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
              {Object.keys(bancoFlashcards[areaSelecionada]).map(sub => (
                <button key={sub} onClick={() => iniciarFlashcards(bancoFlashcards[areaSelecionada][sub], areaSelecionada, dificuldade)} style={{ backgroundColor: '#1F6FEB', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(31,111,235,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {sub} ({bancoFlashcards[areaSelecionada][sub].length} cartas)
                </button>
              ))}
            </div>
          ) : (
             <div style={{ color: '#64748b', fontSize: '1.1rem', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
               Ainda não há cartas cadastradas para esta área. Vá na planilha e adicione!
             </div>
          )}

          <button onClick={() => setAreaSelecionada(null)} style={{ marginTop: '30px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Escolher outra área</button>
        </div>
      )}
    </div>
  );
}