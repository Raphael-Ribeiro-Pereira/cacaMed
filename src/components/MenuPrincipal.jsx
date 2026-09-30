import { Brain, CircleHelp, Activity, ArrowRight, BarChart3, BookOpen, Flame, HeartPulse, LogOut, Stethoscope, Target, Ticket, Trophy, UserRound } from 'lucide-react';
import { sairDaConta } from '../services/sairDaConta';
import { lerMissoes } from '../utils/missoes';
import { resumirCruzadinhas } from '../utils/progressoCruzadinha';
import FerramentasAdmin from './FerramentasAdmin';
import AdminSpeedDial from './AdminSpeedDial';
import { progressoGlobal } from '../utils/economia';

export default function MenuPrincipal({ dadosUsuario, setTelaAtual, usuario, setDadosUsuario }) {
  const nome = dadosUsuario?.nome || dadosUsuario?.username || 'Plantonista';
  const xp = Number(dadosUsuario?.pontuacaoTotal) || 0;
  const tickets = Number(dadosUsuario?.tickets) || 0;
  const missoes = lerMissoes(dadosUsuario);
  const feitas = missoes.filter(missao => missao.concluida).length;
  const cruzadinhas = resumirCruzadinhas(dadosUsuario?.estatisticas).partidas;
  const progresso = progressoGlobal(dadosUsuario);
  const ddx = dadosUsuario?.ddx || {};

  return <div className="stitch-page stitch-command">
    <header className="stitch-header"><div className="stitch-brand"><span className="stitch-brand-icon"><Stethoscope size={22} /></span><span><strong>cacoMed</strong><small>TERMINAL DE PLANTÃO</small></span></div><span className="stitch-header-label">CENTRO DE COMANDO</span><button className="stitch-user" onClick={() => setTelaAtual('perfil')}><UserRound size={18} /> {nome}</button></header>
    <main className="stitch-content">
      <div className="stitch-heading"><div><span className="stitch-kicker">PLANTÃO ATIVO</span><h1>Bem-vindo, {nome}</h1><p>Escolha seu próximo desafio clínico.</p></div><Activity size={34} /></div>
      <section className="stitch-callout"><div><span className="stitch-kicker">DDX · SIMULAÇÃO CLÍNICA</span><h2>Plantão médico</h2><p>Acompanhe o paciente, investigue e tome decisões.</p></div><button className="stitch-primary" onClick={() => setTelaAtual('selecaoDDX')}>Abrir DDX <ArrowRight size={18} /></button></section>
      <h2 className="stitch-section-heading">Alas de simulação e treinamento</h2>
      <div className="stitch-dashboard-grid">
        <section className="stitch-mode"><BookOpen className="stitch-mint" size={29} /><h3>Cruzadinhas médicas</h3><p>Complete a grade, acumule XP e ganhe 2 tickets.</p><span className="stitch-mode-stat">{cruzadinhas} concluídas</span><button className="stitch-primary" onClick={() => setTelaAtual('topicos')}>Jogar cruzadinhas <ArrowRight size={18} /></button></section>
        <section className="stitch-mode"><Brain size={29} /><h3>Quiz médico</h3><p>Teoria e casos clínicos em rodadas de cinco perguntas.</p><span className="stitch-mode-stat">{dadosUsuario?.treinos?.quiz?.partidas || 0} rodadas · gratuito</span><button className="stitch-primary" onClick={() => setTelaAtual('quiz')}>Jogar Quiz <ArrowRight size={18} /></button></section>
        <section className="stitch-mode"><CircleHelp size={29} /><h3>Verdade ou mentira</h3><p>Curiosidades, mitos e absurdos: selecione as frases verdadeiras.</p><span className="stitch-mode-stat">{dadosUsuario?.treinos?.verdadeMentira?.partidas || 0} rodadas · gratuito</span><button className="stitch-primary" onClick={() => setTelaAtual('verdadeMentira')}>Jogar Verdade ou mentira <ArrowRight size={18} /></button></section>
        <section className="stitch-mode"><BookOpen size={29} /><h3>Revisão inteligente</h3><p>Reveja seus erros em sessões curtas. Acertos espaçam a próxima revisão.</p><span className="stitch-mode-stat">{dadosUsuario?.revisao?.entrada && !dadosUsuario.revisao.entrada.encerrada ? 'Sessão em andamento' : dadosUsuario?.revisao?.resumo ? `${dadosUsuario.revisao.resumo.disponiveis} itens na última consulta` : 'Consulte sua fila'} · gratuito</span><button className="stitch-primary" disabled={dadosUsuario?.role !== 'admin'} onClick={() => setTelaAtual('revisaoInteligente')}>{dadosUsuario?.role !== 'admin' ? 'Piloto para administrador' : 'Abrir revisão'} <ArrowRight size={18} /></button></section>
        <section className="stitch-mode stitch-mode-violet"><HeartPulse size={29} /><h3>DDX</h3><p>Plantão médico, Erro médico e Causa e efeito em validação.</p><span className="stitch-mode-stat"><Ticket size={16} /> {tickets} tickets disponíveis</span><button className="stitch-primary" onClick={() => setTelaAtual('selecaoDDX')}>Escolher atendimento <ArrowRight size={18} /></button></section>
      </div>
      <div className="stitch-dashboard-grid stitch-dashboard-bottom">
        <section className="stitch-panel stitch-dashboard-panel"><h3><Target size={20} /> Missões do plantão <span>{feitas}/{missoes.length}</span></h3>{missoes.length ? missoes.map(missao => <div className="stitch-mission" key={missao.id}><strong>{missao.titulo}</strong><small>{missao.progresso || 0}/{missao.meta} · {missao.subtitulo} · +{missao.recompensaXP} XP / +{missao.recompensaTicket} ticket</small><span className="stitch-progress"><span style={{ width: `${Math.min(100, ((missao.progresso || 0) / missao.meta) * 100)}%` }} /></span></div>) : <p>Missões disponíveis após sincronizar o perfil.</p>}</section>
        <section className="stitch-panel stitch-dashboard-panel"><h3><Trophy size={20} /> Nível {progresso.nivel}</h3><p>{progresso.xp - progresso.base}/{progresso.proximo - progresso.base} XP para o próximo nível</p><span className="stitch-progress"><span style={{ width: `${progresso.percentual}%` }} /></span><div className="stitch-metric"><Flame size={21} /><span>XP acumulado</span><strong>{xp.toLocaleString('pt-BR')}</strong></div><div className="stitch-metric"><HeartPulse size={21} /><span>Plantões seguros</span><strong>{ddx.seguros || 0}</strong></div><div className="stitch-metric"><Ticket size={21} /><span>Tickets</span><strong>{tickets}</strong></div><button className="stitch-link" onClick={() => setTelaAtual('estatisticas')}>Ver estatísticas <ArrowRight size={16} /></button></section>
        <section className="stitch-panel stitch-dashboard-panel"><h3><BarChart3 size={20} /> Seu espaço</h3><p>Acompanhe sua trajetória e compare pontuações.</p><button className="stitch-link" onClick={() => setTelaAtual('ranking')}>Abrir ranking <ArrowRight size={16} /></button><button className="stitch-link" onClick={() => setTelaAtual('perfil')}>Abrir perfil <ArrowRight size={16} /></button></section>
      </div>
      <footer className="stitch-footer"><span>cacoMed · TERMINAL DE PLANTÃO</span><button onClick={() => sairDaConta()}><LogOut size={16} /> Sair da conta</button></footer>
    </main>
    {usuario && dadosUsuario?.role === 'admin' && <AdminSpeedDial titulo="Ferramentas admin · Centro de Comando"><FerramentasAdmin usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} /></AdminSpeedDial>}
  </div>;
}
