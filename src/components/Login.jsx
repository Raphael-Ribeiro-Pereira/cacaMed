import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, KeyRound, Link2, Lock, Mail, Stethoscope } from 'lucide-react';
import { contaPadrao } from '../services/entradaConta';
import { USAR_AUTH_SUPABASE } from '../supabase';
import { emailOk } from '../utils/entrada';
import { animar, useLargo } from '../utils/prototipo';
import { CascaEntrada, Campo, Erro, GoogleG, LadoMarca, Marca, Olho } from './entradaUi';
import '../prototipo.css';

// Tela de entrada portada do protótipo de movimento, com a mesma lógica de antes: senha pelo
// Firebase ou Supabase, Google (com vínculo de conta antiga) e recuperação de senha.
const PERFIL_NA_API = ['planilha', 'supabase'].includes(import.meta.env.VITE_FONTE_DADOS);
const MENSAGENS_GOOGLE = {
  'auth/unauthorized-domain': 'Este endereço local não está autorizado para login Google. Abra http://localhost:5173/.',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Autorize pop-ups e tente novamente.',
  'auth/operation-not-allowed': 'O login Google ainda não está disponível neste projeto.',
};

function Folha({ aberta, rotulo, onClose, children }) {
  useEffect(() => {
    if (!aberta) return undefined;
    const tecla = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberta, onClose]);
  return <AnimatePresence>
    {aberta && <>
      <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div key="sh" className="sheet au-sheet" role="dialog" aria-modal="true" aria-label={rotulo} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>{children}</motion.div>
    </>}
  </AnimatePresence>;
}

function Esqueci({ aberto, emailInicial, onClose, conta }) {
  const [end, setEnd] = useState(emailInicial);
  const [st, setSt] = useState('idle');
  const [erro, setErro] = useState('');
  const enviar = async (e, antigo = false) => {
    e?.preventDefault();
    if (!emailOk(end) || st === 'busy') return;
    setSt('busy'); setErro('');
    try {
      await conta.recuperarSenha(end.trim(), { antigo });
      setSt('ok');
    } catch (falha) {
      setSt('idle');
      setErro(falha.code === 'auth/invalid-email' ? 'Digite um e-mail válido.' : falha.code === 'auth/too-many-requests'
        ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' : 'Não foi possível enviar o link. Tente novamente mais tarde.');
    }
  };
  return <Folha aberta={aberto} rotulo="Recuperar acesso" onClose={onClose}>
    <span className="cr-key amber"><KeyRound size={20} /></span>
    <h3>Recuperar acesso</h3>
    {st === 'ok' ? <>
      <p className="au-sent"><Check size={16} />Solicitação enviada</p>
      <p>Se houver uma conta para esse e-mail, você receberá um link em <b>{end.trim()}</b>.</p>
      <button className="primary" onClick={onClose}>Voltar ao login</button>
    </> : <form onSubmit={enviar} className="au-sheet-f">
      <p>Enviaremos as instruções para o seu e-mail.</p>
      <Campo id="rc-mail" label="E-mail cadastrado" icon={Mail} estado={end && !emailOk(end) ? 'bad' : ''}>
        <input id="rc-mail" type="email" inputMode="email" autoComplete="email" spellCheck={false} autoFocus value={end} onChange={e => setEnd(e.target.value)} />
      </Campo>
      {erro && <p className="cr-err" role="alert">{erro}</p>}
      <button className="primary amber" type="submit" disabled={!emailOk(end) || st === 'busy'}>{st === 'busy' ? <><span className="spin sm dark" />Enviando</> : 'Enviar link de recuperação'}</button>
      {USAR_AUTH_SUPABASE && <button type="button" className="w-link" disabled={!emailOk(end) || st === 'busy'} onClick={() => enviar(null, true)}>Ainda não entrei após a atualização: recuperar acesso antigo</button>}
      <button type="button" className="ghost" onClick={onClose}>Voltar ao login</button>
    </form>}
  </Folha>;
}

export default function Login({ setTelaAtual, conta = contaPadrao }) {
  const web = useLargo();
  const comGoogle = PERFIL_NA_API || conta !== contaPadrao;
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState(() => new URLSearchParams(window.location.search).has('error')
    ? 'Não foi possível concluir o login Google. Confira a configuração do provedor e tente novamente.' : '');
  const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false);
  const [treme, setTreme] = useState(0);
  const [esqueci, setEsqueci] = useState(false);
  const [aberturas, setAberturas] = useState(0);
  const [pendente, setPendente] = useState(null);
  const [senhaVinculo, setSenhaVinculo] = useState('');
  const [vinculando, setVinculando] = useState(false);
  const pode = emailOk(email) && senha.length > 0 && !busy && !google;

  useEffect(() => {
    // O retorno pode conter detalhes internos do provedor: não os mostra nem deixa códigos OAuth no endereço.
    if (new URLSearchParams(window.location.search).has('error')) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const falhar = mensagem => { setErro(mensagem); setTreme(t => t + 1); };
  const enviar = async e => {
    e.preventDefault();
    if (!pode) return;
    setErro(''); setBusy(true);
    try {
      await conta.entrarComSenha(email.trim(), senha);
    } catch {
      falhar('Credenciais inválidas ou Doutor não encontrado no sistema.');
    } finally {
      setBusy(false);
    }
  };
  const entrarComGoogle = async () => {
    if (google) return;
    setErro(''); setGoogle(true);
    try {
      const r = await conta.entrarComGoogle();
      if (r?.pendente) { setPendente(r.pendente); setSenhaVinculo(''); }
    } catch (falha) {
      if (falha.code !== 'auth/popup-closed-by-user') falhar(MENSAGENS_GOOGLE[falha.code] || `Não foi possível entrar com Google (${falha.code || 'erro desconhecido'}).`);
    } finally {
      setGoogle(false);
    }
  };
  const vincular = async e => {
    e.preventDefault();
    if (!pendente || !senhaVinculo || vinculando) return;
    setVinculando(true);
    try {
      await conta.vincularGoogle(pendente.email, senhaVinculo, pendente.credencial);
      setPendente(null); setSenhaVinculo('');
    } catch {
      setPendente(null); setSenhaVinculo('');
      falhar('Senha antiga incorreta ou vínculo indisponível. Confira e tente novamente.');
    } finally {
      setVinculando(false);
    }
  };

  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr au-scr r-login">
    {!web && <div className="au-top"><span className="kicker">Bater ponto</span></div>}
    <CascaEntrada web={web} lado={<LadoMarca />}>
      <div className="au-head">
        {!web && <Marca />}
        <h1>Entrar no plantão</h1>
        <p>Use o e-mail e a senha do seu crachá.</p>
      </div>
      <motion.form key={treme} className="au-card" onSubmit={enviar} noValidate
        animate={treme && animar() ? { x: [0, -10, 9, -6, 4, 0] } : undefined} transition={{ duration: .45 }}>
        <Erro texto={erro} />
        <Campo id="lg-mail" label="E-mail profissional" icon={Mail} estado={email && !emailOk(email) ? 'bad' : ''}>
          <input id="lg-mail" type="email" inputMode="email" autoComplete="username" spellCheck={false} placeholder="doutor@cacomed.com" value={email} onChange={e => setEmail(e.target.value)} />
        </Campo>
        <Campo id="lg-senha" label="Senha de acesso" icon={Lock}>
          <input id="lg-senha" type={ver ? 'text' : 'password'} autoComplete="current-password" placeholder="Mín. 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} />
          <Olho ver={ver} set={setVer} />
        </Campo>
        <button type="button" className="au-forgot" onClick={() => { setAberturas(a => a + 1); setEsqueci(true); }}>Esqueceu a senha?</button>
        <button className="primary" type="submit" disabled={!pode}>
          {busy ? <><span className="spin sm dark" />Validando credencial</> : <><Stethoscope />Entrar no plantão</>}
        </button>
        {comGoogle && <>
          <div className="au-or"><span>ou</span></div>
          <button type="button" className="au-google" onClick={entrarComGoogle} disabled={google || busy}>
            {google ? <><span className="spin sm" />Aguardando o Google</> : <><GoogleG />Continuar com Google</>}
          </button>
        </>}
      </motion.form>
      <p className="au-foot">Ainda não é plantonista? <button className="w-link" onClick={() => setTelaAtual('cadastro')}>Cadastre-se na recepção</button></p>
    </CascaEntrada>
    <Esqueci key={aberturas} aberto={esqueci} emailInicial={email} conta={conta} onClose={() => setEsqueci(false)} />
    <Folha aberta={Boolean(pendente)} rotulo="Vincular conta antiga" onClose={() => !vinculando && setPendente(null)}>
      <span className="cr-key"><Link2 size={20} /></span>
      <h3>Vincular conta antiga</h3>
      <p>Encontramos uma conta antiga para <b>{pendente?.email}</b>. Você autoriza vinculá-la ao Google? Confirme com a senha antiga.</p>
      <form onSubmit={vincular} className="au-sheet-f">
        <Campo id="lg-vinculo" label="Senha antiga" icon={Lock}>
          <input id="lg-vinculo" type="password" autoComplete="current-password" autoFocus value={senhaVinculo} onChange={e => setSenhaVinculo(e.target.value)} />
        </Campo>
        <button className="primary" type="submit" disabled={!senhaVinculo || vinculando}>{vinculando ? <><span className="spin sm dark" />Vinculando</> : 'Autorizo vincular'}</button>
        <button type="button" className="ghost" disabled={vinculando} onClick={() => setPendente(null)}>Agora não</button>
      </form>
    </Folha>
  </div></div>;
}
