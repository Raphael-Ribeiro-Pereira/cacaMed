import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Award, BookOpen, Brain, Check, Clock3, Crosshair, Lock, Medal, RotateCcw, Sparkles, Swords, Target, Ticket, Trophy } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { AGENTE, DOENCAS, MOVES, PETS } from '../utils/batalha';
import { MATERIAS, materiaDoTopico } from '../utils/coroas';
import { progressoGlobal } from '../utils/economia';
import { MODOS, dadosModo } from '../utils/modosPerfil';
import { resumirCruzadinhas } from '../utils/progressoCruzadinha';
import { animar, fmt, useLargo } from '../utils/prototipo';
import { PetArt, Species } from './batalhaArte';
import { CountNum, FlameIcon, Tabbar } from './prototipoUi';
import '../prototipo.css';

// Dossiê do plantonista, portado do protótipo de movimento. Primeira camada: perfil em memória
// (resumo, modos, DDX, Batalha, pets e conquistas). Segunda camada: obterEstatisticas
// (erros por tema, semanas e partidas recentes), com skeletons e cache por sessão do app.
const cacheHistorico = new Map();

const COR_MODO = Object.fromEntries(MODOS.map(([id, , cor]) => [id, cor]));
const NOME_MODO = Object.fromEntries(MODOS.map(([id, nome]) => [id, nome]));
const n = v => Number(v) || 0;

const nota = v => (v >= 90 ? 'S' : v >= 80 ? 'A' : v >= 70 ? 'B' : v >= 60 ? 'C' : 'D');
const pct = (a, e) => (a + e ? Math.round((a / (a + e)) * 100) : null);
const dataCurta = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
function quando(iso) {
  const d = new Date(iso), hoje = new Date();
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
  if (d.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return `${dataCurta(iso)}, ${hora}`;
}
const duracao = s => (s == null ? '—' : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`);

function useShow(on = true) {
  const [s, setS] = useState(() => !animar());
  useEffect(() => { if (!on || s) return undefined; const t = setTimeout(() => setS(true), 60); return () => clearTimeout(t); }, [on, s]);
  return s;
}

function Grade({ v, big }) {
  if (v == null) return <span className={`grade g-na ${big ? 'big' : ''}`}>–</span>;
  return <span className={`grade g-${nota(v)} ${big ? 'big' : ''}`} title={`Aproveitamento ${v}%`}>{nota(v)}</span>;
}

function Donut({ v, size = 58, color = 'var(--mint)', show }) {
  const r = size / 2 - 5, C = 2 * Math.PI * r;
  return <span className="donut" style={{ width: size, height: size }}>
    <svg viewBox={`0 0 ${size} ${size}`}><circle cx={size / 2} cy={size / 2} r={r} className="t" /><circle cx={size / 2} cy={size / 2} r={r} className="f" style={{ stroke: color }} strokeDasharray={C} strokeDashoffset={C * (1 - (show ? v : 0) / 100)} /></svg>
    <b className="mono">{v}%</b>
  </span>;
}

const Bar = ({ v, color = 'var(--mint)', show }) => <span className="sbar"><span style={{ width: `${show ? v : 0}%`, background: color }} /></span>;

function Radar({ data, show }) {
  const k = data.length, R = 60, cx = 150, cy = 100;
  const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / k; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  return <svg viewBox="0 0 300 200" className="radar" role="img" aria-label={`XP por matéria: ${data.map(([t, v]) => `${t} ${v}%`).join(', ')}`}>
    {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={data.map((_, i) => pt(i, R * f).join(',')).join(' ')} className="rg" />)}
    {data.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="rg" />; })}
    <g className="rv-g" style={{ transform: `scale(${show ? 1 : 0})`, transformOrigin: `${cx}px ${cy}px` }}>
      <polygon points={data.map(([, v], i) => pt(i, (R * v) / 100).join(',')).join(' ')} className="rv" />
      {data.map(([, v], i) => { const [x, y] = pt(i, (R * v) / 100); return <circle key={i} cx={x} cy={y} r="3" className="rd" />; })}
    </g>
    {data.map(([t, v], i) => {
      const [x, y] = pt(i, R + 16);
      const anchor = Math.abs(x - cx) < 4 ? 'middle' : x > cx ? 'start' : 'end';
      return <text key={t} x={x} y={y + 3} textAnchor={anchor} className="rl">{t} <tspan className={v < 60 ? 'low' : 'hi'}>{v}</tspan></text>;
    })}
  </svg>;
}

function WeekChart({ semanas, show, w }) {
  const H = 200, pl = 36, pr = 34, pt = 22, pb = 26;
  const max = Math.max(300, Math.ceil(Math.max(...semanas.map(s => s.xp)) / 300) * 300);
  const iw = w - pl - pr, ih = H - pt - pb, bw = iw / semanas.length;
  const y = v => pt + ih - (v / max) * ih;
  const ya = a => pt + ih - ((a - 50) / 50) * ih;
  const pontos = semanas.map((s, i) => [i, s.acerto]).filter(([, a]) => a != null);
  const linha = pontos.map(([i, a], k) => `${k ? 'L' : 'M'}${pl + i * bw + bw / 2} ${ya(Math.max(50, a))}`).join(' ');
  return <svg viewBox={`0 0 ${w} ${H}`} className="wchart" role="img" aria-label={`XP por semana: ${semanas.map(s => `${dataCurta(s.inicio)} ${s.xp}`).join(', ')}`}>
    {[0, max / 2, max].map(v => <g key={v}><line x1={pl} x2={w - pr} y1={y(v)} y2={y(v)} className="gl" /><text x={pl - 6} y={y(v) + 3} textAnchor="end" className="ax">{v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR')}k` : v}</text></g>)}
    {[50, 75, 100].map(a => <text key={a} x={w - pr + 6} y={ya(a) + 3} className="ax amb">{a}%</text>)}
    {semanas.map((s, i) => {
      const ultima = i === semanas.length - 1;
      return <g key={s.inicio}>
        <rect x={pl + i * bw + bw * 0.2} y={y(s.xp)} width={bw * 0.6} height={pt + ih - y(s.xp)} rx="4" className={`wb ${ultima ? 'last' : ''}`} style={{ transform: `scaleY(${show ? 1 : 0})`, transitionDelay: `${i * 60}ms` }}><title>{`${dataCurta(s.inicio)}: ${fmt(s.xp)} XP${s.acerto == null ? '' : ` · ${s.acerto}% de acerto`}`}</title></rect>
        {ultima && <text x={pl + i * bw + bw / 2} y={y(s.xp) - 7} textAnchor="middle" className="wv">{fmt(s.xp)}</text>}
        {(w > 420 || i % 2 === 1) && <text x={pl + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="ax">{dataCurta(s.inicio)}</text>}
      </g>;
    })}
    {pontos.length > 1 && <path d={linha} className="wl" pathLength={1} style={{ strokeDashoffset: show ? 0 : 1 }} />}
    {pontos.map(([i, a]) => <circle key={i} cx={pl + i * bw + bw / 2} cy={ya(Math.max(50, a))} r="3" className="wd" style={{ opacity: show ? 1 : 0, transitionDelay: `${600 + i * 60}ms` }} />)}
  </svg>;
}

function Sec({ id, num, t, sub, children }) {
  return <section id={`st-${id}`} className="st-sec" aria-labelledby={`sth-${id}`}>
    <div className="st-h"><span className="st-n mono">{String(num).padStart(2, '0')}</span><h2 id={`sth-${id}`}>{t}</h2>{sub && <span className="st-sub">{sub}</span>}</div>
    {children}
  </section>;
}
const Sk = ({ h }) => <div className="sk st-sk" style={{ height: h }} />;

const NAV = [['resumo', 'Resumo'], ['modos', 'Modos'], ['ddx', 'DDX'], ['batalha', 'Batalha'], ['pets', 'Pets'], ['aprendizado', 'Aprendizado'], ['historico', 'Histórico'], ['conquistas', 'Conquistas']];

export default function Estatisticas({ usuario, dadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const p = dadosUsuario || {};
  const chave = usuario?.uid || 'sem-usuario';
  const [hist, setHist] = useState(() => cacheHistorico.get(chave) || null);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [on, setOn] = useState('resumo');
  const sc = useRef(null);
  const show1 = useShow();
  const show2 = useShow(Boolean(hist));

  useEffect(() => {
    if (!usuario) return undefined;
    let vivo = true;
    servicoPerfil(usuario, 'obterEstatisticas').then(r => { cacheHistorico.set(chave, r); if (vivo) { setHist(r); setErro(''); } })
      .catch(falha => { if (vivo) setErro(falha.message || 'Histórico indisponível.'); });
    return () => { vivo = false; };
  }, [usuario, chave, servicoPerfil, tentativa]);

  const ir = id => {
    const el = document.getElementById(`st-${id}`), box = sc.current;
    if (!el || !box) return;
    box.scrollTo({ top: el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 58, behavior: animar() ? 'smooth' : 'auto' });
    setOn(id);
  };
  const spy = () => {
    const box = sc.current; if (!box) return;
    const b = box.getBoundingClientRect().top;
    let cur = 'resumo';
    for (const [id] of NAV) { const el = document.getElementById(`st-${id}`); if (el && el.getBoundingClientRect().top - b < 90) cur = id; }
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) cur = NAV[NAV.length - 1][0];
    setOn(cur);
  };

  const modos = MODOS.map(([id, nome, cor]) => ({ id, nome, cor, ...dadosModo(p, id) }));
  const jogos = modos.reduce((s, m) => s + m.partidas, 0);
  const L = progressoGlobal(p);
  const topo = <div className="topbar">
    <h1><small>Dossiê do plantonista</small>Estatísticas</h1>
    {jogos > 0 && (erro ? <button className="sync err" onClick={() => { setErro(''); setTentativa(t => t + 1); }}><span className="dot" />Histórico indisponível · tentar de novo</button>
      : <span className={`sync ${hist ? 'ok' : ''}`}><span className="dot" />{hist ? 'Painel atualizado' : 'Buscando histórico'}</span>)}
  </div>;

  // Recém-cadastrado: o dossiê só abre depois da primeira partida.
  if (!jogos) return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr">
    {topo}
    <div className="scroll st">
      <div className="card st-empty rise">
        <span className="st-empty-ic"><BookOpen size={22} /></span>
        <b>Seu dossiê abre depois do primeiro plantão</b>
        <p>Parecer, notas por modo e histórico saem das suas partidas. Por enquanto: <b className="mono">{fmt(L.xp)} XP</b>, nível {L.nivel} e {n(p.tickets)} tickets.</p>
        <button className="primary" onClick={() => setTelaAtual('topicos')}>Jogar a primeira cruzadinha <ArrowRight size={16} /></button>
      </div>
    </div>
    {!web && <Tabbar on="estatisticas" ir={setTelaAtual} />}
  </div></div>;

  const comNota = modos.map(m => ({ ...m, acc: pct(m.acertos, m.erros) })).filter(m => m.acc != null);
  const media = comNota.length ? Math.round(comNota.reduce((a, m) => a + m.acc, 0) / comNota.length) : null;
  const ordem = [...comNota].sort((a, b) => b.acc - a.acc);
  const forte = ordem[0], fraco = ordem.length > 1 ? ordem[ordem.length - 1] : null;
  const tema = hist?.erros[0];
  const bt = { descobertas: [], historico: [], golpes: {}, pets: {}, buffs: {}, ...p.batalha };
  const faltaDex = DOENCAS.length - bt.descobertas.length;
  const revisao = p.revisao?.resumo;
  const admin = p.role === 'admin';
  const ger = p.estatisticasGerais || {};
  const seq = n(ger.streakAtual), recorde = n(ger.maiorStreak);
  const cruz = resumirCruzadinhas(p.estatisticas);
  const semanaAtual = hist?.semanas[hist.semanas.length - 1];
  const conclusao = hist?.conclusao.total ? Math.round((hist.conclusao.concluidas / hist.conclusao.total) * 100) : null;

  // DDX: Batalha por doença e por agente (histórico das últimas 30 partidas) e Plantão médico.
  const finais = bt.historico.filter(h => h.resultado !== 'abandono' && h.modo !== 'tutorial');
  // Doença ainda não descoberta aparece como ???, como no Dex: o painel não entrega o diagnóstico.
  const porDoenca = DOENCAS.map(d => { const l = finais.filter(h => h.doencaId === d.id); return [bt.descobertas.includes(d.id) ? d.nome : '??? · não descoberta', l.length ? Math.round(l.filter(h => h.resultado === 'vitoria').length / l.length * 100) : null, l.length, d.id]; })
    .filter(([, v]) => v != null);
  if (n(p.ddx?.partidas)) porDoenca.unshift(['Plantão respiratório · Marina', Math.round(n(p.ddx.seguros) / n(p.ddx.partidas) * 100), n(p.ddx.partidas), 'plantao']);
  const porAgente = Object.entries(AGENTE).map(([id, a]) => {
    const l = finais.filter(h => DOENCAS.find(d => d.id === h.doencaId)?.agente === id);
    return [a.nome.charAt(0) + a.nome.slice(1).toLowerCase(), l.length ? Math.round(l.filter(h => h.resultado === 'vitoria').length / l.length * 100) : null, a.cor];
  });
  const xpMateria = Object.fromEntries(MATERIAS.map(m => [m.id, 0]));
  for (const [k, v] of Object.entries(p.xpTopicos || {})) xpMateria[materiaDoTopico(k)] += n(v);
  const maxMateria = Math.max(1, ...Object.values(xpMateria));
  const radar = MATERIAS.map(m => [m.nome.replace(' Geral', ''), Math.round(xpMateria[m.id] / maxMateria * 100)]);
  const movMax = Math.max(1, ...MOVES.map(m => n(bt.golpes[m.id])));
  const favPet = [...PETS].sort((a, b) => n(bt.pets[b.id]?.esc) - n(bt.pets[a.id]?.esc))[0];
  const temFav = n(bt.pets[favPet.id]?.esc) > 0;

  const conquistas = [
    { t: 'Primeira vitória', d: 'Concluir a primeira partida', ic: Trophy, v: Math.min(1, jogos), m: 1 },
    { t: 'Mão firme', d: '50 acertos no Quiz', ic: Target, v: Math.min(50, n(p.treinos?.quiz?.acertos)), m: 50 },
    { t: 'Plantão perfeito', d: 'Concluir um Plantão médico seguro', ic: Award, v: Math.min(1, n(p.ddx?.seguros)), m: 1 },
    { t: 'Caçador de diagnósticos', d: `Descobrir as ${DOENCAS.length} doenças da Batalha`, ic: Crosshair, v: bt.descobertas.length, m: DOENCAS.length },
    { t: 'Road to Doctor', d: 'Concluir a História da Batalha', ic: Swords, v: Math.min(DOENCAS.length, n(bt.historia)), m: DOENCAS.length },
    { t: 'Sequência de 7', d: '7 cruzadinhas seguidas', ic: Medal, v: Math.min(7, recorde), m: 7 },
  ];

  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr">
    {topo}
    <div className="scroll st" ref={sc} onScroll={spy}>
      <nav className="st-nav" aria-label="Seções das estatísticas">{NAV.map(([id, t]) => <button key={id} className={on === id ? 'on' : ''} aria-current={on === id} onClick={() => ir(id)}>{t}</button>)}</nav>

      <Sec id="resumo" num={1} t="Resumo geral" sub={`nível ${L.nivel} · ${fmt(L.xp)} XP`}>
        <div className="st-grid">
          <div className="card parecer c5 rise">
            <div className="pr-top">
              <Grade v={media} big />
              <div><span className="kicker">Parecer do plantão</span><b>{media == null ? 'Sem acertos registrados ainda' : `Rank ${nota(media)} · aproveitamento de ${media}%`}</b>
                {hist && <small className="mono">HI-SCORE SEMANAL · {fmt(Math.max(...hist.semanas.map(s => s.xp)))} XP</small>}</div>
            </div>
            <div className="pr-sec"><span>IMPRESSÃO</span><p>
              {forte ? <>Melhor aproveitamento em {forte.nome} ({forte.acc}%).</> : null}
              {fraco && fraco.id !== forte?.id ? <> Mais baixo em {fraco.nome} ({fraco.acc}%).</> : null}
              {tema ? <> Assunto com mais erros: {tema.tema.toLowerCase()}, {tema.erros} erro{tema.erros > 1 ? 's' : ''} ({tema.fonte}).</> : hist ? <> Nenhum erro registrado nos modos de pergunta.</> : null}
            </p></div>
            <div className="pr-sec"><span>PLANO</span><ol>
              <li>{revisao ? <>Revisão Inteligente: <b>{revisao.disponiveis} ite{revisao.disponiveis === 1 ? 'm' : 'ns'}</b> disponíve{revisao.disponiveis === 1 ? 'l' : 'is'} agora.</> : <>Revisão Inteligente: abra a revisão para consultar sua fila.</>}</li>
              <li>{faltaDex ? <>Batalha diagnóstica: descobrir <b>{faltaDex} doença{faltaDex > 1 ? 's' : ''}</b> que falta{faltaDex > 1 ? 'm' : ''}.</> : <>Batalha diagnóstica: todas as doenças descobertas.</>}</li>
              <li>{recorde >= 7 ? <>Sequência: conquista de 7 cruzadinhas garantida.</> : <>Sequência: faltam <b>{7 - seq > 0 ? 7 - seq : 1} cruzadinha{7 - seq > 1 ? 's' : ''}</b> para a conquista de 7.</>}</li>
            </ol></div>
            <div className="pr-foot mono"><span>Gerado a partir de {jogos} partida{jogos > 1 ? 's' : ''}</span>{admin && <button className="w-link" onClick={() => setTelaAtual('revisaoInteligente')}>Revisar agora <ArrowRight size={14} /></button>}</div>
          </div>
          <div className="kpis c7">
            <div className="kpi rise" style={{ '--i': 1 }}><span className="k-l"><Sparkles size={14} />XP acumulado</span><b className="mono"><CountNum to={L.xp} /></b>{semanaAtual ? <small className="up">▲ {fmt(semanaAtual.xp)} esta semana</small> : <small>somando a semana…</small>}</div>
            <div className="kpi rise" style={{ '--i': 2 }}><span className="k-l"><Trophy size={14} />Nível</span><b className="mono">{L.nivel}</b><small>{fmt(L.proximo - L.xp)} XP para o nível {L.nivel + 1}</small><span className="bar" style={{ height: 5 }}><span style={{ width: `${show1 ? L.percentual : 0}%` }} /></span></div>
            <div className="kpi rise" style={{ '--i': 3 }}><span className="k-l"><Ticket size={14} />Tickets</span><b className="mono">{n(p.tickets)}</b><small>2 por cruzadinha concluída</small></div>
            <div className="kpi rise" style={{ '--i': 4 }}><span className="k-l"><BookOpen size={14} />Partidas</span><b className="mono">{jogos}</b>{semanaAtual ? <small className={semanaAtual.partidas ? 'up' : ''}>{semanaAtual.partidas ? `▲ ${semanaAtual.partidas} esta semana` : 'nenhuma esta semana'}</small> : <small>somando a semana…</small>}</div>
            <div className="kpi kpi-d rise" style={{ '--i': 5 }}><span className="k-l"><Check size={14} />Taxa de conclusão</span>{hist ? (conclusao == null ? <small>sem partidas registradas</small> : <><Donut v={conclusao} show={show2} /><small>{hist.conclusao.concluidas} de {hist.conclusao.total} iniciadas</small></>) : <Sk h={58} />}</div>
            <div className="kpi rise" style={{ '--i': 6 }}><span className="k-l"><FlameIcon size={14} />Sequência</span><b className="mono">{seq} <em>cruzadinhas</em></b><small>recorde: {recorde}</small></div>
          </div>
        </div>
      </Sec>

      <Sec id="modos" num={2} t="Desempenho por modo" sub="acertos, erros, XP e recompensas">
        <div className="card mtab">
          <div className="mrow mhead mono" aria-hidden="true"><span>MODO</span><span>NOTA</span><span>PARTIDAS</span><span>ACERTOS · ERROS</span><span>XP</span><span>RECOMPENSAS</span></div>
          {modos.map((m, i) => {
            const a = pct(m.acertos, m.erros);
            return <div key={m.id} className="mrow rise" style={{ '--i': i }}>
              <span className="m-name"><i style={{ background: m.cor }} />{m.nome}</span>
              <Grade v={a} />
              <span className="mono m-j">{m.partidas}<small> partidas</small></span>
              <span className="m-acc">{a == null ? <small className="muted">sem partidas</small> : <><span className="stack"><span className="ok" style={{ width: `${show1 ? a : 0}%` }} /><span className="no" style={{ width: `${show1 ? 100 - a : 0}%` }} /></span><small className="mono"><b>{a}%</b> · {fmt(m.acertos)} ✓ {fmt(m.erros)} ✗ {m.unidade}</small></>}</span>
              <span className="mono m-xp">{fmt(m.xp)}<small> XP</small></span>
              <span className="m-rw">{m.recompensa}</span>
            </div>;
          })}
        </div>
      </Sec>

      <Sec id="ddx" num={3} t="DDX" sub="por doença, agente e matéria">
        <div className="st-grid">
          <div className="card c4"><h3 className="st-h3">Por doença</h3><div className="hb">{porDoenca.length ? porDoenca.map(([t, v, k, id]) => <div key={id} className="hb-r"><span className="hb-t">{t}<small>{k} caso{k > 1 ? 's' : ''}</small></span><Bar v={v} show={show1} color={v < 60 ? 'var(--amber)' : undefined} /><b className="mono">{v}%</b></div>) : <small className="muted">Sem casos concluídos ainda.</small>}</div></div>
          <div className="card c4"><h3 className="st-h3">Por agente</h3><div className="hb">{porAgente.map(([t, v, c]) => <div key={t} className="hb-r"><span className="hb-t">{t}</span>{v == null ? <small className="muted">sem casos ainda</small> : <><Bar v={v} show={show1} color={c} /><b className="mono">{v}%</b></>}</div>)}</div></div>
          <div className="card c4"><h3 className="st-h3">XP por matéria</h3><Radar data={radar} show={show1} /></div>
        </div>
      </Sec>

      <Sec id="batalha" num={4} t="Batalha diagnóstica" sub={admin ? 'piloto do administrador' : 'em breve'}>
        <div className="st-grid">
          <div className="card c7 bt-dex-card">
            <h3 className="st-h3">Diagnósticos descobertos <span className="mono">{bt.descobertas.length}/{DOENCAS.length}</span></h3>
            <div className="dex sm">{DOENCAS.map(d => { const v = bt.descobertas.includes(d.id); return <div key={d.id} className={`dex-c ${v ? 'on' : ''}`}><span className="dex-art"><Species id={d.id} /></span><b>{v ? d.nome : '???'}</b><small style={{ color: v ? AGENTE[d.agente].cor : undefined }}>{v ? AGENTE[d.agente].nome : 'NÃO DESCOBERTA'}</small></div>; })}</div>
            <div className="bt-row">
              <div className="bt-ctrl"><Donut v={n(bt.partidas) ? Math.round((n(bt.vitorias) / n(bt.partidas)) * 100) : 0} size={64} color="#ff5c8a" show={show1} /><span><b className="mono">{n(bt.vitorias)}/{n(bt.partidas)}</b><small>doenças controladas</small></span></div>
              <div className="bt-buffs"><small className="st-mini">BUFFS ENFRENTADOS</small><div>{DOENCAS.map(d => { const k = n(bt.buffs[d.id]); return <span key={d.id} className={`bchip ${k ? '' : 'off'}`}>{k ? d.buff.nome : '???'}{k ? <b className="mono">×{k}</b> : null}</span>; })}</div></div>
            </div>
          </div>
          <div className="card c5"><h3 className="st-h3">Habilidades mais usadas</h3><div className="hb">{[...MOVES].sort((a, b) => n(bt.golpes[b.id]) - n(bt.golpes[a.id])).map(m => <div key={m.id} className="hb-r"><span className="hb-t">{m.nome}<small>{m.cat}</small></span><Bar v={(n(bt.golpes[m.id]) / movMax) * 100} show={show1} color={m.cor} /><b className="mono">{n(bt.golpes[m.id])}×</b></div>)}</div></div>
        </div>
      </Sec>

      <Sec id="pets" num={5} t="Pets clínicos" sub="especialidade, ativações e sucesso">
        <div className="petst">{PETS.map((pt, i) => {
          const t = { esc: 0, ativ: 0, suc: 0, ...bt.pets[pt.id] };
          const fav = temFav && pt.id === favPet.id;
          return <div key={pt.id} className={`card petst-c rise ${fav ? 'fav' : ''}`} style={{ '--i': i, '--pc': pt.cor }}>
            {fav && <span className="fav-tag mono">FAVORITO</span>}
            <span className="petst-art"><PetArt id={pt.id} /></span>
            <div className="petst-t"><b>{pt.nome}</b><small>{pt.esp} · {pt.hab}</small></div>
            <div className="petst-n"><span><b className="mono">{t.esc}</b><small>escolhido</small></span><span><b className="mono">{t.ativ}</b><small>ativações</small></span></div>
            {t.ativ ? <Donut v={Math.round((t.suc / t.ativ) * 100)} size={54} color={pt.cor} show={show1} /> : <small className="muted petst-na">sem ativações</small>}
          </div>;
        })}</div>
      </Sec>

      <Sec id="aprendizado" num={6} t="Aprendizado" sub="onde você mais erra">
        <div className="st-grid">
          <div className="card c7"><h3 className="st-h3">Assuntos com mais erros</h3>{hist ? <div className="hb">{hist.erros.length ? hist.erros.map(e => <div key={e.tema} className="hb-r"><span className="hb-t">{e.tema}<small>{e.fonte}</small></span><Bar v={(e.erros / hist.erros[0].erros) * 100} show={show2} color="var(--crimson)" /><b className="mono">{e.erros}</b></div>) : <small className="muted">Nenhum erro registrado no Quiz, no Verdadeiro ou mentira e na Batalha.</small>}</div> : <Sk h={170} />}</div>
          <div className="card c5 rev"><h3 className="st-h3"><Brain size={16} />Revisão Inteligente</h3>
            <div className="rev-n"><b className="mono">{revisao ? revisao.disponiveis : '–'}</b><span>itens disponíveis agora</span></div>
            <p className="muted" style={{ fontSize: 12.5 }}>{revisao ? `${revisao.aguardando} aguardando o intervalo${revisao.proximaRevisao ? ` · próxima liberação ${quando(revisao.proximaRevisao).toLowerCase()}` : ''}. ` : 'A fila é consultada ao abrir a revisão. '}Cada item volta até você acertar em dias diferentes.</p>
            {admin ? <button className="primary" onClick={() => setTelaAtual('revisaoInteligente')}><Brain size={17} />Revisar agora</button> : <p className="note">Revisão Inteligente em piloto.</p>}
          </div>
        </div>
      </Sec>

      <Sec id="historico" num={7} t="Histórico" sub="partidas recentes e evolução semanal">
        {hist ? <div className="st-grid">
          <div className="card c7"><h3 className="st-h3">Evolução semanal <span className="lg"><i className="lg-b" />XP <i className="lg-l" />% de acerto</span></h3><WeekChart semanas={hist.semanas} show={show2} w={web ? 560 : 340} />
            <div className="h-kpis"><span><Clock3 size={14} /><b className="mono">{duracao(cruz.tempoMedio)}</b><small>tempo médio por cruzadinha</small></span><span><Trophy size={14} /><b className="mono">{fmt(Math.max(...hist.semanas.map(s => s.xp)))}</b><small>melhor semana</small></span></div>
          </div>
          <div className="card c5"><h3 className="st-h3">Partidas recentes</h3><div className="hist">{hist.recentes.length ? hist.recentes.map((h, i) => <div key={i} className="h-r"><i style={{ background: COR_MODO[h.modo] || 'var(--muted)' }} /><span className="h-t"><b>{h.titulo}</b><small>{quando(h.data)} · {NOME_MODO[h.modo] || h.modo}</small></span><span className={`h-x mono ${h.ok ? '' : 'no'}`}>+{fmt(h.xp)}</span></div>) : <small className="muted">As próximas partidas aparecem aqui.</small>}</div></div>
        </div> : erro ? <div className="card cbt-erro" role="alert"><p>Não foi possível buscar o histórico agora.</p><button className="ghost" onClick={() => { setErro(''); setTentativa(t => t + 1); }}><RotateCcw size={15} /> Tentar de novo</button></div>
          : <div className="st-grid"><div className="c7"><Sk h={270} /></div><div className="c5"><Sk h={270} /></div></div>}
      </Sec>

      <Sec id="conquistas" num={8} t="Conquistas" sub={`${conquistas.filter(c => c.v >= c.m).length} de ${conquistas.length} desbloqueadas`}>
        <div className="achs">{conquistas.map((c, i) => {
          const ok = c.v >= c.m, Ic = c.ic;
          return <div key={c.t} className={`ach rise ${ok ? 'ok' : ''}`} style={{ '--i': i }}>
            <span className="ach-b">{ok ? <Ic size={22} /> : <Lock size={18} />}</span>
            <b>{c.t}</b><small>{c.d}</small>
            {ok ? <span className="ach-s mono">DESBLOQUEADA</span> : <span className="ach-p"><span className="sbar"><span style={{ width: `${show1 ? (c.v / c.m) * 100 : 0}%` }} /></span><small className="mono">{c.v}/{c.m}</small></span>}
          </div>;
        })}</div>
        <p className="note">Resumo, modos, DDX, Batalha, pets e conquistas saem do seu perfil. Erros por tema, semanas e partidas recentes vêm do histórico salvo no servidor.</p>
      </Sec>
    </div>
    {!web && <Tabbar on="estatisticas" ir={setTelaAtual} />}
  </div></div>;
}
