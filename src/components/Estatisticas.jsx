import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export default function Estatisticas({ dadosUsuario, setTelaAtual }) {
  // ==========================================
  // 🧮 MOTOR ANALÍTICO AVANÇADO
  // ==========================================
  const estatisticas = dadosUsuario?.estatisticas || {};
  const statsGerais = dadosUsuario?.estatisticasGerais || {};
  const xpTopicos = dadosUsuario?.xpTopicos || {};

  const dadosProcessados = useMemo(() => {
    let maiorNivel = { materia: 'Nenhuma', nivel: 0 };
    let maiorLetras = { materia: 'Nenhuma', total: 0 };
    let melhorTempoAbsoluto = Infinity;
    let tempoGeralTotal = 0;
    let partidasGeraisTotal = 0;
    
    const temposPorArea = [];
    const graficoPieMap = {};

    // 1. Analisa os Níveis (XP)
    Object.keys(xpTopicos).forEach(chave => {
      const xp = xpTopicos[chave];
      if (xp > 0) {
        const nivel = Math.floor(Math.sqrt(xp / 1000)) + 1;
        if (nivel > maiorNivel.nivel) {
          maiorNivel = { materia: chave.replace('-', ' - '), nivel: nivel };
        }
      }
    });

    // 2. Analisa as Estatísticas de Partida (Tempo, Letras, etc)
    Object.keys(estatisticas).forEach(chave => {
      const stats = estatisticas[chave];
      const [areaPrincipal, subArea] = chave.split('-');

      if (stats.partidas > 0) {
        tempoGeralTotal += stats.tempo;
        partidasGeraisTotal += stats.partidas;

        if (stats.letras > maiorLetras.total) maiorLetras = { materia: subArea || areaPrincipal, total: stats.letras };
        if (stats.melhorTempo && stats.melhorTempo < melhorTempoAbsoluto) melhorTempoAbsoluto = stats.melhorTempo;

        const tempoMedioSegundos = Math.floor(stats.tempo / stats.partidas);
        temposPorArea.push({
          materia: chave.replace('-', ' - '),
          mediaSegundos: tempoMedioSegundos,
          partidas: stats.partidas,
          recordeLocal: stats.melhorTempo || 0
        });

        graficoPieMap[areaPrincipal] = (graficoPieMap[areaPrincipal] || 0) + stats.partidas;
      }
    });

    // 3. Formata os dados para o Gráfico de Rosca
    const dadosGraficoPie = Object.keys(graficoPieMap).map(area => ({
      name: area,
      value: graficoPieMap[area]
    })).sort((a, b) => b.value - a.value);

    let materiaDominanteTexto = "Sem Dados";
    let porcentagemDominante = 0;
    if (dadosGraficoPie.length > 0) {
      const campeao = dadosGraficoPie[0];
      porcentagemDominante = Math.round((campeao.value / partidasGeraisTotal) * 100);
      materiaDominanteTexto = campeao.name;
    }

    // 4. Formata o Histórico para o Gráfico de Linha (Últimas 30 partidas)
    const historicoData = (statsGerais.historico || []).map((h, i) => ({
      nome: `P${i + 1}`,
      Tempo: h.tempo,
      Erros: h.erros,
      materia: h.materia
    }));

    const tempoMedioGeral = partidasGeraisTotal > 0 ? Math.floor(tempoGeralTotal / partidasGeraisTotal) : 0;
    const mediaErros = partidasGeraisTotal > 0 ? (statsGerais.errosTotais / partidasGeraisTotal).toFixed(1) : 0;

    return {
      maiorNivel,
      maiorLetras,
      tempoMedioGeral,
      melhorTempoAbsoluto: melhorTempoAbsoluto === Infinity ? 0 : melhorTempoAbsoluto,
      tempoGeralTotal,
      partidasGeraisTotal,
      mediaErros,
      temposPorArea: temposPorArea.sort((a, b) => a.mediaSegundos - b.mediaSegundos),
      dadosGraficoPie,
      materiaDominanteTexto,
      porcentagemDominante,
      historicoData,
      streakAtual: statsGerais.streakAtual || 0,
      maiorStreak: statsGerais.maiorStreak || 0,
      diasSeguidos: statsGerais.diasSeguidos || 0,
      maiorPalavra: statsGerais.maiorPalavra || 0
    };
  }, [estatisticas, xpTopicos, statsGerais]);

  // Utilitários de Formatação
  const formatarTempo = (segundos) => {
    if (segundos == null || isNaN(segundos)) return "00:00";
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  const formatarTempoHoras = (segundos) => {
    if (!segundos) return "0h 0m";
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  const CORES = ['#1F6FEB', '#8b5cf6', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#64748b'];

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', padding: '5vh 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => setTelaAtual('menu')} style={{ backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          ⬅ Voltar ao Plantão
        </button>
        <h1 style={{ color: '#1e293b', margin: 0, fontSize: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}>📊 Dashboard Analítico</h1>
      </div>

      {dadosProcessados.partidasGeraisTotal === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '600px', marginTop: '50px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📂</div>
          <h2 style={{ color: '#334155', margin: '0 0 10px 0' }}>Prontuário Vazio</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Conclua seu primeiro plantão para gerar estatísticas detalhadas.</p>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* ==========================================
              🏆 BLOCO 1: VISÃO GERAL (KPIs)
          ========================================== */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px' }}>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⏳</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Tempo Jogado</div>
              <div style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: 'bold' }}>{formatarTempoHoras(dadosProcessados.tempoGeralTotal)}</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⚡</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Melhor Tempo</div>
              <div style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 'bold' }}>{formatarTempo(dadosProcessados.melhorTempoAbsoluto)}</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🔥</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Maior Streak</div>
              <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 'bold' }}>{dadosProcessados.maiorStreak} vitórias</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>📅</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Dias Seguidos</div>
              <div style={{ color: '#8b5cf6', fontSize: '1.4rem', fontWeight: 'bold' }}>{dadosProcessados.diasSeguidos} dias</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>📉</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Média de Erros</div>
              <div style={{ color: '#ef4444', fontSize: '1.4rem', fontWeight: 'bold' }}>{dadosProcessados.mediaErros} / jogo</div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🧠</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Maior Palavra</div>
              <div style={{ color: '#0ea5e9', fontSize: '1.4rem', fontWeight: 'bold' }}>{dadosProcessados.maiorPalavra} letras</div>
            </div>

          </div>

          {/* ==========================================
              📈 BLOCO 2: GRÁFICOS E TENDÊNCIAS
          ========================================== */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            
            {/* Gráfico de Linha (Evolução) */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.4rem' }}>Evolução de Desempenho</h3>
              <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '0.9rem' }}>Acompanhe seu tempo (seg) e erros nas últimas 30 partidas.</p>
              
              <div style={{ flex: 1, minHeight: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosProcessados.historicoData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="Tempo" stroke="#1F6FEB" strokeWidth={3} dot={{ r: 4, fill: '#1F6FEB', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} name="Tempo (s)" />
                    <Line yAxisId="right" type="monotone" dataKey="Erros" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} name="Erros Cometidos" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Rosca (Foco) mantido e ajustado */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.4rem' }}>Distribuição de Foco</h3>
              <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '0.9rem' }}>Veja quais grandes áreas concentram seus estudos.</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', flex: 1 }}>
                <div style={{ flex: '1 1 200px', height: '250px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dadosProcessados.dadosGraficoPie} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                        {dadosProcessados.dadosGraficoPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Plantões`, 'Concluídos']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#1e293b', lineHeight: '1' }}>{dadosProcessados.porcentagemDominante}%</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', marginTop: '5px', maxWidth: '90px', wordWrap: 'break-word' }}>{dadosProcessados.materiaDominanteTexto}</div>
                  </div>
                </div>

                <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dadosProcessados.dadosGraficoPie.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: CORES[idx % CORES.length] }}></div>
                        <span style={{ color: '#334155', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</span>
                      </div>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.value}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ==========================================
              📋 BLOCO 3: O PRONTUÁRIO DETALHADO
          ========================================== */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.4rem' }}>⏱️ Desempenho de Velocidade por Área</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dadosProcessados.temposPorArea.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: idx % 2 === 0 ? '#f8fafc' : 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.materia}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Baseado em {item.partidas} plantões</span>
                  </div>
                  <div style={{ display: 'flex', gap: '30px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Recorde Local</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>{formatarTempo(item.recordeLocal)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '80px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Média</span>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>{formatarTempo(item.mediaSegundos)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}