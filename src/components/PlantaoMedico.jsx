import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ExternalLink, FileSearch, GitBranch, Lock, Stethoscope, Swords, Ticket, X } from 'lucide-react';
import { CASOS_PLANTAO, executarPlantao, obterCasoPlantao } from '../utils/plantao';
import { AUDITORIAS, obterAuditoria } from '../utils/erroMedico';
import { RELACOES, obterRelacao } from '../utils/causaEfeito';
import { nivelPorXP } from '../utils/economia';
import { lerVitais, vitaisDoCaso, xpCaminhoCompleto } from '../utils/ddxVisual';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { animar, fmt, registrarLatencia, useLargo } from '../utils/prototipo';
import { Vitais } from './ddxUi';
import { Resultado, SubiuNivel } from './resultadoUi';

// Hub do DDX, admissão e Plantão médico no visual do protótipo de movimento. O ticket é cobrado na
// admissão enquanto o monitor liga; as ações do Plantão respondem no aparelho e só a reavaliação e o
// encerramento gravam, com um selo de gravação em vez de travar a tela.
const espera = ms => new Promise(ok => setTimeout(ok, ms));
const MODOS = [
  { id: 'plantao', nome: 'Plantão médico', desc: 'Acompanhe a paciente, investigue e decida a conduta.', Icone: Stethoscope, acao: 'iniciarPlantao', abrindo: 'Chegando ao pronto atendimento' },
  { id: 'erroMedico', nome: 'Erro médico', desc: 'Audite um atendimento já feito e aponte a falha.', Icone: FileSearch, acao: 'iniciarAuditoria', abrindo: 'Abrindo prontuário para auditoria' },
  { id: 'causaEfeito', nome: 'Causa e efeito', desc: 'Ligue mecanismo, consequência, compensação e intervenção.', Icone: GitBranch, acao: 'iniciarRelacao', abrindo: 'Montando o mapa fisiológico' },
];
const PASSOS_ADMISSAO = ['Validando ticket', 'Registrando entrada', 'Carregando prontuário', 'Paciente na sala'];

export default function PlantaoMedico({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const admin = dadosUsuario?.role === 'admin';
  const tickets = Number(dadosUsuario?.tickets) || 0;
  const ddx = dadosUsuario?.ddx || {};
  const entrada = ddx.entrada;
  const casoEntrada = entrada ? obterCasoPlantao(entrada.casoId) : null;
  const [vista, setVista] = useState(() => entrada && !entrada.relatorio.encerrado ? 'plantao' : 'hub');
  const [admissao, setAdmissao] = useState(null);
  const [subiu, setSubiu] = useState(null);
  const [escolhasLocais, setEscolhasLocais] = useState(null);
  const [sync, setSync] = useState('idle');
  const [grupo, setGrupo] = useState('Avaliação');
  const [confirmar, setConfirmar] = useState(null);
  const [folha, setFolha] = useState(null);
  const folhaRef = useRef(null);
  const ultimaGravacao = useRef(0);

  const escolhas = escolhasLocais ?? entrada?.relatorio.escolhas ?? [];
  const naoSalvo = Boolean(escolhasLocais && JSON.stringify(escolhasLocais) !== JSON.stringify(entrada?.relatorio.escolhas));
  useEffect(() => {
    if (!naoSalvo && sync !== 'pend') return undefined;
    const avisar = evento => { evento.preventDefault(); evento.returnValue = ''; };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [naoSalvo, sync]);
  useEffect(() => {
    if (!folha && !confirmar) return undefined;
    requestAnimationFrame(() => folhaRef.current?.querySelector('button')?.focus());
    const tecla = e => { if (e.key === 'Escape') { setFolha(null); setConfirmar(null); } };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [folha, confirmar]);

  const aplicar = perfil => {
    const antes = nivelPorXP(dadosUsuario?.pontuacaoTotal), agora = nivelPorXP(perfil?.pontuacaoTotal);
    if (agora > antes) setTimeout(() => setSubiu({ from: antes, to: agora, xp: Number(perfil.pontuacaoTotal) || 0 }), animar() ? 1300 : 0);
    setDadosUsuario(perfil);
  };

  // Admissão: a abertura do caso (1 ticket) grava enquanto o monitor liga. Reenviar com o mesmo id não cobra de novo.
  const admitir = async (modo, entradaId = crypto.randomUUID()) => {
    const m = MODOS.find(x => x.id === modo);
    const dados = modo === 'plantao' ? { casoId: CASOS_PLANTAO[0].id } : modo === 'erroMedico' ? { auditoriaId: AUDITORIAS[0].id } : { relacaoId: RELACOES[0].id };
    setAdmissao({ modo, entradaId, passo: 0, erro: '' });
    const masked = animar();
    const ts = masked ? [1, 2, 3, 4, 5].map(i => setTimeout(() => setAdmissao(a => a && a.entradaId === entradaId ? { ...a, passo: i } : a), i * 320)) : [];
    const inicio = performance.now();
    try {
      const [perfil] = await Promise.all([servicoPerfil(usuario, m.acao, { ...dados, entradaId }), espera(masked ? 1700 : 0)]);
      registrarLatencia(performance.now() - inicio);
      aplicar(perfil);
      setAdmissao(null);
      if (modo === 'plantao') { setEscolhasLocais(null); setSync('idle'); setGrupo('Avaliação'); setVista('plantao'); }
      else setTelaAtual(modo);
    } catch (falha) {
      ts.forEach(clearTimeout);
      setAdmissao(a => a && a.entradaId === entradaId ? { ...a, erro: falha.message || 'Não foi possível abrir o caso.' } : a);
    }
  };

  const salvar = async novas => {
    const chamada = ++ultimaGravacao.current;
    setSync('pend');
    try {
      const perfil = await servicoPerfil(usuario, 'acaoPlantao', { entradaId: entrada.id, escolhas: novas });
      aplicar(perfil);
      setEscolhasLocais(atual => atual && JSON.stringify(atual) === JSON.stringify(novas) ? null : atual);
      if (chamada === ultimaGravacao.current) setSync('ok');
      return true;
    } catch {
      if (chamada === ultimaGravacao.current) setSync('err');
      return false;
    }
  };

  const raiz = conteudo => <div className={`cbt ${web ? 'web' : ''}`}>{conteudo}<AnimatePresence>{subiu && <SubiuNivel key="lvl" info={subiu} onClose={() => setSubiu(null)} />}</AnimatePresence></div>;

  if (admissao) {
    const m = MODOS.find(x => x.id === admissao.modo);
    const caso = admissao.modo === 'plantao' ? CASOS_PLANTAO[0] : admissao.modo === 'erroMedico' ? obterAuditoria(AUDITORIAS[0].id).caso : obterRelacao(RELACOES[0].id).caso;
    const v = lerVitais(caso.vitais);
    const valores = [['FC', v.fc, 'hr'], ['FR', v.fr, 'rr'], ['SpO₂', v.spo2 == null ? '--' : `${v.spo2}%`, 'sp'], ['PA', v.pa, ''], ['T °C', v.t == null ? '--' : v.t.toFixed(1).replace('.', ','), '']];
    const passo = animar() ? admissao.passo : 5;
    return raiz(<div className="cbt-scr admit" role="status" aria-live="polite">
      <span className="kicker">{m.nome} · 1 ticket</span>
      <motion.div className="monitor" initial={animar() ? { opacity: 0, y: 30, scale: .96 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mon-head"><div><b>{caso.paciente}</b><small>{m.abrindo}</small></div><span className="state">ADMISSÃO</span></div>
        <div className="vitals">{valores.map(([l, val, c], i) => <div key={l} className={`vital ${c}`}><small>{l}</small><b style={{ opacity: passo > i ? 1 : 0.15, transition: 'opacity .3s', fontSize: i > 2 ? 13 : undefined }}>{passo > i ? val ?? '--' : '--'}</b></div>)}</div>
        <div className="mon-ecg" aria-hidden="true"><svg viewBox="0 0 280 40" preserveAspectRatio="none"><path d="M0 24h60l8-3 6 3h16l7-20 8 34 7-24 5 10h24l10-6 8 6h101" /></svg></div>
      </motion.div>
      {admissao.erro ? <div className="fb no" role="alert" style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 540 }}>
        <span>{admissao.erro} Tentar de novo não cobra outro ticket.</span>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="primary violet" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => admitir(admissao.modo, admissao.entradaId)}>Tentar de novo</button>
          <button className="ghost" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setAdmissao(null)}>Voltar ao DDX</button>
        </div>
      </div> : <div className="boot-line">{PASSOS_ADMISSAO[Math.min(passo, 3)]}</div>}
    </div>);
  }

  if (vista === 'hub' || !entrada) {
    const caso = CASOS_PLANTAO[0];
    const estados = {
      plantao: { aberta: Boolean(entrada && !entrada.relatorio.encerrado), concluido: (ddx.concluidos || []).includes(`${caso.id}:${caso.versao}`), revisado: caso.revisado, regra: `Caminho completo: ${fmt(xpCaminhoCompleto(caso, executarPlantao))} XP` },
      erroMedico: (() => { const a = obterAuditoria(AUDITORIAS[0].id), e = dadosUsuario?.erroMedico; return { aberta: Boolean(e?.entrada && !e.entrada.relatorio), concluido: (e?.concluidos || []).includes(`${a.id}:${a.versao}`), revisado: a.caso.revisado, regra: `${a.perguntas.length} etapas · até ${a.perguntas.length * 25} XP` }; })(),
      causaEfeito: (() => { const r = obterRelacao(RELACOES[0].id), e = dadosUsuario?.causaEfeito; return { aberta: Boolean(e?.entrada && !e.entrada.relatorio), concluido: (e?.concluidos || []).includes(`${r.id}:${r.versao}`), revisado: r.caso.revisado, regra: `${r.perguntas.length} etapas · até ${r.perguntas.length * 25} XP` }; })(),
    };
    const abrir = modo => {
      if (estados[modo].aberta) { if (modo === 'plantao') setVista('plantao'); else setTelaAtual(modo); }
      else admitir(modo);
    };
    return raiz(<div className="cbt-scr">
      <div className="topbar"><button className="icon-btn" onClick={() => setTelaAtual('menu')} aria-label="Voltar"><ChevronLeft /></button>
        <h1><small>DDX · {caso.sistema}</small>Casos clínicos</h1><span className="chip"><Ticket /><span>{fmt(tickets)}</span></span></div>
      <div className="scroll hub-grid">
        <div className="hub-left">
          <div className="monitor rise" style={{ '--i': 0 }}>
            <div className="mon-head"><div><b>{caso.paciente}</b><small>“{caso.queixa}”</small></div><span className="state">{caso.revisado ? 'LIBERADO' : 'EM REVISÃO CLÍNICA'}</span></div>
            <Vitais v={lerVitais(caso.vitais)} />
          </div>
          <p className="note">Mesma paciente nos três modos.{caso.revisado ? '' : ' Só o administrador joga até a revisão clínica.'}</p>
        </div>
        <div className="hub-right">
          {MODOS.map((m, i) => {
            const st = estados[m.id];
            const bloqueado = !st.revisado && !admin;
            const { Icone } = m;
            return <div key={m.id} className="card rise" style={{ '--i': i + 1, display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(139,92,246,.14)', color: '#b49cff', flex: 'none' }}><Icone size={20} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 15 }}>{m.nome}</b><div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{m.desc}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><span className="chip violet" style={{ fontSize: 11, padding: '4px 8px' }}>{st.regra}</span>{st.concluido && <span className="chip" style={{ fontSize: 11, padding: '4px 8px' }}>Concluído · repetir não dá XP</span>}{st.aberta && <span className="chip mint" style={{ fontSize: 11, padding: '4px 8px' }}>Em andamento</span>}</div>
              <button className="primary violet" disabled={bloqueado || (!st.aberta && tickets < 1)} onClick={() => abrir(m.id)}>
                {bloqueado ? <><Lock size={16} /> Em revisão clínica</> : st.aberta ? 'Retomar' : tickets < 1 ? 'Sem tickets. Jogue cruzadinhas' : <><Ticket size={17} /> Iniciar · 1 ticket</>}
              </button>
            </div>;
          })}
          {admin && <>
            <button className="card secret rise" style={{ '--i': 4 }} onClick={() => setTelaAtual('batalha')}>
              <span className="secret-ico"><Swords size={18} /></span>
              <span><span className="kicker" style={{ color: '#ff8fab' }}>Piloto do administrador</span><b>Batalha diagnóstica</b><small>Enfrente a doença em um duelo por turnos.</small></span>
              <span className="secret-go">Entrar</span>
            </button>
            <button className="card secret rise" style={{ '--i': 5, borderColor: 'rgba(139,92,246,.4)', background: 'linear-gradient(120deg, rgba(139,92,246,.1), var(--surface) 60%)' }} onClick={() => setTelaAtual('pacienteDdx')}>
              <span className="secret-ico" style={{ background: 'rgba(139,92,246,.16)', color: '#b49cff' }}><Stethoscope size={18} /></span>
              <span><span className="kicker" style={{ color: '#b49cff' }}>Em teste</span><b>Paciente DDX</b><small>17 casos em consulta: pergunte, peça exames, feche o diagnóstico e escolha a conduta.</small></span>
              <span className="secret-go">Abrir</span>
            </button>
          </>}
        </div>
      </div>
    </div>);
  }

  const caso = casoEntrada;
  const r = executarPlantao(caso, escolhas);
  const feitas = new Set(r.escolhas);

  if (vista === 'resultado' || r.encerrado) {
    const encerradoNoServidor = entrada.relatorio.encerrado;
    const repetido = encerradoNoServidor ? Number(entrada.xpConcedido) === 0 && r.xp > 0 : (ddx.concluidos || []).includes(`${caso.id}:${caso.versao}`);
    const linhas = [['Raciocínio', `+${r.pontos.raciocinio}`, 'pos'], ['Segurança', `${r.pontos.seguranca >= 0 ? '+' : '−'}${Math.abs(r.pontos.seguranca)}`, r.pontos.seguranca >= 0 ? 'pos' : 'neg'],
      ['Eficiência', `${r.pontos.eficiencia >= 0 ? '+' : '−'}${Math.abs(r.pontos.eficiencia)}`, r.pontos.eficiencia >= 0 ? 'pos' : 'neg'], ['Desconto de encerramento', r.desconto ? `−${r.desconto}` : '0', r.desconto ? 'neg' : 'mut']];
    if (repetido) linhas.push(['Repetição de caso', '×0', 'mut']);
    const fase = encerradoNoServidor ? 'ok' : sync === 'err' ? 'erro' : 'salvando';
    return raiz(<Resultado key={entrada.id} stamp={r.seguro ? 'PLANTÃO SEGURO' : 'PLANTÃO ENCERRADO'} tom={r.seguro ? undefined : 'amber'} recibo={entrada.id}
      sub={`${caso.paciente} · ${r.minutos} min simulados`} linhas={linhas} total={encerradoNoServidor ? Number(entrada.xpConcedido) || 0 : repetido ? 0 : r.xp} fase={fase}
      aviso={repetido ? 'Repetição: XP só na primeira conclusão deste caso.' : null} aoTentar={() => salvar(escolhas)}
      principal={{ rotulo: 'Voltar ao DDX', aoClicar: () => { setEscolhasLocais(null); setSync('idle'); setVista('hub'); } }} aoVoltar={() => setTelaAtual('menu')}
      detalhes={<>
        <div className="det"><b className={r.seguro ? 'yes' : 'no'}>{r.seguro ? <Check /> : <X />}{r.seguro ? 'Critérios de segurança cumpridos' : 'Atendimento com pontos para revisão'}</b>{r.altaInsegura && <p>Alta antes de completar tratamento, reavaliação ou orientações.</p>}</div>
        <div className="det"><b>Omissões para revisar</b>{r.omissoes.length ? r.omissoes.map(o => <p key={o}>• {caso.acoes.find(a => a.id === o).texto}</p>) : <p>Nenhuma etapa essencial omitida.</p>}</div>
        {caso.fonte && <a className="det" href={caso.fonte} target="_blank" rel="noreferrer" style={{ color: 'var(--mint)', display: 'flex', gap: 6, alignItems: 'center' }}>Referência clínica para revisão <ExternalLink size={13} /></a>}
      </>} />);
  }

  const grupos = [...new Set(caso.acoes.map(a => a.grupo))];
  const reavaliado = feitas.has('reavaliar');
  const agir = id => {
    const acao = caso.acoes.find(a => a.id === id);
    if (acao.terminal) { setConfirmar(id); return; }
    const novas = [...escolhas, id];
    setEscolhasLocais(novas);
    if (id === 'reavaliar') salvar(novas);
  };
  const encerrar = id => {
    const novas = [...escolhas, id];
    setEscolhasLocais(novas); setConfirmar(null); setVista('resultado');
    salvar(novas);
  };
  const sair = () => { if (naoSalvo || sync === 'pend') setFolha('sair'); else setVista('hub'); };
  return raiz(<div className="cbt-scr">
    <div inert={Boolean(folha || confirmar)} style={{ display: 'contents' }}>
      <div className="topbar"><button className="icon-btn" onClick={sair} aria-label="Voltar ao DDX"><ChevronLeft /></button>
        <h1><small>Plantão médico · {r.minutos} min</small>{caso.paciente}</h1>
        {sync === 'err' ? <button className="sync err" onClick={() => salvar(escolhas)}><span className="dot" />Falhou. Toque para reenviar</button>
          : sync !== 'idle' && <span className={`sync ${sync === 'ok' ? 'ok' : ''}`}><span className="dot" />{sync === 'pend' ? 'Salvando' : 'Salvo'}</span>}</div>
      <div className="scroll pl-grid" style={{ paddingTop: 0 }}>
        <div className="pl-left"><div className="monitor">
          <div className="mon-head"><span className={`state ${reavaliado ? 'good' : ''}`} style={{ whiteSpace: 'normal' }}>{r.estadoPaciente}</span></div>
          <Vitais v={vitaisDoCaso(caso, reavaliado)} mudou={reavaliado} />
        </div></div>
        <div className="pl-mid">
          <div className="alas" style={{ padding: '12px 0 10px' }}>{grupos.map(g => {
            const n = caso.acoes.filter(a => a.grupo === g && feitas.has(a.id)).length;
            return <button key={g} className={`ala violet ${g === grupo ? 'on' : ''}`} onClick={() => setGrupo(g)} aria-pressed={g === grupo}>{g}{n ? ` · ${n}` : ''}</button>;
          })}</div>
          <div className="acts" key={grupo}>
            {caso.acoes.filter(a => a.grupo === grupo).map((a, i) => {
              const feita = feitas.has(a.id);
              const faltam = (a.exige || []).filter(x => !feitas.has(x));
              return <button key={a.id} className={`act rise ${feita ? 'done' : ''} ${faltam.length ? 'lock' : ''} ${a.terminal ? 'term' : ''}`} style={{ '--i': i }} disabled={feita || faltam.length > 0} onClick={() => agir(a.id)}>
                <span className="bx">{feita ? <Check strokeWidth={3} /> : faltam.length ? <Lock size={12} /> : null}</span>
                <span>{a.texto}{faltam.length > 0 && <small>Antes: {faltam.map(x => caso.acoes.find(y => y.id === x).texto.split(' ').slice(0, 3).join(' ')).join('; ')}</small>}</span>
              </button>;
            })}
          </div>
        </div>
        <div className="pl-right">
          <div className="sec"><h2>Prontuário</h2><span>{r.eventos.length} registros</span></div>
          <div className="feed">
            <AnimatePresence initial={false}>
              {[...r.eventos].reverse().map(ev => {
                const acao = caso.acoes.find(a => a.id === ev.id);
                return <motion.div key={ev.id} className={`ev ${acao.pontos < 0 ? 'neg' : ''}`} initial={animar() ? { opacity: 0, y: -12, height: 0 } : false} animate={{ opacity: 1, y: 0, height: 'auto' }} transition={{ duration: .4, ease: [0.16, 1, 0.3, 1] }}>
                  <small>{ev.minutos} min · {acao.grupo}</small><b>{ev.texto}</b><p>{ev.resposta}</p>
                </motion.div>;
              })}
            </AnimatePresence>
            {!r.eventos.length && <p className="muted">Comece avaliando a paciente. Perguntas e exames respondem na hora.</p>}
          </div>
        </div>
      </div>
    </div>
    <AnimatePresence>
      {(confirmar || folha) && <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setConfirmar(null); setFolha(null); }} />}
      {confirmar && <motion.div key="fim" ref={folhaRef} className="sheet" role="alertdialog" aria-modal="true" aria-label="Encerrar o atendimento" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
        <h3>Encerrar o atendimento?</h3>
        <p>{caso.acoes.find(a => a.id === confirmar).texto}. Decisões e omissões serão avaliadas no relatório.</p>
        <button className="primary violet" onClick={() => encerrar(confirmar)}>Encerrar e ver relatório</button>
        <button className="ghost" onClick={() => setConfirmar(null)}>Continuar atendendo</button>
      </motion.div>}
      {folha === 'sair' && <motion.div key="sair" ref={folhaRef} className="sheet" role="alertdialog" aria-modal="true" aria-label="Sair do plantão" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
        <h3>Sair do plantão?</h3>
        <p>O plantão fica aberto para retomar. As ações desde a última gravação se perdem se você sair sem salvar.</p>
        <button className="primary violet" onClick={async () => { setFolha(null); if (await salvar(escolhas)) setVista('hub'); }}>Salvar e sair</button>
        <button className="ghost" onClick={() => { setFolha(null); setEscolhasLocais(null); setSync('idle'); setVista('hub'); }}>Sair sem salvar</button>
        <button className="ghost" onClick={() => setFolha(null)}>Continuar atendendo</button>
      </motion.div>}
    </AnimatePresence>
  </div>);
}
