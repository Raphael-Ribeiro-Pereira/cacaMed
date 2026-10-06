import { useEffect, useMemo, useState } from 'react';
import { BookOpen, BrainCircuit, ClipboardCheck, GitBranch, HeartPulse, Play, RotateCcw, ScanLine, Shuffle, Stethoscope, Ticket, Trophy } from 'lucide-react';
import { calcularIdPublico } from '../services/rankingPublico';
import { carregarRanking, rankingEmCache } from '../services/rankingSessao';
import { DOENCAS } from '../utils/batalha';
import { progressoGlobal } from '../utils/economia';
import { fotoDoPerfil } from '../utils/fotosCracha';
import { lerMissoes } from '../utils/missoes';
import { CASOS_PLANTAO } from '../utils/plantao';
import { animar, fmt, lerLocal, useLargo } from '../utils/prototipo';
import { entradasCruzadinha, resumirCruzadinhas } from '../utils/progressoCruzadinha';
import AdminSpeedDial from './AdminSpeedDial';
import FerramentasAdmin from './FerramentasAdmin';
import { Blob } from './batalhaArte';
import { Missions, RankPreview, UserBadge } from './cascaUi';
import { Tabbar } from './prototipoUi';
import '../prototipo.css';

// Centro de comando portado do protótipo de movimento: celular com barra de abas e web em grade,
// com a barra lateral vinda do App. Batalha e Revisão aparecem só para o administrador (pilotos).
const n = v => Number(v) || 0;
const semAcento = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const capitalizar = s => String(s || '').toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, l => l.toLocaleUpperCase('pt-BR'));
const MATERIA_NOME = { anatomia: 'Anatomia', neurologia: 'Neurologia', farmaco: 'Farmacologia', micro: 'Microbiologia', clinica: 'Clínica Geral', patologia: 'Patologia' };
const minutos = s => (s == null ? '—' : `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`);

// Última cruzadinha jogada (pelo histórico) ou, sem histórico, o tópico mais jogado.
function ultimaCruzadinha(p) {
  const ultima = (p.estatisticasGerais?.historico || []).at(-1);
  const alvo = ultima?.materia ? semAcento(ultima.materia) : null;
  const jogadas = entradasCruzadinha(p.estatisticas);
  const chave = (alvo && jogadas.find(([k]) => k.split('-').slice(1).join('-') === alvo)?.[0])
    || [...jogadas].sort((x, y) => n(y[1].partidas) - n(x[1].partidas))[0]?.[0];
  if (!chave) return null;
  const topico = alvo && chave.split('-').slice(1).join('-') === alvo ? ultima.materia : capitalizar(chave.split('-').slice(1).join(' '));
  const xp = n(p.xpTopicos?.[chave]);
  const nivel = xp === 0 ? 0 : Math.floor(Math.sqrt(xp / 1000)) + 1;
  const lo = (Math.max(1, nivel) - 1) ** 2 * 1000, hi = Math.max(1, nivel) ** 2 * 1000;
  const e = p.estatisticas[chave] || {};
  return { titulo: `${capitalizar(chave.split('-')[0])} · ${topico}`, nivel, pct: Math.max(0, Math.min(99, Math.floor((xp - lo) / (hi - lo) * 100))),
    partidas: n(e.partidas), letras: n(e.letras), melhor: e.melhorTempo ?? null };
}

function Hero({ p, web, ir }) {
  const ultima = ultimaCruzadinha(p);
  if (!resumirCruzadinhas(p.estatisticas).partidas || !ultima) {
    const m = MATERIA_NOME[p.materiaPreferida] || 'Anatomia';
    return <button className={`hero ${web ? 'w-hero' : ''} rise`} style={{ '--i': 1 }} onClick={() => ir('topicos')}>
      <span className="kicker">Primeiro plantão · Cruzadinhas</span>
      <span className="h3">{m} · sua primeira cruzadinha</span>
      <span className="p">Comece pela sua matéria preferida. Cada cruzadinha concluída rende 2 tickets para o DDX.</span>
      <span className="hero-go"><span className="mini-grid">{Array.from({ length: 15 }, (_, i) => <i key={i} />)}</span><span className="play"><Play fill="currentColor" /></span></span>
    </button>;
  }
  return <button className={`hero ${web ? 'w-hero' : ''} rise`} style={{ '--i': 1 }} onClick={() => ir('topicos')}>
    <span className="kicker">Continue de onde parou · Cruzadinhas</span>
    <span className="h3">{ultima.titulo}</span>
    <span className="p">Nível {ultima.nivel} no tópico, {ultima.pct}% até o próximo.{web ? ' Cada cruzadinha concluída rende 2 tickets para o DDX.' : ''}</span>
    {web && <span className="w-hero-stats"><span><small>PARTIDAS</small><b>{fmt(ultima.partidas)}</b></span><span><small>LETRAS</small><b>{fmt(ultima.letras)}</b></span><span><small>MELHOR TEMPO</small><b>{minutos(ultima.melhor)}</b></span></span>}
    <span className="hero-go"><span className="mini-grid">{Array.from({ length: 15 }, (_, i) => <i key={i} className={[0, 1, 2, 3, 4, 5, 8, 10, 13].includes(i) ? 'f' : ''} />)}</span><span className="play"><Play fill="currentColor" /></span></span>
  </button>;
}

function Rapidos({ ir }) {
  return <>
    <button className="mode quick rise" style={{ '--i': 2 }} onClick={() => ir('quiz')}>
      <span className="new">NOVO</span>
      <span className="ico" style={{ background: 'rgba(92,200,255,.12)', color: '#5cc8ff' }}><BrainCircuit /></span>
      <b>Quiz médico</b><small>Teoria e casos clínicos, 5 perguntas por rodada</small>
    </button>
    <button className="mode quick rise" style={{ '--i': 3 }} onClick={() => ir('verdadeMentira')}>
      <span className="new">NOVO</span>
      <span className="ico" style={{ background: 'rgba(255,183,3,.1)', color: 'var(--amber)' }}><ScanLine /></span>
      <b>Verdade ou mentira</b><small>5 frases por rodada: marque as verdadeiras</small>
    </button>
  </>;
}

function Revisao({ p, ir }) {
  const r = p.revisao;
  const andamento = r?.entrada && !r.entrada.encerrada;
  return <button className="mode wide rise" style={{ '--i': 3 }} onClick={() => ir('revisaoInteligente')}>
    <span className="ico" style={{ background: 'rgba(0,245,212,.1)', color: 'var(--mint)' }}><RotateCcw /></span>
    <span style={{ display: 'grid', gap: 2, minWidth: 0 }}><b>Revisão inteligente</b>
      <small>{andamento ? 'Sessão em andamento' : r?.resumo ? `${n(r.resumo.disponiveis)} itens disponíveis na última consulta` : 'Reveja seus erros em sessões curtas'} · sem ticket</small></span>
    <span className="ddx-side"><span className="tag">PILOTO</span></span>
  </button>;
}

function Ddx({ p, web, ir }) {
  const caso = CASOS_PLANTAO[0];
  return <button className="mode wide ddx-ring rise" style={{ '--i': 4 }} onClick={() => ir('selecaoDDX')}>
    <span className="ico" style={{ background: 'rgba(139,92,246,.14)', color: '#b49cff' }}><HeartPulse /></span>
    <span style={{ display: 'grid', gap: 2, minWidth: 0 }}><b>DDX · Casos clínicos</b><small>{caso.paciente} · {caso.sistema} · 1 ticket por caso</small>
      {web && <span className="ddx-modes"><span><Stethoscope size={13} />Plantão médico</span><span><ClipboardCheck size={13} />Erro médico</span><span><GitBranch size={13} />Causa e efeito</span></span>}
    </span>
    <span className="ddx-side">{!caso.revisado && <span className="tag">EM REVISÃO</span>}{web && <span className="chip" style={{ fontSize: 11.5, padding: '4px 9px' }}><Ticket />{n(p.tickets)} tickets</span>}</span>
  </button>;
}

function BattleCard({ p, web, ir }) {
  return <button className={`mode wide bt-card rise ${web ? 'w' : ''}`} style={{ '--i': 5 }} onClick={() => ir('batalha')}>
    <span className="new">PILOTO</span>
    <span className="bt-card-art" aria-hidden="true"><Blob /></span>
    <span style={{ display: 'grid', gap: 3, minWidth: 0 }}>
      <b>Batalha diagnóstica</b>
      <small>Duelo por turnos contra doenças desconhecidas. Investigue, diagnostique e controle.</small>
      <span className="bt-card-tags"><span><BookOpen size={12} />História</span><span><Shuffle size={12} />Duelo clínico</span><span className="mono">{(p.batalha?.descobertas || []).length}/{DOENCAS.length} descobertas</span></span>
    </span>
  </button>;
}

// Ranking da prévia: abre com a lista da sessão e atualiza por trás.
function useRankingMenu(usuario, buscarRanking) {
  const [lista, setLista] = useState(rankingEmCache);
  const [meuId, setMeuId] = useState(null);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let vivo = true;
    if (usuario?.uid) calcularIdPublico(usuario.uid).then(id => { if (vivo) setMeuId(id); });
    carregarRanking(buscarRanking).then(l => { if (vivo) { setLista(l); setErro(false); } }).catch(() => { if (vivo) setErro(true); });
    return () => { vivo = false; };
  }, [usuario?.uid, buscarRanking, tentativa]);
  const ordenada = useMemo(() => (lista ? lista.map((r, i) => ({ id: r.idPublico || `linha-${i}`, nome: String(r.nome || 'Doutor(a)'), valor: n(r.xpGlobal), me: Boolean(meuId) && r.idPublico === meuId }))
    .sort((a, b) => b.valor - a.valor || a.id.localeCompare(b.id)) : null), [lista, meuId]);
  const anterior = useMemo(() => (meuId ? lerLocal('cacoMed-rank-pos-' + meuId) : null), [meuId]);
  const pos = ordenada ? ordenada.findIndex(r => r.me) : -1;
  const delta = Number.isInteger(anterior) && pos >= 0 ? anterior - pos : 0;
  return { lista: erro && !lista ? null : ordenada, erro: erro && !lista, delta, tentar: () => setTentativa(t => t + 1) };
}

export default function MenuPrincipal({ dadosUsuario, setTelaAtual, usuario, setDadosUsuario, buscarRanking }) {
  const web = useLargo();
  const p = dadosUsuario || {};
  const foto = fotoDoPerfil(p);
  const L = progressoGlobal(p);
  const admin = p.role === 'admin';
  const missoes = lerMissoes(p);
  const rank = useRankingMenu(usuario, buscarRanking);
  const ir = setTelaAtual;
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const ferramentas = usuario && admin && <AdminSpeedDial titulo="Ferramentas admin · Centro de Comando" acima={!web}><FerramentasAdmin usuario={usuario} dadosUsuario={dadosUsuario} setDadosUsuario={setDadosUsuario} /></AdminSpeedDial>;

  if (web) return <><div className="cbt web"><div className="cbt-scr r-menu">
    <div className="scroll w-page">
      <header className="w-head rise">
        <div><span className="kicker">Plantão ativo · {hoje}</span><h1>Bem-vind{p.titulo === 'Doutora' ? 'a' : 'o'}, {String(p.nome || p.username || 'Plantonista').trim().split(/\s+/)[0]}</h1><p>Escolha seu próximo desafio clínico.</p></div>
        <div className="w-head-r"><UserBadge p={p} foto={foto} ir={ir} web /></div>
      </header>
      <div className="w-grid">
        <span className="w-label">ESTUDO RÁPIDO <small>sem ticket</small></span>
        <Hero p={p} web ir={ir} />
        <div className="w-quick"><Rapidos ir={ir} /></div>
        {admin && <div className="w-ddx"><Revisao p={p} ir={ir} /></div>}
        <span className="w-label">CASOS CLÍNICOS <small>1 ticket por caso</small></span>
        <div className="w-ddx"><Ddx p={p} web ir={ir} /></div>
        {admin && <div className="w-bt"><BattleCard p={p} web ir={ir} /></div>}
        <section className="card w-panel rise" style={{ '--i': 5 }}>
          <div className="w-panel-h"><h2>Missões de hoje</h2></div>
          <Missions missoes={missoes} dia={p.dataUltimoLogin} />
        </section>
        <section className="card w-panel rise" style={{ '--i': 6 }}>
          <div className="w-panel-h"><h2><Trophy size={15} /> Devoradores de Plantão</h2><span>temporada</span></div>
          <RankPreview lista={rank.lista} erro={rank.erro} aoTentar={rank.tentar} delta={rank.delta} foto={foto} ir={ir} />
        </section>
      </div>
    </div>
  </div></div>{ferramentas}</>;

  return <><div className="cbt"><div className="cbt-scr r-menu">
    <div className="scroll">
      <div className="m-head rise" style={{ '--i': 0 }}>
        <UserBadge p={p} foto={foto} ir={ir} web={false} />
        <span className="chip" key={n(p.tickets)} style={{ animation: animar() ? 'cbt-pop .6s var(--ease)' : undefined }}><Ticket /><span>{n(p.tickets)}</span></span>
      </div>
      <div className="m-level rise" style={{ '--i': 0 }}><span className="mono">NÍVEL {L.nivel}</span><div className="bar"><span style={{ width: `${L.percentual}%` }} /></div><span className="mono">{fmt(L.proximo - L.xp)} XP</span></div>

      <div className="sec"><h2>Estudo rápido</h2><span>sem ticket</span></div>
      <Hero p={p} ir={ir} />
      <div className="modes" style={{ marginTop: 10 }}><Rapidos ir={ir} />{admin && <Revisao p={p} ir={ir} />}</div>

      <div className="sec"><h2>Casos clínicos</h2><span>1 ticket por caso</span></div>
      <div className="modes"><Ddx p={p} ir={ir} />{admin && <BattleCard p={p} ir={ir} />}</div>

      <div className="sec"><h2>Missões de hoje</h2></div>
      <Missions missoes={missoes} dia={p.dataUltimoLogin} />

      <div className="sec"><h2><Trophy size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }} />Devoradores de Plantão</h2><span>temporada</span></div>
      <RankPreview lista={rank.lista} erro={rank.erro} aoTentar={rank.tentar} delta={rank.delta} foto={foto} compact ir={ir} />
    </div>
    <Tabbar on="menu" ir={ir} />
  </div></div>{ferramentas}</>;
}
