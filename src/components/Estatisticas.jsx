import { createElement, useState } from 'react';
import { Activity, ArrowLeft, BookOpen, Clock3, HeartPulse, ShieldAlert, Stethoscope, Ticket, Trophy } from 'lucide-react';
import { resumirCruzadinhas } from '../utils/progressoCruzadinha';

const formatarTempo = segundos => {
  const minutos = Math.floor((Number(segundos) || 0) / 60);
  return minutos >= 60 ? `${Math.floor(minutos / 60)}h ${minutos % 60}m` : `${minutos} min`;
};
const Metric = ({ nome, valor, icon: Icon, cor = 'mint' }) => <div className={`stitch-stat stitch-stat-${cor}`}>{createElement(Icon, { size: 21 })}<span>{nome}</span><strong>{valor}</strong></div>;

export default function Estatisticas({ setTelaAtual, dadosUsuario }) {
  const [aba, setAba] = useState('geral');
  const cruz = dadosUsuario?.estatisticasGerais || {};
  const estatisticas = dadosUsuario?.estatisticas || {};
  const resumoCruzadinhas = resumirCruzadinhas(estatisticas);
  const stats = dadosUsuario?.ddx || {};
  const auditoria = dadosUsuario?.erroMedico || {};
  const totalClinico = Number(stats.partidas) || 0;
  const taxa = totalClinico ? Math.round((Number(stats.seguros) || 0) / totalClinico * 100) : 0;

  return <div className="stitch-page stitch-statistics">
    <header className="stitch-header"><div className="stitch-brand"><span className="stitch-brand-icon"><Stethoscope size={22} /></span><span><strong>cacoMed</strong><small>TERMINAL DE PLANTÃO</small></span></div><span className="stitch-header-label">DOSSIÊ DO PLANTONISTA</span></header>
    <main className="stitch-content"><button className="stitch-back" onClick={() => setTelaAtual('menu')}><ArrowLeft size={17} /> Voltar ao centro de comando</button>
      <div className="stitch-heading"><div><span className="stitch-kicker">TELEMETRIA DO PLANTÃO</span><h1>Estatísticas</h1><p>Seu progresso registrado em cada modo do jogo.</p></div><Activity size={34} /></div>
      <nav className="stitch-tabs" aria-label="Modos de estatísticas">{[
        ['geral', 'Geral', Trophy], ['ddx', 'Plantão médico', HeartPulse], ['erroMedico', 'Erro médico', ShieldAlert], ['cruzadinhas', 'Cruzadinhas', BookOpen]
      ].map(([id, label, Icon]) => <button key={id} aria-pressed={aba === id} className={aba === id ? 'is-selected' : ''} onClick={() => setAba(id)}>{createElement(Icon, { size: 18 })}{label}</button>)}</nav>
      <div key={aba} className="stitch-stat-content">
      {aba === 'geral' && <div className="stitch-stat-grid"><Metric nome="XP acumulado" valor={(Number(dadosUsuario?.pontuacaoTotal) || 0).toLocaleString('pt-BR')} icon={Trophy} cor="amber" /><Metric nome="Tickets disponíveis" valor={Number(dadosUsuario?.tickets) || 0} icon={Ticket} /><Metric nome="Cruzadinhas concluídas" valor={resumoCruzadinhas.partidas} icon={BookOpen} /><Metric nome="Plantões seguros" valor={stats.seguros || 0} icon={HeartPulse} cor="violet" /></div>}
      {aba === 'ddx' && <><div className="stitch-summary"><div><span className="stitch-kicker">DDX · PLANTÃO MÉDICO</span><h2>{totalClinico ? `${taxa}% de vitórias` : 'Ainda sem plantões registrados'}</h2><p>{totalClinico} {totalClinico === 1 ? 'caso registrado' : 'casos registrados'} neste modo</p></div><HeartPulse size={42} /></div><div className="stitch-stat-grid"><Metric nome="Atendimentos seguros" valor={stats.seguros || 0} icon={HeartPulse} /><Metric nome="Plantões concluídos" valor={stats.partidas || 0} icon={BookOpen} /><Metric nome="XP no DDX" valor={stats.xp || 0} icon={Trophy} /></div></>}
      {aba === 'cruzadinhas' && <div className="stitch-stat-grid"><Metric nome="Partidas concluídas" valor={resumoCruzadinhas.partidas} icon={BookOpen} /><Metric nome="Letras corretas" valor={resumoCruzadinhas.letras} icon={Trophy} /><Metric nome="Erros" valor={cruz.errosTotais || 0} icon={ShieldAlert} cor="red" /><Metric nome="Maior palavra" valor={`${cruz.maiorPalavra || 0} letras`} icon={BookOpen} cor="amber" /><Metric nome="Tempo total" valor={formatarTempo(resumoCruzadinhas.tempo)} icon={Clock3} /></div>}
      {aba === 'erroMedico' && <><div className="stitch-summary"><div><span className="stitch-kicker">DDX · ERRO MÉDICO</span><h2>{auditoria.partidas ? `${auditoria.partidas} análises concluídas` : 'Ainda sem análises registradas'}</h2><p>Desempenho separado do Plantão médico.</p></div></div><div className="stitch-stat-grid"><Metric nome="Etapas corretas" valor={`${auditoria.acertos || 0}/${auditoria.etapas || 0}`} icon={ShieldAlert} /><Metric nome="Análises concluídas" valor={auditoria.partidas || 0} icon={BookOpen} /><Metric nome="XP em Erro médico" valor={auditoria.xp || 0} icon={Trophy} /></div></>}
      </div>
    </main>
  </div>;
}
