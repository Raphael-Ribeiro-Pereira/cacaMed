import React, { useState } from 'react';

const ELENCO_HOUSE = [
  { id: 'house', nome: 'Dr. House', especialidade: 'Infectologia / Nefrologia', emoji: '🦯', cor: '#ef4444', desc: 'Especialista Master. Custo alto de XP, mas resolve quase tudo.' },
  { id: 'cameron', nome: 'Dra. Cameron', especialidade: 'Imunologia', emoji: '🛡️', cor: '#3b82f6', desc: 'Protege contra doenças autoimunes e reações alérgicas graves.' },
  { id: 'foreman', nome: 'Dr. Foreman', especialidade: 'Neurologia', emoji: '🧠', cor: '#8b5cf6', desc: 'Intervém em convulsões e danos cerebrais.' },
  { id: 'chase', nome: 'Dr. Chase', especialidade: 'Cirurgia / Intensivismo', emoji: '🔪', cor: '#10b981', desc: 'Te salva quando o paciente precisa ser entubado ou operado às pressas.' },
  { id: 'treze', nome: 'Treze', especialidade: 'Medicina Interna / Genética', emoji: '🧬', cor: '#ec4899', desc: 'Essencial para desvendar doenças hereditárias raras.' },
  { id: 'wilson', nome: 'Dr. Wilson', especialidade: 'Oncologia', emoji: '🎗️', cor: '#f59e0b', desc: 'Especialista em tumores. Evita tratamentos errados para câncer.' },
  { id: 'taub', nome: 'Dr. Taub', especialidade: 'Cirurgia Plástica / Dermato', emoji: '👁️', cor: '#06b6d4', desc: 'Identifica sintomas escondidos na pele ou reações cutâneas letais.' },
  { id: 'kutner', nome: 'Dr. Kutner', especialidade: 'Medicina Esportiva / Trauma', emoji: '⚡', cor: '#f97316', desc: 'Age rápido em envenenamentos e traumas físicos ocultos.' },
  { id: 'cuddy', nome: 'Dra. Cuddy', especialidade: 'Administração / Ética', emoji: '📋', cor: '#64748b', desc: 'Protege sua XP bloqueando exames caríssimos e desnecessários.' },
];

export default function SelecaoDDX({ setTelaAtual, iniciarDDX }) {
  const [tempo, setTempo] = useState('ranqueado');
  const [dificuldade, setDificuldade] = useState('residente');
  const [equipe, setEquipe] = useState([]);

  const handleToggleMembro = (id) => {
    if (equipe.includes(id)) {
      setEquipe(equipe.filter(membroId => membroId !== id));
    } else {
      if (equipe.length < 3) {
        setEquipe([...equipe, id]);
      } else {
        alert("A sala de diagnóstico está cheia! Remova alguém antes de adicionar outro especialista.");
      }
    }
  };

  const handleIniciar = () => {
    // Retiramos o alert e ativamos a função real que muda a tela!
    iniciarDDX({ equipe, tempo, dificuldade }); 
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* CABEÇALHO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <button 
            onClick={() => setTelaAtual('menu')}
            style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
          >
            ⬅ Voltar ao Menu
          </button>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2.5rem' }}>🩺</span> Departamento de Diagnósticos
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>Monte sua equipe para o caso</p>
          </div>
        </div>

        {/* CONFIGURAÇÕES (Tempo e Dificuldade) */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>⏱️ Modo de Tempo</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setTempo('ranqueado')}
                style={{ flex: 1, padding: '15px', borderRadius: '12px', border: tempo === 'ranqueado' ? '2px solid #ef4444' : '1px solid #cbd5e1', backgroundColor: tempo === 'ranqueado' ? '#fef2f2' : 'white', color: tempo === 'ranqueado' ? '#b91c1c' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Ranqueado (Com Timer)
              </button>
              <button 
                onClick={() => setTempo('casual')}
                style={{ flex: 1, padding: '15px', borderRadius: '12px', border: tempo === 'casual' ? '2px solid #3b82f6' : '1px solid #cbd5e1', backgroundColor: tempo === 'casual' ? '#eff6ff' : 'white', color: tempo === 'casual' ? '#1d4ed8' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Casual (Sem Pressão)
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>🎓 Dificuldade Clínica</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setDificuldade('residente')}
                style={{ flex: 1, padding: '15px', borderRadius: '12px', border: dificuldade === 'residente' ? '2px solid #10b981' : '1px solid #cbd5e1', backgroundColor: dificuldade === 'residente' ? '#f0fdf4' : 'white', color: dificuldade === 'residente' ? '#047857' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Residente (Múltipla Escolha)
              </button>
              <button 
                onClick={() => setDificuldade('formado')}
                style={{ flex: 1, padding: '15px', borderRadius: '12px', border: dificuldade === 'formado' ? '2px solid #8b5cf6' : '1px solid #cbd5e1', backgroundColor: dificuldade === 'formado' ? '#f5f3ff' : 'white', color: dificuldade === 'formado' ? '#6d28d9' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Médico Formado (Digitar)
              </button>
            </div>
          </div>

        </div>

        {/* SELEÇÃO DE EQUIPE */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '1.4rem' }}>🤝 Equipe Médica</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Eles intervirão caso você cometa um erro grave na área deles.</p>
            </div>
            <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '10px 20px', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span style={{ color: equipe.length === 3 ? '#fbbf24' : '#38bdf8' }}>{equipe.length}</span> / 3 Selecionados
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {ELENCO_HOUSE.map((medico) => {
              const selecionado = equipe.includes(medico.id);
              const bloqueado = !selecionado && equipe.length >= 3;

              return (
                <div 
                  key={medico.id}
                  onClick={() => handleToggleMembro(medico.id)}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '15px', 
                    border: selecionado ? `3px solid ${medico.cor}` : '1px solid #cbd5e1',
                    backgroundColor: selecionado ? `${medico.cor}10` : 'white',
                    cursor: bloqueado ? 'not-allowed' : 'pointer',
                    opacity: bloqueado ? 0.5 : 1,
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {selecionado && <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: medico.cor, color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>✓</div>}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '2.5rem' }}>{medico.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>{medico.nome}</div>
                      <div style={{ fontSize: '0.8rem', color: medico.cor, fontWeight: 'bold', backgroundColor: `${medico.cor}20`, padding: '3px 8px', borderRadius: '8px', display: 'inline-block', marginTop: '4px' }}>
                        {medico.especialidade}
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{medico.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÃO INICIAR */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleIniciar}
            style={{ 
              backgroundColor: '#0f172a', 
              color: 'white', 
              border: 'none', 
              padding: '20px 50px', 
              borderRadius: '20px', 
              fontSize: '1.4rem', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            📋 Iniciar Plantão 
            <span style={{ backgroundColor: '#fbbf24', color: '#854d0e', padding: '5px 12px', borderRadius: '10px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Custo: 1 🎟️
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}