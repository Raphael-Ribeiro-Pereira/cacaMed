import { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [username, setUsername] = useState('');
  const [faculdade, setFaculdade] = useState('');
  const [genero, setGenero] = useState('feminino'); 
  
  const [dataNascimento, setDataNascimento] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [materiaPreferida, setMateriaPreferida] = useState('');
  
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        if (!username || !faculdade || !dataNascimento || !periodo || !materiaPreferida) {
          setErro("Por favor, preencha todos os campos do prontuário.");
          setCarregando(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        const fotoEscolhida = genero === 'feminino' ? '/fem.png' : '/masc.png';

        await setDoc(doc(db, "usuarios", user.uid), {
          username: username,
          email: email,
          faculdade: faculdade,
          dataNascimento: dataNascimento,
          periodo: periodo,
          materiaPreferida: materiaPreferida,
          genero: genero,
          fotoUrl: fotoEscolhida, 
          pontuacaoTotal: 0,
          niveis: {}
        });
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') setErro('Esse e-mail já está em uso!');
      else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') setErro('E-mail ou senha incorretos.');
      else if (error.code === 'auth/weak-password') setErro('A senha deve ter pelo menos 6 caracteres.');
      else setErro('Ocorreu um erro. Tente novamente.');
    }
    
    setCarregando(false);
  };

  return (
    <div className="tela-container" style={{ justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      {/* MÁGICA AQUI: maxWidth 550px e minWidth 350px para garantir que não encolha demais */}
      <div style={{ backgroundColor: 'white', padding: '45px 40px', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', width: '100%', maxWidth: '550px', minWidth: '350px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <h1 style={{ textAlign: 'center', color: '#2c3e50', fontSize: '2.8rem', margin: '0 0 10px 0', letterSpacing: '-1px' }}>CAÇA MED</h1>
        <p style={{ textAlign: 'center', color: '#7f8fa6', marginBottom: '35px', fontSize: '1.1rem' }}>
          {isLogin ? 'Bem-vindo de volta ao plantão!' : 'Preencha seu Prontuário Médico'}
        </p>

        {erro && <div style={{ backgroundColor: '#ffefef', color: '#ff4757', padding: '15px', borderRadius: '10px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>{erro}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder="Seu Nome ou Apelido" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: '15px', borderRadius: '10px', border: '2px solid #dfe4ea', fontSize: '1.1rem', boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
                onBlur={(e) => e.target.style.borderColor = '#dfe4ea'}
              />
              
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <input 
                  type="text" 
                  placeholder="Faculdade (Ex: USCS)" 
                  value={faculdade} 
                  onChange={(e) => setFaculdade(e.target.value)}
                  style={{ padding: '15px', borderRadius: '10px', border: '2px solid #dfe4ea', fontSize: '1.1rem', flex: '1.5', boxSizing: 'border-box', minWidth: 0, outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
                  onBlur={(e) => e.target.style.borderColor = '#dfe4ea'}
                />
                <input 
                  type="text" 
                  placeholder="Período (Ex: 3º)" 
                  value={periodo} 
                  onChange={(e) => setPeriodo(e.target.value)}
                  style={{ padding: '15px', borderRadius: '10px', border: '2px solid #dfe4ea', fontSize: '1.1rem', flex: '1', boxSizing: 'border-box', minWidth: 0, outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
                  onBlur={(e) => e.target.style.borderColor = '#dfe4ea'}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.95rem', color: '#7f8fa6', fontWeight: 'bold', marginBottom: '-12px', marginLeft: '5px' }}>Data de Nascimento:</label>
                <input 
                  type="date" 
                  value={dataNascimento} 
                  onChange={(e) => setDataNascimento(e.target.value)}
                  style={{ padding: '15px', borderRadius: '10px', border: '2px solid #dfe4ea', fontSize: '1.1rem', fontFamily: 'inherit', color: dataNascimento ? '#2f3542' : '#a4b0be', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
                  onBlur={(e) => e.target.style.borderColor = '#dfe4ea'}
                />
              </div>

              <input 
                type="text" 
                placeholder="Matéria Preferida (Ex: Anatomia)" 
                value={materiaPreferida} 
                onChange={(e) => setMateriaPreferida(e.target.value)}
                style={{ padding: '15px', borderRadius: '10px', border: '2px solid #dfe4ea', fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
                onBlur={(e) => e.target.style.borderColor = '#dfe4ea'}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '5px' }}>
                <div 
                  onClick={() => setGenero('feminino')}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderRadius: '10px', 
                    border: genero === 'feminino' ? '2px solid #2ed573' : '2px solid #dfe4ea',
                    backgroundColor: genero === 'feminino' ? '#f1fdf5' : 'transparent',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: genero === 'feminino' ? '#2ed573' : '#a4b0be',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                >
                  👩‍⚕️ Doutora
                </div>
                <div 
                  onClick={() => setGenero('masculino')}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderRadius: '10px', 
                    border: genero === 'masculino' ? '2px solid #1e90ff' : '2px solid #dfe4ea',
                    backgroundColor: genero === 'masculino' ? '#f0f8ff' : 'transparent',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: genero === 'masculino' ? '#1e90ff' : '#a4b0be',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                >
                  👨‍⚕️ Doutor
                </div>
              </div>
            </>
          )}

          <input 
            type="email" 
            placeholder="E-mail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '15px', borderRadius: '10px', border: '2px solid #dfe4ea', fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
            onBlur={(e) => e.target.style.borderColor = '#dfe4ea'}
          />
          <input 
            type="password" 
            placeholder="Senha (mín. 6 caracteres)" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)}
            style={{ padding: '15px', borderRadius: '10px', border: '2px solid #dfe4ea', fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
            onBlur={(e) => e.target.style.borderColor = '#dfe4ea'}
          />

          <button 
            type="submit" 
            disabled={carregando}
            style={{ 
              backgroundColor: '#2c3e50', 
              color: 'white', 
              padding: '18px',
              borderRadius: '12px', 
              border: 'none', 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              cursor: carregando ? 'not-allowed' : 'pointer',
              marginTop: '15px',
              opacity: carregando ? 0.7 : 1,
              boxSizing: 'border-box',
              transition: 'transform 0.1s, background-color 0.2s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {carregando ? 'Carregando...' : (isLogin ? 'Entrar no Plantão' : 'Criar Prontuário')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#7f8fa6', fontSize: '1.05rem' }}>
          {isLogin ? "Ainda não tem CRM? " : "Já tem registro médico? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setErro(''); }}
            style={{ color: '#2ed573', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Cadastre-se' : 'Faça Login'}
          </span>
        </p>

      </div>
    </div>
  );
}