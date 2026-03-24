import { useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function PerfilUsuario({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual }) {
  // Estados do Perfil Geral
  const [username, setUsername] = useState(dadosUsuario?.username || '');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' }); 

  // Estados EXCLUSIVOS da aba de Senha
  const [modoSenha, setModoSenha] = useState(false); 
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Referência para o input de arquivo oculto
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    setTelaAtual('login');
  };

  const salvarPerfilGeral = async () => {
    setMensagem({ texto: 'Salvando...', tipo: '' });
    try {
      await updateDoc(doc(db, "usuarios", usuario.uid), { username: username });
      setDadosUsuario(prev => ({ ...prev, username }));
      setMensagem({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
    } catch (error) {
      setMensagem({ texto: 'Erro ao salvar perfil.', tipo: 'erro' });
    }
  };

  // Lógica para quando o usuário seleciona uma imagem
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMensagem({ texto: 'Funcionalidade de upload de foto pendente (Firebase Storage).', tipo: 'erro' });
      // Aqui você integraria com o Firebase Storage para fazer o upload do 'file'
      // E depois atualizaria o 'dadosUsuario.fotoUrl' no Firestore e no estado.
    }
  };

  // A MÁGICA DA SEGURANÇA
  const alterarSenha = async (e) => {
    e.preventDefault();
    setMensagem({ texto: 'Autenticando...', tipo: '' });

    if (novaSenha !== confirmarSenha) {
      setMensagem({ texto: 'As senhas novas não coincidem!', tipo: 'erro' });
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem({ texto: 'A nova senha deve ter no mínimo 6 caracteres.', tipo: 'erro' });
      return;
    }

    try {
      // 1. Prova pro Google que o usuário sabe a senha atual
      const credencial = EmailAuthProvider.credential(usuario.email, senhaAtual);
      await reauthenticateWithCredential(usuario, credencial);

      // 2. O Google libera e troca a senha
      await updatePassword(usuario, novaSenha);

      setMensagem({ texto: 'Senha alterada com sucesso!', tipo: 'sucesso' });
      setModoSenha(false); 
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setMensagem({ texto: 'A senha atual está incorreta.', tipo: 'erro' });
      } else {
        setMensagem({ texto: 'Erro ao alterar a senha. Tente novamente.', tipo: 'erro' });
      }
    }
  };

  // Ajuda a colorir as mensagens de erro ou sucesso
  const renderMensagem = () => {
    if (!mensagem.texto) return null;
    const cor = mensagem.tipo === 'sucesso' ? '#2ed573' : '#ff4757';
    const bg = mensagem.tipo === 'sucesso' ? '#f1fdf5' : '#ffefef';
    return <div style={{ backgroundColor: bg, color: cor, padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', border: `1px solid ${cor}`, width: '100%', boxSizing: 'border-box' }}>{mensagem.texto}</div>;
  };

  // Estilos padronizados para manter o código limpo
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe4ea', fontSize: '1rem', marginBottom: '15px', boxSizing: 'border-box' };
  const btnAzul = { backgroundColor: '#1e90ff', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '300px', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };

  return (
    <div className="tela-container" style={{ justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

        {/* 1. O NOVO BOTÃO VOLTAR NO CANTO SUPERIOR ESQUERDO */}
        <button 
          onClick={() => {
            if (modoSenha) setModoSenha(false); // Se estiver na senha, volta pro perfil
            else setTelaAtual('menu'); // Se estiver no perfil, volta pro menu
          }}
          style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'transparent', border: 'none', fontSize: '1.8rem', color: '#2c3e50', cursor: 'pointer', padding: '5px' }}
        >
          ⬅
        </button>

        <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '1.8rem' }}>
          {modoSenha ? 'Segurança da Conta' : 'Seu Perfil'}
        </h2>

        {renderMensagem()}

        {/* Input de arquivo oculto para o upload da foto */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFotoChange}
        />

        {!modoSenha ? (
          // ==========================================
          // ABA 1: PERFIL PRINCIPAL
          // ==========================================
          <>
            <div style={{ position: 'relative', marginBottom: '25px' }}>
              {/* 2. O CONTÊINER DA FOTO COM O ÍCONE DE CANETA */}
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #dfe4ea', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                {dadosUsuario?.fotoUrl ? (
                  <img src={dadosUsuario.fotoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f8fa6', fontWeight: 'bold' }}>Sem Foto</div>
                )}
              </div>
              
              {/* O ÍCONE DE CANETA (Botão de Edição) */}
              <button 
                onClick={() => fileInputRef.current.click()} // Aciona o input de arquivo oculto
                style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'white', color: '#2c3e50', border: '3px solid #dfe4ea', width: '35px', height: '35px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🖊️
              </button>
            </div>

            <div style={{ width: '100%', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9rem', color: '#7f8fa6', fontWeight: 'bold', marginLeft: '5px' }}>Alterar Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button onClick={salvarPerfilGeral} style={btnAzul}>
              Salvar Alterações
            </button>

            <button
              onClick={() => { setModoSenha(true); setMensagem({ texto: '', tipo: '' }); }}
              style={{ backgroundColor: '#2f3542', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '300px', marginBottom: '30px', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#576574'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2f3542'}
            >
              🔒 Mudar Senha de Acesso
            </button>

            <button onClick={handleLogout} style={{ backgroundColor: '#ff4757', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '300px' }}>
              Sair da Conta (Logout)
            </button>
          </>
        ) : (
          // ==========================================
          // ABA 2: MUDANÇA DE SENHA
          // ==========================================
          <form onSubmit={alterarSenha} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div style={{ width: '100%', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.9rem', color: '#7f8fa6', fontWeight: 'bold', marginLeft: '5px' }}>Senha Atual:</label>
              <input
                type="password"
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ width: '100%', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.9rem', color: '#7f8fa6', fontWeight: 'bold', marginLeft: '5px' }}>Nova Senha:</label>
              <input
                type="password"
                placeholder="Mínimo de 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ width: '100%', marginBottom: '15px' }}>
              <label style={{ fontSize: '0.9rem', color: '#7f8fa6', fontWeight: 'bold', marginLeft: '5px' }}>Confirme a Nova Senha:</label>
              <input
                type="password"
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <button type="submit" style={btnAzul}>
              Confirmar Troca de Senha
            </button>
          </form>
        )}

      </div>
    </div>
  );
}