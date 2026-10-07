import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ExternalLink, Flame, Play, RotateCcw, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { animar, registrarLatencia, useLargo } from '../utils/prototipo';
import { MiniEcg } from './prototipoUi';
import { BotaoCarregar, Contagem, Resultado } from './resultadoUi';

// Revisão Inteligente no layout do Quiz do protótipo (o protótipo mandava "Revisar agora" para o Quiz).
// Regras do jogo: até cinco itens dos erros anteriores, conferidos pelo servidor, sem XP e sem ticket.
const ROTULO_MODO = { quiz: 'Quiz', verdadeMentira: 'Verdade ou mentira', batalha: 'Batalha diagnóstica' };
const COR = '#b49cff';
const REGRAS = ['Até cinco itens dos seus erros no Quiz, no Verdade ou mentira e na Batalha.', 'Acertou: o item volta em 1 dia, depois em 3 e depois em 7.', 'Errou de novo: o item volta na próxima sessão.', 'Sem XP e sem ticket. Você pode sair e retomar depois.'];
const quando = data => !data ? 'sem data prevista' : Date.parse(data) <= Date.now() ? 'na próxima sessão'
  : new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const opcoesDe = item => item.modo === 'verdadeMentira' ? [{ id: true, texto: 'Verdadeira' }, { id: false, texto: 'Falsa' }] : item.opcoes;
const Fonte = ({ fonte }) => /^https?:\/\//.test(fonte || '')
  ? <a href={fonte} target="_blank" rel="noreferrer" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 3 }}>Fonte <ExternalLink size={12} /></a>
  : fonte ? <span style={{ opacity: .8 }}>Fonte: {fonte}</span> : null;

export default function RevisaoInteligente({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const piloto = dadosUsuario?.role !== 'admin';
  const stats = dadosUsuario?.revisao || {};
  const resumo = stats.resumo;
  const entrada = stats.entrada;
  const ativa = Boolean(entrada && !entrada.encerrada);
  const [carregando, setCarregando] = useState(!piloto);
  const [ocupado, setOcupado] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [erro, setErro] = useState('');
  const [pendente, setPendente] = useState(null);
  const [listar, setListar] = useState(false);
  const [contagem, setContagem] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [escolhaEnviada, setEscolhaEnviada] = useState(null);
  const [folha, setFolha] = useState(null);
  const folhaRef = useRef(null);

  useEffect(() => {
    if (piloto) return undefined;
    let atual = true;
    servicoPerfil(usuario, 'consultarRevisao').then(perfil => { if (atual) setDadosUsuario(perfil); })
      .catch(falha => { if (atual) setErro(falha.message); })
      .finally(() => { if (atual) setCarregando(false); });
    return () => { atual = false; };
  }, [usuario, servicoPerfil, setDadosUsuario, piloto]);

  async function enviar(pedido, depois) {
    if (ocupado) return null;
    setOcupado(true); setErro(''); setPendente({ pedido, depois });
    const inicio = performance.now();
    try {
      const perfil = await servicoPerfil(usuario, pedido.acao, pedido);
      registrarLatencia(performance.now() - inicio);
      setDadosUsuario(perfil); setPendente(null);
      depois?.(perfil);
      return perfil;
    } catch (falha) { setErro(falha.message || 'Não foi possível salvar.'); return null; }
    finally { setOcupado(false); }
  }
  const consultar = () => enviar({ acao: 'consultarRevisao' }, () => setEscolhaEnviada(null));
  const iniciar = async () => {
    setIniciando(true);
    await enviar({ acao: 'iniciarRevisao', revisaoId: crypto.randomUUID() }, () => { setListar(false); setFeedback(null); setEscolhaEnviada(null); setContagem(animar()); });
    setIniciando(false);
  };

  const relatorio = entrada?.encerrada && entrada.relatorio && !listar ? entrada.relatorio : null;
  const fase = contagem ? 'contagem' : ativa || feedback ? 'jogo' : relatorio ? 'resultado' : 'intro';
  const indice = feedback ? feedback.indice : entrada?.resultados?.length || 0;
  const item = entrada?.itens?.[indice];
  const resultado = feedback ? entrada.resultados[feedback.indice] : null;
  const responder = escolha => {
    if (ocupado || feedback || pendente || !ativa || !item) return;
    setEscolhaEnviada(escolha);
    enviar({ acao: 'responderRevisao', revisaoId: entrada.id, itemId: item.id, versao: item.versao, escolha }, () => setFeedback({ indice }));
  };
  const proxima = () => { setFeedback(null); setEscolhaEnviada(null); };

  useEffect(() => {
    if (fase !== 'jogo' || folha) return undefined;
    const tecla = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, .sheet')) return;
      const n = '1234'.indexOf(e.key);
      if (n >= 0 && item && !feedback) { const o = opcoesDe(item)[n]; if (o) { e.preventDefault(); responder(o.id); } }
      else if (e.key === 'Enter' && feedback && !e.target.closest?.('button, a')) { e.preventDefault(); proxima(); }
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

  const avisoErro = erro && <div className="fb no" role="alert" style={{ margin: '0 0 10px', display: 'grid', gap: 8 }}>
    <span>{erro} As respostas confirmadas ficam salvas; reenviar não duplica a tentativa.</span>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {pendente && <button className="primary" style={{ width: 'auto', padding: '9px 14px' }} disabled={ocupado} onClick={() => enviar(pendente.pedido, pendente.depois)}>Reenviar</button>}
      <button className="ghost" style={{ width: 'auto', padding: '9px 14px' }} disabled={ocupado} onClick={consultar}>Consultar revisão salva</button>
    </div>
  </div>;
  const texto = (q, valor) => q.modo === 'verdadeMentira' ? (valor ? 'Verdadeira' : 'Falsa') : q.opcoes.find(o => o.id === valor)?.texto;

  if (fase === 'resultado') {
    const r = relatorio;
    const linhas = [['Itens revisados', `${r.respondidos}/${r.total}`, 'pos'], ['Respostas certas', `${r.acertos}/${r.respondidos || 0}`, r.acertos ? 'pos' : 'mut'], ['Próxima reapresentação', quando(r.proximaRevisao), 'mut']];
    return <div className={`cbt ${web ? 'web' : ''}`}><Resultado key={entrada.id} stamp={entrada.abandonada ? 'REVISÃO ENCERRADA' : 'REVISÃO CONCLUÍDA'} tom="violet" recibo={entrada.id}
      sub={r.temas.length ? r.temas.join(' · ') : 'Sessão sem respostas'} linhas={linhas} total={r.acertos} unidade="CERTAS" fase="ok"
      aviso="Sem XP: os itens voltam nos intervalos programados."
      principal={{ rotulo: 'Ver a fila de revisão', aoClicar: () => { setListar(true); consultar(); } }} aoVoltar={() => setTelaAtual('menu')}
      detalhes={entrada.resultados.map((res, i) => <div key={`${res.modo}-${res.itemId}`} className="det">
        <b className={res.acertou ? 'yes' : 'no'}>{res.acertou ? <Check /> : <X />}{i + 1}. {entrada.itens[i].enunciado || entrada.itens[i].texto}</b>
        <p>Sua resposta: {texto(entrada.itens[i], res.escolha)}</p>
        {!res.acertou && <p>Esperada: {texto(entrada.itens[i], res.correta)}</p>}
        <p style={{ color: 'var(--muted)' }}>{res.explicacao} <Fonte fonte={res.fonte} /></p>
        <p style={{ color: 'var(--muted)' }}>Volta {quando(res.proximaRevisao)}.</p>
      </div>)} /></div>;
  }

  if (fase === 'intro') {
    const disponiveis = resumo?.disponiveis || 0;
    const situacao = piloto ? ['Piloto do administrador', 'Liberado para jogadores depois de validarmos os intervalos e a experiência.']
      : carregando ? ['Consultando seus erros...', 'Buscando os itens que estão na hora de rever.']
        : !resumo ? ['Fila indisponível', 'Atualize para consultar a fila salva.']
          : disponiveis ? [`${disponiveis} ${disponiveis === 1 ? 'item disponível' : 'itens disponíveis'}`, `Esta sessão terá até ${Math.min(5, disponiveis)} ${Math.min(5, disponiveis) === 1 ? 'item' : 'itens'}.`]
            : resumo.total ? ['Revisão em dia', `Os itens aguardam o próximo intervalo. Volte ${quando(resumo.proximaRevisao)}.`]
              : ['Seu aprendizado começa nos jogos', 'Você ainda não tem erros para rever. Jogue uma rodada de Quiz ou Verdade ou mentira.'];
    return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-quiz">
      <div className="topbar"><button className="icon-btn" onClick={() => setTelaAtual('menu')} aria-label="Voltar"><ChevronLeft /></button>
        <h1><small>Aprenda com seus erros</small>Revisão inteligente</h1>
        {!piloto && <button className="icon-btn" onClick={consultar} disabled={ocupado || carregando} aria-label="Atualizar fila"><RotateCcw /></button>}</div>
      <div className="scroll" style={{ display: 'grid', alignContent: 'center', gap: 16 }}>
        <span className="rise" style={{ width: 72, height: 72, borderRadius: 22, display: 'grid', placeItems: 'center', background: `color-mix(in srgb, ${COR} 14%, transparent)`, color: COR, border: `1px solid color-mix(in srgb, ${COR} 40%, transparent)` }}><RotateCcw size={34} /></span>
        <div className="mission rise" style={{ '--i': 1, gridTemplateColumns: '1fr' }} role="status">
          <span><b style={{ fontSize: 16 }}>{situacao[0]}</b><small style={{ display: 'block', marginTop: 4 }}>{situacao[1]}</small></span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>{REGRAS.map((r, i) => <div key={i} className="mission rise" style={{ '--i': i + 2, gridTemplateColumns: '26px 1fr' }}><span className="mono" style={{ color: COR, fontWeight: 700 }}>{i + 1}</span><span style={{ fontSize: 13.5 }}>{r}</span></div>)}</div>
        {!piloto && <p className="note">{stats.itens || 0} {stats.itens === 1 ? 'item revisado' : 'itens revisados'} até hoje · {stats.acertos || 0} {stats.acertos === 1 ? 'acerto' : 'acertos'}</p>}
        {avisoErro}
      </div>
      <div className="dock"><div className="info"><span>SEM CUSTO DE TICKET</span><span>SEM XP</span></div>
        <BotaoCarregar rotulo="Começar revisão" icone={<Play size={17} fill="currentColor" />} carregando={iniciando} aoClicar={iniciar} desabilitado={piloto || carregando || ocupado || !disponiveis} /></div>
    </div></div>;
  }

  const acertos = entrada.resultados.filter(r => r.acertou).length;
  let seguidos = 0;
  for (const r of [...entrada.resultados].reverse()) { if (!r.acertou) break; seguidos++; }
  const ultima = feedback && feedback.indice === entrada.itens.length - 1;
  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-quiz">
    {fase === 'contagem' && <Contagem aoTerminar={() => setContagem(false)} />}
    <div inert={Boolean(folha)} style={{ display: 'contents' }}>
      <div className="topbar"><button className="icon-btn" onClick={() => setFolha('sair')} aria-label="Sair"><ChevronLeft /></button>
        <h1><small>Revisão · {ROTULO_MODO[item.modo] || 'item'} · {item.tema}</small>Item {indice + 1} de {entrada.itens.length}</h1>
        {ocupado && <span className="sync"><span className="dot" />Conferindo</span>}</div>
      <div className="qhud">
        <span className="streak" style={{ opacity: seguidos ? 1 : .35 }}><Flame />{seguidos} seguida{seguidos === 1 ? '' : 's'}</span>
        <div className="score"><small>CERTAS</small><b>{acertos}</b></div>
      </div>
      <div className="stepper" style={{ padding: '0 16px 10px' }}>{entrada.itens.map((_, k) => <span key={k} className={k < entrada.resultados.length && !(feedback && k === feedback.indice) ? 'done' : k === indice ? 'cur' : ''} />)}</div>
      <div className="scroll">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={indice} initial={animar() ? { opacity: 0, y: 24 } : false} animate={{ opacity: 1, y: 0 }} exit={animar() ? { opacity: 0, y: -24 } : undefined} transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'grid', gap: 14 }}>
            <p className="q" style={{ fontSize: 19 }}>{item.modo === 'verdadeMentira' ? `“${item.texto}”` : item.enunciado}</p>
            <div className="opts">{opcoesDe(item).map((o, k) => {
              const cls = resultado ? (o.id === resultado.correta ? 'right' : o.id === resultado.escolha ? 'wrong' : 'dim') : escolhaEnviada !== null ? (o.id === escolhaEnviada ? 'on' : 'dim') : '';
              return <button key={String(o.id)} className={`opt ${cls}`} disabled={Boolean(resultado) || escolhaEnviada !== null} onClick={() => responder(o.id)}>
                <span className="ltr">{resultado && o.id === resultado.correta ? <Check size={13} strokeWidth={3} /> : resultado && o.id === resultado.escolha ? <X size={13} strokeWidth={3} /> : web ? k + 1 : 'ABCD'[k]}</span><span>{o.texto}</span>
              </button>;
            })}</div>
            {web && !resultado && escolhaEnviada === null && <span className="kbd-hint"><kbd>1</kbd>–<kbd>{opcoesDe(item).length}</kbd> para responder</span>}
            {escolhaEnviada !== null && !resultado && !erro && <span className="kbd-hint" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MiniEcg />Conferindo a resposta com o servidor</span>}
            {resultado && <motion.div className={`fb ${resultado.acertou ? 'ok' : 'no'}`} initial={animar() ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} style={{ margin: 0 }} role="status">
              <b>{resultado.acertou ? 'Certo. ' : 'Errado. '}</b>{resultado.explicacao} <Fonte fonte={resultado.fonte} />
              <span style={{ display: 'block', marginTop: 4, opacity: .85 }}>Este item volta {quando(resultado.proximaRevisao)}.</span>
            </motion.div>}
            {avisoErro}
          </motion.div>
        </AnimatePresence>
      </div>
      {resultado && <div className="dock"><div className="info"><span>{acertos}/{entrada.resultados.length} CERTAS ATÉ AGORA</span>{web && <span><kbd>Enter</kbd> continua</span>}</div>
        <button className="primary" onClick={proxima}><Play size={17} fill="currentColor" />{ultima ? 'Ver resultado' : 'Próximo item'}</button></div>}
    </div>
    <AnimatePresence>
      {folha && <>
        <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFolha(null)} />
        <motion.div key="sh" ref={folhaRef} className="sheet" role="alertdialog" aria-modal="true" aria-label="Sair da revisão" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
          <h3>Sair da revisão?</h3>
          <p>As respostas confirmadas ficam salvas. Os itens que faltam continuam na fila.</p>
          <button className="primary" onClick={() => setFolha(null)}>Continuar</button>
          <button className="ghost" onClick={() => setTelaAtual('menu')}>Sair e retomar depois</button>
          <button className="ghost" disabled={ocupado} onClick={() => { setFolha(null); enviar({ acao: 'encerrarRevisao', revisaoId: entrada.id }, () => setFeedback(null)); }}>Encerrar esta sessão</button>
        </motion.div>
      </>}
    </AnimatePresence>
  </div></div>;
}
