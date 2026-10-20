import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ExternalLink, Flag, Flame, Layers, Lock, Play, RotateCcw, Sparkles, Target, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { servicoRevisaoComOffline } from '../services/revisaoOffline';
import { guardarNaFila } from '../services/conexao';
import { nivelPorXP } from '../utils/economia';
import { NIVEL_REVISAO, XP_DOMINIO } from '../utils/revisaoInteligente';
import { lerMissoes } from '../utils/missoes';
import { animar, registrarLatencia, useLargo } from '../utils/prototipo';
import { MiniEcg } from './prototipoUi';
import { Contagem } from './resultadoUi';
import { Anel, Baralho, Leque, Monstro } from './revisaoSemana';
import { MODOS_REVISAO, minutos } from '../utils/revisaoCartas';
import '../revisaoSemana.css';

// Revisão Inteligente semanal (docs/revisao-inteligente.md, protótipo aprovado em 19/10/2026): o hub com a fila da
// semana; "Começar revisão" trava o app até terminar as cartas; as cartas abrem em leque, uma de cada vez; no fim, o
// relatório geral em anel e o monstro do cérebro com o prêmio da semana.
const MODOS = MODOS_REVISAO;
const quando = data => !data ? 'sem data prevista' : Date.parse(data) <= Date.now() ? 'na próxima revisão'
  : new Date(data).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const opcoesDe = item => item.modo === 'verdadeMentira' ? [{ id: true, texto: 'Verdadeira' }, { id: false, texto: 'Falsa' }] : item.opcoes || [];
const Fonte = ({ fonte }) => /^https?:\/\//.test(fonte || '')
  ? <a href={fonte} target="_blank" rel="noreferrer" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 3 }}>Fonte <ExternalLink size={12} /></a>
  : fonte ? <span style={{ opacity: .8 }}>Fonte: {fonte}</span> : null;
const TEXTO_TRAVA = ['Depois de começar, você só sai da revisão quando terminar todas as cartas da semana.',
  'Até lá, os outros modos do jogo ficam bloqueados, mesmo se você fechar e abrir o app.'];
const lerVistas = id => { try { return new Set(JSON.parse(localStorage.getItem(`cacoMed-revisao-vistas-${id}`) || '[]')); } catch { return new Set(); } };
const guardarVistas = (id, vistas) => { try { localStorage.setItem(`cacoMed-revisao-vistas-${id}`, JSON.stringify([...vistas])); } catch { /* sem armazenamento: as cartas vistas valem só nesta visita */ } };

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

function Dialogo({ icone, titulo, children, acoes }) {
  return <motion.div className="rv-dlg-fundo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="rv-dlg" role="alertdialog" aria-modal="true" aria-label={titulo} initial={{ y: 16, scale: .97 }} animate={{ y: 0, scale: 1 }} transition={{ duration: .25 }}>
      <span className="rv-dlg-ic">{icone}</span><h2>{titulo}</h2>{children}<div className="rv-dlg-acoes">{acoes}</div>
    </motion.div>
  </motion.div>;
}

export default function RevisaoInteligente({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil: servicoApi = chamarPerfilPlanilha }) {
  // App offline: sem rede, a carta abre da reserva preparada pelo servidor e a sessão vai para a fila (services/revisaoOffline.js).
  // O serviço lê o perfil por uma ref: recriá-lo a cada perfil novo refazia a consulta da fila sem parar.
  const perfilRef = useRef(dadosUsuario);
  useEffect(() => { perfilRef.current = dadosUsuario; });
  const servicoPerfil = useMemo(() => servicoRevisaoComOffline(servicoApi, { perfilAtual: () => perfilRef.current, guardarNaFila }), [servicoApi]);
  const web = useLargo();
  const liberada = dadosUsuario?.role === 'admin' || nivelPorXP(dadosUsuario?.pontuacaoTotal) >= NIVEL_REVISAO;
  const stats = dadosUsuario?.revisao || {};
  const resumo = stats.resumo;
  const semana = stats.semana;
  const travada = Boolean(semana?.iniciadaEm && !semana.concluidaEm);
  const entrada = stats.entrada;
  const ativa = Boolean(entrada && !entrada.encerrada);
  // Com a revisão começada, o app reabre direto nas cartas (trava).
  const [tela, setTela] = useState(travada ? 'foco' : 'hub');
  const [abrirLeque, setAbrirLeque] = useState(true);
  const [carregando, setCarregando] = useState(liberada);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [pendente, setPendente] = useState(null);
  const [confirmar, setConfirmar] = useState(false);
  const [contagem, setContagem] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [escolhaEnviada, setEscolhaEnviada] = useState(null);
  const [folha, setFolha] = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  // Cartas do relatório já vistas, por semana (neste aparelho); o monstro aparece depois da última.
  const [vistasPorSemana, setVistasPorSemana] = useState({});
  const vistas = vistasPorSemana[semana?.id] ?? (semana?.id ? lerVistas(semana.id) : new Set());
  const [monstro, setMonstro] = useState(false);
  const folhaRef = useRef(null);
  const itemVistoEm = useRef(0);

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
  const comecarSemana = () => enviar({ acao: 'iniciarSemanaRevisao' }, () => { setConfirmar(false); setAbrirLeque(true); setTela('foco'); });
  const abrirCarta = async carta => {
    // A carta em andamento continua de onde parou; as outras esperam ela terminar (uma sessão aberta por vez).
    if (ativa && entrada.carta === carta.id) { setFeedback(null); setEscolhaEnviada(null); setTela('sessao'); return; }
    if (ativa) { setErro('Termine a carta em andamento antes de abrir outra.'); return; }
    await enviar({ acao: 'iniciarRevisao', revisaoId: crypto.randomUUID(), carta: carta.id }, () => {
      setFeedback(null); setEscolhaEnviada(null); setContagem(animar()); setTela('sessao');
    });
  };
  const verRelatorio = async () => {
    setErro('');
    try {
      const rel = await servicoPerfil(usuario, 'relatorioRevisao');
      setRelatorio(rel); setMonstro(Boolean(rel.concluidaEm && !semana?.relatorioVisto && rel.cartas.length && rel.cartas.every(c => vistas.has(c.id)))); setTela('anel');
    }
    catch (falha) { setErro(falha.message || 'Não foi possível abrir o relatório.'); }
  };
  const marcarVista = id => { const novo = new Set(vistas).add(id); if (semana?.id) guardarVistas(semana.id, novo); setVistasPorSemana(atual => ({ ...atual, [semana?.id]: novo })); };
  const voltarAoHub = () => { setTela('hub'); consultar(); };
  const fecharMonstro = () => { enviar({ acao: 'verRelatorioRevisao' }); setTela('hub'); };

  const indice = feedback ? feedback.indice : entrada?.resultados?.length || 0;
  const item = entrada?.itens?.[indice];
  const resultado = feedback ? entrada.resultados[feedback.indice] : null;
  const ultima = Boolean(feedback && entrada && feedback.indice === entrada.itens.length - 1);
  const emSessao = tela === 'sessao' && entrada && (ativa || feedback);
  useEffect(() => { if (emSessao && !contagem && !feedback) itemVistoEm.current = performance.now(); }, [emSessao, contagem, feedback, indice]);
  const responder = escolha => {
    if (ocupado || feedback || pendente || !ativa || !item) return;
    setEscolhaEnviada(escolha);
    const tempoMs = Math.round(performance.now() - itemVistoEm.current);
    enviar({ acao: 'responderRevisao', revisaoId: entrada.id, itemId: item.id, versao: item.versao, escolha, tempoMs }, () => setFeedback({ indice }));
  };
  // Fim de um item: o próximo; fim da carta: de volta ao leque (ou ao relatório geral, se era a última da semana).
  const proxima = () => {
    setFeedback(null); setEscolhaEnviada(null);
    if (!ultima) return;
    if (semana?.concluidaEm) verRelatorio();
    else { setAbrirLeque(false); setTela('foco'); }
  };

  useEffect(() => {
    if (!emSessao || folha || item?.modo === 'erroMedico') return undefined;
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
  const explicacao = (it, carta) => <Explicacao usuario={usuario} servicoPerfil={servicoPerfil} revisaoId={carta.revisaoId}
    resultado={{ itemId: it.itemId, versao: it.versao, modo: it.modo, explicacao: it.explicacao, fonte: it.fonte }} />;

  // ---------- Leque, anel e monstro (modo foco) ----------
  const cartasSemana = (resumo?.estado === 'andamento' ? resumo.cartas : []).map(c => ativa && entrada.carta === c.id && !c.feita
    ? { ...c, pausada: { atual: entrada.resultados.length + 1, total: entrada.itens.length } } : c);
  if (tela === 'foco' && travada && cartasSemana.length) {
    const faltam = cartasSemana.filter(c => !c.feita).length;
    return <div className={`cbt ${web ? 'web' : ''}`}>
      <Leque key={`leque-${cartasSemana.filter(c => c.feita).length}`} cartas={cartasSemana} abrir={abrirLeque} aoEscolher={abrirCarta}
        trava={`Termine as cartas da semana para sair · ${faltam === 1 ? 'falta 1' : `faltam ${faltam}`}`}
        dica={ativa ? 'Toque na carta em andamento para continuar' : 'Toque numa carta para começar'} />
      {erro && <div style={{ position: 'fixed', left: 16, right: 16, bottom: 70, zIndex: 90 }}>{avisoErro}</div>}
    </div>;
  }
  if (tela === 'anel' && relatorio?.cartas?.length) {
    if (monstro && !semana?.relatorioVisto && relatorio.concluidaEm) return <div className={`cbt ${web ? 'web' : ''}`}><Monstro relatorio={relatorio} aoVoltar={fecharMonstro} /></div>;
    return <div className={`cbt ${web ? 'web' : ''}`}>
      <Anel relatorio={relatorio} vistas={semana?.relatorioVisto ? new Set(relatorio.cartas.map(c => c.id)) : vistas} aoVer={marcarVista}
        aoTerminar={relatorio.concluidaEm && !semana?.relatorioVisto ? () => setMonstro(true) : null} aoSair={relatorio.concluidaEm ? voltarAoHub : null} explicacao={explicacao} />
    </div>;
  }

  // ---------- Sessão de uma carta ----------
  if (emSessao && item) {
    const acertos = entrada.resultados.filter(r => r.acertou).length;
    let seguidos = 0;
    for (const r of [...entrada.resultados].reverse()) { if (!r.acertou) break; seguidos++; }
    const m = MODOS[item.modo] || MODOS.quiz;
    return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-quiz">
      {contagem && <Contagem aoTerminar={() => setContagem(false)} />}
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
                {!resultado.acertou && ' A explicação aparece no relatório da semana.'}
                <span style={{ display: 'block', marginTop: 4, opacity: .85 }}>{resultado.proximaRevisao ? `Este item volta ${quando(resultado.proximaRevisao)}.` : 'Este item saiu da fila: dominado.'}</span>
              </motion.div>}
              {avisoErro}
            </motion.div>
          </AnimatePresence>
        </div>
        {resultado && <div className="dock"><div className="info"><span>{acertos}/{entrada.resultados.length} CERTAS ATÉ AGORA</span>{web && <span><kbd>Enter</kbd> continua</span>}</div>
          <button className="primary" onClick={proxima}><Play size={17} fill="currentColor" />{ultima ? 'Voltar às cartas' : 'Próximo item'}</button></div>}
      </div>
      <AnimatePresence>
        {folha && <>
          <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFolha(null)} />
          <motion.div key="sh" ref={folhaRef} className="sheet" role="alertdialog" aria-modal="true" aria-label="Sair da carta" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
            <h3>Voltar às cartas?</h3>
            <p>As respostas confirmadas ficam salvas. A carta fica em andamento e continua de onde parou.</p>
            <button className="primary" onClick={() => setFolha(null)}>Continuar a carta</button>
            {travada ? <button className="ghost" onClick={() => { setFolha(null); setAbrirLeque(false); setTela('foco'); }}>Voltar às cartas</button>
              : <button className="ghost" onClick={() => { setFolha(null); setTela('hub'); }}>Voltar ao hub</button>}
          </motion.div>
        </>}
      </AnimatePresence>
    </div></div>;
  }

  // ---------- Hub ----------
  const estado = resumo?.estado;
  const cartasFila = estado === 'pronta' ? resumo.cartas : [];
  const missao = lerMissoes(dadosUsuario).find(m => m.id === 'revisao_semana' && !m.concluida);
  const dominados = (stats.dominados || []).length;
  const taxa = stats.itens ? Math.round((stats.acertos || 0) / stats.itens * 100) : null;
  const naFila = cartasFila.reduce((s, c) => s + c.erros, 0);
  const titulo = !liberada ? [`Libera no nível ${NIVEL_REVISAO}`, 'Seus erros já estão sendo guardados: a fila fica pronta quando você chegar lá.']
    : carregando ? ['Consultando seus erros...', 'Buscando os itens da revisão desta semana.']
      : !resumo ? ['Fila indisponível', 'Atualize para consultar a fila salva.']
        : estado === 'andamento' ? ['Revisão em andamento', 'Termine as cartas da semana.']
          : estado === 'concluida' ? ['Tudo revisado nesta semana', `A próxima revisão fica disponível ${quando(resumo.proximaSemana)}.`]
            : estado === 'pronta' ? ['Comece sua revisão', `Seus erros da semana, até cerca de ${minutos(resumo.limite)} min pelo seu ritmo. Faça no dia que quiser, uma carta de cada vez. No fim, você recebe o relatório completo.`]
              : estado === 'emDia' ? ['Revisão em dia', `A próxima fica disponível ${quando(resumo.proximaRevisao && Date.parse(resumo.proximaRevisao) > Date.parse(resumo.proximaSemana) ? resumo.proximaRevisao : resumo.proximaSemana)}.`]
                : ['Seu aprendizado começa nos jogos', 'Você ainda não tem erros para rever. Jogue uma rodada de Quiz, Verdade ou mentira ou um caso do Erro médico.'];
  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-quiz">
    <div className="topbar"><button className="icon-btn" onClick={() => setTelaAtual('menu')} aria-label="Voltar" disabled={travada}><ChevronLeft /></button>
      <h1><small>Aprenda com seus erros</small>Revisão inteligente</h1>
      {liberada && <button className="icon-btn" onClick={consultar} disabled={ocupado || carregando} aria-label="Atualizar fila"><RotateCcw /></button>}</div>
    <div className="scroll"><div className="rv-hub">
      <div className="rv-intro rise" style={{ '--i': 1 }}>
        <p className="kicker">{estado === 'concluida' ? 'Revisão da semana feita' : 'Revisão da semana'}</p>
        <h2>{!liberada && <Lock size={20} style={{ verticalAlign: '-2px', marginRight: 6 }} />}{titulo[0]}</h2>
        <p className="sub">{titulo[1]}</p>
        {liberada && resumo && <div className="rv-stats">
          <div className="rv-stat"><b>{naFila}</b><span>na fila desta semana</span></div>
          <div className="rv-stat"><b>{stats.itens || 0}</b><span>itens revisados</span></div>
          <div className="rv-stat"><b>{taxa === null ? '—' : `${taxa}%`}</b><span>de acerto na revisão</span></div>
          <div className="rv-stat"><b>{dominados}</b><span>dominados · +{dominados * XP_DOMINIO} XP</span></div>
        </div>}
        {estado === 'pronta' && <div className="rv-fila" style={{ '--p': Math.min(1, resumo.segundos / resumo.limite) }}>
          <span>Fila da semana</span><b>~{minutos(resumo.segundos)} de {minutos(resumo.limite)} min</b><i />
          {resumo.reserva > 0 && <small>{resumo.reserva} {resumo.reserva === 1 ? 'item está' : 'itens estão'} na reserva e {resumo.reserva === 1 ? 'volta' : 'voltam'} numa semana com espaço.</small>}
        </div>}
        {missao && <div className="rv-missao"><Target /><span><b>Missão do dia: {missao.titulo.toLowerCase()}</b><small>+{missao.recompensaXP} XP e {missao.recompensaTicket} tickets ao terminar</small></span></div>}
        {dadosUsuario?.role === 'admin' && stats.relogioAdminDias > 0 && <p className="note">Relógio da Revisão adiantado em {stats.relogioAdminDias} {stats.relogioAdminDias === 1 ? 'dia' : 'dias'} (ferramenta de admin).</p>}
      </div>
      <div className="rise" style={{ '--i': 2, display: 'grid', gap: 12 }}>
        {estado === 'pronta' ? <Baralho cartas={cartasFila} aoTocar={() => setConfirmar(true)} />
          : <div className="rv-mesa"><div className="rv-mesa-vazia">{estado === 'concluida' ? <Check /> : !liberada ? <Lock /> : <Layers />}
            <span>{estado === 'concluida' ? 'Cartas da semana feitas.' : !liberada ? `Nível ${NIVEL_REVISAO}` : estado === 'emDia' ? 'Nenhuma carta nesta semana.' : 'A mesa está vazia.'}</span></div></div>}
        {estado === 'pronta' && <button className="primary" disabled={ocupado} onClick={() => setConfirmar(true)}><Play size={17} fill="currentColor" />Começar revisão</button>}
        {estado === 'andamento' && <button className="primary" onClick={() => { setAbrirLeque(true); setTela('foco'); }}><Play size={17} fill="currentColor" />Continuar a revisão</button>}
        {estado === 'concluida' && semana?.concluidaEm && <button className="primary" disabled={ocupado} onClick={verRelatorio}><Sparkles size={17} />Ver seu relatório da semana</button>}
        {ativa && !travada && <button className="ghost" onClick={() => setTela('sessao')}>Continuar a sessão em andamento</button>}
        {avisoErro}
      </div>
    </div></div>
    <AnimatePresence>{confirmar && <Dialogo icone={<Lock size={22} />} titulo="Começar a revisão da semana?"
      acoes={<><button className="ghost" onClick={() => setConfirmar(false)}>Agora não</button><button className="primary" disabled={ocupado} onClick={comecarSemana}>{ocupado ? 'Abrindo...' : 'Começar'}</button></>}>
      {TEXTO_TRAVA.map(t => <p key={t}>{t}</p>)}
      <p>São {cartasFila.length} {cartasFila.length === 1 ? 'carta' : 'cartas'}, cerca de {minutos(resumo?.segundos)} min.</p>
    </Dialogo>}</AnimatePresence>
  </div></div>;
}
