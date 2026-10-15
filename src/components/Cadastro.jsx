import { useEffect, useState } from 'react';
import { Check, ChevronLeft, Lock, Mail, Printer, UserRound, X } from 'lucide-react';
import { contaPadrao } from '../services/entradaConta';
import { desdeDe } from '../utils/cracha';
import { emailOk, fotoPadrao, sugestoes } from '../utils/entrada';
import { useLargo } from '../utils/prototipo';
import CodigoEmail from './CodigoEmail';
import { CascaEntrada, Campo, Erro, GoogleG, LadoCracha, MiniCracha, Ok, Olho } from './entradaUi';
import '../prototipo.css';
import { SENHA_MINIMA } from '../utils/senha';

// Cadastro por e-mail, passo 1 de 3 (decidido em 15/10/2026): nome, e-mail e senha. O Supabase manda um código
// de 6 números; ao acertar, a conta entra e o App abre o Cadastro 2.0 (título, curso, faculdade, matéria e foto).
const MENSAGENS_CODIGO = {
  otp_expired: 'Código errado ou vencido. Confira o e-mail ou peça um novo.',
  over_request_rate_limit: 'Muitas tentativas em pouco tempo. Espere um pouco e tente de novo.',
  over_email_send_rate_limit: 'Muitas tentativas em pouco tempo. Espere um pouco e tente de novo.',
};

export default function Cadastro({ setTelaAtual, onContaConfirmada, aoCriarConta = () => {}, conta = contaPadrao }) {
  const web = useLargo();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [conf, setConf] = useState('');
  const [ver, setVer] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  // E-mail para o qual o código foi enviado: troca o formulário pela tela do código.
  const [aguardando, setAguardando] = useState('');
  const [reenvio, setReenvio] = useState({ espera: 0, msg: '' });
  const [desde] = useState(() => desdeDe(new Date()));
  const [google, setGoogle] = useState(false);

  const ok = { nome: nome.trim().length >= 3, email: emailOk(email), senha: senha.length >= SENHA_MINIMA, conf: conf.length > 0 && conf === senha };
  const pronto = ok.nome && ok.email && ok.senha && ok.conf;
  const cracha = { p: { titulo: '', pontuacaoTotal: 0, estatisticas: {} },
    email: email.trim().toLowerCase() || 'seu.email@exemplo.com', nome: nome.trim() || 'Seu nome', username: sugestoes(nome)[0] || 'username', foto: fotoPadrao(''), desde };
  useEffect(() => {
    if (reenvio.espera <= 0) return undefined;
    const t = setTimeout(() => setReenvio(r => ({ ...r, espera: r.espera - 1 })), 1000);
    return () => clearTimeout(t);
  }, [reenvio.espera]);
  const reenviar = async () => {
    if (reenvio.espera > 0) return;
    setReenvio({ espera: 60, msg: '' });
    try { await conta.reenviarConfirmacao?.(aguardando); setReenvio({ espera: 60, msg: 'Código novo enviado. Confira também a caixa de spam.' }); }
    catch { setReenvio({ espera: 60, msg: 'Não foi possível reenviar agora. Tente de novo em instantes.' }); }
  };
  const est = (k, v) => (ok[k] ? 'good' : (tentou && !ok[k]) || (k === 'conf' && v && !ok.conf) ? 'bad' : '');

  // A sessão nova não troca de tela enquanto a animação do acerto roda; o App segue quando ela termina.
  const conferirCodigo = async codigo => {
    aoCriarConta(true);
    try {
      await conta.confirmarCodigo(aguardando, codigo);
    } catch (falha) {
      aoCriarConta(false);
      throw new Error(MENSAGENS_CODIGO[falha.code] || (falha.status === 429 ? MENSAGENS_CODIGO.over_request_rate_limit : 'Não foi possível conferir o código. Confira a conexão e tente de novo.'));
    }
  };

  const enviar = async e => {
    e.preventDefault();
    setTentou(true);
    if (!pronto) { setErro('Preencha todos os campos do prontuário corretamente.'); return; }
    setErro('');
    setBusy(true);
    aoCriarConta(true);
    try {
      const r = await conta.criarConta({ nome: nome.trim(), email: email.trim(), senha });
      if (r.confirmarEmail) {
        aoCriarConta(false);
        setAguardando(email.trim());
        return;
      }
      // Sem confirmação (autenticação antiga): a conta já entrou e segue direto para o crachá.
      onContaConfirmada();
    } catch (falha) {
      aoCriarConta(false);
      setErro(falha.code === 'auth/email-already-in-use' ? 'Este e-mail já está escalado para outro plantão. Entre pela tela de login ou com o Google.' : 'Erro no sistema hospitalar. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  // Conta nova do Google segue para o Cadastro 2.0 pelo App; e-mail que já tem senha precisa vincular pelo login.
  const cadastrarComGoogle = async () => {
    if (google || busy) return;
    setErro(''); setGoogle(true);
    try {
      const r = await conta.entrarComGoogle();
      if (r?.pendente) setErro('Este e-mail já tem conta por senha. Entre pela tela de login para vincular o Google.');
    } catch (falha) {
      if (falha.code !== 'auth/popup-closed-by-user') setErro('Não foi possível entrar com Google. Tente novamente.');
    } finally {
      setGoogle(false);
    }
  };

  const voltar = () => setTelaAtual('login');

  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr au-scr r-cadastro">
    {!web && <div className="topbar"><button className="icon-btn" onClick={voltar} aria-label="Voltar ao login"><ChevronLeft /></button><h1><small>Recepção · novo plantonista</small>Cadastro</h1></div>}
    <CascaEntrada web={web} lado={<LadoCracha cracha={cracha} />}>
      {web && <button className="w-link au-back" onClick={voltar}><ChevronLeft size={16} />Voltar ao login</button>}
      {web && <div className="au-head"><span className="kicker">Recepção · novo plantonista</span><h1>Faça seu crachá</h1><p>Leva um minuto: seus dados, o código do e-mail e o seu crachá.</p></div>}
      {!web && <MiniCracha cracha={cracha} />}
      {aguardando ? <div className="au-card" role="group" aria-label="Confirmar e-mail">
        <p className="au-sent"><Mail size={16} />Confirme seu e-mail</p>
        <p className="au-lead">Digite o código de 6 números que enviamos para <b>{aguardando}</b>. Se não achar, olhe a caixa de spam.</p>
        <CodigoEmail conferir={conferirCodigo} aoConfirmar={onContaConfirmada} />
        <button className="ghost" type="button" onClick={reenviar} disabled={reenvio.espera > 0}>{reenvio.espera > 0 ? `Reenviar código em ${reenvio.espera}s` : 'Reenviar código'}</button>
        {reenvio.msg && <p className="au-lead" aria-live="polite">{reenvio.msg}</p>}
        <button type="button" className="w-link" onClick={() => { setAguardando(''); setReenvio({ espera: 0, msg: '' }); }}>Usei o e-mail errado</button>
      </div> : <form className="au-card" onSubmit={enviar} noValidate>
        <Erro texto={erro} />
        <Campo id="cd-nome" label="Nome completo" icon={UserRound} estado={est('nome', nome)}>
          <input id="cd-nome" autoComplete="name" maxLength={60} placeholder="Como aparece no crachá" value={nome} onChange={e => setNome(e.target.value)} />
          {ok.nome && <span className="okdot"><Check size={11} strokeWidth={3} /></span>}
        </Campo>
        <Campo id="cd-mail" label="E-mail profissional" icon={Mail} estado={est('email', email)}>
          <input id="cd-mail" type="email" inputMode="email" autoComplete="email" spellCheck={false} placeholder="doutor@cacomed.com" value={email} onChange={e => setEmail(e.target.value)} />
          {ok.email && <span className="okdot"><Check size={11} strokeWidth={3} /></span>}
        </Campo>
        <div className="au-two">
          <Campo id="cd-senha" label="Senha" icon={Lock} estado={est('senha', senha)} ajuda={<Ok on={ok.senha}>{SENHA_MINIMA} caracteres ou mais</Ok>}>
            <input id="cd-senha" type={ver ? 'text' : 'password'} autoComplete="new-password" value={senha} onChange={e => setSenha(e.target.value)} />
            <Olho ver={ver} set={setVer} />
          </Campo>
          <Campo id="cd-conf" label="Confirmar senha" icon={Lock} estado={est('conf', conf)} ajuda={conf && !ok.conf ? <span className="cr-st no"><X size={13} />As senhas não coincidem</span> : <Ok on={ok.conf}>Senhas iguais</Ok>}>
            <input id="cd-conf" type={ver ? 'text' : 'password'} autoComplete="new-password" value={conf} onChange={e => setConf(e.target.value)} />
          </Campo>
        </div>
        <button className="primary" type="submit" disabled={busy || google}>{busy ? <><span className="spin sm dark" />Criando credencial</> : <><Printer />Receber o código</>}</button>
        <div className="au-or"><span>ou</span></div>
        <button type="button" className="au-google" onClick={cadastrarComGoogle} disabled={google || busy}>
          {google ? <><span className="spin sm" />Aguardando o Google</> : <><GoogleG />Cadastrar com Google</>}
        </button>
      </form>}
      <p className="au-foot">Já tem crachá? <button className="w-link" onClick={voltar}>Entrar no plantão</button></p>
    </CascaEntrada>
  </div></div>;
}
