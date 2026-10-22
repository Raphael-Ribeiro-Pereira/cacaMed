import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronLeft, GraduationCap, Library, Lock, Map as MapaIco, PawPrint, Search, Shield, Shuffle, Sparkles, Stethoscope, Ticket, X, Zap } from 'lucide-react';
import { AGENTE, CAPITULOS, DOENCAS, FONTES, PETS, PET_QUANDO, obterDoenca, vencidasNaHistoria } from '../utils/batalha';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { Blob, PetArt, Retrato, Species } from './batalhaArte';
import BatalhaArena from './BatalhaArena';
import { AvisoGirar, CenaEntrada, Enciclopedia, MapaHistoria, Microscopio, Pergaminho } from './batalhaHistoria';
import { useLargo } from '../utils/prototipo';
import '../prototipo.css';

const AVISO = 'Simulação educacional. Doenças escritas a partir das fontes listadas, com exames numéricos ilustrativos. Conteúdo ainda sem revisão médica: piloto do administrador.';
// Pacientes já atendidos neste aparelho: da segunda vez em diante, a cutscene de entrada mostra "Pular".
const CHAVE_VISITADOS = 'cacoMed-batalha-visitados';
const lerVisitados = () => { try { return new Set(JSON.parse(localStorage.getItem(CHAVE_VISITADOS) || '[]')); } catch { return new Set(); } };
const marcarVisitado = id => { try { localStorage.setItem(CHAVE_VISITADOS, JSON.stringify([...lerVisitados().add(id)])); } catch { /* sem armazenamento: a cena só não ganha o "Pular" */ } };

function Topo({ voltar, kicker, titulo, children }) {
  return <div className="topbar"><button className="icon-btn" onClick={voltar} aria-label="Voltar"><ChevronLeft /></button><h1><small>{kicker}</small>{titulo}</h1>{children}</div>;
}

// S-05 (17/10/2026): no site publicado, as doenças ainda sem revisão médica vêm só com os dados públicos (o build
// tira o resto); o conteúdo completo vem da API (conteudoBatalha), que só o entrega ao administrador. Na homologação
// local o conteúdo já está completo e nada é pedido.
const doencasCompletas = new Map();
function useDoencaCompleta(id, usuario, servicoPerfil) {
  const local = obterDoenca(id);
  const pronta = Array.isArray(local.golpes) ? local : doencasCompletas.get(id);
  const [estado, setEstado] = useState({ carregando: true });
  useEffect(() => {
    if (pronta) return undefined;
    let vivo = true;
    servicoPerfil(usuario, 'conteudoBatalha', { doencaId: id })
      .then(d => { doencasCompletas.set(id, d); if (vivo) setEstado({ doenca: d }); })
      .catch(e => { if (vivo) setEstado({ erro: e.message || 'Não foi possível carregar a batalha.' }); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return pronta ? { doenca: pronta } : estado;
}
function ComDoenca({ id, usuario, servicoPerfil, onVoltar, children }) {
  const { doenca, erro } = useDoencaCompleta(id, usuario, servicoPerfil);
  if (doenca) return children(doenca);
  return <div className="cbt-scr"><Topo voltar={onVoltar} kicker="Batalha diagnóstica" titulo={erro ? 'Batalha indisponível' : 'Preparando a arena'} />
    <div className="scroll plain" role={erro ? 'alert' : 'status'} style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', gap: 12 }}>
      <span>{erro || 'Carregando a batalha...'}</span>
      {erro && <button className="ghost" style={{ maxWidth: 260 }} onClick={onVoltar}>Voltar</button>}
    </div></div>;
}

export default function BatalhaDiagnostica({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const stats = { tutorial: false, historia: 0, descobertas: [], concluidos: [], ...dadosUsuario?.batalha };
  const entrada = stats.entrada;
  const aberta = Boolean(entrada && !entrada.relatorio);
  const [tela, setTela] = useState({ id: 'hub' });
  const [transicao, setTransicao] = useState(null);
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

  // Na história, a batalha começa pela cutscene de entrada; no treino e no Duelo, direto na arena.
  const iniciar = (modo, pet, doencaId) => enviar('iniciarBatalha', { modo, pet, doencaId, entradaId: crypto.randomUUID() },
    () => setTela(modo === 'historia' ? { id: 'entrada' } : { id: 'arena' }));
  const sair = abandonar => {
    if (abandonar) enviar('abandonarBatalha', { entradaId: entrada.id }, () => setTela({ id: 'hub' }));
    else setTela({ id: 'hub' });
  };
  const atender = id => {
    if (!stats.tutorial) { setErro('Conclua o treinamento antes de atender os pacientes da história.'); return; }
    if (aberta) { setErro('Há uma batalha em andamento. Retome ou abandone no hub antes de começar outra.'); return; }
    setTela({ id: 'pet', modo: 'historia', doencaId: id, voltar: 'mapa' });
  };
  const abrirPergaminho = (id, volta) => setTela({ id: 'pergaminho', doencaId: id, volta });
  // O microscópio fecha sobre o paciente e reabre já na arena.
  const fimDaEntrada = centro => { if (entrada) marcarVisitado(entrada.doencaId); setTransicao({ centro }); };

  let conteudo;
  if (!admin) {
    conteudo = <div className="cbt-scr"><Topo voltar={() => setTelaAtual('menu')} kicker="Modo secreto" titulo="Batalha diagnóstica" />
      <div className="scroll"><section className="card" style={{ display: 'grid', gap: 10 }}><span className="kicker">Em piloto</span>
        <p>A Batalha diagnóstica está em teste com o administrador enquanto o conteúdo passa por revisão médica.</p>
        <button className="ghost" onClick={() => setTelaAtual('menu')}>Voltar ao início</button></section></div></div>;
  } else if (tela.id === 'entrada' && aberta) {
    conteudo = <ComDoenca id={entrada.doencaId} usuario={usuario} servicoPerfil={servicoPerfil} onVoltar={() => setTela({ id: 'hub' })}>
      {d => <CenaEntrada key={entrada.id} doenca={d} podePular={lerVisitados().has(d.id)} aoTerminar={fimDaEntrada} />}
    </ComDoenca>;
  } else if (tela.id === 'arena' && aberta) {
    conteudo = <ComDoenca id={entrada.doencaId} usuario={usuario} servicoPerfil={servicoPerfil} onVoltar={() => setTela({ id: 'hub' })}>
      {d => <BatalhaArena key={entrada.id} entrada={entrada} doenca={d} web={web} usuario={usuario} servicoPerfil={servicoPerfil}
        setDadosUsuario={setDadosUsuario} onSair={sair} onFim={() => setTela({ id: 'resultado' })} />}
    </ComDoenca>;
  } else if (tela.id === 'resultado' && entrada?.relatorio) {
    conteudo = <ComDoenca id={entrada.doencaId} usuario={usuario} servicoPerfil={servicoPerfil} onVoltar={() => setTela({ id: 'hub' })}>
      {d => <Resultado doenca={d} entrada={entrada} onVoltar={() => setTela({ id: 'hub' })}
        onPergaminho={() => abrirPergaminho(d.id, entrada.xpConcedido > 0 ? 'vitoria' : 'mapa')} onMapa={() => setTela({ id: 'mapa' })} />}
    </ComDoenca>;
  } else if (tela.id === 'pergaminho') {
    const voltar = () => setTela(tela.volta === 'vitoria' ? { id: 'mapa', recemVencida: tela.doencaId } : { id: tela.volta || 'mapa' });
    conteudo = <ComDoenca id={tela.doencaId} usuario={usuario} servicoPerfil={servicoPerfil} onVoltar={voltar}>
      {d => <Pergaminho doenca={d} rotulo={tela.volta === 'enciclopedia' ? 'Voltar à enciclopédia' : tela.volta === 'hub' ? 'Voltar ao hub' : 'Voltar ao mapa'} aoVoltar={voltar} />}
    </ComDoenca>;
  } else if (tela.id === 'pet') {
    conteudo = <EscolhaPet web={web} modo={tela.modo} doencaId={tela.doencaId} tickets={Number(dadosUsuario?.tickets) || 0} ocupado={ocupado}
      onVoltar={() => setTela({ id: tela.voltar || 'hub' })} onEntrar={pet => iniciar(tela.modo, pet, tela.doencaId)} />;
  } else if (tela.id === 'mapa') {
    conteudo = <MapaHistoria key={tela.recemVencida || 'mapa'} stats={stats} admin={admin} recemVencida={tela.recemVencida} aoVoltar={() => setTela({ id: 'hub' })}
      aoAtender={atender} aoPergaminho={id => abrirPergaminho(id, 'mapa')} aoEnciclopedia={() => setTela({ id: 'enciclopedia' })} />;
  } else if (tela.id === 'enciclopedia') {
    conteudo = <Enciclopedia stats={stats} aoAbrir={id => abrirPergaminho(id, 'enciclopedia')} aoFontes={() => setTela({ id: 'fontes' })} aoVoltar={() => setTela({ id: 'mapa' })} />;
  } else if (tela.id === 'fontes') {
    conteudo = <Fontes onVoltar={() => setTela({ id: 'enciclopedia' })} />;
  } else {
    conteudo = <Hub stats={stats} aberta={aberta} entrada={entrada} tickets={Number(dadosUsuario?.tickets) || 0} ocupado={ocupado}
      onVoltar={() => setTelaAtual('menu')}
      onTutorial={() => iniciar('tutorial', 'cocobi')}
      onPularTutorial={() => enviar('pularTutorialBatalha', {})}
      onRetomar={() => setTela({ id: 'arena' })}
      onAbandonar={() => sair(true)}
      onDuelo={() => setTela({ id: 'pet', modo: 'x1' })}
      onMapa={() => setTela({ id: 'mapa' })}
      onPergaminho={id => abrirPergaminho(id, 'hub')} />;
  }

  return <div className={`cbt ${web ? 'web' : ''}`}>
    {conteudo}
    {transicao && <Microscopio centro={transicao.centro} aoMeio={() => setTela({ id: 'arena' })} aoFim={() => setTransicao(null)} />}
    {admin && <AvisoGirar />}
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
function Hub({ stats, aberta, entrada, tickets, ocupado, onVoltar, onTutorial, onPularTutorial, onRetomar, onAbandonar, onDuelo, onMapa, onPergaminho }) {
  const treinar = !stats.tutorial;
  const travado = treinar || aberta || ocupado;
  const vencidas = vencidasNaHistoria(stats);
  return <div className="cbt-scr">
    <Topo voltar={onVoltar} kicker="Modo secreto" titulo="Batalha diagnóstica"><span className="chip"><Ticket /><span>{tickets}</span></span></Topo>
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
        <div className="bh-mh"><span className="bh-ico" style={{ color: 'var(--amber)', background: 'rgba(255,183,3,.12)' }}><Zap size={20} /></span><div><b>Batalha em andamento</b><small>{entrada.modo === 'x1' ? 'Duelo clínico' : entrada.modo === 'tutorial' ? 'Treinamento' : `História · ${obterDoenca(entrada.doencaId).capitulo}`} · {entrada.acoes.length} ações salvas</small></div></div>
        <button className="primary" disabled={ocupado} onClick={onRetomar}>Retomar batalha</button>
        <button className="ghost" disabled={ocupado} onClick={() => { if (window.confirm('Abandonar esta batalha? Ela termina sem XP.')) onAbandonar(); }}>Abandonar sem XP</button>
      </section>}
      {treinar && <section className="card bh-tut rise" style={{ '--i': 1 }}>
        <span className="bh-tut-av"><Retrato title="Dra. Íris, preceptora" /></span>
        <div><span className="kicker" style={{ color: '#c9b8ff' }}>Treinamento obrigatório</span><b>Primeiro plantão na arena</b><p>A Dra. Íris, sua preceptora, guia uma batalha de treino passo a passo. Leva uns 2 minutos e libera a História e o Duelo.</p></div>
        <button className="primary violet" disabled={aberta || ocupado} onClick={onTutorial}><GraduationCap size={18} />Começar treinamento</button>
        <button className="ghost" style={{ gridColumn: '1 / -1' }} disabled={aberta || ocupado} onClick={onPularTutorial}>Pular treinamento (administrador)</button>
      </section>}
      {/* Modo história v2: três ramos em paralelo, cada um uma área; o mapa abre a ficha de cada paciente. */}
      <section className="card bh-mode rise" style={{ '--i': 1 }}>
        <div className="bh-mh"><span className="bh-ico" style={{ color: 'var(--mint)', background: 'rgba(0,245,212,.1)' }}><BookOpen size={20} /></span><div><b>História</b><small>{CAPITULOS.length} ramos · cada vitória abre o próximo paciente do ramo</small></div><span className="chip mint" style={{ fontSize: 11, padding: '4px 8px' }}>{vencidas.size}/{DOENCAS.length}</span></div>
        <div style={{ display: 'grid', gap: 6 }}>{CAPITULOS.map(cap => {
          const feitos = cap.ids.filter(id => vencidas.has(id)).length;
          return <div key={cap.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: cap.cor, flex: 'none' }} /><span style={{ flex: 1 }}>{cap.nome} <small className="muted">· {cap.area}</small></span><b className="mono">{feitos}/{cap.ids.length}</b></div>;
        })}</div>
        <button className="primary" disabled={ocupado} onClick={onMapa}>{treinar ? <><Lock size={16} />Ver o mapa (conclua o treinamento para atender)</> : <><MapaIco size={17} />Abrir o mapa da história</>}</button>
      </section>
      <section className="card bh-mode rise" style={{ '--i': 2 }}>
        <div className="bh-mh"><span className="bh-ico" style={{ color: '#ff8fab', background: 'rgba(255,92,138,.12)' }}><Shuffle size={20} /></span><div><b>Duelo clínico</b><small>Modo X1 · nome provisório</small></div><span className="chip" style={{ fontSize: 11, padding: '4px 8px' }}><Ticket />1 ticket</span></div>
        <p className="bh-p">Uma das {DOENCAS.length} doenças é sorteada pelo servidor. Você escolhe o pet antes de saber qual é.</p>
        <div className="bh-tags"><span>Sorteio a cada partida</span><span>500 XP em toda vitória</span><span>Mais rejogável</span></div>
        <button className="primary violet" disabled={tickets < 1 || travado} onClick={onDuelo}>{treinar ? <><Lock size={16} />Conclua o treinamento</> : tickets < 1 ? 'Sem tickets. Jogue cruzadinhas' : <><Ticket size={17} /> Entrar no duelo · 1 ticket</>}</button>
      </section>
      <section className="card bh-dex rise" style={{ '--i': 3 }}>
        <div className="bh-mh"><div><b>Diagnósticos descobertos</b><small>{stats.descobertas.length} de {DOENCAS.length} doenças · toque para abrir o pergaminho</small></div></div>
        <div className="dex">{DOENCAS.map(d => {
          const on = stats.descobertas.includes(d.id);
          const corpo = <><span className="dex-art"><Species id={d.id} /></span><b>{on ? d.nome : '???'}</b><small style={{ color: on ? AGENTE[d.agente].cor : undefined }}>{on ? AGENTE[d.agente].nome : 'NÃO DESCOBERTA'}</small></>;
          return on ? <button key={d.id} type="button" className="dex-c on" onClick={() => onPergaminho(d.id)}>{corpo}</button> : <div key={d.id} className="dex-c">{corpo}</div>;
        })}</div>
      </section>
      <p className="note bh-note">{AVISO}</p>
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
  useEffect(() => {
    const k = e => {
      const n = '123'.indexOf(e.key);
      if (n >= 0) setSel(PETS[n].id);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  return <div className="cbt-scr">
    <Topo voltar={onVoltar} kicker={x1 ? 'Duelo clínico' : `História · ${doenca?.capitulo}`} titulo="Escolha seu pet clínico" />
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
// Na história, a vitória leva ao pergaminho e dele ao mapa (que anima o próximo paciente); a derrota volta ao mapa.
function Resultado({ doenca: d, entrada, onVoltar, onPergaminho, onMapa }) {
  const r = entrada.relatorio;
  const pet = PETS.find(p => p.id === entrada.pet);
  const venceu = r.resultado === 'vitoria';
  const historia = entrada.modo === 'historia';
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
        {historia && venceu && <button className="primary" onClick={onPergaminho}><BookOpen size={17} />Ver o pergaminho</button>}
        {historia && !venceu && <><p className="note" style={{ margin: 0 }}>A doença continua disponível no mapa para tentar de novo.</p><button className="primary" onClick={onMapa}>Voltar ao mapa</button></>}
        <button className={historia ? 'ghost' : 'primary'} onClick={onVoltar}>Voltar à batalha</button>
      </div>
    </div>
  </div>;
}
