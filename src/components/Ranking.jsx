import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronLeft, Trophy } from 'lucide-react';
import { buscarCoroasPublicas, buscarRankingPublico, calcularIdPublico, sincronizarRanking } from '../services/rankingPublico';
import { MATERIAS, coroasDoJogador, montarTabelaCoroas, semanaCoroas, xpDaSemana } from '../utils/coroas';
import { fotoDoPerfil } from '../utils/fotosCracha';
import { animar, fmt, gravarLocal, lerLocal, useLargo } from '../utils/prototipo';
import { Avatar, Podium } from './prototipoUi';
import { Coroas, TagsCoroa, Trono } from './CoroasMateria';
import '../prototipo.css';

// 🌻 Easter egg (mantido): partículas R, C e ❤️.
const ParticulaRomantica = ({ id, texto, posicaoInicial, duracao, tamanho, derivaH, onFinalizar }) => {
  useEffect(() => {
    const timer = setTimeout(() => onFinalizar(id), duracao * 1000);
    return () => clearTimeout(timer);
  }, [id, duracao, onFinalizar]);
  return <div style={{ position: 'fixed', bottom: '80px', left: `${posicaoInicial}px`, fontSize: `${tamanho}rem`, fontWeight: 'bold', color: '#d4004b',
    opacity: 0.9, pointerEvents: 'none', zIndex: 10000, animation: `flutuarRomantico ${duracao}s cubic-bezier(0.25, 1, 0.5, 1) forwards`, '--deriva-horizontal': `${derivaH}px` }}>{texto}</div>;
};

// Última lista desta sessão do app: na segunda visita o ranking abre na hora e atualiza por trás.
let cacheRanking = null;
const CRITERIOS = [['xp', 'XP'], ['letras', 'Letras certas'], ['tempo', 'Tempo médio']];
const minutos = s => s == null ? '—' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function Ranking({ usuario, dadosUsuario, setTelaAtual, abaInicial = 'temporada',
  buscarRanking = buscarRankingPublico, buscarCoroas = buscarCoroasPublicas, sincronizar = sincronizarRanking }) {
  const web = useLargo();
  const uid = useId();
  const foto = fotoDoPerfil(dadosUsuario);
  const meuNome = dadosUsuario?.nome || dadosUsuario?.username || 'Você';
  const [aba, setAba] = useState(abaInicial);
  const [criterio, setCriterio] = useState('xp');
  const [meuId, setMeuId] = useState(null);
  const [lista, setLista] = useState(cacheRanking);
  const [primeira] = useState(!cacheRanking);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [particulas, setParticulas] = useState([]);
  const [trono, setTrono] = useState(null);
  const [publica, setPublica] = useState(null);
  const [antesGuardado, setAntesGuardado] = useState(null);
  const [trocaVista, setTrocaVista] = useState(false);
  const [erroCoroas, setErroCoroas] = useState('');
  const perfilRef = useRef(dadosUsuario);
  useEffect(() => { perfilRef.current = dadosUsuario; }, [dadosUsuario]);

  useEffect(() => {
    let vivo = true;
    calcularIdPublico(usuario.uid).then(id => { if (vivo) setMeuId(id); });
    return () => { vivo = false; };
  }, [usuario.uid]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        await sincronizar(usuario, perfilRef.current);
        const r = await buscarRanking();
        cacheRanking = r;
        if (vivo) setLista(r);
      } catch (falha) {
        console.error('Erro ao carregar ranking público:', falha);
        if (vivo) setErro(true);
      }
    })();
    return () => { vivo = false; };
  }, [usuario, tentativa, buscarRanking, sincronizar]);

  // Coroas: abre com a última visita guardada no aparelho e confere o servidor por trás.
  const salvo = useMemo(() => (meuId ? lerLocal('cacoMed-coroas-' + meuId) : null), [meuId]);
  useEffect(() => {
    if (!meuId) return undefined;
    let vivo = true;
    buscarCoroas().then(nova => {
      if (!vivo) return;
      if (salvo?.semana === nova.semana && salvo.vista) setAntesGuardado(salvo.vista);
      setPublica(nova);
      gravarLocal('cacoMed-coroas-' + meuId, { semana: nova.semana, vista: montarTabelaCoroas(nova, meuId, meuNome, xpDaSemana(perfilRef.current)) });
    }).catch(falha => { if (vivo) setErroCoroas(falha.message); });
    return () => { vivo = false; };
  }, [meuId, salvo, buscarCoroas, meuNome]);
  // A troca de dono é anunciada uma vez, quando a aba de coroas aparece; depois o cartão fica parado no novo estado.
  useEffect(() => {
    if (aba !== 'coroas' || !antesGuardado || trocaVista) return undefined;
    const t = setTimeout(() => setTrocaVista(true), 6000);
    return () => clearTimeout(t);
  }, [aba, antesGuardado, trocaVista]);
  const antes = aba === 'coroas' && !trocaVista ? antesGuardado : null;
  const base = publica || (salvo?.semana === semanaCoroas() ? { semana: salvo.semana, materias: Object.fromEntries(Object.entries(salvo.vista.materias)
    .map(([k, l]) => [k, l.filter(r => !r.me).map(r => ({ idPublico: r.id, nome: r.nome, xp: r.xp }))])) } : null);
  const tabela = montarTabelaCoroas(base, meuId, meuNome, xpDaSemana(dadosUsuario));

  const ordenada = useMemo(() => {
    if (!lista) return null;
    const l = lista.map((r, i) => ({ id: r.idPublico || `linha-${i}`, nome: String(r.nome || 'Doutor(a)'), xp: Number(r.xpGlobal) || 0, letras: Number(r.letras) || 0,
      tempo: r.tempoMedio == null ? null : Number(r.tempoMedio), me: Boolean(meuId) && r.idPublico === meuId }));
    if (criterio === 'xp') l.sort((a, b) => b.xp - a.xp || a.id.localeCompare(b.id));
    else if (criterio === 'letras') l.sort((a, b) => b.letras - a.letras || a.id.localeCompare(b.id));
    else l.sort((a, b) => (a.tempo ?? Infinity) - (b.tempo ?? Infinity) || a.id.localeCompare(b.id));
    return l.map(r => ({ ...r, valor: criterio === 'xp' ? r.xp : criterio === 'letras' ? r.letras : r.tempo }));
  }, [lista, criterio, meuId]);
  const formatar = v => criterio === 'xp' ? `${fmt(v)} XP` : criterio === 'letras' ? `${fmt(v)} letras` : minutos(v);
  const pos = ordenada ? ordenada.findIndex(r => r.me) : -1;

  // Movimento da posição desde a última visita (só no ranking por XP).
  const posAnterior = useMemo(() => (meuId ? lerLocal('cacoMed-rank-pos-' + meuId) : null), [meuId]);
  useEffect(() => { if (meuId && criterio === 'xp' && pos >= 0 && lista) gravarLocal('cacoMed-rank-pos-' + meuId, pos); }, [meuId, criterio, pos, lista]);
  const delta = criterio === 'xp' && Number.isInteger(posAnterior) && pos >= 0 ? posAnterior - pos : 0;
  const stagger = primeira && animar();

  const dispararParticulas = () => {
    const textos = ['R', 'C', '❤️'];
    setParticulas(p => [...p, ...Array.from({ length: 10 }, (_, i) => ({ id: Date.now() + i, texto: textos[Math.floor(Math.random() * textos.length)],
      posicao: Math.random() * (window.innerWidth - 60) + 30, duracao: (Math.random() * 2 + 3).toFixed(2), tamanho: (Math.random() * 0.5 + 1).toFixed(2), derivaH: (Math.random() * 100 - 50).toFixed(0) }))]);
  };
  const removerParticula = useCallback(id => setParticulas(p => p.filter(x => x.id !== id)), []);

  const acima = pos > 0 ? ordenada[pos - 1] : null;
  const distancia = !acima ? null : criterio === 'xp' ? <>Faltam <b>{fmt(acima.xp - ordenada[pos].xp + 1)} XP</b> para passar {acima.nome}.</>
    : criterio === 'letras' ? <>Faltam <b>{fmt(acima.letras - ordenada[pos].letras + 1)} letras</b> para passar {acima.nome}.</>
      : ordenada[pos].tempo == null ? <>Jogue uma cruzadinha para registrar seu tempo médio.</> : <>Reduza <b>{Math.max(1, ordenada[pos].tempo - acima.tempo + 1)}s</b> para passar {acima.nome}.</>;

  return <div className={`cbt ${web ? 'web' : ''}`}>
    <style>{'@keyframes flutuarRomantico { 0% { transform: translateY(0) translateX(0); opacity: .9; } 10% { opacity: 1; } 80% { opacity: .7; } 100% { transform: translateY(-300px) translateX(var(--deriva-horizontal)); opacity: 0; } }'}</style>
    {particulas.map(p => <ParticulaRomantica key={p.id} id={p.id} texto={p.texto} posicaoInicial={p.posicao} duracao={p.duracao} tamanho={p.tamanho} derivaH={p.derivaH} onFinalizar={removerParticula} />)}
    <div className="cbt-scr r-ranking">
      <div className="topbar">
        <button className="icon-btn" onClick={() => setTelaAtual('menu')} aria-label="Voltar ao centro de comando"><ChevronLeft /></button>
        <h1><small>Ranking de plantonistas</small>Devoradores de Plantão</h1>
        {aba === 'coroas' ? <span className="chip"><span aria-hidden="true">👑</span><span>{coroasDoJogador(tabela).length}/{MATERIAS.length}</span></span>
          : <span className="chip"><Trophy /><span>{pos >= 0 ? `${pos + 1}º` : '–'}</span></span>}
      </div>
      <div className="rk-tabs" role="tablist" aria-label="Tipo de ranking">
        {[['temporada', 'Temporada'], ['coroas', 'Coroas por matéria']].map(([id, t]) => <button key={id} role="tab" aria-selected={aba === id} className={aba === id ? 'on' : ''} onClick={() => setAba(id)}>
          {aba === id && <motion.span layoutId={`rktab${uid}`} className="rk-pill" transition={animar() ? { type: 'spring', damping: 26, stiffness: 320 } : { duration: 0 }} />}
          <span className="rk-tl">{id === 'coroas' && <span aria-hidden="true">👑 </span>}{t}</span>
        </button>)}
      </div>
      {aba === 'coroas' ? <div className="scroll" key="coroas">
        <Coroas tabela={tabela} antes={antes} fresco={Boolean(publica)} erro={erroCoroas} web={web} foto={foto} onOpen={setTrono} />
      </div> : <div className="scroll" key="temporada">
        <nav className="st-nav rk-crit" aria-label="Ordenar ranking por">{CRITERIOS.map(([id, t]) => <button key={id} className={criterio === id ? 'on' : ''} aria-pressed={criterio === id} onClick={() => setCriterio(id)}>{t}</button>)}</nav>
        {erro && !ordenada ? <div className="card cbt-erro" role="alert"><p>Não foi possível carregar o ranking global.</p><button className="primary" onClick={() => { setErro(false); setTentativa(t => t + 1); }}>Tentar novamente</button></div> : <>
          {ordenada ? <Podium lista={ordenada} foto={foto} size="lg" subir={stagger} formatar={formatar} /> : <div className="sk" style={{ height: 230, maxWidth: 620, margin: '0 auto 18px' }} />}
          <div className="rklist">
            {ordenada ? ordenada.slice(3).map((r, i) => (
              <motion.div layout={animar()} key={r.id} className={`rk ${r.me ? 'me' : ''} ${stagger && i < 12 ? 'rise' : ''}`} style={{ '--i': i }} transition={{ type: 'spring', damping: 26, stiffness: 260 }}>
                <span className="pos">{i + 4}</span><Avatar nome={r.nome} me={r.me} foto={foto} size={32} /><b>{r.me ? 'Você' : r.nome}<TagsCoroa tabela={tabela} id={r.id} /></b>
                <span className="xp">{r.me && delta !== 0 && <span className={`move ${delta > 0 ? 'up' : 'down'}`}>{delta > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{Math.abs(delta)}</span>}{criterio === 'tempo' ? minutos(r.valor) : fmt(r.valor)}</span>
              </motion.div>
            )) : Array.from({ length: 5 }, (_, i) => <div key={i} className="sk sk-row" />)}
          </div>
          {ordenada && (pos > 0 ? <p className="gap-line" style={{ textAlign: 'center' }}>{distancia}</p>
            : pos === 0 ? <p className="gap-line" style={{ textAlign: 'center' }}>Você lidera a temporada. Segure a coroa.</p>
              : meuId && <p className="gap-line" style={{ textAlign: 'center' }}>Você ainda não aparece no Top 100 da temporada.</p>)}
          <p className="note" style={{ textAlign: 'center' }}>
            <button type="button" onClick={dispararParticulas} aria-label="Ativar surpresa" title="R ❤️ C" style={{ background: 'none', border: 0, fontSize: 20, marginRight: 6, verticalAlign: '-3px' }}>🌻</button>
            {erro ? 'Lista anterior exibida; não foi possível atualizar agora.' : !primeira && ordenada ? 'Lista anterior exibida; atualizando em segundo plano.' : `Top ${ordenada?.length || 100} da temporada.`}
          </p>
        </>}
      </div>}
    </div>
    <AnimatePresence>{trono && <Trono key={trono} m={MATERIAS.find(m => m.id === trono)} lista={tabela.materias[trono] || []} foto={foto}
      onClose={() => setTrono(null)} onJogar={() => { setTrono(null); setTelaAtual('topicos'); }} />}</AnimatePresence>
  </div>;
}
