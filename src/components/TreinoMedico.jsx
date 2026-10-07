import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { BrainCircuit, Check, ChevronLeft, ExternalLink, Flame, Play, ScanLine, Ticket, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { nivelPorXP } from '../utils/economia';
import { animar, fmt, gravarLocal, lerLocal, registrarLatencia, useLargo } from '../utils/prototipo';
import { MiniEcg } from './prototipoUi';
import { BotaoCarregar, Contagem, Resultado, SubiuNivel } from './resultadoUi';

// Quiz e Verdade ou mentira no visual do protótipo de movimento. As regras são as do jogo: cinco itens
// por rodada, conferidos pelo servidor (o gabarito não fica no aparelho), sem relógio e sem combo.
const CORES = { quiz: '#5cc8ff', verdadeMentira: 'var(--amber)' };
const REGRAS = {
  quiz: ['5 perguntas de múltipla escolha, uma por vez.', 'Teoria vale 20 XP por acerto; Casos clínicos, 25 XP.', 'Depois de cada resposta, a explicação e a fonte.', 'Duas rodadas com pelo menos 1 acerto valem 1 ticket.'],
  verdadeMentira: ['5 afirmações por rodada: de 1 a 4 são verdadeiras, e a quantidade é sorteada.', 'Arraste o cartão: direita é verdade, esquerda é mentira. As setas do teclado também funcionam.', 'No fim, você revisa as cinco e confirma; a correção vem junto.', '20 XP por frase certa. Duas rodadas com pelo menos 1 acerto valem 1 ticket.'],
};
const VARIANTES = [['teoria', 'Teoria', 20], ['casos', 'Casos clínicos', 25]];

function CartaoArrastar({ frase, n, lancar, aoResponder }) {
  const x = useMotionValue(0);
  const rot = useTransform(x, [-220, 220], [-16, 16]);
  const vOp = useTransform(x, [20, 110], [0, 1]);
  const mOp = useTransform(x, [-110, -20], [1, 0]);
  const foi = useRef(false);
  const ir = v => {
    if (foi.current) return;
    foi.current = true;
    if (!animar()) { aoResponder(v); return; }
    animate(x, v ? 460 : -460, { duration: .28, ease: 'easeIn' }).then(() => aoResponder(v));
  };
  useEffect(() => {
    if (lancar) ir(lancar.v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lancar]);
  return <motion.div className="vcard" style={{ x, rotate: rot }} drag="x" dragSnapToOrigin dragElastic={0.9}
    onDragEnd={(_, info) => { if (info.offset.x > 100) ir(true); else if (info.offset.x < -100) ir(false); }}
    initial={animar() ? { scale: .94, y: 14, opacity: .6 } : false} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ duration: .3 }}>
    <motion.span className="stamp-v" style={{ opacity: vOp }}>VERDADE</motion.span>
    <motion.span className="stamp-m" style={{ opacity: mOp }}>MENTIRA</motion.span>
    <span className="kicker">Afirmação {n}</span>
    <p>{frase.texto}</p>
    <span className="note" style={{ margin: 0 }}>Arraste para a direita se for verdade, para a esquerda se for mentira.</span>
  </motion.div>;
}

export default function TreinoMedico({ modo, usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const quiz = modo === 'quiz';
  const titulo = quiz ? 'Quiz médico' : 'Verdade ou mentira';
  const stats = dadosUsuario?.treinos?.[modo] || {};
  const entrada = stats.entrada;
  const ativa = Boolean(entrada && !entrada.encerrada);
  const [variante, setVariante] = useState(() => lerLocal('cacoMed-quiz-variante') === 'casos' ? 'casos' : 'teoria');
  const [novaRodada, setNovaRodada] = useState(false);
  const [contagem, setContagem] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [carregandoRodada, setCarregandoRodada] = useState(false);
  const [erro, setErro] = useState('');
  const [pendente, setPendente] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [escolhaEnviada, setEscolhaEnviada] = useState(null);
  const [subiu, setSubiu] = useState(null);
  const [folha, setFolha] = useState(null);
  const [marcas, setMarcas] = useState({});
  const [cartao, setCartao] = useState(0);
  const [lancar, setLancar] = useState(null);
  const folhaRef = useRef(null);

  async function enviar(pedido, depois) {
    if (ocupado) return null;
    setOcupado(true); setErro(''); setPendente({ pedido, depois });
    const inicio = performance.now();
    try {
      const perfil = await servicoPerfil(usuario, pedido.acao, { ...pedido, modo });
      registrarLatencia(performance.now() - inicio);
      const antes = nivelPorXP(dadosUsuario?.pontuacaoTotal), agora = nivelPorXP(perfil?.pontuacaoTotal);
      if (agora > antes) setTimeout(() => setSubiu({ from: antes, to: agora, xp: Number(perfil.pontuacaoTotal) || 0 }), animar() ? 1300 : 0);
      setDadosUsuario(perfil); setPendente(null);
      depois?.(perfil);
      return perfil;
    } catch (falha) { setErro(falha.message || 'Não foi possível salvar.'); return null; }
    finally { setOcupado(false); }
  }
  async function recuperar() {
    setOcupado(true); setErro('');
    try { setDadosUsuario(await servicoPerfil(usuario, 'obterPerfil')); setPendente(null); setEscolhaEnviada(null); }
    catch (falha) { setErro(falha.message); }
    finally { setOcupado(false); }
  }
  const iniciar = async () => {
    setCarregandoRodada(true);
    await enviar({ acao: 'iniciarTreino', variante: quiz ? variante : 'misto', entradaId: crypto.randomUUID() }, () => {
      setNovaRodada(false); setFeedback(null); setEscolhaEnviada(null); setMarcas({}); setCartao(0); setContagem(animar());
    });
    setCarregandoRodada(false);
  };

  const relatorio = entrada?.encerrada && entrada.relatorio && !novaRodada ? entrada.relatorio : null;
  const fase = contagem ? 'contagem' : ativa || feedback ? 'jogo' : relatorio ? 'resultado' : 'intro';
  const indice = feedback ? feedback.indice : entrada?.respostas?.length || 0;
  const item = quiz && entrada ? entrada.itens[indice] : null;
  const resultado = feedback ? entrada.resultados[feedback.indice] : null;

  const responder = opcao => {
    if (ocupado || feedback || pendente || !ativa || !item) return;
    setEscolhaEnviada(opcao);
    enviar({ acao: 'responderTreino', entradaId: entrada.id, respostas: [...entrada.respostas, { itemId: item.id, escolha: opcao }] }, () => setFeedback({ indice }));
  };
  const proxima = () => { setFeedback(null); setEscolhaEnviada(null); };

  const marcar = v => {
    const frase = entrada?.itens[cartao];
    if (!frase) return;
    setMarcas(m => ({ ...m, [frase.id]: v }));
    setLancar(null);
    setCartao(c => c + 1);
  };
  const verdades = entrada && !quiz ? entrada.itens.filter(f => marcas[f.id] === true).length : 0;
  const confirmarFrases = () => {
    if (ocupado || verdades < 1 || verdades > 4) return;
    enviar({ acao: 'responderTreino', entradaId: entrada.id, respostas: entrada.itens.map(f => ({ itemId: f.id, escolha: marcas[f.id] === true })) });
  };

  // Teclado: 1 a 4 respondem e Enter avança no Quiz; setas classificam no Verdade ou mentira.
  useEffect(() => {
    if (fase !== 'jogo' || folha) return undefined;
    const tecla = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, .sheet')) return;
      if (quiz) {
        const n = '1234'.indexOf(e.key);
        if (n >= 0 && item && !feedback) { e.preventDefault(); responder(item.opcoes[n]?.id); }
        else if (e.key === 'Enter' && feedback && !e.target.closest?.('button, a')) { e.preventDefault(); proxima(); }
      } else if (cartao < 5 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); setLancar({ v: e.key === 'ArrowRight', k: Date.now() }); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });
  useEffect(() => {
    if (!folha) return undefined;
    requestAnimationFrame(() => folhaRef.current?.querySelector('button')?.focus());
    const tecla = e => { if (e.key === 'Escape') setFolha(null); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [folha]);

  const sair = () => {
    if (fase === 'jogo' && ativa) setFolha('sair');
    else setTelaAtual('menu');
  };
  const avisoErro = erro && <div className="fb no" role="alert" style={{ margin: '0 0 10px', display: 'grid', gap: 8 }}>
    <span>{erro} O resultado só vale depois de salvar; reenviar não duplica XP nem tickets.</span>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {pendente && <button className="primary" style={{ width: 'auto', padding: '9px 14px' }} disabled={ocupado} onClick={() => enviar(pendente.pedido, pendente.depois)}>Reenviar</button>}
      <button className="ghost" style={{ width: 'auto', padding: '9px 14px' }} disabled={ocupado} onClick={recuperar}>Consultar progresso salvo</button>
    </div>
  </div>;
  const raiz = conteudo => <div className={`cbt ${web ? 'web' : ''}`}>{conteudo}<AnimatePresence>{subiu && <SubiuNivel key="lvl" info={subiu} onClose={() => setSubiu(null)} />}</AnimatePresence></div>;

  if (fase === 'resultado') {
    const xpPorAcerto = quiz && entrada.variante === 'casos' ? 25 : 20;
    const r = relatorio;
    const linhas = [[`Acertos (${r.acertos}/${r.total} × ${xpPorAcerto} XP)`, `+${r.xp}`, r.xp ? 'pos' : 'mut']];
    if (r.xpMissoes) linhas.push(['Missões do dia', `+${r.xpMissoes}`, 'mul']);
    linhas.push([r.valida ? 'Rodada válida para o ticket' : 'Sem acerto: não conta para o ticket', r.ticketsRodada ? '+1 ticket' : `${r.medidor}/2`, r.ticketsRodada ? 'mul' : 'mut']);
    const ticketsExtras = (r.ticketsMissoes || 0) + (r.ticketsNivel || 0);
    if (ticketsExtras) linhas.push(['Tickets de missões e nível', `+${ticketsExtras}`, 'mul']);
    const texto = (i, valor) => quiz ? entrada.itens[i].opcoes.find(o => o.id === valor)?.texto : valor ? 'Verdade' : 'Mentira';
    return raiz(<Resultado key={entrada.id} stamp={quiz ? 'QUIZ CONCLUÍDO' : 'RODADA ENCERRADA'} tom="amber" recibo={entrada.id}
      sub={quiz ? `${entrada.variante === 'casos' ? 'Casos clínicos' : 'Teoria'} · ${r.acertos}/${r.total} acertos` : `${r.acertos}/${r.total} frases certas`}
      linhas={linhas} total={r.xp + (r.xpMissoes || 0)} fase="ok" aviso="Seus erros vão para a revisão futura."
      principal={{ rotulo: 'Nova rodada', aoClicar: () => setNovaRodada(true) }} aoVoltar={() => setTelaAtual('menu')}
      detalhes={entrada.resultados.map((res, i) => <div key={res.itemId} className="det">
        <b className={res.acertou ? 'yes' : 'no'}>{res.acertou ? <Check /> : <X />}{i + 1}. {quiz ? entrada.itens[i].enunciado : entrada.itens[i].texto}</b>
        <p>Sua resposta: {texto(i, res.escolha)}</p>
        {!res.acertou && <p>Esperada: {texto(i, res.correta)}</p>}
        <p style={{ color: 'var(--muted)' }}>{res.explicacao} {res.fonte && <a href={res.fonte} target="_blank" rel="noreferrer" style={{ color: 'var(--mint)' }}>Fonte</a>}</p>
      </div>)} />);
  }

  if (fase === 'intro') {
    const Icone = quiz ? BrainCircuit : ScanLine;
    const cor = CORES[modo];
    return raiz(<div className={`cbt-scr ${quiz ? 'r-quiz' : 'r-vm'}`}>
      <div className="topbar"><button className="icon-btn" onClick={() => setTelaAtual('menu')} aria-label="Voltar"><ChevronLeft /></button>
        <h1><small>{quiz ? 'Teoria e casos clínicos' : 'Curiosidades, mitos e absurdos'}</small>{titulo}</h1>
        <span className="chip"><Ticket /><span>{fmt(dadosUsuario?.tickets)}</span></span></div>
      <div className="scroll" style={{ display: 'grid', alignContent: 'center', gap: 16 }}>
        <span className="rise" style={{ width: 72, height: 72, borderRadius: 22, display: 'grid', placeItems: 'center', background: `color-mix(in srgb, ${cor} 14%, transparent)`, color: cor, border: `1px solid color-mix(in srgb, ${cor} 40%, transparent)` }}><Icone size={34} /></span>
        {quiz && <div className="alas rise" style={{ padding: 0, '--i': 1 }} role="radiogroup" aria-label="Tipo de rodada">
          {VARIANTES.map(([id, nome, xp]) => <button key={id} role="radio" aria-checked={variante === id} className={`ala ${variante === id ? 'on' : ''}`} onClick={() => { setVariante(id); gravarLocal('cacoMed-quiz-variante', id); }}>{nome} · {xp} XP</button>)}
        </div>}
        <div style={{ display: 'grid', gap: 8 }}>{REGRAS[modo].map((r, i) => <div key={i} className="mission rise" style={{ '--i': i + 2, gridTemplateColumns: '26px 1fr' }}><span className="mono" style={{ color: cor, fontWeight: 700 }}>{i + 1}</span><span style={{ fontSize: 13.5 }}>{r}</span></div>)}</div>
        <p className="note">Conteúdo com fontes; cada resposta traz a explicação. Seus erros alimentam a revisão.</p>
        {avisoErro}
      </div>
      <div className="dock"><div className="info"><span>SEM CUSTO DE TICKET</span><span>MEDIDOR DE TICKET {stats.medidor || 0}/2</span></div>
        <BotaoCarregar rotulo="Começar" icone={<Play size={17} fill="currentColor" />} carregando={carregandoRodada} aoClicar={iniciar} desabilitado={ocupado} /></div>
    </div>);
  }

  const folhaSair = <AnimatePresence>
    {folha && <>
      <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFolha(null)} />
      <motion.div key="sh" ref={folhaRef} className="sheet" role="alertdialog" aria-modal="true" aria-label="Sair da rodada" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
        <h3>Sair da rodada?</h3>
        <p>{quiz ? 'As respostas confirmadas ficam salvas e você retoma a rodada depois.' : 'As marcações ainda não foram enviadas e se perdem; a rodada fica aberta para retomar depois.'}</p>
        <button className="primary" onClick={() => setFolha(null)}>Continuar</button>
        <button className="ghost" onClick={() => setTelaAtual('menu')}>Sair e retomar depois</button>
        <button className="ghost" disabled={ocupado} onClick={() => { setFolha(null); enviar({ acao: 'abandonarTreino', entradaId: entrada.id }, () => { setNovaRodada(true); setFeedback(null); }); }}>Abandonar rodada (sem recompensa)</button>
      </motion.div>
    </>}
  </AnimatePresence>;

  if (quiz) {
    const acertos = (entrada?.resultados || []).filter(r => r.acertou).length;
    let seguidos = 0;
    for (const r of [...(entrada?.resultados || [])].reverse()) { if (!r.acertou) break; seguidos++; }
    const xpPorAcerto = entrada?.variante === 'casos' ? 25 : 20;
    const ultima = feedback && feedback.indice === entrada.itens.length - 1;
    return raiz(<div className="cbt-scr r-quiz">
      {fase === 'contagem' && <Contagem aoTerminar={() => setContagem(false)} />}
      <div inert={Boolean(folha)} style={{ display: 'contents' }}>
        <div className="topbar"><button className="icon-btn" onClick={sair} aria-label="Sair"><ChevronLeft /></button>
          <h1><small>Quiz · {item?.tema}</small>Pergunta {indice + 1} de {entrada.itens.length}</h1>
          {ocupado && <span className="sync"><span className="dot" />Conferindo</span>}</div>
        <div className="qhud">
          <span className="streak" style={{ opacity: seguidos ? 1 : .35 }}><Flame />{seguidos} seguida{seguidos === 1 ? '' : 's'}</span>
          <div className="score"><small>XP DA RODADA</small><b>{acertos * xpPorAcerto}</b></div>
        </div>
        <div className="stepper" style={{ padding: '0 16px 10px' }}>{entrada.itens.map((_, k) => <span key={k} className={k < entrada.respostas.length && !(feedback && k === feedback.indice) ? 'done' : k === indice ? 'cur' : ''} />)}</div>
        <div className="scroll">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={indice} initial={animar() ? { opacity: 0, y: 24 } : false} animate={{ opacity: 1, y: 0 }} exit={animar() ? { opacity: 0, y: -24 } : undefined} transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'grid', gap: 14 }}>
              <p className="q" style={{ fontSize: 19 }}>{item.enunciado}</p>
              <div className="opts">{item.opcoes.map((o, k) => {
                const cls = resultado ? (o.id === resultado.correta ? 'right' : o.id === resultado.escolha ? 'wrong' : 'dim') : escolhaEnviada ? (o.id === escolhaEnviada ? 'on' : 'dim') : '';
                return <button key={o.id} className={`opt ${cls}`} disabled={Boolean(resultado || escolhaEnviada)} onClick={() => responder(o.id)}>
                  <span className="ltr">{resultado && o.id === resultado.correta ? <Check size={13} strokeWidth={3} /> : resultado && o.id === resultado.escolha ? <X size={13} strokeWidth={3} /> : web ? k + 1 : 'ABCD'[k]}</span><span>{o.texto}</span>
                </button>;
              })}</div>
              {web && !resultado && !escolhaEnviada && <span className="kbd-hint"><kbd>1</kbd>–<kbd>4</kbd> para responder</span>}
              {escolhaEnviada && !resultado && !erro && <span className="kbd-hint" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MiniEcg />Conferindo a resposta com o servidor</span>}
              {resultado && <motion.div className={`fb ${resultado.acertou ? 'ok' : 'no'}`} initial={animar() ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} style={{ margin: 0 }} role="status">
                <b>{resultado.acertou ? 'Certo. ' : 'Errado. '}</b>{resultado.explicacao} {resultado.fonte && <a href={resultado.fonte} target="_blank" rel="noreferrer" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 3 }}>Fonte <ExternalLink size={12} /></a>}
              </motion.div>}
              {avisoErro}
            </motion.div>
          </AnimatePresence>
        </div>
        {resultado && <div className="dock"><div className="info"><span>{acertos}/{entrada.resultados.length} CERTAS ATÉ AGORA</span>{web && <span><kbd>Enter</kbd> continua</span>}</div>
          <button className="primary" onClick={proxima}><Play size={17} fill="currentColor" />{ultima ? 'Ver resultado' : 'Próxima pergunta'}</button></div>}
      </div>
      {folhaSair}
    </div>);
  }

  const total = entrada.itens.length;
  const frase = entrada.itens[cartao];
  const ultimaMarca = cartao > 0 ? marcas[entrada.itens[cartao - 1].id] : null;
  return raiz(<div className="cbt-scr r-vm">
    {fase === 'contagem' && <Contagem aoTerminar={() => setContagem(false)} />}
    <div inert={Boolean(folha)} style={{ display: 'contents' }}>
      <div className="topbar"><button className="icon-btn" onClick={sair} aria-label="Sair"><ChevronLeft /></button>
        <h1><small>Verdade ou mentira</small>{cartao < total ? `${cartao + 1} de ${total}` : 'Revise e confirme'}</h1>
        {ocupado ? <span className="sync"><span className="dot" />Conferindo</span> : <span className="chip mint">{verdades} V · {cartao - verdades} M</span>}</div>
      <div className="rushbar"><span style={{ width: `${(Math.min(cartao, total) / total) * 100}%` }} /></div>
      {cartao < total ? <>
        <div className="deck">
          {entrada.itens[cartao + 1] && <div className="vcard under"><p>{entrada.itens[cartao + 1].texto}</p></div>}
          {frase && <CartaoArrastar key={frase.id} frase={frase} n={cartao + 1} lancar={lancar} aoResponder={marcar} />}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={cartao} className="fb idle" initial={animar() ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
            {ultimaMarca === null ? 'A correção vem no fim, com a explicação de cada frase.' : `Anotado: ${ultimaMarca ? 'verdade' : 'mentira'}. Dá para mudar na revisão.`}
          </motion.div>
        </AnimatePresence>
        <div className="vm-btns">
          <button className="vm-btn m" onClick={() => setLancar({ v: false, k: Date.now() })}><X /> Mentira</button>
          <button className="vm-btn v" onClick={() => setLancar({ v: true, k: Date.now() })}><Check /> Verdade</button>
        </div>
        {web && <span className="kbd-hint" style={{ textAlign: 'center', paddingBottom: 18 }}><kbd>←</kbd> mentira · <kbd>→</kbd> verdade</span>}
      </> : <>
        <div className="scroll" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <p className="muted">Toque numa frase para trocar. São de 1 a 4 verdades; as que ficarem como mentira contam como falsas.</p>
          <div className="opts">{entrada.itens.map((f, i) => {
            const v = marcas[f.id] === true;
            return <button key={f.id} className={`opt ${v ? 'on' : ''}`} disabled={ocupado} onClick={() => setMarcas(m => ({ ...m, [f.id]: !v }))} aria-pressed={v}>
              <span className="ltr">{i + 1}</span><span style={{ flex: 1 }}>{f.texto}</span><b className="mono" style={{ color: v ? 'var(--mint)' : 'var(--crimson)', fontSize: 11 }}>{v ? 'VERDADE' : 'MENTIRA'}</b>
            </button>;
          })}</div>
          {(verdades < 1 || verdades > 4) && <div className="fb no" style={{ margin: 0 }}>{verdades < 1 ? 'Marque pelo menos uma verdade.' : 'Pelo menos uma das cinco é mentira: desmarque uma.'}</div>}
          {avisoErro}
        </div>
        <div className="dock"><div className="info"><span>{verdades} VERDADE{verdades === 1 ? '' : 'S'} MARCADA{verdades === 1 ? '' : 'S'}</span><span>20 XP POR FRASE CERTA</span></div>
          <button className="primary" disabled={ocupado || verdades < 1 || verdades > 4} onClick={confirmarFrases}><Check size={18} />{ocupado ? 'Conferindo...' : 'Confirmar as cinco frases'}</button></div>
      </>}
    </div>
    {folhaSair}
  </div>);
}
