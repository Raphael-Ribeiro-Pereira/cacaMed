import { useState } from 'react';

export default function SelecaoTopicos({ setTelaAtual, iniciarJogo, dadosUsuario }) {
  const [materiaAtiva, setMateriaAtiva] = useState(null);

  const estruturaModos = {
    'Anatomia': { 
      icon: '🦴', 
      fases: [
        'Sistema esquelético', 'Sistema muscular', 'Sistema nervoso',
        'Sistema circulatório', 'Sistema linfático', 'Sistema respiratório',
        'Sistema digestório', 'Sistema urinário', 'Sistema reprodutor',
        'Sistema endócrino', 'Sistema tegumentar'
      ] 
    },
    'Farmacologia': { icon: '💊', fases: ['Medicamentos', 'Classes de medicamentos', 'Mecanismos de ação', 'Receptores', 'Enzimas'] },
    'Microbiologia': { icon: '🧫', fases: ['Vírus', 'Bactérias', 'Fungos', 'Parasitas'] },
    'Histologia': { icon: '🔬', fases: ['Células', 'Tecidos', 'Epitelios', 'Matriz', 'Organelas'] },
    'Imunologia': { icon: '🛡️', fases: ['Imunologia'] },
    'Patologia': { icon: '🦠', fases: ['Doencas', 'Exames'] }
  };

  const calcularProgresso = (materiaNome) => {
    if (!dadosUsuario || !dadosUsuario.xpTopicos) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };
    const prefixo = materiaNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() + "-";
    let totalXP = 0;
    Object.keys(dadosUsuario.xpTopicos).forEach(chave => {
      if (chave.startsWith(prefixo)) totalXP += dadosUsuario.xpTopicos[chave];
    });
    
    if (totalXP === 0) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };

    const nivel = Math.floor(Math.sqrt(totalXP / 1000)) + 1;
    const xpProximoNivel = Math.pow(nivel, 2) * 1000;
    const xpNivelAtual = Math.pow(nivel - 1, 2) * 1000;
    const xpNesteNivel = totalXP - xpNivelAtual; 
    const xpParaUpar = xpProximoNivel - xpNivelAtual; 
    const porcentagem = xpNesteNivel === 0 ? 0 : (xpNesteNivel / xpParaUpar) * 100;
    return { nivel, porcentagem, xpNesteNivel, xpParaUpar, isZero: false };
  };

  const calcularProgressoSubtopico = (materiaNome, subMateriaNome) => {
    if (!dadosUsuario || !dadosUsuario.xpTopicos) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };
    const materiaBlindada = materiaNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const subMateriaBlindada = subMateriaNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const chaveXP = `${materiaBlindada}-${subMateriaBlindada}`;
    const totalXP = dadosUsuario.xpTopicos[chaveXP] || 0;
    
    if (totalXP === 0) return { nivel: 0, porcentagem: 0, xpNesteNivel: 0, xpParaUpar: 1000, isZero: true };

    const nivel = Math.floor(Math.sqrt(totalXP / 1000)) + 1;
    const xpProximoNivel = Math.pow(nivel, 2) * 1000;
    const xpNivelAtual = Math.pow(nivel - 1, 2) * 1000;
    const xpNesteNivel = totalXP - xpNivelAtual; 
    const xpParaUpar = xpProximoNivel - xpNivelAtual; 
    const porcentagem = xpNesteNivel === 0 ? 0 : (xpNesteNivel / xpParaUpar) * 100;
    return { nivel, porcentagem, xpNesteNivel, xpParaUpar, isZero: false };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box' }}>
      
      <h1 style={{ color: '#1e293b', fontSize: '2.2rem', textAlign: 'center', margin: '0 0 5px 0' }}>
        {materiaAtiva ? `Especialidade: ${materiaAtiva}` : 'O que vamos estudar hoje?'}
      </h1>
      {!materiaAtiva && <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '35px', fontSize: '1.1rem' }}>Selecione uma disciplina</p>}

      <div style={{ width: '100%', maxWidth: '700px' }}>
        
        {!materiaAtiva ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' }}>
            {Object.keys(estruturaModos).map((materia) => {
              const status = calcularProgresso(materia);
              const { icon } = estruturaModos[materia];
              
              return (
                <div 
                  key={materia} 
                  onClick={() => setMateriaAtiva(materia)}
                  style={{ position: 'relative', backgroundColor: '#ffffff', borderRadius: '20px', padding: '30px 20px 20px 20px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '2px solid transparent', transition: 'transform 0.2s, border-color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: status.isZero ? '#f1f5f9' : '#e0e7ff', color: status.isZero ? '#64748b' : '#4338ca', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    Nível {status.nivel}
                  </div>
                  <div style={{ fontSize: '3.5rem', marginBottom: '10px', filter: status.isZero ? 'grayscale(100%) opacity(60%)' : 'none' }}>{icon}</div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.3rem', marginBottom: '15px' }}>{materia}</h3>
                  <div style={{ width: '100%', marginTop: 'auto' }}>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                      <div style={{ width: `${status.porcentagem}%`, height: '100%', backgroundColor: '#1F6FEB', transition: 'width 0.5s ease-out' }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>
                      {status.isZero ? 'Jogue para desbloquear! 📜' : `${status.xpNesteNivel} / ${status.xpParaUpar} XP`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
              {estruturaModos[materiaAtiva].fases.map((subMateria) => {
                const statusSub = calcularProgressoSubtopico(materiaAtiva, subMateria);

                return (
                  <div 
                    key={subMateria} 
                    onClick={() => iniciarJogo(materiaAtiva, subMateria)}
                    style={{ position: 'relative', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1F6FEB'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(31,111,235,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '1.25rem' }}>{subMateria}</span>
                      <span style={{ backgroundColor: statusSub.isZero ? '#f1f5f9' : '#f1f5f9', color: '#475569', padding: '5px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        Nível {statusSub.nivel}
                      </span>
                    </div>

                    <div style={{ width: '100%' }}>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                        <div style={{ width: `${statusSub.porcentagem}%`, height: '100%', backgroundColor: '#1F6FEB', transition: 'width 0.5s ease-out' }}></div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textAlign: 'right' }}>
                        {statusSub.isZero ? 'Bloqueado. Inicie um plantão! 🔒' : `${statusSub.xpNesteNivel} / ${statusSub.xpParaUpar} XP`}
                      </div>
                    </div>

                  </div>
                );
              })}
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => materiaAtiva ? setMateriaAtiva(null) : setTelaAtual('menu')} 
            style={{ backgroundColor: 'white', color: '#1e293b', border: '2px solid #1e293b', padding: '12px 30px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#1e293b'; }}
          >
            ⬅ {materiaAtiva ? 'Voltar às Disciplinas' : 'Voltar ao Menu'}
          </button>
        </div>

      </div>
    </div>
  );
}