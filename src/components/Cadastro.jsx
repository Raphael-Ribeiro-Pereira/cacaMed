import { useState } from 'react';
import { Check, ChevronLeft, Lock, Mail, Printer, UserRound, X } from 'lucide-react';
import { contaPadrao } from '../services/entradaConta';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { desdeDe } from '../utils/cracha';
import { emailOk, fotoPadrao, primeiroNome, sugestoes } from '../utils/entrada';
import { criarMissoesDiarias, dataLocalHoje } from '../utils/missoes';
import { useLargo } from '../utils/prototipo';
import { CascaEntrada, Campo, Erro, Escolhas, GoogleG, Impressao, LadoCracha, MiniCracha, Ok, Olho } from './entradaUi';
import '../prototipo.css';

// Cadastro por e-mail portado do protótipo de movimento. Depois de criar a credencial, o crachá
// sai da impressora enquanto o servidor grava o perfil; se falhar, o formulário continua preenchido.
const PERFIL_NA_API = ['planilha', 'supabase'].includes(import.meta.env.VITE_FONTE_DADOS);
const PASSOS = ['Criando credencial', 'Registrando no prontuário', 'Imprimindo crachá'];

export default function Cadastro({ setTelaAtual, onConcluido, aoCriarConta = () => {}, conta = contaPadrao, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  // Com a API (ou um serviço injetado na homologação), o perfil vai para o servidor; sem ela, para o Firestore antigo.
  const viaApi = PERFIL_NA_API || servicoPerfil !== chamarPerfilPlanilha;
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [conf, setConf] = useState('');
  const [ver, setVer] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [foto, setFoto] = useState(null);
  const [tentou, setTentou] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [contaCriada, setContaCriada] = useState(null);
  const [usernameFinal, setUsernameFinal] = useState('');
  const [impressao, setImpressao] = useState(null);
  const [perfilFinal, setPerfilFinal] = useState(null);
  const [desde] = useState(() => desdeDe(new Date()));
  const [google, setGoogle] = useState(false);

  const ok = { nome: nome.trim().length >= 3, email: emailOk(email), senha: senha.length >= 6, conf: conf.length > 0 && conf === senha };
  const sugerido = sugestoes(nome)[0] ?? '';
  const pronto = ok.nome && ok.email && ok.senha && ok.conf && !!titulo && !!materia;
  const fotoAtual = foto ?? fotoPadrao(titulo);
  const cracha = { p: { uid: contaCriada?.uid, titulo, materiaPreferida: materia, pontuacaoTotal: 0, estatisticas: {} },
    email: email.trim().toLowerCase() || 'seu.email@exemplo.com', nome: nome.trim() || 'Seu nome', username: usernameFinal || sugerido || 'username', foto: fotoAtual, desde };
  const est = (k, v) => (ok[k] ? 'good' : (tentou && !ok[k]) || (k === 'conf' && v && !ok.conf) ? 'bad' : '');

  // O primeiro username livre entre as sugestões do nome; sem conferência possível, fica a primeira.
  const escolherUsername = async user => {
    const candidatos = [...sugestoes(nome), `${primeiroNome(nome) || 'plantonista'}${Math.floor(Math.random() * 900) + 100}`];
    for (const c of candidatos) {
      try {
        if ((await servicoPerfil(user, 'verificarUsername', { username: c })).disponivel) return c;
      } catch {
        return candidatos[0];
      }
    }
    return candidatos.at(-1);
  };

  const registrar = async (user, tentativa) => {
    setImpressao({ tentativa, etapa: 1, erro: '' });
    try {
      let perfil;
      if (viaApi) {
        const username = usernameFinal || await escolherUsername(user);
        setUsernameFinal(username);
        perfil = await servicoPerfil(user, 'cadastrar', { titulo, materiaPreferida: materia, username });
        setImpressao(i => ({ ...i, etapa: 2 }));
        if (foto !== null && foto !== fotoPadrao(titulo)) perfil = await servicoPerfil(user, 'editarPerfil', { nome: perfil.nome, username: perfil.username, foto });
      } else {
        const username = primeiroNome(nome) + Math.floor(Math.random() * 1000);
        perfil = { nome: nome.trim(), email: email.trim(), username, titulo, especialidade: materia, foto: fotoAtual, pontuacaoTotal: 0, xpTopicos: {},
          tutorialCruzadinhasConcluido: false, dataUltimoLogin: dataLocalHoje(), missoesDiarias: criarMissoesDiarias(), criadoEm: new Date().toISOString() };
        setUsernameFinal(username);
        await conta.gravarPerfilAntigo(user, perfil);
        setImpressao(i => ({ ...i, etapa: 2 }));
      }
      setPerfilFinal(perfil);
      setImpressao(i => ({ ...i, etapa: PASSOS.length }));
    } catch {
      setImpressao(i => ({ ...i, erro: 'O servidor não respondeu. Seus dados continuam no formulário.' }));
    }
  };

  const enviar = async e => {
    e.preventDefault();
    setTentou(true);
    if (!pronto) { setErro('Preencha todos os campos do prontuário corretamente.'); return; }
    setErro('');
    let user = contaCriada;
    if (!user) {
      setBusy(true);
      aoCriarConta(true);
      try {
        const r = await conta.criarConta({ nome: nome.trim(), email: email.trim(), senha });
        if (r.confirmarEmail) {
          aoCriarConta(false);
          setSenha(''); setConf('');
          setAviso('Confira seu e-mail para confirmar a conta. Depois entre para concluir seu cadastro.');
          return;
        }
        user = r.user;
        setContaCriada(user);
      } catch (falha) {
        aoCriarConta(false);
        setErro(falha.code === 'auth/email-already-in-use' ? 'Este e-mail já está escalado para outro plantão.' : 'Erro no sistema hospitalar. Tente novamente.');
        return;
      } finally {
        setBusy(false);
      }
    }
    registrar(user, (impressao?.tentativa || 0) + 1);
  };

  // Conta nova do Google segue para o Cadastro 2.0 pelo App; e-mail que já tem senha precisa vincular pelo login.
  const cadastrarComGoogle = async () => {
    if (google || busy || contaCriada) return;
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

  // Com a credencial já criada, voltar encerra a sessão: o cadastro termina no próximo login (Cadastro 2.0).
  const voltar = async () => {
    if (contaCriada) { aoCriarConta(false); await conta.sair(); }
    setTelaAtual('login');
  };

  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr au-scr r-cadastro">
    {!web && <div className="topbar"><button className="icon-btn" onClick={voltar} aria-label="Voltar ao login"><ChevronLeft /></button><h1><small>Recepção · novo plantonista</small>Cadastro</h1></div>}
    <CascaEntrada web={web} lado={<LadoCracha cracha={cracha} />}>
      {web && <button className="w-link au-back" onClick={voltar}><ChevronLeft size={16} />Voltar ao login</button>}
      {web && <div className="au-head"><span className="kicker">Recepção · novo plantonista</span><h1>Faça seu crachá</h1><p>Leva um minuto. O crachá ao lado muda enquanto você preenche.</p></div>}
      {!web && <MiniCracha cracha={cracha} />}
      <form className="au-card" onSubmit={enviar} noValidate>
        <Erro texto={erro} />
        {aviso && <p className="au-sent" role="status"><Check size={16} />{aviso}</p>}
        <Campo id="cd-nome" label="Nome completo" icon={UserRound} estado={est('nome', nome)} ajuda={sugerido || usernameFinal ? <span className="cr-st chk">Seu username: <b className="mono">@{usernameFinal || sugerido}</b></span> : null}>
          <input id="cd-nome" autoComplete="name" maxLength={60} placeholder="Como aparece no crachá" value={nome} onChange={e => setNome(e.target.value)} />
          {ok.nome && <span className="okdot"><Check size={11} strokeWidth={3} /></span>}
        </Campo>
        <Campo id="cd-mail" label="E-mail profissional" icon={Mail} estado={est('email', email)}>
          <input id="cd-mail" type="email" inputMode="email" autoComplete="email" spellCheck={false} placeholder="doutor@cacomed.com" readOnly={Boolean(contaCriada)} value={email} onChange={e => setEmail(e.target.value)} />
          {ok.email && <span className="okdot"><Check size={11} strokeWidth={3} /></span>}
        </Campo>
        <div className="au-two">
          <Campo id="cd-senha" label="Senha" icon={Lock} estado={est('senha', senha)} ajuda={<Ok on={ok.senha}>6 caracteres ou mais</Ok>}>
            <input id="cd-senha" type={ver ? 'text' : 'password'} autoComplete="new-password" value={senha} onChange={e => setSenha(e.target.value)} />
            <Olho ver={ver} set={setVer} />
          </Campo>
          <Campo id="cd-conf" label="Confirmar senha" icon={Lock} estado={est('conf', conf)} ajuda={conf && !ok.conf ? <span className="cr-st no"><X size={13} />As senhas não coincidem</span> : <Ok on={ok.conf}>Senhas iguais</Ok>}>
            <input id="cd-conf" type={ver ? 'text' : 'password'} autoComplete="new-password" value={conf} onChange={e => setConf(e.target.value)} />
          </Campo>
        </div>
        <Escolhas titulo={titulo} setTitulo={setTitulo} materia={materia} setMateria={setMateria} foto={fotoAtual} setFoto={setFoto} tentou={tentou} />
        <button className="primary" type="submit" disabled={busy || google}>{busy ? <><span className="spin sm dark" />Criando credencial</> : <><Printer />Emitir meu crachá</>}</button>
        {viaApi && !contaCriada && <>
          <div className="au-or"><span>ou</span></div>
          <button type="button" className="au-google" onClick={cadastrarComGoogle} disabled={google || busy}>
            {google ? <><span className="spin sm" />Aguardando o Google</> : <><GoogleG />Cadastrar com Google</>}
          </button>
        </>}
      </form>
      <p className="au-foot">Já tem crachá? <button className="w-link" onClick={voltar}>Entrar no plantão</button></p>
    </CascaEntrada>
    {impressao && <Impressao cracha={cracha} passos={PASSOS} etapa={impressao.etapa} erro={impressao.erro} tentativa={impressao.tentativa}
      aoTentar={() => registrar(contaCriada, impressao.tentativa + 1)} aoRevisar={() => setImpressao(null)}
      aoEntrar={() => { aoCriarConta(false); onConcluido(perfilFinal); }} />}
  </div></div>;
}
