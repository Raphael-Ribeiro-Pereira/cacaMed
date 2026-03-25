import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { gerarPacienteInicial, processarTurno } from '../utils/motorDDX';

export default function JogoDDX({ setTelaAtual, configDDX, dadosUsuario, setDadosUsuario }) {
  const meuUid = auth.currentUser?.uid || dadosUsuario?.uid;

  const [paciente, setPaciente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [statusJogo, setStatusJogo] = useState('CARREGANDO'); // CARREGANDO, JOGANDO, VITORIA, GAME_OVER
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [inputAcao, setInputAcao] = useState('');
  const [relatorioFinal, setRelatorioFinal] = useState(null);
  
  const chatEndRef = useRef(null);

  // Calcula o Nível Global real da Dra. Carolina para enviar para a IA
  let somaNiveis = 0;
  const xpTopicos = dadosUsuario?.xpTopicos || {};
  Object.keys(xpTopicos).forEach(chave => {
    if (xpTopicos[chave] > 0) somaNiveis += Math.floor(Math.sqrt(xpTopicos[chave] / 1000)) + 1;
  });
  const nivelGlobal = somaNiveis || 1; // Mínimo nível 1 para a IA entender

  // Rola o chat para baixo automaticamente
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico, carregandoAcao]);

  // Inicializa o Paciente quando a tela abre
  useEffect(() => {
    const iniciar = async () => {
      try {
        const dadosPaciente = await gerarPacienteInicial(nivelGlobal, configDDX.dificuldade);
        setPaciente(dadosPaciente);
        setHistorico([{ 
          remetente: 'sistema', 
          texto: `Paciente deu entrada no PS. Nível de Risco estimado: Categoria ${Math.min(5, Math.ceil(nivelGlobal/10))}. Equipa de prontidão.` 
        }]);
        setStatusJogo('JOGANDO');
      } catch (error) {
        setHistorico([{ remetente: 'erro', texto: 'Erro ao bipar a emergência. Tente novamente.' }]);
        setStatusJogo('ERRO');
      }
    };
    iniciar();
  }, [nivelGlobal, configDDX.dificuldade]);

  const executarAcao = async (textoAcao) => {
    if (!textoAcao.trim() || carregandoAcao || statusJogo !== 'JOGANDO') return;

    // Adiciona a ação dela ao log
    const novoHistorico = [...historico, { remetente: 'jogador', texto: `Ação: ${textoAcao}` }];
    setHistorico(novoHistorico);
    setCarregandoAcao(true);
    setInputAcao('');

    try {
      const respostaIA = await processarTurno(paciente, textoAcao, configDDX.equipe, configDDX.dificuldade);
      
      // Atualiza o paciente (Sinais vitais e novas opções de botões)
      setPaciente(prev => ({
        ...prev,
        sinaisVitais: respostaIA.sinaisVitais || prev.sinaisVitais,
        opcoes: respostaIA.opcoes || []
      }));

      // Adiciona a resposta da IA ao log
      novoHistorico.push({ remetente: 'ia', texto: respostaIA.narrativa });
      setHistorico([...novoHistorico]);

      if (respostaIA.status !== 'CONTINUA') {
        setStatusJogo(respostaIA.status);
        finalizarCaso(respostaIA.status);
      }

    } catch (error) {
      setHistorico(prev => [...prev, { remetente: 'erro', texto: 'A equipa não entendeu a sua ordem. Repita.' }]);
    } finally {
      setCarregandoAcao(false);
    }
  };

  const finalizarCaso = async (statusFinal) => {
    if (!meuUid || !dadosUsuario) return;

    let ganhoXP = 0;
    let tituloRecompensa = '';

    if (statusFinal === 'VITORIA') {
      // Recompensa massiva baseada no nível global e dificuldade
      const multiplicadorDificuldade = configDDX.dificuldade === 'formado' ? 2 : 1;
      ganhoXP = 500 + (nivelGlobal * 50) * multiplicadorDificuldade;
      tituloRecompensa = 'Diagnóstico Brilhante! 🎉';
    } else {
      // Penalidade leve por morte ou demissão (Dr. House aprovaria)
      ganhoXP = 50; 
      tituloRecompensa = 'O Paciente não resistiu... 🪦';
    }

    setRelatorioFinal({ titulo: tituloRecompensa, xp: ganhoXP, status: statusFinal });

    const novoXPGlobal = (dadosUsuario.pontuacaoTotal || 0) + ganhoXP;

    try {
      await updateDoc(doc(db, "usuarios", meuUid), { pontuacaoTotal: novoXPGlobal });
      setDadosUsuario(prev => ({ ...prev, pontuacaoTotal: novoXPGlobal }));
    } catch (error) {
      console.error("Erro ao salvar XP do caso:", error);
    }
  };

  if (statusJogo === 'CARREGANDO') {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: 'white', flexDirection: 'column' }}>
        <div style={{ fontSize: '4rem', animation: 'pulse 1.5s infinite' }}>🚑</div>
        <h2>A preparar o bloco operatório...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* COLUNA ESQUERDA: PRONTUÁRIO (Fixo) */}
      <div style={{ width: '35%', minWidth: '350px', backgroundColor: '#f8fafc', borderRight: '2px solid #cbd5e1', display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => setTelaAtual('menu')} style={{ padding: '8px 15px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>⬅ Fugir do Plantão</button>
          <div style={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ color: '#ef4444' }}>●</span> Sala Vermelha</div>
        </div>

        {paciente && (
          <>
            {/* DADOS DO PACIENTE */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px', borderTop: '5px solid #3b82f6' }}>
              <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.5rem' }}>{paciente.nome}</h2>
              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '15px' }}>{paciente.idade} anos</div>
              
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Queixa Principal</span>
                <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '1.1rem' }}>"{paciente.queixaPrincipal}"</div>
              </div>
              
              <div>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Histórico</span>
                <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.4' }}>{paciente.historico}</div>
              </div>
            </div>

            {/* SINAIS VITAIS */}
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '15px', color: 'white', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.4)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                Sinais Vitais <span style={{ color: '#10b981', animation: 'pulse 1s infinite' }}>❤</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>BPM (FC)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>{paciente.sinaisVitais.fc}</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pressão (PA)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#38bdf8' }}>{paciente.sinaisVitais.pa}</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Oxigénio (Sat)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#a78bfa' }}>{paciente.sinaisVitais.sat}</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Temp (°C)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fbbf24' }}>{paciente.sinaisVitais.temp}</div>
                </div>
              </div>
            </div>
            
            {/* EQUIPA ATIVA */}
            <div style={{ marginTop: '20px' }}>
               <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>Equipa em Sala</div>
               <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {configDDX.equipe.length === 0 ? <span style={{color: '#64748b'}}>A atuar a solo.</span> : 
                   configDDX.equipe.map(id => (
                     <div key={id} style={{ backgroundColor: '#e2e8f0', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', textTransform: 'capitalize' }}>
                       Dr. {id}
                     </div>
                   ))
                  }
               </div>
            </div>
          </>
        )}
      </div>

      {/* COLUNA DIREITA: LOG DE AÇÕES E INTERAÇÃO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* ÁREA DE CHAT (Narrativa) */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff' }}>
          {historico.map((msg, index) => (
            <div key={index} style={{ 
              alignSelf: msg.remetente === 'jogador' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.remetente === 'jogador' ? '#1e3a8a' : (msg.remetente === 'erro' ? '#fee2e2' : '#f1f5f9'),
              color: msg.remetente === 'jogador' ? 'white' : (msg.remetente === 'erro' ? '#b91c1c' : '#1e293b'),
              padding: '15px 20px',
              borderRadius: '15px',
              maxWidth: '80%',
              borderBottomRightRadius: msg.remetente === 'jogador' ? '0px' : '15px',
              borderBottomLeftRadius: msg.remetente !== 'jogador' ? '0px' : '15px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              lineHeight: '1.5',
              fontSize: '1.05rem'
            }}>
              {msg.remetente === 'sistema' && <strong style={{color: '#3b82f6'}}>📟 Pager: </strong>}
              {msg.remetente === 'ia' && <strong style={{color: '#10b981'}}>🩺 Evolução: </strong>}
              {msg.texto}
            </div>
          ))}
          {carregandoAcao && (
             <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontStyle: 'italic', padding: '10px' }}>
               A equipa está a executar a ordem e a aguardar resultados... ⏳
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* TELA FINAL DE RESULTADO (Sobrepõe os inputs se o jogo acabar) */}
        {relatorioFinal && (
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '30px', backgroundColor: relatorioFinal.status === 'VITORIA' ? '#f0fdf4' : '#fef2f2', borderTop: `5px solid ${relatorioFinal.status === 'VITORIA' ? '#10b981' : '#ef4444'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <h2 style={{ color: relatorioFinal.status === 'VITORIA' ? '#047857' : '#b91c1c', margin: '0 0 10px 0', fontSize: '2rem' }}>{relatorioFinal.titulo}</h2>
            <p style={{ color: '#334155', fontSize: '1.1rem', margin: '0 0 20px 0' }}>
              A doença real era: <strong style={{ color: '#0f172a' }}>{paciente?.diagnosticoOculto}</strong>
            </p>
            <div style={{ backgroundColor: 'white', padding: '10px 25px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.2rem', color: '#fbbf24', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              +{relatorioFinal.xp} XP
            </div>
            <button onClick={() => setTelaAtual('menu')} style={{ backgroundColor: '#0f172a', color: 'white', padding: '15px 40px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
              Regressar ao Menu Principal
            </button>
          </div>
        )}

        {/* ÁREA DE INPUT/BOTÕES (Só mostra se estiver a jogar) */}
        {statusJogo === 'JOGANDO' && !relatorioFinal && (
          <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderTop: '1px solid #cbd5e1' }}>
            
            {/* MODO RESIDENTE: Exibe botões gerados pela IA */}
            {configDDX.dificuldade === 'residente' && paciente?.opcoes?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {paciente.opcoes.map((opcao, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => executarAcao(opcao)}
                    disabled={carregandoAcao}
                    style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #94a3b8', borderRadius: '10px', color: '#1e293b', fontWeight: 'bold', cursor: carregandoAcao ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#94a3b8'}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            ) : (
              /* MODO MÉDICO FORMADO (Ou fallback caso as opções sumam): Input de texto */
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={inputAcao}
                  onChange={(e) => setInputAcao(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executarAcao(inputAcao)}
                  placeholder="Prescreva um exame, medicação ou diagnóstico final..."
                  disabled={carregandoAcao}
                  style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                />
                <button 
                  onClick={() => executarAcao(inputAcao)}
                  disabled={carregandoAcao || !inputAcao.trim()}
                  style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 25px', borderRadius: '10px', fontWeight: 'bold', cursor: carregandoAcao || !inputAcao.trim() ? 'not-allowed' : 'pointer', opacity: carregandoAcao || !inputAcao.trim() ? 0.5 : 1 }}
                >
                  Prescrever
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}