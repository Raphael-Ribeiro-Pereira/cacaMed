import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Baby, BookOpen, Check, ChevronLeft, ChevronRight, ClipboardCheck, FlaskConical, HeartPulse, Library, Lock, MapPin, MessageCircleQuestion, ShieldAlert, Siren, Smile, Stethoscope, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { AVISO, CASOS, FONTES, MODULOS, avaliarCaso, casoPorId, casosDe, casosPorFonte, estadoMapa, proximoCaso } from '../utils/pacienteDdx';
import { animar, useLargo } from '../utils/prototipo';
import '../prototipo.css';

// Paciente DDX portado do protótipo de movimento: casos em consulta organizados pela rede de atenção.
// Piloto do administrador, sem ticket e sem XP. O resultado aparece na hora (mesmo motor do servidor)
// e a melhor nota de cada caso é gravada no perfil, com reenvio idempotente se a gravação falhar.
const ICONE = { stethoscope: Stethoscope, 'heart-pulse': HeartPulse, siren: Siren, baby: Baby, smile: Smile };
const COR = { 'febre-ubs': '#00f5d4', 'dor-toracica': '#ff5c8a', 'urgencia-horas': '#ffb703', 'pre-natal': '#b49cff', crianca: '#5cc8ff' };
const NIVEL = ['', 'Básico', 'Intermediário', 'Avançado'];
const pag = c => `${FONTES[c.fonte]?.curto ?? c.fonte}, p. ${c.pag} do PDF`;
const novoId = () => crypto.randomUUID();

function Mapa({ feitos, onOpen, onFontes, onVoltar }) {
  const [revisao, setRevisao] = useState(true);
  const st = useMemo(() => estadoMapa(feitos, revisao), [feitos, revisao]);
  const feitosN = CASOS.filter(c => feitos[c.id] != null).length;
  return <>
    <div className="topbar">
      <button className="icon-btn" onClick={onVoltar} aria-label="Voltar ao DDX"><ChevronLeft /></button>
      <h1><small>DDX · Em teste</small>Paciente DDX</h1>
      <span className="chip mint"><Check />{feitosN}/{CASOS.length}</span>
    </div>
    <div className="scroll hs-wrap">
      <section className="card hs-hero rise">
        <div className="hs-hero-t"><span className="kicker">Casos em consulta</span><b>{MODULOS.length} módulos · {CASOS.length} casos</b></div>
        <p>Cada módulo é um ponto da rede de atenção do SUS, como na Matriz de Referência do Inep. Abra um caso, investigue, feche o diagnóstico e escolha a conduta.</p>
        <div className="hs-bar" role="progressbar" aria-valuemin={0} aria-valuemax={CASOS.length} aria-valuenow={feitosN}><span style={{ width: `${(feitosN / CASOS.length) * 100}%` }} /></div>
        <div className="hs-hero-b">
          <button className={`hs-tog ${revisao ? 'on' : ''}`} onClick={() => setRevisao(v => !v)} aria-pressed={revisao}><ShieldAlert size={14} />Modo revisão{revisao ? ': tudo liberado' : ''}</button>
          <button className="hs-tog" onClick={onFontes}><Library size={14} />Fontes</button>
        </div>
      </section>
      <p className="hs-aviso" role="note">{AVISO}</p>
      {MODULOS.map((m, mi) => <Modulo key={m.id} m={m} i={mi} st={st} feitos={feitos} onOpen={onOpen} />)}
    </div>
  </>;
}

function Modulo({ m, i, st, feitos, onOpen }) {
  const Ic = ICONE[m.icone] || Stethoscope;
  const lista = casosDe(m.id);
  const n = lista.filter(c => feitos[c.id] != null).length;
  return <section className="hs-mod rise" style={{ '--i': i + 1, '--c': COR[m.id] }}>
    <header className="hs-mh">
      <span className="hs-mi"><Ic /></span>
      <div><span className="kicker">Módulo {m.ordem} · {m.rede}</span><h2>{m.nome}</h2></div>
      <span className="hs-cnt">{n}/{lista.length}</span>
    </header>
    <p className="hs-mr">{m.resumo}</p>
    <ol className="hs-path">
      {lista.map(c => {
        const s = st[c.id];
        const nota = feitos[c.id];
        return <li key={c.id} className={`hs-node ${s}`}>
          <button disabled={s === 'lock'} onClick={() => onOpen(c.id)} aria-label={`${s === 'done' ? c.nome : 'Caso ' + c.ordem}${s === 'lock' ? ', bloqueado' : ''}`}>
            <span className="hs-dot">{s === 'done' ? <Check size={16} strokeWidth={3} /> : s === 'lock' ? <Lock size={14} /> : <span>{c.ordem}</span>}</span>
            <span className="hs-txt">
              <small>{s === 'done' ? c.nome : `Caso ${c.ordem} · ${c.paciente.nome}, ${c.paciente.idade.split(',')[0]}`}</small>
              {s === 'cur' && <span className="hs-here"><MapPin size={11} />Você está aqui</span>}
              <b>{s === 'done' ? `${nota}% · ${c.categoria}` : c.queixa}</b>
            </span>
            {s !== 'lock' && <ChevronRight className="hs-go" size={18} />}
          </button>
        </li>;
      })}
    </ol>
  </section>;
}

const PASSOS = [['caso', 'Caso'], ['investigar', 'Investigar'], ['hipotese', 'Hipótese'], ['conduta', 'Conduta'], ['fim', 'Resultado']];

function CasoJogo({ c, entradaId, gravar, onSair, onProximo, onFontes }) {
  const [passo, setPasso] = useState('caso');
  const [aba, setAba] = useState('perguntas');
  const [qs, setQs] = useState([]);
  const [ex, setEx] = useState([]);
  const [dx, setDx] = useState(null);
  const [sel, setSel] = useState([]);
  const [conf, setConf] = useState(false);
  const [gravacao, setGravacao] = useState('idle');
  const mod = MODULOS.find(m => m.id === c.modulo);
  const cor = COR[c.modulo];
  const certas = c.conduta.filter(x => x.certa).length;
  const r = dx != null && sel.length ? avaliarCaso(c, { perguntas: qs, exames: ex, hipotese: dx, conduta: sel }) : null;
  const prox = proximoCaso(c.id);
  const idx = PASSOS.findIndex(([k]) => k === passo);

  const alterna = i => setSel(l => (l.includes(i) ? l.filter(x => x !== i) : [...l, i]));
  // Grava ao abrir o resultado; o mesmo entradaId torna o reenvio seguro.
  const salvar = async () => {
    setGravacao('pend');
    try {
      await gravar({ entradaId, casoId: c.id, versao: c.versao, respostas: { perguntas: qs, exames: ex, hipotese: dx, conduta: sel } });
      setGravacao('ok');
    } catch {
      setGravacao('err');
    }
  };
  const verResultado = () => { setPasso('fim'); salvar(); };

  return <>
    <div className="topbar">
      <button className="icon-btn" onClick={onSair} aria-label="Voltar à lista de casos"><ChevronLeft /></button>
      <h1><small>{mod.nome}</small>Caso {c.ordem} · {NIVEL[c.nivel]}</h1>
      <span className="chip" style={{ color: cor, borderColor: cor + '55', background: cor + '1a' }}>{idx + 1}/{PASSOS.length}</span>
    </div>
    <div className="hs-steps" aria-label="Etapas do atendimento" style={{ '--c': cor }}>{PASSOS.map(([k, t], i) => <span key={k} className={i < idx ? 'done' : i === idx ? 'on' : ''}>{t}</span>)}</div>
    <div className="scroll hs-wrap" style={{ '--c': cor }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={passo} initial={animar() ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} exit={animar() ? { opacity: 0, y: -8 } : { opacity: 0 }} transition={{ duration: animar() ? .22 : 0 }}>

          {passo === 'caso' && <>
            <section className="card hs-pac">
              <span className="hs-av" aria-hidden="true">{c.paciente.nome.replace(/^(Seu|Dona)\s/, '')[0]}</span>
              <div><b>{c.paciente.nome}</b><small>{c.paciente.idade}</small></div>
              <p className="hs-cen">{c.paciente.cenario}</p>
            </section>
            <section className="card hs-q"><span className="kicker">Queixa</span><p>“{c.queixa}”</p></section>
            <div className="sec"><h2>O que você nota</h2></div>
            <ul className="hs-pistas">{c.pistas.map(x => <li key={x.nome} className="card"><b>{x.nome}</b><span>{x.texto}</span></li>)}</ul>
            <button className="primary" onClick={() => setPasso('investigar')}><Stethoscope />Começar a investigar</button>
          </>}

          {passo === 'investigar' && <>
            <div className="hs-tabs" role="tablist">
              <button role="tab" aria-selected={aba === 'perguntas'} className={aba === 'perguntas' ? 'on' : ''} onClick={() => setAba('perguntas')}><MessageCircleQuestion size={15} />Perguntas <i>{qs.length}/{c.perguntas.length}</i></button>
              <button role="tab" aria-selected={aba === 'exames'} className={aba === 'exames' ? 'on' : ''} onClick={() => setAba('exames')}><FlaskConical size={15} />Exames <i>{ex.length}/{c.exames.length}</i></button>
            </div>
            {aba === 'perguntas' && <ul className="hs-list">{c.perguntas.map((q, i) => {
              const on = qs.includes(i);
              return <li key={i}><button className={`hs-ask ${on ? 'on' : ''}`} onClick={() => setQs(l => (l.includes(i) ? l : [...l, i]))} aria-expanded={on}>
                <span className="hs-qn">{q.p}</span>
                {on ? <span className="hs-an">{q.r}</span> : <span className="hs-tap">Toque para perguntar</span>}
              </button></li>;
            })}</ul>}
            {aba === 'exames' && <ul className="hs-list">{c.exames.map((e, i) => {
              const on = ex.includes(i);
              return <li key={e.id}><button className={`hs-ask ex ${on ? 'on' : ''}`} onClick={() => setEx(l => (l.includes(i) ? l : [...l, i]))} aria-expanded={on}>
                <span className="hs-qn">{e.nome}</span>
                {on ? <span className="hs-an">{e.resultado}</span> : <span className="hs-tap">Toque para solicitar</span>}
              </button></li>;
            })}</ul>}
            <p className="note">Investigue o que for útil. Itens que mudam a decisão contam na nota.</p>
            <button className="primary" onClick={() => setPasso('hipotese')}><ClipboardCheck />Fechar hipótese</button>
          </>}

          {passo === 'hipotese' && <>
            <div className="sec"><h2>Qual é a hipótese diagnóstica mais provável?</h2></div>
            <ul className="hs-list">{c.hipoteses.map((h, i) => {
              const marcado = dx === i;
              const mostra = dx != null;
              return <li key={h.nome}><button className={`hs-opt ${marcado ? 'on' : ''} ${mostra && h.certa ? 'ok' : ''} ${mostra && marcado && !h.certa ? 'no' : ''}`} disabled={mostra} onClick={() => setDx(i)}>
                <span className="hs-ck">{mostra ? (h.certa ? <Check size={15} strokeWidth={3} /> : marcado ? <X size={15} strokeWidth={3} /> : null) : null}</span>
                <span><b>{h.nome}</b>{mostra && (marcado || h.certa) && <small>{h.porque}</small>}</span>
              </button></li>;
            })}</ul>
            {dx != null && <button className="primary" onClick={() => setPasso('conduta')}><ChevronRight />Escolher a conduta</button>}
          </>}

          {passo === 'conduta' && <>
            <div className="sec"><h2>Conduta</h2><span>{conf ? `${r.acertosConduta}/${c.conduta.length} corretos` : 'marque o que você faria'}</span></div>
            <ul className="hs-list">{c.conduta.map((x, i) => {
              const on = sel.includes(i);
              const cls = conf ? (x.certa === on ? 'ok' : 'no') : on ? 'on' : '';
              return <li key={i}><button className={`hs-opt ${cls}`} disabled={conf} onClick={() => alterna(i)} aria-pressed={on}>
                <span className="hs-ck">{conf ? (x.certa === on ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />) : on ? <Check size={15} strokeWidth={3} /> : null}</span>
                <span><b>{x.texto}</b>{conf && <small>{x.certa ? 'Faz parte da conduta. ' : 'Não faz parte da conduta. '}{x.porque}</small>}</span>
              </button></li>;
            })}</ul>
            {!conf ? <button className="primary" disabled={sel.length === 0} onClick={() => setConf(true)}><Check />Confirmar conduta</button>
              : <button className="primary" onClick={verResultado}><ChevronRight />Ver o resultado</button>}
            {!conf && <p className="note">Há {certas} itens corretos entre {c.conduta.length}. Itens errados também descontam.</p>}
          </>}

          {passo === 'fim' && r && <>
            <section className="card hs-fim">
              <span className="kicker">{c.categoria}</span>
              <h2>{c.nome}</h2>
              <div className="hs-score"><b>{r.nota}</b><span>/100</span></div>
              <div className="hs-parts">
                <span><i>Investigação</i>{r.chaveFeitas}/{r.chaveTotal} itens-chave</span>
                <span><i>Hipótese</i>{r.hipoteseCerta ? 'Correta' : 'Errada'}</span>
                <span><i>Conduta</i>{r.acertosConduta}/{c.conduta.length}</span>
              </div>
              {gravacao === 'err' ? <button className="sync err" onClick={salvar}><span className="dot" />Não gravou. Toque para reenviar</button>
                : <span className={`sync ${gravacao === 'ok' ? 'ok' : ''}`}><span className="dot" />{gravacao === 'ok' ? 'Nota gravada no perfil' : 'Gravando a nota'}</span>}
            </section>
            <section className="card hs-ap"><span className="kicker">O que levar daqui</span><p>{c.aprendizado}</p></section>
            <section className="card hs-al"><span className="kicker" style={{ color: 'var(--amber)' }}>Atenção: {c.alerta.nome}</span><p><b>Quando:</b> {c.alerta.quando}.<br /><b>Resposta:</b> {c.alerta.resposta}.<br />{c.alerta.porque}</p></section>
            {c.notificar && <p className="hs-not"><ShieldAlert size={14} />{c.notificar}</p>}
            <div className="sec"><h2>Fontes deste caso</h2><button className="hs-link" onClick={onFontes}>Biblioteca</button></div>
            <ul className="hs-src">{c.citacoes.map((x, i) => <li key={i}><BookOpen size={13} /><span><b>{x.sobre}</b><small>{pag(x)}</small></span></li>)}</ul>
            <div className="hs-end">
              {prox && <button className="primary" onClick={() => onProximo(prox.id)}><ChevronRight />Próximo: Caso {prox.ordem}</button>}
              <button className={prox ? 'ghost' : 'primary'} onClick={onSair}>Voltar à lista</button>
            </div>
          </>}
        </motion.div>
      </AnimatePresence>
    </div>
  </>;
}

function Fontes({ onVoltar, onOpen }) {
  const grupos = [['oficial', 'Documentos oficiais'], ['diretriz', 'Diretrizes de sociedades'], ['livro', 'Livros de referência']];
  return <>
    <div className="topbar">
      <button className="icon-btn" onClick={onVoltar} aria-label="Voltar"><ChevronLeft /></button>
      <h1><small>DDX · Paciente</small>Biblioteca de fontes</h1>
      <span className="chip"><Library />{Object.keys(FONTES).length}</span>
    </div>
    <div className="scroll hs-wrap">
      <p className="hs-aviso" role="note">Todo fato dos casos aponta para uma destas fontes, com a página do PDF. As páginas foram conferidas contra o texto dos arquivos recebidos.</p>
      {grupos.map(([tipo, titulo]) => {
        const lista = Object.entries(FONTES).filter(([, f]) => f.tipo === tipo);
        if (!lista.length) return null;
        return <section key={tipo}>
          <div className="sec"><h2>{titulo}</h2><span>{lista.length}</span></div>
          <ul className="hs-fontes">{lista.map(([id, f]) => {
            const usos = casosPorFonte(id);
            return <li key={id} className="card">
              <b>{f.titulo}</b>
              <small>{f.orgao} · {f.ano}{f.ed ? ` · ${f.ed}` : ''}</small>
              {f.nota && <p className="hs-fn">{f.nota}</p>}
              <div className="hs-uso">{usos.length ? usos.map(c => <button key={c.id} onClick={() => onOpen(c.id)}>{c.nome.replace(/ \(.*\)/, '')}</button>) : <em>Base do mapa (módulos)</em>}</div>
            </li>;
          })}</ul>
        </section>;
      })}
    </div>
  </>;
}

export default function PacienteDdx({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const p = dadosUsuario || {};
  const feitos = p.pacienteDdx?.casos || {};
  // tela: { nome: 'mapa' | 'caso' | 'fontes', id, entradaId }. Da biblioteca, volta-se à lista, como no protótipo.
  const [tela, setTela] = useState({ nome: 'mapa' });
  const abrir = id => setTela({ nome: 'caso', id, entradaId: novoId() });
  const gravar = async pedido => setDadosUsuario(await servicoPerfil(usuario, 'concluirCasoPaciente', pedido));
  const voltarDdx = () => setTelaAtual('selecaoDDX');
  const caso = tela.nome === 'caso' ? casoPorId(tela.id) : null;

  return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-pddx">
    {p.role !== 'admin' ? <>
      <div className="topbar"><button className="icon-btn" onClick={voltarDdx} aria-label="Voltar ao DDX"><ChevronLeft /></button><h1><small>DDX · Em teste</small>Paciente DDX</h1></div>
      <div className="scroll hs-wrap"><p className="hs-aviso" role="note">Piloto para administrador até a revisão médica dos casos.</p></div>
    </> : caso ? <CasoJogo key={tela.entradaId} c={caso} entradaId={tela.entradaId} gravar={gravar} onSair={() => setTela({ nome: 'mapa' })}
      onProximo={abrir} onFontes={() => setTela({ nome: 'fontes' })} />
      : tela.nome === 'fontes' ? <Fontes onVoltar={() => setTela({ nome: 'mapa' })} onOpen={abrir} />
        : <Mapa feitos={feitos} onOpen={abrir} onFontes={() => setTela({ nome: 'fontes' })} onVoltar={voltarDdx} />}
  </div></div>;
}
