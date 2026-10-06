import { useEffect, useState } from 'react';
import { Check, KeyRound, Lock, LogOut, Printer, UserRound, X } from 'lucide-react';
import { contaPadrao } from '../services/entradaConta';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { desdeDe, useDisponibilidade } from '../utils/cracha';
import { fotoPadrao, primeiroNome, sugestoes } from '../utils/entrada';
import { useLargo } from '../utils/prototipo';
import { CascaEntrada, Campo, Erro, Escolhas, GoogleG, Impressao, LadoCracha, MiniCracha, Ok, Olho } from './entradaUi';
import { StatusUser } from './crachaUi';
import '../prototipo.css';

// Cadastro 2.0 portado do protótipo de movimento: conta já autenticada (Google ou e-mail confirmado)
// sem perfil. Username conferido no servidor, sugestões livres e o crachá impresso durante o cadastrar.
const MENSAGENS = {
  'auth/email-already-in-use': 'Este e-mail já tem senha em outra conta. Entre pela conta antiga e vincule o Google por lá.',
  'auth/credential-already-in-use': 'Esta credencial já pertence a outra conta. Entre pela conta antiga para vincular o Google.',
  'auth/weak-password': 'Escolha uma senha com pelo menos 6 caracteres.',
};

// Quando o username está em uso, confere as sugestões do nome e mostra só as livres.
function useSugestoesLivres(nome, ativo, atual, conferir) {
  const [r, setR] = useState({ chave: null, lista: [] });
  const chave = ativo ? `${nome}|${atual}` : null;
  useEffect(() => {
    if (!chave) return undefined;
    let vivo = true;
    Promise.all(sugestoes(nome).filter(s => s !== atual).map(c => conferir(c).then(x => (x.disponivel ? c : null)).catch(() => null)))
      .then(l => { if (vivo) setR({ chave, lista: l.filter(Boolean) }); });
    return () => { vivo = false; };
  }, [chave, nome, atual, conferir]);
  return r.chave === chave ? r.lista : [];
}

export default function Cadastro2({ usuario, onConcluido, conta = contaPadrao, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const google = usuario.providerData?.some(p => p.providerId === 'google.com');
  const nomeConta = usuario.displayName || usuario.nome || (usuario.email || '').split('@')[0] || 'Plantonista';
  const primeiro = primeiroNome(nomeConta);
  const [usarPrimeiro, setUsarPrimeiro] = useState(false);
  const [username, setUsername] = useState('');
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [foto, setFoto] = useState(null);
  const [senha, setSenha] = useState('');
  const [conf, setConf] = useState('');
  const [ver, setVer] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState('');
  const [senhaCriada, setSenhaCriada] = useState(false);
  const [impressao, setImpressao] = useState(null);
  const [perfilFinal, setPerfilFinal] = useState(null);
  const [desde] = useState(() => desdeDe(new Date()));
  const [conferir] = useState(() => u => servicoPerfil(usuario, 'verificarUsername', { username: u }));

  const precisaSenha = !senhaCriada && !usuario.providerData?.some(p => p.providerId === 'password');
  const u = usarPrimeiro ? primeiro : username;
  const check = useDisponibilidade(u, true, conferir);
  const livres = useSugestoesLivres(nomeConta, check === 'taken', u, conferir);
  const senhaOk = senha.length >= 6, confOk = conf.length > 0 && conf === senha;
  const pronto = check === 'ok' && !!titulo && !!materia && (!precisaSenha || (senhaOk && confOk));
  const fotoAtual = foto ?? fotoPadrao(titulo);
  const cracha = { p: { uid: usuario.uid, titulo, materiaPreferida: materia, pontuacaoTotal: 0, estatisticas: {} },
    email: usuario.email, nome: nomeConta, username: u || 'username', foto: fotoAtual, desde };

  const registrar = async (tentativa, passos) => {
    const comSenha = precisaSenha;
    setImpressao({ tentativa, passos, etapa: comSenha ? 0 : 1, erro: '' });
    try {
      if (comSenha) {
        await conta.criarSenha(usuario, senha);
        setSenhaCriada(true); setSenha(''); setConf('');
        setImpressao(i => ({ ...i, etapa: 1 }));
      }
      let perfil = await servicoPerfil(usuario, 'cadastrar', { titulo, materiaPreferida: materia, usarNomeGoogle: false, username: u });
      setImpressao(i => ({ ...i, etapa: 2 }));
      if (foto !== null && foto !== fotoPadrao(titulo)) perfil = await servicoPerfil(usuario, 'editarPerfil', { nome: perfil.nome, username: perfil.username, foto });
      setPerfilFinal(perfil);
      setImpressao(i => ({ ...i, etapa: passos.length }));
    } catch (falha) {
      setImpressao(i => ({ ...i, erro: MENSAGENS[falha.code] || falha.message || 'Não foi possível salvar o cadastro.' }));
    }
  };

  const enviar = e => {
    e.preventDefault();
    setTentou(true);
    if (!pronto) { setErro(check !== 'ok' ? 'Escolha um username disponível.' : 'Preencha todos os campos do prontuário corretamente.'); return; }
    setErro('');
    const passos = [precisaSenha ? (google ? 'Vinculando senha à conta Google' : 'Vinculando senha à conta') : (google ? 'Conta Google conferida' : 'Conta conferida'), 'Registrando no prontuário', 'Imprimindo crachá'];
    registrar((impressao?.tentativa || 0) + 1, passos);
  };

  const lead = google ? 'Seu nome e e-mail já vieram da conta. Falta escolher como você aparece no plantão.' : 'Seu e-mail foi confirmado. Falta escolher como você aparece no plantão.';
  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr au-scr r-cadgoogle">
    {!web && <div className="topbar"><h1><small>{google && <GoogleG />}{google ? 'Conta Google conectada' : 'Conta confirmada'}</small>Cadastro 2.0</h1></div>}
    <CascaEntrada web={web} lado={<LadoCracha cracha={cracha} />}>
      {web && <div className="au-head"><span className="kicker">cacoMed · Cadastro 2.0</span><h1>Vamos terminar seu cadastro</h1><p>{lead}</p></div>}
      {!web && <p className="au-lead">{lead}</p>}
      <div className="au-acct">
        <span className="au-acct-av" aria-hidden="true">{nomeConta[0]}</span>
        <span className="au-acct-tx"><b>{nomeConta}</b><small>{usuario.email}</small></span>
        {google && <span className="au-gtag"><GoogleG />Google</span>}
      </div>
      {!web && <MiniCracha cracha={cracha} />}
      <form className="au-card" onSubmit={enviar} noValidate>
        <Erro texto={erro} />
        {primeiro && <label className="au-check" htmlFor="cg-google">
          <input id="cg-google" type="checkbox" checked={usarPrimeiro} onChange={e => setUsarPrimeiro(e.target.checked)} />
          <span className="box"><Check size={12} strokeWidth={3} /></span>
          {google ? 'Usar meu primeiro nome do Google' : 'Usar meu primeiro nome'} <b className="mono">@{primeiro}</b>
        </label>}
        <Campo id="cg-user" label={usarPrimeiro ? 'Username (do seu nome)' : 'Ou escolha seu username'} icon={UserRound}
          estado={check === 'ok' ? 'good' : check === 'taken' || check === 'invalid' || (tentou && !u) ? 'bad' : ''}
          ajuda={<StatusUser check={check} />}>
          <span className="at">@</span>
          <input id="cg-user" autoComplete="off" spellCheck={false} maxLength={20} disabled={usarPrimeiro} placeholder="seu.username" value={u} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} />
          {check === 'checking' ? <span className="spin sm" aria-label="Conferindo" /> : check === 'ok' ? <span className="okdot"><Check size={11} strokeWidth={3} /></span> : null}
        </Campo>
        {livres.length > 0 && <div className="au-sugs"><span>Livres agora:</span>{livres.map(s => <button key={s} type="button" className="au-sug mono" onClick={() => { setUsarPrimeiro(false); setUsername(s); }}>@{s}</button>)}</div>}
        <Escolhas titulo={titulo} setTitulo={setTitulo} materia={materia} setMateria={setMateria} foto={fotoAtual} setFoto={setFoto} tentou={tentou} />
        {precisaSenha && <div className="au-pw">
          <span className="au-pw-h"><KeyRound size={15} /><b>Crie uma senha</b></span>
          <p>Para também entrar pelo formulário de e-mail. Ela fica no serviço de autenticação, não no seu perfil.</p>
          <div className="au-two">
            <Campo id="cg-senha" label="Senha" icon={Lock} estado={senhaOk ? 'good' : tentou ? 'bad' : ''} ajuda={<Ok on={senhaOk}>6 caracteres ou mais</Ok>}>
              <input id="cg-senha" type={ver ? 'text' : 'password'} autoComplete="new-password" value={senha} onChange={e => setSenha(e.target.value)} />
              <Olho ver={ver} set={setVer} />
            </Campo>
            <Campo id="cg-conf" label="Confirmar senha" icon={Lock} estado={confOk ? 'good' : (conf && !confOk) || tentou ? 'bad' : ''} ajuda={conf && !confOk ? <span className="cr-st no"><X size={13} />As senhas não coincidem</span> : <Ok on={confOk}>Senhas iguais</Ok>}>
              <input id="cg-conf" type={ver ? 'text' : 'password'} autoComplete="new-password" value={conf} onChange={e => setConf(e.target.value)} />
            </Campo>
          </div>
        </div>}
        <button className="primary" type="submit" disabled={Boolean(impressao && !impressao.erro)}><Printer />Concluir e emitir crachá</button>
      </form>
      <button className="au-out" onClick={() => conta.sair()}><LogOut size={15} />{google ? 'Sair da conta Google' : 'Sair da conta'}</button>
    </CascaEntrada>
    {impressao && <Impressao cracha={cracha} passos={impressao.passos} etapa={impressao.etapa} erro={impressao.erro} tentativa={impressao.tentativa}
      aoTentar={() => registrar(impressao.tentativa + 1, impressao.passos)} aoRevisar={() => setImpressao(null)} aoEntrar={() => onConcluido(perfilFinal)} />}
  </div></div>;
}
