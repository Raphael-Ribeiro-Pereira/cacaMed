import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // 🔥 O auth voltou para garantir a identidade!

const TEMPLATES_MISSOES = [
  { id: 'cruzadinha_1', tipo: 'cruzadinha', meta: 1, titulo: 'Plantonista Novato', descricao: 'Conclua 1 fase de Cruzadinha.', recompensaXP: 50 },
  { id: 'cruzadinha_3', tipo: 'cruzadinha', meta: 3, titulo: 'Viciado em Palavras', descricao: 'Conclua 3 fases de Cruzadinha.', recompensaXP: 150 },
  { id: 'login_streak', tipo: 'login', meta: 1, titulo: 'Bater Ponto', descricao: 'Acesse o aplicativo hoje.', recompensaXP: 20 },
  { id: 'xp_500', tipo: 'xp_global', meta: 500, titulo: 'Buscador de Conhecimento', descricao: 'Ganhe 500 XP no total hoje.', recompensaXP: 200 },
];

const obterTituloEpico = (materia) => {
  const mat = (materia || '').toUpperCase();
  if (mat.includes('NEURO')) return { titulo: 'Devorador de Cérebros', emoji: '🧠', cor: '#d946ef' };
  if (mat.includes('OSSO') || mat.includes('ESQUELETICO')) return { titulo: 'Devorador de Ossos', emoji: '🦴', cor: '#f8fafc' };
  if (mat.includes('MUSCUL') || mat.includes('ANATOMIA')) return { titulo: 'Escultor de Corpos', emoji: '💪', cor: '#ef4444' };
  if (mat.includes('FARMACO')) return { titulo: 'O Alquimista Químico', emoji: '💊', cor: '#10b981' };
  if (mat.includes('MICRO') || mat.includes('VIRUS') || mat.includes('BACTERIA')) return { titulo: 'Caçador de Vírus', emoji: '🦠', cor: '#84cc16' };
  if (mat.includes('IMUNO')) return { titulo: 'Lorde dos Anticorpos', emoji: '🛡️', cor: '#3b82f6' };
  if (mat.includes('PATO') || mat.includes('DOENCA')) return { titulo: 'Detetive de Lâminas', emoji: '🔬', cor: '#6366f1' };
  if (mat.includes('HISTO') || mat.includes('CELULA')) return { titulo: 'Mestre Celular', emoji: '🧬', cor: '#ec4899' };
  return { titulo: 'Bisturi de Ouro', emoji: '🩺', cor: '#fbbf24' };
};

export default function MenuPrincipal({ usuario, dadosUsuario, setTelaAtual }) {
  // 🔥 ID blindado com o auth
  const meuUid = auth.currentUser?.uid || usuario?.uid || dadosUsuario?.uid; 

  const nomeUsuario = dadosUsuario?.username || dadosUsuario?.nome || 'Usuário';
  const infoPerfil = String(dadosUsuario?.titulo || dadosUsuario?.genero || dadosUsuario?.sexo || '').toLowerCase().trim();
  const ehFeminino = infoPerfil.includes('doutora') || infoPerfil.includes('dra') || infoPerfil.includes('fem') || infoPerfil === 'f';
  const prefixo = ehFeminino ? 'Dra.' : 'Dr.';
  const imagemPerfil = ehFeminino ? '/fem.png' : '/masc.png';
  
  const [top3Semana, setTop3Semana] = useState([]);
  const [carregandoDevorador, setCarregandoDevorador] = useState(true);
  const [minhasPartidasSemana, setMinhasPartidasSemana] = useState(0);
  const [missoesDeHoje, setMissoesDeHoje] = useState([]);

  // ==========================================
  // 🔥 RESTAURAÇÃO DO NÍVEL GLOBAL (O Nível 37 voltou!)
  // ==========================================
  let somaNiveis = 0;
  let maxXp = -1;
  let materiaEspecialista = 'Clínico Geral';
  let emojiEspecialista = '🩺';
  
  const xpTopicos = dadosUsuario?.xpTopicos || {};
  Object.keys(xpTopicos).forEach(chave => {
    const xpDaMateria = xpTopicos[chave];
    if (xpDaMateria > 0) somaNiveis += Math.floor(Math.sqrt(xpDaMateria / 1000)) + 1;
    if (xpDaMateria > maxXp) {
      maxXp = xpDaMateria;
      materiaEspecialista = chave.split('-')[0];
      emojiEspecialista = obterTituloEpico(materiaEspecialista).emoji;
    }
  });
  
  const nivelGlobal = somaNiveis;

  const getPatente = (nivel) => {
    if (nivel <= 5) return { titulo: 'Estudante (Básico)' };
    if (nivel <= 15) return { titulo: 'Estudante (Clínico)' };
    if (nivel <= 30) return { titulo: 'Interno' };
    if (nivel <= 50) return { titulo: 'Residente (R1)' };
    if (nivel <= 80) return { titulo: 'Médico Especialista' };
    return { titulo: 'Chefe de Plantão' };
  };
  const statusPatente = getPatente(nivelGlobal);

  // 🔥 A Barra de XP agora mostra a evolução da Especialidade dela, assim a barra nunca trava!
  let progressoPorcentagem = 0;
  if (maxXp > 0) {
     const nivelEspecialidade = Math.floor(Math.sqrt(maxXp / 1000)) + 1;
     const xpNivelAtualBase = Math.pow(nivelEspecialidade - 1, 2) * 1000;
     const xpProximoNivelBase = Math.pow(nivelEspecialidade, 2) * 1000;
     progressoPorcentagem = Math.min(100, Math.max(0, ((maxXp - xpNivelAtualBase) / (xpProximoNivelBase - xpNivelAtualBase)) * 100));
  }

  useEffect(() => {
    const buscarDestaques = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        let jogadoresSemana = [];
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
        const dataLimite = seteDiasAtras.toISOString().split('T')[0];

        let partidasDoUsuarioAtual = 0;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const historico = data.estatisticasGerais?.historico || [];
          let partidasNaSemana = 0;
          const materiasCount = {};

          historico.forEach(partida => {
            if (partida.data >= dataLimite) {
              partidasNaSemana++;
              const mat = partida.materia || 'Geral';
              materiasCount[mat] = (materiasCount[mat] || 0) + 1;
            }
          });

          if (docSnap.id === meuUid) partidasDoUsuarioAtual = partidasNaSemana;

          if (partidasNaSemana > 0) {
            let materiaDominante = 'Geral';
            let maxMatCount = 0;
            Object.keys(materiasCount).forEach(m => {
              if (materiasCount[m] > maxMatCount) { maxMatCount = materiasCount[m]; materiaDominante = m; }
            });

            jogadoresSemana.push({
              uid: docSnap.id,
              nome: data.username || data.nome || 'Doutor(a)',
              partidas: partidasNaSemana,
              tema: obterTituloEpico(materiaDominante),
              isEu: docSnap.id === meuUid 
            });
          }
        });
        jogadoresSemana.sort((a, b) => b.partidas - a.partidas);
        setTop3Semana(jogadoresSemana.slice(0, 3)); 
        setMinhasPartidasSemana(partidasDoUsuarioAtual);
      } catch (error) { console.error(error); } finally { setCarregandoDevorador(false); }
    };
    buscarDestaques();
  }, [dadosUsuario, meuUid]);

  useEffect(() => {
    // 🔥 Agora com o meuUid garantido, as missões vão renderizar!
    if (!dadosUsuario || !meuUid) return;

    const hoje = new Date().toISOString().split('T')[0]; 
    const missoesSalvas = dadosUsuario.missoesDiarias || {};

    if (missoesSalvas.data !== hoje || !missoesSalvas.missoes || missoesSalvas.missoes.length === 0) {
      const embaralhadas = [...TEMPLATES_MISSOES].sort(() => 0.5 - Math.random());
      const novasMissoes = embaralhadas.slice(0, 3).map(m => ({
        ...m,
        progressoAtual: m.tipo === 'login' ? 1 : 0, 
        concluida: m.tipo === 'login',
        resgatada: false
      }));

      setMissoesDeHoje(novasMissoes); 

      updateDoc(doc(db, "usuarios", meuUid), {
        "missoesDiarias": { data: hoje, missoes: novasMissoes }
      }).catch(e => console.log("Erro silencioso ao salvar missões:", e));
      
    } else {
      setMissoesDeHoje(missoesSalvas.missoes);
    }
  }, [dadosUsuario, meuUid]);

  const resgatarMissao = async (indexMissao) => {
    if (!meuUid) return;
    const missao = missoesDeHoje[indexMissao];
    if (!missao.concluida || missao.resgatada) return;

    const novasMissoes = [...missoesDeHoje];
    novasMissoes[indexMissao].resgatada = true;
    setMissoesDeHoje(novasMissoes);

    const novoXPGlobal = (dadosUsuario?.pontuacaoTotal || 0) + missao.recompensaXP;

    try {
      await updateDoc(doc(db, "usuarios", meuUid), {
        "missoesDiarias.missoes": novasMissoes,
        pontuacaoTotal: novoXPGlobal
      });
      alert(`🎉 Recompensa Resgatada!\nVocê ganhou +${missao.recompensaXP} XP!`);
    } catch (e) {
      console.error("Erro ao resgatar recompensa", e);
    }
  };

  let mensagemRanking = "Comece um plantão para entrar no ranking!";
  if (top3Semana.length > 0) {
    const souTop3 = top3Semana.some(j => j.isEu);
    if (souTop3) {
      mensagemRanking = "Você está no pódio desta semana! 🎉";
    } else {
      const partidasTerceiro = top3Semana[2]?.partidas || top3Semana[top3Semana.length - 1].partidas;
      const faltam = partidasTerceiro - minhasPartidasSemana + 1;
      mensagemRanking = `faltam ${faltam > 0 ? faltam : 1} lvls para você chegar no terceiro lugar.`;
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', position: 'relative', overflowX: 'hidden', paddingBottom: '50px' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .layout-mestre { display: flex; justify-content: center; gap: 20px; max-width: 1600px; margin: 0 auto; padding: 40px 20px; align-items: flex-start; }
        .coluna-fantasma { width: 380px; visibility: hidden; flex-shrink: 0; }
        .coluna-esquerda { width: 100%; max-width: 800px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
        .coluna-direita { width: 380px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }
        .bento-cruzadinha { grid-column: span 4; }
        .bento-flashcards { grid-column: span 2; } 
        .bento-hardcore { grid-column: span 6; } 
        .bento-pergaminhos { grid-column: span 3; } 
        .bento-estatisticas { grid-column: span 3; } 
        .bento-ranking { grid-column: span 6; }
        .bento-missoes { grid-column: span 6; }
        .bento-card { background-color: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #cbd5e1; transition: all 0.2s; cursor: pointer; display: flex; flex-direction: column; overflow: hidden; }
        .bento-card:hover { border-color: #1F6FEB; transform: translateY(-4px); box-shadow: 0 15px 35px rgba(31,111,235,0.1); }
        .missao-item { display: flex; align-items: center; justify-content: space-between; background-color: white; padding: 15px 20px; border-radius: 12px; margin-top: 15px; border: 1px solid #e2e8f0; }
        @media (max-width: 1400px) { .coluna-fantasma { display: none; } .layout-mestre { max-width: 1200px; } }
        @media (max-width: 900px) { .layout-mestre { flex-direction: column; align-items: center; } .coluna-direita { width: 100%; max-width: 800px; } .coluna-esquerda { grid-template-columns: 1fr; max-width: 800px; } .coluna-esquerda > div { grid-column: span 1 !important; } }
      `}} />

      <div style={{ backgroundColor: '#0f172a', width: '100%', padding: '30px 20px', display: 'flex', justifyContent: 'center', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div onClick={() => setTelaAtual('perfil')} style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#1e293b', padding: '15px 25px', borderRadius: '20px', border: '1px solid #334155', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#38bdf8'} onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}>
            
            <div style={{ position: 'relative' }}>
              <div style={{ width: '75px', height: '75px', borderRadius: '50%', border: '3px solid #38bdf8', overflow: 'hidden', backgroundColor: '#e0e7ff' }}>
                <img src={imagemPerfil} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '-5px', right: '-10px', backgroundColor: '#fbbf24', color: '#854d0e', fontSize: '0.85rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', border: '2px solid #1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Lv. {nivelGlobal}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '220px' }}>
              <div style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 'bold' }}>{prefixo} {nomeUsuario}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#0f172a', padding: '4px 10px', borderRadius: '8px' }}>{statusPatente.titulo}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>{emojiEspecialista} {materiaEspecialista}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressoPorcentagem}%`, height: '100%', backgroundColor: '#38bdf8', transition: 'width 0.5s' }}></div>
                </div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>{Math.floor(progressoPorcentagem)}%</span>
              </div>
            </div>
          </div>

          <div style={{ color: '#64748b', fontStyle: 'italic', fontWeight: 'bold', textShadow: '1px 1px 1px rgba(0,0,0,0.2)', textAlign: 'right' }}>
            Seu plantão virtual está pronto.<br/>Bom estudo!
          </div>

        </div>
      </div>

      <div className="layout-mestre">
        
        <div className="coluna-fantasma"></div>

        <div className="coluna-esquerda">
          
          <div className="bento-card bento-cruzadinha" onClick={() => setTelaAtual('topicos')} style={{ justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '10rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>💉</div>
            <h2 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', color: '#1e293b', borderBottom: '3px solid #1F6FEB', paddingBottom: '10px', display: 'inline-block', width: 'fit-content' }}>Cruzadinhas Médicas</h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0, maxWidth: '70%', lineHeight: '1.5' }}>Acesse seus prontuários, escolha uma matéria e pratique termos médicos com a Inteligência Artificial.</p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '5px' }}>
               {[1,2,3,4].map(i => <div key={i} style={{ width: '35px', height: '35px', border: '2px solid #cbd5e1', borderRadius: '6px', backgroundColor: i===2 ? '#f1f5f9' : 'white' }}></div>)}
            </div>
          </div>

          <div className="bento-card bento-flashcards" onClick={() => alert('Os simuladores de Casos Clínicos estão em desenvolvimento!')} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#f8fafc', borderStyle: 'dashed', borderColor: '#94a3b8' }}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', color: '#64748b', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>Em breve</h2>
            <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>🕵️‍♀️</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '10px 0 0 0' }}>Simulador de Casos Clínicos</p>
          </div>

          <div className="bento-card bento-hardcore" onClick={() => alert('Modo Hardcore em construção!')} style={{ flexDirection: 'row', alignItems: 'center', gap: '20px', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#fee2e2'}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 5px 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Modo Hardcore 🔥
              </h2>
              <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.95rem' }}>
                Desafios extremos sob pressão com vidas limitadas.
              </p>
            </div>
            <div style={{ fontSize: '2.5rem' }}>☠️</div>
          </div>

          <div className="bento-card bento-pergaminhos" onClick={() => alert('Galeria de Pergaminhos sendo polida!')} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>Sala de Pergaminhos</h2>
            <div style={{ fontSize: '2.5rem' }}>📜</div>
          </div>

          <div className="bento-card bento-estatisticas" onClick={() => setTelaAtual('estatisticas')} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>Estatísticas</h2>
            <div style={{ fontSize: '2.5rem' }}>📈</div>
          </div>

          <div className="bento-card bento-ranking" onClick={() => setTelaAtual('ranking')} style={{ flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 5px 0', color: '#1e293b' }}>Ranking Global</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Sua posição geral no hospital.</p>
            </div>
            <div style={{ fontSize: '2.5rem' }}>🌍</div>
          </div>

          <div className="bento-card bento-missoes" style={{ backgroundColor: '#f0fdf4', border: '2px solid #10b981', padding: '25px', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', margin: '0 0 5px 0', color: '#065f46', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  ⭐ Missões Diárias
                </h2>
                <p style={{ margin: 0, color: '#047857', fontSize: '0.9rem' }}>Complete tarefas diárias para acelerar sua evolução.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>
                  {missoesDeHoje ? missoesDeHoje.filter(m => m.concluida).length : 0} / 3 Concluídas
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '5px' }}>
                  🕛 Reseta à meia-noite
                </div>
              </div>
            </div>

            {!missoesDeHoje || missoesDeHoje.length === 0 ? (
               <div style={{ textAlign: 'center', color: '#10b981', padding: '10px' }}>Buscando a prancheta de missões...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {missoesDeHoje.map((missao, idx) => {
                  const progressoVisual = Math.min(100, (missao.progressoAtual / missao.meta) * 100);
                  
                  return (
                    <div key={idx} className="missao-item" style={{ opacity: missao.resgatada ? 0.6 : 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1rem', marginBottom: '2px' }}>{missao.titulo}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>{missao.descricao}</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressoVisual}%`, height: '100%', backgroundColor: missao.concluida ? '#10b981' : '#3b82f6', transition: 'width 0.5s' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: missao.concluida ? '#10b981' : '#64748b' }}>
                            {missao.progressoAtual}/{missao.meta}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginLeft: '15px' }}>
                        {missao.resgatada ? (
                          <div style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem' }}>✅ Coletado</div>
                        ) : missao.concluida ? (
                          <button onClick={() => resgatarMissao(idx)} style={{ backgroundColor: '#fbbf24', color: '#854d0e', border: 'none', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(251, 191, 36, 0.3)', animation: 'pulse 2s infinite' }}>
                            🎁 Coletar +{missao.recompensaXP}
                          </button>
                        ) : (
                          <div style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            +{missao.recompensaXP} XP
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="coluna-direita">
          
          <div className="bento-card" style={{ padding: 0 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', textAlign: 'center', fontWeight: 'bold' }}>🏆 Devoradores da Semana</h2>
            </div>
            
            <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
              {carregandoDevorador ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>🩺 Buscando plantonistas...</div>
              ) : top3Semana.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  
                  {top3Semana[1] && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', fontSize: '0.9rem', textAlign: 'center', wordBreak: 'break-word', width: '100%', zIndex: 10 }}>{top3Semana[1].nome.split(' ')[0]}</span>
                      <div style={{ width: '100%', height: '90px', backgroundColor: '#f1f5f9', position: 'relative', border: '1px solid #94a3b8', borderRight: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', top: '-20px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                          {top3Semana[1].tema.emoji}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#334155', textAlign: 'center', marginTop: '15px' }}>{top3Semana[1].partidas} fases<br/>concluídas</span>
                      </div>
                    </div>
                  )}

                  {top3Semana[0] && (
                    <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', fontSize: '1rem', textAlign: 'center', wordBreak: 'break-word', width: '100%', zIndex: 10 }}>{top3Semana[0].nome.split(' ')[0]}</span>
                      <div style={{ width: '100%', height: '130px', backgroundColor: '#fffbeb', position: 'relative', border: '1px solid #fbbf24', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
                        <div style={{ position: 'absolute', top: '-25px', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid #fbbf24', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                          {top3Semana[0].tema.emoji}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#334155', textAlign: 'center', marginTop: '20px' }}>{top3Semana[0].partidas} fases<br/>concluídas</span>
                      </div>
                    </div>
                  )}

                  {top3Semana[2] && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', fontSize: '0.9rem', textAlign: 'center', wordBreak: 'break-word', width: '100%', zIndex: 10 }}>{top3Semana[2].nome.split(' ')[0]}</span>
                      <div style={{ width: '100%', height: '60px', backgroundColor: '#fff7ed', position: 'relative', border: '1px solid #b45309', borderLeft: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', top: '-20px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid #b45309', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                          {top3Semana[2].tema.emoji}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#334155', textAlign: 'center', marginTop: '15px' }}>{top3Semana[2].partidas} fases<br/>concluídas</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', margin: 'auto' }}>Nenhum plantão registrado nesta semana.</div>
              )}
            </div>

            <div style={{ textAlign: 'center', padding: '15px', borderTop: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#475569', backgroundColor: 'white' }}>
              {mensagemRanking}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}