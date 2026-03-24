import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function FlashCards({ baralho, area, dificuldade, setTelaAtual, usuario, dadosUsuario, setDadosUsuario }) {
  const meuUid = auth.currentUser?.uid || usuario?.uid || dadosUsuario?.uid;

  // ==========================================
  // 🧠 MOTOR DE REPETIÇÃO ESPAÇADA (FILA VIVA)
  // ==========================================
  const [filaDeCartas, setFilaDeCartas] = useState([]);
  const [tamanhoOriginal, setTamanhoOriginal] = useState(0);

  const [input, setInput] = useState('');
  const [virada, setVirada] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [acertouAtual, setAcertouAtual] = useState(null); // Guarda se ela acertou ou errou o turno
  const [salvando, setSalvando] = useState(false);

  const [acertosNaSessao, setAcertosNaSessao] = useState(0);
  const [urlSorteada, setUrlSorteada] = useState('');
  const [opcoesMultiplaEscolha, setOpcoesMultiplaEscolha] = useState([]);

  // Quando o componente carrega, injeta o baralho na Fila Viva
  useEffect(() => {
    if (baralho && baralho.length > 0) {
      // Embaralha as cartas iniciais para não ser sempre a mesma ordem
      const embaralhado = [...baralho].sort(() => 0.5 - Math.random());
      setFilaDeCartas(embaralhado);
      setTamanhoOriginal(embaralhado.length);
    }
  }, [baralho]);

  // A carta atual é SEMPRE a primeira da fila
  const cartaAtual = filaDeCartas[0];

  // ==========================================
  // 🎲 SETUP DA CARTA (Roda toda vez que a carta do topo muda)
  // ==========================================
  useEffect(() => {
    if (!cartaAtual) return;

    const urlsValidas = cartaAtual.urls || [];
    if (urlsValidas.length > 0) {
      const sorteada = urlsValidas[Math.floor(Math.random() * urlsValidas.length)];
      setUrlSorteada(sorteada);
    } else {
      setUrlSorteada('');
    }

    if (dificuldade === 'facil') {
      const outrasCartas = baralho.filter(c => c.resposta !== cartaAtual.resposta);
      const erradasEmbaralhadas = outrasCartas.sort(() => 0.5 - Math.random());
      
      const opcoes = [cartaAtual.resposta];
      for (let i = 0; i < Math.min(3, erradasEmbaralhadas.length); i++) {
        opcoes.push(erradasEmbaralhadas[i].resposta);
      }
      
      setOpcoesMultiplaEscolha(opcoes.sort(() => 0.5 - Math.random()));
    }
  }, [cartaAtual, baralho, dificuldade]);

  const gerarDicaForca = (texto) => {
    if (!texto) return '';
    return texto.split(' ').map(palavra => {
      if (palavra.length <= 1) return palavra;
      return palavra.charAt(0) + ' _'.repeat(palavra.length - 1);
    }).join('   ');
  };

  const limparTexto = (t) => t.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const verificarResposta = (palavraDigitadaOuClicada) => {
    if (limparTexto(palavraDigitadaOuClicada) === limparTexto(cartaAtual.resposta)) {
      setFeedback('✅ Brilhante!');
      setAcertouAtual(true);
      setAcertosNaSessao(prev => prev + 1); 
    } else {
      setFeedback('❌ Incorreto! Essa carta vai voltar...');
      setAcertouAtual(false);
    }
    setVirada(true);
  };

  const proxima = async () => {
    let novaFila = [...filaDeCartas];

    // ⚔️ A LÓGICA DA PUNIÇÃO DIDÁTICA
    if (acertouAtual) {
      // Acertou? Queima a carta e tira do baralho.
      novaFila.shift();
    } else {
      // Errou? Tira da frente e empurra 3 posições para trás (ou pro fim da fila)
      const cartaMaldita = novaFila.shift();
      const posicaoInjecao = Math.min(3, novaFila.length); 
      novaFila.splice(posicaoInjecao, 0, cartaMaldita);
    }

    if (novaFila.length > 0) {
      setFilaDeCartas(novaFila);
      setVirada(false);
      setInput('');
      setFeedback('');
      setAcertouAtual(null);
    } else {
      // ==========================================
      // 💾 FIM DO JOGO (SALVAR NO FIREBASE)
      // ==========================================
      setSalvando(true);
      
      // O XP é sempre baseado no tamanho original (evita farm de XP por erro)
      const multiplicador = dificuldade === 'dificil' ? 100 : (dificuldade === 'medio' ? 50 : 30);
      const xpGanho = tamanhoOriginal * multiplicador; 
      
      const hoje = new Date().toISOString().split('T')[0];
      const xpAtualizado = { ...(dadosUsuario?.xpTopicos || {}) };
      xpAtualizado[area] = (xpAtualizado[area] || 0) + xpGanho;

      const historicoAtualizado = [...(dadosUsuario?.estatisticasGerais?.historico || [])];
      historicoAtualizado.push({ data: hoje, materia: area, tipo: `flashcard_${dificuldade}` });
      
      const xpGlobalAntigo = dadosUsuario?.pontuacaoTotal || 0;
      const novoXPGlobal = xpGlobalAntigo + xpGanho;

      const objMissoesAtual = dadosUsuario?.missoesDiarias || { data: new Date().toLocaleDateString('pt-BR'), missoes: [] };
      let missoesAtualizadas = objMissoesAtual.missoes || [];
      
      if (objMissoesAtual.data === new Date().toLocaleDateString('pt-BR') && missoesAtualizadas.length > 0) {
        missoesAtualizadas = missoesAtualizadas.map(missao => {
          if (missao.concluida) return missao; 
          let novoProgresso = missao.progressoAtual || 0;
          if (missao.tipo === 'flashcard') novoProgresso += acertosNaSessao;
          if (missao.tipo === 'xp_global') novoProgresso += xpGanho;
          if (novoProgresso > missao.meta) novoProgresso = missao.meta;
          return { ...missao, progressoAtual: novoProgresso, concluida: novoProgresso >= missao.meta };
        });
      }

      const novosDados = {
        ...dadosUsuario,
        pontuacaoTotal: novoXPGlobal,
        xpTopicos: xpAtualizado,
        estatisticasGerais: { ...dadosUsuario?.estatisticasGerais, historico: historicoAtualizado },
        missoesDiarias: { ...objMissoesAtual, missoes: missoesAtualizadas }
      };

      try {
        if (meuUid) {
          await updateDoc(doc(db, "usuarios", meuUid), {
            pontuacaoTotal: novoXPGlobal,
            xpTopicos: xpAtualizado,
            "estatisticasGerais.historico": historicoAtualizado,
            "missoesDiarias.missoes": missoesAtualizadas
          });
        }
        setDadosUsuario(novosDados);
        alert(`🎓 Plantão Finalizado!\nNível: ${dificuldade.toUpperCase()}\nVocê ganhou +${xpGanho} XP em ${area}!`);
        setTelaAtual('menu');
      } catch (error) {
        console.error("Erro ao salvar progresso:", error);
        alert("Erro ao salvar o XP, mas você concluiu o baralho!");
        setTelaAtual('menu');
      }
    }
  };

  if (!cartaAtual) return null;
  if (salvando) return <div className="tela-container"><h2>Arquivando Prontuário... 🩺</h2></div>;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', perspective: '1000px', backgroundColor: '#f8fafc' }}>
      
      <div style={{ width: '100%', maxWidth: '450px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setTelaAtual('menu')} style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>⬅ Abandonar</button>
        
        {/* 🔥 NOVO PLACAR: Contagem de Exaustão */}
        <div style={{ color: '#0f172a', fontWeight: 'bold', backgroundColor: '#fde047', padding: '5px 15px', borderRadius: '20px', border: '2px solid #ca8a04', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          Faltam {filaDeCartas.length} cartas
        </div>
      </div>

      <div style={{ 
        width: '100%', maxWidth: '450px', height: '480px', position: 'relative', marginTop: '20px',
        transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d', transform: virada ? 'rotateY(180deg)' : 'rotateY(0)'
      }}>
        {/* FRENTE DA CARTA */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
          {urlSorteada ? (
            <img src={urlSorteada} alt="Anatomia" style={{ width: '100%', height: '75%', objectFit: 'contain', backgroundColor: '#f1f5f9', padding: '15px', boxSizing: 'border-box' }} />
          ) : (
            <div style={{ width: '100%', height: '75%', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>Sem imagem</div>
          )}
          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: '#1e293b', margin: 0, fontSize: '1.3rem' }}>O que é esta estrutura?</h3>
          </div>
        </div>

        {/* VERSO DA CARTA (RESPOSTA) */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: acertouAtual ? '#f0fdf4' : '#fef2f2', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', padding: '30px', transform: 'rotateY(180deg)', border: `3px solid ${acertouAtual ? '#10b981' : '#ef4444'}`, boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', borderBottom: `2px solid ${acertouAtual ? '#bbf7d0' : '#fecaca'}`, paddingBottom: '15px', marginBottom: '20px' }}>
             <h2 style={{ color: acertouAtual ? '#059669' : '#b91c1c', margin: '0 0 5px 0', fontSize: '1.8rem' }}>{cartaAtual.resposta}</h2>
          </div>
          
          <div style={{ overflowY: 'auto', color: '#334155', fontSize: '1.05rem', lineHeight: '1.6', flex: 1 }}>
            <p style={{ color: acertouAtual ? '#047857' : '#991b1b', fontWeight: 'bold', margin: '0 0 5px 0' }}>🧠 Análise da IA:</p>
            {cartaAtual.descricao}
          </div>
          
          <button onClick={proxima} style={{ marginTop: '20px', backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            {filaDeCartas.length > 1 ? 'Continuar Plantão ➔' : 'Finalizar Plantão 🏁'}
          </button>
        </div>
      </div>

      {/* ÁREA DE CONTROLES */}
      <div style={{ marginTop: '20px', width: '100%', maxWidth: '450px' }}>
        
        {/* MODO FÁCIL: Botões de Múltipla Escolha */}
        {!virada && dificuldade === 'facil' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {opcoesMultiplaEscolha.map((opcao, i) => (
              <button key={i} onClick={() => verificarResposta(opcao)} style={{ padding: '15px', backgroundColor: 'white', border: '2px solid #cbd5e1', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#1F6FEB'} onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
                {opcao}
              </button>
            ))}
          </div>
        )}

        {/* MODO MÉDIO E DIFÍCIL: Input de Texto */}
        {!virada && (dificuldade === 'medio' || dificuldade === 'dificil') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Dica da Forca só aparece no Modo Médio */}
            {dificuldade === 'medio' && (
              <div style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '3px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '12px' }}>
                {gerarDicaForca(cartaAtual.resposta)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && verificarResposta(input)}
                placeholder="Digite o nome da estrutura..." 
                style={{ flex: 1, padding: '18px', borderRadius: '16px', border: '2px solid #cbd5e1', fontSize: '1.1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                onFocus={e => e.currentTarget.style.borderColor = '#1F6FEB'}
                onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
              <button onClick={() => verificarResposta(input)} style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '0 25px', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f172a'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e293b'}>
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Feedback Visual de Acerto/Erro */}
      <div style={{ marginTop: '15px', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center', color: feedback.includes('✅') ? '#10b981' : '#ef4444', minHeight: '30px' }}>
        {feedback}
      </div>

    </div>
  );
}