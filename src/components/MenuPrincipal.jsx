import { Activity, ArrowRight, BarChart3, BookOpen, Flame, HeartPulse, LogOut, ShieldAlert, Stethoscope, Target, Ticket, Trophy, UserRound } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { lerMissoes } from '../utils/missoes';
import { resumirCruzadinhas } from '../utils/progressoCruzadinha';
import { useEffect, useRef, useState } from 'react';
import FerramentasAdmin from './FerramentasAdmin';
import AdminSpeedDial from './AdminSpeedDial';

export default function MenuPrincipal({ dadosUsuario, setTelaAtual, usuario, setDadosUsuario }) {
  const modosClinicosBloqueados = true;
  const [hardcoreFocus, setHardcoreFocus] = useState(false);
  const [emergencyEntering, setEmergencyEntering] = useState(false);
  const emergencyTimer = useRef(null);
  useEffect(() => () => clearTimeout(emergencyTimer.current), []);
  const enterHardcore = () => {
    if (modosClinicosBloqueados) {
      clearTimeout(emergencyTimer.current);
      setEmergencyEntering(false);
      return;
    }
    if (emergencyEntering) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTelaAtual('hardcore');
      return;
    }
    setEmergencyEntering(true);
    emergencyTimer.current = setTimeout(() => setTelaAtual('hardcore'), 760);
  };
  const nome = dadosUsuario?.nome || dadosUsuario?.username || 'Plantonista';
  const xp = Number(dadosUsuario?.pontuacaoTotal) || 0;
  const tickets = Number(dadosUsuario?.tickets) || 0;
  const missoes = lerMissoes(dadosUsuario);
  const feitas = missoes.filter(missao => missao.concluida).length;
  const cruzadinhas = resumirCruzadinhas(dadosUsuario?.estatisticas).partidas;
  const ddx = dadosUsuario?.estatisticas?.ddx || {};
  const hardcore = dadosUsuario?.estatisticas?.hardcore || {};

  return <div className={`stitch-page stitch-command ${hardcoreFocus ? 'is-hardcore-focus' : ''} ${emergencyEntering ? 'is-emergency-entering' : ''}`}>
    {emergencyEntering && <div className="stitch-emergency-flash" aria-hidden="true" />}
    <header className="stitch-header"><div className="stitch-brand"><span className="stitch-brand-icon"><Stethoscope size={22} /></span><span><strong>cacoMed</strong><small>TERMINAL DE PLANTÃO</small></span></div><span className="stitch-header-label">CENTRO DE COMANDO</span><button className="stitch-user" onClick={() => setTelaAtual('perfil')}><UserRound size={18} /> {nome}</button></header>
    <main className="stitch-content">
      <div className="stitch-heading"><div><span className="stitch-kicker">PLANTÃO ATIVO</span><h1>Bem-vindo, {nome}</h1><p>Escolha seu próximo desafio clínico.</p></div><Activity size={34} /></div>
      <section className="stitch-callout stitch-hardcore-target" onPointerEnter={() => setHardcoreFocus(true)} onPointerLeave={() => setHardcoreFocus(false)} onFocusCapture={() => setHardcoreFocus(true)} onBlurCapture={() => setHardcoreFocus(false)}><div><span className="stitch-kicker">SALA VERMELHA · HARDCORE</span><h2>Atender caso crítico</h2><p>Modo em reformulação. As recompensas clínicas estão temporariamente bloqueadas.</p><svg className="stitch-emergency-ecg" viewBox="0 0 320 40" aria-hidden="true"><path d="M0 20 H75 L87 20 L96 8 L105 32 L114 4 L124 20 H320" /></svg></div><button className="stitch-primary" disabled={modosClinicosBloqueados || emergencyEntering} onClick={enterHardcore}>{modosClinicosBloqueados ? 'Em reformulação' : 'Iniciar emergência'} <ArrowRight size={18} /></button></section>
      <h2 className="stitch-section-heading">Alas de simulação e treinamento</h2>
      <div className="stitch-dashboard-grid">
        <section className="stitch-mode"><BookOpen className="stitch-mint" size={29} /><h3>Cruzadinhas médicas</h3><p>Estude termos por especialidade e acumule experiência.</p><span className="stitch-mode-stat">{cruzadinhas} concluídas</span><button className="stitch-primary" onClick={() => setTelaAtual('topicos')}>Jogar cruzadinhas <ArrowRight size={18} /></button></section>
        <section className="stitch-mode stitch-mode-violet"><HeartPulse size={29} /><h3>Diagnósticos DDX</h3><p>Modo em reformulação. O acesso e as recompensas estão temporariamente bloqueados.</p><span className="stitch-mode-stat"><Ticket size={16} /> {tickets} tickets disponíveis</span><button className="stitch-primary" disabled={modosClinicosBloqueados} onClick={() => setTelaAtual('selecaoDDX')}>Em reformulação <ArrowRight size={18} /></button></section>
        <section className="stitch-mode stitch-mode-alert stitch-hardcore-target" onPointerEnter={() => setHardcoreFocus(true)} onPointerLeave={() => setHardcoreFocus(false)} onFocusCapture={() => setHardcoreFocus(true)} onBlurCapture={() => setHardcoreFocus(false)}><ShieldAlert size={29} /><h3>Modo Hardcore</h3><p>Modo em reformulação. O acesso e as recompensas estão temporariamente bloqueados.</p><span className="stitch-mode-stat">{(Number(hardcore.partidas_ganhas) || 0) + (Number(hardcore.partidas_perdidas) || 0)} plantões registrados</span><button className="stitch-primary" disabled={modosClinicosBloqueados || emergencyEntering} onClick={enterHardcore}>Em reformulação <ArrowRight size={18} /></button></section>
      </div>
      <div className="stitch-dashboard-grid stitch-dashboard-bottom">
        <section className="stitch-panel stitch-dashboard-panel"><h3><Target size={20} /> Missões do plantão <span>{feitas}/{missoes.length}</span></h3>{missoes.length ? missoes.map(missao => <div className="stitch-mission" key={missao.id}><strong>{missao.titulo}</strong><small>{missao.progresso || 0}/{missao.meta} · {missao.subtitulo}</small><span className="stitch-progress"><span style={{ width: `${Math.min(100, ((missao.progresso || 0) / missao.meta) * 100)}%` }} /></span></div>) : <p>Missões disponíveis após sincronizar o perfil.</p>}</section>
        <section className="stitch-panel stitch-dashboard-panel"><h3><Trophy size={20} /> Progresso</h3><div className="stitch-metric"><Flame size={21} /><span>XP acumulado</span><strong>{xp.toLocaleString('pt-BR')}</strong></div><div className="stitch-metric"><HeartPulse size={21} /><span>Vitórias DDX</span><strong>{ddx.partidas_ganhas || 0}</strong></div><div className="stitch-metric"><Ticket size={21} /><span>Tickets</span><strong>{tickets}</strong></div><button className="stitch-link" onClick={() => setTelaAtual('estatisticas')}>Ver estatísticas <ArrowRight size={16} /></button></section>
        <section className="stitch-panel stitch-dashboard-panel"><h3><BarChart3 size={20} /> Seu espaço</h3><p>Acompanhe sua trajetória e compare pontuações.</p><button className="stitch-link" onClick={() => setTelaAtual('ranking')}>Abrir ranking <ArrowRight size={16} /></button><button className="stitch-link" onClick={() => setTelaAtual('perfil')}>Abrir perfil <ArrowRight size={16} /></button></section>
      </div>
      <footer className="stitch-footer"><span>cacoMed · TERMINAL DE PLANTÃO</span><button onClick={() => signOut(auth)}><LogOut size={16} /> Sair da conta</button></footer>
    </main>
    {usuario && dadosUsuario?.role === 'admin' && <AdminSpeedDial titulo="Ferramentas admin · Centro de Comando"><FerramentasAdmin usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} /></AdminSpeedDial>}
  </div>;
}
