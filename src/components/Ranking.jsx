import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// 🌻 SISTEMA DE PARTÍCULAS DO EASTER EGG
// ==========================================
const ParticulaRomantica = ({ id, texto, posicaoInicial, onFinalizar }) => {
  const duracao = useMemo(() => (Math.random() * 2 + 3).toFixed(2), []); 
  const tamanho = useMemo(() => (Math.random() * 0.5 + 1).toFixed(2), []); 
  const derivaH = useMemo(() => (Math.random() * 100 - 50).toFixed(0), []); 

  useEffect(() => {
    const timer = setTimeout(() => onFinalizar(id), duracao * 1000);
    return () => clearTimeout(timer);
  }, [id, duracao, onFinalizar]);

  return (
    <div
      style={{
        position: 'fixed', bottom: '80px', left: `${posicaoInicial}px`, 
        fontSize: `${tamanho}rem`, fontWeight: 'bold', color: '#ff4757', 
        opacity: 0.9, pointerEvents: 'none', zIndex: 10000,
        animation: `flutuarRomantico ${duracao}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
        '--deriva-horizontal': `${derivaH}px` 
      }}
    >
      {texto}
    </div>
  );
};

export default function Ranking({ dadosUsuario, setTelaAtual }) {
  const [abaAtual, setAbaAtual] = useState('global');
  // 🔥 Novo filtro de tempo adicionado aos estados
  const [criterioOrdenacao, setCriterioOrdenacao] = useState('nivel'); // 'nivel', 'letras', ou 'tempo'
  
  const [particulas, setParticulas] = useState([]);
  const [dadosDoBanco, setDadosDoBanco] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const dispararParticulas = () => {
    const novosItens = [];
    const opcoesTexto = ['R', 'C', '❤️']; 
    for (let i = 0; i < 10; i++) {
      novosItens.push({
        id: Date.now() + i, 
        texto: opcoesTexto[Math.floor(Math.random() * opcoesTexto.length)], 
        posicao: Math.random() * (window.innerWidth - 60) + 30, 
      });
    }
    setParticulas(prev => [...prev, ...novosItens]);
  };

  const removerParticula = (id) => setParticulas(prev => prev.filter(p => p.id !== id));

  // Função para formatar o tempo no painel
  const formatarTempo = (segundos) => {
    if (segundos === Infinity || isNaN(segundos)) return "--:--";
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  function getPatenteInfo(nivel) {
    if (nivel <= 5) return { titulo: 'Estudante (Básico)', cor: '#64748b' };
    if (nivel <= 15) return { titulo: 'Estudante (Clínico)', cor: '#0ea5e9' };
    if (nivel <= 30) return { titulo: 'Interno', cor: '#8b5cf6' };
    if (nivel <= 50) return { titulo: 'Residente (R1)', cor: '#f59e0b' };
    if (nivel <= 80) return { titulo: 'Médico Especialista', cor: '#ef4444' };
    return { titulo: 'Chefe de Plantão', cor: '#10b981' };
  }

  const somaNiveisPessoal = useMemo(() => {
    let soma = 0;
    const xpTopicos = dadosUsuario?.xpTopicos || {};
    Object.keys(xpTopicos).forEach(chave => {
      const xp = xpTopicos[chave];
      if (xp > 0) soma += Math.floor(Math.sqrt(xp / 1000)) + 1;
    });
    return soma;
  }, [dadosUsuario]);

  const patentePessoal = getPatenteInfo(somaNiveisPessoal);

  // ==========================================
  // 🌍 BUSCANDO DADOS E MÉTRICAS
  // ==========================================
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const listaMedicos = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          let somaNiv = 0;
          const xpTopicos = data.xpTopicos || {};
          Object.keys(xpTopicos).forEach(chave => {
            const xp = xpTopicos[chave];
            if (xp > 0) somaNiv += Math.floor(Math.sqrt(xp / 1000)) + 1;
          });

          // Puxando métricas para Precisão e Velocidade
          let totalLetras = 0;
          let totalTempo = 0;
          let totalPartidas = 0;
          
          if (data.estatisticas) {
            Object.values(data.estatisticas).forEach(stat => {
              if (stat.letras) totalLetras += stat.letras;
              if (stat.tempo) totalTempo += stat.tempo;
              if (stat.partidas) totalPartidas += stat.partidas;
            });
          }

          // Se o cara nunca jogou, colocamos "Infinity" (infinito) para ele ir pro final da fila no filtro de tempo
          const tempoMedio = totalPartidas > 0 ? Math.floor(totalTempo / totalPartidas) : Infinity;
          const pat = getPatenteInfo(somaNiv);

          listaMedicos.push({
            uid: docSnap.id,
            nome: data.username || data.nome || 'Doutor(a)',
            nivel: somaNiv,
            letras: totalLetras,
            tempoMedio: tempoMedio,
            patente: pat.titulo,
            cor: pat.cor
          });
        });
        
        setDadosDoBanco(listaMedicos);
      } catch (error) {
        console.error("Erro ao puxar dados do Firebase:", error);
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, []);

  // ==========================================
  // 🎛️ MOTOR DE FILTROS E ORDENAÇÃO
  // ==========================================
  const rankingProcessado = useMemo(() => {
    let lista = [...dadosDoBanco];

    // 1. Aplica a Ordenação (Tempo é menor pro maior, Nível e Letras é maior pro menor)
    if (criterioOrdenacao === 'nivel') {
      lista.sort((a, b) => b.nivel - a.nivel);
    } else if (criterioOrdenacao === 'letras') {
      lista.sort((a, b) => b.letras - a.letras);
    } else if (criterioOrdenacao === 'tempo') {
      lista.sort((a, b) => a.tempoMedio - b.tempoMedio);
    }

    // 2. Aplica as posições globais reais APÓS ordenar
    lista = lista.map((m, index) => ({ ...m, posicaoGlobal: index + 1 }));

    // 3. Aplica o filtro de Aba
    if (abaAtual === 'patente') {
      lista = lista.filter(m => m.patente === patentePessoal.titulo);
    } else if (abaAtual === 'hall') {
      lista = lista.slice(0, 3);
    }

    // 4. Aplica posições relativas à tela atual
    return lista.map((m, index) => ({ ...m, posicaoExibida: index + 1 }));
  }, [dadosDoBanco, abaAtual, criterioOrdenacao, patentePessoal]);

  // ==========================================
  // 🎯 MATEMÁTICA DE RIVALIDADE (RADAR)
  // ==========================================
  const meuIndex = rankingProcessado.findIndex(m => m.uid === dadosUsuario?.uid);
  const eu = meuIndex >= 0 ? rankingProcessado[meuIndex] : null;
  
  let textoRadar = "Continue jogando para subir posições!";
  let tituloRadar = eu ? `#${eu.posicaoGlobal} do Mundo` : "Não rankeado";

  if (!eu && abaAtual === 'patente') {
    textoRadar = "Você não tem a patente necessária para esta lista.";
  } else if (!eu && abaAtual === 'hall') {
    textoRadar = "Chegue ao Top 3 para entrar no Hall da Fama!";
  } else if (meuIndex === 0) {
    textoRadar = "Você é o líder absoluto desta lista!";
  } else if (meuIndex > 0) {
    const rival = rankingProcessado[meuIndex - 1];
    
    // Lógica inteligente dependendo do filtro selecionado
    if (criterioOrdenacao === 'nivel') {
      const diff = rival.nivel - eu.nivel + 1;
      textoRadar = `Faltam ${diff} níveis para passar o #${rival.posicaoExibida} (${rival.nome}).`;
    } else if (criterioOrdenacao === 'letras') {
      const diff = rival.letras - eu.letras + 1;
      textoRadar = `Faltam ${diff} acertos para passar o #${rival.posicaoExibida}.`;
    } else if (criterioOrdenacao === 'tempo') {
      if (eu.tempoMedio === Infinity) {
        textoRadar = "Jogue sua primeira partida para registrar seu tempo médio!";
      } else {
        const diff = eu.tempoMedio - rival.tempoMedio + 1;
        textoRadar = `Corte ${diff}s do seu tempo médio para passar o #${rival.posicaoExibida}.`;
      }
    }
  }

  return (
    <div style={{ 
      width: '100%', minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      padding: '5vh 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' 
    }}>
      
      <style>
        {`
          @keyframes flutuarRomantico {
            0% { transform: translateY(0) translateX(0); opacity: 0.9; }
            10% { opacity: 1; }
            80% { opacity: 0.7; }
            100% { transform: translateY(-300px) translateX(var(--deriva-horizontal)); opacity: 0; }
          }
        `}
      </style>

      {particulas.map(p => (
        <ParticulaRomantica key={p.id} id={p.id} texto={p.texto} posicaoInicial={p.posicao} onFinalizar={removerParticula} />
      ))}

      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <button onClick={() => setTelaAtual('menu')} style={{ backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>⬅ Voltar</button>
        <div style={{ backgroundColor: 'white', padding: '10px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderBottom: '4px solid #1F6FEB' }}>
          <h1 style={{ color: '#1e293b', margin: 0, fontSize: '1.8rem' }}>🏆 Ranking de Residentes</h1>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '900px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', backgroundColor: 'white', padding: '8px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          {['global', 'patente', 'hall'].map(aba => (
            <button
              key={aba} onClick={() => setAbaAtual(aba)}
              style={{
                flex: 1, backgroundColor: abaAtual === aba ? '#1F6FEB' : 'transparent', color: abaAtual === aba ? 'white' : '#64748b',
                border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                transition: 'all 0.2s', fontSize: '1rem', textTransform: 'capitalize'
              }}
            >
              {aba === 'global' ? '🌍 Global' : (aba === 'patente' ? '🎖️ Minha Patente' : '🏆 Hall da Fama')}
            </button>
          ))}
        </div>

        {/* BARRAS DE FILTRO */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontWeight: 'bold', alignSelf: 'center', fontSize: '0.9rem' }}>Filtro:</span>
          <button 
            onClick={() => setCriterioOrdenacao('nivel')} 
            style={{ backgroundColor: criterioOrdenacao === 'nivel' ? '#1e293b' : 'white', color: criterioOrdenacao === 'nivel' ? 'white' : '#64748b', border: '1px solid #cbd5e1', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
          >🎓 Nível Geral</button>
          <button 
            onClick={() => setCriterioOrdenacao('letras')} 
            style={{ backgroundColor: criterioOrdenacao === 'letras' ? '#1e293b' : 'white', color: criterioOrdenacao === 'letras' ? 'white' : '#64748b', border: '1px solid #cbd5e1', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
          >🎯 Precisão</button>
          
          {/* O NOVO BOTÃO DE TEMPO AQUI */}
          <button 
            onClick={() => setCriterioOrdenacao('tempo')} 
            style={{ backgroundColor: criterioOrdenacao === 'tempo' ? '#1e293b' : 'white', color: criterioOrdenacao === 'tempo' ? 'white' : '#64748b', border: '1px solid #cbd5e1', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
          >⏱️ Mais Rápidos</button>
        </div>
      </div>

      {carregando ? (
        <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ color: '#64748b', fontWeight: 'bold', marginTop: '10px' }}>Sincronizando plantões...</p>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '120px' }}>
          {rankingProcessado.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '1.2rem', backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
              Nenhum registro encontrado com estes filtros.
            </div>
          ) : (
            rankingProcessado.map((m) => {
              const isEu = m.uid === dadosUsuario?.uid;
              const pos = m.posicaoExibida;
              const isTop3 = pos <= 3;
              const corTrofeu = pos === 1 ? '#f59e0b' : (pos === 2 ? '#94a3b8' : '#b45309');
              
              return (
                <div 
                  key={m.uid} 
                  style={{ 
                    backgroundColor: 'white', padding: '15px 25px', borderRadius: isTop3 ? '20px' : '12px', 
                    boxShadow: isTop3 ? `0 8px 20px ${corTrofeu}30` : '0 4px 10px rgba(0,0,0,0.02)', 
                    display: 'flex', alignItems: 'center', gap: '20px', 
                    border: isEu ? '2px solid #1F6FEB' : '1px solid white',
                    transform: isEu ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ fontSize: isTop3 ? '1.8rem' : '1.2rem', fontWeight: 'bold', color: isTop3 ? corTrofeu : '#94a3b8', width: '50px', textAlign: 'center' }}>
                    {isTop3 ? (pos === 1 ? '🥇' : (pos === 2 ? '🥈' : '🥉')) : `#${pos}`}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: isTop3 ? '1.2rem' : '1.05rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {m.nome} {isEu && <span style={{ backgroundColor: '#e0e7ff', color: '#1F6FEB', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '8px', verticalAlign: 'middle' }}>Você</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: m.cor, fontWeight: 'bold', marginTop: '3px' }}>🎖️ {m.patente}</div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', gap: '20px' }}>
                    {/* Renderização dinâmica dependendo do filtro escolhido */}
                    {criterioOrdenacao === 'nivel' && (
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isEu ? '#1F6FEB' : '#475569' }}>{m.nivel}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Níveis</div>
                      </div>
                    )}
                    {criterioOrdenacao === 'letras' && (
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isEu ? '#1F6FEB' : '#475569' }}>{m.letras}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Acertos</div>
                      </div>
                    )}
                    {criterioOrdenacao === 'tempo' && (
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isEu ? '#1F6FEB' : '#475569' }}>{formatarTempo(m.tempoMedio)}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Média</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* RADAR PESSOAL FIXO */}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '800px', backgroundColor: 'white', padding: '20px 30px', borderRadius: '24px', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '3px solid #1F6FEB', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1F6FEB', lineHeight: '1' }}>
            {eu ? `#${eu.posicaoExibida}` : '-'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
              {tituloRadar}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
              {textoRadar}
            </div>
          </div>
        </div>
        
        <div 
          onClick={dispararParticulas}
          style={{ fontSize: '2.5rem', cursor: 'pointer', transition: 'transform 0.2s', padding: '10px' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3) rotate(15deg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          title="R ❤️ C"
        >
          🌻
        </div>
      </div>

    </div>
  );
}