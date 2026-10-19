import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Check, ChevronLeft, ClipboardCheck, ExternalLink, Flag, Flame, Lock, Play, RotateCcw, ScanLine, Sparkles, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { nivelPorXP } from '../utils/economia';
import { NIVEL_REVISAO, XP_DOMINIO } from '../utils/revisaoInteligente';
import { animar, registrarLatencia, useLargo } from '../utils/prototipo';
import { MiniEcg } from './prototipoUi';
import { BotaoCarregar, Contagem, Resultado } from './resultadoUi';

// Revisão Inteligente v2 (docs/revisao-inteligente.md): cartas por modo, sessões de até 7 itens (os erros e perguntas
// parecidas), o caso do Erro médico refeito inteiro e, no fim, a revisão dos erros com a explicação da IA.
const MODOS = {
  quiz: { rotulo: 'Quiz', icone: BrainCircuit, cor: '#00f5d4' },
  verdadeMentira: { rotulo: 'Verdade ou mentira', icone: ScanLine, cor: '#ffd166' },
  erroMedico: { rotulo: 'Erro médico', icone: ClipboardCheck, cor: '#ff8fa3' },
};
const COR = '#b49cff';
const REGRAS = [`Cada carta junta até 7 erros de um modo. No Quiz e no Verdade ou mentira, perguntas parecidas completam a sessão.`,
  'No Erro médico, você refaz o caso inteiro.', 'Acertou: o item volta em 1 dia, depois em 3 e depois em 7.',
  `Item dominado (terceiro acerto seguido): +${XP_DOMINIO} XP, uma vez por item. Sem ticket.`];
const quando = data => !data ? 'sem data prevista' : Date.parse(data) <= Date.now() ? 'na próxima sessão'
  : new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const opcoesDe = item => item.modo === 'verdadeMentira' ? [{ id: true, texto: 'Verdadeira' }, { id: false, texto: 'Falsa' }] : item.opcoes || [];
const Fonte = ({ fonte }) => /^https?:\/\//.test(fonte || '')
  ? <a href={fonte} target="_blank" rel="noreferrer" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 3 }}>Fonte <ExternalLink size={12} /></a>
  : fonte ? <span style={{ opacity: .8 }}>Fonte: {fonte}</span> : null;
const textoEscolha = (item, valor) => item.modo === 'verdadeMentira' ? (valor ? 'Verdadeira' : 'Falsa') : item.opcoes?.find(o => o.id === valor)?.texto ?? '—';
const mesma = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Explicação da IA de uma resposta errada: pede ao servidor ao abrir; sem IA, mostra a explicação revisada.
function Explicacao({ usuario, servicoPerfil, revisaoId, resultado }) {
  const [estado, setEstado] = useState({ carregando: true });
  const [reportado, setReportado] = useState(false);
  useEffect(() => {
    let atual = true;
    servicoPerfil(usuario, 'explicarRevisao', { revisaoId, itemId: resultado.itemId, versao: resultado.versao })
      .then(r => { if (atual) setEstado({ ...r, carregando: false }); })
      .catch(() => { if (atual) setEstado({ carregando: false, falhou: true }); });
    return () => { atual = false; };
  }, [usuario, servicoPerfil, revisaoId, resultado.itemId, resultado.versao]);
  const reportar = () => {
    setReportado(true);
    servicoPerfil(usuario, 'reportarExplicacao', { chave: estado.chave, motivo: 'reportado na tela de revisão' }).catch(() => setReportado(false));
  };
  if (estado.carregando) return <p className="kbd-hint" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MiniEcg />Preparando a explicação</p>;
  if (estado.texto) return <div className="fb no" style={{ margin: '6px 0 0', display: 'grid', gap: 6 }}>
    <span><Sparkles size={13} style={{ verticalAlign: '-2px' }} /> {estado.texto}</span>
    <span style={{ fontSize: 12, opacity: .85 }}>{estado.aviso} <Fonte fonte={estado.fonte || resultado.fonte} /></span>
    <button className="w-link" style={{ justifySelf: 'start', fontSize: 12 }} disabled={reportado} onClick={reportar}><Flag size={12} /> {reportado ? 'Erro reportado. Obrigado!' : 'Reportar erro na explicação'}</button>
  </div>;
  return <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>{estado.fallback || resultado.explicacao} <Fonte fonte={estado.fonte || resultado.fonte} /></p>;
}

// Caso do Erro médico: o prontuário e as três etapas; o envio leva as três escolhas juntas.
function CasoErroMedico({ item, resultado, ocupado, aoResponder }) {
  const [escolhas, setEscolhas] = useState([]);
  const etapa = escolhas.length;
  const pergunta = item.perguntas[Math.min(etapa, item.perguntas.length - 1)];
  const completo = etapa === item.perguntas.length;
  return <div style={{ display: 'grid', gap: 12 }}>
    <p className="q" style={{ fontSize: 17 }}>{item.titulo}<small style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{item.paciente} · {item.cenario}</small></p>
    <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4, fontSize: 13.5 }}>{item.registros.map((r, i) => <li key={i}>{r}</li>)}</ol>
    {resultado ? <div style={{ display: 'grid', gap: 6 }}>{resultado.etapas.map(e => <div key={e.id} className={`fb ${e.acertou ? 'ok' : 'no'}`} style={{ margin: 0 }}>
      <b>{e.acertou ? <Check size={13} /> : <X size={13} />} {e.titulo}</b> {e.escolha}{!e.acertou && <> · Correto: {e.correta}</>}</div>)}</div>
      : <>
        <b style={{ fontSize: 14 }}>Etapa {Math.min(etapa + 1, 3)} de 3 · {pergunta.titulo}</b>
        <div className="opts">{pergunta.alternativas.map((o, k) => <button key={o.id} className={`opt ${escolhas[etapa] === o.id ? 'on' : ''}`} disabled={completo || ocupado}
          onClick={() => setEscolhas([...escolhas, o.id])}><span className="ltr">{'ABCDEF'[k]}</span><span>{o.texto}</span></button>)}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {etapa > 0 && <button className="ghost" style={{ width: 'auto', padding: '9px 14px' }} disabled={ocupado} onClick={() => setEscolhas(escolhas.slice(0, -1))}>Voltar etapa</button>}
          {completo && <button className="primary" style={{ width: 'auto', padding: '9px 14px' }} disabled={ocupado} onClick={() => aoResponder(escolhas)}>Registrar parecer</button>}
        </div>
      </>}
  </div>;
}

export default function RevisaoInteligente({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const liberada = dadosUsuario?.role === 'admin' || nivelPorXP(dadosUsuario?.pontuacaoTotal) >= NIVEL_REVISAO;
  const stats = dadosUsuario?.revisao || {};
  const resumo = stats.resumo;
  const entrada = stats.entrada;
  const ativa = Boolean(entrada && !entrada.encerrada);
  const [carregando, setCarregando] = useState(liberada);
  const [ocupado, setOcupado] = useState(false);
  const [iniciando, setIniciando] = useState(null);
  const [erro, setErro] = useState('');
  const [pendente, setPendente] = useState(null);
  const [listar, setListar] = useState(false);
  const [contagem, setContagem] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [escolhaEnviada, setEscolhaEnviada] = useState(null);
  const [folha, setFolha] = useState(null);
  const folhaRef = useRef(null);

  useEffect(() => {
    if (!liberada) return undefined;
    let atual = true;
    servicoPerfil(usuario, 'consultarRevisao').then(perfil => { if (atual) setDadosUsuario(perfil); })
      .catch(falha => { if (atual) setErro(falha.message); })
      .finally(() => { if (atual) setCarregando(false); });
    return () => { atual = false; };
  }, [usuario, servicoPerfil, setDadosUsuario, liberada]);

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
  const iniciar = async carta => {
    setIniciando(carta);
    await enviar({ acao: 'iniciarRevisao', revisaoId: crypto.randomUUID(), carta }, () => { setListar(false); setFeedback(null); setEscolhaEnviada(null); setContagem(animar()); });
    setIniciando(null);
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
  const voltarCartas = () => { setListar(true); consultar(); };

  useEffect(() => {
    if (fase !== 'jogo' || folha || item?.modo === 'erroMedico') return undefined;
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

  if (fase === 'resultado') {
    const r = relatorio;
    const erradas = entrada.resultados.map((res, i) => ({ res, item: entrada.itens[i] })).filter(({ res }) => !res.acertou);
    const linhas = [['Itens revisados', `${r.respondidos}/${r.total}`, 'pos'], ['Respostas certas', `${r.acertos}/${r.respondidos || 0}`, r.acertos ? 'pos' : 'mut'],
      ...(r.xp ? [['Itens dominados', `+${r.xp} XP`, 'pos']] : []), ['Próxima reapresentação', quando(r.proximaRevisao), 'mut']];
    return <div className={`cbt ${web ? 'web' : ''}`}><Resultado key={entrada.id} stamp={entrada.abandonada ? 'REVISÃO ENCERRADA' : erradas.length ? 'REVEJA OS ERROS' : 'ACERTOU TUDO'} tom="violet" recibo={entrada.id}
      sub={r.temas.length ? r.temas.join(' · ') : 'Sessão sem respostas'} linhas={linhas} total={r.acertos} unidade="CERTAS" fase="ok"
      aviso={erradas.length ? 'Os itens errados voltam na próxima sessão; os certos, nos intervalos programados.' : 'Os itens voltam nos intervalos programados.'}
      principal={{ rotulo: 'Voltar às cartas', aoClicar: voltarCartas }} aoVoltar={() => setTelaAtual('menu')}
      detalhes={erradas.map(({ res, item: q }) => <div key={`${res.modo}-${res.itemId}`} className="det">
        <b className="no"><X />{q.modo === 'erroMedico' ? q.titulo : q.enunciado || `“${q.texto}”`}{res.parecida ? ' · pergunta parecida' : ''}</b>
        {q.modo === 'erroMedico' ? res.etapas.map(e => <p key={e.id}>{e.titulo} {e.acertou ? '✓' : <>Marcou: {e.escolha} · Correto: {e.correta}</>}</p>) : <>
          {res.escolhaPartida !== undefined && !mesma(res.escolhaPartida, res.escolha) && <p>Na partida: {textoEscolha(q, res.escolhaPartida)}</p>}
          <p>{res.escolhaPartida !== undefined && !mesma(res.escolhaPartida, res.escolha) ? 'Na revisão' : 'Sua resposta'}: {textoEscolha(q, res.escolha)}</p>
          <p>Correta: {textoEscolha(q, res.correta)}</p>
        </>}
        <Explicacao usuario={usuario} servicoPerfil={servicoPerfil} revisaoId={entrada.id} resultado={res} />
      </div>)} /></div>;
  }

  if (fase === 'intro') {
    const cartas = resumo?.cartas || [];
    const situacao = !liberada ? [`Libera no nível ${NIVEL_REVISAO}`, 'Seus erros já estão sendo guardados: a fila fica pronta quando você chegar lá.']
      : carregando ? ['Consultando seus erros...', 'Buscando os itens que estão na hora de rever.']
        : !resumo ? ['Fila indisponível', 'Atualize para consultar a fila salva.']
          : ativa ? ['Sessão em andamento', 'Continue de onde parou.']
            : cartas.length ? [`${cartas.length} ${cartas.length === 1 ? 'carta' : 'cartas'} para rever`, 'Escolha uma carta para começar.']
              : resumo.total ? ['Revisão em dia', `Os itens aguardam o próximo intervalo. Volte ${quando(resumo.proximaRevisao)}.`]
                : ['Seu aprendizado começa nos jogos', 'Você ainda não tem erros para rever. Jogue uma rodada de Quiz, Verdade ou mentira ou um caso do Erro médico.'];
    return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-quiz">
      <div className="topbar"><button className="icon-btn" onClick={() => setTelaAtual('menu')} aria-label="Voltar"><ChevronLeft /></button>
        <h1><small>Aprenda com seus erros</small>Revisão inteligente</h1>
        {liberada && <button className="icon-btn" onClick={consultar} disabled={ocupado || carregando} aria-label="Atualizar fila"><RotateCcw /></button>}</div>
      <div className="scroll" style={{ display: 'grid', alignContent: 'start', gap: 14 }}>
        <div className="mission rise" style={{ '--i': 1, gridTemplateColumns: '1fr' }} role="status">
          <span><b style={{ fontSize: 16 }}>{!liberada && <Lock size={14} style={{ verticalAlign: '-2px' }} />} {situacao[0]}</b><small style={{ display: 'block', marginTop: 4 }}>{situacao[1]}</small></span>
        </div>
        {liberada && !ativa && cartas.length > 0 && <div style={{ display: 'grid', gap: 10, gridTemplateColumns: web ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr 1fr' }}>
          {cartas.map((c, i) => { const m = MODOS[c.modo]; const Icone = m.icone;
            return <button key={c.id} className="mode rise" style={{ '--i': i + 2, display: 'grid', gap: 8, justifyItems: 'start', textAlign: 'left' }} disabled={ocupado} onClick={() => iniciar(c.id)}>
              <span className="ico" style={{ background: `color-mix(in srgb, ${m.cor} 14%, transparent)`, color: m.cor }}><Icone /></span>
              <b>{m.rotulo}{cartas.filter(x => x.modo === c.modo).length > 1 ? ` ${cartas.filter(x => x.modo === c.modo).indexOf(c) + 1}` : ''}</b>
              <small>{c.erros} {c.erros === 1 ? (c.modo === 'erroMedico' ? 'caso' : 'erro') : (c.modo === 'erroMedico' ? 'casos' : 'erros')}{iniciando === c.id ? ' · abrindo...' : ''}</small>
            </button>; })}
        </div>}
        <div style={{ display: 'grid', gap: 8 }}>{REGRAS.map((r, i) => <div key={i} className="mission rise" style={{ '--i': i + 6, gridTemplateColumns: '26px 1fr' }}><span className="mono" style={{ color: COR, fontWeight: 700 }}>{i + 1}</span><span style={{ fontSize: 13.5 }}>{r}</span></div>)}</div>
        {liberada && <p className="note">{stats.itens || 0} {stats.itens === 1 ? 'item revisado' : 'itens revisados'} até hoje · {stats.acertos || 0} {stats.acertos === 1 ? 'acerto' : 'acertos'} · {(stats.dominados || []).length} dominados</p>}
        {avisoErro}
      </div>
      {ativa && <div className="dock"><div className="info"><span>SEM CUSTO DE TICKET</span><span>SESSÃO EM ANDAMENTO</span></div>
        <BotaoCarregar rotulo="Continuar a sessão" icone={<Play size={17} fill="currentColor" />} carregando={false} aoClicar={() => setListar(false)} desabilitado={ocupado} /></div>}
    </div></div>;
  }

  const acertos = entrada.resultados.filter(r => r.acertou).length;
  let seguidos = 0;
  for (const r of [...entrada.resultados].reverse()) { if (!r.acertou) break; seguidos++; }
  const ultima = feedback && feedback.indice === entrada.itens.length - 1;
  const m = MODOS[item.modo] || MODOS.quiz;
  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-quiz">
    {fase === 'contagem' && <Contagem aoTerminar={() => setContagem(false)} />}
    <div inert={Boolean(folha)} style={{ display: 'contents' }}>
      <div className="topbar"><button className="icon-btn" onClick={() => setFolha('sair')} aria-label="Sair"><ChevronLeft /></button>
        <h1><small>Revisão · {m.rotulo} · {String(item.tema).replace(`${m.rotulo} · `, '')}{item.parecida ? ' · parecida' : ''}</small>Item {indice + 1} de {entrada.itens.length}</h1>
        {ocupado && <span className="sync"><span className="dot" />Conferindo</span>}</div>
      <div className="qhud">
        <span className="streak" style={{ opacity: seguidos ? 1 : .35 }}><Flame />{seguidos} seguida{seguidos === 1 ? '' : 's'}</span>
        <div className="score"><small>CERTAS</small><b>{acertos}</b></div>
      </div>
      <div className="stepper" style={{ padding: '0 16px 10px' }}>{entrada.itens.map((_, k) => <span key={k} className={k < entrada.resultados.length && !(feedback && k === feedback.indice) ? 'done' : k === indice ? 'cur' : ''} />)}</div>
      <div className="scroll">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={indice} initial={animar() ? { opacity: 0, y: 24 } : false} animate={{ opacity: 1, y: 0 }} exit={animar() ? { opacity: 0, y: -24 } : undefined} transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'grid', gap: 14 }}>
            {item.modo === 'erroMedico' ? <CasoErroMedico key={item.id} item={item} resultado={resultado} ocupado={ocupado} aoResponder={responder} /> : <>
              <p className="q" style={{ fontSize: 19 }}>{item.modo === 'verdadeMentira' ? `“${item.texto}”` : item.enunciado}</p>
              <div className="opts">{opcoesDe(item).map((o, k) => {
                const cls = resultado ? (o.id === resultado.correta ? 'right' : o.id === resultado.escolha ? 'wrong' : 'dim') : escolhaEnviada !== null ? (o.id === escolhaEnviada ? 'on' : 'dim') : '';
                return <button key={String(o.id)} className={`opt ${cls}`} disabled={Boolean(resultado) || escolhaEnviada !== null} onClick={() => responder(o.id)}>
                  <span className="ltr">{resultado && o.id === resultado.correta ? <Check size={13} strokeWidth={3} /> : resultado && o.id === resultado.escolha ? <X size={13} strokeWidth={3} /> : web ? k + 1 : 'ABCD'[k]}</span><span>{o.texto}</span>
                </button>;
              })}</div>
              {web && !resultado && escolhaEnviada === null && <span className="kbd-hint"><kbd>1</kbd>–<kbd>{opcoesDe(item).length}</kbd> para responder</span>}
            </>}
            {escolhaEnviada !== null && !resultado && !erro && <span className="kbd-hint" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MiniEcg />Conferindo a resposta com o servidor</span>}
            {resultado && <motion.div className={`fb ${resultado.acertou ? 'ok' : 'no'}`} initial={animar() ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} style={{ margin: 0 }} role="status">
              <b>{resultado.acertou ? 'Certo.' : 'Errado.'}</b>{resultado.dominou && <> Item dominado: +{resultado.xp} XP.</>}
              {!resultado.acertou && ' A explicação aparece no fim da sessão.'}
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
