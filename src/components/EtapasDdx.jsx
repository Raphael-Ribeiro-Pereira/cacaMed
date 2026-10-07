import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ClipboardCheck, ExternalLink, GitBranch, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { obterAuditoria } from '../utils/erroMedico';
import { obterRelacao } from '../utils/causaEfeito';
import { nivelPorXP } from '../utils/economia';
import { cadeiaDe, nomeEtapa, registrosComHora } from '../utils/ddxVisual';
import { animar, latenciaPrevista, registrarLatencia, useLargo } from '../utils/prototipo';
import { MiniEcg } from './prototipoUi';
import { Cadeia } from './ddxUi';
import { Resultado, SubiuNivel } from './resultadoUi';

// Erro médico e Causa e efeito no visual do protótipo de movimento. A etapa seguinte abre na hora e as
// alternativas entram no ritmo da gravação da anterior; a resposta só vale depois que o servidor grava.
const CONFIG = {
  erroMedico: { idCampo: 'auditoriaId', obter: obterAuditoria, acao: 'responderAuditoria', titulo: 'Erro médico', stamp: 'AUDITORIA CONCLUÍDA', Icone: ClipboardCheck,
    comoFunciona: 'Leia o prontuário e aponte o que falhou no atendimento.' },
  causaEfeito: { idCampo: 'relacaoId', obter: obterRelacao, acao: 'responderRelacao', titulo: 'Causa e efeito', stamp: 'MAPA CONCLUÍDO', Icone: GitBranch,
    comoFunciona: 'Ligue cada elo da cadeia, do estímulo à resposta ao tratamento.' },
};

export default function EtapasDdx({ modo, usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const cfg = CONFIG[modo];
  const causa = modo === 'causaEfeito';
  const web = useLargo();
  const entrada = dadosUsuario?.[modo]?.entrada;
  const dados = entrada ? cfg.obter(entrada[cfg.idCampo]) : null;
  const [comecou, setComecou] = useState(() => Boolean(entrada?.respostas?.length || entrada?.relatorio));
  const [locais, setLocais] = useState(null);
  const [sel, setSel] = useState(null);
  const [gravacao, setGravacao] = useState({});
  const [intervalo, setIntervalo] = useState(90);
  const [atrasou, setAtrasou] = useState(false);
  const [subiu, setSubiu] = useState(null);
  const ultimaGravacao = useRef(0);

  const respostas = locais && entrada && locais.length > entrada.respostas.length ? locais : entrada?.respostas || [];
  const i = respostas.length;
  const total = dados?.perguntas.length || 0;
  const q = dados?.perguntas[i];
  const anteriorGravada = Boolean(entrada) && entrada.respostas.length >= respostas.length;

  useEffect(() => {
    if (!q) return undefined;
    const t = setTimeout(() => setAtrasou(true), (q.alternativas.length + 1) * intervalo + 400);
    return () => { clearTimeout(t); setAtrasou(false); };
  }, [i, intervalo, q]);

  const gravar = async novas => {
    const idx = novas.length - 1;
    const chamada = ++ultimaGravacao.current;
    setGravacao(g => ({ ...g, [idx]: 'pend' }));
    const inicio = performance.now();
    try {
      const perfil = await servicoPerfil(usuario, cfg.acao, { entradaId: entrada.id, respostas: novas });
      registrarLatencia(performance.now() - inicio);
      const antes = nivelPorXP(dadosUsuario?.pontuacaoTotal), agora = nivelPorXP(perfil?.pontuacaoTotal);
      if (agora > antes) setTimeout(() => setSubiu({ from: antes, to: agora, xp: Number(perfil.pontuacaoTotal) || 0 }), animar() ? 1300 : 0);
      setDadosUsuario(perfil);
      setGravacao(g => ({ ...g, [idx]: 'ok' }));
    } catch {
      if (chamada === ultimaGravacao.current) setGravacao(g => ({ ...g, [idx]: 'err' }));
    }
  };
  const confirmar = () => {
    if (!sel || !anteriorGravada || !entrada || entrada.relatorio) return;
    const novas = [...respostas, sel];
    setLocais(novas); setSel(null);
    const seguinte = dados.perguntas[Math.min(novas.length, total - 1)];
    setIntervalo(animar() ? Math.min(650, Math.max(140, latenciaPrevista() / (seguinte.alternativas.length + 1))) : 0);
    gravar(novas);
  };

  useEffect(() => {
    if (!comecou || !q) return undefined;
    const tecla = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea')) return;
      const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : e.key.length === 1 ? 'abcd'.indexOf(e.key.toLowerCase()) : -1;
      if (n >= 0) { const a = q.alternativas[n]; if (a) setSel(a.id); }
      if (e.key === 'Enter' && !e.target.closest?.('button, a')) { e.preventDefault(); confirmar(); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  const voltarDdx = () => setTelaAtual('selecaoDDX');
  const raiz = conteudo => <div className={`cbt ${web ? 'web' : ''}`}>{conteudo}<AnimatePresence>{subiu && <SubiuNivel key="lvl" info={subiu} onClose={() => setSubiu(null)} />}</AnimatePresence></div>;
  const topbar = <div className="topbar"><button className="icon-btn" onClick={voltarDdx} aria-label="Voltar ao DDX"><ChevronLeft /></button>
    <h1><small>{cfg.titulo}{dados ? ` · ${dados.caso.paciente}` : ''}</small>{dados?.titulo || cfg.titulo}</h1></div>;

  if (!entrada || !dados) return raiz(<div className="cbt-scr">{topbar}
    <div className="scroll plain" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <span>Nenhuma análise aberta. Escolha um caso no DDX para começar.</span>
      <button className="primary violet" style={{ maxWidth: 260 }} onClick={voltarDdx}>Ir para o DDX</button>
    </div></div>);

  if (entrada.relatorio) {
    const r = entrada.relatorio;
    const linhas = r.etapas.map(e => [`${nomeEtapa(e.id)} ${e.acertou ? '✓' : '✗'}`, e.acertou ? '+25' : '+0', e.acertou ? 'pos' : 'mut']);
    if (entrada.repeticao) linhas.push(['Repetição da versão', '×0', 'mut']);
    return raiz(<Resultado key={entrada.id} stamp={cfg.stamp} tom="violet" recibo={entrada.id} sub={`${dados.titulo} · ${r.acertos}/${r.total} acertos`}
      linhas={linhas} total={Number(entrada.xpConcedido) || 0} fase="ok" aviso={entrada.repeticao ? 'Repetição: XP só na primeira conclusão desta versão.' : null}
      principal={{ rotulo: 'Voltar ao DDX', aoClicar: voltarDdx }} aoVoltar={() => setTelaAtual('menu')}
      detalhes={<>
        {causa && <Cadeia nos={cadeiaDe(dados)} respondidas={r.etapas.length} resultados={r.etapas.map(e => e.acertou)} />}
        {r.etapas.map(e => <div key={e.id} className="det">
          <b className={e.acertou ? 'yes' : 'no'}>{e.acertou ? <Check /> : <X />}{nomeEtapa(e.id)}: {e.titulo}</b>
          <p>Sua resposta: {e.escolha}</p>
          {!e.acertou && <p>Esperada: {e.correta}</p>}
          <p style={{ color: 'var(--muted)' }}>{e.explicacao}</p>
        </div>)}
        {dados.caso.fonte && <a className="det" href={dados.caso.fonte} target="_blank" rel="noreferrer" style={{ color: 'var(--mint)', display: 'flex', gap: 6, alignItems: 'center' }}>Referência para revisão <ExternalLink size={13} /></a>}
      </>} />);
  }

  const { Icone } = cfg;
  const prontuario = respondidas => <>
    {causa ? <>
      <Cadeia nos={cadeiaDe(dados)} respondidas={respondidas} />
      <div className="sec"><h2>Cenário</h2></div>
      <div className="feed">{dados.registros.map((t, k) => <div key={k} className="ev rise" style={{ '--i': k }}><p>{t}</p></div>)}</div>
    </> : <>
      <div className="sec" style={{ marginTop: 6 }}><h2>Prontuário auditado</h2><span>{dados.registros.length} registros</span></div>
      <div className="chart">{registrosComHora(dados.registros).map(([hora, texto], k) => <div key={k} className="chart-row rise" style={{ '--i': k }}><time>{hora}</time><span className="ln" /><p>{texto}</p></div>)}</div>
    </>}
    <div className="det" style={{ marginTop: 12 }}><b><Icone size={15} /> Antes de começar</b><p>{dados.contexto}</p></div>
  </>;
  const pendenteAnterior = i > 0 ? gravacao[i - 1] : null;
  const pergunta = q ? <>
    <div className="stepper" style={{ marginBottom: 12 }}>{dados.perguntas.map((_, k) => <span key={k} className={k < i ? 'done' : k === i ? 'cur' : ''} />)}</div>
    {causa && !web && <Cadeia nos={cadeiaDe(dados)} respondidas={i} />}
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={i} initial={animar() ? { opacity: 0, x: 40 } : false} animate={{ opacity: 1, x: 0 }} exit={animar() ? { opacity: 0, x: -40 } : undefined} transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'grid', gap: 12 }}>
        <span className="kicker" style={{ color: '#b49cff' }}>Etapa {i + 1} de {total} · {nomeEtapa(q.id)}</span>
        <p className="q">{q.titulo}</p>
        <div className="opts">{q.alternativas.map((a, k) => <button key={a.id} className={`opt ${sel === a.id ? 'on' : ''} ${animar() ? 'opt-in' : ''}`} style={{ animationDelay: `${(k + 1) * intervalo}ms` }} onClick={() => setSel(a.id)} aria-pressed={sel === a.id}>
          <span className="ltr">{web ? k + 1 : 'ABCD'[k]}</span><span>{a.texto}</span></button>)}</div>
      </motion.div>
    </AnimatePresence>
  </> : <div className="det" role="status" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
    {gravacao[i - 1] === 'err' ? <span>A última etapa não gravou. Reenvie para ver o relatório.</span> : <><MiniEcg /><span>Concluindo a análise e calculando o relatório…</span></>}
  </div>;
  const avisoGravacao = i > 0 && (pendenteAnterior === 'err' || (pendenteAnterior === 'pend' && (atrasou || !q))) && <div className="info" style={{ justifyContent: 'center' }}>
    {pendenteAnterior === 'err'
      ? <button className="sync err" onClick={() => gravar(respostas)}><span className="dot" />Etapa {i} não gravou. Toque para reenviar</button>
      : <span className="sync"><span className="dot" />Ainda gravando a etapa {i}</span>}
  </div>;
  const dockConfirmar = <div className="dock">
    {avisoGravacao}
    {web && q && <span className="kbd-hint"><kbd>1</kbd>–<kbd>4</kbd> escolher · <kbd>Enter</kbd> confirmar</span>}
    {q && <button className="primary violet" disabled={!sel || !anteriorGravada} onClick={confirmar}>{i === total - 1 ? 'Confirmar e concluir' : 'Confirmar etapa'}</button>}
  </div>;
  const dockIntro = <div className="dock"><div className="info"><span>{total} ETAPAS · <b>25 XP</b> CADA</span><span>RESPOSTAS NÃO MUDAM</span></div>
    <button className="primary violet" onClick={() => setComecou(true)}>Começar análise</button></div>;

  if (web) return raiz(<div className="cbt-scr">
    {topbar}
    <div className="et-grid">
      <aside className="et-left">{prontuario(comecou ? i : 0)}</aside>
      <section className="et-right">
        <div className="scroll">
          {!comecou ? <div style={{ display: 'grid', gap: 12 }}>
            <span className="kicker" style={{ color: '#b49cff' }}>Como funciona</span>
            <p className="q">{cfg.comoFunciona}</p>
            {dados.perguntas.map((p, k) => <div key={p.id} className="mission rise" style={{ '--i': k, gridTemplateColumns: '26px 1fr' }}><span className="mono" style={{ color: '#b49cff', fontWeight: 700 }}>{k + 1}</span><span style={{ fontSize: 13.5 }}>{nomeEtapa(p.id)}</span></div>)}
          </div> : pergunta}
        </div>
        {!comecou ? dockIntro : dockConfirmar}
      </section>
    </div>
  </div>);
  return raiz(<div className="cbt-scr">
    {topbar}
    {!comecou ? <>
      <div className="scroll" style={{ paddingTop: 0 }}>{prontuario(0)}</div>
      {dockIntro}
    </> : <>
      <div className="scroll" style={{ paddingTop: 0 }}>{pergunta}</div>
      {dockConfirmar}
    </>}
  </div>);
}
