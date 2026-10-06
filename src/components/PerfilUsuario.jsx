import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Brain, Check, ChevronLeft, Crown as CoroaIco, Grid3x3, HeartPulse, KeyRound, Lock, LogOut, Mail, Pencil, RotateCw, Save, ScanLine, Shield, Stethoscope, Swords, UserRound } from 'lucide-react';
import { EmailAuthProvider, linkWithCredential, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { supabase } from '../supabase';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { DOENCAS } from '../utils/batalha';
import { tituloEpico } from '../utils/coroas';
import { desdeDe, especialidade, matriculaDe, useDisponibilidade } from '../utils/cracha';
import { FOTOS, fotoDoPerfil } from '../utils/fotosCracha';
import { animar, fmt, useLargo } from '../utils/prototipo';
import { Retrato } from './batalhaArte';
import { CrachaFrente, QR, StatusUser } from './crachaUi';
import { FlameIcon, MiniEcg, Tabbar } from './prototipoUi';
import '../prototipo.css';

// Crachá do plantonista, portado do protótipo de movimento: frente e verso, prévia ao vivo,
// username conferido no servidor e salvamento otimista que volta atrás se a gravação falhar.
// Firestore e saída da conta carregam sob demanda: a tela abre sem inicializar o Firebase.
const sairDaContaReal = async () => (await import('../services/sairDaConta')).sairDaConta();
const PLANILHA_OU_SUPABASE = ['planilha', 'supabase'].includes(import.meta.env.VITE_FONTE_DADOS);
export default function PerfilUsuario({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha, aoSair = sairDaContaReal }) {
  const web = useLargo();
  const p = dadosUsuario || {};
  const email = usuario?.email || p.email || '—';
  const fotoAtual = fotoDoPerfil(p);
  const [username, setUsername] = useState(p.username || '');
  const [nome, setNome] = useState(p.nome || p.username || '');
  const [foto, setFoto] = useState(fotoAtual);
  const [save, setSave] = useState('idle');
  const [erroSalvar, setErroSalvar] = useState('');
  const [flip, setFlip] = useState(false);
  const [sheet, setSheet] = useState(null);
  const card = useRef(null);
  const ultimoPedido = useRef(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirma, setSenhaConfirma] = useState('');
  const [senhaErro, setSenhaErro] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [senhaVinculada, setSenhaVinculada] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const possuiSenha = senhaVinculada || usuario?.providerData?.some(provedor => provedor.providerId === 'password');

  const [esp, espXp] = especialidade(p);
  const [titulo, , corTitulo] = tituloEpico(esp);
  const userMudou = username !== (p.username || '');
  const dirty = userMudou || nome !== (p.nome || p.username || '') || foto !== fotoAtual;
  // Firestore antigo não confere username; com a API (ou um serviço injetado na homologação), confere.
  const viaServico = PLANILHA_OU_SUPABASE || servicoPerfil !== chamarPerfilPlanilha;
  const conferir = viaServico ? u => servicoPerfil(usuario, 'verificarUsername', { username: u }) : null;
  const [conferirEstavel] = useState(() => conferir);
  const check = useDisponibilidade(username, userMudou, conferirEstavel);
  const podeSalvar = dirty && nome.trim().length >= 2 && (!userMudou || check === 'ok') && save !== 'saving';
  const desde = desdeDe(p.criadoEm || usuario?.metadata?.creationTime);
  const matricula = matriculaDe(p.uid || username);

  useEffect(() => {
    if (!sheet) return undefined;
    const tecla = e => { if (e.key === 'Escape' && !salvandoSenha && !saindo) setSheet(null); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [sheet, salvandoSenha, saindo]);

  const salvar = async () => {
    if (!podeSalvar || !usuario?.uid) return;
    const novo = { username, nome: nome.trim(), foto };
    const antes = { username: p.username, nome: p.nome, foto: p.foto };
    ultimoPedido.current = novo;
    setErroSalvar('');
    // Otimista: crachá e prévias já mostram os dados novos enquanto o servidor grava.
    setDadosUsuario(prev => ({ ...prev, ...novo }));
    setSave('saving');
    try {
      if (viaServico) {
        const perfil = await servicoPerfil(usuario, 'editarPerfil', novo);
        if (ultimoPedido.current === novo) setDadosUsuario(perfil);
      } else {
        const [{ db }, { doc, updateDoc }] = await Promise.all([import('../firebase'), import('firebase/firestore')]);
        await updateDoc(doc(db, 'usuarios', usuario.uid), novo);
      }
      setSave('ok');
      setTimeout(() => setSave(s => (s === 'ok' ? 'idle' : s)), 2400);
    } catch (falha) {
      setSave('err');
      setErroSalvar(falha.message || 'O servidor não respondeu.');
      setDadosUsuario(prev => ({ ...prev, ...antes }));
    }
  };

  const tilt = e => {
    if (!web || !animar() || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.current.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
    card.current.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
    card.current.style.setProperty('--mx', `${x * 100}%`);
    card.current.style.setProperty('--my', `${y * 100}%`);
  };
  const solta = () => { card.current?.style.setProperty('--rx', '0deg'); card.current?.style.setProperty('--ry', '0deg'); };

  const trocarSenha = async () => {
    if ((possuiSenha && !senhaAtual) || senhaNova.length < 6 || salvandoSenha) return;
    if (!possuiSenha && senhaNova !== senhaConfirma) { setSenhaErro('As senhas não coincidem.'); return; }
    if (possuiSenha && senhaAtual === senhaNova) { setSenhaErro('A nova senha precisa ser diferente da atual.'); return; }
    setSenhaErro('');
    setSalvandoSenha(true);
    try {
      if (usuario.source === 'supabase') {
        if (possuiSenha) {
          const verificacao = await supabase.auth.signInWithPassword({ email: usuario.email, password: senhaAtual });
          if (verificacao.error || verificacao.data.user?.id !== usuario.authId) throw new Error('Senha atual inválida.');
        }
        await chamarPerfilPlanilha(usuario, 'definirSenha', { senha: senhaNova });
        setSenhaVinculada(true);
      } else if (possuiSenha) {
        await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, senhaAtual));
        await updatePassword(usuario, senhaNova);
      } else {
        await linkWithCredential(usuario, EmailAuthProvider.credential(usuario.email, senhaNova));
        setSenhaVinculada(true);
      }
      setSheet(null); setSenhaAtual(''); setSenhaNova(''); setSenhaConfirma('');
    } catch (falha) {
      setSenhaErro(falha.code === 'auth/email-already-in-use'
        ? 'Este e-mail já possui uma conta por senha. Entre nela e vincule o Google antes de criar outra senha.'
        : possuiSenha ? 'Não foi possível trocar a senha. Confira a senha atual e tente novamente.' : 'Não foi possível criar a senha. Entre novamente com Google e tente outra vez.');
    } finally {
      setSalvandoSenha(false);
    }
  };
  const sair = async () => {
    setSaindo(true);
    try { await aoSair(); setTelaAtual('login'); } catch (falha) { console.error('Erro ao sair:', falha); setSaindo(false); }
  };

  const nomeCard = nome.trim() || p.nome || '';
  const revisao = p.revisao?.resumo;
  const admin = p.role === 'admin';
  const acessos = [
    ['Cruzadinhas', 'Livre · 2 tickets por partida', Grid3x3, true],
    ['Quiz e Verdadeiro ou mentira', 'Livre', ScanLine, true],
    ['DDX · Casos clínicos', `1 ticket por caso · você tem ${Number(p.tickets) || 0}`, HeartPulse, true],
    ['Batalha diagnóstica', admin ? `Piloto · ${(p.batalha?.descobertas || []).length}/${DOENCAS.length} doenças` : 'Em revisão médica', Swords, admin],
    ['Revisão Inteligente', admin ? (revisao ? `${revisao.disponiveis} itens disponíveis` : 'Fila consultada ao abrir') : 'Em piloto', Brain, admin],
    ['Coroas por matéria', 'Ranking semanal · fecha no domingo', CoroaIco, true],
  ];

  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr">
    <div className="topbar">
      {web && <button className="icon-btn" onClick={() => setTelaAtual('menu')} aria-label="Voltar ao centro de comando"><ChevronLeft /></button>}
      <h1><small><Shield size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 5 }} />Crachá de acesso · UTI Central</small>Identificação do plantonista</h1>
      <span className="cr-ecg"><MiniEcg /></span>
    </div>
    <div className="scroll cr-grid">
      <div className="cr-left">
        <div className="cr-lanyard" aria-hidden="true"><span className="cr-strap" /><span className="cr-clip" /></div>
        <div ref={card} className={`cr-card ${flip ? 'flip' : ''}`} onPointerMove={tilt} onPointerLeave={solta}>
          <div className="cr-inner">
            <CrachaFrente p={p} email={email} nome={nomeCard} username={username || p.username} foto={foto} desde={desde} oculto={flip} />
            <div className="cr-face cr-back" aria-hidden={!flip}>
              <div className="cr-slot" />
              <div className="cr-top"><span className="cr-org">caco<b>Med</b><small>VERSO DO CRACHÁ</small></span><span className="cr-access">VALIDADE<br /><b>TEMPORADA {new Date().getFullYear()}</b></span></div>
              <span className="cr-sec">AUTORIZAÇÕES DE ACESSO</span>
              <div className="cr-acc">{acessos.map(([t, d, icone, ok]) => { const Ic = icone; return <div key={t} className={ok ? 'ok' : 'no'}><span className="ic"><Ic size={14} /></span><span><b>{t}</b><small>{d}</small></span>{ok ? <Check size={15} className="st" /> : <Lock size={13} className="st" />}</div>; })}</div>
              <div className="cr-back-row">
                <QR v={matricula} />
                <div><span className="cr-sec">PLANTONISTA</span><b>{nomeCard}</b><small className="mono">{matricula}</small><span className="cr-streak"><FlameIcon size={14} />{Number(p.estatisticasGerais?.streakAtual) || 0} cruzadinhas seguidas</span></div>
              </div>
              <p className="cr-legal">Uso pessoal e intransferível. Em caso de perda, devolver à preceptoria do cacoMed.</p>
              <span className="cr-holo" />
            </div>
          </div>
        </div>
        <button className="cr-flipbtn" onClick={() => setFlip(v => !v)}><RotateCw size={14} />{flip ? 'Ver a frente' : 'Virar o crachá'}</button>
      </div>

      <section className="cr-form">
        <div className="cr-fh"><Pencil size={15} /><h2>Dados do prontuário</h2>{dirty && <span className="cr-prev">Prévia no crachá</span>}</div>
        <label className="cr-f" htmlFor="pf-user"><span className="cr-l"><UserRound size={12} />Username</span>
          <span className={`cr-in ${check === 'taken' || check === 'invalid' ? 'bad' : check === 'ok' ? 'good' : ''}`}>
            <span className="at">@</span>
            <input id="pf-user" value={username} maxLength={20} autoComplete="off" spellCheck={false} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} />
            {check === 'checking' ? <span className="spin sm" aria-label="Conferindo" /> : (check === 'ok' || (!userMudou && username)) ? <span className="okdot"><Check size={11} strokeWidth={3} /></span> : null}
          </span>
          <span className="cr-help" aria-live="polite"><StatusUser check={check} /></span>
        </label>
        <label className="cr-f" htmlFor="pf-nome"><span className="cr-l"><Stethoscope size={12} />Nome completo</span>
          <span className="cr-in"><input id="pf-nome" value={nome} maxLength={80} onChange={e => setNome(e.target.value)} /></span>
        </label>
        <label className="cr-f" htmlFor="pf-mail"><span className="cr-l"><Mail size={12} />E-mail (imutável)</span>
          <span className="cr-in ro"><input id="pf-mail" value={email} readOnly /><span className="tag mono">FIXO</span></span>
        </label>
        <div className="cr-f"><span className="cr-l">Especialização</span>
          <span className="cr-in ro esp"><Stethoscope size={16} /><b>{esp}</b><small>{fmt(espXp)} XP · título <em style={{ color: corTitulo }}>{titulo}</em></small></span>
        </div>
        <div className="cr-f"><span className="cr-l">Foto do crachá</span>
          <div className="cr-fotos" role="radiogroup" aria-label="Foto do crachá">
            {FOTOS.map((ft, i) => <button key={ft.id} role="radio" aria-checked={foto === i} className={foto === i ? 'on' : ''} onClick={() => setFoto(i)} title={ft.nome}><Retrato f={ft} /></button>)}
          </div>
        </div>
        <div className="cr-actions">
          <button className={`primary cr-save s-${save}`} disabled={!podeSalvar && save !== 'saving'} onClick={salvar}>
            {save === 'saving' ? <><MiniEcg />Registrando no prontuário</> : save === 'ok' && !dirty ? <><Check size={17} />Salvo no prontuário</> : <><Save size={17} />Salvar alterações</>}
          </button>
          {save === 'err' && <p className="cr-err" role="alert">{erroSalvar} O crachá voltou ao que estava. <button className="w-link" onClick={salvar}>Tentar de novo</button></p>}
          <div className="cr-two">
            <button className="cr-btn" onClick={() => { setSenhaErro(''); setSheet('senha'); }}><KeyRound size={15} />{possuiSenha ? 'Mudar senha' : 'Criar senha'}</button>
            <button className="cr-btn danger" onClick={() => setSheet('sair')}><LogOut size={15} />Sair da conta</button>
          </div>
          <button className="w-link" style={{ justifySelf: 'center' }} onClick={() => setTelaAtual('estatisticas')}><BarChart3 size={15} />Ver estatísticas completas</button>
        </div>
      </section>
    </div>
    <div className="cr-brand mono" aria-hidden="true">— cacoMed · terminal de plantão —</div>
    {!web && <Tabbar on="perfil" ir={setTelaAtual} />}
    <AnimatePresence>
      {sheet && <>
        <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !salvandoSenha && !saindo && setSheet(null)} />
        <motion.div key="sh" className="sheet" role="dialog" aria-modal="true" aria-labelledby="pf-sheet-t" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
          {sheet === 'senha' ? <>
            <span className="cr-key"><KeyRound size={20} /></span>
            <h3 id="pf-sheet-t">{possuiSenha ? 'Alterar senha de acesso' : 'Criar senha de acesso'}</h3>
            <p>{possuiSenha ? 'Confirme a senha atual e defina uma nova, com pelo menos 6 caracteres.' : 'Depois você poderá entrar também com e-mail e senha.'}</p>
            {possuiSenha && <label className="cr-f" htmlFor="pf-senha-atual"><span className="cr-l">Senha atual</span><span className="cr-in"><input id="pf-senha-atual" type="password" autoComplete="current-password" autoFocus value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} /></span></label>}
            <label className="cr-f" htmlFor="pf-senha-nova"><span className="cr-l">{possuiSenha ? 'Nova senha' : 'Senha'}</span><span className={`cr-in ${senhaNova.length >= 6 ? 'good' : ''}`}><input id="pf-senha-nova" type="password" autoComplete="new-password" autoFocus={!possuiSenha} placeholder="Mínimo de 6 caracteres" value={senhaNova} onChange={e => setSenhaNova(e.target.value)} />{senhaNova.length >= 6 && <span className="okdot"><Check size={11} strokeWidth={3} /></span>}</span></label>
            {!possuiSenha && <label className="cr-f" htmlFor="pf-senha-conf"><span className="cr-l">Confirmar senha</span><span className="cr-in"><input id="pf-senha-conf" type="password" autoComplete="new-password" value={senhaConfirma} onChange={e => setSenhaConfirma(e.target.value)} /></span></label>}
            {senhaErro && <p className="cr-err" role="alert">{senhaErro}</p>}
            <button className="primary" disabled={(possuiSenha && senhaAtual.length < 4) || senhaNova.length < 6 || (!possuiSenha && senhaNova !== senhaConfirma) || salvandoSenha} onClick={trocarSenha}>
              {salvandoSenha ? <><MiniEcg />Gravando senha</> : <><Save size={17} />{possuiSenha ? 'Confirmar alteração' : 'Criar senha'}</>}
            </button>
            <button className="ghost" disabled={salvandoSenha} onClick={() => setSheet(null)}>Cancelar</button>
          </> : <>
            <h3 id="pf-sheet-t">Sair do plantão?</h3>
            <p>Seu progresso já está salvo no prontuário. Você volta para a tela de entrada.</p>
            <button className="primary cr-danger" disabled={saindo} onClick={sair}><LogOut size={17} />{saindo ? 'Saindo…' : 'Sair da conta'}</button>
            <button className="ghost" disabled={saindo} onClick={() => setSheet(null)}>Continuar no plantão</button>
          </>}
        </motion.div>
      </>}
    </AnimatePresence>
  </div></div>;
}
