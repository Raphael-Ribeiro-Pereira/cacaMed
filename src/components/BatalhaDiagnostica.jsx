import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronLeft, ChevronRight, Eye, GraduationCap, Library, Lock, Map as MapaIco, MapPin, PawPrint, Search, Shield, ShieldAlert, Shuffle, Siren, Sparkles, Stethoscope, Ticket, X, Zap } from 'lucide-react';
import { AGENTE, CAPITULOS, DOENCAS, FONTES, PETS, PET_QUANDO, capituloDe, obterDoenca } from '../utils/batalha';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { USAR_SUPABASE } from '../supabase';
import { Blob, PetArt, Retrato, Species } from './batalhaArte';
import BatalhaArena from './BatalhaArena';
import '../batalha.css';

const ICONE_CAP = [Stethoscope, MapPin, Siren];
const COR_CAP = ['#00f5d4', '#ffb703', '#ff5c8a'];
const AVISO = 'Simulação educacional. Doenças escritas a partir das fontes listadas, com exames numéricos ilustrativos. Conteúdo ainda sem revisão médica: piloto do administrador.';

function useLargo() {
  const consulta = '(min-width: 960px)';
  const [largo, setLargo] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const m = window.matchMedia(consulta);
    const mudar = () => setLargo(m.matches);
    m.addEventListener('change', mudar);
    return () => m.removeEventListener('change', mudar);
  }, []);
  return largo;
}

function Topo({ voltar, kicker, titulo, children }) {
  return <div className="topbar"><button className="icon-btn" onClick={voltar} aria-label="Voltar"><ChevronLeft /></button><h1><small>{kicker}</small>{titulo}</h1>{children}</div>;
}

export default function BatalhaDiagnostica({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const stats = { tutorial: false, historia: 0, descobertas: [], concluidos: [], ...dadosUsuario?.batalha };
  const entrada = stats.entrada;
  const aberta = Boolean(entrada && !entrada.relatorio);
  const [tela, setTela] = useState({ id: 'hub' });
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [pendente, setPendente] = useState(null);
  const trava = useRef(false);
  const admin = dadosUsuario?.role === 'admin';

  async function enviar(acao, dados, depois) {
    if (trava.current) return;
    trava.current = true;
    setOcupado(true); setErro(''); setPendente({ acao, dados, depois });
    try {
      const perfil = await servicoPerfil(usuario, acao, dados);
      setDadosUsuario(perfil); setPendente(null);
      depois?.(perfil);
    } catch (e) { setErro(e.message || 'Não foi possível confirmar. Tente de novo.'); }
    finally { trava.current = false; setOcupado(false); }
  }
  async function consultar() {
    if (trava.current) return;
    trava.current = true; setOcupado(true);
    try { setDadosUsuario(await servicoPerfil(usuario, 'obterPerfil')); setErro(''); setPendente(null); }
    catch (e) { setErro(e.message || 'Não foi possível consultar o progresso.'); }
    finally { trava.current = false; setOcupado(false); }
  }

  const iniciar = (modo, pet, doencaId) => enviar('iniciarBatalha', { modo, pet, doencaId, entradaId: crypto.randomUUID() }, () => setTela({ id: 'arena' }));
  const sair = abandonar => {
    if (abandonar) enviar('abandonarBatalha', { entradaId: entrada.id }, () => setTela({ id: 'hub' }));
    else setTela({ id: 'hub' });
  };

  let conteudo;
  const semApi = !USAR_SUPABASE && servicoPerfil === chamarPerfilPlanilha;
  if (semApi || !admin) {
    conteudo = <div className="cbt-scr"><Topo voltar={() => setTelaAtual('selecaoDDX')} kicker="DDX · Modo secreto" titulo="Batalha diagnóstica" />
      <div className="scroll"><section className="card" style={{ display: 'grid', gap: 10 }}><span className="kicker">Em piloto</span>
        <p>{semApi ? 'A Batalha diagnóstica usa a API do Supabase. Ative VITE_FONTE_DADOS=supabase para testar.' : 'A Batalha diagnóstica está em teste com o administrador enquanto o conteúdo passa por revisão médica.'}</p>
        <button className="ghost" onClick={() => setTelaAtual('selecaoDDX')}>Voltar aos modos DDX</button></section></div></div>;
  } else if (tela.id === 'arena' && aberta) {
    conteudo = <BatalhaArena key={entrada.id} entrada={entrada} doenca={obterDoenca(entrada.doencaId)} web={web} usuario={usuario} servicoPerfil={servicoPerfil}
      setDadosUsuario={setDadosUsuario} onSair={sair} onFim={() => setTela({ id: 'resultado' })} />;
  } else if (tela.id === 'resultado' && entrada?.relatorio) {
    conteudo = <Resultado entrada={entrada} stats={stats} onVoltar={() => setTela({ id: 'hub' })} onProxima={id => setTela({ id: 'pet', modo: 'historia', doencaId: id })} />;
  } else if (tela.id === 'pet') {
    conteudo = <EscolhaPet web={web} modo={tela.modo} doencaId={tela.doencaId} tickets={Number(dadosUsuario?.tickets) || 0} ocupado={ocupado}
      onVoltar={() => setTela({ id: tela.voltar || 'hub' })} onEntrar={pet => iniciar(tela.modo, pet, tela.doencaId)} />;
  } else if (tela.id === 'mapa') {
    conteudo = <Mapa stats={stats} onVoltar={() => setTela({ id: 'hub' })} onFontes={() => setTela({ id: 'fontes' })} onAbrir={id => setTela({ id: 'pet', modo: 'historia', doencaId: id, voltar: 'mapa' })} bloqueado={aberta} />;
  } else if (tela.id === 'fontes') {
    conteudo = <Fontes onVoltar={() => setTela({ id: 'mapa' })} />;
  } else {
    conteudo = <Hub stats={stats} aberta={aberta} entrada={entrada} tickets={Number(dadosUsuario?.tickets) || 0} ocupado={ocupado}
      onVoltar={() => setTelaAtual('selecaoDDX')}
      onTutorial={() => iniciar('tutorial', 'cocobi')}
      onPularTutorial={() => enviar('pularTutorialBatalha', {})}
      onRetomar={() => setTela({ id: 'arena' })}
      onAbandonar={() => sair(true)}
      onHistoria={id => setTela({ id: 'pet', modo: 'historia', doencaId: id })}
      onDuelo={() => setTela({ id: 'pet', modo: 'x1' })}
      onMapa={() => setTela({ id: 'mapa' })} />;
  }

  return <div className={`cbt ${web ? 'web' : ''}`}>
    {conteudo}
    {(erro || ocupado) && <div className="cbt-aviso" role={erro ? 'alert' : 'status'}>
      {ocupado && !erro && <span className="sync"><span className="dot" />Confirmando com o servidor…</span>}
      {erro && <div className="card" style={{ display: 'grid', gap: 8 }}>
        <p>{erro}</p>
        <p className="muted" style={{ fontSize: 12 }}>Reenviar o mesmo pedido não cobra de novo nem duplica XP.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {pendente && <button className="primary" style={{ width: 'auto', padding: '10px 16px' }} disabled={ocupado} onClick={() => enviar(pendente.acao, pendente.dados, pendente.depois)}>Reenviar</button>}
          <button className="ghost" style={{ width: 'auto', padding: '10px 16px' }} disabled={ocupado} onClick={consultar}>Consultar progresso salvo</button>
          <button className="ghost" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setErro('')}>Fechar</button>
        </div>
      </div>}
    </div>}
  </div>;
}

/* ---------- hub ---------- */
function Hub({ stats, aberta, entrada, tickets, ocupado, onVoltar, onTutorial, onPularTutorial, onRetomar, onAbandonar, onHistoria, onDuelo, onMapa }) {
  const prox = Math.min(stats.historia, DOENCAS.length - 1);
  const fim = stats.historia >= DOENCAS.length;
  const capAtual = capituloDe(DOENCAS[prox].id);
  const treinar = !stats.tutorial;
  const travado = treinar || aberta || ocupado;
  return <div className="cbt-scr">
    <Topo voltar={onVoltar} kicker="DDX · Modo secreto" titulo="Batalha diagnóstica"><span className="chip"><Ticket /><span>{tickets}</span></span></Topo>
    <div className="scroll bh-grid">
      <div className="bh-hero rise">
        <div className="bh-stage" aria-hidden="true"><span className="pad foe-pad" /><span className="bh-blob"><Blob /></span></div>
        <div className="bh-copy">
          <span className="kicker" style={{ color: '#ff8fab' }}>Uma doença desconhecida apareceu</span>
          <h2>Investigue, diagnostique e controle.</h2>
          <p>Duelo por turnos contra doenças. Você nunca ataca o paciente: escolhas erradas fortalecem a doença ou pioram o quadro.</p>
        </div>
      </div>
      {aberta && <section className="card bh-mode rise" style={{ '--i': 1, borderColor: 'rgba(255, 183, 3, .35)' }}>
        <div className="bh-mh"><span className="bh-ico" style={{ color: 'var(--amber)', background: 'rgba(255,183,3,.12)' }}><Zap size={20} /></span><div><b>Batalha em andamento</b><small>{entrada.modo === 'x1' ? 'Duelo clínico' : entrada.modo === 'tutorial' ? 'Treinamento' : `História · batalha ${DOENCAS.findIndex(d => d.id === entrada.doencaId) + 1}`} · {entrada.acoes.length} ações salvas</small></div></div>
        <button className="primary" disabled={ocupado} onClick={onRetomar}>Retomar batalha</button>
        <button className="ghost" disabled={ocupado} onClick={() => { if (window.confirm('Abandonar esta batalha? Ela termina sem XP.')) onAbandonar(); }}>Abandonar sem XP</button>
      </section>}
      {treinar && <section className="card bh-tut rise" style={{ '--i': 1 }}>
        <span className="bh-tut-av"><Retrato title="Dra. Íris, preceptora" /></span>
        <div><span className="kicker" style={{ color: '#c9b8ff' }}>Treinamento obrigatório</span><b>Primeiro plantão na arena</b><p>A Dra. Íris, sua preceptora, guia uma batalha de treino passo a passo. Leva uns 2 minutos e libera a História e o Duelo.</p></div>
        <button className="primary violet" disabled={aberta || ocupado} onClick={onTutorial}><GraduationCap size={18} />Começar treinamento</button>
        <button className="ghost" style={{ gridColumn: '1 / -1' }} disabled={aberta || ocupado} onClick={onPularTutorial}>Pular treinamento (administrador)</button>
      </section>}
      <section className="card bh-mode rise" style={{ '--i': 1 }}>
        <div className="bh-mh"><span className="bh-ico" style={{ color: 'var(--mint)', background: 'rgba(0,245,212,.1)' }}><BookOpen size={20} /></span><div><b>História · Road to Doctor</b><small>Capítulo {capAtual.ordem} · {capAtual.nome}</small></div><span className="chip mint" style={{ fontSize: 11, padding: '4px 8px' }}>{Math.min(stats.historia, DOENCAS.length)}/{DOENCAS.length}</span></div>
        <div className="road" role="list" aria-label={`Batalhas do capítulo ${capAtual.ordem}`}>
          {capAtual.ids.map((id, k) => {
            const i = DOENCAS.findIndex(x => x.id === id), d = DOENCAS[i];
            const st = i < stats.historia ? 'done' : i === stats.historia ? 'cur' : 'lock';
            return <span key={id} style={{ display: 'contents' }}>
              {k > 0 && <span className={`road-ln ${i <= stats.historia ? 'on' : ''}`} />}
              <span className={`road-n ${st}`} role="listitem">
                <span className="road-art">{stats.descobertas.includes(id) ? <Species id={id} /> : <Blob />}{st === 'done' && <span className="road-ok"><Check size={12} strokeWidth={3} /></span>}{st === 'lock' && <span className="road-lock"><Lock size={12} /></span>}</span>
                <small>{i + 1}. {d.capitulo}</small>
              </span>
            </span>;
          })}
        </div>
        <button className="primary" disabled={travado} onClick={() => onHistoria(DOENCAS[fim ? 0 : prox].id)}>{treinar ? <><Lock size={16} />Conclua o treinamento</> : fim ? 'Rejogar a História' : `Batalha ${prox + 1}: ${DOENCAS[prox].capitulo}`}</button>
        <button className="ghost bh-map" onClick={onMapa}><MapaIco size={16} />Mapa completo · {CAPITULOS.length} capítulos</button>
      </section>
      <section className="card bh-mode rise" style={{ '--i': 2 }}>
        <div className="bh-mh"><span className="bh-ico" style={{ color: '#ff8fab', background: 'rgba(255,92,138,.12)' }}><Shuffle size={20} /></span><div><b>Duelo clínico</b><small>Modo X1 · nome provisório</small></div><span className="chip" style={{ fontSize: 11, padding: '4px 8px' }}><Ticket />1 ticket</span></div>
        <p className="bh-p">Uma das {DOENCAS.length} doenças é sorteada pelo servidor. Você escolhe o pet antes de saber qual é.</p>
        <div className="bh-tags"><span>Sorteio a cada partida</span><span>XP em toda partida</span><span>Mais rejogável</span></div>
        <button className="primary violet" disabled={tickets < 1 || travado} onClick={onDuelo}>{treinar ? <><Lock size={16} />Conclua o treinamento</> : tickets < 1 ? 'Sem tickets. Jogue cruzadinhas' : <><Ticket size={17} /> Entrar no duelo · 1 ticket</>}</button>
      </section>
      <section className="card bh-dex rise" style={{ '--i': 3 }}>
        <div className="bh-mh"><div><b>Diagnósticos descobertos</b><small>{stats.descobertas.length} de {DOENCAS.length} doenças</small></div></div>
        <div className="dex">{DOENCAS.map(d => {
          const on = stats.descobertas.includes(d.id);
          return <div key={d.id} className={`dex-c ${on ? 'on' : ''}`}><span className="dex-art"><Species id={d.id} /></span><b>{on ? d.nome : '???'}</b><small style={{ color: on ? AGENTE[d.agente].cor : undefined }}>{on ? AGENTE[d.agente].nome : 'NÃO DESCOBERTA'}</small></div>;
        })}</div>
      </section>
      <p className="note bh-note">{AVISO}</p>
    </div>
  </div>;
}

/* ---------- mapa da História ---------- */
function Mapa({ stats, onVoltar, onFontes, onAbrir, bloqueado }) {
  const [liberar, setLiberar] = useState(true);
  const [revelar, setRevelar] = useState(false);
  const feitos = Math.min(stats.historia, DOENCAS.length);
  const estado = i => (i < stats.historia ? 'done' : i === stats.historia ? 'cur' : liberar ? 'open' : 'lock');
  return <div className="cbt-scr">
    <Topo voltar={onVoltar} kicker="Batalha · História" titulo="Road to Doctor"><span className="chip mint"><Check />{feitos}/{DOENCAS.length}</span></Topo>
    <div className="scroll hs-wrap">
      <section className="card hs-hero rise">
        <div className="hs-hero-t"><span className="kicker">Mapa da História</span><b>{CAPITULOS.length} capítulos · {DOENCAS.length} batalhas</b></div>
        <p>Cada capítulo reúne doenças infecciosas que um médico generalista enfrenta no SUS. Você descobre a doença pelos sintomas e exames e a controla com a terapia certa.</p>
        <div className="hs-bar" role="progressbar" aria-valuemin={0} aria-valuemax={DOENCAS.length} aria-valuenow={feitos}><span style={{ width: `${(feitos / DOENCAS.length) * 100}%` }} /></div>
        <div className="hs-hero-b">
          <button className={`hs-tog ${liberar ? 'on' : ''}`} onClick={() => setLiberar(v => !v)} aria-pressed={liberar}><ShieldAlert size={14} />Revisão: {liberar ? 'tudo liberado' : 'progressão real'}</button>
          <button className={`hs-tog ${revelar ? 'on' : ''}`} onClick={() => setRevelar(v => !v)} aria-pressed={revelar}><Eye size={14} />{revelar ? 'Doenças reveladas' : 'Doenças ocultas'}</button>
          <button className="hs-tog" onClick={onFontes}><Library size={14} />Fontes</button>
        </div>
      </section>
      {bloqueado && <p className="hs-aviso" role="status">Há uma batalha em andamento. Retome ou abandone no hub antes de começar outra.</p>}
      <p className="hs-aviso" role="note">{AVISO}</p>
      {CAPITULOS.map((cap, ci) => {
        const Ic = ICONE_CAP[ci] || Stethoscope;
        const feitosCap = cap.ids.filter(id => DOENCAS.findIndex(d => d.id === id) < stats.historia).length;
        return <section key={cap.id} className="hs-mod rise" style={{ '--i': ci + 1, '--c': COR_CAP[ci] }}>
          <header className="hs-mh"><span className="hs-mi"><Ic /></span><div><span className="kicker">Capítulo {cap.ordem} · {cap.rede}</span><h2>{cap.nome}</h2></div><span className="hs-cnt">{feitosCap}/{cap.ids.length}</span></header>
          <p className="hs-mr">{cap.resumo}</p>
          <ol className="hs-path">{cap.ids.map(id => {
            const i = DOENCAS.findIndex(d => d.id === id), d = DOENCAS[i];
            const st = estado(i), visto = revelar || stats.descobertas.includes(id);
            return <li key={id} className={`hs-node bt ${st}`}>
              <button disabled={st === 'lock' || bloqueado} onClick={() => onAbrir(id)} aria-label={`Batalha ${i + 1}${visto ? ': ' + d.nome : ''}${st === 'lock' ? ', bloqueada' : ''}`}>
                <span className="hs-dot art">{visto ? <Species id={id} /> : <Blob />}{st === 'done' && <span className="hs-ok"><Check size={11} strokeWidth={3.4} /></span>}{st === 'lock' && <span className="hs-lk"><Lock size={11} /></span>}</span>
                <span className="hs-txt">
                  <small>Batalha {i + 1} · {d.capitulo}</small>
                  {st === 'cur' && <span className="hs-here"><MapPin size={11} />Você está aqui</span>}
                  <b>{visto ? d.nome : `${d.paciente}: ${d.queixa}`}</b>
                  {visto && <small className="hs-ag" style={{ color: AGENTE[d.agente].cor }}>{AGENTE[d.agente].nome}</small>}
                </span>
                {st !== 'lock' && <ChevronRight className="hs-go" size={18} />}
              </button>
            </li>;
          })}</ol>
        </section>;
      })}
    </div>
  </div>;
}

/* ---------- fontes ---------- */
function Fontes({ onVoltar }) {
  const grupos = [['oficial', 'Documentos oficiais'], ['diretriz', 'Diretrizes de sociedades'], ['livro', 'Livros de referência']];
  return <div className="cbt-scr">
    <Topo voltar={onVoltar} kicker="Batalha · História" titulo="Biblioteca de fontes"><span className="chip"><Library />{Object.keys(FONTES).length}</span></Topo>
    <div className="scroll hs-wrap">
      <p className="hs-aviso" role="note">Todo fato das doenças aponta para uma destas fontes, com a página do PDF (não a impressa). As citações foram conferidas contra o texto dos arquivos em 02/10/2026.</p>
      {grupos.map(([tipo, titulo]) => {
        const lista = Object.entries(FONTES).filter(([, f]) => f.tipo === tipo);
        if (!lista.length) return null;
        return <section key={tipo}>
          <div className="sec"><h2>{titulo}</h2><span>{lista.length}</span></div>
          <ul className="hs-fontes">{lista.map(([id, f]) => <li key={id} className="card">
            <b>{f.titulo}</b>
            <small>{f.orgao} · {f.ano}{f.ed ? ` · ${f.ed}` : ''}</small>
            {f.nota && <p className="hs-fn">{f.nota}</p>}
            <div className="hs-uso">{DOENCAS.filter(d => d.fontes.some(x => x.fonte === id)).map(d => <span key={d.id} className="hs-pill"><BookOpen size={11} />{d.nome}</span>)}</div>
          </li>)}</ul>
        </section>;
      })}
    </div>
  </div>;
}

/* ---------- escolha do pet ---------- */
function EscolhaPet({ web, modo, doencaId, tickets, ocupado, onVoltar, onEntrar }) {
  const [sel, setSel] = useState('cocobi');
  const x1 = modo === 'x1';
  const doenca = doencaId ? obterDoenca(doencaId) : null;
  const ordem = doenca ? DOENCAS.indexOf(doenca) + 1 : 0;
  useEffect(() => {
    const k = e => {
      const n = '123'.indexOf(e.key);
      if (n >= 0) setSel(PETS[n].id);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  return <div className="cbt-scr">
    <Topo voltar={onVoltar} kicker={x1 ? 'Duelo clínico' : `História · batalha ${ordem}`} titulo="Escolha seu pet clínico" />
    <div className="scroll">
      <div className="pets">
        {PETS.map((pt, i) => <button key={pt.id} className={`petc rise ${sel === pt.id ? 'on' : ''}`} style={{ '--i': i, '--pc': pt.cor }} onClick={() => setSel(pt.id)} aria-pressed={sel === pt.id}>
          <span className="petc-art"><PetArt id={pt.id} /></span>
          <span className="petc-t"><b>{pt.nome}</b><span className="petc-esp">{pt.esp}</span></span>
          <span className="petc-hab"><Sparkles size={14} />{pt.hab}</span>
          <small>{pt.desc}</small>
          {web && <kbd className="petc-k">{i + 1}</kbd>}
          <span className="petc-ok"><Check size={14} strokeWidth={3} /></span>
        </button>)}
      </div>
      <p className="note">{PET_QUANDO}</p>
    </div>
    <div className="dock">
      <div className="info"><span>{x1 ? 'DOENÇA SORTEADA NA ENTRADA' : doenca?.capitulo.toUpperCase()}</span>{x1 ? <b>1 TICKET</b> : <span>SEM TICKET</span>}</div>
      <button className="primary violet" disabled={ocupado || (x1 && tickets < 1)} onClick={() => onEntrar(sel)}><Zap size={17} />Entrar na arena</button>
    </div>
  </div>;
}

/* ---------- relatório ---------- */
function Resultado({ entrada, stats, onVoltar, onProxima }) {
  const r = entrada.relatorio;
  const d = obterDoenca(entrada.doencaId);
  const pet = PETS.find(p => p.id === entrada.pet);
  const venceu = r.resultado === 'vitoria';
  const proxima = entrada.modo === 'historia' && venceu && stats.historia < DOENCAS.length ? DOENCAS[stats.historia] : null;
  const selo = r.resultado === 'abandono' ? 'BATALHA ABANDONADA' : entrada.modo === 'tutorial' ? 'TREINAMENTO CONCLUÍDO' : venceu ? 'DOENÇA CONTROLADA' : 'TRANSFERIDO À UTI';
  return <div className="cbt-scr">
    <Topo voltar={onVoltar} kicker={entrada.modo === 'x1' ? 'Duelo clínico' : entrada.modo === 'tutorial' ? 'Treinamento' : 'História'} titulo="Relatório da batalha" />
    <div className="scroll hs-wrap" style={{ display: 'grid', justifyItems: 'center', textAlign: 'center' }}>
      <div className={`stamp ${venceu || entrada.modo === 'tutorial' ? 'violet' : 'amber'}`}>{selo}</div>
      <p className="vic-sub">{d.nome} · {r.turnos ?? 0} turnos</p>
      <div className="ledger">{(entrada.linhas || []).map(([t, v]) => <div key={t} className="lrow show"><span>{t}</span><b className={v > 0 ? 'pos' : v < 0 ? 'neg' : 'mut'}>{v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0'}</b></div>)}</div>
      <div className="total">+{entrada.xpConcedido}<small>XP</small></div>
      <p className="note">XP confirmado pelo servidor.</p>
      <div className="details">
        <div className="det bt-rep"><span className="bt-rep-art"><Species id={d.id} evolved={r.buffAtivado} /></span><span><b>{d.nome}</b><p>{d.tipo} · {AGENTE[d.agente].nome.toLowerCase()}</p><p>Paciente: {d.paciente}</p></span></div>
        {r.pistas && <div className="det"><b><Search />Pistas que levaram ao diagnóstico</b>{r.pistas.length ? r.pistas.map(c => <p key={c.t}>• {c.t} <span className="src">{c.src}</span></p>) : <p>Nenhuma pista coletada.</p>}</div>}
        {r.corretas && <div className="det"><b className="yes"><Check />Decisões corretas</b>{r.corretas.length ? r.corretas.map(g => <p key={g}>• {g}</p>) : <p>Nenhuma decisão decisiva registrada.</p>}</div>}
        {r.ineficazes && <div className="det"><b className="no"><X />Escolhas ineficazes</b>{r.ineficazes.length ? r.ineficazes.map((b, i) => <p key={i}>• {b}</p>) : <p>Nenhuma.</p>}</div>}
        <div className="det"><b><Shield />Buff</b><p>{r.buffAtivado ? `${d.buff.nome}: ${d.buff.desc} ${r.buffNeutralizado ? `Neutralizado com ${d.buff.resposta.toLowerCase()}.` : `Não foi neutralizado. Resposta esperada: ${d.buff.resposta.toLowerCase()}.`}` : 'A doença não chegou a evoluir.'}</p></div>
        {pet && <div className="det"><b><PawPrint />Pet clínico</b><p>{pet.nome} ({pet.esp}): {r.petUsado ? `usou ${pet.hab}.` : 'não foi acionado.'}</p></div>}
        <div className="det"><b><Stethoscope />Conduta esperada em um cenário real</b><p>{d.conduta}</p></div>
        <div className="det"><b><BookOpen />Resumo do aprendizado</b><p>{d.aprendizado}</p></div>
        {d.notificar && <div className="det"><b><Shield />Notificação</b><p>{d.notificar}</p></div>}
        <div className="det"><b><BookOpen />Fontes deste caso</b>{d.fontes.map((f, i) => <p key={i}>• {f.sobre} <span className="src">{FONTES[f.fonte]?.curto}, p. {f.pag} do PDF</span></p>)}</div>
        <p className="note">Simulação educacional. Uma decisão isolada não é protocolo universal; a conduta depende de contexto, gravidade e protocolo local.</p>
      </div>
      <div className="actions" style={{ maxWidth: 520 }}>
        {proxima && <button className="primary" onClick={() => onProxima(proxima.id)}>Próxima batalha: {proxima.capitulo}</button>}
        <button className={proxima ? 'ghost' : 'primary'} onClick={onVoltar}>Voltar à batalha</button>
      </div>
    </div>
  </div>;
}
